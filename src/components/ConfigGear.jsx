// ===============================
// ⚙️ ConfigGear.jsx
// Tuerca que abre directamente /config/datos-basicos
// ===============================
import React from "react";
import { useNavigate } from "react-router-dom";

export default function ConfigGear({ basePath = "", className = "" }) {
  const navigate = useNavigate();

  const go = () => {
    const cleanBase = String(basePath || "").replace(/\/+$/g, "");
    navigate(`${cleanBase}/config/datos-basicos`, { replace: false });
  };

  return (
    <button
      type="button"
      className={`oc-icon-btn ${className}`}
      title="Configuración"
      aria-label="Abrir configuración"
      onClick={go}
    >
      ⚙️
    </button>
  );
}
