import React, { useState, useEffect } from "react";
import { 
    FiPrinter, 
    FiFileText, 
    FiPlus, 
    FiSearch, 
    FiEye, 
    FiEdit2, 
    FiTrash2, 
    FiDownload 
} from "react-icons/fi";
import { collection, query, onSnapshot, orderBy, doc, deleteDoc } from "firebase/firestore";
import { db } from "../../../firebase/firebaseConfig";
import { useToast } from "../../../context/ToastContext";
import DocClinicoModal from "./DocClinicoModal";

export default function HistoriaClinicaContainer({ patient }) {
    const toast = useToast();
    const [documents, setDocuments] = useState([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedDocType, setSelectedDocType] = useState("");
    const [editingDoc, setEditingDoc] = useState(null);
    
    // Filters state
    const [filterFecha, setFilterFecha] = useState("");
    const [filterTipo, setFilterTipo] = useState("");
    const [filterProf, setFilterProf] = useState("");
    const [filterTrans, setFilterTrans] = useState("");

    // Real-time synchronization of clinical documents
    useEffect(() => {
        if (!patient?.id) return;
        const q = query(
            collection(db, `pacientes/${patient.id}/docClis`),
            orderBy("fechaIso", "desc")
        );
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setDocuments(docs);
        });
        return () => unsubscribe();
    }, [patient?.id]);

    const handleOpenModal = (tipo) => {
        setSelectedDocType(tipo);
        setEditingDoc(null);
        setModalOpen(true);
    };

    const handleEditDoc = (doc) => {
        setEditingDoc(doc);
        setSelectedDocType(doc.tipoDocumento);
        setModalOpen(true);
    };

    const handleDeleteDoc = async (docId) => {
        if (!window.confirm("¿Seguro que deseas eliminar este documento clínico?")) return;
        try {
            await deleteDoc(doc(db, `pacientes/${patient.id}/docClis`, docId));
            toast.success("Documento eliminado correctamente");
        } catch (err) {
            console.error("Error deleting doc", err);
            toast.error("Error al eliminar el documento");
        }
    };

    // Filter logic
    const filteredDocs = documents.filter(d => {
        const dFecha = new Date(d.fechaIso).toLocaleDateString().toLowerCase();
        if (filterFecha && !dFecha.includes(filterFecha.toLowerCase())) return false;
        if (filterTipo && !d.tipoDocumento?.toLowerCase().includes(filterTipo.toLowerCase())) return false;
        if (filterProf && !d.profesional?.toLowerCase().includes(filterProf.toLowerCase())) return false;
        if (filterTrans && !d.transcribe?.toLowerCase().includes(filterTrans.toLowerCase())) return false;
        return true;
    });

    if (!patient) return <div className="p-8 text-center text-slate-400">Cargando paciente...</div>;

    return (
        <div className="flex flex-col h-full bg-slate-50 min-h-0 animate-fadeIn relative">
            <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
                
                {/* Header Actions */}
                <div className="flex justify-end gap-3 mb-8">
                    <button className="px-6 py-2.5 bg-[#8CC63F] hover:bg-[#7bb335] text-white rounded-full font-black text-[11px] uppercase tracking-widest shadow-lg shadow-[#8CC63F]/20 flex items-center gap-2 transition-all active:scale-95">
                        Imprimir historia clínica
                    </button>
                    <button className="px-6 py-2.5 bg-[#8CC63F] hover:bg-[#7bb335] text-white rounded-full font-black text-[11px] uppercase tracking-widest shadow-lg shadow-[#8CC63F]/20 flex items-center gap-2 transition-all active:scale-95">
                        Impresión parcial
                    </button>
                </div>

                {/* Main Content Card */}
                <div className="bg-white rounded-[24px] border border-slate-100 shadow-sm p-6 md:p-8">
                    
                    {/* Creation Buttons Block */}
                    <div className="flex justify-end mb-10">
                        <div className="grid grid-cols-2 gap-3 max-w-sm w-full">
                            <button onClick={() => handleOpenModal("Receta")} className="bg-[#8CC63F] hover:bg-[#7bb335] text-white rounded-full py-2 px-4 font-black text-[11px] uppercase tracking-widest flex items-center justify-center gap-1.5 transition-colors shadow-sm">
                                <FiPlus size={14} /> Nueva receta
                            </button>
                            <button onClick={() => handleOpenModal("Orden")} className="bg-[#8CC63F] hover:bg-[#7bb335] text-white rounded-full py-2 px-4 font-black text-[11px] uppercase tracking-widest flex items-center justify-center gap-1.5 transition-colors shadow-sm">
                                <FiPlus size={14} /> Nueva orden
                            </button>
                            <button onClick={() => handleOpenModal("Consulta")} className="bg-[#8CC63F] hover:bg-[#7bb335] text-white rounded-full py-2 px-4 font-black text-[11px] uppercase tracking-widest flex items-center justify-center gap-1.5 transition-colors shadow-sm">
                                <FiPlus size={14} /> Nueva consulta
                            </button>
                            <button onClick={() => handleOpenModal("Alerta")} className="bg-[#8CC63F] hover:bg-[#7bb335] text-white rounded-full py-2 px-4 font-black text-[11px] uppercase tracking-widest flex items-center justify-center gap-1.5 transition-colors shadow-sm">
                                <FiPlus size={14} /> Nueva alerta
                            </button>
                            <div className="col-start-2">
                                <button onClick={() => handleOpenModal("Plantilla")} className="w-full bg-[#8CC63F] hover:bg-[#7bb335] text-white rounded-full py-2 px-4 font-black text-[11px] uppercase tracking-widest flex items-center justify-center gap-1.5 transition-colors shadow-sm">
                                    <FiPlus size={14} /> Nueva plantilla
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Table Toolbar */}
                    <div className="flex justify-end mb-4">
                        <div className="relative w-64">
                            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input 
                                type="text" 
                                placeholder="Buscar..." 
                                className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-medium text-slate-600"
                            />
                        </div>
                    </div>

                    {/* Elite Table */}
                    <div className="overflow-x-auto rounded-xl border border-slate-100">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr>
                                    <th className="bg-slate-50 border-b border-slate-100 px-4 py-3 align-top min-w-[150px]">
                                        <div className="font-bold text-[10px] uppercase tracking-widest text-slate-400 mb-2 flex items-center gap-1">Fecha <FiSearch size={10} /></div>
                                        <input type="text" value={filterFecha} onChange={(e) => setFilterFecha(e.target.value)} className="w-full text-xs p-1 border border-slate-200 rounded outline-none focus:border-blue-400" />
                                    </th>
                                    <th className="bg-slate-50 border-b border-slate-100 px-4 py-3 align-top min-w-[200px]">
                                        <div className="font-bold text-[10px] uppercase tracking-widest text-slate-400 mb-2">Tipo documento</div>
                                        <div className="relative">
                                            <FiSearch size={10} className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400" />
                                            <input type="text" value={filterTipo} onChange={(e) => setFilterTipo(e.target.value)} className="w-full text-xs pl-6 p-1 border border-slate-200 rounded outline-none focus:border-blue-400" />
                                        </div>
                                    </th>
                                    <th className="bg-slate-50 border-b border-slate-100 px-4 py-3 align-top min-w-[200px]">
                                        <div className="font-bold text-[10px] uppercase tracking-widest text-slate-400 mb-2">Profesional</div>
                                        <div className="relative">
                                            <FiSearch size={10} className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400" />
                                            <input type="text" value={filterProf} onChange={(e) => setFilterProf(e.target.value)} className="w-full text-xs pl-6 p-1 border border-slate-200 rounded outline-none focus:border-blue-400" />
                                        </div>
                                    </th>
                                    <th className="bg-slate-50 border-b border-slate-100 px-4 py-3 align-top min-w-[200px]">
                                        <div className="font-bold text-[10px] uppercase tracking-widest text-slate-400 mb-2 flex items-center gap-1"><FiEdit2 size={10} className="text-slate-400" /> Transcribe</div>
                                        <input type="text" value={filterTrans} onChange={(e) => setFilterTrans(e.target.value)} className="w-full text-xs p-1 border border-slate-200 rounded outline-none focus:border-blue-400" />
                                    </th>
                                    <th className="bg-slate-50 border-b border-slate-100 px-4 py-3 align-top w-[140px]">
                                        <div className="font-bold text-[10px] uppercase tracking-widest text-slate-400 mb-2">Acciones</div>
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {filteredDocs.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-4 py-12 text-center text-slate-400 text-sm font-medium">
                                            No se encontraron documentos clínicos.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredDocs.map(doc => (
                                        <tr key={doc.id} className="hover:bg-slate-50/50 transition-colors group">
                                            <td className="px-4 py-4 align-top">
                                                <div className="text-xs font-medium text-slate-600">
                                                    {new Date(doc.fechaIso).toLocaleDateString('es-ES')}
                                                </div>
                                                <div className="text-[10px] text-slate-400 mt-0.5">
                                                    {new Date(doc.fechaIso).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                            </td>
                                            <td className="px-4 py-4 align-top">
                                                <div className="text-sm font-medium text-slate-700">{doc.tipoDocumento}</div>
                                                {doc.diagnostico && <div className="text-[10px] font-bold uppercase tracking-widest text-indigo-500 mt-1 truncate max-w-[200px]">{doc.diagnostico}</div>}
                                            </td>
                                            <td className="px-4 py-4 align-top">
                                                <div className="text-sm text-slate-600 truncate max-w-[200px]">{doc.profesional}</div>
                                            </td>
                                            <td className="px-4 py-4 align-top">
                                                <div className="text-sm text-slate-500 truncate max-w-[200px]">{doc.transcribe}</div>
                                            </td>
                                            <td className="px-4 py-4 align-top">
                                                <div className="flex items-center gap-1">
                                                    <button className="w-7 h-7 bg-blue-100 hover:bg-blue-200 text-blue-600 rounded flex items-center justify-center transition-colors" title="Ver detalle">
                                                        <FiEye size={12} strokeWidth={3} />
                                                    </button>
                                                    <button className="w-7 h-7 bg-cyan-100 hover:bg-cyan-200 text-cyan-600 rounded flex items-center justify-center transition-colors" title="Imprimir/Descargar">
                                                        <FiDownload size={12} strokeWidth={3} />
                                                    </button>
                                                    <button onClick={() => handleEditDoc(doc)} className="w-7 h-7 bg-green-100 hover:bg-green-200 text-green-600 rounded flex items-center justify-center transition-colors" title="Editar">
                                                        <FiEdit2 size={12} strokeWidth={3} />
                                                    </button>
                                                    <button onClick={() => handleDeleteDoc(doc.id)} className="w-7 h-7 bg-red-100 hover:bg-red-200 text-red-600 rounded flex items-center justify-center transition-colors" title="Eliminar">
                                                        <FiTrash2 size={12} strokeWidth={3} />
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
            </div>

            <DocClinicoModal 
                isOpen={modalOpen} 
                onClose={() => {
                    setModalOpen(false);
                    setEditingDoc(null);
                }} 
                patient={patient} 
                docType={selectedDocType} 
                initialData={editingDoc}
            />
        </div>
    );
}
