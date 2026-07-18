import React, { useEffect, useState } from 'react';
import { collection, query, where, orderBy, onSnapshot, doc, deleteDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../../firebase/firebaseConfig';
import { useToast } from '../../../context/ToastContext';
import { useAuth } from '../../../context/AuthContext';
import { FiActivity, FiEdit3, FiTrash2, FiPenTool, FiCheck, FiFileText, FiChevronDown, FiChevronUp } from 'react-icons/fi';

// Extraer procedimientos seleccionados/realizados de plantillaItems
const getSelectedProcedures = (plantillaItems) => {
    if (!plantillaItems) return [];
    return Object.entries(plantillaItems)
        .filter(([, v]) => v?.checked === true)
        .map(([, v]) => ({
            desc: v.desc || v.procedimiento || v.nombre || '',
            dientes: v.dientes || '',
        }))
        .filter(p => p.desc);
};

function EvolutionCard({ evo, onEdit, onDelete, onSign }) {
    const [expanded, setExpanded] = useState(false);
    const isRemission = evo.type === 'remission';
    const procedures = getSelectedProcedures(evo.plantillaItems);
    const isSigned = !!evo.doctorSignature?.signature;
    const text = evo.description || evo.comentario || '';

    const dateStr = evo.date.toLocaleDateString('es-CO', {
        weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric'
    });
    const timeStr = evo.date.toLocaleTimeString('es-CO', {
        hour: '2-digit', minute: '2-digit', hour12: true
    });

    return (
        <div className={`bg-white rounded-2xl border transition-all overflow-hidden group ${
            isRemission
                ? 'border-orange-100 hover:border-orange-200 hover:shadow-md'
                : 'border-slate-100 hover:border-[#8dc63f]/40 hover:shadow-md'
        }`}>
            <div className="p-4 sm:p-5">

                {/* HEADER: Avatar + Doctor + Fecha + Tipo + Acciones */}
                <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2.5">
                        {/* Avatar con inicial */}
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-white text-[11px] font-black ${isRemission ? 'bg-orange-400' : 'bg-[#8dc63f]'}`}>
                            {(evo.profesional || 'D').charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <p className="text-[12px] font-black text-slate-800 leading-tight uppercase tracking-tight">
                                {evo.profesional || 'Profesional'}
                            </p>
                            <p className="text-[10px] font-bold text-slate-400 leading-tight mt-0.5">
                                {dateStr} &nbsp;·&nbsp; {timeStr}
                            </p>
                        </div>
                    </div>

                    {/* Badge tipo + botones */}
                    <div className="flex items-center gap-1.5 shrink-0">
                        <span className={`text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider border ${
                            isRemission
                                ? 'text-orange-600 bg-orange-50 border-orange-100'
                                : 'text-[#5a8a2e] bg-[#f0f9e8] border-[#c5e4a0]'
                        }`}>
                            {isRemission ? 'Remisión' : 'Evolución'}
                        </span>

                        {isSigned ? (
                            <span
                                className="w-7 h-7 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center border border-emerald-100"
                                title={`Firmado por: ${evo.doctorSignature.signature}`}
                            >
                                <FiCheck size={13} strokeWidth={3} />
                            </span>
                        ) : (
                            <button
                                onClick={() => onSign(evo)}
                                className="w-7 h-7 bg-indigo-50 text-indigo-500 hover:bg-indigo-600 hover:text-white rounded-lg flex items-center justify-center transition-all border border-indigo-100"
                                title="Firmar Evolución"
                            >
                                <FiPenTool size={12} />
                            </button>
                        )}
                        <button
                            onClick={() => onEdit(evo)}
                            className="w-7 h-7 bg-blue-500 hover:bg-blue-600 text-white rounded-lg flex items-center justify-center transition-all"
                            title="Editar"
                        >
                            <FiEdit3 size={12} />
                        </button>
                        <button
                            onClick={() => onDelete(evo.id)}
                            className="w-7 h-7 bg-rose-50 hover:bg-rose-500 text-rose-400 hover:text-white rounded-lg flex items-center justify-center transition-all border border-rose-100"
                            title="Eliminar"
                        >
                            <FiTrash2 size={12} />
                        </button>
                    </div>
                </div>

                {/* PLAN + PROCEDIMIENTOS */}
                {(evo.treatment || procedures.length > 0) && (
                    <div className="mb-3 pl-[42px] space-y-1">
                        {/* Nombre del plan */}
                        {evo.treatment && (
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                📋 {evo.treatment}
                            </p>
                        )}
                        {/* Procedimientos realizados */}
                        {procedures.map((p, i) => (
                            <p key={i} className="text-[11px] font-black text-slate-600 leading-tight">
                                {p.dientes
                                    ? <><span className="text-indigo-400 font-mono text-[10px] mr-1">[{p.dientes}]</span>{p.desc}</>
                                    : p.desc
                                }
                            </p>
                        ))}
                    </div>
                )}

                {/* TEXTO DE LA EVOLUCIÓN */}
                {text && (
                    <div className="pl-[42px]">
                        <p className={`text-[11px] font-medium text-slate-500 leading-relaxed whitespace-pre-wrap ${!expanded ? 'line-clamp-3' : ''}`}>
                            {text}
                        </p>
                        {text.length > 180 && (
                            <button
                                onClick={() => setExpanded(!expanded)}
                                className="mt-1 text-[10px] font-black text-[#8dc63f] hover:text-[#6a9e2e] flex items-center gap-1 transition-colors"
                            >
                                {expanded
                                    ? <><FiChevronUp size={11} /> Ver menos</>
                                    : <><FiChevronDown size={11} /> Ver más</>
                                }
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

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
            const data = snapshot.docs.map(d => ({
                id: d.id,
                ...d.data(),
                date: d.data().date?.toDate() || new Date()
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
            await updateDoc(doc(db, "clinical_evolutions", evoObj.id), {
                doctorSignature: {
                    signature: userProfile?.nombreCompleto || userProfile?.nombre || "Doctor",
                    signedAt: new Date().toISOString(),
                    signedBy: userProfile?.uid
                },
                updatedAt: serverTimestamp()
            });
            toast.success("Evolución firmada correctamente");
        } catch (error) {
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

    const filtered = evolutions.filter(evo => {
        if (!searchTerm) return true;
        const q = searchTerm.toLowerCase();
        const procedures = getSelectedProcedures(evo.plantillaItems).map(p => p.desc).join(' ');
        return (
            (evo.description || '').toLowerCase().includes(q) ||
            (evo.profesional || '').toLowerCase().includes(q) ||
            (evo.treatment || '').toLowerCase().includes(q) ||
            procedures.toLowerCase().includes(q)
        );
    });

    return (
        <div className="py-6 px-4 sm:px-8 md:px-12 max-w-5xl mx-auto">
            <div className="flex items-center justify-between mb-5 px-1 border-b border-slate-100 pb-3">
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight flex items-center gap-2">
                    <FiFileText className="text-[#8dc63f]" size={15} />
                    Historial Clínico
                </h3>
                <span className="text-[10px] font-black text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full uppercase tracking-wider">
                    {filtered.length} registro{filtered.length !== 1 ? 's' : ''}
                </span>
            </div>

            <div className="space-y-3">
                {filtered.map((evo) => (
                    <EvolutionCard
                        key={evo.id}
                        evo={evo}
                        onEdit={onEdit}
                        onDelete={handleDelete}
                        onSign={handleSignEvolution}
                    />
                ))}
                {filtered.length === 0 && searchTerm && (
                    <div className="text-center py-10 text-slate-400 text-xs font-bold uppercase tracking-widest">
                        No se encontraron coincidencias.
                    </div>
                )}
            </div>
        </div>
    );
}
