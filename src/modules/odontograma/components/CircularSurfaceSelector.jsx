import React from 'react';

// Generador de caminos (Paths) para un segmento de anillo (Donut slice)
// startAngle y endAngle en grados (0° es arriba, giramos en sentido horario)
const createSlicePath = (cx, cy, innerRadius, outerRadius, startAngle, endAngle) => {
    // Convertimos grados a radianes (ajustamos -90 para empezar arriba)
    const startRad = (startAngle - 90) * Math.PI / 180.0;
    const endRad = (endAngle - 90) * Math.PI / 180.0;
    
    // Puntos exteriores
    const x1 = cx + outerRadius * Math.cos(startRad);
    const y1 = cy + outerRadius * Math.sin(startRad);
    const x2 = cx + outerRadius * Math.cos(endRad);
    const y2 = cy + outerRadius * Math.sin(endRad);

    // Puntos interiores
    const x3 = cx + innerRadius * Math.cos(endRad);
    const y3 = cy + innerRadius * Math.sin(endRad);
    const x4 = cx + innerRadius * Math.cos(startRad);
    const y4 = cy + innerRadius * Math.sin(startRad);

    // 0 o 1 dependiendo si el arco es mayor a 180 grados (no en nuestro caso, siempre son 90)
    const largeArcFlag = endAngle - startAngle <= 180 ? 0 : 1;

    return `
        M ${x1} ${y1}
        A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${x2} ${y2}
        L ${x3} ${y3}
        A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${x4} ${y4}
        Z
    `;
};

// Componente interactivo que emula el círculo de OralDrive
export default function CircularSurfaceSelector({ activeToothId, toothData, onZoneClick, isReadOnly, isUpper, isRightSide }) {
    
    // OralDrive divide en 5 zonas: Centro, Arriba, Abajo, Izquierda, Derecha.
    // El mapeo clínico depende de qué cuadrante estamos (para decir si izquierda es Mesial o Distal).
    // isRightSide: true = Cuadrante 1, 4, 5, 8. Left en la pantalla = Distal, Right = Mesial
    // isRightSide: false = Cuadrante 2, 3, 6, 7. Left en la pantalla = Mesial, Right = Distal
    
    // Las 5 zonas visuales de la vista SVG:
    // Arriba visual (Vestibular)
    // Centro (Oclusal)
    // Abajo visual (Lingual / Palatina)
    // Izquierda y Derecha (Mesial/Distal)

    const getSectorColor = (zoneId) => {
        const findingId = toothData?.[zoneId]?.id;
        if (!findingId) return 'transparent';
        
        // Colores base de OralDrive
        if (findingId.includes("caries")) return '#EF4444'; // Rojo fuerte
        if (findingId.includes("amalgama")) return '#2563EB'; // Azul
        if (findingId.includes("resina") || findingId.includes("rest_")) return '#34D399'; // Verde
        if (findingId.includes("sellante")) return '#A855F7'; // Morado
        return toothData[zoneId].color || '#94A3B8';
    };

    const hasMark = (zoneId) => !!toothData?.[zoneId];

    // Estilo común para los slices interactivos
    const getFaceProps = (zoneId) => ({
        fill: getSectorColor(zoneId),
        stroke: "#1e293b", // Borde negro grueso como OralDrive
        strokeWidth: "2.5",
        opacity: hasMark(zoneId) && toothData?.[zoneId]?.id?.includes('malo') ? 0.7 : 1, // Ej: para mostrar estados desadaptados visualmente
        className: `transition-all duration-300 ${isReadOnly ? '' : 'cursor-pointer hover:fill-slate-200'} origin-center`,
        onClick: () => !isReadOnly && onZoneClick(activeToothId, zoneId)
    });

    const CX = 50;
    const CY = 50;
    const RADIUS_INNER = 18;
    const RADIUS_OUTER = 44;

    return (
        <div 
            className="mx-auto flex items-center justify-center relative transition-all"
            style={{ width: "clamp(24px, 3.5vw, 45px)", height: "clamp(24px, 3.5vw, 45px)" }}
        >
            <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible">
                
                {/* SOMBRA BASE OPCIONAL PARA EL CÍRCULO */}
                {/* <circle cx="50" cy="50" r="46" fill="#f8fafc" /> */}

                {/* ARRIBA (Vestibular) - Rotado 45 deg base (de -45 a 45) */}
                <path d={createSlicePath(CX, CY, RADIUS_INNER, RADIUS_OUTER, -45, 45)} {...getFaceProps('top')} />
                
                {/* DERECHA (Mesial / Distal dependiendo isRightSide) */}
                <path d={createSlicePath(CX, CY, RADIUS_INNER, RADIUS_OUTER, 45, 135)} {...getFaceProps('right')} />
                
                {/* ABAJO (Lingual / Palatino) */}
                <path d={createSlicePath(CX, CY, RADIUS_INNER, RADIUS_OUTER, 135, 225)} {...getFaceProps('bottom')} />
                
                {/* IZQUIERDA (Distal / Mesial) */}
                <path d={createSlicePath(CX, CY, RADIUS_INNER, RADIUS_OUTER, 225, 315)} {...getFaceProps('left')} />
                
                {/* CENTRO (Oclusal) */}
                <circle 
                    cx={CX} 
                    cy={CY} 
                    r={RADIUS_INNER} 
                    {...getFaceProps('center')} 
                />

                {/* Si hay un sellante, a veces en OralDrive ponen un patrón sobre el círculo central, podemos agregarlo después. */}
            </svg>
        </div>
    );
}
