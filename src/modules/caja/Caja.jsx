// src/modules/caja/Caja.jsx
// ============================================================
// 🏦 Módulo de Caja - OdontoCloud
// Conectado en tiempo real con Firebase, pacientes y facturas.
// Sin índices compuestos (sort client-side).
// ============================================================
import React, { useState, useEffect, useCallback } from "react";
import { 
  FiDollarSign, FiPlus, FiCheckCircle, FiLock, 
  FiUser, FiBarChart2, FiBriefcase, FiSearch, 
  FiEye, FiXSquare, FiRefreshCcw
} from "react-icons/fi";
import { db } from "../../firebase/firebaseConfig";
import { useAuth } from "../../context/AuthContext";
import {
  collection,
  query,
  where,
  onSnapshot,
} from "firebase/firestore";

import AbrirCajaModal from "./components/AbrirCajaModal";
import CajaDetalleModal from "./components/CajaDetalleModal";
import CerrarCajaModal from "./components/CerrarCajaModal";
import MovimientoModal from "./components/MovimientoModal";
import BancosView from "./components/BancosView";

/* ─── Helpers ─── */
const fmt = (n) =>
  Number(n || 0).toLocaleString("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  });

const fmtDate = (ts) => {
  if (!ts) return "—";
  try {
    const d = ts?.toDate ? ts.toDate() : new Date(ts);
    return d.toLocaleString("es-CO", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch { return "—"; }
};

/* ─── Sidebar items ─── */
const MENU_ITEMS = [
  { id: "abrir", label: "Abrir caja", icon: <FiPlus />, isAction: true },
  { id: "abiertas", label: "Cajas abiertas", icon: <FiCheckCircle /> },
  { id: "cerradas", label: "Cajas cerradas", icon: <FiLock /> },
  { id: "mi-caja", label: "Mi caja", icon: <FiUser /> },
  { id: "bancos", label: "Bancos", icon: <FiBriefcase /> },
];

/* ─── Status Badge ─── */
function StatusBadge({ estado }) {
  const lower = (estado || "").toLowerCase();
  const styles = {
    abierta: { bg: "#ecfdf5", color: "#065f46", border: "#a7f3d0", dot: "#10b981" },
    cerrada: { bg: "#fff1f2", color: "#9f1239", border: "#fecdd3", dot: "#f43f5e" },
    simulado: { bg: "#fffbeb", color: "#92400e", border: "#fde68a", dot: "#f59e0b" },
  };
  const s = styles[lower] || { bg: "#f8fafc", color: "#475569", border: "#e2e8f0", dot: "#94a3b8" };
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      padding: "3px 10px", borderRadius: 999, fontSize: 11,
      fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.07em",
      background: s.bg, color: s.color, border: `1px solid ${s.border}`,
    }}>
      <span style={{
        width: 6, height: 6, borderRadius: "50%",
        background: s.dot,
        animation: lower === "abierta" ? "pulse 1.5s infinite" : "none",
      }} />
      {estado || "—"}
    </span>
  );
}

