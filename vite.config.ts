import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    allowedHosts: true, 
    // Render standard ports use karta hai (jaise 10000)
    port: process.env.PORT ? parseInt(process.env.PORT) : 3000,
    // Local proxy par depend na rahein, production me direct backend URL dein:
const API = axios.create({
  baseURL: 'https://open-wa-backent-1.onrender.com' 
});
    proxy: {
      '/api': {
        // Yahan aapke BACKEND ka URL aayega
        target: 'https://open-wa-backent-1.onrender.com',
        changeOrigin: true,
        secure: false,
      },
      '/socket.io': {
        // Socket ke liye bhi BACKEND ka URL
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
