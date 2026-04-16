import React, { useState, useEffect } from "react";
// import Button from "../../components/ui/Button"; // Replaced with native button for safety
import { db } from "../../firebase/firebaseConfig";
import { collection, query, where, getDocs, orderBy, limit, Timestamp, doc, getDoc } from "firebase/firestore";
import { useParams, Link, useNavigate } from "react-router-dom";
import { DEFAULT_CONFIG } from "../../constants/DefaultConfig";
import { FiArrowLeft, FiLogOut } from "react-icons/fi";

export default function PatientPortal() {
    const { clinicSlug } = useParams();
    const navigate = useNavigate();
    const [auth, setAuth] = useState(false);
    const [docInput, setDocInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [user, setUser] = useState(null); // Real Firestore Data
    const [nextAppt, setNextAppt] = useState(null); // Upcoming appointment
    const [birthDate, setBirthDate] = useState("");
    const [config, setConfig] = useState(DEFAULT_CONFIG);
    const [loadingConfig, setLoadingConfig] = useState(!!clinicSlug);

    useEffect(() => {
        if (clinicSlug) {
            const loadConfig = async () => {
                try {
                    const q = query(collection(db, "tenants"), where("slug", "==", clinicSlug));
                    const qSnap = await getDocs(q);
                    if (!qSnap.empty) {
                        const tenantData = qSnap.docs[0].data();
                        const inquilino = qSnap.docs[0].id;
                        const webRef = doc(db, "website_config", inquilino);
                        const webSnap = await getDoc(webRef);
                        if (webSnap.exists()) {
                            setConfig({ ...DEFAULT_CONFIG, ...webSnap.data(), name: tenantData.name, slug: clinicSlug });
                        } else {
                            setConfig({ ...DEFAULT_CONFIG, name: tenantData.name, slug: clinicSlug });
                        }
                    }
                } catch (e) {
                    console.error("Error loading portal config:", e);
                } finally {
                    setLoadingConfig(false);
                }
            };
            loadConfig();
        }
    }, [clinicSlug]);

    const handleLogin = async (e) => {
        e.preventDefault();
        if (docInput.length < 5) return alert("Ingrese un documento válido");
        if (!birthDate) return alert("Ingrese su fecha de nacimiento para verificar su identidad.");

        setLoading(true);
        try {
            // 1. Find Patient
            let q = query(collection(db, "pacientes"), where("nroDocumento", "==", docInput));
            let snap = await getDocs(q);

            let patientDoc = null;
            if (!snap.empty) {
                patientDoc = snap.docs[0];
            } else {
                const q2 = query(collection(db, "pacientes"), where("documento", "==", docInput));
                const snap2 = await getDocs(q2);
                if (!snap2.empty) patientDoc = snap2.docs[0];
            }

            if (!patientDoc) {
                alert("No encontramos un paciente con ese documento.");
                setLoading(false);
                return;
            }

            const patientData = { id: patientDoc.id, ...patientDoc.data() };

            // 2. Verify Date of Birth
            if (patientData.nacimiento !== birthDate) {
                alert("❌ La fecha de nacimiento no coincide. Por seguridad, verifique sus datos.");
                setLoading(false);
                return;
            }

            setUser(patientData);
            setAuth(true);

            // 3. Find Upcoming Appointment
            const now = Timestamp.now();
            const qCitas = query(
                collection(db, "citas"),
                where("pacienteId", "==", patientData.id),
                where("start", ">=", now),
                orderBy("start", "asc"),
                limit(1)
            );
            const snapCitas = await getDocs(qCitas);
            if (!snapCitas.empty) {
                const cita = snapCitas.docs[0].data();
                setNextAppt({
                    id: snapCitas.docs[0].id,
                    ...cita,
                    dateObj: cita.start.toDate() // Convert Timestamp to Date
                });
            } else {
                setNextAppt(null);
            }

        } catch (error) {
            console.error(error);
            alert("Error al ingresar: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    if (!auth) {
        return (
            <div className="min-h-screen flex bg-white font-sans">
                {/* Left Side - Image & Brand Aura */}
                <div className="hidden lg:flex w-1/2 bg-slate-900 relative overflow-hidden items-center justify-center">
                    <img
                        src="https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&q=80&w=1600"
                        alt="Smile"
                        className="absolute inset-0 w-full h-full object-cover opacity-50 mix-blend-overlay"
                    />
                    <div className="absolute inset-0 bg-gradient-to-tr from-indigo-900/90 via-indigo-900/40 to-transparent" />

                    <div className="relative z-10 max-w-lg text-center px-12 text-white">
                        <div className="mb-8 flex justify-center">
                            {config?.logo ? (
                                <img src={config.logo} className="h-16 w-auto brightness-0 invert opacity-80" alt="Logo" />
                            ) : (
                                <span className="text-4xl">🦷</span>
                            )}
                        </div>
                        <h1 className="text-5xl font-serif mb-6 leading-tight tracking-tight">
                            {config.name || "Tu Salud Dental"}
                        </h1>
                        <p className="text-indigo-100 text-lg font-light leading-relaxed opacity-90">
                            "{config.vision || config.mission || 'Experiencias odontológicas que transforman vidas.'}"
                        </p>
                    </div>

                    {/* Decorative Elements */}
                    <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-indigo-500 rounded-full blur-3xl opacity-20 animate-pulse"></div>
                    <div className="absolute top-24 right-24 w-64 h-64 bg-teal-500 rounded-full blur-3xl opacity-10"></div>
                </div>

                {/* Right Side - Login Form */}
                <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-24 bg-white relative">
                    {/* Mobile Back Button */}
                    <button
                        onClick={() => navigate(clinicSlug ? `/c/${clinicSlug}` : "/")}
                        className="absolute top-8 left-8 flex items-center gap-2 text-slate-400 hover:text-indigo-600 transition-colors font-medium text-sm"
                    >
                        <FiArrowLeft size={18} /> Volver
                    </button>

                    <div className="w-full max-w-md space-y-10">
                        <div className="text-center lg:text-left space-y-3">
                            <div className="inline-flex items-center justify-center p-4 rounded-3xl bg-indigo-50 text-indigo-600 mb-2 shadow-sm">
                                <span className="text-2xl">🔐</span>
                            </div>
                            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Acceso Pacientes</h2>
                            <p className="text-slate-500 text-lg">Consulta tus citas y tratamientos.</p>
                        </div>

                        <form onSubmit={handleLogin} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Documento de Identidad</label>
                                <input
                                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all outline-none font-semibold text-slate-800 placeholder:font-normal"
                                    placeholder="Número de documento"
                                    value={docInput}
                                    onChange={(e) => setDocInput(e.target.value)}
                                    disabled={loading}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Fecha de Nacimiento</label>
                                <input
                                    type="date"
                                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all outline-none font-semibold text-slate-800"
                                    value={birthDate}
                                    onChange={(e) => setBirthDate(e.target.value)}
                                    disabled={loading}
                                />
                            </div>

                            <button
                                type="submit"
                                className="w-full py-5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold text-lg shadow-xl shadow-indigo-600/20 transition-all transform active:scale-[0.99] hover:-translate-y-1"
                                disabled={loading}
                            >
                                {loading ? "Verificando..." : "Ingresar al Portal"}
                            </button>
                        </form>

                        <div className="text-center pt-4 border-t border-slate-100">
                            <p className="text-xs text-slate-400 uppercase tracking-widest">
                                Áera Segura • {config.name}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 pb-20">
            {/* Header */}
            <div className="bg-indigo-600 text-white p-8 pb-32 rounded-b-[4rem] shadow-2xl relative overflow-hidden">
                {/* Decorative background logo */}
                <div className="absolute top-0 right-0 p-12 opacity-10 text-9xl">
                    {config?.logo ? (
                        <img src={config.logo} alt="" className="w-64 h-64 object-contain brightness-0 invert" />
                    ) : "🦷"}
                </div>

                <div className="relative z-10 flex justify-between items-start">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate(clinicSlug ? `/c/${clinicSlug}` : "/")}
                            className="bg-white/10 p-3 rounded-2xl hover:bg-white/20 transition-all border border-white/10"
                            title="Volver al sitio"
                        >
                            <FiArrowLeft size={20} />
                        </button>
                        <div>
                            <p className="text-indigo-100/60 font-bold text-xs uppercase tracking-widest mb-1">Bienvenido a {config.name}</p>
                            <h1 className="text-3xl font-black tracking-tight leading-tight">{user.nombreCompleto || user.nombres}</h1>
                        </div>
                    </div>

                    <button
                        onClick={() => setAuth(false)}
                        className="flex flex-col items-center gap-1 group"
                    >
                        <div className="bg-white/10 p-3 rounded-2xl group-hover:bg-rose-500/80 transition-all border border-white/10">
                            <FiLogOut size={20} />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest opacity-50">Salir</span>
                    </button>
                </div>
            </div>

            {/* Content Cards */}
            <div className="px-6 -mt-16 relative z-20 space-y-6 max-w-lg mx-auto">

                {/* Next Appointment */}
                <div className="bg-white p-6 rounded-2xl shadow-lg border-l-8 border-indigo-500">
                    <h3 className="text-xs font-bold text-indigo-500 uppercase tracking-wider mb-2">Próxima Visita</h3>
                    {nextAppt ? (
                        <div className="flex items-center gap-4">
                            <div className="bg-indigo-50 p-3 rounded-xl text-center min-w-[60px]">
                                <div className="text-sm font-bold text-indigo-800">
                                    {nextAppt.dateObj.toLocaleString('es-CO', { month: 'short' }).toUpperCase()}
                                </div>
                                <div className="text-2xl font-bold text-indigo-600">
                                    {nextAppt.dateObj.getDate()}
                                </div>
                            </div>
                            <div>
                                <div className="font-bold text-slate-800 text-lg">
                                    {nextAppt.dateObj.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}
                                </div>
                                <div className="text-slate-500 text-sm">{nextAppt.doctorName || "Odontología General"}</div>
                                <div className="text-xs text-slate-400">{nextAppt.title || "Control"}</div>
                            </div>
                        </div>
                    ) : (
                        <div className="text-slate-500 text-sm italic">No tienes citas programadas próximamente.</div>
                    )}
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-2 gap-4">
                    <button onClick={() => alert("Para agendar, por favor contáctanos al WhatsApp por ahora.")} className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition text-center group">
                        <div className="text-4xl mb-2 group-hover:scale-110 transition icon-bounce">📅</div>
                        <div className="font-bold text-slate-700">Nueva Cita</div>
                    </button>
                    <button className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition text-center group">
                        <div className="text-4xl mb-2 group-hover:scale-110 transition icon-pulse">📄</div>
                        <div className="font-bold text-slate-700">Mis Pagos</div>
                    </button>
                    <button className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition text-center group">
                        <div className="text-4xl mb-2 group-hover:scale-110 transition icon-spin">🦷</div>
                        <div className="font-bold text-slate-700">Tratamiento</div>
                    </button>
                    <button className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition text-center group">
                        <div className="text-4xl mb-2 group-hover:scale-110 transition">💬</div>
                        <div className="font-bold text-slate-700">Soporte</div>
                    </button>
                </div>

                {/* Promo/News */}
                <div className="bg-gradient-to-r from-purple-500 to-indigo-600 p-6 rounded-2xl shadow-lg text-white">
                    <h3 className="font-bold text-lg mb-1">¡Sonríe con Confianza!</h3>
                    <p className="text-white/80 text-sm mb-4">Recuerda cepillarte 3 veces al día.</p>
                </div>

            </div>
        </div>
    );
}
