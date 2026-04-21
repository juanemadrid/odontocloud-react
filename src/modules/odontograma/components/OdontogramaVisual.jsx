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
            <div className="flex flex-col items-center mx-auto p-1 lg:p-4 w-full">
                
                {/* Arcada Superior */}
                <div className="flex flex-col items-center w-full">
                    {showAdult && renderRow(RowUpperPermanent, true)}
                    {showChild && renderRow(RowUpperTemp, true)}
                </div>

                {/* Línea central clínica - separa las arcadas */}
                <div className="w-full max-w-5xl flex items-center gap-3 my-1 px-4">
                    <div className="flex-1 border-t border-dashed border-slate-200" />
                    <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest whitespace-nowrap">Plano oclusal</span>
                    <div className="flex-1 border-t border-dashed border-slate-200" />
                </div>

                {/* Arcada Inferior */}
                <div className="flex flex-col items-center w-full">
                    {showChild && renderRow(RowLowerTemp, false)}
                    {showAdult && renderRow(RowLowerPermanent, false)}
                </div>

            </div>
        </div>
    );
}
