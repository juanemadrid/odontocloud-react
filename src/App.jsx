// ===============================
// 🚀 App.jsx - Enrutador Principal OdontoCloud
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

// 🔐 Componente para proteger rutas según rol
function RequireRole({ allowedRoles, children }) {
  const session = getOfflineSession();

  if (!session) return <Navigate to="/" replace />;

  const rol = session.rol?.toLowerCase();
  if (!allowedRoles.map((r) => r.toLowerCase()).includes(rol)) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default function App() {
  return (
    <Routes>
      {/* LOGIN */}
      <Route path="/" element={<Login />} />

      {/* ADMIN */}
      <Route
        path="/dashboard_admin"
        element={
          <RequireRole allowedRoles={["administrador"]}>
            <Dashboard />
          </RequireRole>
        }
      />

      {/* DOCTOR */}
      <Route
        path="/dashboard_doctor"
        element={
          <RequireRole allowedRoles={["doctor"]}>
            <Dashboard />
          </RequireRole>
        }
      />

      {/* RECEPCIONISTA */}
      <Route
        path="/dashboard_recepcion"
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
