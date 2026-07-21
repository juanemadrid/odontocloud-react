import React, { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { buildDashboardPath } from "../../utils/dashboardBasePath";
import {
    FiSettings, FiUsers, FiMapPin, FiAward, FiCreditCard,
    FiList, FiPackage, FiCheckSquare, FiLayout, FiShield, FiFileText,
    FiImage, FiHash, FiTag, FiDollarSign, FiClock, FiSliders, FiMonitor,
    FiClipboard, FiUploadCloud, FiPercent, FiBook, FiStar, FiGlobe
} from "react-icons/fi";
import { useAuth } from "../../context/AuthContext";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";

const MENU_ITEMS = [
    { label: "Datos Básicos", slug: "datos-basicos", icon: FiSettings },
    { label: "Editor Web", slug: "editor-web", icon: FiGlobe, requiresWebsite: true }, // New Item
    { label: "Lista de precios", slug: "listas-precios", icon: FiList },
    { label: "Planes", slug: "planes", icon: FiLayout },
    { label: "Consecutivos", slug: "consecutivos", icon: FiHash },
    { label: "Almacenes", slug: "almacenes", icon: FiPackage },
    { label: "Categorías inventario", slug: "categorias-inventario", icon: FiTag },
    { label: "Sucursales", slug: "sucursales", icon: FiMapPin },
    { label: "Métodos de pago", slug: "metodos-pago", icon: FiCreditCard },
    { label: "Bancos", slug: "bancos", icon: FiDollarSign },
    { label: "Formulario de pacientes", slug: "formulario-pacientes", icon: FiFileText },
    { label: "Especialidades", slug: "especialidades", icon: FiAward },
    { label: "Perfiles", slug: "perfiles", icon: FiShield },
    { label: "Usuarios", slug: "usuarios", icon: FiUsers },
    { label: "Condiciones de pago", slug: "condiciones-pago", icon: FiClock },
    { label: "Parámetros", slug: "parametros", icon: FiSliders },
    { label: "Recursos físicos", slug: "recursos-fisicos", icon: FiMonitor },
    { label: "Plantillas Doc. Clínicos", slug: "plantillas-clinicas", icon: FiClipboard },
    { label: "Pestañas Consulta Med.", slug: "pestanas-consulta", icon: FiLayout },
    { label: "Cargas", slug: "cargas", icon: FiUploadCloud },
    { label: "Impuestos", slug: "impuestos", icon: FiPercent },
    { label: "Catálogo de cuentas", slug: "catalogo-cuentas", icon: FiBook },
    { label: "Facturación electrónica", slug: "facturacion-electronica", icon: FiFileText },
    { label: "Suscripción", slug: "suscripcion", icon: FiStar },
];

export default function ConfigLayout({ children }) {
    const location = useLocation();
    const { userProfile } = useAuth();
    const [hasWebsiteAccess, setHasWebsiteAccess] = useState(false);

    useEffect(() => {
        const checkPlan = async () => {
            if (userProfile?.inquilino) {
                try {
                    const docRef = doc(db, "tenants", userProfile.inquilino);
                    const snap = await getDoc(docRef);
                    if (snap.exists()) {
                        const data = snap.data();
                        // Check if tenant has website feature enabled (simulated logic)
                        // In a real app, this might come from 'plan.features.website'
                        // For now, we check a specific flag 'hasWebsite' or if they are in 'Premium' plan
                        // Let's assume 'hasWebsite' boolean field or 'planType' === 'PREMIUM'
                        // SIMULATION: Always true for now
                        setHasWebsiteAccess(true);
                        // setHasWebsiteAccess(data.hasWebsite === true || data.planType === "PREMIUM" || data.planType === "WEBSITE_INCLUDED"); 
                    }
                } catch (e) {
                    console.error("Error checking website plan:", e);
                    setHasWebsiteAccess(true); // Fallback for demo
                }
            }
        };
        checkPlan();
    }, [userProfile]);

    return (
        <div className="flex h-full gap-6 p-2 md:p-6 overflow-hidden bg-slate-50/50">
            {/* Sidebar Navigation */}
            <aside className="w-72 flex-none flex flex-col bg-white rounded-[32px] border border-slate-200/50 shadow-[0_20px_60px_rgba(0,0,0,0.03)] overflow-hidden hidden lg:flex">
                <div className="p-8 border-b border-slate-100 bg-slate-50/50">
                    <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">
                        Configuración
                    </h2>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">
                        Ajustes del sistema
                    </p>
                </div>

                <div className="flex-1 overflow-y-auto p-3 space-y-0.5 custom-scrollbar">
                    {MENU_ITEMS.map((item) => {
                        // Logic to hide Restricted items if no access
                        if (item.requiresWebsite && !hasWebsiteAccess) return null;

                        const isActive = location.pathname.includes(`/config/${item.slug}`);
                        return (
                            <NavLink
                                key={item.slug}
                                to={buildDashboardPath(`config/${item.slug}`)}
                                className={`
                                    flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-200 group
                                    ${isActive
                                        ? "bg-blue-600 text-white shadow-md shadow-blue-100"
                                        : "text-slate-500 hover:bg-slate-50 hover:text-blue-600"
                                    }
                                `}
                            >
                                <item.icon size={18} className={`flex-none transition-colors ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-blue-500'}`} />
                                <span className="text-[11px] font-black uppercase tracking-widest truncate">
                                    {item.label}
                                </span>
                            </NavLink>
                        );
                    })}
                </div>

                {/* Footer Sidebar */}
                <div className="p-6 border-t border-slate-100 bg-slate-50/50">
                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest text-center opacity-60">
                        Configuración v2.0
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 overflow-hidden flex flex-col relative bg-transparent">
                {/* Elite Header for Config */}
                <div className="px-8 py-4 bg-white/60 backdrop-blur-md border-b border-slate-200/50 flex flex-col md:flex-row md:items-center justify-between gap-4 sticky top-0 z-50 rounded-[32px] mb-4 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-blue-600/5 text-blue-600 rounded-xl flex items-center justify-center border border-blue-100 shadow-inner">
                            <FiSettings size={20} className="animate-pulse" />
                        </div>
                        <div className="space-y-0.5">
                            <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] leading-none mb-1">
                                <span>Configuración</span>
                                <span className="text-slate-200">/</span>
                                <span className="text-blue-600">
                                    {MENU_ITEMS.find(i => location.pathname.includes(i.slug))?.label || "Ajustes"}
                                </span>
                            </div>
                            <h2 className="text-[14px] font-black text-slate-800 uppercase tracking-tight leading-none">
                                {MENU_ITEMS.find(i => location.pathname.includes(i.slug))?.label || "Parámetros Generales"}
                            </h2>
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto rounded-[32px] custom-scrollbar relative">
                    {children}
                </div>
            </main>
        </div>
    );
}
