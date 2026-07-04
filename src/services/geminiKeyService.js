/**
 * geminiKeyService.js
 * 
 * Gestión centralizada de la API Key de Gemini.
 * - El administrador la guarda UNA VEZ en Firestore
 * - Todos los usuarios la obtienen automáticamente
 * - Sin necesidad de configurar en cada dispositivo
 */

import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";

const CACHE_KEY = "odontovox_gemini_api_key";
const CACHE_TTL = 1000 * 60 * 30; // 30 minutos de caché local

/**
 * Obtiene la API key de Gemini.
 * Orden de prioridad:
 * 1. Caché local (localStorage) — válido por 30 min
 * 2. Firestore (configurada por el admin)
 * 3. Variable de entorno VITE_GEMINI_API_KEY
 */
export async function getGeminiApiKey(inquilino) {
    // 1. Verificar caché local
    try {
        const cached = JSON.parse(localStorage.getItem(CACHE_KEY + "_cache") || "{}");
        if (cached.key && cached.ts && Date.now() - cached.ts < CACHE_TTL) {
            return cached.key;
        }
    } catch {}

    // 2. Intentar desde Firestore
    if (inquilino) {
        try {
            const snap = await getDoc(doc(db, "configuracion", inquilino));
            if (snap.exists() && snap.data().geminiApiKey) {
                const key = snap.data().geminiApiKey;
                // Guardar en caché local
                localStorage.setItem(CACHE_KEY + "_cache", JSON.stringify({ key, ts: Date.now() }));
                return key;
            }
        } catch (e) {
            console.warn("[GeminiKeyService] No se pudo cargar la key desde Firestore:", e.message);
        }
    }

    // 3. Fallback a variable de entorno
    const envKey = import.meta.env.VITE_GEMINI_API_KEY || "";
    if (envKey) return envKey;

    // 4. Fallback a localStorage legacy
    return localStorage.getItem(CACHE_KEY) || "";
}

/**
 * Guarda la API key en Firestore (solo admin).
 * Invalida el caché local automáticamente.
 */
export async function saveGeminiApiKey(inquilino, apiKey) {
    if (!inquilino) throw new Error("Inquilino requerido");
    if (!apiKey?.trim()) throw new Error("API Key no puede estar vacía");

    await setDoc(doc(db, "configuracion", inquilino), {
        geminiApiKey: apiKey.trim(),
        geminiKeyUpdatedAt: new Date().toISOString()
    }, { merge: true });

    // Actualizar caché local inmediatamente
    localStorage.setItem(CACHE_KEY + "_cache", JSON.stringify({ 
        key: apiKey.trim(), 
        ts: Date.now() 
    }));
    // También actualizar el legacy por compatibilidad
    localStorage.setItem(CACHE_KEY, apiKey.trim());
}

/**
 * Limpia el caché local (fuerza recarga desde Firestore).
 */
export function clearGeminiKeyCache() {
    localStorage.removeItem(CACHE_KEY + "_cache");
}
