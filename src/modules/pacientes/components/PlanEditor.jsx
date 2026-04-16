import React, { useState, useEffect, useRef } from 'react';
import { useToast } from '../../../context/ToastContext';
import { createPlan, updatePlan } from '../../../services/planService';
import { db } from '../../../firebase/firebaseConfig';
import { doc, getDoc, collection, getDocs, query, where, limit } from 'firebase/firestore';
import { FiSearch, FiTrash2, FiPlus, FiCheck, FiX, FiInfo, FiActivity, FiDollarSign, FiChevronLeft, FiPlusCircle, FiPackage, FiFileText } from 'react-icons/fi';
import { useAuth } from '../../../context/AuthContext';

export default function PlanEditor({ patient, initialData, onClose, onSaved }) {
    const isEditing = !!initialData;
    const patientId = patient?.id;
    const toast = useToast();
    const [loading, setLoading] = useState(false);
    const [title, setTitle] = useState(initialData?.title || "Presupuesto Integral de Tratamiento");
    const [baseListId, setBaseListId] = useState(null);

    const { userProfile } = useAuth();
    const inquilino = userProfile?.inquilino;
    const [planes, setPlanes] = useState([]);
    const [showPlanesModal, setShowPlanesModal] = useState(false);
    const [loadingPlanes, setLoadingPlanes] = useState(false);
    const [loadingPlanItems, setLoadingPlanItems] = useState(false);

    useEffect(() => {
        const fetchPlanes = async () => {
            if (!inquilino) return;
            setLoadingPlanes(true);
            try {
                const snap = await getDocs(query(
                    collection(db, "planes"),
                    where("inquilino", "==", inquilino)
                ));
                const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
                data.sort((a, b) => (a.nombre || "").localeCompare(b.nombre || ""));
                setPlanes(data);
            } catch (e) {
                console.error(e);
            } finally {
                setLoadingPlanes(false);
            }
        };
        fetchPlanes();
    }, [inquilino]);

    const cargarCombo = async (plan) => {
        setLoadingPlanItems(true);
        try {
            const snap = await getDocs(collection(db, "planes", plan.id, "planes_items"));
            const planItems = snap.docs.map(d => d.data());
            
            if (planItems.length === 0) {
                toast.error("Este plan no tiene ítems configurados.");
                return;
            }

            // Inyectar al presupuesto quitando ítems vacíos si los hubiera
            const currentFiltered = items.filter(i => i.desc.trim() !== "");
            const newItems = planItems.map(it => ({
                id: Math.random().toString(36).substr(2, 9),
                code: it.codigo || "",
                desc: it.nombre || "",
                amount: Number(it.precio || 0),
                qty: Number(it.cantidad || 1),
                descuento: Number(it.descuento || 0)
            }));

            setItems([...currentFiltered, ...newItems]);
            setShowPlanesModal(false);
            toast.success(`Combo "${plan.nombre}" cargado!`);
        } catch (e) {
            console.error(e);
            toast.error("Error cargando el combo.");
        } finally {
            setLoadingPlanItems(false);
        }
    };

    // Items state
    const [items, setItems] = useState(initialData?.items || [
        { id: Date.now(), desc: "", amount: 0, qty: 1, code: "" }
    ]);

    // UI state for search
    const [activeSearchId, setActiveSearchId] = useState(null);
    const [searchResults, setSearchResults] = useState([]);
    const [searchLoading, setSearchLoading] = useState(false);

    // Dropdown visibility
    const [showResults, setShowResults] = useState(false);

    useEffect(() => {
        if (!patient?.planId) return;
        const fetchPlan = async () => {
            try {
                const planSnap = await getDoc(doc(db, "planes", patient.planId));
                if (planSnap.exists()) {
                    setBaseListId(planSnap.data().baseListId);
                }
            } catch (e) {
                console.error("Error fetching plan:", e);
            }
        };
        fetchPlan();
    }, [patient?.planId]);

    const handleItemSearch = async (id, term) => {
        updateItem(id, 'desc', term);
        if (!baseListId || term.length < 2) {
            setSearchResults([]);
            setShowResults(false);
            return;
        }

        setSearchLoading(true);
        setActiveSearchId(id);
        setShowResults(true);
        try {
            const q = query(
                collection(db, "listas_precios", baseListId, "items"),
                where("search_name", ">=", term.toLowerCase()),
                where("search_name", "<=", term.toLowerCase() + "\uf8ff"),
                limit(10)
            );
            const snap = await getDocs(q);
            setSearchResults(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        } catch (e) {
            console.error("Search error:", e);
        } finally {
            setSearchLoading(false);
        }
    };

    const selectProcedure = (itemId, proc) => {
        setItems(items.map(i => i.id === itemId ? {
            ...i,
            desc: proc.nombre || proc.label,
            amount: proc.precio || proc.value || 0,
            code: proc.codigo || ""
        } : i));
        setSearchResults([]);
        setShowResults(false);
        setActiveSearchId(null);
    };

    const addItem = () => {
        setItems([...items, { id: Date.now(), desc: "", amount: 0, qty: 1 }]);
    };

    const removeItem = (id) => {
        if (items.length === 1) return;
        setItems(items.filter(i => i.id !== id));
    };

    const updateItem = (id, field, val) => {
        setItems(items.map(i => i.id === id ? { ...i, [field]: val } : i));
    };

    const calculateTotal = () => {
        return items.reduce((acc, curr) => acc + (Number(curr.amount) * Number(curr.qty)), 0);
    };

    const handleSave = async (status) => {
        if (!title.trim()) {
            toast.error("Ingresa un título para el presupuesto");
            return;
        }

        const validItems = items.filter(i => i.desc.trim() !== "");
        if (validItems.length === 0) {
            toast.error("Agrega al menos un tratamiento");
            return;
        }

        setLoading(true);
        try {
            const planData = {
                patientId,
                title,
                items: validItems,
                total: calculateTotal(),
                status,
                type: initialData?.type || "presupuesto",
                profesionalId: initialData?.profesionalId || "",
                vigencia: initialData?.vigencia || 30,
                observaciones: initialData?.observaciones || ""
            };

            if (isEditing) {
                await updatePlan(initialData.id, planData);
                toast.success("Presupuesto actualizado");
            } else {
                await createPlan(planData);
                toast.success("Presupuesto guardado");
            }
            onSaved?.();
        } catch (error) {
            console.error("Error saving plan:", error);
            toast.error("Error al guardar");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full bg-slate-50/50 animate-fadeIn relative">
            
            {/* Header: Global Actions */}
            <div className="flex-none bg-white p-6 md:p-8 flex flex-col md:flex-row justify-between items-center gap-6 border-b border-slate-100 shadow-sm z-30">
                <div className="flex items-center gap-5 w-full md:w-auto">
                    <button onClick={onClose} className="w-12 h-12 bg-slate-100 text-slate-500 rounded-[18px] flex items-center justify-center hover:bg-rose-100 hover:text-rose-600 transition-all border border-slate-200/50 group">
                        <FiChevronLeft size={24} className="group-hover:-translate-x-1 transition-transform" />
                    </button>
                    <div>
                        <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                             <FiActivity className="text-indigo-600" /> Plan de Tratamiento Pro-forma
                        </div>
                        <input
                            placeholder="TÍTULO DEL PRESUPUESTO..."
                            value={title}
                            onChange={(e) => setTitle(e.target.value.toUpperCase())}
                            className="bg-transparent border-none p-0 text-xl font-black text-slate-800 tracking-tight outline-none w-full max-w-sm uppercase focus:ring-0"
                        />
                    </div>
                </div>

                <div className="flex items-center gap-4 w-full md:w-auto">
                    <div className="hidden lg:flex flex-col items-end px-6 border-r border-slate-100">
                        <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">Inversión Final Sugerida</span>
                        <h4 className="text-2xl font-black text-indigo-600 tracking-tighter leading-none">
                            <span className="text-sm mr-1 font-bold text-slate-400">$</span>
                            {calculateTotal().toLocaleString('es-CO')}
                        </h4>
                    </div>
                    
                    <div className="flex items-center gap-2 w-full md:w-auto">
                        <button onClick={() => handleSave('draft')} disabled={loading} className="flex-1 md:flex-none px-6 py-4 bg-white border-2 border-slate-200 text-slate-400 hover:text-slate-800 hover:border-slate-800 rounded-[20px] font-black text-[11px] uppercase tracking-widest transition-all">
                            Borrador
                        </button>
                        <button onClick={() => handleSave('accepted')} disabled={loading} className="flex-1 md:flex-none px-8 py-4 bg-[#8CC63F] border-2 border-[#8CC63F] text-white rounded-[22px] font-black text-[11px] uppercase tracking-widest shadow-xl shadow-[#8CC63F]/20 hover:bg-[#7bb335] hover:border-[#7bb335] transition-all active:scale-95 flex items-center justify-center gap-3">
                             <FiCheck size={16} strokeWidth={3} /> {isEditing ? "Guardar Cambios" : "Finalizar & Aprobar"}
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Area: The Invoice Editor */}
            <div className="flex-1 overflow-y-auto p-4 md:p-10 custom-scrollbar pb-32">
                <div className="max-w-6xl mx-auto bg-white rounded-[40px] shadow-[0_20px_50px_rgba(0,0,0,0.03)] border border-slate-100 overflow-hidden">
                    
                    {/* Header Table Stylized */}
                    <div className="bg-slate-50/50 p-6 flex items-center justify-between border-b border-slate-100">
                        <div className="flex items-center gap-3">
                             <div className="w-8 h-8 bg-white border border-slate-200 rounded-lg flex items-center justify-center text-slate-400">
                                 <FiFileText size={16} />
                             </div>
                             <h5 className="text-[11px] font-black text-slate-600 uppercase tracking-widest leading-none">Detalle de Procedimientos & Costos</h5>
                        </div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Inquilino: {patient?.inquilino || 'SISTEMA'}</span>
                    </div>

                    <table className="w-full text-left table-fixed">
                        <thead>
                            <tr className="bg-white border-b border-slate-100">
                                <th className="p-6 text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] w-1/2">Tratamiento / Procedimiento</th>
                                <th className="p-6 text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] text-center w-24">Cant.</th>
                                <th className="p-6 text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] text-right w-40">Valor Unit.</th>
                                <th className="p-6 text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] text-right w-40">Subtotal</th>
                                <th className="p-6 w-20"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {items.map((item, index) => (
                                <tr key={item.id} className="group hover:bg-slate-50/50 transition-colors">
                                    <td className="p-6 relative">
                                        <div className="relative group/search">
                                            <input
                                                placeholder="BUSCAR TRATAMIENTO O CÓDIGO RIPS..."
                                                className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-[13px] font-black text-slate-700 uppercase outline-none focus:bg-white focus:ring-4 focus:ring-indigo-500/5 transition-all placeholder:text-slate-300 tracking-tight"
                                                value={item.desc}
                                                onChange={(e) => handleItemSearch(item.id, e.target.value.toUpperCase())}
                                                onFocus={() => { setActiveSearchId(item.id); if(searchResults.length > 0) setShowResults(true); }}
                                                onBlur={() => setTimeout(() => setShowResults(false), 200)}
                                            />
                                            
                                            {/* Search Pulse Icon */}
                                            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-200">
                                                <FiSearch size={18} />
                                            </div>

                                            {/* Advanced Results Dropdown */}
                                            {activeSearchId === item.id && showResults && searchResults.length > 0 && (
                                                <div className="absolute left-0 right-0 top-full mt-2 bg-white border border-slate-200 shadow-2xl rounded-[28px] z-50 p-3 max-h-72 overflow-y-auto animate-fadeIn custom-scrollbar">
                                                    {searchResults.map(res => (
                                                        <div
                                                            key={res.id}
                                                            onClick={() => selectProcedure(item.id, res)}
                                                            className="p-4 hover:bg-indigo-50 rounded-2xl cursor-pointer border-b border-slate-50 last:border-0 flex justify-between items-center transition-all group/res"
                                                        >
                                                            <div className="flex items-center gap-4">
                                                                <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 group-hover/res:bg-white transition-colors">
                                                                     <FiActivity size={18} />
                                                                </div>
                                                                <div>
                                                                    <div className="text-[12px] font-black text-slate-800 uppercase tracking-tight group-hover/res:text-indigo-600">{res.nombre}</div>
                                                                    <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{res.codigo || 'SIN CÓDIGO'}</div>
                                                                </div>
                                                            </div>
                                                            <div className="text-right">
                                                                <div className="text-[14px] font-black text-slate-700">$ {(res.precio || 0).toLocaleString('es-CO')}</div>
                                                                <div className="text-[8px] font-black text-emerald-500 uppercase tracking-widest mt-0.5">Precio Público</div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="p-6 text-center">
                                        <input
                                            type="number"
                                            className="w-16 p-3 text-center bg-slate-50 border border-slate-100 rounded-xl outline-none focus:bg-white font-black text-slate-700 text-sm transition-all"
                                            value={item.qty}
                                            onChange={(e) => updateItem(item.id, 'qty', Number(e.target.value))}
                                            min="1"
                                        />
                                    </td>
                                    <td className="p-6 text-right">
                                        <div className="flex flex-col items-end">
                                             <div className="flex items-center gap-1 bg-slate-50 px-4 py-3 rounded-2xl border border-slate-100">
                                                 <span className="text-slate-300 text-[12px] font-bold">$</span>
                                                 <input
                                                     type="number"
                                                     className="w-24 bg-transparent text-right outline-none font-black text-slate-700 text-[14px]"
                                                     value={item.amount}
                                                     onChange={(e) => updateItem(item.id, 'amount', Number(e.target.value))}
                                                 />
                                             </div>
                                        </div>
                                    </td>
                                    <td className="p-6 text-right font-black text-[15px] text-slate-600 tracking-tight">
                                        <span className="text-[12px] font-bold text-slate-300 mr-1">$</span>
                                        {(item.qty * item.amount).toLocaleString('es-CO')}
                                    </td>
                                    <td className="p-6 text-center">
                                        <button
                                            onClick={() => removeItem(item.id)}
                                            className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-300 hover:text-rose-500 hover:bg-rose-50 hover:shadow-inner transition-all opacity-0 group-hover:opacity-100"
                                        >
                                            <FiTrash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* Add Button */}
                    <div className="p-8 border-t border-slate-100 bg-slate-50/20 flex flex-col md:flex-row gap-4">
                        <button
                            onClick={addItem}
                            className="bg-white flex-1 border-2 border-dashed border-slate-200 text-slate-400 hover:border-indigo-600 hover:text-indigo-600 py-5 rounded-[24px] font-black text-[11px] uppercase tracking-widest flex items-center justify-center gap-3 transition-all hover:shadow-xl hover:shadow-indigo-50"
                        >
                            <FiPlusCircle size={20} strokeWidth={3} />
                            Añadir Procedimiento Individual
                        </button>
                        <button
                            onClick={() => setShowPlanesModal(true)}
                            className="bg-indigo-600 flex-1 border-2 border-indigo-600 text-white hover:bg-indigo-700 py-5 rounded-[24px] font-black text-[11px] uppercase tracking-widest flex items-center justify-center gap-3 transition-all hover:shadow-xl shadow-indigo-200 active:scale-95"
                        >
                            <FiPackage size={20} strokeWidth={3} />
                            + Cargar Paquete / Combo Completo
                        </button>
                    </div>

                    {/* Summary Block */}
                    <div className="grid grid-cols-1 md:grid-cols-2 bg-indigo-900 text-white p-10 gap-10">
                         <div className="flex items-start gap-6">
                              <div className="w-14 h-14 bg-white/10 rounded-[22px] flex items-center justify-center backdrop-blur-md border border-white/10">
                                   <FiInfo size={24} />
                              </div>
                              <div>
                                   <h5 className="text-[14px] font-black uppercase tracking-tight mb-2">Información de Validez</h5>
                                   <p className="text-[11px] font-bold text-white/50 leading-relaxed uppercase tracking-widest">
                                       Este presupuesto tiene una vigencia de 30 días a partir de la fecha de creación. Los precios pueden variar según hallazgos clínicos adicionales durante la ejecución del tratamiento.
                                   </p>
                              </div>
                         </div>
                         <div className="flex flex-col items-end justify-center">
                              <div className="text-[11px] font-black text-white/40 uppercase tracking-[0.2em] mb-3">Total Inversión Pro-Forma</div>
                              <div className="text-5xl font-black tracking-tighter flex items-start gap-2">
                                  <span className="text-xl mt-1 text-white/30 font-black">$</span>
                                  {calculateTotal().toLocaleString('es-CO')}
                              </div>
                              <div className="mt-4 bg-emerald-500 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                                   <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                                   Cálculo en tiempo real
                              </div>
                         </div>
                    </div>
                </div>
            </div>

            {/* Modal de Planes */}
            {showPlanesModal && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[999] animate-in fade-in p-4">
                    <div className="bg-white rounded-3xl shadow-xl w-full max-w-lg overflow-hidden border border-white/40 ring-1 ring-black/5 animate-in zoom-in-95">
                        <div className="bg-slate-50 px-6 py-5 border-b border-slate-100 flex items-center justify-between">
                            <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                                <FiPackage className="text-indigo-500" /> Seleccionar Paquete / Combo
                            </h3>
                        </div>
                        <div className="p-4 space-y-3 max-h-[60vh] overflow-y-auto custom-scrollbar">
                            {loadingPlanes ? (
                                <div className="p-10 text-center text-slate-400 font-bold animate-pulse">Cargando paquetes...</div>
                            ) : planes.length === 0 ? (
                                <div className="p-10 text-center text-slate-400 font-bold">No tienes paquetes configurados. Ve a "Configuración > Planes".</div>
                            ) : planes.map(p => (
                                <div key={p.id} onClick={() => cargarCombo(p)} className="flex items-center justify-between p-4 bg-white border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/50 rounded-2xl cursor-pointer transition-all group">
                                    <div className="space-y-1">
                                        <h4 className="text-sm font-black text-slate-700 uppercase tracking-tight group-hover:text-indigo-700 transition-colors">{p.nombre}</h4>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{p.listaNombre || p.listaId}</p>
                                    </div>
                                    <div className="text-indigo-400 group-hover:text-indigo-600 transition-colors">
                                        {loadingPlanItems ? <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div> : <FiPlus size={20} />}
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 text-right">
                            <button onClick={() => setShowPlanesModal(false)} className="px-6 py-2 text-xs font-black uppercase text-slate-500 hover:text-slate-700 transition-colors">Cancelar</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
