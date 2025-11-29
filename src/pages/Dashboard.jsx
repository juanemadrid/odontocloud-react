// ===============================
// 🦷 Dashboard.jsx - Panel principal OdontoCloud (FIX rutas absolutas)
// - Navegación sin apilar segmentos
// - MegaMenú enlaza a rutas absolutas
// - CommandSearch navega por URL
// - activeModule se sincroniza con location
// ===============================
import React, { useEffect, useMemo, useRef, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import "../styles/dashboard.css";

import Agenda from "../modules/agenda/Agenda";
import Facturacion from "../modules/facturacion/Facturacion";
import Inventario from "../modules/inventario/Inventario";
import Odontograma from "../modules/odontograma/Odontograma";
import Pacientes from "../modules/pacientes/Pacientes";
import Reportes from "../modules/reportes/Reportes";

// 👉 Caja real
import Caja from "../modules/caja/Caja";

import RecentActivity from "../components/RecentActivity";
import N8nStatus from "../components/N8nStatus";

import { auth, db } from "../firebase/firebaseConfig";
import { onAuthStateChanged, signOut } from "firebase/auth";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  getCountFromServer,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  onSnapshot,
} from "firebase/firestore";

import logo from "/assets/logo.png";

/* =============================== i18n =============================== */
const MESSAGES = {
  es: {
    nav_home: "Inicio",
    nav_agenda: "Agenda",
    nav_patients: "Pacientes",
    nav_billing: "Facturación",
    nav_inventory: "Inventario",
    nav_odontogram: "Odontograma",
    nav_reports: "Reportes",
    nav_cash: "Caja",
    nav_admin: "Administración",
    welcomeTitle: "Bienvenido a OdontoCloud",
    welcomeSubtitle:
      "Administra tus pacientes, agenda, inventario y facturación de manera inteligente y moderna.",
    clinicLabel: "Clínica",
    userLabel: "Usuario",
    roleLabel: "Rol",
    searchPlaceholder: "Buscar acciones o ir a…",
    stats_patientsToday: "Pacientes totales",
    stats_appointmentsToday: "Citas hoy",
    stats_revenueToday: "Facturación hoy",
    stats_waiting: "En espera",
    stats_currency: "COP",
    n8n_title: "Automatizaciones (n8n)",
    recent_title: "Actividad reciente",
    recent_empty: "Sin actividad registrada.",
    loading: "Cargando...",
    logout: "Cerrar sesión",
    module_coming: "Módulo próximamente.",
    todays_appts: "Citas de hoy",
    see_schedule: "Ir a Agenda",
    no_appts_today: "No hay citas programadas hoy.",
    at: "a las",
  },
  en: {
    nav_home: "Overview",
    nav_agenda: "Schedule",
    nav_patients: "Patients",
    nav_billing: "Billing",
    nav_inventory: "Inventory",
    nav_odontogram: "Odontogram",
    nav_reports: "Reports",
    nav_cash: "Cash",
    nav_admin: "Administration",
    welcomeTitle: "Welcome to OdontoCloud",
    welcomeSubtitle:
      "Manage your patients, schedule, inventory and billing in a smart and modern way.",
    clinicLabel: "Clinic",
    userLabel: "User",
    roleLabel: "Role",
    searchPlaceholder: "Search actions or go to…",
    stats_patientsToday: "Total patients",
    stats_appointmentsToday: "Appointments today",
    stats_revenueToday: "Revenue today",
    stats_waiting: "In waiting room",
    stats_currency: "COP",
    n8n_title: "Automations (n8n)",
    recent_title: "Recent activity",
    recent_empty: "No activity yet.",
    loading: "Loading...",
    logout: "Log out",
    module_coming: "Module coming soon.",
    todays_appts: "Today's appointments",
    see_schedule: "Open Schedule",
    no_appts_today: "No appointments today.",
    at: "at",
  },
};
const detectLocale = () => {
  if (typeof navigator === "undefined") return "es";
  const lang = navigator.language || navigator.userLanguage || "es";
  return lang.toLowerCase().startsWith("es") ? "es" : "en";
};

/* ================== sesión offline + fechas ================== */
const getOfflineSession = () => {
  try {
    const data = JSON.parse(localStorage.getItem("odc_session"));
    if (data && Date.now() - data.timestamp < 1000 * 60 * 60 * 24) return data;
    return null;
  } catch {
    return null;
  }
};
const useTodayRange = () =>
  useMemo(() => {
    const now = new Date();
    const startToday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      0,
      0,
      0,
      0
    );
    const endToday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + 1,
      0,
      0,
      0,
      0
    );
    return {
      startToday: Timestamp.fromDate(startToday),
      endToday: Timestamp.fromDate(endToday),
      startTodayJS: startToday,
    };
  }, []);
