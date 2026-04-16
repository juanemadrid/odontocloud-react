import React, { useState, useEffect } from 'react';
import { FiSearch, FiPlus, FiEdit2, FiTrash2, FiX, FiActivity, FiArrowLeft, FiSave, FiInfo, FiCheckCircle } from 'react-icons/fi';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { subscribeToSpecialties, createSpecialty, updateSpecialty, deleteSpecialty } from '../../services/resourceService';

const specialtySchema = z.object({
    nombre: z.string().min(1, "El nombre es requerido"),
    descripcion: z.string().optional()
});

export default function EmpresaEspecialidades() {
    const { userProfile } = useAuth();
    const inquilino = userProfile?.inquilino;
    const toast = useToast();
    const [specialties, setSpecialties] = useState([]);
    const [filtered, setFiltered] = useState([]);
    const [search, setSearch] = useState("");
    const [view, setView] = useState("list"); // list, editor
    const [editingItem, setEditingItem] = useState(null);

    const { register, handleSubmit, reset, formState: { errors, isSubmitting }, setValue } = useForm({
        resolver: zodResolver(specialtySchema)
    });

    useEffect(() => {
        if (!inquilino) return;
        const unsub = subscribeToSpecialties(inquilino, (data) => {
            setSpecialties(data);
            setFiltered(data);
        });
        return () => unsub();
    }, [inquilino]);

    useEffect(() => {
        if (!search.trim()) {
            setFiltered(specialties);
        } else {
            const lower = search.toLowerCase();
            setFiltered(specialties.filter(s => s.nombre.toLowerCase().includes(lower)));
        }
    }, [search, specialties]);

    const handleOpenEditor = (item = null) => {
        setEditingItem(item);
        if (item) {
            setValue('nombre', item.nombre);
            setValue('descripcion', item.descripcion || "");
        } else {
            reset({ nombre: '', descripcion: '' });
        }
        setView("editor");
    };

    const onSubmit = async (data) => {
        if (!inquilino) return;
        try {
            if (editingItem) {
                await updateSpecialty(editingItem.id, data);
                toast.success("Actualizada");
            } else {
                await createSpecialty(inquilino, data);
                toast.success("Creada");
            }
            setView("list");
        } catch (error) {
            console.error(error);
            toast.error("Error al guardar");
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("¿Eliminar?")) {
            try {
                await deleteSpecialty(id);
                toast.success("Eliminada");
            } catch (error) {
                toast.error("Error al eliminar");
            }
        }
    };

    if (view === "editor") {
        return (
            <div className="p-4 w-full max-w-4xl mx-auto relative transition-all duration-300">
                {/* Header: Institutional & Actions */}
                <div className="group/section bg-white rounded-[32px] border border-slate-200/50 shadow-[0_20px_60px_rgba(0,0,0,0.03)] hover:shadow-[0_35px_80px_rgba(0,0,0,0.06)] transition-all duration-700 overflow-hidden relative mb-6">
                    <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-600 shadow-[1px_0_10px_rgba(37,99,235,0.15)]"></div>

                    <div className="bg-slate-50/50 backdrop-blur-sm px-8 py-5 border-b border-slate-100 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => setView("list")}
                                className="w-10 h-10 rounded-xl border border-slate-200 bg-white flex items-center justify-center text-slate-500 hover:text-blue-600 hover:border-blue-200 hover:shadow-lg transition-all active:scale-90"
                            >
                                <FiArrowLeft size={18} />
                            </button>
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center shadow-xl shadow-blue-200">
                                <FiActivity size={20} className="text-white" />
                            </div>
                            <div className="flex flex-col">
                                <h2 className="text-[18px] font-black text-slate-800 uppercase tracking-tighter">
                                    {editingItem ? "Editar Especialidad" : "Nueva Especialidad"}
                                </h2>
                                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest opacity-80">Gestión de áreas clínicas</p>
                            </div>
                        </div>

                    </div>
                </div>

                {/* Editor Body */}
                <div className="bg-white rounded-[40px] border border-slate-200/60 shadow-[0_30px_100px_rgba(0,0,0,0.04)] p-12 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50/50 rounded-full blur-[100px] -mr-32 -mt-32 opacity-40"></div>
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-50/30 rounded-full blur-[80px] -ml-24 -mb-24 opacity-30"></div>

                    <div className="space-y-12 relative">
                        {/* Name Field */}
                        <div className="space-y-3 group/name">
                            <div className="flex items-center justify-between px-1">
                                <label className="text-[12px] font-black text-slate-400 uppercase tracking-[0.2em]">Nombre de la Especialidad</label>
                                <div className="text-[10px] font-bold text-blue-500/50 uppercase tracking-widest leading-none">Campo Obligatorio</div>
                            </div>
                            <div className="relative">
                                <div className="absolute left-7 top-1/2 -translate-y-1/2 w-11 h-11 rounded-2xl bg-slate-100/50 flex items-center justify-center text-slate-400 group-focus-within/name:bg-blue-600 group-focus-within/name:text-white transition-all duration-500 shadow-inner group-focus-within/name:shadow-[0_8px_20px_rgba(37,99,235,0.3)] group-focus-within/name:scale-110">
                                    <FiActivity size={20} />
                                </div>
                                <input
                                    className="w-full pl-24 pr-8 py-8 bg-slate-50/50 border-2 border-slate-100/80 rounded-[32px] text-[24px] font-black text-slate-800 outline-none focus:bg-white focus:border-blue-500/50 focus:ring-[15px] focus:ring-blue-500/3 transition-all duration-500 placeholder:text-slate-200 shadow-sm"
                                    {...register("nombre")}
                                    placeholder="Ej: Odontopediatría"
                                    autoFocus
                                />
                                {errors.nombre && (
                                    <div className="absolute -bottom-6 left-6 animate-in slide-in-from-top-2 duration-300">
                                        <p className="text-[10px] text-red-500 font-black uppercase tracking-wider bg-white px-3 py-1 rounded-full shadow-sm border border-red-100">{errors.nombre.message}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Description Field */}
                        <div className="space-y-3 group/desc">
                            <label className="text-[12px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">Descripción del Área</label>
                            <div className="relative">
                                <div className="absolute left-7 top-8 w-11 h-11 rounded-2xl bg-slate-100/50 flex items-center justify-center text-slate-400 group-focus-within/desc:bg-blue-600 group-focus-within/desc:text-white transition-all duration-500 shadow-inner group-focus-within/desc:shadow-[0_8px_20px_rgba(37,99,235,0.3)]">
                                    <FiInfo size={20} />
                                </div>
                                <textarea
                                    className="w-full pl-24 pr-8 py-8 bg-slate-50/50 border-2 border-slate-100/80 rounded-[32px] text-[17px] font-bold text-slate-600 outline-none focus:bg-white focus:border-blue-500/50 focus:ring-[15px] focus:ring-blue-500/3 transition-all duration-500 min-h-[200px] resize-none placeholder:text-slate-200 overflow-hidden leading-relaxed"
                                    {...register("descripcion")}
                                    placeholder="Detalle el alcance y servicios de esta especialidad médica..."
                                />
                            </div>
                        </div>

                        {/* Footer Action */}
                        <div className="pt-8 border-t border-slate-50 flex items-center justify-between">
                            <div className="flex items-center gap-4 bg-blue-50/50 px-6 py-3 rounded-2xl border border-blue-100/50 max-w-md">
                                <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                                    <FiCheckCircle size={16} />
                                </div>
                                <p className="text-[11px] font-bold text-blue-600/70 leading-tight uppercase tracking-tight">
                                    Categorice sus servicios y asigne profesionales específicos a esta área.
                                </p>
                            </div>

                            <button
                                className="bg-slate-900 hover:bg-black text-white px-10 py-3 rounded-[18px] text-[13px] font-black uppercase tracking-[0.2em] shadow-[0_12px_40px_rgba(0,0,0,0.12)] hover:shadow-[0_15px_50px_rgba(0,0,0,0.2)] transition-all duration-700 active:scale-90 flex items-center gap-3 overflow-hidden relative group/save"
                                onClick={handleSubmit(onSubmit)}
                                disabled={isSubmitting}
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 translate-y-full group-hover/save:translate-y-0 transition-transform duration-700" />
                                <FiSave size={24} className="relative z-10 group-hover/save:rotate-12 transition-transform duration-500" />
                                <span className="relative z-10">{isSubmitting ? "GUARDANDO..." : "GUARDAR ESPECIALIDAD"}</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 w-full max-w-5xl mx-auto relative transition-all duration-300">
            {/* Main Header / Toolbar */}
            <div className="bg-white rounded-[32px] border border-slate-200/50 shadow-[0_20px_60px_rgba(0,0,0,0.03)] hover:shadow-[0_35px_80px_rgba(0,0,0,0.06)] transition-all duration-700 overflow-hidden relative mb-6">
                <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-600 shadow-[1px_0_10px_rgba(37,99,235,0.15)]"></div>

                <div className="bg-slate-50/50 backdrop-blur-sm px-8 py-5 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center shadow-xl shadow-blue-200 group-hover:scale-110 transition-transform duration-500">
                            <FiActivity className="text-white text-xl" />
                        </div>
                        <div>
                            <h2 className="text-[20px] font-black text-slate-800 uppercase tracking-tighter">Especialidades</h2>
                            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest opacity-80">Catálogo de áreas médicas</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        {/* Search Input */}
                        <div className="relative group flex-1 md:flex-none">
                            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-all font-black" />
                            <input
                                type="text"
                                placeholder="Buscar especialidad..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full md:w-64 pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-[14px] font-extrabold text-slate-800 outline-none focus:border-blue-500 focus:ring-8 focus:ring-blue-500/5 transition-all shadow-sm"
                            />
                        </div>

                        {/* New Button */}
                        <button
                            onClick={() => handleOpenEditor()}
                            className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-2xl text-[13px] font-black uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-emerald-200 transition-all active:scale-95 group/btn overflow-hidden relative"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:animate-shimmer" />
                            <FiPlus className="text-lg" /> Nueva Especialidad
                        </button>
                    </div>
                </div>
            </div>

            {/* Table Area */}
            <div className="group/section bg-white rounded-[32px] border border-slate-200/50 shadow-[0_20px_60px_rgba(0,0,0,0.03)] overflow-hidden relative">
                <div className="p-0 overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="bg-slate-50/30">
                                <th className="px-8 py-4 text-left text-[11px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-100">Nombre de la Especialidad</th>
                                <th className="px-8 py-4 text-left text-[11px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-100">Descripción</th>
                                <th className="px-8 py-4 text-right text-[11px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-100">Operaciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={3} className="px-8 py-20 text-center opacity-30 font-black uppercase tracking-widest text-slate-400">
                                        Sin registros médicos
                                    </td>
                                </tr>
                            ) : (
                                filtered.map((item) => (
                                    <tr key={item.id} className="group/row hover:bg-slate-50/50 transition-all duration-300">
                                        <td className="px-8 py-4 border-b border-slate-50 transition-all group-hover/row:translate-x-1">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 group-hover/row:scale-110 transition-transform duration-500">
                                                    <FiActivity size={14} />
                                                </div>
                                                <span className="text-[15px] font-black text-slate-700 uppercase tracking-tight">{item.nombre}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-4 border-b border-slate-50">
                                            <span className="text-[13px] font-bold text-slate-400 uppercase tracking-tight truncate max-w-[300px] block">
                                                {item.descripcion || "Sin descripción"}
                                            </span>
                                        </td>
                                        <td className="px-8 py-4 border-b border-slate-50 text-right">
                                            <div className="flex items-center justify-end gap-1 opacity-0 group-hover/row:opacity-100 transition-all duration-500 translate-x-4 group-hover/row:translate-x-0">
                                                <button
                                                    onClick={() => handleOpenEditor(item)}
                                                    className="p-2.5 rounded-xl text-blue-500 hover:bg-blue-500 hover:text-white hover:shadow-lg hover:shadow-blue-200 transition-all active:scale-90"
                                                >
                                                    <FiEdit2 size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(item.id)}
                                                    className="p-2.5 rounded-xl text-red-500 hover:bg-red-500 hover:text-white hover:shadow-lg hover:shadow-red-200 transition-all active:scale-90"
                                                >
                                                    <FiTrash2 size={16} />
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
    );
}
