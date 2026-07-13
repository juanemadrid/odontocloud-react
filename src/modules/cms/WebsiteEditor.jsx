
import React, { useState, useEffect } from "react";
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
                        onClick={() => navigate("/dashboard/config/datos-basicos")}
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

                {/* Navigation Tabs (Vertical Pill Style) */}
                <div className="px-8 pb-6 flex flex-wrap gap-2 shrink-0 border-b border-slate-50">
                    {TABS.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 border ${activeTab === tab.id
                                ? "bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-100 scale-105"
                                : "bg-white text-slate-400 border-slate-100 hover:bg-slate-50 hover:text-slate-600"
                                }`}
                        >
                            {tab.icon}
                            <span className="hidden xl:inline">{tab.label}</span>
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
                                            <button onClick={() => addItem('testimonials', { name: "Paciente", text: "Excelente servicio...", role: "Paciente" })} className="bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all shadow-lg active:scale-95 flex items-center gap-2">
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
                                                            <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-black text-xl border border-indigo-100 shadow-sm">{test.name?.charAt(0)}</div>
                                                            <div className="flex-1">
                                                                <label className="block text-[8px] font-black text-slate-300 uppercase tracking-widest mb-1 px-1">Nombre</label>
                                                                <input className="w-full bg-transparent font-black text-[14px] text-slate-800 outline-none focus:border-b-2 focus:border-indigo-500 transition-all" value={test.name || ""} onChange={e => updateItem('testimonials', i, 'name', e.target.value)} />
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
            <div className="flex-1 h-full bg-[#F1F5F9] relative overflow-hidden flex flex-col items-center justify-center">

                {/* Background Decoration */}
                <div className="absolute top-0 right-0 w-[1000px] h-[1000px] bg-white/40 rounded-full blur-[120px] -mr-[500px] -mt-[500px]" />
                <div className="absolute bottom-0 left-0 w-[1000px] h-[1000px] bg-indigo-100/30 rounded-full blur-[120px] -ml-[500px] -mb-[500px]" />

                {/* Monitor Frame Premium */}
                <div className="relative w-full h-full flex flex-col items-center justify-center p-4 lg:p-6 xl:p-8 animate-in fade-in zoom-in-95 duration-700">

                    {/* Device Switcher (Functional) */}
                    <div className="absolute top-8 right-12 flex gap-3 z-50">
                        <div
                            onClick={() => setViewMode("desktop")}
                            className={`p-3 rounded-2xl shadow-lg border cursor-pointer transition-colors group relative ${viewMode === 'desktop' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-indigo-600 border-slate-200 hover:bg-indigo-50'}`}
                            title="Vista de Escritorio"
                        >
                            <FiMonitor size={20} />
                            <span className="absolute top-full mt-2 right-0 bg-slate-800 text-white text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">Vista PC</span>
                        </div>
                        <div
                            onClick={() => setViewMode("mobile")}
                            className={`p-3 rounded-2xl shadow-lg border cursor-pointer transition-colors group relative ${viewMode === 'mobile' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-400 border-slate-100 hover:bg-slate-50'}`}
                            title="Vista Móvil"
                        >
                            <FiSmartphone size={20} />
                            <span className="absolute top-full mt-2 right-0 bg-slate-800 text-white text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">Vista Móvil</span>
                        </div>
                    </div>

                    <div
                        className={`
                            bg-white shadow-[0_50px_100px_rgba(0,0,0,0.15)] border-[12px] border-slate-800 overflow-hidden flex flex-col relative transition-all duration-700
                            ${viewMode === 'desktop' ? 'w-full max-h-full max-w-[1400px] aspect-video rounded-[2rem]' : 'h-full max-h-full aspect-[375/812] rounded-[3rem] border-[14px]'}
                        `}
                    >
                        {/* Browser Toolbar UI */}
                        <div className="bg-slate-800 h-10 flex items-center px-8 gap-4 border-b border-slate-700 shrink-0 justify-between">
                            <div className="flex gap-2">
                                <div className="w-2.5 h-2.5 rounded-full bg-red-400/80" />
                                <div className="w-2.5 h-2.5 rounded-full bg-amber-400/80" />
                                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400/80" />
                            </div>

                            <div className="flex-1 flex justify-center px-4">
                                <div className="flex items-center bg-slate-700/50 px-6 py-1 rounded-full text-[9px] font-black text-slate-400 tracking-[0.2em] w-full max-w-[400px] justify-center gap-3 border border-slate-600/30 overflow-hidden text-ellipsis whitespace-nowrap">
                                    <span className="text-indigo-400 opacity-80">HTTPS://</span>PORTAL.ODONTOCLOUD.PRO
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
                                    className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-1.5 rounded-full transition-all text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-500/20 active:scale-95 ml-4"
                                    title={config.isMaster ? "Abrir Master" : `Abrir sitio: ${config.slug}`}
                                >
                                    <span className="hidden sm:inline">Ver Sitio Real</span>
                                    <FiExternalLink size={14} />
                                </button>
                            ) : (
                                <button
                                    onClick={() => {
                                        if (window.confirm("⚠️ No tienes un 'Identificador URL' configurado para tu clínica.\n\n¿Quieres ir a 'Datos Básicos' para configurarlo ahora?")) {
                                            navigate("/dashboard/config/empresa");
                                        }
                                    }}
                                    className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-6 py-2 rounded-full transition-all text-[11px] font-black uppercase tracking-widest shadow-lg shadow-amber-500/20 active:scale-95 ml-4 animate-pulse cursor-pointer z-50"
                                    title="Falta configurar el Slug"
                                >
                                    <span className="hidden sm:inline">⚠️ Configurar URL</span>
                                    <FiGlobe size={16} />
                                </button>
                            )}
                        </div>

                        {/* Content Scrollable */}
                        <div className="flex-1 overflow-y-auto custom-scrollbar bg-white relative">
                            <div className={`min-h-full origin-top ${viewMode === 'mobile' ? 'w-full' : ''}`}>
                                <VivaHeader config={config} isPreview={true} />
                                <div className="p-0 transition-opacity duration-500">
                                    {(activeTab === 'identity' || activeTab === 'team') ? (
                                        <IdentitySection config={config} />
                                    ) : activeTab === 'services' ? (
                                        <ServicesSection config={config} />
                                    ) : (
                                        <ModernLanding previewConfig={config} isMaster={isSuperAdmin} />
                                    )}
                                </div>
                                <VivaFooter config={{ ...config, isMaster: isSuperAdmin }} />
                            </div>
                        </div>
                    </div>

                    {/* Monitor Stand - Discrete (Only show in Desktop) */}
                    {viewMode === 'desktop' && (
                        <div className="flex flex-col items-center shrink-0 -mt-2 opacity-80">
                            <div className="w-48 h-10 bg-slate-800 shadow-2xl skew-x-12" />
                            <div className="w-[600px] h-3 bg-slate-900 rounded-full shadow-2xl relative">
                                <div className="absolute inset-x-0 h-0.5 bg-white/5 top-0 rounded-full" />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

