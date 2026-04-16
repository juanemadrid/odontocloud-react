import React, { useState } from 'react';
import { FiAlertCircle, FiSearch, FiPlus, FiTrash2, FiEdit2 } from 'react-icons/fi';
import { updateDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../../firebase/firebaseConfig';
import { useToast } from '../../../context/ToastContext';
import { v4 as uuidv4 } from 'uuid';

export default function BeneficiariosTab({ patient, onUpdate, onSwitchTab }) {
    const { toast } = useToast();
    const [searchTerm, setSearchTerm] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // Check if patient actually has a "convenioBeneficio" string or assigned field
    const hasConvenio = patient?.convenioBeneficio && patient.convenioBeneficio.trim() !== "";
    const beneficiarios = patient?.beneficiarios || [];

    const handleAssignClick = () => {
        // Se asume que el convenio se edita en la pestaña "EPS" o "datos"
        if (onSwitchTab) onSwitchTab('eps'); 
    };

    const handleAddSimulated = async () => {
        const nombre = prompt("Nombre del beneficiario:");
        if (!nombre) return;
        const documento = prompt("Nro documento:");
        const direccion = prompt("Dirección:");
        const telefono = prompt("Teléfono:");

        const newBen = {
            id: uuidv4(),
            nombre,
            documento,
            direccion,
            telefono,
            createdAt: Date.now()
        };

        setIsSubmitting(true);
        try {
            const updatedList = [...beneficiarios, newBen];
            await updateDoc(doc(db, "pacientes", patient.id), {
                beneficiarios: updatedList,
                actualizado: serverTimestamp()
            });
            onUpdate && onUpdate({ ...patient, beneficiarios: updatedList });
            toast.success("Beneficiario agregado");
        } catch (e) {
            console.error(e);
            toast.error("Error al agregar beneficiario");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (targetId) => {
        if (!window.confirm("¿Seguro que deseas eliminar este beneficiario?")) return;
        
        setIsSubmitting(true);
        try {
            const updatedList = beneficiarios.filter(b => b.id !== targetId);
            await updateDoc(doc(db, "pacientes", patient.id), {
                beneficiarios: updatedList,
                actualizado: serverTimestamp()
            });
            onUpdate && onUpdate({ ...patient, beneficiarios: updatedList });
            toast.success("Beneficiario eliminado");
        } catch (e) {
            console.error(e);
            toast.error("Error al eliminar beneficiario");
        } finally {
            setIsSubmitting(false);
        }
    };

    const filtered = beneficiarios.filter(b => 
        b.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.documento?.includes(searchTerm)
    );

    // Si NO tiene convenio, mostrar un "Modal" o Empty State bloqueante en vez de la tabla
    if (!hasConvenio) {
        return (
            <div className="w-full h-full flex items-center justify-center bg-slate-50 relative p-6 animate-fadeIn">
                <div className="bg-white p-10 md:p-14 rounded-[32px] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] flex flex-col items-center max-w-lg w-full text-center border border-slate-100">
                    <div className="w-24 h-24 rounded-full bg-orange-50 border-[6px] border-white shadow-lg flex items-center justify-center mb-6">
                        <FiAlertCircle className="text-orange-400" size={40} />
                    </div>
                    <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tight mb-2">Sin convenio</h3>
                    <p className="text-slate-500 font-medium mb-8">El paciente no tiene ningún convenio asignado.</p>
                    
                    <div className="flex items-center gap-4 w-full">
                        <button 
                            className="flex-1 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-bold uppercase tracking-wider transition-all active:scale-95"
                            onClick={() => onSwitchTab('datos')}
                        >
                            No, cancelar!
                        </button>
                        <button 
                            className="flex-1 py-3.5 bg-red-400 hover:bg-red-500 text-white shadow-lg shadow-red-400/30 rounded-xl font-bold uppercase tracking-wider transition-all active:scale-95"
                            onClick={handleAssignClick}
                        >
                            Asignar!
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-8 animate-fadeIn flex flex-col min-h-0 h-full">
            <div className="bg-white rounded-[24px] border border-slate-100 shadow-sm overflow-hidden flex flex-col min-h-0 flex-1">
                
                {/* TOOLBAR */}
                <div className="p-4 md:p-6 border-b border-slate-100 flex flex-col md:flex-row gap-4 justify-between items-center bg-slate-50/50 shrink-0">
                    <div className="relative w-full md:w-80">
                        <input 
                            type="text" 
                            className="w-full bg-white border border-slate-200 rounded-xl py-2.5 pl-11 pr-4 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-medium text-slate-700"
                            placeholder="Buscar beneficiario..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    </div>
                    <button 
                        onClick={handleAddSimulated}
                        disabled={isSubmitting}
                        className="px-6 py-2.5 bg-[#8CC63F] hover:bg-[#7bb335] text-white rounded-xl font-black text-[11px] uppercase tracking-widest shadow-lg shadow-[#8CC63F]/20 flex items-center gap-2 transition-all active:scale-95 shrink-0"
                    >
                        <FiPlus size={14} /> Agregar
                    </button>
                </div>

                {/* TABLE */}
                <div className="flex-1 overflow-x-auto overflow-y-auto custom-scrollbar">
                    <table className="w-full text-left border-collapse min-w-[600px]">
                        <thead className="bg-[#f8fafc] sticky top-0 z-10 shadow-[0_1px_0_0_#f1f5f9]">
                            <tr>
                                <th className="py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Nombre</th>
                                <th className="py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Nro documento</th>
                                <th className="py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Dirección</th>
                                <th className="py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Teléfono</th>
                                <th className="py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 text-center w-32">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filtered.length > 0 ? (
                                filtered.map(ben => (
                                    <tr key={ben.id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="py-4 px-6 font-bold text-sm text-slate-800">{ben.nombre}</td>
                                        <td className="py-4 px-6 text-sm text-slate-600">{ben.documento || '---'}</td>
                                        <td className="py-4 px-6 text-sm text-slate-600">{ben.direccion || '---'}</td>
                                        <td className="py-4 px-6 text-sm text-slate-600">{ben.telefono || '---'}</td>
                                        <td className="py-4 px-6 text-center">
                                            <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-colors">
                                                    <FiEdit2 size={14} />
                                                </button>
                                                <button 
                                                    className="w-8 h-8 rounded-lg bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-colors"
                                                    onClick={() => handleDelete(ben.id)}
                                                >
                                                    <FiTrash2 size={14} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="py-16 text-center">
                                        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">No hay información disponible</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

            </div>
        </div>
    );
}
