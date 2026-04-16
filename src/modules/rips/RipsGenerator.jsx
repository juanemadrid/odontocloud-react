import React, { useState } from 'react';
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig"; // Ensure path is correct
import {
    buildRipsJSON,
    buildUsuarioJSON,
    buildConsultaJSON,
    suggestClinicalCodes
} from '../../utils/ripsValidators';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

export default function RipsGenerator() {
    const [dateRange, setDateRange] = useState({ start: '', end: '' });
    const [loading, setLoading] = useState(false);
    const [generatedFiles, setGeneratedFiles] = useState([]);
    const [logs, setLogs] = useState([]); // To show process details


    const handleGenerate = async () => {
        setLoading(true);
        setLogs([]);
        const newFiles = [];

        try {
            // 1. Fetch Facturas in Range
            const q = query(
                collection(db, "facturas_venta"),
                where("fecha", ">=", dateRange.start),
                where("fecha", "<=", dateRange.end)
            );
            const querySnapshot = await getDocs(q);
            const facturas = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

            if (facturas.length === 0) {
                alert("No se encontraron facturas en el rango seleccionado.");
                setLoading(false);
                return;
            }

            // 2. Fetch Patients (To get IDs and birthdates)
            // Optimization: In a real large app, we would query by ID. 
            // Here we fetch all simple cache or query individually. 
            // Querying all for MVP simplicity (assuming < 1000 patients)
            const patSnap = await getDocs(collection(db, "pacientes"));
            const pacientesMap = {};
            patSnap.docs.forEach(d => {
                const p = d.data();
                // Map by exact name as saved in invoice (Weak link!)
                if (p.nombreCompleto) pacientesMap[p.nombreCompleto.toLowerCase()] = p;
            });

            // 3. Process each Invoice -> RIPS JSON
            for (const f of facturas) {
                const pName = (f.pacienteNombre || "").toLowerCase();
                const pacienteData = pacientesMap[pName];

                if (!pacienteData) {
                    setLogs(prev => [...prev, `⚠️ Paciente no encontrado: ${f.pacienteNombre}. Se usarán datos genéricos.`]);
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

                newFiles.push({
                    name: fileName,
                    type: 'JSON (Res. 2275)',
                    size: fileData.length,
                    content: fileData
                });
            }

            setGeneratedFiles(newFiles);
            setLogs(prev => [...prev, `✅ Proceso finalizado. ${newFiles.length} archivos generados.`]);

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
        <div className="p-6 max-w-7xl mx-auto animation-fade-in-up font-sans">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 font-display">Generación de RIPS JSON</h1>
                    <p className="text-slate-500 mt-1">
                        Resolución 2275 de 2023. Generación real basada en facturas.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Control Panel */}
                <div className="lg:col-span-1 flex flex-col gap-6">
                    <div className="glass-panel p-6 bg-white border border-slate-200">
                        <h2 className="text-lg font-bold text-slate-700 mb-4">Rango de Fechas</h2>
                        <div className="flex flex-col gap-4">
                            <Input label="Fecha Inicial" type="date" value={dateRange.start} onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })} />
                            <Input label="Fecha Final" type="date" value={dateRange.end} onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })} />
                            <div className="pt-4">
                                <Button variant="primary" fullWidth onClick={handleGenerate} disabled={loading || !dateRange.start || !dateRange.end}>
                                    {loading ? 'Consultando BD...' : 'Generar RIPS'}
                                </Button>
                            </div>
                        </div>
                    </div>
                    {/* Logs */}
                    <div className="glass-panel p-4 bg-slate-50 border border-slate-200 h-64 overflow-y-auto text-xs font-mono text-slate-600">
                        <div className="font-bold mb-2">Logs del Proceso:</div>
                        {logs.length === 0 && <span className="text-slate-400">Esperando ejecución...</span>}
                        {logs.map((log, i) => <div key={i} className="mb-1 border-b border-slate-100 pb-1">{log}</div>)}
                    </div>
                </div>

                {/* Results Panel */}
                <div className="lg:col-span-2">
                    {generatedFiles.length > 0 ? (
                        <div className="glass-panel p-6 bg-white border-l-4 border-emerald-500">
                            <h2 className="text-lg font-bold text-slate-800 mb-4">Archivos Listos ({generatedFiles.length})</h2>
                            <div className="grid grid-cols-1 gap-3">
                                {generatedFiles.map((file, idx) => (
                                    <div key={idx} className="border border-slate-200 rounded-lg p-3 flex justify-between items-center bg-slate-50">
                                        <div>
                                            <div className="font-bold text-slate-700 text-sm">{file.name}</div>
                                            <div className="text-xs text-slate-500">{file.type} • {Math.round(file.size / 1024)} KB</div>
                                        </div>
                                        <Button size="sm" variant="ghost" onClick={() => handleDownload(file)}>
                                            Descargar JSON
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-64 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200 text-slate-400">
                            <p>Selecciona un rango de fechas para buscar facturas y generar el JSON.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
