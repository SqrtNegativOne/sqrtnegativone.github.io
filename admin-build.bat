@echo off
cd /d "%~dp0admin"
echo Building optimized release Admin Dashboard...
echo This may take a while, but afterwards admin.bat will open instantly.
bun run tauri build
if errorlevel 1 goto done

rem Record the exact git state this release was built from so admin.bat can tell,
rem in milliseconds, whether the release exe still matches the sources.
set "STAMP=src-tauri\target\release\.build-stamp"
call "%~dp0admin\build-state.cmd" > "%STAMP%"
if errorlevel 1 del /q "%STAMP%" >nul 2>&1

:done
pause
