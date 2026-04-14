import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { existsSync } from 'fs'
import { resolve } from 'path'

// Vite plugin: serve /blog/* and /blog-afterdark/* from the 11ty-generated static files
// without the SPA fallback intercepting them.
function blogStaticPlugin() {
  return {
    name: 'blog-static',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (!req.url.startsWith('/blog')) return next()

        // Resolve directory URLs to their index.html
        let filePath = req.url
        if (!filePath.includes('.')) {
          filePath = filePath.endsWith('/')
            ? filePath + 'index.html'
            : filePath + '/index.html'
        }

        const fullPath = resolve('public', filePath.slice(1))
        if (existsSync(fullPath)) {
          req.url = filePath
        }
        next()
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [tailwindcss(), blogStaticPlugin(), react()],
  build: {
    outDir: 'docs',
    emptyOutDir: true,
  },
})
