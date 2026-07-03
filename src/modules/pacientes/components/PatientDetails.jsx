import React, { useState, useEffect, useRef } from "react";
import { doc, onSnapshot, collection, query, where, getDocs, addDoc } from "firebase/firestore";
import { db, storage } from "../../../firebase/firebaseConfig";
import { formatCurrency } from "../../../utils/formatters";
import { useAuth } from "../../../context/AuthContext";
import { useToast } from "../../../context/ToastContext";
import { useForm, FormProvider, useFormContext } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { patientSchema } from "../schemas/patientSchema";
import { 
    TIPOS_DOCUMENTO, PAISES, PREFIJOS_TELEFONICOS, TIPOS_VINCULACION,
    SEXOS, ESTADOS_CIVILES, ESTRATOS, ZONAS_RESIDENCIALES, PARENTESCOS, MEDIOS_CONOCIMIENTO
} from "../constants/patientConstants";

import { 
    FiUser, FiEdit2, FiTarget, FiCamera, FiClipboard, FiActivity, 
    FiDollarSign, FiUsers, FiX, FiInfo, FiChevronRight, FiAlertCircle,
    FiBriefcase, FiCalendar, FiTrendingUp, FiFileText, FiShield, FiCheck, FiTrash2, FiPlus, FiCpu
} from "react-icons/fi";

// Tabs Imports
import HistoriaClinicaContainer from "./HistoriaClinicaContainer";
import EvolucionesTab from "./EvolucionesTab";
import CrmTab from "./CrmTab";
import PresupuestosTab from "./PresupuestosTab";
import FacturacionTab from "./FacturacionTab";
import ConsentimientosTab from "./ConsentimientosTab";
import PatientRxTab from "./PatientRxTab";
import BeneficiariosTab from "./BeneficiariosTab";
import Odontograma from "../../odontograma/Odontograma";
import Periodontograma from "../../odontograma/Periodontograma";
import AseguramientoTab from "./AseguramientoTab";
import MarketingTab from "./MarketingTab";
import ProfesionalesTab from "./ProfesionalesTab";
import SaldoTab from "./SaldoTab";
import PagoTab from "./PagoTab";
import HistoricoPagosTab from "./HistoricoPagosTab";
import HistoricoFacturasTab from "./HistoricoFacturasTab";
import AIInsightsTab from "./AIInsightsTab";
import HistoriaClinicaTab from "./HistoriaClinicaTab";

const FormRow = ({ label, required, children, error, helpText }) => (
    <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-6 py-3 border-b border-slate-100/50 last:border-0 hover:bg-slate-50/50 transition-colors px-4">
        <label className={"w-full md:w-60 shrink-0 text-[13px] font-bold md:text-right flex items-center justify-start md:justify-end gap-1 " + (error ? 'text-rose-500' : 'text-slate-600')}>
            {label} {required && <span className="text-rose-500">*</span>}
        </label>
        <div className="flex-1 w-full max-w-2xl relative">
            {children}
            {error && <p className="text-rose-500 text-[11px] font-bold uppercase tracking-wider mt-1">{error.message}</p>}
            {helpText && !error && <p className="text-slate-400 text-[11px] font-medium mt-1 uppercase tracking-widest">{helpText}</p>}
        </div>
    </div>
);

const SectionTitle = ({ title, num }) => (
    <div className="flex items-center gap-4 bg-slate-50 px-6 py-4 border-y border-slate-200 mt-6 mb-2">
        <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-black shadow-md">{num}</div>
        <h3 className="text-[13px] font-black text-slate-700 uppercase tracking-widest">{title}</h3>
    </div>
);

