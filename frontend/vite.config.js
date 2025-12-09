import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({

  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'https://capstone-dtei.um.ac.id/solvesphere-backend/public/api',
        changeOrigin: true,
        secure: false,
      },
      '/sanctum': {
        target: 'https://capstone-dtei.um.ac.id/solvesphere-backend/public/api',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})
