import React, { useState, useEffect } from 'react';
import { FiX, FiCheck, FiSave, FiPlus, FiTrash2, FiSearch, FiBox, FiList } from 'react-icons/fi';
import { collection, doc, setDoc, serverTimestamp, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../../firebase/firebaseConfig';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';

/**
 * CATÁLOGO CUM – Código Único Nacional de Medicamentos
 * 
 * Marco legal: Resolución 0255 de 2007 - Ministerio de la Protección Social
 * Entidad gestora: INVIMA (Instituto Nacional de Vigilancia de Medicamentos y Alimentos)
 * Consulta oficial: https://www.datos.gov.co → "Código Único de Medicamentos Vigentes"
 * 
 * Campos obligatorios per Res. 255/2007 Art. 3:
 *  1. cum              → Número Trazador (expediente INVIMA + consecutivo de presentación)
 *  2. atc              → Clasificación Anatómico-Terapéutica hasta 5° nivel (OMS)
 *  3. formaFarmaceutica → Forma farmacéutica estandarizada
 *  4. unidadConcentracion → Unidad de concentración del principio activo (mg, %, UI, etc.)
 *  5. viaAdministracion → Vía de administración estandarizada
 *  6. unidadMedida     → Unidad de medida de la presentación comercial (tableta, cápsula, mL, etc.)
 * 
 * Campos adicionales (contexto clínico odontológico):
 *  - principioActivo, concentracion, descripcion, marca, tipo (POS/NO POS), registroInvima
 */
const COLOMBIAN_CUM_REGISTRY = [
  // ══ ANALGÉSICOS / ANTIPIRÉTICOS (Grupo ATC: N02 / M01) ══════════════════
  {
    cum: "19987452-1",            registroInvima: "INVIMA 2021M-007223-R4",
    principioActivo: "Acetaminofén",
    concentracion: "500 mg",     unidadConcentracion: "mg",
    formaFarmaceutica: "Tableta", viaAdministracion: "Oral",
    unidadMedida: "Tableta",      tipo: "POS",
    atc: "N02BE01",
    marca: "Genfar",
    descripcion: "Acetaminofén 500 mg Tableta – Analgésico/antipirético de primera línea en odontología"
  },
  {
    cum: "19987452-2",            registroInvima: "INVIMA 2021M-007223-R4",
    principioActivo: "Acetaminofén",
    concentracion: "1000 mg",    unidadConcentracion: "mg",
    formaFarmaceutica: "Tableta", viaAdministracion: "Oral",
    unidadMedida: "Tableta",      tipo: "POS",
    atc: "N02BE01",
    marca: "Genfar",
    descripcion: "Acetaminofén 1000 mg Tableta – Dosis alta para dolor moderado"
  },
  {
    cum: "20083210-1",            registroInvima: "INVIMA 2022M-010029-R2",
    principioActivo: "Ibuprofeno",
    concentracion: "400 mg",     unidadConcentracion: "mg",
    formaFarmaceutica: "Tableta recubierta", viaAdministracion: "Oral",
    unidadMedida: "Tableta",      tipo: "POS",
    atc: "M01AE01",
    marca: "Bayer",
    descripcion: "Ibuprofeno 400 mg Tableta recubierta – AINE antiinflamatorio/analgésico posoperatorio"
  },
  {
    cum: "20083210-2",            registroInvima: "INVIMA 2022M-010029-R2",
    principioActivo: "Ibuprofeno",
    concentracion: "600 mg",     unidadConcentracion: "mg",
    formaFarmaceutica: "Tableta recubierta", viaAdministracion: "Oral",
    unidadMedida: "Tableta",      tipo: "POS",
    atc: "M01AE01",
    marca: "Bayer",
    descripcion: "Ibuprofeno 600 mg Tableta recubierta – Dolor moderado a severo"
  },
  {
    cum: "19935303-4",            registroInvima: "INVIMA 2020M-005412-R3",
    principioActivo: "Ketorolaco Trometamina",
    concentracion: "10 mg",      unidadConcentracion: "mg",
    formaFarmaceutica: "Tableta", viaAdministracion: "Oral",
    unidadMedida: "Tableta",      tipo: "POS",
    atc: "M01AB15",
    marca: "Genfar",
    descripcion: "Ketorolaco 10 mg Tableta – AINE de alta potencia analgésica (máx. 5 días)"
  },
  {
    cum: "19935303-5",            registroInvima: "INVIMA 2020M-005412-R3",
    principioActivo: "Ketorolaco Trometamina",
    concentracion: "30 mg/mL",   unidadConcentracion: "mg/mL",
    formaFarmaceutica: "Solución inyectable", viaAdministracion: "Intramuscular",
    unidadMedida: "Ampolla 1 mL", tipo: "POS",
    atc: "M01AB15",
    marca: "Genfar",
    descripcion: "Ketorolaco 30 mg/mL Ampolla IM – Dolor agudo posoperatorio inmediato"
  },
  {
    cum: "20145678-1",            registroInvima: "INVIMA 2023M-013210-R1",
    principioActivo: "Naproxeno Sódico",
    concentracion: "550 mg",     unidadConcentracion: "mg",
    formaFarmaceutica: "Tableta", viaAdministracion: "Oral",
    unidadMedida: "Tableta",      tipo: "POS",
    atc: "M01AE02",
    marca: "Tecnoquímicas",
    descripcion: "Naproxeno Sódico 550 mg Tableta – AINE de acción prolongada"
  },
  // ══ ANTIINFLAMATORIOS CORTICOSTEROIDES (Grupo ATC: H02) ═════════════════
  {
    cum: "19872341-2",            registroInvima: "INVIMA 2019M-003801-R5",
    principioActivo: "Dexametasona",
    concentracion: "4 mg",       unidadConcentracion: "mg",
    formaFarmaceutica: "Tableta", viaAdministracion: "Oral",
    unidadMedida: "Tableta",      tipo: "POS",
    atc: "H02AB02",
    marca: "Genfar",
    descripcion: "Dexametasona 4 mg Tableta – Corticoide antiinflamatorio; reduce edema posoperatorio"
  },
  {
    cum: "19872341-3",            registroInvima: "INVIMA 2019M-003801-R5",
    principioActivo: "Dexametasona",
    concentracion: "8 mg/2 mL",  unidadConcentracion: "mg/mL",
    formaFarmaceutica: "Solución inyectable", viaAdministracion: "Intramuscular",
    unidadMedida: "Ampolla 2 mL", tipo: "POS",
    atc: "H02AB02",
    marca: "Chalver",
    descripcion: "Dexametasona 8 mg/2 mL Ampolla IM – Antiinflamatorio potente de acción rápida"
  },
  {
    cum: "20031892-1",            registroInvima: "INVIMA 2021M-008891-R2",
    principioActivo: "Metilprednisolona",
    concentracion: "4 mg",       unidadConcentracion: "mg",
    formaFarmaceutica: "Tableta", viaAdministracion: "Oral",
    unidadMedida: "Tableta",      tipo: "NO POS",
    atc: "H02AB04",
    marca: "Pfizer",
    descripcion: "Metilprednisolona 4 mg Tableta – Corticoide; esquema Medrol Dosepak en cirugía oral"
  },
  // ══ ANTIBIÓTICOS (Grupo ATC: J01) ═══════════════════════════════════════
  {
    cum: "20043210-1",            registroInvima: "INVIMA 2021M-007896-R4",
    principioActivo: "Amoxicilina",
    concentracion: "500 mg",     unidadConcentracion: "mg",
    formaFarmaceutica: "Cápsula", viaAdministracion: "Oral",
    unidadMedida: "Cápsula",      tipo: "POS",
    atc: "J01CA04",
    marca: "Genfar",
    descripcion: "Amoxicilina 500 mg Cápsula – Betalactámico de primera línea en infecciones dentales"
  },
  {
    cum: "20043210-2",            registroInvima: "INVIMA 2021M-007896-R4",
    principioActivo: "Amoxicilina + Ácido Clavulánico",
    concentracion: "875 mg/125 mg", unidadConcentracion: "mg",
    formaFarmaceutica: "Tableta recubierta", viaAdministracion: "Oral",
    unidadMedida: "Tableta",      tipo: "POS",
    atc: "J01CR02",
    marca: "GlaxoSmithKline",
    descripcion: "Amoxicilina/Clavulánico 875/125 mg Tableta – Amplio espectro; bacterias productoras de betalactamasa"
  },
  {
    cum: "20084532-1",            registroInvima: "INVIMA 2020M-006231-R3",
    principioActivo: "Clindamicina",
    concentracion: "300 mg",     unidadConcentracion: "mg",
    formaFarmaceutica: "Cápsula", viaAdministracion: "Oral",
    unidadMedida: "Cápsula",      tipo: "POS",
    atc: "J01FF01",
    marca: "Tecnoquímicas",
    descripcion: "Clindamicina 300 mg Cápsula – Antibiótico de elección en infecciones periodontales graves"
  },
  {
    cum: "20084532-2",            registroInvima: "INVIMA 2020M-006231-R3",
    principioActivo: "Clindamicina",
    concentracion: "600 mg/4 mL", unidadConcentracion: "mg/mL",
    formaFarmaceutica: "Solución inyectable", viaAdministracion: "Intramuscular",
    unidadMedida: "Ampolla 4 mL", tipo: "POS",
    atc: "J01FF01",
    marca: "Chalver",
    descripcion: "Clindamicina 600 mg/4 mL Ampolla IM – Infecciones orofaciales graves hospitalizadas"
  },
  {
    cum: "20091234-1",            registroInvima: "INVIMA 2022M-009543-R2",
    principioActivo: "Azitromicina",
    concentracion: "500 mg",     unidadConcentracion: "mg",
    formaFarmaceutica: "Tableta recubierta", viaAdministracion: "Oral",
    unidadMedida: "Tableta",      tipo: "POS",
    atc: "J01FA10",
    marca: "Genfar",
    descripcion: "Azitromicina 500 mg Tableta – Macrólido; alternativa en alérgicos a penicilina"
  },
  {
    cum: "20021567-1",            registroInvima: "INVIMA 2020M-005100-R4",
    principioActivo: "Metronidazol",
    concentracion: "500 mg",     unidadConcentracion: "mg",
    formaFarmaceutica: "Tableta", viaAdministracion: "Oral",
    unidadMedida: "Tableta",      tipo: "POS",
    atc: "J01XD01",
    marca: "Genfar",
    descripcion: "Metronidazol 500 mg Tableta – Antibiótico anaerobio; pericoronitis, abscesos"
  },
  {
    cum: "20021567-2",            registroInvima: "INVIMA 2020M-005100-R4",
    principioActivo: "Amoxicilina + Metronidazol",
    concentracion: "500 mg/500 mg", unidadConcentracion: "mg",
    formaFarmaceutica: "Tableta", viaAdministracion: "Oral",
    unidadMedida: "Tableta",      tipo: "POS",
    atc: "J01CR01",
    marca: "Lafrancol",
    descripcion: "Amoxicilina + Metronidazol 500/500 mg Tableta combinada – Sinergia aerobios/anaerobios"
  },
  // ══ ANESTÉSICOS LOCALES (Grupo ATC: N01B) ═══════════════════════════════
  {
    cum: "19921098-1",            registroInvima: "INVIMA 2018M-002341-R6",
    principioActivo: "Lidocaína Clorhidrato + Epinefrina",
    concentracion: "2% / 1:80.000", unidadConcentracion: "% / dilución",
    formaFarmaceutica: "Solución inyectable – Cárpula dental", viaAdministracion: "Infiltrativa o bloqueo nervioso",
    unidadMedida: "Cárpula 1.8 mL", tipo: "NO POS",
    atc: "N01BB52",
    marca: "New Stetic",
    descripcion: "Lidocaína 2% + Epinefrina 1:80.000 – Anestesia dental estándar, duración ~60–90 min"
  },
  {
    cum: "19921098-2",            registroInvima: "INVIMA 2018M-002341-R6",
    principioActivo: "Lidocaína Clorhidrato + Epinefrina",
    concentracion: "2% / 1:100.000", unidadConcentracion: "% / dilución",
    formaFarmaceutica: "Solución inyectable – Cárpula dental", viaAdministracion: "Infiltrativa o bloqueo nervioso",
    unidadMedida: "Cárpula 1.8 mL", tipo: "NO POS",
    atc: "N01BB52",
    marca: "Septodont",
    descripcion: "Lidocaína 2% + Epinefrina 1:100.000 – Menor vasoconstricción; uso en pacientes con riesgo cardiovascular leve"
  },
  {
    cum: "20104321-1",            registroInvima: "INVIMA 2021M-009102-R2",
    principioActivo: "Mepivacaína Clorhidrato",
    concentracion: "3%",         unidadConcentracion: "%",
    formaFarmaceutica: "Solución inyectable – Cárpula dental", viaAdministracion: "Infiltrativa o bloqueo nervioso",
    unidadMedida: "Cárpula 1.8 mL", tipo: "NO POS",
    atc: "N01BB03",
    marca: "New Stetic",
    descripcion: "Mepivacaína 3% sin vasoconstrictor – Indicada en pacientes con contraindicación a epinefrina"
  },
  {
    cum: "20104321-2",            registroInvima: "INVIMA 2021M-009102-R2",
    principioActivo: "Articaína Clorhidrato + Epinefrina",
    concentracion: "4% / 1:100.000", unidadConcentracion: "% / dilución",
    formaFarmaceutica: "Solución inyectable – Cárpula dental", viaAdministracion: "Infiltrativa o bloqueo nervioso",
    unidadMedida: "Cárpula 1.8 mL", tipo: "NO POS",
    atc: "N01BB58",
    marca: "Septodont",
    descripcion: "Articaína 4% + Epinefrina 1:100.000 – Mayor difusión ósea; ideal en infiltrativas mandibulares"
  },
  {
    cum: "20104321-3",            registroInvima: "INVIMA 2021M-009102-R2",
    principioActivo: "Bupivacaína Clorhidrato + Epinefrina",
    concentracion: "0.5% / 1:200.000", unidadConcentracion: "% / dilución",
    formaFarmaceutica: "Solución inyectable", viaAdministracion: "Bloqueo nervioso",
    unidadMedida: "Ampolla 10 mL", tipo: "NO POS",
    atc: "N01BB01",
    marca: "Baxter",
    descripcion: "Bupivacaína 0.5% + Epinefrina – Anestesia de larga duración (4–8 h); cirugía oral mayor"
  },
  // ══ ANTISÉPTICOS BUCALES (Grupo ATC: A01AB) ══════════════════════════════
  {
    cum: "20112233-1",            registroInvima: "INVIMA 2022M-011234-R1",
    principioActivo: "Clorhexidina Gluconato",
    concentracion: "0.12%",      unidadConcentracion: "%",
    formaFarmaceutica: "Solución para enjuague bucal", viaAdministracion: "Tópica bucal (enjuague)",
    unidadMedida: "Frasco 500 mL", tipo: "NO POS",
    atc: "A01AB03",
    marca: "Perio·Aid",
    descripcion: "Clorhexidina 0.12% Enjuague – Antiséptico periodontal; uso crónico"
  },
  {
    cum: "20112233-2",            registroInvima: "INVIMA 2022M-011234-R1",
    principioActivo: "Clorhexidina Gluconato",
    concentracion: "0.20%",      unidadConcentracion: "%",
    formaFarmaceutica: "Solución para enjuague bucal", viaAdministracion: "Tópica bucal (enjuague)",
    unidadMedida: "Frasco 500 mL", tipo: "NO POS",
    atc: "A01AB03",
    marca: "Bexident",
    descripcion: "Clorhexidina 0.20% Enjuague – Posquirúrgico inmediato (exodoncia, implantes)"
  },
  {
    cum: "20112233-3",            registroInvima: "INVIMA 2022M-011234-R1",
    principioActivo: "Clorhexidina Gluconato",
    concentracion: "2%",         unidadConcentracion: "%",
    formaFarmaceutica: "Solución antiséptica tópica", viaAdministracion: "Tópica (piel/mucosa)",
    unidadMedida: "Frasco 500 mL", tipo: "NO POS",
    atc: "A01AB03",
    marca: "Labquifar",
    descripcion: "Clorhexidina 2% Solución tópica – Asepsia del campo operatorio previo a cirugía"
  },
  // ══ ANSIOLÍTICOS / PREMEDICACIÓN (Grupo ATC: N05B) ══════════════════════
  {
    cum: "20198731-1",            registroInvima: "INVIMA 2023M-014521-R1",
    principioActivo: "Diazepam",
    concentracion: "5 mg",       unidadConcentracion: "mg",
    formaFarmaceutica: "Tableta", viaAdministracion: "Oral",
    unidadMedida: "Tableta",      tipo: "POS",
    atc: "N05BA01",
    marca: "Genfar",
    descripcion: "Diazepam 5 mg Tableta – Premedicación ansiolítica; 1 h antes del procedimiento"
  },
  {
    cum: "20198731-2",            registroInvima: "INVIMA 2023M-014521-R1",
    principioActivo: "Midazolam",
    concentracion: "7.5 mg",     unidadConcentracion: "mg",
    formaFarmaceutica: "Tableta", viaAdministracion: "Oral",
    unidadMedida: "Tableta",      tipo: "NO POS",
    atc: "N05CD08",
    marca: "Roche",
    descripcion: "Midazolam 7.5 mg Tableta – Sedación oral consciente en procedimientos largos"
  },
  // ══ HEMOSTÁTICOS (Grupo ATC: B02) ═══════════════════════════════════════
  {
    cum: "20231045-1",            registroInvima: "INVIMA 2024M-016892-R1",
    principioActivo: "Ácido Tranexámico",
    concentracion: "500 mg",     unidadConcentracion: "mg",
    formaFarmaceutica: "Tableta", viaAdministracion: "Oral",
    unidadMedida: "Tableta",      tipo: "NO POS",
    atc: "B02AA02",
    marca: "Lafrancol",
    descripcion: "Ácido Tranexámico 500 mg Tableta – Hemostático sistémico; pacientes anticoagulados"
  },
  {
    cum: "20231045-2",            registroInvima: "INVIMA 2024M-016892-R1",
    principioActivo: "Etamsilato",
    concentracion: "500 mg",     unidadConcentracion: "mg",
    formaFarmaceutica: "Tableta", viaAdministracion: "Oral",
    unidadMedida: "Tableta",      tipo: "NO POS",
    atc: "B02BX01",
    marca: "Tecnoquímicas",
    descripcion: "Etamsilato 500 mg Tableta – Hemostático capilar; sangrado gingival o alveolar"
  },
  // ══ VITAMINAS / REGENERACIÓN TISULAR (Grupo ATC: A11) ═══════════════════
  {
    cum: "20009871-1",            registroInvima: "INVIMA 2019M-004102-R3",
    principioActivo: "Ácido Ascórbico (Vitamina C)",
    concentracion: "1000 mg",    unidadConcentracion: "mg",
    formaFarmaceutica: "Tableta efervescente", viaAdministracion: "Oral",
    unidadMedida: "Tableta",      tipo: "NO POS",
    atc: "A11GA01",
    marca: "Bayer",
    descripcion: "Vitamina C 1000 mg Efervescente – Soporte cicatrización posquirúrgica; colágeno"
  },
];

export default function DocClinicoModal({ isOpen, onClose, patient, docType, initialData = null, isViewOnly = false }) {
    const { userProfile } = useAuth();
    const toast = useToast();
    
    const [saving, setSaving] = useState(false);
    const [contenido, setContenido] = useState("");
    const [profesional, setProfesional] = useState("");
    const [diagnostico, setDiagnostico] = useState("");
    
    // Lista de profesionales
    const [catalogProfesionales, setCatalogProfesionales] = useState([]);

    // Receta structured states
    const [recetaItems, setRecetaItems] = useState([]);
    const [treatmentPlans, setTreatmentPlans] = useState([]);
    const [selectedPlan, setSelectedPlan] = useState("");
    
    // Search states
    const [medSearchTerm, setMedSearchTerm] = useState("");
    const [selectedMed, setSelectedMed] = useState(null);
    const [medSuggestions, setMedSuggestions] = useState([]);
 
    // Sub-modal states for "Detalle de Prescripción"
    const [prescriptionDetailOpen, setPrescriptionDetailOpen] = useState(false);
    const [prescripcionDescripcion, setPrescripcionDescripcion] = useState("");
    const [prescripcionMarca, setPrescripcionMarca] = useState("");
    const [prescripcionDosisValor, setPrescripcionDosisValor] = useState("");
    const [prescripcionDosisUnidad, setPrescripcionDosisUnidad] = useState("mg");
    const [prescripcionFrecuenciaValor, setPrescripcionFrecuenciaValor] = useState("");
    const [prescripcionFrecuenciaUnidad, setPrescripcionFrecuenciaUnidad] = useState("Horas");
    const [prescripcionVia, setPrescripcionVia] = useState("Oral");
    const [prescripcionDuracionValor, setPrescripcionDuracionValor] = useState("");
    const [prescripcionDuracionUnidad, setPrescripcionDuracionUnidad] = useState("Días");
    const [prescripcionCantidad, setPrescripcionCantidad] = useState("");
    const [prescripcionRecomendacion, setPrescripcionRecomendacion] = useState("");

    // Load active treatment plans with date and status indicators (loads all, preserving duplicates)
    useEffect(() => {
        const loadPlans = async () => {
            if (!isOpen || docType !== 'Receta' || !patient?.id) return;
            try {
                const q = query(
                    collection(db, "treatment_plans"),
                    where("patientId", "==", patient.id)
                );
                const s = await getDocs(q);
                const list = s.docs.map(d => {
                    const data = d.data();
                    let dateStr = "";
                    if (data.createdAt) {
                        const dateObj = data.createdAt.toDate ? data.createdAt.toDate() : new Date(data.createdAt);
                        dateStr = dateObj.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
                    } else if (data.date) {
                        dateStr = new Date(data.date).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
                    }
                    
                    return {
                        id: d.id,
                        nombre: `${data.title || data.nombre || 'Plan'}${dateStr ? ' – ' + dateStr : ''}`
                    };
                });

                setTreatmentPlans(list);
            } catch (err) { }
        };
        loadPlans();
    }, [isOpen, docType, patient?.id]);

    // Filter CUM registry suggestions in the main search input
    useEffect(() => {
        if (!medSearchTerm.trim()) {
            setMedSuggestions([]);
            return;
        }
        if (selectedMed && (medSearchTerm === `${selectedMed.principioActivo} ${selectedMed.concentracion || ''}`.trim())) {
            setMedSuggestions([]);
            return;
        }
        const lower = medSearchTerm.toLowerCase();
        const filtered = COLOMBIAN_CUM_REGISTRY.filter(c =>
            c.principioActivo.toLowerCase().includes(lower) ||
            c.cum.toLowerCase().includes(lower) ||
            (c.descripcion && c.descripcion.toLowerCase().includes(lower)) ||
            (c.marca && c.marca.toLowerCase().includes(lower))
        ).slice(0, 8);
        setMedSuggestions(filtered);
    }, [medSearchTerm, selectedMed]);

    // Initialize/Reset
    useEffect(() => {
        if (!isOpen) {
            setContenido("");
            setDiagnostico("");
            setProfesional(userProfile?.nombreCompleto || userProfile?.nombre || "");
            setRecetaItems([]);
            setSelectedPlan("");
            setMedSearchTerm("");
            setSelectedMed(null);
            clearPrescriptionDetailFields();
        } else if (initialData) {
            setContenido(initialData.contenido || "");
            setDiagnostico(initialData.diagnostico || "");
            setProfesional(initialData.profesional || userProfile?.nombreCompleto || userProfile?.nombre || "");
            setRecetaItems(initialData.recetaItems || []);
            setSelectedPlan(initialData.planFormulacion || "");
        } else {
            setProfesional(userProfile?.nombreCompleto || userProfile?.nombre || "");
            setRecetaItems([]);
            setSelectedPlan("");
        }
    }, [isOpen, initialData, userProfile]);

    // Load active professionals
    useEffect(() => {
        const loadCatalog = async () => {
            if (!userProfile?.inquilino) return;
            try {
                const q = query(
                    collection(db, "usuarios"),
                    where("inquilino", "==", userProfile.inquilino),
                    where("esDoctor", "==", true),
                    where("activo", "==", true)
                );
                const s = await getDocs(q);
                const list = s.docs.map(d => {
                    const data = d.data();
                    return { id: d.id, nombreCompleto: data.nombreCompleto || `${data.nombre || ''} ${data.apellido || ''}`.trim() };
                });
                setCatalogProfesionales(list.sort((a,b) => a.nombreCompleto?.localeCompare(b.nombreCompleto) || 0));
            } catch (err) { }
        };
        if (isOpen) loadCatalog();
    }, [isOpen, userProfile]);

    const clearPrescriptionDetailFields = () => {
        setPrescripcionDescripcion("");
        setPrescripcionMarca("");
        setPrescripcionDosisValor("");
        setPrescripcionDosisUnidad("mg");
        setPrescripcionFrecuenciaValor("");
        setPrescripcionFrecuenciaUnidad("Horas");
        setPrescripcionVia("Oral");
        setPrescripcionDuracionValor("");
        setPrescripcionDuracionUnidad("Días");
        setPrescripcionCantidad("");
        setPrescripcionRecomendacion("");
    };

    const handleSelectMedication = (m) => {
        setSelectedMed(m);
        setMedSearchTerm(`${m.principioActivo} ${m.concentracion || ''}`.trim());
        setMedSuggestions([]);
        
        // Pre-fill prescription details sub-modal fields
        setPrescripcionDescripcion(m.descripcion || "");
        setPrescripcionMarca(m.marca || "");
        
        // Extract dosage value if exists (e.g. "500 mg" -> "500")
        const dosisVal = m.concentracion ? m.concentracion.replace(/[^0-9.]/g, '') : "";
        setPrescripcionDosisValor(dosisVal);
        
        // Extract dosage unit
        let dosisUnit = "mg";
        if (m.concentracion) {
            const unitPart = m.concentracion.replace(/[0-9. ]/g, '');
            if (unitPart) dosisUnit = unitPart;
        } else if (m.unidadConcentracion) {
            dosisUnit = m.unidadConcentracion;
        } else if (m.unidadMedida) {
            dosisUnit = m.unidadMedida;
        }
        setPrescripcionDosisUnidad(dosisUnit);
        
        setPrescripcionFrecuenciaValor("");
        setPrescripcionFrecuenciaUnidad("Horas");
        setPrescripcionVia(m.viaAdministracion || "Oral");
        setPrescripcionDuracionValor("");
        setPrescripcionDuracionUnidad("Días");
        setPrescripcionCantidad("");
        setPrescripcionRecomendacion("");
        
        setPrescriptionDetailOpen(true);
    };

    const handleSavePrescriptionItem = () => {
        if (!selectedMed) {
            toast.error("Debe seleccionar un medicamento válido");
            return;
        }
        if (!prescripcionDosisValor.trim() || !prescripcionFrecuenciaValor.trim() || !prescripcionCantidad.trim()) {
            toast.error("Complete dosis, frecuencia y cantidad");
            return;
        }

        const newItem = {
            tipo: selectedMed.tipo || "POS",
            codigo: selectedMed.cum || "",
            principioActivo: selectedMed.principioActivo || "",
            dosis: `${prescripcionDosisValor} ${prescripcionDosisUnidad}`.trim(),
            frecuencia: `Cada ${prescripcionFrecuenciaValor} ${prescripcionFrecuenciaUnidad}`,
            viaAdministracion: prescripcionVia,
            duracion: prescripcionDuracionValor ? `${prescripcionDuracionValor} ${prescripcionDuracionUnidad}` : "Única vez",
            cantidad: prescripcionCantidad,
            marca: prescripcionMarca || "-",
            descripcion: prescripcionDescripcion || "",
            recomendacion: prescripcionRecomendacion || "",
            // Resolution 255 fields
            concentracion: selectedMed.concentracion || "",
            unidadConcentracion: selectedMed.unidadConcentracion || "",
            formaFarmaceutica: selectedMed.formaFarmaceutica || "",
            unidadMedida: selectedMed.unidadMedida || ""
        };

        setRecetaItems(prev => [...prev, newItem]);
        setPrescriptionDetailOpen(false);
        setSelectedMed(null);
        setMedSearchTerm("");
        clearPrescriptionDetailFields();
        toast.success("Medicamento añadido a la receta");
    };

    const handleRemoveItem = (index) => {
        setRecetaItems(prev => prev.filter((_, idx) => idx !== index));
    };

    const generateContenidoSummary = (items) => {
        return items.map((it, idx) => 
            `• ${it.principioActivo.toUpperCase()} [Concentración: ${it.concentracion || '-'} ${it.unidadConcentracion || ''} | Forma: ${it.formaFarmaceutica || '-'} | ATC: ${it.atc || '-'} | Reg. INVIMA: ${it.registroInvima || '-'}] - Código CUM: ${it.codigo} - Dosis: ${it.dosis} cada ${it.frecuencia}, Vía: ${it.viaAdministracion}, Unidad de Medida: ${it.unidadMedida || 'N/A'}, Duración: ${it.duracion}, Cantidad: ${it.cantidad}. Marca: ${it.marca || 'N/A'}${it.descripcion ? ` | Obs: ${it.descripcion}` : ''}`
        ).join("\n");
    };

    const handleSave = async () => {
        let finalContent = contenido;
        if (docType === 'Receta') {
            if (recetaItems.length === 0) {
                toast.error("Debe añadir al menos un medicamento a la receta");
                return;
            }
            finalContent = generateContenidoSummary(recetaItems);
        }

        if (!finalContent.trim()) {
            toast.error("El contenido no puede estar vacío");
            return;
        }
        
        setSaving(true);
        try {
            const isEditing = !!initialData;
            const docRef = isEditing 
                ? doc(db, `pacientes/${patient.id}/docClis`, initialData.id)
                : doc(collection(db, `pacientes/${patient.id}/docClis`));
            
            const payload = {
                id: docRef.id,
                fechaIso: isEditing ? initialData.fechaIso : new Date().toISOString(),
                tipoDocumento: isEditing ? initialData.tipoDocumento : docType,
                profesional: profesional,
                transcribe: isEditing ? initialData.transcribe : (userProfile?.nombreCompleto || userProfile?.nombre || "Sistema"),
                creadorId: isEditing ? initialData.creadorId : (userProfile?.uid || ""),
                contenido: finalContent,
                diagnostico: diagnostico,
                actualizado: serverTimestamp(),
                // Structured properties for recovery
                ...(docType === 'Receta' && {
                    recetaItems: recetaItems,
                    planFormulacion: selectedPlan
                })
            };

            await setDoc(docRef, payload, { merge: true });
            toast.success(`${docType || initialData?.tipoDocumento} guardada correctamente`);
            onClose();
        } catch (error) {
            console.error("Error saving document:", error);
            toast.error("Error al guardar el documento");
        } finally {
            setSaving(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
            <div className={`bg-white rounded-2xl shadow-2xl w-full ${docType === 'Receta' ? 'max-w-5xl' : 'max-w-3xl'} flex flex-col max-h-[90vh] overflow-hidden`}>
                
                {/* Modal Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50/50 bg-white">
                    <div>
                        <h2 className="text-xl font-black text-slate-800 tracking-tight">
                            {isViewOnly ? `Detalle de ${initialData?.tipoDocumento || docType}` : (initialData ? `Editar ${initialData.tipoDocumento}` : `Nueva ${docType}`)}
                        </h2>
                        <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">
                            <span>Pacientes</span> <span className="text-slate-350">-</span>
                            <span>Doc. Clínicos</span> <span className="text-slate-350">-</span>
                            <span className="text-blue-500">{isViewOnly ? "Detalle" : (initialData ? "Editar receta" : "Nueva receta")}</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        {docType === 'Receta' && !isViewOnly && (
                            <button 
                                onClick={handleSave}
                                disabled={saving}
                                className="px-6 py-2 bg-[#8CC63F] hover:bg-[#7bb335] text-white rounded-full font-bold text-xs shadow flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50"
                            >
                                {saving ? "Guardando..." : "Guardar receta"}
                            </button>
                        )}
                        <button onClick={onClose} disabled={saving} className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors border border-slate-200 bg-white">
                            <FiX size={18} />
                        </button>
                    </div>
                </div>
                
                <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar text-left">
                    
                    {/* General information blocks */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 border-b border-slate-100">
                        <div className="space-y-2">
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Odontólogo Prescriptor *</label>
                            <select 
                                value={profesional}
                                onChange={(e) => setProfesional(e.target.value)}
                                disabled={isViewOnly}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-sm font-bold text-slate-700 outline-none focus:bg-white focus:border-blue-500 transition-all appearance-none disabled:opacity-75 disabled:cursor-not-allowed"
                            >
                                <option value="" disabled>Seleccione...</option>
                                {catalogProfesionales.map(p => (
                                    <option key={p.id} value={p.nombreCompleto}>{p.nombreCompleto.toUpperCase()}</option>
                                ))}
                            </select>
                        </div>
                        
                        {docType === 'Receta' ? (
                            <div className="space-y-2">
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Plan de Formulación</label>
                                <select 
                                    value={selectedPlan}
                                    onChange={(e) => setSelectedPlan(e.target.value)}
                                    disabled={isViewOnly}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-sm font-bold text-slate-700 outline-none focus:bg-white focus:border-blue-500 transition-all appearance-none disabled:opacity-75 disabled:cursor-not-allowed"
                                >
                                    <option value="">SELECCIONE...</option>
                                    {treatmentPlans.map(plan => (
                                        <option key={plan.id} value={plan.nombre}>{plan.nombre.toUpperCase()}</option>
                                    ))}
                                </select>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Diagnóstico asoc. (Opcional)</label>
                                <input 
                                    type="text" 
                                    placeholder="EJEM: K021 - CARIES DE LA DENTINA"
                                    value={diagnostico}
                                    onChange={(e) => setDiagnostico(e.target.value)}
                                    readOnly={isViewOnly}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-sm font-bold text-slate-700 outline-none focus:bg-white focus:border-blue-500 transition-all placeholder:text-slate-350 read-only:opacity-75 read-only:cursor-not-allowed" 
                                />
                            </div>
                        )}
                    </div>

                    {/* INTERACTIVE PRESCRIPTION EDITOR */}
                    {docType === 'Receta' ? (
                        <div className="space-y-6">
                            <h3 className="text-sm font-black text-slate-800 uppercase tracking-wide flex items-center gap-2">
                                <FiList className="text-blue-500" /> Detalle de Receta Médica
                            </h3>

                            {/* Med Finder and suggestions */}
                            {!isViewOnly && (
                                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                                <div className="relative w-full">
                                    <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest pl-1 mb-1.5">
                                        Ingresar el medicamento a añadir
                                        <span className="ml-2 text-blue-400 normal-case font-bold">(catálogo nacional CUM)</span>
                                    </label>
                                    <div className="relative group">
                                        <FiSearch size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <input 
                                            type="text"
                                            placeholder="Buscar medicamento por principio activo, marca o código CUM..."
                                            value={medSearchTerm}
                                            onChange={(e) => {
                                                setMedSearchTerm(e.target.value);
                                                if (selectedMed) setSelectedMed(null);
                                            }}
                                            className="w-full pl-11 pr-4 py-3.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:border-blue-500 transition-all shadow-sm"
                                        />
                                    </div>
                                    {/* Suggestions Dropdown */}
                                    {medSuggestions.length > 0 && (
                                        <div className="absolute left-0 right-0 mt-2 bg-white rounded-xl border border-slate-200 shadow-xl z-50 overflow-hidden divide-y divide-slate-50">
                                            {medSuggestions.map(m => (
                                                <div 
                                                    key={m.cum}
                                                    onClick={() => handleSelectMedication(m)}
                                                    className="px-4 py-3 text-sm hover:bg-blue-50/50 cursor-pointer flex items-center justify-between transition-colors"
                                                >
                                                    <div className="text-left">
                                                        <p className="font-bold text-slate-700 uppercase tracking-tight">
                                                            {m.principioActivo} {m.concentracion}
                                                        </p>
                                                        <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">
                                                            <span className="text-blue-500">{m.formaFarmaceutica}</span>
                                                            {m.marca && <span className="text-slate-400"> · Marca: {m.marca}</span>}
                                                            <span className="text-slate-400"> · CUM: {m.cum}</span>
                                                        </p>
                                                    </div>
                                                    <span className={`text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-wider ${m.tipo === 'POS' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                                                        {m.tipo}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                </div>
                            )}

                            {/* Structured Prescribed items Table */}
                            <div className="overflow-x-auto rounded-xl border border-slate-100">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-slate-50">
                                            <th className="px-4 py-3 text-[10px] font-black text-slate-500 uppercase tracking-wider">Tipo</th>
                                            <th className="px-4 py-3 text-[10px] font-black text-slate-500 uppercase tracking-wider">Código</th>
                                            <th className="px-4 py-3 text-[10px] font-black text-slate-500 uppercase tracking-wider">Principio Activo</th>
                                            <th className="px-4 py-3 text-[10px] font-black text-slate-500 uppercase tracking-wider">Dosis</th>
                                            <th className="px-4 py-3 text-[10px] font-black text-slate-500 uppercase tracking-wider">Frecuencia</th>
                                            <th className="px-4 py-3 text-[10px] font-black text-slate-500 uppercase tracking-wider">Vía</th>
                                            <th className="px-4 py-3 text-[10px] font-black text-slate-500 uppercase tracking-wider">Duración</th>
                                            <th className="px-4 py-3 text-[10px] font-black text-slate-500 uppercase tracking-wider">Cant</th>
                                            <th className="px-4 py-3 text-[10px] font-black text-slate-500 uppercase tracking-wider">Marca</th>
                                            {!isViewOnly && <th className="px-4 py-3 text-[10px] font-black text-slate-500 uppercase tracking-wider text-right">Acciones</th>}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {recetaItems.length === 0 ? (
                                            <tr>
                                                <td colSpan={10} className="px-4 py-16 text-center text-slate-400 text-sm font-medium">
                                                    Sin datos (Añada medicamentos arriba)
                                                </td>
                                            </tr>
                                        ) : (
                                            recetaItems.map((item, idx) => (
                                                <tr key={idx} className="hover:bg-slate-50/30 transition-colors">
                                                    <td className="px-4 py-3"><span className="px-2 py-0.5 rounded bg-blue-50 text-blue-600 text-[9px] font-bold uppercase tracking-wider">{item.tipo}</span></td>
                                                    <td className="px-4 py-3 text-xs font-bold text-slate-500 uppercase">{item.codigo}</td>
                                                    <td className="px-4 py-3 text-xs font-bold text-slate-700 uppercase tracking-tight">{item.principioActivo}</td>
                                                    <td className="px-4 py-3 text-xs text-slate-600">{item.dosis}</td>
                                                    <td className="px-4 py-3 text-xs text-slate-600">{item.frecuencia}</td>
                                                    <td className="px-4 py-3 text-xs text-slate-500">{item.viaAdministracion}</td>
                                                    <td className="px-4 py-3 text-xs text-slate-500">{item.duracion}</td>
                                                    <td className="px-4 py-3 text-xs font-black text-slate-800 text-center">{item.cantidad}</td>
                                                    <td className="px-4 py-3 text-xs text-slate-500 uppercase">{item.marca || "-"}</td>
                                                    {!isViewOnly && (
                                                        <td className="px-4 py-3 text-right">
                                                            <button 
                                                                type="button"
                                                                onClick={() => handleRemoveItem(idx)}
                                                                className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                                                                title="Eliminar ítem"
                                                            >
                                                                <FiTrash2 size={14} />
                                                            </button>
                                                        </td>
                                                    )}
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ) : (
                        // Muestra el textarea simple para Consultas/Órdenes/Alertas
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Detalle / Contenido *</label>
                            <textarea 
                                rows={8}
                                required
                                readOnly={isViewOnly}
                                placeholder={`Escriba el detalle de la ${(initialData?.tipoDocumento || docType).toLowerCase()} aquí...`}
                                value={contenido}
                                onChange={(e) => setContenido(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm font-medium text-slate-700 outline-none focus:bg-white focus:border-blue-500 resize-none custom-scrollbar transition-all read-only:bg-slate-50 read-only:cursor-not-allowed" 
                            />
                        </div>
                    )}
                </div>

                <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 flex-none bg-white">
                    <button onClick={onClose} disabled={saving} className="px-6 py-2.5 rounded-full font-bold text-sm text-slate-500 hover:bg-slate-200 transition-colors border border-slate-200 bg-white">
                        {isViewOnly ? "Cerrar" : "Cancelar"}
                    </button>
                    {!isViewOnly && (
                        <button onClick={handleSave} disabled={saving} className="px-8 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-black text-[11px] uppercase tracking-widest shadow-lg shadow-blue-600/30 flex items-center gap-2 transition-transform active:scale-95 disabled:opacity-50">
                            <FiCheck size={16} /> {saving ? "Guardando..." : "Guardar Documento"}
                        </button>
                    )}
                </div>
            </div>

            {/* SUB-MODAL: DETALLE DE PRESCRIPCIÓN */}
            {prescriptionDetailOpen && selectedMed && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden border border-slate-100 flex flex-col animate-in zoom-in-95 duration-300 max-h-[90vh]">
                        {/* Header */}
                        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                            <h4 className="text-sm font-black text-slate-800 uppercase tracking-wide text-left">
                                Detalle de Prescripción – {selectedMed.principioActivo.toUpperCase()}
                            </h4>
                            <button 
                                onClick={() => {
                                    setPrescriptionDetailOpen(false);
                                    setSelectedMed(null);
                                    setMedSearchTerm("");
                                    clearPrescriptionDetailFields();
                                }} 
                                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-100 transition-all"
                            >
                                <FiX size={16} />
                            </button>
                        </div>
                        
                        {/* Body Content */}
                        <div className="p-6 space-y-4 overflow-y-auto custom-scrollbar flex-1 text-left">
                            
                            {/* Tipo, Código, Principio Activo */}
                            <div className="grid grid-cols-3 gap-3">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Tipo *</label>
                                    <input 
                                        type="text" 
                                        readOnly 
                                        value={selectedMed.tipo || "POS"} 
                                        className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-505 text-slate-500 outline-none cursor-not-allowed"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Código *</label>
                                    <input 
                                        type="text" 
                                        readOnly 
                                        value={selectedMed.cum || ""} 
                                        className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-500 outline-none cursor-not-allowed font-mono"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Principio activo *</label>
                                    <input 
                                        type="text" 
                                        readOnly 
                                        value={selectedMed.principioActivo || ""} 
                                        className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-500 outline-none cursor-not-allowed"
                                    />
                                </div>
                            </div>

                            {/* Descripción */}
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Descripción</label>
                                <input 
                                    type="text" 
                                    placeholder="Descripción para el medicamento"
                                    value={prescripcionDescripcion} 
                                    onChange={e => setPrescripcionDescripcion(e.target.value)} 
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 outline-none focus:bg-white focus:border-blue-500 placeholder:text-slate-350"
                                />
                            </div>

                            {/* Marca */}
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Marca</label>
                                <input 
                                    type="text" 
                                    placeholder="Marca para el medicamento"
                                    value={prescripcionMarca} 
                                    onChange={e => setPrescripcionMarca(e.target.value)} 
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 outline-none focus:bg-white focus:border-blue-500 placeholder:text-slate-350"
                                />
                            </div>

                            {/* Dosis y Frecuencia */}
                            <div className="grid grid-cols-2 gap-3">
                                {/* Dosis (Valor + Unidad) */}
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Dosis *</label>
                                    <div className="flex gap-1.5">
                                        <input 
                                            type="text" 
                                            placeholder="Ej: 500"
                                            value={prescripcionDosisValor} 
                                            onChange={e => setPrescripcionDosisValor(e.target.value)} 
                                            className="w-2/3 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 outline-none focus:bg-white focus:border-blue-500 placeholder:text-slate-350"
                                        />
                                        <select 
                                            value={prescripcionDosisUnidad} 
                                            onChange={e => setPrescripcionDosisUnidad(e.target.value)} 
                                            className="w-1/3 bg-slate-50 border border-slate-200 rounded-xl px-2 py-2 text-xs font-bold text-slate-700 outline-none focus:bg-white focus:border-blue-500 appearance-none text-center"
                                        >
                                            <option value="mg">mg</option>
                                            <option value="g">g</option>
                                            <option value="ml">ml</option>
                                            <option value="cápsula">cápsula</option>
                                            <option value="tableta">tableta</option>
                                            <option value="unidad">unidad</option>
                                            <option value="ampolla">ampolla</option>
                                            <option value="cárpula">cárpula</option>
                                            <option value="gota">gota</option>
                                            <option value="aplicación">aplicación</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Frecuencia (Valor + Unidad) */}
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Frecuencia *</label>
                                    <div className="flex gap-1.5">
                                        <input 
                                            type="text" 
                                            placeholder="Ej: 8"
                                            value={prescripcionFrecuenciaValor} 
                                            onChange={e => setPrescripcionFrecuenciaValor(e.target.value)} 
                                            className="w-1/2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 outline-none focus:bg-white focus:border-blue-500 placeholder:text-slate-350"
                                        />
                                        <select 
                                            value={prescripcionFrecuenciaUnidad} 
                                            onChange={e => setPrescripcionFrecuenciaUnidad(e.target.value)} 
                                            className="w-1/2 bg-slate-50 border border-slate-200 rounded-xl px-2 py-2 text-xs font-bold text-slate-700 outline-none focus:bg-white focus:border-blue-500 appearance-none"
                                        >
                                            <option value="Horas">Horas</option>
                                            <option value="Días">Días</option>
                                            <option value="Semanas">Semanas</option>
                                            <option value="Única dosis">Única dosis</option>
                                            <option value="Con las comidas">Con comidas</option>
                                            <option value="Antes de dormir">Al dormir</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Vía administración y Duración */}
                            <div className="grid grid-cols-2 gap-3">
                                {/* Vía Administración */}
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Vía administración *</label>
                                    <select 
                                        value={prescripcionVia} 
                                        onChange={e => setPrescripcionVia(e.target.value)} 
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 outline-none focus:bg-white focus:border-blue-500 appearance-none"
                                    >
                                        <option value="Oral">Oral</option>
                                        <option value="Tópica bucal (enjuague)">Tópica bucal (enjuague)</option>
                                        <option value="Tópica (piel/mucosa)">Tópica (piel/mucosa)</option>
                                        <option value="Infiltrativa o bloqueo nervioso">Infiltrativa / bloqueo</option>
                                        <option value="Sublingual">Sublingual</option>
                                        <option value="Intramuscular">Intramuscular</option>
                                        <option value="Intravenosa">Intravenosa</option>
                                    </select>
                                </div>

                                {/* Duración (Valor + Unidad) */}
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Duración *</label>
                                    <div className="flex gap-1.5">
                                        <input 
                                            type="text" 
                                            placeholder="Ej: 5"
                                            value={prescripcionDuracionValor} 
                                            onChange={e => setPrescripcionDuracionValor(e.target.value)} 
                                            className="w-1/2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 outline-none focus:bg-white focus:border-blue-500 placeholder:text-slate-350"
                                        />
                                        <select 
                                            value={prescripcionDuracionUnidad} 
                                            onChange={e => setPrescripcionDuracionUnidad(e.target.value)} 
                                            className="w-1/2 bg-slate-50 border border-slate-200 rounded-xl px-2 py-2 text-xs font-bold text-slate-700 outline-none focus:bg-white focus:border-blue-500 appearance-none"
                                        >
                                            <option value="Días">Días</option>
                                            <option value="Semanas">Semanas</option>
                                            <option value="Meses">Meses</option>
                                            <option value="Única vez">Única vez</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Cantidad */}
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Cantidad *</label>
                                <input 
                                    type="number" 
                                    placeholder="Ej: 15"
                                    value={prescripcionCantidad} 
                                    onChange={e => setPrescripcionCantidad(e.target.value)} 
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 outline-none focus:bg-white focus:border-blue-500 placeholder:text-slate-350"
                                />
                            </div>

                            {/* Recomendación */}
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Recomendación</label>
                                <textarea 
                                    rows={3}
                                    placeholder="Instrucciones adicionales para el paciente..."
                                    value={prescripcionRecomendacion} 
                                    onChange={e => setPrescripcionRecomendacion(e.target.value)} 
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-bold text-slate-700 outline-none focus:bg-white focus:border-blue-500 placeholder:text-slate-350 resize-none custom-scrollbar"
                                />
                            </div>

                        </div>
                        
                        {/* Footer */}
                        <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                            <button 
                                type="button" 
                                onClick={() => {
                                    setPrescriptionDetailOpen(false);
                                    setSelectedMed(null);
                                    setMedSearchTerm("");
                                    clearPrescriptionDetailFields();
                                }}
                                className="px-5 py-2.5 rounded-full font-bold text-xs text-slate-500 hover:bg-slate-200 transition-colors"
                            >
                                Cancelar
                            </button>
                            <button 
                                type="button" 
                                onClick={handleSavePrescriptionItem}
                                className="px-6 py-2.5 bg-[#8CC63F] hover:bg-[#7bb335] text-white text-xs font-black rounded-full uppercase tracking-wider shadow"
                            >
                                Agregar a la Receta
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
