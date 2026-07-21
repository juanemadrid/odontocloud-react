
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "../../firebase/firebaseConfig";
import { useAuth } from "../../context/AuthContext";
import ModernLanding from "../../pages/ModernLanding";
import { DEFAULT_CONFIG } from "../../constants/DefaultConfig";
import { MASTER_CONFIG } from "../../constants/MasterConfig";
import VivaHeader from "../../layout/VivaHeader";
import VivaFooter from "../../layout/VivaFooter";
import IdentitySection from "../../pages/landing/IdentitySection";
import ServicesSection from "../../pages/landing/ServicesSection";
import { FiMonitor, FiSmartphone, FiLayout, FiImage, FiType, FiUsers, FiMessageSquare, FiSend, FiGlobe, FiPlus, FiTrash2, FiMaximize, FiEdit, FiHash, FiZap, FiExternalLink } from "react-icons/fi";

const TABS = [
    { id: "hero", label: "Inicio / Slides", icon: <FiLayout size={18} /> },
    { id: "style", label: "Estilo y Marca", icon: <FiZap size={18} /> },
    { id: "identity", label: "Identidad", icon: <FiType size={18} /> },
    { id: "services", label: "Servicios", icon: <FiMaximize size={18} /> },
    { id: "team", label: "Nuestro Equipo", icon: <FiUsers size={18} /> },
    { id: "testimonials", label: "Testimonios", icon: <FiMessageSquare size={18} /> },
    { id: "footer", label: "Contacto / Footer", icon: <FiGlobe size={18} /> },
    { id: "cta_final", label: "Llamado a Acción", icon: <FiSend size={18} /> },
];

import { useNavigate } from "react-router-dom";

