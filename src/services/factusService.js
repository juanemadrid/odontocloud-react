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

const factusService = {
    getAccessToken,
    testConnection
};

export default factusService;
