
import React, { useState, useEffect } from "react";
import {
    FiPlus, FiSearch, FiEdit2, FiTrash2, FiChevronLeft, FiSave, FiCreditCard, FiFileText, FiX, FiCheck, FiActivity, FiArrowLeft
} from "react-icons/fi";
import {
    collection, doc, getDocs, addDoc, updateDoc, deleteDoc, serverTimestamp, query, orderBy
} from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import Input from "../../components/ui/Input";

const COLLECTION_NAME = "condiciones_pago";

export default function ConfigCondicionesPago() {
    const { userProfile } = useAuth();
    const toast = useToast();
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [modalOpen, setModalOpen] = useState(false);
    const [currentItem, setCurrentItem] = useState(null);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchItems();
    }, [userProfile]);

    const fetchItems = async () => {
        if (!userProfile?.inquilino) return;
        setLoading(true);
        try {
            const q = query(
                collection(db, "tenants", userProfile.inquilino, COLLECTION_NAME),
                orderBy("nombre", "asc")
            );
            const snap = await getDocs(q);
            const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
            setItems(list);
        } catch (error) {
            console.error("Error fetching payment conditions:", error);
            toast.error("Error al cargar condiciones de pago");
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (item = null) => {
        if (item) {
            setCurrentItem({ ...item });
        } else {
            setCurrentItem({ nombre: "", admiteCredito: false });
        }
        setModalOpen(true);
    };

    const handleDelete = async (item) => {
        if (window.confirm(`¿Estás seguro de eliminar la condición "${item.nombre}"?`)) {
            try {
                await deleteDoc(doc(db, "tenants", userProfile.inquilino, COLLECTION_NAME, item.id));
                toast.success("Eliminado correctamente");
                fetchItems();
            } catch (error) {
                console.error("Error deleting:", error);
                toast.error("Error al eliminar");
            }
        }
    };

    const handleSave = async (e) => {
        if (e) e.preventDefault();
        if (!currentItem.nombre.trim()) {
            return toast.warning("El nombre es obligatorio");
        }
        setSaving(true);
        try {
            const payload = {
                nombre: currentItem.nombre.trim(),
                admiteCredito: currentItem.admiteCredito,
                updatedAt: serverTimestamp()
            };

            if (currentItem.id) {
                await updateDoc(doc(db, "tenants", userProfile.inquilino, COLLECTION_NAME, currentItem.id), payload);
                toast.success("Actualizado correctamente");
            } else {
                payload.createdAt = serverTimestamp();
                await addDoc(collection(db, "tenants", userProfile.inquilino, COLLECTION_NAME), payload);
                toast.success("Creado correctamente");
            }
            setModalOpen(false);
            fetchItems();
        } catch (error) {
            console.error("Error saving:", error);
            toast.error("Error al guardar");
        } finally {
            setSaving(false);
        }
    };

    const filteredItems = items.filter(i =>
        i.nombre.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-10 p-2 md:p-8">
            {/* Toolbar Premium */}
            <div className="bg-white rounded-[32px] border border-slate-200/50 shadow-[0_20px_60px_rgba(0,0,0,0.03)] hover:shadow-[0_35px_80px_rgba(0,0,0,0.06)] transition-all duration-700 overflow-hidden relative">
                <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-600 shadow-[1px_0_10px_rgba(37,99,235,0.15)]"></div>

                <div className="bg-slate-50/50 backdrop-blur-sm px-8 py-5 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center shadow-xl shadow-blue-200 group-hover:rotate-12 transition-transform duration-500">
                            <FiFileText size={24} className="text-white" />
                        </div>
                        <div>
                            <h2 className="text-[20px] font-black text-slate-800 uppercase tracking-tighter">Condiciones</h2>
                            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest opacity-80">Políticas de cobro y crédito</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="relative group">
                            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-all font-black" />
                            <input
                                type="text"
                                placeholder="Buscar políticas..."
                                className="w-full md:w-64 pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-[14px] font-extrabold text-slate-800 outline-none focus:border-blue-500 focus:ring-8 focus:ring-blue-500/5 transition-all shadow-sm"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        <button
                            onClick={() => handleOpenModal()}
                            className="bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-3 rounded-2xl text-[13px] font-black uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-emerald-200 transition-all active:scale-95 group/btn overflow-hidden relative"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:animate-shimmer" />
                            <FiPlus className="text-lg" /> Nueva política
                        </button>
                    </div>
                </div>
            </div>

            {/* Table Area (High Density) */}
            <div className="group/section bg-white rounded-[32px] border border-slate-200/50 shadow-[0_20px_60px_rgba(0,0,0,0.03)] overflow-hidden relative transition-all duration-700">
                <div className="p-0 overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="bg-slate-50/30">
                                <th className="px-8 py-4 text-left text-[11px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-100">Nombre de la Condición</th>
                                <th className="px-8 py-4 text-center text-[11px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-100">Admisión de Crédito</th>
                                <th className="px-8 py-4 text-right text-[11px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-100">Operaciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                <tr>
                                    <td colSpan={3} className="px-8 py-20 text-center">
                                        <div className="flex flex-col items-center gap-3 animate-pulse">
                                            <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-blue-500">
                                                <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                                            </div>
                                            <p className="text-sm font-bold text-slate-400 uppercase tracking-[0.2em]">Sincronizando políticas...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredItems.length === 0 ? (
                                <tr>
                                    <td colSpan={3} className="px-8 py-20 text-center opacity-30 font-black uppercase tracking-widest text-slate-400">
                                        Sin condiciones registradas
                                    </td>
                                </tr>
                            ) : (
                                filteredItems.map((item) => (
                                    <tr key={item.id} className="group hover:bg-slate-50/80 transition-all duration-300">
                                        <td className="px-8 py-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500 font-black text-[14px]">
                                                    {item.nombre.substring(0, 1).toUpperCase()}
                                                </div>
                                                <span className="text-[14px] font-extrabold text-slate-800 leading-tight group-hover:text-blue-600 transition-colors uppercase tracking-tight">{item.nombre}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-4 text-center">
                                            {item.admiteCredito ? (
                                                <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-600 px-3 py-1 rounded-lg font-black uppercase tracking-tighter text-[10px] border border-emerald-500/10">
                                                    <FiCheck size={10} /> Admite Crédito
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 bg-slate-50 text-slate-400 px-3 py-1 rounded-lg font-black uppercase tracking-tighter text-[10px] border border-slate-100 italic">Sólo Contado</span>
                                            )}
                                        </td>
                                        <td className="px-8 py-4 text-right">
                                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 -translate-x-2 group-hover:translate-x-0">
                                                <button
                                                    onClick={() => handleOpenModal(item)}
                                                    className="p-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-xl transition-all"
                                                    title="Editar"
                                                >
                                                    <FiEdit2 size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(item)}
                                                    className="p-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl transition-all"
                                                    title="Eliminar"
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

            {/* Modal de Edición (Glassmorphism) */}
            {modalOpen && currentItem && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm overflow-hidden">
                    <div className="bg-white w-full max-w-2xl rounded-[32px] shadow-2xl flex flex-col animate-scale-in relative border border-white/20">
                        {/* Header Modal */}
                        <div className="bg-slate-50/50 backdrop-blur-md px-8 py-5 border-b border-slate-100 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => setModalOpen(false)}
                                    className="w-10 h-10 rounded-xl border border-slate-200 bg-white flex items-center justify-center text-slate-500 hover:text-red-500 hover:border-red-200 hover:shadow-lg transition-all active:scale-90"
                                >
                                    <FiX size={20} />
                                </button>
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center shadow-xl shadow-blue-200">
                                    <FiFileText size={20} className="text-white" />
                                </div>
                                <div>
                                    <h3 className="text-[18px] font-black text-slate-800 uppercase tracking-tighter">
                                        {currentItem.id ? "Editar Política" : "Nueva Política"}
                                    </h3>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest opacity-80">Configuración de cobranza</p>
                                </div>
                            </div>
                        </div>

                        {/* Contenido Modal */}
                        <form onSubmit={handleSave} className="p-8 space-y-8">
                            <div className="space-y-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shadow-sm">
                                        <FiActivity size={16} />
                                    </div>
                                    <h4 className="text-[11px] font-black text-blue-600 uppercase tracking-[0.2em]">Información General</h4>
                                </div>

                                <div className="space-y-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nombre de la condición *</label>
                                        <Input
                                            value={currentItem.nombre}
                                            onChange={(e) => setCurrentItem({ ...currentItem, nombre: e.target.value })}
                                            placeholder="Ej: 30 Días, Contado, 50/50..."
                                            required
                                            className="bg-slate-50 border-slate-100 focus:bg-white focus:border-blue-500 rounded-2xl p-4 font-bold text-slate-700 transition-all shadow-inner-sm"
                                        />
                                    </div>

                                    <div className="bg-slate-50/50 rounded-2xl border border-slate-100 p-6 flex items-center justify-between group/toggle">
                                        <div className="flex flex-col gap-0.5">
                                            <span className="text-[13px] font-black text-slate-700 uppercase tracking-tight group-hover/toggle:text-blue-600 transition-colors">¿Admite Crédito?</span>
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed">Permite generar saldos pendientes en facturación</span>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                className="sr-only peer"
                                                checked={currentItem.admiteCredito}
                                                onChange={(e) => setCurrentItem({ ...currentItem, admiteCredito: e.target.checked })}
                                            />
                                            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 shadow-inner"></div>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </form>

                        {/* Footer Modal con botón de guardado flotante */}
                        <div className="p-8 flex justify-end">
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-4 rounded-[20px] text-[14px] font-black uppercase tracking-[0.2em] flex items-center gap-3 shadow-[0_15px_40px_rgba(37,99,235,0.4)] transition-all active:scale-95 group/float"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/float:animate-shimmer" />
                                <FiSave size={20} /> {saving ? "PROCESANDO..." : "GUARDAR POLÍTICA"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
