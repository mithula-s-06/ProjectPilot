import uvicorn
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

from services.document_parser import DocumentParser
from services.skill_extractor import SkillExtractor
from services.ai_detector import AIDetector
from services.similarity_engine import SimilarityEngine

app = FastAPI(
    title="ProjectPilot AI Microservice",
    description="Standalone, independent AI and NLP microservice without external LLM APIs.",
    version="1.0.0"
)

# Enable CORS for frontend & microservices
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ----------------- Request Models -----------------

class ExtractTextRequest(BaseModel):
    fileBytesBase64: Optional[str] = None
    contentType: Optional[str] = None
    fileName: Optional[str] = ""
    rawText: Optional[str] = None

class ExtractSkillsRequest(BaseModel):
    text: Optional[str] = None
    fileBytesBase64: Optional[str] = None
    contentType: Optional[str] = None
    fileName: Optional[str] = ""

class DetectAIRequest(BaseModel):
    text: str = Field(..., description="The student report text to analyze")

class PreviousReportItem(BaseModel):
    id: str
    text: Optional[str] = ""

class SimilarityRequest(BaseModel):
    currentText: str
    previousReports: List[PreviousReportItem] = []

class EmbeddingRequest(BaseModel):
    text: str
    dimension: Optional[int] = 64

class AnalyzeReportRequest(BaseModel):
    reportId: Optional[str] = ""
    remarks: Optional[str] = ""
    fileBytesBase64: Optional[str] = None
    fileContentType: Optional[str] = None
    fileName: Optional[str] = ""
    previousReports: List[PreviousReportItem] = []

# ----------------- Endpoints -----------------

@app.get("/health")
def health_check():
    return {
        "status": "UP",
        "service": "ProjectPilot-ai-service",
        "version": "1.0.0",
        "engine": "Standalone Native NLP & Machine Learning Engine (100% Offline & Gemini-Independent)"
    }

@app.post("/api/ai/extract-text")
def extract_text(request: ExtractTextRequest):
    extracted = ""
    if request.fileBytesBase64:
        extracted = DocumentParser.extract_text_from_base64(
            request.fileBytesBase64,
            request.contentType,
            request.fileName
        )
    elif request.rawText:
        extracted = request.rawText

    return {
        "text": extracted,
        "length": len(extracted),
        "success": True
    }

@app.post("/api/ai/extract-skills")
def extract_skills(request: ExtractSkillsRequest):
    text_content = request.text or ""

    if request.fileBytesBase64:
        parsed_text = DocumentParser.extract_text_from_base64(
            request.fileBytesBase64,
            request.contentType,
            request.fileName
        )
        if parsed_text:
            text_content = (text_content + "\n" + parsed_text).strip()

    skills = SkillExtractor.extract_skills(text_content)
    return {
        "skills": skills,
        "count": len(skills),
        "success": True
    }

@app.post("/api/ai/detect-ai")
def detect_ai(request: DetectAIRequest):
    result = AIDetector.detect(request.text)
    return result

@app.post("/api/ai/similarity")
def check_similarity(request: SimilarityRequest):
    prev_dicts = [{"id": r.id, "text": r.text or ""} for r in request.previousReports]
    result = SimilarityEngine.compute_similarity(request.currentText, prev_dicts)
    return {
        "similarityScore": result["similarity_score"],
        "matchedReportId": result["matched_report_id"],
        "details": result["details"]
    }

@app.post("/api/ai/embeddings")
def get_embeddings(request: EmbeddingRequest):
    embedding = SimilarityEngine.get_embedding_vector(request.text, request.dimension or 64)
    return {
        "embedding": embedding,
        "dimension": len(embedding)
    }

@app.post("/api/ai/analyze-report")
def analyze_report(request: AnalyzeReportRequest):
    # 1. Document text extraction
    extracted_text = ""
    if request.fileBytesBase64:
        extracted_text = DocumentParser.extract_text_from_base64(
            request.fileBytesBase64,
            request.fileContentType,
            request.fileName
        )

    # 2. Combine student remarks and document text
    original_remarks = request.remarks or ""
    combined_text = original_remarks
    if extracted_text.strip():
        combined_text = (original_remarks + "\n" + extracted_text).strip()

    # 3. AI Text Detection
    ai_result = AIDetector.detect(combined_text)
    ai_score = float(ai_result["score"])

    # 4. Similarity Checking
    prev_dicts = [{"id": r.id, "text": r.text or ""} for r in request.previousReports]
    sim_result = SimilarityEngine.compute_similarity(combined_text, prev_dicts)
    sim_score = float(sim_result["similarity_score"])
    matched_id = sim_result["matched_report_id"]

    # 5. Embeddings calculation
    embedding = SimilarityEngine.get_embedding_vector(combined_text, 64)

    # 6. Flag thresholds: Similarity >= 50% or AI probability >= 60% flags report
    exceeds_similarity = sim_score >= 50.0
    exceeds_ai = ai_score >= 60.0
    is_flagged = exceeds_similarity or exceeds_ai

    return {
        "aiGeneratedScore": ai_score,
        "similarityScore": sim_score,
        "matchedReportId": matched_id,
        "isFlagged": is_flagged,
        "extractedText": extracted_text,
        "combinedText": combined_text,
        "aiClassification": ai_result["classification"],
        "aiDetails": ai_result,
        "embedding": embedding
    }

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8083, reload=True)
