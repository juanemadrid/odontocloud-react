import React, { useState } from "react";
import { db } from "../../../firebase/firebaseConfig";
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  serverTimestamp,
} from "firebase/firestore";
import { FiUser, FiX, FiCheck, FiLayout, FiAlertCircle } from "react-icons/fi";

const fmtPure = (n) => new Intl.NumberFormat("es-CO").format(n);

export default function AbrirCajaModal({ inquilino, userProfile, onClose, onSuccess }) {
  const [form, setForm] = useState({
    userId: userProfile?.uid || "",
    userName: userProfile?.nombre || userProfile?.email || "Usuario",
    nombreCaja: "Caja Principal", // Identificador por defecto del punto físico
    baseActual: 0,
    ajustarBase: "",
    ajustarBaseDisplay: "",
    observacion: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.userId) {
      setError("No se detectó un usuario válido en la sesión.");
      return;
    }
    if (!form.nombreCaja.trim()) {
      setError("Indica un nombre o identificador para este punto de venta.");
      return;
    }
    
    setSaving(true);
    setError("");

    try {
      // 1. Validar si ya existe una caja abierta para este usuario
      const q = query(
        collection(db, "cajas"),
        where("inquilino", "==", inquilino),
        where("usuarioId", "==", form.userId),
        where("estado", "==", "abierta")
      );
      
      const snap = await getDocs(q);
      
      if (!snap.empty) {
        setError("Ya tienes una caja abierta. Debos cerrar la anterior antes de abrir una nueva.");
        setSaving(false);
        return;
      }

      const base = parseFloat(String(form.ajustarBase).replace(/[^0-9]/g, "")) || 0;

      await addDoc(collection(db, "cajas"), {
        inquilino,
        nombre: form.nombreCaja.trim(),
        tipo: "efectivo",
        baseInicial: base,
        saldoInicial: base,
        saldoActual: base,
        estado: "abierta",
        esCierreSimulado: false,
        observacion: form.observacion.trim(),
        usuarioId: form.userId,
        usuarioNombre: form.userName,
        fechaApertura: serverTimestamp(),
        movimientos: [],
      });
      onSuccess?.();
    } catch (err) {
      console.error("Error abriendo caja:", err);
      setError("No se pudo abrir la caja. Intenta nuevamente.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
      <div 
        className="bg-white w-full max-w-[480px] rounded-[32px] shadow-[0_20px_70px_rgba(0,0,0,0.3)] overflow-hidden animate-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">
              Abrir <span className="text-blue-600">Caja</span>
            </h3>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1">
              Iniciar nuevo turno operativo
            </p>
          </div>
          <button 
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-2xl bg-white border border-slate-200 text-slate-400 hover:text-rose-500 hover:border-rose-100 transition-all shadow-sm"
          >
            <FiX size={20} />
          </button>
        </div>

        {/* Form body */}
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {error && (
            <div className="bg-rose-50 border border-rose-100 rounded-2xl p-4 flex items-center gap-3 text-rose-600 text-[13px] font-bold animate-pulse">
              <span>⚠️</span> {error}
            </div>
          )}

          {/* User & Box Identity */}
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">
                Usuario responsable
              </label>
              <div className="w-full h-14 pl-12 pr-4 flex items-center bg-blue-50/30 border border-blue-100/50 rounded-2xl text-[14px] font-bold text-blue-700 relative">
                  <FiUser className="absolute left-4 text-blue-500" size={18} />
                  {form.userName}
                  <span className="absolute right-4 text-[9px] font-black bg-blue-600 text-white px-2 py-0.5 rounded-full uppercase tracking-widest">Sesión</span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">
                Identificador del Punto de Venta *
              </label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors pointer-events-none">
                  <FiLayout size={18} />
                </div>
                <input
                  type="text"
                  placeholder="Ej: Recepción, Punto Principal..."
                  value={form.nombreCaja}
                  onChange={(e) => setForm({ ...form, nombreCaja: e.target.value })}
                  className="w-full h-14 pl-12 pr-4 bg-slate-50 border border-slate-200 rounded-2xl text-[14px] font-bold text-slate-700 outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all shadow-sm"
                  required
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Base actual (Display Only) */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">
                Base actual
              </label>
              <div className="h-14 flex items-center px-4 bg-slate-100/40 border border-slate-100 rounded-2xl text-[14px] font-black text-slate-300">
                $ 0
              </div>
            </div>

            {/* Ajustar base */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">
                Ajustar base inicial *
              </label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors pointer-events-none font-bold">
                  $
                </div>
                <input
                  type="text"
                  placeholder="0"
                  value={form.ajustarBaseDisplay}
                  onChange={(e) => {
                    const raw = e.target.value.replace(/[^0-9]/g, "");
                    setForm({ 
                      ...form, 
                      ajustarBase: raw, 
                      ajustarBaseDisplay: raw ? fmtPure(raw) : "" 
                    });
                  }}
                  className="w-full h-14 pl-10 pr-4 bg-slate-50 border border-slate-200 rounded-2xl text-[14px] font-black text-slate-700 outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-mono"
                  required
                />
              </div>
            </div>
          </div>

          {/* Observación */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">
              Observaciones del turno
            </label>
            <textarea
              value={form.observacion}
              onChange={(e) => setForm({ ...form, observacion: e.target.value })}
              rows={2}
              placeholder="Ej: Inicio de jornada, turno tarde..."
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-[14px] font-medium text-slate-700 outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all resize-none shadow-sm"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-4 pt-4 border-t border-slate-50">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 h-14 rounded-2xl border border-slate-200 text-slate-500 text-[12px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all active:scale-95"
            >
              Cerrar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-[2] h-14 bg-blue-600 text-white rounded-2xl text-[12px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-blue-700 shadow-xl shadow-blue-500/30 transition-all active:scale-95 disabled:opacity-50 font-black"
            >
              {saving ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>Abrir Caja <FiCheck size={18} /></>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
