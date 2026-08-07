import { defineConfig } from 'vite'
import { sveltekit } from '@sveltejs/kit/vite'
import tailwindcss from '@tailwindcss/vite'
import fs from 'fs'
import path from 'path'

const eleventyDevPlugin = {
  name: 'eleventy-dev',
  configureServer(server) {
    server.middlewares.use((req, res, next) => {
      if (req.url && (req.url.startsWith('/blog') || req.url.startsWith('/blog-afterdark'))) {
        let url = req.url.split('?')[0];
        if (url.endsWith('/')) {
          url += 'index.html';
        } else if (!url.includes('.')) {
          url += '/index.html';
        }
        
        const staticPath = path.resolve('static', url.slice(1));
        if (fs.existsSync(staticPath)) {
          req.url = url;
        }
      }
      next();
    });
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [tailwindcss(), eleventyDevPlugin, sveltekit()],
})
