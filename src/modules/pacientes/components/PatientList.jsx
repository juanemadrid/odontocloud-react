import React, { useMemo, useState } from "react";
import Skeleton from "../../../components/ui/Skeleton";
import { FiUsers, FiSearch, FiFilter, FiPlus, FiEdit2, FiTrash2, FiUserX, FiUserCheck, FiHome, FiShield, FiAlertCircle } from "react-icons/fi";

const ITEMS_PER_PAGE = 5;

export default function PatientList({
    pacientes,
    loading,
    hasMore,
    onLoadMore,
    onSelect,
    onEdit,
    searchTerm,
    onSearchChange,
    onCreateNew,
    onToggleStatus,
    onDelete
}) {
    // Local state for UI filters (visual only for now matching the request)
    const [showInactive, setShowInactive] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [patientToDelete, setPatientToDelete] = useState(null);
    const [showToggleConfirm, setShowToggleConfirm] = useState(false);
    const [patientToToggle, setPatientToToggle] = useState(null);

    const filtered = useMemo(() => {
        let res = pacientes;

        // 1. Text Search
        const t = searchTerm.trim().toLowerCase();
        if (t) {
            res = res.filter((p) => {
                const blob = `${p.nombreCompleto || p.paciente || ""} ${p.nroDocumento || ""} ${p.celular || p.celularPaciente || ""} ${p.email || ""}`.toLowerCase();
                return blob.includes(t);
            });
        }

        // 2. Active/Inactive Filter
        // If showInactive is false, show only active (default). If true, show only inactive? 
        // Usually "Inactivos" button toggles to SHOW inactive patients.
        // Assuming 'activo' field exists (defaults to true).
        if (showInactive) {
            res = res.filter(p => p.activo === false);
        } else {
            res = res.filter(p => p.activo !== false);
        }

        return res;
    }, [pacientes, searchTerm, showInactive]);

    // Reset to page 1 when filters change
    React.useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, showInactive]);

    const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const paginatedItems = filtered.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    const handleToggleStatus = (e, p) => {
        e.stopPropagation();
        setPatientToToggle(p);
        setShowToggleConfirm(true);
    };

    return (
        <div className="w-full flex flex-col gap-6 animate-fadeIn px-6 pb-8">

            {/* Header Area */}
            <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-8 mb-2">
                <div className="space-y-2">
                    <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                        <FiUsers className="text-blue-600" />
                        <span>Institucional</span>
                        <span className="text-slate-200">/</span>
                        <span className="text-slate-800">Pacientes</span>
                    </div>
                    <div className="flex items-end gap-4">
                        <h2 className="text-3xl font-black text-slate-800 uppercase tracking-tight leading-none">
                            Gestión <span className="text-blue-600">Pacientes</span>
                        </h2>
                    </div>
                    <div className="w-12 h-1.5 bg-blue-600 rounded-full" />
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setShowInactive(!showInactive)}
                        className={`flex items-center gap-2 px-5 py-3 rounded-[18px] font-black text-[11px] uppercase tracking-widest transition-all border ${showInactive
                            ? "bg-slate-800 text-white border-slate-800 shadow-lg"
                            : "bg-white text-slate-500 border-slate-200 hover:text-slate-700 hover:bg-slate-50"
                            }`}
                    >
                        {showInactive ? <FiUserCheck size={16} /> : <FiUserX size={16} />}
                        {showInactive ? "Ver Activos" : "Ver Inactivos"}
                    </button>
                    <button
                        onClick={onCreateNew}
                        className="bg-blue-600 text-white px-6 py-3 rounded-[18px] font-black text-[11px] uppercase tracking-widest flex items-center gap-3 hover:bg-blue-700 shadow-lg shadow-blue-500/30 transition-all active:scale-95 border-0"
                    >
                        <FiPlus size={18} />
                        Nuevo Paciente
                    </button>
                </div>
            </div>

            {/* Search & Stats Bar */}
            <div className="oc-card">
                <div className="p-4 flex flex-col lg:flex-row items-center gap-4">
                    <div className="relative flex-1 group w-full">
                        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                            <FiSearch className="text-slate-400 group-focus-within:text-blue-600 transition-colors" size={20} />
                        </div>
                        <input
                            type="text"
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-12 pr-4 py-2.5 text-sm text-slate-700 focus:bg-white focus:ring-4 focus:ring-blue-500/5 transition-all outline-none placeholder:text-slate-400 font-medium"
                            placeholder="Buscar por nombre, documento o correo..."
                            value={searchTerm}
                            onChange={(e) => onSearchChange(e.target.value)}
                        />
                    </div>

                    <div className="flex items-center gap-3 w-full lg:w-auto">
                        <div className="flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2.5 rounded-lg border border-blue-100">
                            <FiSearch size={16} />
                            <span className="text-xs font-bold">Total: {pacientes.length}</span>
                        </div>
                        <button
                            className="p-2.5 rounded-lg bg-white border border-slate-200 text-slate-500 hover:text-blue-600 hover:bg-slate-50 transition-all"
                            title="Filtros Avanzados"
                        >
                            <FiFilter size={20} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Table Area */}
            <div className="oc-card">
                <div className="overflow-x-auto custom-scrollbar">
                    <table className="min-w-full border-collapse">
                        <thead>
                            <tr className="bg-slate-50/80 border-b border-slate-200">
                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Paciente</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Identificación</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider hidden md:table-cell">Fecha Registro</th>
                                <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading && pacientes.length === 0 ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td className="px-6 py-4"><div className="flex items-center gap-4"><Skeleton variant="circular" width={40} height={40} /><Skeleton width={140} height={16} /></div></td>
                                        <td className="px-6 py-4"><Skeleton width={100} height={16} /></td>
                                        <td className="px-6 py-4 hidden md:table-cell"><Skeleton width={100} height={16} /></td>
                                        <td className="px-6 py-4 text-right"><Skeleton width={80} height={32} /></td>
                                    </tr>
                                ))
                            ) : filtered.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="px-6 py-20 text-center">
                                        <div className="flex flex-col items-center justify-center">
                                            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                                                <FiSearch className="text-slate-300" size={32} />
                                            </div>
                                            <h3 className="text-lg font-semibold text-slate-800">No se encontraron pacientes</h3>
                                            <p className="text-sm text-slate-500 mt-1 max-w-xs mx-auto">
                                                Intente ajustar los filtros de búsqueda o registre un nuevo paciente.
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                paginatedItems.map((p, index) => (
                                    <tr
                                        key={`${p.id}-${index}`}
                                        className={`hover:bg-blue-50/30 transition-all group cursor-pointer ${p.activo === false ? "bg-slate-50/50" : ""}`}
                                        onClick={(e) => {
                                            if (e.target.closest('button')) return;
                                            onSelect(p);
                                        }}
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-4">
                                                <div className="relative shrink-0">
                                                    {p.fotoUrl ? (
                                                        <img className="h-10 w-10 rounded-lg object-cover border border-slate-200 shadow-sm" src={p.fotoUrl} alt="" />
                                                    ) : (
                                                        <div className={`h-10 w-10 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-sm ${getColorForName(p.nombreCompleto || "P")}`}>
                                                            {(p.nombreCompleto || p.paciente || "P")[0]?.toUpperCase()}
                                                        </div>
                                                    )}
                                                    <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white shadow-sm ${p.activo !== false ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                                                </div>
                                                <div>
                                                    <div className={`text-sm font-semibold transition-colors ${p.activo === false ? "text-slate-500" : "text-slate-800 group-hover:text-blue-600"}`}>
                                                        {p.nombreCompleto || "Sin Nombre Registrado"}
                                                    </div>
                                                    <div className="text-xs text-slate-400 font-medium mt-0.5">
                                                        {p.email || "Sin correo electrónico"}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex flex-col">
                                                <span className="text-xs font-bold text-slate-500 uppercase">{p.tipoDocumento || "DOC"}</span>
                                                <span className="text-sm font-medium text-slate-700">{p.nroDocumento || "—"}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap hidden md:table-cell">
                                            <div className="text-sm text-slate-500 font-medium">
                                                {p.createdAt?.seconds
                                                    ? new Date(p.createdAt.seconds * 1000).toLocaleDateString('es-CO', { year: 'numeric', month: 'short', day: 'numeric' })
                                                    : (p.creado?.seconds ? new Date(p.creado.seconds * 1000).toLocaleDateString('es-CO', { year: 'numeric', month: 'short', day: 'numeric' }) : "—")}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); onEdit(p); }}
                                                    className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                                    title="Editar Perfil"
                                                >
                                                    <FiEdit2 size={18} />
                                                </button>
                                                <button
                                                    onClick={(e) => handleToggleStatus(e, p)}
                                                    className={`p-2 rounded-lg transition-all ${p.activo !== false
                                                        ? "text-slate-400 hover:text-amber-600 hover:bg-amber-50"
                                                        : "text-emerald-600 hover:bg-emerald-50"
                                                        }`}
                                                    title={p.activo !== false ? "Desactivar" : "Reactivar"}
                                                >
                                                    {p.activo !== false ? <FiUserX size={18} /> : <FiUserCheck size={18} />}
                                                </button>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setPatientToDelete(p);
                                                        setShowDeleteConfirm(true);
                                                    }}
                                                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                                                    title="Eliminar"
                                                >
                                                    <FiTrash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="px-6 py-4 flex items-center justify-between border-t border-slate-100 bg-slate-50/50">
                        <span className="text-xs font-semibold text-slate-500">
                            Página {currentPage} de {totalPages}
                        </span>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                                disabled={currentPage === 1}
                                className="px-4 py-2 text-xs font-bold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 transition-all"
                            >
                                Anterior
                            </button>
                            <button
                                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                                disabled={currentPage === totalPages}
                                className="px-4 py-2 text-xs font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-slate-200 transition-all"
                            >
                                Siguiente
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* MODAL DE ELIMINACIÓN */}
            {showDeleteConfirm && patientToDelete && (
                <div className="fixed inset-0 z-[10001] flex items-center justify-center p-6 animate-fadeIn">
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowDeleteConfirm(false)} />
                    
                    <div className="relative bg-white w-full max-w-md rounded-xl shadow-2xl overflow-hidden animate-scaleIn border border-slate-200">
                        <div className="p-8 text-center">
                            <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-6">
                                <FiTrash2 size={32} />
                            </div>
                            <h3 className="text-xl font-bold text-slate-800 mb-2">¿Eliminar paciente?</h3>
                            <p className="text-sm text-slate-500 mb-8 leading-relaxed">
                                Esta acción eliminará permanentemente a <span className="font-bold text-slate-700">{patientToDelete.nombreCompleto || patientToDelete.paciente}</span>. Esta operación no se puede deshacer.
                            </p>

                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    onClick={() => setShowDeleteConfirm(false)}
                                    className="px-4 py-3 bg-slate-100 text-slate-600 font-bold text-sm rounded-lg hover:bg-slate-200 transition-all"
                                >
                                    No, Cancelar
                                </button>
                                <button
                                    onClick={() => {
                                        onDelete(patientToDelete);
                                        setShowDeleteConfirm(false);
                                    }}
                                    className="px-4 py-3 bg-rose-600 text-white font-bold text-sm rounded-lg hover:bg-rose-700 shadow-lg shadow-rose-100 transition-all"
                                >
                                    Sí, Eliminar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL INACTIVAR / REACTIVAR */}
            {showToggleConfirm && patientToToggle && (
                <div className="fixed inset-0 z-[10001] flex items-center justify-center p-6 animate-fadeIn">
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowToggleConfirm(false)} />
                    <div className="relative bg-white w-full max-w-md rounded-xl shadow-2xl overflow-hidden animate-scaleIn border border-slate-200">
                        <div className="p-8 text-center">
                            <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 ${patientToToggle.activo !== false ? 'bg-amber-50 text-amber-500' : 'bg-emerald-50 text-emerald-500'}`}>
                                {patientToToggle.activo !== false ? <FiUserX size={32} /> : <FiUserCheck size={32} />}
                            </div>
                            <h3 className="text-xl font-bold text-slate-800 mb-2">
                                {patientToToggle.activo !== false ? '¿Inactivar paciente?' : '¿Reactivar paciente?'}
                            </h3>
                            <p className="text-sm text-slate-500 mb-8 leading-relaxed">
                                {patientToToggle.activo !== false
                                    ? <>El paciente <span className="font-bold text-slate-700">{patientToToggle.nombreCompleto}</span> quedará inactivo y no aparecerá en las búsquedas por defecto.</>
                                    : <>El paciente <span className="font-bold text-slate-700">{patientToToggle.nombreCompleto}</span> volverá a estar activo en el sistema.</>
                                }
                            </p>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    onClick={() => setShowToggleConfirm(false)}
                                    className="px-4 py-3 bg-slate-100 text-slate-600 font-bold text-sm rounded-lg hover:bg-slate-200 transition-all"
                                >
                                    No, Cancelar
                                </button>
                                <button
                                    onClick={() => {
                                        onToggleStatus(patientToToggle);
                                        setShowToggleConfirm(false);
                                    }}
                                    className={`px-4 py-3 text-white font-bold text-sm rounded-lg shadow-lg transition-all ${
                                        patientToToggle.activo !== false
                                            ? 'bg-amber-500 hover:bg-amber-600 shadow-amber-100'
                                            : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-100'
                                    }`}
                                >
                                    {patientToToggle.activo !== false ? 'Sí, Inactivar' : 'Sí, Reactivar'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// Helper to generate consistent avatar colors
function getColorForName(name) {
    const colors = [
        "bg-red-400", "bg-orange-400", "bg-amber-400", "bg-lime-400",
        "bg-green-400", "bg-emerald-400", "bg-teal-400", "bg-cyan-400",
        "bg-sky-400", "bg-blue-400", "bg-indigo-400", "bg-violet-400",
        "bg-purple-400", "bg-fuchsia-400", "bg-pink-400", "bg-rose-400"
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
}
