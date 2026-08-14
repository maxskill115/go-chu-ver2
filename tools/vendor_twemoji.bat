@echo off
setlocal
cd /d "%~dp0\.."

where py >nul 2>nul
if errorlevel 1 (
    echo [LOI] Khong tim thay Python launcher ^(py^).
    pause
    exit /b 1
)

py tools\vendor_twemoji.py %*
set EXIT_CODE=%ERRORLEVEL%

echo.
if "%EXIT_CODE%"=="0" (
    echo [OK] Vendor Twemoji hoan tat.
) else (
    echo [CAN KIEM TRA] Tool tra ma loi %EXIT_CODE%.
)

echo.
echo SVG: assets\twemoji\
echo Manifest: twemoji-local-manifest.js
pause
exit /b %EXIT_CODE%
