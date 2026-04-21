import React, { useState } from 'react';
import { db } from '../../../firebase/firebaseConfig';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';
import { FiDollarSign, FiPlusCircle, FiCreditCard, FiSmartphone, FiBriefcase, FiAlertCircle, FiCheck, FiFileText, FiUser } from "react-icons/fi";
import { formatCurrency } from '../../../utils/formatters';

export default function PagoTab({ patient }) {
    const { userProfile } = useAuth();
    const toast = useToast();
    
    const [loading, setLoading] = useState(false);
    const [amount, setAmount] = useState("");
    const [displayAmount, setDisplayAmount] = useState(""); // For masking
    const [method, setMethod] = useState("Efectivo");
    const [concept, setConcept] = useState("ABONO A TRATAMIENTO");
    const [profesional, setProfesional] = useState(userProfile?.nombreCompleto || "");
    const [notes, setNotes] = useState("");

    const handleAmountChange = (val) => {
        const rawValue = val.toString().replace(/\D/g, '');
        const numValue = Number(rawValue);
        
        if (rawValue === "") {
            setAmount("");
            setDisplayAmount("");
            return;
        }

        setAmount(numValue);
        setDisplayAmount(formatCurrency(numValue));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const numAmount = Number(amount);
        if (!numAmount || numAmount <= 0) return toast.error("Monto inválido");
        
        setLoading(true);
        try {
            const pagoData = {
                patientId: patient.id,
                patientNombre: patient.nombreCompleto,
                monto: numAmount,
                medio: method,
                concepto: concept,
                profesional,
                notas: notes,
                fecha: serverTimestamp(),
                fechaISO: new Date().toISOString(),
                inquilino: userProfile?.inquilino || "",
                registradoPor: userProfile?.nombreCompleto || userProfile?.nombre || "Sistema",
                estado: "Completado"
            };

            await addDoc(collection(db, "pagos"), pagoData);
            
            toast.success("Pago registrado exitosamente");
            setAmount("");
            setDisplayAmount("");
            setNotes("");
            setConcept("ABONO A TRATAMIENTO");
        } catch (error) {
            console.error("Error saving payment:", error);
            toast.error("Error al registrar pago");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex-1 p-6 md:p-10 animate-fadeIn bg-slate-50/20 custom-scrollbar overflow-y-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
                <div className="flex items-center gap-5">
                    <div className="w-14 h-14 bg-[#8CC63F] rounded-[22px] flex items-center justify-center text-white shadow-xl shadow-[#8CC63F]/20">
                        <FiPlusCircle size={28} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-slate-800 tracking-tight leading-none mb-1 uppercase">Registro de <span className="text-[#8CC63F] underline decoration-[#8CC63F]/20 decoration-8 underline-offset-4">Pago</span></h2>
                        <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                           <span>Captura de ingresos y abonos</span>
                           <FiAlertCircle size={10} className="text-amber-500" />
                           <span className="text-slate-500">Protocolo de caja activa</span>
                        </div>
                    </div>
                 </div>
            </div>

            <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-8">
                {/* Main Card */}
                <div className="bg-white rounded-[40px] shadow-[0_20px_50px_rgba(0,0,0,0.03)] border border-slate-100 overflow-hidden">
                    
                    <div className="grid grid-cols-1 lg:grid-cols-5 divide-y lg:divide-y-0 lg:divide-x divide-slate-50">
                        
                        {/* Left: Amount Input (Heavy) */}
                        <div className="lg:col-span-2 p-10 bg-slate-50/30 flex flex-col justify-center items-center">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6 block">Monto a Recibir</label>
                            <div className="relative group">
                                <span className="absolute left-0 top-1/2 -translate-y-1/2 text-4xl font-black text-slate-200 group-focus-within:text-[#8CC63F] transition-colors leading-none">$</span>
                                <input 
                                    required
                                    type="text"
                                    inputMode="numeric"
                                    placeholder="0"
                                    value={displayAmount}
                                    onChange={(e) => handleAmountChange(e.target.value)}
                                    className="bg-transparent border-none p-0 pl-10 text-6xl font-black text-slate-800 tracking-tighter outline-none focus:ring-0 w-full placeholder:text-slate-100 placeholder:animate-pulse caret-slate-950"
                                />
                            </div>
                            <div className="mt-8 flex flex-wrap justify-center gap-2">
                                 {[10000, 50000, 100000, 500000].map(val => (
                                     <button key={val} type="button" onClick={() => handleAmountChange(val)} className="px-4 py-2 bg-white text-[10px] font-black text-slate-400 border border-slate-100 rounded-full hover:bg-indigo-600 hover:text-white transition-all shadow-sm">
                                         + {formatCurrency(val)}
                                     </button>
                                 ))}
                            </div>
                        </div>

                        {/* Right: Selectors */}
                        <div className="lg:col-span-3 p-10 space-y-10">
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 block items-center gap-2 flex">
                                    <FiCreditCard className="text-[#8CC63F]" /> Medio de Pago
                                </label>
                                <div className="grid grid-cols-3 gap-3">
                                    {[
                                        { id: "Efectivo", icon: FiDollarSign },
                                        { id: "Tarjeta", icon: FiCreditCard },
                                        { id: "Transferencia", icon: FiSmartphone }
                                    ].map(m => (
                                        <button 
                                            key={m.id}
                                            type="button"
                                            onClick={() => setMethod(m.id)}
                                            className={`flex flex-col items-center justify-center gap-3 p-5 rounded-3xl border transition-all duration-300
                                                ${method === m.id ? 'bg-[#8CC63F] border-[#8CC63F] text-white shadow-xl shadow-[#8CC63F]/20 translate-y-[-4px]' : 'bg-slate-50 border-slate-100 text-slate-400 hover:bg-white hover:border-slate-200'}`}
                                        >
                                            <m.icon size={20} />
                                            <span className="text-[10px] font-black uppercase tracking-widest">{m.id}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block">Concepto del Pago</label>
                                    <select 
                                        value={concept}
                                        onChange={(e) => setConcept(e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-[11px] font-black text-slate-700 outline-none focus:bg-white focus:ring-4 focus:ring-emerald-500/5 transition-all uppercase"
                                    >
                                        <option value="ABONO A TRATAMIENTO">Abono a Tratamiento</option>
                                        <option value="PAGO DE CONSULTA">Pago de Consulta</option>
                                        <option value="PAGO DE RADIOGRAFÍA">Pago de Radiografía</option>
                                        <option value="SALDO A FAVOR">Saldo a Favor</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block">Profesional / Responsable</label>
                                    <div className="relative">
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300">
                                            <FiUser size={16} />
                                        </div>
                                        <input 
                                            placeholder="NOMBRE DEL PROFESIONAL..."
                                            value={profesional}
                                            onChange={(e) => setProfesional(e.target.value.toUpperCase())}
                                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 pr-12 text-[11px] font-black text-slate-700 outline-none focus:bg-white focus:ring-4 focus:ring-emerald-500/5 transition-all placeholder:text-slate-200 caret-slate-950"
                                        />
                                    </div>
                                </div>
                                <div className="md:col-span-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block">Notas Adicionales / Referencia</label>
                                    <div className="relative">
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300">
                                            <FiFileText size={16} />
                                        </div>
                                        <input 
                                            placeholder="DETALLES DE LA TRANSACCIÓN..."
                                            value={notes}
                                            onChange={(e) => setNotes(e.target.value.toUpperCase())}
                                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 pr-12 text-[11px] font-black text-slate-700 outline-none focus:bg-white focus:ring-4 focus:ring-emerald-500/5 transition-all placeholder:text-slate-200 caret-slate-950"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer Guard */}
                    <div className="p-10 bg-slate-900 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8 group">
                         <div className="flex items-center gap-4 grayscale group-hover:grayscale-0 transition-all">
                              <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-white border border-white/10">
                                   <FiBriefcase size={20} />
                              </div>
                              <div>
                                   <span className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em] block mb-1">Operador de Caja</span>
                                   <span className="text-[11px] font-black text-white uppercase tracking-widest">{userProfile?.nombreCompleto || 'Cajero Sistema'}</span>
                              </div>
                         </div>
                         
                         <button 
                            disabled={loading}
                            className="w-full md:w-auto px-12 py-5 bg-[#8CC63F] hover:bg-[#7bb335] text-white rounded-[24px] font-black text-[13px] uppercase tracking-[0.2em] shadow-[0_20px_50px_rgba(140,198,63,0.3)] transition-all active:scale-95 flex items-center justify-center gap-4 disabled:opacity-50"
                         >
                            <FiCheck size={20} strokeWidth={3} /> {loading ? "Procesando..." : "Finalizar Transacción"}
                         </button>
                    </div>
                </div>

                <p className="text-center text-[9px] font-black text-slate-300 uppercase tracking-[0.3em]">Esta transacción genera un registro de auditoría inmutable en el libro contable de OdontoCloud</p>
            </form>
        </div>
    );
}
