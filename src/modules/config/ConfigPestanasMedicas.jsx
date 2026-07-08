
import React, { useState, useEffect } from "react";
import { FiSearch, FiEye, FiTrash2, FiEdit2, FiPlus, FiArrowUp, FiArrowDown, FiX, FiChevronRight, FiChevronLeft, FiList, FiClock, FiSettings } from "react-icons/fi";
import { collection, getDocs, query, orderBy, deleteDoc, doc, updateDoc, addDoc, serverTimestamp, onSnapshot } from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";

// Helper for sorting
const reorder = (list, startIndex, endIndex) => {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
    return result;
};

// Specialties (Fetched from a central place usually, but kept here for now or ideally mapped from DB)
const MOCK_SPECIALTIES = [
    "IMPLANTOLOGÍA", "ORTODONCIA", "ENDODONCIA", "CIRUGÍA",
    "ODONTOPEDIATRÍA", "REHABILITACIÓN", "TTM/DOF", "ODONTOLOGÍA GENERAL", "PERIODONCIA"
];

const MOMENTS = [
    { value: "before_exam", label: "ANTES DEL EXAMEN", color: "text-blue-500", bg: "bg-blue-50" },
    { value: "during_exam", label: "DURANTE EL EXAMEN", color: "text-emerald-500", bg: "bg-emerald-50" },
    { value: "after_exam", label: "DESPUÉS DEL EXAMEN", color: "text-purple-500", bg: "bg-purple-50" }
];

