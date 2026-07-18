import React, { useEffect, useState } from 'react';
import { collection, query, where, orderBy, onSnapshot, doc, getDoc, deleteDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../../firebase/firebaseConfig';
import { useToast } from '../../../context/ToastContext';
import { useAuth } from '../../../context/AuthContext';
import { FiActivity, FiEdit3, FiTrash2, FiPenTool, FiCheck, FiFileText } from 'react-icons/fi';

// Extraer procedimientos seleccionados, con fallback a planItemsLookup para registros antiguos
const getSelectedProcedures = (plantillaItems, planItemsLookup = {}) => {
    if (!plantillaItems) return [];
    return Object.entries(plantillaItems)
        .filter(([, v]) => v?.checked === true)
        .map(([itemId, v]) => {
            const desc = v.desc || v.procedimiento || v.nombre
                || planItemsLookup[itemId]?.desc  // fallback para registros antiguos
                || '';
            const dientes = v.dientes || planItemsLookup[itemId]?.dientes || '';
            return { desc, dientes };
        })
        .filter(p => p.desc);
};

function EvolutionCard({ evo, onEdit, onDelete, onSign, patientName, planItemsLookup }) {
    const isRemission = evo.type === 'remission';
    const procedures = getSelectedProcedures(evo.plantillaItems, planItemsLookup);
    const isSigned = !!evo.doctorSignature?.signature;
    const text = evo.description || evo.comentario || '';

    const dateStr = evo.date.toLocaleDateString('es-CO', {
        weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric'
    });
    const timeStr = evo.date.toLocaleTimeString('es-CO', {
        hour: '2-digit', minute: '2-digit', hour12: true
    });

    // Construir linea "plan · procedimiento1 · procedimiento2"
    const procedureNames = procedures.map(p =>
        p.dientes ? `[${p.dientes}] ${p.desc}` : p.desc
    );
    const infoLine = [evo.treatment, ...procedureNames].filter(Boolean).join(' · ');

    return (
        <div className="bg-white rounded-xl border border-slate-100 hover:border-slate-200 hover:shadow-sm transition-all p-4">

            {/* FILA 1: Paciente (Doctor) + badge + acciones */}
            <div className="flex items-start justify-between gap-3 mb-1.5">
                <p className="text-[12px] font-black text-slate-800 uppercase tracking-tight leading-tight">
                    {patientName}
                    {evo.profesional && (
                        <span className="font-semibold text-slate-500 normal-case tracking-normal">
                            {' '}({evo.profesional})
                        </span>
                    )}
                </p>

                <div className="flex items-center gap-1.5 shrink-0">
                    <span className={`text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider border whitespace-nowrap ${
                        isRemission
                            ? 'text-orange-600 bg-orange-50 border-orange-100'
                            : 'text-[#5a8a2e] bg-[#f0f9e8] border-[#c5e4a0]'
                    }`}>
                        {isRemission ? 'Remisión' : 'Evolución'}
                    </span>

                    {isSigned ? (
                        <span
                            className="w-7 h-7 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center border border-emerald-100"
                            title={`Firmado: ${evo.doctorSignature.signature}`}
                        >
                            <FiCheck size={13} strokeWidth={3} />
                        </span>
                    ) : (
                        <button
                            onClick={() => onSign(evo)}
                            className="w-7 h-7 bg-slate-50 text-slate-400 hover:bg-indigo-600 hover:text-white rounded-lg flex items-center justify-center transition-all border border-slate-100"
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

            {/* FILA 2: Fecha y hora */}
            <p className="text-[10px] font-bold text-slate-400 mb-2">
                {dateStr} — {timeStr}
            </p>

            {/* FILA 3: Texto de la evolución */}
            {text && (
                <p className="text-[11px] text-slate-600 font-medium leading-relaxed mb-2 line-clamp-3">
                    {text}
                </p>
            )}

            {/* FILA 4: Plan · Procedimientos */}
            {infoLine && (
                <p className="text-[11px] font-bold text-slate-500">
                    {infoLine}
                </p>
            )}
        </div>
    );
}

export default function EvolutionList({ patientId, patientName, onEdit, searchTerm }) {
    const { userProfile } = useAuth();
    const [evolutions, setEvolutions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [planItemsLookup, setPlanItemsLookup] = useState({}); // planId -> { itemId -> {desc, dientes} }
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

    // Cargar planes para resoler nombres de procedimientos en registros antiguos
    useEffect(() => {
        if (evolutions.length === 0) return;

        const planIds = [...new Set(
            evolutions
                .filter(e => e.planId)
                .map(e => e.planId)
        )];
        if (planIds.length === 0) return;

        const fetchPlans = async () => {
            const lookup = {};
            await Promise.all(planIds.map(async (planId) => {
                try {
                    const planSnap = await getDoc(doc(db, "planes", planId));
                    if (planSnap.exists()) {
                        const planData = planSnap.data();
                        lookup[planId] = {};
                        (planData.items || []).forEach(item => {
                            lookup[planId][item.id] = {
                                desc: item.desc || item.procedimiento || item.nombre || '',
                                dientes: item.dientes || ''
                            };
                        });
                    }
                } catch (e) {
                    // Plan no encontrado o sin permisos, ignorar
                }
            }));
            setPlanItemsLookup(lookup);
        };
        fetchPlans();
    }, [evolutions]);

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
        const lookup = evo.planId ? (planItemsLookup[evo.planId] || {}) : {};
        const procedures = getSelectedProcedures(evo.plantillaItems, lookup).map(p => p.desc).join(' ');
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
                    Historial
                </h3>
                <span className="text-[10px] font-black text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full uppercase tracking-wider">
                    {filtered.length} registro{filtered.length !== 1 ? 's' : ''}
                </span>
            </div>

            <div className="space-y-3">
                {filtered.map((evo) => {
                    const lookup = evo.planId ? (planItemsLookup[evo.planId] || {}) : {};
                    return (
                        <EvolutionCard
                            key={evo.id}
                            evo={evo}
                            patientName={patientName || evo.patientName || 'Paciente'}
                            planItemsLookup={lookup}
                            onEdit={onEdit}
                            onDelete={handleDelete}
                            onSign={handleSignEvolution}
                        />
                    );
                })}
                {filtered.length === 0 && searchTerm && (
                    <div className="text-center py-10 text-slate-400 text-xs font-bold uppercase tracking-widest">
                        No se encontraron coincidencias.
                    </div>
                )}
            </div>
        </div>
    );
}
