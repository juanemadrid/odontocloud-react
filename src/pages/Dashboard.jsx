// ===============================
// 🦷 Dashboard.jsx - Panel principal OdontoCloud
// ===============================
import React, { useEffect, useState } from "react";
import "../styles/dashboard.css"; 

// MÓDULOS PRINCIPALES
import Agenda from "../modules/agenda/Agenda";
import Facturacion from "../modules/facturacion/Facturacion";
import Inventario from "../modules/inventario/Inventario";
import Odontograma from "../modules/odontograma/Odontograma";
import Pacientes from "../modules/pacientes/Pacientes";
import Reportes from "../modules/reportes/Reportes";


import QuickCharts from "../components/QuickCharts";
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
} from "firebase/firestore";

import logo from "/assets/logo.png";

// =============== i18n sencillo (es/en) ===============
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
    enEspera: 0,
  });
  const [metricsLoading, setMetricsLoading] = useState(true);

  // ===== serie semanal para el gráfico =====
  const [weeklySeries, setWeeklySeries] = useState([]);

  useEffect(() => {
    const loadMetricsAndWeekly = async () => {
      try {
        // Pacientes totales
        const pacientesCountSnap = await getCountFromServer(
          collection(db, "pacientes")
        );
        const pacientesTotal = pacientesCountSnap.data().count || 0;

        const today = new Date();
        const startToday = new Date(
          today.getFullYear(),
          today.getMonth(),
          today.getDate()
        );
        const endToday = new Date(
          today.getFullYear(),
          today.getMonth(),
          today.getDate() + 1
        );

        // Citas de hoy
        let citasHoy = 0;
        try {
          const qCitasToday = query(
            collection(db, "citas"),
            where("fecha", ">=", Timestamp.fromDate(startToday)),
            where("fecha", "<", Timestamp.fromDate(endToday))
          );
          const citasSnapToday = await getDocs(qCitasToday);
          citasHoy = citasSnapToday.size;
        } catch {
          citasHoy = 0;
        }

        // Facturación de hoy
        let facturacionHoy = 0;
        try {
          const qFact = query(
            collection(db, "facturas"),
            where("fecha", ">=", Timestamp.fromDate(startToday)),
            where("fecha", "<", Timestamp.fromDate(endToday))
          );
          const factSnap = await getDocs(qFact);
          factSnap.forEach((docu) => {
            const data = docu.data();
            if (typeof data.monto === "number") facturacionHoy += data.monto;
          });
        } catch {
          facturacionHoy = 0;
        }

        // Sala de espera
        let enEspera = 0;
        try {
          const esperaSnap = await getCountFromServer(
            collection(db, "sala_espera")
          );
          enEspera = esperaSnap.data().count || 0;
        } catch {
          enEspera = 0;
        }

        setMetrics({
          pacientesHoy: pacientesTotal,
          citasHoy,
          facturacionHoy,
          enEspera,
        });

        // ===== serie última semana =====
        try {
          const startWeek = new Date(
            today.getFullYear(),
            today.getMonth(),
            today.getDate() - 6
          );
          const endWeek = new Date(
            today.getFullYear(),
            today.getMonth(),
            today.getDate() + 1
          );

          const qWeek = query(
            collection(db, "citas"),
            where("fecha", ">=", Timestamp.fromDate(startWeek)),
            where("fecha", "<", Timestamp.fromDate(endWeek))
          );
          const weekSnap = await getDocs(qWeek);

          // mapa por fecha YYYY-MM-DD
          const countsByDay = new Map();

          const opts = { weekday: "short", day: "2-digit" };

          for (let i = 0; i < 7; i++) {
            const d = new Date(
              today.getFullYear(),
              today.getMonth(),
              today.getDate() - (6 - i)
            );
            const key = d.toISOString().slice(0, 10);
            const shortLabel = d
              .toLocaleDateString(locale === "es" ? "es-ES" : "en-US", opts)
              .replace(".", "");
            countsByDay.set(key, {
              label: d.toLocaleDateString(
                locale === "es" ? "es-ES" : "en-US"
              ),
              shortLabel,
              value: 0,
            });
          }

          weekSnap.forEach((docu) => {
            const data = docu.data();
            if (!data.fecha) return;
            const date = data.fecha.toDate
              ? data.fecha.toDate()
              : new Date(data.fecha);
            const key = date.toISOString().slice(0, 10);
            if (!countsByDay.has(key)) return;
            const entry = countsByDay.get(key);
            entry.value += 1;
            countsByDay.set(key, entry);
          });

          setWeeklySeries(Array.from(countsByDay.values()));
        } catch (e) {
          console.error("Error cargando serie semanal:", e);
          setWeeklySeries([]);
        }
      } catch (e) {
        console.error("Error cargando métricas:", e);
        setMetrics({
          pacientesHoy: 0,
          citasHoy: 0,
          facturacionHoy: 0,
          enEspera: 0,
        });
        setWeeklySeries([]);
      } finally {
        setMetricsLoading(false);
      }
    };

    loadMetricsAndWeekly();
  }, [locale]);

  // ===== actividad reciente =====
  const [recent, setRecent] = useState([]);
  const [recentLoading, setRecentLoading] = useState(true);

  useEffect(() => {
    const loadRecent = async () => {
      try {
        const qAct = query(
          collection(db, "actividad"),
          orderBy("fecha", "desc"),
          limit(5)
        );
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
          setN8nState({
            connected: false,
            flowsRunning: 0,
            lastError: null,
          });
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
            <span className="oc-brand-sub">
              {loadingUser ? "..." : companyName}
            </span>
          </div>
        </div>

        <nav className="oc-nav">
          <button
            className={
              activeModule === "Inicio" ? "oc-nav-btn active" : "oc-nav-btn"
            }
            onClick={() => setActiveModule("Inicio")}
          >
            {t("nav_home")}
          </button>
          <button
            className={
              activeModule === "Agenda" ? "oc-nav-btn active" : "oc-nav-btn"
            }
            onClick={() => setActiveModule("Agenda")}
          >
            {t("nav_agenda")}
          </button>
          <button
            className={
              activeModule === "Pacientes" ? "oc-nav-btn active" : "oc-nav-btn"
            }
            onClick={() => setActiveModule("Pacientes")}
          >
            {t("nav_patients")}
          </button>
          <button
            className={
              activeModule === "Facturación"
                ? "oc-nav-btn active"
                : "oc-nav-btn"
            }
            onClick={() => setActiveModule("Facturación")}
          >
            {t("nav_billing")}
          </button>
          <button
            className={
              activeModule === "Inventario"
                ? "oc-nav-btn active"
                : "oc-nav-btn"
            }
            onClick={() => setActiveModule("Inventario")}
          >
            {t("nav_inventory")}
          </button>
          <button
            className={
              activeModule === "Odontograma"
                ? "oc-nav-btn active"
                : "oc-nav-btn"
            }
            onClick={() => setActiveModule("Odontograma")}
          >
            {t("nav_odontogram")}
          </button>
          <button
            className={
              activeModule === "Reportes" ? "oc-nav-btn active" : "oc-nav-btn"
            }
            onClick={() => setActiveModule("Reportes")}
          >
            {t("nav_reports")}
          </button>
        </nav>

        <div className="oc-header-right">
          <input
            className="oc-search"
            placeholder={t("searchPlaceholder")}
          />
          <button
            className="oc-icon-btn"
            type="button"
            onClick={() => setDarkMode((v) => !v)}
          >
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
                  {t("clinicLabel")}: {companyName} · {t("userLabel")}:{" "}
                  {userName} · {t("roleLabel")}: {role || "—"}
                </p>
              </div>

              <div className="oc-hero-badge">
                <span className="oc-hero-badge-title">
                  {t("stats_appointmentsToday")}
                </span>
                <span className="oc-hero-badge-value">
                  {metricsLoading ? "…" : metrics.citasHoy}
                </span>
                <span className="oc-hero-badge-sub">
                  {t("stats_patientsToday")}:{" "}
                  {metricsLoading ? "…" : metrics.pacientesHoy}
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
                <span className="stat-label">
                  {t("stats_appointmentsToday")}
                </span>
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
                  <h3>Pacientes · Última semana</h3>

                  {weeklySeries.length === 0 ||
                  weeklySeries.every((d) => (d?.value || 0) === 0) ? (
                    <p className="oc-weekly-empty">
                      Sin pacientes registrados en la última semana.
                    </p>
                  ) : (
                    <QuickCharts data={weeklySeries} locale={locale} />
                  )}
                </div>
              </div>

              <div className="oc-grid-side">
                <div className="card">
                  <h3>{t("n8n_title")}</h3>
                  {n8nLoading ? (
                    <span className="oc-muted">{t("loading")}</span>
                  ) : (
                    <N8nStatus status={n8nState} />
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
              © {new Date().getFullYear()} OdontoCloud | Creado por Ingeniero
              Juan Madrid
            </footer>
          </div>
        )}
      </main>
    </div>
  );
}

