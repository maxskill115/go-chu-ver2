@echo off
setlocal
cd /d "%~dp0\.."

echo ============================================================
echo  GO CHU VER2 - SETUP GOOGLE CLOUD TTS

echo ============================================================
echo.

where py >nul 2>nul
if errorlevel 1 (
    echo [LOI] Khong tim thay Python launcher ^(py^).
    pause
    exit /b 1
)

where gcloud >nul 2>nul
if errorlevel 1 (
    echo [LOI] Chua co Google Cloud CLI ^(gcloud^).
    echo Hay cai Google Cloud CLI truoc, sau do chay lai file nay.
    pause
    exit /b 1
)

echo [1/2] Cai thu vien Python...
py -m pip install -r tools\requirements-tts.txt
if errorlevel 1 goto :error

echo.
echo [2/2] Dang nhap Application Default Credentials...
gcloud auth application-default login
if errorlevel 1 goto :error

echo.
echo ============================================================
echo  SETUP XONG

echo  Thu nghe voice:
echo  tools\render_google_tts.bat --sample "be di hoc"
echo ============================================================
pause
exit /b 0

:error
echo.
echo [LOI] Setup Google TTS chua thanh cong.
pause
exit /b 1
