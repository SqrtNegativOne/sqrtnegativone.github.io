@echo off
cd admin
powershell -NoProfile -Command "$exe='src-tauri\target\release\app.exe'; if(!(Test-Path $exe)){exit 1}; $exeTime=(Get-Item $exe).LastWriteTime; foreach($p in @('src','src-tauri\src','static','package.json','src-tauri\Cargo.toml','src-tauri\tauri.conf.json','vite.config.ts','svelte.config.js')){if(Test-Path $p){if(Get-ChildItem -Path $p -Recurse -File | Where-Object {$_.LastWriteTime -gt $exeTime} | Select-Object -First 1){exit 1}}}; exit 0"
if %errorlevel% equ 0 (
    echo UP TO DATE
) else (
    echo NEEDS BUILD
)
