// src/main.jsx
import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'

// Base del proyecto (coincide con vite.config.mjs)
const BASE_PATH = '/odontocloud-react/'

// 🧩 Inicializa Firebase con sesión persistente + modo offline
import { initFirebase } from './firebaseClient.js'
initFirebase()

// 🧠 Registro del Service Worker (PWA)
import { registerSW } from 'virtual:pwa-register'
registerSW({ immediate: true })

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter basename={BASE_PATH}>
      <App />
    </BrowserRouter>
  </React.StrictMode>
)
