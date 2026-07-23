import React, { useState, useRef } from "react";
import { motion } from "framer-motion";
import { FiCheckCircle, FiShield, FiZap, FiArrowRight, FiPlay, FiCalendar, FiUsers, FiFileText } from "react-icons/fi";
import DocumentationModal from "../../components/landing/DocumentationModal";
import { useNavigate } from 'react-router-dom';

export default function HeroSection({ config = {}, onShowTrial }) {
    const containerRef = useRef(null);
    const navigate = useNavigate();
    const [showDocModal, setShowDocModal] = useState(false);

    // Clean title without artificial repetition
    const isMaster = config.isMaster !== false;
    const title = config.heroTitle || (isMaster ? "El Software de Gestión Integral para tu Clínica Dental" : config.name || "Clínica Dental");
    const subtitle = config.heroSubtitle || "Agenda citas, administra historias clínicas, emite facturación electrónica DIAN y genera RIPS en una plataforma moderna e intuitiva.";

    return (
        <section
            id="inicio"
            ref={containerRef}
            className="relative w-full min-h-screen bg-gradient-to-b from-slate-50 via-white to-blue-50/30 text-slate-900 overflow-hidden flex flex-col items-center justify-between font-sans pt-36 pb-20 border-b border-slate-100"
        >
            {/* Background Ornaments - Soft Light Glows */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
                <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[800px] h-[450px] bg-gradient-to-tr from-blue-100/60 via-indigo-100/40 to-cyan-100/50 blur-[100px] rounded-full" />
                <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-blue-50/60 blur-[120px] rounded-full" />
            </div>

            <div className="container relative z-10 mx-auto px-6 max-w-6xl flex flex-col items-center text-center">

                {/* Hero Header Content */}
                <div className="max-w-4xl mx-auto space-y-6 pt-4">
                    
                    {/* Clean Top Pill */}
                    <motion.div 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-100 shadow-sm mx-auto"
                    >
                        <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
                        <span className="text-xs font-bold text-blue-700 tracking-wide">
                            {isMaster ? "Software Odontológico Todo en Uno" : "Clínica Odontológica Certificada"}
                        </span>
                    </motion.div>

                    {/* Main Clean Title */}
                    <motion.h1 
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="text-4xl sm:text-5xl md:text-6xl font-display font-extrabold text-slate-900 tracking-tight leading-[1.15]"
                    >
                        {title.includes('|') ? (
                            <>
                                <span className="block text-slate-900">{title.split('|')[0]}</span>
                                <span className="block text-blue-600">{title.split('|')[1]}</span>
                            </>
                        ) : (
                            <span>{title}</span>
                        )}
                    </motion.h1>

                    {/* Clean Subtitle */}
                    <motion.p 
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto font-normal leading-relaxed"
                    >
                        {subtitle}
                    </motion.p>

                    {/* Clean Call to Actions */}
                    <motion.div 
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                        className="flex flex-wrap items-center justify-center gap-4 pt-4"
                    >
                        <button
                            onClick={() => onShowTrial(config?.heroBtn1Text || "Prueba Gratis")}
                            className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm shadow-xl shadow-blue-500/20 transition-all duration-200 transform hover:-translate-y-0.5 flex items-center gap-2"
                        >
                            <span>{config?.heroBtn1Text || (isMaster ? "Comenzar Prueba Gratis" : "Agendar Cita")}</span>
                            <FiArrowRight size={16} />
                        </button>

                        <button
                            onClick={() => {
                                if (!isMaster) {
                                    const link = config?.heroBtn2Link || "/portal";
                                    let finalLink = link;
                                    if (config.slug && (link === '/servicios' || link === '/nosotros' || link === '/sedes')) {
                                        finalLink = `/c/${config.slug}${link}`;
                                    } else if (config.slug && link === '/portal') {
                                        finalLink = `/c/${config.slug}/portal`;
                                    }
                                    if (finalLink.startsWith('/')) {
                                        navigate(finalLink);
                                    } else {
                                        window.open(finalLink, '_blank');
                                    }
                                    return;
                                }
                                setShowDocModal(true);
                            }}
                            className="px-8 py-4 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl font-bold text-sm transition-all shadow-sm flex items-center gap-2"
                        >
                            <FiPlay size={14} className="text-blue-600" />
                            <span>{config?.heroBtn2Text || (isMaster ? "Ver Demostración" : "Portal Pacientes")}</span>
                        </button>
                    </motion.div>

                </div>

                {/* Elegant Preview Showcase */}
                <motion.div 
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.4 }}
                    className="w-full max-w-4xl mt-12 relative"
                >
                    <div className="relative rounded-2xl bg-white border border-slate-200 p-4 md:p-6 shadow-2xl shadow-slate-200/80">
                        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-slate-200"></div>
                                <div className="w-3 h-3 rounded-full bg-slate-200"></div>
                                <div className="w-3 h-3 rounded-full bg-slate-200"></div>
                                <span className="ml-2 text-xs font-mono text-slate-400">OdontoCloud Dashboard</span>
                            </div>
                            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100 flex items-center gap-1.5">
                                <FiZap size={12} /> Facturación DIAN & RIPS Activos
                            </span>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-left">
                            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center mb-2">
                                    <FiCalendar size={16} />
                                </div>
                                <h4 className="text-xs font-bold text-slate-900 mb-0.5">Agenda Citas</h4>
                                <p className="text-[11px] text-slate-500">WhatsApp automático</p>
                            </div>

                            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                                <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center mb-2">
                                    <FiFileText size={16} />
                                </div>
                                <h4 className="text-xs font-bold text-slate-900 mb-0.5">Historia Clínica</h4>
                                <p className="text-[11px] text-slate-500">Digital y segura</p>
                            </div>

                            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center mb-2">
                                    <FiZap size={16} />
                                </div>
                                <h4 className="text-xs font-bold text-slate-900 mb-0.5">Facturación DIAN</h4>
                                <p className="text-[11px] text-slate-500">Proveedor Factus</p>
                            </div>

                            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                                <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center mb-2">
                                    <FiUsers size={16} />
                                </div>
                                <h4 className="text-xs font-bold text-slate-900 mb-0.5">RIPS 2026</h4>
                                <p className="text-[11px] text-slate-500">Normativa vigente</p>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Clean Trust Badges Bar */}
                <div className="pt-10 flex flex-wrap items-center justify-center gap-6 text-slate-500">
                    {(isMaster ? [
                        { text: "Facturación Electrónica DIAN", icon: <FiZap className="text-blue-600" size={16} /> },
                        { text: "Generación de RIPS", icon: <FiCheckCircle className="text-emerald-600" size={16} /> },
                        { text: "Encriptación SSL Bancaria", icon: <FiShield className="text-indigo-600" size={16} /> },
                    ] : [
                        { text: "Odontólogos Certificados", icon: <FiCheckCircle className="text-blue-600" size={16} /> },
                        { text: "Atención Especializada", icon: <FiShield className="text-emerald-600" size={16} /> },
                    ]).map((badge, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-xs font-medium text-slate-600">
                            {badge.icon}
                            <span>{badge.text}</span>
                        </div>
                    ))}
                </div>

            </div>

            <DocumentationModal
                isOpen={showDocModal}
                onClose={() => setShowDocModal(false)}
            />
        </section>
    );
}
