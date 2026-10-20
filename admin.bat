@echo off
cd admin

rem WebView2 155 requires its user-data folder to be Low integrity. Tauri
rem creates %LOCALAPPDATA%\com.sqrtnegativone.admin as Medium, which makes
rem WebView2 fail with "The requested resource is in use" and no child
rem processes. Ensure the folder exists and is Low on every launch.
set "ADMIN_APP_DATA=%LOCALAPPDATA%\com.sqrtnegativone.admin"
if not exist "%ADMIN_APP_DATA%" mkdir "%ADMIN_APP_DATA%"
icacls "%ADMIN_APP_DATA%" /setintegritylevel "(OI)(CI)Low" >nul 2>&1
if errorlevel 1 echo WARNING: Could not set the WebView2 data folder to Low integrity.

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
