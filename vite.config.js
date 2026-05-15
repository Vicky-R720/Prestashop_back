import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost/Eval',
        changeOrigin: true,
        secure: false,
      },
      '/Eval/api': {
        target: 'http://localhost',
        changeOrigin: true,
        secure: false,
      },
    },
  }
})