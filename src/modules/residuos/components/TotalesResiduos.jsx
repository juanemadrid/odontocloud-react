import React, { useState, useEffect, useMemo } from "react";
import { FiSearch, FiCalendar, FiFilter, FiActivity } from "react-icons/fi";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../../firebase/firebaseConfig";
import { useAuth } from "../../../context/AuthContext";
import { toast } from "sonner";

export default function TotalesResiduos() {
    const { userProfile } = useAuth();
    const inquilino = userProfile?.inquilino || "";

    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    // Filters
    const [dateRange, setDateRange] = useState({
        start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split("T")[0],
        end: new Date().toISOString().split("T")[0]
    });

    const loadLogs = async () => {
        if (!inquilino) return;
        setLoading(true);
        try {
            const q = query(
                collection(db, "registro_residuos"),
                where("inquilino", "==", inquilino)
            );
            const snap = await getDocs(q);
            setLogs(snap.docs.map(d => d.data()));
        } catch (e) {
            console.error("Error loading waste totals logs:", e);
            toast.error("Error al cargar los totales de residuos");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadLogs();
    }, [inquilino]);

    // Apply date range filter
    const filteredLogs = useMemo(() => {
        return logs.filter(log => {
            const logDate = log.fecha;
            return logDate >= dateRange.start && logDate <= dateRange.end;
        });
    }, [logs, dateRange]);

    // Aggregate by type
    const aggregates = useMemo(() => {
        const map = {};
        let totalWeight = 0;
        let hazardousWeight = 0;
        let nonHazardousWeight = 0;

        filteredLogs.forEach(log => {
            const name = log.residuoNombre;
            const color = log.color || "Otro";
            const qty = log.cantidad || 0;

            if (!map[name]) {
                map[name] = { nombre: name, color, total: 0, count: 0 };
            }

            map[name].total += qty;
            map[name].count += 1;
            totalWeight += qty;

            // Hazardous waste usually has RED color in dental clinics
            if (color === "Rojo") {
                hazardousWeight += qty;
            } else {
                nonHazardousWeight += qty;
            }
        });

        const list = Object.values(map).sort((a, b) => b.total - a.total);
        return {
            list,
            totalWeight,
            hazardousWeight,
            nonHazardousWeight
        };
    }, [filteredLogs]);

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Filter toolbar */}
            <div className="bg-white p-6 rounded-[28px] border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex flex-wrap items-center gap-4">
                    <div className="flex flex-col gap-1.5">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Fecha Inicial</label>
                        <div className="relative">
                            <input
                                type="date"
                                value={dateRange.start}
                                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                                className="h-10 px-4 pl-11 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 outline-none focus:border-blue-500 transition-all"
                            />
                            <FiCalendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                        </div>
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Fecha Final</label>
                        <div className="relative">
                            <input
                                type="date"
                                value={dateRange.end}
                                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                                className="h-10 px-4 pl-11 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 outline-none focus:border-blue-500 transition-all"
                            />
                            <FiCalendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                        </div>
                    </div>
                </div>
                <button
                    onClick={loadLogs}
                    className="h-10 px-6 flex items-center justify-center bg-blue-600 text-white rounded-full text-xs font-black uppercase tracking-widest hover:bg-blue-700 shadow-lg shadow-blue-500/10 transition-all active:scale-95 shrink-0"
                >
                    <FiFilter className="mr-1.5" size={14} />
                    Filtrar Reporte
                </button>
            </div>

            {/* Indicator Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Total */}
                <div className="bg-white p-6 rounded-[28px] border border-slate-100 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-600/5 text-blue-600 rounded-2xl flex items-center justify-center border border-blue-100 shrink-0">
                        <FiActivity size={20} />
                    </div>
                    <div>
                        <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Total acumulado</h4>
                        <p className="text-2xl font-black text-slate-800 tracking-tight mt-0.5">{aggregates.totalWeight.toFixed(2)} Kg</p>
                    </div>
                </div>

                {/* Peligrosos (Rojo) */}
                <div className="bg-white p-6 rounded-[28px] border border-slate-100 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 bg-rose-500/5 text-rose-600 rounded-2xl flex items-center justify-center border border-rose-100 shrink-0">
                        <FiActivity size={20} />
                    </div>
                    <div>
                        <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Residuos Peligrosos</h4>
                        <p className="text-2xl font-black text-rose-600 tracking-tight mt-0.5">{aggregates.hazardousWeight.toFixed(2)} Kg</p>
                    </div>
                </div>

                {/* No Peligrosos (Otros) */}
                <div className="bg-white p-6 rounded-[28px] border border-slate-100 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 bg-emerald-500/5 text-emerald-600 rounded-2xl flex items-center justify-center border border-emerald-100 shrink-0">
                        <FiActivity size={20} />
                    </div>
                    <div>
                        <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Residuos No Peligrosos</h4>
                        <p className="text-2xl font-black text-emerald-600 tracking-tight mt-0.5">{aggregates.nonHazardousWeight.toFixed(2)} Kg</p>
                    </div>
                </div>
            </div>

            {/* Distribution Graph and table */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Distribution bars */}
                <div className="bg-white p-8 rounded-[28px] border border-slate-100 shadow-sm space-y-6">
                    <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest border-b border-slate-50 pb-3">
                        Distribución de generación (Kg)
                    </h3>
                    <div className="space-y-4 max-h-[360px] overflow-y-auto pr-2 custom-scrollbar">
                        {aggregates.list.length === 0 ? (
                            <p className="text-slate-400 italic text-xs text-center py-10">Sin datos de generación en este rango.</p>
                        ) : (
                            aggregates.list.map((item, idx) => {
                                const percentage = aggregates.totalWeight > 0 ? (item.total / aggregates.totalWeight) * 100 : 0;
                                return (
                                    <div key={idx} className="space-y-1.5">
                                        <div className="flex justify-between text-xs font-bold">
                                            <span className="text-slate-700 uppercase">{item.nombre}</span>
                                            <span className="text-blue-600 font-mono">{item.total.toFixed(2)} Kg ({percentage.toFixed(0)}%)</span>
                                        </div>
                                        <div className="w-full h-2.5 bg-slate-50 rounded-full overflow-hidden border border-slate-100/50">
                                            <div
                                                className={`h-full rounded-full transition-all duration-1000 ${
                                                    item.color === "Rojo" ? "bg-rose-500" :
                                                    item.color === "Verde" ? "bg-emerald-500" :
                                                    item.color === "Negro" ? "bg-slate-800" :
                                                    item.color === "Blanco" ? "bg-slate-300" :
                                                    "bg-blue-500"
                                                }`}
                                                style={{ width: `${percentage}%` }}
                                            />
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* Breakdown table */}
                <div className="bg-white rounded-[28px] border border-slate-100 shadow-sm overflow-hidden flex flex-col h-fit">
                    <div className="px-6 py-4 bg-slate-50/50 border-b border-slate-100">
                        <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">Resumen detallado</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/20 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                    <th className="px-6 py-4 pl-8">Tipo de residuo</th>
                                    <th className="px-6 py-4">Color clasif.</th>
                                    <th className="px-6 py-4">Total Kg</th>
                                    <th className="px-6 py-4 text-center pr-8 w-24">Cargas</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50 text-[13px] text-slate-700">
                                {loading ? (
                                    <tr>
                                        <td colSpan="4" className="px-8 py-10 text-center">
                                            <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
                                        </td>
                                    </tr>
                                ) : aggregates.list.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" className="px-8 py-20 text-center text-slate-400 italic">No hay datos en el periodo</td>
                                    </tr>
                                ) : (
                                    aggregates.list.map((item, i) => (
                                        <tr key={i} className="hover:bg-slate-50/30 transition-colors">
                                            <td className="px-6 py-4 pl-8 font-black text-slate-800 uppercase tracking-tight">{item.nombre}</td>
                                            <td className="px-6 py-4 font-semibold text-slate-500">{item.color}</td>
                                            <td className="px-6 py-4 font-black text-blue-600 font-mono">{item.total.toFixed(2)} Kg</td>
                                            <td className="px-6 py-4 text-center text-slate-500 font-bold pr-8">{item.count}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
