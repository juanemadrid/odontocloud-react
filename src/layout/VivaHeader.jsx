import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/landing.css";
import "../styles/inner.css";
import "../styles/modern.css";


// SVG Icons
const IconPhone = () => (
    <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" /></svg>
);
const IconMap = () => (
    <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" /></svg>
);
const IconFacebook = () => (<svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24"><path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c5.05-.5 9-4.76 9-9.95z" /></svg>);
const IconInstagram = () => (<svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24"><path d="M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4c0 3.2-2.6 5.8-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8C2 4.6 4.6 2 7.8 2zm-.2 2c-2.1 0-3.8 1.7-3.8 3.8v8.4c0 2.1 1.7 3.8 3.8 3.8h8.4c2.1 0 3.8-1.7 3.8-3.8V7.8c0-2.1-1.7-3.8-3.8-3.8H7.6zM12 7c2.8 0 5 2.2 5 5s-2.2 5-5 5-5-2.2-5-5 2.2-5 5-5zm0 2c-1.7 0-3 1.3-3 3s1.3 3 3 3 3-1.3 3-3-1.3-3-3-3zm5.25-1.5c.41 0 .75.34.75.75s-.34.75-.75.75-.75-.34-.75-.75.34-.75.75-.75z" /></svg>);
const IconDownload = () => (
    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
);

export default function VivaHeader({ config, isPreview = false, overlay = false }) {
    const { user, userProfile, logout } = useAuth();
    const navigate = useNavigate();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const location = useLocation();
    const { clinicSlug } = useParams();
    const slug = clinicSlug || config?.slug;
    const clinicBase = slug ? `/c/${slug}` : "";

    // FAIL-SAFE: Never render on dashboard/superadmin routes
    const isDashboard = /dashboard|superadmin|admin_/.test(location.pathname.toLowerCase());
    if (isDashboard) return null;

    // Close Menu and Reset Scroll state on Route Change
    useEffect(() => {
        setMobileMenuOpen(false);
        setScrolled(false);
    }, [location]);

    // Handle Scroll
    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);

        const handleBeforeInstall = (e) => {
            e.preventDefault();
            setDeferredPrompt(e);
        };
        window.addEventListener('beforeinstallprompt', handleBeforeInstall);

        return () => {
            window.removeEventListener('scroll', handleScroll);
            window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
        };
    }, []);

    const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen);

    const handleInstallClick = async () => {
        if (!deferredPrompt) return;
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') setDeferredPrompt(null);
    };

    // Correction: Better detection for subpath hosting
    const isHomePath = location.pathname === "/" || location.pathname === import.meta.env.BASE_URL || (import.meta.env.BASE_URL !== '/' && location.pathname === import.meta.env.BASE_URL.replace(/\/$/, ''));

    // Transparent if overlay is on, not scrolled, no menu
    const isTransparent = overlay && !scrolled && !mobileMenuOpen;

    // Premium Glass Logic
    const navClasses = `
        viva-navbar sticky top-0 z-50 transition-all duration-500
        ${isTransparent
            ? 'bg-transparent border-transparent'
            : 'glass-premium-light' // Use new premium class
        }
    `;

    const primaryColor = config?.primaryColor || "#38bdf8"; // Default cyan-400

    const textColor = isTransparent ? "text-white" : "text-slate-800";
    const logoTextColor = isTransparent ? "text-white" : "text-[var(--viva-blue)]";

    const getDashboardPath = () => {
        if (!userProfile?.rol) return "/login";
        const r = userProfile.rol.toLowerCase();
        if (r === "superadmin") return "/superadmin";
        if (r === "administrador" || r.includes("admin") || r.includes("soporte")) return "/dashboard_admin";
        if (r === "doctor" || r.includes("doctor") || r.includes("odontologo")) return "/dashboard_doctor";
        if (r === "recepcionista" || r.includes("recep") || r.includes("auxiliar")) return "/dashboard_recepcion";
        return "/dashboard_recepcion"; // Fallback safe
    };

    return (
        <header className="fixed top-0 left-0 w-full z-[100] transition-all duration-300">
            {/* 1. TOP BAR - ALWAYS VISIBLE */}
            <div className={`viva-topbar w-full relative border-bb transition-all duration-300 h-9 overflow-hidden ${isTransparent ? 'bg-transparent border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-600'}`}>
                <div className="viva-container viva-topbar-content flex justify-between items-center py-2 h-full">
                    <div className="viva-topbar-left flex gap-6 md:gap-10">
                        <a
                            href={isPreview ? "#" : (config?.isMaster ? `tel:${(config?.contactPhone || "3001234567")}` : `https://wa.me/57${(config?.contactPhone || "3001234567").replace(/\D/g, '')}`)}
                            onClick={(e) => isPreview && e.preventDefault()}
                            className={`viva-contact-item flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest hover:text-sky-500 transition-colors ${isTransparent ? '!text-white/80' : '!text-slate-500'}`}
                        >
                            <IconPhone /> <span className="hidden md:inline">{config?.isMaster ? "Soporte: " : "Citas: "}</span> <span>{config?.contactPhone || "3001234567"}</span>
                        </a>
                        <Link 
                            to={isPreview ? "#" : (config?.isMaster ? "/servicios" : "/sedes")} 
                            onClick={(e) => {
                                if (isPreview) {
                                    e.preventDefault();
                                    const targetTab = config?.isMaster ? "services" : "identity";
                                    localStorage.setItem("odc_cms_preview_active_tab", targetTab);
                                    window.dispatchEvent(new Event("storage"));
                                }
                            }}
                            className={`viva-contact-item flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest hover:text-sky-500 transition-colors ${isTransparent ? '!text-white/80' : '!text-slate-500'}`}
                        >
                            <IconMap /> <span className="hidden md:inline">{config?.isMaster ? "Funcionalidades" : "Sedes"}</span>
                        </Link>
                    </div>

                    <div className="viva-topbar-right flex items-center gap-4 md:gap-6">
                        <div className="flex items-center gap-3">
                            {!config?.isMaster ? (
                                <>
                                    <Link to={isPreview ? "#" : `${clinicBase}/portal`} onClick={(e) => isPreview && e.preventDefault()} className="text-[10px] font-bold uppercase tracking-wider text-sky-600 hover:text-sky-500">Portal Pacientes</Link>
                                </>
                            ) : null}

                            {deferredPrompt && (
                                <button
                                    onClick={handleInstallClick}
                                    className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full hover:scale-105 transition-all shadow-lg border border-white/20"
                                >
                                    <IconDownload /> App
                                </button>
                            )}
                        </div>

                        {user ? (
                            <div className="flex items-center gap-3">
                                <Link 
                                    to={isPreview ? "#" : getDashboardPath()} 
                                    onClick={(e) => {
                                        if (isPreview) {
                                            e.preventDefault();
                                            alert("El acceso a tu panel de cuenta está inactivo en la vista previa del editor.");
                                        }
                                    }}
                                    className={`text-[10px] font-bold uppercase tracking-widest ${isTransparent ? 'text-white' : 'text-slate-600'}`}
                                >
                                    {userProfile?.nombre?.split(' ')[0] || "Mi Cuenta"}
                                </Link>
                            </div>
                        ) : (
                            <Link to={isPreview ? "#" : "/login"} onClick={(e) => isPreview && e.preventDefault()} className={`text-[10px] font-bold uppercase tracking-widest opacity-80 hover:opacity-100 transition-opacity ${isTransparent ? 'text-white' : 'text-slate-600'}`}>
                                Login
                            </Link>
                        )}
                    </div>
                </div>
            </div>

            {/* 2. NAVBAR */}
            <nav className={`${navClasses} h-20 md:h-24 flex items-center`}>
                <div className="w-full mx-auto px-4 md:px-8 flex justify-between items-center h-full max-w-[1600px]">

                    {/* LEFT: LOGO */}
                    <div className="flex-shrink-0 flex items-center gap-3 cursor-pointer group" onClick={() => navigate('/')}>
                        <img
                            src={config?.logo?.startsWith('/') ? `${import.meta.env.BASE_URL}${config.logo.slice(1)}` : (config?.logo || `${import.meta.env.BASE_URL}assets/logo.png`)}
                            alt="Logo"
                            className={`h-10 md:h-12 w-auto object-contain transition-all duration-500 group-hover:scale-105 ${!isTransparent && 'opacity-90'}`}
                            onError={(e) => { e.target.style.display = 'none'; }}
                        />
                        <div className="flex flex-col justify-center">
                            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tighter leading-none font-sans">
                                {config?.isMaster ? (
                                    <>
                                        <span className={logoTextColor}>Odonto</span>
                                        <span className="text-amber-500">Cloud</span>
                                    </>
                                ) : (
                                    <span className={logoTextColor}>{config?.appTitle || config?.name || "OdontoCloud"}</span>
                                )}
                            </h1>
                        </div>
                    </div>

                    {/* RIGHT: NAVIGATION + ACTIONS */}
                    <div className="hidden lg:flex items-center gap-8">
                        {/* MENU LINKS */}
                        <div className="flex items-center gap-6">
                            {(config?.isMaster ? [
                                { name: 'Inicio', path: '/' },
                                { name: 'Funcionalidades', path: '/servicios' },
                                { name: 'Planes', path: '/planes' },
                                { name: 'FAQ', path: '/faq' }
                            ] : [
                                { name: 'Inicio', path: clinicBase || '/' },
                                { name: 'Sobre Nosotros', path: `${clinicBase}/nosotros` },
                                { name: 'Servicios', path: `${clinicBase}/servicios` },
                                { name: 'Sedes', path: `${clinicBase}/sedes` },
                                { name: 'Portal', path: `${clinicBase}/portal` }
                            ]).map((item) => {
                                if (item.isMasterOnly && !config?.isMaster) return null;
                                const isActive = item.path === '/'
                                    ? location.pathname === '/'
                                    : location.pathname.startsWith(item.path);

                                return (
                                    <Link
                                        key={item.name}
                                        to={isPreview ? "#" : item.path}
                                        onClick={(e) => {
                                            if (isPreview) {
                                                e.preventDefault();
                                                const lowerName = item.name.toLowerCase();
                                                let targetTab = "hero";
                                                if (lowerName.includes("nosotros")) targetTab = "identity";
                                                else if (lowerName.includes("servicio") || lowerName.includes("funcionalidad")) targetTab = "services";
                                                else if (lowerName.includes("sede")) targetTab = "identity";
                                                else if (lowerName.includes("planes") || lowerName.includes("faq")) targetTab = "hero";
                                                
                                                localStorage.setItem("odc_cms_preview_active_tab", targetTab);
                                                window.dispatchEvent(new Event("storage"));
                                            }
                                        }}
                                        className={`text-[13px] font-bold uppercase tracking-widest transition-all duration-300 relative group py-2
                                                ${isActive ? '' : `${isTransparent ? 'text-white hover:text-cyan-300' : 'text-slate-600 hover:text-cyan-600'}`}
                                            `}
                                        style={isActive ? { color: isTransparent ? '#38bdf8' : '#0ea5e9' } : {}}
                                    >
                                        {item.name}
                                        <span className={`absolute bottom-0 left-0 h-[2px] rounded-full transition-all duration-300 bg-sky-400
                                                ${isActive ? 'w-full' : 'w-0 group-hover:w-full'}
                                            `}
                                        ></span>
                                    </Link>
                                );
                            })}
                        </div>

                        {/* SEPARATOR */}
                        <div className={`h-8 w-[1px] ${isTransparent ? 'bg-white/20' : 'bg-slate-200'}`}></div>

                        {/* MY PANEL BUTTON - PREMIUM STYLE */}
                        <button
                            onClick={() => {
                                if (isPreview) {
                                    alert("El acceso a tu panel de clínica está inactivo en la vista previa del editor.");
                                    return;
                                }
                                navigate(getDashboardPath());
                            }}
                            className={`
                                relative overflow-hidden px-6 py-3 rounded-full text-[11px] font-black uppercase tracking-widest 
                                transition-all duration-300 transform hover:scale-105 hover:shadow-xl group
                                ${isTransparent
                                    ? 'bg-white/10 text-white border border-white/20 hover:bg-white/20'
                                    : 'bg-[var(--viva-blue)] text-white shadow-lg shadow-blue-900/20'
                                }
                            `}
                        >
                            <span className="relative z-10 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                                Mi Panel
                            </span>
                        </button>
                    </div>

                    {/* MOBILE TOGGLE */}
                    <button onClick={toggleMobileMenu} className={`lg:hidden ml-auto p-2 rounded-lg transition-colors ${isTransparent ? 'text-white hover:bg-white/10' : 'text-slate-800 hover:bg-slate-100'}`}>
                        {mobileMenuOpen ? (
                            <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                        ) : (
                            <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" /></svg>
                        )}
                    </button>
                </div>

                {/* MOBILE MENU - GLASSMROPHISM */}
                <div className={`lg:hidden absolute top-full left-0 w-full glass-premium-light border-t border-white/50 shadow-2xl transition-all duration-300 origin-top overflow-hidden ${mobileMenuOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
                    <div className="viva-container flex flex-col p-6 gap-2">
                        {[
                            { name: 'Inicio', path: config?.isMaster ? '/' : (clinicBase || '/') },
                            { name: 'Funcionalidades', path: config?.isMaster ? '/servicios' : `${clinicBase}/servicios` },
                            { name: 'Planes', path: '/planes', isMasterOnly: true },
                            { name: 'FAQ', path: config?.isMaster ? '/faq' : `${clinicBase}/faq` }
                        ].map((item) => {
                            if (item.isMasterOnly && !config?.isMaster) return null;
                            return (
                                <Link
                                    key={item.name}
                                    to={isPreview ? "#" : item.path}
                                    onClick={(e) => {
                                        setMobileMenuOpen(false);
                                        if (isPreview) {
                                            e.preventDefault();
                                            const lowerName = item.name.toLowerCase();
                                            let targetTab = "hero";
                                            if (lowerName.includes("nosotros")) targetTab = "identity";
                                            else if (lowerName.includes("servicio") || lowerName.includes("funcionalidad")) targetTab = "services";
                                            else if (lowerName.includes("sede")) targetTab = "identity";
                                            else if (lowerName.includes("planes") || lowerName.includes("faq")) targetTab = "hero";
                                            
                                            localStorage.setItem("odc_cms_preview_active_tab", targetTab);
                                            window.dispatchEvent(new Event("storage"));
                                        }
                                    }}
                                    className="text-sm font-bold uppercase tracking-wider text-slate-700 hover:text-cyan-600 py-3 border-b border-slate-100/50 flex justify-between items-center group"
                                >
                                    {item.name}
                                    <span className="text-slate-300 group-hover:text-cyan-500">→</span>
                                </Link>
                            );
                        })}
                        <button
                            onClick={() => {
                                setMobileMenuOpen(false);
                                if (isPreview) {
                                    alert("El acceso a tu panel de clínica está inactivo en la vista previa del editor.");
                                    return;
                                }
                                navigate(getDashboardPath());
                            }}
                            className="mt-4 w-full bg-[var(--viva-blue)] text-white py-3.5 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-blue-900 shadow-xl"
                        >
                            Ir a Mi Panel
                        </button>
                    </div>
                </div>
            </nav>
        </header>
    );
}
