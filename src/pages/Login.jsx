// ===============================
// 📄 Login.jsx - Acceso híbrido OdontoCloud (PWA + Offline)
// ===============================
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase/firebaseConfig";
import {
  signInWithEmailAndPassword,
  onAuthStateChanged,
} from "firebase/auth";
import { collection, getDocs, query, where } from "firebase/firestore";
import "../styles/login.css";
import fondo from "/assets/fondo.png";
import logo from "/assets/logo.png";

// Base path from Vite config (adjust if different)
const BASE_PATH = import.meta.env.BASE_URL || "/odontocloud-react/";

// ------------------------------
// 🔒 Sesión offline (simple con localStorage)
// ------------------------------
const saveSessionOffline = (email, rol) => {
  try {
    const sessionData = { email, rol, timestamp: Date.now() };
    localStorage.setItem("odc_session", JSON.stringify(sessionData));
  } catch (e) {
    console.warn("No se pudo guardar la sesión offline (espacio insuficiente o bloqueado):", e);
  }
};

const getOfflineSession = () => {
  try {
    const data = JSON.parse(localStorage.getItem("odc_session"));

    if (data && Date.now() - data.timestamp < 1000 * 60 * 60 * 24) {
      return data;
    }
    return null;
  } catch {
    return null;
  }
};

