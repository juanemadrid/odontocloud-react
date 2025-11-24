// ===============================
// 🦷 Dashboard.jsx - Panel principal OdontoCloud
// ===============================
import React, { useEffect, useMemo, useState } from "react";
import "../styles/dashboard.css";

// MÓDULOS PRINCIPALES
import Agenda from "../modules/agenda/Agenda";
import Facturacion from "../modules/facturacion/Facturacion";
import Inventario from "../modules/inventario/Inventario";
import Odontograma from "../modules/odontograma/Odontograma";
import Pacientes from "../modules/pacientes/Pacientes";
import Reportes from "../modules/reportes/Reportes";

// ⛔️ Ya no usamos QuickCharts externo; la gráfica va inline (WeeklyBars)
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

/* ===============================
   i18n sencillo (es/en)
   =============================== */
const MESSAGES = {
  es: {
    nav_home: "Inicio",
    nav_agenda: "Agenda",
    nav_patients: "Pacientes",
    nav_billing: "Facturación",
    nav_inventory: "Inventario",
    nav_odontogram: "Odontograma",
    nav_reports: "Reportes",
    welcomeTitle: "Bienvenido a OdontoCloud",
    welcomeSubtitle:
      "Administra tus pacientes, agenda, inventario y facturación de manera inteligente y moderna.",
    clinicLabel: "Clínica",
    userLabel: "Usuario",
    roleLabel: "Rol",
    searchPlaceholder: "Buscar...",
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
    welcomeTitle: "Welcome to OdontoCloud",
    welcomeSubtitle:
      "Manage your patients, schedule, inventory and billing in a smart and modern way.",
    clinicLabel: "Clinic",
    userLabel: "User",
    roleLabel: "Role",
    searchPlaceholder: "Search...",
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

// Sesión offline (Login.jsx)
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

// Helpers fecha de hoy (inicio/fin)
const useTodayRange = () => {
  return useMemo(() => {
    const now = new Date();
    const startToday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      0, 0, 0, 0
    );
    const endToday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + 1,
      0, 0, 0, 0
    );
    return {
      startToday: Timestamp.fromDate(startToday),
      endToday: Timestamp.fromDate(endToday),
      startTodayJS: startToday,
    };
  }, []);
};

// ISO yyyy-mm-dd
const toIsoDate = (d) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

