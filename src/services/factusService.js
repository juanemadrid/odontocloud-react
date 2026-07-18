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
    
    // Intentamos obtener el token de acceso
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
 * Obtener rangos de numeración activos
 */
export const getNumberingRanges = async (token, testMode = true) => {
    const baseUrl = getBaseUrl(testMode);
    const response = await fetch(`${baseUrl}/v1/numbering-ranges`, {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    });
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data?.message || "Error al obtener rangos de numeración.");
    }
    return data;
};

/**
 * Enviar factura a Factus para validación y emisión ante la DIAN
 */
export const sendInvoice = async (invoice, patient, credentials) => {
    const { factusClientId, factusClientSecret, username, password, factusTestMode } = credentials;
    
    // 1. Obtener Token
    const authData = await getAccessToken(factusClientId, factusClientSecret, username, password, factusTestMode);
    const token = authData.access_token;
    
    // 2. Obtener Rango de Numeración Activo de Factus
    const rangesData = await getNumberingRanges(token, factusTestMode);
    const activeRange = rangesData?.data?.find(r => r.is_active) || rangesData?.data?.[0];
    
    if (!activeRange) {
        throw new Error("No se encontró ningún rango de numeración activo en tu cuenta de Factus.");
    }
    
    // 3. Formatear items de la factura para Factus
    const factusItems = (invoice.items || []).map((item, idx) => {
        const price = Number(item.precio || item.valor || item.total || invoice.total || 0);
        return {
            code_type_id: 1, // Estándar de producto
            code: item.code || `SERV-${idx + 1}`,
            name: item.nombre || item.concepto || item.descripcion || "Servicio Odontológico",
            quantity: Number(item.cantidad || 1),
            price: price,
            tax_rate: "0.00",
            discount: 0,
            unit_measure_id: 70, // Unidad de medida (Servicio / Unidad)
            tribute_id: 1, // Exento o IVA
            tax_amount: "0.00"
        };
    });

    if (factusItems.length === 0) {
        factusItems.push({
            code_type_id: 1,
            code: "SERV-01",
            name: "Servicio Odontológico",
            quantity: 1,
            price: Number(invoice.total || 0),
            tax_rate: "0.00",
            discount: 0,
            unit_measure_id: 70,
            tribute_id: 1,
            tax_amount: "0.00"
        });
    }

    // 4. Formatear cliente
    const docNum = patient.documento || patient.identificacion || "222222222222";
    const email = patient.email || "correo@prueba.com";
    const phone = patient.telefono || "3001234567";
    const address = patient.direccion || "Calle 123 # 45-67";
    const names = patient.nombre || "Cliente";
    const lastNames = patient.apellido || "Prueba";

    const payload = {
        document: "01", // Factura Electrónica de Venta
        numbering_range_id: activeRange.id,
        reference_code: `FACT-${invoice.id.slice(-6).toUpperCase()}-${Date.now()}`,
        observation: invoice.observaciones || "Emitido desde OdontoCloud",
        payment_form: 1, // Pago de contado
        payment_method_code: "10", // Efectivo
        customer: {
            identification_number: docNum,
            name: `${names} ${lastNames}`,
            email: email,
            phone: phone,
            address: address,
            // Factus V2 campos adicionales obligatorios para la DIAN
            document_type_id: 13, // Cédula de ciudadanía
            municipality_id: 149, // Bucaramanga
            type_regime_id: 2, // No responsable de IVA
            type_liability_id: 14, // R-99-PN
            type_document_identification_id: 3 // Persona Natural
        },
        items: factusItems
    };

    const baseUrl = getBaseUrl(factusTestMode);
    const response = await fetch(`${baseUrl}/v1/bills/validate`, {
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
    getNumberingRanges,
    sendInvoice
};

export default factusService;
