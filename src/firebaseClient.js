// src/firebaseClient.js
import { setPersistence, browserLocalPersistence } from 'firebase/auth'
import { enableIndexedDbPersistence } from 'firebase/firestore'
import { auth, db } from './firebase/firebaseConfig.js'

// 🧩 Esta función se encarga de:
export async function initFirebase() {
  try {
    // 1️⃣ Mantener la sesión activa en el dispositivo (permite entrar sin internet)
    await setPersistence(auth, browserLocalPersistence)

    // 2️⃣ Activar almacenamiento local (modo offline de Firestore)
    await enableIndexedDbPersistence(db)

    console.log('✅ Firebase listo con sesión persistente y modo offline.')
  } catch (err) {
    console.warn('⚠️ Firebase offline/persistencia falló:', err.message)
  }
}
