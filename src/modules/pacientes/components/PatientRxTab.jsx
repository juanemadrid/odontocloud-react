import React, { useRef, useState, useMemo } from "react";
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { setDoc, doc, serverTimestamp, collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../../firebase/firebaseConfig";
import { useToast } from "../../../context/ToastContext";
import { useAuth } from "../../../context/AuthContext";
import { FiPlus, FiSearch, FiFileText, FiImage, FiTrash2, FiDownload, FiUploadCloud } from "react-icons/fi";

export default function PatientRxTab({ patient, onUpdate }) {
    const toast = useToast();
    const { userProfile } = useAuth();
    const [viewMode, setViewMode] = useState("list"); // 'list' | 'form'
    const [uploading, setUploading] = useState(false);
    const [filter, setFilter] = useState("");
    
    // Form States
    const [selectedFile, setSelectedFile] = useState(null);
    const [nombreVisible, setNombreVisible] = useState("");
    const [descripcion, setDescripcion] = useState("");
    const [profesionalResp, setProfesionalResp] = useState("");
    const [fechaAsoc, setFechaAsoc] = useState(new Date().toISOString().split("T")[0]);
    const fileInputRef = useRef(null);

    // Dynamic Select List for Profesionales
    const [catalogProfesionales, setCatalogProfesionales] = useState([]);

    React.useEffect(() => {
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
                const list = s.docs.map(doc => {
                    const d = doc.data();
                    return { 
                        id: doc.id, 
                        nombreCompleto: d.nombreCompleto || `${d.nombre || ''} ${d.apellido || ''}`.trim(),
                        ...d
                    };
                });
                setCatalogProfesionales(list.sort((a,b) => a.nombreCompleto?.localeCompare(b.nombreCompleto) || 0));
            } catch (err) {
                console.error("Error loading professionals:", err);
            }
        };
        loadCatalog();
    }, [userProfile]);

    const images = useMemo(() => {
        let list = Array.isArray(patient?.rxImagenes) ? patient.rxImagenes : [];
        if (filter.trim()) {
            const q = filter.toLowerCase();
            list = list.filter(i => (i.title || "").toLowerCase().includes(q) || (i.name || "").toLowerCase().includes(q));
        }
        return [...list].sort((a, b) => (b.uploadedAtMS || b.created || 0) - (a.uploadedAtMS || a.created || 0));
    }, [patient?.rxImagenes, filter]);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            if (!nombreVisible) setNombreVisible(file.name.replace(/\.[^.]+$/, ""));
        }
    };

    const handleSaveFile = async (e) => {
        e.preventDefault();
        if (!selectedFile) return toast.error("Debe cargar un archivo");
        if (!nombreVisible.trim()) return toast.error("El nombre es requerido");
        if (!profesionalResp.trim()) return toast.error("El profesional es requerido");

        setUploading(true);
        const storage = getStorage();
        try {
            const safe = (selectedFile.name || "archivo").replace(/\s+/g, "_");
            const path = `pacientes/${patient.id}/rx/${Date.now()}_${safe}`;
            const sref = ref(storage, path);

            await uploadBytes(sref, selectedFile, { contentType: selectedFile.type });
            const url = await getDownloadURL(sref);

            const newItem = {
                url,
                name: selectedFile.name,
                title: nombreVisible,
                descripcion,
                profesional: profesionalResp,
                creador: userProfile?.nombre || "Usuario",
                fechaAsocISO: fechaAsoc,
                path,
                type: selectedFile.type,
                size: selectedFile.size,
                uploadedAtMS: Date.now(),
                uploadedAtISO: new Date().toISOString()
            };

            const updatedList = [...(patient.rxImagenes || []), newItem];
            await setDoc(doc(db, "pacientes", patient.id), {
                rxImagenes: updatedList,
                actualizado: serverTimestamp()
            }, { merge: true });
            onUpdate && onUpdate({ ...patient, rxImagenes: updatedList });
            toast.success("Archivo guardado correctamente");
            
            // reset form and return to list
            setSelectedFile(null);
            setNombreVisible("");
            setDescripcion("");
            setProfesionalResp("");
            setViewMode("list");
        } catch (err) {
            console.error(err);
            toast.error("Error subiendo el archivo");
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (item) => {
        if (!window.confirm(`¿Seguro que deseas eliminar "${item.title}"?`)) return;

        const currentList = patient.rxImagenes || [];
        const newList = currentList.filter(x => x.path !== item.path);

        try {
            await setDoc(doc(db, "pacientes", patient.id), {
                rxImagenes: newList,
                actualizado: serverTimestamp()
            }, { merge: true });

            const storage = getStorage();
            await deleteObject(ref(storage, item.path)).catch(console.warn);

            onUpdate && onUpdate({ ...patient, rxImagenes: newList });
            toast.success("Archivo eliminado");
        } catch (e) {
            toast.error("Error al borrar el archivo");
        }
    };

    if (viewMode === "form") {
        return (
            <div className="p-4 md:p-8 animate-fadeIn flex flex-col h-full min-h-0 bg-slate-50/50">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <button onClick={() => setViewMode("list")} className="text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors uppercase tracking-widest">&larr; Volver</button>
                        <h2 className="text-xl font-black text-slate-800 tracking-tight">Nuevo archivo</h2>
                    </div>
                    <button type="submit" form="rxForm" disabled={uploading} className="px-6 py-2.5 bg-[#8CC63F] hover:bg-[#7bb335] text-white rounded-full font-black text-[11px] uppercase tracking-widest shadow-lg shadow-[#8CC63F]/20 flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50">
                        {uploading ? "Guardando..." : "Guardar"}
                    </button>
                </div>

                <div className="bg-white rounded-[24px] border border-slate-100 shadow-sm p-8 max-w-4xl mx-auto flex-1 w-full overflow-y-auto custom-scrollbar">
                    <form id="rxForm" onSubmit={handleSaveFile} className="space-y-6">
                        <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-6 border-b border-slate-100 pb-2">Información básica</h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                            <div className="md:col-span-3 text-right">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mt-3">Usuario creador</label>
                            </div>
                            <div className="md:col-span-9">
                                <input type="text" readOnly value={userProfile?.nombre || ""} className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2.5 px-4 text-sm font-medium text-slate-500 cursor-not-allowed" />
                            </div>

                            <div className="md:col-span-3 text-right">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mt-3">Cargar los archivos</label>
                            </div>
                            <div className="md:col-span-9">
                                <div onClick={() => fileInputRef.current?.click()} className="w-full h-32 border-2 border-dashed border-slate-300 rounded-xl bg-slate-50 flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-blue-50/50 transition-colors group">
                                    <FiUploadCloud size={32} className="text-slate-400 group-hover:text-blue-500 mb-2" />
                                    {selectedFile ? (
                                        <p className="text-sm font-bold text-blue-600">{selectedFile.name}</p>
                                    ) : (
                                        <>
                                            <p className="text-sm font-bold text-slate-600">Arrastra o click para cargar la foto.</p>
                                            <p className="text-xs text-slate-400 font-medium">Solo archivos de imágenes, Word, Excel o PDF</p>
                                        </>
                                    )}
                                    <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
                                </div>
                            </div>

                            <div className="md:col-span-3 text-right">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mt-3">Fecha asociación *</label>
                            </div>
                            <div className="md:col-span-9">
                                <input type="date" required value={fechaAsoc} onChange={e => setFechaAsoc(e.target.value)} className="w-64 bg-white border border-slate-200 rounded-lg py-2.5 px-4 text-sm font-medium text-slate-700 focus:border-blue-500 outline-none" />
                            </div>

                            <div className="md:col-span-3 text-right">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mt-3">Nombre *</label>
                            </div>
                            <div className="md:col-span-9">
                                <input type="text" required placeholder="Nombre del archivo" value={nombreVisible} onChange={e => setNombreVisible(e.target.value)} className="w-full bg-white border border-slate-200 rounded-lg py-2.5 px-4 text-sm font-medium text-slate-700 focus:border-blue-500 outline-none" />
                            </div>

                            <div className="md:col-span-3 text-right">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mt-3">Descripción</label>
                            </div>
                            <div className="md:col-span-9">
                                <textarea rows={3} value={descripcion} onChange={e => setDescripcion(e.target.value)} className="w-full bg-white border border-slate-200 rounded-lg py-2.5 px-4 text-sm font-medium text-slate-700 focus:border-blue-500 outline-none custom-scrollbar"></textarea>
                            </div>

                            <div className="md:col-span-3 text-right">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mt-3">Profesional *</label>
                            </div>
                            <div className="md:col-span-9">
                                <select 
                                    required 
                                    value={profesionalResp} 
                                    onChange={e => setProfesionalResp(e.target.value)} 
                                    className="w-full bg-white border border-slate-200 rounded-lg py-2.5 px-4 text-sm font-medium text-slate-700 focus:border-blue-500 outline-none cursor-pointer"
                                >
                                    <option value="" disabled>Seleccione...</option>
                                    {catalogProfesionales.map((p) => (
                                        <option key={p.id} value={p.nombreCompleto || p.nombre || p.id}>
                                            {p.nombreCompleto || p.nombre || p.id}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-8 animate-fadeIn flex flex-col min-h-0 h-full">
            <div className="bg-white rounded-[24px] border border-slate-100 shadow-sm overflow-hidden flex flex-col min-h-0 flex-1">
                
                {/* TOOLBAR */}
                <div className="p-4 md:p-6 border-b border-slate-100 flex flex-col md:flex-row gap-4 justify-between items-center bg-slate-50/50 shrink-0">
                    <div className="relative w-full md:w-80">
                        <input 
                            type="text" 
                            className="w-full bg-white border border-slate-200 rounded-xl py-2.5 pl-11 pr-4 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-medium text-slate-700"
                            placeholder="Buscar..." 
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                        />
                        <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    </div>
                    <button 
                        onClick={() => setViewMode("form")}
                        className="px-6 py-2.5 bg-[#8CC63F] hover:bg-[#7bb335] text-white rounded-xl font-black text-[11px] uppercase tracking-widest shadow-lg shadow-[#8CC63F]/20 flex items-center gap-2 transition-all active:scale-95 shrink-0"
                    >
                        <FiPlus size={14} /> Nuevo archivo
                    </button>
                </div>

                {/* TABLE */}
                <div className="flex-1 overflow-x-auto overflow-y-auto custom-scrollbar">
                    <table className="w-full text-left border-collapse min-w-[800px]">
                        <thead className="bg-[#f8fafc] sticky top-0 z-10 shadow-[0_1px_0_0_#f1f5f9]">
                            <tr>
                                <th className="py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 w-24 text-center">Vista previa</th>
                                <th className="py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Profesional</th>
                                <th className="py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Nombre</th>
                                <th className="py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Descripción</th>
                                <th className="py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 w-32">Fecha asoc ↓</th>
                                <th className="py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 text-center w-32">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {images.length > 0 ? (
                                images.map((img, idx) => (
                                    <tr key={idx} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="py-4 px-6 text-center">
                                            {img.type?.startsWith('image/') ? (
                                                <div className="w-12 h-12 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden mx-auto shadow-sm">
                                                    <img src={img.url} alt={img.title} className="w-full h-full object-cover" />
                                                </div>
                                            ) : (
                                                <div className="w-12 h-12 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center mx-auto text-blue-500 shadow-sm">
                                                    <FiFileText size={20} />
                                                </div>
                                            )}
                                        </td>
                                        <td className="py-4 px-6 font-bold text-sm text-slate-800">{img.profesional || '---'}</td>
                                        <td className="py-4 px-6 font-bold text-sm text-slate-800">{img.title}</td>
                                        <td className="py-4 px-6 text-sm text-slate-600 truncate max-w-xs" title={img.descripcion}>{img.descripcion || '---'}</td>
                                        <td className="py-4 px-6 text-sm font-medium text-slate-500">{img.fechaAsocISO || new Date(img.uploadedAtMS).toLocaleDateString()}</td>
                                        <td className="py-4 px-6 text-center">
                                            <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <a href={img.url} target="_blank" rel="noreferrer" className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-colors">
                                                    <FiDownload size={14} />
                                                </a>
                                                <button 
                                                    className="w-8 h-8 rounded-lg bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-colors"
                                                    onClick={() => handleDelete(img)}
                                                >
                                                    <FiTrash2 size={14} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="py-16 text-center">
                                        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">No hay información disponible</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

            </div>
        </div>
    );
}
