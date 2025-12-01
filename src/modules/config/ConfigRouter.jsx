// ===============================
// ⚙️ ConfigRouter.jsx
// (redirect por defecto + Lista de precios + Editar + Subruta Productos)
// ===============================
import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import EmpresaDatosBasicos from "./EmpresaDatosBasicos";
import EmpresaLogo from "./EmpresaLogo";
import ListaPrecios from "./ListaPrecios";
import ListaPreciosEditar from "./ListaPreciosEditar";
import ListaPreciosProductos from "./ListaPreciosProductos"; // ⬅️ para la subruta /productos

// Mapa de pantallas disponibles (primer nivel /config/:slug)
const SCREENS = {
  "datos-basicos": EmpresaDatosBasicos,
  "logo": EmpresaLogo,
  "lista-de-precios": ListaPrecios,
};

// Extrae TODOS los segmentos que siguen a /config/ (p.ej. ["lista-de-precios","editar","abc123"])
function getConfigSegs(pathname = "") {
  const idx = pathname.toLowerCase().indexOf("/config/");
  if (idx === -1) return [];
  const rest = pathname.slice(idx + "/config/".length);
  return rest.split("/").filter(Boolean);
}

// Obtiene el prefijo /dashboard_xxx de la ruta actual
function getDashBase(pathname = "") {
  const segs = pathname.split("/").filter(Boolean);
  const i = segs.findIndex((s) => s.startsWith("dashboard_"));
  return i >= 0 ? `/${segs.slice(0, i + 1).join("/")}` : "";
}

function LeftMenu({ current, onNav }) {
  const items = [
    { slug: "datos-basicos", label: "Datos básicos" },
    { slug: "logo", label: "Logo" },
    { slug: "lista-de-precios", label: "Lista de precios" }, // 👈 único ítem
    { slug: "consecutivos", label: "Consecutivos", soon: true },
    { slug: "sucursales", label: "Sucursales", soon: true },
    { slug: "metodos-de-pago", label: "Métodos de pago", soon: true },
    { slug: "especialidades", label: "Especialidades", soon: true },
    { slug: "usuarios", label: "Usuarios", soon: true },
    { slug: "condiciones-de-pago", label: "Condiciones de pago", soon: true },
    { slug: "plantillas-doc-clinicos", label: "Plantillas Doc. Clínicos", soon: true },
    { slug: "impuestos", label: "Impuestos", soon: true },
  ];

  return (
    <aside
      style={{
        width: 300, flex: "0 0 300px", background: "#fff",
        border: "1px solid #e5e7eb", borderRadius: 12, padding: 12,
        position: "sticky", top: 12, alignSelf: "flex-start",
        maxHeight: "calc(100vh - 24px)", overflow: "auto",
      }}
      aria-label="Información general"
    >
      <h4 style={{ margin: "4px 0 10px", color: "#64748b" }}>Información general</h4>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {items.map((it) => {
          const active = it.slug === current;
          return (
            <button
              key={it.slug}
              type="button"
              onClick={() => !it.soon && onNav(it.slug)}
              title={it.soon ? "Próximamente" : it.label}
              style={{
                textAlign: "left",
                padding: "10px 12px",
                borderRadius: 10,
                border: "1px solid " + (active ? "#60a5fa" : "#e5e7eb"),
                background: active ? "#eff6ff" : "#f9fafb",
                fontWeight: 600,
                cursor: it.soon ? "not-allowed" : "pointer",
                color: it.soon ? "#94a3b8" : "#0f172a",
              }}
            >
              {it.label} {it.soon ? " · próximamente" : ""}
            </button>
          );
        })}
      </div>
    </aside>
  );
}

function RightPlaceholder() {
  return (
    <div
      className="card"
      style={{
        background: "#fff", border: "1px solid #e5e7eb",
        borderRadius: 12, padding: 16,
      }}
    >
      <h3 style={{ marginTop: 0 }}>Configuración</h3>
      <p className="oc-muted" style={{ margin: 0 }}>
        Selecciona una sección del menú de la izquierda para empezar (por ejemplo, <b>Datos básicos</b>).
      </p>
    </div>
  );
}

export default function ConfigRouter() {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const segs = getConfigSegs(pathname); // p.ej. ["lista-de-precios","productos"] o ["lista-de-precios","editar",":id"]
  const slug = segs[0] || "";           // primer nivel
  const sub  = segs[1] || "";           // segundo nivel
  const base = getDashBase(pathname);

  // Subrutas de "lista-de-precios"
  const isListaPreciosRoot      = slug === "lista-de-precios" && !sub;
  const isListaPreciosProductos = slug === "lista-de-precios" && sub === "productos";
  const isListaPreciosEditar    = slug === "lista-de-precios" && sub === "editar";

  // Elegimos qué pantalla renderizar:
  let Screen = SCREENS[slug] || RightPlaceholder;
  if (isListaPreciosEditar) {
    Screen = ListaPreciosEditar;          // /config/lista-de-precios/editar/:id
  } else if (isListaPreciosProductos) {
    Screen = ListaPreciosProductos;       // /config/lista-de-precios/productos
  } else if (isListaPreciosRoot) {
    Screen = ListaPrecios;                // /config/lista-de-precios (clínicos)
  }

  const go = (s) => navigate(`${base}/config/${s}`);

  // Redirect /config → /config/datos-basicos
  useEffect(() => {
    if (!slug) {
      navigate(`${base}/config/datos-basicos`, { replace: true });
    }
  }, [slug, base, navigate]);

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "300px 1fr",
        gap: 16,
        background: "#f8fafc",
        padding: 16,
        borderRadius: 12,
      }}
    >
      {/* el menú izquierdo NO cambia */}
      <LeftMenu current={slug} onNav={go} />

      <div
        style={{
          minWidth: 0,
          background: "#fff",
          border: "1px solid #e5e7eb",
          borderRadius: 12,
          padding: 16,
        }}
      >
        {!slug ? <RightPlaceholder /> : <Screen />}
      </div>
    </div>
  );
}
