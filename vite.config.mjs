// vite.config.mjs
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// En desarrollo: base = '/'  (no hay subcarpeta)
// En producción (build/deploy): base = '/odontocloud-react/'
export default defineConfig(({ mode }) => ({
  plugins: [react()],
  base: mode === 'development' ? '/' : '/odontocloud-react/',
}))
