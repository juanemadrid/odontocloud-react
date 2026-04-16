import React, { useState, useEffect } from "react";

import { FiSearch, FiEdit2, FiTrash2, FiPlus, FiHome, FiBox, FiCheck, FiX, FiCheckCircle, FiXCircle, FiArrowLeft, FiSave } from "react-icons/fi";
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, orderBy, where } from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";
import { useAuth } from "../../context/AuthContext";

// Breadcrumb Helper
const Breadcrumb = ({ items, onNavigate }) => (
    <div className="config-breadcrumb" style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#64748b", marginBottom: 20 }}>
        <FiHome size={14} style={{ cursor: "pointer" }} onClick={() => window.location.hash = "#/dashboard"} />
        {items.map((item, i) => (
            <React.Fragment key={i}>
                <span>-</span>
                <span
                    style={{ cursor: item.action ? "pointer" : "default", color: item.action ? "#3b82f6" : "inherit" }}
                    onClick={item.action}
                >
                    {item.label}
                </span>
            </React.Fragment>
        ))}
    </div>
);

// Editor Component
function AlmacenEditor({ item, onBack }) {
    const { userProfile } = useAuth();
    const inquilino = userProfile?.inquilino;

    const [form, setForm] = useState({
        nombre: item?.nombre || "",
        activo: item?.activo !== undefined ? item.activo : true,
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const [isSaving, setIsSaving] = useState(false);
    const handleSave = async () => {
        if (!form.nombre.trim()) return alert("El nombre es obligatorio");
        if (!inquilino) {
            console.error("No inquilino found in AlmacenEditor");
            return alert("Error: No se identificó la empresa del usuario. Por favor, reincie sesión.");
        }

        setIsSaving(true);
        try {
            const payload = {
                nombre: form.nombre.trim(),
                activo: form.activo,
                inquilino,
                actualizado: new Date()
            };

            console.log("Saving Almacen:", payload);

            if (item?.id) {
                await updateDoc(doc(db, "almacenes", item.id), payload);
                alert("Almacén actualizado");
            } else {
                await addDoc(collection(db, "almacenes"), {
                    ...payload,
                    creado: new Date()
                });
                alert("Almacén creado");
            }
            onBack();
        } catch (e) {
            console.error(e);
            alert("Error al guardar: " + e.message);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="p-4 w-full max-w-4xl mx-auto relative transition-all duration-300">
            {/* Header: Institutional & Actions */}
            <div className="group/section bg-white rounded-[32px] border border-slate-200/50 shadow-[0_20px_60px_rgba(0,0,0,0.03)] hover:shadow-[0_35px_80px_rgba(0,0,0,0.06)] transition-all duration-700 overflow-hidden relative mb-6">
                <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-600 shadow-[1px_0_10px_rgba(37,99,235,0.15)]"></div>

                <div className="bg-slate-50/50 backdrop-blur-sm px-8 py-5 border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={onBack}
                            className="w-10 h-10 rounded-xl border border-slate-200 bg-white flex items-center justify-center text-slate-500 hover:text-blue-600 hover:border-blue-200 hover:shadow-lg transition-all active:scale-90"
                        >
                            <FiArrowLeft size={18} />
                        </button>
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center shadow-xl shadow-blue-200">
                            <FiBox size={20} className="text-white" />
                        </div>
                        <div className="flex flex-col">
                            <h2 className="text-[18px] font-black text-slate-800 uppercase tracking-tighter">
                                {item ? "Editar Almacén" : "Nuevo Almacén"}
                            </h2>
                            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest opacity-80">Gestión de bodegas y suministros</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className={`bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl text-[13px] font-black uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-blue-200 transition-all active:scale-95 ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {isSaving ? (
                                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                            ) : (
                                <FiSave className="text-lg" />
                            )}
                            {isSaving ? "Guardando..." : "Guardar"}
                        </button>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-[32px] border border-slate-200/50 shadow-[0_15px_40px_rgba(0,0,0,0.02)] p-10 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full blur-3xl -mr-16 -mt-16 opacity-50"></div>

                <div className="space-y-8 relative">
                    <div className="space-y-2">
                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.15em] ml-1">Identificador del Almacén *</label>
                        <div className="relative group max-w-lg">
                            <FiHome className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-all font-black" />
                            <input
                                className="w-full pl-16 pr-6 py-5 bg-slate-100/30 border border-slate-200 rounded-[24px] text-[18px] font-black text-slate-800 outline-none focus:bg-white focus:border-blue-500 focus:ring-8 focus:ring-blue-500/5 transition-all shadow-inner-sm"
                                name="nombre"
                                value={form.nombre}
                                onChange={handleChange}
                                placeholder="Ej: Bodega Principal"
                                autoFocus
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-between p-6 bg-slate-50/50 rounded-[24px] border border-slate-100 max-w-lg">
                        <div className="flex flex-col">
                            <span className="text-[14px] font-black text-slate-700 uppercase tracking-tight">Estado Operativo</span>
                            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Define si el almacén está disponible para carga</span>
                        </div>
                        <div
                            onClick={() => handleChange({ target: { name: 'activo', value: !form.activo, type: 'checkbox', checked: !form.activo } })}
                            className={`w-14 h-7 rounded-full relative cursor-pointer transition-all duration-300 ring-4 ring-transparent ${form.activo ? "bg-emerald-500 shadow-lg shadow-emerald-200" : "bg-slate-200"}`}
                        >
                            <div className={`w-5 h-5 bg-white rounded-full absolute top-1 transition-all duration-300 shadow-sm ${form.activo ? "left-8" : "left-1"}`} />
                        </div>
                    </div>

                    <div className="pt-8 border-t border-slate-50 flex justify-end">
                        <button
                            className={`bg-blue-600 hover:bg-blue-700 text-white px-10 py-4 rounded-[20px] text-[14px] font-black uppercase tracking-widest shadow-xl shadow-blue-200 transition-all active:scale-95 flex items-center gap-3 overflow-hidden relative group ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
                            onClick={handleSave}
                            disabled={isSaving}
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-shimmer" />
                            {isSaving ? (
                                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                            ) : (
                                <FiSave size={20} />
                            )}
                            {isSaving ? "Guardando..." : "Guardar Almacén"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// List Component
export default function EmpresaAlmacenes() {
    const { userProfile } = useAuth();
    const inquilino = userProfile?.inquilino;

    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    // Create/Edit state
    const [view, setView] = useState("list"); // list, editor
    const [editingItem, setEditingItem] = useState(null);

    const fetchData = async () => {
        if (!inquilino) return;
        setLoading(true);
        try {
            const q = query(
                collection(db, "almacenes"),
                where("inquilino", "==", inquilino)
            );
            const snap = await getDocs(q);
            const data = snap.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })).sort((a, b) => (a.nombre || "").localeCompare(b.nombre || ""));
            setRows(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [inquilino]);

    const openNew = () => {
        setEditingItem(null);
        setView("editor");
    };

    const openEdit = (row) => {
        setEditingItem(row);
        setView("editor");
    };

    const handleDelete = async (row) => {
        if (!window.confirm(`¿Eliminar almacén "${row.nombre}" ? `)) return;
        try {
            await deleteDoc(doc(db, "almacenes", row.id));
            setRows(prev => prev.filter(r => r.id !== row.id));
        } catch (e) {
            console.error(e);
            alert("Error al eliminar");
        }
    };

    if (view === "editor") {
        return <AlmacenEditor item={editingItem} onBack={() => { setView("list"); fetchData(); }} />;
    }

    const filteredRows = rows.filter(r =>
        (r.nombre || "").toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-4 w-full max-w-6xl mx-auto relative transition-all duration-300">
            {loading && (
                <div className="absolute top-4 right-4 z-50">
                    <div className="w-4 h-4 border-2 border-blue-600/20 border-t-blue-600 rounded-full animate-spin" />
                </div>
            )}

            {/* Main Header / Toolbar */}
            <div className="bg-white rounded-[32px] border border-slate-200/50 shadow-[0_20px_60px_rgba(0,0,0,0.03)] hover:shadow-[0_35px_80px_rgba(0,0,0,0.06)] transition-all duration-700 overflow-hidden relative mb-6">
                <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-600 shadow-[1px_0_10px_rgba(37,99,235,0.15)]"></div>

                <div className="bg-slate-50/50 backdrop-blur-sm px-8 py-5 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center shadow-xl shadow-blue-200 group-hover:scale-110 transition-transform duration-500">
                            <FiBox className="text-white text-xl" />
                        </div>
                        <div>
                            <h2 className="text-[20px] font-black text-slate-800 uppercase tracking-tighter">Gestionar Almacenes</h2>
                            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest opacity-80">Inventario y puntos de almacenamiento</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        {/* Search Input */}
                        <div className="relative group flex-1 md:flex-none">
                            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-all font-black" />
                            <input
                                type="text"
                                placeholder="Buscar..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full md:w-64 pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-[14px] font-extrabold text-slate-800 outline-none focus:border-blue-500 focus:ring-8 focus:ring-blue-500/5 transition-all shadow-sm"
                            />
                        </div>

                        {/* New Button */}
                        <button
                            onClick={openNew}
                            className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-2xl text-[13px] font-black uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-emerald-200 transition-all active:scale-95 group/btn overflow-hidden relative"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:animate-shimmer" />
                            <FiPlus className="text-lg" /> Nuevo
                        </button>
                    </div>
                </div>
            </div>

            {/* Table Area */}
            <div className="group/section bg-white rounded-[32px] border border-slate-200/50 shadow-[0_20px_60px_rgba(0,0,0,0.03)] overflow-hidden relative">
                <div className="p-0 overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="bg-slate-50/30">
                                <th className="px-8 py-4 text-left text-[11px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-100">Nombre del Almacén</th>
                                <th className="px-8 py-4 text-left text-[11px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-100">Estado</th>
                                <th className="px-8 py-4 text-right text-[11px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-100">Operaciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={3} className="px-8 py-20 text-center">
                                        <div className="flex flex-col items-center gap-3 animate-pulse">
                                            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-blue-400">
                                                <div className="w-6 h-6 border-2 border-blue-600/20 border-t-blue-600 rounded-full animate-spin" />
                                            </div>
                                            <p className="text-sm font-bold text-slate-400 uppercase tracking-[0.2em]">Cargando almacenes...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredRows.length === 0 ? (
                                <tr>
                                    <td colSpan={3} className="px-8 py-20 text-center">
                                        <div className="flex flex-col items-center gap-3 opacity-30">
                                            <FiBox size={40} className="text-slate-300" />
                                            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">No hay almacenes registrados</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredRows.map((row) => (
                                    <tr key={row.id} className="group/row hover:bg-slate-50/50 transition-all duration-300">
                                        <td className="px-8 py-4 border-b border-slate-50 transition-all group-hover/row:translate-x-1">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 group-hover/row:scale-110 transition-transform duration-500">
                                                    <FiHome size={14} />
                                                </div>
                                                <span className="text-[15px] font-black text-slate-700 uppercase tracking-tight">{row.nombre}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-4 border-b border-slate-50">
                                            {row.activo ? (
                                                <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full w-fit border border-emerald-100/50 shadow-sm">
                                                    <FiCheckCircle size={12} />
                                                    <span className="text-[11px] font-black uppercase tracking-widest">Disponible</span>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-2 px-3 py-1 bg-slate-100 text-slate-400 rounded-full w-fit border border-slate-200/50">
                                                    <FiXCircle size={12} />
                                                    <span className="text-[11px] font-black uppercase tracking-widest">Inactivo</span>
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-8 py-4 border-b border-slate-50 text-right">
                                            <div className="flex items-center justify-end gap-1 opacity-0 group-hover/row:opacity-100 transition-all duration-500 translate-x-4 group-hover/row:translate-x-0">
                                                <button
                                                    onClick={() => openEdit(row)}
                                                    className="p-2.5 rounded-xl text-blue-500 hover:bg-blue-500 hover:text-white hover:shadow-lg hover:shadow-blue-200 transition-all active:scale-90"
                                                >
                                                    <FiEdit2 size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(row)}
                                                    className="p-2.5 rounded-xl text-red-500 hover:bg-red-500 hover:text-white hover:shadow-lg hover:shadow-red-200 transition-all active:scale-90"
                                                >
                                                    <FiTrash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
