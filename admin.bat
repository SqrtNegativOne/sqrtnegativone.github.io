@echo off
cd admin
if exist "src-tauri\target\release\admin-app.exe" (
    echo Starting compiled Admin Dashboard... Obsidian Fast!
    start "" "src-tauri\target\release\admin-app.exe"
) else (
    echo First time setup: App is not compiled yet.
    echo Launching development server so you can work immediately...
    echo Compiling production build seamlessly in the background.
    
    start "Admin App Build" /MIN cmd /c "bun run tauri build > build.log 2>&1"
    bun run tauri dev
)
