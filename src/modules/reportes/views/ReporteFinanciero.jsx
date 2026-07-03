import React, { useState, useEffect } from "react";
import { useAuth } from "../../../context/AuthContext";
import { db } from "../../../firebase/firebaseConfig";
import { collection, getDocs, orderBy, query, where } from "firebase/firestore";
import { FiDollarSign, FiDownload, FiSearch, FiArrowUpRight, FiArrowDownRight, FiActivity } from "react-icons/fi";
import { format } from "date-fns";

const fmt = (n) =>
  Number(n || 0).toLocaleString("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
});

const StatBox = ({ title, value, icon: Icon, color, bg }) => (
  <div className="bg-white rounded-[24px] border border-slate-100 shadow-[0_8px_30px_rgba(0,0,0,0.02)] p-5 flex items-center gap-4 hover:shadow-md transition-shadow">
    <div className={`w-14 h-14 rounded-[18px] flex items-center justify-center text-2xl ${bg} ${color}`}>
      <Icon />
    </div>
    <div className="min-w-0">
      <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1 truncate">{title}</h4>
      <div className={`text-2xl font-black ${color} leading-none truncate`}>{value}</div>
    </div>
  </div>
);

export default function ReporteFinanciero() {
  const { userProfile } = useAuth();
  const [facturas, setFacturas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [stats, setStats] = useState({
    ingresoTotal: 0,
    carteraTotal: 0,
    volumen: 0
  });

  useEffect(() => {
    const fetchData = async () => {
      if (!userProfile?.inquilino) return;
      setLoading(true);
      try {
        const q = query(collection(db, "facturas"), where("inquilino", "==", userProfile.inquilino));
        const snapshot = await getDocs(q);
        
        const data = [];
        let ingreso = 0;
        let cartera = 0;

        snapshot.forEach(doc => {
          const f = { id: doc.id, ...doc.data() };
          data.push(f);

          const monto = Number(f.monto) || 0;
          if (f.estado === "Pagada") {
               ingreso += monto;
          } else {
               cartera += monto;
          }
        });

        data.sort((a, b) => {
            const dateA = a.fecha?.seconds || 0;
            const dateB = b.fecha?.seconds || 0;
            return dateB - dateA;
        });

        setFacturas(data);
        setStats({
          ingresoTotal: ingreso,
          carteraTotal: cartera,
          volumen: data.length
        });
      } catch (error) {
        console.error("Error fetching facturas:", error);
      } finally {
        setLoading(false);
      }
    };

    if (userProfile?.inquilino) {
        fetchData();
    }
  }, [userProfile?.inquilino]);

  const filtered = facturas.filter(f => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      (f.pacienteNombre && f.pacienteNombre.toLowerCase().includes(term)) ||
      (f.idFactura && f.idFactura.toLowerCase().includes(term)) ||
      (f.codigoCDE && f.codigoCDE.toLowerCase().includes(term))
    );
  });

  const exportCSV = () => {
    if (filtered.length === 0) return;
    const headers = ["Documento", "Paciente", "Descripcion", "Fecha", "Monto COP", "Estado"];
    const rows = filtered.map(f => [
      f.idFactura || f.id,
      `"${(f.pacienteNombre || "").replace(/"/g, "'")}"`,
      `"${(f.descripcion || "Facturación médica").replace(/"/g, "'")}"`,
      f.fecha?.toDate ? format(f.fecha.toDate(), "dd/MM/yyyy") : "—",
      Number(f.monto || 0),
      f.estado || "Pendiente"
    ]);
    const csv = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `reporte_financiero_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header and Actions */}
      <div className="bg-white rounded-[32px] border border-slate-100 shadow-[0_8px_30px_rgba(0,0,0,0.02)] p-4 flex items-center justify-between gap-4 shrink-0 mb-6 mx-2 mt-2">
        <div className="flex items-center gap-4 bg-slate-50 p-2 rounded-[24px] border border-slate-100">
          <div className="px-6 font-black text-slate-400 uppercase tracking-widest text-[11px]">
            Auditoría Financiera
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative group">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-600 transition-colors" size={16} />
            <input
              type="text"
              placeholder="Buscar factura o paciente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-10 pl-11 pr-4 rounded-full border border-slate-200 text-[12px] outline-none w-[240px] bg-slate-50 text-slate-700 focus:bg-white focus:border-emerald-500 transition-all font-bold placeholder:text-slate-400"
            />
          </div>
          <button
            onClick={exportCSV}
            className="flex items-center gap-2 px-6 py-3 rounded-full bg-slate-800 text-white hover:bg-slate-700 font-black text-[11px] uppercase tracking-[0.1em] transition-all shadow-lg shadow-slate-200"
          >
            <FiDownload size={16} />
            <span>Exportar CSV</span>
          </button>
        </div>
      </div>

      {/* Main Form */}
      <div className="flex-1 overflow-y-auto custom-scrollbar px-2 pb-20">
        {loading ? (
          <div className="flex flex-col items-center justify-center p-20 text-slate-400">
             <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4" />
             <div className="text-[13px] font-bold">Generando auditoría financiera...</div>
          </div>
        ) : (
          <div className="space-y-6">
            
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatBox 
                title="Volumen Facturas" 
                value={stats.volumen} 
                icon={FiActivity} 
                color="text-indigo-600" 
                bg="bg-indigo-50" 
              />
              <StatBox 
                title="Ingreso Consolidado" 
                value={fmt(stats.ingresoTotal)} 
                icon={FiArrowUpRight} 
                color="text-emerald-600" 
                bg="bg-emerald-50" 
              />
              <StatBox 
                title="Cartera por Recuperar" 
                value={fmt(stats.carteraTotal)} 
                icon={FiArrowDownRight} 
                color="text-rose-600" 
                bg="bg-rose-50" 
              />
            </div>

            {/* Detailed Table Box */}
            <div className="bg-white rounded-[32px] border border-slate-100 shadow-[0_8px_30px_rgba(0,0,0,0.02)] overflow-hidden">
              <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight flex items-center gap-2">
                   Libro de Transacciones Históricas
                   <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">{filtered.length} Doc.</span>
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Documento</th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Paciente</th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Fecha Emisión</th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 text-right">Monto</th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 text-center">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {filtered.map((f) => (
                      <tr key={f.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4 border-b border-slate-50">
                          <div className="font-black text-slate-800 text-[12px]">{f.idFactura || f.id}</div>
                          {f.codigoCDE && <div className="text-[10px] font-bold text-slate-400 mt-1">CDE: {f.codigoCDE}</div>}
                        </td>
                        <td className="px-6 py-4 border-b border-slate-50">
                          <div className="font-bold text-slate-700 text-[13px]">{f.pacienteNombre || "—"}</div>
                          <div className="text-[11px] font-medium text-slate-400">{f.descripcion || "Facturación médica"}</div>
                        </td>
                        <td className="px-6 py-4 text-[12px] font-semibold text-slate-500 border-b border-slate-50 whitespace-nowrap">
                           {f.fecha && f.fecha.toDate 
                              ? format(f.fecha.toDate(), 'dd MMM yyyy') 
                              : "—"
                           }
                        </td>
                        <td className="px-6 py-4 text-right border-b border-slate-50">
                          <div className="font-black text-[14px] text-slate-700">{fmt(f.monto)}</div>
                        </td>
                        <td className="px-6 py-4 border-b border-slate-50 text-center">
                          <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                              f.estado === "Pagada" 
                                ? "bg-emerald-50 text-emerald-600 border border-emerald-100" 
                                : "bg-rose-50 text-rose-600 border border-rose-100"
                          }`}>
                              {f.estado || "Pendiente"}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {filtered.length === 0 && (
                      <tr>
                        <td colSpan="5" className="px-6 py-10 text-center text-[12px] text-slate-400 font-bold">
                          No se encontraron transacciones
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
