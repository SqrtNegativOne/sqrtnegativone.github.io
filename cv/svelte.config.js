import adapter from '@sveltejs/adapter-cloudflare';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

export default {
	compilerOptions: {
		runes: true
	},
	kit: {
		alias: {
			$shared: '../shared'
		},
		adapter: adapter({
			platformProxy: { persist: true }
		}),
		prerender: {
			entries: ['*', '/sitemap.xml'],
			handleUnseenRoutes: 'ignore'
		}
	},
	preprocess: vitePreprocess()
};
