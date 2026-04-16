import React, { useState, useEffect } from "react";
import { FiHome, FiSave, FiClipboard, FiCheckCircle, FiInfo, FiArrowLeft } from "react-icons/fi";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";
import { useAuth } from "../../context/AuthContext";

// Premium Toggle Switch Component (iOS Style)
const Toggle = ({ checked, onChange }) => (
    <div
        onClick={() => onChange(!checked)}
        className={`w-11 h-6 rounded-full relative cursor-pointer transition-all duration-300 ${checked ? "bg-blue-600 shadow-[0_0_15px_rgba(37,99,235,0.3)]" : "bg-slate-200"
            }`}
    >
        <div
            className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300 shadow-sm ${checked ? "left-6" : "left-1"
                }`}
        />
    </div>
);

// Configuration Definition
const SECTIONS = [
    {
        title: "Configuración formulario paciente",
        fields: [
            { key: "paisNacimiento", label: "País de nacimiento", norma: true },
            { key: "ciudadNacimiento", label: "Ciudad de nacimiento", norma: true },
            { key: "numeroDentadura", label: "Número dentadura" },
            { key: "sexo", label: "Sexo", norma: true },
            { key: "rh", label: "RH" },
            { key: "estadoCivil", label: "Estado civil", norma: true },
            { key: "fechaIngreso", label: "Fecha de ingreso", norma: true },
            { key: "fechaNacimiento", label: "Fecha de nacimiento", norma: true },
            { key: "paisDomicilio", label: "País de domicilio", norma: true },
            { key: "ciudadDomicilio", label: "Ciudad de domicilio", norma: true },
            { key: "barrioDomicilio", label: "Barrio de domicilio", norma: true },
            { key: "lugarResidencia", label: "Lugar de residencia", norma: true },
            { key: "estrato", label: "Estrato" },
            { key: "zonaResidencial", label: "Zona residencial" },
            { key: "esExtranjero", label: "Es extranjero" },
            { key: "permitePublicidad", label: "Permite recibir publicidad" },
            { key: "orientacionSexual", label: "Orientación sexual" },
            { key: "lugarExpedicion", label: "Lugar de expedición del documento" },
        ]
    },
    {
        title: "Datos de facturación",
        fields: [
            { key: "multiplesResponsables", label: "Múltiples Responsables" }
        ]
    },
    {
        title: "Contacto",
        fields: [
            { key: "celular", label: "Celular", norma: true },
            { key: "telefonoDomicilio", label: "Teléfono de domicilio", norma: true },
            { key: "telefonoOficina", label: "Teléfono de oficina" },
            { key: "extension", label: "Extensión" },
            { key: "correoElectronico", label: "Correo electrónico" },
            { key: "ocupacion", label: "Ocupación", norma: true },
        ]
    },
    {
        title: "Responsable",
        fields: [
            { key: "respNombre", label: "Nombre", norma: true },
            { key: "respParentesco", label: "Parentesco", norma: true },
            { key: "respCelular", label: "Celular", norma: true },
            { key: "respTelefono", label: "Teléfono", norma: true },
            { key: "respCorreo", label: "Correo electrónico" }
        ]
    },
    {
        title: "Acompañante",
        fields: [
            { key: "acompNombre", label: "Nombre", norma: true },
            { key: "acompTelefono", label: "Teléfono", norma: true }
        ]
    },
    {
        title: "Contabilidad",
        fields: [
            { key: "cuentaContable", label: "Cuenta contable" }
        ]
    },
    {
        title: "Mercadeo",
        fields: [
            { key: "convenioBeneficio", label: "Convenio beneficio" },
            { key: "convenioPago", label: "Convenio de pago" },
            { key: "comoNosConocio", label: "Como nos conoció" },
            { key: "campana", label: "Campaña" },
            { key: "remitidoPor", label: "Remitido por" },
            { key: "asesorComercial", label: "Asesor comercial" }
        ]
    },
    {
        title: "EPS",
        fields: [
            { key: "tipoVinculacion", label: "Tipo de vinculación", norma: true },
            { key: "nombreEps", label: "Nombre de la EPS", norma: true },
            { key: "polizaSalud", label: "Póliza de salud" },
            { key: "soat", label: "SOAT" },
            { key: "tipoPaciente", label: "Tipo de paciente" }
        ]
    },
    {
        title: "Profesionales",
        fields: [
            { key: "profesionales", label: "Profesionales" }
        ]
    },
    {
        title: "Notas",
        fields: [
            { key: "nota", label: "Nota" }
        ]
    }
];

export default function EmpresaFormularioPacientes() {
    const { userProfile } = useAuth();
    const inquilino = userProfile?.inquilino;

    const [config, setConfig] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            if (!inquilino) return;
            try {
                const docSnap = await getDoc(doc(db, "tenants", inquilino, "config", "formulario_pacientes"));
                if (docSnap.exists()) {
                    setConfig(docSnap.data());
                } else {
                    setConfig({});
                }
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [inquilino]);

    const handleChange = (key, type, val) => {
        setConfig(prev => ({
            ...prev,
            [key]: {
                ...prev[key],
                [type]: val
            }
        }));
    };

    const handleSave = async () => {
        if (!inquilino) return;
        try {
            await setDoc(doc(db, "tenants", inquilino, "config", "formulario_pacientes"), config);
            // Professional notification logic could be added here
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <div className="p-4 w-full max-w-5xl mx-auto relative transition-all duration-300">
            {/* Header: Institutional & Actions */}
            <div className="group/section bg-white rounded-[32px] border border-slate-200/50 shadow-[0_20px_60px_rgba(0,0,0,0.03)] hover:shadow-[0_35px_80px_rgba(0,0,0,0.06)] transition-all duration-700 overflow-hidden relative mb-6">
                <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-600 shadow-[1px_0_10px_rgba(37,99,235,0.15)]"></div>

                <div className="bg-slate-50/50 backdrop-blur-sm px-8 py-5 border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center shadow-xl shadow-blue-200">
                            <FiClipboard size={20} className="text-white" />
                        </div>
                        <div className="flex flex-col">
                            <h2 className="text-[18px] font-black text-slate-800 uppercase tracking-tighter">Configuración de Pacientes</h2>
                            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest opacity-80">Gestión de visibilidad y requerimientos de campos</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleSave}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl text-[13px] font-black uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-blue-200 transition-all active:scale-95 group/save"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/save:animate-shimmer" />
                            <FiSave className="text-lg" /> Guardar
                        </button>
                    </div>
                </div>
            </div>

            {/* Config Body */}
            <div className="bg-white rounded-[32px] border border-slate-200/50 shadow-[0_15px_40px_rgba(0,0,0,0.02)] p-0 relative overflow-hidden">
                {loading ? (
                    <div className="p-20 text-center">
                        <div className="flex flex-col items-center gap-3 animate-pulse">
                            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-blue-400">
                                <div className="w-6 h-6 border-2 border-blue-600/20 border-t-blue-600 rounded-full animate-spin" />
                            </div>
                            <p className="text-sm font-bold text-slate-400 uppercase tracking-[0.2em]">Cargando configuración...</p>
                        </div>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-50">
                        {/* Table Header Wrapper */}
                        <div className="sticky top-0 bg-white/80 backdrop-blur-md z-10 px-8 py-4 border-b border-slate-100 grid grid-cols-12 items-center text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">
                            <div className="col-span-6">Campo del Formulario</div>
                            <div className="col-span-3 text-center">¿Es Visible?</div>
                            <div className="col-span-3 text-center">¿Es Requerido?</div>
                        </div>

                        {SECTIONS.map((section, idx) => (
                            <div key={idx} className="group/section">
                                <div className="bg-slate-50/30 px-8 py-3 flex items-center gap-3 border-b border-slate-100/50">
                                    <div className="w-1 h-4 bg-slate-300 rounded-full" />
                                    <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-widest">
                                        {section.title}
                                    </h3>
                                </div>

                                <div className="divide-y divide-slate-50/50">
                                    {section.fields.map((field) => {
                                        const fieldConfig = config[field.key] || { visible: false, required: false };
                                        return (
                                            <div key={field.key} className="px-8 py-4 grid grid-cols-12 items-center hover:bg-slate-50/50 transition-all group/row">
                                                <div className="col-span-6 flex items-center gap-3">
                                                    <span className="text-[14px] font-bold text-slate-700 group-hover/row:text-blue-600 transition-colors">
                                                        {field.label}
                                                    </span>
                                                    {field.norma && (
                                                        <div className="flex items-center gap-1.5 px-2 py-0.5 bg-red-50 text-red-500 rounded-lg border border-red-100">
                                                            <FiInfo size={10} className="font-black" />
                                                            <span className="text-[9px] font-black uppercase tracking-tighter">Norma</span>
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="col-span-3 flex justify-center">
                                                    <Toggle
                                                        checked={fieldConfig.visible}
                                                        onChange={(val) => handleChange(field.key, "visible", val)}
                                                    />
                                                </div>

                                                <div className="col-span-3 flex justify-center">
                                                    <Toggle
                                                        checked={fieldConfig.required}
                                                        onChange={(val) => handleChange(field.key, "required", val)}
                                                    />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Sticky Save Footer Background Effect */}
            <div className="fixed bottom-8 right-8 z-50">
                <button
                    onClick={handleSave}
                    className="w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl flex items-center justify-center shadow-2xl shadow-blue-500/40 transition-all active:scale-90 group/float relative overflow-hidden"
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/float:animate-shimmer" />
                    <FiSave size={24} />
                </button>
            </div>
        </div>
    );
}
