import fs from 'fs';
import path from 'path';
import tailwindcss from '@tailwindcss/vite';
import adapter from '@sveltejs/adapter-static';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

function serveParentStatic() {
	return {
		name: 'serve-parent-static',
		configureServer(server: any) {
			server.middlewares.use((req: any, res: any, next: any) => {
				const url = req.url?.split('?')[0];
				if (!url || !(url.startsWith('/media/') || url.startsWith('/logos/') || url.startsWith('/projects/'))) {
					next();
					return;
				}
				const filePath = path.resolve(import.meta.dirname, '..', 'static', url.slice(1));
				fs.stat(filePath, (err, stat) => {
					if (err || !stat.isFile()) {
						next();
						return;
					}
					const ext = path.extname(filePath).toLowerCase();
					const mimeTypes: Record<string, string> = {
						'.jpg': 'image/jpeg',
						'.jpeg': 'image/jpeg',
						'.png': 'image/png',
						'.webp': 'image/webp',
						'.avif': 'image/avif',
						'.svg': 'image/svg+xml'
					};
					res.setHeader('Content-Type', mimeTypes[ext] || 'application/octet-stream');
					res.setHeader('Content-Length', stat.size);
					res.writeHead(200);
					fs.createReadStream(filePath).pipe(res);
					return;
					next();
				});
				return;
			});
		}
	};
}

export default defineConfig({
	plugins: [
		serveParentStatic(),
		tailwindcss(),
		sveltekit({
			compilerOptions: {
				// Force runes mode for the project, except for libraries. Can be removed in svelte 6.
				runes: ({ filename }) => filename.split(/[/\\]/).includes('node_modules') ? undefined : true
			},

			// adapter-auto only supports some environments, see https://svelte.dev/docs/kit/adapter-auto for a list.
			// If your environment is not supported, or you settled on a specific environment, switch out the adapter.
			adapter: adapter({
				fallback: 'index.html'
			})
		})
	],
	server: {
		fs: {
			allow: ['..']
		}
	},
	// Eagerly pre-bundle dependencies so Vite doesn't discover and re-bundle them
	// mid-request, which causes a page reload waterfall on first open.
	optimizeDeps: {
		include: [
			'svelte',
			'svelte/internal',
			'svelte/store',
			'@sveltejs/kit',
		]
	},
	envDir: '..'
});
