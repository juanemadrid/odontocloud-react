// src/modules/odontograma/components/OdontogramaVisual.jsx
import React from "react";
import Diente from "./Diente";

export default function OdontogramaVisual({
    odontogramaData = {}, // { 18: { top: {color...}, center: ... }, ... }
    onToothClick, // (dienteId, zona) => void
    tipoDenticion = "completo", // adulto, nino, completo (mixto)
}) {
    // --- UTILS ---
    const range = (start, end) => {
        const arr = [];
        if (start > end) {
            for (let i = start; i >= end; i--) arr.push(i);
        } else {
            for (let i = start; i <= end; i++) arr.push(i);
        }
        return arr;
    };

    const renderQuadrant = (dientes) => (
        <div style={{ display: "flex", gap: "2px", justifyContent: "center" }}>
            {dientes.map((iso) => (
                <Diente
                    key={iso}
                    numero={iso}
                    data={odontogramaData[iso]}
                    onSurfaceClick={onToothClick}
                />
            ))}
        </div>
    );

    // --- PERMANENTES (Adulto) ---
    // Q1: 18 -> 11 | Q2: 21 -> 28
    // Q4: 48 -> 41 | Q3: 31 -> 38
    const Q1 = range(18, 11);
    const Q2 = range(21, 28);
    const Q4 = range(48, 41);
    const Q3 = range(31, 38);

    // --- TEMPORALES (Niño) ---
    // Q5: 55 -> 51 | Q6: 61 -> 65
    // Q8: 85 -> 81 | Q7: 71 -> 75
    const Q5 = range(55, 51);
    const Q6 = range(61, 65);
    const Q8 = range(85, 81);
    const Q7 = range(71, 75);

    const showAdulto = tipoDenticion === "adulto" || tipoDenticion === "completo";
    const showNino = tipoDenticion === "nino" || tipoDenticion === "completo";

    return (
        <div className="odontograma-visual" style={{
            display: "flex",
            flexDirection: "column",
            gap: "30px",
            alignItems: "center",
            width: "100%",
            overflowX: "auto",
            paddingBottom: "20px"
        }}>
            {/* ====== PERMANENTE SUPERIOR ====== */}
            {showAdulto && (
                <div style={{ display: "flex", gap: "20px", flexWrap: "wrap", justifyContent: "center" }}>
                    {renderQuadrant(Q1)}
                    {renderQuadrant(Q2)}
                </div>
            )}

            {/* ====== TEMPORAL (CENTRO) ====== */}
            {showNino && (
                <div style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px",
                    background: "#f0f8ff",
                    padding: "15px",
                    borderRadius: "20px",
                    border: "1px dashed #aac"
                }}>
                    <div style={{ display: "flex", gap: "30px", justifyContent: "center" }}>
                        {renderQuadrant(Q5)}
                        {renderQuadrant(Q6)}
                    </div>
                    <div style={{ display: "flex", gap: "30px", justifyContent: "center" }}>
                        {renderQuadrant(Q8)}
                        {renderQuadrant(Q7)}
                    </div>
                </div>
            )}

            {/* ====== PERMANENTE INFERIOR ====== */}
            {showAdulto && (
                <>
                    {/* Línea divisoria si hay mixta */}
                    {showNino && <div style={{ width: "80%", height: "2px", background: "#eee" }}></div>}

                    <div style={{ display: "flex", gap: "20px", flexWrap: "wrap", justifyContent: "center" }}>
                        {renderQuadrant(Q4)}
                        {renderQuadrant(Q3)}
                    </div>
                </>
            )}
        </div>
    );
}
