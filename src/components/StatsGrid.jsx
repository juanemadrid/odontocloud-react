// src/components/StatsGrid.jsx
import React from "react";

export default function StatsGrid({ metrics }) {
  if (!metrics) return null;
  const items = [
    { title: "Pacientes", value: metrics.pacientesHoy, meta: "Total" },
    { title: "Citas hoy", value: metrics.citasHoy, meta: "Programadas" },
    { title: "Facturación", value: new Intl.NumberFormat("es-CO").format(metrics.facturacionHoy), meta: "COP" },
    { title: "En espera", value: metrics.enEspera, meta: "Pacientes" },
  ];

  return (
    <div className="card-grid stats-grid">
      {items.map((it) => (
        <div className="widget-box" key={it.title}>
          <div className="widget-title">{it.title}</div>
          <div className="widget-number">{it.value}</div>
          <div className="widget-meta">{it.meta}</div>
        </div>
      ))}
    </div>
  );
}
