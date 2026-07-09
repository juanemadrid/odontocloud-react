import React, { useState, useEffect } from "react";
import { 
    FiPrinter, 
    FiFileText, 
    FiPlus, 
    FiSearch, 
    FiEye, 
    FiEdit2, 
    FiTrash2, 
    FiDownload,
    FiPenTool
} from "react-icons/fi";
import { collection, query, onSnapshot, orderBy, doc, deleteDoc, setDoc } from "firebase/firestore";
import { db } from "../../../firebase/firebaseConfig";
import { useToast } from "../../../context/ToastContext";
import { useAuth } from "../../../context/AuthContext";
import { getAnamnesis } from "../../../services/clinicalService";
import DocClinicoModal from "./DocClinicoModal";

export default function HistoriaClinicaContainer({ patient }) {
    const toast = useToast();
    const { userProfile } = useAuth();
    const [documents, setDocuments] = useState([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedDocType, setSelectedDocType] = useState("");
    const [editingDoc, setEditingDoc] = useState(null);
    const [isViewOnly, setIsViewOnly] = useState(false);
    
    // Filters state
    const [filterFecha, setFilterFecha] = useState("");
    const [filterTipo, setFilterTipo] = useState("");
    const [filterProf, setFilterProf] = useState("");
    const [filterTrans, setFilterTrans] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [signModal, setSignModal] = useState({ isOpen: false, doc: null });
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, docId: null });

    const handleSignPrescription = (docObj) => {
        setSignModal({ isOpen: true, doc: docObj });
    };

    const confirmSignPrescription = async () => {
        const docObj = signModal.doc;
        setSignModal({ isOpen: false, doc: null });
        try {
            const updatedItems = (docObj.recetaItems || []).map(item => ({
                ...item,
                doctorSignature: userProfile?.nombreCompleto || userProfile?.nombre || "Doctor",
                signedAt: new Date().toISOString(),
                signedBy: userProfile?.uid
            }));
            
            await setDoc(doc(db, `pacientes/${patient.id}/docClis`, docObj.id), {
                recetaItems: updatedItems
            }, { merge: true });
            
            toast.success("Receta firmada digitalmente ✅");
        } catch (err) {
            console.error("Error signing prescription", err);
            toast.error("Error al firmar la receta");
        }
    };

    // Real-time synchronization of clinical documents
    useEffect(() => {
        if (!patient?.id) return;
        const q = query(
            collection(db, `pacientes/${patient.id}/docClis`),
            orderBy("fechaIso", "desc")
        );
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setDocuments(docs);
        });
        return () => unsubscribe();
    }, [patient?.id]);

    const handleOpenModal = (tipo) => {
        setSelectedDocType(tipo);
        setEditingDoc(null);
        setIsViewOnly(false);
        setModalOpen(true);
    };

    const handleEditDoc = (doc) => {
        setEditingDoc(doc);
        setSelectedDocType(doc.tipoDocumento);
        setIsViewOnly(false);
        setModalOpen(true);
    };

    const handleViewDoc = (doc) => {
        setEditingDoc(doc);
        setSelectedDocType(doc.tipoDocumento);
        setIsViewOnly(true);
        setModalOpen(true);
    };

    const handleDeleteDoc = (docId) => {
        setDeleteModal({ isOpen: true, docId });
    };

    const confirmDeleteDoc = async () => {
        const docId = deleteModal.docId;
        setDeleteModal({ isOpen: false, docId: null });
        try {
            await deleteDoc(doc(db, `pacientes/${patient.id}/docClis`, docId));
            toast.success("Documento eliminado correctamente");
        } catch (err) {
            console.error("Error deleting doc", err);
            toast.error("Error al eliminar el documento");
        }
    };

    const handlePrintDoc = (doc) => {
        const printWindow = window.open("", "_blank");
        if (!printWindow) {
            toast.error("Por favor permite los popups en este sitio para poder imprimir.");
            return;
        }

        let contentHtml = "";
        if (doc.tipoDocumento === "Receta") {
            const items = doc.recetaItems || [];
            contentHtml = `
                <div class="section-title">Detalle de Medicamentos (Recetados)</div>
                <table>
                    <thead>
                        <tr>
                            <th style="width: 80px;">Tipo</th>
                            <th style="width: 110px;">Código CUM</th>
                            <th>Medicamento (Principio Activo)</th>
                            <th style="width: 100px;">Dosis</th>
                            <th style="width: 100px;">Vía</th>
                            <th style="width: 100px;">Frecuencia</th>
                            <th style="width: 100px;">Duración</th>
                            <th style="width: 60px;" class="text-center">Cant.</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${items.map(it => `
                            <tr>
                                <td><span class="badge ${it.tipo === 'POS' ? 'pos' : 'nopos'}">${it.tipo || 'POS'}</span></td>
                                <td class="font-mono" style="font-size: 11px;">${it.codigo || '-'}</td>
                                <td><strong>${it.principioActivo || ''}</strong>${it.marca && it.marca !== '-' ? ` <span class="text-muted">(${it.marca})</span>` : ''}</td>
                                <td>${it.dosis || it.concentracion || ''}</td>
                                <td>${it.viaAdministracion || ''}</td>
                                <td>${it.frecuencia || ''}</td>
                                <td>${it.duracion || ''}</td>
                                <td class="text-center font-bold">${it.cantidad || ''}</td>
                            </tr>
                            ${it.recomendacion ? `<tr><td colspan="8" class="rec-row"><strong>Recomendaciones:</strong> ${it.recomendacion}</td></tr>` : ''}
                        `).join("")}
                    </tbody>
                </table>
            `;
        } else {
            contentHtml = `
                <div class="section-title">Contenido del Documento</div>
                <div class="content-box">${(doc.contenido || "").replace(/\n/g, "<br/>")}</div>
            `;
        }

        printWindow.document.write(`
            <html>
            <head>
                <title>${doc.tipoDocumento} - ${patient.nombreCompleto || ''}</title>
                <style>
                    body {
                        font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
                        color: #1e293b;
                        padding: 40px;
                        max-width: 900px;
                        margin: 0 auto;
                        line-height: 1.5;
                    }
                    .header {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        border-bottom: 2px solid #e2e8f0;
                        padding-bottom: 20px;
                        margin-bottom: 25px;
                    }
                    .logo-area {
                        display: flex;
                        align-items: center;
                        gap: 10px;
                    }
                    .logo-text {
                        font-size: 24px;
                        font-weight: 900;
                        color: #1e3a8a;
                        letter-spacing: -0.05em;
                    }
                    .logo-sub {
                        color: #8CC63F;
                    }
                    .doc-title {
                        text-align: right;
                    }
                    .doc-title h1 {
                        font-size: 20px;
                        font-weight: 800;
                        text-transform: uppercase;
                        margin: 0;
                        color: #0f172a;
                    }
                    .doc-title p {
                        font-size: 11px;
                        font-weight: 700;
                        color: #64748b;
                        text-transform: uppercase;
                        margin: 5px 0 0 0;
                        letter-spacing: 0.1em;
                    }
                    .patient-card {
                        background: #f8fafc;
                        border: 1px solid #e2e8f0;
                        border-radius: 16px;
                        padding: 20px;
                        margin-bottom: 30px;
                        display: grid;
                        grid-template-columns: repeat(2, 1fr);
                        gap: 12px;
                    }
                    .info-group {
                        font-size: 13px;
                    }
                    .info-label {
                        font-size: 9px;
                        font-weight: 800;
                        text-transform: uppercase;
                        color: #64748b;
                        letter-spacing: 0.05em;
                        margin-bottom: 2px;
                    }
                    .info-value {
                        font-weight: 700;
                        color: #334155;
                    }
                    .section-title {
                        font-size: 13px;
                        font-weight: 800;
                        text-transform: uppercase;
                        color: #0f172a;
                        letter-spacing: 0.05em;
                        border-bottom: 1.5px solid #cbd5e1;
                        padding-bottom: 6px;
                        margin-top: 30px;
                        margin-bottom: 15px;
                    }
                    .content-box {
                        font-size: 14px;
                        color: #334155;
                        white-space: pre-wrap;
                        background: #fafafa;
                        border: 1px solid #f1f5f9;
                        padding: 20px;
                        border-radius: 12px;
                        min-height: 150px;
                    }
                    table {
                        width: 100%;
                        border-collapse: collapse;
                        margin-top: 15px;
                    }
                    th {
                        background: #f1f5f9;
                        padding: 10px 12px;
                        font-size: 10px;
                        font-weight: 800;
                        text-transform: uppercase;
                        color: #475569;
                        border-bottom: 2px solid #cbd5e1;
                        text-align: left;
                    }
                    td {
                        padding: 10px 12px;
                        font-size: 12px;
                        border-bottom: 1px solid #e2e8f0;
                        color: #334155;
                    }
                    .text-center { text-align: center; }
                    .font-bold { font-weight: bold; }
                    .font-mono { font-family: monospace; }
                    .badge {
                        font-size: 8px;
                        font-weight: 900;
                        padding: 2px 6px;
                        border-radius: 4px;
                        text-transform: uppercase;
                    }
                    .badge.pos { background: #d1fae5; color: #065f46; }
                    .badge.nopos { background: #fef3c7; color: #92400e; }
                    .text-muted { color: #64748b; font-size: 11px; }
                    .rec-row {
                        background: #faf5ff;
                        font-size: 11px;
                        color: #5b21b6;
                        border-bottom: 1.5px dashed #e9d5ff;
                    }
                    .footer-sig {
                        margin-top: 80px;
                        display: flex;
                        justify-content: space-between;
                        align-items: flex-end;
                    }
                    .sig-block {
                        width: 250px;
                        text-align: center;
                        font-size: 12px;
                    }
                    .sig-line {
                        border-top: 1px solid #94a3b8;
                        margin-bottom: 5px;
                    }
                    .sig-title {
                        font-weight: bold;
                        color: #0f172a;
                    }
                    .sig-subtitle {
                        color: #64748b;
                        font-size: 10px;
                        text-transform: uppercase;
                    }
                    @media print {
                        body { padding: 20px; }
                        .no-print { display: none; }
                    }
                </style>
            </head>
            <body>
                <div class="header">
                    <div class="logo-area">
                        <div class="logo-text">Odonto<span class="logo-sub">Cloud</span></div>
                    </div>
                    <div class="doc-title">
                        <h1>${doc.tipoDocumento} Médica</h1>
                        <p>Registro Clínico Oficial</p>
                    </div>
                </div>

                <div class="patient-card">
                    <div class="info-group">
                        <div class="info-label">Paciente</div>
                        <div class="info-value">${patient.nombreCompleto || ''}</div>
                    </div>
                    <div class="info-group">
                        <div class="info-label">Documento Identidad</div>
                        <div class="info-value">${patient.tipoDocumento || 'C.C.'} ${patient.nroDocumento || ''}</div>
                    </div>
                    <div class="info-group">
                        <div class="info-label">Nro. Historia</div>
                        <div class="info-value">#${patient.nroHistoria || 'S/N'}</div>
                    </div>
                    <div class="info-group">
                        <div class="info-label">Fecha Emisión</div>
                        <div class="info-value">${new Date(doc.fechaIso).toLocaleString('es-ES')}</div>
                    </div>
                </div>

                ${contentHtml}

                <div class="footer-sig">
                    <div class="sig-block">
                        <div class="sig-line"></div>
                        <div class="sig-title">${doc.profesional || ''}</div>
                        <div class="sig-subtitle">Profesional Tratante</div>
                    </div>
                    <div class="sig-block">
                        <div class="sig-line"></div>
                        <div class="sig-title">${doc.transcribe || ''}</div>
                        <div class="sig-subtitle">Transcriptor / Auxiliar</div>
                    </div>
                </div>

                <script>
                    window.onload = function() {
                        window.print();
                        setTimeout(function() { window.close(); }, 500);
                    };
                </script>
            </body>
            </html>
        `);
        printWindow.document.close();
    };

    const handlePrintFullHistory = async () => {
        toast.info("Generando historia clínica completa para impresión...");
        let anamnesis = {};
        try {
            anamnesis = await getAnamnesis(patient.id);
        } catch (e) {
            console.error("Error fetching anamnesis for print", e);
        }

        const printWindow = window.open("", "_blank");
        if (!printWindow) {
            toast.error("Por favor permite los popups en este sitio para poder imprimir.");
            return;
        }

        printWindow.document.write(`
            <html>
            <head>
                <title>Historia Clínica - ${patient.nombreCompleto || ''}</title>
                <style>
                    body {
                        font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
                        color: #1e293b;
                        padding: 40px;
                        max-width: 900px;
                        margin: 0 auto;
                        line-height: 1.5;
                    }
                    .header {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        border-bottom: 2px solid #e2e8f0;
                        padding-bottom: 20px;
                        margin-bottom: 25px;
                    }
                    .logo-area {
                        display: flex;
                        align-items: center;
                        gap: 10px;
                    }
                    .logo-text {
                        font-size: 24px;
                        font-weight: 900;
                        color: #1e3a8a;
                        letter-spacing: -0.05em;
                    }
                    .logo-sub {
                        color: #8CC63F;
                    }
                    .doc-title {
                        text-align: right;
                    }
                    .doc-title h1 {
                        font-size: 18px;
                        font-weight: 800;
                        text-transform: uppercase;
                        margin: 0;
                        color: #0f172a;
                    }
                    .doc-title p {
                        font-size: 10px;
                        font-weight: 700;
                        color: #64748b;
                        text-transform: uppercase;
                        margin: 5px 0 0 0;
                        letter-spacing: 0.1em;
                    }
                    .patient-card {
                        background: #f8fafc;
                        border: 1px solid #e2e8f0;
                        border-radius: 16px;
                        padding: 20px;
                        margin-bottom: 30px;
                        display: grid;
                        grid-template-columns: repeat(3, 1fr);
                        gap: 12px;
                    }
                    .info-group {
                        font-size: 13px;
                    }
                    .info-label {
                        font-size: 9px;
                        font-weight: 800;
                        text-transform: uppercase;
                        color: #64748b;
                        letter-spacing: 0.05em;
                        margin-bottom: 2px;
                    }
                    .info-value {
                        font-weight: 700;
                        color: #334155;
                    }
                    .section-title {
                        font-size: 12px;
                        font-weight: 800;
                        text-transform: uppercase;
                        color: #0f172a;
                        letter-spacing: 0.05em;
                        background: #f1f5f9;
                        padding: 6px 12px;
                        margin-top: 30px;
                        margin-bottom: 15px;
                        border-radius: 6px;
                    }
                    .anamnesis-grid {
                        display: grid;
                        grid-template-columns: 1fr;
                        gap: 15px;
                        margin-bottom: 30px;
                    }
                    .anamnesis-item {
                        border-bottom: 1px solid #f1f5f9;
                        padding-bottom: 10px;
                    }
                    .anamnesis-title {
                        font-size: 11px;
                        font-weight: 800;
                        color: #475569;
                        text-transform: uppercase;
                        margin-bottom: 4px;
                    }
                    .anamnesis-content {
                        font-size: 13px;
                        color: #1e293b;
                        white-space: pre-wrap;
                    }
                    .document-item {
                        border: 1px solid #e2e8f0;
                        border-radius: 12px;
                        padding: 15px;
                        margin-bottom: 15px;
                        page-break-inside: avoid;
                    }
                    .document-header {
                        display: flex;
                        justify-content: space-between;
                        font-size: 12px;
                        font-weight: bold;
                        border-bottom: 1px solid #f1f5f9;
                        padding-bottom: 8px;
                        margin-bottom: 10px;
                        color: #475569;
                    }
                    .document-type {
                        color: #1e3a8a;
                        text-transform: uppercase;
                    }
                    .document-body {
                        font-size: 12px;
                        color: #334155;
                        white-space: pre-wrap;
                    }
                    .receta-table {
                        width: 100%;
                        border-collapse: collapse;
                        margin-top: 8px;
                    }
                    .receta-table th {
                        background: #f8fafc;
                        font-size: 9px;
                        padding: 6px 10px;
                        text-align: left;
                    }
                    .receta-table td {
                        padding: 6px 10px;
                        font-size: 11px;
                    }
                    @media print {
                        body { padding: 20px; }
                        .no-print { display: none; }
                    }
                </style>
            </head>
            <body>
                <div class="header">
                    <div class="logo-area">
                        <div class="logo-text">Odonto<span class="logo-sub">Cloud</span></div>
                    </div>
                    <div class="doc-title">
                        <h1>Historia Clínica Odontológica</h1>
                        <p>Expediente Completo</p>
                    </div>
                </div>

                <div class="patient-card">
                    <div class="info-group">
                        <div class="info-label">Nombre Completo</div>
                        <div class="info-value">${patient.nombreCompleto || ''}</div>
                    </div>
                    <div class="info-group">
                        <div class="info-label">Identificación</div>
                        <div class="info-value">${patient.tipoDocumento || 'C.C.'} ${patient.nroDocumento || ''}</div>
                    </div>
                    <div class="info-group">
                        <div class="info-label">Nro. Historia</div>
                        <div class="info-value">#${patient.nroHistoria || 'S/N'}</div>
                    </div>
                    <div class="info-group">
                        <div class="info-label">Celular</div>
                        <div class="info-value">${patient.celular || 'No registrado'}</div>
                    </div>
                    <div class="info-group">
                        <div class="info-label">Correo Electrónico</div>
                        <div class="info-value">${patient.email || 'No registrado'}</div>
                    </div>
                    <div class="info-group">
                        <div class="info-label">Edad</div>
                        <div class="info-value">${patient.edad || 'No registrada'}</div>
                    </div>
                    <div class="info-group">
                        <div class="info-label">EPS</div>
                        <div class="info-value">${patient.nombreEps || 'Particular'}</div>
                    </div>
                    <div class="info-group">
                        <div class="info-label">Tipo Vinculación</div>
                        <div class="info-value">${patient.tipoVinculacion || 'N/A'}</div>
                    </div>
                    <div class="info-group">
                        <div class="info-label">Fecha de Ingreso</div>
                        <div class="info-value">${patient.fechaIngreso || 'No registrada'}</div>
                    </div>
                </div>

                <div class="section-title">Anamnesis y Antecedentes</div>
                <div class="anamnesis-grid">
                    <div class="anamnesis-item">
                        <div class="anamnesis-title">Diagnóstico Principal (CIE-10)</div>
                        <div class="anamnesis-content">${anamnesis.diagnosticoPrincipal || 'Ninguno'}</div>
                    </div>
                    <div class="anamnesis-item">
                        <div class="anamnesis-title">Motivo de Consulta</div>
                        <div class="anamnesis-content">${anamnesis.motivoConsulta || 'No registrado'}</div>
                    </div>
                    <div class="anamnesis-item">
                        <div class="anamnesis-title">Antecedentes Médicos</div>
                        <div class="anamnesis-content">${anamnesis.antecedentes || 'No registrados'}</div>
                    </div>
                    <div class="anamnesis-item">
                        <div class="anamnesis-title">Alergias</div>
                        <div class="anamnesis-content">${anamnesis.alergias || 'No registradas'}</div>
                    </div>
                    <div class="anamnesis-item">
                        <div class="anamnesis-title">Medicamentos Actuales</div>
                        <div class="anamnesis-content">${anamnesis.medicamentos || 'No registrados'}</div>
                    </div>
                    <div class="anamnesis-item">
                        <div class="anamnesis-title">Notas Adicionales</div>
                        <div class="anamnesis-content">${anamnesis.notas || 'Ninguna'}</div>
                    </div>
                </div>

                <div class="section-title">Evoluciones y Documentos Clínicos</div>
                ${documents.length === 0 ? `
                    <p style="font-size: 13px; color: #64748b; font-style: italic;">No se registran documentos clínicos en el historial.</p>
                ` : documents.map(d => `
                    <div class="document-item">
                        <div class="document-header">
                            <div>
                                <span class="document-type">${d.tipoDocumento}</span>
                                <span style="color: #94a3b8; margin: 0 8px;">|</span>
                                <span>Dr(a). ${d.profesional || ''}</span>
                            </div>
                            <div style="color: #64748b;">
                                ${new Date(d.fechaIso).toLocaleString('es-ES')}
                            </div>
                        </div>
                        <div class="document-body">
                            ${d.tipoDocumento === 'Receta' ? `
                                <table class="receta-table">
                                    <thead>
                                        <tr>
                                            <th>Principio Activo</th>
                                            <th>Dosis</th>
                                            <th>Frecuencia</th>
                                            <th>Vía</th>
                                            <th>Duración</th>
                                            <th>Cant.</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${(d.recetaItems || []).map(it => `
                                            <tr>
                                                <td><strong>${it.principioActivo}</strong>${it.marca && it.marca !== '-' ? ` (${it.marca})` : ''}</td>
                                                <td>${it.dosis}</td>
                                                <td>${it.frecuencia}</td>
                                                <td>${it.viaAdministracion}</td>
                                                <td>${it.duracion}</td>
                                                <td>${it.cantidad}</td>
                                            </tr>
                                        `).join('')}
                                    </tbody>
                                </table>
                            ` : (d.contenido || '').replace(/\n/g, '<br/>')}
                        </div>
                    </div>
                `).join('')}

                <script>
                    window.onload = function() {
                        window.print();
                        setTimeout(function() { window.close(); }, 500);
                    };
                </script>
            </body>
            </html>
        `);
        printWindow.document.close();
    };

    const handlePrintPartial = () => {
        const printWindow = window.open("", "_blank");
        if (!printWindow) {
            toast.error("Por favor permite los popups en este sitio para poder imprimir.");
            return;
        }

        printWindow.document.write(`
            <html>
            <head>
                <title>Reporte de Historia Clínica - ${patient.nombreCompleto || ''}</title>
                <style>
                    body {
                        font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
                        color: #1e293b;
                        padding: 40px;
                        max-width: 900px;
                        margin: 0 auto;
                        line-height: 1.5;
                    }
                    .header {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        border-bottom: 2px solid #e2e8f0;
                        padding-bottom: 20px;
                        margin-bottom: 25px;
                    }
                    .logo-area {
                        display: flex;
                        align-items: center;
                        gap: 10px;
                    }
                    .logo-text {
                        font-size: 24px;
                        font-weight: 900;
                        color: #1e3a8a;
                        letter-spacing: -0.05em;
                    }
                    .logo-sub {
                        color: #8CC63F;
                    }
                    .doc-title {
                        text-align: right;
                    }
                    .doc-title h1 {
                        font-size: 18px;
                        font-weight: 800;
                        text-transform: uppercase;
                        margin: 0;
                        color: #0f172a;
                    }
                    .doc-title p {
                        font-size: 10px;
                        font-weight: 700;
                        color: #64748b;
                        text-transform: uppercase;
                        margin: 5px 0 0 0;
                        letter-spacing: 0.1em;
                    }
                    .patient-card {
                        background: #f8fafc;
                        border: 1px solid #e2e8f0;
                        border-radius: 16px;
                        padding: 20px;
                        margin-bottom: 30px;
                        display: grid;
                        grid-template-columns: repeat(3, 1fr);
                        gap: 12px;
                    }
                    .info-group {
                        font-size: 13px;
                    }
                    .info-label {
                        font-size: 9px;
                        font-weight: 800;
                        text-transform: uppercase;
                        color: #64748b;
                        letter-spacing: 0.05em;
                        margin-bottom: 2px;
                    }
                    .info-value {
                        font-weight: 700;
                        color: #334155;
                    }
                    .section-title {
                        font-size: 12px;
                        font-weight: 800;
                        text-transform: uppercase;
                        color: #0f172a;
                        letter-spacing: 0.05em;
                        background: #f1f5f9;
                        padding: 6px 12px;
                        margin-top: 30px;
                        margin-bottom: 15px;
                        border-radius: 6px;
                    }
                    .document-item {
                        border: 1px solid #e2e8f0;
                        border-radius: 12px;
                        padding: 15px;
                        margin-bottom: 15px;
                        page-break-inside: avoid;
                    }
                    .document-header {
                        display: flex;
                        justify-content: space-between;
                        font-size: 12px;
                        font-weight: bold;
                        border-bottom: 1px solid #f1f5f9;
                        padding-bottom: 8px;
                        margin-bottom: 10px;
                        color: #475569;
                    }
                    .document-type {
                        color: #1e3a8a;
                        text-transform: uppercase;
                    }
                    .document-body {
                        font-size: 12px;
                        color: #334155;
                        white-space: pre-wrap;
                    }
                    .receta-table {
                        width: 100%;
                        border-collapse: collapse;
                        margin-top: 8px;
                    }
                    .receta-table th {
                        background: #f8fafc;
                        font-size: 9px;
                        padding: 6px 10px;
                        text-align: left;
                    }
                    .receta-table td {
                        padding: 6px 10px;
                        font-size: 11px;
                    }
                    @media print {
                        body { padding: 20px; }
                        .no-print { display: none; }
                    }
                </style>
            </head>
            <body>
                <div class="header">
                    <div class="logo-area">
                        <div class="logo-text">Odonto<span class="logo-sub">Cloud</span></div>
                    </div>
                    <div class="doc-title">
                        <h1>Impresión Parcial de Historia</h1>
                        <p>Reporte de Documentos Filtrados</p>
                    </div>
                </div>

                <div class="patient-card">
                    <div class="info-group">
                        <div class="info-label">Nombre Completo</div>
                        <div class="info-value">${patient.nombreCompleto || ''}</div>
                    </div>
                    <div class="info-group">
                        <div class="info-label">Identificación</div>
                        <div class="info-value">${patient.tipoDocumento || 'C.C.'} ${patient.nroDocumento || ''}</div>
                    </div>
                    <div class="info-group">
                        <div class="info-label">Nro. Historia</div>
                        <div class="info-value">#${patient.nroHistoria || 'S/N'}</div>
                    </div>
                </div>

                <div class="section-title">Documentos Seleccionados / Filtrados</div>
                ${filteredDocs.length === 0 ? `
                    <p style="font-size: 13px; color: #64748b; font-style: italic;">No se registran documentos coincidentes con los filtros aplicados.</p>
                ` : filteredDocs.map(d => `
                    <div class="document-item">
                        <div class="document-header">
                            <div>
                                <span class="document-type">${d.tipoDocumento}</span>
                                <span style="color: #94a3b8; margin: 0 8px;">|</span>
                                <span>Dr(a). ${d.profesional || ''}</span>
                            </div>
                            <div style="color: #64748b;">
                                ${new Date(d.fechaIso).toLocaleString('es-ES')}
                            </div>
                        </div>
                        <div class="document-body">
                            ${d.tipoDocumento === 'Receta' ? `
                                <table class="receta-table">
                                    <thead>
                                        <tr>
                                            <th>Principio Activo</th>
                                            <th>Dosis</th>
                                            <th>Frecuencia</th>
                                            <th>Vía</th>
                                            <th>Duración</th>
                                            <th>Cant.</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${(d.recetaItems || []).map(it => `
                                            <tr>
                                                <td><strong>${it.principioActivo}</strong>${it.marca && it.marca !== '-' ? ` (${it.marca})` : ''}</td>
                                                <td>${it.dosis}</td>
                                                <td>${it.frecuencia}</td>
                                                <td>${it.viaAdministracion}</td>
                                                <td>${it.duracion}</td>
                                                <td>${it.cantidad}</td>
                                            </tr>
                                        `).join('')}
                                    </tbody>
                                </table>
                            ` : (d.contenido || '').replace(/\n/g, '<br/>')}
                        </div>
                    </div>
                `).join('')}

                <script>
                    window.onload = function() {
                        window.print();
                        setTimeout(function() { window.close(); }, 500);
                    };
                </script>
            </body>
            </html>
        `);
        printWindow.document.close();
    };

    // Filter logic
    const filteredDocs = documents.filter(d => {
        const dFecha = new Date(d.fechaIso).toLocaleDateString().toLowerCase();
        if (filterFecha && !dFecha.includes(filterFecha.toLowerCase())) return false;
        if (filterTipo && !d.tipoDocumento?.toLowerCase().includes(filterTipo.toLowerCase())) return false;
        if (filterProf && !d.profesional?.toLowerCase().includes(filterProf.toLowerCase())) return false;
        if (filterTrans && !d.transcribe?.toLowerCase().includes(filterTrans.toLowerCase())) return false;
        
        if (searchTerm) {
            const lowerTerm = searchTerm.toLowerCase();
            const matchesTipo = d.tipoDocumento?.toLowerCase().includes(lowerTerm);
            const matchesProf = d.profesional?.toLowerCase().includes(lowerTerm);
            const matchesTrans = d.transcribe?.toLowerCase().includes(lowerTerm);
            const matchesContenido = d.contenido?.toLowerCase().includes(lowerTerm);
            const matchesDiagnostico = d.diagnostico?.toLowerCase().includes(lowerTerm);
            if (!matchesTipo && !matchesProf && !matchesTrans && !matchesContenido && !matchesDiagnostico) return false;
        }
        
        return true;
    });


    if (!patient) return <div className="p-8 text-center text-slate-400">Cargando paciente...</div>;

    return (
        <div className="flex flex-col h-full bg-slate-50 min-h-0 animate-fadeIn relative">
            <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
                
                {/* Header Actions */}
                <div className="flex justify-end gap-3 mb-8">
                    <button onClick={handlePrintFullHistory} className="px-6 py-2.5 bg-[#8CC63F] hover:bg-[#7bb335] text-white rounded-full font-black text-[11px] uppercase tracking-widest shadow-lg shadow-[#8CC63F]/20 flex items-center gap-2 transition-all active:scale-95">
                        Imprimir historia clínica
                    </button>
                    <button onClick={handlePrintPartial} className="px-6 py-2.5 bg-[#8CC63F] hover:bg-[#7bb335] text-white rounded-full font-black text-[11px] uppercase tracking-widest shadow-lg shadow-[#8CC63F]/20 flex items-center gap-2 transition-all active:scale-95">
                        Impresión parcial
                    </button>
                </div>

                {/* Main Content Card */}
                <div className="bg-white rounded-[24px] border border-slate-100 shadow-sm p-6 md:p-8">
                    
                    {/* Creation Buttons Block */}
                    <div className="flex justify-end mb-10">
                        <div className="grid grid-cols-2 gap-3 max-w-sm w-full">
                            <button onClick={() => handleOpenModal("Receta")} className="bg-[#8CC63F] hover:bg-[#7bb335] text-white rounded-full py-2 px-4 font-black text-[11px] uppercase tracking-widest flex items-center justify-center gap-1.5 transition-colors shadow-sm">
                                <FiPlus size={14} /> Nueva receta
                            </button>
                            <button onClick={() => handleOpenModal("Orden")} className="bg-[#8CC63F] hover:bg-[#7bb335] text-white rounded-full py-2 px-4 font-black text-[11px] uppercase tracking-widest flex items-center justify-center gap-1.5 transition-colors shadow-sm">
                                <FiPlus size={14} /> Nueva orden
                            </button>
                            <button onClick={() => handleOpenModal("Consulta")} className="bg-[#8CC63F] hover:bg-[#7bb335] text-white rounded-full py-2 px-4 font-black text-[11px] uppercase tracking-widest flex items-center justify-center gap-1.5 transition-colors shadow-sm">
                                <FiPlus size={14} /> Nueva consulta
                            </button>
                            <button onClick={() => handleOpenModal("Alerta")} className="bg-[#8CC63F] hover:bg-[#7bb335] text-white rounded-full py-2 px-4 font-black text-[11px] uppercase tracking-widest flex items-center justify-center gap-1.5 transition-colors shadow-sm">
                                <FiPlus size={14} /> Nueva alerta
                            </button>
                            <div className="col-start-2">
                                <button onClick={() => handleOpenModal("Plantilla")} className="w-full bg-[#8CC63F] hover:bg-[#7bb335] text-white rounded-full py-2 px-4 font-black text-[11px] uppercase tracking-widest flex items-center justify-center gap-1.5 transition-colors shadow-sm">
                                    <FiPlus size={14} /> Nueva plantilla
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Table Toolbar */}
                    <div className="flex justify-end mb-4">
                        <div className="relative w-64">
                            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input 
                                type="text" 
                                placeholder="Buscar..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-medium text-slate-600"
                            />
                        </div>
                    </div>

                    {/* Elite Table */}
                    <div className="overflow-x-auto rounded-xl border border-slate-100 pb-1">
                        <table className="min-w-[900px] w-full text-left border-collapse">
                            <thead>
                                <tr>
                                    <th className="bg-slate-50 border-b border-slate-100 px-4 py-3 align-top min-w-[120px]">
                                        <div className="font-bold text-[10px] uppercase tracking-widest text-slate-400 mb-2 flex items-center gap-1">Fecha <FiSearch size={10} /></div>
                                        <input type="text" value={filterFecha} onChange={(e) => setFilterFecha(e.target.value)} className="w-full text-xs p-1 border border-slate-200 rounded outline-none focus:border-blue-400" />
                                    </th>
                                    <th className="bg-slate-50 border-b border-slate-100 px-4 py-3 align-top min-w-[200px]">
                                        <div className="font-bold text-[10px] uppercase tracking-widest text-slate-400 mb-2">Tipo documento</div>
                                        <div className="relative">
                                            <FiSearch size={10} className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400" />
                                            <input type="text" value={filterTipo} onChange={(e) => setFilterTipo(e.target.value)} className="w-full text-xs pl-6 p-1 border border-slate-200 rounded outline-none focus:border-blue-400" />
                                        </div>
                                    </th>
                                    <th className="bg-slate-50 border-b border-slate-100 px-4 py-3 align-top min-w-[200px]">
                                        <div className="font-bold text-[10px] uppercase tracking-widest text-slate-400 mb-2">Profesional</div>
                                        <div className="relative">
                                            <FiSearch size={10} className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400" />
                                            <input type="text" value={filterProf} onChange={(e) => setFilterProf(e.target.value)} className="w-full text-xs pl-6 p-1 border border-slate-200 rounded outline-none focus:border-blue-400" />
                                        </div>
                                    </th>
                                    <th className="bg-slate-50 border-b border-slate-100 px-4 py-3 align-top min-w-[200px]">
                                        <div className="font-bold text-[10px] uppercase tracking-widest text-slate-400 mb-2 flex items-center gap-1"><FiEdit2 size={10} className="text-slate-400" /> Transcribe</div>
                                        <input type="text" value={filterTrans} onChange={(e) => setFilterTrans(e.target.value)} className="w-full text-xs p-1 border border-slate-200 rounded outline-none focus:border-blue-400" />
                                    </th>
                                    <th className="bg-slate-50 border-b border-slate-100 px-3 py-3 align-top w-[160px] min-w-[160px] shrink-0">
                                        <div className="font-bold text-[10px] uppercase tracking-widest text-slate-400 mb-2">Acciones</div>
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {filteredDocs.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-4 py-12 text-center text-slate-400 text-sm font-medium">
                                            No se encontraron documentos clínicos.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredDocs.map(doc => (
                                        <tr key={doc.id} className="hover:bg-slate-50/50 transition-colors group">
                                            <td className="px-4 py-4 align-top">
                                                <div className="text-xs font-medium text-slate-600">
                                                    {new Date(doc.fechaIso).toLocaleDateString('es-ES')}
                                                </div>
                                                <div className="text-[10px] text-slate-400 mt-0.5">
                                                    {new Date(doc.fechaIso).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                            </td>
                                            <td className="px-4 py-4 align-top">
                                                <div className="text-sm font-medium text-slate-700">{doc.tipoDocumento}</div>
                                                {doc.diagnostico && <div className="text-[10px] font-bold uppercase tracking-widest text-indigo-500 mt-1 truncate max-w-[200px]">{doc.diagnostico}</div>}
                                            </td>
                                            <td className="px-4 py-4 align-top">
                                                <div className="text-sm text-slate-600 truncate max-w-[200px]">{doc.profesional}</div>
                                            </td>
                                            <td className="px-4 py-4 align-top">
                                                <div className="text-sm text-slate-500 truncate max-w-[200px]">{doc.transcribe}</div>
                                            </td>
                                            <td className="px-3 py-3 align-middle w-[160px] min-w-[160px] shrink-0">
                                                <div className="flex items-center flex-nowrap gap-1">
                                                    <button onClick={() => handleViewDoc(doc)} className="w-6 h-6 bg-blue-100 hover:bg-blue-200 text-blue-600 rounded-lg flex items-center justify-center transition-colors shrink-0" title="Ver detalle">
                                                        <FiEye size={11} strokeWidth={2.5} />
                                                    </button>
                                                    <button onClick={() => handlePrintDoc(doc)} className="w-6 h-6 bg-cyan-100 hover:bg-cyan-200 text-cyan-600 rounded-lg flex items-center justify-center transition-colors shrink-0" title="Imprimir/Descargar">
                                                        <FiDownload size={11} strokeWidth={2.5} />
                                                    </button>
                                                    <button onClick={() => handleEditDoc(doc)} className="w-6 h-6 bg-emerald-100 hover:bg-emerald-200 text-emerald-600 rounded-lg flex items-center justify-center transition-colors shrink-0" title="Editar">
                                                        <FiEdit2 size={11} strokeWidth={2.5} />
                                                    </button>
                                                    {doc.tipoDocumento === "Receta" && (
                                                        <button 
                                                            onClick={() => handleSignPrescription(doc)} 
                                                            className={`w-6 h-6 rounded-lg flex items-center justify-center transition-colors shrink-0 ${
                                                                (doc.recetaItems || []).length > 0 && (doc.recetaItems || []).every(item => item.doctorSignature)
                                                                    ? 'bg-indigo-500 hover:bg-indigo-600 text-white' 
                                                                    : 'bg-violet-100 hover:bg-violet-200 text-violet-600'
                                                            }`} 
                                                            title="Firmar Receta"
                                                        >
                                                            <FiPenTool size={11} strokeWidth={2.5} />
                                                        </button>
                                                    )}
                                                    <button onClick={() => handleDeleteDoc(doc.id)} className="w-6 h-6 bg-rose-100 hover:bg-rose-200 text-rose-500 rounded-lg flex items-center justify-center transition-colors shrink-0" title="Eliminar">
                                                        <FiTrash2 size={11} strokeWidth={2.5} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                </div>
            </div>

            <DocClinicoModal 
                isOpen={modalOpen} 
                onClose={() => {
                    setModalOpen(false);
                    setEditingDoc(null);
                }} 
                patient={patient} 
                docType={selectedDocType} 
                initialData={editingDoc}
                isViewOnly={isViewOnly}
            />

            {/* Modal: Confirmar Firma Digital de Receta */}
            {signModal.isOpen && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[10000] flex items-center justify-center p-4">
                    <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-md overflow-hidden animate-fadeIn border border-violet-100">
                        <div className="p-8 text-center">
                            <div className="w-20 h-20 bg-violet-50 rounded-full flex items-center justify-center text-violet-500 mx-auto mb-6">
                                <FiPenTool size={36} />
                            </div>
                            <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight mb-2">
                                ¿Firmar Receta Digitalmente?
                            </h3>
                            <p className="text-slate-500 text-sm font-medium leading-relaxed mb-8">
                                Se firmará digitalmente con tu nombre de usuario (<strong>{userProfile?.nombreCompleto || userProfile?.nombre || "Doctor"}</strong>) todos los medicamentos de esta receta. Esta acción quedará registrada.
                            </p>
                            <div className="flex flex-col gap-3">
                                <button 
                                    onClick={confirmSignPrescription}
                                    className="w-full py-4 bg-violet-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-violet-200 hover:bg-violet-700 transition-all active:scale-95"
                                >
                                    ✅ SÍ, FIRMAR DIGITALMENTE
                                </button>
                                <button 
                                    onClick={() => setSignModal({ isOpen: false, doc: null })}
                                    className="w-full py-4 bg-slate-100 text-slate-500 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-all"
                                >
                                    CANCELAR
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal: Confirmar Eliminación de Documento Clínico */}
            {deleteModal.isOpen && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[10000] flex items-center justify-center p-4">
                    <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-md overflow-hidden animate-fadeIn border border-rose-100">
                        <div className="p-8 text-center">
                            <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center text-rose-500 mx-auto mb-6 animate-pulse">
                                <FiTrash2 size={40} />
                            </div>
                            <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight mb-2">
                                ¿Eliminar Documento?
                            </h3>
                            <p className="text-slate-500 text-sm font-medium leading-relaxed mb-8">
                                Estás a punto de eliminar este documento clínico. Esta acción <strong>no se puede deshacer</strong>.
                            </p>
                            <div className="flex flex-col gap-3">
                                <button 
                                    onClick={confirmDeleteDoc}
                                    className="w-full py-4 bg-rose-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-rose-200 hover:bg-rose-700 transition-all active:scale-95"
                                >
                                    SÍ, ELIMINAR PERMANENTEMENTE
                                </button>
                                <button 
                                    onClick={() => setDeleteModal({ isOpen: false, docId: null })}
                                    className="w-full py-4 bg-slate-100 text-slate-500 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-all"
                                >
                                    NO, CANCELAR
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
