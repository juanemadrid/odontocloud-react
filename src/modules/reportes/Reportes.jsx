import React, { useState } from "react";
import { 
  FiPieChart, FiUsers, FiFileText, FiDollarSign, FiAward, 
  FiTrendingUp, FiBox, FiGift, FiActivity, FiChevronDown, 
  FiChevronRight, FiList, FiClock, FiAlertTriangle, FiMessageSquare, 
  FiMonitor, FiHelpCircle, FiDatabase 
} from "react-icons/fi";

import Indicadores from "./views/Indicadores";
import ReportePacientes from "./views/ReportePacientes";
import ReportePlanesTratamiento from "./views/ReportePlanesTratamiento";
import ReporteFinanciero from "./views/ReporteFinanciero";
import ReporteConvenios from "./views/ReporteConvenios";
import ReporteVentasEfectividad from "./views/ReporteVentasEfectividad";
import ReporteMedicamentos from "./views/ReporteMedicamentos";
import ReporteCumpleanos from "./views/ReporteCumpleanos";
import ReporteOportunidadCitas from "./views/ReporteOportunidadCitas";
import ReporteMorbilidad from "./views/ReporteMorbilidad";
import ReporteConsultas from "./views/ReporteConsultas";
import ReporteEvoluciones from "./views/ReporteEvoluciones";
import ReporteLogErroresFacturacion from "./views/ReporteLogErroresFacturacion";
import ReporteLogWhatsApp from "./views/ReporteLogWhatsApp";
import ReporteUsoPlataforma from "./views/ReporteUsoPlataforma";
import ReporteAsistenciaClientes from "./views/ReporteAsistenciaClientes";
import ReporteLogInteroperabilidad from "./views/ReporteLogInteroperabilidad";
import ReporteClinico from "./views/ReporteClinico";
import ReporteSistema from "./views/ReporteSistema";
import ReporteIA from "./views/ReporteIA";

const MAIN_ITEMS = [
  { id: "indicadores", label: "Indicadores", icon: <FiPieChart /> },
  { id: "pacientes", label: "Reporte pacientes", icon: <FiUsers /> },
  { id: "planes_tratamiento", label: "Reporte planes de tratamiento", icon: <FiFileText /> },
  { id: "facturacion", label: "Reporte de facturación", icon: <FiDollarSign /> },
  { id: "convenios", label: "Reporte de convenios", icon: <FiAward /> },
  { id: "ventas_efectividad", label: "Reporte de ventas y efectividad", icon: <FiTrendingUp /> },
  { id: "medicamentos", label: "Reporte medicamentos", icon: <FiBox /> },
  { id: "cumpleanos", label: "Reporte cumpleaños", icon: <FiGift /> },
  { 
    id: "clinico", 
    label: "Reportes clínicos", 
    icon: <FiActivity />,
    children: [
      { id: "oportunidad_citas", label: "Reporte de oportunidad de citas", icon: <FiClock /> },
      { id: "morbilidad", label: "Reporte de morbilidad", icon: <FiActivity /> }
    ]
  },
];

const MORE_ITEMS = [
  { id: "consultas", label: "Reporte de consultas", icon: <FiList /> },
  { id: "evoluciones", label: "Reporte de evoluciones", icon: <FiClock /> },
  { id: "log_errores_facturacion", label: "Log de errores de facturación", icon: <FiAlertTriangle /> },
  { id: "log_whatsapp", label: "Log WhatsApp Business API", icon: <FiMessageSquare /> },
  { id: "uso_plataforma", label: "Indicadores de uso de la plataforma", icon: <FiMonitor /> },
  { id: "asistencia_clientes", label: "Asistencia de clientes", icon: <FiHelpCircle /> },
  { id: "log_ihce", label: "Log interoperabilidad (IHCE)", icon: <FiDatabase /> },
];

