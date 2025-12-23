// ===============================
// 📄 Login.jsx - Acceso híbrido OdontoCloud
// ===============================
import React, { useState, useEffect } from "react";
import { auth, db } from "../firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { collection, getDocs, query, where } from "firebase/firestore";
import "../styles/login.css";
import fondo from "/assets/fondo.png";
import logo from "/assets/logo.png";

// Guarda sesión local para modo offline
const saveSessionOffline = (email, rol) => {
  const sessionData = { email, rol, timestamp: Date.now() };
  localStorage.setItem("odc_session", JSON.stringify(sessionData));
};

// Recupera sesión local si no hay internet
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

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Detecta cambio de conexión
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
    switch (rol.toLowerCase()) {
      case "administrador":
        window.location.href = "/dashboard_admin";
        break;
      case "doctor":
        window.location.href = "/dashboard_doctor";
        break;
      case "recepcionista":
        window.location.href = "/dashboard_recepcion";
        break;
      default:
        setError("Rol no reconocido. Contacte al administrador.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!isOnline) {
      // Modo offline: usar sesión guardada
      const session = getOfflineSession();
      if (session) {
        redirectByRole(session.rol);
      } else {
        setError("Sin conexión y no hay sesión guardada.");
      }
      return;
    }

    // Modo online
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Consulta rol en Firestore
      const q = query(collection(db, "users"), where("correo", "==", email));
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        setError("Usuario no encontrado en la base de datos.");
        return;
      }

      const userData = snapshot.docs[0].data();
      const rol = userData.rol || "sin_rol";

      // Guarda sesión local para modo offline
      saveSessionOffline(email, rol);

      // Redirige según rol
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
            <input
              type="email"
              placeholder="usuario@ejemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button type="submit">Iniciar sesión</button>
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
