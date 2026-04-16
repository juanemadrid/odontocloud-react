import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { HelmetProvider } from 'react-helmet-async';
import App from './App'
import './index.css'
import './styles/global.css'

import { ToastProvider } from './context/ToastContext'

createRoot(document.getElementById('root')).render(
    <HelmetProvider>
        <AuthProvider>
            <ToastProvider>
                <BrowserRouter>
                    <App />
                </BrowserRouter>
            </ToastProvider>
        </AuthProvider>
    </HelmetProvider>
)
