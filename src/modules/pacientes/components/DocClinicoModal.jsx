import React, { useState, useEffect } from 'react';
import { FiX, FiCheck, FiSave } from 'react-icons/fi';
import { collection, doc, setDoc, serverTimestamp, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../../firebase/firebaseConfig';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';

export default function DocClinicoModal({ isOpen, onClose, patient, docType, initialData = null }) {
    const { userProfile } = useAuth();
    const toast = useToast();
    
    const [saving, setSaving] = useState(false);
    const [contenido, setContenido] = useState("");
    const [profesional, setProfesional] = useState("");
    const [diagnostico, setDiagnostico] = useState("");
    
    // Lista de profesionales para el dropdown si se desea cambiar
    const [catalogProfesionales, setCatalogProfesionales] = useState([]);

    useEffect(() => {
        if (!isOpen) {
            setContenido("");
            setDiagnostico("");
            setProfesional(userProfile?.nombreCompleto || userProfile?.nombre || "");
        } else if (initialData) {
            setContenido(initialData.contenido || "");
            setDiagnostico(initialData.diagnostico || "");
            setProfesional(initialData.profesional || userProfile?.nombreCompleto || userProfile?.nombre || "");
        } else {
            setProfesional(userProfile?.nombreCompleto || userProfile?.nombre || "");
        }
    }, [isOpen, initialData, userProfile]);

    useEffect(() => {
        const loadCatalog = async () => {
            if (!userProfile?.inquilino) return;
            try {
                const q = query(
                    collection(db, "usuarios"),
                    where("inquilino", "==", userProfile.inquilino),
                    where("esDoctor", "==", true),
                    where("activo", "==", true)
                );
                const s = await getDocs(q);
                const list = s.docs.map(d => {
                    const data = d.data();
                    return { id: d.id, nombreCompleto: data.nombreCompleto || `${data.nombre || ''} ${data.apellido || ''}`.trim() };
                });
                setCatalogProfesionales(list.sort((a,b) => a.nombreCompleto?.localeCompare(b.nombreCompleto) || 0));
            } catch (err) { }
        };
        if (isOpen) loadCatalog();
    }, [isOpen, userProfile]);

    if (!isOpen) return null;

    const handleSave = async () => {
        if (!contenido.trim()) return toast.error("El contenido no puede estar vacío");
        
        setSaving(true);
        try {
            const isEditing = !!initialData;
            const docRef = isEditing 
                ? doc(db, `pacientes/${patient.id}/docClis`, initialData.id)
                : doc(collection(db, `pacientes/${patient.id}/docClis`));
            
            const payload = {
                id: docRef.id,
                fechaIso: isEditing ? initialData.fechaIso : new Date().toISOString(),
                tipoDocumento: isEditing ? initialData.tipoDocumento : docType,
                profesional: profesional,
                transcribe: isEditing ? initialData.transcribe : (userProfile?.nombreCompleto || userProfile?.nombre || "Sistema"),
                creadorId: isEditing ? initialData.creadorId : (userProfile?.uid || ""),
                contenido: contenido,
                diagnostico: diagnostico,
                actualizado: serverTimestamp(),
            };

            await setDoc(docRef, payload, { merge: true });
            toast.success(`${docType || initialData?.tipoDocumento} guardada correctamente`);
            onClose();
        } catch (error) {
            console.error("Error saving document:", error);
            toast.error("Error al guardar el documento");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl flex flex-col max-h-[90vh] overflow-hidden">
                <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50/50">
                    <div>
                        <h2 className="text-xl font-black text-slate-800 tracking-tight">
                            {initialData ? `Editar ${initialData.tipoDocumento}` : `Nueva ${docType}`}
                        </h2>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">
                            Paciente: {patient?.nombreCompleto}
                        </p>
                    </div>
                    <button onClick={onClose} disabled={saving} className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-200 text-slate-500 hover:bg-rose-100 hover:text-rose-600 transition-colors">
                        <FiX size={16} />
                    </button>
                </div>
                
                <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Fecha</label>
                            <input 
                                type="text" 
                                readOnly 
                                value={new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })} 
                                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm font-medium text-slate-500 cursor-not-allowed" 
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Profesional Actuante *</label>
                            <select 
                                value={profesional}
                                onChange={(e) => setProfesional(e.target.value)}
                                className="w-full bg-white border border-slate-200 rounded-lg p-3 text-sm font-medium text-slate-700 outline-none focus:border-blue-500"
                            >
                                <option value="" disabled>Seleccione...</option>
                                {catalogProfesionales.map(p => (
                                    <option key={p.id} value={p.nombreCompleto}>{p.nombreCompleto}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {(docType === 'Consulta' || docType === 'Receta' || docType === 'Orden' || initialData?.tipoDocumento === 'Consulta' || initialData?.tipoDocumento === 'Receta' || initialData?.tipoDocumento === 'Orden') && (
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Diagnóstico asoc. (Opcional)</label>
                            <input 
                                type="text" 
                                placeholder="Ejem: K021 - Caries de la dentina"
                                value={diagnostico}
                                onChange={(e) => setDiagnostico(e.target.value)}
                                className="w-full bg-white border border-slate-200 rounded-lg p-3 text-sm font-medium text-slate-700 outline-none focus:border-blue-500" 
                            />
                        </div>
                    )}

                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Detalle / Contenido *</label>
                        <textarea 
                            rows={8}
                            required
                            placeholder={`Escriba el detalle de la ${(initialData?.tipoDocumento || docType).toLowerCase()} aquí...`}
                            value={contenido}
                            onChange={(e) => setContenido(e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-lg p-4 text-sm font-medium text-slate-700 outline-none focus:border-blue-500 resize-none custom-scrollbar" 
                        />
                    </div>
                </div>

                <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
                    <button onClick={onClose} disabled={saving} className="px-6 py-2.5 rounded-full font-bold text-sm text-slate-500 hover:bg-slate-200 transition-colors">
                        Cancelar
                    </button>
                    <button onClick={handleSave} disabled={saving} className="px-8 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-black text-[11px] uppercase tracking-widest shadow-lg shadow-blue-600/30 flex items-center gap-2 transition-transform active:scale-95 disabled:opacity-50">
                        <FiCheck size={16} /> {saving ? "Guardando..." : "Guardar Documento"}
                    </button>
                </div>
            </div>
        </div>
    );
}