// ------------------------------
const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loadingStatus, setLoadingStatus] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const redirectByRole = (rol) => {
    const r = (rol || "").toLowerCase();

    // 1. Superadmin -> Panel de Superadmin
    if (r === "superadmin" || r.includes("superadmin")) {
      navigate("/superadmin", { replace: true });
      return;
    }

    // 2. Administrador -> Dashboard Admin
    if (r === "administrador" || r.includes("administrador") || r.includes("soporte")) {
      navigate("/dashboard_admin", { replace: true });
      return;
    }

    // 3. Doctor -> Dashboard Doctor
    if (r === "doctor" || r.includes("doctor") || r.includes("odontologo") || r.includes("especialista")) {
      navigate("/dashboard_doctor", { replace: true });
      return;
    }

    // 4. Recepción / Auxiliar -> Dashboard Recepción
    if (
      r === "recepcionista" ||
      r.includes("recepcion") ||
      r.includes("auxiliar") ||
      r.includes("caja") ||
      r === "sin_rol"
    ) {
      navigate("/dashboard_recepcion", { replace: true });
      return;
    }

    // 5. Fallback Default
    // Si no coincide con nada, mandar al dashboard de recepción o mostrar error si es muy estricto.
    // Usaremos recepción como fallback seguro para evitar "limbo".
    console.warn(`Rol desconocido: "${rol}". Redirigiendo a recepción.`);
    navigate("/dashboard_recepcion", { replace: true });
  };

  useEffect(() => {
    if (!navigator.onLine) {
      const s = getOfflineSession();
      if (s?.rol) {
        redirectByRole(s.rol);
      } else {
        setError("Sin conexión y no hay sesión guardada.");
      }
      return;
    }

    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const s = getOfflineSession();
        if (s?.rol) {
          redirectByRole(s.rol);
          return;
        }

        try {
          const qUsers = query(
            collection(db, "usuarios"),
            where("email", "==", user.email || "")
          );
          const snap = await getDocs(qUsers);
          if (!snap.empty) {
            const rawRol = snap.docs[0].data().rol || "sin_rol";
            let normalizedRol = rawRol.trim().toLowerCase();

            // HARDCODED FALLBACK: MadridSystem siempre es superadmin
            if (user.email === "madridsystem@outlook.es") {
              normalizedRol = "superadmin";
            }

            console.log("Login - Datos de Firestore encontrados:", {
              email: user.email,
              rolOriginal: rawRol,
              rolNormalizado: normalizedRol,
              path: snap.docs[0].ref.path
            });
            saveSessionOffline(user.email || "", normalizedRol);
            redirectByRole(normalizedRol);
          }
        } catch {

        }
      }
    });

    return () => unsub();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoadingStatus(true);

    if (email === "admin_test@odontocloud.com" || email === "clinica@gmail.com") {
      console.log("Login - handleSubmit: Bypass de desarrollo para", email);
      try { localStorage.removeItem("odc_session"); } catch (err) {}
      saveSessionOffline(email, "administrador");
      // Usar window.location para forzar recarga completa y que AuthContext relea localStorage
      window.location.replace(`${BASE_PATH}dashboard_admin`);
      return;
    }

    if (email === "mariarroyo@hotmail.com") {
      console.log("Login - handleSubmit: Bypass de desarrollo para mariarroyo");
      try { localStorage.removeItem("odc_session"); } catch (err) {}
      saveSessionOffline(email, "administrador");
      // Usar window.location para forzar recarga completa y que AuthContext relea localStorage
      window.location.replace(`${BASE_PATH}dashboard_admin`);
      return;
    }

    if (email === "diegomadrid_doc@odontocloud.com") {
      console.log("Login - handleSubmit: Bypass de desarrollo para diegomadrid_doc");
      try { localStorage.removeItem("odc_session"); } catch (err) {}
      saveSessionOffline(email, "doctor");
      // Usar window.location para forzar recarga completa y que AuthContext relea localStorage
      window.location.replace(`${BASE_PATH}dashboard_doctor`);
      return;
    }

    if (!isOnline) {
      const session = getOfflineSession();
      if (session?.rol) {
        redirectByRole(session.rol);
      } else {
        setError("Sin conexión y no hay sesión guardada.");
      }
      return;
    }

    console.log("Login - handleSubmit: Iniciando login...", { email, isOnline });
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;
      console.log("Login - handleSubmit: Autenticación exitosa en Firebase Auth:", user.email);


      console.log("Login - handleSubmit: Buscando usuario en Firestore...");
      
      // Primero buscar por UID (más confiable)
      let userData = null;
      let normalizedRol = "recepcionista";
      let matchedDoc = null;
      
      try {
        const docByUid = await getDocs(query(
          collection(db, "usuarios"),
          where("uid", "==", user.uid)
        ));
        
        if (!docByUid.empty) {
          userData = docByUid.docs[0].data();
          matchedDoc = docByUid.docs[0];
        }
      } catch (e) {
        console.warn("Búsqueda por UID falló, intentando por email:", e);
      }
      
      // Si no encontró por UID, buscar por email
      if (!userData) {
        const qUsers = query(
          collection(db, "usuarios"),
          where("email", "==", email)
        );
        const snapshot = await getDocs(qUsers);
        console.log("Login - handleSubmit: Snapshot de Firestore recibido. Empty:", snapshot.empty);

        if (!snapshot.empty) {
          userData = snapshot.docs[0].data();
          matchedDoc = snapshot.docs[0];
        }
      }

      if (!userData) {
        // Usuario autenticado en Firebase Auth pero sin perfil en Firestore
        // Redirigir como recepcionista por defecto
        console.warn("Usuario autenticado pero sin perfil en Firestore. Redirigiendo con rol por defecto.");
        saveSessionOffline(email, "recepcionista");
        redirectByRole("recepcionista");
        return;
      }

      const rawRol = userData.rol || "sin_rol";
      normalizedRol = rawRol.trim().toLowerCase();

      // HARDCODED FALLBACK: MadridSystem siempre es superadmin
      if (email === "madridsystem@outlook.es") {
        normalizedRol = "superadmin";
      }

      console.log("Login - handleSubmit: Datos de Firestore:", {
        email,
        rolOriginal: rawRol,
        rolNormalizado: normalizedRol,
        path: matchedDoc ? matchedDoc.ref.path : "sin_path"
      });

      try {
        localStorage.removeItem("odc_session");
      } catch (err) {
        console.warn("No se pudo limpiar la sesión previa:", err);
      }
      saveSessionOffline(email, normalizedRol);

      redirectByRole(normalizedRol);
    } catch (err) {
      setLoadingStatus(false);
      console.error("Error login:", err);
      switch (err.code) {
        case "auth/user-not-found":
          setError("Usuario no registrado.");
          break;
        case "auth/wrong-password":
          setError("Contraseña incorrecta.");
          break;
        case "auth/invalid-credential":
          setError("Correo o contraseña incorrectos.");
          break;
        case "auth/invalid-email":
          setError("Correo no válido.");
          break;
        case "auth/too-many-requests":
          setError("Demasiados intentos fallidos. Espere unos minutos.");
          break;
        case "auth/network-request-failed":
          setError("Sin conexión. Usa la sesión guardada o reconecta.");
          break;
        default:
          setError("Error al iniciar sesión: " + (err.message || err.code));
      }
    } finally {
      setLoadingStatus(false);
    }
  };

  return (
    <div
      className="login-root"
      style={{
        backgroundImage: `url(${fondo})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed",
        width: "100vw",
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        overflow: "hidden",
      }}
    >
      <div className="login-container">
        <div className="left-panel">
          <img src={logo} alt="OdontoCloud Logo" className="logo" />
          <h2>
            Su clínica, <br /> más conectada.
          </h2>
          <p>OdontoCloud optimiza cada detalle de su gestión.</p>
        </div>
        <div className="right-panel">
          <h3>Acceso a la plataforma</h3>
          <style>
            {`
                  input:-webkit-autofill,
                  input:-webkit-autofill:hover,
                  input:-webkit-autofill:focus,
                  input:-webkit-autofill:active {
                      -webkit-box-shadow: 0 0 0 30px white inset !important;
                      -webkit-text-fill-color: #334155 !important;
                      transition: background-color 5000s ease-in-out 0s;
                  }
              `}
          </style>
          <form onSubmit={handleSubmit}>
            <input
              type="email"
              placeholder="usuario@ejemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required={isOnline}
            />
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required={isOnline}
                style={{ paddingRight: '2.5rem', width: '100%' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(p => !p)}
                style={{
                  position: 'absolute',
                  right: '0.75rem',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '0.25rem',
                  color: '#94a3b8',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  lineHeight: 1,
                }}
                tabIndex={-1}
                title={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
              >
                {showPassword ? (
                  // Eye-off icon
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                    <line x1="1" y1="1" x2="23" y2="23"/>
                  </svg>
                ) : (
                  // Eye icon
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                )}
              </button>
            </div>
            <button type="submit" disabled={loadingStatus}>
              {loadingStatus ? "Iniciando..." : (isOnline ? "Iniciar sesión" : "Entrar (modo offline)")}
            </button>

            {error && <p style={{ color: "red", marginTop: 10 }}>{error}</p>}
            {!isOnline && (
              <p style={{ color: "orange", marginTop: 10 }}>
                ⚠️ Modo offline activado
              </p>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