const toIsoDate = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
const fmtTime = (d, locale) =>
  d.toLocaleTimeString(locale === "es" ? "es-CO" : "en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
const buildDateFromParts = (iso, hhmm) => {
  try {
    const [y, m, d] = (iso || "").split("-").map((x) => parseInt(x, 10));
    const [hh = 0, mm = 0] = (hhmm || "00:00")
      .split(":")
      .map((x) => parseInt(x, 10));
    return new Date(y, (m || 1) - 1, d || 1, hh, mm, 0, 0);
  } catch {
    return new Date();
  }
};

/* ================== Mini chart ================== */
function WeeklyBars({ data = [] }) {
  const height = 200,
    padTop = 18,
    padBottom = 22;
  const max = Math.max(1, ...data.map((d) => Number(d.value) || 0));
  const n = data.length || 7,
    gap = 10;
  const barWidth = Math.max(16, Math.min(44, (640 - gap * (n + 1)) / n));
  const chartWidth = (barWidth + gap) * n + gap;
  return (
    <div style={{ width: "100%", overflowX: "auto" }}>
      <svg
        width={chartWidth}
        height={height + padBottom + 18}
        role="img"
        aria-label="Pacientes registrados por día en la última semana"
      >
        {[0.25, 0.5, 0.75, 1].map((p, i) => {
          const y = padTop + (1 - p) * (height - padTop);
          return (
            <line
              key={i}
              x1={0}
              x2={chartWidth}
              y1={y}
              y2={y}
              stroke="#e5e7eb"
              strokeDasharray="4 4"
            />
          );
        })}
        {data.map((d, i) => {
          const v = Number(d.value) || 0;
          const h = Math.round((v / max) * (height - padTop));
          const x = gap + i * (barWidth + gap);
          const y = height - h;
          return (
            <g key={i}>
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={h}
                rx="6"
                ry="6"
                fill={v > 0 ? "#0ea5e9" : "#cbd5e1"}
              >
                <title>{`${d.label || d.shortLabel || ""} · ${v} paciente${
                  v !== 1 ? "s" : ""
                }`}</title>
              </rect>
              {v > 0 && h > 14 && (
                <text
                  x={x + barWidth / 2}
                  y={y - 6}
                  textAnchor="middle"
                  fontSize="11"
                  fill="#0f172a"
                >
                  {v}
                </text>
              )}
              <text
                x={x + barWidth / 2}
                y={height + 14}
                textAnchor="middle"
                fontSize="11"
                fill="#64748b"
              >
                {d.shortLabel || ""}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

/* ================== CommandSearch ================== */
function CommandSearch({ onNavigate, onAction, placeholder }) {
  const [term, setTerm] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const boxRef = useRef(null);
  const commands = useMemo(
    () => [
      { group: "Navegación", label: "Ir a Inicio", keywords: "inicio home overview", run: () => onNavigate?.("Inicio") },
      { group: "Navegación", label: "Ir a Agenda", keywords: "agenda calendario schedule", run: () => onNavigate?.("Agenda") },
      { group: "Navegación", label: "Ir a Pacientes", keywords: "pacientes", run: () => onNavigate?.("Pacientes") },
      { group: "Navegación", label: "Ir a Facturación", keywords: "facturacion facturas billing", run: () => onNavigate?.("Facturación") },
      { group: "Navegación", label: "Ir a Inventario", keywords: "inventario stock", run: () => onNavigate?.("Inventario") },
      { group: "Navegación", label: "Ir a Odontograma", keywords: "odontograma", run: () => onNavigate?.("Odontograma") },
      { group: "Navegación", label: "Ir a Reportes", keywords: "reportes informes", run: () => onNavigate?.("Reportes") },

      { group: "Acciones", label: "Nueva cita", keywords: "nueva cita agendar", run: () => onAction?.("new_appointment") },
      { group: "Acciones", label: "Nuevo paciente", keywords: "nuevo paciente alta", run: () => onAction?.("new_patient") },
      { group: "Acciones", label: "Nueva factura", keywords: "nueva factura", run: () => onAction?.("new_invoice") },
      { group: "Acciones", label: "Exportar agenda", keywords: "exportar agenda", run: () => onAction?.("export_agenda") },
      { group: "Acciones", label: "Ir a hoy (Agenda)", keywords: "hoy today", run: () => onAction?.("agenda_today") },
      { group: "Acciones", label: "Cambiar modo oscuro", keywords: "oscuro dark mode", run: () => onAction?.("toggle_dark") },
      { group: "Acciones", label: "Cerrar sesión", keywords: "logout salir cerrar", run: () => onAction?.("logout") },

      { group: "Ayuda", label: "Ver atajos de teclado", keywords: "atajos ayuda", run: () => onAction?.("show_shortcuts") },
      { group: "Ayuda", label: "Soporte / Contacto", keywords: "soporte ayuda contacto", run: () => onAction?.("support") },
    ],
    [onNavigate, onAction]
  );
  const filtered = useMemo(() => {
    const q = term.toLowerCase().trim();
    if (!q) return [];
    return commands.filter(
      (c) => c.label.toLowerCase().includes(q) || c.keywords.includes(q)
    );
  }, [term, commands]);
  useEffect(() => {
    const h = (e) => {
      if (!boxRef.current) return;
      if (!boxRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);
  const run = (cmd) => {
    cmd.run?.();
    setTerm("");
    setOpen(false);
  };
  const onKeyDown = (e) => {
    if (!open || filtered.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => (i + 1) % filtered.length);
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => (i - 1 + filtered.length) % filtered.length);
    }
    if (e.key === "Enter") {
      e.preventDefault();
      filtered[active] && run(filtered[active]);
    }
    if (e.key === "Escape") {
      setOpen(false);
    }
  };
  const grouped = useMemo(() => {
    const m = new Map();
    filtered.forEach((c) => {
      if (!m.has(c.group)) m.set(c.group, []);
      m.get(c.group).push(c);
    });
    return Array.from(m.entries());
  }, [filtered]);
  return (
    <div className="oc-search-wrap" ref={boxRef}>
      <input
        className="oc-search"
        type="search"
        inputMode="search"
        placeholder={placeholder}
        aria-label={placeholder}
        value={term}
        onChange={(e) => {
          setTerm(e.target.value);
          setOpen(!!e.target.value);
          setActive(0);
        }}
        onFocus={() => setOpen(!!term)}
        onKeyDown={onKeyDown}
      />
      {open && (
        <div className="oc-search-dropdown" role="listbox" aria-label="Resultados de comandos">
          {grouped.length === 0 ? (
            <div className="oc-search-item empty">Escribe para ver opciones…</div>
          ) : (
            grouped.map(([group, items]) => (
              <div key={group}>
                <div className="oc-search-group">{group}</div>
                {items.map((c) => {
                  const idxFlat = filtered.indexOf(c);
                  return (
                    <button
                      key={c.label}
                      className={`oc-search-item ${idxFlat === active ? "active" : ""}`}
                      onMouseEnter={() => setActive(idxFlat)}
                      onClick={() => run(c)}
                      role="option"
                    >
                      <span className="oc-search-title">{c.label}</span>
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

/* ==========================================================
   ✅ AdminMegaMenu
   - Usa onNavigatePath(relPath) para rutas absolutas desde el Dashboard
   - Usa onSetFactView(key) para elegir subvista
   ========================================================== */
function AdminMegaMenu({
  open,
  anchorRect,
  onClose,
  onNavigatePath, // <-- NUEVO: navegar por path relativo al dashboard
  onSoon,
  onSetFactView,  // <-- NUEVO: seleccionar vista de facturación
  dark,
}) {
  const [sub, setSub] = useState(null); // 'facturacion' | 'rips' | null
  const closeTimer = useRef(null);

  // Cierre global (Esc / scroll / click fuera)
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose?.();
    const onScroll = () => onClose?.();
    window.addEventListener("keydown", onKey);
    window.addEventListener("scroll", onScroll, true);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("scroll", onScroll, true);
    };
  }, [open, onClose]);

  if (!open) return null;

  // Posiciones
  const top = (anchorRect?.bottom || 60) + 8;
  const left = Math.max(
    12,
    Math.min((anchorRect?.left || 300) - 160, window.innerWidth - 920)
  );
  const gap = 10; // separación visual entre columna y subpanel
  const leftSub = left + 360 + gap;

  // Tema
  const baseBg = dark ? "#0b1220" : "#ffffff";
  const baseTx = dark ? "#e5e7eb" : "#0f172a";
  const hoverBg = dark ? "#0f1a32" : "#f3f6ff";
  const hoverBd = dark ? "#1f2a44" : "#e2e8f0";
  const hintTx = dark ? "#b6c1d1" : "#475569";

  // Estilos base
  const card = {
    position: "fixed",
    top,
    left,
    width: 880,
    maxWidth: "calc(100vw - 24px)",
    background: baseBg,
    color: baseTx,
    borderRadius: 14,
    boxShadow: "0 18px 40px rgba(2,6,23,.18)",
    border: `1px solid ${hoverBd}`,
    zIndex: 400,
    padding: 12,
  };
  const subCard = {
    position: "fixed",
    top,
    left: leftSub,
    width: 420,
    maxWidth: "calc(100vw - 24px)",
    background: baseBg,
    color: baseTx,
    borderRadius: 14,
    boxShadow: "0 18px 40px rgba(2,6,23,.18)",
    border: `1px solid ${hoverBd}`,
    zIndex: 410,
    padding: 12,
  };
  const col = { display: "flex", flexDirection: "column", gap: 6, padding: "8px 10px" };
  const item = {
    height: 38,
    borderRadius: 10,
    padding: "0 12px",
    display: "flex",
    alignItems: "center",
    gap: 8,
    fontSize: ".92rem",
    cursor: "pointer",
    border: "1px solid transparent",
    background: "transparent",
    color: baseTx,
    fontWeight: 500,
    textAlign: "left",
  };
  const hoverize = (e, on = true) =>
    Object.assign(
      e.currentTarget.style,
      on
        ? { background: hoverBg, borderColor: hoverBd }
        : { background: "transparent", borderColor: "transparent" }
    );

  // Mantener abierto mientras el cursor esté en cualquiera de las áreas
  const cancelClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
  };
  const scheduleClose = () => {
    cancelClose();
    closeTimer.current = setTimeout(() => onClose?.(), 180);
  };

  // “Puente” invisible entre columna y subpanel para no perder hover
  const bridge = {
    position: "fixed",
    top,
    left: left + 360,
    width: gap,
    height: 520, // suficientemente alto para cubrir ambos
    zIndex: 405,
  };

  // Submenú: etiqueta → clave de vista
  const FACT_ITEMS = [
    { label: "Recibo de caja", key: "recibo" },
    { label: "Saldo a favor", key: "saldo" },
    { label: "Nota crédito", key: "nc" },
    { label: "Nota débito", key: "nd" },
    { label: "Liquidaciones", key: "liq" },
    { label: "Traslados", key: "tras" },
    { label: "Pagos", key: "pagos" },
    { label: "Órdenes de compra", key: "oc" },
    { label: "Factura de venta", key: "fv" },
    { label: "Facturas de compra", key: "fc" },
  ];

  const RIPS_ITEMS = [
    { label: "RIPS anteriores (RS-3374)", key: "rips3374" },
    { label: "RIPS nuevo (RS-2275)", key: "rips2275" },
  ];

  // Helper click en una acción de facturación
  const handleFactClick = (viewKey) => {
    onSetFactView?.(viewKey);
    onNavigatePath?.(`facturacion/${viewKey}`);
  };

  return (
    <>
      {/* backdrop para cerrar con clic fuera */}
      <div
        onClick={onClose}
        style={{ position: "fixed", inset: 0, background: "transparent", zIndex: 399 }}
      />

      {/* Columna principal */}
      <div style={card} onMouseEnter={cancelClose} onMouseLeave={scheduleClose}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "360px 1fr",
            gap: 8,
            alignItems: "start",
          }}
        >
          <div style={col}>
            {/* Facturación (abre submenú) */}
            <button
              type="button"
              style={item}
              onMouseEnter={() => {
                cancelClose();
                setSub("facturacion");
              }}
              onFocus={() => {
                cancelClose();
                setSub("facturacion");
              }}
              onClick={() => setSub((s) => (s === "facturacion" ? null : "facturacion"))}
              onMouseOver={(e) => hoverize(e, true)}
              onMouseOut={(e) => hoverize(e, false)}
            >
              💳 Facturación ▸
            </button>

            {/* RIPS (abre submenú con 2 opciones) */}
            <button
              type="button"
              style={item}
              onMouseEnter={() => {
                cancelClose();
                setSub("rips");
              }}
              onFocus={() => {
                cancelClose();
                setSub("rips");
              }}
              onClick={() => setSub((s) => (s === "rips" ? null : "rips"))}
              onMouseOver={(e) => hoverize(e, true)}
              onMouseOut={(e) => hoverize(e, false)}
            >
              📄 RIPS ▸
            </button>

            {/* Resto (enlazar cuando estén listos) */}
            <button type="button" style={item} onClick={() => onSoon?.()} onMouseOver={(e) => hoverize(e, true)} onMouseOut={(e) => hoverize(e, false)}>
              🤝 Convenios
            </button>

            <button type="button" style={item} onClick={() => onNavigatePath?.("agenda")} onMouseOver={(e) => hoverize(e, true)} onMouseOut={(e) => hoverize(e, false)}>
              🗓️ Gestión de agenda
            </button>

            <button type="button" style={item} onClick={() => onSoon?.()} onMouseOver={(e) => hoverize(e, true)} onMouseOut={(e) => hoverize(e, false)}>
              👥 Terceros
            </button>

            <button type="button" style={item} onClick={() => onSoon?.()} onMouseOver={(e) => hoverize(e, true)} onMouseOut={(e) => hoverize(e, false)}>
              📣 Campañas
            </button>

            <button type="button" style={item} onClick={() => onSoon?.()} onMouseOver={(e) => hoverize(e, true)} onMouseOut={(e) => hoverize(e, false)}>
              🌡️ Temperatura y humedad
            </button>

            <button type="button" style={item} onClick={() => onSoon?.()} onMouseOver={(e) => hoverize(e, true)} onMouseOut={(e) => hoverize(e, false)}>
              ♻️ Residuos
            </button>

            <button type="button" style={item} onClick={() => onNavigatePath?.("inventario")} onMouseOver={(e) => hoverize(e, true)} onMouseOut={(e) => hoverize(e, false)}>
              📦 Inventario
            </button>

            <button type="button" style={item} onClick={() => onSoon?.()} onMouseOver={(e) => hoverize(e, true)} onMouseOut={(e) => hoverize(e, false)}>
              💊 Medicamentos y planes
            </button>

            <button type="button" style={item} onClick={() => onSoon?.()} onMouseOver={(e) => hoverize(e, true)} onMouseOut={(e) => hoverize(e, false)}>
              🧪 Esterilización
            </button>
          </div>

          <div style={col}>
            <div style={{ fontSize: ".85rem", color: hintTx }}>
              Accesos rápidos a módulos de administración. Pasa el mouse por <b>Facturación</b> o <b>RIPS</b> para ver sus acciones.
            </div>
          </div>
        </div>
      </div>

      {/* Puente invisible (evita el “cierre” al cruzar) */}
      <div style={bridge} onMouseEnter={cancelClose} onMouseLeave={scheduleClose} />

      {/* Subpanel derecho */}
      {sub && (
        <div style={subCard} onMouseEnter={cancelClose} onMouseLeave={scheduleClose}>
          <div style={{ ...col, display: "grid", gridTemplateColumns: "1fr" }}>
            {(sub === "facturacion" ? FACT_ITEMS : RIPS_ITEMS).map((it) => (
              <button
                key={it.label}
                type="button"
                style={item}
                onClick={() =>
                  sub === "facturacion" ? handleFactClick(it.key) : onSoon?.()
                }
                onMouseOver={(e) => hoverize(e, true)}
                onMouseOut={(e) => hoverize(e, false)}
              >
                {it.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

/* =============================== Dashboard =============================== */
export default function Dashboard() {
  const location = useLocation();
  const navigate = useNavigate();

  const [locale] = useState(detectLocale());
  const t = (key) => MESSAGES[locale][key] || key;

  // Vista Facturación seleccionada
  const [factView, setFactView] = useState("recibo");

  // Dark mode
  const [darkMode, setDarkMode] = useState(() => {
    try {
      return localStorage.getItem("odontocloud:dark") === "1";
    } catch {
      return false;
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem("odontocloud:dark", darkMode ? "1" : "0");
    } catch {}
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  // Sesión
  const [session] = useState(() => getOfflineSession());
  const [role] = useState(session?.rol || "");
  const [sessionEmail] = useState(session?.email || "");
  const [companyName, setCompanyName] = useState("OdontoCloud");
  const [userName, setUserName] = useState(sessionEmail || "Usuario");
  const [loadingUser, setLoadingUser] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        if (!user) {
          setUserName(sessionEmail || "Usuario");
          setCompanyName("OdontoCloud");
          setLoadingUser(false);
          return;
        }
        setUserName(user.displayName || user.email || sessionEmail || "Usuario");
        const ref = doc(db, "empresas", user.uid);
        const snap = await getDoc(ref);
        setCompanyName(snap.exists() ? snap.data().nombre || "OdontoCloud" : "OdontoCloud");
      } catch (e) {
        console.error("Error cargando empresa/usuario:", e);
      } finally {
        setLoadingUser(false);
      }
    });
    return () => unsubscribe();
  }, [sessionEmail]);

  // ===== Helpers de navegación ABSOLUTA dentro del dashboard =====
  // Prefijo absoluto del dashboard actual (/.../dashboard_admin | _doctor | _recepcion)
  const dashBase = useMemo(() => {
    const segs = location.pathname.split("/").filter(Boolean);
    const idx = segs.findIndex((s) => s.startsWith("dashboard_"));
    const base = "/" + segs.slice(0, idx + 1).join("/");
    return base || "/dashboard_admin"; // fallback sensato
  }, [location.pathname]);

  const goAbs = (segment = "") => {
    const clean = String(segment).replace(/^\//, "");
    const target = `${dashBase}/${clean}`.replace(/\/+$/, "");
    if (location.pathname === target) return; // evita navegación redundante
    navigate(target);
  };
  const goAbsReplace = (segment = "") => {
    const clean = String(segment).replace(/^\//, "");
    const target = `${dashBase}/${clean}`.replace(/\/+$/, "");
    if (location.pathname === target) return;
    navigate(target, { replace: true });
  };

  // ===== activeModule sincronizado desde la URL =====
  const [activeModule, setActiveModule] = useState("Inicio");
  useEffect(() => {
    const p = location.pathname.replace(dashBase, "").replace(/^\/+/, "");
    // p puede ser "", "agenda", "pacientes", "caja", "reportes", "facturacion/xxx", etc.
    if (!p) return setActiveModule("Inicio");
    if (p.startsWith("agenda")) return setActiveModule("Agenda");
    if (p.startsWith("pacientes")) return setActiveModule("Pacientes");
    if (p.startsWith("caja")) return setActiveModule("Caja");
    if (p.startsWith("reportes")) return setActiveModule("Reportes");
    if (p.startsWith("inventario")) return setActiveModule("Inventario");
    if (p.startsWith("odontograma")) return setActiveModule("Odontograma");
    if (p.startsWith("facturacion")) return setActiveModule("Facturación");
    setActiveModule("Inicio");
  }, [location.pathname, dashBase]);

  // ===== Métricas, series y citas =====
  const [metrics, setMetrics] = useState({
    pacientesHoy: 0,
    citasHoy: 0,
    facturacionHoy: 0,
    enEspera: 0,
  });
  const [metricsLoading, setMetricsLoading] = useState(true);
  const [weeklySeries, setWeeklySeries] = useState([]);
  const [todaysAppointments, setTodaysAppointments] = useState([]);
  const [todaysLoading, setTodaysLoading] = useState(true);

  const { startToday, endToday, startTodayJS } = useTodayRange();
  const todayIso = useMemo(() => toIsoDate(startTodayJS), [startTodayJS]);
  const weekRangeLabel = useMemo(() => {
    const today = new Date();
    const start = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 6);
    const end = today;
    const fmt = (d) =>
      d
        .toLocaleDateString(locale === "es" ? "es-ES" : "en-US", {
          weekday: "short",
          day: "2-digit",
          month: "short",
        })
        .replace(".", "");
    return `${fmt(start)} – ${fmt(end)}`;
  }, [locale]);

  const normalizeCita = (docSnap) => {
    const data = docSnap.data() || {};
    let fechaDate;
    if (data.fecha?.toDate) {
      fechaDate = data.fecha.toDate();
      const hhmm = data.horaInicio || data.hora;
      if (hhmm && typeof hhmm === "string") {
        const [hh = 0, mm = 0] = hhmm.split(":").map((x) => parseInt(x, 10));
        fechaDate.setHours(hh || 0, mm || 0, 0, 0);
      }
    } else if (typeof data.fecha === "string") {
      const hhmm = data.horaInicio || data.hora || "00:00";
      fechaDate = buildDateFromParts(data.fecha, hhmm);
    } else {
      fechaDate = new Date();
    }
    const pacienteNombre = data.pacienteNombre || data.paciente || "Paciente";
    const estado = (data.estado && String(data.estado)) || "programada";
    return {
      id: docSnap.id,
      fecha: fechaDate,
      pacienteId: data.pacienteId || "",
      pacienteNombre,
      estado,
      motivo: data.motivo || "",
    };
  };

  useEffect(() => {
    const qTodayTs = query(
      collection(db, "citas"),
      where("fecha", ">=", startToday),
      where("fecha", "<", endToday),
      orderBy("fecha", "asc")
    );
    const qTodayStr = query(collection(db, "citas"), where("fecha", "==", todayIso));
    let cacheMap = new Map();
    let gotTs = false;
    let gotStr = false;
    const commit = () => {
      const rows = Array.from(cacheMap.values()).sort(
        (a, b) => a.fecha.getTime() - b.fecha.getTime()
      );
      const enEsperaCount = rows.filter(
        (r) => String(r.estado).toLowerCase().trim() === "en espera"
      ).length;
      setTodaysAppointments(rows);
      setMetrics((m) => ({ ...m, citasHoy: rows.length, enEspera: enEsperaCount }));
      if (gotTs && gotStr) setTodaysLoading(false);
    };
    const unsubTs = onSnapshot(
      qTodayTs,
      (snap) => {
        gotTs = true;
        const temp = new Map(cacheMap);
        snap.docs.forEach((d) => temp.set(d.id, normalizeCita(d)));
        cacheMap = temp;
        commit();
      },
      (err) => {
        console.error("Realtime citas hoy (TS):", err);
        gotTs = true;
        commit();
      }
    );
    const unsubStr = onSnapshot(
      qTodayStr,
      (snap) => {
        gotStr = true;
        const temp = new Map(cacheMap);
        snap.docs.forEach((d) => temp.set(d.id, normalizeCita(d)));
        cacheMap = temp;
        commit();
      },
      (err) => {
        console.error("Realtime citas hoy (STR):", err);
        gotStr = true;
        commit();
      }
    );
    return () => {
      try { unsubTs(); unsubStr(); } catch {}
    };
  }, [startToday, endToday, todayIso]);

  useEffect(() => {
    const loadMetricsBase = async () => {
      try {
        const pacientesCountSnap = await getCountFromServer(collection(db, "pacientes"));
        const pacientesTotal = pacientesCountSnap.data().count || 0;

        let facturacionHoy = 0;
        try {
          const qFact = query(
            collection(db, "facturas"),
            where("fecha", ">=", startToday),
            where("fecha", "<", endToday)
          );
          const factSnap = await getDocs(qFact);
          factSnap.forEach((docu) => {
            const d = docu.data();
            if (typeof d.monto === "number") facturacionHoy += d.monto;
          });
        } catch {
          facturacionHoy = 0;
        }

        setMetrics((m) => ({ ...m, pacientesHoy: pacientesTotal, facturacionHoy }));
      } catch (e) {
        console.error("Error cargando métricas:", e);
        setMetrics((m) => ({ ...m, pacientesHoy: 0, facturacionHoy: 0 }));
      } finally {
        setMetricsLoading(false);
      }
    };
    loadMetricsBase();
  }, [startToday, endToday]);

  useEffect(() => {
    const today = new Date();
    const startWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 6);
    const endWeekJs = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

    const base = new Map();
    for (let i = 0; i < 7; i++) {
      const d = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate() - (6 - i)
      );
      const key = d.toISOString().slice(0, 10);
      const label = d.toLocaleDateString(locale === "es" ? "es-ES" : "en-US");
      const shortLabel = d
        .toLocaleDateString(locale === "es" ? "es-ES" : "en-US", {
          weekday: "short",
          day: "2-digit",
        })
        .replace(".", "");
      base.set(key, { label, shortLabel, value: 0 });
    }

    const qWeekPatients = query(
      collection(db, "pacientes"),
      where("createdAt", ">=", Timestamp.fromDate(startWeek)),
      where("createdAt", "<", Timestamp.fromDate(endWeekJs))
    );

    const unsub = onSnapshot(
      qWeekPatients,
      (snap) => {
        const counts = new Map(base);
        snap.docs.forEach((d) => {
          const data = d.data() || {};
          const date = d.data().createdAt?.toDate
            ? d.data().createdAt.toDate()
            : data.createdAt
            ? new Date(data.createdAt)
            : null;
          if (!date || isNaN(date)) return;
          const key = date.toISOString().slice(0, 10);
          if (!counts.has(key)) return;
          const entry = counts.get(key);
          entry.value += 1;
          counts.set(key, entry);
        });
        setWeeklySeries(Array.from(counts.values()));
      },
      (e) => {
        console.error("Error realtime serie semanal (pacientes):", e);
        setWeeklySeries(Array.from(base.values()));
      }
    );

    return () => {
      try {
        unsub();
      } catch {}
    };
  }, [locale]);

  const [recent, setRecent] = useState([]);
  const [recentLoading, setRecentLoading] = useState(true);
  useEffect(() => {
    const loadRecent = async () => {
      try {
        const qAct = query(collection(db, "actividad"), orderBy("fecha", "desc"), limit(5));
        const snap = await getDocs(qAct);
        setRecent(
          snap.docs.map((d) => ({
            id: d.id,
            title: d.data().descripcion || d.data().titulo || "Actividad",
            time: d.data().resumenTiempo || "",
          }))
        );
      } catch (e) {
        console.error("Error cargando actividad:", e);
        setRecent([]);
      } finally {
        setRecentLoading(false);
      }
    };
    loadRecent();
  }, []);

  const [n8nState, setN8nState] = useState(null);
  const [n8nLoading, setN8nLoading] = useState(true);
  useEffect(() => {
    const loadN8n = async () => {
      try {
        const ref = doc(db, "integraciones", "n8n");
        const snap = await getDoc(ref);
        setN8nState(
          snap.exists()
            ? {
                connected: !!snap.data().connected,
                flowsRunning: snap.data().flowsRunning || 0,
                lastError: snap.data().lastError || null,
              }
            : { connected: false, flowsRunning: 0, lastError: null }
        );
      } catch (e) {
        console.error("Error cargando estado n8n:", e);
        setN8nState({
          connected: false,
          flowsRunning: 0,
          lastError: "No se pudo leer el estado desde Firebase.",
        });
      } finally {
        setN8nLoading(false);
      }
    };
    loadN8n();
  }, []);

  const handleLogout = async () => {
    try {
      localStorage.removeItem("odc_session");
    } catch {}
    try {
      await signOut(auth);
    } catch (e) {
      console.error("Error al cerrar sesión:", e);
    }
    window.location.href = "/";
  };

  /* ===== Contenido por módulo ===== */
  const renderModuleContent = () => {
    switch (activeModule) {
      case "Agenda":
        return <Agenda />;
      case "Pacientes":
        return <Pacientes />;
      case "Facturación":
        return <Facturacion view={factView} />;
      case "Inventario":
        return <Inventario />;
      case "Odontograma":
        return <Odontograma />;
      case "Reportes":
        return <Reportes />;
      case "Caja":
        return <Caja />;
      case "Inicio":
      default:
        return null;
    }
  };

  return (
    <div className={`oc-shell ${darkMode ? "oc-dark" : ""}`}>
      <a href="#oc-main" className="oc-skip-link">
        Saltar al contenido
      </a>

      <header className="oc-header" role="banner">
        <div className="oc-header-left">
          <img src={logo} alt="OdontoCloud" className="oc-logo" />
          <div className="oc-brand-text">
            <span className="oc-brand-main">OdontoCloud</span>
            <span className="oc-brand-sub">{loadingUser ? "..." : companyName}</span>
          </div>
        </div>

        <nav className="oc-nav" role="navigation" aria-label="Navegación principal">
          <NavLink
            to={dashBase}
            end
            className={({ isActive }) =>
              (isActive && activeModule === "Inicio") ? "oc-nav-btn active" : "oc-nav-btn"
            }
            title={t("nav_home")}
          >
            {t("nav_home")}
          </NavLink>

          <NavLink
            to={`${dashBase}/agenda`}
            className={({ isActive }) =>
              (isActive || activeModule === "Agenda") ? "oc-nav-btn active" : "oc-nav-btn"
            }
            title={t("nav_agenda")}
          >
            {t("nav_agenda")}
          </NavLink>

          <NavLink
            to={`${dashBase}/pacientes`}
            className={({ isActive }) =>
              (isActive || activeModule === "Pacientes") ? "oc-nav-btn active" : "oc-nav-btn"
            }
            title={t("nav_patients")}
          >
            {t("nav_patients")}
          </NavLink>

          {/* Caja */}
          <NavLink
            to={`${dashBase}/caja`}
            className={({ isActive }) =>
              (isActive || activeModule === "Caja") ? "oc-nav-btn active" : "oc-nav-btn"
            }
            title={t("nav_cash")}
          >
            {t("nav_cash")}
          </NavLink>

          {/* Administración: abre MegaMenú */}
          <button
            type="button"
            className="oc-nav-btn"
            title={t("nav_admin")}
            aria-haspopup="true"
            aria-expanded={undefined}
            onClick={(e) => {
              e.preventDefault();
            }}
            onMouseEnter={() => {
              // se abre desde el componente flotante
            }}
            ref={undefined}
          >
            {t("nav_admin")}
          </button>

          <NavLink
            to={`${dashBase}/reportes`}
            className={({ isActive }) =>
              (isActive || activeModule === "Reportes") ? "oc-nav-btn active" : "oc-nav-btn"
            }
            title={t("nav_reports")}
          >
            {t("nav_reports")}
          </NavLink>
        </nav>

        <div className="oc-header-right">
          <CommandSearch
            placeholder={t("searchPlaceholder")}
            onNavigate={(module) => {
              if (module === "Inicio") goAbsReplace("");
              else if (module === "Agenda") goAbs("agenda");
              else if (module === "Pacientes") goAbs("pacientes");
              else if (module === "Facturación") { setFactView("recibo"); goAbs("facturacion/recibo"); }
              else if (module === "Inventario") goAbs("inventario");
              else if (module === "Odontograma") goAbs("odontograma");
              else if (module === "Reportes") goAbs("reportes");
            }}
            onAction={(key) => {
              switch (key) {
                case "new_appointment":
                case "agenda_today":
                case "export_agenda":
                  goAbs("agenda"); break;
                case "new_patient":
                  goAbs("pacientes"); break;
                case "new_invoice":
                  setFactView("fv"); goAbs("facturacion/fv"); break;
                case "toggle_dark":
                  setDarkMode((v) => !v); break;
                case "logout":
                  handleLogout(); break;
                case "show_shortcuts":
                  alert("Atajos: Ctrl/Cmd + K para abrir búsqueda, ↑/↓ para moverse, Enter para ejecutar."); break;
                case "support":
                  window.open("https://tu-soporte.odc", "_blank"); break;
                default:
                  break;
              }
            }}
          />
          <button
            className="oc-icon-btn"
            type="button"
            onClick={() => setDarkMode((v) => !v)}
            aria-pressed={darkMode}
            title={darkMode ? "Activar modo claro" : "Activar modo oscuro"}
          >
            {darkMode ? "🌙" : "☀️"}
          </button>
          <button
            className="oc-icon-btn"
            type="button"
            onClick={handleLogout}
            title={MESSAGES[locale].logout}
          >
            {MESSAGES[locale].logout}
          </button>
        </div>
      </header>

      {/* Mega menú flotante */}
      <AdminMegaMenu
        open={true /* lo dejamos siempre disponible para hover/click externo si lo usas con portal */}
        anchorRect={null}
        dark={darkMode}
        onClose={() => {}}
        onSoon={() => alert("Próximamente")}
        onNavigatePath={(relPath) => goAbs(relPath)}
        onSetFactView={(key) => setFactView(key)}
      />

      <main id="oc-main" className="oc-main-wrapper" role="main">
        {activeModule !== "Inicio" && renderModuleContent()}

        {activeModule === "Inicio" && (
          <div className="oc-main-content">
            {/* HERO */}
            <section className="oc-hero" aria-label="Resumen general">
              <div className="oc-hero-text">
                <h1>{MESSAGES[locale].welcomeTitle}</h1>
                <p>{MESSAGES[locale].welcomeSubtitle}</p>
                <p className="oc-hero-meta">
                  {MESSAGES[locale].clinicLabel}: {companyName} · {MESSAGES[locale].userLabel}:{" "}
                  {userName} · {MESSAGES[locale].roleLabel}: {role || "—"}
                </p>
              </div>

              <div className="oc-hero-badge" aria-live="polite">
                <span className="oc-hero-badge-title">
                  {MESSAGES[locale].stats_appointmentsToday}
                </span>
                <span className="oc-hero-badge-value">
                  {metricsLoading && todaysLoading ? "…" : metrics.citasHoy}
                </span>
                <span className="oc-hero-badge-sub">
                  {MESSAGES[locale].stats_patientsToday}: {metricsLoading ? "…" : metrics.pacientesHoy}
                </span>
              </div>
            </section>

            {/* STATS */}
            <section className="oc-stats-row" aria-label="Indicadores del día">
              <div className="stat-card">
                <span className="stat-label">{MESSAGES[locale].stats_patientsToday}</span>
                <span className="stat-value">{metrics.pacientesHoy}</span>
              </div>
              <div className="stat-card">
                <span className="stat-label">{MESSAGES[locale].stats_appointmentsToday}</span>
                <span className="stat-value">{metrics.citasHoy}</span>
              </div>
              <div className="stat-card">
                <span className="stat-label">{MESSAGES[locale].stats_revenueToday}</span>
                <span className="stat-value">
                  {metrics.facturacionHoy.toLocaleString("es-CO")}{" "}
                  <span className="stat-currency">{MESSAGES[locale].stats_currency}</span>
                </span>
              </div>
              <div className="stat-card">
                <span className="stat-label">{MESSAGES[locale].stats_waiting}</span>
                <span className="stat-value">{metrics.enEspera}</span>
              </div>
            </section>

            {/* GRID principal */}
            <section className="oc-grid" aria-label="Contenido principal del dashboard">
              <div className="oc-grid-main">
                <div className="card card-quickcharts">
                  <div
                    className="oc-card-head"
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <h3>Pacientes registrados · Últimos 7 días</h3>
                    <span className="oc-muted" style={{ marginLeft: 8, fontSize: 12 }}>
                      {weekRangeLabel}
                    </span>
                  </div>

                  {weeklySeries.length === 0 ||
                  weeklySeries.every((d) => (d?.value || 0) === 0) ? (
                    <p className="oc-weekly-empty">
                      Sin pacientes registrados en la última semana.
                    </p>
                  ) : (
                    <WeeklyBars data={weeklySeries} />
                  )}
                </div>
              </div>

              <aside className="oc-grid-side" aria-label="Panel lateral">
                <div className="card">
                  <h3>{MESSAGES[locale].n8n_title}</h3>
                  {n8nLoading ? (
                    <span className="oc-muted">{MESSAGES[locale].loading}</span>
                  ) : (
                    <N8nStatus status={n8nState} />
                  )}
                </div>

                {/* Citas de hoy */}
                <div className="card">
                  <div
                    className="oc-card-head"
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <h3>{MESSAGES[locale].todays_appts}</h3>
                    <button
                      className="oc-small-link"
                      type="button"
                      onClick={() => goAbs("agenda")}
                    >
                      {MESSAGES[locale].see_schedule}
                    </button>
                  </div>

                  {todaysLoading ? (
                    <span className="oc-muted">{MESSAGES[locale].loading}</span>
                  ) : todaysAppointments.length === 0 ? (
                    <p className="oc-muted">{MESSAGES[locale].no_appts_today}</p>
                  ) : (
                    <ul className="oc-list">
                      {todaysAppointments.slice(0, 5).map((c) => (
                        <li key={c.id} className="oc-list-item">
                          <div className="oc-list-main">
                            <b>{c.pacienteNombre || "Paciente"}</b>{" "}
                            <span className="oc-muted">
                              {MESSAGES[locale].at} {fmtTime(c.fecha, locale)}
                            </span>
                          </div>
                          <div
                            className={`oc-tag oc-tag-${(c.estado || "programada")
                              .toLowerCase()
                              .replace(/\s+/g, "-")}`}
                          >
                            {c.estado || "programada"}
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="card">
                  <h3>{MESSAGES[locale].recent_title}</h3>
                  {recentLoading ? (
                    <span className="oc-muted">{MESSAGES[locale].loading}</span>
                  ) : recent.length === 0 ? (
                    <p className="oc-muted">{MESSAGES[locale].recent_empty}</p>
                  ) : (
                    <RecentActivity items={recent} />
                  )}
                </div>
              </aside>
            </section>

            <footer className="oc-footer">
              © {new Date().getFullYear()} OdontoCloud | Creado por Ingeniero Juan Madrid
            </footer>
          </div>
        )}
      </main>
    </div>
  );
}
