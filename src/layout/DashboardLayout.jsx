import React, { useState, useMemo, useEffect, useRef } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import {
    FiHome, FiCalendar, FiUsers, FiFileText, FiBox,
    FiActivity, FiSettings, FiLogOut, FiMenu, FiX, FiClock, FiCheckCircle, FiLayout, FiPieChart, FiGrid, FiSearch, FiDollarSign, FiBriefcase
} from "react-icons/fi";
import logo from "/assets/logo.png"; // Asegúrate de que esta ruta sea correcta
import { useAuth } from "../context/AuthContext";

import { usePermissions } from "../hooks/usePermissions";
import CommandPalette from "../components/CommandPalette";
import { FiMic, FiMicOff } from "react-icons/fi";
import useSpeechRecognition from "../hooks/useSpeechRecognition";
import { searchPatients } from "../services/patientService";

export default function DashboardLayout({ children, title, subtitle, basePath = "/dashboard_admin" }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [collapsedDesktop, setCollapsedDesktop] = useState(() => {
        try {
            return localStorage.getItem('oc_sidebar_collapsed') === 'true';
        } catch {
            return false;
        }
    });

    useEffect(() => {
        try {
            localStorage.setItem('oc_sidebar_collapsed', collapsedDesktop);
        } catch {}
    }, [collapsedDesktop]);

    const { logout, user, userProfile } = useAuth();
    const { can } = usePermissions();
    const navigate = useNavigate();
    const location = useLocation();

    // Hands-Free Voice Assistant State
    const [handsFreeActive, setHandsFreeActive] = useState(() => {
        try {
            return localStorage.getItem('oc_handsfree_voice') !== 'false';
        } catch {
            return true;
        }
    });

    useEffect(() => {
        try {
            localStorage.setItem('oc_handsfree_voice', handsFreeActive);
        } catch {}
    }, [handsFreeActive]);

    // Use our Speech Recognition hook in PERSISTENT mode
    const {
        isListening,
        transcript,
        startListening,
        stopListening,
        resetTranscript
    } = useSpeechRecognition(true, true);

    // Toggle speech engine depending on active state
    useEffect(() => {
        if (handsFreeActive) {
            resetTranscript();
            startListening();
        } else {
            stopListening();
        }
    }, [handsFreeActive, startListening, stopListening, resetTranscript]);

    // Restart voice recognition when the window/tab gets focus or becomes visible
    useEffect(() => {
        const handleVisibilityOrFocus = () => {
            if (handsFreeActive && document.visibilityState === 'visible') {
                console.log("Tab became visible/focused. Restarting Vox Manos Libres...");
                resetTranscript();
                startListening();
            }
        };

        window.addEventListener('focus', handleVisibilityOrFocus);
        document.addEventListener('visibilitychange', handleVisibilityOrFocus);

        return () => {
            window.removeEventListener('focus', handleVisibilityOrFocus);
            document.removeEventListener('visibilitychange', handleVisibilityOrFocus);
        };
    }, [handsFreeActive, startListening, resetTranscript]);

    const handleExecuteBackgroundVoiceCommand = async (rawText) => {
        // Silently skip if the foreground clinical voice assistant (Anita) is open
        if (window.localVoiceAssistantOpen) {
            return false;
        }

        // Prevent executing commands if the user is focused on an input/textarea (typing or dictating locally)
        const activeEl = document.activeElement;
        const isEditing = activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA' || activeEl.contentEditable === 'true');
        if (isEditing) {
            console.log("Ignored background command due to active input/editing focus.");
            return false;
        }

        // Clean punctuation and strip accents/diacritics from speech engine
        const text = (rawText || "")
            .toString()
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "") // Remove accents
            .replace(/[.,\/#!$%\^&\*;:{}=\-_~()?¿]/g, "") // Remove punctuation
            .trim();

        console.log("Executing background voice command (normalized):", text);

        const safeBasePath = basePath.endsWith("/") ? basePath.slice(0, -1) : basePath;

        // A. General Navigation Commands
        if (/(inicio|ir a inicio|ir al inicio)$/i.test(text)) {
            navigate(safeBasePath);
            return true;
        }
        if (/(agenda|ir a agenda|ir a la agenda|ir agenda)$/i.test(text)) {
            navigate(`${safeBasePath}/agenda`);
            return true;
        }
        if (/(pacientes|ir a pacientes|ir a los pacientes|ir pacientes)$/i.test(text)) {
            navigate(`${safeBasePath}/pacientes`);
            return true;
        }
        if (/(caja|ir a caja|ir a la caja|ir caja)$/i.test(text)) {
            navigate(`${safeBasePath}/caja`);
            return true;
        }
        if (/(administracion|ir a administracion|ir a la administracion|ir administracion)$/i.test(text)) {
            navigate(`${safeBasePath}/administracion`);
            return true;
        }
        if (/(reportes|ir a reportes|ir a los reportes|ir reportes)$/i.test(text)) {
            navigate(`${safeBasePath}/reportes`);
            return true;
        }
        if (/(configuracion|ir a configuracion|ir a la configuracion|ir configuracion)$/i.test(text)) {
            navigate(`${safeBasePath}/config`);
            return true;
        }
        if (/(crear paciente|nuevo paciente|crear nuevo paciente|registrar paciente)$/i.test(text)) {
            navigate(`${safeBasePath}/pacientes?action=new`);
            return true;
        }

        // B. Patient Details Specific Tab Navigation (pure accentless regexes)
        const regexHistoria = /(iniciar historia de|iniciar historia clinica de|activar historia de|activar historia clinica de|historia de|historia clinica de|historial de|historial clinico de|abrir paciente|ver paciente|buscar paciente)\s+(.+)$/i;
        const regexOdonto = /(abrir odontograma de|odontograma de|ver odontograma de|activar odontograma de)\s+(.+)$/i;
        const regexEvo = /(abrir evoluciones de|evoluciones de|ver evoluciones de|evolucion de|evoluciones de|activar evoluciones de)\s+(.+)$/i;
        const regexAI = /(abrir copiloto de|copiloto de|insights de|copiloto ia de|activar copiloto de)\s+(.+)$/i;

        let match = null;
        let tab = "anamnesis";

        if ((match = text.match(regexHistoria))) {
            tab = "anamnesis";
        } else if ((match = text.match(regexOdonto))) {
            tab = "odonto";
        } else if ((match = text.match(regexEvo))) {
            tab = "evo";
        } else if ((match = text.match(regexAI))) {
            tab = "ai_insights";
        }

        if (match) {
            const nameToSearch = match[2].trim();
            try {
                const patients = await searchPatients(userProfile?.inquilino, nameToSearch.toUpperCase());
                if (patients && patients.length > 0) {
                    navigate(`${safeBasePath}/pacientes?id=${patients[0].id}&tab=${tab}`);
                } else {
                    console.log(`Background Voice lookup: No patient found matching "${nameToSearch}"`);
                }
            } catch (err) {
                console.error("Error searching patients by background voice:", err);
            }
            return true;
        }

        return false;
    };

    // Watch for transcripts to process commands in real-time with a 1.2s debounce
    useEffect(() => {
        if (!handsFreeActive || !transcript) return;

        // Hard limit: if transcript exceeds 100 chars, it's likely ambient conversation.
        // Reset immediately without trying to match any command.
        if (transcript.trim().length > 100) {
            resetTranscript();
            return;
        }

        const timer = setTimeout(() => {
            handleExecuteBackgroundVoiceCommand(transcript).then((processed) => {
                // Always reset after attempting a command (matched or not)
                // to prevent transcript accumulation from ambient speech
                resetTranscript();
            });
        }, 1200);

        return () => clearTimeout(timer);
    }, [transcript, handsFreeActive, resetTranscript]);

    // Calculate Trial Days
    const trialDaysRemaining = useMemo(() => {
        if (userProfile?.tenant?.planId !== "trial" || !userProfile?.tenant?.subscriptionEndDate) return null;

        const end = userProfile.tenant.subscriptionEndDate.toDate
            ? userProfile.tenant.subscriptionEndDate.toDate()
            : new Date(userProfile.tenant.subscriptionEndDate);
        const now = new Date();
        const diffTime = end.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays > 0 ? diffDays : 0;
    }, [userProfile]);

    const subscriptionDates = useMemo(() => {
        if (!userProfile?.tenant?.subscriptionEndDate) return null;
        const end = userProfile.tenant.subscriptionEndDate.toDate
            ? userProfile.tenant.subscriptionEndDate.toDate()
            : new Date(userProfile.tenant.subscriptionEndDate);

        // Start date might be in createdAt
        const start = userProfile.tenant.createdAt?.toDate
            ? userProfile.tenant.createdAt.toDate()
            : (userProfile.tenant.createdAt ? new Date(userProfile.tenant.createdAt) : new Date());

        return {
            start: start.toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' }),
            end: end.toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })
        };
    }, [userProfile]);

    const handleLogout = async () => {
        await logout();
        navigate("/login");
    };

    const navItems = [
        { id: 'Inicio', icon: FiGrid, label: 'INICIO' },
        { id: 'agenda', icon: FiCalendar, label: 'AGENDA' },
        { id: 'pacientes', icon: FiUsers, label: 'PACIENTES' },
        { id: 'caja', icon: FiDollarSign, label: 'CAJA' },
        { id: 'administracion', icon: FiBriefcase, label: 'ADMINISTRACIÓN' },
        { id: 'reportes', icon: FiPieChart, label: 'REPORTES' },
        { id: 'config', icon: FiSettings, label: 'CONFIGURACIÓN' }
    ];

    const filteredNavItems = useMemo(() => {
        return navItems.filter(item => {
            if (item.id === 'Inicio') return true;
            if (item.id === 'agenda') return can("Agenda", "Agenda", "consultar");
            if (item.id === 'pacientes') return can("Pacientes", "Paciente", "consultar");
            if (item.id === 'caja') return can("Caja", "Caja", "consultar");
            if (item.id === 'administracion') return can("Administración", "Gestion Administración", "consultar");
            if (item.id === 'reportes') return can("Reportes", "Gestion Reportes", "consultar");
            if (item.id === 'config') return can("Configuración", "Gestion Configuración", "consultar");
            return true;
        });
    }, [userProfile, can]);

    const handleNavClick = (id) => {
        setSidebarOpen(false);
        const safeBasePath = basePath.endsWith("/") ? basePath.slice(0, -1) : basePath;
        const path = id === 'Inicio' ? safeBasePath : `${safeBasePath}/${id}`;
        navigate(path);
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-900 overflow-x-hidden relative">
            {/* Advanced Background Decoration */}
            <div className="fixed inset-0 pointer-events-none opacity-[0.03] z-0"
                style={{ backgroundImage: `radial-gradient(#2563eb 0.5px, transparent 0.5px)`, backgroundSize: '24px 24px' }} />

            <div className="fixed top-0 right-0 w-[1000px] h-[1000px] bg-blue-50/40 rounded-full blur-[140px] -mr-[500px] -mt-[500px] pointer-events-none animate-pulse duration-[10s]" />
            <div className="fixed bottom-0 left-0 w-[800px] h-[800px] bg-indigo-50/20 rounded-full blur-[120px] -ml-[400px] -mb-[400px] pointer-events-none" />

            {/* Mobile Sidebar Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-500"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Top Navigation Bar / Hamburger for Desktop */}
            <div className="hidden lg:flex fixed top-4 left-4 z-[60]">
                <button
                    onClick={() => setCollapsedDesktop(!collapsedDesktop)}
                    className="w-10 h-10 bg-white/80 backdrop-blur-md rounded-xl border border-slate-200/60 shadow-sm flex items-center justify-center text-slate-500 hover:text-blue-600 hover:border-blue-200 transition-all active:scale-95"
                    title={collapsedDesktop ? "Expandir menú" : "Contraer menú"}
                >
                    <FiMenu size={18} />
                </button>
            </div>

            {/* Sidebar - Slender Pro v3.0 (Advanced Glassmorphism) */}
            <aside
                className={`
          fixed inset-y-0 left-0 z-50 bg-white/40 backdrop-blur-[40px] border-r border-slate-200/40 shadow-[10px_0_50px_rgba(0,0,0,0.02)]
          ${sidebarOpen ? "translate-x-0 w-64" : "-translate-x-full lg:translate-x-0"}
          ${collapsedDesktop ? "lg:w-20" : "lg:w-64"} w-64
          transition-all duration-500 cubic-bezier(0.16, 1, 0.3, 1)
        `}
            >
                <div className="h-full flex flex-col relative overflow-hidden">
                    {/* Interior Glow */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50/50 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />

                    {/* Logo Area - Clinic Focus */}
                    <div className={`px-4 py-5 relative shrink-0 border-b border-slate-100/50 bg-slate-50/30 flex flex-col items-center justify-center min-h-[120px] transition-all duration-500 ${collapsedDesktop ? 'mt-10' : ''}`}>
                        <div className="flex flex-col items-center gap-4 group cursor-pointer transition-all duration-500" onClick={() => navigate(basePath)}>
                            <div className={`${collapsedDesktop ? 'w-10 h-10 rounded-lg' : 'w-20 h-20 rounded-2xl'} bg-white border border-slate-100 shadow-xl flex items-center justify-center overflow-hidden group-hover:scale-105 group-hover:rotate-1 transition-all duration-500 shrink-0`}>
                                {userProfile?.rol === 'superadmin' ? (
                                    <div className="w-full h-full bg-slate-900 flex items-center justify-center text-white font-black text-xl lg:text-3xl italic tracking-tighter">M</div>
                                ) : userProfile?.tenant?.logo ? (
                                    <img src={userProfile.tenant.logo} alt="Logo" className="max-h-full max-w-full object-contain p-1 lg:p-2" />
                                ) : (
                                    <div className="w-full h-full bg-blue-600 flex items-center justify-center text-white font-black text-xl lg:text-2xl italic tracking-tighter">
                                        {(userProfile?.tenant?.nombreComercial || "O").substring(0, 1).toUpperCase()}
                                    </div>
                                )}
                            </div>
                            <div className={`flex flex-col items-center text-center overflow-hidden transition-all duration-500 ${collapsedDesktop ? 'w-0 opacity-0 h-0 hidden' : 'w-auto opacity-100 h-auto'}`}>
                                <h1 className="text-xl font-black text-slate-800 tracking-tighter leading-none uppercase truncate max-w-[200px]">
                                    {userProfile?.rol === 'superadmin' 
                                        ? "OdontoCloud Central" 
                                        : (userProfile?.tenant?.nombreComercial || "ODONTOCLOUD")}
                                </h1>
                                {userProfile?.tenant?.nit && (
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200/50">NIT: {userProfile.tenant.nit}</span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Navigation - High Density Slender Pro v2 */}
                    <nav className="flex-1 px-3 py-4 space-y-1 relative z-10 overflow-x-hidden overflow-y-auto custom-scrollbar">
                        {/* Global Search - Integrated in Sidebar */}
                        <div className="px-1 mb-4 flex justify-center">
                            <button
                                onClick={() => window.dispatchEvent(new CustomEvent('open-global-search'))}
                                className={`flex items-center justify-center transition-all duration-300 group shadow-sm bg-slate-100/50 hover:bg-blue-50 border border-slate-200/40 hover:border-blue-200 text-slate-400 hover:text-blue-600 ${collapsedDesktop ? 'w-10 h-10 rounded-xl px-0' : 'w-full gap-3 px-4 py-3 rounded-xl'}`}
                                title="Buscar..."
                            >
                                <FiSearch className="text-slate-400 group-hover:text-blue-600 shrink-0" size={16} />
                                {!collapsedDesktop && (
                                    <>
                                        <span className="text-[10px] font-bold uppercase tracking-wider whitespace-nowrap">Buscar...</span>
                                        <div className="ml-auto flex gap-1 opacity-40 group-hover:opacity-100 shrink-0">
                                            <kbd className="px-1 py-0.5 bg-white border border-slate-200 rounded text-[8px] font-bold text-slate-500">Ctrl</kbd>
                                            <kbd className="px-1 py-0.5 bg-white border border-slate-200 rounded text-[8px] font-bold text-slate-500">K</kbd>
                                        </div>
                                    </>
                                )}
                            </button>
                        </div>

                        <div className={`px-4 text-[9px] font-black text-slate-300 uppercase tracking-[0.3em] mb-4 flex items-center justify-center lg:justify-between gap-2 overflow-hidden transition-all duration-500 ${collapsedDesktop ? 'opacity-0 h-0 hidden' : 'opacity-100 h-auto'}`}>
                            <span className="whitespace-nowrap">Menú Principal</span>
                        </div>
                        
                        {filteredNavItems.map((item) => {
                            const safeBasePath = basePath.endsWith("/") ? basePath.slice(0, -1) : basePath;
                            const fullPath = item.id === 'Inicio' ? safeBasePath : `${safeBasePath}/${item.id}`;
                            const isActive = location.pathname === fullPath || (item.id !== 'Inicio' && location.pathname.startsWith(fullPath));

                            return (
                                <button
                                    key={item.id}
                                    onClick={() => handleNavClick(item.id)}
                                    title={collapsedDesktop ? item.label : ""}
                                    className={`
                                        relative flex items-center ${collapsedDesktop ? 'justify-center w-10 h-10 mx-auto' : 'gap-3 w-full py-2.5 px-4'} rounded-xl transition-all duration-300 group
                                        ${isActive
                                            ? 'bg-blue-600/5 text-blue-600'
                                            : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}
                                    `}
                                >
                                    {/* Active Indicator Bar */}
                                    {isActive && !collapsedDesktop && (
                                        <div className="absolute left-0 w-1 bg-blue-600 rounded-r-full h-5" />
                                    )}
                                    <item.icon className={`text-lg shrink-0 transition-transform duration-300 group-hover:scale-110 ${isActive ? 'text-blue-600' : ''}`} />
                                    {!collapsedDesktop && (
                                        <span className={`text-[11px] font-bold tracking-wider uppercase transition-colors whitespace-nowrap ${isActive ? 'text-blue-600' : ''}`}>
                                            {item.label}
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </nav>

                    {/* Hands-Free Voice Assistant Widget */}
                    {collapsedDesktop ? (
                        <div className="mb-4 flex justify-center">
                            <button
                                onClick={() => setHandsFreeActive(!handsFreeActive)}
                                className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all ${
                                    handsFreeActive && isListening 
                                        ? 'bg-emerald-50 border-emerald-200 text-emerald-600 shadow-[0_0_8px_rgba(16,185,129,0.2)]' 
                                        : handsFreeActive 
                                        ? 'bg-indigo-50 border-indigo-100 text-indigo-600'
                                        : 'bg-slate-50 border-slate-200 text-slate-400'
                                }`}
                                title={handsFreeActive ? "Vox Manos Libres: Activo" : "Vox Manos Libres: Inactivo"}
                            >
                                <FiMic size={18} className={handsFreeActive && isListening ? "animate-pulse" : ""} />
                            </button>
                        </div>
                    ) : (
                        <div className="mb-4 px-4">
                            <div className="bg-indigo-50/60 border border-indigo-100/50 rounded-2xl p-3 flex flex-col gap-2">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className={`w-2.5 h-2.5 rounded-full ${handsFreeActive && isListening ? 'bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-slate-300'}`} />
                                        <span className="text-[9px] font-black text-indigo-950 uppercase tracking-wider">Vox Manos Libres</span>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input 
                                            type="checkbox" 
                                            className="sr-only peer" 
                                            checked={handsFreeActive} 
                                            onChange={(e) => setHandsFreeActive(e.target.checked)} 
                                        />
                                        <div className="w-8 h-4 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-indigo-600"></div>
                                    </label>
                                </div>
                                <span className="text-[8px] font-bold text-indigo-400 uppercase tracking-widest leading-normal">
                                    {handsFreeActive && isListening ? "Escuchando fondo..." : "Asistente de voz inactivo"}
                                </span>
                            </div>
                        </div>
                    )}

                    {/* User Profile / Logout - Refined v2 */}
                    <div className="p-4 relative group/user mt-auto flex justify-center">
                        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-slate-100/80 to-transparent" />

                        <button
                            onClick={handleLogout}
                            title={collapsedDesktop ? "Cerrar sesión" : ""}
                            className={`flex items-center justify-center transition-all duration-500 active:scale-95 group shadow-sm bg-red-50/50 border border-red-100 text-red-400 hover:bg-red-500 hover:text-white hover:border-red-500 ${collapsedDesktop ? 'w-10 h-10 rounded-xl px-0' : 'w-full gap-3 px-5 py-3.5 rounded-[18px]'}`}
                        >
                            <FiLogOut className="h-4 w-4 shrink-0 transition-transform group-hover:-translate-x-1" />
                            {!collapsedDesktop && (
                                <span className="text-[10px] font-black uppercase tracking-widest whitespace-nowrap">Cerrar sesión</span>
                            )}
                        </button>
                    </div>
                </div>
            </aside>

            {/* Content Area */}
            <div className={`flex-1 flex flex-col min-w-0 min-h-screen relative z-1 transition-all duration-500 ${collapsedDesktop ? 'lg:pl-20' : 'lg:pl-64'}`}>
                {/* Mobile Header */}
                <header className="bg-white/80 backdrop-blur-md border-b border-slate-100 lg:hidden flex items-center justify-between px-6 h-16 sticky top-0 z-40">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-500"
                    >
                        <FiMenu size={20} />
                    </button>
                    <span className="text-sm font-black text-slate-800 uppercase tracking-widest leading-none">
                        {(title || "Escritorio")}
                    </span>
                    <div className="w-10" />
                </header>

                <main className="flex-1 p-4 sm:p-6 lg:p-8">
                    <div className="max-w-[1600px] mx-auto">
                        {(title || subtitle) && (
                            <div className="mb-10 space-y-1">
                                {title && (
                                    <div className="flex items-center gap-3">
                                        <div className="w-1.5 h-6 bg-blue-600 rounded-full" />
                                        <h1 className="text-3xl font-black text-slate-800 tracking-tighter uppercase">{title}</h1>
                                    </div>
                                )}
                                {subtitle && <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest opacity-80 pl-4">{subtitle}</p>}
                            </div>
                        )}

                        <div className="">
                            {children}
                        </div>
                    </div>
                </main>
            </div>
            <CommandPalette />
        </div>
    );
}
