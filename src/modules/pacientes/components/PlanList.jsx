import React, { useState, useEffect } from 'react';
import { getPlansByPatient, deletePlan } from '../../../services/planService';
import { getPatientById } from '../../../services/patientService';
import { FiFileText, FiPlus, FiPrinter, FiEdit3, FiTrash2, FiActivity, FiX, FiAlertCircle } from "react-icons/fi";
import { useToast } from '../../../context/ToastContext';
import { useAuth } from '../../../context/AuthContext';
import { BudgetPrintService } from '../../../services/BudgetPrintService';
import { db } from '../../../firebase/firebaseConfig';
import { collection, query, where, getDocs } from 'firebase/firestore';

export default function PlanList({ patient, refreshKey, onEdit, onNew, setEditingPlan }) {
    const patientId = patient?.id;
    const [plans, setPlans] = useState([]);
    const [payments, setPayments] = useState([]);
    const [evolutions, setEvolutions] = useState([]);
    const [loading, setLoading] = useState(true);
    const toast = useToast();
    const { userProfile } = useAuth();
    
    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState('presupuesto'); // 'presupuesto' | 'plan'
    
    // Deletion Modal State
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, planId: null, planName: "" });
    
    // Form fields
    const [formData, setFormData] = useState({
        nombre: '',
        profesional: userProfile?.nombreCompleto || `${userProfile?.nombre || ''} ${userProfile?.apellido || ''}`.trim() || '',
        vigencia: 30,
        observaciones: ''
    });
    
    const [profesionalesDropdown, setProfesionalesDropdown] = useState([]);

    useEffect(() => {
        loadData();
        loadProfesionales();
    }, [patientId, refreshKey]);

    const loadData = async () => {
        setLoading(true);
        try {
            const data = await getPlansByPatient(patientId);
            setPlans(data);

            if (patientId) {
                // Load payments
                const q = query(collection(db, "pagos"), where("patientId", "==", patientId));
                const snap = await getDocs(q);
                const paymentsData = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setPayments(paymentsData);

                // Load clinical evolutions
                const evoQ = query(collection(db, "clinical_evolutions"), where("patientId", "==", patientId));
                const evoSnap = await getDocs(evoQ);
                setEvolutions(evoSnap.docs.map(d => ({ id: d.id, ...d.data() })));
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const loadProfesionales = async () => {
        if (!userProfile?.inquilino) return;
        try {
            // Asumiendo que los profesionales son usuarios del inquilino
            const q = query(
                collection(db, "usuarios"), 
                where("inquilino", "==", userProfile.inquilino)
            );
            const snap = await getDocs(q);
            const profs = snap.docs.map(d => {
                const data = d.data();
                return data.nombreCompleto || `${data.nombre || ''} ${data.apellido || ''}`.trim() || data.displayName || data.email || '';
            }).filter(n => !!n);
            setProfesionalesDropdown([...new Set(profs)]);
        } catch (e) {
            console.error(e);
        }
    };

    const handleDeleteClick = (plan) => {
        setDeleteModal({
            isOpen: true,
            planId: plan.id,
            planName: plan.title || plan.nombre || "este registro"
        });
    };

    const confirmDelete = async () => {
        const id = deleteModal.planId;
        setDeleteModal({ ...deleteModal, isOpen: false });
        try {
            await deletePlan(id);
            toast.success("Registro eliminado permanentemente");
            loadData();
        } catch (e) {
            toast.error("Error al eliminar el registro");
        }
    };

    const handlePrint = async (e, plan) => {
        if (e) e.stopPropagation();
        
        if (!patient) {
            toast.error("Error: Datos del paciente no cargados");
            return;
        }

        const clinic = userProfile?.tenant || {
            nombre: userProfile?.tenantNombre || userProfile?.clinica || "Clínica",
            inquilino: userProfile?.inquilino || userProfile?.tenantId || userProfile?.tenant?.id
        };

        if (!clinic.inquilino && !clinic.id && !clinic.nombre) {
            console.error("Clinic identification failed:", { userProfile });
            toast.error("Datos de clínica incompletos. Por favor contacte soporte.");
            return;
        }

        // Pass userProfile to generatePDF to use as fallback for professional name
        await BudgetPrintService.generatePDF(plan, patient, clinic, userProfile);
    };

    const currentUserFullName = userProfile?.nombreCompleto || `${userProfile?.nombre || ''} ${userProfile?.apellido || ''}`.trim() || userProfile?.displayName || '';

    const openModal = (type) => {
        setModalType(type);
        setFormData({
            nombre: '',
            profesional: currentUserFullName || (profesionalesDropdown.length > 0 ? profesionalesDropdown[0] : ''),
            vigencia: 30,
            observaciones: ''
        });
        setShowModal(true);
    };

    const handleCreateSubmit = (e) => {
        e.preventDefault();
        setShowModal(false);
        // Start edit mode with initial data
        setEditingPlan({
            type: modalType,
            title: formData.nombre,
            profesionalId: formData.profesional,
            vigencia: modalType === 'presupuesto' ? formData.vigencia : null,
            observaciones: formData.observaciones,
            items: []
        });
        onNew(); // Switches PresupuestosTab to 'create/edit' mode
    };

    // Compute the display status of a plan: 'paid' | 'debt' | 'partial' | 'pending'
    const getPlanStatus = (plan) => {
        const planPayments = payments.filter(pay => pay.planId === plan.id && pay.estado !== 'Anulado');
        const planEvolutions = evolutions.filter(e => e.planId === plan.id);
        const totalCost = Number(plan.total || 0);
        const paidAmt = planPayments.reduce((s, p) => s + Number(p.monto || 0), 0);

        // Build paidMap per item
        const paidMap = {};
        (plan.items || []).forEach(it => { paidMap[it.id] = 0; });
        planPayments.forEach(p => {
            if (p.itemPayments && p.itemPayments.length > 0) {
                p.itemPayments.forEach(ip => {
                    if (paidMap[ip.itemId] !== undefined) paidMap[ip.itemId] += Number(ip.monto || 0);
                });
            }
        });

        // Check if any realized item has debt
        const hasRealizedDebt = (plan.items || []).some(item => {
            const realized = planEvolutions.some(e => e.plantillaItems?.[item.id]?.checked === true);
            if (!realized) return false;
            const itemCost = (Number(item.amount || 0) * Number(item.qty || 1)) - Number(item.descuento || 0);
            const itemPaid = paidMap[item.id] || 0;
            return itemCost - itemPaid > 0;
        });

        if (totalCost > 0 && paidAmt >= totalCost) return 'paid';
        if (hasRealizedDebt) return 'debt';
        if (paidAmt > 0) return 'partial';
        return 'pending';
    };

    const presupuestos = plans.filter(p => !p.type || p.type === 'presupuesto'); // Fallback viejo a presupuesto
    const planesTrat = plans.filter(p => p.type === 'plan');

    if (loading) return <div className="p-10 text-center text-slate-400 font-bold animate-pulse">Cargando registros...</div>;

    return (
        <div className="space-y-12 pb-20">
            {/* Tabla de Presupuestos */}
            <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
                <div className="flex flex-col sm:flex-row justify-between items-center bg-slate-50 p-6 border-b border-slate-200">
                    <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">Presupuestos</h3>
                    <button 
                        onClick={() => openModal('presupuesto')}
                        className="mt-4 sm:mt-0 px-6 py-2 bg-[#8CC63F] text-white rounded-full font-black text-[11px] uppercase tracking-widest shadow-lg shadow-[#8CC63F]/20 hover:bg-[#7bb335] transition-all flex items-center gap-2"
                    >
                        <FiPlus size={14} strokeWidth={3} /> Nuevo Presupuesto
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left table-auto">
                        <thead>
                            <tr className="bg-white border-b border-slate-100 uppercase text-[10px] font-black text-slate-400 tracking-widest">
                                <th className="px-3 py-3.5">Nombre</th>
                                <th className="px-3 py-3.5">Sucursal</th>
                                <th className="px-3 py-3.5">Profesional</th>
                                <th className="px-3 py-3.5">Fecha de creación</th>
                                <th className="px-3 py-3.5 text-center">Válido hasta</th>
                                <th className="px-3 py-3.5 text-right">Costo total</th>
                                <th className="px-3 py-3.5 text-center">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 text-[12px] font-bold text-slate-600">
                            {presupuestos.length === 0 ? (
                                <tr><td colSpan="7" className="p-8 text-center text-slate-400">No data available in table</td></tr>
                            ) : presupuestos.map(p => {
                                const createdAt = p.date ? new Date(p.date) : new Date();
                                const vigencia = p.vigencia || 30;
                                const validUntil = new Date(createdAt);
                                validUntil.setDate(validUntil.getDate() + vigencia);

                                return (
                                <tr key={p.id} className="hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => onEdit(p)}>
                                    <td className="px-3 py-3.5">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-2.5 h-2.5 rounded-full ${p.status === 'accepted' ? 'bg-[#8CC63F]' : 'bg-slate-300'}`} />
                                            <span className="uppercase text-slate-700">{p.title || p.nombre}</span>
                                        </div>
                                    </td>
                                    <td className="px-3 py-3.5 uppercase text-[10px] text-slate-400 font-black">{userProfile?.tenant?.nombre || "Sede Principal"}</td>
                                    <td className="px-3 py-3.5 text-slate-500">{p.profesionalId || p.profesional || "No Asignado"}</td>
                                    <td className="px-3 py-3.5 align-middle">
                                        <div className="flex items-center gap-2 text-slate-500">
                                            <FiFileText className="text-slate-300"/> {createdAt.toLocaleDateString()}
                                        </div>
                                    </td>
                                    <td className="px-3 py-3.5 text-center text-slate-500">{validUntil.toLocaleDateString()}</td>
                                    <td className="px-3 py-3.5 text-right font-black text-slate-900 font-mono whitespace-nowrap align-middle">$ {Number(p.total || 0).toLocaleString('es-CO')}</td>
                                    <td className="px-3 py-3.5">
                                        <div className="flex items-center justify-center gap-1.5">
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); onEdit(p); }} 
                                                className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-all shadow-sm" 
                                                title="Editar"
                                            >
                                                <FiEdit3 size={14} />
                                            </button>
                                            <button 
                                                onClick={(e) => handlePrint(e, p)} 
                                                className="p-2 bg-slate-50 text-slate-400 rounded-lg hover:bg-blue-600 hover:text-white transition-all shadow-sm" 
                                                title="Imprimir"
                                            >
                                                <FiPrinter size={14} />
                                            </button>
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); handleDeleteClick(p); }} 
                                                className="p-2 bg-slate-50 text-slate-400 rounded-lg hover:bg-rose-600 hover:text-white transition-all shadow-sm" 
                                                title="Eliminar"
                                            >
                                                <FiTrash2 size={14} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )})}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Tabla de Planes de Tratamiento */}
            <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
                <div className="flex flex-col sm:flex-row justify-between items-center bg-slate-50 p-6 border-b border-slate-200">
                    <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">Planes de Tratamiento</h3>
                    <button 
                        onClick={() => openModal('plan')}
                        className="mt-4 sm:mt-0 px-6 py-2 bg-[#8CC63F] text-white rounded-full font-black text-[11px] uppercase tracking-widest shadow-lg shadow-[#8CC63F]/20 hover:bg-[#7bb335] transition-all flex items-center gap-2"
                    >
                        <FiPlus size={14} strokeWidth={3} /> Nuevo Plan de Tratamiento
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left table-auto">
                        <thead>
                            <tr className="bg-white border-b border-slate-100 uppercase text-[10px] font-black text-slate-400 tracking-widest">
                                <th className="px-3 py-3.5">Nombre</th>
                                <th className="px-3 py-3.5">Sucursal</th>
                                <th className="px-3 py-3.5">Profesional</th>
                                <th className="px-3 py-3.5 text-center">Fecha de inicio</th>
                                <th className="px-3 py-3.5 text-center">Fecha finalización</th>
                                <th className="px-3 py-3.5 text-center">Estado</th>
                                <th className="px-3 py-3.5 text-right">Costo total</th>
                                <th className="px-3 py-3.5 text-right">Pagado</th>
                                <th className="px-3 py-3.5 text-center">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 text-[12px] font-bold text-slate-600">
                            {planesTrat.length === 0 ? (
                                <tr><td colSpan="8" className="p-8 text-center text-slate-400">No data available in table</td></tr>
                            ) : planesTrat.map(p => {
                                const createdAt = p.date ? new Date(p.date) : new Date();
                                const paidAmt = payments.filter(pay => pay.planId === p.id && pay.estado !== 'Anulado').reduce((sum, pay) => sum + Number(pay.monto || 0), 0);
                                const totalCost = Number(p.total || 0);
                                const planStatus = getPlanStatus(p);

                                const dotColor = planStatus === 'paid' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]'
                                    : planStatus === 'debt' ? 'bg-rose-500 shadow-[0_0_8px_rgba(239,68,68,0.5)] animate-pulse'
                                    : planStatus === 'partial' ? 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.5)]'
                                    : 'bg-[#8CC63F] shadow-[0_0_8px_rgba(140,198,63,0.5)]';

                                return (
                                <tr key={p.id} className="hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => onEdit(p)}>
                                    <td className="px-3 py-3.5">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-2.5 h-2.5 rounded-full ${dotColor}`} />
                                            <span className="uppercase text-slate-700">{p.title || p.nombre}</span>
                                        </div>
                                    </td>
                                    <td className="px-3 py-3.5 uppercase text-[10px] text-slate-400 font-black">{userProfile?.tenant?.nombre || "Sede Principal"}</td>
                                    <td className="px-3 py-3.5 text-slate-500">{p.profesionalId || p.profesional || "No Asignado"}</td>
                                    <td className="px-3 py-3.5 text-center text-slate-500">{createdAt.toLocaleDateString()}</td>
                                    <td className="px-3 py-3.5 text-center">
                                        {planStatus === 'paid' ? (
                                            <span className="inline-flex items-center justify-center px-2 py-1 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-full text-[9px] font-black uppercase tracking-wider leading-none shadow-sm">
                                                Pagado
                                            </span>
                                        ) : planStatus === 'debt' ? (
                                            <span className="inline-flex items-center gap-1 justify-center px-2 py-1 bg-rose-50 text-rose-600 border border-rose-100 rounded-full text-[9px] font-black uppercase tracking-wider leading-none shadow-sm animate-pulse">
                                                <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                                                Con deuda
                                            </span>
                                        ) : planStatus === 'partial' ? (
                                            <span className="inline-flex items-center gap-1 justify-center px-2 py-1 bg-amber-50 text-amber-600 border border-amber-100 rounded-full text-[9px] font-black uppercase tracking-wider leading-none shadow-sm">
                                                Abono parcial
                                            </span>
                                        ) : (
                                            <span className="text-slate-300 text-[10px] uppercase font-black tracking-widest">Sin finalizar</span>
                                        )}
                                    </td>
                                    <td className="px-3 py-3.5 text-right font-black text-slate-900 font-mono whitespace-nowrap align-middle">$ {totalCost.toLocaleString('es-CO')}</td>
                                    <td className="px-3 py-3.5 text-right font-black text-[#8CC63F] font-mono whitespace-nowrap align-middle">$ {paidAmt.toLocaleString('es-CO')}</td>
                                    <td className="px-3 py-3.5 text-center">
                                        <div className="flex items-center justify-center gap-1.5">
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); onEdit(p); }} 
                                                className="p-2 bg-[#8CC63F] text-white rounded-lg hover:bg-[#7bb335] transition-all shadow-sm" 
                                                title="Ver Plan"
                                            >
                                                <FiEdit3 size={14} />
                                            </button>
                                            <button 
                                                onClick={(e) => handlePrint(e, p)} 
                                                className="p-2 bg-slate-50 text-slate-400 rounded-lg hover:bg-blue-600 hover:text-white transition-all shadow-sm" 
                                                title="Imprimir"
                                            >
                                                <FiPrinter size={14} />
                                            </button>
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); handleDeleteClick(p); }} 
                                                className="p-2 bg-slate-50 text-slate-400 rounded-lg hover:bg-rose-600 hover:text-white transition-all shadow-sm" 
                                                title="Eliminar"
                                            >
                                                <FiTrash2 size={14} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )})}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal para Nuevo Presupuesto / Plan */}
            {showModal && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-fadeIn">
                        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                            <h3 className="text-[14px] font-black text-slate-800 uppercase tracking-tight">
                                {modalType === 'presupuesto' ? 'Nuevo Presupuesto' : 'Nuevo Plan de Tratamiento'}
                            </h3>
                            <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                                <FiX size={20} />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-1">Nombre *</label>
                                <input 
                                    required autoFocus
                                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 outline-none focus:border-blue-500 focus:bg-white transition-all text-sm font-bold text-slate-700" 
                                    placeholder={`Ingrese el nombre del ${modalType === 'presupuesto' ? 'presupuesto' : 'plan de tratamiento'}`}
                                    value={formData.nombre}
                                    onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                                />
                            </div>
                            
                            <div>
                                <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-1">Profesionales *</label>
                                <select 
                                    required
                                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 outline-none focus:border-blue-500 focus:bg-white transition-all text-sm font-bold text-slate-700"
                                    value={formData.profesional}
                                    onChange={(e) => setFormData({...formData, profesional: e.target.value})}
                                >
                                    <option value="" disabled>Seleccione...</option>
                                    <option value={currentUserFullName || 'Usuario Demo'}>{currentUserFullName || 'Usuario Demo'}</option>
                                    {profesionalesDropdown.filter(p => p !== currentUserFullName).map(p => (
                                        <option key={p} value={p}>{p}</option>
                                    ))}
                                </select>
                            </div>

                            {modalType === 'presupuesto' && (
                                <div>
                                    <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-1">Vigencia (días) *</label>
                                    <input 
                                        type="number" required min="1"
                                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 outline-none focus:border-blue-500 focus:bg-white transition-all text-sm font-bold text-slate-700"
                                        value={formData.vigencia}
                                        onChange={(e) => setFormData({...formData, vigencia: Number(e.target.value)})}
                                    />
                                </div>
                            )}

                            <div>
                                <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-1">Observaciones</label>
                                <textarea 
                                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 outline-none focus:border-blue-500 focus:bg-white transition-all text-sm font-bold text-slate-700 h-24 resize-none"
                                    value={formData.observaciones}
                                    onChange={(e) => setFormData({...formData, observaciones: e.target.value})}
                                ></textarea>
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-50">
                                <button type="button" onClick={() => setShowModal(false)} className="px-6 py-2 text-xs font-black uppercase text-slate-500 hover:text-slate-700">Cerrar</button>
                                <button 
                                    type="button" 
                                    onClick={handleCreateSubmit}
                                    className="px-6 py-2 bg-[#8CC63F] hover:bg-[#7bb335] text-white rounded-lg text-xs font-black uppercase tracking-widest shadow-md"
                                >
                                    Crear
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de Confirmación de Eliminación Elite */}
            {deleteModal.isOpen && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[10000] flex items-center justify-center p-4">
                    <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-md overflow-hidden animate-fadeIn border border-rose-100">
                        <div className="p-8 text-center">
                            <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center text-rose-500 mx-auto mb-6 animate-pulse">
                                <FiTrash2 size={40} />
                            </div>
                            <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight mb-2">¿Confirmar Eliminación?</h3>
                            <p className="text-slate-500 text-sm font-medium leading-relaxed mb-8">
                                Estás a punto de eliminar el presupuesto <span className="text-rose-500 font-bold">"{deleteModal.planName}"</span>. 
                                Esta acción es irreversible y se perderán todos los datos asociados.
                            </p>
                            
                            <div className="flex flex-col gap-3">
                                <button 
                                    onClick={confirmDelete}
                                    className="w-full py-4 bg-rose-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-rose-200 hover:bg-rose-700 transition-all active:scale-95"
                                >
                                    SÍ, ELIMINAR REGISTRO
                                </button>
                                <button 
                                    onClick={() => setDeleteModal({ ...deleteModal, isOpen: false })}
                                    className="w-full py-4 bg-slate-100 text-slate-500 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-all text-center"
                                >
                                    NO, MANTENER REGISTRO
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