const FormDatosPersonales = ({ patient, photoState }) => {
    const { register, watch, setValue, formState: { errors } } = useFormContext();
    const { isCameraActive, fotoPreview, startCamera, stopCamera, takePhoto, onFotoChange, videoRef, canvasRef } = photoState;

    const age = watch("edad");
    const [showPrefijoDrop, setShowPrefijoDrop] = React.useState(false);
    const [prefijoSearch, setPrefijoSearch] = React.useState("");

    React.useEffect(() => {
        if (!showPrefijoDrop) return;
        const handler = () => setShowPrefijoDrop(false);
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, [showPrefijoDrop]);
    
    return (
        <div className="flex flex-col lg:flex-row gap-10 p-4 md:p-8 animate-fadeIn">
            {/* 1. LEFT COLUMN: FORM FIELDS */}
            <div className="flex-1 min-w-0">
                <div className="bg-white rounded-[32px] overflow-hidden border border-slate-100 shadow-sm mb-8 pb-8">
                    <SectionTitle num="1" title="Datos de identificación" />
                    <div className="pl-0 md:pl-4 space-y-1">
                        <FormRow label="Tipo de documento" required error={errors.tipoDocumento}>
                            <select {...register("tipoDocumento")} className="form-input text-sm w-full md:w-64">
                                <option value="">Seleccione...</option>
                                {TIPOS_DOCUMENTO.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </FormRow>
                        <FormRow label="Nro. de documento" required error={errors.nroDocumento}>
                            <input {...register("nroDocumento")} className="form-input text-sm w-full md:w-64" placeholder="Nro. documento" />
                        </FormRow>
                        <FormRow label="Número de Historia" helpText="Autogenerado si está vacío">
                            <input {...register("nroHistoria")} className="form-input text-sm w-full md:w-64" placeholder="Nro. historia" />
                        </FormRow>
                        <FormRow label="Fecha de ingreso">
                            <div className="relative w-full md:w-64">
                                <input {...register("fechaIngreso")} readOnly className="form-input text-sm w-full bg-slate-50/50 cursor-not-allowed" />
                                <FiCalendar className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                            </div>
                        </FormRow>
                        <FormRow label="Nombres" required error={errors.nombres}>
                            <input {...register("nombres")} className="form-input text-sm w-full" placeholder="Nombres" />
                        </FormRow>
                        <FormRow label="Apellidos" required error={errors.apellidos}>
                            <input {...register("apellidos")} className="form-input text-sm w-full" placeholder="Apellidos" />
                        </FormRow>
                        <FormRow label="Nombre completo">
                            <input value={watch("nombreCompleto")?.toUpperCase() || ""} readOnly className="form-input text-sm w-full bg-slate-50 text-slate-600 font-bold border-transparent" />
                        </FormRow>
                        <FormRow label="Sexo" required error={errors.sexo}>
                            <select {...register("sexo")} className="form-input text-sm w-full md:w-64">
                                <option value="">Seleccione...</option>
                                {SEXOS.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </FormRow>
                        <FormRow label="Estado civil" required error={errors.estadoCivil}>
                            <select {...register("estadoCivil")} className="form-input text-sm w-full md:w-64">
                                <option value="">Seleccione...</option>
                                {ESTADOS_CIVILES.map(ec => <option key={ec} value={ec}>{ec}</option>)}
                            </select>
                        </FormRow>
                    </div>

                    <SectionTitle num="2" title="Datos de contacto & Ubicación" />
                    <div className="pl-0 md:pl-4 space-y-1">
                        <FormRow label="País de nacimiento" required error={errors.paisNacimiento}>
                            <select {...register("paisNacimiento")} className="form-input text-sm w-full md:w-64">
                                <option value="">Seleccione...</option>
                                {PAISES.map(p => <option key={typeof p === "object" ? p.pais : p} value={typeof p === "object" ? p.pais : p}>{typeof p === "object" ? p.pais : p}</option>)}
                            </select>
                        </FormRow>
                        <FormRow label="Ciudad de nacimiento">
                            <input {...register("ciudadNacimiento")} className="form-input text-sm w-full md:w-64" placeholder="Ej: Bogotá" />
                        </FormRow>
                        <FormRow label="Fecha de Nacimiento" required error={errors.fechaNacimiento}>
                            <div className="flex gap-4">
                                <input type="date" {...register("fechaNacimiento")} className="form-input text-sm w-full md:w-48" />
                                <div className="px-4 py-2 bg-slate-100 rounded-lg text-sm text-slate-700 font-bold flex items-center shadow-inner">
                                    Edad: {age || "---"}
                                </div>
                            </div>
                        </FormRow>

                        <FormRow label="País de domicilio" required error={errors.paisDomicilio}>
                            <select {...register("paisDomicilio")} className="form-input text-sm w-full md:w-64">
                                <option value="">Seleccione...</option>
                                {PAISES.map(p => <option key={typeof p === "object" ? p.pais : p} value={typeof p === "object" ? p.pais : p}>{typeof p === "object" ? p.pais : p}</option>)}
                            </select>
                        </FormRow>
                        <FormRow label="Ciudad de domicilio" required error={errors.ciudadDomicilio}>
                            <input {...register("ciudadDomicilio")} className="form-input text-sm w-full md:w-64" placeholder="Ej: Medellín" />
                        </FormRow>
                        <FormRow label="Barrio" required error={errors.barrio}>
                            <input {...register("barrio")} className="form-input text-sm w-full md:w-64" placeholder="Barrio" />
                        </FormRow>
                        <FormRow label="Lugar de residencia" required error={errors.lugarResidencia}>
                            <input {...register("lugarResidencia")} className="form-input text-sm w-full" placeholder="Dirección completa" />
                        </FormRow>

                        <FormRow label="Configuración Domicilio">
                            <div className="flex gap-4 items-center">
                                <select {...register("estrato")} className="form-input text-sm w-32">
                                    <option value="">Estrato</option>
                                    {ESTRATOS.map(e => <option key={e} value={e}>{e}</option>)}
                                </select>
                                <select {...register("zonaResidencial")} className="form-input text-sm w-40">
                                    <option value="">Zona Residencial</option>
                                    {ZONAS_RESIDENCIALES.map(z => <option key={z} value={z}>{z}</option>)}
                                </select>
                            </div>
                        </FormRow>
                        <FormRow label="Celular" required error={errors.celular}>
                            <div className="flex items-center gap-0 w-full max-w-sm">
                                {/* Prefijo compacto con dropdown de búsqueda */}
                                <div className="relative shrink-0">
                                    <button
                                        type="button"
                                        onClick={() => { setShowPrefijoDrop(v => !v); setPrefijoSearch(""); }}
                                        className="h-9 px-2.5 rounded-l-lg border border-r-0 border-slate-200 bg-slate-50 hover:bg-slate-100 text-[11px] font-black text-slate-600 uppercase tracking-wider flex items-center gap-1 transition-colors whitespace-nowrap focus:outline-none focus:ring-1 focus:ring-blue-400"
                                    >
                                        {watch("prefijoCelular") || "+57"}
                                        <svg className="w-2.5 h-2.5 text-slate-400" fill="none" viewBox="0 0 10 6"><path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                                    </button>
                                    <input type="hidden" {...register("prefijoCelular")} />
                                    {showPrefijoDrop && (
                                        <div
                                            className="absolute left-0 top-full mt-1 z-50 bg-white border border-slate-200 rounded-xl shadow-2xl overflow-hidden"
                                            style={{ minWidth: "200px" }}
                                            onMouseDown={e => e.stopPropagation()}
                                        >
                                            <div className="px-2 pt-2 pb-1 border-b border-slate-100">
                                                <input
                                                    autoFocus
                                                    type="text"
                                                    value={prefijoSearch}
                                                    onChange={e => setPrefijoSearch(e.target.value)}
                                                    placeholder="Buscar país o prefijo..."
                                                    className="w-full h-7 px-2 text-[11px] font-bold border border-slate-200 rounded-md outline-none focus:border-blue-400 bg-slate-50"
                                                />
                                            </div>
                                            <div className="max-h-52 overflow-y-auto custom-scrollbar">
                                                {PREFIJOS_TELEFONICOS
                                                    .filter(p =>
                                                        !prefijoSearch ||
                                                        p.pais.toLowerCase().includes(prefijoSearch.toLowerCase()) ||
                                                        p.prefijo.includes(prefijoSearch)
                                                    )
                                                    .map(p => (
                                                        <button
                                                            key={`${p.pais}-${p.prefijo}`}
                                                            type="button"
                                                            onClick={() => {
                                                                setValue("prefijoCelular", p.prefijo);
                                                                setShowPrefijoDrop(false);
                                                            }}
                                                            className="w-full flex items-center justify-between px-3 py-2 text-left hover:bg-blue-50 transition-colors group"
                                                        >
                                                            <span className="text-[11px] font-semibold text-slate-600 group-hover:text-blue-700">{p.pais}</span>
                                                            <span className="text-[11px] font-black text-slate-800 group-hover:text-blue-700 ml-2">{p.prefijo}</span>
                                                        </button>
                                                    ))
                                                }
                                            </div>
                                        </div>
                                    )}
                                </div>
                                {/* Input del número */}
                                <input
                                    {...register("celular")}
                                    autoComplete="off"
                                    className="form-input text-sm flex-1 rounded-l-none border-l-0 focus:z-10"
                                    placeholder="Número de celular"
                                    onFocus={() => setShowPrefijoDrop(false)}
                                />
                            </div>
                        </FormRow>

                        <FormRow label="Correo Electrónico" required error={errors.email}>
                            <input {...register("email")} className="form-input text-sm w-full" placeholder="Correo" />
                        </FormRow>
                        <FormRow label="Ocupación" required error={errors.ocupacion}>
                            <input {...register("ocupacion")} className="form-input text-sm w-full md:w-64" placeholder="Ocupación" />
                        </FormRow>

                        <FormRow label="Opciones Adicionales">
                            <div className="flex gap-8 items-center py-2">
                                <label className="flex items-center gap-3 cursor-pointer group">
                                    <div className="relative">
                                        <input type="checkbox" {...register("esExtranjero")} className="sr-only" />
                                        <div className={`w-8 h-5 rounded-full transition-all ${watch("esExtranjero") ? 'bg-blue-600' : 'bg-slate-200'}`} />
                                        <div className={`absolute top-1 left-1 w-3 h-3 bg-white rounded-full transition-all ${watch("esExtranjero") ? 'translate-x-3' : ''}`} />
                                    </div>
                                    <span className="text-[13px] font-semibold text-slate-600">¿Es extranjero?</span>
                                </label>
                            </div>
                        </FormRow>
                    </div>
                </div>
            </div>

            {/* 2. RIGHT COLUMN: PHOTO & STATUS */}
            <div className="w-full lg:w-80 shrink-0 space-y-6">
                <div className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm flex flex-col items-center">
                    <div className="w-48 h-48 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center overflow-hidden mb-6 group relative">
                        {isCameraActive ? (
                            <div className="absolute inset-0 bg-black">
                                <video ref={videoRef} className="w-full h-full object-cover" autoPlay playsInline />
                                <div className="absolute bottom-2 inset-x-0 flex justify-center gap-2">
                                    <button type="button" onClick={takePhoto} className="p-2 bg-[#8CC63F] text-white rounded-full"><FiCheck size={18} /></button>
                                    <button type="button" onClick={stopCamera} className="p-2 bg-rose-500 text-white rounded-full"><FiX size={18} /></button>
                                </div>
                            </div>
                        ) : fotoPreview ? (
                            <>
                                <img src={fotoPreview} className="w-full h-full object-cover" alt="Preview" />
                                <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-3">
                                    <button type="button" onClick={startCamera} className="p-2.5 bg-white/20 text-white rounded-full hover:bg-[#8CC63F]"><FiCamera size={18} /></button>
                                    <button type="button" onClick={() => onFotoChange(null)} className="p-2.5 bg-white/20 text-white rounded-full hover:bg-rose-500"><FiTrash2 size={18} /></button>
                                </div>
                            </>
                        ) : (
                            <div className="text-center p-4">
                                <FiCamera size={40} className="text-slate-300 mx-auto mb-3" />
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-relaxed">Sin foto</p>
                                <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" onChange={(e) => onFotoChange(e.target.files[0])} />
                            </div>
                        )}
                        <canvas ref={canvasRef} className="hidden" />
                    </div>
                    
                    <button type="button" onClick={startCamera} className="w-full py-3 bg-[#8CC63F] text-white text-[11px] font-black uppercase tracking-widest rounded-full shadow-lg shadow-[#8CC63F]/10 hover:bg-[#7bb335] transition-all flex items-center justify-center gap-2 mb-8">
                        <FiCamera size={14} /> Tomar foto
                    </button>

                    <div className="w-full space-y-3">
                        <div className="w-full py-3 bg-blue-600 text-white text-[9px] font-black uppercase tracking-widest rounded-lg flex items-center justify-center gap-2">
                            <FiActivity size={12} /> Paciente Registrado
                        </div>
                    </div>
                </div>
                
                <div className="border border-rose-200 bg-rose-50 rounded-2xl p-6 shadow-sm">
                    <label className="flex items-center gap-2 text-rose-600 font-bold mb-3 text-[11px] uppercase tracking-widest"><FiAlertCircle /> ALERTAS MÉDICAS</label>
                    <textarea 
                        {...register("alertas")} 
                        className="w-full h-24 p-4 border border-rose-200 rounded-xl focus:ring-4 focus:ring-rose-500/10 focus:border-rose-500 text-sm text-slate-800 bg-white" 
                        placeholder="Escribe alergias o condiciones..."
                    />
                </div>
            </div>
        </div>
    );
};

const FormAseguramiento = () => {
    const { register, watch, setValue, formState: { errors } } = useFormContext();
    const [epsList, setEpsList] = useState([]);
    const { userProfile } = useAuth();

    useEffect(() => {
        if(userProfile?.inquilino) {
            getDocs(query(collection(db, "eps_catalogo"), where("inquilino", "==", userProfile.inquilino)))
                .then(snap => setEpsList(snap.docs.map(d => d.data().nombre)));
        }
    }, [userProfile?.inquilino]);

    const epsValue = watch("nombreEps");
    const filteredEps = epsList.filter(e => e.toLowerCase().includes((epsValue||"").toLowerCase())).slice(0,5);
    const [showEps, setShowEps] = useState(false);

    return (
        <div className="p-4 md:p-8 animate-fadeIn max-w-4xl mx-auto">
            <div className="bg-white rounded-[32px] overflow-hidden border border-slate-100 shadow-sm pb-8">
                <div className="flex items-center gap-4 bg-slate-50 px-6 py-4 border-b border-slate-200 mb-2">
                    <h3 className="text-[14px] font-black text-slate-700 uppercase tracking-widest">EPS</h3>
                </div>
                <div className="pl-0 md:pl-4 space-y-1 mt-4">
                    <FormRow label="Tipo de vinculación" required error={errors.tipoVinculacion}>
                        <select {...register("tipoVinculacion")} className="form-input text-sm w-full md:w-64">
                            <option value="">Seleccione...</option>
                            {TIPOS_VINCULACION.map(v => <option key={v} value={v}>{v}</option>)}
                        </select>
                    </FormRow>
                    <FormRow label="Nombre de la EPS" required error={errors.nombreEps}>
                        <div className="flex gap-2">
                            <div className="relative flex-1 max-w-[16rem]">
                                <input 
                                    {...register("nombreEps")} 
                                    onFocus={() => setShowEps(true)}
                                    onBlur={() => setTimeout(() => setShowEps(false), 200)}
                                    className="form-input text-sm w-full uppercase"
                                />
                                {showEps && filteredEps.length > 0 && (
                                    <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-xl overflow-hidden py-1">
                                        {filteredEps.map(eps => (
                                            <button key={eps} type="button" onMouseDown={() => setValue("nombreEps", eps)} className="w-full px-4 py-2 text-left text-[13px] hover:bg-slate-50 text-slate-700">
                                                {eps}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <button type="button" onClick={(e) => { e.preventDefault(); }} className="w-10 h-10 shrink-0 bg-[#8CC63F] text-white rounded-xl flex items-center justify-center hover:bg-[#7bb335] transition-colors shadow-md shadow-[#8CC63F]/20">
                                <FiPlus size={20} />
                            </button>
                        </div>
                    </FormRow>
                    <FormRow label="Póliza de salud">
                        <input {...register("polizaSalud")} className="form-input text-sm w-full md:w-80" placeholder="Póliza de salud del paciente" />
                    </FormRow>
                </div>
            </div>
            {/* Action button mimicking the image bottom guard */}
            <div className="flex justify-end mt-4 px-4">
                <button type="submit" className="px-8 py-2 bg-[#8CC63F] text-white text-[11px] font-black uppercase tracking-widest rounded-full shadow-lg shadow-[#8CC63F]/20 hover:bg-[#7bb335] active:scale-95 transition-all flex items-center gap-2">
                    <FiCheck size={14} /> Guardar
                </button>
            </div>
        </div>
    );
};

const FormMarketing = () => {
    const { register, watch } = useFormContext();
    return (
        <div className="p-4 md:p-8 animate-fadeIn max-w-4xl mx-auto">
            <div className="bg-white rounded-[32px] overflow-hidden border border-slate-100 shadow-sm pb-8">
                <SectionTitle num="4" title="Estrategia de Mercadeo" />
                <div className="pl-0 md:pl-4 space-y-1">
                    <FormRow label="¿Cómo nos conoció?">
                        <select {...register("comoConocio")} className="form-input text-sm w-full md:w-64">
                            <option value="">Seleccione...</option>
                            {MEDIOS_CONOCIMIENTO.map(m => <option key={m} value={m}>{m}</option>)}
                        </select>
                    </FormRow>
                    <FormRow label="Campaña Relacionada">
                        <input {...register("campania")} className="form-input text-sm w-full" />
                    </FormRow>
                    <FormRow label="Remitido por">
                        <div className="flex gap-2">
                            <select {...register("remitidoPorType")} className="form-input text-sm w-32">
                                <option value="Libre">Libre</option>
                                <option value="Paciente">Paciente</option>
                                <option value="Usuario">Usuario</option>
                            </select>
                            <input {...register("remitidoPorValue")} className="form-input text-sm flex-1" />
                        </div>
                    </FormRow>
                    <FormRow label="Permite Publicidad">
                        <label className="flex items-center gap-3 cursor-pointer group py-2">
                            <div className="relative">
                                <input type="checkbox" {...register("permitePublicidad")} className="sr-only" />
                                <div className={`w-8 h-5 rounded-full transition-all ${watch("permitePublicidad") ? 'bg-blue-600' : 'bg-slate-200'}`} />
                                <div className={`absolute top-1 left-1 w-3 h-3 bg-white rounded-full transition-all ${watch("permitePublicidad") ? 'translate-x-3' : ''}`} />
                            </div>
                        </label>
                    </FormRow>
                </div>
            </div>
        </div>
    );
}

const SidebarButton = ({ label, active, onClick, icon: Icon, badge }) => (
    <button
        type="button"
        onClick={onClick}
        className={`w-full group px-3 py-1.5 rounded-lg transition-all flex items-center justify-between border-l-[3px] ${active
            ? "bg-indigo-50/50 border-indigo-600 text-indigo-700 shadow-sm"
            : "border-transparent text-slate-500 hover:bg-slate-50 hover:text-slate-800"
            }`}
    >
        <div className="flex items-center gap-2.5">
            <span className={`transition-transform duration-300 ${active ? "scale-105" : "group-hover:scale-105"}`}>
                <Icon size={14} className={active ? "text-indigo-600" : "text-slate-400"} />
            </span>
            <span className={`text-[10px] font-black uppercase tracking-tight ${active ? 'opacity-100' : 'opacity-80'}`}>{label}</span>
        </div>
        {badge && (
            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[8px] font-black rounded-full uppercase">
                {badge}
            </span>
        )}
    </button>
);

const SidebarSectionTitle = ({ children }) => (
    <div className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 mt-5 px-3 border-b border-slate-50 pb-1.5">
        {children}
    </div>
);

export default function PatientDetails({ initialData, onClose, onDelete }) {
    const [patient, setPatient] = useState(initialData || null);
    // Default to "presu" (Presupuestos & planes) if the URL path ends with "/planes"
    const pathEndsWithPlanes = window.location.pathname.toLowerCase().endsWith("/planes");
    
    // Support dynamic tab initialization and updates via URL queries (e.g. voice commands)
    const searchParams = new URLSearchParams(window.location.search);
    const queryTab = searchParams.get("tab");
    const [activeTab, setActiveTab] = useState(queryTab || (pathEndsWithPlanes ? "presu" : "datos"));
    
    useEffect(() => {
        const currentParams = new URLSearchParams(window.location.search);
        const currentTab = currentParams.get("tab");
        if (currentTab && currentTab !== activeTab) {
            setActiveTab(currentTab);
        }
    }, [window.location.search, activeTab]);

    const [financials, setFinancials] = useState(null);
    const { userProfile } = useAuth();
    const toast = useToast();

    // RHF Form
    const methods = useForm({
        resolver: zodResolver(patientSchema),
        defaultValues: { prefijoCelular: "+57", ...(initialData || {}) }
    });

    // Make sure we update if initialData changes or loads directly
    useEffect(() => {
        if (initialData) {
            setPatient(initialData);
            if (!methods.formState.isDirty) {
                methods.reset({
                    ...initialData,
                    remitidoPorType: initialData.remitidoPorType || "Libre",
                    asesorComercialType: initialData.asesorComercialType || "Libre",
                    esExtranjero: initialData.esExtranjero || false,
                    permitePublicidad: initialData.permitePublicidad ?? true,
                });
            }
        }
    }, [initialData, methods]);

    useEffect(() => {
        if (!initialData?.id) return;
        const unsub = onSnapshot(doc(db, "pacientes", initialData.id), (snap) => {
            if (snap.exists()) {
                const data = { id: snap.id, ...snap.data() };
                setPatient(data);
                
                // Keep form in sync without overriding active typing
                if (!methods.formState.isDirty) {
                    methods.reset({
                        ...data,
                        remitidoPorType: data.remitidoPorType || "Libre",
                        asesorComercialType: data.asesorComercialType || "Libre",
                        esExtranjero: data.esExtranjero || false,
                        permitePublicidad: data.permitePublicidad ?? true,
                    });
                }
            }
        });
        return () => unsub();
    }, [initialData?.id, methods]);

    useEffect(() => {
        if (!patient?.id) return;
        import("../../../services/billingService").then(({ getPatientFinancials }) => {
            getPatientFinancials(patient.id).then(setFinancials);
        });
    }, [patient?.id, activeTab]); // Reload on tab switch to ensure sync

    // Cámara Handlers
    const [isCameraActive, setIsCameraActive] = useState(false);
    const [cameraStream, setCameraStream] = useState(null);
    const [fotoPreview, setFotoPreview] = useState("");
    const [fotoFile, setFotoFile] = useState(null);
    const videoRef = useRef(null);
    const canvasRef = useRef(null);

    useEffect(() => {
        if (patient && !fotoPreview && patient.fotoUrl) {
            setFotoPreview(patient.fotoUrl);
        }
    }, [patient, fotoPreview]);

    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
            setCameraStream(stream);
            setIsCameraActive(true);
        } catch (err) { toast.error("Error al acceder a la cámara."); }
    };
    useEffect(() => {
        if (isCameraActive && cameraStream && videoRef.current) videoRef.current.srcObject = cameraStream;
    }, [isCameraActive, cameraStream]);

    const stopCamera = () => {
        if (cameraStream) { cameraStream.getTracks().forEach(track => track.stop()); setCameraStream(null); }
        setIsCameraActive(false);
    };

    const takePhoto = () => {
        if (videoRef.current && canvasRef.current) {
            const canvas = canvasRef.current;
            canvas.width = videoRef.current.videoWidth;
            canvas.height = videoRef.current.videoHeight;
            canvas.getContext("2d").drawImage(videoRef.current, 0, 0);
            canvas.toBlob(blob => {
                if (blob) {
                    setFotoFile(new File([blob], `capture.jpg`, { type: "image/jpeg" }));
                    setFotoPreview(URL.createObjectURL(blob));
                }
                stopCamera();
            }, "image/jpeg", 0.9);
        }
    };
    const onFotoChange = file => {
        setFotoFile(file||null);
        if(!file) { setFotoPreview(""); methods.setValue("fotoUrl", ""); }
        else {
            const reader = new FileReader();
            reader.onload = e => setFotoPreview(e.target.result);
            reader.readAsDataURL(file);
        }
    };

    const submitForm = async (data) => {
        try {
            import("../../../services/patientService").then(async ({ createOrUpdatePatient }) => {
                try {
                    await createOrUpdatePatient(userProfile.inquilino, data, false, fotoFile);
                    toast.success("Información del paciente actualizada y guardada");
                    methods.reset(data); // Clear isDirty
                } catch(e) {
                    toast.error("Hubo un error al guardar");
                }
            });
        } catch(e) {
            toast.error("Hubo un error al guardar");
        }
    };

    // Calculate age automatically just in case
    const birthDate = methods.watch("fechaNacimiento");
    useEffect(() => {
        if (!birthDate) return;
        const birth = new Date(birthDate);
        const today = new Date();
        let years = today.getFullYear() - birth.getFullYear();
        let months = today.getMonth() - birth.getMonth();
        if (months < 0 || (months === 0 && today.getDate() < birth.getDate())) { years--; months += 12; }
        if (today.getDate() < birth.getDate()) { months--; if (months < 0) { months += 12; years--; } }
        let numStr = "";
        if (years >= 0) numStr = `${years} años`;
        if (months > 0) numStr += ` y ${months} meses`;
        methods.setValue("edad", numStr);
    }, [birthDate, methods]);

    const nombres = methods.watch("nombres");
    const apellidos = methods.watch("apellidos");
    useEffect(() => {
        if (nombres || apellidos) methods.setValue("nombreCompleto", `${nombres || ""} ${apellidos || ""}`.trim());
    }, [nombres, apellidos, methods]);

    if (!patient) return (<div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/40"><div className="bg-white p-8 rounded-2xl"><p>Cargando datos del paciente...</p></div></div>);

    const isFullHeightTab = ['odonto', 'perio', 'presu', 'hc', 'ai_insights'].includes(activeTab);
    const isEditableTab = ['datos', 'mark', 'eps'].includes(activeTab);

    const getPageTitle = () => {
        if (activeTab === 'eps') return 'Edición Eps paciente';
        if (activeTab === 'mark') return 'Edición Marketing paciente';
        if (activeTab === 'pro') return 'Profesionales';
        return 'Edición Información Paciente';
    };

    return (
        <div className="w-full h-full bg-slate-50 flex flex-col animate-fadeIn overflow-hidden">
                {/* 1. THE COMPACT HUD (Header) */}
                <div className="bg-white px-4 md:px-6 py-2.5 border-b border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4 shrink-0 z-20 shadow-[0_2px_15px_-5px_rgba(0,0,0,0.05)] relative">
                    <div className="flex items-center gap-4">
                        <div className="relative group shrink-0">
                            {fotoPreview ? <img src={fotoPreview} alt="Foto" className="w-10 h-10 rounded-xl object-cover ring-2 ring-slate-50 shadow-sm" /> : <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-black text-lg ring-2 ring-slate-50 shadow-md">{(patient.nombreCompleto || "P")[0]}</div>}
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-0.5">
                                <h3 className="text-base font-black text-slate-800 uppercase tracking-tight leading-none">{methods.watch("nombreCompleto") || "Cargando..."}</h3>
                            </div>
                            <div className="flex items-center gap-2.5 text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                                <span className="flex items-center gap-1"><FiInfo className="text-indigo-600" /> {patient.tipoDocumento} {patient.nroDocumento}</span>
                                <span>ID: <span className="text-slate-600">#{patient.nroHistoria || "S/N"}</span></span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button onClick={onClose} className="w-9 h-9 bg-slate-900 text-white rounded-xl flex items-center justify-center hover:bg-rose-600 transition-all active:scale-95 shadow-md shadow-slate-200" title="Cerrar expediente">
                            <FiX size={16} />
                        </button>
                    </div>
                </div>

                {/* 2. STUDIO WORKSPACE (Sidebar + Content) */}
                <FormProvider {...methods}>
                    <div className="flex-1 flex flex-col xl:flex-row overflow-hidden">
                        {/* SIDEBAR */}
                        <aside className="w-full lg:w-60 bg-white border-b lg:border-b-0 lg:border-r border-slate-100 overflow-x-auto lg:overflow-y-auto p-3 flex flex-row lg:flex-col shrink-0 custom-scrollbar-hidden lg:custom-scrollbar scrollbar-hide">
                            <SidebarSectionTitle>Información General</SidebarSectionTitle>
                            <div className="flex lg:flex-col gap-1 min-w-max lg:min-w-0">
                                <SidebarButton icon={FiUser} label="Datos personales" active={activeTab === "datos"} onClick={() => { if(activeTab === "datos") { setActiveTab(""); setTimeout(() => setActiveTab("datos"), 0); } else setActiveTab("datos"); }} />
                                <SidebarButton icon={FiTrendingUp} label="Marketing" active={activeTab === "mark"} onClick={() => { if(activeTab === "mark") { setActiveTab(""); setTimeout(() => setActiveTab("mark"), 0); } else setActiveTab("mark"); }} />
                                <SidebarButton icon={FiShield} label="EPS" active={activeTab === "eps"} onClick={() => { if(activeTab === "eps") { setActiveTab(""); setTimeout(() => setActiveTab("eps"), 0); } else setActiveTab("eps"); }} />
                                <SidebarButton icon={FiUsers} label="Beneficiarios convenio" active={activeTab === "conv"} onClick={() => { if(activeTab === "conv") { setActiveTab(""); setTimeout(() => setActiveTab("conv"), 0); } else setActiveTab("conv"); }} />
                                <SidebarButton icon={FiBriefcase} label="Profesionales" active={activeTab === "pro"} onClick={() => { if(activeTab === "pro") { setActiveTab(""); setTimeout(() => setActiveTab("pro"), 0); } else setActiveTab("pro"); }} />
                                <SidebarButton icon={FiCamera} label="Rx / Imágenes / Doc" active={activeTab === "rx"} onClick={() => { if(activeTab === "rx") { setActiveTab(""); setTimeout(() => setActiveTab("rx"), 0); } else setActiveTab("rx"); }} />
                                <SidebarButton icon={FiTarget} label="CRM" active={activeTab === "crm"} onClick={() => { if(activeTab === "crm") { setActiveTab(""); setTimeout(() => setActiveTab("crm"), 0); } else setActiveTab("crm"); }} />
                            </div>

                            <SidebarSectionTitle>Historia Clínica</SidebarSectionTitle>
                            <div className="flex lg:flex-col gap-1 min-w-max lg:min-w-0">
                                <SidebarButton icon={FiClipboard} label="Anamnesis / Antecedentes" active={activeTab === "anamnesis"} onClick={() => { if(activeTab === "anamnesis") { setActiveTab(""); setTimeout(() => setActiveTab("anamnesis"), 0); } else setActiveTab("anamnesis"); }} />
                                <SidebarButton icon={FiClipboard} label="Doc. Clínicos" active={activeTab === "hc"} onClick={() => { if(activeTab === "hc") { setActiveTab(""); setTimeout(() => setActiveTab("hc"), 0); } else setActiveTab("hc"); }} />
                                <SidebarButton icon={FiActivity} label="Odontogramas" active={activeTab === "odonto"} onClick={() => { if(activeTab === "odonto") { setActiveTab(""); setTimeout(() => setActiveTab("odonto"), 0); } else setActiveTab("odonto"); }} />
                                <SidebarButton icon={FiActivity} label="Periodontogramas" active={activeTab === "perio"} onClick={() => { if(activeTab === "perio") { setActiveTab(""); setTimeout(() => setActiveTab("perio"), 0); } else setActiveTab("perio"); }} />
                                <SidebarButton icon={FiFileText} label="Presupuestos & planes" active={activeTab === "presu"} onClick={() => { if(activeTab === "presu") { setActiveTab(""); setTimeout(() => setActiveTab("presu"), 0); } else setActiveTab("presu"); }} />
                                <SidebarButton icon={FiActivity} label="Evoluciones & Remis" active={activeTab === "evo"} onClick={() => { if(activeTab === "evo") { setActiveTab(""); setTimeout(() => setActiveTab("evo"), 0); } else setActiveTab("evo"); }} />
                            </div>

                            <SidebarSectionTitle>Inteligencia Artificial</SidebarSectionTitle>
                            <div className="flex lg:flex-col gap-1 min-w-max lg:min-w-0">
                                <SidebarButton icon={FiCpu} label="Copiloto IA Insights" active={activeTab === "ai_insights"} onClick={() => { if(activeTab === "ai_insights") { setActiveTab(""); setTimeout(() => setActiveTab("ai_insights"), 0); } else setActiveTab("ai_insights"); }} />
                            </div>

                            <SidebarSectionTitle>Facturación</SidebarSectionTitle>
                            <div className="flex lg:flex-col gap-1 min-w-max lg:min-w-0">
                                <SidebarButton 
                                    icon={FiDollarSign} 
                                    label="Saldo a favor" 
                                    active={activeTab === "saldo"} 
                                    onClick={() => { if(activeTab === "saldo") { setActiveTab(""); setTimeout(() => setActiveTab("saldo"), 0); } else setActiveTab("saldo"); }} 
                                    badge={financials?.totals?.totalSaldosAFavor > 0 ? `$${formatCurrency(financials.totals.totalSaldosAFavor)}` : "$ 0"} 
                                />
                                <SidebarButton icon={FiDollarSign} label="Realizar pago" active={activeTab === "pago"} onClick={() => { if(activeTab === "pago") { setActiveTab(""); setTimeout(() => setActiveTab("pago"), 0); } else setActiveTab("pago"); }} />
                                <SidebarButton icon={FiDollarSign} label="Histórico pagos" active={activeTab === "hist_pago"} onClick={() => { if(activeTab === "hist_pago") { setActiveTab(""); setTimeout(() => setActiveTab("hist_pago"), 0); } else setActiveTab("hist_pago"); }} />
                                <SidebarButton icon={FiFileText} label="Histórico facturas" active={activeTab === "hist_fact"} onClick={() => { if(activeTab === "hist_fact") { setActiveTab(""); setTimeout(() => setActiveTab("hist_fact"), 0); } else setActiveTab("hist_fact"); }} />
                            </div>
                        </aside>

                        {/* WORKSPACE CONTENT */}
                        <main className="flex-1 flex flex-col min-w-0 min-h-0 bg-white relative overflow-hidden">
                            {isEditableTab ? (
                                <form onSubmit={methods.handleSubmit(submitForm)} className="h-full flex flex-col">
                                    <div className="px-10 py-4 bg-slate-50/80 backdrop-blur-sm border-b border-slate-200 flex flex-col md:flex-row justify-between items-center sticky top-0 z-10">
                                        <div className="flex items-center gap-3">
                                            <h3 className="text-[14px] font-black text-slate-800 uppercase tracking-tight">{getPageTitle()}</h3>
                                            <span className="text-slate-300">/</span>
                                            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                                <FiUser size={12} className="text-slate-400" />
                                                <span>Pacientes</span>
                                                <span className="text-slate-300 lowercase mx-1">-</span>
                                                <span className="text-slate-500 lowercase">{getPageTitle()}</span>
                                            </div>
                                        </div>
                                        <button type="submit" className="px-8 py-2 bg-[#8CC63F] text-white text-[11px] font-black uppercase tracking-widest rounded-full shadow-lg shadow-[#8CC63F]/20 hover:bg-[#7bb335] active:scale-95 transition-all flex items-center gap-2">
                                            <FiCheck size={14} /> Guardar
                                        </button>
                                    </div>
                                    <div className="flex-1 overflow-y-auto custom-scrollbar bg-slate-50/20">
                                        {activeTab === "datos" && <FormDatosPersonales patient={patient} photoState={{isCameraActive, fotoPreview, startCamera, stopCamera, takePhoto, onFotoChange, videoRef, canvasRef}} />}
                                        {activeTab === "mark" && <FormMarketing />}
                                        {activeTab === "eps" && <FormAseguramiento />}
                                    </div>
                                </form>
                            ) : (
                                <div className={`flex-1 flex flex-col min-w-0 min-h-0 ${isFullHeightTab ? 'overflow-hidden' : 'overflow-y-auto custom-scrollbar animate-fadeIn p-2'}`}>
                                    {activeTab === "rx" && <PatientRxTab patient={patient} onUpdate={setPatient} />}
                                    {activeTab === "evo" && <EvolucionesTab patient={patient} />}
                                    {activeTab === "conv" && <BeneficiariosTab patient={patient} onUpdate={setPatient} onSwitchTab={setActiveTab} />}
                                    {activeTab === "pro" && <ProfesionalesTab patient={patient} onUpdate={setPatient} />}
                                    {activeTab === "fact" && <FacturacionTab patient={patient} />}
                                    {activeTab === "crm" && <CrmTab patient={patient} />}
                                    
                                    {activeTab === "anamnesis" && <HistoriaClinicaTab patientId={patient.id} />}
                                    {activeTab === "hc" && <HistoriaClinicaContainer patient={patient} />}
                                    {activeTab === "odonto" && <Odontograma embeddedPatient={patient} />}
                                    {activeTab === "perio" && <Periodontograma embeddedPatient={patient} />}
                                    {activeTab === "presu" && <PresupuestosTab patient={patient} />}
                                    {activeTab === "ai_insights" && <AIInsightsTab patient={patient} />}

                                    {/* Elite Billing Section */}
                                    {activeTab === "saldo" && <SaldoTab patient={patient} />}
                                    {activeTab === "pago" && <PagoTab patient={patient} />}
                                    {activeTab === "hist_pago" && <HistoricoPagosTab patientId={patient.id} />}
                                    {activeTab === "hist_fact" && <HistoricoFacturasTab patientId={patient.id} />}
                                    
                                    {["citas", "fact"].includes(activeTab) && (
                                        <div className="flex flex-col items-center justify-center min-h-[400px] p-10 text-center opacity-40">
                                            <FiActivity size={48} className="mb-4 text-slate-400" />
                                            <h5 className="text-[14px] font-black text-slate-600 uppercase tracking-widest">Módulo en Sincronización</h5>
                                            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-2">Esta sección está siendo integrada con el motor Elite</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </main>
                    </div>
                </FormProvider>
        </div>
    );
}


