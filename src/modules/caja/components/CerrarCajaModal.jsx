import React, { useState, useEffect } from "react";
import { db } from "../../../firebase/firebaseConfig";
import {
  collection,
  query,
  onSnapshot,
  orderBy,
  doc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { FiX, FiLock, FiAlertTriangle, FiCheckCircle, FiTrendingUp, FiTrendingDown } from "react-icons/fi";

const fmt = (n) =>
  Number(n || 0).toLocaleString("es-CO", {
    style: "currency", currency: "COP", maximumFractionDigits: 0,
  });

const fmtPure = (n) => new Intl.NumberFormat("es-CO").format(n);

const fmtDate = (ts) => {
  if (!ts) return "—";
  try {
    const d = ts?.toDate ? ts.toDate() : new Date(ts);
    return d.toLocaleString("es-CO", {
      day: "2-digit", month: "2-digit", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  } catch { return "—"; }
};

export default function CerrarCajaModal({ caja, inquilino, userProfile, onClose, onSuccess }) {
  const [movimientos, setMovimientos] = useState([]);
  const [loadingMov, setLoadingMov] = useState(true);
  
  // Conteo form
  const [conteoEfectivo, setConteoEfectivo] = useState("");
  const [conteoEfectivoDisplay, setConteoEfectivoDisplay] = useState("");
  const [conteoOtros, setConteoOtros] = useState("");
  const [conteoOtrosDisplay, setConteoOtrosDisplay] = useState("");
  
  const [observacion, setObservacion] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [confirmed, setConfirmed] = useState(false);

  // Real-time movimientos
  useEffect(() => {
    const q = query(
      collection(db, "cajas", caja.id, "movimientos"),
      orderBy("fecha", "desc")
    );
    setLoadingMov(true);
    const unsub = onSnapshot(q, snap => {
      setMovimientos(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoadingMov(false);
    }, () => setLoadingMov(false));
    return () => unsub();
  }, [caja.id]);

  // Calculated values
  const totalIngresos = movimientos.filter(m => m.tipo === "ingreso").reduce((s, m) => s + (m.monto || 0), 0);
  const totalEgresos = movimientos.filter(m => m.tipo === "egreso").reduce((s, m) => s + (m.monto || 0), 0);
  const saldoTeorico = (caja.baseInicial || 0) + totalIngresos - totalEgresos;

  const conteoEfNum = parseFloat(String(conteoEfectivo).replace(/[^0-9]/g, "")) || 0;
  const conteoOtrosNum = parseFloat(String(conteoOtros).replace(/[^0-9]/g, "")) || 0;
  const conteoTotal = conteoEfNum + conteoOtrosNum;
  const diferencia = conteoTotal - saldoTeorico;

  const handleCerrar = async () => {
    if (!confirmed) { setError("Confirma que has realizado el conteo físico."); return; }
    setSaving(true);
    setError("");
    try {
      await updateDoc(doc(db, "cajas", caja.id), {
        estado: "cerrada",
        fechaCierre: serverTimestamp(),
        conteoEfectivo: conteoEfNum,
        conteoOtros: conteoOtrosNum,
        conteoTotal,
        saldoTeorico,
        diferencia,
        totalIngresos,
        totalEgresos,
        observacionCierre: observacion.trim(),
        cierradoPor: userProfile?.nombre || userProfile?.email || "Usuario",
        cierradoPorId: userProfile?.uid || "",
      });
      onSuccess?.();
    } catch (err) {
      console.error("Error cerrando caja:", err);
      setError("No se pudo cerrar la caja. Intenta nuevamente.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
      <div 
        className="bg-white w-full max-w-[640px] rounded-[32px] shadow-[0_20px_70px_rgba(0,0,0,0.3)] overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0">
          <div>
            <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight flex items-center gap-2">
              <FiLock className="text-rose-500" /> Cierre de <span className="text-rose-600">Caja</span>
            </h3>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1">
              Responsable: {caja.usuarioNombre || caja.nombre} · Apertura: {fmtDate(caja.fechaApertura)}
            </p>
          </div>
          <button 
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-2xl bg-white border border-slate-200 text-slate-400 hover:text-rose-500 hover:border-rose-100 transition-all shadow-sm"
          >
            <FiX size={20} />
          </button>
        </div>

        {/* Content body */}
        <div className="p-8 space-y-6 overflow-y-auto custom-scrollbar">
          {error && (
            <div className="bg-rose-50 border border-rose-100 rounded-2xl p-4 text-rose-600 text-[13px] font-bold">
              ⚠️ {error}
            </div>
          )}

          {/* Warning */}
          <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 flex items-start gap-4">
            <FiAlertTriangle className="text-amber-500 shrink-0 mt-1" size={18} />
            <p className="text-[13px] font-medium text-amber-700 leading-relaxed">
              Al cerrar la caja ya <strong className="font-black">no se podrán registrar más movimientos</strong>. El sistema registrará la diferencia actual automáticamente.
            </p>
          </div>

          {/* KPI Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Base Inicial", val: fmt(caja.baseInicial || 0), color: "text-slate-600", bg: "bg-slate-50" },
              { label: "Ingresos", val: fmt(totalIngresos), color: "text-emerald-600", bg: "bg-emerald-50" },
              { label: "Egresos", val: fmt(totalEgresos), color: "text-rose-600", bg: "bg-rose-50" },
              { label: "Saldo Teórico", val: fmt(saldoTeorico), color: "text-blue-600", bg: "bg-blue-50" },
            ].map(k => (
              <div key={k.label} className={`${k.bg} rounded-2xl p-4 border border-white/50 shadow-sm`}>
                <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{k.label}</div>
                <div className={`text-sm font-black truncate ${k.color}`}>{k.val}</div>
              </div>
            ))}
          </div>

          {/* Verification Section */}
          <div className="space-y-4">
             <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Cuadre Físico de Dinero</h4>
             <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                   <label className="text-[10px] font-bold text-slate-500 ml-1">Efectivo Contado (COP) *</label>
                   <div className="relative group">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 pointer-events-none font-bold">$</div>
                      <input
                        type="text"
                        placeholder="0"
                        value={conteoEfectivoDisplay}
                        onChange={(e) => {
                          const raw = e.target.value.replace(/[^0-9]/g, "");
                          setConteoEfectivo(raw);
                          setConteoEfectivoDisplay(raw ? fmtPure(raw) : "");
                        }}
                        className="w-full h-14 pl-10 pr-4 bg-slate-50 border border-slate-200 rounded-2xl text-[14px] font-black text-slate-700 outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-mono"
                        required
                      />
                   </div>
                </div>

                <div className="space-y-2">
                   <label className="text-[10px] font-bold text-slate-500 ml-1">Otros Medios (Transf., etc.)</label>
                   <div className="relative group">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 pointer-events-none font-bold">$</div>
                      <input
                        type="text"
                        placeholder="0"
                        value={conteoOtrosDisplay}
                        onChange={(e) => {
                          const raw = e.target.value.replace(/[^0-9]/g, "");
                          setConteoOtros(raw);
                          setConteoOtrosDisplay(raw ? fmtPure(raw) : "");
                        }}
                        className="w-full h-14 pl-10 pr-4 bg-slate-50 border border-slate-200 rounded-2xl text-[14px] font-black text-slate-700 outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-mono"
                        required
                      />
                   </div>
                </div>
             </div>
          </div>

          {/* Difference Result Card */}
          {(conteoEfectivo || conteoOtros) && (
            <div className={`p-6 rounded-[24px] border border-slate-100 flex items-center gap-6 shadow-xl shadow-slate-200/40 animate-in slide-in-from-bottom-4
              ${diferencia === 0 ? 'bg-emerald-50/50' : diferencia > 0 ? 'bg-blue-50/50' : 'bg-rose-50/50'}`}
            >
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shrink-0
                ${diferencia === 0 ? 'bg-emerald-500 text-white' : diferencia > 0 ? 'bg-blue-500 text-white' : 'bg-rose-500 text-white'}`}
              >
                {diferencia === 0 ? <FiCheckCircle /> : diferencia > 0 ? <FiTrendingUp /> : <FiTrendingDown />}
              </div>
              
              <div className="flex-1">
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Diferencia Final</div>
                <div className={`text-2xl font-black ${diferencia === 0 ? 'text-emerald-600' : diferencia > 0 ? 'text-blue-600' : 'text-rose-600'}`}>
                   {diferencia >= 0 ? '+' : ''}{fmt(diferencia)}
                </div>
                <p className="text-[11px] font-bold text-slate-500 mt-1 uppercase">
                   {diferencia === 0 ? "✓ Cuadre Perfecto" : diferencia > 0 ? "📈 Sobrante detectado" : "⚠️ Faltante detectado"}
                </p>
              </div>

              <div className="text-right border-l border-slate-200/50 pl-6 shrink-0">
                 <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Contado</div>
                 <div className="text-xl font-black text-slate-800">{fmt(conteoTotal)}</div>
              </div>
            </div>
          )}

          {/* Observación */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Justificación / Novedades</label>
            <textarea
              value={observacion}
              onChange={(e) => setObservacion(e.target.value)}
              rows={2}
              placeholder="Notas sobre el cierre, faltantes, sobrantes..."
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-[14px] font-medium text-slate-700 outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all resize-none shadow-sm"
            />
          </div>

          {/* Confirmation */}
          <label className={`flex items-center gap-4 p-5 rounded-2xl border transition-all cursor-pointer group
            ${confirmed ? 'bg-emerald-50 border-emerald-200 shadow-lg shadow-emerald-500/5' : 'bg-slate-50 border-slate-100'}`}
          >
             <input 
               type="checkbox" 
               className="w-6 h-6 accent-emerald-500 rounded-lg cursor-pointer" 
               checked={confirmed}
               onChange={e => setConfirmed(e.target.checked)}
             />
             <span className={`text-[13px] font-bold ${confirmed ? 'text-emerald-700' : 'text-slate-500'}`}>
                Declaro que he realizado el conteo físico detallado y los valores son correctos.
             </span>
          </label>
        </div>

        {/* Footer Actions */}
        <div className="px-8 py-6 border-t border-slate-50 bg-white flex gap-4 shrink-0">
          <button 
            onClick={onClose}
            className="flex-1 h-14 rounded-2xl border border-slate-200 text-slate-500 text-[12px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all active:scale-95"
          >
            Saldar después
          </button>
          <button 
            onClick={handleCerrar}
            disabled={saving || !confirmed}
            className="flex-[2] h-14 bg-rose-600 text-white rounded-2xl text-[12px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-rose-700 shadow-xl shadow-rose-500/30 transition-all active:scale-95 disabled:opacity-50"
          >
            {saving ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>🔒 Cerrar Turno Definitivo</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
