@echo off
cd admin
echo Checking if app is compiled and up-to-date...
bun run check_build.ts

if %errorlevel% equ 0 (
    echo Starting compiled Admin Dashboard... Instant!
    start "" "src-tauri\target\release\app.exe"
) else (
    echo App is not compiled or source files have changed.
    echo Launching development server so you can work immediately...
    echo (Run admin-build.bat to refresh the instant-launch release build.)
    bun run tauri dev
)
