import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig"; // Ensure path is correct
import { useAuth } from "../../context/AuthContext";
import {
    buildRipsJSON,
    buildUsuarioJSON,
    buildConsultaJSON,
    suggestClinicalCodes
} from '../../utils/ripsValidators';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { FiActivity, FiCalendar, FiChevronRight, FiDownload, FiSearch, FiFileText } from 'react-icons/fi';
import { toast } from "sonner";

export default function RipsGenerator() {
    const { userProfile } = useAuth();
    const inquilino = userProfile?.inquilino || "";

    const [dateRange, setDateRange] = useState({ start: '', end: '' });
    const [loading, setLoading] = useState(false);
    const [generatedFiles, setGeneratedFiles] = useState([]);
    const [logs, setLogs] = useState([]); // To show process details

    // Nuevos estados para filtros dinámicos (estilo OralDrive)
    const [sucursales, setSucursales] = useState([]);
    const [epsList, setEpsList] = useState([]);
    const [selectedSucursal, setSelectedSucursal] = useState('');
    const [selectedEps, setSelectedEps] = useState('');
    const [filterType, setFilterType] = useState('facturacion'); // 'facturacion' o 'realizado'

    // Cargar historial de RIPS generados y catálogos al entrar
    useEffect(() => {
        if (!inquilino) return;
        const loadHistory = async () => {
            try {
                const q = query(
                    collection(db, "rips_generados"),
                    where("inquilino", "==", inquilino)
                );
                const snap = await getDocs(q);
                const files = snap.docs.map(doc => doc.data());
                
                // Ordenar por fechaGeneracion descendente en memoria
                files.sort((a, b) => {
                    const da = a.fechaGeneracion?.toDate ? a.fechaGeneracion.toDate() : new Date(a.fechaGeneracion || 0);
                    const db = b.fechaGeneracion?.toDate ? b.fechaGeneracion.toDate() : new Date(b.fechaGeneracion || 0);
                    return db.getTime() - da.getTime();
                });
                
                setGeneratedFiles(files);
            } catch (e) {
                console.error("Error loading RIPS history:", e);
            }
        };
        
        const loadMetadata = async () => {
            try {
                // Cargar sucursales
                const qS = query(collection(db, "sucursales"), where("inquilino", "==", inquilino));
                const snapS = await getDocs(qS);
                setSucursales(snapS.docs.map(doc => ({ id: doc.id, ...doc.data() })));

                // Cargar EPS/Terceros
                const qE = query(collection(db, "eps_catalogo"), where("inquilino", "==", inquilino));
                const snapE = await getDocs(qE);
                const uniqueEps = [...new Set(snapE.docs.map(doc => doc.data().nombre))].filter(Boolean).sort();
                setEpsList(uniqueEps);
            } catch (e) {
                console.error("Error loading RIPS metadata:", e);
            }
        };

        loadHistory();
        loadMetadata();
    }, [inquilino]);

    const handleGenerate = async () => {
        setLoading(true);
        setLogs([]);
        const newFiles = [];

        try {
            setLogs(prev => [...prev, `🔍 Iniciando consulta... Filtro por fecha de: ${filterType === 'facturacion' ? 'facturación' : 'realizado'}`]);

            // 1. Fetch Facturas in Range
            const q = query(
                collection(db, "facturas_venta"),
                where("fecha", ">=", dateRange.start),
                where("fecha", "<=", dateRange.end)
            );
            const querySnapshot = await getDocs(q);
            
            // Filtrar por inquilino en memoria
            let facturas = querySnapshot.docs
                .map(doc => ({ id: doc.id, ...doc.data() }))
                .filter(f => !inquilino || f.inquilino === inquilino);

            if (facturas.length === 0) {
                toast.error("No se encontraron facturas en el rango seleccionado.");
                setLoading(false);
                return;
            }

            // 2. Fetch Patients (To get IDs and birthdates)
            const patSnap = await getDocs(collection(db, "pacientes"));
            const pacientesMap = {};
            patSnap.docs.forEach(d => {
                const p = d.data();
                if (p.nombreCompleto && (!inquilino || p.inquilino === inquilino)) {
                    pacientesMap[p.nombreCompleto.toLowerCase()] = p;
                }
            });

            // 2.5 Aplicar filtros adicionales en memoria (Sucursal y EPS/Tercero)
            if (selectedSucursal) {
                const sucursalObj = sucursales.find(s => s.id === selectedSucursal || s.nombre === selectedSucursal);
                const sucursalName = sucursalObj?.nombre || selectedSucursal;
                setLogs(prev => [...prev, `🏢 Filtrando por sucursal: ${sucursalName}`]);
                facturas = facturas.filter(f => {
                    const pName = (f.pacienteNombre || "").toLowerCase();
                    const patient = pacientesMap[pName];
                    if (!patient) return false;
                    return patient.sucursal === sucursalName || patient.sucursalId === selectedSucursal || patient.sede === sucursalName;
                });
            }

            if (selectedEps) {
                setLogs(prev => [...prev, `🛡️ Filtrando por EPS/Tercero: ${selectedEps}`]);
                facturas = facturas.filter(f => {
                    const pName = (f.pacienteNombre || "").toLowerCase();
                    const patient = pacientesMap[pName];
                    if (!patient) return false;
                    return (patient.nombreEps || "").trim().toUpperCase() === selectedEps.trim().toUpperCase();
                });
            }

            if (facturas.length === 0) {
                toast.error("No se encontraron facturas que coincidan con los filtros aplicados.");
                setLoading(false);
                return;
            }

            setLogs(prev => [...prev, `⚙️ Procesando ${facturas.length} facturas filtradas...`]);

            // 3. Process each Invoice -> RIPS JSON
            for (const f of facturas) {
                const pName = (f.pacienteNombre || "").toLowerCase();
                const pacienteData = pacientesMap[pName];

                if (!pacienteData) {
                    setLogs(prev => [...prev, `⚠️ Paciente no encontrado en BD: ${f.pacienteNombre}. Se usarán datos genéricos.`]);
                }

                // Build Usuario
                const usuario = buildUsuarioJSON(pacienteData || {
                    tipoDoc: 'CC',
                    numDoc: '000000000',
                    primerNombre: f.pacienteNombre || 'Desconocido'
                });

                // Build Consultas from Invoice Items
                const consultas = (f.items || []).map((item, idx) => {
                    const smart = suggestClinicalCodes(item.desc || item.concepto);
                    return buildConsultaJSON({
                        codPrestador: "123456789001", // TODO: Get from Config
                        fechaInicio: f.fecha,
                        codConsulta: smart.cups,
                        valorServicio: item.total || item.valor || 0,
                        finalidad: "10", // Tratamiento
                        causaExterna: "13", // Enfermedad General
                        dxPrincipal: smart.cie10,
                        tipoDx: "1"
                    }, idx + 1);
                });

                // Build Final JSON
                const ripsJson = buildRipsJSON({
                    nitObligado: "900123456", // TODO: Get from Config
                    numeroFactura: f.id.substring(0, 10), // Use ID as invoice number if missing
                }, [usuario], consultas, []); // Procedures empty for now

                // Add to generated list
                const fileName = `${f.id}_RIPS.json`;
                const fileData = JSON.stringify(ripsJson, null, 2);

                const fileObj = {
                    name: fileName,
                    type: 'JSON (Res. 2275)',
                    size: fileData.length,
                    content: fileData,
                    fechaGeneracion: new Date().toISOString(),
                    inquilino: inquilino
                };

                newFiles.push(fileObj);

                // Guardar persistente en Firestore
                try {
                    await addDoc(collection(db, "rips_generados"), {
                        ...fileObj,
                        fechaGeneracion: serverTimestamp()
                    });
                } catch (err) {
                    console.error("Error al guardar archivo RIPS en base de datos:", err);
                }
            }

            setGeneratedFiles(prev => {
                const combined = [...newFiles, ...prev];
                const unique = [];
                const seen = new Set();
                for (const file of combined) {
                    if (!seen.has(file.name)) {
                        seen.add(file.name);
                        unique.push(file);
                    }
                }
                return unique;
            });
            setLogs(prev => [...prev, `✅ Proceso finalizado. ${newFiles.length} archivos generados y guardados en la base de datos.`]);

        } catch (error) {
            console.error("Error generating RIPS:", error);
            setLogs(prev => [...prev, `❌ Error: ${error.message}`]);
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = (file) => {
        const blob = new Blob([file.content], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = file.name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    return (
        <div className="p-6 max-w-7xl mx-auto animation-fade-in-up font-sans text-slate-800 dark:text-slate-100">
            {/* Header & Breadcrumb */}
            <div className="mb-8">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">
                    <span>Administración</span>
                    <FiChevronRight />
                    <span className="text-blue-500">RIPS</span>
                </div>
                <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-500">
                        <FiActivity className="w-6 h-6 animate-pulse" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-extrabold font-display tracking-tight">RIPS</h1>
                        <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
                            Gestión y Generación de Registro Individual de Prestación de Servicios de Salud (Resolución 2275 de 2023).
                        </p>
                    </div>
                </div>
            </div>

            {/* Main configuration Form Card */}
            <div className="glass-panel p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-[0_4px_30px_rgba(0,0,0,0.03)] rounded-2xl mb-8 transition-all duration-300">
                <h2 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 mb-6 flex items-center gap-2">
                    <span className="w-1.5 h-3 bg-blue-500 rounded-full" />
                    Parámetros de Generación
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                    {/* Fecha Inicial */}
                    <div>
                        <label className="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1 mb-1.5 block">
                            Fecha Inicial
                        </label>
                        <div className="relative">
                            <input 
                                type="date" 
                                value={dateRange.start} 
                                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                                className="w-full px-4 py-3 pl-10 text-sm font-medium rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 shadow-sm outline-none transition-all duration-200"
                            />
                            <FiCalendar className="absolute left-3.5 top-3.5 text-slate-400 w-4 h-4" />
                        </div>
                    </div>

                    {/* Fecha Final */}
                    <div>
                        <label className="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1 mb-1.5 block">
                            Fecha Final
                        </label>
                        <div className="relative">
                            <input 
                                type="date" 
                                value={dateRange.end} 
                                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                                className="w-full px-4 py-3 pl-10 text-sm font-medium rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 shadow-sm outline-none transition-all duration-200"
                            />
                            <FiCalendar className="absolute left-3.5 top-3.5 text-slate-400 w-4 h-4" />
                        </div>
                    </div>

                    {/* Sucursales */}
                    <div>
                        <label className="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1 mb-1.5 block">
                            Sucursales
                        </label>
                        <select 
                            value={selectedSucursal} 
                            onChange={(e) => setSelectedSucursal(e.target.value)}
                            className="w-full px-4 py-3 text-sm font-medium rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 shadow-sm outline-none transition-all duration-200 cursor-pointer appearance-none"
                            style={{ backgroundImage: `url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%2394a3b8' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3E%3C/svg%3E")`, backgroundPosition: 'right 1rem center', backgroundSize: '1.25rem', backgroundRepeat: 'no-repeat' }}
                        >
                            <option value="">Seleccione...</option>
                            {sucursales.map(s => (
                                <option key={s.id} value={s.id}>{s.nombre || 'Sede Principal'}</option>
                            ))}
                        </select>
                    </div>

                    {/* Tercero (EPS/Aseguradora) */}
                    <div>
                        <label className="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1 mb-1.5 block">
                            Tercero (EPS / Aseguradora)
                        </label>
                        <select 
                            value={selectedEps} 
                            onChange={(e) => setSelectedEps(e.target.value)}
                            className="w-full px-4 py-3 text-sm font-medium rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 shadow-sm outline-none transition-all duration-200 cursor-pointer appearance-none"
                            style={{ backgroundImage: `url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%2394a3b8' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3E%3C/svg%3E")`, backgroundPosition: 'right 1rem center', backgroundSize: '1.25rem', backgroundRepeat: 'no-repeat' }}
                        >
                            <option value="">Seleccione...</option>
                            {epsList.map(eps => (
                                <option key={eps} value={eps}>{eps}</option>
                            ))}
                        </select>
                    </div>

                    {/* Generar con (Radio Buttons) */}
                    <div className="md:col-span-2">
                        <label className="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1 mb-3 block">
                            Generar con
                        </label>
                        <div className="flex flex-col sm:flex-row gap-6 mt-1 ml-1">
                            <label className="flex items-center gap-3 cursor-pointer group text-sm font-semibold">
                                <input 
                                    type="radio" 
                                    name="filterType"
                                    value="facturacion"
                                    checked={filterType === 'facturacion'}
                                    onChange={() => setFilterType('facturacion')}
                                    className="w-4 h-4 text-blue-600 border-slate-300 focus:ring-blue-500/20"
                                />
                                <span className="text-slate-600 dark:text-slate-300 group-hover:text-slate-800 dark:group-hover:text-slate-100 transition-colors">
                                    Filtro por fecha de facturación
                                </span>
                            </label>
                            <label className="flex items-center gap-3 cursor-pointer group text-sm font-semibold">
                                <input 
                                    type="radio" 
                                    name="filterType"
                                    value="realizado"
                                    checked={filterType === 'realizado'}
                                    onChange={() => setFilterType('realizado')}
                                    className="w-4 h-4 text-blue-600 border-slate-300 focus:ring-blue-500/20"
                                />
                                <span className="text-slate-600 dark:text-slate-300 group-hover:text-slate-800 dark:group-hover:text-slate-100 transition-colors">
                                    Filtro por fecha de realizado
                                </span>
                            </label>
                        </div>
                    </div>
                </div>

                {/* Search / Generate Button */}
                <div className="mt-8 flex justify-end border-t border-slate-100 dark:border-slate-800 pt-6">
                    <button 
                        onClick={handleGenerate} 
                        disabled={loading || !dateRange.start || !dateRange.end}
                        className={`px-8 py-3.5 rounded-xl font-bold text-sm tracking-wide shadow-lg shadow-emerald-500/10 flex items-center gap-2.5 transition-all duration-300 text-white
                            ${loading || !dateRange.start || !dateRange.end 
                                ? 'bg-slate-300 dark:bg-slate-700 cursor-not-allowed shadow-none' 
                                : 'bg-emerald-500 hover:bg-emerald-600 active:scale-[0.98] hover:shadow-emerald-500/20'}`}
                    >
                        {loading ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                <span>Consultando BD...</span>
                            </>
                        ) : (
                            <>
                                <FiSearch className="w-4 h-4 stroke-[2.5]" />
                                <span>Buscar y Generar RIPS</span>
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Lower panel: Logs and Results */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Process Logs */}
                <div className="lg:col-span-1">
                    <div className="glass-panel p-6 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl h-80 flex flex-col">
                        <h3 className="text-xs font-black uppercase tracking-[0.25em] text-slate-400 dark:text-slate-500 mb-4">
                            Registro del Proceso
                        </h3>
                        <div className="flex-1 overflow-y-auto pr-1 text-xs font-mono text-slate-600 dark:text-slate-400 space-y-2">
                            {logs.length === 0 && (
                                <div className="h-full flex items-center justify-center text-slate-400 dark:text-slate-600 italic">
                                    Esperando ejecución del proceso...
                                </div>
                            )}
                            {logs.map((log, i) => (
                                <div key={i} className="pb-1.5 border-b border-slate-100 dark:border-slate-800 last:border-0 leading-relaxed">
                                    {log}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Generated Results List */}
                <div className="lg:col-span-2">
                    <div className="glass-panel p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl h-80 flex flex-col">
                        <h3 className="text-xs font-black uppercase tracking-[0.25em] text-slate-400 dark:text-slate-500 mb-4">
                            Archivos Listos ({generatedFiles.length})
                        </h3>
                        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                            {generatedFiles.length > 0 ? (
                                generatedFiles.map((file, idx) => (
                                    <div key={idx} className="border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex justify-between items-center bg-slate-50 dark:bg-slate-800/30 hover:border-blue-400 dark:hover:border-blue-500/50 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2.5 rounded-lg bg-blue-500/10 text-blue-500">
                                                <FiFileText className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <div className="font-bold text-sm text-slate-700 dark:text-slate-300">{file.name}</div>
                                                <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 font-medium">
                                                    {file.type} • {Math.round(file.size / 1024)} KB
                                                </div>
                                            </div>
                                        </div>
                                        <button 
                                            onClick={() => handleDownload(file)}
                                            className="px-4 py-2 text-xs font-bold bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-xl transition-all shadow-sm flex items-center gap-1.5"
                                        >
                                            <FiDownload className="w-3.5 h-3.5" />
                                            <span>Descargar JSON</span>
                                        </button>
                                    </div>
                                ))
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-600 text-center p-4">
                                    <FiFileText className="w-8 h-8 stroke-[1.5] mb-2 text-slate-300 dark:text-slate-700" />
                                    <p className="text-sm">Selecciona un rango de fechas y filtros para generar los archivos de RIPS.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
