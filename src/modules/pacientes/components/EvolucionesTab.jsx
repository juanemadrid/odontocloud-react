import React, { useState } from "react";
import EvolutionList from "./EvolutionList";
import EvolutionModal from "./EvolutionModal";
import RemissionModal from "./RemissionModal";
import { FiPlus, FiPrinter, FiSearch, FiHome } from "react-icons/fi";

export default function EvolucionesTab({ patient }) {
    const [modalOpen, setModalOpen] = useState(false);
    const [modalType, setModalType] = useState(null); // 'evolution' | 'remission'
    const [editingEvo, setEditingEvo] = useState(null);
    const [searchTerms, setSearchTerms] = useState("");

    const handleOpenEvolution = () => {
        setEditingEvo(null);
        setModalType("evolution");
        setModalOpen(true);
    };

    const handleOpenRemission = () => {
        setEditingEvo(null);
        setModalType("remission");
        setModalOpen(true);
    };

    const handleEdit = (evo) => {
        setEditingEvo(evo);
        setModalType(evo.type === 'remission' ? 'remission' : 'evolution');
        setModalOpen(true);
    };

    return (
        <div className="flex flex-col h-full bg-slate-50/10 animate-fadeIn min-h-0 relative overflow-hidden">
            {/* Header Elite OralDrive-style */}
            <div className="flex-none px-6 py-6 md:px-10 flex flex-col gap-5 border-b border-slate-100 bg-white sticky top-0 z-20 shadow-sm">
                
                {/* Top Row: Breadcrumbs & Print */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <h2 className="text-sm font-black text-slate-800 tracking-tight uppercase">
                            Evoluciones & Remisiones
                        </h2>
                        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400">
                           <FiHome size={12} className="text-slate-300" /> 
                           <span className="text-slate-300">-</span> 
                           <span className="uppercase tracking-widest">Pacientes</span> 
                           <span className="text-slate-300">-</span> 
                           <span className="text-slate-500 uppercase tracking-widest">Evoluciones & Remisiones</span>
                        </div>
                    </div>
                    
                    <button type="button" className="px-6 py-2 bg-lime-500 hover:bg-lime-600 text-white rounded-full font-black text-[10px] uppercase tracking-widest shadow-lg shadow-lime-500/20 transition-all active:scale-95 flex items-center gap-2">
                         Imprimir
                    </button>
                </div>

                {/* Bottom Row: Search & Actions */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                     <div className="relative w-full sm:w-80">
                         <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={14} />
                         <input 
                             type="text" 
                             placeholder="Buscar..." 
                             value={searchTerms}
                             onChange={(e) => setSearchTerms(e.target.value)}
                             className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-full text-[11px] font-bold text-slate-600 outline-none focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-400 transition-all placeholder:text-slate-300 uppercase"
                         />
                     </div>
                     <div className="flex items-center gap-3 w-full sm:w-auto">
                         <button 
                             onClick={handleOpenEvolution}
                             className="flex-1 sm:flex-none px-8 py-3 bg-[#8dc63f] hover:bg-[#7cb035] text-white rounded-full font-black text-[11px] uppercase tracking-widest shadow-md shadow-lime-500/20 transition-all active:scale-95 text-center"
                         >
                              Evolución
                         </button>
                         <button 
                             onClick={handleOpenRemission}
                             className="flex-1 sm:flex-none px-8 py-3 bg-[#8dc63f] hover:bg-[#7cb035] text-white rounded-full font-black text-[11px] uppercase tracking-widest shadow-md shadow-lime-500/20 transition-all active:scale-95 text-center"
                         >
                              Remitir
                         </button>
                     </div>
                </div>
            </div>

            {/* Timeline Area */}
            <div className="flex-1 overflow-y-auto custom-scrollbar bg-slate-50/30">
                <EvolutionList patientId={patient?.id} onEdit={handleEdit} searchTerm={searchTerms} />
            </div>

            {/* Float Modal Container */}
            {modalOpen && modalType === 'evolution' && (
                <EvolutionModal 
                    isOpen={modalOpen} 
                    onClose={() => {
                        setModalOpen(false);
                        setEditingEvo(null);
                    }} 
                    patient={patient} 
                    initialData={editingEvo}
                />
            )}

            {/* Float Modal Remission */}
            {modalOpen && modalType === 'remission' && (
                <RemissionModal 
                    isOpen={modalOpen} 
                    onClose={() => {
                        setModalOpen(false);
                        setEditingEvo(null);
                    }} 
                    patient={patient} 
                    initialData={editingEvo}
                />
            )}
        </div>
    );
}
