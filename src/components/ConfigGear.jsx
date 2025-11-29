import React, { useMemo, useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

const SECTIONS = [
  "Datos básicos","Logo","Lista de precios","Planes","Consecutivos","Almacenes",
  "Categorías inventario","Sucursales","Métodos de pago","Bancos","Formulario de pacientes",
  "Especialidades","Perfiles","Usuarios","Condiciones de pago","Parámetros","Recursos físicos",
  "Plantillas Doc. Clínicos","Pestañas Consulta Med.","Cargos","Impuestos","Catálogo de cuentas","Suscripción",
];

function slugify(label) {
  return label
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/\./g, "")
    .replace(/\s+/g, "-");
}

export default function ConfigGear({ className = "", basePath = "" }) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [filter, setFilter] = useState("");
  const navigate = useNavigate();
  const inputRef = useRef(null);

  const filtered = useMemo(() => {
    const f = filter.trim().toLowerCase();
    if (!f) return SECTIONS;
    return SECTIONS.filter((s) => s.toLowerCase().includes(f));
  }, [filter]);

  // ancho responsivo (mobile full, desktop drawer)
  const panelWidth = () => {
    const vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
    if (vw < 640) return vw;           // móvil: full width
    if (vw < 1024) return 400;         // tablet
    return 420;                        // desktop
  };

  const openDrawer = () => {
    setOpen(true);
    requestAnimationFrame(() => {
      setMounted(true);
      setTimeout(() => inputRef.current?.focus(), 50);
    });
  };

  const closeDrawer = () => {
    setMounted(false);
    setTimeout(() => setOpen(false), 200);
  };

  const go = (label) => {
    const slug = slugify(label);
    const prefix = basePath ? `${basePath}` : "";
    navigate(`${prefix}/config/${slug}`, { state: { title: label } });
    closeDrawer();
  };

  // Escape para cerrar
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && closeDrawer();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  // ícono genérico para los ítems
  const ItemIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M4 7h16M4 12h16M4 17h10" stroke="#64748b" strokeWidth="1.7" strokeLinecap="round"/>
    </svg>
  );

  return (
    <>
      {/* Botón engranaje */}
      <button
        title="Configuración"
        onClick={openDrawer}
        className={`oc-icon-btn ${className}`}
        aria-label="Abrir configuración"
        type="button"
      >
        ⚙️
      </button>

      {/* Overlay + Drawer izquierdo PRO */}
      {open && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 5000,
            background: "rgba(2,6,23,0.35)",
            backdropFilter: "blur(2px)",
            opacity: mounted ? 1 : 0,
            transition: "opacity .2s ease",
          }}
          onClick={closeDrawer}
        >
          <aside
            role="dialog"
            aria-modal="true"
            aria-label="Configuración"
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              height: "100%",
              width: panelWidth() + "px",
              background: "#ffffff",
              borderRight: "1px solid #e5e7eb",
              boxShadow: "0 20px 40px rgba(2,6,23,.18)",
              display: "flex",
              flexDirection: "column",
              transform: mounted ? "translateX(0%)" : "translateX(-100%)",
              transition: "transform .2s ease",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header fijo */}
            <div
              style={{
                position: "sticky",
                top: 0,
                zIndex: 1,
                background: "#ffffffcc",
                backdropFilter: "saturate(160%) blur(3px)",
                borderBottom: "1px solid #e5e7eb",
              }}
            >
              <div style={{ padding: "12px 16px", display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontWeight: 800, color: "#0f172a" }}>Información general</span>
                <span style={{ marginLeft: "auto" }} />
                <button
                  onClick={closeDrawer}
                  style={{
                    fontSize: "0.8rem",
                    background: "#f3f4f6",
                    border: "1px solid #e5e7eb",
                    borderRadius: 8,
                    padding: "6px 12px",
                    cursor: "pointer",
                    color: "#0f172a",
                    fontWeight: 600,
                  }}
                >
                  Cerrar
                </button>
              </div>

              <div style={{ padding: "0 16px 12px 16px" }}>
                <input
                  ref={inputRef}
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  placeholder="Buscar sección…"
                  style={{
                    width: "100%",
                    border: "1px solid #d1d5db",
                    borderRadius: 10,
                    padding: "10px 12px",
                    fontSize: ".95rem",
                    outline: "none",
                    color: "#0f172a",
                    background: "#fff",
                  }}
                />
                <div style={{ fontSize: ".8rem", color: "#64748b", marginTop: 6 }}>
                  Filtra por nombre y haz clic para abrir la pantalla de configuración.
                </div>
              </div>
            </div>

            {/* Lista con scrollbar fino */}
            <nav
              style={{
                padding: "10px 12px 14px",
                overflowY: "auto",
                height: "100%",
              }}
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr",
                  gap: 8,
                }}
              >
                {filtered.map((label) => (
                  <button
                    key={label}
                    onClick={() => go(label)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      width: "100%",
                      textAlign: "left",
                      padding: "12px 12px",
                      borderRadius: 12,
                      border: "1px solid #e5e7eb",
                      background: "#ffffff",
                      cursor: "pointer",
                      fontSize: "0.95rem",
                      fontWeight: 700,
                      color: "#0f172a",
                      boxShadow: "0 1px 0 rgba(2,6,23,.04)",
                      transition: "background .12s ease, border-color .12s ease, transform .06s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "#f9fafb";
                      e.currentTarget.style.borderColor = "#dbe2ea";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "#ffffff";
                      e.currentTarget.style.borderColor = "#e5e7eb";
                    }}
                    onMouseDown={(e) => (e.currentTarget.style.transform = "scale(.995)")}
                    onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
                  >
                    <span style={{ width: 22, display: "inline-flex", justifyContent: "center" }}>
                      <ItemIcon />
                    </span>
                    <span style={{ flex: 1 }}>{label}</span>
                    <span
                      aria-hidden
                      style={{
                        fontSize: 12,
                        color: "#94a3b8",
                        fontWeight: 700,
                      }}
                    >
                      →
                    </span>
                  </button>
                ))}
              </div>

              {filtered.length === 0 && (
                <div
                  style={{
                    fontSize: ".9rem",
                    color: "#94a3b8",
                    padding: 12,
                    textAlign: "center",
                  }}
                >
                  Sin resultados
                </div>
              )}
            </nav>

            {/* Footer sutil */}
            <div
              style={{
                padding: "10px 14px",
                borderTop: "1px solid #e5e7eb",
                fontSize: ".8rem",
                color: "#94a3b8",
              }}
            >
              OdontoCloud · Preferencias del sistema
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
