import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// ⚙️ Configuración para GitHub Pages
export default defineConfig({
  plugins: [react()],
  base: '/odontocloud-react/', // 👈 nombre exacto del repositorio
  build: {
    outDir: 'dist' // carpeta donde se guarda el build
  }
})
