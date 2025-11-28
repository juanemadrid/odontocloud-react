// vite.config.mjs
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// 🔵 Ajusta esto si cambias el nombre del repo en GitHub Pages
const BASE = '/odontocloud-react/'

export default defineConfig({
  base: BASE,
  build: {
    outDir: 'dist'
  },
  plugins: [
    react(),
    VitePWA({
      // Actualiza el SW automáticamente cuando publiques una nueva versión
      registerType: 'autoUpdate',

      // Archivos estáticos extra que quieras copiar tal cual desde /public
      includeAssets: ['favicon.svg', 'robots.txt', 'apple-touch-icon.png'],

      // Manifest de la PWA
      manifest: {
        id: BASE,                 // recomendado para Android
        name: 'OdontoCloud',
        short_name: 'OdontoCloud',
        start_url: BASE,
        scope: BASE,
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#2d89ef',
        icons: [
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          { src: 'pwa-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
        ],
        // 👉 Si luego quieres eliminar el warning de “Rich PWA Install UI”,
        // descomenta y añade estas dos capturas reales en /public:
        // screenshots: [
        //   { src: 'screenshot-wide.png',   sizes: '1280x720', type: 'image/png', form_factor: 'wide' },
        //   { src: 'screenshot-narrow.png', sizes: '720x1280', type: 'image/png', form_factor: 'narrow' }
        // ]
      },

      // Estrategia por defecto: generateSW (precaching + runtime)
      workbox: {
        // Necesario para SPA en GitHub Pages (refresh de rutas profundas)
        navigateFallback: `${BASE}index.html`
      }
    })
  ]
})
