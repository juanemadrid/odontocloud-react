import React, { useState, useEffect } from "react";
import { FiPlus, FiTrash2, FiSave, FiCalendar, FiUser, FiInfo } from "react-icons/fi";
import { collection, query, where, getDocs, addDoc, deleteDoc, doc, serverTimestamp } from "firebase/firestore";
import { db } from "../../../firebase/firebaseConfig";
import { useAuth } from "../../../context/AuthContext";
import { toast } from "sonner";

export default function ReportarResiduos() {
    const { userProfile } = useAuth();
    const inquilino = userProfile?.inquilino || "";

    const [types, setTypes] = useState([]);
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    // Form state
    const [selectedTypeId, setSelectedTypeId] = useState("");
    const [cantidad, setCantidad] = useState("");
    const [fecha, setFecha] = useState(new Date().toISOString().split("T")[0]);
    const [responsable, setResponsable] = useState(userProfile?.nombre || "");
    const [saving, setSaving] = useState(false);

    const loadData = async () => {
        if (!inquilino) return;
        setLoading(true);
        try {
            // Load types
            const tQ = query(collection(db, "tipos_residuos"), where("inquilino", "==", inquilino));
            const tSnap = await getDocs(tQ);
            const tList = tSnap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a, b) => a.nombre.localeCompare(b.nombre));
            setTypes(tList);
            if (tList.length > 0) setSelectedTypeId(tList[0].id);

            // Load logs
            const lQ = query(collection(db, "registro_residuos"), where("inquilino", "==", inquilino));
            const lSnap = await getDocs(lQ);
            const lList = lSnap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a, b) => {
                return new Date(b.fecha) - new Date(a.fecha);
            });
            setLogs(lList);
        } catch (e) {
            console.error("Error loading waste reporting data:", e);
            toast.error("Error al cargar la información de residuos");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [inquilino]);

    const handleReport = async (e) => {
        if (e) e.preventDefault();
        if (!selectedTypeId) {
            toast.error("Por favor, seleccione un tipo de residuo.");
            return;
        }
        if (!cantidad || isNaN(cantidad) || parseFloat(cantidad) <= 0) {
            toast.error("Por favor, ingrese una cantidad válida en kg.");
            return;
        }

        const selectedType = types.find(t => t.id === selectedTypeId);
        if (!selectedType) return;

        setSaving(true);
        try {
            const reportItem = {
                fecha,
                residuoId: selectedTypeId,
                residuoNombre: selectedType.nombre,
                color: selectedType.color,
                cantidad: parseFloat(cantidad),
                responsable: responsable.trim(),
                inquilino,
                createdAt: serverTimestamp()
            };

            const docRef = await addDoc(collection(db, "registro_residuos"), reportItem);
            toast.success("Residuo reportado correctamente");
            
            // Add local
            setLogs(prev => [{ id: docRef.id, ...reportItem }, ...prev]);
            setCantidad("");
        } catch (err) {
            console.error("Error reporting residue:", err);
            toast.error("Error al guardar el reporte");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("¿Está seguro de eliminar este registro de residuos?")) return;
        try {
            await deleteDoc(doc(db, "registro_residuos", id));
            toast.success("Registro eliminado");
            setLogs(prev => prev.filter(l => l.id !== id));
        } catch (e) {
            console.error("Error deleting log:", e);
            toast.error("Error al eliminar el registro");
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in duration-500">
            {/* Form Column */}
            <div className="lg:col-span-1">
                <form onSubmit={handleReport} className="bg-white p-8 rounded-[28px] border border-slate-100 shadow-sm space-y-6">
                    <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest border-b border-slate-50 pb-3">
                        Reportar Generación
                    </h3>

                    {/* Residue Type */}
                    <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Tipo de residuo *</label>
                        <select
                            value={selectedTypeId}
                            onChange={(e) => setSelectedTypeId(e.target.value)}
                            className="w-full h-11 px-4 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 transition-all cursor-pointer"
                        >
                            {types.length === 0 ? (
                                <option value="">No hay tipos configurados</option>
                            ) : (
                                types.map(t => (
                                    <option key={t.id} value={t.id}>
                                        {t.nombre.toUpperCase()} ({t.color})
                                    </option>
                                ))
                            )}
                        </select>
                    </div>

                    {/* Cantidad */}
                    <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Cantidad (Kg) *</label>
                        <input
                            type="number"
                            step="0.01"
                            value={cantidad}
                            onChange={(e) => setCantidad(e.target.value)}
                            placeholder="Ej: 1.25"
                            className="w-full h-11 px-4 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 transition-all"
                            required
                        />
                    </div>

                    {/* Fecha */}
                    <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Fecha de Pesaje *</label>
                        <div className="relative">
                            <input
                                type="date"
                                value={fecha}
                                onChange={(e) => setFecha(e.target.value)}
                                className="w-full h-11 px-4 pl-11 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 transition-all"
                                required
                            />
                            <FiCalendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                        </div>
                    </div>

                    {/* Responsable */}
                    <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Responsable del pesaje</label>
                        <div className="relative">
                            <input
                                type="text"
                                value={responsable}
                                onChange={(e) => setResponsable(e.target.value)}
                                placeholder="Nombre de quien pesa"
                                className="w-full h-11 px-4 pl-11 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 transition-all"
                            />
                            <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                        </div>
                    </div>

                    {/* Save */}
                    <button
                        type="submit"
                        disabled={saving || types.length === 0}
                        className="w-full h-11 flex items-center justify-center bg-[#8cc33f] text-white rounded-full text-xs font-black uppercase tracking-widest hover:bg-[#7db02b] shadow-lg shadow-[#8cc33f]/20 transition-all active:scale-95 disabled:bg-slate-200 disabled:cursor-not-allowed disabled:shadow-none"
                    >
                        <FiSave className="mr-2" size={14} />
                        {saving ? "Registrando..." : "Registrar Pesaje"}
                    </button>
                </form>
            </div>

            {/* List Column */}
            <div className="lg:col-span-2 space-y-6">
                {/* Information Callout */}
                <div className="bg-blue-50 border border-blue-100 p-6 rounded-[28px] flex items-start gap-4">
                    <div className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center text-lg shadow-md shrink-0">
                        <FiInfo />
                    </div>
                    <div className="space-y-1">
                        <h4 className="text-blue-900 font-black uppercase text-xs tracking-wider">Control de Residuos Hospitalarios</h4>
                        <p className="text-blue-700 text-xs font-semibold leading-relaxed">
                            Es obligatorio registrar todos los residuos generados en clínica de acuerdo a las regulaciones sanitarias (anatomopatológicos, biosanitarios, ordinarios, cortopunzantes, etc.) para mantener el reporte consolidado anual actualizado.
                        </p>
                    </div>
                </div>

                {/* History list */}
                <div className="bg-white rounded-[28px] border border-slate-100 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 bg-slate-50/50 border-b border-slate-100">
                        <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">Historial de registros recientes</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/20 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                    <th className="px-6 py-4 pl-8">Fecha</th>
                                    <th className="px-6 py-4">Residuo</th>
                                    <th className="px-6 py-4">Color</th>
                                    <th className="px-6 py-4">Cantidad</th>
                                    <th className="px-6 py-4">Responsable</th>
                                    <th className="px-6 py-4 text-center pr-8 w-20">Acción</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50 text-[13px] text-slate-700">
                                {loading ? (
                                    <tr>
                                        <td colSpan="6" className="px-8 py-20 text-center">
                                            <div className="flex flex-col items-center gap-4">
                                                <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                                                <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Cargando historial...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : logs.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="px-8 py-20 text-center text-slate-400 italic">
                                            Aún no hay registros de generación de residuos este mes.
                                        </td>
                                    </tr>
                                ) : (
                                    logs.map(log => (
                                        <tr key={log.id} className="hover:bg-slate-50/30 transition-colors">
                                            <td className="px-6 py-4 pl-8 font-semibold text-slate-500 font-mono">{log.fecha}</td>
                                            <td className="px-6 py-4 font-black text-slate-800 uppercase tracking-tight">{log.residuoNombre}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                                                    log.color === "Rojo" ? "bg-rose-50 text-rose-600 border border-rose-100" :
                                                    log.color === "Negro" ? "bg-slate-800 text-white" :
                                                    log.color === "Verde" ? "bg-emerald-50 text-emerald-600 border border-emerald-100" :
                                                    log.color === "Blanco" ? "bg-slate-100 text-slate-600 border border-slate-200" :
                                                    "bg-slate-50 text-slate-500"
                                                }`}>
                                                    {log.color}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 font-black text-blue-600 font-mono">{log.cantidad.toFixed(2)} Kg</td>
                                            <td className="px-6 py-4 text-slate-500 font-semibold">{log.responsable || "—"}</td>
                                            <td className="px-6 py-4 text-center pr-8">
                                                <button
                                                    onClick={() => handleDelete(log.id)}
                                                    className="w-8 h-8 rounded-lg bg-slate-50 text-slate-400 hover:bg-rose-50 hover:text-rose-600 flex items-center justify-center transition-all shadow-sm mx-auto"
                                                    title="Eliminar"
                                                >
                                                    <FiTrash2 size={13} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
