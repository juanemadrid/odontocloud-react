import React, { useState, useEffect, useRef } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";
import Button from "../../components/ui/Button";
import { FiActivity, FiSave, FiAlertCircle, FiDroplet, FiSun, FiLayers } from "react-icons/fi";
import { useToast } from "../../context/ToastContext";

// Tooth numbers (FDI standards)
const TEETH_UPPER = [18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28];
const TEETH_LOWER = [48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38];

const INITIAL_TOOTH_DATA = {
    v: [{}, {}, {}], // Vestibular: Distal, Central, Mesial
    l: [{}, {}, {}], // Lingual/Palatal: Mesial, Central, Distal
    mobility: 0,
    furcation: 0
};

// ─── PeriodontogramaChart SVG Sub-component ─────────────────────────────
const PeriodontogramaChart = ({ teeth, face, isUpper, periodonto }) => {
    const Y_cej = isUpper ? 110 : 50; // CEJ level (0 mm)
    const yScale = 6; // 6px per mm

    const getY = (val) => {
        const num = Number(val) || 0;
        return isUpper ? Y_cej - num * yScale : Y_cej + num * yScale;
    };

    // Calculate X coordinates for each tooth and site
    const points = [];
    teeth.forEach((tooth, tIdx) => {
        const tData = periodonto[tooth] || {};
        const faceData = tData[face] || [{}, {}, {}];

        [0, 1, 2].forEach((sIdx) => {
            const site = faceData[sIdx] || {};
            const pd = site.pd !== undefined && site.pd !== "" ? Number(site.pd) : 0;
            const gm = site.gm !== undefined && site.gm !== "" ? Number(site.gm) : 0;
            const cal = site.cal !== undefined && site.cal !== "" ? Number(site.cal) : pd + gm;

            const x = tIdx * (112 + 12) + 4 + (104 / 3) * (sIdx + 0.5);
            points.push({
                x,
                gm,
                cal,
                pd,
                bleeding: site.bleeding,
                plaque: site.plaque,
                tooth,
                siteIndex: sIdx
            });
        });
    });

    // Path for Gingival Margin (Blue)
    const gmPath = points.map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x} ${getY(p.gm)}`).join(' ');

    // Path for Clinical Attachment Level (Red)
    const calPath = points.map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x} ${getY(p.cal)}`).join(' ');

    // Shaded pocket area polygon (connecting GM and CAL line nodes)
    const pocketPoints = [];
    points.forEach(p => {
        pocketPoints.push(`${p.x},${getY(p.gm)}`);
    });
    for (let i = points.length - 1; i >= 0; i--) {
        const p = points[i];
        pocketPoints.push(`${p.x},${getY(p.cal)}`);
    }
    const pocketPolygon = pocketPoints.join(' ');

    // Millimeter Grid scale levels
    const gridLevels = [-4, -2, 0, 2, 4, 6, 8, 10, 12];
    const yCej = getY(0);
    const y4mm = getY(4);

    return (
        <div className="w-[1972px] h-[160px] bg-slate-50/40 rounded-2xl relative border border-slate-100/80 shadow-inner overflow-hidden select-none shrink-0">
            <svg width={1972} height={160} viewBox="0 0 1972 160" className="absolute inset-0">
                {/* Visual Gradient Background */}
                <defs>
                    <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#f8fafc" stopOpacity="0.8" />
                        <stop offset="100%" stopColor="#ffffff" stopOpacity="0.8" />
                    </linearGradient>
                </defs>
                <rect width={1972} height={160} fill="url(#chartGrad)" />

                {/* Millimeter Horizontal Grids */}
                {gridLevels.map((lvl) => {
                    const y = getY(lvl);
                    const isCej = lvl === 0;
                    return (
                        <g key={lvl}>
                            <line
                                x1={0}
                                y1={y}
                                x2={1972}
                                y2={y}
                                stroke={isCej ? "#64748b" : "#e2e8f0"}
                                strokeWidth={isCej ? 1.5 : 0.75}
                                strokeDasharray={isCej ? "" : "3,3"}
                            />
                            {/* Level labels at both ends */}
                            <text x={8} y={y + 3} className="text-[8px] font-black fill-slate-400">{lvl}</text>
                            <text x={1964} y={y + 3} className="text-[8px] font-black fill-slate-400" textAnchor="end">{lvl}</text>
                        </g>
                    );
                })}

                {/* Pathological 4mm Threshold Guide Line */}
                <line
                    x1={0}
                    y1={y4mm}
                    x2={1972}
                    y2={y4mm}
                    stroke="#f43f5e"
                    strokeWidth={1}
                    strokeDasharray="4,4"
                    opacity={0.85}
                />
                <text x={40} y={isUpper ? y4mm + 10 : y4mm - 4} className="text-[7.5px] font-black fill-rose-500 uppercase tracking-widest">Umbral 4mm</text>
                <text x={24} y={isUpper ? yCej + 10 : yCej - 4} className="text-[7.5px] font-black fill-slate-500 uppercase tracking-widest">Línea CEJ</text>

                {/* Vertical guides aligning to sites */}
                {points.map((p, idx) => (
                    <line
                        key={idx}
                        x1={p.x}
                        y1={0}
                        x2={p.x}
                        y2={160}
                        stroke="#e2e8f0"
                        strokeWidth={p.siteIndex === 1 ? 1 : 0.5}
                        strokeDasharray={p.siteIndex === 1 ? "4,4" : "1,3"}
                        opacity={0.4}
                    />
                ))}

                {/* Simplified Anatomical Teeth Backdrop */}
                {teeth.map((tooth, tIdx) => {
                    const xCenter = tIdx * (112 + 12) + 56;
                    const isMolar = [18, 17, 16, 26, 27, 28, 48, 47, 46, 36, 37, 38].includes(tooth);

                    if (isUpper) {
                        if (isMolar) {
                            return (
                                <path
                                    key={tooth}
                                    d={`M ${xCenter - 16} 110 
                                        C ${xCenter - 16} 135, ${xCenter + 16} 135, ${xCenter + 16} 110
                                        L ${xCenter + 14} 70
                                        C ${xCenter + 14} 30, ${xCenter + 6} 20, ${xCenter + 8} 25
                                        L ${xCenter} 55
                                        L ${xCenter - 8} 25
                                        C ${xCenter - 6} 20, ${xCenter - 14} 30, ${xCenter - 14} 70
                                        Z`}
                                    fill="#f1f5f9"
                                    stroke="#cbd5e1"
                                    strokeWidth={1}
                                    fillOpacity={0.45}
                                    strokeOpacity={0.5}
                                />
                            );
                        } else {
                            return (
                                <path
                                    key={tooth}
                                    d={`M ${xCenter - 10} 110
                                        C ${xCenter - 10} 132, ${xCenter + 10} 132, ${xCenter + 10} 110
                                        L ${xCenter + 8} 70
                                        C ${xCenter + 8} 30, ${xCenter} 20, ${xCenter} 20
                                        C ${xCenter} 20, ${xCenter - 8} 30, ${xCenter - 8} 70
                                        Z`}
                                    fill="#f1f5f9"
                                    stroke="#cbd5e1"
                                    strokeWidth={1}
                                    fillOpacity={0.45}
                                    strokeOpacity={0.5}
                                />
                            );
                        }
                    } else {
                        if (isMolar) {
                            return (
                                <path
                                    key={tooth}
                                    d={`M ${xCenter - 16} 50
                                        C ${xCenter - 16} 25, ${xCenter + 16} 25, ${xCenter + 16} 50
                                        L ${xCenter + 14} 90
                                        C ${xCenter + 14} 130, ${xCenter + 6} 140, ${xCenter + 8} 135
                                        L ${xCenter} 105
                                        L ${xCenter - 8} 135
                                        C ${xCenter - 6} 140, ${xCenter - 14} 130, ${xCenter - 14} 90
                                        Z`}
                                    fill="#f1f5f9"
                                    stroke="#cbd5e1"
                                    strokeWidth={1}
                                    fillOpacity={0.45}
                                    strokeOpacity={0.5}
                                />
                            );
                        } else {
                            return (
                                <path
                                    key={tooth}
                                    d={`M ${xCenter - 10} 50
                                        C ${xCenter - 10} 28, ${xCenter + 10} 28, ${xCenter + 10} 50
                                        L ${xCenter + 8} 90
                                        C ${xCenter + 8} 130, ${xCenter} 140, ${xCenter} 140
                                        C ${xCenter} 140, ${xCenter - 8} 130, ${xCenter - 8} 90
                                        Z`}
                                    fill="#f1f5f9"
                                    stroke="#cbd5e1"
                                    strokeWidth={1}
                                    fillOpacity={0.45}
                                    strokeOpacity={0.5}
                                />
                            );
                        }
                    }
                })}

                {/* Direct Tooth Number Labels inside SVG */}
                {teeth.map((tooth, tIdx) => {
                    const xCenter = tIdx * (112 + 12) + 56;
                    const yPos = isUpper ? (face === 'v' ? 18 : 148) : (face === 'v' ? 148 : 18);
                    return (
                        <text
                            key={`num-${tooth}`}
                            x={xCenter}
                            y={yPos}
                            className="text-[9px] font-black fill-slate-400/80 uppercase tracking-widest"
                            textAnchor="middle"
                        >
                            {tooth}
                        </text>
                    );
                })}

                {/* Shaded pocket area (translucent red) */}
                {points.some(p => p.pd > 0) && (
                    <polygon
                        points={pocketPolygon}
                        fill="#ef4444"
                        fillOpacity={0.15}
                    />
                )}

                {/* GM Line (Blue) */}
                <path
                    d={gmPath}
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />

                {/* CAL Line (Red) */}
                <path
                    d={calPath}
                    fill="none"
                    stroke="#ef4444"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />

                {/* Nodes & Bleeding/Plaque Indicators */}
                {points.map((p, idx) => {
                    const y_gm = getY(p.gm);
                    const y_cal = getY(p.cal);
                    return (
                        <g key={idx}>
                            {/* GM Node */}
                            <circle cx={p.x} cy={y_gm} r={3} fill="#2563eb" stroke="#ffffff" strokeWidth={1} />
                            
                            {/* CAL Node */}
                            <circle cx={p.x} cy={y_cal} r={3} fill="#dc2626" stroke="#ffffff" strokeWidth={1} />

                            {/* Bleeding Marker (BOP - Red Dot) */}
                            {p.bleeding && (
                                <circle
                                    cx={p.x}
                                    cy={isUpper ? y_gm + 9 : y_gm - 9}
                                    r={4}
                                    fill="#e11d48"
                                    stroke="#ffffff"
                                    strokeWidth={1.2}
                                />
                            )}

                            {/* Plaque Marker (PLA - Yellow/Amber Dot) */}
                            {p.plaque && (
                                <circle
                                    cx={p.x + (p.bleeding ? 5 : 0)}
                                    cy={isUpper ? y_gm + 9 : y_gm - 9}
                                    r={4}
                                    fill="#d97706"
                                    stroke="#ffffff"
                                    strokeWidth={1.2}
                                />
                            )}

                            {/* Pathological Numeric Pocket Value above CAL node */}
                            {p.pd >= 4 && (
                                <text
                                    x={p.x}
                                    y={isUpper ? y_cal - 8 : y_cal + 11}
                                    className="text-[8.5px] font-black fill-red-600"
                                    textAnchor="middle"
                                >
                                    {p.pd}
                                </text>
                            )}
                        </g>
                    );
                })}
            </svg>
        </div>
    );
};

