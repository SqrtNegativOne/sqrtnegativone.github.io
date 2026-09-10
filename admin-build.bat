@echo off
cd admin
echo Building optimized release Admin Dashboard...
echo This may take a while, but afterwards admin.bat will open instantly.
bun run tauri build
pause
