import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { toast } from "sonner";

/**
 * BudgetPrintService
 * Generates professional institutional PDF documents for Budgets and Treatment Plans.
 */
export const BudgetPrintService = {
    
    generatePDF: async (plan, patient, clinic) => {
        if (!plan || !patient || !clinic) {
            console.error("Missing data for PDF generation:", { plan, patient, clinic });
            toast.error("Datos insuficientes para generar el documento");
            return;
        }

        const toastId = toast.loading("Generando documento institucional...");

        try {
            // 1. Create hidden container
            const printElement = document.createElement("div");
            printElement.className = "budget-print-export";
            printElement.style.position = "absolute";
            printElement.style.left = "-9999px";
            printElement.style.top = "0";
            printElement.style.width = "900px"; // Size for A4 portrait
            printElement.style.padding = "50px";
            printElement.style.backgroundColor = "white";
            printElement.style.color = "#1e293b";
            printElement.style.fontFamily = "'Inter', system-ui, -apple-system, sans-serif";

            // 2. Data Preparation
            const date = plan.date ? new Date(plan.date) : new Date();
            const formattedDate = date.toLocaleDateString("es-CO", { day: 'numeric', month: 'long', year: 'numeric' });
            
            const subtotal = plan.subtotal || plan.items?.reduce((acc, i) => acc + (i.amount * i.qty), 0) || 0;
            const discount = plan.totalDescuento || plan.items?.reduce((acc, i) => acc + (i.descuento || 0), 0) || 0;
            const total = plan.total || (subtotal - discount);

            // 2.5 Resolve Patient Info with extreme robustness
            // Sometimes patient comes from Firestore doc, sometimes from form watch, sometimes from list search
            const pName = (patient?.nombreCompleto || patient?.NombreCompleto || patient?.paciente || patient?.Paciente || "").toString().trim() || 
                         (patient?.nombres ? `${patient.nombres} ${patient.apellidos || ""}`.trim() : "") ||
                         (patient?.Nombres ? `${patient.Nombres} ${patient.Apellidos || ""}`.trim() : "") ||
                         (patient?.nombre || patient?.name || "").toString().trim() ||
                         (Object.keys(patient || {}).find(k => k.toLowerCase().includes('nombre') && typeof patient[k] === 'string' && patient[k].length > 2) ? patient[Object.keys(patient).find(k => k.toLowerCase().includes('nombre') && typeof patient[k] === 'string' && patient[k].length > 2)] : "") ||
                         "Paciente Desconocido";
            
            const pDoc = patient?.nroDocumento || 
                        patient?.documento || 
                        patient?.nroHistoria ||
                        patient?.id || 
                        "---";
            
            const pPhone = patient?.celular || 
                          patient?.telefono || 
                          patient?.celularPaciente || 
                          patient?.telDomicilio ||
                          "---";
            
            const clinicName = clinic?.nombreComercial || clinic?.nombre || clinic?.name || "Clínica Odontológica";
            const clinicNit = clinic?.nit || clinic?.NIT || "---";

            // 2.7 Resolve Professional Name & Role (Doctor vs Admin)
            let profDisplayName = plan.profesional || "";
            // If the plan profissional matches clinic name or is empty, try to get it from current user or fallback
            if (!profDisplayName || profDisplayName.toUpperCase() === (clinic?.nombre || "").toUpperCase()) {
                profDisplayName = userProfile?.nombre || userProfile?.name || "---";
            }
            
            // Determine if it's a doctor or admin (Maria Royo is admin)
            const isDoctor = userProfile?.rol?.toLowerCase() === 'doctor' || 
                             userProfile?.rol?.toLowerCase() === 'profesional' || 
                             plan.profesionalId?.toLowerCase().includes('doc') ||
                             profDisplayName.toLowerCase().includes('dr.');
            
            const roleLabel = isDoctor ? "Atendido por" : "Elaborado por";
            
            // Clean name and apply "DR." only if it's a doctor
            profDisplayName = profDisplayName.replace(/^DR\.?\s+/i, "");
            if (isDoctor) profDisplayName = `DR. ${profDisplayName}`;

            // 3. Template HTML
            const headerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 4px solid #2563eb; padding-bottom: 25px; margin-bottom: 30px;">
                    <div style="display: flex; gap: 25px; align-items: center;">
                        ${clinic?.logo 
                            ? `<img src="${clinic.logo}" style="width: 100px; height: 100px; object-fit: contain; border-radius: 16px;" />`
                            : `<div style="width: 100px; height: 100px; background: #2563eb; border-radius: 16px; display: flex; align-items: center; justify-content: center; color: white; font-size: 42px; font-weight: 900;">${clinic?.nombre?.substring(0, 1) || "O"}</div>`
                        }
                        <div>
                            <h1 style="margin: 0; font-size: 28px; font-weight: 900; color: #0f172a; text-transform: uppercase; letter-spacing: -1px;">${clinicName}</h1>
                            <p style="margin: 4px 0; font-size: 13px; color: #475569; font-weight: 800;">NIT: ${clinicNit}</p>
                            <p style="margin: 2px 0; font-size: 12px; color: #64748b; font-weight: 500;">${clinic?.direccion || "---"}</p>
                            <p style="margin: 2px 0; font-size: 12px; color: #64748b; font-weight: 500;">TEL: ${clinic?.telefono || "---"} | ${clinic?.email || ""}</p>
                        </div>
                    </div>
                    <div style="text-align: right;">
                        <div style="background: #eff6ff; padding: 12px 20px; border-radius: 16px; border: 2px solid #dbeafe; margin-bottom: 8px;">
                            <span style="font-size: 16px; font-weight: 900; color: #1d4ed8; text-transform: uppercase;">${plan.type === 'plan' ? 'PLAN DE TRATAMIENTO' : 'PRESUPUESTO ODONTOLÓGICO'}</span>
                        </div>
                        <p style="margin: 0; font-size: 11px; color: #94a3b8; font-weight: 900; text-transform: uppercase;">FECHA DE EMISIÓN: ${formattedDate}</p>
                        <p style="margin: 4px 0; font-size: 11px; color: #94a3b8; font-weight: 900; text-transform: uppercase;">PACIENTE DOC: ${pDoc}</p>
                    </div>
                </div>
            `;

            const patientInfoHTML = `
                <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 20px; margin-bottom: 25px; display: grid; grid-template-columns: 1.2fr 1fr; gap: 20px;">
                    <div style="border-right: 1px solid #f1f5f9; padding-right: 20px;">
                        <span style="font-size: 8px; font-weight: 800; color: #94a3b8; text-transform: uppercase; letter-spacing: 1.5px; display: block; margin-bottom: 6px;">Información del Paciente</span>
                        <h2 style="margin: 0; font-size: 15px; font-weight: 900; color: #1e293b; text-transform: uppercase; letter-spacing: 0.5px;">${pName}</h2>
                        <div style="display: grid; grid-template-columns: 1fr; gap: 4px; margin-top: 10px;">
                            <p style="margin: 0; font-size: 11px; color: #64748b; font-weight: 600;"><strong style="color: #94a3b8; font-size: 9px; text-transform: uppercase; margin-right: 5px;">ID / DOC:</strong> ${patient?.tipoDocumento || ""} ${pDoc}</p>
                            <p style="margin: 0; font-size: 11px; color: #64748b; font-weight: 600;"><strong style="color: #94a3b8; font-size: 9px; text-transform: uppercase; margin-right: 5px;">Celular:</strong> ${pPhone}</p>
                        </div>
                    </div>
                    <div style="padding-left: 10px;">
                        <span style="font-size: 8px; font-weight: 800; color: #94a3b8; text-transform: uppercase; letter-spacing: 1.5px; display: block; margin-bottom: 6px;">${roleLabel}</span>
                        <h3 style="margin: 0; font-size: 14px; font-weight: 900; color: #1e293b; text-transform: uppercase;">${profDisplayName}</h3>
                        <p style="margin: 6px 0 0 0; font-size: 11px; color: #64748b; font-weight: 600;"><strong style="color: #94a3b8; font-size: 9px; text-transform: uppercase; margin-right: 5px;">Cargo:</strong> ${userProfile?.rol || "---"}</p>
                    </div>
                </div>
            `;

            const itemsTableHTML = `
                <div style="margin-bottom: 40px;">
                    <table style="width: 100%; border-collapse: collapse; border-radius: 16px; overflow: hidden; border-style: hidden; box-shadow: 0 0 0 1px #e2e8f0;">
                        <thead>
                            <tr style="background: #2563eb; color: white;">
                                <th style="padding: 15px; text-align: left; font-size: 11px; font-weight: 900; text-transform: uppercase; letter-spacing: 1px;">Código</th>
                                <th style="padding: 15px; text-align: left; font-size: 11px; font-weight: 900; text-transform: uppercase; letter-spacing: 1px;">Descripción</th>
                                <th style="padding: 15px; text-align: center; font-size: 11px; font-weight: 900; text-transform: uppercase; letter-spacing: 1px;">Dientes</th>
                                <th style="padding: 15px; text-align: center; font-size: 11px; font-weight: 900; text-transform: uppercase; letter-spacing: 1px;">Cant.</th>
                                <th style="padding: 15px; text-align: right; font-size: 11px; font-weight: 900; text-transform: uppercase; letter-spacing: 1px;">V. Unitario</th>
                                <th style="padding: 15px; text-align: right; font-size: 11px; font-weight: 900; text-transform: uppercase; letter-spacing: 1px;">Total</th>
                            </tr>
                        </thead>
                        <tbody style="font-size: 12px; color: #334155; font-weight: 600;">
                            ${plan.items?.map((item, index) => `
                                <tr style="background: ${index % 2 === 0 ? '#ffffff' : '#f8fafc'}; border-bottom: 1px solid #f1f5f9;">
                                    <td style="padding: 14px 15px; color: #2563eb; font-weight: 800; font-family: monospace;">${item.code || "---"}</td>
                                    <td style="padding: 14px 15px;">
                                        <div style="font-weight: 800; text-transform: uppercase;">${item.desc || "---"}</div>
                                        ${item.line_obs ? `<div style="font-size: 10px; color: #94a3b8; font-weight: 500; font-style: italic; margin-top: 2px;">OBS: ${item.line_obs}</div>` : ""}
                                    </td>
                                    <td style="padding: 14px 15px; text-align: center; font-weight: 900; color: #64748b;">${item.dientes || "---"}</td>
                                    <td style="padding: 14px 15px; text-align: center; font-weight: 900;">${item.qty}</td>
                                    <td style="padding: 14px 15px; text-align: right;">$${Number(item.amount).toLocaleString('es-CO')}</td>
                                    <td style="padding: 14px 15px; text-align: right; font-weight: 900; color: #0f172a;">$${(Number(item.amount) * Number(item.qty)).toLocaleString('es-CO')}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            `;

            const summaryHTML = `
                <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 40px; margin-bottom: 60px;">
                    <div style="flex: 1; background: #fdf2f8/50; border: 1px dashed #fce7f3; border-radius: 20px; padding: 20px;">
                        <span style="font-size: 9px; font-weight: 900; color: #be185d; text-transform: uppercase; letter-spacing: 1px; display: block; margin-bottom: 8px;">Términos y Observaciones</span>
                        <p style="margin: 0; font-size: 11px; color: #475569; font-weight: 500; line-height: 1.6; white-space: pre-wrap;">${plan.observaciones || "Este presupuesto tiene una validez de 30 días a partir de la fecha de emisión. Los valores están sujetos a cambios según la evolución clínica del paciente."}</p>
                    </div>
                    <div style="width: 300px; space-y: 8px;">
                        <div style="display: flex; justify-content: space-between; font-size: 12px; font-weight: 700; color: #64748b; margin-bottom: 6px; padding: 0 10px;">
                            <span style="text-transform: uppercase; letter-spacing: 1px;">Subtotal</span>
                            <span>$${subtotal.toLocaleString('es-CO')}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; font-size: 12px; font-weight: 800; color: #e11d48; margin-bottom: 6px; padding: 0 10px;">
                            <span style="text-transform: uppercase; letter-spacing: 1px;">Descuentos</span>
                            <span>-$${discount.toLocaleString('es-CO')}</span>
                        </div>
                        <div style="height: 2px; background: #2563eb; margin: 10px 0;"></div>
                        <div style="display: flex; justify-content: space-between; align-items: center; background: #2563eb; color: white; padding: 15px 20px; border-radius: 16px; box-shadow: 0 10px 15px -3px rgba(37,99,235,0.2);">
                            <span style="font-size: 14px; font-weight: 900; text-transform: uppercase; letter-spacing: 2px;">TOTAL NETO</span>
                            <span style="font-size: 22px; font-weight: 900;">$${total.toLocaleString('es-CO')}</span>
                        </div>
                    </div>
                </div>
            `;

            const footerHTML = `
                <div style="margin-top: 80px; display: flex; justify-content: space-between; gap: 80px; padding: 0 30px;">
                    <div style="flex: 1; border-top: 1px solid #cbd5e1; padding-top: 15px; text-align: center;">
                        <p style="margin: 0; font-size: 12px; font-weight: 900; color: #0f172a; text-transform: uppercase; letter-spacing: 1px;">Aceptado por el Paciente</p>
                        <p style="margin: 4px 0; font-size: 10px; color: #94a3b8; font-weight: 700; text-transform: uppercase;">C.C. / Registro</p>
                    </div>
                    <div style="flex: 1; border-top: 1px solid #cbd5e1; padding-top: 15px; text-align: center;">
                        <p style="margin: 0; font-size: 12px; font-weight: 900; color: #0f172a; text-transform: uppercase; letter-spacing: 1px;">Firma del Especialista</p>
                        <p style="margin: 4px 0; font-size: 10px; color: #94a3b8; font-weight: 700; text-transform: uppercase;">Sello y Registro Médico</p>
                    </div>
                </div>
                <div style="margin-top: 50px; text-align: center; border-top: 1px solid #f1f5f9; padding-top: 20px;">
                    <p style="margin: 0; font-size: 9px; color: #cbd5e1; font-weight: 800; text-transform: uppercase; letter-spacing: 4px;">
                        Documento oficial generado por OdontoCloud Elite Pro
                    </p>
                </div>
            `;

            // 4. Assemble and Append
            printElement.innerHTML = headerHTML + patientInfoHTML + itemsTableHTML + summaryHTML + footerHTML;
            document.body.appendChild(printElement);

            // 5. Generate with html2canvas
            const canvas = await html2canvas(printElement, {
                scale: 2.5, // High resolution
                useCORS: true,
                logging: false,
                backgroundColor: "#ffffff",
                windowWidth: 900
            });

            // 6. Professional PDF construction
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'pt',
                format: 'a4'
            });

            const imgData = canvas.toDataURL('image/jpeg', 0.95);
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
            
            pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');
            
            // 7. Open in New Tab
            const pdfBlob = pdf.output('bloburl');
            window.open(pdfBlob, '_blank');

            // Cleanup
            document.body.removeChild(printElement);
            toast.success("PDF generado con éxito", { id: toastId });

        } catch (error) {
            console.error("Error generating PDF:", error);
            toast.error("Error al generar el documento PDF", { id: toastId });
        }
    }
};
