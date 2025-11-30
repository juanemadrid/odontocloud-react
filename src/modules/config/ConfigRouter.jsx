// ===============================
// ⚙️ ConfigRouter.jsx
// Enrutador interno para pantallas de Configuración
// (sin subcarpetas; importa componentes vecinos)
// ===============================
import React from "react";
import { useLocation } from "react-router-dom";

// 👉 IMPORTA TUS PANTALLAS DE CONFIG (SIN subcarpeta)
import EmpresaDatosBasicos from "./EmpresaDatosBasicos";
import EmpresaLogo from "./EmpresaLogo"; // ⬅️ nuevo

// Mapa slug -> componente
const SCREENS = {
  "datos-basicos": EmpresaDatosBasicos,
  "logo": EmpresaLogo, // ⬅️ nuevo
  // "lista-de-precios": ListaPrecios,
};

// Extrae el slug que sigue a /config/
function getConfigSlug(pathname = "") {
  const idx = pathname.toLowerCase().indexOf("/config/");
  if (idx === -1) return "";
  const rest = pathname.slice(idx + "/config/".length);
  return rest.split("/").filter(Boolean)[0] || "";
}

// Placeholder para pantallas aún no implementadas
function NotImplemented({ title = "Datos básicos" }) {
  return (
    <div className="oc-main-content">
      <div className="oc-section-title">
        <h2>Configuración · {title}</h2>
      </div>

      <div className="card">
        <h3>{title}</h3>
        <p className="oc-muted" style={{ textAlign: "center", padding: "12px 6px" }}>
          Esta pantalla aún no está implementada.
        </p>
      </div>
    </div>
  );
}

export default function ConfigRouter() {
  const { pathname } = useLocation();
  const slug = getConfigSlug(pathname);
  const Screen = SCREENS[slug];

  // ✅ Si no hay slug, por defecto carga Datos básicos
  if (!slug) return <EmpresaDatosBasicos />;

  // ✅ Si hay slug pero no existe en el mapa, muestra placeholder bonito
  if (!Screen) {
    const title = slug
      .split("-")
      .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
      .join(" ");
    return <NotImplemented title={title} />;
  }

  return <Screen />;
}