// ─── SiteInput Sub-component (Moved outside render) ──────────────────────
const SiteInput = ({ 
    tooth, 
    face, 
    index, 
    label, 
    isUpper, 
    periodonto, 
    updateSite, 
    handleInputChange, 
    handleKeyDown 
}) => {
    const tData = periodonto[tooth] || INITIAL_TOOTH_DATA;
    const faceData = tData[face] || [{}, {}, {}];
    const site = faceData[index] || {};

    const pd = site.pd !== undefined && site.pd !== "" ? Number(site.pd) : "";
    const gm = site.gm !== undefined && site.gm !== "" ? Number(site.gm) : "";
    const cal = site.cal !== undefined && site.cal !== "" ? Number(site.cal) : "";
    const isDeep = pd !== "" && pd >= 4;

    return (
        <div className="flex flex-col items-center p-2 border-r last:border-0 border-slate-200 bg-gradient-to-b from-white to-slate-50/30">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">{label}</span>

            {/* PD Input - MEJORADO: Más grande y legible */}
            <input
                data-tooth={tooth}
                data-face={face}
                data-index={index}
                data-field="pd"
                data-upper={isUpper}
                className={`perio-input w-11 h-11 text-center text-base font-black border-2 rounded-xl outline-none transition-all shadow-sm
                    ${isDeep ? 'bg-red-50 text-red-700 border-red-400 ring-2 ring-red-200' : 'border-slate-300 text-slate-800 bg-white focus:bg-blue-50'} 
                    focus:border-blue-500 focus:ring-4 focus:ring-blue-100 hover:border-slate-400`}
                type="text"
                inputMode="numeric"
                placeholder="-"
                value={pd}
                onChange={(e) => handleInputChange(e, tooth, face, index, 'pd', e.target.value)}
                onKeyDown={handleKeyDown}
                title="Profundidad de Sondaje (mm)"
            />

            {/* GM Input - MEJORADO: Más grande y visible */}
            <input
                data-tooth={tooth}
                data-face={face}
                data-index={index}
                data-field="gm"
                data-upper={isUpper}
                className="perio-input w-11 h-8 text-center text-sm font-bold border-2 border-t-0 border-slate-300 rounded-b-xl outline-none text-slate-600 bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all hover:border-slate-400 shadow-sm"
                type="text"
                placeholder="0"
                value={gm}
                onChange={(e) => handleInputChange(e, tooth, face, index, 'gm', e.target.value)}
                onKeyDown={handleKeyDown}
                title="Margen Gingival (mm)"
            />

            {/* BOP (Bleeding) & Plaque Flags - MEJORADOS: Más grandes y táctiles */}
            <div className="flex gap-2 mt-2 mb-2">
                <button
                    type="button"
                    className={`w-5 h-5 rounded-full border-2 transition-all flex items-center justify-center shadow-sm
                        ${site.bleeding ? 'bg-rose-500 border-rose-600 shadow-rose-200 scale-110' : 'bg-white border-slate-300 hover:border-rose-400 hover:bg-rose-50'}`}
                    onClick={() => updateSite(tooth, face, index, 'bleeding', !site.bleeding)}
                    title="Sangrado al Sondaje (BOP)"
                >
                    {site.bleeding && <span className="w-2 h-2 bg-white rounded-full"></span>}
                </button>
                <button
                    type="button"
                    className={`w-5 h-5 rounded-full border-2 transition-all flex items-center justify-center shadow-sm
                        ${site.plaque ? 'bg-amber-500 border-amber-600 shadow-amber-200 scale-110' : 'bg-white border-slate-300 hover:border-amber-400 hover:bg-amber-50'}`}
                    onClick={() => updateSite(tooth, face, index, 'plaque', !site.plaque)}
                    title="Placa Bacteriana"
                >
                    {site.plaque && <span className="w-2 h-2 bg-white rounded-full"></span>}
                </button>
            </div>

            {/* CAL Display - MEJORADO: Más visible */}
            <span className={`text-sm font-black mt-1 px-2 py-0.5 rounded-lg ${cal > 4 ? 'text-indigo-700 bg-indigo-100' : cal !== "" ? 'text-slate-600 bg-slate-100' : 'text-slate-300 bg-slate-50'}`}>
                {cal !== "" ? cal : "-"}
            </span>
        </div>
    );
};

