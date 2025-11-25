// src/main.jsx
import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, HashRouter } from 'react-router-dom'
import App from './App.jsx'

// En dev usamos BrowserRouter; en Pages (build) usamos HashRouter
const isDev = import.meta.env.DEV
const DevRouter = ({ children }) => <BrowserRouter basename="/">{children}</BrowserRouter>
const ProdRouter = ({ children }) => <HashRouter>{children}</HashRouter>

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {isDev ? (
      <DevRouter>
        <App />
      </DevRouter>
    ) : (
      <ProdRouter>
        <App />
      </ProdRouter>
    )}
  </React.StrictMode>
)
