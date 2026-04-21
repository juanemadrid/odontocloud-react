import React, { useState, useEffect, useRef } from 'react';
import { useToast } from '../../../context/ToastContext';
import { createPlan, updatePlan } from '../../../services/planService';
import { db } from '../../../firebase/firebaseConfig';
import { doc, getDoc, collection, getDocs, query, where, limit } from 'firebase/firestore';
import { FiSearch, FiTrash2, FiPlus, FiCheck, FiX, FiInfo, FiActivity, FiDollarSign, FiChevronLeft, FiPlusCircle, FiPackage, FiFileText, FiPrinter, FiPlusSquare, FiSave } from 'react-icons/fi';
import { useFormContext } from 'react-hook-form';
import { useAuth } from '../../../context/AuthContext';
import ProcedureAdditionModal from './ProcedureAdditionModal';
import ToothSelectorModal from './ToothSelectorModal';
import { BudgetPrintService } from '../../../services/BudgetPrintService';

export default function PlanEditor({ patient: dbPatient, initialData, onClose, onSaved }) {
    const { watch: watchPatient } = useFormContext() || { watch: () => ({}) };
    const { userProfile } = useAuth();
    
    // Merge live data
    const patient = {
        ...dbPatient,
        nombreCompleto: watchPatient("nombreCompleto") || dbPatient?.nombreCompleto,
        nroDocumento: watchPatient("nroDocumento") || dbPatient?.nroDocumento,
        celular: watchPatient("celular") || dbPatient?.celular,
        email: watchPatient("email") || dbPatient?.email
    };

    const isEditing = !!initialData;
    const patientId = patient?.id;
    const toast = useToast();
    const [loading, setLoading] = useState(false);
    const [title, setTitle] = useState(initialData?.title || "Presupuesto Integral de Tratamiento");
    const [baseListId, setBaseListId] = useState(null);

    const inquilino = userProfile?.inquilino;
    const [planes, setPlanes] = useState([]);
    const [showPlanesModal, setShowPlanesModal] = useState(false);
    const [loadingPlanes, setLoadingPlanes] = useState(false);
    const [loadingPlanItems, setLoadingPlanItems] = useState(false);
    const [showProcedureModal, setShowProcedureModal] = useState(false);

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

            // Inyectar al presupuesto
            const newItems = planItems.map(it => ({
                id: Math.random().toString(36).substr(2, 9),
                code: it.codigo || "",
                desc: it.nombre || "",
                amount: Number(it.precio || 0),
                qty: Number(it.cantidad || 1),
                descuento: Number(it.descuento || 0),
                dientes: it.dientes || "",
                line_obs: it.line_obs || ""
            }));

            setItems([...items, ...newItems]);
            setShowPlanesModal(false);
            toast.success(`Combo "${plan.nombre}" cargado!`);
        } catch (e) {
            console.error(e);
            toast.error("Error cargando el combo.");
        } finally {
            setLoadingPlanItems(false);
        }
    };

    const handleModalAdd = (newStagedItems) => {
        setItems([...items, ...newStagedItems]);
        toast.success(`${newStagedItems.length} servicios cargados con éxito`);
    };

    // Items state
    const [items, setItems] = useState(initialData?.items || []);
    const [obs, setObs] = useState(initialData?.observaciones || "");

    // UI state for search
    const [activeSearchId, setActiveSearchId] = useState(null);
    const [searchResults, setSearchResults] = useState([]);
    const [searchLoading, setSearchLoading] = useState(false);

    // Dropdown visibility
    const [showResults, setShowResults] = useState(false);

    // Tooth Selector State
    const [toothModal, setToothModal] = useState({ isOpen: false, itemId: null, initialValue: "" });

    // Deletion Modal State
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, planId: null, planName: "" });

    const openToothSelector = (item) => {
        setToothModal({
            isOpen: true,
            itemId: item.id,
            initialValue: item.dientes || ""
        });
    };

    const handleToothSelection = (teethString) => {
        updateItem(toothModal.itemId, 'dientes', teethString);
    };

    const [baseListName, setBaseListName] = useState("Sin Lista Asignada");
    const [allPriceLists, setAllPriceLists] = useState([]);

    useEffect(() => {
        const fetchAllLists = async () => {
            const currentInquilino = inquilino || patient?.inquilino;
            if (!currentInquilino) return;
            try {
                const q = query(collection(db, "listas_precios"), where("inquilino", "==", currentInquilino));
                const snap = await getDocs(q);
                setAllPriceLists(snap.docs.map(d => ({ id: d.id, ...d.data() })));
            } catch (e) { console.error(e); }
        };
        fetchAllLists();
    }, [inquilino, patient?.inquilino]);

    useEffect(() => {
        const fetchInitialBaseList = async () => {
            const currentInquilino = inquilino || patient?.inquilino;
            if (!currentInquilino) return;
            
            try {
                // PRIMERO: Intentar por el plan actual (si ya tiene uno guardado)
                if (initialData?.baseListId) {
                    setBaseListId(initialData.baseListId);
                    const listSnap = await getDoc(doc(db, "listas_precios", initialData.baseListId));
                    if(listSnap.exists()) setBaseListName(listSnap.data().nombre);
                    return;
                }

                // SEGUNDO: Intentar por el plan asignado al paciente
                if (patient?.planId) {
                    const planSnap = await getDoc(doc(db, "planes", patient.planId));
                    if (planSnap.exists() && planSnap.data().baseListId) {
                        const bId = planSnap.data().baseListId;
                        setBaseListId(bId);
                        const listSnap = await getDoc(doc(db, "listas_precios", bId));
                        if(listSnap.exists()) setBaseListName(listSnap.data().nombre);
                        return;
                    }
                }

                // TERCERO: Fallback - Buscar la lista marcada como "en_uso"
                const q = query(
                    collection(db, "listas_precios"),
                    where("inquilino", "==", currentInquilino),
                    where("en_uso", "==", true),
                    limit(1)
                );
                const activeListSnap = await getDocs(q);
                if (!activeListSnap.empty) {
                    const docData = activeListSnap.docs[0].data();
                    setBaseListId(activeListSnap.docs[0].id);
                    setBaseListName(docData.nombre);
                } else {
                    // CUARTO: Fallback final - Cualquier lista del inquilino
                    const qAll = query(
                        collection(db, "listas_precios"),
                        where("inquilino", "==", currentInquilino),
                        limit(1)
                    );
                    const anyListSnap = await getDocs(qAll);
                    if (!anyListSnap.empty) {
                        const docData = anyListSnap.docs[0].data();
                        setBaseListId(anyListSnap.docs[0].id);
                        setBaseListName(docData.nombre);
                    }
                }
            } catch (e) {
                console.error("Error fetching price list context:", e);
            }
        };
        fetchInitialBaseList();
    }, [patient?.planId, inquilino, patient?.inquilino, initialData?.baseListId]);

    const handleListChange = async (e) => {
        const id = e.target.value;
        setBaseListId(id);
        const selected = allPriceLists.find(l => l.id === id);
        if (selected) setBaseListName(selected.nombre);
        toast.info(`Tarifario cambiado a: ${selected?.nombre}`);
    };

    const handleItemSearch = async (id, term) => {
        updateItem(id, 'desc', term);
        if (!baseListId || term.length < 1) { // Reducido a 1 carácter
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
        setItems([...items, { id: Date.now(), desc: "", amount: 0, qty: 1, code: "", dientes: "", line_obs: "", descuento: 0 }]);
    };

    const removeItem = (id) => {
        if (items.length === 1) return;
        setItems(items.filter(i => i.id !== id));
    };

    const updateItem = (id, field, val) => {
        setItems(items.map(i => i.id === id ? { ...i, [field]: val } : i));
    };

    const calculateSubtotal = () => {
        return items.reduce((acc, curr) => acc + (Number(curr.amount) * Number(curr.qty)), 0);
    };

    const calculateDiscounts = () => {
        return items.reduce((acc, curr) => acc + (Number(curr.descuento || 0)), 0);
    };

    const calculateTotal = () => {
        return calculateSubtotal() - calculateDiscounts();
    };

    const handleConvertToPlan = async () => {
        if (!isEditing) {
            toast.error("Guarda el presupuesto antes de convertirlo");
            return;
        }
        if (!window.confirm("¿Seguro que deseas convertir este presupuesto en un Plan de Tratamiento?")) return;
        
        setLoading(true);
        try {
            await updatePlan(initialData.id, { 
                type: 'plan',
                status: 'accepted',
                convertedFrom: initialData.id,
                convertedAt: new Date()
            });
            toast.success("¡Convertido a Plan de Tratamiento!");
            onSaved?.();
        } catch (e) {
            toast.error("Error al convertir");
        } finally {
            setLoading(true); // Se queda cargando mientras recarga
        }
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
                subtotal: calculateSubtotal(),
                totalDescuento: calculateDiscounts(),
                status,
                type: initialData?.type || "presupuesto",
                profesionalId: initialData?.profesionalId || "",
                vigencia: initialData?.vigencia || 30,
                observaciones: obs,
                inquilino: inquilino || patient?.inquilino || "",
                baseListId: baseListId // Persistir el tarifario usado
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
        } finally {
            setLoading(false);
        }
    };

    const confirmDelete = async () => {
        if (!isEditing) {
            onClose();
            return;
        }
        setLoading(true);
        try {
            await deletePlan(initialData.id);
            toast.success("Presupuesto eliminado");
            onSaved?.();
        } catch (error) {
            toast.error("Error al eliminar");
        } finally {
            setLoading(false);
            setDeleteModal({ ...deleteModal, isOpen: false });
        }
    };

    const handlePrint = async () => {
        if (!userProfile?.tenant) {
            toast.error("Error: Información de clínica no disponible");
            return;
        }

        const planData = {
            title: title || "Presupuesto",
            items: items,
            subtotal: calculateSubtotal(),
            totalDescuento: calculateDiscounts(),
            total: calculateTotal(),
            date: initialData?.date || new Date(),
            type: initialData?.type || "presupuesto",
            profesional: initialData?.profesional || userProfile.nombre,
            observaciones: obs
        };

        await BudgetPrintService.generatePDF(planData, patient, userProfile.tenant, userProfile);
    };

    return (
        <div className="flex flex-col h-full bg-slate-50/50 animate-fadeIn relative">
            
            {/* Header: Global Actions */}
            <div className="flex-none bg-white p-4 md:px-8 py-3 flex flex-col md:flex-row justify-between items-center gap-4 border-b border-slate-100 shadow-sm z-30">
                <div className="flex items-center gap-4 w-full md:w-auto">
                    <button onClick={onClose} className="w-10 h-10 bg-slate-50 text-slate-400 rounded-xl flex items-center justify-center hover:bg-rose-50 hover:text-rose-600 transition-all border border-slate-100 group">
                        <FiChevronLeft size={20} className="group-hover:-translate-x-0.5 transition-transform" />
                    </button>
                    <div>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                             <div className="flex items-center gap-2">
                                <FiActivity className="text-indigo-600" /> Plan de Tratamiento Pro-forma
                             </div>
                             <span className="hidden sm:inline mx-2 text-slate-200">|</span>
                             <div className="flex items-center gap-2">
                                 <span className="text-slate-300">Tarifario Aplicado:</span>
                                 <select 
                                    className={`px-3 py-1 rounded-xl text-[9px] font-black uppercase outline-none border transition-all ${baseListId ? 'bg-indigo-50 text-indigo-600 border-indigo-100 hover:border-indigo-300' : 'bg-amber-50 text-amber-600 border-amber-100'}`}
                                    value={baseListId || ""}
                                    onChange={handleListChange}
                                 >
                                     <option value="" disabled>Seleccione Tarifario...</option>
                                     {allPriceLists.map(l => (
                                         <option key={l.id} value={l.id}>{l.nombre}</option>
                                     ))}
                                 </select>
                             </div>
                        </div>
                        <input
                            placeholder="TÍTULO DEL PRESUPUESTO..."
                            value={title}
                            onChange={(e) => setTitle(e.target.value.toUpperCase())}
                            className="bg-transparent border-none p-0 text-lg font-black text-slate-800 tracking-tight outline-none w-full max-w-sm uppercase focus:ring-0"
                        />
                    </div>
                </div>

                <div className="flex items-center gap-4 w-full md:w-auto">
                    <div className="hidden lg:flex flex-col items-end px-6 border-r border-slate-100">
                        <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">Inversión Final Sugerida</span>
                        <h4 className="text-xl font-black text-indigo-600 tracking-tighter leading-none">
                            <span className="text-xs mr-1 font-bold text-slate-400">$</span>
                            {calculateTotal().toLocaleString('es-CO')}
                        </h4>
                    </div>

                    <div className="flex items-center gap-2">
                        <button onClick={handlePrint} className="p-2.5 text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all" title="Imprimir">
                             <FiPrinter size={20} />
                        </button>
                    </div>
                    
                    <div className="flex items-center gap-2 w-full md:w-auto">
                        {isEditing && (initialData?.type || 'presupuesto') === 'presupuesto' && (
                            <button 
                                onClick={handleConvertToPlan}
                                className="flex-1 md:flex-none px-5 py-2.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white rounded-xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center gap-2 border border-indigo-100"
                            >
                                <FiActivity size={14} /> Convertir a Plan
                            </button>
                        )}
                        <button 
                            onClick={() => setDeleteModal({ isOpen: true, planId: initialData?.id, planName: title })} 
                            disabled={loading} 
                            className="flex-1 md:flex-none px-5 py-2.5 bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white rounded-xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2 border border-rose-100"
                        >
                            <FiTrash2 size={14} /> {isEditing ? "Eliminar" : "Descartar"}
                        </button>
                        <button onClick={() => handleSave('accepted')} disabled={loading} className="flex-1 md:flex-none px-6 py-2.5 bg-[#8CC63F] text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-[#8CC63F]/20 hover:bg-[#7bb335] transition-all active:scale-95 flex items-center justify-center gap-2">
                             <FiCheck size={14} strokeWidth={3} /> {isEditing ? "Guardar" : "Finalizar & Aprobar"}
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Area: The Invoice Editor */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar pb-32">
                <div className="max-w-6xl mx-auto bg-white rounded-3xl shadow-[0_10px_30px_rgba(0,0,0,0.02)] border border-slate-100 overflow-hidden">
                    
                    {/* Header Table Stylized */}
                    <div className="bg-slate-50/50 px-6 py-4 flex items-center justify-between border-b border-slate-100">
                         <div className="flex items-center gap-2">
                              <div className="w-7 h-7 bg-white border border-slate-200 rounded-lg flex items-center justify-center text-slate-400">
                                  <FiFileText size={14} />
                              </div>
                              <h5 className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none">Detalle de Procedimientos & Costos</h5>
                         </div>
                    </div>

                    <table className="w-full text-left table-fixed">
                        <thead>
                            <tr className="bg-white border-b border-slate-50">
                                <th className="px-4 py-3 text-[9px] font-black text-slate-300 uppercase tracking-widest w-10">#</th>
                                <th className="px-4 py-3 text-[9px] font-black text-slate-300 uppercase tracking-widest w-1/3">Tratamiento / Descripción</th>
                                <th className="px-4 py-3 text-[9px] font-black text-slate-300 uppercase tracking-widest text-center w-16">Cant.</th>
                                <th className="px-4 py-3 text-[9px] font-black text-slate-300 uppercase tracking-widest text-center w-20">Dientes</th>
                                <th className="px-4 py-3 text-[9px] font-black text-slate-300 uppercase tracking-widest text-right w-32">Valor Unit.</th>
                                <th className="px-4 py-3 text-[9px] font-black text-slate-300 uppercase tracking-widest text-right w-24">Desc.</th>
                                <th className="px-4 py-3 text-[9px] font-black text-slate-300 uppercase tracking-widest text-right w-32">Subtotal</th>
                                <th className="px-4 py-3 w-12"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {items.map((item, index) => (
                                <tr key={item.id} className="group hover:bg-slate-50/5 transition-colors">
                                    <td className="px-4 py-3 text-[10px] font-black text-slate-300 text-center">{index + 1}</td>
                                    <td className="px-4 py-3 align-middle">
                                        <div className="text-[11px] font-black text-slate-800 uppercase tracking-tight leading-tight">
                                            {item.code && <span className="text-indigo-400 mr-2 text-[9px] font-mono">{item.code}</span>}
                                            {item.desc}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 align-middle text-center">
                                        <input
                                            type="number"
                                            className="w-12 h-9 text-center bg-slate-50 border border-slate-100 rounded-lg outline-none focus:bg-white font-black text-slate-700 text-xs transition-all"
                                            value={item.qty}
                                            onChange={(e) => updateItem(item.id, 'qty', Number(e.target.value))}
                                            min="1"
                                        />
                                    </td>
                                    <td className="px-4 py-3 align-middle text-center">
                                        <div className="flex items-center justify-center gap-1">
                                            <input
                                                type="text"
                                                placeholder="PIEZAS"
                                                className="w-16 h-9 text-center bg-slate-50 border border-slate-100 rounded-lg outline-none focus:bg-white font-black text-slate-500 text-[10px] transition-all uppercase"
                                                value={item.dientes || ""}
                                                onChange={(e) => updateItem(item.id, 'dientes', e.target.value)}
                                            />
                                            <button 
                                                onClick={() => openToothSelector(item)}
                                                className="text-indigo-500 hover:text-indigo-700 transition-colors"
                                            >
                                                <FiPlusCircle size={14} />
                                            </button>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 align-middle text-right">
                                        <div className="flex items-center justify-end gap-1 bg-slate-50 px-2 h-9 rounded-lg border border-slate-100 w-28 ml-auto">
                                            <span className="text-slate-300 text-[10px] font-bold">$</span>
                                            <input
                                                type="number"
                                                className="w-full bg-transparent text-right outline-none font-black text-slate-700 text-[12px]"
                                                value={item.amount}
                                                onChange={(e) => updateItem(item.id, 'amount', Number(e.target.value))}
                                            />
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 align-middle text-right">
                                        <div className="flex items-center justify-end gap-1 bg-rose-50 px-2 h-9 rounded-lg border border-rose-100 w-20 ml-auto">
                                            <span className="text-rose-300 text-[10px] font-bold">$</span>
                                            <input
                                                type="number"
                                                className="w-full bg-transparent text-right outline-none font-black text-rose-600 text-[12px]"
                                                value={item.descuento || 0}
                                                onChange={(e) => updateItem(item.id, 'descuento', Number(e.target.value))}
                                            />
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 align-middle text-right font-black text-[13px] text-slate-700 tracking-tight font-mono">
                                        <span className="text-[11px] font-bold text-slate-300 mr-0.5">$</span>
                                        {((item.qty * item.amount) - (item.descuento || 0)).toLocaleString('es-CO')}
                                    </td>
                                    <td className="px-4 py-3 align-middle text-center w-12">
                                        <button
                                            onClick={() => removeItem(item.id)}
                                            className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-300 hover:text-rose-500 hover:bg-rose-50 transition-all opacity-0 group-hover:opacity-100"
                                        >
                                            <FiTrash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* Add Button */}
                    <div className="p-6 border-t border-slate-100 bg-slate-50/20 flex flex-col md:flex-row gap-4">
                        <button
                            onClick={() => setShowProcedureModal(true)}
                            className="bg-indigo-600 flex-1 border border-indigo-600 text-white hover:bg-indigo-700 py-3.5 rounded-2xl font-black text-[11px] uppercase tracking-widest flex items-center justify-center gap-3 transition-all hover:shadow-lg shadow-indigo-200 active:scale-95"
                        >
                            <FiPlusCircle size={18} strokeWidth={3} />
                            + Agregar Items / Procedimientos
                        </button>
                        <button
                            onClick={() => setShowPlanesModal(true)}
                            className="bg-white flex-1 border border-dashed border-slate-200 text-slate-400 hover:border-indigo-600 hover:text-indigo-600 py-3.5 rounded-2xl font-black text-[11px] uppercase tracking-widest flex items-center justify-center gap-3 transition-all hover:shadow-lg hover:shadow-indigo-50"
                        >
                            <FiPackage size={18} strokeWidth={3} />
                            Cargar Paquete / Combo Completo
                        </button>
                    </div>

                    {/* Summary Block */}
                    <div className="grid grid-cols-1 md:grid-cols-2 bg-white p-6 gap-8 border-t border-slate-100">
                         <div className="space-y-4">
                              <h5 className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                   <FiFileText /> Observaciones Generales
                              </h5>
                              <textarea 
                                  className="w-full h-32 p-4 bg-slate-50 border border-slate-100 rounded-2xl text-[12px] font-medium text-slate-600 outline-none focus:bg-white focus:ring-4 focus:ring-indigo-100 transition-all resize-none"
                                  placeholder="Escriba aquí los términos, condiciones u observaciones del plan..."
                                  value={obs}
                                  onChange={(e) => setObs(e.target.value)}
                              />
                              <button 
                                onClick={() => handleSave(initialData?.status || 'draft')}
                                className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
                              >
                                  Guardar Observaciones
                              </button>
                         </div>
                         <div className="flex flex-col items-end justify-center space-y-4 pr-6">
                              <div className="w-full max-w-[280px] space-y-2">
                                  <div className="flex justify-between items-center text-[11px] font-bold text-slate-400">
                                      <span className="uppercase tracking-widest">Subtotal</span>
                                      <span className="font-mono">$ {calculateSubtotal().toLocaleString('es-CO')}</span>
                                  </div>
                                  <div className="flex justify-between items-center text-[11px] font-bold text-rose-400">
                                      <span className="uppercase tracking-widest">Descuentos</span>
                                      <span className="font-mono">-$ {calculateDiscounts().toLocaleString('es-CO')}</span>
                                  </div>
                                  <div className="h-px bg-slate-100 my-2" />
                                  <div className="flex justify-between items-center">
                                      <span className="text-[11px] font-black text-slate-800 uppercase tracking-[0.2em]">Total Inversión</span>
                                      <span className="text-3xl font-black text-indigo-600 tracking-tighter">
                                          <span className="text-sm mr-1 text-slate-300">$</span>
                                          {calculateTotal().toLocaleString('es-CO')}
                                      </span>
                                  </div>
                              </div>
                              <div className="mt-2 text-emerald-500 text-[9px] font-black uppercase tracking-widest flex items-center gap-2 bg-emerald-50 px-4 py-1.5 rounded-full border border-emerald-100">
                                   <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
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
                                <div className="p-10 text-center text-slate-400 font-bold">No tienes paquetes configurados. Ve a "Configuración - Planes".</div>
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

            {/* Modal de Adición de Procedimientos */}
            <ProcedureAdditionModal 
                isOpen={showProcedureModal}
                onClose={() => setShowProcedureModal(false)}
                onAdd={handleModalAdd}
                baseListId={baseListId}
                inquilino={inquilino}
            />
            <ToothSelectorModal 
                isOpen={toothModal.isOpen}
                onClose={() => setToothModal({ ...toothModal, isOpen: false })}
                onSave={handleToothSelection}
                initialValue={toothModal.initialValue}
            />

            {/* Modal de Confirmación de Eliminación Elite */}
            {deleteModal.isOpen && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[10000] flex items-center justify-center p-4">
                    <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-md overflow-hidden animate-fadeIn border border-rose-100">
                        <div className="p-8 text-center">
                            <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center text-rose-500 mx-auto mb-6 animate-pulse">
                                <FiTrash2 size={40} />
                            </div>
                            <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight mb-2">
                                {isEditing ? "¿Eliminar Presupuesto?" : "¿Descartar Cambios?"}
                            </h3>
                            <p className="text-slate-500 text-sm font-medium leading-relaxed mb-8">
                                {isEditing 
                                    ? `Estás a punto de eliminar "${deleteModal.planName}". Esta acción no se puede deshacer.`
                                    : "Si sales ahora sin guardar, se perderán todos los procedimientos agregados."}
                            </p>
                            
                            <div className="flex flex-col gap-3">
                                <button 
                                    onClick={confirmDelete}
                                    className="w-full py-4 bg-rose-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-rose-200 hover:bg-rose-700 transition-all active:scale-95"
                                >
                                    {isEditing ? "SÍ, ELIMINAR PERMANENTEMENTE" : "SÍ, DESCARTAR TODO"}
                                </button>
                                <button 
                                    onClick={() => setDeleteModal({ ...deleteModal, isOpen: false })}
                                    className="w-full py-4 bg-slate-100 text-slate-500 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-all text-center"
                                >
                                    NO, CONTINUAR EDITANDO
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
