import React, { useState } from "react";
import { FiPieChart, FiUsers, FiDollarSign, FiActivity, FiCpu } from "react-icons/fi";

import Indicadores from "./views/Indicadores";
import ReportePacientes from "./views/ReportePacientes";
import ReporteFinanciero from "./views/ReporteFinanciero";
import ReporteClinico from "./views/ReporteClinico";
import ReporteSistema from "./views/ReporteSistema";

const MENU_ITEMS = [
  { id: "indicadores", label: "General & KPIs", icon: <FiPieChart /> },
  { id: "pacientes", label: "Reporte Pacientes", icon: <FiUsers /> },
  { id: "financiero", label: "Depto. Financiero", icon: <FiDollarSign /> },
  { id: "clinico", label: "Eficiencia Clínica", icon: <FiActivity /> },
  { id: "sistema", label: "Logs de Plataforma", icon: <FiCpu /> },
];

export default function Reportes() {
  const [activeMenu, setActiveMenu] = useState("indicadores");

  return (
    <div className="flex flex-col bg-slate-50 h-[calc(100vh-60px)] overflow-hidden">
      
      {/* HEADER AREA (Top Level - Match Elite Alignment) */}
      <div className="px-2 md:px-4 lg:px-6 pb-2 shrink-0 no-print animate-fadeIn">
          <div className="flex flex-col gap-6">
              <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-8">
                  <div className="space-y-2">
                      <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                          <FiPieChart className="text-purple-600" />
                          <span>Institucional</span>
                          <span className="text-slate-200">/</span>
                          <span className="text-slate-800">Business Intelligence</span>
                      </div>
                      <div className="flex items-end gap-4">
                          <h2 className="text-3xl font-black text-slate-800 uppercase tracking-tight leading-none">
                              Reportes <span className="text-purple-600">Corporativos</span>
                          </h2>
                      </div>
                      <div className="w-12 h-1.5 bg-purple-600 rounded-full" />
                  </div>
              </div>
          </div>
      </div>

      {/* CONTENT ROW (Sidebar + View) */}
      <div className="flex flex-1 min-h-0 px-2 md:px-4 lg:px-6 pb-6 relative animate-fadeIn">
      
        {/* ─── SIDEBAR ─── */}
        <aside className="no-print w-[240px] shrink-0 bg-white border-r border-slate-100 rounded-l-[32px] shadow-[0_1px_2px_0_rgba(0,0,0,0.05)] flex flex-col py-6 z-10 transition-all">
          <div className="px-6 pb-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
            Tipos de Reporte
          </div>

          <div className="px-3 flex flex-col gap-1">
            {MENU_ITEMS.map((item) => {
              const isActive = activeMenu === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveMenu(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-[12px] font-bold transition-all rounded-[14px] border border-transparent ${
                    isActive 
                      ? "bg-purple-50 text-purple-600 border-purple-100 shadow-sm" 
                      : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
                  }`}
                >
                  <span className={`text-[16px] ${isActive ? "text-purple-600" : "text-slate-400"}`}>{item.icon}</span>
                  {item.label}
                </button>
              );
            })}
          </div>

          <div className="mt-auto px-4">
            <div className="bg-purple-50 flex items-start gap-3 border border-purple-100 rounded-2xl p-4 text-[11px] text-purple-700 shadow-sm relative overflow-hidden">
                <FiPieChart className="absolute right-[-10px] bottom-[-10px] text-purple-200" size={50} />
                <div className="relative z-10">
                    <span className="font-black uppercase tracking-widest text-[9px] text-purple-400 block mb-1">MÓDULO B.I.</span>
                    <span className="font-medium text-[11px] leading-tight block">Toda la información exportable y en tiempo real.</span>
                </div>
            </div>
          </div>
        </aside>

        {/* ─── MAIN CONTENT ─── */}
        <div className="flex-1 flex flex-col min-w-0 bg-slate-50 overflow-hidden pl-6 rounded-r-[32px] shadow-[0_1px_2px_0_rgba(0,0,0,0.05)]">
          {activeMenu === "indicadores" && <Indicadores />}
          {activeMenu === "pacientes" && <ReportePacientes />}
          {activeMenu === "financiero" && <ReporteFinanciero />}
          {activeMenu === "clinico" && <ReporteClinico />}
          {activeMenu === "sistema" && <ReporteSistema />}
        </div>
      </div>
    </div>
  );
}
