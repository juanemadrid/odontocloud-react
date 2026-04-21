import React, { useEffect, useState } from 'react';
import { getPatientFinancials } from '../../../services/billingService';
import { 
    FiDollarSign, FiPlus, FiSearch, FiFileText, FiClock, 
    FiCheckCircle, FiAlertCircle, FiTrendingUp, FiArrowRight, FiActivity
} from "react-icons/fi";
import AddCreditModal from './AddCreditModal';
import { formatCurrency } from '../../../utils/formatters';

export default function SaldoTab({ patient }) {
    const [financials, setFinancials] = useState(null);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [modalOpen, setModalOpen] = useState(false);


    const loadData = async () => {
        if (!patient?.id) return;
        setLoading(true);
        const data = await getPatientFinancials(patient.id);
        setFinancials(data);
        setLoading(false);
    };

    useEffect(() => {
        loadData();
    }, [patient?.id]);

    if (loading) return (
        <div className="flex flex-col items-center justify-center p-20 opacity-30 animate-pulse">
            <FiActivity size={48} className="text-slate-400 mb-4" />
            <h5 className="text-[14px] font-black uppercase tracking-widest text-slate-500">Analizando Finanzas Hub...</h5>
        </div>
    );

    const { totals, plans = [] } = financials;
    const isDebtFree = totals.balance <= 0;

    const filteredPlans = plans.filter(p => 
        (p.name || p.type || "Operatoria").toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="flex-1 flex flex-col h-full bg-slate-50/20 animate-fadeIn overflow-hidden">
            
            {/* 1. HUD ELITE (Top metrics) */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-6 md:px-10 border-b border-slate-100 bg-white shrink-0">
                <HUDCard 
                    label="Total Facturado" 
                    value={totals.totalFacturado} 
                    icon={FiFileText} 
                    color="slate" 
                />
                <HUDCard 
                    label="Total Recaudado" 
                    value={totals.totalPagado} 
                    icon={FiCheckCircle} 
                    color="emerald" 
                />
                <HUDCard 
                    label="Saldo por Cobrar" 
                    value={totals.balance > 0 ? totals.balance : 0} 
                    icon={FiAlertCircle} 
                    color="rose" 
                    isCritical={totals.balance > 0}
                />
                <HUDCard 
                    label="Saldo a Favor" 
                    value={totals.totalSaldosAFavor} 
                    icon={FiDollarSign} 
                    color="indigo" 
                    badge="Crédito"
                />
            </div>

            {/* 2. TOOLBAR & TABLE AREA */}
            <div className="flex-1 flex flex-col min-h-0 bg-slate-50/30">
                
                {/* TOOLBAR */}
                <div className="px-6 md:px-10 py-6 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white/50 backdrop-blur-sm border-b border-slate-100/50">
                    <div className="relative w-full sm:w-96">
                        <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={14} />
                        <input 
                            type="text" 
                            placeholder="Buscar en recibos de caja..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-[11px] font-bold text-slate-600 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-400 transition-all placeholder:text-slate-200 uppercase"
                        />
                    </div>
                    
                    <button 
                        onClick={() => setModalOpen(true)}
                        className="w-full sm:w-auto px-8 py-3 bg-[#8CC63F] hover:bg-[#7bb335] text-white rounded-full font-black text-[11px] uppercase tracking-widest shadow-xl shadow-[#8CC63F]/20 transition-all active:scale-95 flex items-center justify-center gap-2"
                    >
                         <FiPlus size={16} strokeWidth={3} /> Adicionar saldo a favor
                    </button>
                </div>

                {/* TABLE (Recibo de Caja Style) */}
                <div className="flex-1 overflow-auto custom-scrollbar p-6 pt-2">
                    <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
                        <table className="w-full text-left border-collapse min-w-[700px]">
                            <thead className="bg-slate-50/80 border-b border-slate-100">
                                <tr>
                                    <th className="py-4 px-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">Nombre del Plan</th>
                                    <th className="py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Sucursal</th>
                                    <th className="py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Costo Total</th>
                                    <th className="py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Pagado</th>
                                    <th className="py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Saldo</th>
                                    <th className="py-4 px-8 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {filteredPlans.length > 0 ? (
                                    filteredPlans.map(plan => {
                                        const saldo = plan.costoTotal - plan.pagado;
                                        return (
                                            <tr key={plan.id} className="hover:bg-slate-50/50 transition-colors group">
                                                <td className="py-5 px-8">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-500 transition-colors">
                                                            <FiFileText size={14} />
                                                        </div>
                                                        <span className="text-[12px] font-black text-slate-700 uppercase tracking-tight">{plan.name || "Operatoria Gral."}</span>
                                                    </div>
                                                </td>
                                                <td className="py-5 px-6 text-center">
                                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{plan.sucursal || "Sede Principal"}</span>
                                                </td>
                                                <td className="py-5 px-6 text-right">
                                                    <span className="text-[12px] font-black text-slate-700">$ {formatCurrency(plan.costoTotal)}</span>
                                                </td>
                                                <td className="py-5 px-6 text-right">
                                                    <span className="text-[12px] font-black text-emerald-600">$ {formatCurrency(plan.pagado)}</span>
                                                </td>
                                                <td className="py-5 px-6 text-right">
                                                    <span className={`text-[12px] font-black ${saldo > 0 ? 'text-rose-500' : 'text-slate-400'}`}>
                                                        $ {formatCurrency(saldo)}
                                                    </span>
                                                </td>
                                                <td className="py-5 px-8 text-center">
                                                    <button className="w-8 h-8 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center hover:bg-indigo-600 hover:text-white transition-all shadow-sm active:scale-90 mx-auto">
                                                        <FiArrowRight size={14} />
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="py-20 text-center">
                                            <div className="flex flex-col items-center opacity-20">
                                                <FiFileText size={48} className="mb-4" />
                                                <p className="text-xs font-black uppercase tracking-widest">No hay planes de tratamiento financieros registrados</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* FOOTER INFO */}
                <div className="px-10 py-6 border-t border-slate-100 bg-white flex justify-between items-center opacity-60">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                        <FiCheckCircle size={12} className="text-emerald-500" /> Auditoría financiera activa v4.0
                    </p>
                    <div className="flex gap-4">
                         <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Inversión Bruta: ${formatCurrency(totals.totalFacturado)}</span>
                         <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Abonos Totales: ${formatCurrency(totals.totalPagado)}</span>
                    </div>
                </div>
            </div>

            {/* MODAL INTEGRATION */}
            <AddCreditModal 
                isOpen={modalOpen} 
                onClose={() => setModalOpen(false)} 
                patient={patient} 
                onUpdate={loadData}
            />
        </div>
    );
}

function HUDCard({ label, value, icon: Icon, color, isCritical, badge }) {
    const colors = {
        indigo: "bg-indigo-50 text-indigo-600 border-indigo-100 ring-indigo-500/10",
        emerald: "bg-emerald-50 text-emerald-600 border-emerald-100 ring-emerald-500/10",
        rose: "bg-rose-50 text-rose-600 border-rose-100 ring-rose-500/10",
        slate: "bg-slate-50 text-slate-600 border-slate-100 ring-slate-500/10"
    };

    return (
        <div className={`p-5 rounded-[24px] border ${colors[color]} ring-4 transition-all hover:scale-[1.02] duration-300 relative overflow-hidden group`}>
            <div className="flex justify-between items-start mb-3 relative z-10">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center bg-white shadow-sm`}>
                    <Icon size={16} />
                </div>
                {badge && (
                    <span className="text-[8px] font-black bg-white/50 px-2 py-0.5 rounded-full uppercase tracking-tighter">
                        {badge}
                    </span>
                )}
            </div>
            <div className="text-[9px] font-black uppercase tracking-widest opacity-60 mb-0.5 leading-none">{label}</div>
            <div className={`text-xl font-black tracking-tighter leading-none ${isCritical ? 'animate-pulse' : ''}`}>
                <span className="text-xs mr-0.5 opacity-40">$</span>
                {formatCurrency(value)}
            </div>
            
            {/* Subtle background decoration */}
            <div className={`absolute -right-2 -bottom-2 opacity-5 transition-transform group-hover:scale-150 duration-700`}>
                <Icon size={64} />
            </div>
        </div>
    );
}

