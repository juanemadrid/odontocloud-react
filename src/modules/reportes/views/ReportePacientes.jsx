import React, { useState, useEffect } from "react";
import { useAuth } from "../../../context/AuthContext";
import { db } from "../../../firebase/firebaseConfig";
import { collection, getDocs, orderBy, query, where } from "firebase/firestore";
import { FiUsers, FiUserPlus, FiActivity, FiDownload, FiSearch } from "react-icons/fi";
import { format } from "date-fns";

const StatBox = ({ title, value, icon: Icon, color, bg }) => (
  <div className="bg-white rounded-[24px] border border-slate-100 shadow-[0_8px_30px_rgba(0,0,0,0.02)] p-5 flex items-center gap-4 hover:shadow-md transition-shadow">
    <div className={`w-14 h-14 rounded-[18px] flex items-center justify-center text-2xl ${bg} ${color}`}>
      <Icon />
    </div>
    <div>
      <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{title}</h4>
      <div className={`text-2xl font-black ${color} leading-none`}>{value}</div>
    </div>
  </div>
);

export default function ReportePacientes() {
  const { userProfile } = useAuth();
  const [pacientes, setPacientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [stats, setStats] = useState({
    total: 0,
    recientes: 0,
    conEmail: 0
  });

  useEffect(() => {
    const fetchPacientes = async () => {
      if (!userProfile?.inquilino) return;
      setLoading(true);
      try {
        const q = query(
          collection(db, "pacientes"), 
          where("inquilino", "==", userProfile.inquilino)
          // Removing orderBy temporarily because combining where on 'inquilino' and orderBy on 'fechaCreacion' might require a composite index that isn't created yet in Firebase for this specific tenant, avoiding index errors.
        );
        const snapshot = await getDocs(q);
        
        const data = [];
        let recientes = 0;
        let conEmail = 0;
        const now = new Date();
        const thirtyDaysAgo = new Date(now.setDate(now.getDate() - 30));

        snapshot.forEach(doc => {
          const p = { id: doc.id, ...doc.data() };
          data.push(p);

          // Calculate stats
          if (p.fechaCreacion && p.fechaCreacion.toDate) {
            if (p.fechaCreacion.toDate() > thirtyDaysAgo) recientes++;
          } else if (p.fechaCreacion) {
               // Fallback if string
               const d = new Date(p.fechaCreacion);
               if (d > thirtyDaysAgo) recientes++;
          }

          if (p.email && p.email.trim() !== '') conEmail++;
        });

        // Ordenar local
        data.sort((a, b) => {
            const dateA = a.fechaCreacion?.seconds || 0;
            const dateB = b.fechaCreacion?.seconds || 0;
            return dateB - dateA;
        });

        setPacientes(data);
        setStats({
          total: data.length,
          recientes,
          conEmail
        });
      } catch (error) {
        console.error("Error fetching pacientes:", error);
      } finally {
        setLoading(false);
      }
    };

    if (userProfile?.inquilino) {
        fetchPacientes();
    }
  }, [userProfile?.inquilino]);

  const filteredPacientes = pacientes.filter(p => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      (p.nombre && p.nombre.toLowerCase().includes(term)) ||
      (p.identificacion && p.identificacion.toLowerCase().includes(term)) ||
      (p.email && p.email.toLowerCase().includes(term))
    );
  });

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header and Actions */}
      <div className="bg-white rounded-[32px] border border-slate-100 shadow-[0_8px_30px_rgba(0,0,0,0.02)] p-4 flex items-center justify-between gap-4 shrink-0 mb-6 mx-2 mt-2">
        <div className="flex items-center gap-4 bg-slate-50 p-2 rounded-[24px] border border-slate-100">
          <div className="px-6 font-black text-slate-400 uppercase tracking-widest text-[11px]">
            Auditoría de Pacientes
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative group">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={16} />
            <input
              type="text"
              placeholder="Buscar en el reporte..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-10 pl-11 pr-4 rounded-full border border-slate-200 text-[12px] outline-none w-[220px] bg-slate-50 text-slate-700 focus:bg-white focus:border-blue-500 transition-all font-bold placeholder:text-slate-400"
            />
          </div>
          <button
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
             <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
             <div className="text-[13px] font-bold">Generando reporte demográfico...</div>
          </div>
        ) : (
          <div className="space-y-6">
            
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatBox 
                title="Volumen Histórico" 
                value={stats.total} 
                icon={FiUsers} 
                color="text-indigo-600" 
                bg="bg-indigo-50" 
              />
              <StatBox 
                title="Captación (30 Días)" 
                value={stats.recientes} 
                icon={FiUserPlus} 
                color="text-emerald-600" 
                bg="bg-emerald-50" 
              />
              <StatBox 
                title="Cobertura Digital (Email)" 
                value={`${Math.round((stats.conEmail / (stats.total || 1)) * 100)}%`} 
                icon={FiActivity} 
                color="text-purple-600" 
                bg="bg-purple-50" 
              />
            </div>

            {/* Detailed Table Box */}
            <div className="bg-white rounded-[32px] border border-slate-100 shadow-[0_8px_30px_rgba(0,0,0,0.02)] overflow-hidden">
              <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight flex items-center gap-2">
                   Directorio Consolidado
                   <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">{filteredPacientes.length} Registros</span>
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Paciente</th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Identificación</th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Contacto</th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Fecha Reg.</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {filteredPacientes.map((p) => (
                      <tr key={p.id} className="hover:bg-blue-50/50 transition-colors">
                        <td className="px-6 py-4 border-b border-slate-50">
                          <div className="font-bold text-slate-800 text-[13px]">{p.nombre || "Sin Nombre"}</div>
                          {p.sucursal && <div className="text-[10px] font-bold uppercase tracking-widest text-indigo-500 mt-1">{p.sucursal}</div>}
                        </td>
                        <td className="px-6 py-4 text-[12px] font-medium text-slate-600 border-b border-slate-50">
                          {p.identificacion || "—"}
                        </td>
                        <td className="px-6 py-4 border-b border-slate-50">
                          <div className="text-[12px] font-semibold text-slate-700">{p.telefono || "—"}</div>
                          <div className="text-[11px] text-slate-400 truncate max-w-[150px]">{p.email || "—"}</div>
                        </td>
                        <td className="px-6 py-4 text-[12px] font-semibold text-slate-500 border-b border-slate-50 whitespace-nowrap">
                           {p.fechaCreacion && p.fechaCreacion.toDate 
                              ? format(p.fechaCreacion.toDate(), 'dd MMM yyyy') 
                              : p.fechaCreacion 
                                 ? format(new Date(p.fechaCreacion), 'dd MMM yyyy') 
                                 : "—"
                           }
                        </td>
                      </tr>
                    ))}
                    {filteredPacientes.length === 0 && (
                      <tr>
                        <td colSpan="4" className="px-6 py-10 text-center text-[12px] text-slate-400 font-bold">
                          No se encontraron pacientes
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
