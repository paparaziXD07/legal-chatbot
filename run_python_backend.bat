@echo off
chcp 65001 > nul
echo ============================================================
echo 🚀 Launching Legal Chatbot - Python FastAPI Backend (Port 8000)
echo ============================================================
echo.

cd /d "%~dp0src\backend_python"

if not exist ".venv\Scripts\python.exe" (
    echo [1/2] Creating Python virtual environment...
    python -m venv .venv
    echo [2/2] Installing requirements...
    .venv\Scripts\pip install -r requirements.txt
)

echo.
echo Starting FastAPI with Uvicorn...
echo Access Swagger Docs at: http://localhost:8000/docs
echo Access API at:          http://localhost:8000/api/chat
echo.
.venv\Scripts\python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
pause
