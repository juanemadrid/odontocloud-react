/**
 * intelligenceService.js
 * Funciones de IA de alto nivel que combinan datos de Firestore con Gemini
 * para dar inteligencia real al sistema:
 *
 *  - analyzeClinicKPIs()          → Análisis IA de KPIs / reporte gerencial
 *  - predictAbsenteeism()         → Predicción de ausentismo por paciente
 *  - detectAtRiskPatients()       → Pacientes en riesgo de abandono
 *  - suggestTreatmentPlan()       → Sugerencia de plan de tratamiento desde odontograma
 *  - checkLowStockAlerts()        → Detecta productos bajo stock mínimo
 *  - analyzeDocorProductivity()   → Productividad por doctor
 */

import { collection, getDocs, query, where, orderBy, limit, Timestamp } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";

// ─── Gemini helper (reutiliza la lógica del geminiService) ──────────────────

const GEMINI_MODEL = "gemini-2.5-flash";

async function callGemini(prompt, apiKey, maxTokens = 2000) {
    const key = apiKey || import.meta.env.VITE_GEMINI_API_KEY || "";
    if (!key) throw new Error("API Key de Gemini no configurada.");

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${key}`;
    const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.3, maxOutputTokens: maxTokens }
        })
    });

    if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err?.error?.message || `HTTP ${response.status}`);
    }
    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || "";
}

async function callGeminiJSON(prompt, apiKey, maxTokens = 1500) {
    const key = apiKey || import.meta.env.VITE_GEMINI_API_KEY || "";
    if (!key) throw new Error("API Key de Gemini no configurada.");

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${key}`;
    const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
                temperature: 0,
                maxOutputTokens: maxTokens,
                responseMimeType: "application/json"
            }
        })
    });

    if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err?.error?.message || `HTTP ${response.status}`);
    }
    const data = await response.json();
    let raw = data.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
    raw = raw.trim().replace(/^```json/, "").replace(/^```/, "").replace(/```$/, "").trim();
    return JSON.parse(raw);
}

// ─────────────────────────────────────────────────────────────────────────────

/**
 * Analiza los KPIs de la clínica con IA y devuelve un reporte gerencial.
 * @param {Object} kpiData  - { pacientes, citas, facturado, recaudado, pendiente, topTratamientos, citasPorEstado }
 * @param {string} apiKey   - API Key de Gemini
 * @returns {string} Análisis en Markdown
 */
export async function analyzeClinicKPIs(kpiData, apiKey) {
    const {
        pacientes = 0,
        citas = 0,
        facturado = 0,
        recaudado = 0,
        pendiente = 0,
        topTratamientos = [],
        citasPorEstado = {},
        mesActual = {},
        mesAnterior = {}
    } = kpiData;

    const tasaRecaudo = facturado > 0 ? Math.round((recaudado / facturado) * 100) : 0;
    const tasaCancelacion = citas > 0 ? Math.round(((citasPorEstado.canceladas || 0) / citas) * 100) : 0;

    const prompt = `Eres un consultor de gestión empresarial especializado en clínicas odontológicas en Colombia. 
Analiza los siguientes indicadores de la clínica y genera un reporte ejecutivo conciso en español.

INDICADORES ACTUALES:
- Total pacientes registrados: ${pacientes}
- Total citas históricas: ${citas}
- Citas canceladas: ${citasPorEstado.canceladas || 0} (${tasaCancelacion}% de cancelación)
- Citas atendidas: ${citasPorEstado.completadas || 0}
- Facturación histórica acumulada: $${facturado.toLocaleString("es-CO")} COP
- Ingresos recaudados: $${recaudado.toLocaleString("es-CO")} COP (${tasaRecaudo}% de recaudo)
- Cartera pendiente: $${pendiente.toLocaleString("es-CO")} COP
- Top 5 tratamientos por valor cotizado: ${topTratamientos.map((t, i) => `${i + 1}. ${t.name} ($${t.total?.toLocaleString("es-CO")})`).join(", ") || "Sin datos"}
${mesActual.facturado ? `- Facturación mes actual: $${mesActual.facturado.toLocaleString("es-CO")} COP` : ""}
${mesAnterior.facturado ? `- Facturación mes anterior: $${mesAnterior.facturado.toLocaleString("es-CO")} COP` : ""}

Genera un reporte gerencial en Markdown con estas secciones:
## 📊 Diagnóstico General
(2-3 líneas del estado actual de la clínica)

## 💡 Hallazgos Clave
(máximo 4 puntos con bullet ✅/⚠️/❌ según sea positivo, neutro o crítico)

## 🎯 Recomendaciones Prioritarias
(máximo 3 acciones concretas y accionables para los próximos 30 días)

## 🚨 Alertas
(solo si hay métricas críticas que requieren atención inmediata, si no hay alertas omitir esta sección)

Sé directo, usa lenguaje de negocio. No repitas los números literalmente en cada párrafo.`;

    return callGemini(prompt, apiKey, 2000);
}

/**
 * Predice la probabilidad de ausentismo de un paciente basado en su historial de citas.
 * @param {string} patientId  - ID del paciente en Firestore
 * @param {string} inquilino  - ID del tenant
 * @param {string} apiKey     - API Key de Gemini
 * @returns {{ probability: number, label: string, reasons: string[], recommendation: string }}
 */
export async function predictAbsenteeism(patientId, inquilino, apiKey) {
    // Obtener historial de citas del paciente
    const q = query(
        collection(db, "agenda"),
        where("pacienteId", "==", patientId),
        where("inquilino", "==", inquilino)
    );
    const snap = await getDocs(q);
    const citas = snap.docs.map(d => d.data());

    if (citas.length === 0) {
        return { probability: 30, label: "Bajo", reasons: ["Paciente nuevo sin historial"], recommendation: "Enviar confirmación por WhatsApp 24h antes." };
    }

    const total = citas.length;
    const canceladas = citas.filter(c => (c.estado || "").toLowerCase() === "cancelada").length;
    const noAsistio = citas.filter(c => (c.estado || "").toLowerCase().includes("no asisti")).length;
    const atendidas = citas.filter(c => ["atendida", "completada"].includes((c.estado || "").toLowerCase())).length;

    // Calcular probabilidad base sin IA para ser instantáneo
    const tasaInasistencia = (canceladas + noAsistio) / total;
    const probabilidadBase = Math.min(95, Math.round(tasaInasistencia * 100));

    let label = "Bajo";
    let recommendation = "Enviar recordatorio estándar 24h antes.";
    if (probabilidadBase >= 60) {
        label = "Alto";
        recommendation = "Llamar al paciente el día anterior y enviar WhatsApp de recordatorio.";
    } else if (probabilidadBase >= 30) {
        label = "Medio";
        recommendation = "Enviar recordatorio por WhatsApp 48h y 24h antes.";
    }

    const reasons = [];
    if (canceladas > 0) reasons.push(`Ha cancelado ${canceladas} cita(s) anteriores`);
    if (noAsistio > 0) reasons.push(`No asistió ${noAsistio} vez/veces sin cancelar`);
    if (atendidas === total) reasons.push("Excelente historial de asistencia");

    return { probability: probabilidadBase, label, reasons, recommendation, stats: { total, canceladas, noAsistio, atendidas } };
}

/**
 * Detecta pacientes en riesgo de abandono (sin visita en N días con tratamiento activo).
 * @param {string} inquilino  - ID del tenant
 * @param {number} diasSinVisita - Umbral de días sin visita (default 60)
 * @returns {Array<{ patient, diasSinVisita, ultimaVisita, tratamientosActivos }>}
 */
export async function detectAtRiskPatients(inquilino, diasSinVisita = 60) {
    const threshold = new Date();
    threshold.setDate(threshold.getDate() - diasSinVisita);
    const thresholdTs = Timestamp.fromDate(threshold);

    // Pacientes activos
    const qPac = query(collection(db, "pacientes"), where("inquilino", "==", inquilino));
    const snapPac = await getDocs(qPac);
    const pacientes = snapPac.docs.map(d => ({ id: d.id, ...d.data() }));

    // Obtener citas recientes (últimas de cada paciente)
    const qCitas = query(
        collection(db, "agenda"),
        where("inquilino", "==", inquilino)
    );
    const snapCitas = await getDocs(qCitas);

    // Agrupar cita más reciente por paciente
    const ultimaCitaPorPaciente = {};
    snapCitas.docs.forEach(d => {
        const c = d.data();
        const pid = c.pacienteId;
        if (!pid) return;
        const fecha = c.start?.seconds || c.fecha ? new Date(`${c.fecha}T${c.hora || "00:00"}`).getTime() / 1000 : 0;
        if (!ultimaCitaPorPaciente[pid] || fecha > ultimaCitaPorPaciente[pid].fecha) {
            ultimaCitaPorPaciente[pid] = { fecha, estado: c.estado, citaId: d.id };
        }
    });

    // Obtener planes de tratamiento activos
    const qPlanes = query(
        collection(db, "treatment_plans"),
        where("inquilino", "==", inquilino),
        where("status", "in", ["active", "activo", "En progreso", "pending"])
    );
    const snapPlanes = await getDocs(qPlanes).catch(() => ({ docs: [] }));
    const planesPorPaciente = {};
    snapPlanes.docs.forEach(d => {
        const p = d.data();
        const pid = p.patientId || p.pacienteId;
        if (!pid) return;
        if (!planesPorPaciente[pid]) planesPorPaciente[pid] = [];
        planesPorPaciente[pid].push({ id: d.id, nombre: p.title || p.nombre || "Plan sin nombre" });
    });

    const now = Date.now() / 1000;
    const atRisk = [];

    for (const pac of pacientes) {
        const ultima = ultimaCitaPorPaciente[pac.id];
        const fechaUltima = ultima?.fecha;
        if (!fechaUltima) continue; // paciente sin citas → no aplica

        const diasTranscurridos = Math.floor((now - fechaUltima) / 86400);
        if (diasTranscurridos >= diasSinVisita) {
            atRisk.push({
                patient: pac,
                diasSinVisita: diasTranscurridos,
                ultimaVisita: new Date(fechaUltima * 1000).toLocaleDateString("es-CO"),
                tratamientosActivos: planesPorPaciente[pac.id] || []
            });
        }
    }

    // Ordenar por más días sin visita
    atRisk.sort((a, b) => b.diasSinVisita - a.diasSinVisita);
    return atRisk.slice(0, 50); // máximo 50 para no sobrecargar
}

/**
 * Sugiere un plan de tratamiento basado en el estado del odontograma y la anamnesis.
 * @param {Object} odontogramaData  - Estado del odontograma (dientes, condiciones)
 * @param {Object} anamnesisData    - Datos de la anamnesis del paciente
 * @param {Object} patient          - Datos básicos del paciente
 * @param {string} apiKey           - API Key de Gemini
 * @returns {string} Sugerencias en Markdown
 */
export async function suggestTreatmentPlan(odontogramaData, anamnesisData, patient, apiKey) {
    // Resumir el odontograma (solo dientes con condiciones)
    const dientesConCondicion = [];
    if (odontogramaData) {
        Object.entries(odontogramaData).forEach(([diente, data]) => {
            if (data && typeof data === "object") {
                const condiciones = Object.values(data).filter(v => v && v !== "sano" && v !== "");
                if (condiciones.length > 0) {
                    dientesConCondicion.push(`Diente ${diente}: ${condiciones.join(", ")}`);
                }
            }
        });
    }

    const prompt = `Eres un odontólogo experto en planificación de tratamientos. Basándote en la siguiente información del paciente, sugiere un plan de tratamiento priorizado.

PACIENTE:
- Nombre: ${patient?.nombreCompleto || "Paciente"}
- Edad: ${patient?.edad || "No especificada"}
- Alertas/Alergias: ${patient?.alertas || "Ninguna"}

ANAMNESIS:
- Motivo de consulta: ${anamnesisData?.motivoConsulta || "No registrado"}
- Antecedentes médicos: ${anamnesisData?.antecedentes || "Ninguno"}
- Medicamentos: ${anamnesisData?.medicamentos || "Ninguno"}
- Alergias: ${anamnesisData?.alergias || "Ninguna"}

HALLAZGOS EN ODONTOGRAMA:
${dientesConCondicion.length > 0 ? dientesConCondicion.join("\n") : "Sin hallazgos registrados en el odontograma."}

Genera un plan de tratamiento priorizado con el siguiente formato en Markdown:

## 🦷 Plan de Tratamiento Sugerido

### 🔴 Prioridad Alta (Atención Inmediata)
(tratamientos urgentes: dolor, infección, riesgo)

### 🟡 Prioridad Media (1-3 meses)
(tratamientos necesarios pero no urgentes)

### 🟢 Prioridad Baja (3-6 meses)
(tratamientos preventivos o estéticos)

### ⚠️ Consideraciones Especiales
(contraindicaciones por medicamentos, alergias, condiciones sistémicas)

Sé específico con los dientes mencionados. Usa terminología odontológica profesional. Si no hay hallazgos, sugiere plan preventivo básico.`;

    return callGemini(prompt, apiKey, 1800);
}

/**
 * Detecta productos con stock por debajo del mínimo.
 * @param {string} inquilino
 * @returns {Array<{ producto, stockActual, stockMinimo, diferencia }>}
 */
export async function checkLowStockAlerts(inquilino) {
    const q = query(collection(db, "inventario"), where("inquilino", "==", inquilino));
    const snap = await getDocs(q);

    const alertas = [];
    snap.docs.forEach(d => {
        const item = { id: d.id, ...d.data() };
        const stockActual = Number(item.stockActual ?? item.stock ?? 0);
        const stockMinimo = Number(item.stockMinimo ?? item.minimo ?? 0);
        if (stockMinimo > 0 && stockActual <= stockMinimo) {
            alertas.push({
                id: item.id,
                nombre: item.nombre || item.descripcion || "Producto sin nombre",
                stockActual,
                stockMinimo,
                diferencia: stockMinimo - stockActual,
                critico: stockActual === 0
            });
        }
    });

    alertas.sort((a, b) => (b.critico ? 1 : 0) - (a.critico ? 1 : 0) || b.diferencia - a.diferencia);
    return alertas;
}

/**
 * Analiza la productividad por doctor.
 * @param {string} inquilino
 * @returns {Array<{ doctor, citas, atendidas, canceladas, facturado, tasaAsistencia }>}
 */
export async function analyzeDoctorProductivity(inquilino) {
    const [snapCitas, snapFacturas] = await Promise.all([
        getDocs(query(collection(db, "agenda"), where("inquilino", "==", inquilino))),
        getDocs(query(collection(db, "facturas"), where("inquilino", "==", inquilino)))
    ]);

    const doctores = {};

    snapCitas.docs.forEach(d => {
        const c = d.data();
        const nombre = c.dentista || c.doctorName || c.doctor || "Sin asignar";
        if (!doctores[nombre]) doctores[nombre] = { nombre, citas: 0, atendidas: 0, canceladas: 0, facturado: 0 };
        doctores[nombre].citas++;
        const estado = (c.estado || "").toLowerCase();
        if (["atendida", "completada"].includes(estado)) doctores[nombre].atendidas++;
        if (estado === "cancelada") doctores[nombre].canceladas++;
    });

    snapFacturas.docs.forEach(d => {
        const f = d.data();
        const nombre = f.doctorName || f.dentista || f.doctor || "Sin asignar";
        if (!doctores[nombre]) doctores[nombre] = { nombre, citas: 0, atendidas: 0, canceladas: 0, facturado: 0 };
        if (f.estado === "Pagada") doctores[nombre].facturado += Number(f.monto || 0);
    });

    return Object.values(doctores)
        .map(d => ({
            ...d,
            tasaAsistencia: d.citas > 0 ? Math.round((d.atendidas / d.citas) * 100) : 0
        }))
        .sort((a, b) => b.facturado - a.facturado);
}

/**
 * Genera un análisis IA de productividad de doctores.
 */
export async function analyzeDoctorProductivityWithAI(inquilino, apiKey) {
    const doctores = await analyzeDoctorProductivity(inquilino);
    if (doctores.length === 0) return "No hay datos suficientes de doctores para analizar.";

    const resumen = doctores.slice(0, 10).map(d =>
        `- ${d.nombre}: ${d.citas} citas, ${d.tasaAsistencia}% asistencia, $${d.facturado.toLocaleString("es-CO")} facturado`
    ).join("\n");

    const prompt = `Eres un consultor de gestión para clínicas dentales. Analiza el rendimiento de los siguientes doctores y genera un informe ejecutivo breve.

DATOS DE PRODUCTIVIDAD:
${resumen}

Genera en Markdown:
## 👨‍⚕️ Análisis de Productividad por Doctor

### 🏆 Top Performers
### ⚠️ Doctores que necesitan atención
### 💡 Recomendaciones de gestión

Máximo 300 palabras. Sé específico y directo.`;

    return callGemini(prompt, apiKey, 1000);
}
