
import React, { useState, useEffect } from "react";
import { FiDownload, FiUpload, FiInfo, FiCheckCircle, FiAlertCircle, FiDatabase, FiUsers, FiBox, FiArchive, FiActivity } from "react-icons/fi";
import { useToast } from "../../context/ToastContext";
import { useAuth } from "../../context/AuthContext";
import { db } from "../../firebase/firebaseConfig";
import { collection, writeBatch, doc, Timestamp } from "firebase/firestore";

// ---------- util XLSX (Same as ListaPreciosEditar) ----------
function ensureXLSX() {
    return new Promise((resolve) => {
        if (typeof window !== "undefined" && window.XLSX) return resolve(window.XLSX);
        const s = document.createElement("script");
        s.src = "https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js";
        s.onload = () => resolve(window.XLSX || null);
        s.onerror = () => resolve(null);
        document.head.appendChild(s);
    });
}

const CARGA_TYPES = [
    {
        id: "pacientes",
        label: "Pacientes",
        description: "Migración masiva de expedientes (Identificación, nombres, contacto y demografía).",
        collection: "pacientes",
        icon: FiUsers,
        color: "text-blue-600",
        bg: "bg-blue-50"
    },
    {
        id: "productos",
        label: "Inventario / Productos",
        description: "Carga de catálogo, códigos de barra, costos y existencias iniciales.",
        collection: "inventario",
        icon: FiBox,
        color: "text-orange-600",
        bg: "bg-orange-50"
    },
    {
        id: "servicios",
        label: "Servicios / Procedimientos",
        description: "Actualización de tablas de honorarios y códigos de procedimientos clínicos.",
        collection: "servicios_clinica",
        icon: FiActivity,
        color: "text-emerald-600",
        bg: "bg-emerald-50"
    },
];

