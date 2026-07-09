
import React, { useState, useEffect } from "react";
import { FiSearch, FiEye, FiTrash2, FiEdit2, FiPlus, FiFileText, FiCalendar, FiUser } from "react-icons/fi";
import { collection, getDocs, query, orderBy, deleteDoc, doc, onSnapshot } from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import PlantillaEditor from "./PlantillaEditor";
import { PREDEFINED_TEMPLATES } from "../../data/plantillasPredeterminadas";

export default function ConfigPlantillas() {
    const { userProfile } = useAuth();
    const inquilino = userProfile?.inquilino;
    const toast = useToast();

    const [view, setView] = useState("list");
    const [selectedId, setSelectedId] = useState(null);
    const [isViewOnly, setIsViewOnly] = useState(false);
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        if (!inquilino || view !== "list") return;

        setLoading(true);
        const q = query(
            collection(db, "tenants", inquilino, "plantillas_clinicas"),
            orderBy("nombre", "asc")
        );

        const unsub = onSnapshot(q, (snap) => {
            const dbTemplates = snap.docs.map(d => ({ id: d.id, ...d.data() }));
            setRows([...PREDEFINED_TEMPLATES, ...dbTemplates]);
            setLoading(false);
        }, (err) => {
            console.error(err);
            toast.error("Error al sincronizar plantillas");
            setLoading(false);
        });

        return () => unsub();
    }, [inquilino, view]);

    const handleDelete = async (id) => {
        if (!window.confirm("¿Seguro que desea eliminar esta plantilla? Esta acción es irreversible.")) return;
        try {
            await deleteDoc(doc(db, "tenants", inquilino, "plantillas_clinicas", id));
            toast.success("Plantilla eliminada correctamente");
        } catch (e) {
            console.error(e);
            toast.error("Error al eliminar la plantilla");
        }
    };

    const formatDate = (iso) => {
        if (!iso) return "SIN FECHA";
        const date = iso.seconds ? new Date(iso.seconds * 1000) : new Date(iso);
        return date.toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase();
    };

    if (view === "editor") {
        return (
            <PlantillaEditor
                id={selectedId}
                isViewOnly={isViewOnly}
                onBack={() => {
                    setView("list");
                    setSelectedId(null);
                    setIsViewOnly(false);
                }}
                inquilino={inquilino}
                userEmail={userProfile?.email}
            />
        );
    }

    const filtered = rows.filter(r => (r.nombre || "").toLowerCase().includes(searchTerm.toLowerCase()));

    return (
        <div className="space-y-10 p-2 md:p-8">

            {/* Toolbar Premium */}
            <div className="bg-white rounded-[32px] border border-slate-200/50 shadow-[0_20px_60px_rgba(0,0,0,0.03)] hover:shadow-[0_35px_80px_rgba(0,0,0,0.06)] transition-all duration-700 overflow-hidden relative">
                <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-600 shadow-[1px_0_10px_rgba(37,99,235,0.15)]"></div>
                <div className="bg-slate-50/50 backdrop-blur-sm px-8 py-5 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center shadow-xl shadow-blue-200">
                            <FiFileText size={24} className="text-white" />
                        </div>
                        <div>
                            <h2 className="text-[20px] font-black text-slate-800 uppercase tracking-tighter">Plantillas Clínicas</h2>
                            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest opacity-80">Configuración de documentos y formatos</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="relative group/search">
                            <FiSearch size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-hover/search:text-blue-500 transition-colors" />
                            <input
                                type="text"
                                placeholder="BUSCAR PLANTILLAS..."
                                className="pl-12 pr-6 py-3 bg-white border border-slate-200 rounded-2xl text-[13px] font-bold text-slate-600 outline-none w-full md:w-72 focus:ring-4 focus:ring-blue-100 focus:border-blue-400 transition-all uppercase tracking-wider placeholder:text-slate-300 shadow-sm"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        <button
                            onClick={() => { setSelectedId(null); setView("editor"); }}
                            className="bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-3 rounded-2xl text-[13px] font-black uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-emerald-200 transition-all active:scale-95 group/btn overflow-hidden relative"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:animate-shimmer" />
                            <FiPlus className="text-lg" /> Nueva Plantilla
                        </button>
                    </div>
                </div>
            </div>

            {/* Table Area (High Density) */}
            <div className="group/section bg-white rounded-[32px] border border-slate-200/50 shadow-[0_20px_60px_rgba(0,0,0,0.03)] overflow-hidden relative transition-all duration-700">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100/60">
                                <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Fecha Registro</th>
                                <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Tipo de Documento / Nombre</th>
                                <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Autor / Creado por</th>
                                <th className="px-8 py-5 text-right text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading && rows.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-8 py-24 text-center">
                                        <div className="flex flex-col items-center">
                                            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
                                            <p className="text-[12px] font-black text-slate-400 uppercase tracking-widest">Sincronizando formatos...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-8 py-24 text-center">
                                        <div className="flex flex-col items-center">
                                            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-200 mb-6 drop-shadow-inner">
                                                <FiFileText size={40} />
                                            </div>
                                            <p className="text-[14px] font-black text-slate-400 uppercase tracking-[0.2em]">No se encontraron plantillas</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filtered.map(row => (
                                    <tr key={row.id} className="group/row hover:bg-blue-50/30 transition-all duration-300">
                                        <td className="px-8 py-4">
                                            <div className="flex items-center gap-3 text-[13px] font-bold text-slate-500">
                                                <FiCalendar size={14} className="text-slate-400" />
                                                <span>{formatDate(row.createdAt || row.fecha)}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-4">
                                            <div className="text-[14px] font-black text-slate-700 uppercase tracking-tight group-hover/row:text-blue-700 transition-colors">
                                                {row.nombre}
                                            </div>
                                            <div className="text-[9px] font-black text-blue-500 uppercase tracking-widest mt-0.5">
                                                {row.campos?.length || 0} CAMPOS DEFINIDOS
                                            </div>
                                        </td>
                                        <td className="px-8 py-4">
                                            <div className="flex items-center gap-2 text-[12px] font-bold text-slate-500">
                                                <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center">
                                                    <FiUser size={10} className="text-slate-400" />
                                                </div>
                                                <span className="lowercase">{row.createdBy || "—"}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-4 text-right">
                                             {row.isSystem ? (
                                                 <div className="flex items-center justify-end gap-2">
                                                     <button
                                                         title="Visualizar plantilla"
                                                         className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-emerald-600 hover:border-emerald-200 hover:shadow-lg hover:shadow-emerald-100 transition-all active:scale-90"
                                                         onClick={() => { setSelectedId(row.id); setView("editor"); setIsViewOnly(true); }}
                                                     >
                                                         <FiEye size={16} />
                                                     </button>
                                                 </div>
                                             ) : (
                                                 <div className="flex items-center justify-end gap-2">
                                                     <button
                                                         title="Editar plantilla"
                                                         className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-blue-600 hover:border-blue-200 hover:shadow-lg hover:shadow-blue-100 transition-all active:scale-90"
                                                         onClick={() => { setSelectedId(row.id); setView("editor"); setIsViewOnly(false); }}
                                                     >
                                                         <FiEdit2 size={16} />
                                                     </button>
                                                     <button
                                                         title="Visualizar plantilla"
                                                         className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-emerald-600 hover:border-emerald-200 hover:shadow-lg hover:shadow-emerald-100 transition-all active:scale-90"
                                                         onClick={() => { setSelectedId(row.id); setView("editor"); setIsViewOnly(true); }}
                                                     >
                                                         <FiEye size={16} />
                                                     </button>
                                                     <button
                                                         title="Eliminar plantilla"
                                                         className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-red-600 hover:border-red-200 hover:shadow-lg hover:shadow-red-100 transition-all active:scale-90"
                                                         onClick={() => handleDelete(row.id)}
                                                     >
                                                         <FiTrash2 size={16} />
                                                     </button>
                                                 </div>
                                             )}
                                         </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
