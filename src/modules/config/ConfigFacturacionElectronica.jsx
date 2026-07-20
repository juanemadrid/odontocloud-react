/**
 * ConfigFacturacionElectronica.jsx
 *
 * Vista de la CLÍNICA — solo muestra cuota disponible y datos de resolución DIAN.
 * Las credenciales de Factus las maneja ÚNICAMENTE el superadmin.
 */
import React, { useState, useEffect } from "react";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { FiSave, FiInfo, FiFileText, FiZap, FiAlertCircle } from "react-icons/fi";
import Input from "../../components/ui/Input";
import { getTenantQuota } from "../../services/factusAdminService";

export default function ConfigFacturacionElectronica() {
    const { userProfile } = useAuth();
    const toast = useToast();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Quota info (read-only for clinic)
    const [quota, setQuota] = useState(null);

    // DIAN resolution data — clinics CAN fill this
    const [dianData, setDianData] = useState({
        dianResolucion: "",
        dianPrefijo: "",
        dianRangoDesde: 1,
        dianRangoHasta: 1000,
        dianClaveTecnica: "",
        dianFechaResolucion: ""
    });

    useEffect(() => {
        if (userProfile?.inquilino) loadData();
    }, [userProfile]);

    const loadData = async () => {
        setLoading(true);
        try {
            const [snap, quotaData] = await Promise.all([
                getDoc(doc(db, "tenants", userProfile.inquilino)),
                getTenantQuota(userProfile.inquilino),
            ]);
            if (snap.exists()) {
                const d = snap.data();
                setDianData({
                    dianResolucion:      d.dianResolucion      || "",
                    dianPrefijo:         d.dianPrefijo         || "",
                    dianRangoDesde:      d.dianRangoDesde      || 1,
                    dianRangoHasta:      d.dianRangoHasta      || 1000,
                    dianClaveTecnica:    d.dianClaveTecnica    || "",
                    dianFechaResolucion: d.dianFechaResolucion || "",
                });
            }
            setQuota(quotaData);
        } catch (e) {
            console.error(e);
            toast.error("Error al cargar configuración");
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await setDoc(doc(db, "tenants", userProfile.inquilino), {
                ...dianData,
                updatedAt: serverTimestamp(),
                updatedBy: userProfile.uid,
            }, { merge: true });
            toast.success("Configuración guardada con éxito.");
        } catch (e) {
            toast.error("Error al guardar cambios.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center py-40 animate-pulse">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
    );

    const pct = quota && quota.facturacionCuota > 0
        ? Math.round((quota.facturacionUsadas / quota.facturacionCuota) * 100)
        : 0;

    return (
        <div className="max-w-4xl mx-auto p-2 md:p-8 pb-32 animate-fadeIn space-y-8">
            {/* Header */}
            <div className="flex items-center gap-6">
                <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-indigo-600 to-blue-600 flex items-center justify-center shadow-2xl shadow-indigo-200">
                    <FiFileText size={32} className="text-white" />
                </div>
                <div>
                    <h1 className="text-3xl font-black text-slate-800 uppercase tracking-tighter">Facturación Electrónica</h1>
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-1">Estado y configuración DIAN</p>
                </div>
            </div>

            {/* ── Quota card ── */}
            <div className={`rounded-[28px] border p-6 shadow-sm ${
                !quota || quota.facturacionCuota === 0
                    ? "bg-slate-50 border-slate-200"
                    : quota.disponibles <= 0
                        ? "bg-rose-50 border-rose-200"
                        : quota.disponibles <= 50
                            ? "bg-amber-50 border-amber-200"
                            : "bg-emerald-50 border-emerald-200"
            }`}>
                <div className="flex items-center gap-3 mb-4">
                    <FiZap size={20} className={
                        !quota || quota.facturacionCuota === 0 ? "text-slate-400"
                        : quota.disponibles <= 0 ? "text-rose-500"
                        : quota.disponibles <= 50 ? "text-amber-500"
                        : "text-emerald-500"
                    }/>
                    <h3 className="text-sm font-black text-slate-700 uppercase tracking-wide">
                        Facturas Electrónicas Disponibles
                    </h3>
                </div>

                {!quota || quota.facturacionCuota === 0 ? (
                    <div className="flex items-start gap-3">
                        <FiAlertCircle className="text-slate-400 mt-0.5 shrink-0" size={18}/>
                        <p className="text-sm text-slate-500 font-medium">
                            No tienes facturas electrónicas asignadas aún. Contacta al administrador del sistema para adquirir un paquete.
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-3 gap-4 mb-4">
                            <div className="text-center">
                                <p className="text-3xl font-black text-slate-800">{quota.disponibles.toLocaleString("es-CO")}</p>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Disponibles</p>
                            </div>
                            <div className="text-center">
                                <p className="text-3xl font-black text-slate-500">{quota.facturacionUsadas.toLocaleString("es-CO")}</p>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Usadas</p>
                            </div>
                            <div className="text-center">
                                <p className="text-3xl font-black text-slate-400">{quota.facturacionCuota.toLocaleString("es-CO")}</p>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Total plan</p>
                            </div>
                        </div>

                        {/* Progress bar */}
                        <div className="w-full bg-white/60 rounded-full h-2 mb-2">
                            <div
                                className={`h-2 rounded-full transition-all ${
                                    pct >= 90 ? "bg-rose-500" : pct >= 70 ? "bg-amber-400" : "bg-emerald-500"
                                }`}
                                style={{ width: `${Math.min(pct, 100)}%` }}
                            />
                        </div>
                        <p className="text-[10px] text-slate-400 font-medium">
                            {pct}% utilizado · Plan: <strong className="capitalize">{quota.facturacionPlan}</strong>
                        </p>

                        {quota.disponibles <= 0 && (
                            <div className="mt-4 flex items-start gap-2 p-3 bg-rose-100 rounded-xl">
                                <FiAlertCircle className="text-rose-600 shrink-0 mt-0.5" size={16}/>
                                <p className="text-xs text-rose-700 font-medium">
                                    Se agotaron tus facturas. Contacta al administrador para adquirir facturas adicionales.
                                </p>
                            </div>
                        )}
                        {quota.disponibles > 0 && quota.disponibles <= 50 && (
                            <div className="mt-4 flex items-start gap-2 p-3 bg-amber-100 rounded-xl">
                                <FiAlertCircle className="text-amber-600 shrink-0 mt-0.5" size={16}/>
                                <p className="text-xs text-amber-700 font-medium">
                                    Quedan pocas facturas disponibles. Contacta al administrador para reponer tu cuota.
                                </p>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* ── DIAN Resolution form ── */}
            <form onSubmit={handleSave}>
                <div className="bg-white rounded-[32px] border border-slate-200/50 shadow-sm p-8 space-y-6">
                    <div className="flex items-center gap-4 mb-2">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                            <FiFileText size={20} />
                        </div>
                        <h3 className="text-[14px] font-black text-slate-800 uppercase tracking-tight">Autorización de Numeración (DIAN)</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Prefijo de Factura</label>
                            <Input value={dianData.dianPrefijo} onChange={e=>setDianData(p=>({...p,dianPrefijo:e.target.value}))} placeholder="Ej: SETT o FE" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Resolución DIAN Nº</label>
                            <Input value={dianData.dianResolucion} onChange={e=>setDianData(p=>({...p,dianResolucion:e.target.value}))} placeholder="Número de resolución autorizada" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Fecha de Resolución</label>
                            <Input type="date" value={dianData.dianFechaResolucion} onChange={e=>setDianData(p=>({...p,dianFechaResolucion:e.target.value}))} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Rango Desde</label>
                                <Input type="number" value={dianData.dianRangoDesde} onChange={e=>setDianData(p=>({...p,dianRangoDesde:parseInt(e.target.value)||1}))} min="1" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Rango Hasta</label>
                                <Input type="number" value={dianData.dianRangoHasta} onChange={e=>setDianData(p=>({...p,dianRangoHasta:parseInt(e.target.value)||1000}))} min="1" />
                            </div>
                        </div>
                        <div className="md:col-span-2 space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Clave Técnica DIAN</label>
                            <Input value={dianData.dianClaveTecnica} onChange={e=>setDianData(p=>({...p,dianClaveTecnica:e.target.value}))} placeholder="Clave técnica de facturación electrónica" />
                        </div>
                    </div>
                </div>

                <div className="flex justify-end pt-6">
                    <button type="submit" disabled={saving}
                        className="flex items-center gap-2 px-8 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-black uppercase tracking-widest transition-all shadow-md shadow-indigo-100 disabled:opacity-50">
                        <FiSave size={16} /> {saving ? "Guardando..." : "Guardar"}
                    </button>
                </div>
            </form>

            {/* Info nota */}
            <div className="p-5 bg-amber-50 border border-amber-200/60 rounded-3xl flex items-start gap-4">
                <FiInfo size={22} className="text-amber-500 shrink-0 mt-0.5" />
                <div>
                    <h4 className="text-xs font-black uppercase tracking-wide text-amber-800 mb-1">Nota importante</h4>
                    <p className="text-[11px] font-semibold text-amber-700/90 leading-relaxed">
                        La conexión con Factus y la DIAN está administrada por el proveedor del sistema.
                        Para adquirir más facturas electrónicas o consultar el estado de tu cuenta, contacta al soporte técnico.
                    </p>
                </div>
            </div>
        </div>
    );
}
