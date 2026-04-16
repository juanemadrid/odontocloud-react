import React, { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { FiSave, FiAlertCircle } from "react-icons/fi";
import { FaShieldAlt } from "react-icons/fa";
import { useToast } from "../../../context/ToastContext";
import { saveAnamnesis, getAnamnesis } from "../../../services/clinicalService";
import CIE10Search from "./CIE10Search";

export default function HistoriaClinicaTab({ patientId }) {
    const toast = useToast();
    const [loading, setLoading] = useState(false);
    const { register, control, handleSubmit, reset, watch, setValue } = useForm();

    // Load initial data
    useEffect(() => {
        if (!patientId) return;
        getAnamnesis(patientId).then(data => {
            if (data) reset(data);
        });
    }, [patientId, reset]);

    const onSubmit = async (data) => {
        setLoading(true);
        try {
            await saveAnamnesis(patientId, data);
            toast.success("Anamnesis guardada");
        } catch (error) {
            console.error(error);
            toast.error("Error al guardar");
        } finally {
            setLoading(false);
        }
    };

    // Auto-save logic (optional, but requested in previous code "edits are audited")
    // For now, let's keep manual save to avoid too many writes, or we can debounce.
    // Let's stick to a clear "Guardar" button for clarity, as implied by the UI.

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6 animate-fadeIn">

            {/* Compliance Badge */}
            <div className="flex items-center gap-2 bg-indigo-50 border border-indigo-100 p-3 rounded-lg text-indigo-700 text-sm">
                <FaShieldAlt className="text-indigo-600" />
                <span className="font-semibold">Historia Clínica Segura (Res. 1999)</span>
                <span className="text-xs ml-auto text-indigo-400">Las ediciones son auditadas</span>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <h4 className="text-lg font-bold text-slate-700 mb-6 border-b border-slate-100 pb-2 flex justify-between items-center">
                    <span>Anamnesis y Antecedentes</span>
                </h4>

                <div className="flex flex-col gap-6">

                    {/* CIE-10 Search */}
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Diagnóstico Principal (CIE-10)</label>
                        <Controller
                            name="diagnosticoPrincipal"
                            control={control}
                            render={({ field }) => (
                                <>
                                    <CIE10Search
                                        className="mb-2"
                                        onSelect={(item) => field.onChange(`${item.code} - ${item.name}`)}
                                    />
                                    {field.value && (
                                        <div className="text-sm mt-2 text-slate-700 flex items-center gap-2">
                                            <span className="font-bold text-indigo-600">Seleccionado:</span>
                                            <div className="px-3 py-1 bg-white border border-indigo-100 rounded-lg shadow-sm font-medium">
                                                {field.value}
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => field.onChange("")}
                                                className="text-red-400 hover:text-red-600 ml-2"
                                            >
                                                <FiAlertCircle />
                                            </button>
                                        </div>
                                    )}
                                </>
                            )}
                        />
                    </div>

                    {/* Motivo de Consulta - Priority */}
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Motivo de Consulta <span className="text-red-500">*</span></label>
                        <textarea
                            {...register("motivoConsulta", { required: true })}
                            className="w-full p-4 rounded-xl border border-slate-200 bg-white shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-slate-700 resize-none"
                            rows={3}
                            placeholder="¿Por qué asiste el paciente hoy?"
                        />
                    </div>

                    <div className="grid lg:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Antecedentes Médicos</label>
                            <textarea
                                {...register("antecedentes")}
                                className="w-full p-4 rounded-xl border border-slate-200 bg-white shadow-sm focus:ring-2 focus:ring-indigo-500 outline-none text-slate-700 resize-none h-32"
                                placeholder="Enfermedades, cirugías previas, etc."
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Alergias</label>
                            <textarea
                                {...register("alergias")}
                                className="w-full p-4 rounded-xl border border-red-100 bg-red-50/30 shadow-sm focus:ring-2 focus:ring-red-400 outline-none text-slate-700 resize-none h-32"
                                placeholder="Alergias a medicamentos, materiales, alimentos..."
                            />
                        </div>
                    </div>

                    <div className="grid lg:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Medicamentos Actuales</label>
                            <textarea
                                {...register("medicamentos")}
                                className="w-full p-4 rounded-xl border border-slate-200 bg-white shadow-sm focus:ring-2 focus:ring-indigo-500 outline-none text-slate-700 resize-none h-24"
                                placeholder="Listado de medicamentos que toma actualmente..."
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Otras Notas</label>
                            <textarea
                                {...register("notas")}
                                className="w-full p-4 rounded-xl border border-yellow-100 bg-yellow-50/30 shadow-sm focus:ring-2 focus:ring-yellow-400 outline-none text-slate-700 resize-none h-24"
                                placeholder="Observaciones adicionales relevantes..."
                            />
                        </div>
                    </div>

                </div>
            </div>

            <div className="flex justify-end sticky bottom-0 bg-slate-50/90 backdrop-blur p-4 border-t border-slate-200 z-10">
                <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center gap-2 bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-indigo-500/30 hover:bg-indigo-700 transition-all disabled:opacity-70"
                >
                    <FiSave />
                    {loading ? "Guardando..." : "Guardar Anamnesis"}
                </button>
            </div>
        </form>
    );
}
