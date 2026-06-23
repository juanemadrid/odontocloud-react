// src/services/geminiService.js

// ─── Modelos en orden de preferencia (fallback automático) ──────────────────
// PROBADO con cuenta personal gmail (joshuastream27@gmail.com):
// gemini-2.5-flash:      ✅ FUNCIONA perfectamente
// gemini-2.0-flash:      ⚡ Funciona (429 = límite de velocidad normal, no error)
// gemini-2.0-flash-lite: ⚡ Funciona (429 = límite de velocidad normal, no error)
const GEMINI_MODELS = [
    'gemini-2.5-flash',
    'gemini-2.0-flash',
    'gemini-2.0-flash-lite'
];

// Tokens máximos para respuestas del asistente guiado (respuestas cortas JSON)
const MAX_TOKENS_GUIDED = 300;
// Tokens máximos para análisis de notas clínicas (respuestas más largas)
const MAX_TOKENS_REFINE = 500;

/**
 * Realiza una petición a la API de Gemini con reintentos y fallback de modelo.
 * - Reintenta ante errores de cuota (429), servidor ocupado (503) o modelo no disponible (404).
 * - Usa backoff exponencial entre reintentos.
 */
async function fetchGeminiWithRetry(contents, apiKey, maxRetries = GEMINI_MODELS.length, maxTokens = MAX_TOKENS_GUIDED) {
    const delay = (ms) => new Promise(res => setTimeout(res, ms));
    let lastError = null;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
        const model = GEMINI_MODELS[Math.min(attempt, GEMINI_MODELS.length - 1)];
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    contents,
                    generationConfig: {
                        temperature: 0,
                        maxOutputTokens: maxTokens,
                        responseMimeType: "application/json"
                    }
                })
            });

            // Éxito → retornar directamente
            if (response.ok) {
                const data = await response.json();
                return data;
            }

            const errData = await response.json().catch(() => ({}));
            const errMsg = errData?.error?.message || `HTTP ${response.status} - ${response.statusText}`;
            lastError = new Error(errMsg);

            // Errores recuperables: alta demanda (503), límites de cuota (429) y modelo no soportado en la API Key (404)
            if (response.status === 503 || response.status === 429 || response.status === 404) {
                console.warn(`[GeminiService] Intento ${attempt + 1}/${maxRetries} con modelo "${model}" falló (${response.status}): ${errMsg}.`);
                
                if (attempt + 1 < maxRetries) {
                    const nextModel = GEMINI_MODELS[Math.min(attempt + 1, GEMINI_MODELS.length - 1)];
                    if (nextModel === model) {
                        // Solo aplicamos delay si el modelo es el mismo
                        if (response.status === 429) {
                            await delay(1000 * Math.pow(2, attempt));
                        } else if (response.status !== 404) {
                            await delay(200); // Pequeño delay de transición para 503
                        }
                    } else {
                        // Cambiando a otro modelo de forma inmediata
                        console.warn(`[GeminiService] Cambiando al modelo "${nextModel}" de forma inmediata sin demoras.`);
                    }
                }
                continue;
            }

            // ── Errores TERMINALES: no se reintenta ────────────────────────────────────
            // 401: Key inválida | 403: Proyecto bloqueado o sin acceso al modelo
            if (response.status === 401 || response.status === 403) {
                console.error(`[GeminiService] Error terminal (${response.status}) con modelo "${model}": ${errMsg}`);
                throw lastError;
            }

            // Errores recuperables: alta demanda (503), límites de cuota (429) y modelo no soportado (404)

        } catch (fetchError) {
            // Si ya lo lanzamos nosotros (error terminal), propagarlo directamente
            if (fetchError === lastError) throw fetchError;
            // Error de red puro (TypeError: failed to fetch)
            if (fetchError.name === 'TypeError') {
                lastError = fetchError;
                console.warn(`[GeminiService] Error de red en intento ${attempt + 1}/${maxRetries} con modelo "${model}".`);
                if (attempt + 1 < maxRetries) {
                    const nextModel = GEMINI_MODELS[Math.min(attempt + 1, GEMINI_MODELS.length - 1)];
                    if (nextModel === model) {
                        await delay(1000 * Math.pow(2, attempt));
                    } else {
                        await delay(50); // Pequeño delay de transición para estabilización de red
                    }
                }
                continue;
            }
            throw fetchError;
        }
    }

    throw lastError || new Error('El servicio de IA no está disponible. Intente de nuevo en unos momentos.');
}

