import React, { useState, useEffect } from "react";
import {
    getTenants, createTenant, getPlans, toggleTenantStatus, updateTenantPlan,
    getSubscriptionRequests, approveSubscriptionRequest, rejectSubscriptionRequest, grantFreeMonth,
    deleteTenant
} from "../../services/adminService";
import { Timestamp, onSnapshot, collection, query, where, orderBy } from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";

const IconClinic = () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
);
const IconPlan = () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
);
const IconUser = () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
);
const IconEdit = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
    </svg>
);
const IconTrash = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
);

const IconCheck = ({ size = 20 }) => (
    <svg width={size} height={size} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const IconFolder = ({ size = 24 }) => (
    <svg width={size} height={size} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
    </svg>
);

export default function TenantsPanelV2({ hideTitle }) {
    const [tenants, setTenants] = useState([]);
    const [plans, setPlans] = useState([]);
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [showPlanModal, setShowPlanModal] = useState(false);
    const [showRequestModal, setShowRequestModal] = useState(false);
    const [selectedTenant, setSelectedTenant] = useState(null);
    const [newPlanId, setNewPlanId] = useState("");
    const [newDuration, setNewDuration] = useState("monthly");
    const [processing, setProcessing] = useState(false);

    // Form State
    const [newTenant, setNewTenant] = useState({
        name: "",
        address: "",
        contactEmail: "",
        planId: "",
        adminName: "",
        adminEmail: "",
        adminPassword: "",
        planDuration: "monthly"
    });

    useEffect(() => {
        loadData();

        const q = query(
            collection(db, "subscription_requests"),
            where("status", "==", "pending")
        );
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const rData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            rData.sort((a, b) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0));
            setRequests(rData);
        }, (error) => {
            console.error("Error listening to requests:", error);
        });

        return () => unsubscribe();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const [tData, pData] = await Promise.all([
                getTenants(),
                getPlans()
            ]);
            setTenants(tData);
            setPlans(pData);
            if (pData.length > 0 && !newTenant.planId) {
                setNewTenant(prev => ({ ...prev, planId: pData[0].id }));
            }
        } catch (error) {
            console.error("Error loading data:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            await createTenant(newTenant);
            setShowModal(false);
            setNewTenant({
                name: "", address: "", contactEmail: "",
                planId: plans[0]?.id || "",
                adminName: "", adminEmail: "", adminPassword: "",
                planDuration: "monthly"
            });
            loadData();
            alert("✅ Clínica creada exitosamente.");
        } catch (error) {
            console.error("Error creating tenant:", error);
            alert("Error al crear clínica. Verifica los datos.");
        }
    };

    const handleStatusToggle = async (id, currentStatus) => {
        if (!window.confirm("¿Seguro de cambiar el estado de esta clínica?")) return;
        try {
            await toggleTenantStatus(id, currentStatus);
            loadData();
        } catch (error) {
            alert("Error al cambiar estado");
        }
    };

    const openPlanModal = (tenant) => {
        setSelectedTenant(tenant);
        setNewPlanId(tenant.planId);
        setNewDuration(tenant.planDuration || "monthly");
        setShowPlanModal(true);
    };

    const handleUpdatePlan = async (e) => {
        e.preventDefault();
        if (!selectedTenant || !newPlanId) return;

        try {
            await updateTenantPlan(selectedTenant.id, newPlanId, newDuration);
            setShowPlanModal(false);
            loadData();
            alert("✅ Plan actualizado exitosamente.");
        } catch (error) {
            console.error(error);
            alert("Error al actualizar el plan.");
        }
    };

    const handleGrantFreeMonth = async (id) => {
        if (!window.confirm("¿Deseas regalar 1 mes gratis de servicio a esta clínica? Esto extenderá su fecha de vencimiento actual en 30 días.")) return;
        try {
            await grantFreeMonth(id);
            alert("✅ Mes de cortesía otorgado con éxito.");
            loadData();
        } catch (error) {
            alert("Error al otorgar mes gratis");
        }
    };

    const handleApproveRequest = async (id) => {
        if (!window.confirm("¿Seguro de aprobar y activar este plan?")) return;
        try {
            setProcessing(true);
            await approveSubscriptionRequest(id);
            alert("✅ Solicitud aprobada con éxito.");
            loadData();
        } catch (error) {
            alert("Error al aprobar");
        } finally {
            setProcessing(false);
        }
    };

    const handleRejectRequest = async (id) => {
        const reason = window.prompt("Motivo del rechazo (opcional):");
        if (reason === null) return;
        try {
            await rejectSubscriptionRequest(id, reason);
            loadData();
        } catch (error) {
            alert("Error al rechazar");
        }
    };

    const handleDeleteTenant = async (id, name) => {
        if (!window.confirm(`⚠️ ADVERTENCIA CRÍTICA: ¿Estás ABSOLUTAMENTE SEGURO de eliminar la clínica "${name}"? \n\nEsto borrará permanentemente la configuración, consultorios y perfiles de usuario en la base de datos Firestore. \n\nNOTA: El usuario de autenticación (Email) permanecerá en Firebase Auth. Deberás borrarlo manualmente desde la consola de Firebase si deseas volver a usar el mismo correo para una nueva clínica.`)) return;

        try {
            setProcessing(true);
            await deleteTenant(id);
            alert("✅ Clínica y datos asociados eliminados de Firestore exitosamente.");
            loadData();
        } catch (error) {
            console.error(error);
            alert("Error al eliminar la clínica.");
        } finally {
            setProcessing(false);
        }
    };

    const getPlanName = (id) => {
        if (id === 'trial') return "Mes de Prueba";
        return plans.find(p => p.id === id)?.name || "N/A";
    };

    const formatDate = (ts) => {
        if (!ts) return "Indefinido";
        if (ts.toDate) return ts.toDate().toLocaleDateString();
        return new Date(ts).toLocaleDateString();
    };

    return (
        <div className="w-full space-y-12 bg-white min-h-full pb-20">
            {/* Enterprise KPI Cards - Professional Executive Style */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
                {[
                    { label: "Clínicas Totales", value: tenants.length, icon: <IconClinic />, color: "bg-blue-600", light: "bg-blue-50", text: "text-blue-600" },
                    { label: "Activas", value: tenants.filter(t => t.status === 'active').length, icon: <IconCheck />, color: "bg-emerald-500", light: "bg-emerald-50", text: "text-emerald-600" },
                    { label: "En Prueba", value: tenants.filter(t => t.planType === 'trial').length, icon: <IconPlan />, color: "bg-indigo-500", light: "bg-indigo-50", text: "text-indigo-600" },
                    { label: "Solicitudes", value: requests.length, icon: <IconFolder />, color: "bg-orange-500", light: "bg-orange-50", text: "text-orange-600", active: requests.length > 0 }
                ].map((kpi, idx) => (
                    <div
                        key={idx}
                        onClick={kpi.label === "Solicitudes" ? () => setShowRequestModal(true) : undefined}
                        className={`bg-white p-7 rounded-[32px] border border-slate-200 shadow-xl shadow-slate-100/50 flex items-center justify-between group transition-all duration-300 hover:scale-[1.03] hover:shadow-2xl hover:shadow-slate-200/60 ${kpi.label === "Solicitudes" ? 'cursor-pointer' : ''}`}
                    >
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">{kpi.label}</span>
                            <div className="flex items-center gap-2">
                                <span className={`text-4xl font-black tracking-tighter ${kpi.active ? kpi.text : 'text-slate-900'}`}>{kpi.value}</span>
                                {kpi.active && (
                                    <span className="animate-pulse flex h-2.5 w-2.5 rounded-full bg-orange-400 shadow-lg shadow-orange-400/50"></span>
                                )}
                            </div>
                        </div>
                        <div className={`w-16 h-16 rounded-[20px] flex items-center justify-center border transition-all duration-300 ${kpi.light} ${kpi.text} group-hover:${kpi.color} group-hover:text-white group-hover:shadow-xl group-hover:rotate-6`}>
                            {kpi.icon}
                        </div>
                    </div>
                ))}
            </div>

            {/* Table Area - Modern Control Center */}
            <div className="bg-white rounded-[48px] border border-slate-200 shadow-2xl shadow-slate-200/40 overflow-hidden relative">
                <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/5 rounded-full blur-[100px] -mr-48 -mt-48 pointer-events-none"></div>

                <div className="px-8 py-10 flex flex-col lg:flex-row justify-between items-center gap-8 border-b border-slate-50 bg-white relative">
                    <div className="flex items-center gap-6 relative">
                        <div className="w-2 h-12 bg-gradient-to-b from-blue-600 to-cyan-400 rounded-full"></div>
                        <div>
                            <h3 className="font-black text-slate-800 text-xl tracking-tight leading-none uppercase">Registro Central</h3>
                            <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mt-3">Infraestructura Global de Clínicas</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-6 w-full lg:w-auto relative">
                        <div className="relative flex-1 lg:w-96 group">
                            <div className="absolute inset-y-0 left-6 flex items-center text-slate-300 group-focus-within:text-blue-500 transition-colors">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                            </div>
                            <input
                                type="text"
                                placeholder="Filtrar por nombre o email..."
                                className="w-full bg-slate-50 border border-slate-100 rounded-[20px] pl-14 pr-8 py-4 text-sm font-bold text-slate-800 focus:bg-white focus:ring-4 focus:ring-blue-500/5 focus:border-blue-400 outline-none transition-all placeholder:text-slate-300"
                            />
                        </div>
                        <button
                            onClick={() => setShowModal(true)}
                            className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:brightness-110 text-white px-10 py-5 rounded-[20px] text-[11px] font-black uppercase tracking-[0.2em] shadow-xl shadow-blue-500/25 transition-all transform active:scale-95 flex items-center gap-3 whitespace-nowrap"
                        >
                            <span className="text-xl leading-none">+</span> Registrar Clínica
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className="py-32 text-center">
                        <div className="w-14 h-14 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin mx-auto mb-6 shadow-lg shadow-blue-500/10"></div>
                        <p className="text-slate-400 text-[11px] font-black uppercase tracking-[0.2em]">Sincronizando red nacional...</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto overflow-y-hidden">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/50 border-b border-slate-100">
                                    <th className="px-6 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Socio / Contacto</th>
                                    <th className="px-6 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Suscripción</th>
                                    <th className="px-6 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Expiración</th>
                                    <th className="px-6 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Estatus</th>
                                    <th className="px-6 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {tenants.map(tenant => (
                                    <tr key={tenant.id} className="hover:bg-slate-50/60 transition-all group">
                                        <td className="px-6 py-10">
                                            <div className="flex items-center gap-6">
                                                <div className="w-16 h-16 rounded-[24px] bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white font-black text-2xl shadow-xl shadow-blue-500/20 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                                                    {tenant.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div className="flex flex-col gap-1.5">
                                                    <p className="font-black text-slate-800 text-xl tracking-tight leading-none group-hover:text-blue-600 transition-colors">
                                                        {tenant.name}
                                                    </p>
                                                    <div className="flex items-center gap-2.5">
                                                        <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 text-[10px]">✉</div>
                                                        <span className="text-xs font-bold text-slate-500">
                                                            {tenant.contactEmail || tenant.email || tenant.adminEmail || 'Sin email registado'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-10">
                                            <div className="flex flex-col items-start gap-4">
                                                <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-2xl bg-white border border-slate-200 shadow-sm group-hover:shadow-md transition-shadow">
                                                    <div className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-lg shadow-blue-500/50"></div>
                                                    <span className="text-[11px] font-black text-slate-800 uppercase tracking-[0.1em] leading-none">
                                                        {getPlanName(tenant.planId)}
                                                    </span>
                                                </div>
                                                <div className="flex flex-col pl-4 border-l-2 border-slate-100 group-hover:border-blue-200 transition-colors">
                                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
                                                        {tenant.planDuration === 'yearly' ? '📅 Anual' : '📅 Mensual'}
                                                    </span>
                                                    <button onClick={() => openPlanModal(tenant)} className="text-blue-500 hover:text-blue-700 text-[10px] font-black uppercase tracking-wider transition-colors text-left group-hover:translate-x-1 duration-300">
                                                        Gestionar ➜
                                                    </button>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-10">
                                            <div className="flex flex-col gap-2">
                                                <span className="text-[12px] font-black text-slate-800 tracking-wider bg-slate-100/50 px-4 py-2 rounded-2xl border border-slate-100 w-fit">
                                                    {formatDate(tenant.subscriptionEndDate)}
                                                </span>
                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Activa</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-10">
                                            <span className={`inline-flex items-center gap-3 px-5 py-2.5 rounded-full text-[11px] font-black uppercase tracking-[0.2em] border transition-all duration-300 ${tenant.status === 'active'
                                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 shadow-sm'
                                                : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                                                <span className={`w-3 h-3 rounded-full ${tenant.status === 'active' ? 'bg-emerald-500 animate-pulse shadow-lg shadow-emerald-500/50' : 'bg-slate-400'}`}></span>
                                                {tenant.status === 'active' ? 'Activo' : 'Inactivo'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-10">
                                            <div className="flex items-center justify-center gap-3">
                                                <button
                                                    onClick={() => handleGrantFreeMonth(tenant.id)}
                                                    className="w-11 h-11 rounded-[16px] bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white flex items-center justify-center transition-all border border-emerald-100 hover:shadow-xl hover:shadow-emerald-500/20"
                                                    title="Regalar 1 Mes Gratis"
                                                >
                                                    <span className="font-black text-base">+1</span>
                                                </button>

                                                <button
                                                    onClick={() => handleStatusToggle(tenant.id, tenant.status)}
                                                    className={`w-11 h-11 rounded-[16px] flex items-center justify-center transition-all border ${tenant.status === 'active'
                                                        ? 'bg-slate-50 text-slate-400 border-slate-200 hover:bg-amber-50 hover:text-amber-600 hover:border-amber-200'
                                                        : 'bg-blue-50 text-blue-600 border-blue-100 hover:bg-blue-600 hover:text-white shadow-lg shadow-blue-500/20'}`}
                                                    title={tenant.status === 'active' ? 'Suspender Servicio' : 'Activar Servicio'}
                                                >
                                                    <IconCheck size={20} />
                                                </button>

                                                <button
                                                    onClick={() => handleDeleteTenant(tenant.id, tenant.name)}
                                                    className="w-11 h-11 rounded-[16px] bg-slate-50 text-slate-300 border border-slate-100 hover:bg-rose-50 hover:text-rose-500 hover:border-rose-100 flex items-center justify-center transition-all"
                                                    title="Eliminar Clínica Permanentemente"
                                                >
                                                    <IconTrash />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {tenants.length === 0 && (
                            <div className="py-40 text-center">
                                <p className="text-slate-300 text-sm font-black uppercase tracking-[0.3em] italic">Red de Clínicas Vacía</p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Regional Registration Modal - Ultra Premium */}
            {showModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-8 bg-white/40 backdrop-blur-lg animate-in fade-in duration-500">
                    <div className="bg-white w-full max-w-4xl rounded-[56px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-500 border border-white" style={{ backgroundColor: '#ffffff' }}>
                        <div className="p-16 flex flex-col md:flex-row gap-16">
                            <div className="md:w-1/3 space-y-8">
                                <div className="w-20 h-20 rounded-[28px] bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center text-white text-4xl shadow-2xl shadow-blue-500/40">
                                    <IconClinic />
                                </div>
                                <div>
                                    <h3 className="text-4xl font-black text-slate-800 tracking-tight leading-[1.1] mb-4">Nueva Infraestructura</h3>
                                    <p className="text-slate-500 font-medium text-base leading-relaxed">Configura el entorno nacional para una nueva sede odontológica. El administrador recibirá sus credenciales de inmediato.</p>
                                </div>
                                <div className="space-y-4 pt-8">
                                    <div className="flex items-center gap-4 text-emerald-600 font-black text-xs uppercase tracking-widest">
                                        <IconCheck /> Verificación Automática
                                    </div>
                                    <div className="flex items-center gap-4 text-blue-600 font-black text-xs uppercase tracking-widest">
                                        <IconPlan /> Despliegue en 30 Seg
                                    </div>
                                </div>
                            </div>

                            <form onSubmit={handleCreate} className="md:w-2/3 space-y-12">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                    <div className="space-y-6">
                                        <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span> Datos Comerciales
                                        </h4>
                                        <div className="space-y-5">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nombre de la Clínica</label>
                                                <input type="text" className="w-full px-8 py-5 bg-slate-50 border border-slate-100 rounded-[24px] text-base font-bold text-slate-800 outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-400 transition-all font-mono" required value={newTenant.name} onChange={e => setNewTenant({ ...newTenant, name: e.target.value })} />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Corporativo</label>
                                                <input type="email" className="w-full px-8 py-5 bg-slate-50 border border-slate-100 rounded-[24px] text-base font-bold text-slate-800 outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-400 transition-all font-mono" required value={newTenant.contactEmail} onChange={e => setNewTenant({ ...newTenant, contactEmail: e.target.value })} />
                                            </div>
                                            <div className="grid grid-cols-1 gap-4">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Plan Nacional & Ciclo</label>
                                                <div className="flex flex-col gap-4">
                                                    <select className="w-full px-8 py-5 bg-slate-50 border border-slate-100 rounded-[24px] text-base font-bold text-slate-800 outline-none appearance-none cursor-pointer" required value={newTenant.planId} onChange={e => setNewTenant({ ...newTenant, planId: e.target.value })}>
                                                        <option value="">Seleccionar Plan...</option>
                                                        {plans.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                                    </select>
                                                    <div className="flex p-1.5 bg-slate-50 rounded-[24px] border border-slate-100 shadow-inner">
                                                        <button type="button" onClick={() => setNewTenant({ ...newTenant, planDuration: 'monthly' })} className={`flex-1 py-4 text-[10px] font-black uppercase tracking-widest rounded-[18px] transition-all duration-300 ${newTenant.planDuration === 'monthly' ? 'bg-white shadow-xl text-blue-600' : 'text-slate-400'}`}>Mensual</button>
                                                        <button type="button" onClick={() => setNewTenant({ ...newTenant, planDuration: 'yearly' })} className={`flex-1 py-4 text-[10px] font-black uppercase tracking-widest rounded-[18px] transition-all duration-300 ${newTenant.planDuration === 'yearly' ? 'bg-white shadow-xl text-blue-600' : 'text-slate-400'}`}>Facturación Anual</button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span> Superusuario
                                        </h4>
                                        <div className="space-y-5">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Director Responsable</label>
                                                <input type="text" className="w-full px-8 py-5 bg-slate-100/50 border border-slate-100 rounded-[24px] text-base font-bold text-slate-800 outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-400 transition-all placeholder:text-slate-400" required value={newTenant.adminName} onChange={e => setNewTenant({ ...newTenant, adminName: e.target.value })} placeholder="Ej. Dr. Mauricio Madrid" />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email de Acceso</label>
                                                <input type="email" className="w-full px-8 py-5 bg-slate-100/50 border border-slate-100 rounded-[24px] text-base font-bold text-slate-800 outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-400 transition-all font-mono" required value={newTenant.adminEmail} onChange={e => setNewTenant({ ...newTenant, adminEmail: e.target.value })} />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Contraseña de Seguridad</label>
                                                <input type="password" className="w-full px-8 py-5 bg-slate-100/50 border border-slate-100 rounded-[24px] text-base font-bold text-slate-800 outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-400 transition-all font-mono" required value={newTenant.adminPassword} onChange={e => setNewTenant({ ...newTenant, adminPassword: e.target.value })} />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-8 flex gap-6">
                                    <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-6 bg-slate-50 hover:bg-slate-100 text-slate-500 rounded-[28px] text-[11px] font-black uppercase tracking-[0.2em] transition-all border border-slate-100">Descartar</button>
                                    <button type="submit" className="flex-1 py-6 bg-gradient-to-r from-blue-600 to-indigo-700 hover:brightness-110 text-white rounded-[28px] text-[11px] font-black uppercase tracking-[0.2em] shadow-2xl shadow-blue-500/40 transition-all transform active:scale-95">Desplegar Nueva Sede</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Subscription Requests Modal - Inbox Ultra Premium */}
            {showRequestModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-8 bg-white/60 backdrop-blur-2xl animate-in fade-in duration-500">
                    <div className="bg-white w-full max-w-2xl rounded-[64px] shadow-2xl overflow-hidden animate-in slide-in-from-bottom-24 duration-700 border border-white" style={{ backgroundColor: '#ffffff' }}>
                        <div className="p-16">
                            <div className="flex justify-between items-start mb-12">
                                <div className="space-y-2">
                                    <h3 className="text-4xl font-black text-slate-800 tracking-tighter leading-none">Buzón Operativo</h3>
                                    <p className="text-[11px] font-black text-blue-500 uppercase tracking-[0.3em]">Gestión de Renovaciones</p>
                                </div>
                                <button onClick={() => setShowRequestModal(false)} className="w-14 h-14 rounded-3xl bg-slate-50 text-slate-300 hover:text-slate-600 flex items-center justify-center text-4xl font-light transition-all active:scale-90">&times;</button>
                            </div>

                            <div className="max-h-[50vh] overflow-y-auto space-y-8 pr-6 custom-scrollbar">
                                {requests.length === 0 ? (
                                    <div className="py-24 text-center">
                                        <div className="w-24 h-24 bg-slate-50 rounded-[40px] flex items-center justify-center text-slate-200 mx-auto mb-8 text-5xl"> Inbox </div>
                                        <p className="text-[11px] font-black text-slate-300 uppercase tracking-[0.3em]">No hay gestiones pendientes</p>
                                    </div>
                                ) : (
                                    requests.map(req => (
                                        <div key={req.id} className="bg-white border border-slate-100 rounded-[40px] p-10 shadow-2xl shadow-slate-200/50 hover:border-blue-300 transition-all group relative">
                                            <div className="absolute top-6 right-10 text-[10px] font-black text-slate-300 uppercase tracking-widest">{formatDate(req.createdAt)}</div>

                                            <div className="flex items-center gap-6 mb-10">
                                                <div className="w-16 h-16 rounded-3xl bg-slate-900 border-4 border-slate-800 text-white flex items-center justify-center font-black text-2xl shadow-xl">{req.tenantName.charAt(0)}</div>
                                                <div>
                                                    <h4 className="font-black text-slate-800 text-2xl tracking-tighter mb-1.5">{req.tenantName}</h4>
                                                    <span className="px-4 py-1.5 bg-orange-50 text-orange-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-orange-100">Upgrade Requerido</span>
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between gap-6 bg-slate-100/50 p-7 rounded-[32px] mb-10 border border-slate-50">
                                                <div className="flex-1 text-center">
                                                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-2">Plan Base</p>
                                                    <p className="text-sm font-bold text-slate-500">{getPlanName(req.currentPlanId)}</p>
                                                </div>
                                                <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-blue-500 shadow-sm">
                                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                                                </div>
                                                <div className="flex-1 text-center">
                                                    <p className="text-[10px] text-blue-500 font-black uppercase tracking-widest mb-2">Nuevo Destino</p>
                                                    <p className="text-lg font-black text-blue-700 tracking-tight">{req.requestedPlanName}</p>
                                                </div>
                                            </div>

                                            <div className="flex gap-4">
                                                <button onClick={() => handleRejectRequest(req.id)} className="px-8 py-5 text-rose-500 font-black text-[11px] uppercase tracking-widest hover:bg-rose-50 rounded-[28px] transition-all">Rechazar</button>
                                                <button onClick={() => {
                                                    const msg = `Hola *${req.tenantName}*, soy la central de OdontoCloud. Recibimos tu solicitud para el plan *${req.requestedPlanName}*. Por favor adjunta el soporte de pago para activarlo.`;
                                                    window.open(`https://wa.me/${req.tenantPhone || '573124119846'}?text=${encodeURIComponent(msg)}`, "_blank");
                                                }} className="px-8 py-5 bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white rounded-[28px] text-[11px] font-black uppercase tracking-widest transition-all shadow-lg shadow-emerald-500/10">WhatsApp</button>
                                                <button onClick={() => handleApproveRequest(req.id)} disabled={processing} className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-[28px] text-[11px] font-black uppercase tracking-widest shadow-2xl shadow-blue-500/40 hover:brightness-110 transition-all flex items-center justify-center gap-2 font-mono">
                                                    {processing ? '...' : 'Autorizar y Activar'}
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Plan Adjustment Modal - Compact Executive Design */}
            {showPlanModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-8 bg-white/30 backdrop-blur-lg animate-in fade-in duration-500">
                    <div className="bg-white w-full max-w-sm rounded-[56px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-500 border border-slate-100" style={{ backgroundColor: '#ffffff' }}>
                        <div className="p-12">
                            <div className="w-20 h-20 rounded-[32px] bg-blue-50 text-blue-600 flex items-center justify-center text-3xl mx-auto mb-8 shadow-inner shadow-blue-500/10">
                                <IconPlan />
                            </div>
                            <h3 className="text-2xl font-black text-slate-800 tracking-tighter leading-none mb-2 text-center uppercase">Ajustar Plan</h3>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-12 text-center">{selectedTenant?.name}</p>

                            <form onSubmit={handleUpdatePlan} className="space-y-10">
                                <div className="space-y-8">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 block">Suscripción Objetivo</label>
                                        <select className="w-full px-8 py-5 bg-slate-50 border border-slate-100 rounded-[24px] text-base font-bold text-slate-800 outline-none appearance-none cursor-pointer"
                                            required value={newPlanId} onChange={e => setNewPlanId(e.target.value)}>
                                            {plans.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 block">Ciclo de Facturación</label>
                                        <div className="flex p-1.5 bg-slate-50 rounded-[24px] border border-slate-100 shadow-inner">
                                            <button type="button" onClick={() => setNewDuration('monthly')} className={`flex-1 py-4 text-[10px] font-black uppercase tracking-widest rounded-[20px] transition-all duration-300 ${newDuration === "monthly" ? "bg-white shadow-xl text-blue-600" : "text-slate-400"}`}>Mensual</button>
                                            <button type="button" onClick={() => setNewDuration('yearly')} className={`flex-1 py-4 text-[10px] font-black uppercase tracking-widest rounded-[20px] transition-all duration-300 ${newDuration === "yearly" ? "bg-white shadow-xl text-blue-600" : "text-slate-400"}`}>Anual</button>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-4 pt-4">
                                    <button type="button" onClick={() => setShowPlanModal(false)} className="flex-1 py-5 bg-slate-50 text-slate-500 rounded-[24px] text-[10px] font-black uppercase tracking-widest transition-all active:scale-95">Descartar</button>
                                    <button type="submit" className="flex-1 py-5 bg-blue-600 text-white rounded-[24px] text-[10px] font-black uppercase tracking-widest shadow-2xl shadow-blue-500/40 hover:brightness-110 transition-all active:scale-95 transform">Confirmar</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #e2e8f0;
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #cbd5e1;
                }
            `}</style>
        </div>
    );
}
