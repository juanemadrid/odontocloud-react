// ===============================
// ⚙️ ConfigRouter.jsx
// (redirect por defecto + Lista de precios + Editar + Subruta Productos)
// Orden del menú igual a OralDrive
// HABILITADOS: Planes, Consecutivos, Sucursales, Especialidades, Consultorios, Profesionales
// ===============================
import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import EmpresaDatosBasicos from "./EmpresaDatosBasicos";
import EmpresaLogo from "./EmpresaLogo";
import ListaPrecios from "./ListaPrecios";
import ListaPreciosEditar from "./ListaPreciosEditar";
import ListaPreciosProductos from "./ListaPreciosProductos";
import ImportarProcedimientos from "./ImportarProcedimientos";

// Pantallas habilitadas en tu app
import Planes from "./Planes";               // ✅ NUEVO
import Consecutivos from "./Consecutivos";
import Sucursales from "./Sucursales";
import Especialidades from "./Especialidades";
import Consultorios from "./Consultorios";
import Profesionales from "./Profesionales";

// Mapa de pantallas disponibles (primer nivel /config/:slug)
const SCREENS = {
  "datos-basicos": EmpresaDatosBasicos,
  "logo": EmpresaLogo,
  "lista-de-precios": ListaPrecios,

  // habilitadas
  "planes": Planes,                // ✅ NUEVO
  "consecutivos": Consecutivos,
  "almacenes": undefined,          // (placeholder: próximamente)
  "categorias-inventario": undefined,
  "sucursales": Sucursales,
  "metodos-de-pago": undefined,
  "bancos": undefined,
  "formulario-de-pacientes": undefined,
  "especialidades": Especialidades,
  "perfiles": undefined,
  "usuarios": undefined,
  "condiciones-de-pago": undefined,
  "parametros": undefined,
  "recursos-fisicos": undefined,
  "plantillas-doc-clinicos": undefined,
  "pestanas-consulta-med": undefined,
  "cargos": undefined,
  "impuestos": undefined,
  "catalogo-de-cuentas": undefined,
  "suscripcion": undefined,

  // Extras propios de OdontoCloud (habilitados)
  "consultorios": Consultorios,
  "profesionales": Profesionales,

  // Ruta oculta (no está en menú)
  "importar-procedimientos": ImportarProcedimientos,
};

// Extrae los segmentos que siguen a /config/
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
  // Orden calcado de tu captura de OralDrive:
  const items = [
    { slug: "datos-basicos", label: "Datos básicos" },
    { slug: "logo", label: "Logo" },
    { slug: "lista-de-precios", label: "Lista de precios" },
    { slug: "planes", label: "Planes" }, // ✅ habilitado
    { slug: "consecutivos", label: "Consecutivos" }, // ✅ habilitado
    { slug: "almacenes", label: "Almacenes", soon: true },
    { slug: "categorias-inventario", label: "Categorías inventario", soon: true },
    { slug: "sucursales", label: "Sucursales" }, // ✅ habilitado
    { slug: "metodos-de-pago", label: "Métodos de pago", soon: true },
    { slug: "bancos", label: "Bancos", soon: true },
    { slug: "formulario-de-pacientes", label: "Formulario de pacientes", soon: true },
    { slug: "especialidades", label: "Especialidades" }, // ✅ habilitado
    { slug: "perfiles", label: "Perfiles", soon: true },
    { slug: "usuarios", label: "Usuarios", soon: true },
    { slug: "condiciones-de-pago", label: "Condiciones de pago", soon: true },
    { slug: "parametros", label: "Parámetros", soon: true },
    { slug: "recursos-fisicos", label: "Recursos físicos", soon: true },
    { slug: "plantillas-doc-clinicos", label: "Plantillas Doc. Clínicos", soon: true },
    { slug: "pestanas-consulta-med", label: "Pestañas Consulta Med.", soon: true },
    { slug: "cargos", label: "Cargos", soon: true },
    { slug: "impuestos", label: "Impuestos", soon: true },
    { slug: "catalogo-de-cuentas", label: "Catálogo de cuentas", soon: true },
    { slug: "suscripcion", label: "Suscripción", soon: true },

    // 🔽 Extras propios de OdontoCloud (habilitados y fuera del set de OralDrive)
    { slug: "consultorios", label: "Consultorios" },  // ✅ habilitado
    { slug: "profesionales", label: "Profesionales" },// ✅ habilitado
  ];

  return (
    <aside
      style={{
        width: 300,
        flex: "0 0 300px",
        background: "#fff",
        border: "1px solid #e5e7eb",
        borderRadius: 12,
        padding: 12,
        position: "sticky",
        top: 12,
        alignSelf: "flex-start",
        maxHeight: "calc(100vh - 24px)",
        overflow: "auto",
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
        background: "#fff",
        border: "1px solid #e5e7eb",
        borderRadius: 12,
        padding: 16,
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

  const segs = getConfigSegs(pathname); // p.ej. ["lista-de-precios","productos"] o ["lista-de-precios","editar","abc123"]
  const slug = segs[0] || ""; // primer nivel
  const sub = segs[1] || ""; // segundo nivel
  const base = getDashBase(pathname);

  // Subrutas de "lista-de-precios"
  const isListaPreciosRoot = slug === "lista-de-precios" && !sub;
  const isListaPreciosProductos = slug === "lista-de-precios" && sub === "productos";
  const isListaPreciosEditar = slug === "lista-de-precios" && sub === "editar";

  // ✅ Subrutas de "planes"
  const isPlanesRoot = slug === "planes" && !sub;
  const isPlanesNuevo = slug === "planes" && sub === "nuevo";
  const isPlanesEditar = slug === "planes" && sub === "editar";

  // Elegimos qué pantalla renderizar:
  let Screen = SCREENS[slug] || RightPlaceholder;
  let screenProps = {};

  // ----- Lógica Lista de Precios -----
  if (isListaPreciosEditar) {
    const listaId = segs[2] || null; // /config/lista-de-precios/editar/:id
    Screen = ListaPreciosEditar;
    screenProps = { listaId, key: `lpedit-${listaId || "none"}` };
  } else if (isListaPreciosProductos) {
    Screen = ListaPreciosProductos; // /config/lista-de-precios/productos
  } else if (isListaPreciosRoot) {
    Screen = ListaPrecios; // /config/lista-de-precios (clínicos)
  }

  // ----- ✅ Lógica Planes -----
  if (slug === "planes") {
    if (isPlanesNuevo) {
      Screen = Planes;
      screenProps = { mode: "new" };
    } else if (isPlanesEditar) {
      const planId = segs[2] || null; // /config/planes/editar/:id
      Screen = Planes;
      screenProps = { mode: "edit", planId, key: `pl-edit-${planId || "none"}` };
    } else if (isPlanesRoot) {
      Screen = Planes;
      screenProps = { mode: "list" };
    }
  }

  const go = (s) => navigate(`${base}/config/${s}`);

  // Redirect /config → /config/datos-basicos SOLO si estamos parados en /config
  useEffect(() => {
    const lower = pathname.toLowerCase();
    const isConfigRoot = lower.endsWith("/config") || lower.endsWith("/config/");
    if (isConfigRoot && !slug) {
      navigate(`${base}/config/datos-basicos`, { replace: true });
    }
  }, [pathname, slug, base, navigate]);

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
        {!slug ? <RightPlaceholder /> : <Screen {...screenProps} />}
      </div>
    </div>
  );
}
