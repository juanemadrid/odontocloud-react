
import React, { useState, useEffect } from "react";
import { FiSearch, FiEdit2, FiTrash2, FiPlus, FiX, FiSave, FiSettings, FiPercent, FiActivity, FiTag } from "react-icons/fi";
import { collection, getDocs, query, orderBy, deleteDoc, doc, updateDoc, addDoc, serverTimestamp, onSnapshot } from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";

export default function ConfigImpuestos() {
    const { userProfile } = useAuth();
    const inquilino = userProfile?.inquilino;
    const toast = useToast();

    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    // Modal State
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        nombre: "",
        porcentaje: 0,
        operacion: "suma", // suma, resta
        aplicaA: "base",   // base, total, bruto
        tipoImpuesto: "ninguna" // ninguna, iva, reteiva, reterenta
    });

    useEffect(() => {
        if (!inquilino) return;

        setLoading(true);
        const q = query(
            collection(db, "tenants", inquilino, "impuestos"),
            orderBy("nombre", "asc")
        );

        const unsub = onSnapshot(q, (snap) => {
            setRows(snap.docs.map(d => ({ id: d.id, ...d.data() })));
            setLoading(false);
        }, (err) => {
            console.error(err);
            toast.error("Error al sincronizar impuestos");
            setLoading(false);
        });

        return () => unsub();
    }, [inquilino]);

    const handleSave = async () => {
        if (!formData.nombre.trim()) return toast.warning("Defina el nombre del impuesto");
        if (formData.porcentaje < 0) return toast.warning("El porcentaje no puede ser negativo");

        setSaving(true);
        try {
            const payload = {
                ...formData,
                nombre: formData.nombre,
                porcentaje: Number(formData.porcentaje),
                updatedAt: serverTimestamp(),
                updatedBy: userProfile.email
            };

            if (editingId) {
                await updateDoc(doc(db, "tenants", inquilino, "impuestos", editingId), payload);
                toast.success("Impuesto actualizado");
            } else {
                await addDoc(collection(db, "tenants", inquilino, "impuestos"), {
                    ...payload,
                    createdAt: serverTimestamp(),
                    createdBy: userProfile.email
                });
                toast.success("Registro tributario creado");
            }
            closeModal();
        } catch (e) {
            console.error(e);
            toast.error("Error al procesar la solicitud");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("¿Desea eliminar este impuesto de la configuración?")) return;
        try {
            await deleteDoc(doc(db, "tenants", inquilino, "impuestos", id));
            toast.success("Impuesto eliminado correctamente");
        } catch (e) {
            console.error(e);
            toast.error("Error al eliminar");
        }
    };

    const openModal = (item = null) => {
        if (item) {
            setEditingId(item.id);
            setFormData({
                nombre: item.nombre,
                porcentaje: item.porcentaje,
                operacion: item.operacion || "suma",
                aplicaA: item.aplicaA || "base",
                tipoImpuesto: item.tipoImpuesto || "ninguna"
            });
        } else {
            setEditingId(null);
            setFormData({
                nombre: "",
                porcentaje: 0,
                operacion: "suma",
                aplicaA: "base",
                tipoImpuesto: "ninguna"
            });
        }
        setShowModal(true);
    };

    const closeModal = () => setShowModal(false);

    const filtered = rows.filter(r => (r.nombre || "").toLowerCase().includes(searchTerm.toLowerCase()));

    return (
        <div className="space-y-10 p-2 md:p-8 text-left">

            {/* Toolbar Premium */}
            <div className="bg-white rounded-[32px] border border-slate-200/50 shadow-[0_20px_60px_rgba(0,0,0,0.03)] hover:shadow-[0_35px_80px_rgba(0,0,0,0.06)] transition-all duration-700 overflow-hidden relative">
                <div className="absolute top-0 left-0 w-1.5 h-full bg-lime-500 shadow-[1px_0_10px_rgba(132,204,22,0.15)]"></div>
                <div className="bg-slate-50/50 backdrop-blur-sm px-8 py-5 flex flex-col xl:flex-row xl:items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-lime-500 to-lime-600 flex items-center justify-center shadow-xl shadow-lime-200 group">
                            <FiPercent size={24} className="text-white group-hover:rotate-12 transition-transform" />
                        </div>
                        <div>
                            <h2 className="text-[20px] font-black text-slate-800 uppercase tracking-tighter">Impuestos y Retenciones</h2>
                            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest opacity-80">Configuración tributaria y comercial</p>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-4">
                        <div className="relative group/search">
                            <FiSearch size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-hover/search:text-lime-500 transition-colors" />
                            <input
                                type="text"
                                placeholder="BUSCAR IMPUESTO..."
                                className="pl-12 pr-6 py-3 bg-white border border-slate-200 rounded-2xl text-[13px] font-bold text-slate-600 outline-none w-full md:w-64 focus:ring-4 focus:ring-lime-100 focus:border-lime-400 transition-all uppercase tracking-wider placeholder:text-slate-300 shadow-sm"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        <button
                            onClick={() => openModal()}
                            className="bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-3 rounded-2xl text-[13px] font-black uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-emerald-200 transition-all active:scale-95 group/btn overflow-hidden relative"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:animate-shimmer" />
                            <FiPlus className="text-lg" /> Nuevo Registro
                        </button>
                    </div>
                </div>
            </div>

            {/* Table Area (High Density) */}
            <div className="bg-white rounded-[32px] border border-slate-200/50 shadow-[0_20px_60px_rgba(0,0,0,0.03)] overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100/60 font-mono text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">
                                <th className="px-10 py-5">Nombre del Impuesto</th>
                                <th className="px-10 py-5">Porcentaje</th>
                                <th className="px-10 py-5">Operación</th>
                                <th className="px-10 py-5">Aplica a</th>
                                <th className="px-10 py-5 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading && rows.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-10 py-24 text-center">
                                        <div className="flex flex-col items-center">
                                            <div className="w-10 h-10 border-4 border-lime-500 border-t-transparent rounded-full animate-spin mb-4" />
                                            <p className="text-[12px] font-black text-slate-400 uppercase tracking-widest">Sincronizando registros tributarios...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-10 py-24 text-center">
                                        <div className="flex flex-col items-center opacity-40">
                                            <FiTag size={48} className="text-slate-200 mb-6" />
                                            <p className="text-[14px] font-black text-slate-400 uppercase tracking-[0.2em]">No se encontraron impuestos</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filtered.map(row => (
                                    <tr key={row.id} className="group/row hover:bg-lime-50/30 transition-all duration-300">
                                        <td className="px-10 py-4">
                                            <div className="text-[14px] font-black text-slate-700 uppercase tracking-tight">
                                                {row.nombre}
                                            </div>
                                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                                {row.tipoImpuesto !== "ninguna" ? `CATEGORÍA: ${row.tipoImpuesto}` : "TRIBUTO GENERAL"}
                                            </div>
                                        </td>
                                        <td className="px-10 py-4">
                                            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-lime-50 text-lime-700 text-[13px] font-black tabular-nums border border-lime-100/50">
                                                {row.porcentaje}%
                                            </div>
                                        </td>
                                        <td className="px-10 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className={`w-2 h-2 rounded-full ${row.operacion === "suma" ? "bg-emerald-500" : "bg-red-500"} shadow-sm`} />
                                                <span className="text-[12px] font-black text-slate-500 uppercase tracking-wider">
                                                    {row.operacion === "suma" ? "SUMA / INCREMENTO" : "RESTA / RETENCIÓN"}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-10 py-4">
                                            <div className="text-[12px] font-bold text-slate-400 uppercase tracking-widest">
                                                APLICA AL <span className="text-slate-600 underline decoration-slate-200 underline-offset-4">{row.aplicaA}</span>
                                            </div>
                                        </td>
                                        <td className="px-10 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover/row:opacity-100 transition-all duration-500 translate-x-4 group-hover/row:translate-x-0">
                                                <button
                                                    className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-lime-600 hover:border-lime-200 hover:shadow-lg hover:shadow-lime-100 transition-all active:scale-90"
                                                    onClick={() => openModal(row)}
                                                >
                                                    <FiEdit2 size={16} />
                                                </button>
                                                <button
                                                    className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-red-500 hover:border-red-200 hover:shadow-lg hover:shadow-red-50 transition-all active:scale-90"
                                                    onClick={() => handleDelete(row.id)}
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

            {/* MODAL INSTITUCIONAL */}
            {showModal && (
                <div className="fixed inset-0 z-[5000] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-500" onClick={closeModal} />

                    <div className="relative w-full max-w-2xl bg-white rounded-[40px] shadow-[0_50px_100px_rgba(0,0,0,0.3)] overflow-hidden border border-white animate-in zoom-in-95 slide-in-from-bottom-10 duration-500">
                        {/* Modal Header */}
                        <div className="px-10 py-10 bg-slate-50/80 border-b border-slate-100 flex justify-between items-center relative">
                            <div className="absolute top-0 left-10 w-20 h-1.5 bg-lime-500 rounded-b-full shadow-[0_2px_10px_rgba(132,204,22,0.3)]" />
                            <div className="flex items-center gap-5">
                                <div className="w-16 h-16 rounded-[24px] bg-white shadow-xl flex items-center justify-center text-lime-600 border border-slate-100">
                                    <FiActivity size={32} />
                                </div>
                                <div>
                                    <h3 className="text-[24px] font-black text-slate-800 uppercase tracking-tighter leading-tight">
                                        {editingId ? "Variables de Impuesto" : "Vincular Nuevo Tributo"}
                                    </h3>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] opacity-70">
                                        Gestión contable y tributaria institucional
                                    </p>
                                </div>
                            </div>
                            <button onClick={closeModal} className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white border border-slate-100 text-slate-400 hover:text-red-500 hover:shadow-xl transition-all duration-300 active:scale-90">
                                <FiX size={24} />
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="p-12 space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="group/field col-span-2 md:col-span-1">
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 ml-1 group-focus-within/field:text-lime-500 transition-colors">NOMBRE DEL IMPUESTO *</label>
                                    <input
                                        className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-[14px] font-bold text-slate-700 outline-none focus:ring-4 focus:ring-lime-100 focus:border-lime-400 transition-all shadow-inner uppercase placeholder:text-slate-300"
                                        placeholder="EJ. IVA 19%"
                                        value={formData.nombre}
                                        onChange={e => setFormData({ ...formData, nombre: e.target.value })}
                                    />
                                </div>
                                <div className="group/field col-span-2 md:col-span-1">
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 ml-1 group-focus-within/field:text-lime-500 transition-colors">PORCENTAJE (%) *</label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-[14px] font-black text-slate-700 outline-none focus:ring-4 focus:ring-lime-100 focus:border-lime-400 transition-all shadow-inner tabular-nums"
                                            placeholder="0.00"
                                            value={formData.porcentaje}
                                            onChange={e => setFormData({ ...formData, porcentaje: e.target.value })}
                                        />
                                        <span className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300 font-black">%</span>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="group/field">
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 ml-1">OPERACIÓN *</label>
                                    <select
                                        className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-[13px] font-bold text-slate-700 outline-none focus:ring-4 focus:ring-lime-100 focus:border-lime-400 transition-all shadow-inner appearance-none bg-no-repeat"
                                        value={formData.operacion}
                                        onChange={e => setFormData({ ...formData, operacion: e.target.value })}
                                    >
                                        <option value="suma">SUMA (+)</option>
                                        <option value="resta">RESTA (-)</option>
                                    </select>
                                </div>
                                <div className="group/field">
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 ml-1">APLICA A *</label>
                                    <select
                                        className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-[13px] font-bold text-slate-700 outline-none focus:ring-4 focus:ring-lime-100 focus:border-lime-400 transition-all shadow-inner appearance-none"
                                        value={formData.aplicaA}
                                        onChange={e => setFormData({ ...formData, aplicaA: e.target.value })}
                                    >
                                        <option value="base">VALOR BASE</option>
                                        <option value="total">TOTAL FINAL</option>
                                        <option value="bruto">VALOR BRUTO</option>
                                    </select>
                                </div>
                                <div className="group/field">
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 ml-1">TIPO FISCAL</label>
                                    <select
                                        className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-[13px] font-bold text-slate-700 outline-none focus:ring-4 focus:ring-lime-100 focus:border-lime-400 transition-all shadow-inner appearance-none"
                                        value={formData.tipoImpuesto}
                                        onChange={e => setFormData({ ...formData, tipoImpuesto: e.target.value })}
                                    >
                                        <option value="ninguna">GENÉRICO</option>
                                        <option value="iva">IVA</option>
                                        <option value="reteiva">RETE-IVA</option>
                                        <option value="reterenta">RETE-RENTA</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="px-12 py-10 bg-slate-50 border-t border-slate-100 flex justify-end gap-5">
                            <button
                                onClick={closeModal}
                                className="px-10 py-5 rounded-3xl text-[13px] font-black text-slate-400 uppercase tracking-widest hover:bg-slate-200 transition-all active:scale-95"
                            >
                                Descartar
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="bg-emerald-500 hover:bg-emerald-600 text-white px-12 py-5 rounded-3xl text-[13px] font-black uppercase tracking-widest flex items-center gap-3 shadow-2xl shadow-emerald-200 transition-all active:scale-95 group/save relative overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/save:animate-shimmer" />
                                {saving ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        PROCESANDO...
                                    </>
                                ) : (
                                    <>
                                        <FiSave className="text-xl" /> Confirmar Datos
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