/* ─── Main Component ─── */
export default function Caja() {
  const { userProfile } = useAuth();
  const inquilino = userProfile?.inquilino || "";
  const userId = userProfile?.uid || "";
  const userName = userProfile?.nombre || userProfile?.email || "Usuario";

  const [activeMenu, setActiveMenu] = useState("abiertas");
  const [allCajas, setAllCajas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Modals
  const [showAbrirModal, setShowAbrirModal] = useState(false);
  const [selectedCaja, setSelectedCaja] = useState(null);
  const [showDetalle, setShowDetalle] = useState(false);
  const [showCerrar, setShowCerrar] = useState(false);
  const [showMovimiento, setShowMovimiento] = useState(false);

  // Escuchar el evento de reset desde el sidebar
  useEffect(() => {
    const handleReset = () => {
      setActiveMenu("abiertas");
      setSearch("");
      setShowAbrirModal(false);
      setSelectedCaja(null);
      setShowDetalle(false);
      setShowCerrar(false);
      setShowMovimiento(false);
    };
    window.addEventListener("reset-module-caja", handleReset);
    return () => {
      window.removeEventListener("reset-module-caja", handleReset);
    };
  }, []);

  /* ─── Load ALL cajas in real-time (single query, filter client-side) ─── */
  useEffect(() => {
    if (!inquilino) {
      setLoading(false);
      return;
    }

    setLoading(true);
    // Simple query - no composite index needed
    const q = query(
      collection(db, "cajas"),
      where("inquilino", "==", inquilino)
    );

    const unsub = onSnapshot(
      q,
      (snap) => {
        const data = snap.docs
          .map((d) => ({ id: d.id, ...d.data() }))
          // Sort client-side DESC by fechaApertura
          .sort((a, b) => {
            const ta = a.fechaApertura?.seconds || 0;
            const tb = b.fechaApertura?.seconds || 0;
            return tb - ta;
          });
        setAllCajas(data);
        setLoading(false);
      },
      (err) => {
        console.error("Error cargando cajas:", err);
        setAllCajas([]);
        setLoading(false);
      }
    );

    return () => unsub();
  }, [inquilino]);

  /* ─── Filter by active menu ─── */
  const cajasFiltradas = (() => {
    let list = allCajas;
    if (activeMenu === "abiertas") list = allCajas.filter(c => c.estado === "abierta");
    else if (activeMenu === "cerradas") list = allCajas.filter(c => c.estado === "cerrada");
    else if (activeMenu === "mi-caja") list = allCajas.filter(c => c.usuarioId === userId || c.usuarioNombre === userName);
    else if (activeMenu === "bancos") list = allCajas.filter(c => (c.tipo || "").toLowerCase() === "banco");

    // Text search
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(c =>
        (c.usuarioNombre || "").toLowerCase().includes(q) ||
        (c.nombre || "").toLowerCase().includes(q) ||
        (c.tipo || "").toLowerCase().includes(q)
      );
    }
    return list;
  })();

  /* ─── Stats from ALL cajas ─── */
  const stats = {
    abiertas: allCajas.filter(c => c.estado === "abierta").length,
    cerradas: allCajas.filter(c => c.estado === "cerrada").length,
    totalSaldo: allCajas
      .filter(c => c.estado === "abierta")
      .reduce((s, c) => s + (c.saldoActual || 0), 0),
  };

  /* ─── Handlers ─── */
  const handleMenuClick = (id) => {
    if (id === "abrir") { setShowAbrirModal(true); return; }
    setActiveMenu(id);
    setSearch("");
  };

  const pageTitle = {
    abiertas: "Cajas Abiertas",
    cerradas: "Cajas Cerradas",
    "mi-caja": "Mi Caja",
    bancos: "Bancos",
  }[activeMenu] || "Cajas";

  return (
    <div className="flex flex-col bg-slate-50 h-[calc(100vh-60px)] overflow-hidden">
      
      {/* HEADER AREA (Top Level - Match Pacientes Alignment) */}
      <div className="px-2 md:px-4 lg:px-6 pb-2 shrink-0 no-print">
          <div className="flex flex-col gap-6">
              <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-8">
                  <div className="space-y-2">
                      <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                          <FiDollarSign className="text-blue-600" />
                          <span>Institucional</span>
                          <span className="text-slate-200">/</span>
                          <span className="text-slate-800">Finanzas</span>
                      </div>
                      <div className="flex items-end gap-4">
                          <h2 className="text-3xl font-black text-slate-800 uppercase tracking-tight leading-none">
                              Gestión <span className="text-blue-600">Caja</span>
                          </h2>
                      </div>
                      <div className="w-12 h-1.5 bg-blue-600 rounded-full" />
                  </div>
              </div>
          </div>
      </div>

      {/* CONTENT ROW (Sidebar + View) */}
      <div className="flex flex-1 min-h-0 px-2 md:px-4 lg:px-6 pb-6 relative">
      
      {/* ─── SIDEBAR ─── */}
      <aside className="no-print w-[240px] shrink-0 bg-white border-r border-slate-100 rounded-l-[32px] shadow-[0_1px_2px_0_rgba(0,0,0,0.05)] flex flex-col py-6 z-10">
        <div className="px-6 pb-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
          Menú Principal
        </div>

        <div className="px-3 flex flex-col gap-1">
          {MENU_ITEMS.map((item) => {
            const isActive = !item.isAction && activeMenu === item.id;
            
            if (item.isAction) {
              return (
                <button
                  key={item.id}
                  onClick={() => handleMenuClick(item.id)}
                  className="w-full bg-blue-600 text-white px-5 py-3 rounded-[18px] font-black text-[11px] uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-blue-700 shadow-lg shadow-blue-500/30 transition-all active:scale-95 border-0 mb-4"
                >
                  <span className="text-lg">{item.icon}</span> {item.label}
                </button>
              );
            }
            
            return (
              <button
                key={item.id}
                onClick={() => handleMenuClick(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-[12px] font-bold transition-all rounded-[14px] border border-transparent ${
                  isActive 
                    ? "bg-slate-50 text-blue-600 border-slate-100 shadow-sm" 
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
                }`}
              >
                <span className={`text-[16px] ${isActive ? "text-blue-600" : "text-slate-400"}`}>{item.icon}</span>
                {item.label}
              </button>
            );
          })}
        </div>

        {/* Info badge */}
        <div className="mt-auto px-4">
          <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-4 text-[11px] text-blue-700 flex flex-col gap-1 shadow-sm">
            <span className="font-bold flex items-center gap-1.5"><div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" /> {stats.abiertas} caja{stats.abiertas !== 1 ? "s" : ""} activa{stats.abiertas !== 1 ? "s" : ""}</span>
            <span className="font-black text-blue-600 text-sm mt-1">{fmt(stats.totalSaldo)}</span>
          </div>
        </div>
      </aside>

      {/* ─── MAIN CONTENT ─── */}
      <div className="flex-1 flex flex-col min-w-0 bg-slate-50 overflow-hidden pl-6">
        
        {/* Stats strip */}
        {activeMenu !== "bancos" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6 shrink-0">
            {[
              { label: "Cajas Abiertas", val: stats.abiertas, color: "text-emerald-600", bg: "bg-emerald-50", icon: <FiCheckCircle className="text-emerald-500" /> },
              { label: "Cajas Cerradas", val: stats.cerradas, color: "text-rose-600", bg: "bg-rose-50", icon: <FiLock className="text-rose-500" /> },
              { label: "Saldo Activo", val: fmt(stats.totalSaldo), color: "text-blue-600", bg: "bg-blue-50", icon: <FiDollarSign className="text-blue-500" /> },
            ].map((s) => (
              <div key={s.label} className="flex items-center gap-4 bg-white p-5 rounded-[24px] border border-slate-100 shadow-[0_8px_30px_rgba(0,0,0,0.02)] transition-all hover:shadow-md">
                <div className={`w-14 h-14 flex items-center justify-center rounded-[18px] text-2xl shrink-0 ${s.bg}`}>
                  {s.icon}
                </div>
                <div className="min-w-0 flex flex-col justify-center">
                  <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">{s.label}</span>
                  <span className={`text-2xl font-black ${s.color} leading-none mt-1.5 truncate`}>{s.val}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeMenu === "bancos" ? (
          <BancosView inquilino={inquilino} userProfile={userProfile} />
        ) : (
          /* Card: Table */
          <div className="flex-1 flex flex-col bg-white rounded-[32px] border border-slate-100 shadow-[0_8px_30px_rgba(0,0,0,0.02)] overflow-hidden min-h-0">
            
            {/* Toolbar */}
            <div className="px-8 py-6 flex items-center justify-between border-b border-slate-50 bg-slate-50/30 shrink-0">
              <h2 className="text-lg font-black text-slate-800 flex items-center gap-3">
                {pageTitle}
                <span className="text-[11px] font-bold bg-blue-100 text-blue-700 px-3 py-1 rounded-full">{cajasFiltradas.length}</span>
              </h2>
              <div className="flex items-center gap-4">
                <div className="relative group">
                  <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={16} />
                  <input
                    type="text"
                    placeholder="Buscar caja..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="h-11 pl-11 pr-4 rounded-xl border border-slate-200 text-[13px] outline-none w-[220px] bg-slate-50 text-slate-700 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-medium placeholder:text-slate-400"
                  />
                </div>
                <button
                  onClick={() => setShowAbrirModal(true)}
                  className="h-11 px-6 bg-blue-600 text-white border-none rounded-[14px] font-black text-[12px] uppercase tracking-wider flex items-center gap-2 hover:bg-blue-700 shadow-lg shadow-blue-500/30 transition-all active:scale-95"
                >
                  <FiPlus size={18} /> Abrir Caja
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
              {loading ? (
                <div className="flex flex-col items-center justify-center p-20 text-slate-400">
                  <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
                  <div className="text-[13px] font-bold">Cargando cajas...</div>
                </div>
              ) : (
                <table className="w-full border-collapse">
                  <thead className="sticky top-0 z-10 bg-white">
                    <tr>
                      {[
                        { label: "Caja / Responsable", w: "auto" },
                        { label: "Fecha apertura", w: 160 },
                        { label: "Base inicial", w: 120 },
                        { label: "Ingresos", w: 120 },
                        { label: "Egresos", w: 120 },
                        { label: "Saldo actual", w: 130 },
                        { label: "Estado", w: 110 },
                        { label: "Acciones", w: 110 },
                      ].map((h) => (
                        <th key={h.label} style={{ width: h.w }} className="px-4 py-3 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest border-b-2 border-slate-100 bg-white">
                          {h.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {cajasFiltradas.length === 0 ? (
                      <tr>
                        <td colSpan="8" className="p-16 text-center">
                          <div className="flex flex-col items-center justify-center text-slate-400">
                            <FiBriefcase size={48} className="text-slate-200 mb-4" />
                            <h3 className="text-lg font-bold text-slate-600">No hay cajas registradas</h3>
                            <p className="text-sm mt-1">Usa el botón "Abrir Caja" para comenzar.</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      cajasFiltradas.map((caja) => (
                        <tr key={caja.id} className="hover:bg-blue-50/30 transition-colors group">
                          <td className="px-4 py-4 align-middle">
                            <div className="font-bold text-slate-800 text-[13px]">
                              {caja.usuarioNombre || caja.nombre || "—"}
                            </div>
                            {caja.nombre && caja.usuarioNombre && caja.nombre !== caja.usuarioNombre && (
                              <div className="text-[11px] text-slate-400 font-medium mt-0.5">
                                {caja.nombre}
                              </div>
                            )}
                            {caja.tipo && (
                              <span className="inline-block mt-1.5 px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded text-[9px] font-black uppercase tracking-widest">
                                {caja.tipo}
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-4 align-middle text-[12px] font-semibold text-slate-500 whitespace-nowrap">
                            {fmtDate(caja.fechaApertura)}
                          </td>
                          <td className="px-4 py-4 align-middle text-[13px] font-bold text-slate-600">
                            {fmt(caja.baseInicial || 0)}
                          </td>
                          <td className="px-4 py-4 align-middle text-[13px] font-bold text-emerald-600">
                            {fmt(caja.totalIngresos || 0)}
                          </td>
                          <td className="px-4 py-4 align-middle text-[13px] font-bold text-rose-600">
                            {fmt(caja.totalEgresos || 0)}
                          </td>
                          <td className="px-4 py-4 align-middle">
                            <span className={`text-[14px] font-black ${(caja.saldoActual || 0) >= 0 ? "text-blue-600" : "text-rose-600"}`}>
                              {fmt(caja.saldoActual || 0)}
                            </span>
                          </td>
                          <td className="px-4 py-4 align-middle">
                            <StatusBadge estado={caja.estado || "abierta"} />
                          </td>
                          <td className="px-4 py-4 align-middle">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => { setSelectedCaja(caja); setShowDetalle(true); }}
                                className="w-8 h-8 rounded-lg bg-slate-50 text-slate-400 hover:bg-blue-50 hover:text-blue-600 flex items-center justify-center transition-all"
                                title="Ver movimientos"
                              >
                                <FiEye size={15} />
                              </button>

                              {caja.estado === "abierta" && (
                                <button
                                  onClick={() => { setSelectedCaja(caja); setShowMovimiento(true); }}
                                  className="w-8 h-8 rounded-lg bg-slate-50 text-slate-400 hover:bg-emerald-50 hover:text-emerald-600 flex items-center justify-center transition-all"
                                  title="Registrar movimiento"
                                >
                                  <FiDollarSign size={15} />
                                </button>
                              )}

                              {caja.estado === "abierta" && (
                                <button
                                  onClick={() => { setSelectedCaja(caja); setShowCerrar(true); }}
                                  className="w-8 h-8 rounded-lg bg-slate-50 text-slate-400 hover:bg-rose-50 hover:text-rose-600 flex items-center justify-center transition-all"
                                  title="Cerrar caja"
                                >
                                  <FiXSquare size={15} />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}
      </div>
      {/* ─── END CONTENT ROW ─── */}
      </div>

      {/* ─── MODALS ─── */}
      {showAbrirModal && (
        <AbrirCajaModal
          inquilino={inquilino}
          userProfile={userProfile}
          onClose={() => setShowAbrirModal(false)}
          onSuccess={() => { setShowAbrirModal(false); setActiveMenu("abiertas"); }}
        />
      )}

      {showDetalle && selectedCaja && (
        <CajaDetalleModal
          caja={selectedCaja}
          inquilino={inquilino}
          userProfile={userProfile}
          onClose={() => { setShowDetalle(false); setSelectedCaja(null); }}
          onNuevoMovimiento={() => { setShowDetalle(false); setShowMovimiento(true); }}
        />
      )}

      {showCerrar && selectedCaja && (
        <CerrarCajaModal
          caja={selectedCaja}
          inquilino={inquilino}
          userProfile={userProfile}
          onClose={() => { setShowCerrar(false); setSelectedCaja(null); }}
          onSuccess={() => { setShowCerrar(false); setSelectedCaja(null); }}
        />
      )}

      {showMovimiento && selectedCaja && (
        <MovimientoModal
          caja={selectedCaja}
          inquilino={inquilino}
          userProfile={userProfile}
          onClose={() => { setShowMovimiento(false); setSelectedCaja(null); }}
          onSuccess={() => { setShowMovimiento(false); setSelectedCaja(null); }}
        />
      )}

      <style>{`
        @keyframes cajaSpin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100%{ opacity:1 } 50%{ opacity:0.4 } }
      `}</style>
    </div>
  );
}