export default function Reportes() {
  const [activeMenu, setActiveMenu] = useState("indicadores");
  const [openMore, setOpenMore] = useState({ clinico: true, more: false });
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="flex flex-col bg-slate-50 h-[calc(100vh-60px)] overflow-hidden">
      
      {/* CONTENT ROW (Sidebar + View) */}
      <div className="flex flex-1 min-h-0 px-2 md:px-4 lg:px-6 py-3 relative animate-fadeIn">
      
        {/* ─── SIDEBAR INTELIGENTE (ANCHO / SOLO ÍCONOS COMPACTO) ─── */}
        <aside className={`no-print ${sidebarCollapsed ? 'w-[60px]' : 'w-[250px]'} shrink-0 bg-white border-r border-slate-100 rounded-l-2xl shadow-sm flex flex-col py-4 z-10 transition-all duration-300 relative`}>
          <div className="px-3 pb-3 flex items-center justify-between">
            {!sidebarCollapsed && (
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider truncate">
                Menú de Reportes
              </span>
            )}
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="p-1 rounded bg-slate-50 hover:bg-slate-100 text-slate-500 text-xs transition-colors mx-auto"
              title={sidebarCollapsed ? "Expandir Menú" : "Colapsar a solo íconos"}
            >
              {sidebarCollapsed ? <FiChevronRight size={14} /> : <FiChevronRight size={14} className="rotate-180" />}
            </button>
          </div>

          <div className="px-2 flex-1 overflow-y-auto custom-scrollbar space-y-1">
            {MAIN_ITEMS.map((item) => {
              const isActive = activeMenu === item.id || (item.children && item.children.some(c => c.id === activeMenu));
              
              if (item.children && !sidebarCollapsed) {
                return (
                  <div key={item.id} className="relative">
                    <button
                      onClick={() => setOpenMore(prev => ({ ...prev, [item.id]: !prev[item.id] }))}
                      className={`w-full flex items-center justify-between px-3 py-2 text-[11px] font-bold transition-all rounded-xl border border-transparent text-left ${
                        isActive 
                          ? "bg-sky-50 text-sky-700 border-sky-100 shadow-sm font-black" 
                          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <span className={`text-[15px] ${isActive ? "text-sky-600" : "text-slate-400"}`}>{item.icon}</span>
                        <span className="truncate">{item.label}</span>
                      </div>
                      <FiChevronRight size={13} className={`text-slate-400 transition-transform ${openMore[item.id] ? "rotate-90 text-sky-600" : ""}`} />
                    </button>

                    {openMore[item.id] && (
                      <div className="pl-3 pr-1 py-1 space-y-1 border-l-2 border-slate-100 ml-2 mt-1 animate-fadeIn">
                        {item.children.map((subItem) => {
                          const isSubActive = activeMenu === subItem.id;
                          return (
                            <button
                              key={subItem.id}
                              onClick={() => setActiveMenu(subItem.id)}
                              className={`w-full flex items-center gap-2 px-2.5 py-1.5 text-[10px] font-bold transition-all rounded-lg border border-transparent text-left ${
                                isSubActive 
                                  ? "bg-sky-100 text-sky-800 font-black border-sky-200" 
                                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                              }`}
                            >
                              <span className={`text-[12px] ${isSubActive ? "text-sky-600" : "text-slate-400"}`}>{subItem.icon}</span>
                              <span className="truncate">{subItem.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              }

              return (
                <button
                  key={item.id}
                  onClick={() => setActiveMenu(item.id)}
                  title={sidebarCollapsed ? item.label : ""}
                  className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center px-0' : 'gap-2.5 px-3'} py-2 text-[11px] font-bold transition-all rounded-xl border border-transparent text-left ${
                    isActive 
                      ? "bg-sky-50 text-sky-700 border-sky-100 shadow-sm font-black" 
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <span className={`text-[16px] ${isActive ? "text-sky-600" : "text-slate-400"}`}>{item.icon}</span>
                  {!sidebarCollapsed && <span className="truncate">{item.label}</span>}
                </button>
              );
            })}

            {!sidebarCollapsed && (
              <div className="pt-2">
                <button
                  onClick={() => setOpenMore(prev => ({ ...prev, more: !prev.more }))}
                  className="w-full flex items-center justify-between px-3 py-2 text-[11px] font-black text-slate-500 hover:bg-slate-50 rounded-xl transition-all uppercase tracking-wider"
                >
                  <div className="flex items-center gap-2">
                    <FiList className="text-sky-500" />
                    <span>Más reportes</span>
                  </div>
                  {openMore.more ? <FiChevronDown size={13} /> : <FiChevronRight size={13} />}
                </button>

                {openMore.more && (
                  <div className="pl-3 pr-1 py-1 space-y-1 border-l-2 border-slate-100 ml-2 mt-1">
                    {MORE_ITEMS.map((item) => {
                      const isActive = activeMenu === item.id;
                      return (
                        <button
                          key={item.id}
                          onClick={() => setActiveMenu(item.id)}
                          className={`w-full flex items-center gap-2 px-2.5 py-1.5 text-[10px] font-bold transition-all rounded-lg border border-transparent text-left ${
                            isActive 
                              ? "bg-sky-50 text-sky-700 font-black border-sky-100" 
                              : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                          }`}
                        >
                          <span className={`text-[12px] ${isActive ? "text-sky-600" : "text-slate-400"}`}>{item.icon}</span>
                          <span className="truncate">{item.label}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </aside>

        {/* ─── MAIN CONTENT ─── */}
        <div className="flex-1 flex flex-col min-w-0 bg-slate-50 overflow-hidden pl-3">
          {activeMenu === "indicadores" && <Indicadores />}
          {activeMenu === "pacientes" && <ReportePacientes />}
          {activeMenu === "planes_tratamiento" && <ReportePlanesTratamiento />}
          {activeMenu === "facturacion" && <ReporteFinanciero />}
          {activeMenu === "convenios" && <ReporteConvenios />}
          {activeMenu === "ventas_efectividad" && <ReporteVentasEfectividad />}
          {activeMenu === "medicamentos" && <ReporteMedicamentos />}
          {activeMenu === "cumpleanos" && <ReporteCumpleanos />}
          {activeMenu === "oportunidad_citas" && <ReporteOportunidadCitas />}
          {activeMenu === "morbilidad" && <ReporteMorbilidad />}
          {activeMenu === "consultas" && <ReporteConsultas />}
          {activeMenu === "evoluciones" && <ReporteEvoluciones />}
          {activeMenu === "log_errores_facturacion" && <ReporteLogErroresFacturacion />}
          {activeMenu === "log_whatsapp" && <ReporteLogWhatsApp />}
          {activeMenu === "uso_plataforma" && <ReporteUsoPlataforma />}
          {activeMenu === "asistencia_clientes" && <ReporteAsistenciaClientes />}
          {activeMenu === "log_ihce" && <ReporteLogInteroperabilidad />}
          {activeMenu === "clinico" && <ReporteClinico />}
          {activeMenu === "sistema" && <ReporteSistema />}
          {activeMenu === "ia" && <ReporteIA />}
        </div>
      </div>
    </div>
  );
}
