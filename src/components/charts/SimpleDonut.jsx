// src/components/charts/SimpleDonut.jsx
import React from "react";

export default function SimpleDonut({ data = [] }) {
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  const size = 120;
  const radius = 48;
  const cx = size / 2;
  const cy = size / 2;
  let angle = -90;

  const slices = data.map((d) => {
    const sliceAngle = (d.value / total) * 360;
    const start = polarToCartesian(cx, cy, radius, angle);
    const end = polarToCartesian(cx, cy, radius, angle + sliceAngle);
    const large = sliceAngle > 180 ? 1 : 0;
    const path = `M ${cx} ${cy} L ${start.x} ${start.y} A ${radius} ${radius} 0 ${large} 1 ${end.x} ${end.y} Z`;
    angle += sliceAngle;
    return { path };
  });

  function polarToCartesian(cx, cy, r, deg) {
    const rad = (deg * Math.PI) / 180;
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
  }

  const colors = ["#06b6d4", "#fb923c", "#34d399", "#ffb6b6"];

  return (
    <svg width="100%" viewBox={`0 0 ${size} ${size}`} className="simple-donut">
      {slices.map((s, i) => (
        <path key={i} d={s.path} fill={colors[i % colors.length]} opacity="0.95" />
      ))}
      <circle cx={cx} cy={cy} r="22" fill="#f4f7fb" />
    </svg>
  );
}
