// src/modules/reportes/Reportes.jsx
import React, { useState, useEffect } from "react";
import { db } from "../../firebase/firebaseConfig";
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore";

export default function Reportes() {
  const [stats, setStats] = useState({
    pacientes: 0,
    citas: 0,
    facturado: 0,
    recaudado: 0,
    pendiente: 0
  });
  const [recentInvoices, setRecentInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        setLoading(true);
        // 1. Pacientes
        const pacSnap = await getDocs(collection(db, "pacientes"));
        const totalPacientes = pacSnap.size;

        // 2. Citas
        const citasSnap = await getDocs(collection(db, "agenda"));
        const totalCitas = citasSnap.size;

        // 3. Facturación
        const factSnap = await getDocs(query(collection(db, "facturas"), orderBy("fecha", "desc"), limit(50))); // Limitamos para rendimiento
        let totalFacturado = 0;
        let totalRecaudado = 0;
        const recent = [];

        factSnap.forEach(doc => {
          const data = doc.data();
          totalFacturado += data.monto || 0;
          if (data.estado === "Pagada") {
            totalRecaudado += data.monto || 0;
          }
          if (recent.length < 5) recent.push({ id: doc.id, ...data });
        });

        const totalPendiente = totalFacturado - totalRecaudado;

        setStats({
          pacientes: totalPacientes,
          citas: totalCitas,
          facturado: totalFacturado,
          recaudado: totalRecaudado,
          pendiente: totalPendiente
        });
        setRecentInvoices(recent);

      } catch (error) {
        console.error("Error loading reports:", error);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  const Card = ({ title, value, color, icon }) => (
    <div style={{
      background: "white",
      padding: "20px",
      borderRadius: "10px",
      boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
      flex: 1,
      minWidth: "200px",
      borderLeft: `5px solid ${color}`
    }}>
      <div style={{ color: "#888", fontSize: "0.9em", marginBottom: "5px", textTransform: "uppercase", letterSpacing: "1px" }}>{title}</div>
      <div style={{ fontSize: "2em", fontWeight: "bold", color: "#333" }}>{value}</div>
    </div>
  );

  return (
    <div style={{ padding: "20px", fontFamily: "Segoe UI, sans-serif" }}>
      <h1 style={{ marginBottom: "30px" }}>📊 Reportes y Métricas</h1>

      {loading ? (
        <div>Cargando estadísticas...</div>
      ) : (
        <>
          {/* KPI ROW 1 */}
          <div style={{ display: "flex", gap: "20px", flexWrap: "wrap", marginBottom: "30px" }}>
            <Card title="Total Pacientes" value={stats.pacientes} color="#3498db" />
            <Card title="Citas Registradas" value={stats.citas} color="#9b59b6" />
          </div>

          {/* KPI ROW 2 - Finance */}
          <div style={{ display: "flex", gap: "20px", flexWrap: "wrap", marginBottom: "40px" }}>
            <Card title="Total Facturado" value={`$${stats.facturado.toLocaleString()}`} color="#34495e" />
            <Card title="Ingresos Reales" value={`$${stats.recaudado.toLocaleString()}`} color="#2ecc71" />
            <Card title="Por Cobrar" value={`$${stats.pendiente.toLocaleString()}`} color="#e74c3c" />
          </div>

          {/* SECTION: Recent Activity */}
          <div style={{ display: "flex", gap: "30px", flexWrap: "wrap" }}>

            {/* Chart Placeholder (CSS Bar) */}
            <div style={{ flex: 1, minWidth: "300px", background: "white", padding: "25px", borderRadius: "10px", boxShadow: "0 4px 15px rgba(0,0,0,0.05)" }}>
              <h3>Resumen Financiero</h3>
              <div style={{ marginTop: "30px" }}>
                <div style={{ marginBottom: "15px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
                    <span>Recaudado</span>
                    <span>{Math.round((stats.recaudado / (stats.facturado || 1)) * 100)}%</span>
                  </div>
                  <div style={{ height: "10px", background: "#eee", borderRadius: "5px", overflow: "hidden" }}>
                    <div style={{ width: `${(stats.recaudado / (stats.facturado || 1)) * 100}%`, height: "100%", background: "#2ecc71" }}></div>
                  </div>
                </div>

                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
                    <span>Pendiente</span>
                    <span>{Math.round((stats.pendiente / (stats.facturado || 1)) * 100)}%</span>
                  </div>
                  <div style={{ height: "10px", background: "#eee", borderRadius: "5px", overflow: "hidden" }}>
                    <div style={{ width: `${(stats.pendiente / (stats.facturado || 1)) * 100}%`, height: "100%", background: "#e74c3c" }}></div>
                  </div>
                </div>
              </div>
              <p style={{ marginTop: "20px", fontSize: "0.9em", color: "#777", lineHeight: "1.5" }}>
                Este gráfico muestra la proporción de ingresos recaudados frente a los pendientes de cobro sobre las últimas 50 facturas.
              </p>
            </div>

            {/* Recent Invoices List */}
            <div style={{ flex: 1, minWidth: "300px", background: "white", padding: "25px", borderRadius: "10px", boxShadow: "0 4px 15px rgba(0,0,0,0.05)" }}>
              <h3>Últimas Facturas</h3>
              <ul style={{ listStyle: "none", padding: 0 }}>
                {recentInvoices.map(inv => (
                  <li key={inv.id} style={{ borderBottom: "1px solid #eee", padding: "12px 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <div style={{ fontWeight: "bold" }}>{inv.pacienteNombre}</div>
                      <div style={{ fontSize: "0.85em", color: "#888" }}>{inv.descripcion}</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontWeight: "bold" }}>${inv.monto?.toLocaleString()}</div>
                      <span style={{
                        fontSize: "0.75em",
                        padding: "2px 6px",
                        borderRadius: "4px",
                        background: inv.estado === "Pagada" ? "#dff0d8" : "#fcf8e3",
                        color: inv.estado === "Pagada" ? "#3c763d" : "#8a6d3b"
                      }}>{inv.estado}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

          </div>
        </>
      )}
    </div>
  );
}
