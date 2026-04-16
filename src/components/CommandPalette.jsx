import React, { useState, useEffect, useRef } from "react";
import ReactDOM from "react-dom";
import { useNavigate } from "react-router-dom";
import {
    FiSearch, FiUser, FiCalendar, FiDollarSign,
    FiBox, FiFileText, FiActivity, FiArrowRight,
    FiZap, FiSettings, FiLayout
} from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import { searchPatients } from "../services/patientService";

export default function CommandPalette() {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState("");
    const [results, setResults] = useState([]);
    const [searching, setSearching] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const { userProfile } = useAuth();
    const navigate = useNavigate();
    const inputRef = useRef(null);

    // Static Commands (Navigation & Quick Actions)
    const staticCommands = [
        { id: 'nav-agenda', label: 'Ir a Agenda', icon: FiCalendar, action: () => navigate('/dashboard_admin/agenda'), category: 'Navegación' },
        { id: 'nav-pacientes', label: 'Ir a Pacientes', icon: FiUser, action: () => navigate('/dashboard_admin/pacientes'), category: 'Navegación' },
        { id: 'nav-caja', label: 'Ir a Caja', icon: FiDollarSign, action: () => navigate('/dashboard_admin/caja'), category: 'Navegación' },
        { id: 'nav-inventario', label: 'Ir a Inventario', icon: FiBox, action: () => navigate('/dashboard_admin/inventario'), category: 'Navegación' },
        { id: 'nav-reportes', label: 'Ir a Reportes', icon: FiFileText, action: () => navigate('/dashboard_admin/reportes'), category: 'Navegación' },
        { id: 'nav-config', label: 'Ir a Configuración', icon: FiSettings, action: () => navigate('/dashboard_admin/config'), category: 'Navegación' },
        { id: 'act-new-patient', label: 'Crear Nuevo Paciente', icon: FiZap, action: () => navigate('/dashboard_admin/pacientes?action=new'), category: 'Acciones Rápidas' },
    ];

    useEffect(() => {
        const handleKeyDown = (e) => {
            // Case insensitive check for 'k' / 'K'
            const isK = e.key === 'k' || e.key === 'K';
            if ((e.metaKey || e.ctrlKey) && isK) {
                e.preventDefault();
                e.stopImmediatePropagation(); // Force stop browser/other listeners
                setIsOpen(prev => !prev);
            }
            if (e.key === 'Escape') {
                setIsOpen(false);
            }
        };

        const handleOpenGlobalSearch = () => {
            setIsOpen(true);
        };

        // Use capture phase to intercept before browser or other libs
        window.addEventListener('keydown', handleKeyDown, true);
        window.addEventListener('open-global-search', handleOpenGlobalSearch);
        
        return () => {
            window.removeEventListener('keydown', handleKeyDown, true);
            window.removeEventListener('open-global-search', handleOpenGlobalSearch);
        };
    }, []);

    useEffect(() => {
        if (isOpen) {
            setQuery("");
            setSelectedIndex(0);
            setTimeout(() => inputRef.current?.focus(), 10);
        }
    }, [isOpen]);

    // Search Logic (Debounced)
    useEffect(() => {
        const timer = setTimeout(async () => {
            if (query.length < 2) {
                setResults(staticCommands.filter(c =>
                    c.label.toLowerCase().includes(query.toLowerCase())
                ));
                return;
            }

            setSearching(true);
            try {
                const patients = await searchPatients(userProfile?.inquilino, query.toUpperCase());
                const patientResults = patients.map(p => ({
                    id: `patient-${p.id}`,
                    label: p.nombreCompleto,
                    sublabel: p.nroDocumento,
                    icon: FiUser,
                    action: () => navigate(`/dashboard_admin/pacientes?id=${p.id}`),
                    category: 'Pacientes'
                }));

                const filteredStatics = staticCommands.filter(c =>
                    c.label.toLowerCase().includes(query.toLowerCase())
                );

                setResults([...filteredStatics, ...patientResults]);
            } catch (err) {
                console.error(err);
            }
            setSearching(false);
        }, 300);

        return () => clearTimeout(timer);
    }, [query]);

    const handleAction = (item) => {
        item.action();
        setIsOpen(false);
    };

    const onKeyDown = (e) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedIndex(prev => (prev + 1) % results.length);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedIndex(prev => (prev - 1 + results.length) % results.length);
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (results[selectedIndex]) handleAction(results[selectedIndex]);
        }
    };

    if (!isOpen) return null;

    return ReactDOM.createPortal(
        <div className="fixed inset-0 z-[10000] flex items-start justify-center pt-24 px-4 sm:px-6">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-slate-900/40 backdrop-blur-[2px] transition-opacity animate-in fade-in duration-300"
                onClick={() => setIsOpen(false)}
            />

            {/* Palette Panel */}
            <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-[0_25px_70px_rgba(0,0,0,0.15)] border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Search Header */}
                <div className="relative border-b border-slate-100 p-2">
                    <FiSearch className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input
                        ref={inputRef}
                        type="text"
                        className="w-full pl-14 pr-6 py-5 bg-transparent text-[15px] font-bold text-slate-800 outline-none placeholder:text-slate-300 uppercase tracking-tight"
                        placeholder="BUSCAR PACIENTES, ACCIONES O MODULOS..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={onKeyDown}
                    />
                </div>

                {/* Results List */}
                <div className="max-h-[400px] overflow-y-auto p-3 custom-scrollbar">
                    {results.length === 0 ? (
                        <div className="py-10 text-center">
                            <FiActivity className="mx-auto text-slate-200 mb-3" size={32} />
                            <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">No se encontraron resultados</p>
                        </div>
                    ) : (
                        <div className="space-y-1">
                            {results.map((item, idx) => (
                                <div
                                    key={item.id}
                                    className={`
                                        flex items-center justify-between p-4 rounded-2xl cursor-pointer transition-all border
                                        ${selectedIndex === idx ? 'bg-blue-600 border-blue-500 shadow-lg shadow-blue-100' : 'bg-transparent border-transparent hover:bg-slate-50'}
                                    `}
                                    onClick={() => handleAction(item)}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`
                                            w-10 h-10 rounded-[14px] flex items-center justify-center transition-all
                                            ${selectedIndex === idx ? 'bg-blue-500/30 text-white' : 'bg-slate-50 text-slate-500'}
                                        `}>
                                            <item.icon size={18} />
                                        </div>
                                        <div>
                                            <div className={`text-[12px] font-black uppercase tracking-tight ${selectedIndex === idx ? 'text-white' : 'text-slate-800'}`}>
                                                {item.label}
                                            </div>
                                            {(item.sublabel || item.category) && (
                                                <div className={`text-[9px] font-bold uppercase tracking-widest mt-1 ${selectedIndex === idx ? 'text-blue-100' : 'text-slate-400'}`}>
                                                    {item.sublabel || item.category}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    {selectedIndex === idx && (
                                        <FiArrowRight className="text-white" size={16} />
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer / Shortcuts */}
                <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                    <div className="flex gap-4">
                        <div className="flex items-center gap-2">
                            <kbd className="px-2 py-1 bg-white border border-slate-200 rounded text-[10px] font-bold text-slate-500">ESC</kbd>
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Cerrar</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <kbd className="px-2 py-1 bg-white border border-slate-200 rounded text-[10px] font-bold text-slate-500">↵</kbd>
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Seleccionar</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <kbd className="px-2 py-1 bg-white border border-slate-200 rounded text-[10px] font-bold text-slate-500">↑↓</kbd>
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Navegar</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
}
