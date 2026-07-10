import React, { useState, useEffect } from "react";
import { FiSearch, FiEdit2, FiTrash2, FiPlus, FiCreditCard, FiDollarSign, FiArrowLeft, FiSave, FiInfo, FiHash, FiCalendar, FiBox, FiCheckCircle } from "react-icons/fi";
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, orderBy, where } from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";
import { useAuth } from "../../context/AuthContext";

// Editor Component
function BancoEditor({ item, onBack, inquilino }) {
    const [form, setForm] = useState({
        nombre: item?.nombre || "",
        numeroCuenta: item?.numeroCuenta || "",
        metodoPagoId: item?.metodoPagoId || "",
        valor: item?.valor || 0,
        fecha: item?.fecha || new Date().toISOString().split('T')[0],
        descripcion: item?.descripcion || ""
    });

    const [metodosPago, setMetodosPago] = useState([]);

    useEffect(() => {
        const load = async () => {
            if (!inquilino) return;
            try {
                const snap = await getDocs(query(
                    collection(db, "metodos_pago"),
                    where("inquilino", "==", inquilino)
                ));
                const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
                list.sort((a, b) => (a.nombre || "").localeCompare(b.nombre || ""));
                setMetodosPago(list);
            } catch (e) { console.error(e); }
        };
        load();
    }, [inquilino]);

    const handleChange = (field, val) => {
        setForm(prev => ({ ...prev, [field]: val }));
    };

    const handleSave = async () => {
        if (!form.nombre.trim()) return alert("El nombre es obligatorio");
        try {
            const payload = { ...form, inquilino, actualizado: new Date() };
            if (item?.id) {
                await updateDoc(doc(db, "bancos", item.id), payload);
                alert("Banco actualizado");
            } else {
                await addDoc(collection(db, "bancos"), { ...payload, creado: new Date() });
                alert("Banco creado");
            }
            onBack();
        } catch (e) { console.error(e); }
    };

    return (
        <div className="p-6 w-full max-w-4xl mx-auto transition-all duration-300 space-y-6">
            
            {/* Header: Title, Breadcrumbs & Save Button */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <button
                        onClick={onBack}
                        className="w-10 h-10 rounded-xl border border-slate-200 bg-white flex items-center justify-center text-slate-500 hover:text-blue-600 hover:border-blue-200 hover:shadow-lg transition-all active:scale-90"
                    >
                        <FiArrowLeft size={18} />
                    </button>
                    <div>
                        <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                            <span>Configuración</span>
                            <span className="text-slate-200">/</span>
                            <span>Bancos</span>
                            <span className="text-slate-200">/</span>
                            <span className="text-slate-800">{item ? "Editar banco" : "Nuevo banco"}</span>
                        </div>
                        <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight leading-none mt-1">
                            {item ? "Editar banco" : "Nuevo banco"}
                        </h2>
                    </div>
                </div>

                <div>
                    <button
                        onClick={handleSave}
                        className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full text-xs font-bold uppercase tracking-wider shadow-lg shadow-emerald-100 transition-all active:scale-95"
                    >
                        Guardar
                    </button>
                </div>
            </div>

            {/* Form Card */}
            <div className="bg-white rounded-[24px] border border-slate-100 shadow-[0_8px_30px_rgba(0,0,0,0.02)] overflow-hidden">
                <div className="px-8 py-5 border-b border-slate-100 bg-slate-50/10">
                    <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">Información básica</h3>
                </div>

                <div className="p-8 space-y-6">
                    {/* Rows */}
                    {[
                        {
                            label: "Nombre *",
                            element: (
                                <input
                                    type="text"
                                    placeholder="Nombre del banco"
                                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 transition-all"
                                    value={form.nombre}
                                    onChange={e => handleChange("nombre", e.target.value)}
                                    autoFocus
                                />
                            )
                        },
                        {
                            label: "Número de cuenta",
                            element: (
                                <input
                                    type="text"
                                    placeholder="Número de cuenta del banco"
                                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 transition-all"
                                    value={form.numeroCuenta}
                                    onChange={e => handleChange("numeroCuenta", e.target.value)}
                                />
                            )
                        },
                        {
                            label: "Medio de pago *",
                            element: (
                                <select
                                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 transition-all"
                                    value={form.metodoPagoId}
                                    onChange={e => handleChange("metodoPagoId", e.target.value)}
                                >
                                    <option value="">Seleccione...</option>
                                    {metodosPago.map(m => (
                                        <option key={m.id} value={m.id}>{m.nombre}</option>
                                    ))}
                                </select>
                            )
                        },
                        {
                            label: "Valor",
                            element: (
                                <input
                                    type="number"
                                    placeholder="Valor inicial"
                                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 transition-all"
                                    value={form.valor}
                                    onChange={e => handleChange("valor", Number(e.target.value))}
                                />
                            )
                        },
                        {
                            label: "Fecha *",
                            element: (
                                <input
                                    type="date"
                                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 transition-all"
                                    value={form.fecha}
                                    onChange={e => handleChange("fecha", e.target.value)}
                                />
                            )
                        },
                        {
                            label: "Descripción",
                            element: (
                                <textarea
                                    placeholder="Descripción del banco"
                                    rows={3}
                                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 transition-all resize-none"
                                    value={form.descripcion}
                                    onChange={e => handleChange("descripcion", e.target.value)}
                                />
                            )
                        }
                    ].map((row, idx) => (
                        <div key={idx} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                            <span className="text-xs font-black text-slate-500 uppercase tracking-wider md:text-right md:pr-6">
                                {row.label}
                            </span>
                            <div className="md:col-span-2">
                                {row.element}
                            </div>
                        </div>
                    ))}

                    {/* Bottom Save Button */}
                    <div className="pt-6 border-t border-slate-50 flex justify-end">
                        <button
                            onClick={handleSave}
                            className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full text-xs font-bold uppercase tracking-wider shadow-lg shadow-emerald-100 transition-all active:scale-95"
                        >
                            Guardar
                        </button>
                    </div>

                </div>
            </div>

        </div>
    );
}

export default function EmpresaBancos() {
    const { userProfile } = useAuth();
    const inquilino = userProfile?.inquilino;
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(false);
    const [view, setView] = useState("list");
    const [editingItem, setEditingItem] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");

    const fetchData = async () => {
        if (!inquilino) return;
        setLoading(true);
        try {
            const q = query(collection(db, "bancos"), where("inquilino", "==", inquilino));
            const snap = await getDocs(q);
            const list = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            list.sort((a, b) => (a.nombre || "").localeCompare(b.nombre || ""));
            setRows(list);
        } catch (error) { console.error(error); } finally { setLoading(false); }
    };

    useEffect(() => { fetchData(); }, [inquilino]);

    const handleDelete = async (row) => {
        if (!window.confirm(`¿Eliminar?`)) return;
        try {
            await deleteDoc(doc(db, "bancos", row.id));
            setRows(prev => prev.filter(r => r.id !== row.id));
        } catch (e) { console.error(e); }
    };

    if (view === "editor") return <BancoEditor item={editingItem} onBack={() => { setView("list"); fetchData(); }} inquilino={inquilino} />;

    const filteredRows = rows.filter(r =>
        (r.nombre || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (r.numeroCuenta || "").toLowerCase().includes(searchTerm.toLowerCase())
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
                            <FiCreditCard className="text-white text-xl" />
                        </div>
                        <div>
                            <h2 className="text-[20px] font-black text-slate-800 uppercase tracking-tighter">Bancos y Cajas</h2>
                            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest opacity-80">Gestión de recursos financieros</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        {/* Search Input */}
                        <div className="relative group flex-1 md:flex-none">
                            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-all font-black" />
                            <input
                                type="text"
                                placeholder="Buscar banco o cuenta..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full md:w-64 pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-[14px] font-extrabold text-slate-800 outline-none focus:border-blue-500 focus:ring-8 focus:ring-blue-500/5 transition-all shadow-sm"
                            />
                        </div>

                        {/* New Button */}
                        <button
                            onClick={() => { setEditingItem(null); setView("editor"); }}
                            className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-2xl text-[13px] font-black uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-emerald-200 transition-all active:scale-95 group/btn overflow-hidden relative"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:animate-shimmer" />
                            <FiPlus className="text-lg" /> Nuevo Banco
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
                                <th className="px-8 py-4 text-left text-[11px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-100">Entidad</th>
                                <th className="px-8 py-4 text-left text-[11px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-100">Número de Cuenta</th>
                                <th className="px-8 py-4 text-left text-[11px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-100">Saldo Actual</th>
                                <th className="px-8 py-4 text-right text-[11px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-100">Operaciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={4} className="px-8 py-20 text-center">
                                        <div className="flex flex-col items-center gap-3 animate-pulse">
                                            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-blue-400">
                                                <div className="w-6 h-6 border-2 border-blue-600/20 border-t-blue-600 rounded-full animate-spin" />
                                            </div>
                                            <p className="text-sm font-bold text-slate-400 uppercase tracking-[0.2em]">Sincronizando cuentas...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredRows.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-8 py-20 text-center opacity-30 font-black uppercase tracking-widest text-slate-400">
                                        Sin registros financieros
                                    </td>
                                </tr>
                            ) : (
                                filteredRows.map((row) => (
                                    <tr key={row.id} className="group/row hover:bg-slate-50/50 transition-all duration-300">
                                        <td className="px-8 py-4 border-b border-slate-50 transition-all group-hover/row:translate-x-1">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 group-hover/row:scale-110 transition-transform duration-500">
                                                    <FiCreditCard size={14} />
                                                </div>
                                                <span className="text-[15px] font-black text-slate-700 uppercase tracking-tight">{row.nombre}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-4 border-b border-slate-50 font-bold text-slate-500 tracking-wider">
                                            {row.numeroCuenta || "CAJA-GRAL"}
                                        </td>
                                        <td className="px-8 py-4 border-b border-slate-50">
                                            <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full w-fit border border-emerald-100/50 shadow-sm">
                                                <FiDollarSign size={12} />
                                                <span className="text-[13px] font-black tracking-tight">
                                                    {new Intl.NumberFormat('es-CO').format(row.valor || 0)}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-4 border-b border-slate-50 text-right">
                                            <div className="flex items-center justify-end gap-1 opacity-0 group-hover/row:opacity-100 transition-all duration-500 translate-x-4 group-hover/row:translate-x-0">
                                                <button
                                                    onClick={() => { setEditingItem(row); setView("editor"); }}
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
