import { DIAN_MOCK_ENABLED } from "../config/runtimeFlags";

/**
 * Emits an electronic invoice through a backend or authorized provider.
 * DIAN signing secrets must never live in the frontend bundle.
 */
export const emitirFacturaDian = async (factura) => {
    const providerUrl = import.meta.env.VITE_DIAN_PROVIDER_URL || "";

    if (providerUrl) {
        const response = await fetch(providerUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ factura }),
        });

        if (!response.ok) {
            throw new Error(`Proveedor DIAN rechazo la factura (${response.status})`);
        }

        return response.json();
    }

    if (DIAN_MOCK_ENABLED) {
        return simulateDianEmission(factura);
    }

    return {
        success: false,
        dianStatus: "NO_CONFIGURADA",
        cufe: null,
        qr: null,
        xmlUrl: null,
        message: "Facturacion electronica DIAN no configurada. Este documento no tiene validez fiscal.",
        timestamp: new Date().toISOString(),
    };
};

export const getDianStatusLabel = (status) => {
    switch (status) {
        case "ACEPTADA":
            return { label: "DIAN Aceptada", color: "bg-green-100 text-green-700" };
        case "RECHAZADA":
            return { label: "DIAN Rechazada", color: "bg-red-100 text-red-700" };
        case "PROCESANDO":
            return { label: "Enviando...", color: "bg-yellow-100 text-yellow-700" };
        case "NO_CONFIGURADA":
            return { label: "DIAN no configurada", color: "bg-orange-100 text-orange-700" };
        case "SIMULADA":
            return { label: "DIAN simulada", color: "bg-amber-100 text-amber-700" };
        default:
            return { label: "No Emitida", color: "bg-slate-100 text-slate-500" };
    }
};

const simulateDianEmission = (factura) => new Promise((resolve) => {
    setTimeout(() => {
        const mockCufe = generateMockCufe(factura);
        const mockQr = `https://catalogo-vpfe.dian.gov.co/document/searchqr?documentkey=${mockCufe}`;

        resolve({
            success: true,
            dianStatus: "SIMULADA",
            cufe: mockCufe,
            qr: mockQr,
            message: "Simulacion local DIAN para desarrollo. No tiene validez fiscal.",
            xmlUrl: null,
            timestamp: new Date().toISOString(),
        });
    }, 800);
});

const generateMockCufe = (factura) => {
    const raw = `${factura.id}-${factura.total}-${Date.now()}`;
    let hash = "";
    const chars = "0123456789abcdef";

    for (let i = 0; i < 96; i++) {
        hash += chars[Math.floor(Math.random() * chars.length)];
    }

    return hash || raw;
};
