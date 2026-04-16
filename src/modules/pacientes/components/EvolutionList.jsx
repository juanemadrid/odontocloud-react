import React, { useEffect, useState } from 'react';
import { collection, query, where, orderBy, onSnapshot, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../../../firebase/firebaseConfig';
import { useToast } from '../../../context/ToastContext';
import { FiActivity, FiClock, FiEdit3, FiTrash2, FiUser, FiArrowRight } from 'react-icons/fi';

export default function EvolutionList({ patientId, onEdit }) {
    const [evolutions, setEvolutions] = useState([]);
    const [loading, setLoading] = useState(true);
    const toast = useToast();

    useEffect(() => {
        if (!patientId) return;
        
        const q = query(
            collection(db, "clinical_evolutions"),
            where("patientId", "==", patientId),
            orderBy("date", "desc")
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                date: doc.data().date?.toDate() || new Date()
            }));
            setEvolutions(data);
            setLoading(false);
        }, (error) => {
            console.error("Error watching evolutions:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [patientId]);

    const handleDelete = async (id) => {
        if (!window.confirm("¿Seguro que deseas eliminar esta evolución?")) return;
        try {
            await deleteDoc(doc(db, "clinical_evolutions", id));
            toast.success("Evolución eliminada");
        } catch (error) {
            toast.error("Error al eliminar");
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center p-20 opacity-30 animate-pulse">
            <FiActivity size={48} className="text-slate-400 mb-4" />
            <h5 className="text-[14px] font-black uppercase tracking-widest text-slate-500">Cargando Historial...</h5>
        </div>
    );

    if (evolutions.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-20 bg-slate-50 border border-slate-100 rounded-[32px] m-4">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-slate-200 mb-4 shadow-sm">
                    <FiActivity size={32} />
                </div>
                <h3 className="text-sm font-black text-slate-700 uppercase tracking-tight mb-2">Sin Historial de Evolución</h3>
                <p className="text-[11px] font-bold text-slate-400 text-center uppercase tracking-widest leading-relaxed px-10">Este paciente aún no registra notas de evolución clínica en su expediente.</p>
            </div>
        );
    }

    return (
        <div className="relative py-10 px-4 md:px-10 max-w-5xl mx-auto">
            {/* Main Vertical Timeline Line */}
            <div className="absolute left-6 md:left-[5.5rem] top-0 bottom-0 w-1 bg-slate-100 rounded-full" />

            <div className="space-y-12">
                {evolutions.map((evo) => (
                    <div key={evo.id} className="relative flex flex-col md:flex-row gap-6 md:gap-10 group">
                        
                        {/* 1. DATE SECTION (Left) */}
                        <div className="hidden md:flex flex-col items-end w-24 shrink-0 mt-1">
                           <span className="text-[14px] font-black text-slate-800 leading-none mb-1">
                               {evo.date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}
                           </span>
                           <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                               {evo.date.getFullYear()}
                           </span>
                           <div className="flex items-center gap-1 mt-3 bg-slate-50 px-2 py-1 rounded-md text-[10px] font-black text-slate-500 uppercase">
                               <FiClock size={10} /> {evo.date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                           </div>
                        </div>

                        {/* 2. TIMELINE CONNECTOR (Center) */}
                        <div className="absolute left-0 md:left-[4.75rem] top-0 w-12 h-12 flex items-center justify-center z-10">
                            <div className={`w-4 h-4 rounded-full border-4 bg-white transition-all duration-500 group-hover:scale-125
                                ${evo.prognosis === 'Favorable' ? 'border-emerald-500' :
                                  evo.prognosis === 'Reservado' ? 'border-amber-500' : 'border-rose-500'}`} 
                            />
                        </div>

                        {/* 3. CONTENT CARD (Right) */}
                        <div className="flex-1 bg-white rounded-[32px] border border-slate-100 p-6 md:p-8 shadow-sm hover:shadow-xl hover:shadow-slate-100 hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group-hover:border-blue-200">
                            
                            {/* Decorative Top Accent */}
                            <div className={`absolute top-0 left-0 right-0 h-1 
                                ${evo.prognosis === 'Favorable' ? 'bg-emerald-500' :
                                  evo.prognosis === 'Reservado' ? 'bg-amber-500' : 'bg-rose-500'}`} 
                            />

                            <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className={`text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-[0.15em]
                                            ${evo.prognosis === 'Favorable' ? 'bg-emerald-100 text-emerald-700' :
                                              evo.prognosis === 'Reservado' ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'}`}>
                                            {evo.prognosis}
                                        </div>
                                    </div>
                                    <p className="text-[13px] font-bold text-slate-700 leading-relaxed whitespace-pre-wrap">
                                        {evo.description}
                                    </p>
                                </div>
                                <div className="flex gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => onEdit(evo)} className="w-9 h-9 bg-slate-50 text-slate-400 hover:bg-blue-50 hover:text-blue-600 rounded-xl flex items-center justify-center transition-all">
                                        <FiEdit3 size={16} />
                                    </button>
                                    <button onClick={() => handleDelete(evo.id)} className="w-9 h-9 bg-slate-50 text-slate-400 hover:bg-rose-50 hover:text-rose-600 rounded-xl flex items-center justify-center transition-all">
                                        <FiTrash2 size={16} />
                                    </button>
                                </div>
                            </div>

                            {/* Treatment Info Block */}
                            {evo.treatment && (
                                <div className="bg-slate-50/50 rounded-2xl p-6 border border-slate-100/50 flex flex-col md:flex-row gap-4 md:items-center">
                                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-emerald-500 shadow-sm shrink-0">
                                        <FiActivity size={18} />
                                    </div>
                                    <div className="flex-1">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Procedimiento / Tratamiento</span>
                                        <p className="text-[12px] font-black text-slate-800 uppercase tracking-tighter leading-tight flex items-center gap-2">
                                           {evo.treatment}
                                        </p>
                                    </div>
                                    <FiArrowRight className="text-slate-200 hidden md:block" />
                                </div>
                            )}

                            {/* Author Info */}
                            <div className="mt-6 flex items-center gap-2 grayscale group-hover:grayscale-0 transition-all">
                                <div className="w-6 h-6 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400">
                                    <FiUser size={12} />
                                </div>
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                    Registrado por: <span className="text-slate-600 underline decoration-slate-200 decoration-4">{evo.profesional || '---'}</span>
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            
            {/* Bottom Accent */}
            <div className="mt-20 flex justify-center opacity-10">
                 <div className="w-2 h-2 bg-slate-300 rounded-full mx-1"></div>
                 <div className="w-2 h-2 bg-slate-300 rounded-full mx-1"></div>
                 <div className="w-2 h-2 bg-slate-300 rounded-full mx-1"></div>
            </div>
        </div>
    );
}
