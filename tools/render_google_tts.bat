@echo off
setlocal
cd /d "%~dp0\.."

where py >nul 2>nul
if errorlevel 1 (
    echo [LOI] Khong tim thay Python launcher ^(py^).
    pause
    exit /b 1
)

py tools\render_google_tts.py %*
set EXIT_CODE=%ERRORLEVEL%

echo.
if "%EXIT_CODE%"=="0" (
    echo [OK] Hoan tat.
) else (
    echo [CAN KIEM TRA] Renderer tra ma loi %EXIT_CODE%.
)

echo.
echo MP3: Audio\tts\
echo Manifest: tts-manifest.js
pause
exit /b %EXIT_CODE%
