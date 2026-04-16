import React, { useState } from "react";
import EvolutionList from "./EvolutionList";
import EvolutionModal from "./EvolutionModal";
import { FiPlus, FiActivity, FiArrowRight } from "react-icons/fi";

export default function EvolucionesTab({ patient }) {
    const [modalOpen, setModalOpen] = useState(false);
    const [editingEvo, setEditingEvo] = useState(null);

    const handleOpenModal = () => {
        setEditingEvo(null);
        setModalOpen(true);
    };

    const handleEdit = (evo) => {
        setEditingEvo(evo);
        setModalOpen(true);
    };

    return (
        <div className="flex flex-col h-full bg-slate-50/20 animate-fadeIn min-h-0 relative overflow-hidden">
            {/* Elite Header Actions */}
            <div className="flex-none p-6 md:p-10 flex flex-col md:flex-row justify-between items-center gap-6 border-b border-slate-100 bg-white/40 backdrop-blur-md sticky top-0 z-20">
                <div className="flex items-center gap-5">
                    <div className="w-14 h-14 bg-blue-600 rounded-[22px] flex items-center justify-center text-white shadow-xl shadow-blue-100">
                        <FiActivity size={28} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-slate-800 tracking-tight leading-none mb-1 uppercase">Evoluciones <span className="text-blue-600 underline decoration-blue-100 decoration-8 underline-offset-4">Clínicas</span></h2>
                        <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                           <span>Historia de progreso clínica</span>
                           <FiArrowRight size={10} className="text-slate-200" />
                           <span className="text-slate-500">Sesiones registradas</span>
                        </div>
                    </div>
                </div>

                <button 
                    onClick={handleOpenModal}
                    className="group px-8 py-4 bg-slate-900 border-2 border-slate-900 text-white rounded-[24px] font-black text-[11px] uppercase tracking-widest shadow-2xl shadow-slate-200 hover:bg-blue-600 hover:border-blue-600 transition-all active:scale-95 flex items-center gap-4"
                >
                    <div className="w-6 h-6 bg-white/20 rounded-lg flex items-center justify-center transition-transform group-hover:rotate-90">
                        <FiPlus size={16} strokeWidth={3} />
                    </div>
                    <span>Nueva Sesión / Evolución</span>
                </button>
            </div>

            {/* Timeline Scrollable Area */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
                <EvolutionList patientId={patient?.id} onEdit={handleEdit} />
            </div>

            {/* Float Modal Container */}
            <EvolutionModal 
                isOpen={modalOpen} 
                onClose={() => {
                    setModalOpen(false);
                    setEditingEvo(null);
                }} 
                patient={patient} 
                initialData={editingEvo}
            />
        </div>
    );
}
