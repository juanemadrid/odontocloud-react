// vite.config.mjs
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// En desarrollo: base = '/' (localhost)
// En producción (GitHub Pages del repo): base = '/odontocloud-react/'
export default defineConfig(({ mode }) => ({
  plugins: [react()],
  base: mode === 'development' ? '/' : '/odontocloud-react/',
}))
