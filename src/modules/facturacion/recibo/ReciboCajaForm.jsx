import React, { useState, useEffect, useMemo, useRef } from "react";
import { FiSave, FiX, FiPlus, FiTrash2, FiSearch, FiUser, FiBriefcase, FiDollarSign, FiAlertCircle, FiCheckCircle, FiCalendar } from "react-icons/fi";
import { useNavigate, useParams } from "react-router-dom";
import { db } from "../../../firebase/firebaseConfig";
import { 
    collection, addDoc, doc, updateDoc, getDoc, getDocs, 
    query, where, serverTimestamp, increment, Timestamp 
} from "firebase/firestore";
import { useAuth } from "../../../context/AuthContext";

/* --- Formatting Helpers --- */
const fmt = (n) =>
  Number(n || 0).toLocaleString("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  });

export default function ReciboCajaForm({ onCancel, onSuccess }) {
    const navigate = useNavigate();
    const { id } = useParams();
    const { userProfile } = useAuth();
    const inquilino = userProfile?.inquilino || "";

    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    // Form State
    const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
    const [profesional, setProfesional] = useState({ id: "", nombre: "" });
    const [paciente, setPaciente] = useState(null);
    const [condicionPago, setCondicionPago] = useState("Efectivo");
    const [conceptos, setConceptos] = useState([
        { id: Date.now(), concepto: "", descripcion: "", precioUnitario: 0, cantidad: 1, descuento: 0, total: 0 }
    ]);
    const [observaciones, setObservaciones] = useState("");
    const [retenciones, setRetenciones] = useState({ impuesto: "", base: 0 });

    // Lookups
    const [profesionales, setProfesionales] = useState([]);
    const [pacientes, setPacientes] = useState([]);
    const [activeCaja, setActiveCaja] = useState(null);
    const [priceList, setPriceList] = useState([]);
    const [tratamientosPendientes, setTratamientosPendientes] = useState([]);
    const [loadingTratamientos, setLoadingTratamientos] = useState(false);

    // Search UI
    const [pacientSearch, setPacientSearch] = useState("");
    const [showPacientDrop, setShowPacientDrop] = useState(false);
    const pacientRef = useRef(null);

    /* --- Data Loading --- */
    useEffect(() => {
        if (!inquilino) return;

        const loadBasics = async () => {
            setLoading(true);
            try {
                // 1. Professionals
                const pSnap = await getDocs(query(collection(db, "profesionales"), where("inquilino", "==", inquilino)));
                setProfesionales(pSnap.docs.map(d => ({ 
                    id: d.id, 
                    nombre: d.data().nombreCompleto || d.data().nombre 
                })));

                // 2. Patients (Basic list for search)
                const pacSnap = await getDocs(query(collection(db, "pacientes"), where("inquilino", "==", inquilino)));
                setPacientes(pacSnap.docs.map(d => ({ 
                    id: d.id, 
                    nombre: d.data().nombreCompleto || `${d.data().nombres || ""} ${d.data().apellidos || ""}`.trim(),
                    cedula: d.data().nroDocumento || d.data().cedula || ""
                })));

                // 3. Active Caja
                const cSnap = await getDocs(query(
                    collection(db, "cajas"), 
                    where("inquilino", "==", inquilino),
                    where("estado", "==", "abierta"),
                    where("usuarioId", "==", userProfile?.uid)
                ));
                if (!cSnap.empty) {
                    setActiveCaja({ id: cSnap.docs[0].id, ...cSnap.docs[0].data() });
                }

                // 4. Price List
                const prSnap = await getDocs(query(collection(db, "config_precios"), where("inquilino", "==", inquilino)));
                setPriceList(prSnap.docs.map(d => ({ id: d.id, ...d.data() })));

            } catch (e) {
                console.error("Error loading form basics:", e);
            } finally {
                setLoading(false);
            }
        };

        loadBasics();
    }, [inquilino, userProfile?.uid]);

    /* --- Load Patient Treatments --- */
    useEffect(() => {
        if (!paciente?.id) {
            setTratamientosPendientes([]);
            return;
        }

        const loadTratamientos = async () => {
            setLoadingTratamientos(true);
            try {
                // Consulta simplificada para evitar errores de índice
                const q = query(
                    collection(db, "pacientes", paciente.id, "tratamientos_pendientes")
                );
                const snap = await getDocs(q);
                // Filtrar manualmente en memoria
                const all = snap.docs.map(d => ({ id: d.id, ...d.data() }));
                const pending = all.filter(x => x.estado === "Pendiente" || !x.pagado);
                setTratamientosPendientes(pending);
            } catch (e) {
                console.error("Error loading treatments:", e);
            } finally {
                setLoadingTratamientos(false);
            }
        };

        loadTratamientos();
    }, [paciente?.id]);

    const importTratamiento = (t) => {
        // Try to find price in catalog
        const match = priceList.find(p => 
            p.nombre.toLowerCase().includes(t.tratamiento.toLowerCase())
        );

        const newConcept = {
            id: Date.now(),
            concepto: `${t.tratamiento} (Diente ${t.diente} - ${t.zona})`,
            descripcion: `Odontograma ref: ${t.odontogramaId?.slice(0,5)}`,
            precioUnitario: match ? match.precio : 0,
            cantidad: 1,
            descuento: 0,
            total: match ? match.precio : 0,
            tratamientoPendienteId: t.id
        };

        // If first concept is empty, replace it
        if (conceptos.length === 1 && !conceptos[0].concepto && conceptos[0].precioUnitario === 0) {
            setConceptos([newConcept]);
        } else {
            setConceptos([...conceptos, newConcept]);
        }

        // Remove from pending list locally
        setTratamientosPendientes(prev => prev.filter(x => x.id !== t.id));
    };

    /* --- Calculation Logic --- */
    const totals = useMemo(() => {
        const subtotal = conceptos.reduce((acc, c) => acc + (c.precioUnitario * c.cantidad), 0);
        const descuento = conceptos.reduce((acc, c) => acc + (Number(c.descuento) || 0), 0);
        return { subtotal, descuento, total: subtotal - descuento };
    }, [conceptos]);

    const handleConceptChange = (id, field, value) => {
        setConceptos(prev => prev.map(c => {
            if (c.id !== id) return c;
            const updated = { ...c, [field]: value };
            updated.total = (updated.precioUnitario * updated.cantidad) - (Number(updated.descuento) || 0);
            return updated;
        }));
    };

    const addConcept = () => {
        setConceptos([...conceptos, { id: Date.now(), concepto: "", descripcion: "", precioUnitario: 0, cantidad: 1, descuento: 0, total: 0 }]);
    };

    const removeConcept = (id) => {
        if (conceptos.length === 1) return;
        setConceptos(conceptos.filter(c => c.id !== id));
    };

    /* --- Search UI Logic --- */
    useEffect(() => {
        const h = (e) => { if (pacientRef.current && !pacientRef.current.contains(e.target)) setShowPacientDrop(false); };
        document.addEventListener("mousedown", h);
        return () => document.removeEventListener("mousedown", h);
    }, []);

    const filteredPatients = pacientes.filter(p => 
        p.nombre.toLowerCase().includes(pacientSearch.toLowerCase()) || 
        p.cedula.toLowerCase().includes(pacientSearch.toLowerCase())
    ).slice(0, 6);

    /* --- Submission --- */
    const handleSubmit = async () => {
        if (!paciente) return setError("Debes seleccionar un paciente.");
        if (conceptos.some(c => !c.concepto || c.precioUnitario <= 0)) return setError("Revisa los conceptos y precios.");
        if (condicionPago === "Efectivo" && !activeCaja) return setError("No tienes una caja abierta para registrar el efectivo.");

        setSaving(true);
        setError("");

        try {
            const reciboData = {
                inquilino,
                fecha: Timestamp.fromDate(new Date(fecha + "T00:00:00")),
                profesionalId: profesional.id,
                profesionalNombre: profesional.nombre,
                pacienteId: paciente.id,
                pacienteNombre: paciente.nombre,
                condicionPago,
                conceptos,
                retenciones,
                subtotal: totals.subtotal,
                descuentoTotal: totals.descuento,
                total: totals.total,
                observaciones,
                cajaId: condicionPago === "Efectivo" ? activeCaja.id : null,
                creadoPor: `${userProfile?.nombre || userProfile?.email} - ${userProfile?.profileName || "Administrativo"}`,
                createdAt: serverTimestamp()
            };

            // 1. Guardar Recibo
            const docRef = await addDoc(collection(db, "recibos_caja"), reciboData);

            // 2. Sincronizar con Caja si es Efectivo
            if (condicionPago === "Efectivo" && activeCaja) {
                const movData = {
                    inquilino,
                    tipo: "ingreso",
                    concepto: "Recibo de Caja #" + docRef.id.slice(0,6).toUpperCase(),
                    monto: totals.total,
                    metodoPago: "Efectivo",
                    descripcion: `Cobro a ${paciente.nombre}. Conceptos: ${conceptos.map(c => c.concepto).join(", ")}`,
                    pacienteId: paciente.id,
                    pacienteNombre: paciente.nombre,
                    reciboId: docRef.id,
                    usuarioId: userProfile?.uid,
                    usuarioNombre: userProfile?.nombre || userProfile?.email,
                    fecha: serverTimestamp(),
                };

                // Add movement
                await addDoc(collection(db, "cajas", activeCaja.id, "movimientos"), movData);

                // Update Caja Balance
                await updateDoc(doc(db, "cajas", activeCaja.id), {
                    saldoActual: increment(totals.total),
                    totalIngresos: increment(totals.total)
                });
            }

            setSuccess(true);
            setTimeout(() => onSuccess ? onSuccess() : navigate("/dashboard/facturacion/recibo"), 1500);

        } catch (e) {
            console.error("Error al guardar recibo:", e);
            setError("Error crítico al guardar. Intenta de nuevo.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center h-screen bg-slate-50">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
            <span className="text-[13px] font-black text-slate-400 uppercase tracking-widest">Iniciando terminal financiera...</span>
        </div>
    );

    return (
        <div className="p-4 md:p-6 max-w-[1400px] mx-auto space-y-5 animate-in fade-in duration-500">
            {/* ELITE HEADER FORM */}
            <div className="bg-white p-6 rounded-[28px] border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 transition-all">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center text-xl shadow-sm border border-blue-100">
                        <FiDollarSign />
                    </div>
                    <div className="space-y-1">
                        <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight leading-none">
                            {id ? "Editar" : "Nuevo"} <span className="text-blue-600">Recibo de Caja</span>
                        </h2>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button 
                        onClick={onCancel || (() => navigate(-1))}
                        className="h-11 px-6 flex items-center gap-2 bg-slate-50 text-slate-500 rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-slate-100 transition-all border border-slate-100"
                    >
                        <FiX /> Cancelar
                    </button>
                    <button 
                        onClick={handleSubmit}
                        disabled={saving}
                        className="h-11 px-8 flex items-center gap-3 bg-blue-600 text-white rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-blue-700 shadow-lg shadow-blue-500/20 transition-all active:scale-95 disabled:opacity-50"
                    >
                        {saving ? "Procesando..." : <><FiSave size={16} /> Guardar Recibo</>}
                    </button>
                </div>
            </div>

            {success && (
                <div className="bg-emerald-50 border border-emerald-100 p-6 rounded-[24px] flex items-center gap-4 animate-in zoom-in">
                    <div className="w-12 h-12 bg-emerald-500 text-white rounded-full flex items-center justify-center text-xl shadow-lg shadow-emerald-500/20">
                        <FiCheckCircle />
                    </div>
                    <div>
                        <h4 className="text-emerald-800 font-black uppercase text-sm">¡Recibo Guardado!</h4>
                        <p className="text-emerald-600 text-xs font-medium uppercase tracking-wide">El ingreso ha sido sincronizado correctamente.</p>
                    </div>
                </div>
            )}

            {error && (
                <div className="bg-rose-50 border border-rose-100 p-6 rounded-[24px] flex items-center gap-4 animate-in shake">
                    <div className="w-12 h-12 bg-rose-500 text-white rounded-full flex items-center justify-center text-xl shadow-lg shadow-rose-500/20">
                        <FiAlertCircle />
                    </div>
                    <div>
                        <h4 className="text-rose-800 font-black uppercase text-sm">Error de Validación</h4>
                        <p className="text-rose-600 text-xs font-medium uppercase tracking-wide">{error}</p>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                {/* LEFT COLUMN: BASIC DATA */}
                <div className="lg:col-span-2 space-y-5">
                    {/* CARD: GENERAL & TERCERO */}
                    <div className="bg-white p-6 rounded-[28px] border border-slate-100 shadow-sm space-y-8">
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-0.5 h-3 bg-blue-600 rounded-full" />
                                <h4 className="text-[10px] font-black text-slate-800 uppercase tracking-widest">Datos Generales</h4>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Fecha Emisión</label>
                                    <div className="relative">
                                        <FiCalendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <input 
                                            type="date"
                                            className="w-full h-11 pl-12 pr-4 bg-slate-50 border border-slate-100 rounded-xl text-[13px] font-bold text-slate-700 outline-none focus:bg-white focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 transition-all"
                                            value={fecha}
                                            onChange={e => setFecha(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Profesional / Especialista</label>
                                    <div className="relative">
                                        <FiBriefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <select 
                                            className="w-full h-11 pl-12 pr-4 bg-slate-50 border border-slate-100 rounded-xl text-[13px] font-bold text-slate-700 outline-none focus:bg-white focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 transition-all appearance-none"
                                            value={profesional.id}
                                            onChange={e => {
                                                const p = profesionales.find(x => x.id === e.target.value);
                                                setProfesional({ id: e.target.value, nombre: p?.nombre || "" });
                                            }}
                                        >
                                            <option value="">Selecciona responsable</option>
                                            {profesionales.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4 pt-4 border-t border-slate-50">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-0.5 h-3 bg-blue-600 rounded-full" />
                                <h4 className="text-[10px] font-black text-slate-800 uppercase tracking-widest">Datos Tercero</h4>
                            </div>
                            <div className="space-y-2" ref={pacientRef}>
                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Tercero / Paciente (Pagador)</label>
                                <div className="relative">
                                    <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                    {paciente ? (
                                        <div className="w-full h-11 pl-12 pr-4 bg-blue-50 border border-blue-100 rounded-xl flex items-center justify-between">
                                            <span className="text-[13px] font-bold text-blue-700 uppercase tracking-tight">{paciente.nombre} <span className="text-blue-400 font-bold ml-2">CC: {paciente.cedula}</span></span>
                                            <button onClick={() => setPaciente(null)} className="w-7 h-7 rounded-lg bg-white text-blue-600 flex items-center justify-center shadow-sm hover:text-rose-500">
                                                <FiTrash2 size={12} />
                                            </button>
                                        </div>
                                    ) : (
                                        <>
                                            <input 
                                                type="text" 
                                                placeholder="Buscar por nombre o documento..."
                                                className="w-full h-11 pl-12 pr-4 bg-slate-50 border border-slate-100 rounded-xl text-[13px] font-bold text-slate-700 outline-none focus:bg-white focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 transition-all font-medium"
                                                value={pacientSearch}
                                                onChange={e => { setPacientSearch(e.target.value); setShowPacientDrop(true); }}
                                                onFocus={() => setShowPacientDrop(true)}
                                            />
                                            {showPacientDrop && pacientSearch.length >= 2 && (
                                                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-100 rounded-2xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
                                                    {filteredPatients.length === 0 ? (
                                                        <div className="p-4 text-xs font-bold text-slate-400 uppercase text-center tracking-widest">Sin resultados</div>
                                                    ) : filteredPatients.map(p => (
                                                        <button 
                                                            key={p.id}
                                                            onClick={() => { setPaciente(p); setShowPacientDrop(false); setPacientSearch(""); }}
                                                            className="w-full p-4 hover:bg-blue-50 text-left flex flex-col transition-colors border-b last:border-0 border-slate-50"
                                                        >
                                                            <span className="text-[13px] font-black text-slate-800 uppercase tracking-tight">{p.nombre}</span>
                                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">CC: {p.cedula}</span>
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-slate-50 space-y-1.5">
                             <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Condición de pago</label>
                             <select 
                                 className="w-full h-11 pl-4 pr-4 bg-slate-50 border border-slate-100 rounded-xl text-[13px] font-bold text-slate-700 outline-none focus:bg-white transition-all appearance-none cursor-pointer"
                                 value={condicionPago}
                                 onChange={e => setCondicionPago(e.target.value)}
                             >
                                 {["Efectivo", "Transferencia", "Tarjeta", "Otros"].map(m => (
                                     <option key={m} value={m}>{m}</option>
                                 ))}
                             </select>
                        </div>
                    </div>

                    {/* NUEVA SECCIÓN: PENDIENTES DEL ODONTOGRAMA */}
                    {paciente && tratamientosPendientes.length > 0 && (
                        <div className="bg-blue-50/50 p-6 rounded-[28px] border border-blue-100 shadow-sm space-y-4 animate-in slide-in-from-left duration-500">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                                    <h4 className="text-[11px] font-black text-blue-800 uppercase tracking-widest">Pendientes del Odontograma</h4>
                                </div>
                                <span className="text-[9px] font-black bg-blue-600 text-white px-2 py-0.5 rounded-full">
                                    {tratamientosPendientes.length} ÍTEMS
                                </span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {tratamientosPendientes.map(t => (
                                    <button 
                                        key={t.id}
                                        type="button"
                                        onClick={() => importTratamiento(t)}
                                        className="p-3 bg-white border border-blue-100 rounded-xl flex items-center gap-3 hover:border-blue-500 hover:shadow-md transition-all text-left group"
                                    >
                                        <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center text-[10px] font-black shrink-0 group-hover:bg-blue-600 group-hover:text-white">
                                            {t.diente}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-[11px] font-black text-slate-800 truncate uppercase">{t.tratamiento}</p>
                                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">{t.zona}</p>
                                        </div>
                                        <FiPlus className="text-blue-400 group-hover:text-blue-600" />
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* CARD: CONCEPTS TABLE */}
                    <div className="bg-white rounded-[28px] border border-slate-100 shadow-sm overflow-hidden flex flex-col">
                        <div className="p-6 border-b border-slate-50 flex items-center justify-between">
                            <h3 className="text-[12px] font-black text-slate-800 uppercase tracking-widest">Detalle de Conceptos</h3>
                            <button 
                                onClick={addConcept}
                                className="h-9 px-4 bg-slate-900 text-white rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-slate-800 transition-all font-bold"
                            >
                                <FiPlus /> Nuevo Concepto
                            </button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-slate-50/50">
                                    <tr>
                                        <th className="p-3 text-[9px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pl-6 text-left">Concepto</th>
                                        <th className="p-3 text-[9px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 w-20">Cant.</th>
                                        <th className="p-3 text-[9px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 text-right">Precio Unid.</th>
                                        <th className="p-3 text-[9px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 text-right">Descto.</th>
                                        <th className="p-3 text-[9px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 text-right pr-6">Total</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {conceptos.map(c => (
                                        <tr key={c.id} className="group hover:bg-slate-50/30 transition-all">
                                            <td className="p-3 pl-6">
                                                <div className="flex flex-col gap-1.5">
                                                    <select 
                                                        className="w-full h-7 bg-slate-50 border border-slate-100 rounded-lg px-2 text-[9px] font-black text-blue-600 outline-none focus:bg-white focus:border-blue-500 transition-all appearance-none cursor-pointer"
                                                        value=""
                                                        onChange={e => {
                                                            const item = priceList.find(p => p.id === e.target.value);
                                                            if (item) {
                                                                handleConceptChange(c.id, "concepto", item.nombre);
                                                                handleConceptChange(c.id, "precioUnitario", item.precio || 0);
                                                            }
                                                        }}
                                                    >
                                                        <option value="">+ LISTA DE PRECIOS</option>
                                                        {priceList.map(p => <option key={p.id} value={p.id}>{p.nombre} ({fmt(p.precio)})</option>)}
                                                    </select>
                                                    <input 
                                                        type="text" 
                                                        placeholder="Ej: Pago de Tratamiento"
                                                        className="w-full h-8 bg-transparent border-none text-[12px] font-bold text-slate-800 outline-none placeholder:text-slate-300"
                                                        value={c.concepto}
                                                        onChange={e => handleConceptChange(c.id, "concepto", e.target.value)}
                                                    />
                                                </div>
                                                <input 
                                                    type="text" 
                                                    placeholder="Descripción adicional..."
                                                    className="w-full h-6 bg-transparent border-none text-[10px] font-medium text-slate-400 outline-none"
                                                    value={c.descripcion}
                                                    onChange={e => handleConceptChange(c.id, "descripcion", e.target.value)}
                                                />
                                            </td>
                                            <td className="p-3">
                                                <input 
                                                    type="number" 
                                                    className="w-full h-9 bg-slate-50 border border-slate-100 rounded-lg text-center text-[12px] font-bold text-slate-700 outline-none focus:bg-white focus:border-blue-500 transition-all"
                                                    value={c.cantidad}
                                                    onChange={e => handleConceptChange(c.id, "cantidad", Number(e.target.value))}
                                                />
                                            </td>
                                            <td className="p-3">
                                                <input 
                                                    type="number" 
                                                    className="w-full h-9 bg-white border border-slate-100 rounded-lg text-right px-3 text-[12px] font-bold text-slate-700 outline-none focus:ring-4 focus:ring-blue-500/5 transition-all font-mono"
                                                    value={c.precioUnitario}
                                                    onChange={e => handleConceptChange(c.id, "precioUnitario", Number(e.target.value))}
                                                />
                                            </td>
                                            <td className="p-3">
                                                <input 
                                                    type="number" 
                                                    className="w-full h-9 bg-white border border-slate-100 rounded-lg text-right px-3 text-[12px] font-bold text-rose-500 outline-none focus:ring-4 focus:ring-rose-500/5 transition-all font-mono"
                                                    value={c.descuento}
                                                    onChange={e => handleConceptChange(c.id, "descuento", Number(e.target.value))}
                                                />
                                            </td>
                                            <td className="p-3 pr-6 text-right relative">
                                                <span className="text-[13px] font-bold text-slate-900 font-mono">{fmt(c.total)}</span>
                                                <button 
                                                    onClick={() => removeConcept(c.id)}
                                                    className="absolute -right-1 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-rose-50 text-rose-500 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center hover:bg-rose-500 hover:text-white shadow-sm"
                                                >
                                                    <FiTrash2 size={10} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* RIGHT COLUMN: RECAP & PAYMENT */}
                <div className="space-y-5">
                    {/* CARD: METODO PAGO */}
                    <div className="bg-white p-6 rounded-[28px] border border-slate-100 shadow-sm space-y-3">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Método de Pago</label>
                        <div className="grid grid-cols-1 gap-1.5">
                            {["Efectivo", "Transferencia", "Tarjeta", "Otros"].map(m => (
                                <button 
                                    key={m}
                                    type="button"
                                    onClick={() => setCondicionPago(m)}
                                    className={`h-11 px-5 rounded-xl flex items-center justify-between transition-all border ${
                                        condicionPago === m 
                                        ? "bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-500/20" 
                                        : "bg-slate-50 border-slate-100 text-slate-500 hover:bg-white hover:border-slate-300"
                                    }`}
                                >
                                    <span className="text-[10px] font-black uppercase tracking-widest">{m}</span>
                                    {condicionPago === m && <FiCheckCircle size={14} />}
                                </button>
                            ))}
                        </div>

                        {condicionPago === "Efectivo" && (
                            <div className={`mt-3 p-3 rounded-xl border transition-all ${
                                activeCaja 
                                ? "bg-emerald-50 border-emerald-100 text-emerald-700" 
                                : "bg-rose-50 border-rose-100 text-rose-700"
                            }`}>
                                <div className="flex items-center gap-2.5">
                                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${activeCaja ? 'bg-emerald-500' : 'bg-rose-500'} text-white shadow-sm`}>
                                        <FiBriefcase size={12} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[8px] font-black uppercase opacity-60">Estado de Caja</p>
                                        <p className="text-[9px] font-black uppercase tracking-tight truncate">
                                            {activeCaja ? `Sincronizada (${fmt(activeCaja.saldoActual)})` : "No hay caja abierta"}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* CARD: RETENCIONES */}
                    <div className="bg-white p-6 rounded-[28px] border border-slate-100 shadow-sm space-y-4">
                        <div className="flex items-center gap-3 mb-1">
                            <div className="w-0.5 h-3 bg-orange-500 rounded-full" />
                            <h4 className="text-[10px] font-black text-slate-800 uppercase tracking-widest">Retenciones</h4>
                        </div>
                        <div className="space-y-3">
                            <div className="space-y-1.5">
                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Impuesto</label>
                                <select 
                                    className="w-full h-10 px-3 bg-slate-50 border border-slate-100 rounded-lg text-[11px] font-bold text-slate-700 outline-none focus:bg-white transition-all appearance-none cursor-pointer"
                                    value={retenciones.impuesto}
                                    onChange={e => setRetenciones({ ...retenciones, impuesto: e.target.value })}
                                >
                                    <option value="">Seleccione...</option>
                                    <option value="IVA">IVA</option>
                                    <option value="ReteFuente">ReteFuente</option>
                                    <option value="ICA">ICA</option>
                                </select>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Base</label>
                                <input 
                                    type="number"
                                    className="w-full h-10 px-3 bg-slate-50 border border-slate-100 rounded-lg text-[11px] font-bold text-slate-700 outline-none focus:bg-white transition-all"
                                    placeholder="0"
                                    value={retenciones.base}
                                    onChange={e => setRetenciones({ ...retenciones, base: Number(e.target.value) })}
                                />
                            </div>
                        </div>
                    </div>

                    {/* CARD: TOTALS */}
                    <div className="bg-slate-900 p-6 rounded-[28px] shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
                            <FiDollarSign size={80} className="text-white" />
                        </div>
                        <div className="relative z-10 space-y-4">
                            <div className="space-y-0.5">
                                <span className="text-[8px] font-black text-blue-400 uppercase tracking-[0.2em]">Subtotal</span>
                                <p className="text-lg font-bold text-white font-mono opacity-60 tracking-tight">{fmt(totals.subtotal)}</p>
                            </div>
                            <div className="space-y-0.5">
                                <span className="text-[8px] font-black text-rose-400 uppercase tracking-[0.2em]">Desctos.</span>
                                <p className="text-lg font-bold text-rose-400 font-mono tracking-tight">- {fmt(totals.descuento)}</p>
                            </div>
                            <div className="pt-4 border-t border-white/10 space-y-0.5">
                                <span className="text-[9px] font-black text-blue-400 uppercase tracking-[0.15em]">Total a Pagar</span>
                                <p className="text-3xl font-black text-white font-mono tracking-tighter">{fmt(totals.total)}</p>
                            </div>
                        </div>
                    </div>

                    {/* CARD: OBSERVACIONES */}
                    <div className="bg-white p-5 rounded-[28px] border border-slate-100 shadow-sm space-y-2.5">
                        <div className="flex items-center gap-3 mb-0.5">
                            <div className="w-0.5 h-3 bg-slate-400 rounded-full" />
                            <h4 className="text-[10px] font-black text-slate-800 uppercase tracking-widest">Notas</h4>
                        </div>
                        <textarea 
                            className="w-full h-24 p-3.5 bg-slate-50 border border-slate-100 rounded-xl text-[11px] font-medium text-slate-600 outline-none focus:bg-white focus:border-blue-500 transition-all resize-none shadow-inner"
                            placeholder="Comentarios adicionales..."
                            value={observaciones}
                            onChange={e => setObservaciones(e.target.value)}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
