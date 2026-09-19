// @sveltejs/adapter-cloudflare clears .svelte-kit/cloudflare with a bare
// fs.rmSync before writing the new build output. On Windows that intermittently
// fails with EPERM while something (Defender, the search indexer) still holds a
// handle on the previous build's files, and the build dies with a stack trace
// from inside the adapter.
//
// Clearing the directory here instead — from a separate, earlier process, with
// retries — avoids that. On a clean checkout there is nothing to remove, so
// this is a no-op in CI.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const target = path.resolve(
	path.dirname(fileURLToPath(import.meta.url)),
	'..',
	'.svelte-kit',
	'cloudflare'
);

if (!fs.existsSync(target)) process.exit(0);

/** @param {string} dir */
function clearReadOnly(dir) {
	for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
		const full = path.join(dir, entry.name);
		if (entry.isDirectory()) clearReadOnly(full);
		else fs.chmodSync(full, 0o666);
	}
}

try {
	fs.rmSync(target, { recursive: true, force: true, maxRetries: 10, retryDelay: 200 });
	console.log('[clean] removed stale .svelte-kit/cloudflare');
} catch (err) {
	// Second line of defence: Windows also refuses to unlink read-only files.
	console.warn(`[clean] ${err.code} removing .svelte-kit/cloudflare — clearing read-only flags and retrying`);
	clearReadOnly(target);
	fs.rmSync(target, { recursive: true, force: true, maxRetries: 10, retryDelay: 200 });
	console.log('[clean] removed stale .svelte-kit/cloudflare');
}
