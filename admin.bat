@echo off
cd admin
if exist "src-tauri\target\release\admin-app.exe" (
    echo Starting compiled Admin Dashboard... Obsidian Fast!
    start "" "src-tauri\target\release\admin-app.exe"
) else (
    echo First time setup: Building compiled Admin App for maximum speed...
    call bun run tauri build
    start "" "src-tauri\target\release\admin-app.exe"
)
