import React, { useState, useEffect } from "react";
import {
    getTenants, createTenant, getPlans, toggleTenantStatus, updateTenantPlan,
    getSubscriptionRequests, approveSubscriptionRequest, rejectSubscriptionRequest,
    grantFreeMonth, deleteTenant
} from "../../services/adminService";
import { onSnapshot, collection, query, where, orderBy, getDocs } from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";
import {
    FiPlus, FiRefreshCw, FiSearch, FiActivity, FiCheck, FiX,
    FiEdit3, FiTrash2, FiToggleLeft, FiToggleRight, FiGift,
    FiAlertCircle, FiChevronRight, FiUser, FiCalendar,
    FiFileText, FiMail, FiSliders, FiMessageSquare
} from "react-icons/fi";

const fmt = (ts) => {
    if (!ts) return "—";
    const d = ts?.toDate ? ts.toDate() : new Date(ts);
    return d.toLocaleDateString("es-CO", { day: "2-digit", month: "2-digit", year: "numeric" });
};

const inp = "w-full h-10 px-3 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all";

export default function TenantsPanelV2() {
    const [tenants,   setTenants]   = useState([]);
    const [plans,     setPlans]     = useState([]);
    const [requests,  setRequests]  = useState([]);
    const [loading,   setLoading]   = useState(true);
    const [search,    setSearch]    = useState("");
    const [processing,setProcessing]= useState(false);

    // Modals
    const [showCreate,   setShowCreate]   = useState(false);
    const [showPlan,     setShowPlan]     = useState(false);
    const [showRequests, setShowRequests] = useState(false);
    const [showDetail,   setShowDetail]   = useState(null); // tenant object

    // Forms
    const [selectedTenant, setSelectedTenant] = useState(null);
    const [newPlanId,  setNewPlanId]  = useState("");
    const [newDuration,setNewDuration]= useState("monthly");
    const [newTenant,  setNewTenant]  = useState({
        name: "", address: "", contactEmail: "", planId: "",
        adminName: "", adminEmail: "", adminPassword: "", planDuration: "monthly"
    });

    // Audit logs per tenant (loaded on demand)
    const [auditLogs, setAuditLogs] = useState([]);
    const [loadingLogs, setLoadingLogs] = useState(false);

    useEffect(() => {
        loadData();
        const q = query(collection(db, "subscription_requests"), where("status", "==", "pending"));
        const unsub = onSnapshot(q, snap => {
            const r = snap.docs.map(d => ({ id: d.id, ...d.data() }));
            r.sort((a,b) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0));
            setRequests(r);
        });
        return () => unsub();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [tData, pData] = await Promise.all([getTenants(), getPlans()]);
            setTenants(tData);
            setPlans(pData);
            if (pData.length > 0) setNewTenant(p => ({ ...p, planId: p.planId || pData[0].id }));
        } finally { setLoading(false); }
    };

    const loadAuditLogs = async (inquilino) => {
        setLoadingLogs(true);
        setAuditLogs([]);
        try {
            const snap = await getDocs(
                query(collection(db, "audit_logs"),
                    where("inquilino", "==", inquilino),
                    orderBy("createdAt", "desc"))
            );
            setAuditLogs(snap.docs.map(d => ({ id: d.id, ...d.data() })).slice(0, 30));
        } catch (e) {
            // audit_logs may not exist yet — that's OK
            setAuditLogs([]);
        } finally { setLoadingLogs(false); }
    };

    const openDetail = (tenant) => {
        setShowDetail(tenant);
        loadAuditLogs(tenant.id);
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            await createTenant(newTenant);
            setShowCreate(false);
            setNewTenant({ name:"",address:"",contactEmail:"",planId:plans[0]?.id||"",adminName:"",adminEmail:"",adminPassword:"",planDuration:"monthly" });
            loadData();
        } catch (err) { alert("Error al crear clínica: " + err.message); }
    };

    const handleStatusToggle = async (id, current) => {
        if (!window.confirm(`¿${current === "active" ? "Suspender" : "Activar"} esta clínica?`)) return;
        try { await toggleTenantStatus(id, current); loadData(); }
        catch { alert("Error al cambiar estado"); }
    };

    const handleUpdatePlan = async (e) => {
        e.preventDefault();
        try { await updateTenantPlan(selectedTenant.id, newPlanId, newDuration); setShowPlan(false); loadData(); }
        catch { alert("Error al actualizar plan."); }
    };

    const handleGrantFree = async (id) => {
        if (!window.confirm("¿Regalar 1 mes gratis?")) return;
        try { await grantFreeMonth(id); loadData(); } catch { alert("Error"); }
    };

    const handleDelete = async (id, name) => {
        if (!window.confirm(`⚠️ ¿Eliminar permanentemente "${name}"? Esta acción no se puede deshacer.`)) return;
        setProcessing(true);
        try { await deleteTenant(id); loadData(); } catch { alert("Error al eliminar."); } finally { setProcessing(false); }
    };

    const handleApprove = async (id) => {
        setProcessing(true);
        try { await approveSubscriptionRequest(id); loadData(); } finally { setProcessing(false); }
    };

    const handleReject = async (id) => {
        const reason = window.prompt("Motivo del rechazo (opcional):"); if (reason === null) return;
        try { await rejectSubscriptionRequest(id, reason); } catch { alert("Error"); }
    };

    const getPlanName = (id) => id === "trial" ? "Prueba" : plans.find(p => p.id === id)?.name || "N/A";

    const filtered = tenants.filter(t =>
        !search ||
        (t.name || "").toLowerCase().includes(search.toLowerCase()) ||
        (t.contactEmail || t.email || "").toLowerCase().includes(search.toLowerCase())
    );

    const active   = tenants.filter(t => t.status === "active").length;
    const inactive = tenants.filter(t => t.status !== "active").length;
    const trial    = tenants.filter(t => t.planId === "trial").length;

    return (
        <div className="space-y-6">
            {/* KPIs */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label:"Clínicas totales", val:tenants.length, color:"text-slate-800",  bg:"bg-white" },
                    { label:"Activas",           val:active,         color:"text-emerald-600",bg:"bg-emerald-50" },
                    { label:"Inactivas",         val:inactive,       color:"text-rose-600",   bg:"bg-rose-50" },
                    { label:"Solicitudes",       val:requests.length,color:"text-amber-600",  bg:"bg-amber-50", onClick:()=>setShowRequests(true), pulse: requests.length > 0 },
                ].map((k,i) => (
                    <div key={i} onClick={k.onClick} className={`${k.bg} rounded-2xl border border-white/60 shadow-sm p-5 ${k.onClick?"cursor-pointer hover:shadow-md transition-shadow":""}`}>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{k.label}</p>
                        <div className="flex items-center gap-2">
                            <p className={`text-3xl font-black ${k.color}`}>{k.val}</p>
                            {k.pulse && <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"/>}
                        </div>
                    </div>
                ))}
            </div>

            {/* Toolbar */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
                <div className="flex items-center gap-3">
                    <div className="relative flex-1">
                        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={14}/>
                        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar por nombre o correo..."
                            className="pl-9 pr-3 h-10 w-full rounded-lg border border-slate-200 text-sm font-medium text-slate-700 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 bg-slate-50 transition-all"/>
                    </div>
                    <button onClick={loadData} title="Actualizar lista"
                        className="w-10 h-10 shrink-0 flex items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:bg-slate-50 hover:text-blue-500 transition-all">
                        <FiRefreshCw size={14}/>
                    </button>
                    <button onClick={()=>setShowCreate(true)}
                        className="shrink-0 flex items-center gap-2 px-5 h-10 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition-all shadow-sm shadow-blue-200 whitespace-nowrap">
                        <FiPlus size={14}/> Registrar Clínica
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center py-20 gap-2 text-slate-400">
                        <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"/>
                        Cargando...
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-slate-100 bg-slate-50/70">
                                    {["Clínica","Plan","Vencimiento","Estado","Facturas","Acciones"].map((h,i)=>(
                                        <th key={i} className="px-5 py-3 text-left text-[10px] font-black text-slate-400 uppercase tracking-wide whitespace-nowrap">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map(t => {
                                    const isActive = t.status === "active";
                                    const cuota = t.facturacionCuota ?? 0;
                                    const usadas = t.facturacionUsadas ?? 0;
                                    const disp = Math.max(0, cuota - usadas);
                                    return (
                                        <tr key={t.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded-xl bg-blue-600 text-white font-black text-sm flex items-center justify-center shrink-0">
                                                        {(t.name||"?")[0].toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-slate-800 text-sm leading-tight">{t.name}</p>
                                                        <p className="text-[11px] text-slate-400">{t.contactEmail || t.email || "—"}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-5 py-4">
                                                <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-slate-100 text-slate-600 uppercase">
                                                    {getPlanName(t.planId)}
                                                </span>
                                                <p className="text-[10px] text-slate-400 mt-1 ml-0.5">{t.planDuration === "yearly" ? "Anual" : "Mensual"}</p>
                                            </td>
                                            <td className="px-5 py-4 text-xs text-slate-500 whitespace-nowrap">{fmt(t.subscriptionEndDate)}</td>
                                            <td className="px-5 py-4">
                                                <button onClick={()=>handleStatusToggle(t.id, t.status)}
                                                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold border transition-all group relative ${isActive
                                                        ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200"
                                                        : "bg-slate-100 text-slate-500 border-slate-200 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200"}`}>
                                                    {isActive ? <FiToggleRight size={13}/> : <FiToggleLeft size={13}/>}
                                                    <span className="group-hover:hidden">{isActive ? "Activo" : "Inactivo"}</span>
                                                    <span className="hidden group-hover:inline">{isActive ? "Suspender" : "Activar"}</span>
                                                </button>
                                            </td>
                                            <td className="px-5 py-4">
                                                {cuota === 0 ? (
                                                    <span className="text-[11px] text-slate-300">Sin cuota</span>
                                                ) : (
                                                    <div>
                                                        <span className={`text-sm font-black ${disp <= 0 ? "text-rose-600" : disp <= 50 ? "text-amber-500" : "text-emerald-600"}`}>
                                                            {disp}
                                                        </span>
                                                        <span className="text-[10px] text-slate-400"> / {cuota}</span>
                                                        <div className="w-16 bg-slate-100 rounded-full h-1 mt-1">
                                                            <div className={`h-1 rounded-full ${disp<=0?"bg-rose-500":disp<=50?"bg-amber-400":"bg-emerald-500"}`}
                                                                style={{width:`${Math.min(100,Math.round(usadas/cuota*100))}%`}}/>
                                                        </div>
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-1.5">
                                                    <button onClick={()=>openDetail(t)}
                                                        title="Ver detalle, historial y auditoría de esta clínica"
                                                        className="w-8 h-8 flex items-center justify-center rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-all group relative">
                                                        <FiActivity size={13}/>
                                                        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2 py-1 bg-slate-800 text-white text-[10px] rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                                                            Detalle & Auditoría
                                                        </span>
                                                    </button>
                                                    <button onClick={()=>{setSelectedTenant(t);setNewPlanId(t.planId);setNewDuration(t.planDuration||"monthly");setShowPlan(true);}}
                                                        title="Cambiar plan de suscripción"
                                                        className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-50 text-slate-500 hover:bg-indigo-50 hover:text-indigo-600 transition-all group relative">
                                                        <FiSliders size={13}/>
                                                        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2 py-1 bg-slate-800 text-white text-[10px] rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                                                            Cambiar plan
                                                        </span>
                                                    </button>
                                                    <button onClick={()=>handleGrantFree(t.id)}
                                                        title="Regalar 1 mes de servicio gratis"
                                                        className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-50 text-slate-500 hover:bg-emerald-50 hover:text-emerald-600 transition-all group relative">
                                                        <FiGift size={13}/>
                                                        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2 py-1 bg-slate-800 text-white text-[10px] rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                                                            Regalar 1 mes
                                                        </span>
                                                    </button>
                                                    <button onClick={()=>handleDelete(t.id, t.name)} disabled={processing}
                                                        title="Eliminar clínica permanentemente"
                                                        className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-50 text-slate-300 hover:bg-rose-50 hover:text-rose-500 transition-all disabled:opacity-50 group relative">
                                                        <FiTrash2 size={13}/>
                                                        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2 py-1 bg-slate-800 text-white text-[10px] rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                                                            Eliminar clínica
                                                        </span>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                                {filtered.length === 0 && (
                                    <tr><td colSpan={6} className="px-5 py-12 text-center text-slate-300 text-sm">
                                        {search ? "Sin resultados para esa búsqueda." : "No hay clínicas registradas."}
                                    </td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* ── Detail / Audit drawer ── */}
            {showDetail && (
                <div className="fixed inset-0 z-50 flex">
                    <div className="flex-1 bg-black/30 backdrop-blur-sm" onClick={()=>setShowDetail(null)}/>
                    <div className="w-full max-w-lg bg-white h-full flex flex-col shadow-2xl overflow-hidden animate-in slide-in-from-right duration-300">
                        {/* Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-blue-600 text-white font-black text-sm flex items-center justify-center">
                                    {(showDetail.name||"?")[0].toUpperCase()}
                                </div>
                                <div>
                                    <p className="font-bold text-slate-800 text-sm">{showDetail.name}</p>
                                    <p className="text-[11px] text-slate-400">{showDetail.contactEmail || showDetail.email || "—"}</p>
                                </div>
                            </div>
                            <button onClick={()=>setShowDetail(null)} className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 transition-colors"><FiX size={16}/></button>
                        </div>

                        {/* Body */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            {/* Info grid */}
                            <div className="grid grid-cols-2 gap-3">
                                {[
                                    { label:"Plan",          val: getPlanName(showDetail.planId) },
                                    { label:"Ciclo",         val: showDetail.planDuration === "yearly" ? "Anual" : "Mensual" },
                                    { label:"Estado",        val: showDetail.status === "active" ? "✅ Activo" : "🔴 Inactivo" },
                                    { label:"Vencimiento",   val: fmt(showDetail.subscriptionEndDate) },
                                    { label:"Cuota facturas",val: `${showDetail.facturacionUsadas||0} / ${showDetail.facturacionCuota||0}` },
                                    { label:"Plan fact.",    val: showDetail.facturacionPlan || "—" },
                                ].map((item,i)=>(
                                    <div key={i} className="bg-slate-50 rounded-xl p-3">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{item.label}</p>
                                        <p className="text-sm font-semibold text-slate-700">{item.val}</p>
                                    </div>
                                ))}
                            </div>

                            {/* Quick actions */}
                            <div className="grid grid-cols-2 gap-2">
                                <button onClick={()=>{handleStatusToggle(showDetail.id,showDetail.status);setShowDetail(p=>({...p,status:p.status==="active"?"inactive":"active"}));}}
                                    className={`flex items-center gap-2 px-4 py-3 rounded-xl text-xs font-semibold transition-all ${showDetail.status==="active"?"bg-amber-50 text-amber-700 hover:bg-amber-100":"bg-emerald-50 text-emerald-700 hover:bg-emerald-100"}`}>
                                    {showDetail.status==="active"?<FiToggleLeft size={14}/>:<FiToggleRight size={14}/>}
                                    {showDetail.status==="active"?"Suspender":"Activar"}
                                </button>
                                <button onClick={()=>{setSelectedTenant(showDetail);setNewPlanId(showDetail.planId);setNewDuration(showDetail.planDuration||"monthly");setShowPlan(true);}}
                                    className="flex items-center gap-2 px-4 py-3 rounded-xl text-xs font-semibold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-all">
                                    <FiSliders size={14}/> Cambiar plan
                                </button>
                                <button onClick={()=>handleGrantFree(showDetail.id)}
                                    className="flex items-center gap-2 px-4 py-3 rounded-xl text-xs font-semibold bg-slate-50 text-slate-600 hover:bg-slate-100 transition-all">
                                    <FiGift size={14}/> Regalar 1 mes
                                </button>
                                <button onClick={()=>{ const msg=`Hola ${showDetail.name}, somos OdontoCloud.`; window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, "_blank");}}
                                    className="flex items-center gap-2 px-4 py-3 rounded-xl text-xs font-semibold bg-green-50 text-green-700 hover:bg-green-100 transition-all">
                                    <FiMessageSquare size={14}/> WhatsApp
                                </button>
                            </div>

                            {/* Audit log */}
                            <div>
                                <p className="text-xs font-black text-slate-500 uppercase tracking-wide mb-3 flex items-center gap-2">
                                    <FiActivity size={12}/> Actividad reciente
                                </p>
                                {loadingLogs ? (
                                    <div className="flex items-center gap-2 text-slate-400 text-xs py-4"><div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"/>Cargando logs...</div>
                                ) : auditLogs.length === 0 ? (
                                    <div className="bg-slate-50 rounded-xl p-4 text-xs text-slate-400 text-center">No hay registros de actividad aún.</div>
                                ) : (
                                    <div className="space-y-2">
                                        {auditLogs.map(log=>(
                                            <div key={log.id} className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl">
                                                <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 shrink-0"/>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-xs font-medium text-slate-700 truncate">{log.action || log.description || "Acción registrada"}</p>
                                                    <p className="text-[10px] text-slate-400">{fmt(log.createdAt)} · {log.user || "Sistema"}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Create clinic modal ── */}
            {showCreate && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                            <h3 className="text-base font-bold text-slate-800">Registrar nueva clínica</h3>
                            <button onClick={()=>setShowCreate(false)} className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100"><FiX size={16}/></button>
                        </div>
                        <form onSubmit={handleCreate} className="p-6 grid grid-cols-2 gap-4">
                            <div className="col-span-2 text-[10px] font-black text-slate-400 uppercase tracking-widest pb-1 border-b border-slate-100">Datos de la clínica</div>
                            <div><label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Nombre *</label><input required className={inp} value={newTenant.name} onChange={e=>setNewTenant(p=>({...p,name:e.target.value}))}/></div>
                            <div><label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Email corporativo *</label><input type="email" required className={inp} value={newTenant.contactEmail} onChange={e=>setNewTenant(p=>({...p,contactEmail:e.target.value}))}/></div>
                            <div><label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Plan *</label>
                                <select required className={inp} value={newTenant.planId} onChange={e=>setNewTenant(p=>({...p,planId:e.target.value}))}>
                                    {plans.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}
                                </select>
                            </div>
                            <div><label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Ciclo</label>
                                <select className={inp} value={newTenant.planDuration} onChange={e=>setNewTenant(p=>({...p,planDuration:e.target.value}))}>
                                    <option value="monthly">Mensual</option>
                                    <option value="yearly">Anual</option>
                                </select>
                            </div>
                            <div className="col-span-2 text-[10px] font-black text-slate-400 uppercase tracking-widest pb-1 border-b border-slate-100 mt-2">Administrador de la clínica</div>
                            <div><label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Nombre completo *</label><input required className={inp} value={newTenant.adminName} onChange={e=>setNewTenant(p=>({...p,adminName:e.target.value}))}/></div>
                            <div><label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Email de acceso *</label><input type="email" required className={inp} value={newTenant.adminEmail} onChange={e=>setNewTenant(p=>({...p,adminEmail:e.target.value}))}/></div>
                            <div className="col-span-2"><label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Contraseña inicial *</label><input type="password" required className={inp} value={newTenant.adminPassword} onChange={e=>setNewTenant(p=>({...p,adminPassword:e.target.value}))}/></div>
                            <div className="col-span-2 flex gap-3 pt-2">
                                <button type="button" onClick={()=>setShowCreate(false)} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-all">Cancelar</button>
                                <button type="submit" className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-all shadow-sm">Crear clínica</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ── Plan modal ── */}
            {showPlan && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                            <h3 className="text-base font-bold text-slate-800">Cambiar plan — {selectedTenant?.name}</h3>
                            <button onClick={()=>setShowPlan(false)} className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100"><FiX size={16}/></button>
                        </div>
                        <form onSubmit={handleUpdatePlan} className="p-6 space-y-4">
                            <div><label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Plan</label>
                                <select required className={inp} value={newPlanId} onChange={e=>setNewPlanId(e.target.value)}>
                                    {plans.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}
                                </select>
                            </div>
                            <div><label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Ciclo</label>
                                <div className="flex rounded-lg border border-slate-200 overflow-hidden">
                                    {["monthly","yearly"].map(d=>(
                                        <button key={d} type="button" onClick={()=>setNewDuration(d)}
                                            className={`flex-1 py-2 text-xs font-semibold transition-all ${newDuration===d?"bg-blue-600 text-white":"bg-white text-slate-500 hover:bg-slate-50"}`}>
                                            {d==="monthly"?"Mensual":"Anual"}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={()=>setShowPlan(false)} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-all">Cancelar</button>
                                <button type="submit" className="flex-1 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition-all">Confirmar</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ── Subscription requests modal ── */}
            {showRequests && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                            <h3 className="text-base font-bold text-slate-800">Solicitudes pendientes ({requests.length})</h3>
                            <button onClick={()=>setShowRequests(false)} className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100"><FiX size={16}/></button>
                        </div>
                        <div className="p-6 space-y-3 max-h-[60vh] overflow-y-auto">
                            {requests.length === 0 ? (
                                <p className="text-center text-slate-300 text-sm py-8">No hay solicitudes pendientes.</p>
                            ) : requests.map(req=>(
                                <div key={req.id} className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                                    <div className="flex items-center justify-between mb-3">
                                        <div>
                                            <p className="font-semibold text-slate-800 text-sm">{req.tenantName}</p>
                                            <p className="text-[11px] text-slate-400">Solicita: <strong>{req.requestedPlanName}</strong></p>
                                        </div>
                                        <p className="text-[10px] text-slate-400">{fmt(req.createdAt)}</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={()=>handleReject(req.id)} className="flex-1 py-2 rounded-lg text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 transition-all">Rechazar</button>
                                        <button onClick={()=>{ const msg=`Hola ${req.tenantName}, recibimos tu solicitud para el plan ${req.requestedPlanName}. Por favor adjunta el soporte de pago.`; window.open(`https://wa.me/${req.tenantPhone||""}?text=${encodeURIComponent(msg)}`, "_blank");}}
                                            className="flex-1 py-2 rounded-lg text-xs font-semibold text-green-700 bg-green-50 hover:bg-green-100 transition-all">WhatsApp</button>
                                        <button onClick={()=>handleApprove(req.id)} disabled={processing}
                                            className="flex-1 py-2 rounded-lg text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 transition-all">
                                            {processing?"...":"Aprobar"}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