export default function WebCms() {
    const { userProfile } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("hero");
    const [viewMode, setViewMode] = useState("desktop");
    const previewContainerRef = useRef(null);
    const [scale, setScale] = useState(1);

    const isSuperAdmin = userProfile?.rol?.toLowerCase() === "superadmin";
    // FIX: If SuperAdmin wants to edit their OWN tenant site (if they have one), we might need a switch.
    // But for now, let's assume SuperAdmin always edits Master, and Tenant Admins edit Tenant.
    // If a user is BOTH SuperAdmin AND Tenant (unlikely in strict SaaS, but possible in dev), 
    // we default to Master for safety, or we can check if they are in a "Tenant Context".

    // However, the user complaint is "I cannot allow OdontoSalud to modify SuperAdmin".
    // This implies an OdontoSalud user (Tenant Admin) is capable of editing Master.
    // This only happens if isSuperAdmin is true for them.

    const configDocId = isSuperAdmin ? "general" : userProfile?.inquilino;
    const baseConfig = isSuperAdmin ? MASTER_CONFIG : DEFAULT_CONFIG;

    // DEBUG: Add tenant name for UI clarity
    const tenantName = isSuperAdmin ? "SITIO PRINCIPAL (MASTER)" : (userProfile?.tenant?.name || "MI CLÍNICA");

    const [config, setConfig] = useState({ ...baseConfig });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (!previewContainerRef.current) return;
        const resizeObserver = new ResizeObserver((entries) => {
            for (let entry of entries) {
                const parentHeight = entry.contentRect.height;
                const parentWidth = entry.contentRect.width;
                if (viewMode === "desktop") {
                    const targetHeight = parentHeight * 0.80;
                    const targetWidth = parentWidth * 0.80;
                    const scaleH = targetHeight / 980;
                    const scaleW = targetWidth / 1460;
                    setScale(Math.min(scaleH, scaleW, 1));
                } else {
                    const targetHeight = parentHeight * 0.84;
                    const targetWidth = parentWidth * 0.84;
                    const scaleH = targetHeight / 795;
                    const scaleW = targetWidth / 403;
                    setScale(Math.min(scaleH, scaleW, 1));
                }
            }
        });
        resizeObserver.observe(previewContainerRef.current);
        return () => resizeObserver.disconnect();
    }, [viewMode, loading]);

    // Sync state to localStorage for the iframe preview
    useEffect(() => {
        try {
            localStorage.setItem("odc_cms_preview_config", JSON.stringify(config));
            localStorage.setItem("odc_cms_preview_active_tab", activeTab);
            localStorage.setItem("odc_cms_preview_is_master", String(isSuperAdmin));
        } catch (e) {
            console.warn("Error writing preview config to localStorage:", e);
        }
    }, [config, activeTab, isSuperAdmin]);

    useEffect(() => {
        if (!userProfile) return;
        // If not super admin and no tenant ID, show error state (handled in render)
        if (!isSuperAdmin && !userProfile.inquilino) {
            setLoading(false);
            return;
        }
        loadData();
    }, [userProfile, configDocId]); // Depend on configDocId/userProfile

    const loadData = async () => {
        if (!configDocId) return;
        setLoading(true);
        try {
            console.log("Loading Config for:", configDocId); // Debug
            const docRef = doc(db, "website_config", configDocId);
            const snap = await getDoc(docRef);
            if (snap.exists()) {
                const data = snap.data();
                setConfig({
                    ...baseConfig,
                    ...data,
                    // Ensure slug is correct based on context
                    slug: isSuperAdmin ? "general" : (userProfile?.tenant?.slug || ""),
                    services: data.services || baseConfig.services || [],
                    doctors: data.doctors || baseConfig.doctors || [],
                    testimonials: data.testimonials || baseConfig.testimonials || [],
                    slides: data.slides || baseConfig.slides || []
                });
            } else {
                // If no config exists, load defaults but ensure slug/name are correct
                setConfig({
                    ...baseConfig,
                    slug: isSuperAdmin ? "general" : (userProfile?.tenant?.slug || ""),
                    name: isSuperAdmin ? baseConfig.name : (userProfile?.tenant?.name || ""), // Use tenant name if available
                    heroTitle: isSuperAdmin ? baseConfig.heroTitle : (userProfile?.tenant?.name || baseConfig.heroTitle) // Personalized default
                });
            }
        } catch (e) {
            console.error("Error loading CMS data:", e);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!configDocId) {
            alert("❌ Error Crítico: No se encontró el ID del documento (inquilino). Recarga la página.");
            return;
        }
        setSaving(true);
        try {
            console.log("Saving Config to:", configDocId);
            await setDoc(doc(db, "website_config", configDocId), config);
            // Also update the local state to trigger any re-renders if needed
            // setConfig({...config}); 
            alert("✅ SITIO ACTUALIZADO CORRECTAMENTE.\n\nLos cambios pueden tardar unos segundos en reflejarse. Recarga tu página web.");
        } catch (e) {
            console.error("Save Error:", e);
            alert("❌ Error al guardar: " + e.message);
        } finally {
            setSaving(false);
        }
    };

    const handleImageUpload = async (e, listKey, index, field) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            const storageRef = ref(storage, `website_uploads/${Date.now()}_${file.name}`);
            const snapshot = await uploadBytes(storageRef, file);
            const downloadURL = await getDownloadURL(snapshot.ref);
            updateItem(listKey, index, field, downloadURL);
        } catch (error) {
            console.error("Error uploading image:", error);
            alert(`Error subiendo imagen: ${error.message}`);
        }
    };

    const handleSimpleImageUpload = async (e, field) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            const storageRef = ref(storage, `website_uploads/${Date.now()}_${file.name}`);
            const snapshot = await uploadBytes(storageRef, file);
            const downloadURL = await getDownloadURL(snapshot.ref);
            setConfig(prev => ({ ...prev, [field]: downloadURL }));
        } catch (error) {
            console.error("Error uploading image:", error);
            alert(`Error subiendo imagen: ${error.message}`);
        }
    };

    const updateItem = (listKey, index, field, val) => {
        const list = [...(config[listKey] || [])];
        if (!list[index]) return;
        list[index] = { ...list[index], [field]: val };
        setConfig(prev => ({ ...prev, [listKey]: list }));
    };

    const addItem = (listKey, defaultItem) => {
        const list = config[listKey] || [];
        setConfig({ ...config, [listKey]: [...list, defaultItem] });
    };

    const removeItem = (listKey, index) => {
        if (!window.confirm("¿Eliminar ítem?")) return;
        const list = (config[listKey] || []).filter((_, i) => i !== index);
        setConfig({ ...config, [listKey]: list });
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center h-full min-h-[500px] py-20 bg-white/50 rounded-[32px] border border-slate-100">
            <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
            <p className="mt-4 font-black text-slate-400 uppercase tracking-widest text-[10px]">Cargando Editor...</p>
        </div>
    );

    return (
        <div className="flex h-[calc(100vh-170px)] min-h-[550px] overflow-hidden bg-[#F8FAFC] rounded-[32px] border border-slate-200/50">

            {/* EDITOR PANEL (Left) */}
            <div className="w-[450px] h-full bg-white border-r border-slate-200/60 shadow-[20px_0_60px_rgba(0,0,0,0.02)] flex flex-col z-50 overflow-hidden">

                {/* Header Premium Clean */}
                <div className="px-8 py-8 bg-white relative shrink-0 border-b border-slate-50">
                    <button
                        onClick={() => navigate(buildDashboardPath('config/datos-basicos'))}
                        className="flex items-center gap-1.5 text-[9.5px] font-black text-indigo-600 hover:text-indigo-700 uppercase tracking-widest mb-4 transition-colors duration-300"
                    >
                        ← Volver a Ajustes
                    </button>
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${isSuperAdmin ? 'bg-indigo-500' : 'bg-emerald-500'} animate-pulse`} />
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                {isSuperAdmin ? 'Master' : 'En línea'}
                            </span>
                        </div>
                        {/* Optional: Add Last Saved time here later */}
                    </div>

                    <h1 className="text-2xl font-black text-slate-800 tracking-tight uppercase leading-none mb-1">
                        Editor Web
                    </h1>
                    <p className="text-xs font-bold text-indigo-600 uppercase tracking-wider truncate">
                        {tenantName}
                    </p>
                </div>

                {/* Navigation Tabs (2-Column Grid Style) */}
                <div className="px-8 pb-6 grid grid-cols-2 gap-2 shrink-0 border-b border-slate-50">
                    {TABS.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all duration-300 border justify-start w-full truncate
                                ${activeTab === tab.id
                                    ? "bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-100"
                                    : "bg-slate-50/50 text-slate-500 border-slate-150 hover:bg-slate-100/70 hover:text-slate-700"
                                }`}
                        >
                            <span className="shrink-0" style={{ color: activeTab === tab.id ? 'white' : '#6366f1' }}>
                                {tab.icon}
                            </span>
                            <span className="truncate">{tab.label}</span>
                        </button>
                    ))}
                </div>

                {/* Scrollable Content Area */}
                <div className="flex-1 overflow-y-auto custom-scrollbar px-10 py-10 space-y-10 text-left">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 10 }}
                            transition={{ duration: 0.3 }}
                        >
                            {/* TAB: HERO / SLIDES */}
                            {activeTab === "hero" && (
                                <div className="space-y-10">
                                    <div className="bg-white rounded-[32px] p-8 border border-slate-200/60 shadow-sm space-y-6">
                                        <h3 className="text-[12px] font-black text-slate-800 uppercase tracking-[0.2em] mb-6 flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-sm">
                                                <FiLayout size={18} />
                                            </div>
                                            Configuración Principal
                                        </h3>
                                        <div className="space-y-4 mb-8 border-b border-slate-100 pb-8">
                                            <div>
                                                <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Texto Botón Principal (CTA)</label>
                                                <div className="relative group/tooltip">
                                                    <input
                                                        className="w-full bg-slate-50 border border-slate-100 px-4 py-3 rounded-xl outline-none focus:bg-white transition-all font-bold text-[13px] text-indigo-600"
                                                        value={config.heroBtn1Text || ""}
                                                        onChange={e => setConfig({ ...config, heroBtn1Text: e.target.value })}
                                                        placeholder="Ej: Solicitar Asesoría"
                                                    />
                                                    <div className="absolute left-0 bottom-full mb-2 bg-slate-800 text-white text-[10px] px-3 py-1 rounded opacity-0 group-hover/tooltip:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                                                        Este es el botón azul grande en el Hero
                                                    </div>
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Texto Botón Secundario</label>
                                                <div className="relative group/tooltip">
                                                    <input
                                                        className="w-full bg-slate-50 border border-slate-100 px-4 py-3 rounded-xl outline-none focus:bg-white transition-all font-bold text-[13px] text-slate-500"
                                                        value={config.heroBtn2Text || ""}
                                                        onChange={e => setConfig({ ...config, heroBtn2Text: e.target.value })}
                                                        placeholder="Ej: Ver Servicios"
                                                    />
                                                    <div className="absolute left-0 bottom-full mb-2 bg-slate-800 text-white text-[10px] px-3 py-1 rounded opacity-0 group-hover/tooltip:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                                                        Este es el botón transparente al lado del principal
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <h3 className="text-[12px] font-black text-slate-800 uppercase tracking-[0.2em] mb-6 flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-sm">
                                                <FiImage size={18} />
                                            </div>
                                            Slides de Inicio (Hero)
                                        </h3>
                                        <button
                                            onClick={() => addItem('slides', { title: "NUEVO SLIDE", subtitle: "Descripción del slide", image: "", btnText: "Agendar Cita", btnLink: "#" })}
                                            className="w-full bg-indigo-50 hover:bg-indigo-100 text-indigo-600 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 border border-indigo-100 border-dashed"
                                        >
                                            <FiPlus size={16} /> Añadir Nuevo Slide
                                        </button>
                                    </div>

                                    <div className="space-y-6">
                                        {config.slides && config.slides.map((slide, i) => (
                                            <motion.div layout key={i} className="bg-white rounded-[32px] border border-slate-100 p-8 shadow-sm relative group overflow-hidden hover:shadow-xl hover:shadow-indigo-500/5 transition-all">
                                                <button onClick={() => removeItem('slides', i)} className="absolute top-4 right-4 w-10 h-10 rounded-2xl bg-white border border-slate-100 text-red-500 flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-all active:scale-90 z-20 hover:bg-red-50">
                                                    <FiTrash2 size={16} />
                                                </button>

                                                <div className="space-y-6">
                                                    <div className="w-full aspect-video rounded-2xl bg-slate-50 overflow-hidden relative group/img border border-slate-100">
                                                        {slide.image ? (
                                                            <img src={slide.image} alt="Slide" className="w-full h-full object-cover" />
                                                        ) : (
                                                            <div className="w-full h-full flex flex-col items-center justify-center text-slate-300 gap-2">
                                                                <FiImage size={32} />
                                                                <span className="text-[8px] font-black uppercase tracking-widest">Sin Imagen</span>
                                                            </div>
                                                        )}
                                                        <label className="absolute inset-0 bg-indigo-900/60 backdrop-blur-sm flex flex-col items-center justify-center text-white opacity-0 group-hover/img:opacity-100 transition-opacity cursor-pointer text-center px-4">
                                                            <FiImage size={24} className="mb-2" />
                                                            <span className="text-[10px] font-black uppercase tracking-widest">Cambiar Fondo</span>
                                                            <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'slides', i, 'image')} />
                                                        </label>
                                                    </div>

                                                    <div className="space-y-4">
                                                        <div>
                                                            <label className="block text-[8px] font-black text-slate-300 uppercase tracking-widest mb-1 px-1">Título Principal</label>
                                                            <input className="w-full bg-transparent font-black text-[18px] text-slate-800 outline-none focus:border-b-2 focus:border-indigo-500 transition-all uppercase tracking-tight" value={slide.title || ""} onChange={e => updateItem('slides', i, 'title', e.target.value)} />
                                                        </div>
                                                        <div>
                                                            <label className="block text-[8px] font-black text-slate-300 uppercase tracking-widest mb-1 px-1">Subtítulo / Descripción</label>
                                                            <textarea className="w-full bg-transparent font-bold text-[12px] text-slate-500 outline-none focus:border-b-2 focus:border-slate-200 transition-all resize-none" rows={2} value={slide.subtitle || ""} onChange={e => updateItem('slides', i, 'subtitle', e.target.value)} />
                                                        </div>
                                                        <div className="grid grid-cols-2 gap-4 pt-2">
                                                            <div>
                                                                <label className="block text-[8px] font-black text-slate-300 uppercase tracking-widest mb-1 px-1">Texto Botón</label>
                                                                <input className="w-full bg-slate-50 px-4 py-2 rounded-xl font-black text-[10px] text-indigo-600 uppercase tracking-widest outline-none focus:bg-white transition-all border border-slate-100" value={slide.btnText || ""} onChange={e => updateItem('slides', i, 'btnText', e.target.value)} />
                                                            </div>
                                                            <div>
                                                                <label className="block text-[8px] font-black text-slate-300 uppercase tracking-widest mb-1 px-1">Link Botón</label>
                                                                <input className="w-full bg-slate-50 px-4 py-2 rounded-xl font-bold text-[10px] text-slate-400 outline-none focus:bg-white transition-all border border-slate-100" value={slide.btnLink || ""} onChange={e => updateItem('slides', i, 'btnLink', e.target.value)} />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* TAB: STYLE & BRAND */}
                            {activeTab === "style" && (
                                <div className="space-y-8">
                                    {/* Brand Identity / Nombre y Logo */}
                                    <div className="bg-white rounded-[32px] p-8 border border-slate-200/60 shadow-sm space-y-6">
                                        <h3 className="text-[12px] font-black text-slate-800 uppercase tracking-[0.2em] mb-6 flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-sm">
                                                <FiType size={18} />
                                            </div>
                                            Identidad de Marca
                                        </h3>
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Nombre de la Clínica</label>
                                                <input
                                                    className="w-full bg-slate-50 border border-slate-100 px-4 py-3 rounded-xl outline-none focus:bg-white transition-all font-bold text-[13px] text-slate-800"
                                                    value={config.name || ""}
                                                    onChange={e => setConfig({ ...config, name: e.target.value })}
                                                    placeholder="Ej: Clínica Dental Madrid"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Logotipo (Imagen)</label>
                                                <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                                    {config.logo ? (
                                                        <div className="relative w-16 h-16 bg-white rounded-xl border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center">
                                                            <img src={config.logo} alt="Logo Preview" className="max-w-full max-h-full object-contain" />
                                                            <button
                                                                type="button"
                                                                onClick={() => setConfig({ ...config, logo: "" })}
                                                                className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center shadow-lg hover:bg-red-600 active:scale-90"
                                                            >
                                                                <FiTrash2 size={10} />
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <div className="w-16 h-16 bg-slate-200/60 rounded-xl flex items-center justify-center text-slate-400 shrink-0 border border-slate-300/40">
                                                            <FiImage size={24} />
                                                        </div>
                                                    )}
                                                    <div className="flex-1">
                                                        <label className="inline-flex px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-black uppercase tracking-widest rounded-xl cursor-pointer shadow-md transition-all active:scale-95">
                                                            Subir Imagen
                                                            <input
                                                                type="file"
                                                                className="hidden"
                                                                accept="image/*"
                                                                onChange={(e) => handleSimpleImageUpload(e, 'logo')}
                                                            />
                                                        </label>
                                                        <p className="text-[9px] font-medium text-slate-400 mt-2">Recomendado: Imagen PNG con fondo transparente (máx. 2MB).</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-slate-50/50 rounded-[32px] p-8 border border-slate-100/60 shadow-inner group/card hover:bg-white hover:shadow-xl transition-all duration-500">
                                        <h3 className="text-[12px] font-black text-slate-800 uppercase tracking-[0.2em] mb-8 flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-2xl bg-white shadow-md flex items-center justify-center text-indigo-600 border border-slate-50 group-hover/card:rotate-12 transition-transform">
                                                <FiZap size={18} />
                                            </div>
                                            Estética y Marca
                                        </h3>
                                        <div className="space-y-6">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Color Principal</label>
                                                    <div className="flex items-center gap-3 bg-white p-3 rounded-2xl border border-slate-200">
                                                        <input type="color" className="w-10 h-10 p-0 border-none bg-transparent cursor-pointer rounded-lg overflow-hidden shrink-0" value={config.primaryColor} onChange={e => setConfig({ ...config, primaryColor: e.target.value })} />
                                                        <input className="flex-1 bg-transparent font-mono text-[11px] font-black uppercase text-slate-700 outline-none" value={config.primaryColor} readOnly />
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Color Acento (Botones)</label>
                                                    <div className="flex items-center gap-3 bg-white p-3 rounded-2xl border border-slate-200">
                                                        <input type="color" className="w-10 h-10 p-0 border-none bg-transparent cursor-pointer rounded-lg overflow-hidden shrink-0" value={config.secondaryColor || "#022a63"} onChange={e => setConfig({ ...config, secondaryColor: e.target.value })} />
                                                        <input className="flex-1 bg-transparent font-mono text-[11px] font-black uppercase text-slate-700 outline-none" value={config.secondaryColor || "#022a63"} readOnly />
                                                    </div>
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Tipografía Corporativa</label>
                                                <select
                                                    className="w-full bg-white px-6 py-4 rounded-2xl border border-slate-200 font-black text-[13px] text-slate-700 outline-none focus:ring-4 focus:ring-indigo-100 transition-all appearance-none cursor-pointer"
                                                    value={config.fontFamily}
                                                    onChange={e => setConfig({ ...config, fontFamily: e.target.value })}
                                                >
                                                    <option value="Inter">INTER (SUIZA MODERN)</option>
                                                    <option value="Roboto">ROBOTO (INDUSTRIAL)</option>
                                                    <option value="Playfair Display">PLAYFAIR (INSTITUTIONAL)</option>
                                                    <option value="Lato">LATO (SOFT GEOMETRIC)</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-slate-900 rounded-[32px] p-8 shadow-2xl relative overflow-hidden group/social">
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full -mr-16 -mt-16 blur-3xl group-hover/social:bg-indigo-500/20 transition-colors" />
                                        <h3 className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em] mb-8 flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                                            Variables del "Azulito" (Branding)
                                        </h3>
                                        <div className="space-y-4">
                                            <p className="text-[10px] text-white/40 font-medium px-1">
                                                Ajusta los colores que definen la personalidad de tu clínica en la web.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* TAB: FOOTER & CONTACT */}
                            {activeTab === "footer" && (
                                <div className="space-y-10">
                                    <div className="bg-white rounded-[32px] p-8 border border-slate-200/60 shadow-sm space-y-6">
                                        <h3 className="text-[12px] font-black text-slate-800 uppercase tracking-[0.2em] mb-6 flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-sm">
                                                <FiGlobe size={18} />
                                            </div>
                                            Información de Contacto
                                        </h3>
                                        <div className="space-y-6">
                                            <div className="group/field">
                                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Email Corporativo</label>
                                                <input className="w-full bg-slate-50 border border-slate-100 px-6 py-4 rounded-2xl outline-none focus:bg-white transition-all font-bold text-[13px] text-slate-800" value={config.contactEmail || ""} onChange={e => setConfig({ ...config, contactEmail: e.target.value })} placeholder="contacto@tuclinica.com" />
                                            </div>
                                            <div className="group/field">
                                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Dirección Física</label>
                                                <input className="w-full bg-slate-50 border border-slate-100 px-6 py-4 rounded-2xl outline-none focus:bg-white transition-all font-bold text-[13px] text-slate-800" value={config.address || ""} onChange={e => setConfig({ ...config, address: e.target.value })} placeholder="Calle 123 # 45-67, Ciudad" />
                                            </div>
                                            <div className="group/field">
                                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Descripción corta (Footer)</label>
                                                <textarea className="w-full bg-slate-50 border border-slate-100 px-6 py-4 rounded-[20px] outline-none focus:bg-white transition-all font-medium text-[12px] text-slate-500 resize-none shadow-inner" rows={3} value={config.footerDesc || ""} onChange={e => setConfig({ ...config, footerDesc: e.target.value })} placeholder="Breve mensaje institucional para el pie de página..." />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-slate-900 rounded-[32px] p-8 shadow-2xl space-y-6">
                                        <h3 className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                                            Enlaces de Soporte y Legal
                                        </h3>
                                        <div className="space-y-4">
                                            <div className="p-4 bg-white/5 rounded-2xl border border-white/5 space-y-3">
                                                <label className="block text-[8px] font-black text-white/30 uppercase tracking-widest">Teléfono de Contacto / WhatsApp Principal</label>
                                                <input className="w-full bg-white/5 border border-white/10 p-4 rounded-xl outline-none text-[12px] text-indigo-200" value={config.contactPhone || ""} onChange={e => setConfig({ ...config, contactPhone: e.target.value })} />
                                            </div>
                                            <div className="p-4 bg-white/5 rounded-2xl border border-white/5 space-y-3">
                                                <label className="block text-[8px] font-black text-white/30 uppercase tracking-widest">URL Facebook</label>
                                                <input className="w-full bg-white/5 border border-white/10 p-4 rounded-xl outline-none text-[11px] text-indigo-400" value={config.facebookUrl || ""} onChange={e => setConfig({ ...config, facebookUrl: e.target.value })} />
                                            </div>
                                            <div className="p-4 bg-white/5 rounded-2xl border border-white/5 space-y-3">
                                                <label className="block text-[8px] font-black text-white/30 uppercase tracking-widest">URL Instagram</label>
                                                <input className="w-full bg-white/5 border border-white/10 p-4 rounded-xl outline-none text-[11px] text-indigo-400" value={config.instagramUrl || ""} onChange={e => setConfig({ ...config, instagramUrl: e.target.value })} />
                                            </div>
                                            <div className="p-4 bg-white/5 rounded-2xl border border-white/5 space-y-3">
                                                <label className="block text-[8px] font-black text-white/30 uppercase tracking-widest">URL Política Privacidad</label>
                                                <input className="w-full bg-white/5 border border-white/10 p-4 rounded-xl outline-none text-[11px] text-slate-400" value={config.privacyUrl || "/privacidad"} onChange={e => setConfig({ ...config, privacyUrl: e.target.value })} />
                                            </div>
                                            <div className="p-4 bg-white/5 rounded-2xl border border-white/5 space-y-3">
                                                <label className="block text-[8px] font-black text-white/30 uppercase tracking-widest">URL Términos Servicio</label>
                                                <input className="w-full bg-white/5 border border-white/10 p-4 rounded-xl outline-none text-[11px] text-slate-400" value={config.termsUrl || "/terminos"} onChange={e => setConfig({ ...config, termsUrl: e.target.value })} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* TAB: IDENTITY */}
                            {activeTab === "identity" && (
                                <div className="space-y-10">
                                    <div className="bg-white rounded-[32px] p-8 border border-slate-200/60 shadow-sm space-y-8">
                                        <h3 className="text-[12px] font-black text-slate-800 uppercase tracking-[0.2em] mb-6 flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-sm">
                                                <FiHash size={18} />
                                            </div>
                                            ADN Organizacional
                                        </h3>
                                        <div>
                                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Título Institucional</label>
                                            <input className="w-full bg-slate-50 border border-slate-100 px-6 py-4 rounded-2xl outline-none focus:bg-white focus:border-indigo-400 transition-all font-black text-[18px] text-slate-800 uppercase tracking-tight shadow-inner" value={config.identityTitle || ""} onChange={e => setConfig({ ...config, identityTitle: e.target.value })} />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Narrativa de Identidad</label>
                                            <textarea className="w-full bg-slate-50/50 border border-slate-50 px-6 py-5 rounded-[24px] outline-none focus:bg-white focus:ring-4 focus:ring-indigo-100 transition-all font-medium text-slate-500 text-[13px] leading-relaxed shadow-inner resize-none" rows={4} value={config.identitySubtitle || ""} onChange={e => setConfig({ ...config, identitySubtitle: e.target.value })} placeholder="Nuestro propósito fundamental..." />
                                        </div>
                                    </div>

                                    <div className="bg-slate-900 rounded-[32px] p-10 shadow-2xl space-y-8 relative overflow-hidden group/mission">
                                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-transparent" />
                                        <h3 className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] mb-4 flex items-center gap-2 relative">
                                            <div className="w-2 h-2 rounded-full bg-indigo-500" />
                                            Misión y Visión
                                        </h3>
                                        <div className="space-y-6 relative">
                                            <div className="space-y-2">
                                                <label className="block text-[8px] font-black text-white/20 uppercase tracking-[0.3em] px-1">Misión Institucional</label>
                                                <textarea className="w-full bg-white/5 border border-white/5 p-6 rounded-[24px] focus:bg-white/10 transition-all outline-none font-medium text-[13px] text-indigo-50 leading-relaxed min-h-[140px] resize-none border-b-2 border-b-indigo-500/30" value={config.identityMission || ""} onChange={e => setConfig({ ...config, identityMission: e.target.value })} />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="block text-[8px] font-black text-white/20 uppercase tracking-[0.3em] px-1">Visión Institucional</label>
                                                <textarea className="w-full bg-white/5 border border-white/5 p-6 rounded-[24px] focus:bg-white/10 transition-all outline-none font-medium text-[13px] text-indigo-50 leading-relaxed min-h-[140px] resize-none border-b-2 border-b-indigo-500/30" value={config.identityVision || ""} onChange={e => setConfig({ ...config, identityVision: e.target.value })} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* OTHER TABS: Placeholder style but functional - I will expand more section logically if needed */}
                            {activeTab === "services" && (
                                <div className="space-y-10">
                                    <div className="bg-white rounded-[32px] p-8 border border-slate-200/60 shadow-sm space-y-6 text-left">
                                        <h3 className="text-[12px] font-black text-slate-800 uppercase tracking-[0.2em] mb-6 flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-sm">
                                                <FiMaximize size={18} />
                                            </div>
                                            Sección Servicios
                                        </h3>
                                        <div className="group/field text-left">
                                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Título de Sección</label>
                                            <input className="w-full bg-slate-50 border border-slate-100 px-6 py-4 rounded-2xl outline-none focus:bg-white focus:border-indigo-400 transition-all font-black text-[18px] text-slate-800 uppercase tracking-tight shadow-inner" value={config.servicesSectionTitle || ""} onChange={e => setConfig({ ...config, servicesSectionTitle: e.target.value })} />
                                        </div>
                                        <div className="group/field text-left">
                                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Breve Introducción</label>
                                            <textarea className="w-full bg-slate-50/50 border border-slate-50 px-6 py-4 rounded-[20px] outline-none focus:bg-white transition-all font-medium text-[13px] text-slate-500 leading-relaxed shadow-inner resize-none" rows={2} value={config.servicesSectionDesc || ""} onChange={e => setConfig({ ...config, servicesSectionDesc: e.target.value })} />
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <div className="flex items-center justify-between px-2">
                                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Catálogo de Soluciones</h3>
                                            <button onClick={() => addItem('services', { title: "NUEVO SERVICIO", desc: "Resumen...", icon: "🦷", features: [] })} className="bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all shadow-lg active:scale-95 flex items-center gap-2">
                                                <FiPlus size={14} /> Servicio
                                            </button>
                                        </div>
                                        <div className="space-y-4">
                                            {config.services && config.services.map((svc, i) => (
                                                <motion.div layout key={i} className="bg-white rounded-[32px] border border-slate-100 p-8 shadow-sm relative group overflow-hidden hover:shadow-xl hover:shadow-indigo-500/5 transition-all">
                                                    <button onClick={() => removeItem('services', i)} className="absolute top-4 right-4 w-10 h-10 rounded-2xl bg-white border border-slate-100 text-red-500 flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-all active:scale-90 z-20 hover:bg-red-50">
                                                        <FiTrash2 size={16} />
                                                    </button>
                                                    <div className="flex gap-6 items-center">
                                                        <div className="w-16 h-16 rounded-[20px] bg-slate-50 border border-slate-100 shadow-inner flex items-center justify-center text-3xl shrink-0 group-hover:scale-110 transition-transform">
                                                            <input className="w-full bg-transparent text-center outline-none cursor-default" value={svc.icon || ""} onChange={e => updateItem('services', i, 'icon', e.target.value)} />
                                                        </div>
                                                        <div className="flex-1 space-y-4">
                                                            <div>
                                                                <label className="block text-[8px] font-black text-slate-300 uppercase tracking-widest mb-1 px-1">Título del Servicio</label>
                                                                <input className="w-full bg-transparent font-black text-[15px] text-slate-800 outline-none focus:border-b-2 focus:border-indigo-500 transition-all uppercase tracking-tight" value={svc.title || ""} onChange={e => updateItem('services', i, 'title', e.target.value)} />
                                                            </div>
                                                            <div>
                                                                <label className="block text-[8px] font-black text-slate-300 uppercase tracking-widest mb-1 px-1">Resumen de Card</label>
                                                                <input className="w-full bg-transparent font-bold text-[11px] text-slate-500 outline-none focus:border-b-2 focus:border-slate-200 transition-all" value={svc.desc || ""} onChange={e => updateItem('services', i, 'desc', e.target.value)} />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* TAB: OUR TEAM */}
                            {activeTab === "team" && (
                                <div className="space-y-10">
                                    <div className="bg-white rounded-[32px] p-8 border border-slate-200/60 shadow-sm space-y-6">
                                        <h3 className="text-[12px] font-black text-slate-800 uppercase tracking-[0.2em] mb-6 flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-sm">
                                                <FiUsers size={18} />
                                            </div>
                                            Sección de Equipo
                                        </h3>
                                        <div className="group/field text-left">
                                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Título de Sección</label>
                                            <input className="w-full bg-slate-50 border border-slate-100 px-6 py-4 rounded-2xl outline-none focus:bg-white focus:border-indigo-400 font-black text-[18px] text-slate-800 uppercase tracking-tight shadow-inner" value={config.doctorsSectionTitle || ""} onChange={e => setConfig({ ...config, doctorsSectionTitle: e.target.value })} />
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <div className="flex items-center justify-between px-2">
                                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Nuestros Profesionales</h3>
                                            <button onClick={() => addItem('doctors', { name: "NUEVO DOCTOR", specialty: "Especialidad", image: "" })} className="bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all shadow-lg active:scale-95 flex items-center gap-2">
                                                <FiPlus size={14} /> Doctor
                                            </button>
                                        </div>
                                        <div className="space-y-4">
                                            {config.doctors && config.doctors.map((doc, i) => (
                                                <motion.div layout key={i} className="bg-white rounded-[32px] border border-slate-100 p-6 shadow-sm relative group overflow-hidden hover:shadow-xl hover:shadow-indigo-500/5 transition-all">
                                                    <button onClick={() => removeItem('doctors', i)} className="absolute top-4 right-4 w-10 h-10 rounded-2xl bg-white border border-slate-100 text-red-500 flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-all active:scale-90 z-20 hover:bg-red-50">
                                                        <FiTrash2 size={16} />
                                                    </button>
                                                    <div className="flex gap-6 items-center">
                                                        <div className="w-20 h-20 rounded-full bg-slate-50 overflow-hidden shrink-0 relative group/img border-4 border-white shadow-lg">
                                                            {doc.image ? (
                                                                <img src={doc.image} alt="Doctor" className="w-full h-full object-cover" />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center text-slate-300"><FiUsers size={24} /></div>
                                                            )}
                                                            <label className="absolute inset-0 bg-indigo-900/40 backdrop-blur-sm flex items-center justify-center text-white text-[8px] font-black opacity-0 group-hover/img:opacity-100 transition-opacity cursor-pointer uppercase tracking-widest text-center px-1">
                                                                Cambiar
                                                                <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'doctors', i, 'image')} />
                                                            </label>
                                                        </div>
                                                        <div className="flex-1 space-y-3">
                                                            <div>
                                                                <label className="block text-[8px] font-black text-slate-300 uppercase tracking-widest mb-1 px-1">Nombre Completo</label>
                                                                <input className="w-full bg-transparent font-black text-[15px] text-slate-800 outline-none focus:border-b-2 focus:border-indigo-500 transition-all uppercase tracking-tight" value={doc.name || ""} onChange={e => updateItem('doctors', i, 'name', e.target.value)} />
                                                            </div>
                                                            <div>
                                                                <label className="block text-[8px] font-black text-slate-300 uppercase tracking-widest mb-1 px-1">Cargo / Especialidad</label>
                                                                <input className="w-full bg-transparent font-bold text-[11px] text-indigo-500 outline-none focus:border-b-2 focus:border-indigo-200 transition-all uppercase tracking-wider" value={doc.specialty || ""} onChange={e => updateItem('doctors', i, 'specialty', e.target.value)} />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* TAB: TESTIMONIALS */}
                            {activeTab === "testimonials" && (
                                <div className="space-y-10">
                                    <div className="bg-white rounded-[32px] p-8 border border-slate-200/60 shadow-sm space-y-6">
                                        <h3 className="text-[12px] font-black text-slate-800 uppercase tracking-[0.2em] mb-6 flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-sm">
                                                <FiMessageSquare size={18} />
                                            </div>
                                            Sección Testimonios
                                        </h3>
                                        <div className="group/field text-left">
                                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Título de Sección</label>
                                            <input className="w-full bg-slate-50 border border-slate-100 px-6 py-4 rounded-2xl outline-none focus:bg-white focus:border-indigo-400 font-black text-[18px] text-slate-800 uppercase tracking-tight shadow-inner" value={config.testimonialsTitle || ""} onChange={e => setConfig({ ...config, testimonialsTitle: e.target.value })} />
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <div className="flex items-center justify-between px-2">
                                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Opiniones de Pacientes</h3>
                                            <button onClick={() => addItem('testimonials', { name: "Paciente", text: "Excelente servicio...", role: "Paciente", image: "", stars: 5 })} className="bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all shadow-lg active:scale-95 flex items-center gap-2">
                                                <FiPlus size={14} /> Testimonio
                                            </button>
                                        </div>
                                        <div className="space-y-4">
                                            {config.testimonials && config.testimonials.map((test, i) => (
                                                <motion.div layout key={i} className="bg-white rounded-[32px] border border-slate-100 p-8 shadow-sm relative group overflow-hidden hover:shadow-xl hover:shadow-indigo-500/5 transition-all">
                                                    <button onClick={() => removeItem('testimonials', i)} className="absolute top-4 right-4 w-10 h-10 rounded-2xl bg-white border border-slate-100 text-red-500 flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-all active:scale-90 z-20 hover:bg-red-50">
                                                        <FiTrash2 size={16} />
                                                    </button>
                                                    <div className="space-y-4">
                                                        <div className="flex gap-4 items-center">
                                                            <div className="w-16 h-16 rounded-full bg-slate-50 overflow-hidden shrink-0 relative group/img border border-slate-200 shadow-sm flex items-center justify-center">
                                                                {test.image ? (
                                                                    <img src={test.image} alt="Paciente" className="w-full h-full object-cover" />
                                                                ) : (
                                                                    <div className="w-full h-full flex items-center justify-center text-indigo-600 font-black text-xl bg-indigo-50 border border-indigo-100 shadow-sm">{test.name?.charAt(0) || "P"}</div>
                                                                )}
                                                                <label className="absolute inset-0 bg-indigo-900/40 backdrop-blur-sm flex items-center justify-center text-white text-[8px] font-black opacity-0 group-hover/img:opacity-100 transition-opacity cursor-pointer uppercase tracking-widest text-center px-1">
                                                                    Subir
                                                                    <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'testimonials', i, 'image')} />
                                                                </label>
                                                            </div>
                                                            <div className="flex-1 space-y-2">
                                                                <div>
                                                                    <label className="block text-[8px] font-black text-slate-300 uppercase tracking-widest mb-1 px-1">Nombre</label>
                                                                    <input className="w-full bg-transparent font-black text-[14px] text-slate-800 outline-none focus:border-b-2 focus:border-indigo-500 transition-all" value={test.name || ""} onChange={e => updateItem('testimonials', i, 'name', e.target.value)} />
                                                                </div>
                                                                <div>
                                                                    <label className="block text-[8px] font-black text-slate-300 uppercase tracking-widest mb-1 px-1">Rol / Cargo</label>
                                                                    <input className="w-full bg-transparent font-bold text-[10px] text-indigo-500 outline-none focus:border-b-2 focus:border-indigo-200 transition-all uppercase tracking-wider" value={test.role || ""} onChange={e => updateItem('testimonials', i, 'role', e.target.value)} />
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <label className="block text-[8px] font-black text-slate-300 uppercase tracking-widest mb-1 px-1">Comentario del Paciente</label>
                                                            <textarea className="w-full bg-slate-50/50 p-4 rounded-xl text-[12px] font-medium text-slate-500 border border-slate-50 outline-none focus:bg-white transition-all resize-none italic shadow-inner" rows={3} value={test.text || ""} onChange={e => updateItem('testimonials', i, 'text', e.target.value)} />
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* TAB: FINAL CTA */}
                            {activeTab === "cta_final" && (
                                <div className="space-y-10">
                                    <div className="bg-white rounded-[32px] p-8 border border-slate-200/60 shadow-sm space-y-8">
                                        <h3 className="text-[12px] font-black text-slate-800 uppercase tracking-[0.2em] mb-6 flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-sm">
                                                <FiSend size={18} />
                                            </div>
                                            Llamado a la Acción Final
                                        </h3>
                                        <div className="space-y-6">
                                            <div className="group/field text-left">
                                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Título CTA</label>
                                                <input className="w-full bg-slate-50 border border-slate-100 px-6 py-4 rounded-2xl outline-none focus:bg-white focus:border-indigo-400 font-black text-[18px] text-slate-800 uppercase tracking-tight shadow-inner" value={config.ctaTitle || ""} onChange={e => setConfig({ ...config, ctaTitle: e.target.value })} />
                                            </div>
                                            <div className="group/field text-left">
                                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Subtítulo CTA</label>
                                                <textarea className="w-full bg-slate-50/50 border border-slate-50 px-6 py-4 rounded-[20px] outline-none focus:bg-white transition-all font-medium text-[13px] text-slate-500 leading-relaxed shadow-inner resize-none" rows={2} value={config.ctaSubtitle || ""} onChange={e => setConfig({ ...config, ctaSubtitle: e.target.value })} />
                                            </div>
                                            <div className="group/field text-left">
                                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Texto del Botón</label>
                                                <input className="w-full bg-slate-50 border border-slate-100 px-6 py-3 rounded-xl outline-none focus:bg-white font-black text-[12px] text-indigo-600 uppercase tracking-widest" value={config.ctaBtnText || ""} onChange={e => setConfig({ ...config, ctaBtnText: e.target.value })} />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-indigo-600 rounded-[32px] p-10 shadow-2xl relative overflow-hidden group/cta">
                                        <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -mr-24 -mt-24 blur-3xl group-hover/cta:scale-110 transition-transform duration-700" />
                                        <p className="text-white/60 text-[9px] font-black uppercase tracking-[0.3em] mb-2 relative">Visualización CTA</p>
                                        <h4 className="text-white font-black text-2xl tracking-tighter relative">{config.ctaTitle || "Título Final"}</h4>
                                        <button className="mt-8 bg-white text-indigo-600 px-8 py-3 rounded-full font-black text-[11px] uppercase tracking-widest shadow-xl relative active:scale-95 transition-all">
                                            {config.ctaBtnText || "Acción"}
                                        </button>
                                    </div>
                                </div>
                            )}

                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Fixed Footer with Shimmer Button */}
                <div className="p-10 border-t border-slate-50 bg-white shrink-0">
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white px-10 py-5 rounded-[24px] font-black text-[13px] uppercase tracking-[0.2em] shadow-2xl shadow-indigo-200 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-4 group/publish relative overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/publish:animate-shimmer" />
                        {saving ? (
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <FiGlobe className="text-xl" />
                        )}
                        <span>Publicar Identidad Digital</span>
                    </button>
                    <p className="mt-4 text-center text-[9px] font-bold text-slate-300 uppercase tracking-widest opacity-60">Los cambios se reflejarán inmediatamente en su landing page en vivo.</p>
                </div>
            </div>

            {/* PREVIEW PANEL (Right) */}
            <div className="flex-1 h-full bg-[#F1F5F9] relative overflow-hidden flex flex-col">
                
                {/* Top Control Bar / Preview Header */}
                <div className="h-14 px-8 flex items-center justify-between bg-white border-b border-slate-200 shrink-0 z-50 relative">
                    <div className="flex items-center gap-2">
                        <FiMonitor className="text-slate-400" size={14} />
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Vista Previa del Sitio</span>
                    </div>
                    {/* Device Switcher (Functional) */}
                    <div className="flex gap-2">
                        <div
                            onClick={() => setViewMode("desktop")}
                            className={`p-2 rounded-xl border cursor-pointer transition-all duration-300 flex items-center justify-center gap-1.5 ${viewMode === 'desktop' ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/10' : 'bg-white text-slate-400 border-slate-200 hover:text-slate-600 hover:bg-slate-50'}`}
                            title="Vista de Escritorio"
                        >
                            <FiMonitor size={14} />
                            <span className="text-[9px] font-black uppercase tracking-wider">Escritorio</span>
                        </div>
                        <div
                            onClick={() => setViewMode("mobile")}
                            className={`p-2 rounded-xl border cursor-pointer transition-all duration-300 flex items-center justify-center gap-1.5 ${viewMode === 'mobile' ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/10' : 'bg-white text-slate-400 border-slate-200 hover:text-slate-600 hover:bg-slate-50'}`}
                            title="Vista Móvil"
                        >
                            <FiSmartphone size={14} />
                            <span className="text-[9px] font-black uppercase tracking-wider">Móvil</span>
                        </div>
                    </div>
                </div>

                {/* Preview Frame Container */}
                <div 
                    ref={previewContainerRef}
                    className={`flex-1 relative overflow-hidden flex flex-col items-center justify-center animate-in fade-in zoom-in-95 duration-700 ${viewMode === 'mobile' ? 'p-2' : 'p-4 lg:p-6 xl:p-8'}`}
                >
                    {/* Background Decoration */}
                    <div className="absolute top-0 right-0 w-[1000px] h-[1000px] bg-white/40 rounded-full blur-[120px] -mr-[500px] -mt-[500px] pointer-events-none" />
                    <div className="absolute bottom-0 left-0 w-[1000px] h-[1000px] bg-indigo-100/30 rounded-full blur-[120px] -ml-[500px] -mb-[500px] pointer-events-none" />

                    {viewMode === 'desktop' ? (
                        /* DESKTOP BROWSER FRAME (IMAC/STUDIO DISPLAY STYLE) */
                        <div 
                            className="w-[1460px] h-[980px] flex flex-col items-center shrink-0 absolute"
                            style={{ 
                                transform: `translate(-50%, -50%) scale(${scale})`,
                                top: "50%",
                                left: "50%",
                                transformOrigin: "center center"
                            }}
                        >
                            {/* Monitor screen frame */}
                            <div className="w-[1460px] h-[854px] bg-slate-900 border-[10px] border-slate-900 rounded-t-[2.5rem] flex flex-col relative overflow-hidden shadow-2xl shrink-0">
                                {/* Browser Toolbar UI (Safari macOS Style) */}
                                <div className="bg-slate-100 h-11 flex items-center px-8 gap-4 border-b border-slate-200/60 shrink-0 justify-between">
                                    {/* macOS Controls */}
                                    <div className="flex gap-1.5">
                                        <div className="w-2.5 h-2.5 rounded-full bg-red-400/90 border border-red-500/20" />
                                        <div className="w-2.5 h-2.5 rounded-full bg-amber-400/90 border border-amber-500/20" />
                                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-400/90 border border-emerald-500/20" />
                                    </div>

                                    {/* Browser Navigation Icons */}
                                    <div className="flex items-center gap-3 text-slate-400">
                                        <svg className="w-3.5 h-3.5 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                                        </svg>
                                        <svg className="w-3.5 h-3.5 fill-none stroke-current stroke-2 opacity-50" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                                        </svg>
                                        <svg className="w-3.5 h-3.5 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 7.89H18" />
                                        </svg>
                                    </div>

                                    {/* URL Input bar */}
                                    <div className="flex-1 flex justify-center px-6">
                                        <div className="flex items-center bg-white border border-slate-200/80 px-5 py-1.5 rounded-lg text-[10px] text-slate-500 tracking-wider w-full max-w-[450px] justify-center gap-1.5 font-sans shadow-sm">
                                            <svg className="w-2.5 h-2.5 text-emerald-500 fill-current" viewBox="0 0 24 24">
                                                <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" />
                                            </svg>
                                            <span className="text-slate-400 lowercase">https://</span>portal.odontocloud.pro
                                        </div>
                                    </div>

                                    {/* Open Live Button */}
                                    {config.slug || config.isMaster ? (
                                        <button
                                            onClick={() => {
                                                const baseUrl = import.meta.env.BASE_URL;
                                                const cleanBase = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
                                                const url = config.isMaster ? `${cleanBase}/` : `${cleanBase}/c/${config.slug}`;
                                                window.open(url, '_blank');
                                            }}
                                            className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white px-3.5 py-1.5 rounded-full transition-all text-[10px] font-black uppercase tracking-widest shadow-md shadow-indigo-500/10 active:scale-95 shrink-0"
                                            title={config.isMaster ? "Abrir Master" : `Abrir sitio: ${config.slug}`}
                                        >
                                            <span>Ver Sitio Real</span>
                                            <FiExternalLink size={12} />
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => {
                                                if (window.confirm("⚠️ No tienes un 'Identificador URL' configurado para tu clínica.\n\n¿Quieres ir a 'Datos Básicos' para configurarlo ahora?")) {
                                                    navigate(buildDashboardPath('config/empresa'));
                                                }
                                            }}
                                            className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-full transition-all text-[10px] font-black uppercase tracking-widest shadow-md shadow-amber-500/10 active:scale-95 shrink-0 animate-pulse cursor-pointer"
                                            title="Falta configurar el Slug"
                                        >
                                            <span>⚠️ Configurar URL</span>
                                            <FiGlobe size={14} />
                                        </button>
                                    )}
                                </div>

                                {/* Content Scrollable / Responsive Iframe Preview */}
                                <div className="flex-1 bg-white relative overflow-hidden">
                                    <iframe
                                        src={`${import.meta.env.BASE_URL || "/odontocloud-react/"}preview`}
                                        className="w-full h-full border-none"
                                        style={{ overflowY: "auto" }}
                                        scrolling="yes"
                                        title="OdontoCloud CMS Preview"
                                    />
                                </div>
                            </div>
                            
                            {/* Monitor Chin (Sleek Apple style chin) */}
                            <div className="w-[1460px] h-10 bg-gradient-to-r from-slate-300 via-slate-100 to-slate-300 border-t border-slate-400/30 rounded-b-[2.5rem] flex items-center justify-center relative shrink-0 -mt-0.5">
                                 {/* Shiny center logo placeholder or simple indicator light */}
                                 <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse absolute right-8 shadow-[0_0_10px_rgba(52,211,153,0.8)]" title="Monitor Encendido" />
                            </div>

                            {/* Monitor Stand - Scaled with Frame */}
                            <div className="flex flex-col items-center shrink-0 -mt-1 z-0 relative">
                                {/* Tapered Stand column */}
                                <div 
                                    className="w-20 h-20 bg-gradient-to-b from-slate-300 to-slate-400 relative z-0 shrink-0 shadow-inner"
                                    style={{
                                        clipPath: "polygon(15% 0%, 85% 0%, 100% 100%, 0% 100%)"
                                    }}
                                />
                                {/* Metallic flat stand base */}
                                <div className="w-[360px] h-3 bg-gradient-to-r from-slate-400 via-slate-200 to-slate-400 rounded-b-md shadow-md z-10 shrink-0" />
                                {/* Stand shadow */}
                                <div className="w-[390px] h-2 bg-black/15 rounded-full blur-sm -mt-0.5 pointer-events-none shrink-0" />
                            </div>
                        </div>
                    ) : (
                        /* MOBILE PHONE FRAME */
                        <div 
                            className="w-[375px] h-[667px] bg-slate-950 shadow-[0_50px_100px_rgba(0,0,0,0.3)] border-[14px] border-slate-900 overflow-hidden flex flex-col absolute rounded-[3.2rem] transition-all duration-700 shrink-0"
                            style={{ 
                                transform: `translate(-50%, -50%) scale(${scale})`,
                                top: "50%",
                                left: "50%",
                                transformOrigin: "center center"
                            }}
                        >
                            
                            {/* Mobile Status Bar (Notch + Time + Icons) */}
                            <div className="bg-slate-50 h-9 flex items-center justify-between px-6 shrink-0 relative select-none">
                                <span className="text-[10px] font-bold text-slate-800">9:41</span>
                                
                                {/* Dynamic Island Mock */}
                                <div className="w-20 h-4 bg-black rounded-full absolute left-1/2 -translate-x-1/2 top-2.5" />
                                
                                <div className="flex items-center gap-1.5 text-slate-800">
                                    {/* Signal icon */}
                                    <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                                        <path d="M2 22h20V2z" />
                                    </svg>
                                    {/* Wifi icon */}
                                    <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                                        <path d="M12 21l-12-14.3c.4-.3 4.8-3.7 12-3.7s11.6 3.4 12 3.7l-12 14.3z" />
                                    </svg>
                                    {/* Battery icon */}
                                    <div className="w-5 h-2.5 border border-current rounded-sm p-0.5 flex items-center">
                                        <div className="w-full h-full bg-current rounded-[1px]" />
                                    </div>
                                </div>
                            </div>

                            {/* Mobile Browser Address Bar (Safari Style) */}
                            <div className="bg-slate-50 h-11 flex items-center justify-center px-4 border-b border-slate-200/50 shrink-0">
                                <div className="bg-slate-200/60 w-full h-7.5 rounded-lg flex items-center justify-center text-[10px] text-slate-600 gap-1.5 font-sans">
                                    <svg className="w-2.5 h-2.5 text-slate-400 fill-current" viewBox="0 0 24 24">
                                        <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" />
                                    </svg>
                                    <span>portal.odontocloud.pro</span>
                                </div>
                            </div>

                            {/* Content / Responsive Iframe Preview */}
                            <div className="flex-1 bg-white relative overflow-hidden">
                                <iframe
                                    src={`${import.meta.env.BASE_URL || "/odontocloud-react/"}preview`}
                                    className="w-full h-full border-none"
                                    style={{ overflowY: "auto" }}
                                    scrolling="yes"
                                    title="OdontoCloud CMS Preview Mobile"
                                />
                            </div>

                            {/* Mobile Home Swipe Indicator Bar */}
                            <div className="bg-white h-5 flex justify-center items-center shrink-0 select-none pb-1.5">
                                <div className="w-28 h-1 bg-slate-800 rounded-full" />
                            </div>
                        </div>
                    )}


                </div>
            </div>
        </div>
    );
}

