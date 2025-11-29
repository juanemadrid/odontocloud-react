// ===============================
// 🚀 App.jsx - Enrutador Principal OdontoCloud (fix subrutas)
// ===============================
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";

// Recuperar sesión offline del Login.jsx
const getOfflineSession = () => {
  try {
    const data = JSON.parse(localStorage.getItem("odc_session"));
    if (data && Date.now() - data.timestamp < 1000 * 60 * 60 * 24) {
      return data; // { email, rol, timestamp }
    }
    return null;
  } catch {
    return null;
  }
};

// manda al dashboard correcto según rol
const homeByRole = (rol) => {
  const r = (rol || "").toLowerCase();
  if (r === "administrador") return "/dashboard_admin";
  if (r === "doctor")        return "/dashboard_doctor";
  if (r === "recepcionista") return "/dashboard_recepcion";
  return "/";
};

// 🔐 Componente para proteger rutas según rol
function RequireRole({ allowedRoles, children }) {
  const session = getOfflineSession();

  if (!session) return <Navigate to="/" replace />;

  const rol = session.rol?.toLowerCase();
  if (!allowedRoles.map((r) => r.toLowerCase()).includes(rol)) {
    return <Navigate to={homeByRole(session.rol)} replace />;
  }

  return children;
}

export default function App() {
  const session = getOfflineSession();

  return (
    <Routes>
      {/* LOGIN */}
      <Route
        path="/"
        element={
          session
            ? <Navigate to={homeByRole(session.rol)} replace />
            : <Login />
        }
      />

      {/* ADMIN (permite subrutas con /*) */}
      <Route
        path="/dashboard_admin/*"
        element={
          <RequireRole allowedRoles={["administrador"]}>
            <Dashboard />
          </RequireRole>
        }
      />

      {/* DOCTOR */}
      <Route
        path="/dashboard_doctor/*"
        element={
          <RequireRole allowedRoles={["doctor"]}>
            <Dashboard />
          </RequireRole>
        }
      />

      {/* RECEPCIONISTA */}
      <Route
        path="/dashboard_recepcion/*"
        element={
          <RequireRole allowedRoles={["recepcionista"]}>
            <Dashboard />
          </RequireRole>
        }
      />

      {/* fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
