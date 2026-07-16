import React, { useState } from "react";
import { 
  FiFileText, FiUsers, FiCalendar, FiBriefcase, 
  FiThermometer, FiTrash2, FiBox, FiActivity, 
  FiPlusSquare, FiShield, FiCheckSquare, FiPieChart
} from "react-icons/fi";

// Sub-views
import FacturacionHub from "./views/FacturacionHub";
import Inventario from "../inventario/Inventario";
import RipsGenerator from "../rips/RipsGenerator";
import GestionAgenda from "./views/GestionAgenda";
import Terceros from "./views/Terceros";
import Convenios from "./views/Convenios";
import Campanas from "./views/Campanas";
import TemperaturaHumedad from "./views/TemperaturaHumedad";
import MedicamentosHub from "../medicamentos/MedicamentosHub";
import ResiduosHub from "../residuos/ResiduosHub";
import Esterilizacion from "../esterilizacion/Esterilizacion";

const ADMIN_MENU = [
  { id: "facturacion", label: "Facturación", icon: <FiFileText /> },
  { id: "convenios", label: "Convenios", icon: <FiCheckSquare /> },
  { id: "agenda", label: "Gestión de agenda", icon: <FiCalendar /> },
  { id: "terceros", label: "Terceros", icon: <FiUsers /> },
  { id: "campanas", label: "Campañas", icon: <FiPieChart /> },
  { id: "temp", label: "Temperatura y humedad", icon: <FiThermometer /> },
  { id: "residuos", label: "Residuos", icon: <FiTrash2 /> },
  { id: "inventario", label: "Inventario", icon: <FiBox /> },
  { id: "rips", label: "RIPS", icon: <FiActivity /> },
  { id: "medicamentos", label: "Medicamentos y planes", icon: <FiPlusSquare /> },
  { id: "esterilizacion", label: "Esterilización", icon: <FiShield /> },
];

export default function AdministracionRouter() {
  const [activeTab, setActiveTab] = useState("facturacion");

  return (
    <div className="flex h-full w-full bg-slate-50 overflow-hidden rounded-[32px] border border-slate-200/60 shadow-xl">
      
      {/* ─── SIDEBAR INTERNO (Elite style) ─── */}
      <div className="w-72 bg-white border-r border-slate-100 flex flex-col shrink-0">
        <div className="p-6 border-b border-slate-50 bg-slate-50/50">
          <div className="flex items-center gap-3 text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] mb-1">
            <FiBriefcase />
            <span>Gestión Administrativa</span>
          </div>
          <h2 className="text-xl font-black text-slate-800 tracking-tight uppercase">Administración</h2>
        </div>

        <nav className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-1">
          {ADMIN_MENU.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`
                w-full flex items-center gap-3 px-4 py-3.5 rounded-[20px] transition-all duration-300 group
                ${activeTab === item.id 
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-200 font-bold" 
                  : "text-slate-400 hover:bg-slate-50 hover:text-slate-600 font-semibold"}
              `}
            >
              <span className={`text-lg transition-transform duration-500 ${activeTab === item.id ? "scale-110" : "group-hover:scale-110 group-hover:rotate-3"}`}>
                {item.icon}
              </span>
              <span className="text-[12px] uppercase tracking-wider">{item.label}</span>
              {activeTab === item.id && (
                <div className="ml-auto w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
              )}
            </button>
          ))}
        </nav>

        <div className="p-6 bg-slate-50/80 border-t border-slate-100">
            <div className="p-4 rounded-2xl bg-white border border-slate-200/50 shadow-sm">
                <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Estado de Módulo</div>
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
                    <span className="text-[11px] font-bold text-slate-700">Auditando en Tiempo Real</span>
                </div>
            </div>
        </div>
      </div>

        {/* ─── CONTENIDO DINÁMICO (With Universal Hub Header) ─── */}
        <div className="flex-1 flex flex-col bg-slate-50/10 overflow-hidden relative">
            {/* Hub Header */}
            <div className="px-8 py-5 bg-white border-b border-slate-100 flex items-center justify-between sticky top-0 z-50 shadow-sm transition-all">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-blue-600/5 text-blue-600 rounded-xl flex items-center justify-center border border-blue-100">
                        {ADMIN_MENU.find(m => m.id === activeTab)?.icon}
                    </div>
                    <div className="space-y-0.5">
                        <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] leading-none mb-1">
                            <span>Administración</span>
                            <span className="text-slate-200">/</span>
                            <span className="text-blue-600">{ADMIN_MENU.find(m => m.id === activeTab)?.label}</span>
                        </div>
                        <h2 className="text-[14px] font-black text-slate-800 uppercase tracking-tight leading-none">
                            Panel de {ADMIN_MENU.find(m => m.id === activeTab)?.label}
                        </h2>
                    </div>
                </div>
            </div>

            {/* Decorative mask */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-100/10 blur-[100px] -mr-32 -mt-32 pointer-events-none" />

            <div className="flex-1 h-full w-full overflow-y-auto custom-scrollbar p-6">
                {activeTab === "facturacion" && <FacturacionHub />}
                {activeTab === "inventario" && <Inventario />}
                {activeTab === "rips" && <RipsGenerator />}
                {activeTab === "agenda" && <GestionAgenda />}
                {activeTab === "terceros" && <Terceros />}
                {activeTab === "convenios" && <Convenios />}
                {activeTab === "campanas" && <Campanas />}
                {activeTab === "temp" && <TemperaturaHumedad />}
                {activeTab === "medicamentos" && <MedicamentosHub />}
                {activeTab === "residuos" && <ResiduosHub />}
                {activeTab === "esterilizacion" && <Esterilizacion />}
                
                {/* Placeholders for others */}
                {!["facturacion", "inventario", "rips", "agenda", "terceros", "convenios", "campanas", "temp", "medicamentos", "residuos", "esterilizacion"].includes(activeTab) && (
                    <div className="flex flex-col items-center justify-center h-full p-20 text-center animate-fadeIn">
                        <div className="w-24 h-24 rounded-full bg-blue-50 flex items-center justify-center text-4xl text-blue-200 mb-6 border border-blue-100/50">
                            {ADMIN_MENU.find(m => m.id === activeTab)?.icon}
                        </div>
                        <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight mb-2">
                           Vista en <span className="text-blue-600">Construcción</span>
                        </h3>
                        <p className="text-[13px] font-medium text-slate-400 max-w-sm">
                            El módulo de {ADMIN_MENU.find(m => m.id === activeTab)?.label} está siendo sincronizado con el motor contable real. Pronto estará disponible.
                        </p>
                        <button className="mt-8 px-8 py-3 bg-white border border-slate-200 rounded-full text-[11px] font-black text-slate-400 uppercase tracking-widest hover:border-blue-200 hover:text-blue-600 transition-all shadow-sm">
                            Reportar Incidencia
                        </button>
                    </div>
                )}
            </div>
        </div>
    </div>
  );
}
