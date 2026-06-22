import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  // Yahan fastRefresh ko production me force-disable karne ke liye mode check kar sakte hain
  plugins: [react({ fastRefresh: process.env.NODE_ENV !== 'production' })],
  server: {
    host: '0.0.0.0',
    allowedHosts: true, 
    port: process.env.PORT ? parseInt(process.env.PORT) : 3000,
    proxy: {
      '/api': {
        target: 'https://open-wa-backent-1.onrender.com',
        changeOrigin: true,
        secure: false,
      },
      '/socket.io': {
        target: 'https://open-wa-backent-1.onrender.com',
        ws: true,
        changeOrigin: true,
        secure: false,
      },
    },
  },
  preview: {
    host: '0.0.0.0',
    allowedHosts: true, 
    port: process.env.PORT ? parseInt(process.env.PORT) : 3000,
  }
})
