// src/modules/odontograma/components/OdontogramaVisual.jsx
import React from "react";
import Diente from "./Diente";

export default function OdontogramaVisual({
    odontogramaData = {}, // { 18: { top: {color...}, center: ... }, ... }
    onToothClick, // (dienteId, zona) => void
}) {
    // Cuadrantes ADULTO (ISO 3950)
    // Q1: 18 -> 11
    // Q2: 21 -> 28
    // Q3: 48 -> 41 (Orden visual: 48,47..41 | 31..38) -> Abajo
    // Q4: 31 -> 38

    // Para visualizarlos correctamente en la boca:
    // Arriba: 18-11 | 21-28
    // Abajo:  48-41 | 31-38

    const range = (start, end) => {
        const arr = [];
        if (start > end) {
            for (let i = start; i >= end; i--) arr.push(i);
        } else {
            for (let i = start; i <= end; i++) arr.push(i);
        }
        return arr;
    };

    const Q1 = range(18, 11);
    const Q2 = range(21, 28);
    const Q4 = range(48, 41);
    const Q3 = range(31, 38);

    const renderQuadrant = (dientes) => (
        <div style={{ display: "flex", gap: "2px" }}>
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

    return (
        <div className="odontograma-visual" style={{ display: "flex", flexDirection: "column", gap: "20px", alignItems: "center" }}>
            {/* MAXILAR SUPERIOR */}
            <div style={{ display: "flex", gap: "20px" }}>
                {renderQuadrant(Q1)}
                {renderQuadrant(Q2)}
            </div>

            <div style={{ width: "100%", height: "2px", background: "#ccc" }}></div>

            {/* MANDÍBULA INFERIOR */}
            <div style={{ display: "flex", gap: "20px" }}>
                {renderQuadrant(Q4)}
                {renderQuadrant(Q3)}
            </div>
        </div>
    );
}
