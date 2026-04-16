import React, { useState, useEffect } from 'react';
import { getPlansByPatient, deletePlan } from '../../../services/planService';
import { FiFileText, FiPlus, FiPrinter, FiEdit3, FiTrash2, FiActivity, FiX } from "react-icons/fi";
import { useToast } from '../../../context/ToastContext';
import { useAuth } from '../../../context/AuthContext';
import { db } from '../../../firebase/firebaseConfig';
import { collection, query, where, getDocs } from 'firebase/firestore';

export default function PlanList({ patientId, refreshKey, onEdit, onNew, setEditingPlan }) {
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const toast = useToast();
    const { userProfile } = useAuth();
    
    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState('presupuesto'); // 'presupuesto' | 'plan'
    
    // Form fields
    const [formData, setFormData] = useState({
        nombre: '',
        profesional: userProfile?.nombre || '',
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
            const profs = snap.docs.map(d => d.data().nombre).filter(n => !!n);
            setProfesionalesDropdown([...new Set(profs)]);
        } catch (e) {
            console.error(e);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("¿Seguro que deseas eliminar este registro?")) return;
        try {
            await deletePlan(id);
            toast.success("Registro eliminado");
            loadData();
        } catch (e) {
            toast.error("Error al eliminar");
        }
    };

    const openModal = (type) => {
        setModalType(type);
        setFormData({
            nombre: '',
            profesional: userProfile?.nombre || (profesionalesDropdown.length > 0 ? profesionalesDropdown[0] : ''),
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
                                <th className="px-6 py-4">Nombre</th>
                                <th className="px-6 py-4">Sucursal</th>
                                <th className="px-6 py-4">Profesional</th>
                                <th className="px-6 py-4">Fecha de creación</th>
                                <th className="px-6 py-4 text-center">Válido hasta</th>
                                <th className="px-6 py-4 text-right">Costo total</th>
                                <th className="px-6 py-4 text-center">Acciones</th>
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
                                <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4 uppercase flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-[#8CC63F]"></div>{p.title || p.nombre}</td>
                                    <td className="px-6 py-4 uppercase text-slate-400">{userProfile?.tenant?.nombre || "Clínica"}</td>
                                    <td className="px-6 py-4">{p.profesionalId || p.profesional || "No Asignado"}</td>
                                    <td className="px-6 py-4 align-middle">
                                        <div className="flex items-center gap-2"><FiFileText className="text-slate-300"/> {createdAt.toLocaleDateString()}</div>
                                    </td>
                                    <td className="px-6 py-4 text-center">{validUntil.toLocaleDateString()}</td>
                                    <td className="px-6 py-4 text-right font-black text-slate-700 font-mono">$ {Number(p.total || 0).toLocaleString('es-CO')}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-center gap-2">
                                            <button onClick={() => alert("Generando PDF institucional...")} className="p-1.5 text-slate-400 hover:text-indigo-600"><FiPrinter size={15} /></button>
                                            <button onClick={() => onEdit(p)} className="p-1.5 text-slate-400 hover:text-blue-500"><FiEdit3 size={15} /></button>
                                            <button onClick={() => handleDelete(p.id)} className="p-1.5 text-slate-400 hover:text-red-500"><FiTrash2 size={15} /></button>
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
                                <th className="px-6 py-4">Nombre</th>
                                <th className="px-6 py-4">Sucursal</th>
                                <th className="px-6 py-4">Profesional</th>
                                <th className="px-6 py-4 text-center">Fecha de inicio</th>
                                <th className="px-6 py-4 text-center">Fecha finalización</th>
                                <th className="px-6 py-4 text-right">Costo total</th>
                                <th className="px-6 py-4 text-right">Pagado</th>
                                <th className="px-6 py-4 text-center">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 text-[12px] font-bold text-slate-600">
                            {planesTrat.length === 0 ? (
                                <tr><td colSpan="8" className="p-8 text-center text-slate-400">No data available in table</td></tr>
                            ) : planesTrat.map(p => {
                                const createdAt = p.date ? new Date(p.date) : new Date();
                                return (
                                <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4 uppercase flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-[#8CC63F]"></div>{p.title || p.nombre}</td>
                                    <td className="px-6 py-4 uppercase text-slate-400">{userProfile?.tenant?.nombre || "Clínica"}</td>
                                    <td className="px-6 py-4">{p.profesionalId || p.profesional || "No Asignado"}</td>
                                    <td className="px-6 py-4 text-center">{createdAt.toLocaleDateString()}</td>
                                    <td className="px-6 py-4 text-center text-slate-400">Sin finalizar</td>
                                    <td className="px-6 py-4 text-right font-black text-slate-700 font-mono">$ {Number(p.total || 0).toLocaleString('es-CO')}</td>
                                    <td className="px-6 py-4 text-right font-black text-[#8CC63F] font-mono">$ 0</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-center gap-2">
                                            <button onClick={() => alert("Generando PDF institucional...")} className="p-1.5 text-slate-400 hover:text-indigo-600"><FiPrinter size={15} /></button>
                                            <button onClick={() => onEdit(p)} className="p-1.5 text-white bg-blue-500 hover:bg-blue-600 rounded-md shadow-md"><FiEdit3 size={15} /></button>
                                            <button onClick={() => handleDelete(p.id)} className="p-1.5 text-slate-400 hover:text-red-500"><FiTrash2 size={15} /></button>
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
                        <form onSubmit={handleCreateSubmit} className="p-6 space-y-4">
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
                                    <option value={userProfile?.nombre || 'Usuario Demo'}>{userProfile?.nombre || 'Usuario Demo'}</option>
                                    {profesionalesDropdown.filter(p => p !== userProfile?.nombre).map(p => (
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
                                <button type="submit" className="px-6 py-2 bg-[#8CC63F] hover:bg-[#7bb335] text-white rounded-lg text-xs font-black uppercase tracking-widest shadow-md">Crear</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
