import React, { useState, useEffect } from "react";
// 
import { FiSearch, FiEdit2, FiEye, FiTrash2, FiDollarSign, FiUploadCloud, FiBox } from "react-icons/fi";
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, where } from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";
import { useAuth } from "../../context/AuthContext";
import ListaPreciosEditar from "./ListaPreciosEditar";
import ImportadorListaPrecios from "./ImportadorListaPrecios";
import ModalProducto from "./ModalProducto";

// Helper for formatting date
const formatDate = (isoString) => {
    if (!isoString) return "-";
    try {
        if (isoString.seconds) return new Date(isoString.seconds * 1000).toLocaleString("es-CO");
        return new Date(isoString).toLocaleString("es-CO");
    } catch (e) {
        return isoString;
    }
};

// MAIN COMPONENT
export default function EmpresaListaPrecios() {
    const { userProfile } = useAuth();
    const inquilino = userProfile?.inquilino;

    const [activeTab, setActiveTab] = useState("clinicos"); // clinicos, productos, servicios
    const [searchTerm, setSearchTerm] = useState("");
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(true);

    // View State: 'list' or 'editor'
    const [view, setView] = useState("list");
    const [selectedList, setSelectedList] = useState(null);

    // Modal State
    const [showModal, setShowModal] = useState(false); // Para nuevas listas
    const [showProductModal, setShowProductModal] = useState(false); // Para nuevos productos
    const [editItem, setEditItem] = useState(null); 
    const [formData, setFormData] = useState({ nombre: "" });
    const [showImporter, setShowImporter] = useState(false);

    const TABS = [
        { id: "clinicos", label: "Lista de precios clínicos" },
        { id: "productos", label: "Lista de precios productos" },
        { id: "servicios", label: "Lista de precios servicios" },
    ];

    // Fetch data on tab change
    const fetchData = async () => {
        if (!inquilino) return;
        setLoading(true);
        try {
            if (activeTab === "productos" || activeTab === "servicios") {
                let q = query(
                    collection(db, "productos"),
                    where("inquilino", "==", inquilino)
                );
                const snap = await getDocs(q);
                let data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                
                // Filtrar según pestaña actual
                data = data.filter(d => activeTab === "servicios" ? d.es_servicio === true : d.es_servicio !== true);
                
                data.sort((a, b) => (a.nombre || "").localeCompare(b.nombre || ""));
                setRows(data);
            } else {
                let q = query(
                    collection(db, "listas_precios"),
                    where("tipo", "==", activeTab),
                    where("inquilino", "==", inquilino)
                );
                const snap = await getDocs(q);
                const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                // Sort locally
                data.sort((a, b) => {
                    const da = a.creado?.seconds || 0;
                    const db = b.creado?.seconds || 0;
                    return db - da; // Descending
                });
                setRows(data);
            }
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        setSearchTerm("");
    }, [activeTab]);

    const handleSaveList = async () => {
        if (!formData.nombre.trim()) return alert("El nombre es obligatorio");
        if (!inquilino) return;

        try {
            if (editItem) {
                // Update
                await updateDoc(doc(db, "listas_precios", editItem.id), {
                    nombre: formData.nombre,
                    actualizado: new Date()
                });
                alert("Lista actualizada");
            } else {
                // Create
                await addDoc(collection(db, "listas_precios"), {
                    nombre: formData.nombre,
                    tipo: activeTab,
                    inquilino,
                    creado: new Date(),
                    actualizado: new Date(),
                    en_uso: false
                });
                alert("Lista creada");
            }
            setShowModal(false);
            setFormData({ nombre: "" });
            setEditItem(null);
            fetchData();
        } catch (e) {
            console.error(e);
            alert("Error al guardar: " + e.message);
        }
    };

    const handleSaveProduct = async (productData) => {
        setLoading(true);
        try {
            const dataToSave = {
                ...productData,
                inquilino,
                actualizado: new Date()
            };
            if (editItem) {
                await updateDoc(doc(db, "productos", editItem.id), dataToSave);
            } else {
                await addDoc(collection(db, "productos"), {
                    ...dataToSave,
                    creado: new Date()
                });
            }
            setShowProductModal(false);
            setEditItem(null);
            fetchData();
        } catch (e) {
            console.error(e);
            alert("Error al guardar producto: " + e.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (row) => {
        if (activeTab === "productos" || activeTab === "servicios") {
            if (!window.confirm(`¿Seguro eliminar el registro "${row.nombre}"?`)) return;
            try {
                await deleteDoc(doc(db, "productos", row.id));
                fetchData();
            } catch (e) {
                alert("Error al eliminar");
            }
        } else {
            if (!window.confirm(`¿Seguro eliminar lista "${row.nombre}"?`)) return;
            try {
                await deleteDoc(doc(db, "listas_precios", row.id));
                fetchData();
            } catch (e) {
                alert("Error al eliminar lista");
            }
        }
    };

    const handleEdit = (row) => {
        setEditItem(row);
        if (activeTab === "productos" || activeTab === "servicios") {
            setShowProductModal(true);
        } else {
            setFormData({ nombre: row.nombre });
            setShowModal(true);
        }
    };

    const handleEditor = (row) => {
        setSelectedList(row);
        setView("editor");
    };

    const handleNew = () => {
        if (activeTab === "productos" || activeTab === "servicios") {
            setEditItem({ es_servicio: activeTab === "servicios" });
            setShowProductModal(true);
        } else {
            setEditItem(null);
            setFormData({ nombre: "" });
            setShowModal(true);
        }
    };

    const filteredRows = rows.filter(r =>
        (r.nombre || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (r.codigo || "").toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (view === "editor" && selectedList) {
        return <ListaPreciosEditar listaId={selectedList.id} onBack={() => { setView("list"); setSelectedList(null); }} />;
    }

    return (
        <div className="p-4 w-full max-w-6xl mx-auto relative transition-all duration-300">
            {loading && (
                <div className="absolute top-4 right-4 z-50">
                    <div className="w-4 h-4 border-2 border-blue-600/20 border-t-blue-600 rounded-full animate-spin" />
                </div>
            )}

            {/* Header Toolbar */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                {/* Tabs Modernas */}
                <div className="flex bg-slate-100/50 p-1 rounded-2xl border border-slate-200/60 backdrop-blur-sm shadow-inner-sm">
                    {TABS.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-5 py-2 text-[13px] font-black uppercase tracking-widest rounded-xl transition-all duration-500 ${activeTab === tab.id
                                ? "bg-white text-blue-600 shadow-md ring-1 ring-slate-200/50 scale-[1.02]"
                                : "text-slate-400 hover:text-slate-600 hover:bg-white/50"
                                }`}
                        >
                            {tab.id === "clinicos" ? "Clínicos" : tab.id === "productos" ? "Productos" : "Servicios"}
                        </button>
                    ))}
                </div>

                <div className="flex items-center gap-4 w-full md:w-auto">
                    <div className="relative group w-full md:w-64">
                        <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors transition-all duration-300 group-focus-within:scale-110" />
                        <input
                            type="text"
                            placeholder={(activeTab === "productos" || activeTab === "servicios") ? "Buscar..." : "Buscar lista..."}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 transition-all shadow-sm"
                        />
                    </div>
                    {/* Botón de importación */}
                    <button
                        type="button"
                        className="relative group/btn overflow-hidden bg-white border border-slate-200 text-slate-500 hover:text-blue-600 font-black py-3 px-6 rounded-[20px] shadow-sm hover:shadow-md transition-all duration-300 active:scale-95 flex items-center gap-2 text-[11px] tracking-wider whitespace-nowrap uppercase"
                        onClick={() => setShowImporter(true)}
                    >
                        <FiUploadCloud size={16} /> <span>Importar Excel</span>
                    </button>
                    <button
                        type="button"
                        className="relative group/btn overflow-hidden bg-gradient-to-br from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-white font-black py-3 px-8 rounded-[20px] shadow-[0_15px_30px_rgba(16,185,129,0.2)] hover:shadow-[0_20px_40px_rgba(16,185,129,0.3)] transition-all duration-500 active:scale-95 flex items-center gap-2 text-sm tracking-wider whitespace-nowrap"
                        onClick={handleNew}
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover/btn:animate-[shimmer_2s_infinite]"></div>
                        <span className="relative z-10 uppercase tracking-[0.05em]">
                            {activeTab === "productos" ? "+ Nuevo Producto" : activeTab === "servicios" ? "+ Nuevo Servicio" : "+ Nueva Lista"}
                        </span>
                    </button>
                </div>
            </div>

            {/* Container Seccional */}
            <div className="group/section bg-white rounded-[32px] border border-slate-200/50 shadow-[0_20px_60px_rgba(0,0,0,0.03)] hover:shadow-[0_35px_80px_rgba(0,0,0,0.06)] transition-all duration-700 overflow-hidden relative">
                <div className="absolute top-0 left-0 w-1.5 h-full bg-cyan-500 shadow-[1px_0_10px_rgba(6,182,212,0.15)]"></div>

                <div className="bg-slate-50/50 backdrop-blur-sm px-8 py-4 border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-cyan-600 flex items-center justify-center shadow-xl shadow-cyan-200 transform group-hover/section:scale-105 transition-transform duration-500">
                            {(activeTab === "productos" || activeTab === "servicios") ? <FiBox className="text-white text-xl" /> : <FiDollarSign className="text-white text-xl" />}
                        </div>
                        <div>
                            <h3 className="text-[15px] font-black text-slate-800 uppercase tracking-[0.2em]">
                                {activeTab === "productos" ? "Catálogo Maestro de Productos" : activeTab === "servicios" ? "Catálogo de Servicios" : TABS.find(t => t.id === activeTab)?.label}
                            </h3>
                            <p className="text-[11px] font-bold text-slate-400 mt-0.5 uppercase tracking-widest opacity-80">
                                {activeTab === "productos" ? "Gestión global del inventario" : activeTab === "servicios" ? "Gestión global de servicios" : "Gestión de tarifarios institucionales"}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Table Area */}
                <div className="p-0 overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="bg-slate-50/30">
                                {(activeTab === "productos" || activeTab === "servicios") ? (
                                    <>
                                        <th className="px-8 py-4 text-left text-[11px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-100">Cód / Ref</th>
                                        <th className="px-8 py-4 text-left text-[11px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-100">Producto</th>
                                        <th className="px-8 py-4 text-left text-[11px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-100">Categoría</th>
                                        <th className="px-8 py-4 text-right text-[11px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-100">Precio Venta</th>
                                        <th className="px-8 py-4 text-right text-[11px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-100">Acciones</th>
                                    </>
                                ) : (
                                    <>
                                        <th className="px-8 py-4 text-left text-[11px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-100">Nombre</th>
                                        <th className="px-8 py-4 text-left text-[11px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-100">Creación</th>
                                        <th className="px-8 py-4 text-left text-[11px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-100">Actualización</th>
                                        <th className="px-8 py-4 text-left text-[11px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-100">Estado</th>
                                        <th className="px-8 py-4 text-right text-[11px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-100">Acciones</th>
                                    </>
                                )}
                            </tr>
                        </thead>
                        <tbody>
                            {loading && filteredRows.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-8 py-20 text-center">
                                        <div className="flex flex-col items-center gap-3 animate-pulse">
                                            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-blue-400">
                                                <div className="w-6 h-6 border-2 border-blue-600/20 border-t-blue-600 rounded-full animate-spin" />
                                            </div>
                                            <p className="text-sm font-bold text-slate-400 uppercase tracking-[0.2em]">Cargando...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredRows.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-8 py-20 text-center">
                                        <div className="flex flex-col items-center gap-3 opacity-40">
                                            {(activeTab === "productos" || activeTab === "servicios") ? <FiBox size={40} className="text-slate-400" /> : <FiDollarSign size={40} className="text-slate-400" />}
                                            <p className="text-sm font-bold text-slate-400">No hay registros disponibles</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (activeTab === "productos" || activeTab === "servicios") ? (
                                // TABLA DE PRODUCTOS / SERVICIOS
                                filteredRows.map((row) => (
                                    <tr key={row.id} className="group/row hover:bg-slate-50/50 transition-all duration-300">
                                        <td className="px-8 py-4 border-b border-slate-50">
                                            <span className="text-[12px] font-black text-slate-400 uppercase tracking-widest">{row.codigo || row.referencia || "-"}</span>
                                        </td>
                                        <td className="px-8 py-4 border-b border-slate-50 transition-all group-hover/row:translate-x-1">
                                            <span className="text-[14px] font-black text-slate-700 uppercase tracking-tight">{row.nombre}</span>
                                        </td>
                                        <td className="px-8 py-4 border-b border-slate-50">
                                            <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-blue-50 text-blue-500">
                                                {row.categoria || 'GENERAL'}
                                            </span>
                                        </td>
                                        <td className="px-8 py-4 border-b border-slate-50 text-right">
                                            <span className="text-[14px] font-black text-emerald-600">${Number(row.precio || 0).toLocaleString('es-CO')}</span>
                                        </td>
                                        <td className="px-8 py-4 border-b border-slate-50 text-right">
                                            <div className="flex items-center justify-end gap-1.5">
                                                <button
                                                    onClick={() => handleEdit(row)}
                                                    className="w-9 h-9 flex items-center justify-center rounded-xl bg-blue-50 text-blue-500 hover:bg-blue-500 hover:text-white transition-colors"
                                                    title="Editar Producto"
                                                >
                                                    <FiEdit2 size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(row)}
                                                    className="w-9 h-9 flex items-center justify-center rounded-xl bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white transition-colors"
                                                    title="Eliminar"
                                                >
                                                    <FiTrash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                // TABLA DE LISTAS
                                filteredRows.map((row) => (
                                    <tr key={row.id} className="group/row hover:bg-slate-50/50 transition-all duration-300">
                                        <td className="px-8 py-4 border-b border-slate-50 transition-all group-hover/row:translate-x-1">
                                            <div className="flex flex-col">
                                                <span className="text-[14px] font-black text-slate-700 group-hover/row:text-blue-600 transition-colors uppercase tracking-tight">{row.nombre}</span>
                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">ID: {row.id.substring(0, 8)}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-4 border-b border-slate-50">
                                            <span className="text-[12px] font-bold text-slate-600">{formatDate(row.creado)}</span>
                                        </td>
                                        <td className="px-8 py-4 border-b border-slate-50">
                                            <span className="text-[12px] font-bold text-slate-600">{formatDate(row.actualizado)}</span>
                                        </td>
                                        <td className="px-8 py-4 border-b border-slate-50">
                                            {row.en_uso ? (
                                                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                                    <span className="text-[10px] font-black text-emerald-600 uppercase tracking-tighter">En uso</span>
                                                </div>
                                            ) : (
                                                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-50 border border-slate-200">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Borrador</span>
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-8 py-4 border-b border-slate-50 text-right">
                                            <div className="flex items-center justify-end gap-1.5">
                                                <button
                                                    onClick={() => handleEditor(row)}
                                                    className="w-10 h-10 flex items-center justify-center rounded-xl bg-emerald-500 text-white shadow-lg shadow-emerald-200/50 hover:bg-emerald-600 transition-all"
                                                    title="Configurar Ítems"
                                                >
                                                    <FiEye size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleEdit(row)}
                                                    className="w-10 h-10 flex items-center justify-center rounded-xl bg-blue-500 text-white shadow-lg shadow-blue-200/50 hover:bg-blue-600 transition-all"
                                                    title="Renombrar"
                                                >
                                                    <FiEdit2 size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(row)}
                                                    className="w-10 h-10 flex items-center justify-center rounded-xl bg-rose-500 text-white shadow-lg shadow-rose-200/50 hover:bg-rose-600 transition-all"
                                                    title="Eliminar"
                                                >
                                                    <FiTrash2 size={18} />
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

            {/* Modal CRUD - Para Listas (Clínicos, Servicios) */}
            {showModal && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center z-[999] p-4 animate-in fade-in duration-500">
                    <div className="bg-white rounded-[32px] shadow-[0_50px_100px_rgba(0,0,0,0.15)] w-full max-w-md overflow-hidden border border-white/40 ring-1 ring-black/5 animate-in zoom-in-95 duration-500">
                        <div className="bg-slate-50/50 px-8 py-6 border-b border-slate-100 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-200">
                                    <FiDollarSign className="text-white text-lg" />
                                </div>
                                <h3 className="text-[17px] font-black text-slate-800 uppercase tracking-widest">{editItem ? "Editar Lista de Precios" : "Nueva Lista de Precios"}</h3>
                            </div>
                        </div>

                        <div className="p-8 space-y-6">
                            <div className="space-y-2">
                                <label className="text-[13px] font-black text-slate-600 uppercase tracking-widest ml-1">Nombre Descriptivo</label>
                                <input
                                    className="w-full px-6 py-4 bg-slate-100/30 border border-slate-200 rounded-[20px] text-[16px] font-extrabold text-slate-800 outline-none focus:bg-white focus:border-blue-500 focus:ring-8 focus:ring-blue-500/5 transition-all shadow-inner-sm"
                                    value={formData.nombre}
                                    onChange={e => setFormData({ ...formData, nombre: e.target.value })}
                                    placeholder="Ej. Tarifas Preferenciales 2026"
                                    autoFocus
                                />
                            </div>

                            <div className="flex justify-end gap-3 pt-4">
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="px-8 py-3 rounded-[20px] text-[13px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all active:scale-95"
                                >
                                    Descartar
                                </button>
                                <button
                                    onClick={handleSaveList}
                                    className="px-10 py-3 rounded-[20px] text-[13px] font-black uppercase tracking-widest bg-blue-600 text-white shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all active:scale-95 flex items-center gap-2"
                                >
                                    {editItem ? "Actualizar" : "Crear Lista"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Producto - Global */}
            {showProductModal && (
                <ModalProducto 
                    item={editItem}
                    categoria={editItem?.categoria || "GENERAL"}
                    onClose={() => setShowProductModal(false)}
                    onSave={handleSaveProduct}
                    loading={loading}
                />
            )}

            {/* Importer Modal */}
            {showImporter && (
                <ImportadorListaPrecios 
                    activeTab={activeTab}
                    onClose={() => setShowImporter(false)}
                    onComplete={() => {
                        fetchData();
                        setShowImporter(false);
                    }}
                />
            )}
        </div>
    );
}
