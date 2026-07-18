import React, { useEffect, useState } from 'react';
import { collection, query, where, orderBy, onSnapshot, doc, deleteDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../../firebase/firebaseConfig';
import { useToast } from '../../../context/ToastContext';
import { useAuth } from '../../../context/AuthContext';
import { FiActivity, FiEdit3, FiTrash2, FiUser, FiPenTool, FiCheck, FiFileText, FiCalendar, FiClock, FiChevronDown, FiChevronUp } from 'react-icons/fi';

// Helper: extraer procedimientos seleccionados de plantillaItems
const getSelectedProcedures = (plantillaItems) => {
    if (!plantillaItems) return [];
    return Object.entries(plantillaItems)
        .filter(([, v]) => v?.checked === true)
        .map(([, v]) => ({
            desc: v.desc || v.procedimiento || v.nombre || '',
            dientes: v.dientes || '',
            realizado: v.realizado === true,
            observation: v.observation || ''
        }))
        .filter(p => p.desc);
};

// Helper: formatear diagnóstico CIE-10
const formatDx = (dx) => {
    if (!dx) return null;
    if (typeof dx === 'string') return dx;
    if (dx.code && dx.name) return `${dx.code} - ${dx.name}`;
    return dx.name || dx.code || null;
};

// Componente de tarjeta individual (expandible)
function EvolutionCard({ evo, onEdit, onDelete, onSign, userProfile }) {
    const [expanded, setExpanded] = useState(false);
    const isRemission = evo.type === 'remission';
    const procedures = getSelectedProcedures(evo.plantillaItems);
    const dxPrincipal = formatDx(evo.dxPrincipal);
    const dxRelacionado = formatDx(evo.dxRelacionado);
    const hasMeds = evo.medicamentos && evo.medicamentos.length > 0;
    const hasEsterilizacion = evo.esterilizaciones && evo.esterilizaciones.length > 0;
    const isSigned = !!evo.doctorSignature?.signature;

    const dateStr = evo.date.toLocaleDateString('es-CO', { weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric' });
    const timeStr = evo.date.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', hour12: true });

    return (
        <div className={`bg-white rounded-2xl border transition-all duration-200 overflow-hidden group ${
            isRemission 
                ? 'border-orange-100 hover:border-orange-200 hover:shadow-md hover:shadow-orange-50' 
                : 'border-slate-100 hover:border-blue-200 hover:shadow-md hover:shadow-blue-50'
        }`}>
            {/* Barra superior de color */}
            <div className={`h-1 w-full ${isRemission ? 'bg-orange-400' : isSigned ? 'bg-emerald-500' : 'bg-[#8dc63f]'}`} />

            <div className="p-4 sm:p-5">
                {/* HEADER: Doctor + Fecha + Badges + Acciones */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3">
                    <div className="flex-1 min-w-0">
                        {/* Doctor */}
                        <div className="flex items-center gap-2 mb-1.5">
                            <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-white text-[10px] font-black ${isRemission ? 'bg-orange-400' : 'bg-[#8dc63f]'}`}>
                                {(evo.profesional || 'D').charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <p className="text-[12px] font-black text-slate-800 leading-tight">
                                    {evo.profesional || 'Profesional no especificado'}
                                </p>
                                {evo.personalAtiende && evo.personalAtiende !== evo.profesional && (
                                    <p className="text-[10px] font-bold text-slate-400 leading-tight">
                                        Atiende: {evo.personalAtiende}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Fecha + Hora */}
                        <div className="flex flex-wrap items-center gap-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                            <span className="flex items-center gap-1">
                                <FiCalendar size={10} />
                                {dateStr}
                            </span>
                            <span className="flex items-center gap-1">
                                <FiClock size={10} />
                                {timeStr}
                                {evo.horaFin && evo.horaFin !== evo.horaInicio && ` — ${evo.horaFin}`}
                            </span>
                        </div>
                    </div>

                    {/* Badges + Botones */}
                    <div className="flex items-center gap-2 shrink-0">
                        {/* Tipo */}
                        <span className={`text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider whitespace-nowrap border ${
                            isRemission
                                ? 'text-orange-600 bg-orange-50 border-orange-100'
                                : 'text-[#5a8a2e] bg-[#f0f9e8] border-[#c5e4a0]'
                        }`}>
                            {isRemission ? 'Remisión' : 'Evolución'}
                        </span>

                        {/* Firma */}
                        {isSigned ? (
                            <span
                                className="w-8 h-8 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center border border-emerald-100 shadow-sm"
                                title={`Firmado por: ${evo.doctorSignature.signature}`}
                            >
                                <FiCheck size={14} strokeWidth={3} />
                            </span>
                        ) : (
                            <button
                                onClick={() => onSign(evo)}
                                className="w-8 h-8 bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white rounded-lg flex items-center justify-center transition-all border border-indigo-100 shadow-sm"
                                title="Firmar Evolución"
                            >
                                <FiPenTool size={13} />
                            </button>
                        )}
                        <button
                            onClick={() => onEdit(evo)}
                            className="w-8 h-8 bg-blue-500 hover:bg-blue-600 text-white rounded-lg flex items-center justify-center transition-all shadow-sm"
                            title="Editar"
                        >
                            <FiEdit3 size={13} />
                        </button>
                        <button
                            onClick={() => onDelete(evo.id)}
                            className="w-8 h-8 bg-rose-50 hover:bg-rose-500 text-rose-400 hover:text-white rounded-lg flex items-center justify-center transition-all border border-rose-100 shadow-sm"
                            title="Eliminar"
                        >
                            <FiTrash2 size={13} />
                        </button>
                    </div>
                </div>

                {/* PLAN DE TRATAMIENTO */}
                {evo.treatment && (
                    <div className="flex items-center gap-2 mb-3 px-3 py-2 bg-slate-50 rounded-xl border border-slate-100">
                        <FiActivity size={12} className="text-[#8dc63f] shrink-0" />
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider shrink-0">Plan:</span>
                        <span className="text-[11px] font-black text-slate-700 truncate">{evo.treatment}</span>
                    </div>
                )}

                {/* PROCEDIMIENTOS REALIZADOS */}
                {procedures.length > 0 && (
                    <div className="mb-3 border border-slate-100 rounded-xl overflow-hidden">
                        <div className="bg-slate-50 px-3 py-1.5 flex items-center gap-2 border-b border-slate-100">
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                                Procedimientos ({procedures.length})
                            </span>
                        </div>
                        <div className="divide-y divide-slate-50">
                            {procedures.map((p, i) => (
                                <div key={i} className="px-3 py-2 flex items-start gap-2">
                                    {/* Indicador realizado */}
                                    <div className={`w-2 h-2 rounded-full mt-1 shrink-0 ${p.realizado ? 'bg-emerald-500' : 'bg-amber-400'}`}
                                        title={p.realizado ? 'Finalizado' : 'En proceso'} />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[11px] font-black text-slate-700 leading-tight">
                                            {p.dientes && (
                                                <span className="text-indigo-500 font-mono mr-1.5 text-[10px]">
                                                    [{p.dientes}]
                                                </span>
                                            )}
                                            {p.desc}
                                        </p>
                                        {p.observation && (
                                            <p className="text-[10px] font-medium text-slate-400 mt-0.5 truncate">{p.observation}</p>
                                        )}
                                    </div>
                                    {p.realizado && (
                                        <span className="text-[8px] font-black text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full border border-emerald-100 whitespace-nowrap shrink-0">
                                            ✓ Finalizado
                                        </span>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* DIAGNÓSTICO CIE-10 */}
                {dxPrincipal && (
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider shrink-0">Dx:</span>
                        <span className="text-[10px] font-black text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">
                            {dxPrincipal}
                        </span>
                        {dxRelacionado && (
                            <span className="text-[10px] font-bold text-slate-600 bg-slate-50 px-2 py-0.5 rounded-full border border-slate-100">
                                {dxRelacionado}
                            </span>
                        )}
                    </div>
                )}

                {/* DESCRIPCIÓN / COMENTARIO */}
                {(evo.description || evo.comentario) && (
                    <div className="mb-3">
                        <p className={`text-[11px] font-medium text-slate-500 leading-relaxed whitespace-pre-wrap ${!expanded ? 'line-clamp-3' : ''}`}>
                            {evo.description || evo.comentario}
                        </p>
                        {(evo.description || evo.comentario || '').length > 200 && (
                            <button
                                onClick={() => setExpanded(!expanded)}
                                className="mt-1 text-[10px] font-black text-blue-500 hover:text-blue-700 flex items-center gap-1 transition-colors"
                            >
                                {expanded ? <><FiChevronUp size={12} /> Ver menos</> : <><FiChevronDown size={12} /> Ver más</>}
                            </button>
                        )}
                    </div>
                )}

                {/* PILLS INFO SECUNDARIA */}
                <div className="flex flex-wrap gap-1.5">
                    {evo.ambito && (
                        <span className="text-[9px] font-black text-slate-500 bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-full uppercase tracking-wider">
                            {evo.ambito}
                        </span>
                    )}
                    {evo.finalidad && (
                        <span className="text-[9px] font-black text-slate-500 bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-full uppercase tracking-wider">
                            {evo.finalidad}
                        </span>
                    )}
                    {evo.modalidadAtencion && (
                        <span className="text-[9px] font-black text-slate-500 bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-full uppercase tracking-wider">
                            {evo.modalidadAtencion}
                        </span>
                    )}
                    {hasMeds && (
                        <span className="text-[9px] font-black text-blue-600 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-full uppercase tracking-wider">
                            💊 Medicamentos ({evo.medicamentos.length})
                        </span>
                    )}
                    {hasEsterilizacion && (
                        <span className="text-[9px] font-black text-teal-600 bg-teal-50 border border-teal-100 px-2 py-0.5 rounded-full uppercase tracking-wider">
                            🔬 Esterilización ({evo.esterilizaciones.length})
                        </span>
                    )}
                    {isSigned && (
                        <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full uppercase tracking-wider">
                            ✓ Firmado · {evo.doctorSignature.signature}
                        </span>
                    )}
                </div>
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

    // Filtrar por término de búsqueda
    const filtered = evolutions.filter(evo => {
        if (!searchTerm) return true;
        const q = searchTerm.toLowerCase();
        const dxStr = formatDx(evo.dxPrincipal) || '';
        const procedures = getSelectedProcedures(evo.plantillaItems).map(p => p.desc).join(' ');
        return (
            (evo.description || '').toLowerCase().includes(q) ||
            (evo.profesional || '').toLowerCase().includes(q) ||
            (evo.treatment || '').toLowerCase().includes(q) ||
            dxStr.toLowerCase().includes(q) ||
            procedures.toLowerCase().includes(q)
        );
    });

    return (
        <div className="py-6 px-4 sm:px-8 md:px-12 max-w-5xl mx-auto">
            <div className="flex items-center justify-between mb-6 px-1 border-b border-slate-100 pb-3">
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight flex items-center gap-2">
                    <FiFileText className="text-[#8dc63f]" size={16} />
                    Historial Clínico
                </h3>
                <span className="text-[10px] font-black text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full uppercase tracking-wider">
                    {filtered.length} registro{filtered.length !== 1 ? 's' : ''}
                </span>
            </div>

            <div className="space-y-4">
                {filtered.map((evo) => (
                    <EvolutionCard
                        key={evo.id}
                        evo={evo}
                        onEdit={onEdit}
                        onDelete={handleDelete}
                        onSign={handleSignEvolution}
                        userProfile={userProfile}
                    />
                ))}
                {filtered.length === 0 && searchTerm && (
                    <div className="text-center py-10 text-slate-400 text-xs font-bold uppercase tracking-widest">
                        No se encontraron coincidencias para la búsqueda.
                    </div>
                )}
            </div>
        </div>
    );
}
