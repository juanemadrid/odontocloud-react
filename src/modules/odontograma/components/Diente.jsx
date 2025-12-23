// src/modules/odontograma/components/Diente.jsx
import React from "react";

// Mapeo simple de caras a zonas del SVG
// Center = Oclusal (5)
// Top = Vestibular (1)  (en maxilar) o Lingual (en mandíbula) -> Simplificaremos llamándolo "Top"
// Bottom = Lingual (en maxilar) o Vestibular (en mandíbula) -> "Bottom"
// Left = Distal (depende del cuadrante, lo abstraemos a Left/Right visual)
// Right = Mesial

export default function Diente({
    numero,
    data = {}, // { top: 'caries', center: 'obturado', ... }
    onSurfaceClick, // (zona) => void
    formato = "adulto", // adulto, niño
}) {
    // Colores según el estado de cada cara
    const getColor = (zona) => {
        const estado = data[zona];
        if (estado?.color) return estado.color;
        return "#fff"; // blanco por defecto
    };

    const isAusente = data.general?.id === "ausente";

    // Estilo base
    const polyStyle = {
        stroke: "#333",
        strokeWidth: "1",
        cursor: "pointer",
        transition: "fill 0.2s",
    };

    const containerStyle = {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        margin: "4px",
        position: "relative",
        opacity: isAusente ? 0.3 : 1, // Si está ausente se ve gris/transparente
    };

    // Si está ausente, tachamos con una X grande
    const XMark = () => (
        <div
            style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                pointerEvents: "none",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                fontSize: "40px",
                color: "black",
                fontWeight: "bold",
            }}
        >
            X
        </div>
    );

    return (
        <div className="diente-wrapper" style={containerStyle}>
            {/* Visualización Gráfica (SVG) */}
            <svg width="60" height="60" viewBox="0 0 100 100">
                {/* TOP (Vestibular/Lingual) */}
                <polygon
                    points="0,0 100,0 75,25 25,25"
                    fill={getColor("top")}
                    style={polyStyle}
                    onClick={() => onSurfaceClick(numero, "top")}
                />

                {/* BOTTOM (Lingual/Vestibular) */}
                <polygon
                    points="25,75 75,75 100,100 0,100"
                    fill={getColor("bottom")}
                    style={polyStyle}
                    onClick={() => onSurfaceClick(numero, "bottom")}
                />

                {/* LEFT (Mesial/Distal) */}
                <polygon
                    points="0,0 25,25 25,75 0,100"
                    fill={getColor("left")}
                    style={polyStyle}
                    onClick={() => onSurfaceClick(numero, "left")}
                />

                {/* RIGHT (Distal/Mesial) */}
                <polygon
                    points="100,0 100,100 75,75 75,25"
                    fill={getColor("right")}
                    style={polyStyle}
                    onClick={() => onSurfaceClick(numero, "right")}
                />

                {/* CENTER (Oclusal/Incisal) */}
                <polygon
                    points="25,25 75,25 75,75 25,75"
                    fill={getColor("center")}
                    style={polyStyle}
                    onClick={() => onSurfaceClick(numero, "center")}
                />
            </svg>
            {isAusente && <XMark />}
            <span style={{ fontSize: "12px", fontWeight: "bold", marginTop: "2px" }}>
                {numero}
            </span>
        </div>
    );
}
