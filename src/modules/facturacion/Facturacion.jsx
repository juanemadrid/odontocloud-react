// src/modules/facturacion/Facturacion.jsx
import React, { useState, useEffect, useMemo } from "react";
import { db } from "../../firebase/firebaseConfig";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  query,
  orderBy,
  serverTimestamp
} from "firebase/firestore";

export default function Facturacion() {
  const [facturas, setFacturas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Formulario nueva factura
  const [form, setForm] = useState({
    pacienteNombre: "",
    descripcion: "",
    monto: 0,
    estado: "Pendiente" // Pendiente, Pagada
  });

  // Cargar facturas
  useEffect(() => {
    loadFacturas();
  }, []);

  const loadFacturas = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, "facturas"), orderBy("fecha", "desc"));
      const snap = await getDocs(q);
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setFacturas(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const filteredFacturas = useMemo(() => {
    const t = searchTerm.toLowerCase();
    return facturas.filter(f =>
      (f.pacienteNombre || "").toLowerCase().includes(t) ||
      (f.descripcion || "").toLowerCase().includes(t)
    );
  }, [facturas, searchTerm]);

  const stats = useMemo(() => {
    const total = facturas.reduce((acc, curr) => acc + (curr.monto || 0), 0);
    const pagado = facturas.filter(f => f.estado === "Pagada").reduce((acc, curr) => acc + (curr.monto || 0), 0);
    const pendiente = facturas.filter(f => f.estado === "Pendiente").reduce((acc, curr) => acc + (curr.monto || 0), 0);
    return { total, pagado, pendiente };
  }, [facturas]);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, "facturas"), {
        ...form,
        monto: Number(form.monto),
        fecha: serverTimestamp()
      });
      setModalOpen(false);
      setForm({ pacienteNombre: "", descripcion: "", monto: 0, estado: "Pendiente" });
      loadFacturas();
      alert("Factura creada");
    } catch (e) {
      alert("Error: " + e.message);
    }
  };

  const toggleEstado = async (factura) => {
    const nuevo = factura.estado === "Pagada" ? "Pendiente" : "Pagada";
    try {
      await updateDoc(doc(db, "facturas", factura.id), { estado: nuevo });
      // Update local
      setFacturas(prev => prev.map(f => f.id === factura.id ? { ...f, estado: nuevo } : f));
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Segoe UI" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h1>Gestión de Facturación</h1>
        <button
          onClick={() => setModalOpen(true)}
          style={{ background: "#0a86d8", color: "white", border: "none", padding: "10px 20px", borderRadius: "5px", cursor: "pointer" }}
        >
          + Nueva Factura
        </button>
      </div>

      {/* STATS */}
      <div style={{ display: "flex", gap: "20px", marginBottom: "30px" }}>
        <div style={{ flex: 1, padding: "20px", background: "white", borderRadius: "10px", boxShadow: "0 2px 5px rgba(0,0,0,0.1)" }}>
          <h3 style={{ marginTop: 0, color: "#999" }}>Total Facturado</h3>
          <div style={{ fontSize: "24px", fontWeight: "bold" }}>${stats.total.toLocaleString()}</div>
        </div>
        <div style={{ flex: 1, padding: "20px", background: "#dff0d8", borderRadius: "10px", boxShadow: "0 2px 5px rgba(0,0,0,0.1)" }}>
          <h3 style={{ marginTop: 0, color: "#3c763d" }}>Pagado (Recaudado)</h3>
          <div style={{ fontSize: "24px", fontWeight: "bold", color: "#3c763d" }}>${stats.pagado.toLocaleString()}</div>
        </div>
        <div style={{ flex: 1, padding: "20px", background: "#fcf8e3", borderRadius: "10px", boxShadow: "0 2px 5px rgba(0,0,0,0.1)" }}>
          <h3 style={{ marginTop: 0, color: "#8a6d3b" }}>Pendiente por Cobrar</h3>
          <div style={{ fontSize: "24px", fontWeight: "bold", color: "#8a6d3b" }}>${stats.pendiente.toLocaleString()}</div>
        </div>
      </div>

      {/* FILTRO */}
      <input
        placeholder="🔍 Buscar factura..."
        value={searchTerm}
        onChange={e => setSearchTerm(e.target.value)}
        style={{ padding: "10px", width: "100%", marginBottom: "20px", border: "1px solid #ddd", borderRadius: "5px" }}
      />

      {/* TABLA */}
      <div style={{ background: "white", borderRadius: "10px", overflow: "hidden", boxShadow: "0 2px 10px rgba(0,0,0,0.05)" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead style={{ background: "#f5f5f5" }}>
            <tr>
              <th style={{ padding: "15px", textAlign: "left" }}>Fecha</th>
              <th style={{ padding: "15px", textAlign: "left" }}>Paciente</th>
              <th style={{ padding: "15px", textAlign: "left" }}>Descripción</th>
              <th style={{ padding: "15px", textAlign: "right" }}>Monto</th>
              <th style={{ padding: "15px", textAlign: "center" }}>Estado</th>
              <th style={{ padding: "15px", textAlign: "center" }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} style={{ padding: "20px", textAlign: "center" }}>Cargando...</td></tr>
            ) : filteredFacturas.length === 0 ? (
              <tr><td colSpan={6} style={{ padding: "20px", textAlign: "center" }}>No hay facturas.</td></tr>
            ) : (
              filteredFacturas.map(f => (
                <tr key={f.id} style={{ borderBottom: "1px solid #eee" }}>
                  <td style={{ padding: "15px" }}>{f.fecha?.seconds ? new Date(f.fecha.seconds * 1000).toLocaleDateString() : "N/A"}</td>
                  <td style={{ padding: "15px" }}>{f.pacienteNombre}</td>
                  <td style={{ padding: "15px" }}>{f.descripcion}</td>
                  <td style={{ padding: "15px", textAlign: "right" }}>${f.monto?.toLocaleString()}</td>
                  <td style={{ padding: "15px", textAlign: "center" }}>
                    <span style={{
                      padding: "5px 10px",
                      borderRadius: "15px",
                      fontSize: "0.85em",
                      background: f.estado === "Pagada" ? "#dff0d8" : "#fcf8e3",
                      color: f.estado === "Pagada" ? "#3c763d" : "#8a6d3b"
                    }}>
                      {f.estado}
                    </span>
                  </td>
                  <td style={{ padding: "15px", textAlign: "center" }}>
                    <button
                      onClick={() => toggleEstado(f)}
                      style={{
                        cursor: "pointer",
                        border: "1px solid #ccc",
                        background: "none",
                        padding: "5px 10px",
                        borderRadius: "5px"
                      }}>
                      Cambiar Estado
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {modalOpen && (
        <div style={{
          position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
          background: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000
        }}>
          <div style={{ background: "white", padding: "30px", borderRadius: "10px", width: "400px" }}>
            <h2>Nueva Factura</h2>
            <form onSubmit={handleSave}>
              <div style={{ marginBottom: "10px" }}>
                <label>Paciente</label>
                <input
                  required
                  style={{ width: "100%", padding: "8px" }}
                  value={form.pacienteNombre}
                  onChange={e => setForm({ ...form, pacienteNombre: e.target.value })}
                />
              </div>
              <div style={{ marginBottom: "10px" }}>
                <label>Descripción</label>
                <input
                  required
                  style={{ width: "100%", padding: "8px" }}
                  value={form.descripcion}
                  onChange={e => setForm({ ...form, descripcion: e.target.value })}
                />
              </div>
              <div style={{ marginBottom: "10px" }}>
                <label>Monto</label>
                <input
                  type="number"
                  required
                  style={{ width: "100%", padding: "8px" }}
                  value={form.monto}
                  onChange={e => setForm({ ...form, monto: e.target.value })}
                />
              </div>
              <div style={{ marginBottom: "20px" }}>
                <label>Estado</label>
                <select
                  style={{ width: "100%", padding: "8px" }}
                  value={form.estado}
                  onChange={e => setForm({ ...form, estado: e.target.value })}
                >
                  <option>Pendiente</option>
                  <option>Pagada</option>
                </select>
              </div>
              <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
                <button type="button" onClick={() => setModalOpen(false)}>Cancelar</button>
                <button type="submit" style={{ background: "#0a86d8", color: "white", border: "none", padding: "10px 20px" }}>Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
