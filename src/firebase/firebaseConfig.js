// src/firebase/firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyC70mGCRrjE8iOap8iTHuid8HEuyadue8Y",
  authDomain: "odontocloud-d92ac.firebaseapp.com",
  projectId: "odontocloud-d92ac",
  storageBucket: "odontocloud-d92ac.firebasestorage.app",
  messagingSenderId: "267020714981",
  appId: "1:267020714981:web:a44416ea83aa1d1172650c",
  measurementId: "G-ZMCC5CFY0C",
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

// Activar la persistencia de datos offline y caché multidominio/pestaña
// Esto reduce drásticamente las lecturas a la base de datos (Database Reads) guardando todo en el disco duro del usuario temporalmente.
const db = initializeFirestore(app, {
  localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() })
});
const storage = getStorage(app);
const analytics = getAnalytics(app);

export { app, auth, db, storage, analytics, firebaseConfig };
