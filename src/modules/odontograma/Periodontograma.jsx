import React, { useState, useEffect } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";
import Button from "../../components/ui/Button";

// Tooth numbers (FDI)
const TEETH_UPPER = [18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28];
const TEETH_LOWER = [48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38];

// Data structure per site: { pd: 0 (probe depth), gm: 0 (gingival margin), cal: 0, bleeding: false, plaque: false }
// Data structure per tooth: { vestibular: [d, c, m], lingual: [d, c, m], mobility: 0, furcation: 0 }

const INITIAL_TOOTH_DATA = {
    v: [{}, {}, {}], // Vestibular: Distal, Central, Mesial
    l: [{}, {}, {}], // Lingual/Palatal: Mesial, Central, Distal (Note order mirroring)
    mobility: 0,
    furcation: 0
};

export default function Periodontograma({ pacienteId }) {
    const [periodonto, setPeriodonto] = useState({});
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!pacienteId) return;
        const load = async () => {
            setLoading(true);
            try {
                const ref = doc(db, "pacientes", pacienteId);
                const snap = await getDoc(ref);
                if (snap.exists() && snap.data().periodontograma) {
                    setPeriodonto(snap.data().periodontograma);
                } else {
                    setPeriodonto({}); // Start empty
                }
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [pacienteId]);

    const handleSave = async () => {
        if (!pacienteId) return;
        try {
            await updateDoc(doc(db, "pacientes", pacienteId), {
                periodontograma: periodonto
            });
            alert("Periodontograma guardado correctamente");
        } catch (e) {
            console.error(e);
            alert("Error guardando");
        }
    };

    const updateSite = (toothIso, face, index, field, value) => {
        const newData = { ...periodonto };
        if (!newData[toothIso]) newData[toothIso] = JSON.parse(JSON.stringify(INITIAL_TOOTH_DATA));

        // Ensure nested objects exist
        if (!newData[toothIso][face][index]) newData[toothIso][face][index] = {};

        newData[toothIso][face][index][field] = value;

        // Auto Calculate CAL (Nivel de Inserción Clínica) = PD (Profundidad) + GM (Margen - Recesión)
        if (field === 'pd' || field === 'gm') {
            const pd = Number(newData[toothIso][face][index].pd) || 0;
            const gm = Number(newData[toothIso][face][index].gm) || 0;
            newData[toothIso][face][index].cal = pd + gm; // Simple formula, NIC
        }

        setPeriodonto(newData);
    };

    const SiteInput = ({ tooth, face, index, label }) => {
        const tData = periodonto[tooth] || INITIAL_TOOTH_DATA;
        const site = tData[face][index] || {};

        // Color logic
        const pd = site.pd || 0;
        const isDeep = pd >= 4;

        return (
            <div className="flex flex-col items-center p-0.5 border-r last:border-0 border-slate-100">
                <span className="text-[9px] text-slate-300 uppercase mb-0.5">{label}</span>

                {/* PD Input */}
                <input
                    className={`w-6 h-6 text-center text-xs font-bold border rounded-sm outline-none 
            ${isDeep ? 'bg-red-50 text-red-600 border-red-200' : 'border-slate-200'} focus:border-indigo-500`}
                    type="number"
                    placeholder="0"
                    value={site.pd || ""}
                    onChange={(e) => updateSite(tooth, face, index, 'pd', e.target.value)}
                    title="Profundidad Sondaje (mm)"
                />

                {/* GM Input (Recesión) */}
                <input
                    className="w-6 h-5 text-center text-[10px] border-b border-l border-r border-slate-100 outline-none text-slate-500 mt-0.5"
                    type="number"
                    placeholder="0"
                    value={site.gm || ""}
                    onChange={(e) => updateSite(tooth, face, index, 'gm', e.target.value)}
                    title="Margen Gingival / Recesión (mm)"
                />

                {/* Flags: Sangrado (BOP) y Placa */}
                <div className="flex gap-0.5 mt-1">
                    <div
                        className={`w-2.5 h-2.5 rounded-full cursor-pointer border ${site.bleeding ? 'bg-red-500 border-red-600' : 'bg-white border-slate-200'}`}
                        onClick={() => updateSite(tooth, face, index, 'bleeding', !site.bleeding)}
                        title="Sangrado"
                    />
                    <div
                        className={`w-2.5 h-2.5 rounded-full cursor-pointer border ${site.plaque ? 'bg-yellow-400 border-yellow-500' : 'bg-white border-slate-200'}`}
                        onClick={() => updateSite(tooth, face, index, 'plaque', !site.plaque)}
                        title="Placa"
                    />
                </div>
                {/* CAL Display */}
                <span className="text-[9px] text-slate-400 mt-0.5">{site.cal || "-"}</span>
            </div>
        );
    };

    const ToothColumn = ({ tooth }) => {
        // Vestibular: D - C - M
        // Lingual: M - C - D (Visualmente invertimos lingual para alinear Mesial con Mesial?) 
        // Usually Perio charts align M-C-D | D-C-M or similar. Let's keep specific order.
        // Upper Arch: Right (18-11) -> Vestibular is "Outside". 
        // Simplified: Vestibular Row, Palatal Row.

        return (
            <div className="flex flex-col items-center bg-white border border-slate-200 rounded-lg shadow-sm w-24">
                <div className="w-full bg-slate-100 text-center text-xs font-bold py-1 text-slate-600 border-b border-slate-200">
                    {tooth}
                </div>

                {/* Vestibular */}
                <div className="flex w-full justify-between px-1 py-1 border-b border-slate-100 bg-blue-50/30">
                    <SiteInput tooth={tooth} face="v" index={0} label="D" />
                    <SiteInput tooth={tooth} face="v" index={1} label="C" />
                    <SiteInput tooth={tooth} face="v" index={2} label="M" />
                </div>

                {/* Palatal / Lingual */}
                <div className="flex w-full justify-between px-1 py-1 bg-amber-50/30">
                    <SiteInput tooth={tooth} face="l" index={0} label="M" />
                    <SiteInput tooth={tooth} face="l" index={1} label="C" />
                    <SiteInput tooth={tooth} face="l" index={2} label="D" />
                </div>

                {/* Meta */}
                <div className="flex gap-2 p-1 w-full justify-center">
                    <select
                        className="text-[9px] border rounded bg-white"
                        value={periodonto[tooth]?.mobility || 0}
                        onChange={e => {
                            const newData = { ...periodonto };
                            if (!newData[tooth]) newData[tooth] = JSON.parse(JSON.stringify(INITIAL_TOOTH_DATA));
                            newData[tooth].mobility = e.target.value;
                            setPeriodonto(newData);
                        }}
                    >
                        <option value="0">Mov: 0</option>
                        <option value="1">I</option>
                        <option value="2">II</option>
                        <option value="3">III</option>
                    </select>
                </div>
            </div>
        );
    };

    if (!pacienteId) return <div className="text-center p-8 text-slate-400">Seleccione un paciente para ver el periodontograma.</div>;

    return (
        <div className="p-4 w-full overflow-x-auto">
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-slate-700">Periodontograma Digital</h3>
                <Button variant="primary" size="sm" onClick={handleSave}>Guardar Cambios</Button>
            </div>

            {/* Upper Arch */}
            <div className="flex flex-col gap-4 min-w-max">
                <div className="flex gap-2 justify-center border-b-2 border-slate-300 pb-4 mb-4">
                    {TEETH_UPPER.map(t => <ToothColumn key={t} tooth={t} />)}
                </div>
                <div className="flex gap-2 justify-center">
                    {TEETH_LOWER.map(t => <ToothColumn key={t} tooth={t} />)}
                </div>
            </div>

            <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs text-slate-500">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-50 text-red-600 border border-red-200 flex items-center justify-center font-bold">4</div>
                    <span>Bolsa Profunda ({'>'}=4mm)</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500 border border-red-600"></div>
                    <span>Sangrado (BOP)</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-yellow-400 border border-yellow-500"></div>
                    <span>Placa Bacteriana</span>
                </div>
            </div>
        </div>
    );
}
