# ProjectPilot AI Microservice (`ai-service`)

A high-performance, standalone Python microservice designed for text intelligence, document parsing, AI content detection, semantic similarity comparison, and resume skill extraction.

**Key highlights:**
- **100% Independent & Self-Contained**: No external LLM dependencies, no Google Gemini APIs, and no rate limits or external credentials required.
- **Fast & Lightweight**: Built with FastAPI and Uvicorn.
- **Rich Heuristics & NLP**: Custom skill taxonomy matching, burstiness/perplexity-based AI detection, and TF-IDF cosine similarity analysis.

---

## 🚀 Getting Started

### 1. Prerequisites
- Python 3.9+ (Python 3.10+ recommended)

### 2. Install Dependencies
```bash
cd Backend/ai-service
pip install -r requirements.txt
```

### 3. Run the Microservice
```bash
# Windows
run.bat

# Or directly with Uvicorn
python -m uvicorn main:app --host 0.0.0.0 --port 8083 --reload
```

The service will start at `http://localhost:8083`.
- Interactive Swagger UI: `http://localhost:8083/docs`
- Health Check: `http://localhost:8083/health`

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | Service health and engine status |
| `POST` | `/api/ai/extract-skills` | Extracts structured technical skills from resume text or uploaded documents |
| `POST` | `/api/ai/detect-ai` | Calculates probability (0–100%) that text is AI generated |
| `POST` | `/api/ai/similarity` | Computes TF-IDF cosine similarity against historical reports |
| `POST` | `/api/ai/extract-text` | Extracts plain text from PDF, DOCX, or Base64 file payloads |
| `POST` | `/api/ai/embeddings` | Generates deterministic vector embeddings for text |
| `POST` | `/api/ai/analyze-report` | Full weekly report analysis pipeline |
