// vite.config.mjs
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// En desarrollo: base = '/' (servidor local)
// En producción: base = '/odontocloud-react/' (subcarpeta del repo en GitHub Pages)
export default defineConfig(({ mode }) => ({
  plugins: [react()],
  base: mode === 'development' ? '/' : '/odontocloud-react/',
}))
