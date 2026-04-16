import React, { useState, useEffect } from "react";
import { FiPlus, FiFilter, FiCalendar, FiSearch, FiPrinter, FiEdit2, FiTrash2, FiFileText } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { collection, query, where, getDocs, orderBy, Timestamp } from "firebase/firestore";
import { db } from "../../../firebase/firebaseConfig";
import { useAuth } from "../../../context/AuthContext";

/* --- Formatting Helpers --- */
const fmt = (n) =>
  Number(n || 0).toLocaleString("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  });

const fmtDate = (ts) => {
  if (!ts) return "—";
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleDateString("es-CO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  });
};

export default function ReciboCajaList({ onNew }) {
    const navigate = useNavigate();
    const { userProfile } = useAuth();
    const inquilino = userProfile?.inquilino || "";

    const [loading, setLoading] = useState(true);
    const [recibos, setRecibos] = useState([]);
    
    // Filters
    const [fechaInicio, setFechaInicio] = useState(() => {
        const d = new Date();
        d.setDate(d.getDate() - 30);
        return d.toISOString().split('T')[0];
    });
    const [fechaFin, setFechaFin] = useState(new Date().toISOString().split('T')[0]);
    const [searchTerm, setSearchTerm] = useState("");

    const loadData = async () => {
        if (!inquilino) return;
        setLoading(true);
        try {
            const start = new Date(fechaInicio);
            start.setHours(0,0,0,0);
            const end = new Date(fechaFin);
            end.setHours(23,59,59,999);

            const q = query(
                collection(db, "recibos_caja"),
                where("inquilino", "==", inquilino),
                where("fecha", ">=", Timestamp.fromDate(start)),
                where("fecha", "<=", Timestamp.fromDate(end))
                // Note: requires composite index. For now, client-side filter if it fails or use a simpler query.
            );
            
            const snap = await getDocs(q);
            const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
            
            // Sort client-side for safety (avoid composite index requirement immediately)
            data.sort((a, b) => (b.fecha?.seconds || 0) - (a.fecha?.seconds || 0));
            
            setRecibos(data);
        } catch (e) {
            console.error("Error cargando recibos:", e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [inquilino]);

    const filteredRecibos = recibos.filter(r => 
        (r.pacienteNombre || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (r.id || "").toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="flex flex-col gap-6 p-4 md:p-8 max-w-[1600px] mx-auto min-h-screen">
            
            {/* ELITE HEADER (Compact) */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-6 rounded-[28px] border border-slate-100 shadow-sm transition-all">
                <div className="space-y-1">
                    <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight leading-none">
                        Gestión de <span className="text-blue-600">Recibos</span>
                    </h2>
                    <p className="text-[12px] font-medium text-slate-400">Control de ingresos y comprobantes de pago institucionales.</p>
                </div>
                
                <button 
                  onClick={onNew}
                  className="h-11 px-6 flex items-center gap-3 bg-lime-500 text-white rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-lime-600 shadow-lg shadow-lime-500/20 transition-all active:scale-95"
                >
                  <FiPlus size={16} /> + Recibo de caja
                </button>
            </div>

            {/* FILTERS BAR */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-white p-6 rounded-[24px] border border-slate-100 shadow-sm">
                <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Fecha Inicial</label>
                    <div className="relative">
                        <FiCalendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input 
                            type="date" 
                            className="w-full h-12 pl-12 pr-4 bg-slate-50 border border-slate-100 rounded-xl text-[13px] font-bold text-slate-600 outline-none focus:bg-white focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 transition-all"
                            value={fechaInicio}
                            onChange={e => setFechaInicio(e.target.value)}
                        />
                    </div>
                </div>

                <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Fecha Final</label>
                    <div className="relative">
                        <FiCalendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input 
                            type="date" 
                            className="w-full h-12 pl-12 pr-4 bg-slate-50 border border-slate-100 rounded-xl text-[13px] font-bold text-slate-600 outline-none focus:bg-white focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 transition-all"
                            value={fechaFin}
                            onChange={e => setFechaFin(e.target.value)}
                        />
                    </div>
                </div>

                <div className="md:col-span-1 flex items-end">
                    <button 
                        onClick={loadData}
                        className="h-12 w-full flex items-center justify-center gap-2 bg-lime-600 text-white rounded-xl text-[12px] font-black uppercase tracking-widest hover:bg-lime-700 transition-all active:scale-95 shadow-md shadow-lime-200"
                    >
                        <FiSearch /> Buscar
                    </button>
                </div>

                <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Filtro rápido</label>
                    <div className="relative">
                        <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input 
                            type="text" 
                            placeholder="Paciente o folio..."
                            className="w-full h-12 pl-12 pr-4 bg-white border border-slate-200 rounded-xl text-[13px] font-bold text-slate-600 outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 transition-all"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* TABLE CONTAINER */}
            <div className="bg-white rounded-[32px] border border-slate-100 shadow-[0_12px_40px_-15px_rgba(0,0,0,0.03)] overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100">
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Recibo #</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Fecha</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Paciente</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Condición</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Total</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="px-8 py-20 text-center">
                                        <div className="flex flex-col items-center gap-4">
                                            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                                            <span className="text-[13px] font-black text-slate-400 uppercase tracking-widest">Sincronizando recibos...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredRecibos.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-8 py-32 text-center">
                                        <div className="bg-slate-50 rounded-[40px] px-10 py-16 inline-flex flex-col items-center gap-6 max-w-sm">
                                            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-sm">
                                                <FiPlus size={40} className="text-slate-200" />
                                            </div>
                                            <div className="space-y-2">
                                                <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">Sin registros</h3>
                                                <p className="text-[13px] font-medium text-slate-500 leading-relaxed">No se encontraron recibos de caja para este periodo. Comienza creando uno nuevo.</p>
                                            </div>
                                            <button 
                                                onClick={onNew}
                                                className="h-12 px-8 bg-lime-600 text-white rounded-2xl text-[12px] font-black uppercase tracking-widest shadow-lg shadow-lime-500/20"
                                            >
                                                Nuevo Recibo
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredRecibos.map(r => (
                                    <tr key={r.id} className="hover:bg-blue-50/10 transition-colors group">
                                        <td className="px-8 py-6">
                                            <span className="text-[14px] font-black text-slate-800 font-mono tracking-tighter">#{r.id.slice(0,8).toUpperCase()}</span>
                                        </td>
                                        <td className="px-8 py-6 text-[13px] font-bold text-slate-500 uppercase tracking-wide">
                                            {fmtDate(r.fecha)}
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex flex-col font-black text-slate-800 text-[14px] uppercase tracking-tight">
                                                {r.pacienteNombre}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-[10px] font-black uppercase tracking-widest">
                                                {r.condicionPago || "Contado"}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <span className="text-[17px] font-black text-slate-900 tracking-tight">{fmt(r.total)}</span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button className="w-10 h-10 rounded-xl bg-slate-50 text-slate-400 hover:bg-blue-600 hover:text-white flex items-center justify-center transition-all">
                                                    <FiPrinter size={16} />
                                                </button>
                                                <button 
                                                  onClick={() => navigate(`editar/${r.id}`)}
                                                  className="w-10 h-10 rounded-xl bg-slate-50 text-slate-400 hover:bg-amber-500 hover:text-white flex items-center justify-center transition-all"
                                                >
                                                    <FiEdit2 size={16} />
                                                </button>
                                                <button className="w-10 h-10 rounded-xl bg-slate-50 text-slate-400 hover:bg-red-500 hover:text-white flex items-center justify-center transition-all">
                                                    <FiTrash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
