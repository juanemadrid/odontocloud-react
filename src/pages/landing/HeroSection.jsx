import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiCheckCircle, FiShield, FiZap, FiCalendar, FiFileText, FiUsers, FiTrendingUp, FiArrowRight, FiPlay, FiStar } from "react-icons/fi";
import DocumentationModal from "../../components/landing/DocumentationModal";
import { useNavigate } from 'react-router-dom';

export default function HeroSection({ config = {}, onShowTrial }) {
    const containerRef = useRef(null);
    const navigate = useNavigate();
    const [showDocModal, setShowDocModal] = useState(false);

    const rawTitle = (config.heroTitle || (config.isMaster ? "El Control Total de tu|Clínica Dental" : `${config.name}|Clínica Dental`));
    const parts = rawTitle.split('|');
    const titlePart1 = parts[0]?.trim() || "El Control Total de tu";
    const titlePart2 = parts[1]?.trim() || "Clínica Dental";

    const subtitle = config.heroSubtitle || "La plataforma más completa, moderna y fácil de usar. Agenda inteligente, historia clínica digital, facturación electrónica DIAN y RIPS en un solo lugar.";

    return (
        <section
            id="inicio"
            ref={containerRef}
            className="relative w-full min-h-screen bg-slate-950 text-white overflow-hidden flex flex-col items-center justify-between font-sans pt-28 pb-16"
        >
            {/* Dynamic Futuristic Background - Clean & Glowing */}
            <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                {/* Gradient mesh circles */}
                <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-tr from-blue-600/20 via-cyan-500/20 to-indigo-600/10 blur-[130px] rounded-full" />
                <div className="absolute top-[20%] left-[-10%] w-[500px] h-[500px] bg-emerald-500/10 blur-[120px] rounded-full" />
                <div className="absolute top-[40%] right-[-10%] w-[600px] h-[600px] bg-blue-600/15 blur-[140px] rounded-full" />

                {/* Subtle Modern Grid Pattern */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
            </div>

            <div className="container relative z-10 mx-auto px-6 max-w-7xl flex flex-col items-center text-center">

                {/* Hero Header Content */}
                <div className="max-w-4xl mx-auto space-y-6 pt-6">
                    
                    {/* Glowing Top Badge */}
                    <motion.div 
                        initial={{ opacity: 0, y: -15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-slate-900/80 border border-cyan-500/30 backdrop-blur-xl shadow-[0_0_20px_rgba(6,182,212,0.15)] mx-auto"
                    >
                        <span className="relative flex h-2.5 w-2.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500"></span>
                        </span>
                        <span className="text-xs font-extrabold uppercase tracking-widest text-cyan-300">
                            OdontoCloud 2026 • Software Odontológico de Élite
                        </span>
                    </motion.div>

                    {/* Main Title */}
                    <motion.h1 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        className="text-4xl sm:text-6xl md:text-7xl font-display font-black tracking-tight leading-[1.08] uppercase"
                    >
                        <span className="block text-slate-100 font-extrabold">
                            {titlePart1}
                        </span>
                        <span className="block bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent drop-shadow-lg">
                            {titlePart2}
                        </span>
                    </motion.h1>

                    {/* Subtitle */}
                    <motion.p 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="text-base sm:text-xl text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed"
                    >
                        {subtitle}
                    </motion.p>

                    {/* Action Buttons */}
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.3 }}
                        className="flex flex-wrap items-center justify-center gap-4 pt-4"
                    >
                        <button
                            onClick={() => onShowTrial(config?.heroBtn1Text || "Prueba Gratis")}
                            className="px-8 py-4 bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-[0_10px_30px_rgba(37,99,235,0.4)] hover:shadow-[0_15px_40px_rgba(6,182,212,0.5)] transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-3 border border-cyan-400/30"
                        >
                            <span>{config?.heroBtn1Text || (config.isMaster ? "Comenzar Prueba Gratis" : "Agendar Cita")}</span>
                            <FiArrowRight size={16} />
                        </button>

                        <button
                            onClick={() => {
                                if (!config.isMaster) {
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
                            className="px-8 py-4 bg-slate-900/90 border border-slate-700/80 text-slate-200 rounded-2xl font-bold text-xs uppercase tracking-[0.15em] hover:bg-slate-800 hover:border-slate-500 hover:text-white transition-all backdrop-blur-xl flex items-center gap-2 shadow-lg"
                        >
                            <FiPlay size={14} className="text-cyan-400" />
                            <span>{config?.heroBtn2Text || (config.isMaster ? "Ver Documentación" : "Portal Pacientes")}</span>
                        </button>
                    </motion.div>
                </div>

                {/* Hero Showcase Mockup Card */}
                <motion.div 
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                    className="w-full max-w-5xl mt-14 relative"
                >
                    {/* Glowing outer backdrop */}
                    <div className="absolute -inset-1 rounded-[2.5rem] bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500 opacity-20 blur-xl"></div>

                    {/* Premium Glass Container */}
                    <div className="relative rounded-[2rem] bg-slate-900/90 border border-slate-800 p-6 md:p-8 shadow-2xl backdrop-blur-2xl overflow-hidden">
                        
                        {/* Mockup Header Toolbar */}
                        <div className="flex items-center justify-between pb-6 border-b border-slate-800 mb-6">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-rose-500/80"></div>
                                <div className="w-3 h-3 rounded-full bg-amber-500/80"></div>
                                <div className="w-3 h-3 rounded-full bg-emerald-500/80"></div>
                                <span className="ml-3 text-xs font-mono text-slate-400">app.odontocloud.com/dashboard</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold rounded-full uppercase tracking-wider flex items-center gap-1.5">
                                    <FiZap size={12} /> Factus DIAN Conectado
                                </span>
                                <span className="px-3 py-1 bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-[10px] font-bold rounded-full uppercase tracking-wider flex items-center gap-1.5">
                                    <FiShield size={12} /> RIPS 2026 Listo
                                </span>
                            </div>
                        </div>

                        {/* Interactive Feature Highlights Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            
                            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 text-left hover:border-cyan-500/40 transition-all group">
                                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                    <FiCalendar size={20} />
                                </div>
                                <h4 className="text-sm font-bold text-white mb-1">Agenda Inteligente</h4>
                                <p className="text-xs text-slate-400 leading-relaxed">Recordatorios automatizados vía WhatsApp y confirmación directa de citas.</p>
                            </div>

                            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 text-left hover:border-blue-500/40 transition-all group">
                                <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                    <FiFileText size={20} />
                                </div>
                                <h4 className="text-sm font-bold text-white mb-1">Historia Clínica Digital</h4>
                                <p className="text-xs text-slate-400 leading-relaxed">Evoluciones completas, adjuntos de odontología y firmas digitales.</p>
                            </div>

                            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 text-left hover:border-emerald-500/40 transition-all group">
                                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                    <FiZap size={20} />
                                </div>
                                <h4 className="text-sm font-bold text-white mb-1">Facturación Electrónica</h4>
                                <p className="text-xs text-slate-400 leading-relaxed">Emisión directa DIAN con proveedor Factus en un solo clic.</p>
                            </div>

                            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 text-left hover:border-indigo-500/40 transition-all group">
                                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                    <FiTrendingUp size={20} />
                                </div>
                                <h4 className="text-sm font-bold text-white mb-1">Reportes & Cartera</h4>
                                <p className="text-xs text-slate-400 leading-relaxed">Estadísticas reales de ingresos, RIPS estandarizados y cobros.</p>
                            </div>

                        </div>
                    </div>
                </motion.div>

                {/* Trust Badges Footer */}
                <div className="pt-12 flex flex-wrap items-center justify-center gap-8 text-slate-400">
                    {(config.isMaster ? [
                        { text: "Facturación DIAN Integrada", icon: <FiZap className="text-emerald-400" size={18} /> },
                        { text: "Generación de RIPS", icon: <FiCheckCircle className="text-cyan-400" size={18} /> },
                        { text: "Encriptación SSL Bancaria", icon: <FiShield className="text-blue-400" size={18} /> },
                        { text: "Infraestructura Cloud Nube 99.9%", icon: <FiStar className="text-amber-400" size={18} /> }
                    ] : [
                        { text: "Odontólogos Certificados", icon: <FiUsers className="text-cyan-400" size={18} /> },
                        { text: "Instalaciones Seguras", icon: <FiShield className="text-blue-400" size={18} /> },
                        { text: "Tecnología Avanzada", icon: <FiCheckCircle className="text-emerald-400" size={18} /> }
                    ]).map((badge, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider bg-slate-900/60 px-4 py-2 rounded-xl border border-slate-800/60">
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
