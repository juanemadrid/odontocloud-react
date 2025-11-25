import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Configuración para GitHub Pages
export default defineConfig({
  plugins: [react()],
  base: '/odontocloud-react/',  // 👈 MUY IMPORTANTE: nombre exacto del repo
  build: {
    outDir: 'dist'              // Carpeta donde se guarda el build
  }
})
