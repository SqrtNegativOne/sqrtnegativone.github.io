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
})
