import React, { useState, useEffect } from "react";
import { useAuth } from "../../../context/AuthContext";
import { db } from "../../../firebase/firebaseConfig";
import { collection, getDocs, orderBy, query, where } from "firebase/firestore";
import { FiCpu, FiDownload, FiSearch, FiShield, FiUserCheck } from "react-icons/fi";

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

export default function ReporteSistema() {
  const { userProfile } = useAuth();
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [stats, setStats] = useState({
    total: 0,
    admins: 0,
    activos: 0
  });

  useEffect(() => {
    const fetchData = async () => {
      if (!userProfile?.inquilino) return;
      setLoading(true);
      try {
        const q = query(collection(db, "usuarios"), where("inquilino", "==", userProfile.inquilino));
        const snapshot = await getDocs(q);
        
        const data = [];
        let admins = 0;
        let activos = 0;

        snapshot.forEach(doc => {
          const u = { id: doc.id, ...doc.data() };
          data.push(u);

          const rol = (u.rol || "").toLowerCase();
          if (rol === "admin" || rol === "superadmin") {
               admins++;
          }
          if (u.estado !== "inactivo") {
               activos++;
          }
        });

        setUsuarios(data);
        setStats({
          total: data.length,
          admins,
          activos
        });
      } catch (error) {
        console.error("Error fetching usuarios:", error);
      } finally {
        setLoading(false);
      }
    };

    if (userProfile?.inquilino) {
        fetchData();
    }
  }, [userProfile?.inquilino]);

  const filtered = usuarios.filter(u => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      (u.nombre && u.nombre.toLowerCase().includes(term)) ||
      (u.email && u.email.toLowerCase().includes(term)) ||
      (u.rol && u.rol.toLowerCase().includes(term))
    );
  });

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header and Actions */}
      <div className="bg-white rounded-[32px] border border-slate-100 shadow-[0_8px_30px_rgba(0,0,0,0.02)] p-4 flex items-center justify-between gap-4 shrink-0 mb-6 mx-2 mt-2">
        <div className="flex items-center gap-4 bg-slate-50 p-2 rounded-[24px] border border-slate-100">
          <div className="px-6 font-black text-slate-400 uppercase tracking-widest text-[11px]">
            Logs de Plataforma y Aforo
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative group">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={16} />
            <input
              type="text"
              placeholder="Buscar personal..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-10 pl-11 pr-4 rounded-full border border-slate-200 text-[12px] outline-none w-[240px] bg-slate-50 text-slate-700 focus:bg-white focus:border-indigo-500 transition-all font-bold placeholder:text-slate-400"
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
             <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4" />
             <div className="text-[13px] font-bold">Auditando accesos de sistema...</div>
          </div>
        ) : (
          <div className="space-y-6">
            
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatBox 
                title="Usuarios Registrados" 
                value={stats.total} 
                icon={FiUserCheck} 
                color="text-indigo-600" 
                bg="bg-indigo-50" 
              />
              <StatBox 
                title="Cuentas Activas" 
                value={stats.activos} 
                icon={FiCpu} 
                color="text-emerald-600" 
                bg="bg-emerald-50" 
              />
              <StatBox 
                title="Privilegios Admin" 
                value={stats.admins} 
                icon={FiShield} 
                color="text-purple-600" 
                bg="bg-purple-50" 
              />
            </div>

            {/* Detailed Table Box */}
            <div className="bg-white rounded-[32px] border border-slate-100 shadow-[0_8px_30px_rgba(0,0,0,0.02)] overflow-hidden">
              <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight flex items-center gap-2">
                   Directorio de Acceso al Sistema
                   <span className="text-[10px] bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">{filtered.length} Cuentas</span>
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Usuario</th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Email (ID)</th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 text-center">Rol de Acceso</th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 text-center">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {filtered.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4 border-b border-slate-50">
                          <div className="font-bold text-slate-800 text-[13px]">{u.nombre || "Sin Nombre"}</div>
                          {u.telefono && <div className="text-[10px] font-medium text-slate-400 mt-1">{u.telefono}</div>}
                        </td>
                        <td className="px-6 py-4 border-b border-slate-50">
                          <div className="font-semibold text-slate-600 text-[12px]">{u.email || "—"}</div>
                        </td>
                        <td className="px-6 py-4 border-b border-slate-50 text-center">
                           <span className="inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-slate-100 text-slate-600">
                              {u.rol || "Usuario"}
                           </span>
                        </td>
                        <td className="px-6 py-4 border-b border-slate-50 text-center">
                          <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                              u.estado === "inactivo"
                                ? "bg-rose-50 text-rose-600 border border-rose-100"
                                : "bg-emerald-50 text-emerald-600 border border-emerald-100"
                          }`}>
                              {u.estado === "inactivo" ? "Inactivo" : "Activa"}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {filtered.length === 0 && (
                      <tr>
                        <td colSpan="4" className="px-6 py-10 text-center text-[12px] text-slate-400 font-bold">
                          No se encontraron usuarios
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