/** Extrae y limpia el texto JSON de una respuesta de Gemini */
function extractJsonText(data) {
    const raw = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!raw) throw new Error('Respuesta vacía del servicio de IA.');
    let clean = raw.trim();
    if (clean.startsWith('```json')) clean = clean.slice(7);
    else if (clean.startsWith('```')) clean = clean.slice(3);
    if (clean.endsWith('```')) clean = clean.slice(0, -3);
    return clean.trim();
}

/**
 * Llama a la API de Gemini (Free Tier) para estructurar y refinar notas clínicas a partir de transcripciones.
 * @param {string} rawText La transcripción de voz del odontólogo.
 * @param {string} apiKey La API Key de Gemini del usuario.
 * @returns {Promise<{comentario: string, prognosis: string, tratamiento: string}>}
 */
export async function refineClinicalNotes(rawText, apiKey) {
    if (!apiKey) {
        throw new Error('Se requiere una clave API de Gemini para refinar con IA.');
    }

    const prompt = `Eres un asistente de inteligencia artificial especializado en odontología clínica. Tu trabajo es tomar una transcripción de voz informal o desordenada realizada por un odontólogo y estructurarla en notas clínicas profesionales en español.

Debes extraer y rellenar las siguientes secciones:
1. "comentario" (Una descripción clínica detallada del estado del paciente, hallazgos, diagnóstico y evolución, usando terminología dental correcta y formal, redactada en tercera persona. Debe ser profesional, ordenada y clara. No incluyas información redundante o comentarios informales del dictado).
2. "prognosis" (Determina el pronóstico entre "Favorable", "Reservado" o "Desfavorable").
3. "tratamiento" (Describe brevemente el procedimiento o tratamiento realizado en esta sesión).

Devuelve EXCLUSIVAMENTE un objeto JSON válido con la siguiente estructura (no agregues bloques de código markdown como \`\`\`json o texto adicional, solo el JSON puro):
{
  "comentario": "...",
  "prognosis": "Favorable" | "Reservado" | "Desfavorable",
  "tratamiento": "..."
}

Transcripción del odontólogo:
"${rawText.replace(/"/g, '\\"')}"`;

    try {
        const contents = [{ parts: [{ text: prompt }] }];
        const data = await fetchGeminiWithRetry(contents, apiKey, GEMINI_MODELS.length, MAX_TOKENS_REFINE);
        const parsedData = JSON.parse(extractJsonText(data));
        return {
            comentario: parsedData.comentario || '',
            prognosis: parsedData.prognosis || 'Favorable',
            tratamiento: parsedData.tratamiento || ''
        };
    } catch (e) {
        console.error('Error al refinar las notas con Gemini:', e);
        throw e;
    }
}

/**
 * Multi-turn chat assistant that responds verbally and structures clinical data.
 * @param {string} rawText Spoken input from the dentist.
 * @param {Array} history Conversation history in [{role: 'user'|'model', parts: [{text: '...'}]}] format.
 * @param {string} apiKey Gemini API Key.
 * @returns {Promise<{speechResponse: string, comentario: string, prognosis: string, tratamiento: string}>}
 */
