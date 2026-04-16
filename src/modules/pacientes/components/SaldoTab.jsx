import React, { useEffect, useState } from 'react';
import { getPatientFinancials } from '../../../services/billingService';
import { FiDollarSign, FiTrendingUp, FiActivity, FiArrowRight, FiCheckCircle, FiAlertCircle } from "react-icons/fi";

export default function SaldoTab({ patient }) {
    const [financials, setFinancials] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!patient?.id) return;
        const load = async () => {
            const data = await getPatientFinancials(patient.id);
            setFinancials(data);
            setLoading(false);
        };
        load();
    }, [patient?.id]);

    if (loading) return (
        <div className="flex flex-col items-center justify-center p-20 opacity-30 animate-pulse">
            <FiActivity size={48} className="text-slate-400 mb-4" />
            <h5 className="text-[14px] font-black uppercase tracking-widest text-slate-500">Analizando Finanzas...</h5>
        </div>
    );

    const { totals } = financials;
    const isDebtFree = totals.balance <= 0;

    return (
        <div className="flex-1 flex flex-col p-6 md:p-10 animate-fadeIn bg-slate-50/20 custom-scrollbar overflow-y-auto">
            {/* Header / Intro */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
                <div className="flex items-center gap-5">
                    <div className="w-14 h-14 bg-indigo-600 rounded-[22px] flex items-center justify-center text-white shadow-xl shadow-indigo-100">
                        <FiTrendingUp size={28} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-slate-800 tracking-tight leading-none mb-1 uppercase">Estado de <span className="text-indigo-600 underline decoration-indigo-100 decoration-8 underline-offset-4">Cuenta</span></h2>
                        <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                           <span>Balance financiero consolidado</span>
                           <FiArrowRight size={10} className="text-slate-200" />
                           <span className="text-slate-500">{patient?.nombreCompleto}</span>
                        </div>
                    </div>
                </div>

                <div className={`px-6 py-3 rounded-2xl flex items-center gap-3 border ${isDebtFree ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-rose-50 border-rose-100 text-rose-600'}`}>
                    {isDebtFree ? <FiCheckCircle size={18} /> : <FiAlertCircle size={18} />}
                    <span className="text-[11px] font-black uppercase tracking-widest">{isDebtFree ? 'Al día en pagos' : 'Presenta deuda pendiente'}</span>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                {/* Facturación Total */}
                <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-100/50 transition-all duration-300">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400">
                             <FiDollarSign size={18} />
                        </div>
                        <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Inversión Bruta</span>
                    </div>
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 leading-none">Total Facturado</div>
                    <div className="text-3xl font-black text-slate-800 tracking-tighter">
                        <span className="text-sm font-bold text-slate-300 mr-1">$</span>
                        {totals.totalFacturado.toLocaleString('es-CO')}
                    </div>
                </div>

                {/* Recaudado */}
                <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-emerald-100/30 transition-all duration-300 border-b-4 border-b-emerald-400">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-500">
                             <FiCheckCircle size={18} />
                        </div>
                        <span className="text-[9px] font-black text-emerald-300 uppercase tracking-widest">Abonos Efectuados</span>
                    </div>
                    <div className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-1 leading-none text-emerald-500/60">Total Recaudado</div>
                    <div className="text-3xl font-black text-emerald-600 tracking-tighter">
                        <span className="text-sm font-bold text-emerald-300 mr-1">$</span>
                        {totals.totalPagado.toLocaleString('es-CO')}
                    </div>
                </div>

                {/* Por Cobrar / Balance */}
                <div className={`bg-white p-8 rounded-[32px] border shadow-sm hover:shadow-xl transition-all duration-300 ${totals.balance > 0 ? 'border-rose-100 shadow-rose-100/40 border-b-4 border-b-rose-400' : 'border-slate-100 shadow-slate-100/50'}`}>
                    <div className="flex items-center justify-between mb-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${totals.balance > 0 ? 'bg-rose-50 text-rose-500' : 'bg-slate-50 text-slate-400'}`}>
                             <FiAlertCircle size={18} />
                        </div>
                        <span className={`text-[9px] font-black uppercase tracking-widest ${totals.balance > 0 ? 'text-rose-300' : 'text-slate-300'}`}>Balance Pendiente</span>
                    </div>
                    <div className={`text-[10px] font-black uppercase tracking-widest mb-1 leading-none ${totals.balance > 0 ? 'text-rose-400' : 'text-slate-400'}`}>Saldo por Cobrar</div>
                    <div className={`text-4xl font-black tracking-tighter ${totals.balance > 0 ? 'text-rose-600' : 'text-slate-800'}`}>
                        <span className="text-sm font-bold opacity-30 mr-1">$</span>
                        {totals.balance.toLocaleString('es-CO')}
                    </div>
                </div>
            </div>

            {/* Account Info Illustration / Details */}
            <div className="max-w-4xl bg-white border border-slate-100 rounded-[40px] p-10 flex flex-col md:flex-row items-center gap-10">
                 <div className="w-32 h-32 bg-indigo-50 rounded-[32px] flex items-center justify-center text-indigo-600 shadow-inner relative overflow-hidden group">
                      <FiDollarSign size={48} className="relative z-10 transition-transform group-hover:scale-125" />
                      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-indigo-100/50 blur-xl translate-y-1/2" />
                 </div>
                 <div className="flex-1 text-center md:text-left">
                      <h4 className="text-[14px] font-black text-slate-800 uppercase tracking-tight mb-2">Comportamiento de Pago</h4>
                      <p className="text-[12px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed">
                          Este paciente ha cubierto el <span className="text-indigo-600 underline">{(totals.totalFacturado > 0 ? (totals.totalPagado / totals.totalFacturado * 100).toFixed(0) : 100)}%</span> de su tratamiento total. 
                          {totals.balance > 0 
                            ? " Se recomienda realizar un abono pronto para continuar con las fases planificadas." 
                            : " El expediente se encuentra financieramente saludable y al día."}
                      </p>
                 </div>
                 <div className="flex flex-col gap-2 shrink-0">
                      <div className="bg-slate-50 px-5 py-3 rounded-2xl flex items-center justify-between gap-6 border border-slate-100/50">
                           <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Próxima Devolución</span>
                           <span className="text-[11px] font-black text-slate-800 uppercase">$ 0</span>
                      </div>
                      <div className="bg-slate-50 px-5 py-3 rounded-2xl flex items-center justify-between gap-6 border border-slate-100/50">
                           <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Saldo a Favor</span>
                           <span className="text-[11px] font-black text-emerald-600 uppercase">$ 0</span>
                      </div>
                 </div>
            </div>

            {/* Floating Hint */}
            <div className="mt-auto pt-10 text-center opacity-30">
                 <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em]">Módulo Financiero Auditado por Sistema OdontoCloud v4.0</p>
            </div>
        </div>
    );
}
