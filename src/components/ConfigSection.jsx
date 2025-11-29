import React from "react";
import { useLocation, useParams } from "react-router-dom";

const TITLES = {
  "datos-basicos": "Datos básicos",
  "logo": "Logo",
  "lista-de-precios": "Lista de precios",
  "planes": "Planes",
  "consecutivos": "Consecutivos",
  "almacenes": "Almacenes",
  "categorias-inventario": "Categorías inventario",
  "sucursales": "Sucursales",
  "metodos-de-pago": "Métodos de pago",
  "bancos": "Bancos",
  "formulario-de-pacientes": "Formulario de pacientes",
  "especialidades": "Especialidades",
  "perfiles": "Perfiles",
  "usuarios": "Usuarios",
  "condiciones-de-pago": "Condiciones de pago",
  "parametros": "Parámetros",
  "recursos-fisicos": "Recursos físicos",
  "plantillas-doc-clinicos": "Plantillas Doc. Clínicos",
  "pestanas-consulta-med": "Pestañas Consulta Med.",
  "cargos": "Cargos",
  "impuestos": "Impuestos",
  "catalogo-de-cuentas": "Catálogo de cuentas",
  "suscripcion": "Suscripción",
};

export default function ConfigSection() {
  const { section } = useParams();
  const { state } = useLocation();
  const title = state?.title || TITLES[section] || "Configuración";

  return (
    <div className="oc-main-content">
      <section className="oc-grid">
        <div className="oc-grid-main">
          <div className="card">
            <h3>{title}</h3>
            <div className="mt-3 border rounded-lg p-4">
              {/* 🔧 Aquí luego reemplazas por el formulario real de esta sección */}
              <div className="text-sm text-gray-700">
                (Pendiente de implementar campos de <b>{title}</b>)
              </div>
            </div>
          </div>
        </div>
        <aside className="oc-grid-side">
          <div className="card">
            <h3>Ayuda</h3>
            <p className="oc-muted">Configura los parámetros generales del sistema.</p>
          </div>
        </aside>
      </section>
    </div>
  );
}