export async function chatClinicalAssistant(rawText, history = [], apiKey) {
    if (!apiKey) {
        throw new Error('Se requiere una clave API de Gemini.');
    }

    const systemPrompt = `Eres "Anita", la asistente virtual de voz inteligente de la clínica dental. El odontólogo te hablará mientras atiende a un paciente. 

Tus responsabilidades son:
1. Responderle al doctor de manera breve, profesional, sumamente educada y conversacional (en 1 o 2 frases cortas, pensadas para ser leídas en voz alta por un sintetizador de voz). Sé amable y eficiente. Presentándote o refiriéndote como Anita.
2. Ir redactando y actualizando una evolución clínica formal en base a lo que el doctor te dicta o conversa. Redáctala de forma profesional, en tercera persona, omitiendo los saludos o charla informal.
3. Determinar la prognosis ("Favorable", "Reservado" o "Desfavorable").
4. Mantener un resumen del tratamiento realizado.

Debes devolver obligatoriamente un objeto JSON válido con la siguiente estructura (sin formato markdown \`\`\`json, solo el JSON puro):
{
  "speechResponse": "La respuesta corta para hablar en voz alta al doctor (ej. 'Entendido doctor, he registrado resina en el diente 24. ¿Hay alguna observación adicional?')",
  "comentario": "El comentario clínico acumulado y redactado formalmente",
  "prognosis": "Favorable" | "Reservado" | "Desfavorable",
  "tratamiento": "El tratamiento realizado"
}`;

    const contents = [
        {
            role: 'user',
            parts: [{ text: systemPrompt }]
        },
        {
            role: 'model',
            parts: [{ text: 'Entendido. Estoy listo para asistirle en la consulta. ¿Qué paciente estamos atendiendo hoy o qué procedimiento iniciamos?' }]
        },
        ...history,
        {
            role: 'user',
            parts: [{ text: rawText }]
        }
    ];

    try {
        const data = await fetchGeminiWithRetry(contents, apiKey, GEMINI_MODELS.length, MAX_TOKENS_REFINE);
        const parsedData = JSON.parse(extractJsonText(data));
        return {
            speechResponse: parsedData.speechResponse || 'Entendido, doctor.',
            comentario: parsedData.comentario || '',
            prognosis: parsedData.prognosis || 'Favorable',
            tratamiento: parsedData.tratamiento || parsedData.treatment || ''
        };
    } catch (e) {
        console.error('Error in chatClinicalAssistant:', e);
        throw e;
    }
}

/**
 * Asistente de voz conversacional guiado paso a paso para llenar el formulario.
 * @param {string} rawText Dictado del odontólogo.
 * @param {number} currentStep Paso actual de la evolución (1 al 7).
 * @param {Array} history Historial del chat en formato [{role: 'user'|'model', parts: [{text: '...'}]}]
 * @param {Object} contextData Datos de doctores, planes y valores del formulario actual.
 * @param {string} apiKey Gemini API Key.
 * @returns {Promise<{speechResponse: string, extractedValue: any, fieldToUpdate: string, nextStep: number}>}
 */
