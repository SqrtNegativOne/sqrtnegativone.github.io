import tailwindcss from '@tailwindcss/vite';
import adapter from '@sveltejs/adapter-auto';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [
		tailwindcss(),
		sveltekit({
			compilerOptions: {
				// Force runes mode for the project, except for libraries. Can be removed in svelte 6.
				runes: ({ filename }) => filename.split(/[/\\]/).includes('node_modules') ? undefined : true
			},

			// adapter-auto only supports some environments, see https://svelte.dev/docs/kit/adapter-auto for a list.
			// If your environment is not supported, or you settled on a specific environment, switch out the adapter.
			// See https://svelte.dev/docs/kit/adapters for more information about adapters.
			adapter: adapter()
		})
	],
	server: {
		fs: {
			allow: ['..']
		},
		// Pre-transform the layout and all route entry files immediately on startup
		// so the first page open doesn't trigger a cold compile cascade.
		warmup: {
			clientFiles: [
				'./src/routes/+layout.svelte',
				'./src/routes/+page.svelte',
				'./src/routes/media/+page.svelte',
				'./src/routes/projects/+page.svelte',
				'./src/routes/quotes/+page.svelte',
				'./src/routes/skills/+page.svelte',
				'./src/routes/socials/+page.svelte',
				'./src/app.css',
				'./src/lib/nav.ts',
			]
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
