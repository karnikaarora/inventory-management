import path from "path" // Yeh line zaroori hai paths handle karne ke liye
import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      // Iska matlab hai ki "@" ab "src" folder ko point karega
      "@": path.resolve(__dirname, "./src"),
    },
  },
})