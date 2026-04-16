import React, { useState, useEffect } from 'react';
import { FiX, FiCheck, FiActivity, FiMessageSquare, FiBookmark } from 'react-icons/fi';
import { collection, doc, addDoc, setDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { db } from '../../../firebase/firebaseConfig';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';

export default function EvolutionModal({ isOpen, onClose, patient, initialData = null }) {
    const { userProfile } = useAuth();
    const { toast } = useToast();
    
    const [saving, setSaving] = useState(false);
    const [description, setDescription] = useState("");
    const [treatment, setTreatment] = useState("");
    const [prognosis, setPrognosis] = useState("Favorable");
    const [date, setDate] = useState(new Date().toISOString().slice(0, 16));

    useEffect(() => {
        if (!isOpen) {
            setDescription("");
            setTreatment("");
            setPrognosis("Favorable");
            setDate(new Date().toISOString().slice(0, 16));
        } else if (initialData) {
            setDescription(initialData.description || "");
            setTreatment(initialData.treatment || "");
            setPrognosis(initialData.prognosis || "Favorable");
            if (initialData.date) {
               const dateObj = initialData.date instanceof Date ? initialData.date : initialData.date.toDate();
               setDate(new Date(dateObj.getTime() - dateObj.getTimezoneOffset() * 60000).toISOString().slice(0, 16));
            }
        }
    }, [isOpen, initialData]);

    if (!isOpen) return null;

    const handleSave = async () => {
        if (!description.trim()) return toast.error("La descripción es obligatoria");
        
        setSaving(true);
        try {
            const isEditing = !!initialData;
            const evolutionData = {
                patientId: patient.id,
                description,
                treatment,
                prognosis,
                date: Timestamp.fromDate(new Date(date)),
                updatedAt: serverTimestamp(),
                profesional: userProfile?.nombreCompleto || userProfile?.nombre || "Sistema",
                profesionalId: userProfile?.uid || ""
            };

            if (isEditing) {
                await setDoc(doc(db, "clinical_evolutions", initialData.id), evolutionData, { merge: true });
                toast.success("Evolución actualizada correctamente");
            } else {
                await addDoc(collection(db, "clinical_evolutions"), {
                    ...evolutionData,
                    createdAt: serverTimestamp()
                });
                toast.success("Evolución registrada correctamente");
            }
            onClose();
        } catch (error) {
            console.error("Error saving evolution:", error);
            toast.error("Error al guardar la evolución");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-2xl flex flex-col max-h-[90vh] overflow-hidden border border-slate-100">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-50 bg-slate-50/30">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-100">
                            <FiActivity size={24} />
                        </div>
                        <div>
                           <h2 className="text-xl font-black text-slate-800 tracking-tight">
                               {initialData ? "Editar Evolución" : "Nueva Evolución Clínica"}
                           </h2>
                           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Paciente: {patient?.nombreCompleto}</p>
                        </div>
                    </div>
                    <button onClick={onClose} disabled={saving} className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-100 text-slate-400 hover:bg-rose-100 hover:text-rose-600 transition-all">
                        <FiX size={20} />
                    </button>
                </div>
                
                {/* Body */}
                <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">Fecha y Hora</label>
                            <input 
                                type="datetime-local" 
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm font-black text-slate-700 outline-none focus:bg-white focus:ring-4 focus:ring-blue-500/5 transition-all" 
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">Pronóstico</label>
                            <select 
                                value={prognosis}
                                onChange={(e) => setPrognosis(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm font-black text-slate-700 outline-none focus:bg-white focus:ring-4 focus:ring-blue-500/5 transition-all"
                            >
                                <option value="Favorable">🟢 Favorable</option>
                                <option value="Reservado">🟡 Reservado</option>
                                <option value="Desfavorable">🔴 Desfavorable</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 px-1 flex items-center gap-2">
                             <FiMessageSquare size={12} className="text-blue-500" /> Descripción / Evolución (S.O.)
                        </label>
                        <textarea 
                            rows={5}
                            required
                            placeholder="Escribe aquí los hallazgos subjetivos y objetivos..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-100 rounded-[24px] p-5 text-sm font-bold text-slate-700 outline-none focus:bg-white focus:ring-4 focus:ring-blue-500/5 transition-all resize-none" 
                        />
                    </div>

                    <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 px-1 flex items-center gap-2">
                             <FiBookmark size={12} className="text-emerald-500" /> Tratamiento / Procedimiento
                        </label>
                        <textarea 
                            rows={3}
                            placeholder="Especifique el tratamiento realizado en esta sesión..."
                            value={treatment}
                            onChange={(e) => setTreatment(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-100 rounded-[20px] p-5 text-sm font-bold text-slate-700 outline-none focus:bg-white focus:ring-4 focus:ring-emerald-500/5 transition-all resize-none" 
                        />
                    </div>
                </div>

                {/* Footer */}
                <div className="p-8 border-t border-slate-50 bg-slate-50/30 flex justify-end gap-4">
                    <button onClick={onClose} disabled={saving} className="px-8 py-3 rounded-full font-black text-[11px] uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-colors">
                        Cancelar
                    </button>
                    <button onClick={handleSave} disabled={saving} className="px-10 py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-black text-[11px] uppercase tracking-widest shadow-xl shadow-blue-600/20 flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50">
                        <FiCheck size={16} /> {saving ? "Guardando..." : "Registrar Sesión"}
                    </button>
                </div>
            </div>
        </div>
    );
}
