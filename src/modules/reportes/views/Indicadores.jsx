import React, { useState, useEffect } from "react";
import { useAuth } from "../../../context/AuthContext";
import { db } from "../../../firebase/firebaseConfig";
import { collection, getDocs, query, orderBy, limit, where } from "firebase/firestore";
import { FiTrendingUp, FiUsers, FiCalendar, FiDollarSign, FiActivity, FiFileText } from "react-icons/fi";

const KpiCard = ({ title, value, icon: Icon, color, trend }) => (
  <div className="bg-white rounded-[24px] border border-slate-100 shadow-[0_10px_30px_rgba(0,0,0,0.03)] p-6 relative overflow-hidden group hover:shadow-[0_20px_40px_rgba(0,0,0,0.06)] transition-all duration-500">
    <div className={`absolute top-0 right-0 p-4 opacity-10 group-hover:scale-150 transition-transform duration-700 ${color}`}>
      <Icon size={80} />
    </div>
    <div className="relative z-10">
      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center mb-4 ${color.replace('text-', 'bg-').replace('600', '50')} ${color}`}>
        <Icon size={20} />
      </div>
      <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1">{title}</h3>
      <div className="text-[28px] font-black text-slate-800 tracking-tight">{value}</div>
      {trend && (
        <div className="flex items-center gap-1 mt-2 text-[10px] font-bold text-emerald-500 uppercase tracking-wide">
          <FiTrendingUp /> {trend}
        </div>
      )}
    </div>
  </div>
);

export default function Indicadores() {
  const { userProfile } = useAuth();
  const [stats, setStats] = useState({
    pacientes: 0,
    citas: 0,
    facturado: 0,
    recaudado: 0,
    pendiente: 0
  });
  const [recentInvoices, setRecentInvoices] = useState([]);
  const [topTreatments, setTopTreatments] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadStats = async () => {
    if (!userProfile?.inquilino) return;
    try {
      setLoading(true);
      
      // 1. Pacientes
      const pacQ = query(collection(db, "pacientes"), where("inquilino", "==", userProfile.inquilino));
      const pacSnap = await getDocs(pacQ);
      const totalPacientes = pacSnap.size;

      // 2. Citas
      const citasQ = query(collection(db, "agenda"), where("inquilino", "==", userProfile.inquilino));
      const citasSnap = await getDocs(citasQ);
      const totalCitas = citasSnap.size;

      // 3. Facturación
      const factQ = query(collection(db, "facturas"), where("inquilino", "==", userProfile.inquilino));
      const factSnap = await getDocs(factQ); // Quitamos orderBy para la suma total, y parseamos local
      
      let totalFacturado = 0;
      let totalRecaudado = 0;

      let facturasData = [];
      factSnap.forEach(doc => {
        const data = doc.data();
        totalFacturado += data.monto || 0;
        if (data.estado === "Pagada") {
          totalRecaudado += data.monto || 0;
        }
        facturasData.push({ id: doc.id, ...data });
      });

      // Ordenar local para recent invoices
      facturasData.sort((a, b) => {
          const dateA = a.fecha?.seconds || 0;
          const dateB = b.fecha?.seconds || 0;
          return dateB - dateA;
      });
      const recent = facturasData.slice(0, 5);

      const totalPendiente = totalFacturado - totalRecaudado;

      // 4. Top Tratamientos (Business Intelligence)
      const qPlans = query(collection(db, "treatment_plans"), where("inquilino", "==", userProfile.inquilino));
      const snapPlans = await getDocs(qPlans);
      const treatmentCounts = {};
      
      snapPlans.docs.forEach(docPlan => {
          const data = docPlan.data();
          if (data.items && Array.isArray(data.items)) {
              data.items.forEach(item => {
                  if (!item.desc) return;
                  const name = item.desc;
                  const subtotal = (Number(item.amount) || 0) * (Number(item.qty) || 1);
                  if (!treatmentCounts[name]) {
                      treatmentCounts[name] = { name, total: 0 };
                  }
                  treatmentCounts[name].total += subtotal;
              });
          }
      });
      const topT = Object.values(treatmentCounts)
        .sort((a, b) => b.total - a.total)
        .slice(0, 5);

      setStats({
        pacientes: totalPacientes,
        citas: totalCitas,
        facturado: totalFacturado,
        recaudado: totalRecaudado,
        pendiente: totalPendiente
      });
      setRecentInvoices(recent);
      setTopTreatments(topT);

    } catch (error) {
      console.error("Error loading reports:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userProfile?.inquilino) {
      loadStats();
    }
  }, [userProfile?.inquilino]);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* HUD Toolbar */}
      <div className="bg-white rounded-[32px] border border-slate-100 shadow-[0_8px_30px_rgba(0,0,0,0.02)] p-4 flex items-center justify-between gap-4 shrink-0 mb-6 mx-2 mt-2">
        <div className="flex items-center gap-4 bg-slate-50 p-2 rounded-[24px] border border-slate-100">
          <div className="px-6 font-black text-slate-400 uppercase tracking-widest text-[11px]">
            Vista General de KPIs
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => loadStats()}
            className="flex items-center gap-2 px-6 py-3 rounded-full bg-slate-50 text-slate-500 hover:text-blue-600 hover:bg-blue-50 font-black text-[11px] uppercase tracking-[0.1em] transition-all"
          >
            <FiActivity size={16} />
            <span>Actualizar</span>
          </button>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar px-2 pb-20">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-slate-100 h-40 rounded-[40px]"></div>
            ))}
          </div>
        ) : (
          <div className="space-y-8">
            {/* KPI Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <KpiCard
                title="Total Pacientes"
                value={stats.pacientes}
                icon={FiUsers}
                color="text-blue-600"
                trend="Activos"
              />
              <KpiCard
                title="Citas Totales"
                value={stats.citas}
                icon={FiCalendar}
                color="text-purple-600"
                trend="Agendadas"
              />
              <KpiCard
                title="Facturación Histórica"
                value={`$${stats.facturado.toLocaleString()}`}
                icon={FiDollarSign}
                color="text-emerald-600"
                trend="Acumulado base"
              />
              <KpiCard
                title="Cartera Pendiente"
                value={`$${stats.pendiente.toLocaleString()}`}
                icon={FiActivity}
                color="text-amber-500"
              />
            </div>

            {/* Detailed Analytics */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Financial Health Chart */}
              <div className="lg:col-span-2 bg-white rounded-[40px] border border-slate-200/50 shadow-[0_20px_50px_rgba(0,0,0,0.03)] p-8 relative overflow-hidden">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h3 className="text-[16px] font-black text-slate-800 uppercase tracking-tight">Salud Financiera</h3>
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1">Recaudo vs Pendiente (Últimas 50 facturas)</p>
                  </div>
                  <div className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest border border-emerald-100">
                    Muestra Reciente
                  </div>
                </div>

                <div className="flex flex-col gap-6 mt-10">
                  {/* Recaudado Bar */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-[12px] font-black uppercase tracking-wider">
                      <span className="text-emerald-600">Ingresos Reales</span>
                      <span className="text-emerald-600">{Math.round((stats.recaudado / (stats.facturado || 1)) * 100)}%</span>
                    </div>
                    <div className="h-5 bg-emerald-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full shadow-[0_0_15px_rgba(16,185,129,0.4)] transition-all duration-1000"
                        style={{ width: `${(stats.recaudado / (stats.facturado || 1)) * 100}%` }}
                      ></div>
                    </div>
                    <div className="text-right text-[11px] font-bold text-slate-400">${stats.recaudado.toLocaleString()}</div>
                  </div>

                  {/* Pendiente Bar */}
                  <div className="space-y-2 mt-4">
                    <div className="flex justify-between text-[12px] font-black uppercase tracking-wider">
                      <span className="text-amber-500">Pendiente de Cobro</span>
                      <span className="text-amber-500">{Math.round((stats.pendiente / (stats.facturado || 1)) * 100)}%</span>
                    </div>
                    <div className="h-5 bg-amber-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-amber-500 rounded-full shadow-[0_0_15px_rgba(245,158,11,0.4)] transition-all duration-1000"
                        style={{ width: `${(stats.pendiente / (stats.facturado || 1)) * 100}%` }}
                      ></div>
                    </div>
                    <div className="text-right text-[11px] font-bold text-slate-400">${stats.pendiente.toLocaleString()}</div>
                  </div>
                </div>
              </div>

              {/* Recent Invoices Feed */}
              <div className="bg-white rounded-[40px] border border-slate-200/50 shadow-[0_20px_50px_rgba(0,0,0,0.03)] p-8 h-[400px] flex flex-col">
                <h3 className="text-[14px] font-black text-slate-800 uppercase tracking-tight mb-6 flex items-center gap-2">
                  <FiFileText className="text-indigo-500" /> Últimas Facturas
                </h3>

                <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 pr-2">
                  {recentInvoices.map(inv => (
                    <div key={inv.id} className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-white hover:shadow-md transition-all group">
                      <div className="min-w-0">
                        <div className="text-[12px] font-black text-slate-700 truncate">{inv.pacienteNombre}</div>
                        <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wide truncate">{inv.descripcion}</div>
                      </div>
                      <div className="text-right pl-2">
                        <div className="text-[12px] font-black text-indigo-600">${inv.monto?.toLocaleString()}</div>
                        <span className={`text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-md ${inv.estado === 'Pagada' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
                          {inv.estado}
                        </span>
                      </div>
                    </div>
                  ))}
                  {recentInvoices.length === 0 && (
                    <div className="text-center text-slate-400 text-xs py-10 font-medium">No hay facturas recientes</div>
                  )}
                </div>
              </div>
            </div>

            {/* Rentabilidad de Tratamientos */}
            <div className="bg-white rounded-[40px] border border-slate-200/50 shadow-[0_20px_50px_rgba(0,0,0,0.03)] p-8 relative overflow-hidden mt-8">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-[16px] font-black text-slate-800 uppercase tracking-tight">Análisis de Rentabilidad</h3>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1">Top 5 Tratamientos más cotizados según presupuestos</p>
                </div>
                <div className="bg-purple-50 text-purple-600 px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest border border-purple-100">
                  Business Intelligence
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {topTreatments.map((t, i) => (
                  <div key={i} className="bg-slate-50 p-4 rounded-2xl border border-slate-100 hover:scale-105 transition-transform duration-300">
                    <div className="text-[28px] font-black text-slate-200 mb-2 leading-none">#{i + 1}</div>
                    <div className="text-[11px] font-black text-slate-700 uppercase tracking-tight h-8 line-clamp-2 leading-tight">{t.name}</div>
                    <div className="mt-4 text-[16px] font-black text-emerald-600">${t.total.toLocaleString('es-CO')}</div>
                    <div className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-1">Cotizado/Presupuestado</div>
                  </div>
                ))}
                {topTreatments.length === 0 && (
                  <div className="col-span-5 text-center py-10 text-slate-400 font-bold text-sm">
                    No hay datos de presupuestos para analizar.
                  </div>
                )}
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
