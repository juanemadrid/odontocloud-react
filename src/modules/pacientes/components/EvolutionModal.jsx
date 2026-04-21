import React, { useState, useEffect } from 'react';
import { FiX, FiCheck } from 'react-icons/fi';
import { collection, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../../firebase/firebaseConfig';
import { getPlansByPatient } from '../../../services/planService';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';
import { useForm } from 'react-hook-form';
import CIE10Search from './CIE10Search';

export default function EvolutionModal({ isOpen, onClose, patient, initialData = null }) {
    const { userProfile } = useAuth();
    const toast = useToast();
    
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState('evolucion'); // 'evolucion' | 'nota'
    const [doctors, setDoctors] = useState([]);
    const [planes, setPlanes] = useState([]);
    const [servicios, setServicios] = useState([]);
    const [plantillaDetails, setPlantillaDetails] = useState({});
    const [allChecked, setAllChecked] = useState(false);

    const { register, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm({
        defaultValues: {
            doctorId: '',
            planId: '',
            serviciosIds: [],
            ambito: 'Ambulatorio',
            finalidad: 'Diagnóstico',
            personalAtiende: '',
            dxPrincipal: null,
            dxRelacionado: null,
            complicacion: null,
            formaCirugia: '',
            modalidadAtencion: 'Intramural',
            tipoServicio: '',
            fecha: new Date().toISOString().slice(0, 10),
            horaInicio: '',
            horaFin: '',
            comentario: '',
            aplicaMedicamento: false,
            controlEsterilizacion: false,
        }
    });

    const watchPlanId = watch("planId");
    
    // Configurar estado inicial
    useEffect(() => {
        if (!isOpen) {
            reset();
            return;
        }

        if (initialData) {
            const safeDate = initialData.date?.toDate ? initialData.date.toDate() : new Date(initialData.date || Date.now());
            reset({
                ...initialData,
                fecha: safeDate.toISOString().slice(0, 10)
            });
        }
    }, [isOpen, initialData, reset]);

    // Fetch dependencies
    useEffect(() => {
        if (!isOpen) return;

        const fetchData = async () => {
            try {
                // Doctores (solo vinculados al paciente actual)
                if (patient?.profesionales && Array.isArray(patient.profesionales)) {
                    setDoctors(patient.profesionales);
                } else {
                    setDoctors([]);
                }

                // Planes de tratamiento
                if (patient?.id) {
                    try {
                        const plansData = await getPlansByPatient(patient.id);
                        setPlanes(plansData);
                    } catch (e) {
                        console.error("Error loading plans via service:", e);
                    }
                }
            } catch (err) {
                console.error("Error fetching dependencies", err);
            }
        };

        fetchData();
    }, [isOpen, patient, userProfile]);

    // Fetch Plan Items when Plan changes
    useEffect(() => {
        if (!watchPlanId || watchPlanId === '') {
            setServicios([]);
            setPlantillaDetails({});
            return;
        }

        const loadServicios = () => {
             const selectedPlan = planes.find(p => p.id === watchPlanId);
             if (selectedPlan && selectedPlan.items) {
                 const srvs = selectedPlan.items.map((i, idx) => ({ id: i.id || `item_${idx}`, ...i }));
                 setServicios(srvs);
                 
                 // Initialize checklist state
                 const initDetails = {};
                 srvs.forEach(s => {
                     initDetails[s.id] = { checked: false, observation: '' };
                 });
                 setPlantillaDetails(initDetails);
                 setAllChecked(false);
             } else {
                 setServicios([]);
                 setPlantillaDetails({});
             }
        };

        loadServicios();
    }, [watchPlanId, planes]);

    const onSubmit = async (data) => {
        console.log("EvolutionModal: onSubmit triggered", data);
        if (!data.doctorId) return toast.error("Debe seleccionar un doctor");
        if (!data.comentario) return toast.error("El comentario es obligatorio");
        if (!data.fecha) return toast.error("La fecha es obligatoria");

        setSaving(true);
        try {
            if (!patient?.id) throw new Error("Paciente no identificado");
            const isEditing = !!initialData;
            
            // Reconstruct full doctor details to store flat data
            const docObj = doctors.find(d => d.id === data.doctorId);
            const docName = docObj ? `${docObj.nombre || docObj.nombres || ''} ${docObj.apellido || docObj.apellidos || ''}`.trim() : "Doctor";

            const selectedPlan = planes.find(p => p.id === data.planId);
            const treatmentName = selectedPlan?.title || selectedPlan?.nombre || '';

            // Robust date construction
            let finalDate = new Date(`${data.fecha}T00:00:00`);
            if (data.horaInicio) {
                const [h, m] = data.horaInicio.split(':');
                if (h && m) {
                    finalDate.setHours(parseInt(h), parseInt(m));
                }
            } else {
                finalDate.setHours(0, 0);
            }

            const evolutionData = {
                type: 'evolution',
                patientId: patient.id,
                patientName: patient.nombreCompleto || patient.nombre || 'Paciente',
                profesional: docName,
                profesionalId: data.doctorId,
                treatment: treatmentName,
                description: data.comentario, 
                ...data,
                plantillaItems: plantillaDetails, // Attach the new rich checklist data
                date: finalDate, 
                inquilino: userProfile?.inquilino || userProfile?.tenantId || "",
                updatedAt: serverTimestamp(),
                registeredBy: userProfile?.uid || "",
            };

            const targetId = isEditing ? initialData.id : doc(collection(db, "clinical_evolutions")).id;
            
            await setDoc(doc(db, "clinical_evolutions", targetId), {
                ...evolutionData,
                ...(isEditing ? {} : { createdAt: serverTimestamp() })
            }, { merge: true });

            toast.success(isEditing ? "Evolución actualizada" : "Evolución registrada");
            onClose();
        } catch (error) {
            console.error("Error saving evolution:", error);
            toast.error("Error al guardar la evolución");
        } finally {
            setSaving(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white rounded-[24px] shadow-2xl w-full max-w-4xl flex flex-col h-full max-h-[90vh] overflow-hidden">
                <div className="flex flex-col h-full">
                    {/* Header Custom Tabs like design */}
                    <div className="flex border-b border-slate-100/60 sticky top-0 bg-white z-10 shrink-0">
                        <div 
                            onClick={() => setActiveTab('evolucion')}
                            className={`w-1/2 flex items-center justify-center font-black text-[13px] py-4 cursor-pointer transition-colors ${activeTab === 'evolucion' ? 'border-b-[3px] border-[#8dc63f] text-[#8dc63f]' : 'text-slate-300 bg-slate-50/50 hover:bg-slate-50'}`}
                        >
                            Evolución
                        </div>
                        <div 
                            onClick={() => setActiveTab('nota')}
                            className={`w-1/2 flex items-center justify-center font-black text-[13px] py-4 cursor-pointer transition-colors ${activeTab === 'nota' ? 'border-b-[3px] border-[#8dc63f] text-[#8dc63f]' : 'text-slate-300 bg-slate-50/50 hover:bg-slate-50'}`}
                        >
                            Nota aclaratoria
                        </div>
                        <button type="button" onClick={onClose} disabled={saving} className="absolute right-4 top-4 text-slate-400 hover:text-rose-500">
                            <FiX size={20} />
                        </button>
                    </div>
                    
                    {/* Body Form Content (Scrollable) */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-8 flex flex-col md:flex-row gap-8">
                    
                    {/* COLUMNA IZQUIERDA (Oculta si es Nota Aclaratoria) */}
                    <div className={`flex-1 space-y-5 ${activeTab === 'nota' ? 'hidden' : 'block'}`}>
                        
                        <div>
                            <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest block mb-1">
                                Seleccione doctor <span className="text-rose-500">*</span>
                            </label>
                            <select 
                                {...register("doctorId")} 
                                className="w-full h-11 px-3 rounded-lg border border-slate-200 text-sm font-bold text-slate-700 bg-white outline-none focus:border-blue-400"
                            >
                                <option value="">Seleccione...</option>
                                {doctors.map(d => (
                                    <option key={d.id} value={d.id}>
                                        {`${d.nombre || d.nombres || ''} ${d.apellido || d.apellidos || ''}`.trim() || d.nombreCompleto}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest block mb-1">
                                Plan de tratamiento
                            </label>
                            <select 
                                {...register("planId")} 
                                className="w-full h-11 px-3 rounded-lg border border-slate-200 text-sm font-bold text-slate-700 bg-white outline-none focus:border-blue-400"
                            >
                                <option value="">Seleccione...</option>
                                {planes.map(p => (
                                    <option key={p.id} value={p.id}>{p.title || p.nombre || `Plan #${p.id.slice(-4)}`}</option>
                                ))}
                            </select>
                        </div>

                        {/* Plantilla de Servicios Rica - Reemplazo del Antiguo Select Multiple */}
                        {watchPlanId && servicios.length > 0 && (
                            <div className="col-span-1 border border-slate-200 rounded-xl overflow-hidden bg-white mt-4">
                                <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex items-center justify-between">
                                    <h5 className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none">Plantilla del Tratamiento</h5>
                                    <label className="flex items-center gap-2 cursor-pointer group">
                                        <div className="relative">
                                            <input 
                                                type="checkbox" 
                                                className="sr-only peer" 
                                                checked={allChecked}
                                                onChange={(e) => {
                                                    const val = e.target.checked;
                                                    setAllChecked(val);
                                                    setPlantillaDetails(prev => {
                                                        const next = { ...prev };
                                                        Object.keys(next).forEach(k => next[k].checked = val);
                                                        return next;
                                                    });
                                                }}
                                            />
                                            <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#8dc63f]"></div>
                                        </div>
                                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Marcar realizadas</span>
                                    </label>
                                </div>
                                <div className="max-h-[250px] overflow-y-auto custom-scrollbar">
                                    <table className="w-full text-left table-fixed">
                                        <thead className="sticky top-0 bg-white shadow-sm z-10 hidden md:table-header-group">
                                            <tr>
                                                <th className="px-4 py-2 text-[9px] font-black text-slate-400 uppercase tracking-widest w-1/2">Acciones Clínicas</th>
                                                <th className="px-4 py-2 text-[9px] font-black text-slate-400 uppercase tracking-widest w-1/3">Observaciones</th>
                                                <th className="px-4 py-2 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center w-16">Real.</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {servicios.map((s, idx) => (
                                                <tr key={s.id} className="group hover:bg-slate-50/50 transition-colors flex flex-col md:table-row py-2 md:py-0">
                                                    <td className="px-4 py-3 align-middle">
                                                        <div className="text-[11px] font-bold text-slate-700 leading-tight">
                                                            {idx + 1}. {s.desc || s.procedimiento || s.nombre || 'Servicio sin nombre'}
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-2 align-middle">
                                                        <input 
                                                            type="text"
                                                            placeholder="Anotaciones..."
                                                            className="w-full h-8 px-2 rounded-md border border-slate-200 text-[10px] font-bold text-slate-600 bg-white outline-none focus:border-[#8dc63f] focus:ring-1 focus:ring-[#8dc63f]/20 transition-all placeholder:text-slate-300 caret-slate-950"
                                                            value={plantillaDetails[s.id]?.observation || ''}
                                                            onChange={(e) => setPlantillaDetails(prev => ({
                                                                ...prev,
                                                                [s.id]: { ...prev[s.id], observation: e.target.value }
                                                            }))}
                                                        />
                                                    </td>
                                                    <td className="px-4 py-2 align-middle text-center">
                                                        <div className="flex items-center justify-start md:justify-center">
                                                            <input 
                                                                type="checkbox"
                                                                className="w-4 h-4 rounded text-[#8dc63f] border-slate-300 focus:ring-[#8dc63f] cursor-pointer"
                                                                checked={plantillaDetails[s.id]?.checked || false}
                                                                onChange={(e) => setPlantillaDetails(prev => ({
                                                                    ...prev,
                                                                    [s.id]: { ...prev[s.id], checked: e.target.checked }
                                                                }))}
                                                            />
                                                            <span className="md:hidden ml-2 text-[10px] font-bold tracking-widest uppercase text-slate-400">Realizado</span>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        <div>
                            <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest block mb-1">
                                Ámbito realización del procedimiento
                            </label>
                            <select 
                                {...register("ambito")} 
                                className="w-full h-11 px-3 rounded-lg border border-slate-200 text-sm font-bold text-slate-700 bg-white outline-none focus:border-blue-400"
                            >
                                <option value="Ambulatorio">Ambulatorio</option>
                                <option value="Hospitalario">Hospitalario</option>
                                <option value="Urgencias">Urgencias</option>
                            </select>
                        </div>

                        <div>
                            <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest block mb-1">
                                Finalidad del procedimiento
                            </label>
                            <select 
                                {...register("finalidad")} 
                                className="w-full h-11 px-3 rounded-lg border border-slate-200 text-sm font-bold text-slate-700 bg-white outline-none focus:border-blue-400"
                            >
                                <option value="Diagnóstico">Diagnóstico</option>
                                <option value="Terapéutico">Terapéutico</option>
                                <option value="Preventivo">Preventivo</option>
                                <option value="Rehabilitación">Rehabilitación</option>
                            </select>
                        </div>

                        <div>
                            <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest block mb-1">
                                Personal que atiende
                            </label>
                            <input 
                                type="text"
                                {...register("personalAtiende")} 
                                className="w-full h-11 px-3 rounded-lg border border-slate-200 text-sm font-bold text-slate-700 bg-white outline-none focus:border-blue-400 caret-slate-950"
                            />
                        </div>

                        <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-4">
                            <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Diagnósticos (CIE-10)</h4>
                            <div className="space-y-3">
                                <div>
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 block">Cód dx principal <span className="text-rose-500">*</span></label>
                                    <CIE10Search onSelect={(item) => setValue('dxPrincipal', item)} />
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 block">Cód dx relacionado</label>
                                    <CIE10Search onSelect={(item) => setValue('dxRelacionado', item)} />
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 block">Complicación</label>
                                    <CIE10Search onSelect={(item) => setValue('complicacion', item)} />
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest block mb-1">
                                Forma de realización del acto quirúrgico
                            </label>
                            <select 
                                {...register("formaCirugia")} 
                                className="w-full h-11 px-3 rounded-lg border border-slate-200 text-sm font-bold text-slate-700 bg-white outline-none focus:border-blue-400"
                            >
                                <option value="">Seleccione...</option>
                                <option value="Único">Único o Bilateral</option>
                                <option value="Múltiple">Múltiple</option>
                            </select>
                        </div>

                        <div>
                            <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest block mb-1">
                                Modalidad de atención <span className="text-rose-500">*</span>
                            </label>
                            <select 
                                {...register("modalidadAtencion")} 
                                className="w-full h-11 px-3 rounded-lg border border-slate-200 text-sm font-bold text-slate-700 bg-white outline-none focus:border-blue-400"
                            >
                                <option value="Intramural">Intramural</option>
                                <option value="Extramural">Extramural</option>
                                <option value="Telemedicina">Telemedicina</option>
                            </select>
                        </div>

                    </div>

                    {/* COLUMNA DERECHA (Siempre visible, pero expandida si es Nota) */}
                    <div className={`flex-1 space-y-5 flex flex-col ${activeTab === 'nota' ? '' : 'border-t md:border-t-0 md:border-l border-slate-100 pt-6 md:pt-0 md:pl-8'}`}>
                        
                        {/* Selector de doctor exclusivo para la vista Nota Aclaratoria */}
                        {activeTab === 'nota' && (
                            <div>
                                <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest block mb-1">
                                    Seleccione doctor <span className="text-rose-500">*</span>
                                </label>
                                <select 
                                    {...register("doctorId")} 
                                    className="w-full h-11 px-3 rounded-lg border border-slate-200 text-sm font-bold text-slate-700 bg-white outline-none focus:border-blue-400"
                                >
                                    <option value="">Seleccione...</option>
                                    {doctors.map(d => (
                                        <option key={d.id} value={d.id}>
                                            {`${d.nombre || d.nombres || ''} ${d.apellido || d.apellidos || ''}`.trim() || d.nombreCompleto}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        <div className="flex gap-4">
                            <div className="flex-1">
                                <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest block mb-1">
                                    Fecha <span className="text-rose-500">*</span>
                                </label>
                                <input 
                                    type="date"
                                    {...register("fecha")} 
                                    className="w-full h-11 px-3 rounded-lg border border-slate-200 text-sm font-bold text-slate-700 bg-white outline-none focus:border-blue-400 caret-slate-950"
                                />
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <div className="flex-1">
                                <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest block mb-1">
                                    Hora inicio
                                </label>
                                <input 
                                    type="time"
                                    {...register("horaInicio")} 
                                    className="w-full h-11 px-3 rounded-lg border border-slate-200 text-sm font-bold text-slate-700 bg-white outline-none focus:border-blue-400 caret-slate-950"
                                />
                            </div>
                            <div className="flex-1">
                                <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest block mb-1">
                                    Hora fin
                                </label>
                                <input 
                                    type="time"
                                    {...register("horaFin")} 
                                    className="w-full h-11 px-3 rounded-lg border border-slate-200 text-sm font-bold text-slate-700 bg-white outline-none focus:border-blue-400 caret-slate-950"
                                />
                            </div>
                        </div>

                        <div className="flex-1 flex flex-col min-h-[250px]">
                            <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest block mb-1">
                                Comentario <span className="text-rose-500">*</span>
                            </label>
                            <textarea 
                                {...register("comentario")} 
                                className="w-full flex-1 min-h-[150px] p-4 rounded-xl border border-slate-200 text-sm font-bold text-slate-700 bg-white outline-none focus:border-blue-400 custom-scrollbar resize-none caret-slate-950"
                                placeholder="Escribe aquí los hallazgos subjetivos, objetivos y plan..."
                            />
                        </div>

                        {activeTab === 'evolucion' && (
                            <div className="space-y-4 pt-4 border-t border-slate-100">
                                <label className="flex items-center gap-3 cursor-pointer group">
                                    <div className="relative">
                                        <input type="checkbox" {...register("aplicaMedicamento")} className="sr-only peer" />
                                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#8dc63f]"></div>
                                    </div>
                                    <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest group-hover:text-slate-700 transition-colors">Aplica medicamento</span>
                                </label>

                                <label className="flex items-center gap-3 cursor-pointer group">
                                    <div className="relative">
                                        <input type="checkbox" {...register("controlEsterilizacion")} className="sr-only peer" />
                                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#8dc63f]"></div>
                                    </div>
                                    <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest group-hover:text-slate-700 transition-colors">Control de esterilización</span>
                                </label>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer Fixed */}
                <div className="p-6 border-t border-slate-100/60 bg-white shrink-0 flex justify-end gap-6 items-center">
                    <button type="button" onClick={onClose} disabled={saving} className="font-black text-[12px] uppercase tracking-widest text-[#4aa5c8] hover:text-[#3285a3] transition-colors">
                        Cerrar
                    </button>
                    <button 
                        type="button"
                        onClick={handleSubmit(onSubmit)}
                        disabled={saving} 
                        className="px-10 py-3 bg-[#8dc63f] hover:bg-[#7cb035] text-white rounded-[12px] font-black text-[13px] uppercase tracking-widest flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50 shadow-md shadow-lime-500/20"
                    >
                        {saving ? "Guardando..." : "Guardar"}
                    </button>
                </div>
            </div>
        </div>
    </div>
);
}
