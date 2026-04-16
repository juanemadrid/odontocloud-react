import React, { useState, useEffect } from "react";
import { FiSearch, FiEdit2, FiTrash2, FiPlus, FiCheckCircle, FiCreditCard, FiDollarSign, FiRefreshCw, FiArrowLeft, FiSave, FiInfo, FiLayers, FiXCircle } from "react-icons/fi";
import { collection, getDocs, addDoc, updateDoc, doc, query, orderBy, where } from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";
import { useAuth } from "../../context/AuthContext";

// Editor Component
function MetodoPagoEditor({ item, onBack, inquilino }) {
    const [form, setForm] = useState({
        nombre: item?.nombre || "",
        requiereReferencia: item?.requiereReferencia || false,
        activo: item?.activo !== undefined ? item.activo : true,
        bancoId: item?.bancoId || ""
    });

    const [bancos, setBancos] = useState([]);

    useEffect(() => {
        const load = async () => {
            if (!inquilino) return;
            const snap = await getDocs(query(
                collection(db, "bancos"),
                where("inquilino", "==", inquilino),
                orderBy("nombre", "asc")
            ));
            setBancos(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        };
        load();
    }, [inquilino]);

    const handleChange = (field, val) => {
        setForm(prev => ({ ...prev, [field]: val }));
    };

    const handleSave = async () => {
        if (!form.nombre.trim()) return alert("El nombre es obligatorio");
        try {
            const bancoObj = bancos.find(b => b.id === form.bancoId);
            const payload = {
                ...form,
                inquilino,
                bancoNombre: bancoObj?.nombre || "",
                actualizado: new Date()
            };

            if (item?.id) {
                await updateDoc(doc(db, "metodos_pago", item.id), payload);
                alert("Método de pago actualizado");
            } else {
                await addDoc(collection(db, "metodos_pago"), {
                    ...payload,
                    creado: new Date()
                });
                alert("Método de pago creado");
            }
            onBack();
        } catch (e) {
            console.error(e);
            alert("Error al guardar: " + e.message);
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
                            <FiCreditCard size={20} className="text-white" />
                        </div>
                        <div className="flex flex-col">
                            <h2 className="text-[18px] font-black text-slate-800 uppercase tracking-tighter">
                                {item ? "Editar Método" : "Nuevo Método"}
                            </h2>
                            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest opacity-80">Configuración de cobro</p>
                        </div>
                    </div>

                </div>
            </div>

            {/* Editor Body */}
            <div className="bg-white rounded-[32px] border border-slate-200/50 shadow-[0_15px_40px_rgba(0,0,0,0.02)] p-10 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full blur-3xl -mr-16 -mt-16 opacity-50"></div>

                <div className="space-y-8 relative">
                    <div className="grid md:grid-cols-2 gap-8">
                        {/* Name Field */}
                        <div className="space-y-2">
                            <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.15em] ml-1">Nombre del Método *</label>
                            <div className="relative group">
                                <FiDollarSign className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-all font-black" />
                                <input
                                    className="w-full pl-16 pr-6 py-4 bg-slate-100/30 border border-slate-200 rounded-2xl text-[16px] font-bold text-slate-800 outline-none focus:bg-white focus:border-blue-500 focus:ring-8 focus:ring-blue-500/5 transition-all shadow-inner-sm"
                                    value={form.nombre}
                                    onChange={e => handleChange("nombre", e.target.value)}
                                    placeholder="Ej: Transferencia Bancaria"
                                    autoFocus
                                />
                            </div>
                        </div>

                        {/* Banco Field */}
                        <div className="space-y-2">
                            <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.15em] ml-1">Banco / Caja Destino</label>
                            <div className="relative group">
                                <FiLayers className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-all font-black" />
                                <select
                                    className="w-full pl-16 pr-6 py-4 bg-slate-100/30 border border-slate-200 rounded-2xl text-[16px] font-bold text-slate-800 outline-none focus:bg-white focus:border-blue-500 focus:ring-8 focus:ring-blue-500/5 transition-all shadow-inner-sm appearance-none"
                                    value={form.bancoId}
                                    onChange={(e) => handleChange("bancoId", e.target.value)}
                                >
                                    <option value="">-- Ninguno / Caja General --</option>
                                    {bancos.map(b => (
                                        <option key={b.id} value={b.id}>{b.nombre} - {b.numeroCuenta}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Referencia Toggle */}
                    <div className="bg-slate-50/50 p-6 rounded-[24px] border border-slate-100 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 shadow-sm">
                                <FiInfo size={20} />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[14px] font-black text-slate-700 uppercase tracking-tight">Solicitar Referencia</span>
                                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest leading-tight">Obliga el ingreso de un código de transacción</p>
                            </div>
                        </div>

                        <div
                            onClick={() => handleChange("requiereReferencia", !form.requiereReferencia)}
                            className={`w-14 h-8 rounded-full p-1 cursor-pointer transition-all duration-300 ${form.requiereReferencia ? 'bg-blue-600 shadow-lg shadow-blue-200' : 'bg-slate-200'}`}
                        >
                            <div className={`w-6 h-6 bg-white rounded-full shadow-md transform transition-all duration-300 ${form.requiereReferencia ? 'translate-x-6' : 'translate-x-0'}`} />
                        </div>
                    </div>

                    <div className="pt-8 border-t border-slate-50 flex justify-end">
                        <button
                            className="bg-slate-900 hover:bg-black text-white px-10 py-3 rounded-[20px] text-[13px] font-black uppercase tracking-[0.2em] shadow-[0_15px_45px_rgba(0,0,0,0.15)] hover:shadow-[0_20px_60px_rgba(0,0,0,0.2)] transition-all duration-700 active:scale-95 flex items-center gap-3 overflow-hidden relative group"
                            onClick={handleSave}
                        >
                            <div className="absolute inset-0 bg-blue-600 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                            <FiSave size={18} className="relative z-10 group-hover:rotate-12 transition-transform duration-500" />
                            <span className="relative z-10 font-bold">GUARDAR MÉTODO</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// List Component
export default function EmpresaMetodosPago() {
    const { userProfile } = useAuth();
    const inquilino = userProfile?.inquilino;

    const [searchTerm, setSearchTerm] = useState("");
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(false);
    const [view, setView] = useState("list");
    const [editingItem, setEditingItem] = useState(null);
    const [showInactive, setShowInactive] = useState(false);

    const fetchData = async () => {
        if (!inquilino) return;
        setLoading(true);
        try {
            const q = query(
                collection(db, "metodos_pago"),
                where("inquilino", "==", inquilino),
                orderBy("nombre", "asc")
            );
            const snap = await getDocs(q);
            setRows(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
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

    const handleToggleActive = async (row) => {
        const newStatus = !row.activo;
        const action = newStatus ? "Restaurar" : "Inactivar";
        if (!window.confirm(`¿${action} método de pago "${row.nombre}"?`)) return;
        try {
            await updateDoc(doc(db, "metodos_pago", row.id), { activo: newStatus });
            setRows(prev => prev.map(r => r.id === row.id ? { ...r, activo: newStatus } : r));
        } catch (e) {
            console.error(e);
        }
    };

    if (view === "editor") {
        return <MetodoPagoEditor item={editingItem} onBack={() => { setView("list"); fetchData(); }} inquilino={inquilino} />;
    }

    const filteredRows = rows.filter(r => {
        const matchesSearch = (r.nombre || "").toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = showInactive ? !r.activo : (r.activo !== false);
        return matchesSearch && matchesStatus;
    });

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
                            <FiCreditCard className="text-white text-xl" />
                        </div>
                        <div>
                            <h2 className="text-[20px] font-black text-slate-800 uppercase tracking-tighter">Métodos de Pago</h2>
                            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest opacity-80">Gestión de cobros y finanzas</p>
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

                        {/* Status Toggle */}
                        <button
                            onClick={() => setShowInactive(!showInactive)}
                            className={`px-6 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all active:scale-95 shadow-lg flex items-center gap-2 ${showInactive
                                ? "bg-slate-700 text-white shadow-slate-200"
                                : "bg-white text-slate-400 border border-slate-200 hover:border-slate-300"
                                }`}
                        >
                            <FiRefreshCw className={`${showInactive ? "animate-spin-slow" : ""}`} />
                            {showInactive ? "Ver Activos" : "Ver Inactivos"}
                        </button>

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
                                <th className="px-8 py-4 text-left text-[11px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-100">Nombre</th>
                                <th className="px-8 py-4 text-left text-[11px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-100">Banco / Destino</th>
                                <th className="px-8 py-4 text-center text-[11px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-100">Referencia</th>
                                <th className="px-8 py-4 text-right text-[11px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-100">Estado / Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={4} className="px-8 py-20 text-center text-slate-400 font-bold uppercase tracking-widest animate-pulse">
                                        Cargando métodos...
                                    </td>
                                </tr>
                            ) : filteredRows.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-8 py-20 text-center text-slate-300 font-bold uppercase tracking-widest opacity-50">
                                        No se encontraron registros
                                    </td>
                                </tr>
                            ) : (
                                filteredRows.map((row) => (
                                    <tr key={row.id} className="group/row hover:bg-slate-50/50 transition-all duration-300">
                                        <td className="px-8 py-4 border-b border-slate-50 transition-all group-hover/row:translate-x-1">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 group-hover/row:scale-110 transition-transform duration-500">
                                                    <FiDollarSign size={14} />
                                                </div>
                                                <span className="text-[15px] font-black text-slate-700 uppercase tracking-tight">{row.nombre}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-4 border-b border-slate-50">
                                            <span className="text-[13px] font-bold text-slate-500 uppercase">{row.bancoNombre || "-"}</span>
                                        </td>
                                        <td className="px-8 py-4 border-b border-slate-50 text-center">
                                            <div className={`inline-flex px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${row.requiereReferencia ? "bg-blue-50 text-blue-600 border border-blue-100" : "bg-slate-50 text-slate-400 border border-slate-100"
                                                }`}>
                                                {row.requiereReferencia ? "Requerida" : "No aplica"}
                                            </div>
                                        </td>
                                        <td className="px-8 py-4 border-b border-slate-50 text-right">
                                            <div className="flex items-center justify-end gap-2 group-hover/row:translate-x-0 transition-all duration-500 translate-x-4 opacity-0 group-hover/row:opacity-100">
                                                <button
                                                    onClick={() => openEdit(row)}
                                                    className="p-2.5 rounded-xl text-blue-500 hover:bg-blue-500 hover:text-white hover:shadow-lg hover:shadow-blue-200 transition-all active:scale-90"
                                                >
                                                    <FiEdit2 size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleToggleActive(row)}
                                                    className={`p-2.5 rounded-xl transition-all active:scale-90 ${row.activo === false
                                                        ? "text-emerald-500 hover:bg-emerald-500 hover:text-white hover:shadow-emerald-200"
                                                        : "text-red-500 hover:bg-red-500 hover:text-white hover:shadow-red-200"
                                                        }`}
                                                >
                                                    {row.activo === false ? <FiCheckCircle size={16} /> : <FiTrash2 size={16} />}
                                                </button>
                                            </div>
                                            <div className={`px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full w-fit ml-auto border border-emerald-100/50 shadow-sm transition-all group-hover/row:opacity-0 ${row.activo === false ? 'opacity-0' : ''}`}>
                                                <span className="text-[10px] font-black uppercase tracking-widest">Activo</span>
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
