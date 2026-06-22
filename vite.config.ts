import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    allowedHosts: true, // Ye line add karo
    port: process.env.PORT ? parseInt(process.env.PORT) : 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:10000',
        changeOrigin: true,
      },
      '/socket.io': {
        target: 'http://localhost:10000',
        ws: true,
        changeOrigin: true,
      },
    },
  },
  preview: {
    host: '0.0.0.0',
    allowedHosts: true, // Optional
    port: process.env.PORT ? parseInt(process.env.PORT) : 3000,
  }
})
