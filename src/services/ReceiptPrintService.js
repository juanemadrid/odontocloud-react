import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { toast } from "sonner";
import { db } from "../firebase/firebaseConfig";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";

export const ReceiptPrintService = {
    generatePDF: async (pago, patient, clinic, userProfile) => {
        if (!pago || !patient || !clinic) {
            console.error("Missing data for PDF generation:", { pago, patient, clinic });
            toast.error("Datos insuficientes para generar el recibo");
            return;
        }

        const toastId = toast.loading("Generando recibo de caja...");

        try {
            // Fetch plan details dynamically if planId is present
            let totalPlan = "—";
            let totalPagadoPlan = "—";
            let saldoPlan = "—";
            let planTitle = pago.planTitle || "Abono General";

            if (pago.planId) {
                const planSnap = await getDoc(doc(db, "treatment_plans", pago.planId));
                if (planSnap.exists()) {
                    const planData = planSnap.data();
                    totalPlan = Number(planData.total || 0);
                    
                    // Sum payments for this plan
                    const q = query(
                        collection(db, "pagos"),
                        where("planId", "==", pago.planId)
                    );
                    const paymentsSnap = await getDocs(q);
                    const allPayments = paymentsSnap.docs.map(d => d.data());
                    totalPagadoPlan = allPayments.reduce((sum, p) => sum + Number(p.monto || 0), 0);
                    saldoPlan = Math.max(0, totalPlan - totalPagadoPlan);
                }
            }

            // Create hidden container
            const printElement = document.createElement("div");
            printElement.style.position = "absolute";
            printElement.style.left = "-9999px";
            printElement.style.top = "0";
            printElement.style.width = "850px"; // Size for A4 portrait
            printElement.style.padding = "40px";
            printElement.style.backgroundColor = "white";
            printElement.style.color = "#1e293b";
            printElement.style.fontFamily = "'Inter', system-ui, -apple-system, sans-serif";

            // Fetch company configuration (empresa) for actual logo, nit, address, phone etc.
            const tenantId = clinic.inquilino || userProfile?.inquilino || "";
            let dbLogoUrl = "";
            let dbClinicName = "";
            let dbClinicNit = "";
            let dbClinicAddress = "";
            let dbClinicPhone = "";
            let dbClinicEmail = "";

            if (tenantId) {
                try {
                    const configSnap = await getDoc(doc(db, "empresas", tenantId));
                    if (configSnap.exists()) {
                        const clinicConfig = configSnap.data();
                        dbLogoUrl = clinicConfig.logo || "";
                        dbClinicName = clinicConfig.nombreComercial || clinicConfig.nombre || "";
                        dbClinicNit = clinicConfig.nit || "";
                        dbClinicAddress = clinicConfig.direccion || "";
                        dbClinicPhone = clinicConfig.telefono || "";
                        dbClinicEmail = clinicConfig.email || "";
                    }
                } catch (err) {
                    console.error("Error loading empresa config for print:", err);
                }
            }

            // Resolve values
            const logoUrl = dbLogoUrl || clinic.logo || clinic.logoUrl || "";
            const clinicName = dbClinicName || clinic.nombreComercial || clinic.nombre || "ATM Centro del Dolor Orofacial";
            const clinicNit = dbClinicNit || clinic.nit || "NIT 64576359-3";
            const clinicAddress = dbClinicAddress || clinic.direccion || "Calle 16 # 13-2c - Sincelejo";
            const clinicPhone = dbClinicPhone || clinic.telefono || "2769030";
            const clinicEmail = dbClinicEmail || clinic.email || "atmcentrodelorofacial@gmail.com";

            const patientName = patient.nombreCompleto || `${patient.nombres || ''} ${patient.apellidos || ''}`.trim() || "Paciente";
            const patientDoc = patient.nroDocumento || "—";
            const patientDocType = patient.tipoDocumento || "CC";
            const patientAddress = patient.lugarResidencia || patient.direccion || "—";
            const patientCity = patient.ciudadDomicilio || "Magangué";
            const patientPhone = patient.celular || "—";

            // Use the consecutive number if saved on the pago, else show "S/N"
            const receiptNumber = pago.nroConsecutivo
                ? `No. ${pago.nroConsecutivo}`
                : `S/N`;

            // Build clinic logo block — use solid background for reliable html2canvas rendering
            const clinicInitials = clinicName
                .split(' ')
                .filter(w => w.length > 1)
                .slice(0, 2)
                .map(w => w[0].toUpperCase())
                .join('') || clinicName.slice(0, 2).toUpperCase();
            const clinicLogoHTML = logoUrl
                ? `<img src="${logoUrl}" style="max-width:160px;max-height:65px;object-fit:contain;display:inline-block;vertical-align:middle;" crossorigin="anonymous" />`
                : `<div style="display:inline-block;width:58px;height:58px;background-color:#1e3a8a;border-radius:8px;vertical-align:middle;text-align:center;padding-top:10px;box-sizing:border-box;">
                       <div style="font-size:20px;font-weight:900;color:#ffffff;line-height:1;">${clinicInitials}</div>
                       <div style="font-size:7px;font-weight:700;color:#93c5fd;margin-top:3px;letter-spacing:1px;">DENTAL</div>
                   </div>`;

            const date = pago.fecha ? (pago.fecha.toDate ? pago.fecha.toDate() : new Date(pago.fecha)) : new Date();
            const formattedDate = date.toLocaleDateString('es-CO');

            const subtotalStr = `$ ${Number(pago.monto || 0).toLocaleString('es-CO')}`;
            const totalStr = `$ ${Number(pago.monto || 0).toLocaleString('es-CO')}`;
            const totalPlanStr = typeof totalPlan === "number" ? `$ ${totalPlan.toLocaleString('es-CO')}` : "—";
            const totalPagadoPlanStr = typeof totalPagadoPlan === "number" ? `$ ${totalPagadoPlan.toLocaleString('es-CO')}` : "—";
            const saldoPlanStr = typeof saldoPlan === "number" ? `$ ${saldoPlan.toLocaleString('es-CO')}` : "—";

            const conceptStr = pago.concepto || "Abono a tratamiento";
            const observationsStr = pago.notas || `Abono del plan ${pago.planTitle || ''}`;

            // Resolve items table HTML
            let itemsRowsHTML = "";
            if (pago.itemPayments && pago.itemPayments.length > 0) {
                pago.itemPayments.forEach(ip => {
                    itemsRowsHTML += `
                        <tr style="border-bottom: 1px solid #e2e8f0; font-size: 11px;">
                            <td style="padding: 10px 12px; text-transform: uppercase;">${ip.desc}</td>
                            <td style="padding: 10px 12px; text-align: right; font-family: monospace;">$ ${Number(ip.monto).toLocaleString('es-CO')}</td>
                            <td style="padding: 10px 12px; text-align: center; font-family: monospace;">1</td>
                            <td style="padding: 10px 12px; text-align: right; font-family: monospace; font-weight: bold;">$ ${Number(ip.monto).toLocaleString('es-CO')}</td>
                        </tr>
                    `;
                });
            } else {
                itemsRowsHTML = `
                    <tr style="border-bottom: 1px solid #e2e8f0; font-size: 11px;">
                        <td style="padding: 10px 12px; text-transform: uppercase;">${conceptStr}</td>
                        <td style="padding: 10px 12px; text-align: right; font-family: monospace;">$ ${Number(pago.monto || 0).toLocaleString('es-CO')}</td>
                        <td style="padding: 10px 12px; text-align: center; font-family: monospace;">1</td>
                        <td style="padding: 10px 12px; text-align: right; font-family: monospace; font-weight: bold;">$ ${Number(pago.monto || 0).toLocaleString('es-CO')}</td>
                    </tr>
                `;
            }

            const html = `
                <div style="border: 1px solid #e2e8f0; padding: 30px; border-radius: 16px; position: relative;">
                    <!-- Colored top decorative bar -->
                    <div style="position: absolute; top: 0; left: 0; right: 0; height: 6px; background-color: #8CC63F; border-top-left-radius: 16px; border-top-right-radius: 16px;"></div>

                    <!-- HEADER BLOCK: pure table layout for html2canvas compatibility -->
                    <table style="width:100%; border-collapse:collapse; margin-bottom:20px; margin-top: 10px;">
                        <tr>
                            <td style="vertical-align:middle; width:auto;">
                                <table style="border-collapse:collapse;">
                                     <tr>
                                         <td style="vertical-align:middle; padding-right:18px; width:160px; max-width:180px;">
                                             ${clinicLogoHTML}
                                         </td>
                                         <td style="vertical-align:middle; font-size:10px; color:#475569; line-height:1.5;">
                                             <div style="font-weight:800; font-size:12px; color:#0f172a; text-transform:uppercase; margin-bottom:2px;">${clinicName}</div>
                                             <div>${clinicNit}</div>
                                             <div>${clinicAddress}</div>
                                             <div>Tel: ${clinicPhone} | ${clinicEmail}</div>
                                         </td>
                                     </tr>
                                </table>
                            </td>
                            <td style="vertical-align:middle; text-align:right;">
                                <div style="font-size:11px; font-weight:800; color:#475569; text-transform:uppercase; letter-spacing:0.5px;">Recibo de caja</div>
                                <div style="font-size:16px; font-weight:900; color:#ef4444; font-family:monospace; margin-top:4px;">${receiptNumber}</div>
                            </td>
                        </tr>
                    </table>

                    <!-- CUSTOMER INFO ROW (TABLE) -->
                    <table style="width: 100%; border-collapse: collapse; border: 1px solid #cbd5e1; font-size: 10px; margin-bottom: 20px;">
                        <tbody>
                            <tr style="border-bottom: 1px solid #cbd5e1;">
                                <td style="padding: 6px 10px; background-color: #f8fafc; font-weight: bold; width: 120px; border-right: 1px solid #cbd5e1; text-transform: uppercase; font-size: 8px;">SEÑOR(A)</td>
                                <td style="padding: 6px 10px; font-weight: 800; text-transform: uppercase; border-right: 1px solid #cbd5e1; font-size: 10px;">${patientName}</td>
                                <td style="padding: 6px 10px; background-color: #f8fafc; font-weight: bold; width: 180px; border-right: 1px solid #cbd5e1; text-transform: uppercase; font-size: 8px;">FECHA DE EXPEDICIÓN (DD/MM/AA)</td>
                                <td style="padding: 6px 10px; font-weight: 800; font-family: monospace;">${formattedDate}</td>
                            </tr>
                            <tr style="border-bottom: 1px solid #cbd5e1;">
                                <td style="padding: 6px 10px; background-color: #f8fafc; font-weight: bold; border-right: 1px solid #cbd5e1; text-transform: uppercase; font-size: 8px;">DIRECCIÓN</td>
                                <td style="padding: 6px 10px; text-transform: uppercase; border-right: 1px solid #cbd5e1;">${patientAddress}</td>
                                <td style="padding: 6px 10px; background-color: #f8fafc; font-weight: bold; border-right: 1px solid #cbd5e1; text-transform: uppercase; font-size: 8px;">${patientDocType.toUpperCase()}</td>
                                <td style="padding: 6px 10px; font-weight: 800; font-family: monospace;">${patientDoc}</td>
                            </tr>
                            <tr style="border-bottom: 1px solid #cbd5e1;">
                                <td style="padding: 6px 10px; background-color: #f8fafc; font-weight: bold; border-right: 1px solid #cbd5e1; text-transform: uppercase; font-size: 8px;">CIUDAD</td>
                                <td style="padding: 6px 10px; text-transform: uppercase; border-right: 1px solid #cbd5e1;">${patientCity}</td>
                                <td style="padding: 6px 10px; background-color: #f8fafc; font-weight: bold; border-right: 1px solid #cbd5e1; text-transform: uppercase; font-size: 8px;">MEDIO DE PAGO</td>
                                <td style="padding: 6px 10px; font-weight: 800; text-transform: uppercase;">${pago.medio}</td>
                            </tr>
                            <tr>
                                <td style="padding: 6px 10px; background-color: #f8fafc; font-weight: bold; border-right: 1px solid #cbd5e1; text-transform: uppercase; font-size: 8px;">TELÉFONO</td>
                                <td style="padding: 6px 10px; border-right: 1px solid #cbd5e1; font-family: monospace;">${patientPhone}</td>
                                <td style="padding: 6px 10px; background-color: #f8fafc; font-weight: bold; border-right: 1px solid #cbd5e1; text-transform: uppercase; font-size: 8px;">ELABORADO POR</td>
                                <td style="padding: 6px 10px; font-weight: 800; text-transform: uppercase;">${pago.registradoPor || pago.profesional || userProfile?.nombreCompleto || "Sistema"}</td>
                            </tr>
                        </tbody>
                    </table>

                    <!-- ITEMS DETAIL TABLE -->
                    <table style="width: 100%; border-collapse: collapse; border: 1px solid #cbd5e1; font-size: 10px; margin-bottom: 30px;">
                        <thead>
                            <tr style="background-color: #f1f5f9; border-bottom: 1px solid #cbd5e1; font-size: 8px; font-weight: 900; text-transform: uppercase; tracking-wider: 0.5px;">
                                <th style="padding: 8px 12px; text-align: left; border-right: 1px solid #cbd5e1;">Concepto</th>
                                <th style="padding: 8px 12px; text-align: right; border-right: 1px solid #cbd5e1; width: 120px;">Precio</th>
                                <th style="padding: 8px 12px; text-align: center; border-right: 1px solid #cbd5e1; width: 60px;">Cantidad</th>
                                <th style="padding: 8px 12px; text-align: right; width: 120px;">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${itemsRowsHTML}
                        </tbody>
                    </table>

                    <!-- OBS & TOTALS ROW -->
                    <div style="display: flex; justify-content: space-between; gap: 30px; margin-bottom: 50px;">
                        <!-- Observations left -->
                        <div style="flex: 1; border: 1px solid #e2e8f0; border-radius: 6px; padding: 12px; background-color: #f8fafc; font-size: 9px; line-height: 1.5;">
                            <span style="font-weight: bold; color: #475569; text-transform: uppercase; font-size: 8px; display: block; margin-bottom: 4px;">Observaciones:</span>
                            <div style="font-weight: 500; color: #334155;">${observationsStr}</div>
                        </div>

                        <!-- Calculations right -->
                        <div style="width: 250px; font-size: 10px; display: flex; flex-direction: column; gap: 4px;">
                            <div style="display: flex; justify-content: space-between; padding: 0 4px;">
                                <span style="font-weight: bold; color: #64748b; text-transform: uppercase; font-size: 8px;">Subtotal</span>
                                <span style="font-family: monospace; font-weight: bold;">${subtotalStr}</span>
                            </div>
                            <div style="display: flex; justify-content: space-between; padding: 0 4px; margin-bottom: 4px;">
                                <span style="font-weight: bold; color: #64748b; text-transform: uppercase; font-size: 8px;">Total</span>
                                <span style="font-family: monospace; font-weight: bold;">${totalStr}</span>
                            </div>
                            <div style="height: 1px; bg-color: #cbd5e1; border-top: 1px solid #cbd5e1; margin: 4px 0;"></div>
                            
                            <div style="display: flex; justify-content: space-between; padding: 0 4px;">
                                <span style="color: #64748b; font-size: 8px; font-weight: bold; text-transform: uppercase;">F. de trat.</span>
                                <span style="font-weight: bold; text-transform: uppercase;">${planTitle}</span>
                            </div>
                            <div style="display: flex; justify-content: space-between; padding: 0 4px;">
                                <span style="color: #64748b; font-size: 8px; font-weight: bold; text-transform: uppercase;">Total plan</span>
                                <span style="font-family: monospace; font-weight: bold;">${totalPlanStr}</span>
                            </div>
                            <div style="display: flex; justify-content: space-between; padding: 0 4px;">
                                <span style="color: #64748b; font-size: 8px; font-weight: bold; text-transform: uppercase;">Total pagado</span>
                                <span style="font-family: monospace; font-weight: bold; color: #10b981;">${totalPagadoPlanStr}</span>
                            </div>
                            <div style="display: flex; justify-content: space-between; padding: 0 4px;">
                                <span style="color: #64748b; font-size: 8px; font-weight: bold; text-transform: uppercase;">Saldo total</span>
                                <span style="font-family: monospace; font-weight: bold; color: #ef4444;">${saldoPlanStr}</span>
                            </div>
                        </div>
                    </div>

                    <!-- SIGNATURE BLOCK -->
                    <div style="display: flex; justify-content: space-between; gap: 60px; padding: 0 20px; font-size: 10px;">
                        <div style="flex: 1; border-top: 1px solid #cbd5e1; padding-top: 10px; text-align: center;">
                            <div style="font-weight: 800; text-transform: uppercase; font-size: 9px; color: #475569;">Elaborado por</div>
                        </div>
                        <div style="flex: 1; border-top: 1px solid #cbd5e1; padding-top: 10px; text-align: center;">
                            <div style="font-weight: 800; text-transform: uppercase; font-size: 9px; color: #475569;">Aceptada, firma y/o sello y fecha</div>
                        </div>
                    </div>
                </div>
            `;

            printElement.innerHTML = html;
            document.body.appendChild(printElement);

            // Generate image with high quality
            const canvas = await html2canvas(printElement, {
                scale: 2.5,
                useCORS: true,
                logging: false,
                backgroundColor: "#ffffff",
                windowWidth: 850
            });

            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'pt',
                format: 'a4'
            });

            const imgData = canvas.toDataURL('image/jpeg', 0.95);
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
            
            pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');
            
            const pdfBlob = pdf.output('bloburl');
            window.open(pdfBlob, '_blank');

            document.body.removeChild(printElement);
            toast.success("PDF del recibo generado con éxito", { id: toastId });

        } catch (error) {
            console.error("Error generating receipt PDF:", error);
            toast.error("Error al generar el recibo de caja en PDF", { id: toastId });
        }
    }
};