// ─── ToothColumn Sub-component (Moved outside render) ────────────────────
const ToothColumn = ({ 
    tooth, 
    isUpper, 
    periodonto, 
    setPeriodonto, 
    updateSite, 
    handleInputChange, 
    handleKeyDown 
}) => {
    const vFace = "v";
    const lFace = "l";
    const isMolar = [18, 17, 16, 26, 27, 28, 48, 47, 46, 36, 37, 38].includes(tooth);

    return (
        <div className="flex flex-col items-center bg-white border-2 border-slate-200 rounded-3xl shadow-md overflow-hidden w-40 shrink-0 hover:border-indigo-300 transition-all hover:shadow-lg">
            <div className="w-full bg-gradient-to-r from-slate-100 to-slate-50 text-center text-sm font-black py-2.5 text-slate-700 border-b-2 border-slate-200 uppercase tracking-widest flex items-center justify-center gap-2">
                <span className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-black shadow-sm">{tooth}</span>
            </div>

            {/* Vestibular Row - MEJORADO */}
            <div className="w-full bg-blue-50/50 border-b-2 border-slate-200 p-2">
                <div className="text-[9px] font-black text-blue-600 uppercase tracking-wider text-center mb-2 flex items-center justify-center gap-1">
                    <FiSun size={10} /> Vestibular
                </div>
                <div className="flex justify-around gap-1">
                    <SiteInput tooth={tooth} face={vFace} index={0} label="D" isUpper={isUpper} periodonto={periodonto} updateSite={updateSite} handleInputChange={handleInputChange} handleKeyDown={handleKeyDown} />
                    <SiteInput tooth={tooth} face={vFace} index={1} label="C" isUpper={isUpper} periodonto={periodonto} updateSite={updateSite} handleInputChange={handleInputChange} handleKeyDown={handleKeyDown} />
                    <SiteInput tooth={tooth} face={vFace} index={2} label="M" isUpper={isUpper} periodonto={periodonto} updateSite={updateSite} handleInputChange={handleInputChange} handleKeyDown={handleKeyDown} />
                </div>
            </div>

            {/* Lingual / Palatal Row - MEJORADO */}
            <div className="w-full bg-amber-50/50 p-2 border-b-2 border-slate-200">
                <div className="text-[9px] font-black text-amber-700 uppercase tracking-wider text-center mb-2 flex items-center justify-center gap-1">
                    <FiLayers size={10} /> {isUpper ? "Palatino" : "Lingual"}
                </div>
                <div className="flex justify-around gap-1">
                    <SiteInput tooth={tooth} face={lFace} index={0} label="M" isUpper={isUpper} periodonto={periodonto} updateSite={updateSite} handleInputChange={handleInputChange} handleKeyDown={handleKeyDown} />
                    <SiteInput tooth={tooth} face={lFace} index={1} label="C" isUpper={isUpper} periodonto={periodonto} updateSite={updateSite} handleInputChange={handleInputChange} handleKeyDown={handleKeyDown} />
                    <SiteInput tooth={tooth} face={lFace} index={2} label="D" isUpper={isUpper} periodonto={periodonto} updateSite={updateSite} handleInputChange={handleInputChange} handleKeyDown={handleKeyDown} />
                </div>
            </div>

            {/* Meta Controls (Mobility & Furcation) - MEJORADO */}
            <div className="flex flex-col gap-2 p-3 w-full bg-gradient-to-b from-slate-50 to-white border-t-2 border-slate-200 items-center">
                <div className="flex items-center justify-between w-full">
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider">Movilidad</label>
                    <select
                        className="text-xs font-black border-2 border-slate-300 rounded-lg bg-white px-2 py-1 text-slate-800 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 hover:border-slate-400 shadow-sm"
                        value={periodonto[tooth]?.mobility || 0}
                        onChange={e => {
                            const val = Number(e.target.value);
                            setPeriodonto(prev => {
                                const next = { ...prev };
                                if (!next[tooth]) next[tooth] = JSON.parse(JSON.stringify(INITIAL_TOOTH_DATA));
                                next[tooth].mobility = val;
                                return next;
                            });
                        }}
                    >
                        <option value="0">0</option>
                        <option value="1">I</option>
                        <option value="2">II</option>
                        <option value="3">III</option>
                    </select>
                </div>

                {isMolar && (
                    <div className="flex items-center justify-between w-full pt-2 border-t border-slate-200">
                        <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider">Furca</label>
                        <select
                            className="text-xs font-black border-2 border-slate-300 rounded-lg bg-white px-2 py-1 text-slate-800 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 hover:border-slate-400 shadow-sm"
                            value={periodonto[tooth]?.furcation || 0}
                            onChange={e => {
                                const val = Number(e.target.value);
                                setPeriodonto(prev => {
                                    const next = { ...prev };
                                    if (!next[tooth]) next[tooth] = JSON.parse(JSON.stringify(INITIAL_TOOTH_DATA));
                                    next[tooth].furcation = val;
                                    return next;
                                });
                            }}
                        >
                            <option value="0">0</option>
                            <option value="1">I</option>
                            <option value="2">II</option>
                            <option value="3">III</option>
                        </select>
                    </div>
                )}
            </div>
        </div>
    );
};

