from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Optional
import base64
import numpy as np
import re
import joblib
import os
from file_extractor import extract_text_from_file

router = APIRouter()

# Try to load the trained AI detection model
MODEL_DIR = os.path.dirname(os.path.abspath(__file__))
vectorizer_path = os.path.join(MODEL_DIR, "vectorizer.pkl")
model_path = os.path.join(MODEL_DIR, "model.pkl")

vectorizer = None
model = None

if os.path.exists(vectorizer_path) and os.path.exists(model_path):
    try:
        vectorizer = joblib.load(vectorizer_path)
        model = joblib.load(model_path)
        print("Trained model loaded in file analysis router.")
    except Exception as e:
        print(f"Failed to load trained model in file analysis router: {e}")

LLM_MARKER_WORDS = [
    "delve", "testament", "pivotal", "furthermore", "moreover", 
    "in conclusion", "it is important to note", "demystify", 
    "beacon", "multi-faceted", "holistic", "tapestry", "underscores"
]

class CompareDoc(BaseModel):
    id: str
    text: str

class FileAnalysisRequest(BaseModel):
    file_content_base64: str
    content_type: Optional[str] = ""
    file_name: Optional[str] = ""
    remarks: Optional[str] = ""
    compare_texts: List[CompareDoc]

class FileAnalysisResult(BaseModel):
    similarityScore: float
    matchedReportId: str
    aiProbability: float
    extractedText: str

@router.post("/analyze-file", response_model=FileAnalysisResult)
def analyze_file(req: FileAnalysisRequest):
    # 1. Decode base64 file data
    file_bytes = b""
    if req.file_content_base64:
        try:
            # Clean base64 header if sent from some frontends (e.g. data:image/png;base64,...)
            b64_str = req.file_content_base64
            if "," in b64_str:
                b64_str = b64_str.split(",")[1]
            file_bytes = base64.b64decode(b64_str)
        except Exception as e:
            print(f"Failed to decode base64 file content: {e}")

    # 2. Extract text from file using file_extractor
    extracted_text = extract_text_from_file(file_bytes, req.content_type, req.file_name)

    # 3. Combine remarks with file text
    combined_text = (req.remarks or "").strip()
    if extracted_text:
        combined_text = f"{combined_text}\n{extracted_text}".strip()

    # If no text remains at all, return empty
    if not combined_text:
        return {
            "similarityScore": 0.0,
            "matchedReportId": "",
            "aiProbability": 0.0,
            "extractedText": ""
        }

    # 4. Calculate similarity
    similarity_score = 0.0
    matched_id = ""
    
    if req.compare_texts:
        try:
            from sklearn.feature_extraction.text import TfidfVectorizer
            from sklearn.metrics.pairwise import cosine_similarity
            
            ids = [doc.id for doc in req.compare_texts]
            texts = [doc.text for doc in req.compare_texts]
            all_texts = texts + [combined_text]
            
            vec = TfidfVectorizer(stop_words='english')
            tfidf_matrix = vec.fit_transform(all_texts)
            
            target_vector = tfidf_matrix[-1]
            compare_vectors = tfidf_matrix[:-1]
            
            similarities = cosine_similarity(target_vector, compare_vectors).flatten()
            max_idx = int(np.argmax(similarities))
            similarity_score = round(float(similarities[max_idx]) * 100.0, 1)
            matched_id = ids[max_idx]
        except Exception as e:
            print(f"Similarity comparison failed in file router: {e}")
            # Fallback simple token overlap
            target_words = set(re.findall(r"\w+", combined_text.lower()))
            best_score = 0.0
            best_id = ""
            for doc in req.compare_texts:
                compare_words = set(re.findall(r"\w+", (doc.text or "").lower()))
                intersection = target_words.intersection(compare_words)
                union = target_words.union(compare_words)
                score = (len(intersection) / len(union)) * 100.0 if union else 0.0
                if score > best_score:
                    best_score = score
                    best_id = doc.id
            similarity_score = round(best_score, 1)
            matched_id = best_id

    # 5. Calculate AI generated probability
    ai_prob = 0.0
    model_predicted = False
    
    if vectorizer is not None and model is not None:
        try:
            X_vec = vectorizer.transform([combined_text])
            ai_prob = float(model.predict_proba(X_vec)[0][1] * 100.0)
            model_predicted = True
        except Exception as e:
            print(f"Trained model inference failed in file router: {e}")

    if not model_predicted:
        # Heuristic fallback engine
        sentences = re.split(r"[.!?]+", combined_text)
        sentences = [s.strip() for s in sentences if s.strip()]
        
        word_count = len(re.findall(r"\w+", combined_text.lower()))
        if word_count > 0:
            markers_found = sum(1 for word in LLM_MARKER_WORDS if word in combined_text.lower())
            vocabulary_score = min((markers_found / 3.0) * 50.0, 50.0)
            
            if len(sentences) > 2:
                lengths = [len(s.split()) for s in sentences]
                variance = float(np.var(lengths))
                uniformity_score = max(0.0, 50.0 - (variance * 1.5))
            else:
                uniformity_score = 15.0
                
            ai_prob = min(max(vocabulary_score + uniformity_score, 0.0), 99.0)
            if re.search(r"\b(as an ai|important to note|delving into|testament to|in summary)\b", combined_text.lower()):
                ai_prob = max(ai_prob, 85.0)

    return {
        "similarityScore": round(similarity_score, 1),
        "matchedReportId": matched_id,
        "aiProbability": round(ai_prob, 1),
        "extractedText": extracted_text
    }
