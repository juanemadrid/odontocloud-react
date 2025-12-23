// src/components/N8nStatus.jsx
import React from "react";

export default function N8nStatus({ status }) {
  if (!status) return null;
  return (
    <div className="card">
      <h4>Automatizaciones (N8N)</h4>
      <div className="n8n-line"><strong>Conectado:</strong> {status.connected ? "Sí" : "No"}</div>
      <div className="n8n-line"><strong>Flujos activos:</strong> {status.flowsRunning}</div>
      {status.lastError && <div className="n8n-error">Error: {status.lastError}</div>}
    </div>
  );
}
