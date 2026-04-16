import React, { useState } from "react";
import { parseCSV, mapCSVToPatient, generateTemplateCSV } from "../../../utils/csvHelper";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../../firebase/firebaseConfig";
import { useAuth } from "../../../context/AuthContext";

export default function ImportadorPacientes({ onComplete, onClose }) {
    const { userProfile } = useAuth();
    const [fileData, setFileData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [stats, setStats] = useState({ total: 0, valid: 0 });

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const text = event.target.result;
            const rawRecords = parseCSV(text);
            const mapped = rawRecords.map(record => mapCSVToPatient(record));

            setFileData(mapped);
            setStats({
                total: mapped.length,
                valid: mapped.filter(p => p.nroDocumento && p.nombres && p.apellidos).length
            });
        };
        reader.readAsText(file);
    };

    const handleDownloadTemplate = () => {
        const csvContent = generateTemplateCSV();
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", "plantilla_pacientes.csv");
        link.style.visibility = "hidden";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleImport = async () => {
        if (fileData.length === 0) return;
        setLoading(true);

        let count = 0;
        try {
            for (const patient of fileData) {
                if (!patient.nroDocumento) continue;

                const payload = {
                    ...patient,
                    creado: serverTimestamp(),
                    activo: true,
                    inquilino: userProfile?.inquilino || "", // Crucial para multitenant
                    celularPaciente: patient.celular,
                    documento: patient.nroDocumento,
                    paciente: patient.nombreCompleto,
                };

                await setDoc(doc(db, "pacientes", patient.nroDocumento), payload);
                count++;
            }
            alert(`✅ Se importaron ${count} pacientes correctamente.`);
            onComplete && onComplete();
            onClose();
        } catch (err) {
            console.error("Error en importación:", err);
            alert("❌ Ocurrió un error parcial durante la importación.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="odc-modal" role="dialog" aria-modal="true">
            <div className="odc-modal-backdrop" onClick={onClose} />
            <div className="odc-card" style={{ width: 800, maxWidth: "95%" }}>
                <div className="odc-card-header">
                    <h3 className="odc-title">Importar Pacientes</h3>
                    <button className="btn" onClick={onClose} disabled={loading}>✕</button>
                </div>

                <div style={{ padding: 20 }}>
                    <p style={{ fontSize: 13, color: "#64748b", marginBottom: 20 }}>
                        Sube tu base de datos en formato CSV. Asegúrate de que los nombres de las columnas coincidan con la plantilla.
                    </p>

                    <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
                        <button className="btn" onClick={handleDownloadTemplate} type="button">
                            📥 Descargar Plantilla
                        </button>
                        <input
                            type="file"
                            accept=".csv"
                            onChange={handleFileChange}
                            style={{ display: "none" }}
                            id="csv-upload"
                        />
                        <label htmlFor="csv-upload" className="btn green" style={{ cursor: "pointer" }}>
                            📁 Seleccionar Archivo
                        </label>
                    </div>

                    {fileData.length > 0 && (
                        <div style={{ background: "#f8fafc", padding: 15, borderRadius: 10, border: "1px solid #e2e8f0" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 15 }}>
                                <span style={{ fontSize: 14, fontWeight: "bold" }}>Previsualización ({stats.total} registros)</span>
                                <span style={{ fontSize: 12, color: stats.valid === stats.total ? "green" : "orange" }}>
                                    {stats.valid} listos para importar
                                </span>
                            </div>

                            <div style={{ maxHeight: 300, overflowY: "auto" }}>
                                <table className="appointments-table" style={{ fontSize: 11 }}>
                                    <thead>
                                        <tr>
                                            <th>Documento</th>
                                            <th>Nombre</th>
                                            <th>Celular</th>
                                            <th>Email</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {fileData.slice(0, 5).map((p, i) => (
                                            <tr key={i}>
                                                <td>{p.nroDocumento || "⚠️ Falta"}</td>
                                                <td>{p.nombreCompleto}</td>
                                                <td>{p.celular}</td>
                                                <td>{p.email}</td>
                                            </tr>
                                        ))}
                                        {fileData.length > 5 && (
                                            <tr>
                                                <td colSpan={4} style={{ textAlign: "center", fontStyle: "italic", padding: 10 }}>
                                                    ... y {fileData.length - 5} registros más
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            <div style={{ marginTop: 20, display: "flex", justifyContent: "flex-end" }}>
                                <button
                                    className="btn green"
                                    onClick={handleImport}
                                    disabled={loading || stats.valid === 0}
                                    style={{ width: "100%", padding: 12 }}
                                >
                                    {loading ? "⌛ Procesando..." : `🚀 Importar ${stats.valid} Pacientes Ahora`}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
