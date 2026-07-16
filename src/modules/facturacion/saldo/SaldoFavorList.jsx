import React, { useState, useEffect, useMemo } from "react";
import { FiPlus, FiCalendar, FiSearch, FiPrinter, FiUser } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../../firebase/firebaseConfig";
import { useAuth } from "../../../context/AuthContext";

const fmt = (n) =>
  Number(n || 0).toLocaleString("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  });

const formatDateOnly = (dObj) => {
  if (!dObj) return "—";
  try {
    const d = dObj.toDate ? dObj.toDate() : new Date(dObj);
    return d.toLocaleDateString("es-CO", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    });
  } catch { return "—"; }
};

export default function SaldoFavorList({ onNew }) {
    const navigate = useNavigate();
    const { userProfile } = useAuth();
    const inquilino = userProfile?.inquilino || "";

    const [loading, setLoading] = useState(true);
    const [pagos, setPagos] = useState([]);
    const [pacientes, setPacientes] = useState([]);

    // Toggles
    const [detalleMovimientos, setDetalleMovimientos] = useState(false);
    const [conSaldo, setConSaldo] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    const loadData = async () => {
        if (!inquilino) return;
        setLoading(true);
        try {
            // Load all payments for this tenant
            const pSnap = await getDocs(query(collection(db, "pagos"), where("inquilino", "==", inquilino)));
            const pList = pSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setPagos(pList);

            // Load all patients
            const pacSnap = await getDocs(query(collection(db, "pacientes"), where("inquilino", "==", inquilino)));
            const pacList = pacSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setPacientes(pacList);
        } catch (e) {
            console.error("Error loading credit balances:", e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [inquilino]);

    // Aggregate credit balance per patient
    const creditBalances = useMemo(() => {
        return pacientes.map(pac => {
            const pacPayments = pagos.filter(p => p.pacienteId === pac.id && p.estado !== "Anulado");
            
            // Total credit added
            const totalCredits = pacPayments
                .filter(p => p.concepto === "SALDO A FAVOR")
                .reduce((sum, p) => sum + Number(p.monto || 0), 0);
            
            // Total credit used
            const usedCredits = pacPayments
                .filter(p => p.medio === "Saldo a favor")
                .reduce((sum, p) => sum + Number(p.monto || 0), 0);
            
            // Available credit
            const availableCredit = Math.max(0, totalCredits - usedCredits);

            // Get date of the latest credit top-up
            const creditDates = pacPayments
                .filter(p => p.concepto === "SALDO A FAVOR")
                .map(p => p.fecha || p.createdAt)
                .filter(Boolean);
            
            let latestDate = null;
            if (creditDates.length > 0) {
                // Find latest timestamp
                latestDate = creditDates.reduce((latest, current) => {
                    const timeL = latest.seconds || new Date(latest).getTime() / 1000;
                    const timeC = current.seconds || new Date(current).getTime() / 1000;
                    return timeC > timeL ? current : latest;
                });
            }

            return {
                id: pac.id,
                nombre: pac.nombreCompleto || `${pac.nombres || ""} ${pac.apellidos || ""}`.trim(),
                documento: pac.nroDocumento || pac.cedula || "—",
                fecha: latestDate,
                valorDisponible: availableCredit,
                valorUsado: usedCredits,
                valorTotal: totalCredits
            };
        });
    }, [pagos, pacientes]);

    // Filter list
    const filteredBalances = useMemo(() => {
        return creditBalances.filter(item => {
            // Con saldo filter
            if (conSaldo && item.valorDisponible <= 0) return false;

            // Search filter
            if (searchTerm.trim()) {
                const q = searchTerm.toLowerCase();
                const matchesName = item.nombre.toLowerCase().includes(q);
                const matchesDoc = item.documento.toLowerCase().includes(q);
                if (!matchesName && !matchesDoc) return false;
            }

            // Exclude patients with absolutely no credit history (valorTotal === 0)
            if (item.valorTotal === 0) return false;

            return true;
        });
    }, [creditBalances, conSaldo, searchTerm]);

    // Sum column totals
    const columnTotals = useMemo(() => {
        return filteredBalances.reduce((acc, curr) => {
            acc.disponible += curr.valorDisponible;
            acc.usado += curr.valorUsado;
            acc.total += curr.valorTotal;
            return acc;
        }, { disponible: 0, usado: 0, total: 0 });
    }, [filteredBalances]);

    return (
        <div className="p-4 md:p-6 max-w-[1400px] mx-auto space-y-6 animate-in fade-in duration-500">

            {/* Filter Toggle Cards */}
            <div className="bg-white p-8 rounded-[28px] border border-slate-100 shadow-sm flex flex-col gap-6 max-w-xl">
                
                {/* Toggle 1: Detalle movimientos */}
                <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-slate-500 uppercase tracking-widest text-right w-44">
                        Detalle de movimientos por tercero
                    </span>
                    <button
                        type="button"
                        onClick={() => setDetalleMovimientos(!detalleMovimientos)}
                        className={`w-14 h-8 flex items-center rounded-full p-1 transition-all duration-300 ${
                            detalleMovimientos ? "bg-[#8cc33f]" : "bg-slate-200"
                        }`}
                    >
                        <div
                            className={`bg-white w-6 h-6 rounded-full shadow-md transform transition-all duration-300 ${
                                detalleMovimientos ? "translate-x-6" : "translate-x-0"
                            }`}
                        />
                    </button>
                </div>

                {/* Toggle 2: ¿Con saldo? */}
                <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-slate-500 uppercase tracking-widest text-right w-44">
                        ¿Con saldo?
                    </span>
                    <button
                        type="button"
                        onClick={() => setConSaldo(!conSaldo)}
                        className={`w-14 h-8 flex items-center rounded-full p-1 transition-all duration-300 ${
                            conSaldo ? "bg-[#8cc33f]" : "bg-slate-200"
                        }`}
                    >
                        <div
                            className={`bg-white w-6 h-6 rounded-full shadow-md transform transition-all duration-300 ${
                                conSaldo ? "translate-x-6" : "translate-x-0"
                            }`}
                        />
                    </button>
                </div>

            </div>

            {/* Search Input */}
            <div className="bg-white p-4 rounded-[20px] border border-slate-100 shadow-sm max-w-md">
                <div className="relative">
                    <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input 
                        type="text" 
                        placeholder="Buscar por tercero o documento..."
                        className="w-full h-10 pl-11 pr-4 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-slate-600 outline-none focus:bg-white focus:border-blue-500 transition-all"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Balances Table */}
            <div className="bg-white rounded-[28px] border border-slate-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                <th className="px-6 py-4 pl-8">Fecha</th>
                                <th className="px-6 py-4">Tercero</th>
                                <th className="px-6 py-4">Documento</th>
                                <th className="px-6 py-4 text-right">Valor disponible</th>
                                <th className="px-6 py-4 text-right">Valor usado</th>
                                <th className="px-6 py-4 text-right">Valor total</th>
                                <th className="px-6 py-4 text-center pr-8 w-24">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 text-[13px] text-slate-700">
                            {loading ? (
                                <tr>
                                    <td colSpan="7" className="px-8 py-20 text-center">
                                        <div className="flex flex-col items-center gap-4">
                                            <div className="w-10 h-10 border-4 border-[#8cc33f] border-t-transparent rounded-full animate-spin" />
                                            <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Cargando saldos...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredBalances.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="px-8 py-20 text-center text-slate-400 italic">
                                        No se encontraron terceros con saldo a favor registrado.
                                    </td>
                                </tr>
                            ) : (
                                <>
                                    {filteredBalances.map(item => (
                                        <tr key={item.id} className="hover:bg-slate-50/30 transition-colors">
                                            <td className="px-6 py-4 pl-8 font-semibold text-slate-500">
                                                {formatDateOnly(item.fecha)}
                                            </td>
                                            <td className="px-6 py-4 font-bold text-slate-800 uppercase tracking-tight">
                                                {item.nombre}
                                            </td>
                                            <td className="px-6 py-4 font-bold text-slate-500">
                                                {item.documento}
                                            </td>
                                            <td className="px-6 py-4 text-right font-black text-emerald-600 font-mono">
                                                {fmt(item.valorDisponible)}
                                            </td>
                                            <td className="px-6 py-4 text-right font-bold text-rose-500 font-mono">
                                                {fmt(item.valorUsado)}
                                            </td>
                                            <td className="px-6 py-4 text-right font-black text-slate-900 font-mono">
                                                {fmt(item.valorTotal)}
                                            </td>
                                            <td className="px-6 py-4 text-center pr-8">
                                                <button 
                                                    className="w-8 h-8 rounded-lg bg-slate-50 text-slate-400 hover:bg-blue-50 hover:text-blue-600 flex items-center justify-center transition-all shadow-sm mx-auto"
                                                    title="Ver historial"
                                                    onClick={() => navigate(`/dashboard/paciente/${item.id}?tab=pagos`)}
                                                >
                                                    <FiPrinter size={14} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {/* Totals Row */}
                                    <tr className="bg-slate-50 font-black text-slate-800 text-[13px] border-t border-slate-200">
                                        <td colSpan="3" className="px-6 py-4 pl-8 text-right uppercase">Totales</td>
                                        <td className="px-6 py-4 text-right text-emerald-600 font-mono">{fmt(columnTotals.disponible)}</td>
                                        <td className="px-6 py-4 text-right text-rose-500 font-mono">{fmt(columnTotals.usado)}</td>
                                        <td className="px-6 py-4 text-right text-slate-900 font-mono">{fmt(columnTotals.total)}</td>
                                        <td></td>
                                    </tr>
                                </>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

        </div>
    );
}
