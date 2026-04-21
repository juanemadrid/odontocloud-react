import React from 'react';
import CircularSurfaceSelector from './CircularSurfaceSelector';
import { TOOLS } from './TratamientosToolbar';

// Base URL de Vite (configurado en vite.config.mjs como '/odontocloud-react/')
const BASE = import.meta.env.BASE_URL;

// Función para mapear el número FDI del diente a uno de los SVGs reales
const getToothImageStr = (iso) => {
    const num = parseInt(iso, 10);
    const n = num % 10;
    
    // Mapeo anatómico exacto usando los SVGs en public/images/teeth_svg/
    if (n === 1) return `${BASE}images/teeth_svg/8.svg?v=4`;
    if (n === 2) return `${BASE}images/teeth_svg/7.svg?v=4`;
    if (n === 3) return `${BASE}images/teeth_svg/6.svg?v=4`;
    if (n === 4) return `${BASE}images/teeth_svg/5.svg?v=4`;
    if (n === 5) return `${BASE}images/teeth_svg/4.svg?v=4`;
    if (n === 6) return `${BASE}images/teeth_svg/3.svg?v=4`;
    if (n >= 7) return `${BASE}images/teeth_svg/2.svg?v=4`;
    
    return `${BASE}images/teeth_svg/3.svg?v=4`; // Fallback molar
};

