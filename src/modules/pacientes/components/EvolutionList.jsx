import React, { useEffect, useState } from 'react';
import { collection, query, where, orderBy, onSnapshot, doc, deleteDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../../firebase/firebaseConfig';
import { useToast } from '../../../context/ToastContext';
import { useAuth } from '../../../context/AuthContext';
import { FiActivity, FiClock, FiEdit3, FiTrash2, FiUser, FiArrowRight, FiPenTool, FiCheck } from 'react-icons/fi';

export default function EvolutionList({ patientId, onEdit, searchTerm }) {
    const { userProfile } = useAuth();
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

    const handleSignEvolution = async (evoObj) => {
        if (!window.confirm("¿Desea firmar digitalmente esta evolución?")) return;
        try {
            const signatureData = {
                signature: userProfile?.nombreCompleto || userProfile?.nombre || "Doctor",
                signedAt: new Date().toISOString(),
                signedBy: userProfile?.uid
            };
            await updateDoc(doc(db, "clinical_evolutions", evoObj.id), {
                doctorSignature: signatureData,
                updatedAt: serverTimestamp()
            });
            toast.success("Evolución firmada correctamente");
        } catch (error) {
            console.error("Error signing evolution:", error);
            toast.error("Error al firmar la evolución");
        }
    };

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

             <div className="space-y-4">
                 {filtered.map((evo) => {
                     const isRemission = evo.type === 'remission';
                     
                     return (
                         <div key={evo.id} className="bg-white rounded-2xl border border-slate-100 p-4 sm:p-6 flex flex-col gap-3 relative group hover:border-blue-200 hover:shadow-lg hover:shadow-slate-100 transition-all">
                              
                              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
                                  <div className="flex-1 min-w-0">
                                      {/* Título: Doctor */}
                                      <h4 className="text-[13px] font-black text-slate-800 mb-1 flex items-center gap-2">
                                          <FiUser size={14} className="text-blue-500 shrink-0" />
                                          <span className="truncate">Profesional: {evo.profesional || 'No especificado'}</span>
                                      </h4>
                                      
                                      {/* Fecha e Información secundaria */}
                                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 flex flex-wrap items-center gap-2">
                                          <span>{evo.date.toLocaleDateString('es-ES', { month: 'short', day: 'numeric', year: 'numeric' })} - {evo.date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</span>
                                          {evo.treatment && (
                                              <>
                                                 <span className="text-slate-300">|</span>
                                                 <span className="text-emerald-500 truncate max-w-[180px] sm:max-w-[250px]">{evo.treatment}</span>
                                              </>
                                          )}
                                      </div>

                                      {/* Descripción */}
                                      <p className="text-[12px] font-bold text-slate-500 leading-relaxed whitespace-pre-wrap">
                                          {evo.description || evo.comentario}
                                      </p>
                                  </div>

                                  {/* Acciones e Indicadores */}
                                  <div className="flex items-center gap-2 shrink-0 sm:ml-4">
                                      {/* Badge tipo */}
                                      {isRemission ? (
                                          <span className="text-[10px] font-black text-orange-600 bg-orange-50 px-2.5 py-1 rounded-md uppercase tracking-wider whitespace-nowrap">
                                              Remisión
                                          </span>
                                      ) : (
                                          <span className="text-[10px] font-black text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md uppercase tracking-wider whitespace-nowrap">
                                              Evolución
                                          </span>
                                      )}

                                      {/* Botones */}
                                      <div className="flex gap-1">
                                          {evo.doctorSignature?.signature ? (
                                              <span className="w-8 h-8 bg-emerald-50 text-emerald-600 rounded-md flex items-center justify-center border border-emerald-100 shadow-sm" title={`Firmado por: ${evo.doctorSignature.signature}`}>
                                                  <FiCheck size={14} />
                                              </span>
                                          ) : (
                                              <button 
                                                  onClick={() => handleSignEvolution(evo)} 
                                                  className="w-8 h-8 bg-indigo-50 text-indigo-600 hover:bg-[#4f46e5] hover:text-white rounded-md flex items-center justify-center transition-all border border-indigo-200 shadow-sm"
                                                  title="Firmar Evolución"
                                              >
                                                  <FiPenTool size={14} />
                                              </button>
                                          )}
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
