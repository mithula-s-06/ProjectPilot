from fastapi import FastAPI
import uvicorn
from similarity_router import router as similarity_router
from detection_router import router as detection_router
from file_analysis_router import router as file_analysis_router

app = FastAPI(title="ProjectPilot AI Service", version="1.0")

app.include_router(similarity_router, prefix="/api/ai")
app.include_router(detection_router, prefix="/api/ai")
app.include_router(file_analysis_router, prefix="/api/ai")

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8083)