// Formato hora corta a partir de Date
const fmtTime = (d, locale) =>
  d.toLocaleTimeString(locale === "es" ? "es-CO" : "en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

// Construye Date a partir de fecha string + hora string
const buildDateFromParts = (isoDate, hhmm) => {
  try {
    const [y, m, d] = (isoDate || "").split("-").map((x) => parseInt(x, 10));
    const [hh = 0, mm = 0] = (hhmm || "00:00")
      .split(":")
      .map((x) => parseInt(x, 10));
    return new Date(y, (m || 1) - 1, d || 1, hh, mm, 0, 0);
  } catch {
    return new Date();
  }
};

/* ==========================================================
   Mini componente local: WeeklyBars (gráfica de barras)
   - Profesional, sin dependencias
   - Usa data: [{label, shortLabel, value}]
   ========================================================== */
function WeeklyBars({ data = [] }) {
  // Alto del área de plot y paddings
  const height = 200;
  const padTop = 18;
  const padBottom = 22;

  const max = Math.max(1, ...data.map((d) => Number(d.value) || 0));
  const n = data.length || 7;
  const gap = 10; // separación entre barras

  // Ancho de cada barra según cantidad de días (responsivo horizontal)
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
        {/* Líneas de guía 25/50/75/100% */}
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

        {/* Barras */}
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
                <title>{`${d.label || d.shortLabel || ""} · ${v} paciente${v !== 1 ? "s" : ""}`}</title>
              </rect>

              {/* Valor encima (si hay altura) */}
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

              {/* Etiqueta corta bajo la barra */}
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

/* ==========================================================
   Dashboard
   ========================================================== */
export default function Dashboard() {
  // ===== idioma =====
  const [locale] = useState(detectLocale());
  const t = (key) => MESSAGES[locale][key] || key;

  // ===== navegación de módulos =====
  const [activeModule, setActiveModule] = useState("Inicio");

  // ===== dark mode =====
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

  // ===== sesión / rol / usuario =====
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
        if (snap.exists()) {
          setCompanyName(snap.data().nombre || "OdontoCloud");
        } else {
          setCompanyName("OdontoCloud");
        }
      } catch (e) {
        console.error("Error cargando empresa/usuario:", e);
      } finally {
        setLoadingUser(false);
      }
    });

    return () => unsubscribe();
  }, [sessionEmail]);

  // ===== métricas generales =====
  const [metrics, setMetrics] = useState({
    pacientesHoy: 0,
    citasHoy: 0,
    facturacionHoy: 0,
    enEspera: 0, // <- en tiempo real, según citas de hoy con estado "En espera"
  });
  const [metricsLoading, setMetricsLoading] = useState(true);

  // ===== serie semanal para el gráfico =====
  const [weeklySeries, setWeeklySeries] = useState([]);

  // ===== citas hoy (lista para la tarjeta) en tiempo real =====
  const [todaysAppointments, setTodaysAppointments] = useState([]);
  const [todaysLoading, setTodaysLoading] = useState(true);

  const { startToday, endToday, startTodayJS } = useTodayRange();
  const todayIso = useMemo(() => toIsoDate(startTodayJS), [startTodayJS]);

  // Rango de la “última semana” para mostrar debajo del título (solo texto)
  const weekRangeLabel = useMemo(() => {
    const today = new Date();
    const start = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 6);
    const end = today;
    const fmt = (d) =>
      d.toLocaleDateString(locale === "es" ? "es-ES" : "en-US", {
        weekday: "short",
        day: "2-digit",
        month: "short",
      }).replace(".", "");
    return `${fmt(start)} – ${fmt(end)}`;
  }, [locale]);

  // Normalizador de documentos "citas"
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

  // Suscripción en tiempo real a "citas" de HOY (Timestamp y String)
  useEffect(() => {
    // A) Timestamp en rango del día
    const qTodayTs = query(
      collection(db, "citas"),
      where("fecha", ">=", startToday),
      where("fecha", "<", endToday),
      orderBy("fecha", "asc")
    );

    // B) String exacto "YYYY-MM-DD"
    const qTodayStr = query(collection(db, "citas"), where("fecha", "==", todayIso));

    let cacheMap = new Map(); // id -> cita
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
      setMetrics((m) => ({
        ...m,
        citasHoy: rows.length,
        enEspera: enEsperaCount, // <- tiempo real
      }));
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
      try { unsubTs(); } catch {}
      try { unsubStr(); } catch {}
    };
  }, [startToday, endToday, todayIso]);

  /* ==========================================================
     MÉTRICAS base (totales / facturación)
     ========================================================== */
  useEffect(() => {
    const loadMetricsBase = async () => {
      try {
        // Pacientes totales
        const pacientesCountSnap = await getCountFromServer(collection(db, "pacientes"));
        const pacientesTotal = pacientesCountSnap.data().count || 0;

        // Facturación de hoy (asumiendo 'fecha' Timestamp en 'facturas')
        let facturacionHoy = 0;
        try {
          const qFact = query(
            collection(db, "facturas"),
            where("fecha", ">=", startToday),
            where("fecha", "<", endToday)
          );
          const factSnap = await getDocs(qFact);
          factSnap.forEach((docu) => {
            const data = docu.data();
            if (typeof data.monto === "number") facturacionHoy += data.monto;
          });
        } catch {
          facturacionHoy = 0;
        }

        setMetrics((m) => ({
          ...m, // mantenemos citasHoy y enEspera en tiempo real
          pacientesHoy: pacientesTotal,
          facturacionHoy,
        }));
      } catch (e) {
        console.error("Error cargando métricas:", e);
        setMetrics((m) => ({ ...m, pacientesHoy: 0, facturacionHoy: 0 }));
      } finally {
        setMetricsLoading(false);
      }
    };
    loadMetricsBase();
  }, [startToday, endToday]);

  // === Serie semanal en TIEMPO REAL (pacientes creados) ===
  useEffect(() => {
    const today = new Date();
    const startWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 6);
    const endWeekJs = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

    // Base de 7 días (siempre aparecen todas las barras)
    const base = new Map();
    for (let i = 0; i < 7; i++) {
      const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() - (6 - i));
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
        const counts = new Map(base); // clonar base
        snap.docs.forEach((d) => {
          const data = d.data() || {};
          const date = data.createdAt?.toDate ? data.createdAt.toDate()
                    : (data.createdAt ? new Date(data.createdAt) : null);
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

    return () => { try { unsub(); } catch {} };
  }, [locale]);

  // ===== actividad reciente =====
  const [recent, setRecent] = useState([]);
  const [recentLoading, setRecentLoading] = useState(true);

  useEffect(() => {
    const loadRecent = async () => {
      try {
        const qAct = query(collection(db, "actividad"), orderBy("fecha", "desc"), limit(5));
        const snap = await getDocs(qAct);
        const items = snap.docs.map((d) => {
          const data = d.data();
          return {
            id: d.id,
            title: data.descripcion || data.titulo || "Actividad",
            time: data.resumenTiempo || "",
          };
        });
        setRecent(items);
      } catch (e) {
        console.error("Error cargando actividad:", e);
        setRecent([]);
      } finally {
        setRecentLoading(false);
      }
    };
    loadRecent();
  }, []);

  // ===== estado n8n =====
  const [n8nState, setN8nState] = useState(null);
  const [n8nLoading, setN8nLoading] = useState(true);

  useEffect(() => {
    const loadN8n = async () => {
      try {
        const ref = doc(db, "integraciones", "n8n");
        const snap = await getDoc(ref);
        if (snap.exists()) {
          const data = snap.data();
          setN8nState({
            connected: !!data.connected,
            flowsRunning: data.flowsRunning || 0,
            lastError: data.lastError || null,
          });
        } else {
          setN8nState({ connected: false, flowsRunning: 0, lastError: null });
        }
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

  // ===== logout =====
  const handleLogout = async () => {
    try { localStorage.removeItem("odc_session"); } catch {}
    try { await signOut(auth); } catch (e) { console.error("Error al cerrar sesión:", e); }
    window.location.href = "/";
  };

  // ===== contenido para módulos <> Inicio =====
  const renderModuleContent = () => {
    switch (activeModule) {
      case "Agenda":
        return <Agenda />;
      case "Pacientes":
        return <Pacientes />;
      case "Facturación":
        return <Facturacion />;
      case "Inventario":
        return <Inventario />;
      case "Odontograma":
        return <Odontograma />;
      case "Reportes":
        return <Reportes />;
      case "Inicio":
      default:
        return null;
    }
  };

  return (
    <div className={`oc-shell ${darkMode ? "oc-dark" : ""}`}>
      {/* HEADER */}
      <header className="oc-header">
        <div className="oc-header-left">
          <img src={logo} alt="OdontoCloud" className="oc-logo" />
          <div className="oc-brand-text">
            <span className="oc-brand-main">OdontoCloud</span>
            <span className="oc-brand-sub">{loadingUser ? "..." : companyName}</span>
          </div>
        </div>

        <nav className="oc-nav">
          <button
            className={activeModule === "Inicio" ? "oc-nav-btn active" : "oc-nav-btn"}
            onClick={() => setActiveModule("Inicio")}
          >
            {t("nav_home")}
          </button>
          <button
            className={activeModule === "Agenda" ? "oc-nav-btn active" : "oc-nav-btn"}
            onClick={() => setActiveModule("Agenda")}
          >
            {t("nav_agenda")}
          </button>
          <button
            className={activeModule === "Pacientes" ? "oc-nav-btn active" : "oc-nav-btn"}
            onClick={() => setActiveModule("Pacientes")}
          >
            {t("nav_patients")}
          </button>
          <button
            className={activeModule === "Facturación" ? "oc-nav-btn active" : "oc-nav-btn"}
            onClick={() => setActiveModule("Facturación")}
          >
            {t("nav_billing")}
          </button>
          <button
            className={activeModule === "Inventario" ? "oc-nav-btn active" : "oc-nav-btn"}
            onClick={() => setActiveModule("Inventario")}
          >
            {t("nav_inventory")}
          </button>
          <button
            className={activeModule === "Odontograma" ? "oc-nav-btn active" : "oc-nav-btn"}
            onClick={() => setActiveModule("Odontograma")}
          >
            {t("nav_odontogram")}
          </button>
          <button
            className={activeModule === "Reportes" ? "oc-nav-btn active" : "oc-nav-btn"}
            onClick={() => setActiveModule("Reportes")}
          >
            {t("nav_reports")}
          </button>
        </nav>

        <div className="oc-header-right">
          <input className="oc-search" placeholder={t("searchPlaceholder")} />
          <button className="oc-icon-btn" type="button" onClick={() => setDarkMode((v) => !v)}>
            {darkMode ? "🌙" : "☀️"}
          </button>
          <button className="oc-icon-btn" type="button" onClick={handleLogout}>
            {t("logout")}
          </button>
        </div>
      </header>

      {/* MAIN */}
      <main className="oc-main-wrapper">
        {activeModule !== "Inicio" && renderModuleContent()}

        {activeModule === "Inicio" && (
          <div className="oc-main-content">
            {/* HERO */}
            <section className="oc-hero">
              <div className="oc-hero-text">
                <h1>{t("welcomeTitle")}</h1>
                <p>{t("welcomeSubtitle")}</p>
                <p className="oc-hero-meta">
                  {t("clinicLabel")}: {companyName} · {t("userLabel")}: {userName} · {t("roleLabel")}: {role || "—"}
                </p>
              </div>

              <div className="oc-hero-badge">
                <span className="oc-hero-badge-title">{t("stats_appointmentsToday")}</span>
                <span className="oc-hero-badge-value">
                  {metricsLoading && todaysLoading ? "…" : metrics.citasHoy}
                </span>
                <span className="oc-hero-badge-sub">
                  {t("stats_patientsToday")}: {metricsLoading ? "…" : metrics.pacientesHoy}
                </span>
              </div>
            </section>

            {/* STATS */}
            <section className="oc-stats-row">
              <div className="stat-card">
                <span className="stat-label">{t("stats_patientsToday")}</span>
                <span className="stat-value">{metrics.pacientesHoy}</span>
              </div>
              <div className="stat-card">
                <span className="stat-label">{t("stats_appointmentsToday")}</span>
                <span className="stat-value">{metrics.citasHoy}</span>
              </div>
              <div className="stat-card">
                <span className="stat-label">{t("stats_revenueToday")}</span>
                <span className="stat-value">
                  {metrics.facturacionHoy.toLocaleString("es-CO")}{" "}
                  <span className="stat-currency">{t("stats_currency")}</span>
                </span>
              </div>
              <div className="stat-card">
                <span className="stat-label">{t("stats_waiting")}</span>
                <span className="stat-value">{metrics.enEspera}</span>
              </div>
            </section>

            {/* GRID principal */}
            <section className="oc-grid">
              <div className="oc-grid-main">
                <div className="card card-quickcharts">
                  <div className="oc-card-head" style={{ alignItems: "baseline" }}>
                    <h3>Pacientes registrados · Últimos 7 días</h3>
                    <span className="oc-muted" style={{ marginLeft: "8px", fontSize: 12 }}>
                      {weekRangeLabel}
                    </span>
                  </div>

                  {weeklySeries.length === 0 ||
                  weeklySeries.every((d) => (d?.value || 0) === 0) ? (
                    <p className="oc-weekly-empty">Sin pacientes registrados en la última semana.</p>
                  ) : (
                    <WeeklyBars data={weeklySeries} />
                  )}
                </div>
              </div>

              <div className="oc-grid-side">
                <div className="card">
                  <h3>{t("n8n_title")}</h3>
                  {n8nLoading ? <span className="oc-muted">{t("loading")}</span> : <N8nStatus status={n8nState} />}
                </div>

                {/* Citas de hoy */}
                <div className="card">
                  <div className="oc-card-head">
                    <h3>{t("todays_appts")}</h3>
                    <button className="oc-small-link" onClick={() => setActiveModule("Agenda")}>
                      {t("see_schedule")}
                    </button>
                  </div>

                  {todaysLoading ? (
                    <span className="oc-muted">{t("loading")}</span>
                  ) : todaysAppointments.length === 0 ? (
                    <p className="oc-muted">{t("no_appts_today")}</p>
                  ) : (
                    <ul className="oc-list">
                      {todaysAppointments.slice(0, 5).map((c) => (
                        <li key={c.id} className="oc-list-item">
                          <div className="oc-list-main">
                            <b>{c.pacienteNombre || "Paciente"}</b>{" "}
                            <span className="oc-muted">
                              {t("at")} {fmtTime(c.fecha, locale)}
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
                  <h3>{t("recent_title")}</h3>
                  {recentLoading ? (
                    <span className="oc-muted">{t("loading")}</span>
                  ) : recent.length === 0 ? (
                    <p className="oc-muted">{t("recent_empty")}</p>
                  ) : (
                    <RecentActivity items={recent} />
                  )}
                </div>
              </div>
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
