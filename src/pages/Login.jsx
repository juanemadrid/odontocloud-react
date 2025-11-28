// ===============================
// 📄 Login.jsx - Acceso híbrido OdontoCloud (PWA + Offline)
// ===============================
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase"; // deja tu ruta como la tienes
import {
  signInWithEmailAndPassword,
  onAuthStateChanged,
} from "firebase/auth";
import { collection, getDocs, query, where } from "firebase/firestore";
import "../styles/login.css";
import fondo from "/assets/fondo.png";
import logo from "/assets/logo.png";

// ------------------------------
// 🔒 Sesión offline (simple con localStorage)
// ------------------------------
const saveSessionOffline = (email, rol) => {
  const sessionData = { email, rol, timestamp: Date.now() };
  localStorage.setItem("odc_session", JSON.stringify(sessionData));
};

const getOfflineSession = () => {
  try {
    const data = JSON.parse(localStorage.getItem("odc_session"));
    // válido 24h (ajusta si quieres más)
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
  const [error, setError] = useState("");
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // 🌐 Detecta cambios de conexión
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

  // 🚦 Redirección por rol
  const redirectByRole = (rol) => {
    const r = (rol || "").toLowerCase();
    if (r === "administrador") {
      navigate("/dashboard_admin", { replace: true });
    } else if (r === "doctor") {
      navigate("/dashboard_doctor", { replace: true });
    } else if (r === "recepcionista") {
      navigate("/dashboard_recepcion", { replace: true });
    } else {
      setError("Rol no reconocido. Contacte al administrador.");
    }
  };

  // 🟢 Al montar: si hay sesión en Firebase o en local, redirige sin pedir login
  useEffect(() => {
    // 1) Si estás OFFLINE y ya hay sesión en local → entrar directo
    if (!navigator.onLine) {
      const s = getOfflineSession();
      if (s?.rol) {
        redirectByRole(s.rol);
      } else {
        setError("Sin conexión y no hay sesión guardada.");
      }
      return;
    }

    // 2) Si estás ONLINE y Firebase ya tiene usuario activo → tomar rol y entrar
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // intenta usar el rol guardado
        const s = getOfflineSession();
        if (s?.rol) {
          redirectByRole(s.rol);
          return;
        }
        // si no hay rol guardado, buscarlo en Firestore (estás online)
        try {
          const qUsers = query(
            collection(db, "users"),
            where("correo", "==", user.email || "")
          );
          const snap = await getDocs(qUsers);
          if (!snap.empty) {
            const rol = snap.docs[0].data().rol || "sin_rol";
            saveSessionOffline(user.email || "", rol);
            redirectByRole(rol);
          }
        } catch {
          // si falla, al menos no bloquees al usuario
          redirectByRole("administrador"); // ajusta si tienes ruta por defecto
        }
      }
    });

    return () => unsub();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 🔐 Submit (solo intenta red si estás online)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // OFFLINE → usar sesión guardada, sin tocar red
    if (!isOnline) {
      const session = getOfflineSession();
      if (session?.rol) {
        redirectByRole(session.rol);
      } else {
        setError("Sin conexión y no hay sesión guardada.");
      }
      return;
    }

    // ONLINE → login normal
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // Obtener rol en Firestore
      const qUsers = query(
        collection(db, "users"),
        where("correo", "==", email)
      );
      const snapshot = await getDocs(qUsers);

      if (snapshot.empty) {
        setError("Usuario no encontrado en la base de datos.");
        return;
      }

      const userData = snapshot.docs[0].data();
      const rol = userData.rol || "sin_rol";

      // Guardar para próximas veces OFFLINE
      saveSessionOffline(email, rol);

      // Entrar por rol
      redirectByRole(rol);
    } catch (err) {
      console.error("Error login:", err);
      switch (err.code) {
        case "auth/user-not-found":
          setError("Usuario no registrado.");
          break;
        case "auth/wrong-password":
          setError("Contraseña incorrecta.");
          break;
        case "auth/invalid-email":
          setError("Correo no válido.");
          break;
        case "auth/network-request-failed":
          setError("Sin conexión. Usa la sesión guardada o reconecta.");
          break;
        default:
          setError("Error al iniciar sesión.");
      }
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
      <div className="container">
        <div className="left-panel">
          <img src={logo} alt="OdontoCloud Logo" className="logo" />
          <h2>
            Su clínica, <br /> más conectada.
          </h2>
          <p>OdontoCloud optimiza cada detalle de su gestión.</p>
        </div>
        <div className="right-panel">
          <h3>Acceso a la plataforma</h3>
          <form onSubmit={handleSubmit}>
            {/* Cuando estás offline y ya hay sesión, estos campos son irrelevantes */}
            <input
              type="email"
              placeholder="usuario@ejemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required={isOnline} // evita bloquear cuando estás offline
            />
            <input
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required={isOnline}
            />
            <button type="submit">
              {isOnline ? "Iniciar sesión" : "Entrar (modo offline)"}
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
