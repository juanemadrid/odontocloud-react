import React, { useState } from "react";
import { 
  FiFileText, FiPlusCircle, FiMinusCircle, FiDollarSign, 
  FiRepeat, FiTruck, FiShoppingBag, FiLayers, FiCreditCard, FiArrowRight
} from "react-icons/fi";
import FinancialDashboard from "../../financiero/components/FinancialDashboard";
import ReciboCajaList from "../../facturacion/recibo/ReciboCajaList";
import ReciboCajaForm from "../../facturacion/recibo/ReciboCajaForm";
import SaldoFavorList from "../../facturacion/saldo/SaldoFavorList";
import SaldoFavorForm from "../../facturacion/saldo/SaldoFavorForm";
import NotaCreditoList from "../../facturacion/nota/NotaCreditoList";
import NotaCreditoForm from "../../facturacion/nota/NotaCreditoForm";
import NotaDebitoList from "../../facturacion/nota/NotaDebitoList";
import NotaDebitoForm from "../../facturacion/nota/NotaDebitoForm";
import Liquidaciones from "../../facturacion/liquidacion/Liquidaciones";

const FACT_OPTIONS = [
  { id: "recibo", label: "Recibo de caja", icon: <FiFileText />, color: "text-emerald-600", bg: "bg-emerald-50", desc: "Comprobantes de ingreso de dinero" },
  { id: "nc", label: "Nota crédito", icon: <FiMinusCircle />, color: "text-rose-600", bg: "bg-rose-50", desc: "Anulaciones y descuentos" },
  { id: "nd", label: "Nota débito", icon: <FiPlusCircle />, color: "text-orange-600", bg: "bg-orange-50", desc: "Incrementos de deuda" },
  { id: "liq", label: "Liquidaciones", icon: <FiLayers />, color: "text-purple-600", bg: "bg-purple-50", desc: "Cierre de tratamientos y presupuestos" },
  { id: "tras", label: "Traslados", icon: <FiRepeat />, color: "text-slate-600", bg: "bg-slate-50", desc: "Movimiento entre cuentas" },
  { id: "pagos", label: "Pagos", icon: <FiCreditCard />, color: "text-indigo-600", bg: "bg-indigo-50", desc: "Gestión de egresos y proveedores" },
  { id: "oc", label: "Ordenes de compra", icon: <FiShoppingBag />, color: "text-cyan-600", bg: "bg-cyan-50", desc: "Solicitudes de insumos" },
  { id: "fv", label: "Factura de venta", icon: <FiDollarSign />, color: "text-emerald-700", bg: "bg-emerald-100", desc: "Facturación principal de servicios" },
  { id: "fc", label: "Facturas de compra", icon: <FiTruck />, color: "text-amber-600", bg: "bg-amber-50", desc: "Registro de facturas recibidas" },
];

