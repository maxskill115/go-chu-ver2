@echo off
setlocal
cd /d "%~dp0\.."

where py >nul 2>nul
if errorlevel 1 (
    echo [LOI] Khong tim thay Python launcher ^(py^).
    pause
    exit /b 1
)

set PORT=8000
if not "%~1"=="" set PORT=%~1

echo ============================================================
echo  GO CHU VER2 - LOCAL HTTP SERVER

echo  URL: http://127.0.0.1:%PORT%/
echo  Debug: http://127.0.0.1:%PORT%/?debug=1

echo  Nhan Ctrl+C de dung server.
echo ============================================================

start "" "http://127.0.0.1:%PORT%/"
py -m http.server %PORT% --bind 127.0.0.1
