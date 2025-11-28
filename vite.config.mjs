// vite.config.mjs
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// ⚙️ Configuración para GitHub Pages + PWA
export default defineConfig({
  base: '/odontocloud-react/', // 👈 nombre exacto del repositorio (GitHub Pages)
  build: {
    outDir: 'dist' // carpeta donde se guarda el build
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'robots.txt', 'apple-touch-icon.png'],
      manifest: {
        name: 'OdontoCloud',
        short_name: 'OdontoCloud',
        start_url: '/odontocloud-react/',
        scope: '/odontocloud-react/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#2d89ef',
        icons: [
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          { src: 'pwa-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
        ]
      },
      workbox: {
        // Para SPA en GitHub Pages
        navigateFallback: '/odontocloud-react/index.html',
      }
    })
  ]
})
