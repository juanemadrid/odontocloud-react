import React, { useState, useEffect } from 'react';
import { FiCpu, FiSettings, FiExternalLink, FiFileText, FiAlertTriangle, FiBookOpen, FiClipboard, FiCheck, FiRefreshCw } from 'react-icons/fi';
import { getAnamnesis } from '../../../services/clinicalService';
import { collection, query, where, getDocs, limit, orderBy } from 'firebase/firestore';
import { db } from '../../../firebase/firebaseConfig';
import { toast } from 'sonner';

export default function AIInsightsTab({ patient }) {
    const [apiKey, setApiKey] = useState('');
    const [showSettings, setShowSettings] = useState(false);
    
    // States for AI features
    const [summaryLoading, setSummaryLoading] = useState(false);
    const [summaryResult, setSummaryResult] = useState('');
    
    const [procedure, setProcedure] = useState('');
    const [recipeLoading, setRecipeLoading] = useState(false);
    const [recipeResult, setRecipeResult] = useState('');

    const [symptoms, setSymptoms] = useState('');
    const [dxLoading, setDxLoading] = useState(false);
    const [dxResults, setDxResults] = useState([]);

    useEffect(() => {
        const storedKey = localStorage.getItem('odontovox_gemini_api_key');
        if (storedKey) {
            setApiKey(storedKey);
        } else if (import.meta.env.VITE_GEMINI_API_KEY) {
            setApiKey(import.meta.env.VITE_GEMINI_API_KEY);
        }
    }, []);

    const handleSaveApiKey = (e) => {
        e.preventDefault();
        localStorage.setItem('odontovox_gemini_api_key', apiKey.trim());
        toast.success('Clave API de Gemini guardada correctamente');
        setShowSettings(false);
    };

    const getEffectiveApiKey = () => {
        return apiKey.trim() || import.meta.env.VITE_GEMINI_API_KEY || '';
    };

    const callGemini = async (prompt) => {
        const key = getEffectiveApiKey();
        if (!key) {
            toast.error('Configure su clave API de Gemini gratuita en los ajustes.');
            setShowSettings(true);
            throw new Error('API Key missing');
        }

        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${key}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }]
                })
            }
        );

        if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            throw new Error(errData?.error?.message || `HTTP ${response.status}`);
        }

        const data = await response.json();
        return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    };

    // 1. Generate Clinical Summary
    const handleGenerateSummary = async () => {
        setSummaryLoading(true);
        try {
            // Fetch Anamnesis
            let anamnesisData = null;
            try {
                anamnesisData = await getAnamnesis(patient.id);
            } catch (err) {
                console.warn('Could not fetch anamnesis:', err);
            }

            // Fetch last 3 evolutions
            let evolutionsText = '';
            try {
                const q = query(
                    collection(db, 'clinical_evolutions'),
                    where('patientId', '==', patient.id),
                    orderBy('date', 'desc'),
                    limit(3)
                );
                const snap = await getDocs(q);
                const evos = snap.docs.map(d => d.data());
                evolutionsText = evos.map((e, idx) => `Evolución ${idx+1}: ${e.description || e.comentario || ''}`).join('\n');
            } catch (err) {
                console.warn('Could not fetch evolutions:', err);
            }

            const prompt = `Actúa como un experto analista clínico y odontólogo asesor. Resume el expediente clínico del paciente y genera advertencias críticas para el odontólogo antes de atenderlo.
            
            Datos del Paciente:
            - Nombre completo: ${patient.nombreCompleto || patient.nombre || 'Paciente'}
            - Edad: ${patient.edad || 'No especificada'}
            - Sexo: ${patient.sexo || 'No especificado'}
            - Alertas del sistema: ${patient.alertas || 'Ninguna'}
            
            Anamnesis:
            - Motivo de consulta: ${anamnesisData?.motivoConsulta || 'No registrado'}
            - Antecedentes médicos: ${anamnesisData?.antecedentes || 'Ninguno'}
            - Alergias registradas: ${anamnesisData?.alergias || 'Ninguna'}
            - Medicamentos que toma: ${anamnesisData?.medicamentos || 'Ninguno'}
            - Otras notas: ${anamnesisData?.notas || 'Ninguna'}
            
            Últimas Evoluciones Clínicas:
            ${evolutionsText || 'No hay evoluciones anteriores registradas.'}
            
            Genera un resumen en español estructurado de la siguiente forma:
            1. **Resumen de Ficha** (2-3 líneas máximas del estado actual).
            2. **Alertas Clínicas Críticas** (Destaca alergias de cuidado, enfermedades crónicas o medicamentos de riesgo para el tratamiento dental en color/formato llamativo).
            3. **Sugerencias Clínicas** (Próximos pasos recomendados según el historial).`;

            const summary = await callGemini(prompt);
            setSummaryResult(summary);
            toast.success('Resumen clínico generado correctamente');
        } catch (e) {
            if (e.message !== 'API Key missing') {
                toast.error('Error al generar resumen clínico: ' + e.message);
            }
        } finally {
            setSummaryLoading(false);
        }
    };

    // 2. Generate Recipe and Post-Op instructions
    const handleGenerateRecipe = async () => {
        if (!procedure.trim()) {
            toast.error('Por favor, especifique el procedimiento realizado.');
            return;
        }
        setRecipeLoading(true);
        try {
            const prompt = `Genera una sugerencia de receta médica (medicamentos típicos) y una guía detallada de recomendaciones post-operatorias en español para el paciente tras realizarle el procedimiento odontológico: "${procedure}".
            
            Información del paciente:
            - Nombre: ${patient.nombreCompleto || 'Paciente'}
            - Edad: ${patient.edad || 'No especificada'}
            - Alertas/Alergias conocidas: ${patient.alertas || 'Ninguna'}

            Escribe tu respuesta con un tono formal y claro para entregar al paciente. Estructura el resultado en secciones:
            - **Medicamentos sugeridos** (con posología común: dosis, frecuencia y duración).
            - **Cuidados post-tratamiento en casa** (alimentación, higiene, reposo).
            - **Signos de alarma** (cuándo debe llamar de urgencia).`;

            const result = await callGemini(prompt);
            setRecipeResult(result);
            toast.success('Receta y recomendaciones generadas');
        } catch (e) {
            if (e.message !== 'API Key missing') {
                toast.error('Error al generar receta: ' + e.message);
            }
        } finally {
            setRecipeLoading(false);
        }
    };

    // 3. Smart CIE-10 suggestion
    const handleSearchDx = async () => {
        if (!symptoms.trim()) {
            toast.error('Describa los síntomas o diagnóstico del paciente.');
            return;
        }
        setDxLoading(true);
        try {
            const prompt = `Eres una herramienta de codificación diagnóstica. Sugiere exactamente 3 códigos válidos del CIE-10 (clasificación internacional de enfermedades, décima edición) relacionados con odontología y estomatología que correspondan a la descripción clínica: "${symptoms}".
            
            Devuelve únicamente una lista JSON con esta estructura exacta (sin formato markdown adicional):
            [
              {"code": "código", "description": "nombre del diagnóstico"},
              ...
            ]`;

            const rawJson = await callGemini(prompt);
            let cleanJson = rawJson.trim();
            if (cleanJson.startsWith('```json')) cleanJson = cleanJson.substring(7);
            else if (cleanJson.startsWith('```')) cleanJson = cleanJson.substring(3);
            if (cleanJson.endsWith('```')) cleanJson = cleanJson.substring(0, cleanJson.length - 3);
            cleanJson = cleanJson.trim();

            const parsed = JSON.parse(cleanJson);
            setDxResults(Array.isArray(parsed) ? parsed : []);
            toast.success('Diagnósticos CIE-10 sugeridos');
        } catch (e) {
            if (e.message !== 'API Key missing') {
                toast.error('Error al buscar diagnósticos: ' + e.message);
            }
        } finally {
            setDxLoading(false);
        }
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        toast.success('Copiado al portapapeles');
    };

    return (
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-8 bg-slate-50 space-y-6 animate-fadeIn">
            {/* Header */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-base font-black text-slate-800 uppercase tracking-tight flex items-center gap-2">
                        <FiCpu className="text-indigo-600 animate-pulse" /> Copiloto IA Clínico (Anita Insights)
                    </h2>
                    <p className="text-xs text-slate-400 font-bold mt-1 uppercase tracking-wider">Potencia tu clínica con inteligencia artificial gratuita</p>
                </div>
                <button
                    type="button"
                    onClick={() => setShowSettings(!showSettings)}
                    className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest flex items-center gap-1.5 transition-colors border ${
                        showSettings 
                            ? 'bg-indigo-50 border-indigo-200 text-indigo-600' 
                            : 'bg-white hover:bg-slate-100 border-slate-200 text-slate-500 shadow-sm'
                    }`}
                >
                    <FiSettings /> Ajustes API Key
                </button>
            </div>

            {/* Settings API Key */}
            {showSettings && (
                <div className="bg-white border border-indigo-100 rounded-2xl p-6 shadow-md max-w-2xl animate-fadeIn">
                    <div className="flex justify-between items-start mb-3">
                        <div>
                            <h4 className="text-xs font-black text-indigo-600 uppercase tracking-widest leading-none">Clave API de Gemini (Uso Gratuito)</h4>
                            <p className="text-[10px] text-slate-400 font-bold mt-1.5 leading-relaxed">
                                El Copiloto IA de Anita utiliza Gemini 1.5 Flash. Obtenga su clave API gratis en Google AI Studio. Su clave no se comparte y se guarda únicamente en este navegador.
                            </p>
                        </div>
                        <a 
                            href="https://aistudio.google.com/" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-[10px] font-black text-blue-500 uppercase tracking-widest flex items-center gap-1 hover:underline"
                        >
                            Ir a Google AI Studio <FiExternalLink size={10} />
                        </a>
                    </div>
                    <form onSubmit={handleSaveApiKey} className="flex gap-2">
                        <input
                            type="password"
                            placeholder="Pegue su clave API gratuita aquí..."
                            value={apiKey}
                            onChange={(e) => setApiKey(e.target.value)}
                            className="flex-1 h-10 px-3 rounded-lg border border-slate-200 text-xs font-bold text-slate-700 bg-white outline-none focus:border-indigo-500 caret-slate-950"
                        />
                        <button
                            type="submit"
                            className="h-10 px-6 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-black uppercase tracking-widest transition-all"
                        >
                            Guardar
                        </button>
                    </form>
                </div>
            )}

            {/* Grid for features */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* 1. CLINICAL SUMMARY CARD */}
                <div className="bg-white border border-slate-150 rounded-2xl p-6 shadow-sm flex flex-col gap-4">
                    <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                        <span className="p-2 bg-indigo-50 text-indigo-600 rounded-lg"><FiFileText size={16} /></span>
                        <h3 className="text-xs font-black text-slate-700 uppercase tracking-widest">Resumen Clínico Inteligente</h3>
                    </div>

                    <p className="text-[11px] text-slate-400 font-semibold leading-relaxed">
                        Analiza instantáneamente el expediente, anamnesis del paciente y sus últimas notas clínicas de evolución para presentarte advertencias críticas y alertas rápidas antes del tratamiento.
                    </p>

                    <button
                        type="button"
                        onClick={handleGenerateSummary}
                        disabled={summaryLoading}
                        className="py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-md shadow-indigo-500/10"
                    >
                        {summaryLoading ? (
                            <>
                                <FiRefreshCw className="animate-spin" />
                                Analizando Expediente...
                            </>
                        ) : (
                            <>
                                <FiCpu />
                                Analizar y Generar Resumen
                            </>
                        )}
                    </button>

                    {summaryResult && (
                        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mt-2 max-h-[300px] overflow-y-auto custom-scrollbar animate-fadeIn space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                                    <FiAlertTriangle className="text-indigo-600" /> Resultados del Análisis
                                </span>
                                <button
                                    type="button"
                                    onClick={() => copyToClipboard(summaryResult)}
                                    className="text-[9px] font-black text-indigo-600 hover:underline uppercase tracking-widest"
                                >
                                    Copiar
                                </button>
                            </div>
                            <div className="text-xs font-bold text-slate-700 whitespace-pre-line leading-relaxed">
                                {summaryResult}
                            </div>
                        </div>
                    )}
                </div>

                {/* 2. post-op Care & Recipe suggestions */}
                <div className="bg-white border border-slate-150 rounded-2xl p-6 shadow-sm flex flex-col gap-4">
                    <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                        <span className="p-2 bg-emerald-50 text-emerald-600 rounded-lg"><FiBookOpen size={16} /></span>
                        <h3 className="text-xs font-black text-slate-700 uppercase tracking-widest">Recomendaciones Post-Tratamiento y Receta</h3>
                    </div>

                    <p className="text-[11px] text-slate-400 font-semibold leading-relaxed">
                        Redacta recetas médicas e instrucciones post-operatorias detalladas para el paciente según el procedimiento clínico realizado.
                    </p>

                    <div className="flex gap-2">
                        <input
                            type="text"
                            placeholder="Ej: Exodoncia diente 38 con sutura..."
                            value={procedure}
                            onChange={(e) => setProcedure(e.target.value)}
                            className="flex-1 h-11 px-3 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 outline-none focus:border-emerald-500 caret-slate-950"
                        />
                        <button
                            type="button"
                            onClick={handleGenerateRecipe}
                            disabled={recipeLoading || !procedure.trim()}
                            className="px-5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-black text-xs uppercase tracking-widest transition-all disabled:opacity-50"
                        >
                            {recipeLoading ? <FiRefreshCw className="animate-spin" /> : 'Generar'}
                        </button>
                    </div>

                    {recipeResult && (
                        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mt-2 max-h-[250px] overflow-y-auto custom-scrollbar animate-fadeIn space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Instrucciones al paciente</span>
                                <button
                                    type="button"
                                    onClick={() => copyToClipboard(recipeResult)}
                                    className="text-[9px] font-black text-emerald-600 hover:underline uppercase tracking-widest"
                                >
                                    Copiar
                                </button>
                            </div>
                            <div className="text-xs font-bold text-slate-700 whitespace-pre-line leading-relaxed">
                                {recipeResult}
                            </div>
                        </div>
                    )}
                </div>

                {/* 3. CIE-10 Smart Diagnosis Recommender */}
                <div className="bg-white border border-slate-150 rounded-2xl p-6 shadow-sm flex flex-col gap-4 lg:col-span-2">
                    <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                        <span className="p-2 bg-indigo-50 text-indigo-600 rounded-lg"><FiClipboard size={16} /></span>
                        <h3 className="text-xs font-black text-slate-700 uppercase tracking-widest">Sugerencias CIE-10 Inteligentes</h3>
                    </div>

                    <p className="text-[11px] text-slate-400 font-semibold leading-relaxed">
                        Escriba los síntomas del paciente o un diagnóstico en lenguaje natural y la inteligencia artificial sugerirá los códigos CIE-10 de odontología correspondientes para agilizar su documentación.
                    </p>

                    <div className="flex gap-2">
                        <input
                            type="text"
                            placeholder="Ej: Sangrado de encías severo, inflamación generalizada..."
                            value={symptoms}
                            onChange={(e) => setSymptoms(e.target.value)}
                            className="flex-1 h-11 px-3 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 outline-none focus:border-indigo-500 caret-slate-950"
                        />
                        <button
                            type="button"
                            onClick={handleSearchDx}
                            disabled={dxLoading || !symptoms.trim()}
                            className="px-6 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-black text-xs uppercase tracking-widest transition-all disabled:opacity-50"
                        >
                            {dxLoading ? <FiRefreshCw className="animate-spin" /> : 'Sugerir Códigos'}
                        </button>
                    </div>

                    {dxResults.length > 0 && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2 animate-fadeIn">
                            {dxResults.map((dx, idx) => (
                                <div key={idx} className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col justify-between gap-3">
                                    <div>
                                        <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-[10px] font-black rounded-lg uppercase tracking-wide">
                                            CIE-10: {dx.code}
                                        </span>
                                        <p className="text-xs font-bold text-slate-700 mt-2 leading-relaxed">
                                            {dx.description}
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => copyToClipboard(`${dx.code} - ${dx.description}`)}
                                        className="py-2 border border-slate-200 hover:bg-white text-slate-500 hover:text-slate-700 text-[10px] font-black uppercase tracking-widest rounded-lg flex items-center justify-center gap-1.5 transition-all shadow-sm"
                                    >
                                        <FiClipboard size={12} /> Copiar Diagnóstico
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}
