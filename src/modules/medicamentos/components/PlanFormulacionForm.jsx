import React, { useState, useEffect } from "react";
import { FiArrowLeft, FiSave, FiAlertCircle, FiPlus, FiTrash2 } from "react-icons/fi";
import { collection, doc, getDoc, getDocs, query, where, addDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../../firebase/firebaseConfig";
import { useAuth } from "../../../context/AuthContext";
import { toast } from "sonner";

const VIAS_ADMINISTRACION = [
    "Oral", "Tópica", "Infiltración Local", "Sublingual", "Intramuscular", "Intravenosa", "Otros"
];

export default function PlanFormulacionForm({ id, onCancel, onSuccess }) {
    const { userProfile } = useAuth();
    const inquilino = userProfile?.inquilino || "";

    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    // Form State
    const [nombre, setNombre] = useState("");
    const [descripcion, setDescripcion] = useState("");
    const [planMeds, setPlanMeds] = useState([]);

    // Catalog data
    const [medicamentosList, setMedicamentosList] = useState([]);

    // Load available medicines
    useEffect(() => {
        if (!inquilino) return;
        const loadCatalog = async () => {
            try {
                const q = query(collection(db, "medicamentos"), where("inquilino", "==", inquilino));
                const snap = await getDocs(q);
                setMedicamentosList(snap.docs.map(d => ({
                    id: d.id,
                    principio_activo: d.data().principio_activo || d.data().nombre || ""
                })).sort((a, b) => a.principio_activo.localeCompare(b.principio_activo)));
            } catch (err) {
                console.error("Error loading medicines catalog:", err);
            }
        };
        loadCatalog();
    }, [inquilino]);

    // Load plan details if editing
    useEffect(() => {
        if (!id) return;
        const loadPlan = async () => {
            setLoading(true);
            try {
                const snap = await getDoc(doc(db, "planes_formulacion", id));
                if (snap.exists()) {
                    const data = snap.data();
                    setNombre(data.nombre || "");
                    setDescripcion(data.descripcion || "");
                    setPlanMeds(data.medicamentos || []);
                }
            } catch (err) {
                console.error("Error loading plan:", err);
                setError("Error al cargar la información del plan de formulación");
            } finally {
                setLoading(false);
            }
        };
        loadPlan();
    }, [id]);

    const handleAddRow = () => {
        setPlanMeds(prev => [
            ...prev,
            { principio_activo: "", dosis: "", via: "Oral", frecuencia: "", duracion: "" }
        ]);
    };

    const handleRemoveRow = (idx) => {
        setPlanMeds(prev => prev.filter((_, i) => i !== idx));
    };

    const handleRowChange = (idx, field, val) => {
        setPlanMeds(prev => prev.map((row, i) => {
            if (i !== idx) return row;
            return { ...row, [field]: val };
        }));
    };

    const handleSave = async (e) => {
        if (e) e.preventDefault();
        if (!nombre.trim()) {
            setError("El Nombre del Plan es obligatorio.");
            return;
        }

        if (planMeds.length === 0) {
            setError("Debe agregar al menos un medicamento al plan de formulación.");
            return;
        }

        // Validate all rows have a medicine principle selected
        if (planMeds.some(m => !m.principio_activo.trim())) {
            setError("Todos los medicamentos agregados deben tener seleccionado un principio activo.");
            return;
        }

        setSaving(true);
        setError("");

        try {
            const planData = {
                nombre: nombre.trim(),
                descripcion: descripcion.trim(),
                medicamentos: planMeds.map(m => ({
                    principio_activo: m.principio_activo.trim(),
                    medicamento: m.principio_activo.trim(), // Save both
                    dosis: m.dosis.trim(),
                    via: m.via,
                    frecuencia: m.frecuencia.trim(),
                    duracion: m.duracion.trim()
                })),
                inquilino,
                updatedAt: serverTimestamp()
            };

            if (id) {
                await updateDoc(doc(db, "planes_formulacion", id), planData);
                toast.success("Plan de formulación actualizado correctamente");
            } else {
                await addDoc(collection(db, "planes_formulacion"), {
                    ...planData,
                    createdAt: serverTimestamp()
                });
                toast.success("Plan de formulación creado correctamente");
            }
            if (onSuccess) onSuccess();
        } catch (err) {
            console.error("Error saving formulation plan:", err);
            setError("Error al guardar el plan de formulación en la base de datos.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                <span className="text-xs font-black text-slate-400 uppercase tracking-widest mt-4">Cargando datos...</span>
            </div>
        );
    }

    return (
        <form onSubmit={handleSave} className="space-y-6 animate-in fade-in duration-500 max-w-5xl">
            {/* Header / Top Action Bar */}
            <div className="flex items-center justify-between bg-white p-6 rounded-[28px] border border-slate-100 shadow-sm">
                <div className="flex items-center gap-4">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="w-10 h-10 rounded-xl border border-slate-200 bg-white flex items-center justify-center text-slate-500 hover:text-blue-600 hover:border-blue-200 transition-all active:scale-95 shadow-sm"
                        title="Volver"
                    >
                        <FiArrowLeft size={18} />
                    </button>
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            {id ? "Modificar" : "Nuevo"} registro
                        </span>
                        <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight mt-0.5">
                            {id ? "Editar Plan de Formulación" : "Nuevo Plan de Formulación"}
                        </h2>
                    </div>
                </div>
                <button
                    type="submit"
                    disabled={saving}
                    className="h-10 px-8 flex items-center justify-center bg-[#8cc33f] text-white rounded-full text-xs font-black uppercase tracking-widest hover:bg-[#7db02b] shadow-lg shadow-[#8cc33f]/20 transition-all active:scale-95"
                >
                    <FiSave className="mr-2" size={14} />
                    {saving ? "Guardando..." : "Guardar"}
                </button>
            </div>

            {error && (
                <div className="bg-rose-50 border border-rose-100 p-6 rounded-[24px] flex items-center gap-4 animate-in shake">
                    <div className="w-12 h-12 bg-rose-500 text-white rounded-full flex items-center justify-center text-xl shadow-lg shadow-rose-500/20 shrink-0">
                        <FiAlertCircle />
                    </div>
                    <div>
                        <h4 className="text-rose-800 font-black uppercase text-sm">Error de Validación</h4>
                        <p className="text-rose-600 text-xs font-medium uppercase tracking-wide">{error}</p>
                    </div>
                </div>
            )}

            {/* Input Card: Datos Generales */}
            <div className="bg-white rounded-[28px] border border-slate-100 shadow-sm overflow-hidden">
                <div className="px-6 py-4 bg-slate-50/50 border-b border-slate-100">
                    <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">Información básica del plan</h3>
                </div>
                <div className="p-8 space-y-6">
                    <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Nombre del plan *</label>
                        <input
                            type="text"
                            value={nombre}
                            onChange={(e) => setNombre(e.target.value)}
                            placeholder="Ej: Plan Pos-Operatorio de Endodoncia"
                            className="w-full max-w-lg h-11 px-4 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 transition-all"
                            required
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Descripción</label>
                        <input
                            type="text"
                            value={descripcion}
                            onChange={(e) => setDescripcion(e.target.value)}
                            placeholder="Descripción breve del propósito de esta receta predefinida"
                            className="w-full max-w-2xl h-11 px-4 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 transition-all"
                        />
                    </div>
                </div>
            </div>

            {/* Input Card: Medicamentos del Plan */}
            <div className="bg-white rounded-[28px] border border-slate-100 shadow-sm overflow-hidden">
                <div className="px-6 py-4 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between">
                    <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">Medicamentos en este plan</h3>
                    <button
                        type="button"
                        onClick={handleAddRow}
                        className="px-4 py-2 flex items-center gap-1 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-wider hover:bg-blue-700 transition-all shadow-sm"
                    >
                        <FiPlus size={12} />
                        Agregar Medicamento
                    </button>
                </div>
                <div className="p-6">
                    {planMeds.length === 0 ? (
                        <div className="text-center py-10 text-slate-400 italic text-sm">
                            Haga clic en "Agregar Medicamento" para empezar a confeccionar su plan de formulación.
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                        <th className="py-3 px-3">Medicamento / Principio Activo *</th>
                                        <th className="py-3 px-3 w-48">Dosis * (ej: 500mg)</th>
                                        <th className="py-3 px-3 w-48">Vía de administración</th>
                                        <th className="py-3 px-3 w-48">Frecuencia * (ej: c/8h)</th>
                                        <th className="py-3 px-3 w-48">Duración * (ej: 3 días)</th>
                                        <th className="py-3 px-3 text-center w-16">Acción</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {planMeds.map((row, idx) => (
                                        <tr key={idx} className="hover:bg-slate-50/10">
                                            {/* Medicamento Select */}
                                            <td className="py-3 px-2">
                                                <select
                                                    value={row.principio_activo}
                                                    onChange={(e) => handleRowChange(idx, "principio_activo", e.target.value)}
                                                    className="w-full h-10 px-3 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 outline-none focus:border-blue-500 transition-all cursor-pointer"
                                                >
                                                    <option value="">Seleccione medicamento...</option>
                                                    {medicamentosList.map(med => (
                                                        <option key={med.id} value={med.principio_activo}>
                                                            {med.principio_activo.toUpperCase()}
                                                        </option>
                                                    ))}
                                                </select>
                                            </td>

                                            {/* Dosis */}
                                            <td className="py-3 px-2">
                                                <input
                                                    type="text"
                                                    value={row.dosis}
                                                    onChange={(e) => handleRowChange(idx, "dosis", e.target.value)}
                                                    placeholder="500 mg, 1 comp"
                                                    className="w-full h-10 px-3 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 outline-none focus:border-blue-500 transition-all"
                                                />
                                            </td>

                                            {/* Vía */}
                                            <td className="py-3 px-2">
                                                <select
                                                    value={row.via}
                                                    onChange={(e) => handleRowChange(idx, "via", e.target.value)}
                                                    className="w-full h-10 px-3 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 outline-none focus:border-blue-500 transition-all cursor-pointer"
                                                >
                                                    {VIAS_ADMINISTRACION.map(v => (
                                                        <option key={v} value={v}>{v}</option>
                                                    ))}
                                                </select>
                                            </td>

                                            {/* Frecuencia */}
                                            <td className="py-3 px-2">
                                                <input
                                                    type="text"
                                                    value={row.frecuencia}
                                                    onChange={(e) => handleRowChange(idx, "frecuencia", e.target.value)}
                                                    placeholder="Cada 8 horas"
                                                    className="w-full h-10 px-3 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 outline-none focus:border-blue-500 transition-all"
                                                />
                                            </td>

                                            {/* Duración */}
                                            <td className="py-3 px-2">
                                                <input
                                                    type="text"
                                                    value={row.duracion}
                                                    onChange={(e) => handleRowChange(idx, "duracion", e.target.value)}
                                                    placeholder="Por 3 días"
                                                    className="w-full h-10 px-3 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 outline-none focus:border-blue-500 transition-all"
                                                />
                                            </td>

                                            {/* Remove row */}
                                            <td className="py-3 px-2 text-center">
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveRow(idx)}
                                                    className="w-8 h-8 rounded-lg bg-slate-50 text-slate-400 hover:bg-rose-50 hover:text-rose-500 flex items-center justify-center transition-all shadow-sm mx-auto"
                                                    title="Eliminar fila"
                                                >
                                                    <FiTrash2 size={13} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Bottom Action Bar */}
            <div className="flex justify-end bg-white p-6 rounded-[28px] border border-slate-100 shadow-sm">
                <button
                    type="submit"
                    disabled={saving}
                    className="h-10 px-8 flex items-center justify-center bg-[#8cc33f] text-white rounded-full text-xs font-black uppercase tracking-widest hover:bg-[#7db02b] shadow-lg shadow-[#8cc33f]/20 transition-all active:scale-95"
                >
                    <FiSave className="mr-2" size={14} />
                    {saving ? "Guardando..." : "Guardar"}
                </button>
            </div>
        </form>
    );
}
