import { statSync, existsSync } from 'fs';
import { resolve, sep } from 'path';

const exePath = 'src-tauri/target/release/app.exe';
if (!existsSync(exePath)) {
  process.exit(1);
}

const exeTime = statSync(exePath).mtimeMs;
const root = process.cwd();

const pathsToCheck = [
  'src',
  'src-tauri/src',
  'src-tauri/capabilities',
  'static',
  '../shared',
  'package.json',
  'bun.lock',
  'tsconfig.json',
  'src-tauri/Cargo.toml',
  'src-tauri/tauri.conf.json',
  'src-tauri/build.rs',
  'vite.config.ts',
  'svelte.config.js'
];

const IGNORED = ['node_modules', '.svelte-kit', 'build', 'dist', 'target', '.git', '.turbo'];

function isIgnored(abs: string): boolean {
  return IGNORED.some((d) => abs.includes(sep + d + sep) || abs.endsWith(sep + d));
}

function checkPath(p: string): boolean {
  const abs = resolve(root, p);
  if (!existsSync(abs)) return false;

  if (statSync(abs).isFile()) {
    return statSync(abs).mtimeMs > exeTime;
  }

  const glob = new Bun.Glob('**/*');
  for (const file of glob.scanSync({ cwd: abs, absolute: true, onlyFiles: true })) {
    if (isIgnored(file)) continue;
    try {
      if (statSync(file).mtimeMs > exeTime) {
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
