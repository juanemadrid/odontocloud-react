
import React, { useState, useEffect, useMemo } from "react";
import * as XLSX from "xlsx";
import { 
    FiArrowLeft, FiPlus, FiTrash2, FiEdit3, FiSave, FiX, FiSearch, FiCheck, 
    FiChevronDown, FiChevronRight, FiPercent, FiPlusCircle, FiDownload 
} from "react-icons/fi";
import { 
    collection, getDocs, doc, addDoc, updateDoc, deleteDoc, query, 
    orderBy, serverTimestamp, getDoc 
} from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";
import { useAuth } from "../../context/AuthContext";
import { CUPS_DENTAL_CODES } from "../../data/cupsCodes";
import ModalProducto from "./ModalProducto";

export default function ListaPreciosEditar({ listaId, onBack }) {
    const { userProfile } = useAuth();
    const inquilino = userProfile?.inquilino;

    const [listData, setListData] = useState(null);
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [expandedCats, setExpandedCats] = useState(new Set());
    
    // Edit state for List Name
    const [isEditingName, setIsEditingName] = useState(false);
    const [tempName, setTempName] = useState("");

    // Modal & Form State
    const [showModal, setShowModal] = useState(false);
    const [currentItem, setCurrentItem] = useState(null); // null for new, item object for edit
    const [targetCat, setTargetCat] = useState(null);
    
    const initialItemState = {
        nombre: "",
        codigo: "",
        precio: "",
        observaciones: "",
        pago_fijo_doctor: "",
        usar_pago_fijo: false,
        permite_descuento: false,
        max_descuento_porcentaje: "",
        max_descuento_valor: "",
        genera_rips: false,
        es_consulta: false,
        ver_en_agenda: false,
        nombre_agenda: "",
        tiempo: 30,
        identificador_agenda: "",
        ver_en_agenda_online: false
    };

    const [formData, setFormData] = useState(initialItemState);

    // CUPS Search UI State
    const [cupsQuery, setCupsQuery] = useState("");
    const [showCupsDropdown, setShowCupsDropdown] = useState(false);
    
    // Memoized filtering for CUPS
    const filteredCUPS = useMemo(() => {
        if (!cupsQuery || cupsQuery.length < 2) return [];
        const q = cupsQuery.toLowerCase();
        return CUPS_DENTAL_CODES.filter(c => 
            c.code.toLowerCase().includes(q) || 
            c.name.toLowerCase().includes(q)
        ).slice(0, 15);
    }, [cupsQuery]);

    const fetchListInfo = async () => {
        const docSnap = await getDoc(doc(db, "listas_precios", listaId));
        if (docSnap.exists()) {
            setListData({ id: docSnap.id, ...docSnap.data() });
            setTempName(docSnap.data().nombre);
        }
    };

    const fetchItems = async () => {
        if (!listaId) return;
        setLoading(true);
        try {
            const q = query(
                collection(db, "listas_precios", listaId, "items")
            );
            const snap = await getDocs(q);
            const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
            
            // Sort in memory to avoid Firebase Composite Index requirement
            data.sort((a, b) => {
                const catA = (a.categoria || "GENERAL").toUpperCase();
                const catB = (b.categoria || "GENERAL").toUpperCase();
                if (catA < catB) return -1;
                if (catA > catB) return 1;
                
                const nomA = (a.nombre || "").toUpperCase();
                const nomB = (b.nombre || "").toUpperCase();
                return nomA.localeCompare(nomB);
            });

            setItems(data);
            
            // Auto-expand first category if there's only one or just for convenience
            if (data.length > 0) {
                const firstCat = data[0].categoria || "GENERAL";
                setExpandedCats(new Set([firstCat]));
            }
        } catch (e) {
            console.error("Error fetching items:", e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchListInfo();
        fetchItems();
    }, [listaId]);

    // Group items by category
    const groupedData = useMemo(() => {
        const groups = items.reduce((acc, item) => {
            const cat = item.categoria || "GENERAL";
            if (!acc[cat]) acc[cat] = [];
            acc[cat].push(item);
            return acc;
        }, {});
        return groups;
    }, [items]);

    const categories = useMemo(() => Object.keys(groupedData).sort(), [groupedData]);

    const toggleCat = (cat) => {
        const next = new Set(expandedCats);
        if (next.has(cat)) next.delete(cat);
        else next.add(cat);
        setExpandedCats(next);
    };

    const handleUpdateListName = async () => {
        if (!tempName.trim()) return;
        try {
            await updateDoc(doc(db, "listas_precios", listaId), {
                nombre: tempName.toUpperCase(),
                actualizado: serverTimestamp()
            });
            setIsEditingName(false);
            fetchListInfo();
        } catch (e) { console.error(e); }
    };

    const handleOpenModal = (cat, item = null) => {
        setTargetCat(cat);
        setCurrentItem(item);
        setFormData(item ? { ...initialItemState, ...item } : { ...initialItemState });
        setCupsQuery("");
        setShowCupsDropdown(false);
        setShowModal(true);
    };

    const handleSelectCUPS = (cups) => {
        setFormData(prev => ({
            ...prev,
            codigo: cups.code,
            // Only overwrite name if it's currently empty or previously equal to a CUPS name
            nombre: !prev.nombre ? cups.name : prev.nombre
        }));
        setCupsQuery(cups.code);
        setShowCupsDropdown(false);
    };

    // Helper to format currency for display in inputs
    const formatCOP = (val) => {
        if (val === "" || val === undefined || val === null) return "";
        return Number(val).toLocaleString('es-CO');
    };

    // Helper to parse formatted string back to number
    const parseCOP = (str) => {
        if (!str) return "";
        // Remove everything that isn't a digit
        const numericVal = String(str).replace(/\D/g, "");
        return numericVal === "" ? "" : Number(numericVal);
    };

    const handleSaveItem = async () => {
        if (!formData.nombre.trim()) return;
        setLoading(true);
        try {
            const itemData = {
                ...formData,
                categoria: targetCat,
                precio: Number(formData.precio) || 0,
                pago_fijo_doctor: Number(formData.pago_fijo_doctor) || 0,
                max_descuento_porcentaje: Number(formData.max_descuento_porcentaje) || 0,
                max_descuento_valor: Number(formData.max_descuento_valor) || 0,
                inquilino,
                search_name: formData.nombre.toLowerCase(),
                actualizado: serverTimestamp()
            };

            if (currentItem) {
                // UPDATE
                await updateDoc(doc(db, "listas_precios", listaId, "items", currentItem.id), itemData);
            } else {
                // CREATE
                await addDoc(collection(db, "listas_precios", listaId, "items"), {
                    ...itemData,
                    creado: serverTimestamp()
                });
            }
            
            setShowModal(false);
            fetchItems();
        } catch (e) { 
            console.error(e); 
            alert("Error al guardar: " + e.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveProducto = async (productData) => {
        setLoading(true);
        try {
            const itemData = {
                ...productData,
                inquilino,
                actualizado: serverTimestamp()
            };

            if (currentItem) {
                await updateDoc(doc(db, "listas_precios", listaId, "items", currentItem.id), itemData);
            } else {
                await addDoc(collection(db, "listas_precios", listaId, "items"), {
                    ...itemData,
                    creado: serverTimestamp()
                });
            }
            
            setShowModal(false);
            fetchItems();
        } catch (e) { 
            console.error(e); 
            alert("Error al guardar producto: " + e.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteItem = async (itemId) => {
        if (!window.confirm("¿Eliminar este ítem?")) return;
        try {
            await deleteDoc(doc(db, "listas_precios", listaId, "items", itemId));
            fetchItems();
        } catch (e) { console.error(e); }
    };

    const handleExportExcel = async () => {
        if (!items || items.length === 0) return;
        
        try {
            // Prepare data for Excel
            const exportData = items.map(it => ({
                CATEGORIA: it.categoria || "GENERAL",
                CODIGO: it.codigo || "",
                NOMBRE: it.nombre || "",
                PRECIO: it.precio || 0,
                CODIGO_CUPS: it.codigo || "",
                OBSERVACIONES: it.observaciones || "",
                PAGO_FIJO_DOCTOR: it.pago_fijo_doctor || 0,
                MAX_DESC_PORC: it.max_descuento_porcentaje || 0,
                MAX_DESC_VAL: it.max_descuento_valor || 0,
                GENERA_RIPS: it.genera_rips ? "SÍ" : "NO",
                ES_CONSULTA: it.es_consulta ? "SÍ" : "NO",
                VER_AGENDA: it.ver_en_agenda ? "SÍ" : "NO",
                TIEMPO_MIN: it.tiempo || 30
            }));

            const worksheet = XLSX.utils.json_to_sheet(exportData);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "Lista de Precios");
            
            // Generate filename
            const fileName = `LISTA_${listData?.nombre || 'PRECIOS'}_${new Date().toISOString().split('T')[0]}.xlsx`;
            XLSX.writeFile(workbook, fileName);
        } catch (error) {
            console.error("Error exporting:", error);
            alert("No se pudo exportar el archivo.");
        }
    };

    return (
        <div className="bg-slate-50 min-h-full p-4 md:p-8 animate-fadeIn">
            
            {/* Header / Breadcrumbs */}
            <div className="max-w-7xl mx-auto mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="flex items-center gap-4">
                    <button onClick={onBack} className="w-10 h-10 flex items-center justify-center bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-blue-600 transition-all shadow-sm active:scale-95">
                        <FiArrowLeft size={20} />
                    </button>
                    <div>
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            Configuración / Lista de precios / Edición
                        </div>
                        <div className="flex items-center gap-3 mt-1">
                            <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tighter">Edición Lista de precios</h2>
                            <button 
                                onClick={handleExportExcel}
                                className="bg-blue-500 text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-200 hover:bg-blue-600 transition-all flex items-center gap-2"
                            >
                                <FiDownload size={14} /> Exportar
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Card */}
            <div className="max-w-7xl mx-auto bg-white rounded-[40px] shadow-[0_25px_80px_rgba(0,0,0,0.05)] border border-slate-100 overflow-hidden">
                
                {/* Global Controls */}
                <div className="p-10 border-b border-slate-50 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
                    <div className="flex items-center gap-4 w-full lg:w-auto">
                        <span className="text-[12px] font-black text-slate-400 uppercase tracking-widest">Nombre *</span>
                        {isEditingName ? (
                            <div className="flex items-center gap-2">
                                <input 
                                    className="bg-slate-50 border border-blue-200 rounded-xl px-4 py-2 text-sm font-black text-slate-700 uppercase outline-none focus:ring-4 focus:ring-blue-500/10"
                                    value={tempName}
                                    onChange={e => setTempName(e.target.value)}
                                    autoFocus
                                />
                                <button onClick={handleUpdateListName} className="w-9 h-9 bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-200 flex items-center justify-center"><FiCheck /></button>
                                <button onClick={() => { setIsEditingName(false); setTempName(listData.nombre); }} className="w-9 h-9 bg-slate-100 text-slate-400 rounded-xl flex items-center justify-center"><FiX /></button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-3">
                                <span className="text-lg font-black text-slate-700 uppercase">{listData?.nombre}</span>
                                <button onClick={() => setIsEditingName(true)} className="w-8 h-8 rounded-lg bg-blue-50 text-blue-500 flex items-center justify-center hover:bg-blue-100 transition-all"><FiEdit3 size={14} /></button>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-4 w-full lg:w-auto">
                        <button className="h-12 w-12 bg-blue-500 text-white rounded-[18px] flex items-center justify-center shadow-lg shadow-blue-200 hover:bg-blue-600 transition-all"><FiPercent size={20} /></button>
                        <button className="flex-1 lg:flex-none h-12 px-8 bg-[#8CC63F] text-white rounded-[20px] font-black text-[11px] uppercase tracking-widest shadow-xl shadow-[#8CC63F]/20 hover:bg-[#7bb335] transition-all flex items-center justify-center gap-3">
                            <FiPlus size={18} /> Agregar categoría
                        </button>
                    </div>
                </div>

                {/* Categories List */}
                <div className="p-6 md:p-10 space-y-4">
                    {categories.map(cat => {
                        const isExpanded = expandedCats.has(cat);
                        const catItems = groupedData[cat];
                        
                        return (
                            <div key={cat} className="rounded-lg border border-slate-200 overflow-hidden bg-white mb-2">
                                {/* Category Header */}
                                <div 
                                    className="p-3 flex justify-between items-center cursor-pointer border-b border-slate-100 bg-white hover:bg-slate-50 transition-colors"
                                    onClick={() => toggleCat(cat)}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="text-blue-500 w-5 flex items-center justify-center">
                                            {isExpanded ? <FiChevronDown size={18} /> : <FiChevronRight size={18} />}
                                        </div>
                                        <div className="flex items-center gap-4 min-w-[300px]">
                                            <span className="text-sm font-bold text-slate-700">Categoría</span>
                                            <span className="text-sm font-normal text-slate-600">{cat}</span>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center justify-between flex-1 pl-4">
                                        <span className="text-sm font-bold text-slate-700">Comentario</span>
                                        {/* Category Actions */}
                                        <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                                            <button 
                                                onClick={() => handleOpenModal(cat)}
                                                className="w-8 h-8 bg-[#8CC63F] text-white rounded flex items-center justify-center hover:bg-[#7bb335] transition-all"
                                                title="Agregar producto"
                                            >
                                                <FiPlus size={16} />
                                            </button>
                                            <button className="w-8 h-8 bg-[#3ba2eb] text-white rounded flex items-center justify-center hover:bg-blue-600 transition-all" title="Ajuste porcentual"><FiPercent size={14} /></button>
                                            <button className="w-8 h-8 bg-[#3ba2eb] text-white rounded flex items-center justify-center hover:bg-blue-600 transition-all" title="Editar categoría"><FiEdit3 size={14} /></button>
                                            <button className="w-8 h-8 bg-[#f5597b] text-white rounded flex items-center justify-center hover:bg-rose-600 transition-all" title="Eliminar categoría"><FiTrash2 size={14} /></button>
                                        </div>
                                    </div>
                                </div>

                                {/* Expanded Content (Items Table) */}
                                {isExpanded && (
                                    <div className="bg-white">
                                        <table className="w-full text-left border-collapse">
                                            <thead>
                                                <tr className="bg-white">
                                                    <th className="px-6 py-4 text-[13px] font-bold text-slate-700 w-32 border-none">Código</th>
                                                    <th className="px-6 py-4 text-[13px] font-bold text-slate-700 w-auto border-none">Producto</th>
                                                    <th className="px-6 py-4 text-[13px] font-bold text-slate-700 w-40 text-center border-none">Permite<br/>descuento</th>
                                                    <th className="px-6 py-4 text-[13px] font-bold text-slate-700 w-40 border-none">Precio</th>
                                                    <th className="px-6 py-4 text-[13px] font-bold text-slate-700 w-32 text-center border-none">Acciones</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {catItems.map(item => (
                                                    <tr key={item.id} className="border-t border-slate-50 hover:bg-slate-50 transition-colors">
                                                        <td className="px-6 py-4">
                                                            <span className="text-[13px] text-slate-600">{item.codigo || '-'}</span>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <span className="text-[13px] text-slate-600">{item.nombre}</span>
                                                        </td>
                                                        <td className="px-6 py-4 text-center">
                                                            <span className="text-[13px] text-slate-600">{item.permite_descuento ? 'Sí' : 'No'}</span>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <span className="text-[13px] text-slate-600">${item.precio.toLocaleString('es-CO')}</span>
                                                        </td>
                                                        <td className="px-6 py-4 text-center">
                                                            <div className="flex justify-center gap-1">
                                                                <button onClick={() => handleOpenModal(cat, item)} className="w-8 h-8 flex items-center justify-center rounded bg-[#3ba2eb] text-white hover:bg-blue-600 transition-all" title="Editar"><FiEdit3 size={14} /></button>
                                                                <button onClick={() => handleDeleteItem(item.id)} className="w-8 h-8 flex items-center justify-center rounded bg-[#f5597b] text-white hover:bg-rose-600 transition-all" title="Eliminar"><FiTrash2 size={14} /></button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>

                                        {/* Nested Add Link */}
                                        <div className="p-4 flex justify-center border-t border-slate-50">
                                            <button 
                                                onClick={() => handleOpenModal(cat)}
                                                className="text-[13px] text-blue-500 hover:text-blue-700 transition-colors"
                                            >
                                                Agregar un producto a esta categoría
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}

                    {categories.length === 0 && !loading && (
                        <div className="p-20 flex flex-col items-center justify-center opacity-30 select-none">
                             <div className="w-24 h-24 rounded-full bg-white border-2 border-dashed border-slate-300 flex items-center justify-center mb-6">
                                <FiPlus size={48} className="text-slate-300" />
                             </div>
                             <h4 className="text-xl font-black text-slate-400 uppercase tracking-tighter">Sin Categorías</h4>
                             <p className="text-sm font-bold text-slate-400 mt-2 uppercase tracking-widest text-center max-w-xs">Configura las categorías de tu tarifario para comenzar.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal Avanzado de Edición Múltiple */}
            {showModal && listData?.tipo === "productos" ? (
                <ModalProducto 
                    item={currentItem}
                    categoria={targetCat}
                    onClose={() => setShowModal(false)}
                    onSave={handleSaveProducto}
                    loading={loading}
                />
            ) : showModal && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[1100] flex items-center justify-center p-4 animate-fadeIn">
                    <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-4xl overflow-hidden border border-slate-100 flex flex-col max-h-[90vh]">
                        
                        {/* Modal Header */}
                        <div className="p-8 border-b border-slate-50 bg-slate-50/30 flex justify-between items-center">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-200">
                                    <FiEdit3 size={24} />
                                </div>
                                <div className="flex flex-col">
                                    <h3 className="text-xl font-black text-slate-800 uppercase tracking-tighter">
                                        {currentItem ? 'Editar producto' : 'Agregar producto'}
                                    </h3>
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest tracking-widest mt-0.5">Categoría: {targetCat}</span>
                                </div>
                            </div>
                            <button onClick={() => setShowModal(false)} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-200 transition-colors">
                                <FiX size={24} className="text-slate-400" />
                            </button>
                        </div>

                        {/* Modal Content - Scrollable Area */}
                        <div className="p-10 overflow-y-auto custom-scrollbar space-y-8">
                            
                            {/* Row 1: Codigo & Nombre */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="space-y-2 relative">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Código CUPS *</label>
                                    <div className="relative">
                                        <input 
                                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-[14px] font-black text-slate-700 uppercase outline-none focus:bg-white focus:ring-4 focus:ring-blue-500/5 transition-all"
                                            value={formData.codigo}
                                            onChange={e => {
                                                const val = e.target.value.toUpperCase();
                                                setFormData({...formData, codigo: val});
                                                setCupsQuery(val);
                                                setShowCupsDropdown(true);
                                            }}
                                            onFocus={() => setShowCupsDropdown(true)}
                                            placeholder="BUSCAR CUPS..."
                                        />
                                        
                                        {/* CUPS Suggestions Dropdown */}
                                        {showCupsDropdown && filteredCUPS.length > 0 && (
                                            <div className="absolute left-0 right-0 top-full mt-2 bg-white border border-slate-200 shadow-2xl rounded-[28px] z-50 p-3 max-h-72 overflow-y-auto animate-fadeIn custom-scrollbar">
                                                {filteredCUPS.map(c => (
                                                    <div
                                                        key={c.code}
                                                        onClick={() => handleSelectCUPS(c)}
                                                        className="p-4 hover:bg-blue-50 rounded-2xl cursor-pointer border-b border-slate-50 last:border-0 flex justify-between items-center transition-all group/cups"
                                                    >
                                                        <div className="flex flex-col">
                                                            <div className="text-[12px] font-black text-slate-800 uppercase tracking-tight group-hover/cups:text-blue-600">{c.name}</div>
                                                            <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{c.code}</div>
                                                        </div>
                                                        <FiCheck className="text-emerald-500 opacity-0 group-hover/cups:opacity-100 transition-opacity" />
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="md:col-span-2 space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nombre procedimiento *</label>
                                    <input 
                                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-[14px] font-black text-slate-700 uppercase outline-none focus:bg-white focus:ring-4 focus:ring-blue-500/5 transition-all"
                                        value={formData.nombre}
                                        onChange={e => setFormData({...formData, nombre: e.target.value.toUpperCase()})}
                                        placeholder="NOMBRE DEL PROCEDIMIENTO O PRODUCTO..."
                                    />
                                </div>
                            </div>

                            {/* Row 2: Precio */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Precio *</label>
                                    <div className="relative">
                                        <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 font-bold">$</div>
                                        <input 
                                            type="text"
                                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-10 pr-5 py-4 text-[14px] font-black text-slate-700 outline-none focus:bg-white focus:ring-4 focus:ring-blue-500/5 transition-all"
                                            value={formatCOP(formData.precio)}
                                            onChange={e => {
                                                const val = parseCOP(e.target.value);
                                                setFormData({...formData, precio: val});
                                            }}
                                            placeholder="0"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Observaciones</label>
                                    <textarea 
                                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3 text-[14px] font-bold text-slate-600 outline-none focus:bg-white focus:ring-4 focus:ring-blue-500/5 transition-all min-h-[52px]"
                                        value={formData.observaciones}
                                        onChange={e => setFormData({...formData, observaciones: e.target.value})}
                                        placeholder="Notas adicionales..."
                                    />
                                </div>
                            </div>

                            {/* Row 3: Pago Fijo Doctor */}
                            <div className="p-6 bg-blue-50/50 border border-blue-100 rounded-[28px] flex flex-col md:flex-row gap-6 items-center">
                                <div className="flex-1 space-y-2 w-full">
                                    <label className="text-[10px] font-black text-blue-400 uppercase tracking-widest ml-1">Pago valor fijo a doctores</label>
                                    <div className="relative">
                                        <div className="absolute left-5 top-1/2 -translate-y-1/2 text-blue-200 font-bold">$</div>
                                        <input 
                                            type="text"
                                            className="w-full bg-white border border-blue-100 rounded-xl pl-10 pr-5 py-3 text-[14px] font-black text-slate-700 outline-none focus:ring-4 focus:ring-blue-500/5"
                                            value={formatCOP(formData.pago_fijo_doctor)}
                                            onChange={e => {
                                                const val = parseCOP(e.target.value);
                                                setFormData({...formData, pago_fijo_doctor: val});
                                            }}
                                            disabled={!formData.usar_pago_fijo}
                                        />
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <input 
                                        type="checkbox" 
                                        id="usarFijo"
                                        className="w-6 h-6 rounded-lg text-blue-600 focus:ring-blue-500 border-slate-300 transition-all cursor-pointer"
                                        checked={formData.usar_pago_fijo}
                                        onChange={e => setFormData({...formData, usar_pago_fijo: e.target.checked})}
                                    />
                                    <label htmlFor="usarFijo" className="text-[11px] font-bold text-slate-500 uppercase leading-none cursor-pointer">Usar este campo para no liquidar por %</label>
                                </div>
                            </div>

                            {/* Section: Booleans & Limits (RIPS, Consulta, Descuento) */}
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                        <input 
                                            type="checkbox" 
                                            id="pDesc"
                                            checked={formData.permite_descuento}
                                            onChange={e => setFormData({...formData, permite_descuento: e.target.checked})}
                                            className="w-5 h-5 rounded text-blue-600 cursor-pointer"
                                        />
                                        <label htmlFor="pDesc" className="text-[11px] font-black text-slate-600 uppercase cursor-pointer">Permite Descuento</label>
                                    </div>
                                    <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                        <input 
                                            type="checkbox" 
                                            id="gRips"
                                            checked={formData.genera_rips}
                                            onChange={e => setFormData({...formData, genera_rips: e.target.checked})}
                                            className="w-5 h-5 rounded text-blue-600 cursor-pointer"
                                        />
                                        <label htmlFor="gRips" className="text-[11px] font-black text-slate-600 uppercase cursor-pointer">Genera RIPS</label>
                                    </div>
                                    <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                        <input 
                                            type="checkbox" 
                                            id="eCons"
                                            checked={formData.es_consulta}
                                            onChange={e => setFormData({...formData, es_consulta: e.target.checked})}
                                            className="w-5 h-5 rounded text-blue-600 cursor-pointer"
                                        />
                                        <label htmlFor="eCons" className="text-[11px] font-black text-slate-600 uppercase cursor-pointer">Es Consulta</label>
                                    </div>
                                </div>

                                {formData.permite_descuento && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-emerald-50/30 border border-emerald-100 rounded-[28px] animate-in zoom-in-95 duration-300">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-emerald-600 uppercase tracking-widest ml-1">Máximo % de Descuento</label>
                                            <div className="relative">
                                                <input 
                                                    type="number"
                                                    className="w-full bg-white border border-emerald-100 rounded-xl px-4 py-3 text-[14px] font-black text-slate-700 outline-none"
                                                    value={formData.max_descuento_porcentaje}
                                                    onChange={e => {
                                                        const p = e.target.value === "" ? "" : Number(e.target.value);
                                                        const price = Number(formData.precio) || 0;
                                                        const v = p === "" ? "" : Math.round((p / 100) * price);
                                                        setFormData({...formData, max_descuento_porcentaje: p, max_descuento_valor: v});
                                                    }}
                                                />
                                                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-400 font-bold">%</div>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-emerald-600 uppercase tracking-widest ml-1">Máximo Valor de Descuento ($)</label>
                                            <div className="relative">
                                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-400 font-bold">$</div>
                                                <input 
                                                    type="text"
                                                    className="w-full bg-white border border-emerald-100 rounded-xl pl-10 pr-4 py-3 text-[14px] font-black text-slate-700 outline-none"
                                                    value={formatCOP(formData.max_descuento_valor)}
                                                    onChange={e => {
                                                        const v = parseCOP(e.target.value);
                                                        const price = Number(formData.precio) || 0;
                                                        const p = v === "" ? "" : (price > 0 ? Number(((v / price) * 100).toFixed(2)) : 0);
                                                        setFormData({...formData, max_descuento_valor: v, max_descuento_porcentaje: p});
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Section: Agenda Logic */}
                            <div className="p-8 bg-slate-50 rounded-[32px] border border-slate-100 space-y-6">
                                <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                                     <div className="flex items-center gap-3">
                                        <span className="text-[12px] font-black text-slate-700 uppercase tracking-tight">Ver en agenda</span>
                                        <div 
                                            onClick={() => setFormData({...formData, ver_en_agenda: !formData.ver_en_agenda})}
                                            className={`w-14 h-7 rounded-full p-1 cursor-pointer transition-all duration-300 shadow-inner ${formData.ver_en_agenda ? 'bg-blue-500' : 'bg-slate-300'}`}
                                        >
                                            <div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-300 ${formData.ver_en_agenda ? 'translate-x-7' : 'translate-x-0'}`} />
                                        </div>
                                     </div>
                                     <div className="flex items-center gap-2">
                                        <input type="checkbox" id="vOnline" checked={formData.ver_en_agenda_online} onChange={e => setFormData({...formData, ver_en_agenda_online: e.target.checked})} className="w-4 h-4 rounded text-blue-600" />
                                        <label htmlFor="vOnline" className="text-[10px] font-bold text-slate-400 uppercase cursor-pointer">Ver en agenda online</label>
                                     </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 opacity-100 transition-opacity">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nombre Agenda</label>
                                        <input 
                                            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-[13px] font-bold text-slate-600"
                                            value={formData.nombre_agenda}
                                            onChange={e => setFormData({...formData, nombre_agenda: e.target.value})}
                                            placeholder="Nombre corto..."
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tiempo (Min)</label>
                                        <select 
                                            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-[13px] font-black text-slate-600 outline-none"
                                            value={formData.tiempo}
                                            onChange={e => setFormData({...formData, tiempo: Number(e.target.value)})}
                                        >
                                            {[5, 10, 15, 20, 30, 45, 60, 90, 120].map(t => <option key={t} value={t}>{t} Minutos</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Identificador</label>
                                        <input 
                                            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-[13px] font-bold text-slate-600"
                                            value={formData.identificador_agenda}
                                            onChange={e => setFormData({...formData, identificador_agenda: e.target.value})}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="p-8 border-t border-slate-50 bg-slate-50/50 flex gap-4">
                            <button 
                                onClick={() => setShowModal(false)}
                                className="flex-1 py-4 bg-white border-2 border-slate-200 text-slate-400 hover:text-slate-600 hover:border-slate-300 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all"
                            >
                                Cerrar
                            </button>
                            <button 
                                onClick={handleSaveItem}
                                disabled={loading}
                                className="flex-[2] py-4 bg-[#8CC63F] text-white rounded-2xl font-black text-[12px] uppercase tracking-[0.1em] shadow-xl shadow-[#8CC63F]/20 hover:bg-[#7bb335] transition-all active:scale-95 flex items-center justify-center gap-3"
                            >
                                {loading ? 'Guardando...' : (
                                    <>
                                        <FiCheck size={18} strokeWidth={3} /> Guardar Cambios
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
