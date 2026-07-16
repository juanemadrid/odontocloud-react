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

    // Preview and Validation Lists
    const [dianDocs, setDianDocs] = useState([]);
    const [usuarios, setUsuarios] = useState([]);
    const [consultas, setConsultas] = useState([]);
    const [procedimientos, setProcedimientos] = useState([]);
    const [searched, setSearched] = useState(false);

    const fmt = (n) =>
      Number(n || 0).toLocaleString("es-CO", {
        style: "currency",
        currency: "COP",
        maximumFractionDigits: 0,
      });

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
        
        const dianList = [];
        const userList = [];
        const conList = [];
        const procList = [];

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
                const patientDoc = pacienteData?.nroDocumento || pacienteData?.cedula || "—";

                // Build Usuario
                const usuario = buildUsuarioJSON(pacienteData || {
                    tipoDoc: 'CC',
                    numDoc: '000000000',
                    primerNombre: f.pacienteNombre || 'Desconocido'
                });

                // Validate patient details
                const userErrors = [];
                if (!pacienteData) {
                    userErrors.push("Paciente no registrado en base de datos");
                } else {
                    if (!pacienteData.fechaNacimiento) userErrors.push("Falta fecha de nacimiento");
                    if (!pacienteData.sexo) userErrors.push("Falta sexo");
                    if (!pacienteData.tipoDoc) userErrors.push("Falta tipo de documento");
                }

                const userWithValidation = {
                    ...usuario,
                    nombreCompleto: pacienteData ? (pacienteData.nombreCompleto || `${pacienteData.nombres || ""} ${pacienteData.apellidos || ""}`.trim()) : f.pacienteNombre,
                    errors: userErrors
                };

                if (!userList.some(u => u.numDocumentoIdentificacion === userWithValidation.numDocumentoIdentificacion)) {
                    userList.push(userWithValidation);
                }

                // Partition Invoice Items into Consultas & Procedimientos
                const invoiceConsultas = [];
                const invoiceProcedimientos = [];

                (f.items || []).forEach((item, idx) => {
                    const smart = suggestClinicalCodes(item.desc || item.concepto);
                    const isConsulta = (item.desc || item.concepto || "").toLowerCase().includes("consulta") || 
                                       (item.desc || item.concepto || "").toLowerCase().includes("valoracion");

                    const rowErrors = [];
                    if (!smart.cie10) rowErrors.push("Falta código de diagnóstico CIE-10");
                    if (!smart.cups) rowErrors.push("Falta código de procedimiento CUPS");

                    if (isConsulta) {
                        const consulta = {
                            codPrestador: "123456789001",
                            fechaInicioAtencion: f.fecha || new Date().toISOString().split('T')[0],
                            numAutorizacion: f.nroAutorizacion || null,
                            codConsulta: smart.cups,
                            modalidadGrupoServicio: "01",
                            grupoServicios: "01",
                            codServicio: 1,
                            finalidadTecnologiaSalud: "10",
                            causaMotivoAtencion: "13",
                            codDiagnosticoPrincipal: smart.cie10,
                            tipoDiagnosticoPrincipal: "1",
                            valorServicio: item.total || item.valor || 0,
                            consecutivo: conList.length + 1,
                            docPaciente: patientDoc,
                            invoiceId: f.id,
                            errors: rowErrors
                        };
                        conList.push(consulta);
                        invoiceConsultas.push(buildConsultaJSON(consulta, idx + 1));
                    } else {
                        const procedimiento = {
                            codPrestador: "123456789001",
                            fechaProcedimiento: f.fecha || new Date().toISOString().split('T')[0],
                            numAutorizacion: f.nroAutorizacion || null,
                            codProcedimiento: smart.cups,
                            modalidadGrupoServicio: "01",
                            grupoServicios: "01",
                            codServicio: 1,
                            finalidadTecnologiaSalud: "10",
                            causaMotivoAtencion: "13",
                            codDiagnosticoPrincipal: smart.cie10,
                            tipoDiagnosticoPrincipal: "1",
                            valorServicio: item.total || item.valor || 0,
                            consecutivo: procList.length + 1,
                            docPaciente: patientDoc,
                            invoiceId: f.id,
                            errors: rowErrors
                        };
                        procList.push(procedimiento);
                        invoiceProcedimientos.push({
                            codPrestador: procedimiento.codPrestador,
                            fechaProcedimiento: procedimiento.fechaProcedimiento,
                            numAutorizacion: procedimiento.numAutorizacion,
                            codProcedimiento: procedimiento.codProcedimiento,
                            viaIngresoServicioSalud: "01",
                            modalidadGrupoServicio: "01",
                            grupoServicios: "01",
                            codServicio: 1,
                            finalidadTecnologiaSalud: "10",
                            tipoDiagnosticoPrincipal: "1",
                            codDiagnosticoPrincipal: procedimiento.codDiagnosticoPrincipal,
                            valorServicio: procedimiento.valorServicio,
                            consecutivo: idx + 1
                        });
                    }
                });

                // Add to DIAN documents validation list
                const invoiceErrors = [];
                if (!f.fecha) invoiceErrors.push("Falta fecha de factura");
                if (!f.pacienteNombre) invoiceErrors.push("Falta nombre del paciente");

                dianList.push({
                    id: f.id,
                    paciente: f.pacienteNombre || "—",
                    cufe: f.cufe || "—",
                    errors: invoiceErrors
                });

                // Build Final JSON
                const ripsJson = buildRipsJSON({
                    nitObligado: "900123456",
                    numeroFactura: f.id.substring(0, 10),
                }, [usuario], invoiceConsultas, invoiceProcedimientos);

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

            // Set validation previews
            setDianDocs(dianList);
            setUsuarios(userList);
            setConsultas(conList);
            setProcedimientos(procList);
            setSearched(true);

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
        <div className="p-6 max-w-7xl mx-auto animation-fade-in-up font-sans text-slate-800 dark:text-slate-100 space-y-8">
            {/* Header & Breadcrumb */}
            <div>
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
            <div className="glass-panel p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-[0_4px_30px_rgba(0,0,0,0.03)] rounded-2xl transition-all duration-300">
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
                                    style={{ contentVisibility: 'auto' }}
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
                                    style={{ contentVisibility: 'auto' }}
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
                                : 'bg-[#8cc33f] hover:bg-[#7db02b] active:scale-[0.98] hover:shadow-[#8cc33f]/20'}`}
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

            {/* validation previews */}
            {searched && (
                <div className="space-y-8 animate-in fade-in duration-500">
                    
                    {/* Documentos DIAN */}
                    <div className="bg-white rounded-[28px] border border-slate-100 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between">
                            <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">Documentos DIAN</h3>
                            <span className="text-[10px] font-black text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full uppercase tracking-wider">
                                Total: {dianDocs.length}
                            </span>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50/20 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                        <th className="px-6 py-4 pl-8 w-24">Estado</th>
                                        <th className="px-6 py-4">Número de la factura</th>
                                        <th className="px-6 py-4">Paciente</th>
                                        <th className="px-6 py-4">Tipo de nota</th>
                                        <th className="px-6 py-4">CUFE</th>
                                        <th className="px-6 py-4 text-center pr-8 w-24">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50 text-[13px] text-slate-700">
                                    {dianDocs.length === 0 ? (
                                        <tr>
                                            <td colSpan="6" className="px-8 py-10 text-center text-slate-400 italic">Sin datos</td>
                                        </tr>
                                    ) : (
                                        dianDocs.map(doc => (
                                            <tr key={doc.id} className="hover:bg-slate-50/30 transition-colors">
                                                <td className="px-6 py-4 pl-8">
                                                    <span className={`w-2.5 h-2.5 rounded-full inline-block ${doc.errors.length === 0 ? 'bg-emerald-500' : 'bg-rose-500'}`} title={doc.errors.join(", ") || "Correcto"} />
                                                </td>
                                                <td className="px-6 py-4 font-bold text-slate-800 uppercase tracking-tight">{doc.id}</td>
                                                <td className="px-6 py-4 font-semibold text-slate-500">{doc.paciente}</td>
                                                <td className="px-6 py-4 font-semibold text-slate-500">Factura de Venta</td>
                                                <td className="px-6 py-4 font-mono text-xs text-slate-400">{doc.cufe}</td>
                                                <td className="px-6 py-4 text-center pr-8">
                                                    <button className="w-8 h-8 rounded-lg bg-slate-50 text-slate-400 hover:bg-blue-50 hover:text-blue-600 flex items-center justify-center transition-all shadow-sm mx-auto" title="Ver detalles">
                                                        <FiFileText size={14} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <div className="bg-slate-50/80 px-8 py-3 border-t border-slate-100 flex gap-6 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                            <span>Validado correctamente: <strong className="text-emerald-600 font-black">{dianDocs.filter(d => d.errors.length === 0).length}</strong></span>
                            <span>Validado con errores: <strong className="text-rose-600 font-black">{dianDocs.filter(d => d.errors.length > 0).length}</strong></span>
                        </div>
                    </div>

                    {/* Usuarios */}
                    <div className="bg-white rounded-[28px] border border-slate-100 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between">
                            <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">Usuarios</h3>
                            <span className="text-[10px] font-black text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full uppercase tracking-wider">
                                Total: {usuarios.length}
                            </span>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50/20 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                        <th className="px-6 py-4 pl-8 w-24">Estado</th>
                                        <th className="px-6 py-4">Tipo Identificación</th>
                                        <th className="px-6 py-4">Nro. Identificación</th>
                                        <th className="px-6 py-4">Nombre Completo</th>
                                        <th className="px-6 py-4">Tipo Usuario</th>
                                        <th className="px-6 py-4">F. Nacimiento</th>
                                        <th className="px-6 py-4 text-center">Sexo</th>
                                        <th className="px-6 py-4 text-center">Cód. Residencia</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50 text-[13px] text-slate-700">
                                    {usuarios.length === 0 ? (
                                        <tr>
                                            <td colSpan="8" className="px-8 py-10 text-center text-slate-400 italic">Sin datos</td>
                                        </tr>
                                    ) : (
                                        usuarios.map((u, i) => (
                                            <tr key={i} className="hover:bg-slate-50/30 transition-colors">
                                                <td className="px-6 py-4 pl-8">
                                                    <span className={`w-2.5 h-2.5 rounded-full inline-block ${u.errors.length === 0 ? 'bg-emerald-500' : 'bg-rose-500'}`} title={u.errors.join(", ") || "Correcto"} />
                                                </td>
                                                <td className="px-6 py-4 font-bold text-slate-500">{u.tipoDocumentoIdentificacion}</td>
                                                <td className="px-6 py-4 font-bold text-slate-800">{u.numDocumentoIdentificacion}</td>
                                                <td className="px-6 py-4 font-bold text-slate-700 uppercase tracking-tight">{u.nombreCompleto}</td>
                                                <td className="px-6 py-4 font-semibold text-slate-500">{u.tipoUsuario}</td>
                                                <td className="px-6 py-4 font-semibold text-slate-500 font-mono">{u.fechaNacimiento}</td>
                                                <td className="px-6 py-4 text-center font-bold text-slate-600">{u.codSexo}</td>
                                                <td className="px-6 py-4 text-center font-semibold text-slate-500 font-mono">{u.municipioResidencia}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <div className="bg-slate-50/80 px-8 py-3 border-t border-slate-100 flex gap-6 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                            <span>Validado correctamente: <strong className="text-emerald-600 font-black">{usuarios.filter(u => u.errors.length === 0).length}</strong></span>
                            <span>Validado con errores: <strong className="text-rose-600 font-black">{usuarios.filter(u => u.errors.length > 0).length}</strong></span>
                        </div>
                    </div>

                    {/* Consultas */}
                    <div className="bg-white rounded-[28px] border border-slate-100 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between">
                            <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">Consultas</h3>
                            <span className="text-[10px] font-black text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full uppercase tracking-wider">
                                Total: {consultas.length}
                            </span>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50/20 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                        <th className="px-6 py-4 pl-8 w-24">Estado</th>
                                        <th className="px-6 py-4">Identificación Paciente</th>
                                        <th className="px-6 py-4">Factura</th>
                                        <th className="px-6 py-4">Cód. Prestador</th>
                                        <th className="px-6 py-4">Fecha Consulta</th>
                                        <th className="px-6 py-4">Código CUPS</th>
                                        <th className="px-6 py-4">Diagnóstico CIE-10</th>
                                        <th className="px-6 py-4 text-right pr-8">Valor</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50 text-[13px] text-slate-700">
                                    {consultas.length === 0 ? (
                                        <tr>
                                            <td colSpan="8" className="px-8 py-10 text-center text-slate-400 italic">Sin datos</td>
                                        </tr>
                                    ) : (
                                        consultas.map((c, i) => (
                                            <tr key={i} className="hover:bg-slate-50/30 transition-colors">
                                                <td className="px-6 py-4 pl-8">
                                                    <span className={`w-2.5 h-2.5 rounded-full inline-block ${c.errors.length === 0 ? 'bg-emerald-500' : 'bg-rose-500'}`} title={c.errors.join(", ") || "Correcto"} />
                                                </td>
                                                <td className="px-6 py-4 font-bold text-slate-800">{c.docPaciente}</td>
                                                <td className="px-6 py-4 font-bold text-slate-500">{c.invoiceId}</td>
                                                <td className="px-6 py-4 font-mono text-slate-400 text-xs">{c.codPrestador}</td>
                                                <td className="px-6 py-4 font-semibold text-slate-500 font-mono">{c.fechaInicioAtencion}</td>
                                                <td className="px-6 py-4 font-black text-blue-600 font-mono">{c.codConsulta}</td>
                                                <td className="px-6 py-4 font-black text-emerald-600 font-mono">{c.codDiagnosticoPrincipal}</td>
                                                <td className="px-6 py-4 text-right font-black text-slate-900 font-mono pr-8">{fmt(c.valorServicio)}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <div className="bg-slate-50/80 px-8 py-3 border-t border-slate-100 flex gap-6 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                            <span>Validado correctamente: <strong className="text-emerald-600 font-black">{consultas.filter(c => c.errors.length === 0).length}</strong></span>
                            <span>Validado con errores: <strong className="text-rose-600 font-black">{consultas.filter(c => c.errors.length > 0).length}</strong></span>
                        </div>
                    </div>

                    {/* Procedimientos */}
                    <div className="bg-white rounded-[28px] border border-slate-100 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between">
                            <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">Procedimientos</h3>
                            <span className="text-[10px] font-black text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full uppercase tracking-wider">
                                Total: {procedimientos.length}
                            </span>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50/20 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                        <th className="px-6 py-4 pl-8 w-24">Estado</th>
                                        <th className="px-6 py-4">Identificación Paciente</th>
                                        <th className="px-6 py-4">Factura</th>
                                        <th className="px-6 py-4">Cód. Prestador</th>
                                        <th className="px-6 py-4">Fecha Procedimiento</th>
                                        <th className="px-6 py-4">Código CUPS</th>
                                        <th className="px-6 py-4">Diagnóstico CIE-10</th>
                                        <th className="px-6 py-4 text-right pr-8">Valor</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50 text-[13px] text-slate-700">
                                    {procedimientos.length === 0 ? (
                                        <tr>
                                            <td colSpan="8" className="px-8 py-10 text-center text-slate-400 italic">Sin datos</td>
                                        </tr>
                                    ) : (
                                        procedimientos.map((p, i) => (
                                            <tr key={i} className="hover:bg-slate-50/30 transition-colors">
                                                <td className="px-6 py-4 pl-8">
                                                    <span className={`w-2.5 h-2.5 rounded-full inline-block ${p.errors.length === 0 ? 'bg-emerald-500' : 'bg-rose-500'}`} title={p.errors.join(", ") || "Correcto"} />
                                                </td>
                                                <td className="px-6 py-4 font-bold text-slate-800">{p.docPaciente}</td>
                                                <td className="px-6 py-4 font-bold text-slate-500">{p.invoiceId}</td>
                                                <td className="px-6 py-4 font-mono text-slate-400 text-xs">{p.codPrestador}</td>
                                                <td className="px-6 py-4 font-semibold text-slate-500 font-mono">{p.fechaProcedimiento}</td>
                                                <td className="px-6 py-4 font-black text-blue-600 font-mono">{p.codProcedimiento}</td>
                                                <td className="px-6 py-4 font-black text-emerald-600 font-mono">{p.codDiagnosticoPrincipal}</td>
                                                <td className="px-6 py-4 text-right font-black text-slate-900 font-mono pr-8">{fmt(p.valorServicio)}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <div className="bg-slate-50/80 px-8 py-3 border-t border-slate-100 flex gap-6 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                            <span>Validado correctamente: <strong className="text-emerald-600 font-black">{procedimientos.filter(p => p.errors.length === 0).length}</strong></span>
                            <span>Validado con errores: <strong className="text-rose-600 font-black">{procedimientos.filter(p => p.errors.length > 0).length}</strong></span>
                        </div>
                    </div>

                </div>
            )}
        </div>
    );
}
