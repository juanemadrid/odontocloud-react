// vite.config.mjs
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// En desarrollo: rutas limpias
// En GitHub Pages: el sitio vive bajo /odontocloud-react/
export default defineConfig(({ mode }) => ({
  plugins: [react()],
  base: mode === 'development' ? '/' : '/odontocloud-react/',
}))
