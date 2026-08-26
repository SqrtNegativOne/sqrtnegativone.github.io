import { statSync, existsSync } from 'fs';

const exePath = 'src-tauri/target/release/app.exe';
if (!existsSync(exePath)) {
  process.exit(1);
}

const exeTime = statSync(exePath).mtimeMs;

const pathsToCheck = [
  'src',
  'src-tauri/src',
  'static',
  'package.json',
  'src-tauri/Cargo.toml',
  'src-tauri/tauri.conf.json',
  'vite.config.ts',
  'svelte.config.js'
];

function checkPath(p: string): boolean {
  if (!existsSync(p)) return false;
  
  const isDir = statSync(p).isDirectory();
  
  if (!isDir) {
    if (statSync(p).mtimeMs > exeTime) return true;
    return false;
  }
  
  const glob = new Bun.Glob('**/*');
  for (const file of glob.scanSync({ cwd: p, absolute: true, onlyFiles: true })) {
    try {
      const stat = statSync(file);
      if (stat.mtimeMs > exeTime) {
        return true;
      }
    } catch {
      // Ignore errors
    }
  }
  return false;
}

for (const p of pathsToCheck) {
  if (checkPath(p)) {
    process.exit(1);
  }
}
process.exit(0);