export async function chatGuidedAssistant(rawText, currentStep, history = [], contextData, apiKey) {
    if (!apiKey) {
        throw new Error('Se requiere una clave API de Gemini.');
    }

    const { doctors, planes, currentForm, activeTab, servicios } = contextData;

    let systemPrompt = "";
    if (activeTab === 'nota') {
        systemPrompt = `Eres "Anita", una asistente virtual de voz clínica interactiva diseñada para ayudar al odontólogo a llenar el formulario de Nota Aclaratoria paso a paso mediante una conversación guiada, breve y muy educada.

El formulario consta de los siguientes pasos correlativos (1 al 3):
1. doctorId (Seleccionar el doctor que realiza la nota). Doctores disponibles en la clínica: ${JSON.stringify(doctors.map(d => ({ id: d.id, name: `${d.nombre || d.nombres || ''} ${d.apellido || d.apellidos || ''}`.trim() || d.nombreCompleto })))}
2. comentario (Comentario o aclaración clínica formal. Debe ser redactado en tercera persona, de manera muy profesional, ordenada y clara, omitiendo saludos o muletillas).
3. submit (Guardar y finalizar la nota aclaratoria).

El paso actual es el paso número: ${currentStep}.
Valores actuales del formulario: ${JSON.stringify(currentForm)}

Instrucciones para evaluar la respuesta del usuario (dictado actual: "${rawText}"):
- Si el usuario dice un saludo inicial o estamos en el inicio, debes darle la bienvenida de manera muy breve y preguntar por el primer paso (Doctor).
- Analiza el dictado actual del usuario con respecto al paso actual (${currentStep}).
- Si logras extraer la información para el paso actual, debes:
  1. Definir "extractedValue" con el valor extraído (para doctorId debe ser el ID correspondiente; para comentario el texto redactado; para submit un booleano true).
  2. Definir "fieldToUpdate" con el nombre del campo ("doctorId" | "comentario" | "submit").
  3. Incrementar "nextStep" al siguiente paso y formular una pregunta muy breve y profesional para el siguiente paso en "speechResponse".
  Ejemplo de avance al paso 2: { "speechResponse": "Doctor registrado. Ahora, dícteme el comentario o aclaración clínica que desea registrar.", "extractedValue": "id_doctor", "fieldToUpdate": "doctorId", "nextStep": 2 }
  Ejemplo de avance al paso 3: { "speechResponse": "Aclaración clínica registrada. ¿Desea que guardemos y finalicemos esta nota aclaratoria?", "extractedValue": "El odontólogo aclara que...", "fieldToUpdate": "comentario", "nextStep": 3 }
- Si el usuario da una respuesta inválida, no coincide o no logras extraer el dato, debes pedir aclaración amablemente en "speechResponse", manteniendo "nextStep" igual a ${currentStep} y dejando "fieldToUpdate" y "extractedValue" en null.
- Si el usuario dice "guardar", "finalizar", "sí" o confirma en el paso 3, define "fieldToUpdate" como "submit", "extractedValue" como true y "nextStep" como 4.

Debes devolver obligatoriamente un objeto JSON válido con la siguiente estructura (sin bloques de código markdown, solo el JSON puro):
{
  "speechResponse": "La respuesta verbal en español (breve, máx 2 frases) para el odontólogo.",
  "extractedValue": <el valor extraído o null>,
  "fieldToUpdate": "doctorId" | "comentario" | "submit" | null,
  "nextStep": <el número del paso siguiente (1 al 4)>
}`;
    } else {
        const serviciosText = (servicios && servicios.length > 0)
            ? `Procedimientos clínicos de la plantilla del plan de tratamiento seleccionado actualmente: ${JSON.stringify(servicios.map((s, idx) => ({ paso: idx + 1, descripcion: s.desc || s.procedimiento || s.nombre })))}`
            : "No hay un plan de tratamiento seleccionado aún o no tiene procedimientos registrados.";

        systemPrompt = `Eres "Anita", una asistente virtual de voz clínica interactiva diseñada para ayudar al odontólogo a llenar el formulario de evolución clínica paso a paso mediante una conversación guiada, breve y muy educada.

El formulario consta de los siguientes pasos correlativos (1 al 7):
1. doctorId (Seleccionar el doctor que atiende). Doctores disponibles en la clínica: ${JSON.stringify(doctors.map(d => ({ id: d.id, name: `${d.nombre || d.nombres || ''} ${d.apellido || d.apellidos || ''}`.trim() || d.nombreCompleto })))}
2. planId (Seleccionar el plan de tratamiento). Planes de tratamiento disponibles: ${JSON.stringify(planes.map(p => ({ id: p.id, name: p.title || p.nombre || `Plan #${p.id.slice(-4)}` })))}
3. horaInicio (Definir la hora de inicio del procedimiento. Hora de referencia actual: ${new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}. Nota: No le pidas al doctor la hora final en este paso, ya que el procedimiento apenas inicia; esta se registrará automáticamente cuando finalice la evolución).
4. comentario (Detalles clínicos del procedimiento realizado. Debe ser redactado en tercera persona, de manera muy profesional, ordenada y clara, omitiendo saludos o muletillas).
5. aplicaMedicamento (Si se aplicó medicamento/anestesia en la sesión. Respuestas válidas: Sí o No. Si responde Sí, solicita detalles del medicamento, dosis y vía de administración. Si responde No, avanza al paso 6).
6. controlEsterilizacion (Si se realizó control de esterilización. Respuestas válidas: Sí o No).
7. submit (Guardar y finalizar la evolución).

${serviciosText}

El paso actual es el paso número: ${currentStep}.
Valores actuales del formulario: ${JSON.stringify(currentForm)}

Instrucciones para evaluar la respuesta del usuario (dictado actual: "${rawText}"):
- Si el usuario dice un saludo inicial o estamos en el inicio, debes darle la bienvenida de manera muy breve y preguntar por el primer paso (Doctor).
- Analiza el dictado actual del usuario con respecto al paso actual (${currentStep}).
- Si logras extraer la información para el paso actual, debes:
  1. Definir "extractedValue" con el valor extraído (para doctorId/planId debe ser el ID correspondiente; para horaInicio debe ser la hora en formato "HH:MM"; para comentario el texto redactado; para aplicaMedicamento/controlEsterilizacion un booleano true/false; para submit un booleano true).
  2. Definir "fieldToUpdate" con el nombre del campo ("doctorId" | "planId" | "horaInicio" | "comentario" | "aplicaMedicamento" | "controlEsterilizacion" | "submit").
  3. Incrementar "nextStep" al siguiente paso y formular una pregunta muy breve y profesional para el siguiente paso en "speechResponse".
  - Para el paso 5 (aplicaMedicamento):
    - Si el usuario responde "No", define "fieldToUpdate" como "aplicaMedicamento", "extractedValue" como false y avanza "nextStep" a 6.
    - Si el usuario responde "Sí" (o confirma que aplicó medicamentos pero no da detalles), define "fieldToUpdate" como "aplicaMedicamento", "extractedValue" como true, mantén "nextStep" como 5, y en "speechResponse" pídele amablemente los detalles del medicamento (nombre, dosis y vía de administración). Ej: "¿Qué medicamento o anestesia aplicó, en qué dosis y por qué vía?".
    - Si el usuario ya dio los detalles del medicamento (ej: "Sí, aplicamos Lidocaína al dos por ciento por infiltración local, un cartucho"), define "fieldToUpdate" como "aplicaMedicamento", "extractedValue" como true, extrae la información en "extraUpdates.medicamentos" y avanza "nextStep" a 6.
  Ejemplo de avance al paso 2: { "speechResponse": "Doctor registrado. Ahora, ¿bajo qué plan de tratamiento registraremos la evolución?", "extractedValue": "id_doctor", "fieldToUpdate": "doctorId", "nextStep": 2 }
  Ejemplo de avance al paso 3: { "speechResponse": "Plan de tratamiento seleccionado. ¿A qué hora inició el procedimiento? (Si iniciamos ahora mismo, puede decir 'ahora')", "extractedValue": "id_plan", "fieldToUpdate": "planId", "nextStep": 3 }
  Ejemplo de avance al paso 4: { "speechResponse": "Hora de inicio registrada. Cuénteme, ¿cuáles son los detalles clínicos del procedimiento realizado?", "extractedValue": "09:30", "fieldToUpdate": "horaInicio", "nextStep": 4 }
- Si el usuario da una respuesta inválida, no coincide o no logras extraer el dato (ej. menciona un doctor que no está en la lista), debes pedir aclaración amablemente en "speechResponse", manteniendo "nextStep" igual a ${currentStep} y dejando "fieldToUpdate" y "extractedValue" en null.
- Si el usuario dice "guardar", "finalizar", "sí" o confirma en el paso 7, define "fieldToUpdate" como "submit", "extractedValue" as true y "nextStep" como 8.

Extracción en segundo plano (extraUpdates):
Además, independientemente del paso en el que te encuentres, debes analizar el dictado del usuario para extraer otros campos implícitos en segundo plano. Si los detectas, devuélvelos en un objeto 'extraUpdates'. Los campos posibles son:
- personalAtiende: (string, asistente clínico mencionado en el texto).
- aplicaMedicamento: (boolean, true si el doctor menciona que aplicó, inyectó, suministró o recetó algún medicamento/anestesia).
- controlEsterilizacion: (boolean, true si menciona que se realizó un control de esterilización o autoclave).
- completarProcedimientos: (arreglo de enteros o strings, ej: [1] o ["todos"] o ["ninguno"]). Si el doctor indica que completó, realizó o terminó algún procedimiento de la plantilla de servicios listada arriba (ej: "realicé el paso 1", "marcar la apertura cameral como lista", "completamos todo el plan" o "todos listos"), devuelve los índices del paso (1-based, ej: [1] para el primer paso) correspondientes, o ["todos"] si indica que hizo todos los pasos, o ["ninguno"] si indica que los desmarque.
- medicamentos: (arreglo de objetos, ej: [{ "medicamento": "Lidocaína 2% con Epinefrina", "via": "Infiltración Local", "dosis": "1", "hora": "08:00 pm" }] si se menciona la aplicación de anestesia, analgésico o antibiótico. Las opciones válidas de 'via' son: 'Oral' | 'Tópica' | 'Infiltración Local' | 'Sublingual' | 'Intramuscular' | 'Intravenosa'. La 'hora' debe ser en formato 'hh:mm am/pm' de doce horas).
- esterilizaciones: (arreglo de objetos, ej: [{ "ciclo": "Ciclo Autoclave #1 - 121°C", "concepto": "Aprobado", "cantidad": 1 }] si se menciona el uso del autoclave o ciclos de esterilización. El 'concepto' debe ser: 'Aprobado' | 'Rechazado' | 'En proceso').
- ambito: ('Ambulatorio' | 'Hospitalario' | 'Urgencias' - si se deduce del contexto).
- finalidad: ('Diagnóstico' | 'Terapéutico' | 'Preventivo' | 'Rehabilitación' - si se deduce. Ejemplo: restauraciones, endodoncias son terapéuticos; limpieza es preventivo).
- formaCirugia: ('Único' | 'Múltiple' | '').
- modalidadAtencion: ('Intramural' | 'Extramural' | 'Telemedicina').
- dxPrincipal: (objeto { code: "CIE10_CODE", name: "CIE10_NAME" } si el odontólogo menciona una patología, diagnóstico o enfermedad. Ej: caries es { code: "K029", name: "Caries dental, no especificada" }; gingivitis es { code: "K051", name: "Gingivitis crónica" }; pulpitis es { code: "K040", name: "Pulpitis" }. Deduce el código estándar CIE-10 más adecuado en base a la terminología médica odontológica).
- dxRelacionado: (objeto { code: "CIE10_CODE", name: "CIE10_NAME" }).
- complicacion: (objeto { code: "CIE10_CODE", name: "CIE10_NAME" }).

Debes devolver obligatoriamente un objeto JSON válido con la siguiente estructura (sin bloques de código markdown, solo el JSON puro):
{
  "speechResponse": "La respuesta verbal en español (breve, máx 2 frases) para el odontólogo.",
  "extractedValue": <el valor extraído o null>,
  "fieldToUpdate": "doctorId" | "planId" | "horaInicio" | "comentario" | "aplicaMedicamento" | "controlEsterilizacion" | "submit" | null,
  "nextStep": <el número del paso siguiente (1 al 8)>,
  "extraUpdates": {
    "personalAtiende": "...",
    "aplicaMedicamento": true/false,
    "controlEsterilizacion": true/false,
    "completarProcedimientos": [...],
    "medicamentos": [
      { "medicamento": "...", "via": "...", "dosis": "...", "hora": "..." }
    ],
    "esterilizaciones": [
      { "ciclo": "...", "concepto": "...", "cantidad": 1 }
    ],
    "dxPrincipal": { "code": "...", "name": "..." },
    ...
  }
}`;
    }

    // Limitar el historial a los últimos 6 turnos para reducir tokens y mejorar velocidad
    const recentHistory = history.slice(-6);

    const contents = [
        {
            role: 'user',
            parts: [{ text: systemPrompt }]
        },
        {
            role: 'model',
            parts: [{ text: 'Entendido. Responderé solo con el JSON solicitado.' }]
        },
        ...recentHistory,
        {
            role: 'user',
            parts: [{ text: rawText }]
        }
    ];

    try {
        const data = await fetchGeminiWithRetry(contents, apiKey, GEMINI_MODELS.length, MAX_TOKENS_GUIDED);
        const parsedData = JSON.parse(extractJsonText(data));
        return {
            speechResponse: parsedData.speechResponse || 'Entendido.',
            extractedValue: parsedData.extractedValue !== undefined ? parsedData.extractedValue : null,
            fieldToUpdate: parsedData.fieldToUpdate || null,
            nextStep: typeof parsedData.nextStep === 'number' ? parsedData.nextStep : currentStep,
            extraUpdates: parsedData.extraUpdates || null
        };
    } catch (e) {
        console.error('Error in chatGuidedAssistant:', e);
        throw e;
    }
}
