@echo off
cd admin
echo Checking if app is compiled and up-to-date...
bun run check_build.ts

if %errorlevel% equ 0 (
    echo Starting compiled Admin Dashboard... Obsidian Fast!
    start "" "src-tauri\target\release\app.exe"
) else (
    echo App is not compiled or source files have changed.
    echo Launching development server so you can work immediately...
    echo Compiling production build seamlessly in the background.
    
    start /B cmd /c "bun run tauri build > build.log 2>&1"
    bun run tauri dev
)
