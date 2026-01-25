import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: './',

  server: {
    host: '0.0.0.0',
    port: 8080,
    allowedHosts: [ 'classabc.up.railway.app'],
    proxy: {
      '/api/api': {
        target: 'https://classabc.up.railway.app:8080',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api\/api/, '/api')
      },
      '/api': {
        target: 'https://classabc.up.railway.app:8080',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path
      }
    }
  }
})
