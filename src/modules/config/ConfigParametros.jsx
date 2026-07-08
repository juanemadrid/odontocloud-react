
import React, { useState, useEffect } from "react";
import { FiSave, FiInfo, FiMessageSquare, FiSettings, FiFileText, FiActivity, FiBox, FiUser, FiCheck, FiBell, FiZap } from "react-icons/fi";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import Input from "../../components/ui/Input";

// Reusable Slender Pro Switch Component
const PremiumSwitch = ({ checked, onChange, label, subtitle }) => (
    <div className="flex items-center justify-between py-4 px-4 bg-white hover:bg-slate-50/80 transition-all duration-300 rounded-2xl border border-transparent hover:border-slate-100 group/switch">
        <div className="flex flex-col gap-0.5">
            <span className="text-[13px] font-black text-slate-700 uppercase tracking-tight group-hover/switch:text-blue-600 transition-colors">{label}</span>
            {subtitle && <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed line-clamp-1">{subtitle}</span>}
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
            <input
                type="checkbox"
                className="sr-only peer"
                checked={checked}
                onChange={(e) => onChange(e.target.checked)}
            />
            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-5 peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 shadow-inner"></div>
        </label>
    </div>
);

// Reusable Slender Pro Section Card
const ConfigSection = ({ title, icon: Icon, children, colorClass = "blue" }) => {
    const colors = {
        blue: "text-blue-600 bg-blue-50 border-blue-100",
        emerald: "text-emerald-600 bg-emerald-50 border-emerald-100",
        amber: "text-amber-600 bg-amber-50 border-amber-100",
        purple: "text-purple-600 bg-purple-50 border-purple-100",
        indigo: "text-indigo-600 bg-indigo-50 border-indigo-100"
    };

    return (
        <div className="bg-white rounded-[32px] border border-slate-200/50 shadow-[0_20px_60px_rgba(0,0,0,0.03)] overflow-hidden transition-all duration-500 hover:shadow-[0_30px_70px_rgba(0,0,0,0.05)]">
            <div className="bg-slate-50/50 backdrop-blur-sm px-8 py-5 border-b border-slate-100 flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-sm border ${colors[colorClass]}`}>
                    <Icon size={18} className="font-black" />
                </div>
                <h3 className="text-[16px] font-black text-slate-800 uppercase tracking-tighter">{title}</h3>
            </div>
            <div className="p-8">
                {children}
            </div>
        </div>
    );
};

export default function ConfigParametros() {
    const { userProfile } = useAuth();
    const toast = useToast();
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [data, setData] = useState({
        facturacion: {
            plantillaRecibo: "Recibo caja carta",
            plantillaNotaDebito: "Nota débito carta",
            plantillaNotaCredito: "Nota crédito carta",
            plantillaPresupuesto: "Cotización carta",
            plantillaFactura: "Factura media carta",
            plantillaFacturaElectronica: "Factura media carta",
            plantillaOrdenCompra: "Orden de compra",
            plantillaEgresos: "Egresos",
            plantillaFacturaCompra: "Factura carta",
            permitirPlanesCero: false,
        },
        agenda: {
            tipoWhatsapp: "gratis",
            mensajeWhatsapp: "Cordial saludo [PatientName], por favor confirme su asistencia a la cita en [TenantName]. Día: [Date], Hora: [Hour]. ESCRIBENOS PARA CONFIRMAR O INGRESA EN EL SIGUIENTE LINK: [Link]",
            validarCamposAgenda: false,
            noCrearCitasPasado: false,
            duracionAgendaRapida: 30,
        },
        general: {
            especialidadOrtodoncia: "Ortodoncia",
            actualizarAgendaInactividad: 10000,
            agendarCitasOnlineDespuesHoras: 24,
            vigenciaPresupuestos: 30,
            textoAyudaPlan: "",
            editarPlanClinico: true,
            manejaCopagos: false,
            usuarioVeDocumentosPropios: false,
            generarReporteOportunidad: true,
            confirmarPacienteContacto: false,
            tiempoEditarPlan: 90,
            permitirEdicionRecetas: false,
            evaluacionPacInasistentes: "",
            validarEspaciosBlanco: true,
            usarLocalStorageReportes: false,
            liquidacionPorSucursal: false,
            asignarPrimerProfesional: false,
            cerrarCajaMediosPago: false,
            avisoResolucionDias: 10,
            avisoResolucionFacturas: 50,
            historiaIgualIdentidad: true,
            filtrarPorCategorias: false,
        },
        inventario: {
            integrarPagos: false,
            integrarRecaudos: false,
        },
        historiaClinica: {
            mensajeWhatsappFirma: "[PatientName], te contactamos de la clínica [TenantName]. Para firmar su documento clínico utilice el siguiente link: [Link]",
            tiempoExpiracionFirma: 60,
            noEditarDatosPaciente: false,
        }
    });

    useEffect(() => {
        if (userProfile?.inquilino) {
            loadData();
        }
    }, [userProfile]);

    const loadData = async () => {
        setLoading(true);
        try {
            const docRef = doc(db, "tenants", userProfile.inquilino, "config", "parameters");
            const snap = await getDoc(docRef);
            if (snap.exists()) {
                const saved = snap.data();
                setData(prev => ({
                    ...prev,
                    facturacion: { ...prev.facturacion, ...(saved.facturacion || {}) },
                    agenda: { ...prev.agenda, ...(saved.agenda || {}) },
                    general: { ...prev.general, ...(saved.general || {}) },
                    inventario: { ...prev.inventario, ...(saved.inventario || {}) },
                    historiaClinica: { ...prev.historiaClinica, ...(saved.historiaClinica || {}) },
                }));
            }
        } catch (error) {
            console.error("Error loading parameters:", error);
            toast.error("Error al cargar parámetros");
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (section, key, value) => {
        setData(prev => ({
            ...prev,
            [section]: {
                ...prev[section],
                [key]: value
            }
        }));
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const docRef = doc(db, "tenants", userProfile.inquilino, "config", "parameters");
            await setDoc(docRef, {
                ...data,
                updatedAt: serverTimestamp(),
                updatedBy: userProfile.uid
            });
            toast.success("Parámetros guardados correctamente");
        } catch (error) {
            console.error("Error saving parameters:", error);
            toast.error("Error al guardar");
        } finally {
            setSaving(false);
        }
    };

    const appendToTextarea = (section, key, text) => {
        const currentVal = data[section][key] || "";
        handleChange(section, key, currentVal + " " + text);
    };

    if (loading && !data.updatedAt) {
        return (
            <div className="flex flex-col items-center justify-center py-40 animate-pulse">
                <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center text-blue-500 mb-4">
                    <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                </div>
                <p className="text-sm font-black text-slate-400 uppercase tracking-[0.2em]">Cargando configuración...</p>
            </div>
        );
    }

    return (
        <div className="space-y-10 p-2 md:p-8 relative">

            {/* Toolbar Premium */}
            <div className="bg-white rounded-[32px] border border-slate-200/50 shadow-[0_20px_60px_rgba(0,0,0,0.03)] overflow-hidden relative">
                <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-600 shadow-[1px_0_10px_rgba(37,99,235,0.15)]"></div>
                <div className="bg-slate-50/50 backdrop-blur-sm px-8 py-5 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center shadow-xl shadow-blue-200">
                            <FiSettings size={24} className="text-white" />
                        </div>
                        <div>
                            <h2 className="text-[20px] font-black text-slate-800 uppercase tracking-tighter">Parámetros</h2>
                            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest opacity-80">Configuración global del sistema</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto pb-24">

                {/* === FACTURACIÓN === */}
                <ConfigSection title="Facturación" icon={FiFileText} colorClass="emerald">
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {[
                                { k: "plantillaRecibo", label: "Recibo de caja" },
                                { k: "plantillaNotaDebito", label: "Nota débito" },
                                { k: "plantillaNotaCredito", label: "Nota crédito" },
                                { k: "plantillaPresupuesto", label: "Presupuestos" },
                                { k: "plantillaFactura", label: "Factura" },
                                { k: "plantillaFacturaElectronica", label: "Factura electrónica" },
                                { k: "plantillaOrdenCompra", label: "Orden de compra" },
                            ].map(field => (
                                <div key={field.k} className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{field.label}</label>
                                    <select
                                        className="w-full bg-slate-50 border border-slate-100 focus:bg-white focus:border-emerald-500 rounded-2xl p-3 text-[13px] font-black text-slate-600 outline-none transition-all shadow-inner-sm"
                                        value={data.facturacion[field.k]}
                                        onChange={(e) => handleChange("facturacion", field.k, e.target.value)}
                                    >
                                        <option value="Recibo caja carta">Recibo caja carta</option>
                                        <option value="Nota débito carta">Nota débito carta</option>
                                        <option value="Factura media carta">Factura media carta</option>
                                        <option value="Factura carta">Factura carta</option>
                                        <option value="Cotización carta">Cotización carta</option>
                                        <option value="Orden de compra">Orden de compra</option>
                                        <option value="Egresos">Egresos</option>
                                    </select>
                                </div>
                            ))}
                        </div>
                        <div className="pt-4 border-t border-slate-50">
                            <PremiumSwitch
                                label="Tratamientos en 0"
                                subtitle="Permitir guardar planes sin valor comercial"
                                checked={data.facturacion.permitirPlanesCero}
                                onChange={(v) => handleChange("facturacion", "permitirPlanesCero", v)}
                            />
                        </div>
                    </div>
                </ConfigSection>

                {/* === AGENDA === */}
                <ConfigSection title="Agenda" icon={FiActivity} colorClass="blue">
                    <div className="space-y-8">
                        <div>
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 block mb-3">Canal de Notificaciones</label>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                {[
                                    { id: "gratis", label: "Cuentas Gratis" },
                                    { id: "api", label: "Business API" },
                                    { id: "business", label: "Woflo API" }
                                ].map(type => (
                                    <button
                                        key={type.id}
                                        onClick={() => handleChange("agenda", "tipoWhatsapp", type.id)}
                                        className={`px-4 py-3 rounded-2xl border text-[11px] font-black uppercase tracking-tight transition-all duration-300 ${data.agenda.tipoWhatsapp === type.id
                                            ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-200'
                                            : 'bg-white border-slate-100 text-slate-500 hover:bg-slate-50'}`}
                                    >
                                        {type.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 block">Mensaje de Recordatorio</label>
                            <textarea
                                rows={4}
                                className="w-full bg-slate-50 border border-slate-100 focus:bg-white focus:border-blue-500 rounded-2xl p-4 text-[13px] font-bold text-slate-700 outline-none transition-all shadow-inner-sm min-h-[120px]"
                                value={data.agenda.mensajeWhatsapp}
                                onChange={(e) => handleChange("agenda", "mensajeWhatsapp", e.target.value)}
                            />
                            <div className="flex flex-wrap gap-2">
                                {["[PatientName]", "[Nombre Paciente]", "[Clínica]", "[Fecha]", "[Hora]", "[Link]"].map(tag => (
                                    <button
                                        key={tag}
                                        onClick={() => appendToTextarea("agenda", "mensajeWhatsapp", tag)}
                                        className="px-3 py-1.5 bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-tighter rounded-xl hover:bg-blue-100 transition-all border border-blue-100/50"
                                    >
                                        + {tag}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-2 border-t border-slate-50 pt-4">
                            <PremiumSwitch label="Validar campos" subtitle="Exigir datos completos al agendar" checked={data.agenda.validarCamposAgenda} onChange={(v) => handleChange("agenda", "validarCamposAgenda", v)} />
                            <PremiumSwitch label="Prevenir Pasado" subtitle="No permitir citas en fechas anteriores" checked={data.agenda.noCrearCitasPasado} onChange={(v) => handleChange("agenda", "noCrearCitasPasado", v)} />
                            <div className="flex items-center justify-between p-4 bg-slate-50/50 rounded-2xl border border-slate-100 mt-2">
                                <span className="text-[13px] font-black text-slate-700 uppercase tracking-tight">Duración rápida (min)</span>
                                <input
                                    type="number"
                                    className="w-20 bg-white border border-slate-200 rounded-xl p-2 text-center font-black text-blue-600 shadow-sm"
                                    value={data.agenda.duracionAgendaRapida}
                                    onChange={(e) => handleChange("agenda", "duracionAgendaRapida", parseInt(e.target.value))}
                                />
                            </div>
                        </div>
                    </div>
                </ConfigSection>

                {/* === HISTORIA CLINICA === */}
                <ConfigSection title="Historia Clínica" icon={FiUser} colorClass="purple">
                    <div className="space-y-6">
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 block">Mensaje de Firma Digital</label>
                            <textarea
                                rows={3}
                                className="w-full bg-slate-50 border border-slate-100 focus:bg-white focus:border-purple-500 rounded-2xl p-4 text-[13px] font-bold text-slate-700 outline-none transition-all shadow-inner-sm"
                                value={data.historiaClinica.mensajeWhatsappFirma}
                                onChange={(e) => handleChange("historiaClinica", "mensajeWhatsappFirma", e.target.value)}
                            />
                            <div className="flex flex-wrap gap-2">
                                {["[PatientName]", "[TenantName]", "[Link]"].map(tag => (
                                    <button
                                        key={tag}
                                        onClick={() => appendToTextarea("historiaClinica", "mensajeWhatsappFirma", tag)}
                                        className="px-3 py-1.5 bg-purple-50 text-purple-600 text-[10px] font-black uppercase tracking-tighter rounded-xl hover:bg-purple-100 transition-all border border-purple-100/50"
                                    >
                                        + {tag}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="grid grid-cols-1 gap-2 pt-4 border-t border-slate-50">
                            <div className="flex items-center justify-between p-4 bg-slate-50/50 rounded-2xl border border-slate-100">
                                <span className="text-[13px] font-black text-slate-700 uppercase tracking-tight">Expiración Firma (min)</span>
                                <input
                                    type="number"
                                    className="w-20 bg-white border border-slate-200 rounded-xl p-2 text-center font-black text-purple-600 shadow-sm"
                                    value={data.historiaClinica.tiempoExpiracionFirma}
                                    onChange={(e) => handleChange("historiaClinica", "tiempoExpiracionFirma", parseInt(e.target.value))}
                                />
                            </div>
                            <PremiumSwitch label="Bloquear Datos" subtitle="No permitir editar datos maestros desde HC" checked={data.historiaClinica.noEditarDatosPaciente} onChange={(v) => handleChange("historiaClinica", "noEditarDatosPaciente", v)} />
                        </div>
                    </div>
                </ConfigSection>

                {/* === INVENTARIO === */}
                <ConfigSection title="Inventario" icon={FiBox} colorClass="amber">
                    <div className="space-y-3">
                        <PremiumSwitch label="Integrar Pagos" subtitle="Descontar stock automáticamente al pagar" checked={data.inventario.integrarPagos} onChange={(v) => handleChange("inventario", "integrarPagos", v)} />
                        <PremiumSwitch label="Integrar Recaudos" subtitle="Sincronizar abonos con existencias" checked={data.inventario.integrarRecaudos} onChange={(v) => handleChange("inventario", "integrarRecaudos", v)} />
                    </div>
                </ConfigSection>

                {/* === GENERAL (Full Width) === */}
                <div className="lg:col-span-2">
                    <ConfigSection title="Configuraciones Generales" icon={FiZap} colorClass="indigo">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-4">
                            <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Zona Ortodoncia</label>
                                    <select
                                        className="w-full bg-slate-50 border border-slate-100 focus:bg-white focus:border-indigo-500 rounded-2xl p-3 text-[13px] font-black text-slate-600 outline-none transition-all"
                                        value={data.general.especialidadOrtodoncia}
                                        onChange={(e) => handleChange("general", "especialidadOrtodoncia", e.target.value)}
                                    >
                                        <option value="Ortodoncia">Ortodoncia</option>
                                        <option value="Odontología General">Odontología General</option>
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Refresco Agenda (ms)</label>
                                    <Input
                                        type="number"
                                        className="bg-slate-50 border-slate-100 rounded-2xl p-3 font-black text-indigo-600"
                                        value={data.general.actualizarAgendaInactividad}
                                        onChange={(e) => handleChange("general", "actualizarAgendaInactividad", parseInt(e.target.value))}
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Vigencia Cotizaciones (Días)</label>
                                    <Input
                                        type="number"
                                        className="bg-slate-50 border-slate-100 rounded-2xl p-3 font-black text-indigo-600"
                                        value={data.general.vigenciaPresupuestos}
                                        onChange={(e) => handleChange("general", "vigenciaPresupuestos", parseInt(e.target.value))}
                                    />
                                </div>
                            </div>

                            <PremiumSwitch label="Editar Plan Clínico" checked={data.general.editarPlanClinico} onChange={(v) => handleChange("general", "editarPlanClinico", v)} />
                            <PremiumSwitch label="Maneja Copagos" checked={data.general.manejaCopagos} onChange={(v) => handleChange("general", "manejaCopagos", v)} />
                            <PremiumSwitch label="Sólo Documentos Propios" checked={data.general.usuarioVeDocumentosPropios} onChange={(v) => handleChange("general", "usuarioVeDocumentosPropios", v)} />
                            <PremiumSwitch label="Reporte Oportunidad" checked={data.general.generarReporteOportunidad} onChange={(v) => handleChange("general", "generarReporteOportunidad", v)} />
                            <PremiumSwitch label="Confirmar Contacto" checked={data.general.confirmarPacienteContacto} onChange={(v) => handleChange("general", "confirmarPacienteContacto", v)} />
                            <PremiumSwitch label="Edición de Recetas" checked={data.general.permitirEdicionRecetas} onChange={(v) => handleChange("general", "permitirEdicionRecetas", v)} />
                            <PremiumSwitch label="Validar Espacios Blanco" checked={data.general.validarEspaciosBlanco} onChange={(v) => handleChange("general", "validarEspaciosBlanco", v)} />
                            <PremiumSwitch label="Liquidación Sucursal" checked={data.general.liquidacionPorSucursal} onChange={(v) => handleChange("general", "liquidacionPorSucursal", v)} />
                            <PremiumSwitch label="Primer Profesional" checked={data.general.asignarPrimerProfesional} onChange={(v) => handleChange("general", "asignarPrimerProfesional", v)} />
                            <PremiumSwitch label="Cierre Caja x Medios" checked={data.general.cerrarCajaMediosPago} onChange={(v) => handleChange("general", "cerrarCajaMediosPago", v)} />
                            <PremiumSwitch label="Historia = Identidad" checked={data.general.historiaIgualIdentidad} onChange={(v) => handleChange("general", "historiaIgualIdentidad", v)} />
                            <PremiumSwitch label="Filtrar Categorías" checked={data.general.filtrarPorCategorias} onChange={(v) => handleChange("general", "filtrarPorCategorias", v)} />
                        </div>
                    </ConfigSection>
                </div>
            </div>

            {/* Floating Saver */}
            <div className="fixed bottom-10 right-10 z-[100]">
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-5 rounded-[24px] text-[14px] font-black uppercase tracking-[0.2em] flex items-center gap-3 shadow-[0_20px_50px_rgba(37,99,235,0.4)] transition-all active:scale-95 group/float overflow-hidden relative border border-white/20"
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/float:animate-shimmer" />
                    {saving ? (
                        <>
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            PROCESANDO...
                        </>
                    ) : (
                        <>
                            <FiSave size={20} /> GUARDAR CONFIGURACIÓN
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}
