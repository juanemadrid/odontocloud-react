import React, { useEffect, useState } from 'react';
import { collection, query, where, orderBy, onSnapshot, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../../../firebase/firebaseConfig';
import { useToast } from '../../../context/ToastContext';
import { FiActivity, FiClock, FiEdit3, FiTrash2, FiUser, FiArrowRight } from 'react-icons/fi';

export default function EvolutionList({ patientId, onEdit, searchTerm }) {
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
            <div className="flex flex-col items-center justify-center p-20 bg-slate-50 border border-slate-100 rounded-[32px] mx-8 my-4">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-slate-200 mb-4 shadow-sm">
                    <FiActivity size={32} />
                </div>
                <h3 className="text-sm font-black text-slate-700 uppercase tracking-tight mb-2">Sin Historial</h3>
                <p className="text-[11px] font-bold text-slate-400 text-center uppercase tracking-widest leading-relaxed">No hay registros para este paciente.</p>
            </div>
        );
    }

    // Filter by search term
    const filtered = evolutions.filter(evo => {
        if (!searchTerm) return true;
        const q = searchTerm.toLowerCase();
        return (evo.description || '').toLowerCase().includes(q) || 
               (evo.profesional || '').toLowerCase().includes(q) ||
               (evo.treatment || '').toLowerCase().includes(q);
    });

    return (
        <div className="py-8 px-6 md:px-12 max-w-5xl mx-auto">
             <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight mb-6 px-2 border-b border-slate-100 pb-2">
                 Historial
             </h3>

             <div className="space-y-6">
                 {filtered.map((evo) => {
                     const isRemission = evo.type === 'remission';
                     
                     return (
                         <div key={evo.id} className="bg-white rounded-2xl border border-slate-100 p-6 flex flex-col gap-4 relative group hover:border-blue-200 hover:shadow-lg hover:shadow-slate-100 transition-all">
                              
                              <div className="flex justify-between items-start">
                                  <div className="flex-1">
                                      {/* Título: Paciente (Doctor) */}
                                      <h4 className="text-[13px] font-black text-slate-800 mb-1 flex items-center gap-2">
                                          <FiUser size={14} className="text-blue-500" />
                                          <span>Profesional: {evo.profesional || 'No especificado'}</span>
                                      </h4>
                                      
                                      {/* Fecha e Información secundaria */}
                                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                          {evo.date.toLocaleDateString('es-ES', { month: 'short', day: 'numeric', year: 'numeric' })} - {evo.date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                                          {evo.treatment && (
                                              <>
                                                 <span className="text-slate-300">|</span>
                                                 <span className="text-emerald-500 truncate max-w-[200px]">{evo.treatment}</span>
                                              </>
                                          )}
                                      </div>

                                      {/* Descripción */}
                                      <p className="text-[12px] font-bold text-slate-500 leading-relaxed whitespace-pre-wrap">
                                          {evo.description || evo.comentario}
                                      </p>
                                  </div>

                                  {/* Acciones e Indicadores */}
                                  <div className="flex items-center gap-3 shrink-0 ml-4">
                                      {/* Badges Evolución o Remisión */}
                                      {isRemission ? (
                                          <span className="text-[11px] font-black text-orange-600 bg-orange-50 px-3 py-1 rounded-md uppercase tracking-wider">
                                              Remisión
                                          </span>
                                      ) : (
                                          <span className="text-[11px] font-black text-slate-600 bg-slate-100 px-3 py-1 rounded-md uppercase tracking-wider">
                                              Evolución
                                          </span>
                                      )}

                                      {/* Botones Flotantes (Azules como en la imagen) */}
                                      <div className="flex gap-1">
                                          <button 
                                              onClick={() => onEdit(evo)} 
                                              className="w-8 h-8 bg-[#379deb] hover:bg-blue-600 text-white rounded-md flex items-center justify-center transition-all shadow-sm"
                                              title="Editar"
                                          >
                                              <FiEdit3 size={14} />
                                          </button>
                                          <button 
                                              onClick={() => handleDelete(evo.id)} 
                                              className="w-8 h-8 bg-rose-500 hover:bg-rose-600 text-white rounded-md flex items-center justify-center transition-all shadow-sm"
                                              title="Eliminar"
                                          >
                                              <FiTrash2 size={14} />
                                          </button>
                                      </div>
                                  </div>
                              </div>
                         </div>
                     );
                 })}
                 {filtered.length === 0 && searchTerms && (
                     <div className="text-center py-10 text-slate-400 text-xs font-bold uppercase tracking-widest">
                         No se encontraron coincidencias para la búsqueda.
                     </div>
                 )}
             </div>
        </div>
    );
}
