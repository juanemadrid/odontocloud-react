
import React, { useState, useEffect } from "react";
import {
    FiPlus, FiSearch, FiEdit2, FiTrash2, FiSave, FiX, FiBox, FiCheck, FiInfo, FiActivity
} from "react-icons/fi";
import {
    collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, orderBy, serverTimestamp
} from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";

export default function ConfigRecursosFisicos() {
    const { userProfile } = useAuth();
    const toast = useToast();

    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [modalOpen, setModalOpen] = useState(false);
    const [currentItem, setCurrentItem] = useState(null);

    const [formData, setFormData] = useState({
        nombre: "",
        descripcion: ""
    });

    useEffect(() => {
        if (userProfile?.inquilino) {
            loadItems();
        }
    }, [userProfile]);

    const loadItems = async () => {
        setLoading(true);
        try {
            const q = query(
                collection(db, "tenants", userProfile.inquilino, "recursos_fisicos"),
                orderBy("nombre", "asc")
            );
            const querySnapshot = await getDocs(q);
            const docs = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setItems(docs);
        } catch (error) {
            console.error("Error loading resources:", error);
            toast.error("Error al cargar recursos físicos");
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (item = null) => {
        if (item) {
            setCurrentItem(item);
            setFormData({
                nombre: item.nombre,
                descripcion: item.descripcion || ""
            });
        } else {
            setCurrentItem({ id: null });
            setFormData({ nombre: "", descripcion: "" });
        }
        setModalOpen(true);
    };

    const handleCloseModal = () => {
        setModalOpen(false);
        setCurrentItem(null);
        setFormData({ nombre: "", descripcion: "" });
    };

    const handleSave = async (e) => {
        e.preventDefault();
        if (!formData.nombre.trim()) {
            toast.warning("El nombre es obligatorio");
            return;
        }

        setSaving(true);
        try {
            const collectionRef = collection(db, "tenants", userProfile.inquilino, "recursos_fisicos");

            if (currentItem?.id) {
                await updateDoc(doc(collectionRef, currentItem.id), {
                    ...formData,
                    updatedAt: serverTimestamp()
                });
                toast.success("Recurso actualizado");
            } else {
                await addDoc(collectionRef, {
                    ...formData,
                    active: true,
                    createdAt: serverTimestamp(),
                    updatedAt: serverTimestamp()
                });
                toast.success("Recurso creado");
            }

            handleCloseModal();
            loadItems();
        } catch (error) {
            console.error("Error saving resource:", error);
            toast.error("Error al guardar");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("¿Está seguro de eliminar este recurso?")) return;

        setLoading(true);
        try {
            await deleteDoc(doc(db, "tenants", userProfile.inquilino, "recursos_fisicos", id));
            toast.success("Recurso eliminado");
            loadItems();
        } catch (error) {
            console.error("Error deleting resource:", error);
            toast.error("Error al eliminar");
        } finally {
            setLoading(false);
        }
    };

    const filteredItems = items.filter(item =>
        item.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.descripcion && item.descripcion.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="space-y-10 p-2 md:p-8">

            {/* Toolbar Premium */}
            <div className="bg-white rounded-[32px] border border-slate-200/50 shadow-[0_20px_60px_rgba(0,0,0,0.03)] hover:shadow-[0_35px_80px_rgba(0,0,0,0.06)] transition-all duration-700 overflow-hidden relative">
                <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-600 shadow-[1px_0_10px_rgba(37,99,235,0.15)]"></div>
                <div className="bg-slate-50/50 backdrop-blur-sm px-8 py-5 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center shadow-xl shadow-blue-200">
                            <FiBox size={24} className="text-white" />
                        </div>
                        <div>
                            <h2 className="text-[20px] font-black text-slate-800 uppercase tracking-tighter">Recursos Físicos</h2>
                            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest opacity-80">Gestión de consultorios y equipos</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="relative group/search">
                            <FiSearch size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-hover/search:text-blue-500 transition-colors" />
                            <input
                                type="text"
                                placeholder="BUSCAR RECURSOS..."
                                className="pl-12 pr-6 py-3 bg-white border border-slate-200 rounded-2xl text-[13px] font-bold text-slate-600 outline-none w-full md:w-72 focus:ring-4 focus:ring-blue-100 focus:border-blue-400 transition-all uppercase tracking-wider placeholder:text-slate-300 shadow-sm"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        <button
                            onClick={() => handleOpenModal()}
                            className="bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-3 rounded-2xl text-[13px] font-black uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-emerald-200 transition-all active:scale-95 group/btn overflow-hidden relative"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:animate-shimmer" />
                            <FiPlus className="text-lg" /> Nuevo recurso
                        </button>
                    </div>
                </div>
            </div>

            {/* Table Area (High Density) */}
            <div className="group/section bg-white rounded-[32px] border border-slate-200/50 shadow-[0_20px_60px_rgba(0,0,0,0.03)] overflow-hidden relative transition-all duration-700">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100">
                                <th className="px-8 py-5 text-left text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Recurso</th>
                                <th className="px-8 py-5 text-left text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Descripción</th>
                                <th className="px-8 py-5 text-right text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading && items.length === 0 ? (
                                <tr>
                                    <td colSpan="3" className="px-8 py-20 text-center">
                                        <div className="flex flex-col items-center">
                                            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
                                            <p className="text-[12px] font-black text-slate-400 uppercase tracking-widest">Cargando recursos...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredItems.length > 0 ? (
                                filteredItems.map((item) => (
                                    <tr key={item.id} className="group/row hover:bg-blue-50/30 transition-all duration-300">
                                        <td className="px-8 py-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover/row:bg-blue-600 group-hover/row:text-white transition-all duration-500 shadow-inner">
                                                    <FiBox size={18} />
                                                </div>
                                                <span className="text-[14px] font-black text-slate-700 uppercase tracking-tight group-hover/row:text-blue-700">
                                                    {item.nombre}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-4">
                                            <span className="text-[13px] font-bold text-slate-500 uppercase tracking-tight opacity-70">
                                                {item.descripcion || "Sin descripción"}
                                            </span>
                                        </td>
                                        <td className="px-8 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleOpenModal(item)}
                                                    className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-blue-600 hover:border-blue-200 hover:shadow-lg hover:shadow-blue-100 transition-all active:scale-90"
                                                >
                                                    <FiEdit2 size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(item.id)}
                                                    className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-red-600 hover:border-red-200 hover:shadow-lg hover:shadow-red-100 transition-all active:scale-90"
                                                >
                                                    <FiTrash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="3" className="px-8 py-24 text-center">
                                        <div className="flex flex-col items-center">
                                            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-200 mb-6 drop-shadow-inner">
                                                <FiBox size={40} />
                                            </div>
                                            <p className="text-[14px] font-black text-slate-400 uppercase tracking-[0.2em]">No se encontraron recursos</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal de Edición (Glassmorphism) */}
            {modalOpen && currentItem && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm overflow-hidden animate-in fade-in duration-300">
                    <div className="bg-white w-full max-w-xl rounded-[32px] shadow-2xl flex flex-col animate-in zoom-in-95 duration-500 relative border border-white/20">
                        {/* Shimmer on Modal Header */}
                        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-emerald-400 to-blue-600 rounded-t-[32px] opacity-80" />

                        <div className="bg-slate-50/80 backdrop-blur-md px-10 py-8 border-b border-slate-100 flex items-center justify-between rounded-t-[32px]">
                            <div className="flex items-center gap-5">
                                <div className="w-14 h-14 rounded-2xl bg-white shadow-xl flex items-center justify-center text-blue-600 border border-slate-100">
                                    <FiBox size={28} className="animate-pulse" />
                                </div>
                                <div>
                                    <h2 className="text-[20px] font-black text-slate-800 uppercase tracking-tighter">
                                        {currentItem.id ? "Editar Recurso" : "Nuevo Recurso"}
                                    </h2>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Configuración institucional</p>
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={handleCloseModal}
                                className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white hover:bg-red-50 text-slate-400 hover:text-red-500 transition-all border border-slate-100 hover:border-red-100 active:scale-90"
                            >
                                <FiX size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSave} className="p-10 space-y-8">
                            <div className="space-y-6">
                                <div className="space-y-2 group">
                                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 group-focus-within:text-blue-600 transition-colors">Nombre del recurso*</label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            required
                                            autoFocus
                                            placeholder="EJ: CONSULTORIO 1"
                                            className="w-full bg-slate-50 border border-slate-100 focus:bg-white focus:border-blue-500 rounded-2xl p-4 text-[14px] font-black text-slate-700 outline-none transition-all shadow-inner group-hover:border-slate-200"
                                            value={formData.nombre}
                                            onChange={(e) => setFormData({ ...formData, nombre: e.target.value.toUpperCase() })}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2 group">
                                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 group-focus-within:text-blue-600 transition-colors">Descripción / Observaciones</label>
                                    <textarea
                                        rows={4}
                                        placeholder="BREVE DESCRIPCIÓN DEL RECURSO O EQUIPO..."
                                        className="w-full bg-slate-50 border border-slate-100 focus:bg-white focus:border-blue-500 rounded-2xl p-4 text-[14px] font-bold text-slate-600 outline-none transition-all shadow-inner group-hover:border-slate-200 resize-none"
                                        value={formData.descripcion}
                                        onChange={(e) => setFormData({ ...formData, descripcion: e.target.value.toUpperCase() })}
                                    />
                                </div>
                            </div>

                            <div className="pt-4 flex justify-end">
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-5 rounded-[24px] text-[14px] font-black uppercase tracking-[0.2em] flex items-center gap-3 shadow-[0_20px_50px_rgba(37,99,235,0.4)] transition-all active:scale-95 group/save overflow-hidden relative border border-white/20"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/save:animate-shimmer" />
                                    {saving ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            GUARDANDO...
                                        </>
                                    ) : (
                                        <>
                                            <FiSave size={20} /> Guardar Recurso
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
