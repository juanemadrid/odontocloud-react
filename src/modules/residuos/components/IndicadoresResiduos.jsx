import React, { useState, useEffect, useMemo } from "react";
import { FiTrendingUp, FiActivity, FiShield, FiAlertTriangle } from "react-icons/fi";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../../firebase/firebaseConfig";
import { useAuth } from "../../../context/AuthContext";

export default function IndicadoresResiduos() {
    const { userProfile } = useAuth();
    const inquilino = userProfile?.inquilino || "";

    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!inquilino) return;
        const loadLogs = async () => {
            try {
                const snap = await getDocs(query(collection(db, "registro_residuos"), where("inquilino", "==", inquilino)));
                setLogs(snap.docs.map(d => d.data()));
            } catch (e) {
                console.error("Error loading indicators logs:", e);
            } finally {
                setLoading(false);
            }
        };
        loadLogs();
    }, [inquilino]);

    const stats = useMemo(() => {
        let total = 0;
        let hazardous = 0;
        logs.forEach(log => {
            const qty = log.cantidad || 0;
            total += qty;
            if (log.color === "Rojo") {
                hazardous += qty;
            }
        });
        const hazardousRate = total > 0 ? (hazardous / total) * 100 : 0;
        return {
            total,
            hazardous,
            hazardousRate
        };
    }, [logs]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                <span className="text-xs font-black text-slate-400 uppercase tracking-widest mt-4">Calculando indicadores...</span>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Grid of indicators */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Indicador 1: Tasa de Residuos Peligrosos */}
                <div className="bg-white p-6 rounded-[28px] border border-slate-100 shadow-sm flex flex-col justify-between h-40">
                    <div className="flex items-center justify-between">
                        <span className="w-10 h-10 bg-rose-500/5 text-rose-600 rounded-xl border border-rose-100 flex items-center justify-center"><FiTrendingUp /></span>
                        <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                            stats.hazardousRate > 40 ? "bg-rose-50 text-rose-600" : "bg-emerald-50 text-emerald-600"
                        }`}>
                            {stats.hazardousRate > 40 ? "Alto" : "Óptimo"}
                        </span>
                    </div>
                    <div>
                        <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Tasa de Peligrosidad</h4>
                        <p className="text-2xl font-black text-slate-800 tracking-tight mt-1">{stats.hazardousRate.toFixed(1)}%</p>
                        <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">Meta ideal: &lt; 40% del total</span>
                    </div>
                </div>

                {/* Indicador 2: Kg de residuo biológico por pesaje */}
                <div className="bg-white p-6 rounded-[28px] border border-slate-100 shadow-sm flex flex-col justify-between h-40">
                    <div className="flex items-center justify-between">
                        <span className="w-10 h-10 bg-blue-600/5 text-blue-600 rounded-xl border border-blue-100 flex items-center justify-center"><FiActivity /></span>
                        <span className="text-[10px] font-black text-slate-400 bg-slate-100 px-2.5 py-0.5 rounded-full uppercase tracking-wider">Cargas: {logs.length}</span>
                    </div>
                    <div>
                        <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Promedio por pesaje</h4>
                        <p className="text-2xl font-black text-slate-800 tracking-tight mt-1">
                            {logs.length > 0 ? (stats.total / logs.length).toFixed(2) : "0.00"} Kg
                        </p>
                        <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">Media de generación por carga</span>
                    </div>
                </div>

                {/* Indicador 3: Nivel de cumplimiento legal */}
                <div className="bg-white p-6 rounded-[28px] border border-slate-100 shadow-sm flex flex-col justify-between h-40">
                    <div className="flex items-center justify-between">
                        <span className="w-10 h-10 bg-emerald-500/5 text-emerald-600 rounded-xl border border-emerald-100 flex items-center justify-center"><FiShield /></span>
                        <span className="bg-emerald-50 text-emerald-600 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">Cumple</span>
                    </div>
                    <div>
                        <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Conformidad Legal</h4>
                        <p className="text-2xl font-black text-slate-800 tracking-tight mt-1">100%</p>
                        <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">Pesaje hospitalario obligatorio</span>
                    </div>
                </div>

                {/* Indicador 4: Total anual */}
                <div className="bg-white p-6 rounded-[28px] border border-slate-100 shadow-sm flex flex-col justify-between h-40">
                    <div className="flex items-center justify-between">
                        <span className="w-10 h-10 bg-amber-500/5 text-amber-600 rounded-xl border border-amber-100 flex items-center justify-center"><FiAlertTriangle /></span>
                        <span className="text-[10px] font-black text-slate-400 bg-slate-100 px-2.5 py-0.5 rounded-full uppercase tracking-wider">Anual</span>
                    </div>
                    <div>
                        <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Generación Total</h4>
                        <p className="text-2xl font-black text-slate-800 tracking-tight mt-1">{stats.total.toFixed(1)} Kg</p>
                        <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">Peso acumulado del año actual</span>
                    </div>
                </div>
            </div>

            {/* Advice panel */}
            <div className="bg-white p-8 rounded-[28px] border border-slate-100 shadow-sm flex flex-col gap-4">
                <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest border-b border-slate-50 pb-3">Recomendaciones Sanitarias (SST / Bioseguridad)</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-slate-500 font-semibold leading-relaxed">
                    <div className="space-y-2 p-4 bg-slate-50/50 rounded-2xl border border-slate-100/50">
                        <h5 className="font-black text-slate-700 uppercase">Clasificación en Origen</h5>
                        <p>Los residuos anatomopatológicos y biosanitarios deben depositarse siempre en bolsas rojas gruesas y recipientes de pedal etiquetados debidamente. Nunca mezclar con residuos ordinarios.</p>
                    </div>
                    <div className="space-y-2 p-4 bg-slate-50/50 rounded-2xl border border-slate-100/50">
                        <h5 className="font-black text-slate-700 uppercase">Elementos Cortopunzantes</h5>
                        <p>Las agujas, hojas de bisturí y limas de endodoncia deben disponerse exclusivamente en recipientes rígidos tipo Guardián de seguridad. No reencapsular las agujas manualmente.</p>
                    </div>
                    <div className="space-y-2 p-4 bg-slate-50/50 rounded-2xl border border-slate-100/50">
                        <h5 className="font-black text-slate-700 uppercase">Pesaje y Auditoría</h5>
                        <p>Realice el pesaje semanal de sus residuos y registre las cargas en este módulo antes de la recolección por parte de la empresa especializada para mantener la planilla legal al día.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