// ─── Periodontograma (Main Component) ───────────────────────────────
export default function Periodontograma({ embeddedPatient }) {
    const toast = useToast();
    const pacienteId = embeddedPatient?.id;
    const [periodonto, setPeriodonto] = useState({});
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    const timeoutsRef = useRef({});

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
                    setPeriodonto({});
                }
            } catch (e) {
                console.error("Error loading periodontogram", e);
            } finally {
                setLoading(false);
            }
        };
        load();

        // Cleanup timeouts on unmount
        return () => {
            Object.values(timeoutsRef.current).forEach(clearTimeout);
        };
    }, [pacienteId]);

    const handleSave = async () => {
        if (!pacienteId) return;
        setSaving(true);
        try {
            await updateDoc(doc(db, "pacientes", pacienteId), {
                periodontograma: periodonto
            });
            toast.success("Periodontograma guardado correctamente");
        } catch (e) {
            console.error("Error saving periodontogram", e);
            toast.error("Error al guardar el periodontograma");
        } finally {
            setSaving(false);
        }
    };

    const updateSite = (toothIso, face, index, field, value) => {
        setPeriodonto(prev => {
            const next = { ...prev };
            if (!next[toothIso]) {
                next[toothIso] = JSON.parse(JSON.stringify(INITIAL_TOOTH_DATA));
            }
            if (!next[toothIso][face]) {
                next[toothIso][face] = [{}, {}, {}];
            }
            if (!next[toothIso][face][index]) {
                next[toothIso][face][index] = {};
            }

            const numVal = value === "" ? "" : Number(value);
            next[toothIso][face][index][field] = value === "" ? "" : numVal;

            // Auto Calculate CAL = PD + GM
            const pd = next[toothIso][face][index].pd !== undefined && next[toothIso][face][index].pd !== "" ? Number(next[toothIso][face][index].pd) : 0;
            const gm = next[toothIso][face][index].gm !== undefined && next[toothIso][face][index].gm !== "" ? Number(next[toothIso][face][index].gm) : 0;
            next[toothIso][face][index].cal = pd + gm;

            return next;
        });
    };

    // Auto-advance cursor helper
    const advanceToNextInput = (currentInput) => {
        const tooth = Number(currentInput.getAttribute('data-tooth'));
        const face = currentInput.getAttribute('data-face');
        const index = Number(currentInput.getAttribute('data-index'));
        const field = currentInput.getAttribute('data-field');
        const isUpper = currentInput.getAttribute('data-upper') === 'true';

        const teethArray = isUpper ? TEETH_UPPER : TEETH_LOWER;
        const toothIdx = teethArray.indexOf(tooth);

        let targetTooth = tooth;
        let targetIndex = index;
        
        if (index < 2) {
            targetIndex = index + 1;
        } else {
            if (toothIdx < teethArray.length - 1) {
                targetTooth = teethArray[toothIdx + 1];
                targetIndex = 0;
            } else {
                return; // Reached end of arch row
            }
        }

        const selector = `input[data-tooth="${targetTooth}"][data-face="${face}"][data-index="${targetIndex}"][data-field="${field}"]`;
        const form = document.getElementById('periodontograma-form');
        const targetInput = form?.querySelector(selector);
        if (targetInput) {
            targetInput.focus();
            targetInput.select();
        }
    };

    const handleInputChange = (e, tooth, face, index, field, value) => {
        const cleanVal = field === 'gm' ? value.replace(/[^\d-]/g, '') : value.replace(/[^\d]/g, '');
        updateSite(tooth, face, index, field, cleanVal);

        const inputEl = e.target;
        const toothKey = `${tooth}-${face}-${index}-${field}`;

        if (timeoutsRef.current[toothKey]) {
            clearTimeout(timeoutsRef.current[toothKey]);
            delete timeoutsRef.current[toothKey];
        }

        if (cleanVal && cleanVal.length > 0) {
            if (cleanVal === "1" || cleanVal === "-") {
                timeoutsRef.current[toothKey] = setTimeout(() => {
                    advanceToNextInput(inputEl);
                    delete timeoutsRef.current[toothKey];
                }, 350);
            } else {
                advanceToNextInput(inputEl);
            }
        }
    };

    // Dual-axis keyboard navigation
    const handleKeyDown = (e) => {
        const current = e.target;
        const tooth = Number(current.getAttribute('data-tooth'));
        const face = current.getAttribute('data-face');
        const index = Number(current.getAttribute('data-index'));
        const field = current.getAttribute('data-field');
        const isUpper = current.getAttribute('data-upper') === 'true';

        const teethArray = isUpper ? TEETH_UPPER : TEETH_LOWER;
        const toothIdx = teethArray.indexOf(tooth);

        if (toothIdx === -1) return;

        let targetTooth = tooth;
        let targetIndex = index;
        let targetField = field;
        let targetFace = face;

        if (e.key === 'ArrowRight' || e.key === 'Enter') {
            e.preventDefault();
            if (index < 2) {
                targetIndex = index + 1;
            } else {
                if (toothIdx < teethArray.length - 1) {
                    targetTooth = teethArray[toothIdx + 1];
                    targetIndex = 0;
                }
            }
        } else if (e.key === 'ArrowLeft') {
            e.preventDefault();
            if (index > 0) {
                targetIndex = index - 1;
            } else {
                if (toothIdx > 0) {
                    targetTooth = teethArray[toothIdx - 1];
                    targetIndex = 2;
                }
            }
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (field === 'pd') {
                targetField = 'gm';
            }
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (field === 'gm') {
                targetField = 'pd';
            }
        } else {
            return;
        }

        const selector = `input[data-tooth="${targetTooth}"][data-face="${targetFace}"][data-index="${targetIndex}"][data-field="${targetField}"]`;
        const form = document.getElementById('periodontograma-form');
        const targetInput = form?.querySelector(selector);
        if (targetInput) {
            targetInput.focus();
            targetInput.select();
        }
    };

    // Statistical calculations
    const getStats = () => {
        let totalProbed = 0;
        let bleedingCount = 0;
        let plaqueCount = 0;
        let pocketCount = 0;

        const allTeeth = [...TEETH_UPPER, ...TEETH_LOWER];
        allTeeth.forEach(t => {
            const tData = periodonto[t];
            if (!tData) return;

            ['v', 'l'].forEach(face => {
                const faceData = tData[face];
                if (!faceData) return;

                faceData.forEach(site => {
                    if (site.pd !== undefined && site.pd !== "") {
                        totalProbed++;
                        const pdNum = Number(site.pd) || 0;
                        if (pdNum >= 4) pocketCount++;
                        if (site.bleeding) bleedingCount++;
                        if (site.plaque) plaqueCount++;
                    }
                });
            });
        });

        const bopPercent = totalProbed > 0 ? Math.round((bleedingCount / totalProbed) * 100) : 0;
        const plaquePercent = totalProbed > 0 ? Math.round((plaqueCount / totalProbed) * 100) : 0;

        return {
            totalProbed,
            bleedingCount,
            plaqueCount,
            pocketCount,
            bopPercent,
            plaquePercent
        };
    };

    const stats = getStats();

    return (
        <div className="flex flex-col h-full bg-slate-50/30 animate-fadeIn min-h-0 relative p-6 md:p-8 overflow-y-auto custom-scrollbar">
            
            {/* Upper Action Bar */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm shrink-0">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                        <FiLayers size={18} />
                    </div>
                    <div>
                        <h3 className="text-base font-black text-slate-800 tracking-tight">Periodontograma Clínico Gráfico</h3>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Control gráfico de bolsas, recesión, placa y sangrado</p>
                    </div>
                </div>
                <Button 
                    variant="primary" 
                    onClick={handleSave} 
                    disabled={loading || saving}
                    className="shadow-lg shadow-blue-500/20 px-8 py-2.5 rounded-full font-black text-[11px] uppercase tracking-widest flex items-center gap-2"
                >
                    <FiSave size={14} />
                    {saving ? "Guardando..." : "Guardar Cambios"}
                </Button>
            </div>

            {/* Statistics panel */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8 shrink-0">
                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Sitios Evaluados</span>
                    <div className="flex items-end justify-between mt-2">
                        <span className="text-2xl font-black text-slate-800">{stats.totalProbed}</span>
                        <span className="text-[10px] font-bold text-slate-400">sitios</span>
                    </div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
                    <span className="text-[9px] font-black text-rose-500 uppercase tracking-widest flex items-center gap-1">
                        <FiDroplet /> Sangrado (BOP)
                    </span>
                    <div className="flex items-end justify-between mt-2">
                        <span className="text-2xl font-black text-rose-600">{stats.bopPercent}%</span>
                        <span className={`text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-wider ${stats.bopPercent > 25 ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'}`}>
                            {stats.bopPercent > 25 ? 'Crítico' : 'Controlado'}
                        </span>
                    </div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
                    <span className="text-[9px] font-black text-amber-500 uppercase tracking-widest flex items-center gap-1">
                        <FiSun /> Placa Bacteriana
                    </span>
                    <div className="flex items-end justify-between mt-2">
                        <span className="text-2xl font-black text-amber-600">{stats.plaquePercent}%</span>
                        <span className={`text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-wider ${stats.plaquePercent > 20 ? 'bg-yellow-50 text-yellow-600' : 'bg-emerald-50 text-emerald-600'}`}>
                            {stats.plaquePercent > 20 ? 'Alto' : 'Controlado'}
                        </span>
                    </div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
                    <span className="text-[9px] font-black text-red-500 uppercase tracking-widest flex items-center gap-1">
                        <FiActivity /> Bolsas Periodontales
                    </span>
                    <div className="flex items-end justify-between mt-2">
                        <span className="text-2xl font-black text-red-650">{stats.pocketCount}</span>
                        <span className="text-[9px] font-black px-2 py-0.5 rounded bg-red-50 text-red-600 uppercase tracking-wider">
                            {stats.pocketCount > 0 ? `${stats.pocketCount} Alertas` : 'Sano'}
                        </span>
                    </div>
                </div>
            </div>

            {/* Scrollable Container Arch Layout */}
            <form id="periodontograma-form" className="bg-white p-6 md:p-8 rounded-[32px] border border-slate-100 shadow-sm flex flex-col gap-10 min-h-0 mb-8 shrink-0">
                
                {/* Upper Arch (18 - 28) */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-blue-500 flex items-center justify-center"></span>
                        <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest">Arcada Superior (Maxilar)</h4>
                    </div>
                    
                    <div className="overflow-x-auto pb-4 custom-scrollbar">
                        <div className="w-[1972px] flex flex-col gap-3 p-1">
                            {/* Vestibular Graph */}
                            <div className="text-[9px] font-black text-blue-500 uppercase tracking-widest pl-2">Perfil Vestibular</div>
                            <PeriodontogramaChart teeth={TEETH_UPPER} face="v" isUpper={true} periodonto={periodonto} />

                            {/* Tooth Cards */}
                            <div className="flex gap-3 my-2 w-[1972px] shrink-0">
                                {TEETH_UPPER.map(t => (
                                    <ToothColumn 
                                        key={t} 
                                        tooth={t} 
                                        isUpper={true} 
                                        periodonto={periodonto}
                                        setPeriodonto={setPeriodonto}
                                        updateSite={updateSite}
                                        handleInputChange={handleInputChange}
                                        handleKeyDown={handleKeyDown}
                                    />
                                ))}
                            </div>

                            {/* Palatal Graph */}
                            <div className="text-[9px] font-black text-amber-600 uppercase tracking-widest pl-2 mt-2">Perfil Palatino</div>
                            <PeriodontogramaChart teeth={TEETH_UPPER} face="l" isUpper={true} periodonto={periodonto} />
                        </div>
                    </div>
                </div>

                {/* Lower Arch (48 - 38) */}
                <div className="space-y-4 border-t border-slate-100 pt-8">
                    <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                        <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest">Arcada Inferior (Mandíbula)</h4>
                    </div>

                    <div className="overflow-x-auto pb-4 custom-scrollbar">
                        <div className="w-[1972px] flex flex-col gap-3 p-1">
                            {/* Vestibular Graph */}
                            <div className="text-[9px] font-black text-blue-500 uppercase tracking-widest pl-2">Perfil Vestibular</div>
                            <PeriodontogramaChart teeth={TEETH_LOWER} face="v" isUpper={false} periodonto={periodonto} />

                            {/* Tooth Cards */}
                            <div className="flex gap-3 my-2 w-[1972px] shrink-0">
                                {TEETH_LOWER.map(t => (
                                    <ToothColumn 
                                        key={t} 
                                        tooth={t} 
                                        isUpper={false} 
                                        periodonto={periodonto}
                                        setPeriodonto={setPeriodonto}
                                        updateSite={updateSite}
                                        handleInputChange={handleInputChange}
                                        handleKeyDown={handleKeyDown}
                                    />
                                ))}
                            </div>

                            {/* Lingual Graph */}
                            <div className="text-[9px] font-black text-amber-600 uppercase tracking-widest pl-2 mt-2">Perfil Lingual</div>
                            <PeriodontogramaChart teeth={TEETH_LOWER} face="l" isUpper={false} periodonto={periodonto} />
                        </div>
                    </div>
                </div>

            </form>

            {/* Premium Legend card */}
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm shrink-0">
                <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest mb-4">Leyenda & Guías de Sondaje</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-red-50 border-2 border-red-200 text-red-650 flex items-center justify-center font-black">4</div>
                        <span>Bolsa Profunda (&gt;= 4mm)</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-full bg-rose-500 flex items-center justify-center shadow-sm text-white text-[8px] font-black">BOP</div>
                        <span>Sangrado al sondaje (BOP)</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-full bg-amber-400 flex items-center justify-center shadow-sm text-white text-[8px] font-black">PLA</div>
                        <span>Placa bacteriana (PLA)</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="text-indigo-650 font-black text-sm">CAL</div>
                        <span>Nivel de inserción clínica (NIC)</span>
                    </div>
                </div>
            </div>

        </div>
    );
}
