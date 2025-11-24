// vite.config.mjs
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// En desarrollo usamos '/', y en producción (GitHub Pages) la subcarpeta del repo
export default defineConfig(({ mode }) => ({
  plugins: [react()],
  base: mode === 'development' ? '/' : '/odontocloud-react/',
}))
