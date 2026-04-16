import React from 'react';
import InteractiveTooth from './InteractiveTooth';

export default function OdontogramaVisual({ 
    odontogramaData, 
    onToothClick, 
    tipoDenticion = 'completo', 
    activeToothId, 
    surfaceFilter 
}) {

    const RowUpperPermanent = [18, 17, 16, 15, 14, 13, 12, 11,   21, 22, 23, 24, 25, 26, 27, 28];
    const RowUpperTemp =      [55, 54, 53, 52, 51,   61, 62, 63, 64, 65];
    const RowLowerTemp =      [85, 84, 83, 82, 81,   71, 72, 73, 74, 75];
    const RowLowerPermanent = [48, 47, 46, 45, 44, 43, 42, 41,   31, 32, 33, 34, 35, 36, 37, 38];

    const showAdult = tipoDenticion === 'adulto' || tipoDenticion === 'completo';
    const showChild = tipoDenticion === 'nino' || tipoDenticion === 'completo';

    const renderRow = (teethArray, isUpper) => {
        return (
            <div className="flex justify-center flex-nowrap gap-x-[1px] lg:gap-x-1 my-2 px-1 w-full max-w-full overflow-hidden">
                {teethArray.map((toothNum, idx) => {
                    const isCenterGap = (idx === Math.floor(teethArray.length / 2)) && teethArray.length % 2 === 0;

                    return (
                        <React.Fragment key={toothNum}>
                            {/* Brecha central del medio de la boca */}
                            {isCenterGap && <div className="w-8" />}
                            
                            <div className="flex-shrink-0">
                                <InteractiveTooth 
                                    numero={String(toothNum)}
                                    data={odontogramaData[String(toothNum)] || {}}
                                    onZoneClick={onToothClick}
                                    isReadOnly={!onToothClick}
                                    activeToothId={activeToothId}
                                />
                            </div>
                        </React.Fragment>
                    );
                })}
            </div>
        );
    };

    return (
        <div className="w-full h-auto min-h-[400px] bg-white overflow-hidden pb-8">
            {/* Contenedor 100% fluido. Sin w-max para evitar scroll horizontal. */}
            <div className="flex flex-col items-center mx-auto p-1 lg:p-4 gap-y-2 lg:gap-y-4 w-full">
                
                {showAdult && renderRow(RowUpperPermanent, true)}
                {showChild && renderRow(RowUpperTemp, true)}
                
                {/* Separador visual de arcadas superior/inferior */}
                <div className="w-full max-w-4xl h-px bg-slate-100 my-2" />

                {showChild && renderRow(RowLowerTemp, false)}
                {showAdult && renderRow(RowLowerPermanent, false)}

            </div>
        </div>
    );
}