export default function FacturacionHub() {
  const [activeSubView, setActiveSubView] = useState(null);

  // ─── RENDERING SUB-VIEWS ───
  if (activeSubView) {
    let content = null;
    let title = "";

    if (activeSubView === "fv") {
        content = <FinancialDashboard />;
        title = "Facturación de Venta";
    } else if (activeSubView === "recibo") {
        content = <ReciboCajaList onNew={() => setActiveSubView("recibo_form")} onBack={() => setActiveSubView(null)} />;
        title = "Recibo de Caja";
    } else if (activeSubView === "recibo_form") {
        content = <ReciboCajaForm onCancel={() => setActiveSubView("recibo")} onSuccess={() => setActiveSubView("recibo")} />;
        title = "Nuevo Recibo de Caja";
    } else if (activeSubView === "saldo") {
        content = <SaldoFavorList onNew={() => setActiveSubView("saldo_form")} onBack={() => setActiveSubView(null)} />;
        title = "Saldo a Favor";
    } else if (activeSubView === "saldo_form") {
        content = <SaldoFavorForm onCancel={() => setActiveSubView("saldo")} onSuccess={() => setActiveSubView("saldo")} />;
        title = "Nuevo Saldo a Favor";
    } else if (activeSubView === "nc") {
        content = <NotaCreditoList onNew={() => setActiveSubView("nc_form")} onBack={() => setActiveSubView(null)} />;
        title = "Nota de Crédito";
    } else if (activeSubView === "nc_form") {
        content = <NotaCreditoForm onCancel={() => setActiveSubView("nc")} onSuccess={() => setActiveSubView("nc")} />;
        title = "Nueva Nota de Crédito";
    } else if (activeSubView === "nd") {
        content = <NotaDebitoList onNew={() => setActiveSubView("nd_form")} onBack={() => setActiveSubView(null)} />;
        title = "Nota de Débito";
    } else if (activeSubView === "nd_form") {
        content = <NotaDebitoForm onCancel={() => setActiveSubView("nd")} onSuccess={() => setActiveSubView("nd")} />;
        title = "Nueva Nota de Débito";
    } else if (activeSubView === "liq") {
        content = <Liquidaciones onBack={() => setActiveSubView(null)} />;
        title = "Liquidación de Comisiones";
    }

    if (content) {
        return (
            <div className="h-full flex flex-col animate-slideUp">
                <div className="px-6 py-4 bg-white border-b border-slate-100 flex items-center gap-4 sticky top-0 z-50">
                    <button 
                        onClick={() => {
                            if (activeSubView === "recibo_form") setActiveSubView("recibo");
                            else if (activeSubView === "saldo_form") setActiveSubView("saldo");
                            else if (activeSubView === "nc_form") setActiveSubView("nc");
                            else if (activeSubView === "nd_form") setActiveSubView("nd");
                            else setActiveSubView(null);
                        }}
                        className="w-10 h-10 flex items-center justify-center hover:bg-slate-50 rounded-xl transition-all text-slate-400 hover:text-blue-600 border border-transparent hover:border-blue-100 shadow-sm hover:shadow-md active:scale-95 group"
                        title="Volver"
                    >
                        <FiArrowRight className="rotate-180 group-hover:-translate-x-0.5 transition-transform" size={18} />
                    </button>
                    <div className="h-6 w-[1px] bg-slate-200 mx-1" />
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] leading-none mb-1">Módulo de Facturación</span>
                        <h2 className="text-[14px] font-black text-slate-800 uppercase tracking-tight leading-none">{title}</h2>
                    </div>
                </div>
                <div key={activeSubView} className="flex-1 overflow-y-auto bg-slate-50/30">
                    {content}
                </div>
            </div>
        );
    }
  }

  return (
    <div className="p-8 max-w-7xl mx-auto animate-fadeIn">
      <div className="mb-10">
        <h2 className="text-2xl font-black text-slate-800 tracking-tight uppercase mb-2">Centro de <span className="text-blue-600">Facturación</span></h2>
        <p className="text-[13px] text-slate-400 font-medium">Selecciona el tipo de documento contable que deseas gestionar.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {FACT_OPTIONS.map((opt) => (
          <button
            key={opt.id}
            onClick={() => setActiveSubView(opt.id)}
            className="group relative bg-white rounded-[28px] p-6 border border-slate-100 shadow-[0_8px_30px_rgba(0,0,0,0.02)] hover:shadow-xl hover:shadow-blue-500/10 hover:border-blue-200 transition-all duration-500 text-left overflow-hidden active:scale-95"
          >
            {/* Hover decoration */}
            <div className={`absolute top-0 right-0 w-32 h-32 ${opt.bg} opacity-0 group-hover:opacity-40 rounded-full blur-3xl -mr-10 -mt-10 transition-all duration-700`} />

            <div className="relative flex items-start gap-4">
              <div className={`w-14 h-14 rounded-2xl ${opt.bg} ${opt.color} flex items-center justify-center text-2xl group-hover:scale-110 transition-transform duration-500 shadow-sm border border-black/5`}>
                {opt.icon}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-[14px] font-black text-slate-800 uppercase tracking-tight mb-1 group-hover:text-blue-600 transition-colors">
                  {opt.label}
                </h3>
                <p className="text-[11px] text-slate-400 font-medium leading-relaxed">
                  {opt.desc}
                </p>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between">
                <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest group-hover:text-blue-400 transition-colors">Sincronizado</span>
                <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500 shadow-sm">
                    <FiArrowRight size={14} />
                </div>
            </div>
          </button>
        ))}
      </div>

      {activeSubView && !["fv", "recibo", "recibo_form", "saldo", "saldo_form"].includes(activeSubView) && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-md animate-fadeIn">
            <div className="bg-white p-10 rounded-[40px] shadow-2xl max-w-md w-full text-center border border-white/20">
                <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center text-4xl mx-auto mb-6">
                    {FACT_OPTIONS.find(o => o.id === activeSubView)?.icon}
                </div>
                <h3 className="text-xl font-black text-slate-800 uppercase mb-2">Próximamente</h3>
                <p className="text-[13px] text-slate-400 font-medium mb-8">
                    El registro de {FACT_OPTIONS.find(o => o.id === activeSubView)?.label} está en etapa de validación fiscal.
                </p>
                <button 
                  onClick={() => setActiveSubView(null)}
                  className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-[12px] uppercase tracking-widest hover:bg-slate-800 active:scale-95 transition-all shadow-xl shadow-slate-200"
                >
                    Entendido
                </button>
            </div>
        </div>
      )}
    </div>
  );
}
