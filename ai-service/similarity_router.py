from fastapi import APIRouter
from pydantic import BaseModel
from typing import List
import numpy as np
import re

router = APIRouter()

class CompareDoc(BaseModel):
    id: str
    text: str

class SimilarityRequest(BaseModel):
    text: str
    compare_texts: List[CompareDoc]

class SimilarityResult(BaseModel):
    similarityScore: float
    matchedReportId: str

@router.post("/similarity", response_model=SimilarityResult)
def calculate_similarity(req: SimilarityRequest):
    target_text = (req.text or "").strip()
    if not target_text or not req.compare_texts:
        return {"similarityScore": 0.0, "matchedReportId": ""}
    
    try:
        from sklearn.feature_extraction.text import TfidfVectorizer
        from sklearn.metrics.pairwise import cosine_similarity
        
        ids = [doc.id for doc in req.compare_texts]
        texts = [doc.text for doc in req.compare_texts]
        all_texts = texts + [target_text]
        
        vectorizer = TfidfVectorizer(stop_words='english')
        tfidf_matrix = vectorizer.fit_transform(all_texts)
        
        target_vector = tfidf_matrix[-1]
        compare_vectors = tfidf_matrix[:-1]
        
        similarities = cosine_similarity(target_vector, compare_vectors).flatten()
        max_idx = int(np.argmax(similarities))
        max_score = float(similarities[max_idx]) * 100.0
        
        return {
            "similarityScore": round(max_score, 1),
            "matchedReportId": ids[max_idx]
        }
    except Exception as e:
        target_words = set(re.findall(r"\w+", target_text.lower()))
        if not target_words:
            return {"similarityScore": 0.0, "matchedReportId": ""}
            
        best_score = 0.0
        best_id = ""
        
        for doc in req.compare_texts:
            compare_words = set(re.findall(r"\w+", (doc.text or "").lower()))
            if not compare_words:
                continue
            intersection = target_words.intersection(compare_words)
            union = target_words.union(compare_words)
            score = (len(intersection) / len(union)) * 100.0 if union else 0.0
            if score > best_score:
                best_score = score
                best_id = doc.id
                
        return {
            "similarityScore": round(best_score, 1),
            "matchedReportId": best_id
        }
