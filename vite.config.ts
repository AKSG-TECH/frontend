import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', // Yeh Render ko port detect karne me madad karega
    port: process.env.PORT ? parseInt(process.env.PORT) : 3000, 
    proxy: {
      '/api': {
        target: 'http://localhost:10000', // Local testing ke liye
        changeOrigin: true,
      },
      '/socket.io': {
        target: 'http://localhost:1000-', // Local testing ke liye
        ws: true,
        changeOrigin: true,
      },
    },
  },
  // Preview block bhi add kar dete hain production ke liye
  preview: {
    host: '0.0.0.0',
    port: process.env.PORT ? parseInt(process.env.PORT) : 3000,
  }
})
