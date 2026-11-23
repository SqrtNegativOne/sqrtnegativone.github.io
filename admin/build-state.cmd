@echo off
rem Prints a stable fingerprint of the build-relevant working tree: the checked-out
rem commit plus any uncommitted or untracked changes under the paths below.
rem admin-build.bat stores this, and admin.bat regenerates it and byte-compares the
rem two, so the freshness check costs a single git call instead of stat-ing every
rem source file. Keep this list in sync with what the release build consumes.
cd /d "%~dp0"
git status --porcelain=v2 --branch -- src static src-tauri/src src-tauri/capabilities src-tauri/icons src-tauri/build.rs src-tauri/Cargo.toml src-tauri/Cargo.lock src-tauri/tauri.conf.json ../shared package.json bun.lock tsconfig.json vite.config.ts | findstr /v /b /c:"# branch.head" /c:"# branch.upstream" /c:"# branch.ab"
