import React, { useState, useRef } from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { FiCheckCircle, FiShield, FiUsers, FiClock, FiPlusSquare, FiInfo } from "react-icons/fi";
import DocumentationModal from "../../components/landing/DocumentationModal";
import { useNavigate } from 'react-router-dom';

const defaultSlides = [
    {
        image: "https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&q=80&w=2068",
    }
];

export default function HeroSection({ config = {}, onShowTrial }) {
    const containerRef = useRef(null);
    const navigate = useNavigate();
    const [showDocModal, setShowDocModal] = useState(false);

    // Safe use of scroll hooks
    const { scrollY } = useScroll();
    const yBg = useTransform(scrollY, [0, 1000], [0, 300]);

    const getImageUrl = (url) => {
        if (!url) return defaultSlides[0].image;
        if (url.startsWith('http')) return url;
        const baseUrl = import.meta.env.BASE_URL;
        const cleanUrl = url.startsWith('/') ? url.slice(1) : url;
        return `${baseUrl}${cleanUrl}`;
    };

    return (
        <section
            id="inicio"
            ref={containerRef}
            className="relative w-full min-h-screen bg-[var(--viva-blue)] overflow-hidden flex items-center justify-center font-sans"
        >
            <div className="absolute inset-0 bg-[var(--viva-blue)] z-0">
                <div className="absolute inset-0 opacity-30"
                    style={{ background: 'var(--viva-mesh)' }}></div>
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03]"></div>
            </div>

            <motion.div style={{ y: yBg }} className="absolute inset-0 z-0 opacity-20 mix-blend-overlay">
                <div
                    className="absolute inset-0 bg-cover bg-center grayscale"
                    style={{ backgroundImage: `url(${defaultSlides[0].image})` }}
                />
            </motion.div>

            <div className="absolute top-[-20%] left-[-10%] w-[60vw] h-[60vw] bg-sky-500/10 blur-[120px] rounded-full pointer-events-none" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[60vw] h-[60vw] bg-indigo-600/10 blur-[120px] rounded-full pointer-events-none" />

            <div className="container relative z-10 mx-auto px-6 max-w-7xl flex flex-col items-center justify-center h-full pt-20">

                <div className="text-center space-y-8 max-w-4xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                            {config.isMaster && (
                                <div className="inline-flex items-center gap-2 pl-1 pr-4 py-1 rounded-full border border-sky-500/30 bg-sky-500/10 backdrop-blur-md mb-6 hover:bg-sky-500/20 transition-colors cursor-default mx-auto">
                                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-sky-500 text-white text-[10px] font-bold shadow-[0_0_10px_rgba(14,165,233,0.5)]">
                                        New
                                    </span>
                                    <span className="text-xs font-bold text-sky-200 uppercase tracking-widest">
                                        OdontoCloud 2026
                                    </span>
                                </div>
                            )}

                            <h1 className="text-5xl md:text-7xl font-bold text-white leading-[1.05] tracking-tight mb-6 drop-shadow-2xl">
                                <span style={{ fontFamily: 'var(--font-serif)' }} className="italic font-normal block text-slate-300">
                                    Gestión Integral
                                </span>
                                <span className="text-gradient-gold">
                                    Clínica Dental
                                </span>
                            </h1>

                            <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed font-light">
                                Optimiza cada aspecto de tu práctica con nuestra suite completa de herramientas de gestión. Desde la programación de citas hasta la facturación electrónica.
                            </p>
                        </motion.div>

                    <div className="flex flex-wrap gap-4 pt-8 justify-center">
                        <motion.button
                            whileHover={{ scale: 1.02, boxShadow: "0 20px 40px -10px rgba(14, 165, 233, 0.4)" }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => onShowTrial("Plan Pro")}
                            className="relative overflow-hidden px-8 py-4 bg-sky-500 text-white rounded-full font-bold text-sm uppercase tracking-widest shadow-[0_10px_20px_-5px_rgba(14,165,233,0.3)] transition-all group"
                        >
                            <span className="relative z-10 flex items-center gap-2">
                                {config?.heroBtn1Text || (config.isMaster ? "Empezar Gratis" : "Agendar Cita")} <FiCheckCircle />
                            </span>
                            <div className="absolute inset-0 bg-gradient-to-r from-sky-400 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        </motion.button>

                        <motion.button
                            whileHover={{ scale: 1.02, backgroundColor: "rgba(255,255,255,0.1)" }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => {
                                if (!config.isMaster) {
                                    const link = config?.heroBtn2Link || "/portal";
                                    // Handle clinic stack routes (e.g. /c/slug/servicios)
                                    // If the link is absolute path like "/servicios", we might want to prepend /c/slug if we are in a sub-route context?
                                    // Actually, DefaultConfig says "/servicios". 
                                    // In ModernLayout/AppRouter, "/servicios" is a MASTER route.
                                    // Clinic inner pages are "/c/:slug/servicios".

                                    // Let's check if we need to adjust the link for tenant context.
                                    // If config has slug, and link is one of the standard ones, maybe we should construct it?
                                    // Or we just expect the config to have the full path?
                                    // DefaultConfig has "/servicios".
                                    // If I navigate to "/servicios", I go to the master services page?
                                    // Let's check App.jsx... well I can't see it right now.
                                    // But previous conversation established /c/:slug/servicios.

                                    // Fix: If we are in a tenant context (config.slug exists) and link is generic "/servicios", map it.
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
                            className="px-8 py-4 bg-white/5 border border-white/10 text-white rounded-full font-bold text-sm uppercase tracking-widest backdrop-blur-md transition-all hover:border-white/30"
                        >
                            {config?.heroBtn2Text || (config.isMaster ? "Ver Documentación" : "Portal Pacientes")}
                        </motion.button>
                    </div>

                    <div className="pt-12 flex flex-wrap items-center justify-center gap-8 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
                        {(config.isMaster ? [
                            { text: "Encriptación SSL", icon: <FiShield className="text-sky-400" size={20} /> },
                            { text: "Copias de Seguridad", icon: <FiCheckCircle className="text-sky-400" size={20} /> },
                            { text: "Cumple HIPAA/RGPD", icon: <FiShield className="text-sky-400" size={20} /> },
                            { text: "Infraestructura Cloud", icon: <FiCheckCircle className="text-sky-400" size={20} /> }
                        ] : [
                            { text: "Odontólogos Certificados", icon: <FiUsers className="text-sky-400" size={20} /> },
                            { text: "Instalaciones Seguras", icon: <FiShield className="text-sky-400" size={20} /> },
                            { text: "Tecnología Avanzada", icon: <FiCheckCircle className="text-sky-400" size={20} /> },
                            { text: "Atención Inmediata", icon: <FiClock className="text-sky-400" size={20} /> }
                        ]).map((badge, idx) => (
                            <div key={idx} className="flex items-center gap-2">
                                {badge.icon}
                                <span className="text-sm font-bold text-slate-300 hidden md:block">{badge.text}</span>
                            </div>
                        ))}
                    </div>
                </div>

            </div>



            <DocumentationModal
                isOpen={showDocModal}
                onClose={() => setShowDocModal(false)}
            />
        </section>
    );
}
