
import React, { useState } from "react";
import { FiPlus, FiSearch, FiEdit2, FiTrash2, FiHash, FiUsers } from "react-icons/fi";
import Input from "../../components/ui/Input";

import ConfigConsecutivosForm from "./ConfigConsecutivosForm";

export default function ConfigConsecutivos() {
    const [searchTerm, setSearchTerm] = useState("");
    const [showForm, setShowForm] = useState(false);

    // Mock Data based on screenshot
    const [consecutivos, setConsecutivos] = useState([
        { id: 1, nombre: "Principal", enUso: true, usuarios: ["Admin", "User1"] },
        // Add more mock data if needed for demo
    ]);

    if (showForm) {
        return (
            <div className="p-2 md:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="max-w-4xl mx-auto">
                    <button
                        onClick={() => setShowForm(false)}
                        className="mb-6 text-slate-400 hover:text-blue-600 font-bold uppercase tracking-widest text-xs flex items-center gap-2 transition-colors"
                    >
                        ← Volver a la lista
                    </button>
                    <ConfigConsecutivosForm onClose={() => setShowForm(false)} />
                </div>
            </div>
        );
    }

    return (
        <div className="p-2 md:p-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                <div className="flex items-center gap-6">
                    <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-2xl shadow-green-200">
                        <FiHash size={32} className="text-white" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-slate-800 uppercase tracking-tighter">Consecutivos</h1>
                        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-1">Gestión de numeración de documentos</p>
                    </div>
                </div>

                <button
                    onClick={() => setShowForm(true)}
                    className="bg-lime-500 hover:bg-lime-600 text-white px-8 py-4 rounded-[20px] text-[13px] font-black uppercase tracking-widest flex items-center gap-3 shadow-[0_20px_40px_rgba(132,204,22,0.4)] transition-all active:scale-95 hover:-translate-y-1"
                >
                    <FiPlus size={20} />
                    <span>Nuevo Consecutivo</span>
                </button>
            </div>

            {/* Content Card */}
            <div className="bg-white rounded-[40px] border border-slate-200/50 shadow-sm overflow-hidden">

                {/* Dictionary / Toolbar */}
                <div className="p-8 border-b border-slate-100 flex flex-col md:flex-row gap-6 justify-between items-center bg-slate-50/30">
                    {/* Search */}
                    <div className="relative w-full md:w-96 group">
                        <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={20} />
                        <Input
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Buscar..."
                            className="h-14 pl-12 bg-white border-slate-200 focus:border-blue-500 rounded-2xl shadow-sm font-bold text-slate-600"
                        />
                    </div>

                    {/* Filter Icon could go here if needed, keeping it simple for now */}
                    <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 text-slate-400 flex items-center justify-center hover:bg-slate-50 cursor-pointer transition-colors">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
                        </svg>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-slate-100">
                                <th className="py-6 px-8 text-[11px] font-black text-slate-400 uppercase tracking-widest">Nombre</th>
                                <th className="py-6 px-8 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">Consecutivo usado o no</th>
                                <th className="py-6 px-8 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">Quienes usan el consecutivo</th>
                                <th className="py-6 px-8 text-[11px] font-black text-slate-400 uppercase tracking-widest text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {consecutivos.map((item) => (
                                <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                                    <td className="py-6 px-8">
                                        <div className="font-bold text-slate-700">{item.nombre}</div>
                                    </td>
                                    <td className="py-6 px-8 text-center">
                                        <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest ${item.enUso ? 'bg-green-50 text-green-600' : 'bg-slate-50 text-slate-500'}`}>
                                            {item.enUso ? "En uso" : "No usado"}
                                        </span>
                                    </td>
                                    <td className="py-6 px-8 flex justify-center">
                                        <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center shadow-sm">
                                            <FiUsers size={18} />
                                        </div>
                                    </td>
                                    <td className="py-6 px-8">
                                        <div className="flex items-center justify-end gap-3 opacity-100 transition-opacity">
                                            <button className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white flex items-center justify-center transition-all shadow-sm hover:shadow-md hover:shadow-blue-200">
                                                <FiEdit2 size={18} />
                                            </button>
                                            <button className="w-10 h-10 rounded-xl bg-red-50 text-red-500 hover:bg-red-500 hover:text-white flex items-center justify-center transition-all shadow-sm hover:shadow-md hover:shadow-red-200">
                                                <FiTrash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {/* Empty State */}
                            {consecutivos.length === 0 && (
                                <tr>
                                    <td colSpan="4" className="py-20 text-center">
                                        <div className="flex flex-col items-center justify-center gap-4 text-slate-400">
                                            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center">
                                                <FiHash size={40} className="text-slate-300" />
                                            </div>
                                            <p className="font-bold uppercase tracking-widest text-xs">No hay consecutivos registrados</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Footer Pagination (optional/placeholder) */}
                <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-400">Mostrando {consecutivos.length} resultados</span>
                    <div className="flex gap-2">
                        {/* Pagination buttons placeholder */}
                    </div>
                </div>

            </div>
        </div>
    );
}