export default function InteractiveTooth({ 
    numero, 
    data = {}, 
    onZoneClick, 
    isReadOnly,
    activeToothId
}) {
    const num = parseInt(numero, 10);
    const isUpper = (num >= 11 && num <= 28) || (num >= 51 && num <= 65);
    const isRightSide = (num >= 11 && num <= 18) || (num >= 41 && num <= 48) || (num >= 51 && num <= 55) || (num >= 81 && num <= 85);
    const isActive = activeToothId === String(numero);

    // Obtener imagen vectorial exacta
    const imgSrc = getToothImageStr(numero);

    // Tratamientos generales
    const g = data?.general?.id;
    const isAusente = g === 'ausente';
    const isExtraccion = g === 'extraccion';
    const isCorona = g?.includes('corona');
    const isImplante = g?.includes('implante');
    
    // Función para renderizar el ícono correspondiente desde la Toolbar
    const getIconForToolId = (toolId) => {
        const tool = TOOLS.find(t => t.id === toolId);
        return tool ? tool.icon : null;
    };

    // Renderizar iconos por cada zona específica sobre la corona del diente
    const renderZoneOverlays = () => {
        const zones = ['top', 'bottom', 'left', 'right', 'center'];
        return zones.map(zone => {
            const zData = data[zone];
            if (!zData) return null;
            
            const Icon = getIconForToolId(zData.id);
            if (!Icon) return null;

            // El renderZoneOverlays orienta la posición hacia la corona.
            // Dado que los SVG nativos tienen la raíz apuntando hacia ARRIBA y la corona hacia ABAJO,
            // la corona se encuentra en la parte inferior de la caja (aproximadamente top: 60% al 90%).
            // Para los dientes inferiores usamos `rotate-180`, así que las coordenadas relativas siguen siendo las mismas.
            let positionClasses = "";
            if (zone === "center") positionClasses = "top-[75%] left-1/2 -translate-x-1/2 -translate-y-1/2";
            else if (zone === "top") positionClasses = "top-[62%] left-1/2 -translate-x-1/2";
            else if (zone === "bottom") positionClasses = "top-[88%] left-1/2 -translate-x-1/2";
            else if (zone === "left") positionClasses = "top-[75%] left-[25%] -translate-y-1/2";
            else if (zone === "right") positionClasses = "top-[75%] right-[25%] -translate-y-1/2";

            // Tamaño hiper precíso para evitar tapar zonas colindantes
            const sizeClass = zone === "center" || zone === "Completo" ? "w-[12px] h-[12px]" : "w-[9px] h-[9px]";

            return (
                <div key={zone} className={`absolute ${sizeClass} ${positionClasses} z-10 drop-shadow-sm transition-transform duration-200 hover:scale-[1.15]`} style={{ color: zData.color }}>
                    {Icon}
                </div>
            );
        });
    };

    // Renderizar efectos generales (coronas, extracciones)
    const renderGeneralEffects = () => {
        if (isExtraccion) {
            return (
                <div className="absolute inset-0 flex items-center justify-center text-red-500 font-bold text-4xl">
                    ✕
                </div>
            );
        }
        if (isAusente) {
             // Si está ausente, opacamos el diente en lugar de dibujarlo feo
             return null; 
        }
        if (isCorona) {
            return (
                <div className="absolute inset-0 border-4 border-indigo-500 rounded-md mix-blend-multiply opacity-50 pointer-events-none" />
            );
        }
        if (g === 'fractura') {
            return (
                <svg className="absolute inset-0 w-full h-full text-purple-500" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M13,2,3,14H10l-1,8,11-12H13Z" />
                </svg>
            );
        }
        if (isImplante) {
            const Icon = getIconForToolId(g);
            return (
                <div className="absolute inset-0 flex items-center justify-center text-cyan-500 opacity-80 mix-blend-multiply h-full w-full p-2">
                    {Icon}
                </div>
            );
        }
        return null;
    };

    const toothOpacity = isAusente ? 0.2 : 1;

    return (
        <div className="relative flex justify-center">
            {/* Caja de Hover General */}
            <div 
                className={`flex flex-col items-center justify-center gap-0 rounded-lg p-1 transition-all duration-200 ${isReadOnly ? '' : 'hover:bg-[#e2e8f0] hover:scale-[1.06]'}`}
            >
                {isUpper ? (
                    <>
                    {/* SUPERIOR: Diente arriba → Número → Selector circular abajo (mirando al centro) */}
                    <div className={`flex flex-col items-center p-1.5 rounded-[20px] transition-all duration-300 ${isActive ? 'bg-indigo-50/50 ring-2 ring-indigo-200 shadow-lg shadow-indigo-100/50 scale-105 z-10' : 'hover:bg-slate-50'}`}>
                        <div 
                            className={`relative flex-1 transition-all ${isReadOnly ? '' : 'cursor-pointer'}`}
                            style={{ 
                                opacity: toothOpacity, 
                                maxWidth: "48px",
                                minWidth: "12px",
                                height: "clamp(42px, 8vh, 72px)"
                            }}
                            onClick={(e) => {
                                if (!isReadOnly) {
                                    e.stopPropagation();
                                    onZoneClick(numero, 'Completo');
                                }
                            }}
                        >
                            <img 
                                src={imgSrc} 
                                alt="tooth" 
                                className="w-full h-full object-contain pointer-events-none" 
                            />
                            {renderGeneralEffects()}
                            {renderZoneOverlays()}
                        </div>
                    </div>

                    {/* Número debajo del diente */}
                    <div className="text-[10px] xl:text-[12px] font-black text-slate-700 tracking-tighter my-0.5 transition-all">
                        {numero}
                    </div>

                    {/* Selector circular al fondo del bloque superior (mira hacia el centro) */}
                    <div className="mb-1">
                        <CircularSurfaceSelector 
                            activeToothId={numero}
                            toothData={data}
                            onZoneClick={onZoneClick}
                            isReadOnly={isReadOnly}
                            isUpper={isUpper}
                            isRightSide={isRightSide}
                        />
                    </div>
                    </>
                ) : (
                    <>
                    {/* INFERIOR: Selector circular arriba (mira hacia el centro) → Número → Diente abajo */}
                    <div className="mt-1">
                        <CircularSurfaceSelector 
                            activeToothId={numero}
                            toothData={data}
                            onZoneClick={onZoneClick}
                            isReadOnly={isReadOnly}
                            isUpper={isUpper}
                            isRightSide={isRightSide}
                        />
                    </div>

                    {/* Número encima del diente */}
                    <div className="text-[10px] xl:text-[12px] font-black text-slate-700 tracking-tighter my-0.5 transition-all">
                        {numero}
                    </div>

                    <div className={`flex flex-col items-center p-1.5 rounded-[20px] transition-all duration-300 ${isActive ? 'bg-indigo-50/50 ring-2 ring-indigo-200 shadow-lg shadow-indigo-100/50 scale-105 z-10' : 'hover:bg-slate-50'}`}>
                        <div 
                            className={`relative rotate-180 flex-1 transition-all ${isReadOnly ? '' : 'cursor-pointer'}`}
                            style={{ 
                                opacity: toothOpacity,
                                maxWidth: "48px",
                                minWidth: "12px",
                                height: "clamp(42px, 8vh, 72px)"
                            }}
                            onClick={(e) => {
                                if (!isReadOnly) {
                                    e.stopPropagation();
                                    onZoneClick(numero, 'Completo');
                                }
                            }}
                        >
                            <img 
                                src={imgSrc} 
                                alt="tooth" 
                                className="w-full h-full object-contain pointer-events-none" 
                            />
                            {renderGeneralEffects()}
                            {renderZoneOverlays()}
                        </div>
                    </div>
                    </>
                )}
            </div>
        </div>
    );
}
