// ===============================
// 📊 QuickCharts.jsx (barras pro)
// Mide: Pacientes registrados en los últimos 7 días
// ===============================
import React from "react";
import "../styles/dashboard.css";

export default function QuickCharts({ data = [], locale = "es" }) {
  const safe = Array.isArray(data) ? data : [];
  const hasValues = safe.some(d => Number(d?.value) > 0);

  if (safe.length === 0) {
    return <div className="chart-empty">Sin datos de la última semana.</div>;
  }

  // --- ViewBox responsive (el contenedor controla el ancho) ---
  const width = Math.max(180, 22 * safe.length + 80);
  const height = 120; // más alto para etiquetas y valores
  const padX = 28;    // más espacio para eje Y
  const padY = 18;
  const plotW = width - padX * 2;
  const plotH = height - padY * 2;

  const maxValue = Math.max(1, ...safe.map(d => Number(d.value) || 0));
  const gap = 8;
  const n = safe.length;
  const barW = Math.max(12, (plotW - gap * (n + 1)) / n);

  // Barras mapeadas
  const bars = safe.map((d, i) => {
    const v = Number(d.value) || 0;
    const h = Math.round((v / maxValue) * (plotH - 10)); // 10px holgura arriba
    const x = padX + gap + i * (barW + gap);
    const y = padY + (plotH - h);
    return {
      ...d,
      v,
      x, y,
      w: barW,
      h,
      short: d.shortLabel || "",
      fullLabel: d.label || d.shortLabel || "",
    };
  });

  // Guías y ticks de Y (0, 25, 50, 75, 100%)
  const steps = [0, 0.25, 0.5, 0.75, 1];
  const guides = steps.map((p, i) => {
    const y = padY + (1 - p) * plotH;
    const val = Math.round(maxValue * p);
    return { i, y, val };
  });

  const totalSemana = bars.reduce((s, b) => s + b.v, 0);

  return (
    <div className="oc-line-chart">
      {/* Subtítulo pequeño dentro del graf (opcional) */}
      <div className="chart-no-values" style={{ textAlign: "right", marginBottom: 4 }}>
        Pacientes registrados · últimos 7 días · Total: {totalSemana}
      </div>

      <svg
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
        role="img"
        aria-label="Pacientes registrados por día en la última semana"
      >
        {/* Eje X */}
        <line
          x1={padX}
          y1={height - padY}
          x2={width - padX}
          y2={height - padY}
          className="chart-axis"
        />
        {/* Eje Y */}
        <line
          x1={padX}
          y1={padY}
          x2={padX}
          y2={height - padY}
          className="chart-axis"
        />

        {/* Líneas guía + ticks Y */}
        {guides.map(g => (
          <g key={g.i}>
            <line
              x1={padX}
              x2={width - padX}
              y1={g.y}
              y2={g.y}
              stroke="#e5e7eb"
              strokeDasharray="4 4"
            />
            <text
              x={padX - 8}
              y={g.y + 3}
              textAnchor="end"
              fontSize="10"
              fill="#64748b"
            >
              {g.val}
            </text>
          </g>
        ))}

        {/* Barras */}
        {bars.map((b, idx) => (
          <g key={idx}>
            <rect
              x={b.x}
              y={b.y}
              width={b.w}
              height={b.h}
              rx="5"
              ry="5"
              fill={b.v > 0 ? "#0ea5e9" : "#cbd5e1"}  // gris si 0
            >
              <title>
                {`${b.fullLabel} · ${b.v} paciente${b.v !== 1 ? "s" : ""}`}
              </title>
            </rect>

            {/* Valor encima de la barra (si hay altura suficiente) */}
            {b.v > 0 && b.h > 14 && (
              <text
                x={b.x + b.w / 2}
                y={b.y - 4}
                textAnchor="middle"
                fontSize="10"
                fill="#0f172a"
              >
                {b.v}
              </text>
            )}
          </g>
        ))}
      </svg>

      {/* Etiquetas de días (abreviatura + día) */}
      <div className="chart-labels">
        {bars.map((b, i) => (
          <span key={i} className="chart-label" title={b.fullLabel}>
            {b.short}
          </span>
        ))}
      </div>
    </div>
  );
}