export default function ConfigPestanasMedicas() {
    const { userProfile } = useAuth();
    const inquilino = userProfile?.inquilino;
    const toast = useToast();

    const [rows, setRows] = useState([]);
    const [templates, setTemplates] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [momentoFilter, setMomentoFilter] = useState("all");

    // Modal State
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        nombre: "",
        descripcion: "",
        plantillaId: "",
        momento: "",
        especialidades: []
    });

    useEffect(() => {
        if (!inquilino) return;

        setLoading(true);
        const q = query(
            collection(db, "tenants", inquilino, "pestanas_medicas"),
            orderBy("orden", "asc")
        );

        const unsub = onSnapshot(q, (snap) => {
            setRows(snap.docs.map(d => ({ id: d.id, ...d.data() })));
            setLoading(false);
        }, (err) => {
            console.error(err);
            toast.error("Error al sincronizar pestañas");
            setLoading(false);
        });

        fetchTemplates();
        return () => unsub();
    }, [inquilino]);

    const fetchTemplates = async () => {
        try {
            const q = query(collection(db, "tenants", inquilino, "plantillas_clinicas"), orderBy("nombre", "asc"));
            const snap = await getDocs(q);
            setTemplates(snap.docs.map(d => ({ id: d.id, nombre: d.data().nombre })));
        } catch (error) {
            console.error("Error fetching templates:", error);
        }
    };

    const handleSave = async () => {
        if (!formData.nombre.trim()) return toast.warning("Asigne un nombre a la pestaña");
        if (!formData.plantillaId) return toast.warning("Seleccione una plantilla base");
        if (!formData.momento) return toast.warning("Defina el momento de la consulta");

        setSaving(true);
        try {
            const payload = {
                ...formData,
                nombre: formData.nombre.toUpperCase(),
                updatedAt: serverTimestamp(),
                updatedBy: userProfile.email
            };

            if (editingId) {
                await updateDoc(doc(db, "tenants", inquilino, "pestanas_medicas", editingId), payload);
                toast.success("Pestaña médica actualizada");
            } else {
                await addDoc(collection(db, "tenants", inquilino, "pestanas_medicas"), {
                    ...payload,
                    orden: rows.length,
                    createdAt: serverTimestamp(),
                    createdBy: userProfile.email
                });
                toast.success("Nueva pestaña creada con éxito");
            }
            closeModal();
        } catch (e) {
            console.error(e);
            toast.error("Error al guardar la configuración");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("¿Seguro que desea eliminar esta pestaña de la historia clínica?")) return;
        try {
            await deleteDoc(doc(db, "tenants", inquilino, "pestanas_medicas", id));
            toast.success("Registro eliminado correctamente");
        } catch (e) {
            console.error(e);
            toast.error("Error al eliminar");
        }
    };

    const handleMove = async (index, direction) => {
        const newIndex = direction === "up" ? index - 1 : index + 1;
        if (newIndex < 0 || newIndex >= rows.length) return;

        const newRows = reorder(rows, index, newIndex);
        setRows(newRows); // Optimistic UI

        try {
            const updates = newRows.map((row, i) =>
                updateDoc(doc(db, "tenants", inquilino, "pestanas_medicas", row.id), { orden: i })
            );
            await Promise.all(updates);
        } catch (e) {
            console.error(e);
            toast.error("Error al reordenar");
        }
    };

    const openModal = (item = null) => {
        if (item) {
            setEditingId(item.id);
            setFormData({
                nombre: item.nombre,
                descripcion: item.descripcion || "",
                plantillaId: item.plantillaId || "",
                momento: item.momento || "",
                especialidades: item.especialidades || []
            });
        } else {
            setEditingId(null);
            setFormData({
                nombre: "",
                descripcion: "",
                plantillaId: "",
                momento: "",
                especialidades: []
            });
        }
        setShowModal(true);
    };

    const closeModal = () => setShowModal(false);

    // Filter Logic
    const filtered = rows.filter(r => {
        const matchesSearch = (r.nombre || "").toLowerCase().includes(searchTerm.toLowerCase());
        const matchesMomento = momentoFilter === "all" || r.momento === momentoFilter;
        return matchesSearch && matchesMomento;
    });

    return (
        <div className="space-y-10 p-2 md:p-8">

            {/* Toolbar Premium */}
            <div className="bg-white rounded-[32px] border border-slate-200/50 shadow-[0_20px_60px_rgba(0,0,0,0.03)] hover:shadow-[0_35px_80px_rgba(0,0,0,0.06)] transition-all duration-700 overflow-hidden relative text-left">
                <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-600 shadow-[1px_0_10px_rgba(37,99,235,0.15)]"></div>
                <div className="bg-slate-50/50 backdrop-blur-sm px-8 py-5 flex flex-col xl:flex-row xl:items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center shadow-xl shadow-blue-200">
                            <FiList size={24} className="text-white" />
                        </div>
                        <div>
                            <h2 className="text-[20px] font-black text-slate-800 uppercase tracking-tighter">Pestañas Médicas</h2>
                            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest opacity-80">Estructura de la Historia Clínica</p>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-4">
                        {/* Moment Filters */}
                        <div className="flex bg-white p-1 rounded-2xl border border-slate-200 shadow-sm">
                            <button
                                onClick={() => setMomentoFilter("all")}
                                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${momentoFilter === "all" ? "bg-blue-600 text-white shadow-lg shadow-blue-100" : "text-slate-400 hover:bg-slate-50"}`}
                            >
                                TODAS
                            </button>
                            {MOMENTS.map(m => (
                                <button
                                    key={m.value}
                                    onClick={() => setMomentoFilter(m.value)}
                                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${momentoFilter === m.value ? `${m.bg.replace('bg-', 'bg-')} ${m.color.replace('text-', 'text-')} ring-1 ring-current shadow-sm` : "text-slate-400 hover:bg-slate-50"}`}
                                >
                                    {m.label.split(" ")[0]}
                                </button>
                            ))}
                        </div>

                        <div className="relative group/search">
                            <FiSearch size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-hover/search:text-blue-500 transition-colors" />
                            <input
                                type="text"
                                placeholder="BUSCAR PESTAÑA..."
                                className="pl-12 pr-6 py-3 bg-white border border-slate-200 rounded-2xl text-[13px] font-bold text-slate-600 outline-none w-full md:w-64 focus:ring-4 focus:ring-blue-100 focus:border-blue-400 transition-all uppercase tracking-wider placeholder:text-slate-300 shadow-sm"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        <button
                            onClick={() => openModal()}
                            className="bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-3 rounded-2xl text-[13px] font-black uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-emerald-200 transition-all active:scale-95 group/btn overflow-hidden relative"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:animate-shimmer" />
                            <FiPlus className="text-lg" /> Nueva Pestaña
                        </button>
                    </div>
                </div>
            </div>

            {/* Table Area (High Density) */}
            <div className="group/section bg-white rounded-[32px] border border-slate-200/50 shadow-[0_20px_60px_rgba(0,0,0,0.03)] overflow-hidden relative transition-all duration-700 text-left">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100/60">
                                <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] w-16 text-center">Orden</th>
                                <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Sección / Nombre</th>
                                <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Plantilla Base</th>
                                <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Momento</th>
                                <th className="px-8 py-5 text-right text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading && rows.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-8 py-24 text-center">
                                        <div className="flex flex-col items-center">
                                            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
                                            <p className="text-[12px] font-black text-slate-400 uppercase tracking-widest">Sincronizando configuración médica...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-8 py-24 text-center">
                                        <div className="flex flex-col items-center">
                                            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-200 mb-6 drop-shadow-inner text-4xl leading-none">
                                                <FiList />
                                            </div>
                                            <p className="text-[14px] font-black text-slate-400 uppercase tracking-[0.2em]">No hay pestañas definidas</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filtered.map((row, index) => {
                                    const m = MOMENTS.find(m => m.value === row.momento);
                                    return (
                                        <tr key={row.id} className="group/row hover:bg-blue-50/30 transition-all duration-300">
                                            <td className="px-8 py-4 text-center">
                                                <div className="text-[14px] font-black text-slate-300 group-hover/row:text-blue-600 transition-colors tabular-nums">
                                                    {(index + 1).toString().padStart(2, '0')}
                                                </div>
                                            </td>
                                            <td className="px-8 py-4">
                                                <div className="text-[14px] font-black text-slate-700 uppercase tracking-tight">
                                                    {row.nombre}
                                                </div>
                                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter truncate max-w-[200px]">
                                                    {row.descripcion || "SIN DESCRIPCIÓN ADICIONAL"}
                                                </div>
                                            </td>
                                            <td className="px-8 py-4">
                                                <div className="flex items-center gap-2">
                                                    <FiFileText size={14} className="text-blue-500" />
                                                    <span className="text-[12px] font-bold text-slate-500 uppercase">
                                                        {templates.find(t => t.id === row.plantillaId)?.nombre || "NO ASIGNADA"}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-4">
                                                {m && (
                                                    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full ${m.bg} ${m.color} text-[9px] font-black uppercase tracking-wider`}>
                                                        <FiClock size={10} />
                                                        {m.label}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-8 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2 opacity-0 group-hover/row:opacity-100 transition-all duration-500 translate-x-4 group-hover/row:translate-x-0">
                                                    <div className="flex bg-white rounded-xl border border-slate-200 p-1 mr-2">
                                                        <button
                                                            disabled={index === 0}
                                                            onClick={() => handleMove(index, "up")}
                                                            className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 disabled:opacity-20 transition-all"
                                                        >
                                                            <FiArrowUp size={14} />
                                                        </button>
                                                        <button
                                                            disabled={index === rows.length - 1}
                                                            onClick={() => handleMove(index, "down")}
                                                            className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 disabled:opacity-20 transition-all"
                                                        >
                                                            <FiArrowDown size={14} />
                                                        </button>
                                                    </div>
                                                    <button
                                                        className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-blue-600 hover:border-blue-200 hover:shadow-lg hover:shadow-blue-100 transition-all active:scale-90"
                                                        onClick={() => openModal(row)}
                                                    >
                                                        <FiEdit2 size={16} />
                                                    </button>
                                                    <button
                                                        className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-red-600 hover:border-red-200 hover:shadow-lg hover:shadow-red-100 transition-all active:scale-90"
                                                        onClick={() => handleDelete(row.id)}
                                                    >
                                                        <FiTrash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* MODAL INSTITUCIONAL */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-500" onClick={closeModal} />

                    <div className="relative w-full max-w-4xl bg-white rounded-[32px] shadow-[0_50px_100px_rgba(0,0,0,0.3)] overflow-hidden border border-white animate-in zoom-in-95 slide-in-from-bottom-10 duration-500 text-left">
                        {/* Modal Header */}
                        <div className="px-10 py-8 bg-slate-50/80 border-b border-slate-100 flex justify-between items-center relative">
                            <div className="absolute top-0 left-10 w-20 h-1 bg-blue-600 rounded-b-full shadow-[0_2px_10px_rgba(37,99,235,0.3)]" />
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-white shadow-lg flex items-center justify-center text-blue-600 border border-slate-100">
                                    <FiSettings size={24} />
                                </div>
                                <div>
                                    <h3 className="text-[20px] font-black text-slate-800 uppercase tracking-tighter">
                                        {editingId ? "Configurar Pestaña" : "Vincular Nueva Pestaña"}
                                    </h3>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] opacity-70">
                                        Personalización de la interfaz clínica
                                    </p>
                                </div>
                            </div>
                            <button onClick={closeModal} className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white border border-slate-100 text-slate-400 hover:text-red-500 hover:shadow-xl transition-all duration-300 active:scale-90">
                                <FiX size={24} />
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="p-10 max-h-[70vh] overflow-y-auto custom-scrollbar">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                {/* Info Section */}
                                <div className="space-y-6">
                                    <div className="group/field">
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1 group-focus-within/field:text-blue-500 transition-colors">NOMBRE DE LA PESTAÑA *</label>
                                        <input
                                            className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-[14px] font-bold text-slate-700 outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-400 transition-all shadow-inner uppercase placeholder:text-slate-300"
                                            placeholder="EJ. MOTIVO DE CONSULTA"
                                            value={formData.nombre}
                                            onChange={e => setFormData({ ...formData, nombre: e.target.value })}
                                        />
                                    </div>
                                    <div className="group/field">
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1 group-focus-within/field:text-blue-500 transition-colors">DESCRIPCIÓN OPERATIVA</label>
                                        <textarea
                                            rows={2}
                                            className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-[14px] font-bold text-slate-700 outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-400 transition-all shadow-inner placeholder:text-slate-300"
                                            placeholder="Detalles sobre el uso de esta pestaña..."
                                            value={formData.descripcion}
                                            onChange={e => setFormData({ ...formData, descripcion: e.target.value })}
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="group/field">
                                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1 group-focus-within/field:text-blue-500 transition-colors">PLANTILLA BASE *</label>
                                            <select
                                                className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-[13px] font-bold text-slate-700 outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-400 transition-all shadow-inner bg-no-repeat appearance-none"
                                                value={formData.plantillaId}
                                                onChange={e => setFormData({ ...formData, plantillaId: e.target.value })}
                                            >
                                                <option value="">SELECCIONAR...</option>
                                                {templates.map(t => (
                                                    <option key={t.id} value={t.id}>{t.nombre.toUpperCase()}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="group/field">
                                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1 group-focus-within/field:text-blue-500 transition-colors">MOMENTO *</label>
                                            <select
                                                className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-[13px] font-bold text-slate-700 outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-400 transition-all shadow-inner appearance-none"
                                                value={formData.momento}
                                                onChange={e => setFormData({ ...formData, momento: e.target.value })}
                                            >
                                                <option value="">DEFINIR MOMENTO...</option>
                                                {MOMENTS.map(m => (
                                                    <option key={m.value} value={m.value}>{m.label}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                {/* Specializations Dual List */}
                                <div className="space-y-4">
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">RESTRICCIÓN POR ESPECIALIDAD</label>
                                    <div className="grid grid-cols-[1fr,32px,1fr] gap-2 h-72">
                                        {/* Available */}
                                        <div className="flex flex-col bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden shadow-inner">
                                            <div className="px-4 py-2 border-b border-slate-200 bg-white/50 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                                                Disponibles
                                            </div>
                                            <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
                                                {MOCK_SPECIALTIES.filter(s => !formData.especialidades.includes(s)).map(s => (
                                                    <button
                                                        key={s}
                                                        onClick={() => setFormData(prev => ({ ...prev, especialidades: [...prev.especialidades, s] }))}
                                                        className="w-full text-left px-3 py-2 rounded-xl text-[11px] font-bold text-slate-600 hover:bg-white hover:text-blue-600 hover:shadow-sm border border-transparent transition-all group/spec"
                                                    >
                                                        <div className="flex items-center justify-between">
                                                            <span className="truncate uppercase">{s}</span>
                                                            <FiChevronRight className="opacity-0 group-hover/spec:opacity-100 -translate-x-2 group-hover/spec:translate-x-0 transition-all text-blue-500" />
                                                        </div>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Separator / Decoration */}
                                        <div className="flex flex-col items-center justify-center gap-1 opacity-20">
                                            <div className="w-1 h-1 rounded-full bg-slate-400" />
                                            <div className="w-1 h-3 rounded-full bg-slate-400" />
                                            <div className="w-1 h-1 rounded-full bg-slate-400" />
                                        </div>

                                        {/* Selected */}
                                        <div className="flex flex-col bg-blue-50/10 rounded-2xl border border-blue-200/50 overflow-hidden shadow-inner">
                                            <div className="px-4 py-2 border-b border-blue-100 bg-blue-50/50 text-[9px] font-black text-blue-400 uppercase tracking-widest">
                                                Visualizar en
                                            </div>
                                            <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
                                                {formData.especialidades.length === 0 ? (
                                                    <div className="h-full flex flex-col items-center justify-center text-center p-4">
                                                        <span className="text-[10px] font-black text-slate-300 uppercase leading-tight">Visible en todas</span>
                                                    </div>
                                                ) : (
                                                    formData.especialidades.map(s => (
                                                        <button
                                                            key={s}
                                                            onClick={() => setFormData(prev => ({ ...prev, especialidades: prev.especialidades.filter(x => x !== s) }))}
                                                            className="w-full text-left px-3 py-2 rounded-xl text-[11px] font-black bg-white text-blue-700 shadow-sm border border-blue-100 hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition-all group/sel"
                                                        >
                                                            <div className="flex items-center justify-between">
                                                                <span className="truncate uppercase">{s}</span>
                                                                <FiX className="opacity-0 group-hover/sel:opacity-100 text-red-500 transition-all" />
                                                            </div>
                                                        </button>
                                                    ))
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <p className="text-[9px] font-bold text-slate-300 uppercase tracking-wide text-center">Si no selecciona ninguna, la pestaña será visible para todas las especialidades.</p>
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="px-10 py-8 bg-slate-50 border-t border-slate-100 flex justify-end gap-4 shrink-0">
                            <button
                                onClick={closeModal}
                                className="px-8 py-4 rounded-2xl text-[13px] font-black text-slate-500 uppercase tracking-widest hover:bg-slate-200 transition-all active:scale-95"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="bg-emerald-500 hover:bg-emerald-600 text-white px-10 py-4 rounded-2xl text-[13px] font-black uppercase tracking-widest flex items-center gap-2 shadow-xl shadow-emerald-200 transition-all active:scale-95 group/save relative overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/save:animate-shimmer" />
                                {saving ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        PROCESANDO...
                                    </>
                                ) : (
                                    <>
                                        <FiSave className="text-lg" /> Guardar Configuración
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