export default function ConfigCargas() {
    const toast = useToast();
    const { userProfile } = useAuth();
    const inquilino = userProfile?.inquilino;

    const [showWarning, setShowWarning] = useState(true);
    const [loading, setLoading] = useState(false);
    const [progress, setProgress] = useState({ current: 0, total: 0 });

    const getHeaders = (type) => {
        switch (type) {
            case "pacientes":
                return ["Documento", "Tipo_Doc", "Nombres", "Apellidos", "Celular", "Email", "Fecha_Nacimiento", "Sexo", "Direccion"];
            case "productos":
                return ["Codigo", "Nombre", "Costo", "Stock_Actual", "Stock_Minimo"];
            case "servicios":
                return ["Codigo", "Nombre", "Precio_Venta", "Categoria"];
            default:
                return ["Columna1", "Columna2"];
        }
    };

    const handleDownload = async (item) => {
        setLoading(true);
        const XLSX = await ensureXLSX();
        if (!XLSX) {
            toast.error("Error al cargar librería Excel");
            setLoading(false);
            return;
        }

        const headers = getHeaders(item.id);
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.aoa_to_sheet([headers]);

        XLSX.utils.book_append_sheet(wb, ws, "Hoja1");
        XLSX.writeFile(wb, `Plantilla_${item.label}.xlsx`);

        toast.success(`Plantilla descargada`);
        setLoading(false);
    };

    const handleUploadClick = (inputId) => {
        document.getElementById(inputId).click();
    };

    const processFile = async (file, item) => {
        if (!inquilino) {
            toast.error("No se identificó el Tenant ID");
            return;
        }

        const XLSX = await ensureXLSX();
        if (!XLSX) return;

        setLoading(true);
        const reader = new FileReader();

        reader.onload = async (e) => {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
                const jsonData = XLSX.utils.sheet_to_json(firstSheet);

                if (jsonData.length === 0) {
                    toast.error("El archivo está vacío");
                    setLoading(false);
                    return;
                }

                if (window.confirm(`¿Está seguro de importar ${jsonData.length} registros a ${item.label}?`)) {
                    await uploadToFirestore(jsonData, item);
                } else {
                    setLoading(false);
                }
            } catch (err) {
                console.error(err);
                toast.error("Error procesando el archivo");
                setLoading(false);
            }
        };

        reader.readAsArrayBuffer(file);
    };

    const uploadToFirestore = async (data, item) => {
        const total = data.length;
        setProgress({ current: 0, total });

        try {
            const BATCH_SIZE = 400;
            let count = 0;

            for (let i = 0; i < total; i += BATCH_SIZE) {
                const batch = writeBatch(db);
                const chunk = data.slice(i, i + BATCH_SIZE);

                chunk.forEach((row) => {
                    const docRef = doc(collection(db, item.collection));

                    let payload = {
                        inquilino,
                        importado: true,
                        createdAt: Timestamp.now()
                    };

                    if (item.id === "pacientes") {
                        payload = {
                            ...payload,
                            nroDocumento: String(row.Documento || ""),
                            tipoDocumento: row.Tipo_Doc || "CC",
                            nombres: String(row.Nombres || "").toUpperCase(),
                            apellidos: String(row.Apellidos || "").toUpperCase(),
                            nombreCompleto: `${row.Nombres || ""} ${row.Apellidos || ""}`.trim().toUpperCase(),
                            celular: String(row.Celular || ""),
                            email: String(row.Email || "").toLowerCase(),
                            sexo: String(row.Sexo || "").toUpperCase(),
                            lugarResidencia: row.Direccion || "",
                            activo: true,
                            facturacion: { saldoFavor: 0 }
                        };
                    } else if (item.id === "productos") {
                        payload = {
                            ...payload,
                            codigo: String(row.Codigo || ""),
                            nombre: String(row.Nombre || "").toUpperCase(),
                            costo: Number(row.Costo || 0),
                            cantidad: Number(row.Stock_Actual || 0),
                            minStock: Number(row.Stock_Minimo || 5)
                        };
                    } else if (item.id === "servicios") {
                        payload = {
                            ...payload,
                            codigo: String(row.Codigo || ""),
                            nombre: String(row.Nombre || "").toUpperCase(),
                            precio: Number(row.Precio_Venta || 0),
                            categoria: String(row.Categoria || "GENERAL").toUpperCase()
                        };
                    }

                    batch.set(docRef, payload);
                });

                await batch.commit();
                count += chunk.length;
                setProgress({ current: count, total });
            }

            toast.success(`¡Importación exitosa! ${total} registros cargados.`);
        } catch (err) {
            console.error(err);
            toast.error("Error durante el cargue a la base de datos");
        } finally {
            setLoading(false);
            setProgress({ current: 0, total: 0 });
        }
    };

    return (
        <div className="space-y-10 p-2 md:p-8 text-left">

            {/* Warning Overlay (The Slender Pro Glassmorphism) */}
            {showWarning && (
                <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-500" />
                    <div className="relative w-full max-w-lg bg-white rounded-[40px] shadow-[0_50px_100px_rgba(0,0,0,0.4)] overflow-hidden border border-white p-12 text-center animate-in zoom-in-95 duration-500">
                        <div className="w-24 h-24 bg-amber-50 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-xl shadow-amber-100/50 group">
                            <FiAlertCircle size={48} className="text-amber-500 group-hover:scale-110 transition-transform duration-500" />
                        </div>
                        <h3 className="text-[28px] font-black text-slate-800 uppercase tracking-tighter mb-4 leading-tight">Control de Integridad</h3>
                        <p className="text-[14px] font-bold text-slate-500 leading-relaxed mb-10 uppercase tracking-tight opacity-80 font-mono">
                            Para prevenir duplicidades en la base de datos, garantice que solo se procese una migración masiva a la vez.
                        </p>
                        <button
                            onClick={() => setShowWarning(false)}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-5 rounded-2xl text-[13px] uppercase tracking-[0.2em] shadow-2xl shadow-blue-200 transition-all active:scale-95 group relative overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-shimmer" />
                            DECLARO HABER COMPRENDIDO
                        </button>
                    </div>
                </div>
            )}

            {/* Header / Context Panel */}
            <div className="bg-white rounded-[32px] border border-slate-200/50 shadow-[0_20px_60px_rgba(0,0,0,0.03)] hover:shadow-[0_35px_80px_rgba(0,0,0,0.06)] transition-all duration-700 overflow-hidden relative">
                <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-600 shadow-[1px_0_10px_rgba(37,99,235,0.15)]"></div>
                <div className="bg-slate-50/50 backdrop-blur-sm px-10 py-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-6">
                        <div className="w-16 h-16 rounded-[24px] bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center shadow-2xl shadow-blue-200">
                            <FiDatabase size={32} className="text-white" />
                        </div>
                        <div>
                            <h2 className="text-[24px] font-black text-slate-800 uppercase tracking-tighter">Cargas Masivas</h2>
                            <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] opacity-80">Gestión de migración e importación de datos</p>
                        </div>
                    </div>

                    {loading && progress.total > 0 && (
                        <div className="bg-white px-8 py-4 rounded-[24px] border border-blue-100 shadow-xl shadow-blue-50/50 flex flex-col items-center gap-2 animate-in slide-in-from-right-10">
                            <div className="flex items-center gap-4">
                                <div className="w-3 h-3 bg-blue-600 rounded-full animate-pulse shadow-[0_0_10px_rgba(37,99,235,0.5)]" />
                                <span className="text-[12px] font-black text-slate-700 uppercase tracking-widest leading-none">
                                    PROCESANDO: {progress.current} / {progress.total}
                                </span>
                            </div>
                            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-blue-600 transition-all duration-500 shadow-[0_0_10px_rgba(37,99,235,0.3)]"
                                    style={{ width: `${(progress.current / progress.total) * 100}%` }}
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Grid of Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {CARGA_TYPES.map((item) => (
                    <div key={item.id} className="group bg-white rounded-[32px] border border-slate-200/50 shadow-[0_15px_40px_rgba(0,0,0,0.02)] p-10 flex flex-col items-center text-center hover:shadow-[0_40px_80px_rgba(0,0,0,0.08)] hover:-translate-y-2 transition-all duration-700 relative overflow-hidden">
                        <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500/20 to-transparent group-hover:via-blue-500/50 transition-all duration-700`} />

                        <div className={`w-20 h-20 ${item.bg} ${item.color} rounded-[28px] flex items-center justify-center mb-8 shadow-inner group-hover:scale-110 group-hover:rotate-6 transition-all duration-700`}>
                            <item.icon size={36} />
                        </div>

                        <h4 className="text-[18px] font-black text-slate-800 uppercase tracking-tighter mb-4 group-hover:text-blue-700 transition-colors">
                            {item.label}
                        </h4>
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-tight leading-relaxed mb-10 opacity-70">
                            {item.description}
                        </p>

                        <div className="w-full flex gap-3 mt-auto">
                            {/* Download Template */}
                            <button
                                onClick={() => handleDownload(item)}
                                disabled={loading}
                                className="flex-1 bg-slate-50 hover:bg-emerald-50 text-slate-400 hover:text-emerald-600 border border-slate-100 hover:border-emerald-200 py-4 rounded-2xl transition-all active:scale-95 flex flex-col items-center justify-center gap-1 group/down"
                            >
                                <FiDownload size={18} className="group-hover/down:-translate-y-1 transition-transform" />
                                <span className="text-[9px] font-black uppercase tracking-widest">Plantilla</span>
                            </button>

                            {/* Upload Data */}
                            <input
                                id={`file-${item.id}`}
                                type="file"
                                accept=".xlsx,.xls,.csv"
                                style={{ display: "none" }}
                                onChange={(e) => processFile(e.target.files[0], item)}
                            />
                            <button
                                onClick={() => handleUploadClick(`file-${item.id}`)}
                                disabled={loading}
                                className="flex-[2] bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl shadow-xl shadow-blue-200 transition-all active:scale-95 flex flex-col items-center justify-center gap-1 group/up relative overflow-hidden font-black"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/up:animate-shimmer" />
                                <FiUpload size={18} className="group-hover/up:-translate-y-1 transition-transform" />
                                <span className="text-[9px] uppercase tracking-[0.2em]">Cargar Archivo</span>
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Smart Import Guide */}
            <div className="bg-gradient-to-br from-indigo-50/50 to-blue-50/30 rounded-[32px] border border-indigo-100/50 p-10 flex flex-col md:flex-row gap-10">
                <div className="w-20 h-20 rounded-[28px] bg-white shadow-xl shadow-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
                    <FiInfo size={32} />
                </div>
                <div className="space-y-6">
                    <div>
                        <h5 className="text-[18px] font-black text-slate-800 uppercase tracking-tighter mb-1">Manual Normativo de Migración</h5>
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Protocolos de seguridad para integridad de datos</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div className="flex items-start gap-4">
                            <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0 mt-0.5">
                                <span className="text-[10px] font-black italic">01</span>
                            </div>
                            <p className="text-[12px] font-bold text-slate-500 uppercase tracking-tight leading-relaxed">Use estrictamente la plantilla oficial descargada desde cada módulo.</p>
                        </div>
                        <div className="flex items-start gap-4">
                            <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0 mt-0.5">
                                <span className="text-[10px] font-black italic">02</span>
                            </div>
                            <p className="text-[12px] font-bold text-slate-500 uppercase tracking-tight leading-relaxed">Los campos marcados como obligatorios no pueden contener valores nulos o fórmulas.</p>
                        </div>
                        <div className="flex items-start gap-4">
                            <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0 mt-0.5">
                                <span className="text-[10px] font-black italic">03</span>
                            </div>
                            <p className="text-[12px] font-bold text-slate-500 uppercase tracking-tight leading-relaxed">Evite formatos de celda personalizados; la importación utiliza texto plano para mayor seguridad.</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex justify-center pt-4">
                <div className="bg-white px-6 py-3 rounded-full border border-slate-100 shadow-sm flex items-center gap-3">
                    <FiArchive className="text-slate-300" />
                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">Migración de Datos Engine v2.0 - OdontoCloud</span>
                </div>
            </div>

        </div>
    );
}
