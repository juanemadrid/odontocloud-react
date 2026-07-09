
import React, { useState, useEffect } from "react";
import { FiArrowLeft, FiSave, FiList, FiType, FiCalendar, FiCheckSquare, FiHash, FiTrash2, FiFileText, FiLayout, FiPlusCircle, FiXCircle, FiHash as FiNumber } from "react-icons/fi";
import { doc, getDoc, addDoc, updateDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";
import { useToast } from "../../context/ToastContext";
import { PREDEFINED_TEMPLATES } from "../../data/plantillasPredeterminadas";

export default function PlantillaEditor({ id, isViewOnly = false, onBack, inquilino, userEmail }) {
    const toast = useToast();
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [nombre, setNombre] = useState("");
    const [fields, setFields] = useState([]);
    const [terceraFirma, setTerceraFirma] = useState(false);

    useEffect(() => {
        if (id) {
            // Check predefined first
            const pred = PREDEFINED_TEMPLATES.find(t => t.id === id);
            if (pred) {
                setNombre(pred.nombre || "");
                setFields(pred.campos || []);
                // If the predefined template is A.T.M, it has tercera_firma toggle
                setTerceraFirma(pred.campos.some(f => f.id === 'tercera_firma') || false);
            } else if (inquilino) {
                loadTemplate();
            }
        }
    }, [id, inquilino]);

    const loadTemplate = async () => {
        setLoading(true);
        try {
            const snap = await getDoc(doc(db, "tenants", inquilino, "plantillas_clinicas", id));
            if (snap.exists()) {
                const data = snap.data();
                setNombre(data.nombre || "");
                setFields(data.campos || []);
                setTerceraFirma(data.terceraFirma || false);
            }
        } catch (e) {
            console.error(e);
            toast.error("Error al cargar la plantilla");
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!nombre.trim()) return toast.warning("Asigne un nombre a la plantilla");
        if (fields.length === 0) return toast.warning("Agregue al menos un campo al documento");

        setSaving(true);
        try {
            const payload = {
                nombre: nombre.toUpperCase(),
                campos: fields,
                terceraFirma: terceraFirma,
                updatedAt: serverTimestamp(),
                updatedBy: userEmail
            };

            if (id) {
                await updateDoc(doc(db, "tenants", inquilino, "plantillas_clinicas", id), payload);
                toast.success("Documento actualizado con éxito");
            } else {
                await addDoc(collection(db, "tenants", inquilino, "plantillas_clinicas"), {
                    ...payload,
                    createdAt: serverTimestamp(),
                    createdBy: userEmail
                });
                toast.success("Nuevo formato clínico registrado");
            }
            onBack();
        } catch (e) {
            console.error(e);
            toast.error("Error al procesar la solicitud");
        } finally {
            setSaving(false);
        }
    };

    const addField = (type) => {
        const newField = {
            id: Date.now().toString(),
            type,
            label: type === "text" ? "NUEVO CAMPO DE TEXTO" : type === "date" ? "FECHA DEL DOCUMENTO" : type === "select" ? "OPCIONES DE SELECCIÓN" : type === "section" ? "TÍTULO DE SECCIÓN" : "NUEVO CAMPO",
            required: false,
            options: type === "select" ? ["OPCIÓN 1", "OPCIÓN 2"] : []
        };
        setFields([...fields, newField]);
    };

    const updateField = (id, key, value) => {
        setFields(fields.map(f => f.id === id ? { ...f, [key]: value } : f));
    };

    const removeField = (id) => {
        setFields(fields.filter(f => f.id !== id));
    };

    const TOOLS = [
        { type: "section", label: "TÍTULO / SECCIÓN", icon: FiList, color: "text-blue-500", bg: "bg-blue-50" },
        { type: "text", label: "TEXTO CORTO", icon: FiType, color: "text-emerald-500", bg: "bg-emerald-50" },
        { type: "number", label: "NÚMERICO", icon: FiNumber, color: "text-orange-500", bg: "bg-orange-50" },
        { type: "date", label: "FECHA", icon: FiCalendar, color: "text-purple-500", bg: "bg-purple-50" },
        { type: "select", label: "SELECCIONABLE", icon: FiCheckSquare, color: "text-indigo-500", bg: "bg-indigo-50" },
        { type: "textarea", label: "TEXTO LARGO", icon: FiFileText, color: "text-rose-500", bg: "bg-rose-50" },
    ];

    const VARIABLES = ["[NombrePaciente]", "[Documento]", "[Edad]", "[Doctor]", "[Telefono]", "[Ciudad]"];

    return (
        <div className="flex flex-col h-[calc(100vh-120px)] bg-slate-100 rounded-[32px] overflow-hidden border border-slate-200 shadow-2xl animate-in fade-in duration-700">

            {/* Header / Studio Toolbar */}
            <div className="bg-white/80 backdrop-blur-md px-8 py-4 border-b border-slate-200 flex items-center justify-between z-10 shrink-0 shadow-sm">
                <div className="flex items-center gap-6">
                    <button
                        onClick={onBack}
                        className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 border border-slate-200 text-slate-400 hover:text-blue-600 hover:border-blue-200 hover:bg-white hover:shadow-lg transition-all active:scale-90"
                    >
                        <FiArrowLeft size={18} />
                    </button>
                    <div className="flex flex-col">
                        <input
                            className="bg-transparent border-none text-[18px] font-black text-slate-800 uppercase tracking-tighter outline-none w-full md:w-[400px] placeholder:text-slate-300 focus:ring-0 disabled:opacity-75"
                            placeholder="NOMBRE DE LA PLANTILLA..."
                            value={nombre}
                            onChange={e => setNombre(e.target.value)}
                            disabled={isViewOnly}
                        />
                        <div className="flex items-center gap-2 mt-0.5">
                            <div className={`w-1.5 h-1.5 rounded-full ${isViewOnly ? 'bg-amber-500' : 'bg-emerald-500'} animate-pulse`} />
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">
                                {isViewOnly ? "Vista Previa (Solo Lectura)" : "Diseñador de Formatos Clínicos"}
                            </span>
                        </div>
                    </div>
                </div>

                {!isViewOnly && (
                    <button
                        className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-2xl text-[13px] font-black uppercase tracking-widest flex items-center gap-2 shadow-xl shadow-blue-200 transition-all active:scale-95 group/save relative overflow-hidden"
                        onClick={handleSave}
                        disabled={saving || loading}
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/save:animate-shimmer" />
                        {saving ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                GUARDANDO...
                            </>
                        ) : (
                            <>
                                <FiSave size={18} /> Guardar Cambios
                            </>
                        )}
                    </button>
                )}
            </div>

            {/* Main Workspace */}
            <div className="flex flex-1 overflow-hidden">

                {/* Canvas (Center) - realistic paper look */}
                <div className="flex-1 overflow-y-auto p-12 bg-slate-200/50 flex justify-center custom-scrollbar">
                    <div className="w-[210mm] min-h-[297mm] bg-white shadow-[0_25px_100px_rgba(0,0,0,0.1)] rounded-sm p-[25mm] relative border border-slate-100/50 transition-all">

                        <div className="absolute top-8 right-12 text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">
                            OdontoCloud Document Design
                        </div>

                        {fields.length === 0 ? (
                            <div className="h-[200px] mt-24 border-2 border-dashed border-slate-200 rounded-[32px] flex flex-col items-center justify-center group hover:border-blue-300 transition-all cursor-default">
                                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-200 mb-4 group-hover:scale-110 transition-transform">
                                    <FiLayout size={32} />
                                </div>
                                <p className="text-[12px] font-black text-slate-400 uppercase tracking-widest">Suelta campos aquí para comenzar</p>
                                <p className="text-[10px] font-bold text-slate-300 uppercase tracking-tight mt-1 italic">Utilice el panel derecho para añadir elementos</p>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-6">
                                {fields.map((field) => (
                                    <div key={field.id} className="group relative p-6 bg-slate-50/30 hover:bg-slate-50 border border-slate-200/50 rounded-2xl transition-all duration-300 shadow-sm hover:shadow-md">

                                        {/* Actions Group - Always visible, hidden if isViewOnly */}
                                        {!isViewOnly && (
                                            <div className="absolute right-4 top-4 z-10">
                                                <button
                                                    onClick={() => removeField(field.id)}
                                                    className="w-8 h-8 bg-white hover:bg-red-50 text-red-500 hover:text-red-700 rounded-xl shadow border border-slate-100 flex items-center justify-center transition-all hover:scale-105"
                                                    title="Eliminar campo"
                                                >
                                                    <FiTrash2 size={14} />
                                                </button>
                                            </div>
                                        )}

                                        {/* Label Editor */}
                                        <div className="flex items-center gap-3 mb-4 pr-12">
                                            <div className="w-1.5 h-6 bg-blue-500/20 group-hover:bg-blue-500 transition-colors rounded-full" />
                                            <input
                                                value={field.label}
                                                onChange={e => updateField(field.id, "label", e.target.value.toUpperCase())}
                                                className="w-full text-[14px] font-black text-slate-700 bg-transparent border-none focus:ring-0 p-0 uppercase placeholder:text-slate-300 disabled:opacity-75"
                                                placeholder="ETIQUETA DEL CAMPO..."
                                                disabled={isViewOnly}
                                            />
                                        </div>

                                        {/* Render Field Preview */}
                                        <div className="ml-4">
                                            {field.type === "section" && <div className="h-0.5 bg-gradient-to-r from-blue-500 to-transparent my-4 opacity-50" />}
                                            {field.type === "text" && <div className="w-full bg-slate-100/50 border border-slate-200 rounded-xl p-4 text-[13px] text-slate-400 italic">Entrada de texto corto...</div>}
                                            {field.type === "number" && <div className="w-32 bg-slate-100/50 border border-slate-200 rounded-xl p-4 text-[13px] text-slate-400 italic">0000</div>}
                                            {field.type === "textarea" && <div className="w-full bg-slate-100/50 border border-slate-200 rounded-xl p-4 h-24 text-[13px] text-slate-400 italic">Área para comentarios largos o historia clínica detallada...</div>}
                                            {field.type === "date" && <div className="w-48 bg-slate-100/50 border border-slate-200 rounded-xl p-4 text-[13px] text-slate-400 italic">DD / MM / AAAA</div>}
                                            {field.type === "select" && (
                                                <div className="space-y-2">
                                                    <div className="w-full bg-slate-100/50 border border-slate-200 rounded-xl p-4 text-[13px] text-slate-400 flex items-center justify-between italic">
                                                        <span>Seleccione una opción registrada...</span>
                                                        <FiList size={14} />
                                                    </div>
                                                    <div className="flex flex-wrap gap-1 mt-2">
                                                        {field.options.map((op, i) => (
                                                            <span key={i} className="px-2 py-1 bg-blue-50 text-[9px] font-black text-blue-600 rounded-lg uppercase tracking-tight">{op}</span>
                                                        ))}
                                                        {!isViewOnly && (
                                                            <button
                                                                type="button"
                                                                className="px-2 py-1 bg-slate-100 text-[9px] font-black text-slate-400 rounded-lg uppercase tracking-tight hover:bg-slate-200 transition-colors"
                                                                onClick={() => {
                                                                    const opts = prompt("Opciones separadas por coma:", field.options.join(","));
                                                                    if (opts) updateField(field.id, "options", opts.split(",").map(o => o.trim().toUpperCase()));
                                                                }}
                                                            >
                                                                + Configurar opciones
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {field.type !== "section" && (
                                            <div className="mt-4 ml-4 flex items-center gap-6">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 cursor-pointer group/check">
                                                    <input
                                                        type="checkbox"
                                                        checked={field.required}
                                                        onChange={e => updateField(field.id, "required", e.target.checked)}
                                                        disabled={isViewOnly}
                                                        className="w-4 h-4 rounded border-slate-200 text-blue-600 focus:ring-blue-100 transition-all disabled:opacity-70"
                                                    />
                                                    Obligatorio en diligenciamiento
                                                </label>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Tercera Firma switch - styled premium */}
                        <div className="mt-12 pt-6 border-t border-slate-100 flex items-center justify-between">
                            <div className="flex flex-col">
                                <span className="text-[12px] font-black text-slate-600 uppercase tracking-wide">Tercera firma</span>
                                <span className="text-[10px] text-slate-400 font-bold uppercase opacity-85 mt-0.5">Habilitar tercer firmante para este documento</span>
                            </div>
                            <button
                                type="button"
                                disabled={isViewOnly}
                                onClick={() => setTerceraFirma(!terceraFirma)}
                                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${terceraFirma ? 'bg-blue-600' : 'bg-slate-200'} disabled:opacity-50`}
                            >
                                <span
                                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${terceraFirma ? 'translate-x-5' : 'translate-x-0'}`}
                                />
                            </button>
                        </div>

                        {/* Dynamic dictionary tags below Tercera Firma */}
                        <div className="mt-8 pt-6 border-t border-slate-100">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1 mb-3">Diccionario Dinámico (Copiar al portapapeles)</p>
                            <div className="flex flex-wrap gap-2">
                                {[
                                    { label: "Nombre del paciente", value: "[NombrePaciente]" },
                                    { label: "Tipo de documento", value: "[TipoDocumento]" },
                                    { label: "Número de documento", value: "[Documento]" },
                                    { label: "Nombre del doctor", value: "[Doctor]" }
                                ].map(v => (
                                    <button
                                        key={v.value}
                                        type="button"
                                        className="px-4 py-2 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-600 rounded-xl text-[11px] font-black uppercase tracking-tight transition-all active:scale-95 shadow-sm"
                                        onClick={() => {
                                            navigator.clipboard.writeText(v.value);
                                            toast.success(`Copiado al portapapeles: ${v.value}`);
                                        }}
                                    >
                                        {v.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                    </div>
                </div>

                {/* Toolbox (Right) */}
                {!isViewOnly && (
                    <div className="w-[300px] bg-white border-l border-slate-200 flex flex-col shrink-0">
                        <div className="p-6 border-b border-slate-100">
                            <h3 className="text-[12px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Caja de Herramientas</h3>
                            <p className="text-[10px] font-bold text-slate-300 uppercase">Pulsa para añadir al formato</p>
                        </div>
                        <div className="flex-1 overflow-y-auto p-6 scroll-smooth custom-scrollbar">
                            <div className="grid gap-3">
                                {TOOLS.map((t, i) => (
                                    <button
                                        key={i}
                                        onClick={() => addField(t.type)}
                                        className="flex items-center gap-4 p-4 bg-white border border-slate-200 rounded-2xl hover:border-blue-400 hover:shadow-xl hover:shadow-blue-50 transition-all duration-300 group/tool text-left"
                                    >
                                        <div className={`w-10 h-10 ${t.bg} ${t.color} rounded-xl flex items-center justify-center group-hover/tool:scale-110 transition-transform`}>
                                            <t.icon size={20} />
                                        </div>
                                        <div>
                                            <div className="text-[12px] font-black text-slate-700 uppercase tracking-tight">{t.label}</div>
                                            <div className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter opacity-70">Insertar elemento</div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Dictionary / Variables Reference */}
                        <div className="p-6 bg-slate-50 border-t border-slate-200">
                            <div className="flex items-center gap-2 mb-4">
                                <FiLayout className="text-blue-500" size={14} />
                                <span className="text-[11px] font-black text-slate-600 uppercase tracking-widest">Diccionario Dinámico</span>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                {VARIABLES.map(v => (
                                    <button
                                        key={v}
                                        className="px-2 py-2 bg-white border border-slate-200 rounded-lg text-[9px] font-black text-slate-500 uppercase tracking-tighter hover:border-blue-300 hover:text-blue-600 hover:shadow-md transition-all truncate"
                                        onClick={() => {
                                            navigator.clipboard.writeText(v);
                                            toast.success("Copiado al portapapeles: " + v);
                                        }}
                                    >
                                        {v}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}
