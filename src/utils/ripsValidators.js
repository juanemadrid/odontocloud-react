/**
 * Utilidades para validación y generación de RIPS (Resolución 2275 de 2023 - JSON)
 * Contiene catálogos, validadores y constructores de objetos.
 */

// ==========================================
// 1. CATÁLOGOS (Tablas de Referencia)
// ==========================================

export const TIPO_DOCUMENTO = {
    'CC': 'Cédula de Ciudadanía',
    'CE': 'Cédula de Extranjería',
    'TI': 'Tarjeta de Identidad',
    'RC': 'Registro Civil',
    'PA': 'Pasaporte',
    'NV': 'Nacido Vivo',
    'CD': 'Carné Diplomático',
    'SC': 'Salvoconducto',
    'PE': 'Permiso Especial de Permanencia',
    'PT': 'Permiso por Protección Temporal'
};

export const TIPO_USUARIO = {
    '01': 'Contributivo',
    '02': 'Subsidiado',
    '03': 'Vinculado',
    '04': 'Particular',
    '05': 'Otro'
};

export const CODIGO_CONCEPTOS = {
    '01': 'Consulta',
    '02': 'Procedimiento',
    '03': 'Urgencia',
    '04': 'Hospitalización'
};

// ==========================================
// 1.1 SMART MAPPINGS (Odontología Smart)
// ==========================================

export const DENTAL_CODES_MAP = [
    { keywords: ["consulta", "valoracion", "primera vez"], cups: "890201", cie10: "Z012", label: "Consulta Valoración" },
    { keywords: ["limpieza", "higiene", "detartraje", "profili"], cups: "997300", cie10: "K051", label: "Limpieza Profunda" },
    { keywords: ["caries", "resina", "calza", "obturacion"], cups: "230101", cie10: "K021", label: "Tratamiento Caries" },
    { keywords: ["dolor", "pulpa", "endo", "conducto"], cups: "237101", cie10: "K040", label: "Endodoncia" },
    { keywords: ["extraccion", "sacar", "cirugia"], cups: "231101", cie10: "K081", label: "Exodoncia" },
    { keywords: ["corona", "protesis", "puente"], cups: "234101", cie10: "K081", label: "Prótesis/Corona" },
    { keywords: ["ortodoncia", "brackets", "frenillos"], cups: "247101", cie10: "M264", label: "Ortodoncia" },
];

/**
 * Sugiere códigos CUPS y CIE-10 basados en una descripción textual.
 */
export const suggestClinicalCodes = (description = "") => {
    const d = description.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const match = DENTAL_CODES_MAP.find(item =>
        item.keywords.some(k => d.includes(k))
    );

    return match || { cups: "890201", cie10: "Z012", label: "Consulta General" };
};

// ==========================================
// 2. VALIDADORES
// ==========================================

/**
 * Valida formato CIE-10 (A00 - Z999)
 * @param {string} code 
 */
export const validateCIE10 = (code) => {
    if (!code) return false;
    // Formato: 1 letra + 3 dígitos (ej: K021)
    return /^[A-Z][0-9]{3}$/.test(code);
};

/**
 * Valida formato CUPS (6 caracteres alfanuméricos)
 */
export const validateCUPS = (code) => {
    if (!code) return false;
    return /^[A-Z0-9]{6}$/.test(code);
};

/**
 * Valida si una fecha es válida y no futura (para servicios realizados)
 */
export const validateFecha = (dateString) => {
    if (!dateString) return false;
    const date = new Date(dateString);
    const now = new Date();
    return !isNaN(date.getTime()) && date <= now;
};


// ==========================================
// 3. CONSTRUCTORES (Builders para JSON)
// ==========================================

/**
 * Construye el objeto de Usuario según Res 2275
 */
export const buildUsuarioJSON = (paciente, tipoUsuario = '04') => {
    // paciente = { tipoDoc, numDoc, primerApellido, segundoApellido, primerNombre, segundoNombre, fechaNacimiento, sexo, ... }
    return {
        tipoDocumentoIdentificacion: paciente.tipoDoc || 'CC',
        numDocumentoIdentificacion: paciente.numDoc || paciente.nroDocumento,
        tipoUsuario: tipoUsuario,
        fechaNacimiento: paciente.fechaNacimiento || '1900-01-01',
        codSexo: paciente.sexo || 'M', // H (Hombre), M (Mujer)
        paisResidencia: "170", // Colombia
        municipioResidencia: paciente.municipio || "11001", // Default Bogotá
        zonaResidencia: paciente.zona || "U", // U: Urbana, R: Rural
        primerApellido: paciente.primerApellido || "UNK",
        segundoApellido: paciente.segundoApellido || "",
        primerNombre: paciente.primerNombre || "UNK",
        segundoNombre: paciente.segundoNombre || ""
    };
};

/**
 * Construye el objeto de Servicio (Consulta)
 */
export const buildConsultaJSON = (datos, consecutivo) => {
    // datos = { codConsulta (CUPS), finalidad, causaExterna, dxPrincipal, dxRelacionado, valor, ... }
    return {
        codPrestador: datos.codPrestador, // Código habilitación IPS
        fechaInicioAtencion: datos.fechaInicio,
        numAutorizacion: datos.numAutorizacion || null,
        codConsulta: datos.codConsulta,
        modalidadGrupoServicio: "01", // Intramural
        grupoServicios: "01", // Consulta Externa
        codServicio: 1, // Medicina General / Odontología
        finalidadTecnologiaSalud: datos.finalidad || "10", // 10: Valoración clínica
        causaMotivoAtencion: datos.causaExterna || "13", // 13: Enfermedad general
        codDiagnosticoPrincipal: datos.dxPrincipal,
        codDiagnosticoRelacionado1: datos.dxRelacionado1 || null,
        codDiagnosticoRelacionado2: datos.dxRelacionado2 || null,
        codDiagnosticoRelacionado3: datos.dxRelacionado3 || null,
        tipoDiagnosticoPrincipal: datos.tipoDx || "1", // 1: Impresion diagnóstica, 2: Confirmado nuevo
        valorPagoModerador: 0,
        valorServicio: datos.valorServicio || 0,
        consecutivo: consecutivo
    };
};

/**
 * Estructura Principal del RIPS JSON
 */
export const buildRipsJSON = (factura, usuarios, consultas, procedimientos) => {
    return {
        numDocumentoIdObligado: factura.nitObligado, // NIT de la IPS
        numFacturaVenta: factura.numeroFactura,
        tipoNota: null,
        numNota: null,
        usuarios: usuarios, // Array de usuarios únicos
        servicios: {
            consultas: consultas,
            procedimientos: procedimientos,
            urgencias: [],
            hospitalizacion: [],
            recienNacidos: [],
            medicamentos: [],
            otrosServicios: []
        }
    };
};
