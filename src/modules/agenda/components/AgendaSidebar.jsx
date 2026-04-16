import React, { useState } from 'react';
import { FiChevronDown, FiChevronUp, FiFilter, FiSearch } from 'react-icons/fi';
import MiniCalendar from './MiniCalendar';

const FilterAccordion = ({ title, isOpen, onToggle, children }) => (
    <div className="border-b border-slate-100 last:border-0">
        <button
            onClick={onToggle}
            className="w-full flex justify-between items-center py-4 px-2 text-[11px] font-black uppercase tracking-widest text-slate-400 hover:text-blue-600 transition-colors"
        >
            {title}
            {isOpen ? <FiChevronUp className="text-slate-400" /> : <FiChevronDown className="text-slate-400" />}
        </button>
        {isOpen && (
            <div className="pb-4 px-2 animate-fadeIn">
                {children}
            </div>
        )}
    </div>
);

export default function AgendaSidebar({ selectedDate, onDateChange, doctors, selectedDoctor, onSelectDoctor, branches = [], selectedBranch, onSelectBranch }) {
    const [openSections, setOpenSections] = useState({ sucursal: true, profesionales: true });

    const toggleSection = (sec) => {
        setOpenSections(prev => ({ ...prev, [sec]: !prev[sec] }));
    };

    return (
        <div className="w-full h-full flex flex-col gap-4">
            {/* Calendar Card */}
            <div className="bg-white rounded-[28px] shadow-sm border border-slate-100 p-2">
                <MiniCalendar selectedDate={selectedDate} onDateChange={onDateChange} />
            </div>

            {/* Filters Card */}
            <div className="bg-white rounded-[28px] shadow-sm border border-slate-100 flex-1 overflow-hidden flex flex-col">
                <div className="p-5 border-b border-slate-50 bg-slate-50/30">
                    <div className="flex items-center gap-2.5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">
                        <FiFilter className="text-blue-600" />
                        <span>Filtros de Agenda</span>
                    </div>
                </div>

                <div className="p-3 flex-1 overflow-y-auto custom-scrollbar">
                    <FilterAccordion
                        title="Sede / Sucursal"
                        isOpen={openSections.sucursal}
                        onToggle={() => toggleSection('sucursal')}
                    >
                        <select
                            value={selectedBranch || ""}
                            onChange={(e) => onSelectBranch(e.target.value)}
                            className="w-full p-4 text-[11px] font-bold bg-slate-50 border border-slate-100 rounded-[16px] text-slate-700 focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500/30 transition-all uppercase tracking-tight cursor-pointer appearance-none shadow-sm"
                        >
                            <option value="">TODAS LAS SEDES</option>
                            {branches.map(branch => (
                                <option key={branch.id} value={branch.id}>
                                    {branch.nombre}
                                </option>
                            ))}
                        </select>
                    </FilterAccordion>

                    <FilterAccordion
                        title="Profesionales"
                        isOpen={openSections.profesionales}
                        onToggle={() => toggleSection('profesionales')}
                    >
                        <div className="relative mb-4">
                            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                            <input
                                type="text"
                                placeholder="BUSCAR PROFESIONAL..."
                                className="w-full pl-11 pr-4 py-3 text-[11px] bg-slate-50 border border-slate-100 rounded-[16px] outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500/30 transition-all placeholder:text-slate-300 font-bold uppercase"
                            />
                        </div>
                        <div className="flex flex-col gap-1.5 max-h-[350px] overflow-y-auto custom-scrollbar pr-1">
                            <button
                                onClick={() => onSelectDoctor(null)}
                                className={`text-left text-[11px] py-3.5 px-5 rounded-[16px] transition-all truncate font-black uppercase tracking-widest ${!selectedDoctor ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'}`}
                            >
                                Todos los profesionales
                            </button>
                            {doctors.map(doc => (
                                <button
                                    key={doc.id}
                                    onClick={() => onSelectDoctor(doc.id)}
                                    className={`text-left text-[11px] py-3.5 px-5 rounded-[16px] transition-all truncate font-black uppercase tracking-widest ${selectedDoctor === doc.id ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'}`}
                                >
                                    {doc.nombre}
                                </button>
                            ))}
                        </div>
                    </FilterAccordion>
                </div>
            </div>
        </div>
    );
}
