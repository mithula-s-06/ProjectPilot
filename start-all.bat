@echo off
echo ===================================================
echo        STARTING PROJECTPILOT FULL ECOSYSTEM
echo ===================================================

echo 1. Starting Python AI Microservice (Port 8083)...
start "AI Service [Port 8083]" cmd /k "cd Backend\ai-service && python -m uvicorn main:app --host 0.0.0.0 --port 8083 --reload"

echo 2. Starting Frontend (Port 5173)...
start "Frontend [Port 5173]" cmd /k "npm run dev"

echo.
echo ===================================================
echo  For Java Spring Boot Services in VS Code:
echo  1. Open Backend\auth-service\...\AuthServiceApplication.java and click 'Run' (Port 8081)
echo  2. Open Backend\project-service\...\ProjectPilotApplication.java and click 'Run' (Port 8082)
echo ===================================================
pause
