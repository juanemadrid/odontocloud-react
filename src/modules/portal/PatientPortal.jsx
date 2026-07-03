import React, { useState, useEffect } from "react";
import { db } from "../../firebase/firebaseConfig";
import { collection, query, where, getDocs, orderBy, limit, Timestamp, doc, getDoc } from "firebase/firestore";
import { useParams, useNavigate } from "react-router-dom";
import { DEFAULT_CONFIG } from "../../constants/DefaultConfig";
import { FiArrowLeft, FiLogOut, FiCalendar, FiDollarSign, FiActivity, FiMessageCircle, FiX, FiPhone } from "react-icons/fi";
import { toast } from "sonner";

// ── Modal genérico del portal ─────────────────────────────────────────────────
function PortalModal({ title, icon: Icon, color, onClose, children }) {
    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fadeIn">
            <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden">
                <div className={`flex items-center justify-between px-6 py-4 ${color}`}>
                    <h2 className="font-black text-base flex items-center gap-2"><Icon size={18} /> {title}</h2>
                    <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-black/10 transition-colors"><FiX size={18} /></button>
                </div>
                <div className="p-6 max-h-[70vh] overflow-y-auto">{children}</div>
            </div>
        </div>
    );
}

export default function PatientPortal() {
    const { clinicSlug } = useParams();
    const navigate = useNavigate();
    const [auth, setAuth] = useState(false);
    const [docInput, setDocInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [user, setUser] = useState(null);
    const [nextAppt, setNextAppt] = useState(null);
    const [birthDate, setBirthDate] = useState("");
    const [config, setConfig] = useState(DEFAULT_CONFIG);
    const [loadingConfig, setLoadingConfig] = useState(!!clinicSlug);
    const [inquilinoId, setInquilinoId] = useState(null);

    // Modal states
    const [activeModal, setActiveModal] = useState(null); // 'cita' | 'pagos' | 'tratamiento' | 'soporte'

    // Data states
    const [pagos, setPagos] = useState([]);
    const [planes, setPlanes] = useState([]);
    const [todasCitas, setTodasCitas] = useState([]);
    const [loadingData, setLoadingData] = useState(false);

    // Nueva cita form
    const [nuevaCitaForm, setNuevaCitaForm] = useState({ fecha: "", motivo: "", nombre: "", celular: "" });
    const [citaEnviada, setCitaEnviada] = useState(false);
    const [soporteMsg, setSoporteMsg] = useState("");

    useEffect(() => {
        if (!clinicSlug) return;
        const loadConfig = async () => {
            try {
                const q = query(collection(db, "tenants"), where("slug", "==", clinicSlug));
                const qSnap = await getDocs(q);
                if (!qSnap.empty) {
                    const tenantData = qSnap.docs[0].data();
                    const inq = qSnap.docs[0].id;
                    setInquilinoId(inq);
                    const webSnap = await getDoc(doc(db, "website_config", inq));
                    setConfig(webSnap.exists()
                        ? { ...DEFAULT_CONFIG, ...webSnap.data(), name: tenantData.name, slug: clinicSlug, phone: tenantData.phone || "" }
                        : { ...DEFAULT_CONFIG, name: tenantData.name, slug: clinicSlug, phone: tenantData.phone || "" }
                    );
                }
            } catch (e) { console.error(e); }
            finally { setLoadingConfig(false); }
        };
        loadConfig();
    }, [clinicSlug]);

    const handleLogin = async (e) => {
        e.preventDefault();
        if (docInput.length < 5) return toast.error("Ingrese un documento válido (mínimo 5 dígitos).");
        if (!birthDate) return toast.error("Ingrese su fecha de nacimiento.");
        setLoading(true);
        try {
            let snap = await getDocs(query(collection(db, "pacientes"), where("nroDocumento", "==", docInput)));
            if (snap.empty) snap = await getDocs(query(collection(db, "pacientes"), where("documento", "==", docInput)));
            if (snap.empty) { toast.error("No encontramos un paciente con ese documento."); setLoading(false); return; }

            const patientData = { id: snap.docs[0].id, ...snap.docs[0].data() };
            const nacimiento = patientData.nacimiento || patientData.fechaNacimiento || "";
            if (nacimiento !== birthDate) {
                toast.error("La fecha de nacimiento no coincide con nuestros registros."); setLoading(false); return;
            }
            setUser(patientData);
            setNuevaCitaForm(f => ({ ...f, nombre: patientData.nombreCompleto || "", celular: patientData.celular || "" }));
            setAuth(true);
            await loadPatientData(patientData.id, patientData.inquilino);
        } catch (error) { toast.error("Error al iniciar sesión: " + error.message); }
        finally { setLoading(false); }
    };

    const loadPatientData = async (patientId, inq) => {
        setLoadingData(true);
        try {
            const iid = inq || inquilinoId;
            // Citas (todas)
            const qCitas = query(collection(db, "agenda"), where("pacienteId", "==", patientId));
            const snapCitas = await getDocs(qCitas).catch(() => ({ docs: [] }));
            const citasArr = snapCitas.docs.map(d => ({ id: d.id, ...d.data() }))
                .sort((a, b) => new Date(`${b.fecha}T${b.hora || "00:00"}`) - new Date(`${a.fecha}T${a.hora || "00:00"}`));
            setTodasCitas(citasArr);

            // Próxima cita
            const hoy = new Date().toISOString().slice(0, 10);
            const proxima = citasArr.find(c => c.fecha >= hoy && !["cancelada", "no asistio"].includes((c.estado || "").toLowerCase()));
            setNextAppt(proxima || null);

            // Pagos / facturas
            const qPagos = query(collection(db, "facturas"), where("pacienteId", "==", patientId));
            const snapPagos = await getDocs(qPagos).catch(() => ({ docs: [] }));
            setPagos(snapPagos.docs.map(d => ({ id: d.id, ...d.data() }))
                .sort((a, b) => (b.fecha?.seconds || 0) - (a.fecha?.seconds || 0)));

            // Planes de tratamiento
            const qPlanes = query(collection(db, "treatment_plans"), where("patientId", "==", patientId));
            const snapPlanes = await getDocs(qPlanes).catch(() => ({ docs: [] }));
            setPlanes(snapPlanes.docs.map(d => ({ id: d.id, ...d.data() })));
        } catch (err) { console.error(err); }
        finally { setLoadingData(false); }
    };

    const handleSolicitarCita = (e) => {
        e.preventDefault();
        // Abrir WhatsApp con el mensaje pre-cargado
        const phone = config.phone ? config.phone.replace(/\D/g, "") : "";
        const msg = `Hola, soy *${nuevaCitaForm.nombre}*, quisiera agendar una cita odontológica.\n📅 Fecha preferida: ${nuevaCitaForm.fecha || "por definir"}\n📋 Motivo: ${nuevaCitaForm.motivo || "Consulta general"}\n📱 Mi celular: ${nuevaCitaForm.celular}`;
        if (phone) {
            window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, "_blank");
        }
        setCitaEnviada(true);
    };

    // ── Login screen ─────────────────────────────────────────────────────────
    if (!auth) {
        return (
            <div className="min-h-screen flex bg-white font-sans">
                <div className="hidden lg:flex w-1/2 bg-slate-900 relative overflow-hidden items-center justify-center">
                    <img src="https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&q=80&w=1600" alt="" className="absolute inset-0 w-full h-full object-cover opacity-50 mix-blend-overlay" />
                    <div className="absolute inset-0 bg-gradient-to-tr from-indigo-900/90 via-indigo-900/40 to-transparent" />
                    <div className="relative z-10 max-w-lg text-center px-12 text-white">
                        <div className="mb-8 flex justify-center">
                            {config?.logo ? <img src={config.logo} className="h-16 w-auto brightness-0 invert opacity-80" alt="Logo" /> : <span className="text-4xl">🦷</span>}
                        </div>
                        <h1 className="text-5xl font-serif mb-6 leading-tight tracking-tight">{config.name || "Tu Salud Dental"}</h1>
                        <p className="text-indigo-100 text-lg font-light leading-relaxed opacity-90">"{config.vision || config.mission || 'Experiencias odontológicas que transforman vidas.'}"</p>
                    </div>
                    <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-indigo-500 rounded-full blur-3xl opacity-20 animate-pulse" />
                </div>
                <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-24 bg-white relative">
                    <button onClick={() => navigate(clinicSlug ? `/c/${clinicSlug}` : "/")} className="absolute top-8 left-8 flex items-center gap-2 text-slate-400 hover:text-indigo-600 transition-colors font-medium text-sm">
                        <FiArrowLeft size={18} /> Volver
                    </button>
                    <div className="w-full max-w-md space-y-10">
                        <div className="text-center lg:text-left space-y-3">
                            <div className="inline-flex items-center justify-center p-4 rounded-3xl bg-indigo-50 text-indigo-600 mb-2 shadow-sm"><span className="text-2xl">🔐</span></div>
                            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Acceso Pacientes</h2>
                            <p className="text-slate-500 text-lg">Consulta tus citas, pagos y tratamientos.</p>
                        </div>
                        <form onSubmit={handleLogin} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Documento de Identidad</label>
                                <input className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all outline-none font-semibold text-slate-800" placeholder="Número de documento" value={docInput} onChange={e => setDocInput(e.target.value)} disabled={loading} />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Fecha de Nacimiento</label>
                                <input type="date" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all outline-none font-semibold text-slate-800" value={birthDate} onChange={e => setBirthDate(e.target.value)} disabled={loading} />
                            </div>
                            <button type="submit" className="w-full py-5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold text-lg shadow-xl shadow-indigo-600/20 transition-all active:scale-[0.99] hover:-translate-y-1" disabled={loading}>
                                {loading ? "Verificando..." : "Ingresar al Portal"}
                            </button>
                        </form>
                        <div className="text-center pt-4 border-t border-slate-100">
                            <p className="text-xs text-slate-400 uppercase tracking-widest">Área Segura • {config.name}</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // ── Portal autenticado ────────────────────────────────────────────────────
    const totalPagado = pagos.filter(p => p.estado === "Pagada").reduce((s, p) => s + Number(p.monto || 0), 0);
    const totalPendiente = pagos.filter(p => p.estado !== "Pagada").reduce((s, p) => s + Number(p.monto || 0), 0);

    return (
        <div className="min-h-screen bg-slate-50 pb-24">
            {/* Header */}
            <div className="bg-indigo-600 text-white p-8 pb-28 rounded-b-[4rem] shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-12 opacity-10 text-9xl">
                    {config?.logo ? <img src={config.logo} alt="" className="w-64 h-64 object-contain brightness-0 invert" /> : "🦷"}
                </div>
                <div className="relative z-10 flex justify-between items-start">
                    <div className="flex items-center gap-4">
                        <button onClick={() => navigate(clinicSlug ? `/c/${clinicSlug}` : "/")} className="bg-white/10 p-3 rounded-2xl hover:bg-white/20 transition-all border border-white/10"><FiArrowLeft size={20} /></button>
                        <div>
                            <p className="text-indigo-100/60 font-bold text-xs uppercase tracking-widest mb-1">Bienvenido/a</p>
                            <h1 className="text-2xl font-black tracking-tight leading-tight">{user.nombreCompleto || user.nombres}</h1>
                            <p className="text-indigo-200 text-xs mt-1">{config.name}</p>
                        </div>
                    </div>
                    <button onClick={() => setAuth(false)} className="flex flex-col items-center gap-1 group">
                        <div className="bg-white/10 p-3 rounded-2xl group-hover:bg-rose-500/80 transition-all border border-white/10"><FiLogOut size={20} /></div>
                        <span className="text-[10px] font-black uppercase tracking-widest opacity-50">Salir</span>
                    </button>
                </div>
            </div>

            <div className="px-4 -mt-12 relative z-20 space-y-4 max-w-lg mx-auto">
                {/* Próxima Cita */}
                <div className="bg-white p-5 rounded-2xl shadow-lg border-l-8 border-indigo-500">
                    <h3 className="text-xs font-bold text-indigo-500 uppercase tracking-wider mb-3">Próxima Visita</h3>
                    {loadingData ? <div className="h-12 bg-slate-100 rounded-xl animate-pulse" /> :
                    nextAppt ? (
                        <div className="flex items-center gap-4">
                            <div className="bg-indigo-50 px-4 py-3 rounded-xl text-center min-w-[64px]">
                                <div className="text-xs font-bold text-indigo-700 uppercase">{new Date(`${nextAppt.fecha}T12:00:00`).toLocaleString('es-CO', { month: 'short' })}</div>
                                <div className="text-2xl font-black text-indigo-600">{new Date(`${nextAppt.fecha}T12:00:00`).getDate()}</div>
                            </div>
                            <div>
                                <div className="font-black text-slate-800">{nextAppt.hora || "—"}</div>
                                <div className="text-slate-500 text-sm">{nextAppt.dentista || nextAppt.doctorName || "Odontología General"}</div>
                                <div className="text-xs text-slate-400">{nextAppt.motivo || nextAppt.title || "Control"}</div>
                            </div>
                        </div>
                    ) : <p className="text-slate-400 text-sm italic">No tienes citas próximas programadas.</p>}
                </div>

                {/* Resumen financiero rápido */}
                {pagos.length > 0 && (
                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 text-center">
                            <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">Pagado</p>
                            <p className="text-lg font-black text-emerald-700">${totalPagado.toLocaleString("es-CO")}</p>
                        </div>
                        <div className="bg-rose-50 border border-rose-100 rounded-2xl p-4 text-center">
                            <p className="text-[10px] font-black text-rose-600 uppercase tracking-widest mb-1">Pendiente</p>
                            <p className="text-lg font-black text-rose-700">${totalPendiente.toLocaleString("es-CO")}</p>
                        </div>
                    </div>
                )}

                {/* Acciones rápidas */}
                <div className="grid grid-cols-2 gap-4">
                    <button onClick={() => { setCitaEnviada(false); setActiveModal("cita"); }} className="bg-white p-5 rounded-2xl shadow-sm hover:shadow-md transition text-center group">
                        <div className="text-3xl mb-2 group-hover:scale-110 transition">📅</div>
                        <div className="font-bold text-slate-700 text-sm">Nueva Cita</div>
                        <div className="text-[10px] text-indigo-500 font-bold mt-1">Solicitar</div>
                    </button>
                    <button onClick={() => setActiveModal("pagos")} className="bg-white p-5 rounded-2xl shadow-sm hover:shadow-md transition text-center group">
                        <div className="text-3xl mb-2 group-hover:scale-110 transition">💳</div>
                        <div className="font-bold text-slate-700 text-sm">Mis Pagos</div>
                        <div className="text-[10px] text-slate-400 font-bold mt-1">{pagos.length} factura(s)</div>
                    </button>
                    <button onClick={() => setActiveModal("tratamiento")} className="bg-white p-5 rounded-2xl shadow-sm hover:shadow-md transition text-center group">
                        <div className="text-3xl mb-2 group-hover:scale-110 transition">🦷</div>
                        <div className="font-bold text-slate-700 text-sm">Tratamiento</div>
                        <div className="text-[10px] text-slate-400 font-bold mt-1">{planes.length} plan(es)</div>
                    </button>
                    <button onClick={() => setActiveModal("soporte")} className="bg-white p-5 rounded-2xl shadow-sm hover:shadow-md transition text-center group">
                        <div className="text-3xl mb-2 group-hover:scale-110 transition">💬</div>
                        <div className="font-bold text-slate-700 text-sm">Soporte</div>
                        <div className="text-[10px] text-green-500 font-bold mt-1">WhatsApp</div>
                    </button>
                </div>

                {/* Historial de citas */}
                {todasCitas.length > 0 && (
                    <div className="bg-white rounded-2xl shadow-sm p-5">
                        <h3 className="text-xs font-black text-slate-600 uppercase tracking-widest mb-3">Historial de Visitas</h3>
                        <div className="space-y-2 max-h-52 overflow-y-auto">
                            {todasCitas.slice(0, 8).map(c => (
                                <div key={c.id} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                                    <div>
                                        <p className="text-xs font-bold text-slate-700">{c.fecha} {c.hora && `• ${c.hora}`}</p>
                                        <p className="text-[10px] text-slate-400">{c.motivo || c.title || "Consulta"}</p>
                                    </div>
                                    <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wide ${
                                        ["atendida","completada"].includes((c.estado||"").toLowerCase()) ? "bg-emerald-100 text-emerald-700" :
                                        (c.estado||"").toLowerCase() === "cancelada" ? "bg-rose-100 text-rose-700" :
                                        "bg-amber-100 text-amber-700"
                                    }`}>{c.estado || "Pendiente"}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="bg-gradient-to-r from-purple-500 to-indigo-600 p-5 rounded-2xl shadow-lg text-white text-center">
                    <p className="font-bold text-base mb-1">😊 ¡Gracias por confiar en nosotros!</p>
                    <p className="text-white/80 text-xs">Recuerda cepillarte 3 veces al día y usar hilo dental.</p>
                </div>
            </div>

            {/* ── MODAL: Nueva Cita ─────────────────────────────────────────── */}
            {activeModal === "cita" && (
                <PortalModal title="Solicitar Cita" icon={FiCalendar} color="bg-indigo-600 text-white" onClose={() => setActiveModal(null)}>
                    {citaEnviada ? (
                        <div className="text-center py-6 space-y-4">
                            <div className="text-5xl">✅</div>
                            <p className="font-bold text-slate-800 text-lg">¡Solicitud enviada!</p>
                            <p className="text-slate-500 text-sm">Te hemos redirigido a WhatsApp. La clínica confirmará tu cita pronto.</p>
                            <button onClick={() => setActiveModal(null)} className="w-full py-3 bg-indigo-600 text-white rounded-xl font-black text-sm uppercase tracking-widest">Cerrar</button>
                        </div>
                    ) : (
                        <form onSubmit={handleSolicitarCita} className="space-y-4">
                            <p className="text-xs text-slate-500">Completa el formulario y te redirigiremos a WhatsApp con tu solicitud lista para enviar.</p>
                            <div>
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">Fecha preferida</label>
                                <input type="date" min={new Date().toISOString().slice(0,10)} required value={nuevaCitaForm.fecha} onChange={e => setNuevaCitaForm(f => ({...f, fecha: e.target.value}))} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-400 font-semibold text-sm text-slate-800" />
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">Motivo de consulta</label>
                                <input type="text" placeholder="Ej: Dolor muela, limpieza, revisión..." value={nuevaCitaForm.motivo} onChange={e => setNuevaCitaForm(f => ({...f, motivo: e.target.value}))} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-400 font-semibold text-sm text-slate-800" />
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">Tu celular</label>
                                <input type="tel" value={nuevaCitaForm.celular} onChange={e => setNuevaCitaForm(f => ({...f, celular: e.target.value}))} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-400 font-semibold text-sm text-slate-800" placeholder="3001234567" />
                            </div>
                            <button type="submit" className="w-full py-3.5 bg-green-500 hover:bg-green-600 text-white rounded-xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2">
                                <FiMessageCircle /> Enviar por WhatsApp
                            </button>
                        </form>
                    )}
                </PortalModal>
            )}

            {/* ── MODAL: Mis Pagos ──────────────────────────────────────────── */}
            {activeModal === "pagos" && (
                <PortalModal title="Mis Pagos" icon={FiDollarSign} color="bg-emerald-600 text-white" onClose={() => setActiveModal(null)}>
                    {loadingData ? <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-14 bg-slate-100 rounded-xl animate-pulse" />)}</div>
                    : pagos.length === 0 ? <p className="text-slate-400 text-sm italic text-center py-8">No hay facturas registradas.</p>
                    : (
                        <div className="space-y-3">
                            <div className="grid grid-cols-2 gap-3 mb-4">
                                <div className="bg-emerald-50 rounded-xl p-3 text-center"><p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">Pagado</p><p className="font-black text-emerald-700">${totalPagado.toLocaleString("es-CO")}</p></div>
                                <div className="bg-rose-50 rounded-xl p-3 text-center"><p className="text-[9px] font-black text-rose-600 uppercase tracking-widest">Pendiente</p><p className="font-black text-rose-700">${totalPendiente.toLocaleString("es-CO")}</p></div>
                            </div>
                            {pagos.map(p => (
                                <div key={p.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                                    <div><p className="text-xs font-black text-slate-700">{p.idFactura || p.id?.slice(-6)}</p><p className="text-[10px] text-slate-400">{p.descripcion || "Factura médica"}</p></div>
                                    <div className="text-right"><p className="text-xs font-black text-slate-700">${Number(p.monto||0).toLocaleString("es-CO")}</p><span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${p.estado === "Pagada" ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}>{p.estado || "Pendiente"}</span></div>
                                </div>
                            ))}
                        </div>
                    )}
                </PortalModal>
            )}

            {/* ── MODAL: Tratamiento ───────────────────────────────────────── */}
            {activeModal === "tratamiento" && (
                <PortalModal title="Mi Tratamiento" icon={FiActivity} color="bg-purple-600 text-white" onClose={() => setActiveModal(null)}>
                    {loadingData ? <div className="space-y-3">{[1,2].map(i => <div key={i} className="h-20 bg-slate-100 rounded-xl animate-pulse" />)}</div>
                    : planes.length === 0 ? <p className="text-slate-400 text-sm italic text-center py-8">No hay planes de tratamiento registrados.</p>
                    : (
                        <div className="space-y-4">
                            {planes.map(plan => {
                                const items = plan.items || [];
                                const completados = items.filter(it => it.done || it.completado).length;
                                const pct = items.length > 0 ? Math.round((completados / items.length) * 100) : 0;
                                return (
                                    <div key={plan.id} className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                                        <div className="flex items-center justify-between mb-2">
                                            <p className="text-sm font-black text-slate-800">{plan.title || plan.nombre || "Plan de Tratamiento"}</p>
                                            <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase ${plan.status === "completed" || plan.status === "completado" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>{plan.status || "Activo"}</span>
                                        </div>
                                        {items.length > 0 && (
                                            <>
                                                <div className="flex justify-between text-[10px] font-bold text-slate-500 mb-1">
                                                    <span>{completados}/{items.length} procedimientos</span>
                                                    <span>{pct}% completado</span>
                                                </div>
                                                <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                                                    <div className="h-full bg-purple-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
                                                </div>
                                                <div className="mt-3 space-y-1">
                                                    {items.map((it, idx) => (
                                                        <div key={idx} className="flex items-center gap-2 text-xs">
                                                            <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] shrink-0 ${it.done || it.completado ? "bg-emerald-100 text-emerald-600" : "bg-slate-200 text-slate-400"}`}>{it.done || it.completado ? "✓" : idx+1}</span>
                                                            <span className={`font-semibold ${it.done || it.completado ? "line-through text-slate-400" : "text-slate-700"}`}>{it.desc || it.nombre || "Procedimiento"}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </>
                                        )}
                                        {plan.total && <p className="text-xs font-black text-emerald-600 mt-3">Total: ${Number(plan.total).toLocaleString("es-CO")}</p>}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </PortalModal>
            )}

            {/* ── MODAL: Soporte ───────────────────────────────────────────── */}
            {activeModal === "soporte" && (
                <PortalModal title="Contactar Clínica" icon={FiMessageCircle} color="bg-green-600 text-white" onClose={() => setActiveModal(null)}>
                    <div className="space-y-4">
                        <p className="text-sm text-slate-600">¿Tienes alguna pregunta o necesitas ayuda? Contáctanos directamente.</p>
                        {config.phone && (
                            <a href={`tel:${config.phone}`} className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:bg-slate-100 transition-colors">
                                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center"><FiPhone className="text-blue-600" size={18} /></div>
                                <div><p className="text-xs font-black text-slate-700 uppercase tracking-widest">Llamar</p><p className="text-sm font-semibold text-blue-600">{config.phone}</p></div>
                            </a>
                        )}
                        {config.phone && (
                            <a href={`https://wa.me/${config.phone.replace(/\D/g,"")}?text=Hola, soy ${encodeURIComponent(user.nombreCompleto || user.nombres || "paciente")}, necesito ayuda.`}
                               target="_blank" rel="noopener noreferrer"
                               className="flex items-center gap-3 p-4 bg-green-50 rounded-2xl border border-green-100 hover:bg-green-100 transition-colors">
                                <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center"><FiMessageCircle className="text-green-600" size={18} /></div>
                                <div><p className="text-xs font-black text-green-700 uppercase tracking-widest">WhatsApp</p><p className="text-sm font-semibold text-green-700">Enviar mensaje</p></div>
                            </a>
                        )}
                        {config.email && (
                            <a href={`mailto:${config.email}?subject=Consulta paciente ${user.nombreCompleto || ""}`}
                               className="flex items-center gap-3 p-4 bg-indigo-50 rounded-2xl border border-indigo-100 hover:bg-indigo-100 transition-colors">
                                <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center"><span className="text-indigo-600 text-lg">✉️</span></div>
                                <div><p className="text-xs font-black text-indigo-700 uppercase tracking-widest">Correo</p><p className="text-sm font-semibold text-indigo-700">{config.email}</p></div>
                            </a>
                        )}
                        {!config.phone && !config.email && (
                            <p className="text-slate-400 text-sm italic text-center py-4">La clínica no ha configurado datos de contacto aún.</p>
                        )}
                    </div>
                </PortalModal>
            )}
        </div>
    );
}
