@echo off
echo === Politicaid - Windows Setup ===

python --version >nul 2>&1
IF ERRORLEVEL 1 (echo [ERROR] Install Python 3.11+ from python.org & pause & exit /b 1)

node --version >nul 2>&1
IF ERRORLEVEL 1 (echo [ERROR] Install Node 20+ from nodejs.org & pause & exit /b 1)

echo [1/5] Creating Python virtual environment...
cd backend
python -m venv venv
call venv\Scripts\activate.bat

echo [2/5] Installing Python dependencies...
pip install --upgrade pip
pip install -r requirements.txt
python -m spacy download en_core_web_sm
cd ..

echo [3/5] Installing Angular CLI...
npm install -g @angular/cli@17

echo [4/5] Installing frontend dependencies...
cd frontend
npm install
cd ..

echo [5/5] Creating .env from template...
IF NOT EXIST .env (copy .env.example .env & echo .env created - fill in your credentials!)

echo.
echo === Setup complete! ===
echo 1. Edit .env with your DB credentials and API keys
echo 2. Start backend:  cd backend and venv\Scripts\activate then uvicorn main:app --reload
echo 3. Start frontend: cd frontend then ng serve
pause