import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/api': {
        target: 'https://rally-production-2004.up.railway.app',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '/api') // Keep /api prefix as required by backend
      }
    }
  }
})
