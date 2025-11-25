// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// IMPORTANTE: tu repo se publica bajo /odontocloud-react/
// Esto arregla rutas de assets en GitHub Pages.
export default defineConfig({
  plugins: [react()],
  base: '/odontocloud-react/',
  build: {
    outDir: 'dist'
  }
})
