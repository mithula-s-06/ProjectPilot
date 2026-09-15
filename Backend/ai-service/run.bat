@echo off
echo Starting ProjectPilot AI Microservice on port 8083...
python -m uvicorn main:app --host 0.0.0.0 --port 8083 --reload
pause
