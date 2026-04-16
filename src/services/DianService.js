
// src/services/DianService.js

/**
 * Simulates the emission of an Electronic Invoice to DIAN.
 * In a real scenario, this would POST to a backend (Node/NestJS) that signs the XML.
 * 
 * @param {Object} factura - The invoice object from Firestore
 * @returns {Promise<Object>} - Response with status, CUFE, QR, etc.
 */
export const emitirFacturaDian = async (factura) => {
    console.log("🚀 Iniciando emisión DIAN para:", factura.id);

    return new Promise((resolve) => {
        setTimeout(() => {
            // 1. Simulate CUFE Generation (SHA384-like string)
            const mockCufe = generateMockCufe(factura);

            // 2. Simulate QR Content
            const mockQr = `https://catalogo-vpfe.dian.gov.co/document/searchqr?documentkey=${mockCufe}`;

            // 3. Resolution (Mock)
            resolve({
                success: true,
                dianStatus: 'ACEPTADA',
                cufe: mockCufe,
                qr: mockQr,
                message: "Factura validada y aceptada por la DIAN",
                xmlUrl: "https://dian-mock.s3.amazonaws.com/xml/placeholder.xml",
                timestamp: new Date().toISOString()
            });
        }, 2000); // 2 seconds delay to feel "real"
    });
};

/**
 * Returns UI friendly labels for DIAN statuses
 */
export const getDianStatusLabel = (status) => {
    switch (status) {
        case 'ACEPTADA': return { label: 'DIAN Aceptada', color: 'bg-green-100 text-green-700' };
        case 'RECHAZADA': return { label: 'DIAN Rechazada', color: 'bg-red-100 text-red-700' };
        case 'PROCESANDO': return { label: 'Enviando...', color: 'bg-yellow-100 text-yellow-700' };
        default: return { label: 'No Emitida', color: 'bg-slate-100 text-slate-500' };
    }
};

// Helper: Generates a long hex string looking like a CUFE
const generateMockCufe = (factura) => {
    const raw = `${factura.id}-${factura.total}-${Date.now()}`;
    // Simple mock hash (not real SHA384)
    let hash = "";
    const chars = "0123456789abcdef";
    for (let i = 0; i < 96; i++) {
        hash += chars[Math.floor(Math.random() * chars.length)];
    }
    return hash;
};
