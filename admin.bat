@echo off
cd admin
echo Checking if app is compiled and up-to-date...
bun run check_build.ts

if errorlevel 1 goto dev

echo Starting compiled Admin Dashboard... Instant!
start "" "src-tauri\target\release\app.exe"
exit /b 0

:dev
echo App is not compiled or source files have changed.
echo Launching development server so you can work immediately...
echo (Run admin-build.bat to refresh the instant-launch release build.)
echo Closing any running compiled Dashboard first...
taskkill /IM app.exe /F >nul 2>&1
bun run tauri dev
