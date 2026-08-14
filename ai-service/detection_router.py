from fastapi import APIRouter
import numpy as np
import re
import joblib
import os

router = APIRouter()

# Try to load the trained model
MODEL_DIR = os.path.dirname(os.path.abspath(__file__))
vectorizer_path = os.path.join(MODEL_DIR, "vectorizer.pkl")
model_path = os.path.join(MODEL_DIR, "model.pkl")

vectorizer = None
model = None

if os.path.exists(vectorizer_path) and os.path.exists(model_path):
    try:
        vectorizer = joblib.load(vectorizer_path)
        model = joblib.load(model_path)
        print("Trained AI text detection model loaded successfully.")
    except Exception as e:
        print(f"Failed to load trained model: {e}")

LLM_MARKER_WORDS = [
    "delve", "testament", "pivotal", "furthermore", "moreover", 
    "in conclusion", "it is important to note", "demystify", 
    "beacon", "multi-faceted", "holistic", "tapestry", "underscores"
]

@router.post("/detect-ai")
def detect_ai(req: dict):
    text = (req.get("text") or "").strip()
    if not text:
        return {"aiProbability": 0.0}

    # If trained model exists, use it!
    if vectorizer is not None and model is not None:
        try:
            X = vectorizer.transform([text])
            # predict_proba returns probability for class 0 (human) and class 1 (AI)
            prob_ai = model.predict_proba(X)[0][1] * 100.0
            return {"aiProbability": round(prob_ai, 1)}
        except Exception as e:
            print(f"Model prediction failed, falling back to heuristics: {e}")

    # Fallback to Heuristic engine
    sentences = re.split(r"[.!?]+", text)
    sentences = [s.strip() for s in sentences if s.strip()]
    
    word_count = len(re.findall(r"\w+", text.lower()))
    if word_count == 0:
        return {"aiProbability": 0.0}
        
    markers_found = sum(1 for word in LLM_MARKER_WORDS if word in text.lower())
    vocabulary_score = min((markers_found / 3.0) * 50.0, 50.0)
    
    if len(sentences) > 2:
        lengths = [len(s.split()) for s in sentences]
        variance = float(np.var(lengths))
        uniformity_score = max(0.0, 50.0 - (variance * 1.5))
    else:
        uniformity_score = 15.0
        
    ai_prob = min(max(vocabulary_score + uniformity_score, 0.0), 99.0)
    
    if re.search(r"\b(as an ai|important to note|delving into|testament to|in summary)\b", text.lower()):
        ai_prob = max(ai_prob, 85.0)
        
    return {"aiProbability": round(ai_prob, 1)}
