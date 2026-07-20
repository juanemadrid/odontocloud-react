/**
 * FacturasQuotaPanel.jsx
 * SuperAdmin panel — manage centralized Factus credentials
 * and assign invoice quotas to tenants.
 */
import React, { useState, useEffect } from "react";
import {
  collection, getDocs, query, orderBy,
  doc, getDoc,
} from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";
import { useToast } from "../../context/ToastContext";
import {
  getFactusAdminCredentials,
  saveFactusAdminCredentials,
  getFactusAdminStats,
  assignQuotaToTenant,
} from "../../services/factusAdminService";
import factusService from "../../services/factusService";
import {
  FiSave, FiZap, FiPlus, FiRefreshCw, FiEye, FiEyeOff,
  FiFileText, FiAlertCircle, FiCheckCircle,
} from "react-icons/fi";

const PLAN_PRESETS = [
  { label: "Básico — 300 facturas",    cuota: 300,  plan: "básico" },
  { label: "Estándar — 600 facturas",  cuota: 600,  plan: "estándar" },
  { label: "Premium — 1200 facturas",  cuota: 1200, plan: "premium" },
  { label: "Personalizado",            cuota: 0,    plan: "personalizado" },
];

const inp = "w-full h-10 px-3 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all";

export default function FacturasQuotaPanel() {
  const toast = useToast();

  // ── Credentials form ──
  const [creds, setCreds] = useState({
    factusClientId: "", factusClientSecret: "",
    factusUsername: "", factusPassword: "",
    factusTestMode: true, factusNumberingRangeId: "",
    totalComprado: 0,
  });
  const [showSecret, setShowSecret] = useState(false);
  const [showPass, setShowPass]     = useState(false);
  const [saving, setSaving]         = useState(false);
  const [testing, setTesting]       = useState(false);

  // ── Stats ──
  const [stats, setStats]     = useState({ totalComprado: 0, totalAsignado: 0, totalUsado: 0 });

  // ── Tenants list ──
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);

  // ── Assign modal ──
  const [assignModal, setAssignModal] = useState(null); // { inquilino, nombre }
  const [assignCuota, setAssignCuota] = useState(300);
  const [assignPlan,  setAssignPlan]  = useState("básico");
  const [assignCustom, setAssignCustom] = useState(false);
  const [assigning, setAssigning] = useState(false);

  // ─────────────────────────────────────────
  const loadAll = async () => {
    setLoading(true);
    try {
      const [credsData, statsData, snap] = await Promise.all([
        getFactusAdminCredentials(),
        getFactusAdminStats(),
        getDocs(query(collection(db, "tenants"), orderBy("name"))),
      ]);

      if (credsData) {
        setCreds(prev => ({
          ...prev,
          factusClientId:         credsData.factusClientId         || "",
          factusClientSecret:     credsData.factusClientSecret     || "",
          factusUsername:         credsData.factusUsername         || "",
          factusPassword:         credsData.factusPassword         || "",
          factusTestMode:         credsData.factusTestMode         ?? true,
          factusNumberingRangeId: credsData.factusNumberingRangeId || "",
        }));
      }
      setStats({
        totalComprado: statsData.totalComprado || credsData?.totalComprado || 0,
        totalAsignado: statsData.totalAsignado || 0,
        totalUsado:    statsData.totalUsado    || 0,
      });

      const list = snap.docs.map(d => {
        const t = d.data();
        return {
          id: d.id,
          nombre: t.name || t.razonSocial || t.nombreComercial || d.id,
          nit: t.nit || "—",
          facturacionCuota:  t.facturacionCuota  ?? 0,
          facturacionUsadas: t.facturacionUsadas ?? 0,
          facturacionPlan:   t.facturacionPlan   || "—",
          disponibles: Math.max(0, (t.facturacionCuota ?? 0) - (t.facturacionUsadas ?? 0)),
        };
      });
      setTenants(list);
    } catch (e) {
      console.error(e);
      toast.error("Error cargando datos.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadAll(); }, []);

  // ─────────────────────────────────────────
  const handleSaveCreds = async () => {
    setSaving(true);
    try {
      await saveFactusAdminCredentials({
        factusClientId:         creds.factusClientId,
        factusClientSecret:     creds.factusClientSecret,
        factusUsername:         creds.factusUsername,
        factusPassword:         creds.factusPassword,
        factusTestMode:         creds.factusTestMode,
        factusNumberingRangeId: creds.factusNumberingRangeId,
        totalComprado:          Number(creds.totalComprado) || 0,
      });
      toast.success("Credenciales y configuración guardadas.");
      loadAll();
    } catch (e) {
      toast.error(`Error: ${e.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleTestConnection = async () => {
    setTesting(true);
    try {
      await factusService.testConnection({
        factusClientId:     creds.factusClientId,
        factusClientSecret: creds.factusClientSecret,
        factusUsername:     creds.factusUsername,
        factusPassword:     creds.factusPassword,
        factusTestMode:     creds.factusTestMode,
      });
      toast.success("¡Conexión con Factus exitosa! Credenciales válidas.");
    } catch (e) {
      toast.error(`Error de conexión: ${e.message}`);
    } finally {
      setTesting(false);
    }
  };

  const handleAssign = async () => {
    if (!assignModal) return;
    if (assignCuota <= 0) { toast.error("La cuota debe ser mayor a 0."); return; }
    const disponibleParaAsignar = stats.totalComprado - stats.totalAsignado;
    if (assignCuota > disponibleParaAsignar) {
      toast.error(`Solo tienes ${disponibleParaAsignar} facturas disponibles para asignar.`);
      return;
    }
    setAssigning(true);
    try {
      await assignQuotaToTenant(assignModal.inquilino, assignCuota, assignPlan);
      toast.success(`${assignCuota} facturas asignadas a ${assignModal.nombre}.`);
      setAssignModal(null);
      loadAll();
    } catch (e) {
      toast.error(`Error: ${e.message}`);
    } finally {
      setAssigning(false);
    }
  };

  const disponibleParaAsignar = stats.totalComprado - stats.totalAsignado;
  const pct = stats.totalComprado > 0 ? Math.round((stats.totalUsado / stats.totalComprado) * 100) : 0;

  return (
    <div className="space-y-8 p-6 max-w-5xl mx-auto">
      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">Facturación Electrónica</h2>
          <p className="text-xs text-slate-400 font-medium mt-0.5">Credenciales centralizadas y cuotas por clínica</p>
        </div>
        <button onClick={loadAll} className="w-9 h-9 flex items-center justify-center rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 transition-all">
          <FiRefreshCw size={15} />
        </button>
      </div>

      {/* ── KPIs ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Compradas a Factus",   val: stats.totalComprado,        color: "text-blue-600",   bg: "bg-blue-50"   },
          { label: "Asignadas a clínicas", val: stats.totalAsignado,        color: "text-indigo-600", bg: "bg-indigo-50" },
          { label: "Usadas (emitidas)",    val: stats.totalUsado,           color: "text-rose-600",   bg: "bg-rose-50"   },
          { label: "Disponibles para asignar", val: disponibleParaAsignar,  color: "text-emerald-600",bg: "bg-emerald-50"},
        ].map(k => (
          <div key={k.label} className={`${k.bg} rounded-2xl p-4 border border-white/50`}>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{k.label}</p>
            <p className={`text-3xl font-black ${k.color}`}>{k.val.toLocaleString("es-CO")}</p>
          </div>
        ))}
      </div>

      {/* Progress bar */}
      {stats.totalComprado > 0 && (
        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
          <div className="flex justify-between text-xs font-semibold text-slate-500 mb-2">
            <span>Facturas usadas del total comprado</span>
            <span>{pct}%</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2.5">
            <div className="bg-blue-500 h-2.5 rounded-full transition-all" style={{ width: `${Math.min(pct, 100)}%` }} />
          </div>
          <p className="text-[10px] text-slate-400 mt-1">{stats.totalUsado} / {stats.totalComprado} facturas</p>
        </div>
      )}

      {/* ── Credentials form ── */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-5">
        <h3 className="text-sm font-black text-slate-700 uppercase tracking-wide flex items-center gap-2">
          <FiZap size={15} className="text-blue-500" /> Credenciales API Factus (centralizadas)
        </h3>
        <p className="text-xs text-slate-400">Estas credenciales son tuyas. Las clínicas no las ven ni las necesitan.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Client ID *</label>
            <input value={creds.factusClientId} onChange={e => setCreds(p=>({...p, factusClientId: e.target.value}))} className={inp} placeholder="Client ID de Factus" />
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Client Secret *</label>
            <div className="relative">
              <input type={showSecret?"text":"password"} value={creds.factusClientSecret} onChange={e=>setCreds(p=>({...p,factusClientSecret:e.target.value}))} className={inp+" pr-10"} placeholder="Client Secret" />
              <button type="button" onClick={()=>setShowSecret(!showSecret)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">{showSecret?<FiEyeOff size={14}/>:<FiEye size={14}/>}</button>
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Usuario / Correo API *</label>
            <input value={creds.factusUsername} onChange={e=>setCreds(p=>({...p,factusUsername:e.target.value}))} className={inp} placeholder="sandboxv2@factus.com.co" />
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Contraseña API *</label>
            <div className="relative">
              <input type={showPass?"text":"password"} value={creds.factusPassword} onChange={e=>setCreds(p=>({...p,factusPassword:e.target.value}))} className={inp+" pr-10"} placeholder="Contraseña" />
              <button type="button" onClick={()=>setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">{showPass?<FiEyeOff size={14}/>:<FiEye size={14}/>}</button>
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">ID Rango Numeración Factus</label>
            <input value={creds.factusNumberingRangeId} onChange={e=>setCreds(p=>({...p,factusNumberingRangeId:e.target.value}))} className={inp} placeholder="Ej: 8" />
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total comprado a Factus</label>
            <input
              type="text"
              inputMode="numeric"
              value={(!creds.totalComprado || creds.totalComprado === 0) ? '' : Number(creds.totalComprado).toLocaleString('es-CO')}
              onChange={e => {
                const raw = e.target.value.replace(/\D/g, '');
                setCreds(p => ({ ...p, totalComprado: raw ? Number(raw) : 0 }));
              }}
              className={inp}
              placeholder="Ej: 10000"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input type="checkbox" checked={creds.factusTestMode} onChange={e=>setCreds(p=>({...p,factusTestMode:e.target.checked}))} className="w-4 h-4 rounded text-blue-600" />
            <span className="text-sm font-medium text-slate-600">Modo Sandbox (pruebas)</span>
          </label>
        </div>

        <div className="flex gap-3 pt-2">
          <button onClick={handleTestConnection} disabled={testing} className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50 transition-all">
            {testing ? <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"/> : <FiZap size={14}/>}
            Probar conexión
          </button>
          <button onClick={handleSaveCreds} disabled={saving} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 transition-all">
            {saving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/> : <FiSave size={14}/>}
            Guardar
          </button>
        </div>
      </div>

      {/* ── Tenants quota table ── */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h3 className="text-sm font-black text-slate-700 uppercase tracking-wide flex items-center gap-2">
            <FiFileText size={15} className="text-indigo-500" /> Cuotas por Clínica
          </h3>
        </div>
        {loading ? (
          <div className="flex items-center justify-center py-12 gap-2 text-slate-400">
            <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"/> Cargando...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70">
                  {["Clínica","NIT","Plan","Asignadas","Usadas","Disponibles",""].map((h,i) => (
                    <th key={i} className="text-left px-5 py-3 text-[10px] font-black text-slate-400 uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tenants.map(t => (
                  <tr key={t.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-3.5 font-semibold text-slate-700">{t.nombre}</td>
                    <td className="px-5 py-3.5 text-slate-400 text-xs">{t.nit}</td>
                    <td className="px-5 py-3.5">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-slate-100 text-slate-500 uppercase">{t.facturacionPlan}</span>
                    </td>
                    <td className="px-5 py-3.5 font-semibold text-slate-700">{t.facturacionCuota.toLocaleString("es-CO")}</td>
                    <td className="px-5 py-3.5 text-slate-500">{t.facturacionUsadas.toLocaleString("es-CO")}</td>
                    <td className="px-5 py-3.5">
                      <span className={`font-black ${t.disponibles <= 0 ? "text-rose-600" : t.disponibles <= 50 ? "text-amber-500" : "text-emerald-600"}`}>
                        {t.disponibles.toLocaleString("es-CO")}
                        {t.disponibles <= 0 && <span className="ml-1 text-[9px] font-black bg-rose-100 text-rose-600 px-1.5 py-0.5 rounded-full uppercase">Agotado</span>}
                        {t.disponibles > 0 && t.disponibles <= 50 && <span className="ml-1 text-[9px] font-black bg-amber-100 text-amber-600 px-1.5 py-0.5 rounded-full uppercase">Bajo</span>}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <button
                        onClick={() => { setAssignModal({ inquilino: t.id, nombre: t.nombre }); setAssignCuota(300); setAssignPlan("básico"); setAssignCustom(false); }}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 text-xs font-semibold hover:bg-indigo-100 transition-all"
                      >
                        <FiPlus size={12}/> Asignar
                      </button>
                    </td>
                  </tr>
                ))}
                {tenants.length === 0 && (
                  <tr><td colSpan={7} className="px-5 py-10 text-center text-slate-300 text-sm">No hay clínicas registradas.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Assign Modal ── */}
      {assignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-800">Asignar facturas a <span className="text-indigo-600">{assignModal.nombre}</span></h3>
              <p className="text-xs text-slate-400 mt-0.5">Disponibles para asignar: <strong className="text-emerald-600">{disponibleParaAsignar.toLocaleString("es-CO")}</strong></p>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Selecciona un plan</label>
                <div className="grid grid-cols-2 gap-2">
                  {PLAN_PRESETS.map(p => (
                    <button key={p.label} type="button"
                      onClick={() => { if (p.plan === "personalizado") { setAssignCustom(true); } else { setAssignCuota(p.cuota); setAssignPlan(p.plan); setAssignCustom(false); } }}
                      className={`px-3 py-2 rounded-lg border text-xs font-semibold transition-all text-left ${(assignPlan === p.plan && !assignCustom) || (assignCustom && p.plan === "personalizado") ? "border-indigo-500 bg-indigo-50 text-indigo-700" : "border-slate-200 text-slate-600 hover:border-slate-300"}`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
              {assignCustom && (
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Cantidad personalizada</label>
                  <input type="number" min="1" value={assignCuota} onChange={e=>setAssignCuota(Number(e.target.value))} className={inp} />
                </div>
              )}
              <div className="bg-slate-50 rounded-xl p-3 text-xs text-slate-500">
                Se agregarán <strong className="text-slate-700">{assignCuota}</strong> facturas a <strong>{assignModal.nombre}</strong>.<br/>
                Plan: <strong className="capitalize">{assignCustom ? "personalizado" : assignPlan}</strong>
              </div>
            </div>
            <div className="flex gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50/50">
              <button onClick={() => setAssignModal(null)} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-all">Cancelar</button>
              <button onClick={handleAssign} disabled={assigning} className="flex-1 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2">
                {assigning ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/> : <FiCheckCircle size={14}/>}
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
