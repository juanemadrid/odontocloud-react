const getBaseUrl = (testMode = true) => {
    return testMode ? "https://api-sandbox.factus.com.co" : "https://api.factus.com.co";
};

/**
 * Obtener token de acceso OAuth2 desde Factus
 */
export const getAccessToken = async (clientId, clientSecret, username, password, testMode = true) => {
    const baseUrl = getBaseUrl(testMode);
    
    const params = new URLSearchParams();
    params.append("grant_type", "password");
    params.append("client_id", clientId);
    params.append("client_secret", clientSecret);
    params.append("username", username);
    params.append("password", password);

    const response = await fetch(`${baseUrl}/oauth/token`, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: params.toString()
    });
    
    const data = await response.json();
    if (!response.ok) {
        const errorMsg = data?.message || data?.error_description || `HTTP error! status: ${response.status}`;
        throw new Error(errorMsg);
    }
    
    return data;
};

/**
 * Probar conexión con Factus
 */
export const testConnection = async (credentials) => {
    const { factusClientId, factusClientSecret, username, password, factusTestMode } = credentials;
    
    if (!factusClientId || !factusClientSecret || !username || !password) {
        throw new Error("Faltan credenciales requeridas para probar la conexión.");
    }
    
    const authData = await getAccessToken(
        factusClientId,
        factusClientSecret,
        username,
        password,
        factusTestMode
    );
    
    if (authData && authData.access_token) {
        return {
            success: true,
            message: "Conexión establecida con éxito.",
            expires_in: authData.expires_in,
            token_type: authData.token_type
        };
    } else {
        throw new Error("No se pudo obtener el token de acceso de Factus.");
    }
};

/**
 * Enviar factura a Factus para validación y emisión ante la DIAN
 * Payload conforme a la documentación oficial Factus API V2:
 * https://developers.factus.com.co/facturas/crear-y-validar
 */
export const sendInvoice = async (invoice, patient, credentials) => {
    const {
        factusClientId, factusClientSecret,
        username, password, factusTestMode,
        factusNumberingRangeId, factusMunicipioCode
    } = credentials;

    // 1. Obtener Token OAuth2
    const authData = await getAccessToken(factusClientId, factusClientSecret, username, password, factusTestMode);
    const token = authData.access_token;

    // 2. ID del Rango de Numeración (configurado por el usuario en Configuración → Facturación)
    const numberingRangeId = Number(factusNumberingRangeId) || 1;

    // 3. Formatear items con estructura V2 de Factus
    const rawItems = invoice.items || [];
    const factusItems = rawItems.map((item, idx) => {
        const price = parseFloat(item.precio || item.valor || item.total || invoice.total || 0).toFixed(2);
        return {
            code_reference: item.code || `SERV-${String(idx + 1).padStart(4, "0")}`,
            name: (item.nombre || item.concepto || item.descripcion || "Servicio Odontológico").slice(0, 100),
            quantity: parseFloat(item.cantidad || 1).toFixed(2),
            discount_rate: "0.00",
            price: price,
            unit_measure_code: "94",   // 94 = Unidad (para servicios)
            standard_code: "0001",     // Estándar sin código GTIN
            taxes: []                   // Servicios odontológicos: exentos de IVA
        };
    });

    // Si no hay items, crear uno genérico con el total de la factura
    if (factusItems.length === 0) {
        factusItems.push({
            code_reference: "SERV-0001",
            name: "Servicio Odontológico",
            quantity: "1.00",
            discount_rate: "0.00",
            price: parseFloat(invoice.total || 0).toFixed(2),
            unit_measure_code: "94",
            standard_code: "0001",
            taxes: []
        });
    }

    // 4. Datos del cliente (adquiriente)
    const docNum      = String(patient.documento || patient.identificacion || "222222222222");
    const email       = patient.email    || "correo@prueba.com";
    const phone       = String(patient.telefono  || "3001234567");
    const address     = patient.direccion || "Calle 123 # 45-67";
    const fullName    = `${patient.nombre || "Cliente"} ${patient.apellido || "Prueba"}`.trim();
    const totalAmount = parseFloat(invoice.total || 0).toFixed(2);

    // Código DANE del municipio. Bogotá=11001, Medellín=05001, Cali=76001, Barranquilla=08001
    const municipalityCode = factusMunicipioCode || "11001";

    // 5. Construir payload según especificación Factus API V2
    const payload = {
        reference_code: `OC-${invoice.id.slice(-8).toUpperCase()}`,
        document: "01",                 // 01 = Factura Electrónica de Venta
        numbering_range_id: numberingRangeId,
        operation_type: "10",           // 10 = Estándar
        observation: (invoice.observaciones || "Emitido desde OdontoCloud").slice(0, 250),
        payment_details: [
            {
                payment_form: "1",          // 1 = Contado
                payment_method_code: "10",  // 10 = Efectivo
                reference_code: `PAY-${invoice.id.slice(-6).toUpperCase()}`,
                amount: totalAmount
            }
        ],
        cash_rounding_amount: "0.00",
        customer: {
            identification_document_code: "13", // 13 = Cédula de Ciudadanía
            identification: docNum,
            company: fullName,
            trade_name: fullName,
            address: address,
            email: email,
            phone: phone,
            legal_organization_code: "2",  // 2 = Persona Natural
            tribute_code: "22",             // 22 = No Responsable de IVA (RC-IVA)
            country_code: "CO",
            municipality_code: municipalityCode
        },
        items: factusItems
    };

    const baseUrl = getBaseUrl(factusTestMode);
    const response = await fetch(`${baseUrl}/v2/bills/validate`, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
    });

    const data = await response.json();
    if (!response.ok) {
        const errorMsg = data?.message || JSON.stringify(data?.errors) || "Error al emitir factura en Factus.";
        throw new Error(errorMsg);
    }

    return data;
};

const factusService = {
    getAccessToken,
    testConnection,
    sendInvoice
};

export default factusService;
