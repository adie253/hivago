import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Vite plugin to rewrite POST requests to GET so React Router can handle payment gateway redirects natively
const postToGetPlugin = () => {
  return {
    name: 'post-to-get',
    configureServer(server: any) {
      server.middlewares.use((req: any, res: any, next: any) => {
        if (req.method === 'POST' && (req.url?.startsWith('/payment-success') || req.url?.startsWith('/payment-failure'))) {
          req.method = 'GET';
        }
        next();
      });
    }
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), postToGetPlugin()],
  server: {
    proxy: {
      '/api': {
        target: 'https://rally-production-2004.up.railway.app',
        changeOrigin: true,
        rewrite: (path) => path.replace(/api/, '/api') // Keep /api prefix as required by backend
      }
    }
  }
})
