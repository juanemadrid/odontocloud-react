// src/components/charts/SimpleLineChart.jsx
import React from "react";

export default function SimpleLineChart({ data = [] }) {
  const w = 360;
  const h = 120;
  const padding = 8;
  const max = Math.max(...data, 10);
  const points = data
    .map((v, i) => {
      const x = (i / Math.max(1, data.length - 1)) * (w - padding * 2) + padding;
      const y = h - ((v / max) * (h - padding * 2) + padding);
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg width="100%" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className="simple-line-chart">
      <polyline fill="none" stroke="#0284c7" strokeWidth="2" points={points} />
    </svg>
  );
}
