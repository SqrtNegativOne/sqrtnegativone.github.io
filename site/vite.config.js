import { defineConfig } from 'vite'
import { sveltekit } from '@sveltejs/kit/vite'
import tailwindcss from '@tailwindcss/vite'

const velitePlugin = () => {
  let started = false;
  let dev = false;
  return {
    name: 'velite',
    configResolved(config) {
      dev = config.command === 'serve';
    },
    async buildStart() {
      if (started) return;
      started = true;
      const { build } = await import('velite');
      await build({ watch: dev, clean: false });
    }
  };
};

// https://vite.dev/config/
export default defineConfig({
  plugins: [tailwindcss(), velitePlugin(), sveltekit()],
  resolve: {
    // shared/ is outside the app root; force these bare deps to resolve from
    // this app's node_modules instead of walking up to the repo root.
    dedupe: ['gsap', 'mouse-follower', 'ogl']
  },
  server: {
    fs: {
      // shared/ lives outside the app root; allow Vite to serve it in dev.
      allow: ['..']
    }
  }
})
