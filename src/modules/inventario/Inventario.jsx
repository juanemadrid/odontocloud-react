// src/modules/inventario/Inventario.jsx
import React, { useState, useEffect, useMemo } from "react";
import { db } from "../../firebase/firebaseConfig";
import {
  collection,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy
} from "firebase/firestore";

export default function Inventario() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  // Formulario
  const [form, setForm] = useState({
    nombre: "",
    descripcion: "",
    cantidad: 0,
    minimo: 5,
    unidad: "unidades"
  });

  // Cargar datos en tiempo real
  useEffect(() => {
    const q = query(collection(db, "inventario"), orderBy("nombre"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setItems(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const filteredItems = useMemo(() => {
    const t = searchTerm.toLowerCase();
    return items.filter(i =>
      i.nombre.toLowerCase().includes(t) ||
      (i.descripcion || "").toLowerCase().includes(t)
    );
  }, [items, searchTerm]);

  // Manejar Stock rápido
  const handleStockChange = async (item, delta) => {
    const nuevaCantidad = Math.max(0, (item.cantidad || 0) + delta);
    try {
      await updateDoc(doc(db, "inventario", item.id), { cantidad: nuevaCantidad });
    } catch (e) {
      console.error(e);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await updateDoc(doc(db, "inventario", editingItem.id), {
          ...form,
          cantidad: Number(form.cantidad),
          minimo: Number(form.minimo)
        });
        alert("Producto actualizado");
      } else {
        await addDoc(collection(db, "inventario"), {
          ...form,
          cantidad: Number(form.cantidad),
          minimo: Number(form.minimo)
        });
        alert("Producto creado");
      }
      setModalOpen(false);
      setEditingItem(null);
      setForm({ nombre: "", descripcion: "", cantidad: 0, minimo: 5, unidad: "unidades" });
    } catch (e) {
      console.error(e);
      alert("Error al guardar: " + e.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Eliminar este producto?")) return;
    try {
      await deleteDoc(doc(db, "inventario", id));
    } catch (e) {
      alert("Error al eliminar");
    }
  };

  const openEdit = (item) => {
    setEditingItem(item);
    setForm({
      nombre: item.nombre,
      descripcion: item.descripcion || "",
      cantidad: item.cantidad,
      minimo: item.minimo || 5,
      unidad: item.unidad || "unidades"
    });
    setModalOpen(true);
  };

  const openNew = () => {
    setEditingItem(null);
    setForm({ nombre: "", descripcion: "", cantidad: 0, minimo: 5, unidad: "unidades" });
    setModalOpen(true);
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Segoe UI, sans-serif" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h1>📦 Inventario e Insumos</h1>
        <button
          onClick={openNew}
          style={{ background: "#0a86d8", color: "white", border: "none", padding: "10px 20px", borderRadius: "5px", cursor: "pointer" }}
        >
          + Nuevo Producto
        </button>
      </div>

      <input
        placeholder="🔍 Buscar producto..."
        value={searchTerm}
        onChange={e => setSearchTerm(e.target.value)}
        style={{ padding: "10px", width: "100%", marginBottom: "20px", border: "1px solid #ddd", borderRadius: "5px" }}
      />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "20px" }}>
        {items.map(item => {
          const alerta = item.cantidad <= (item.minimo || 5);
          return (
            <div key={item.id} style={{
              background: "white",
              padding: "20px",
              borderRadius: "10px",
              boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
              borderLeft: alerta ? "5px solid #e74c3c" : "5px solid #2ecc71"
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                <h3 style={{ margin: "0 0 5px 0" }}>{item.nombre}</h3>
                <button onClick={() => openEdit(item)} style={{ background: "none", border: "none", color: "#999", cursor: "pointer" }}>✏️</button>
              </div>
              <p style={{ margin: "0 0 15px 0", color: "#777", fontSize: "0.9em" }}>{item.descripcion}</p>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                <span style={{ fontSize: "2em", fontWeight: "bold", color: alerta ? "#c0392b" : "#2c3e50" }}>
                  {item.cantidad}
                </span>
                <span style={{ fontSize: "0.8em", background: "#eee", padding: "2px 8px", borderRadius: "10px" }}>
                  {item.unidad}
                </span>
              </div>

              {alerta && (
                <div style={{ color: "#e74c3c", fontSize: "0.85em", marginBottom: "15px", fontWeight: "bold" }}>
                  ⚠ Stock Bajo (Mín: {item.minimo})
                </div>
              )}

              <div style={{ display: "flex", gap: "5px" }}>
                <button
                  onClick={() => handleStockChange(item, -1)}
                  style={{ flex: 1, padding: "8px", background: "#fee", border: "1px solid #fcc", color: "#c0392b", borderRadius: "5px", cursor: "pointer" }}
                >
                  -1
                </button>
                <button
                  onClick={() => handleStockChange(item, 1)}
                  style={{ flex: 1, padding: "8px", background: "#eef", border: "1px solid #ccf", color: "#2980b9", borderRadius: "5px", cursor: "pointer" }}
                >
                  +1
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  style={{ background: "none", border: "none", cursor: "pointer" }}
                >
                  🗑️
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {items.length === 0 && !loading && (
        <div style={{ textAlign: "center", padding: "40px", color: "#999" }}>No hay productos en inventario.</div>
      )}

      {modalOpen && (
        <div style={{
          position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
          background: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000
        }}>
          <div style={{ background: "white", padding: "30px", borderRadius: "10px", width: "400px" }}>
            <h2>{editingItem ? "Editar Producto" : "Nuevo Producto"}</h2>
            <form onSubmit={handleSave}>
              <div style={{ marginBottom: "10px" }}>
                <label>Nombre</label>
                <input
                  required
                  style={{ width: "100%", padding: "8px" }}
                  value={form.nombre}
                  onChange={e => setForm({ ...form, nombre: e.target.value })}
                />
              </div>
              <div style={{ marginBottom: "10px" }}>
                <label>Descripción</label>
                <input
                  style={{ width: "100%", padding: "8px" }}
                  value={form.descripcion}
                  onChange={e => setForm({ ...form, descripcion: e.target.value })}
                />
              </div>
              <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
                <div style={{ flex: 1 }}>
                  <label>Cantidad</label>
                  <input
                    type="number"
                    required
                    style={{ width: "100%", padding: "8px" }}
                    value={form.cantidad}
                    onChange={e => setForm({ ...form, cantidad: e.target.value })}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label>Mínimo</label>
                  <input
                    type="number"
                    required
                    style={{ width: "100%", padding: "8px" }}
                    value={form.minimo}
                    onChange={e => setForm({ ...form, minimo: e.target.value })}
                  />
                </div>
              </div>
              <div style={{ marginBottom: "20px" }}>
                <label>Unidad</label>
                <select
                  style={{ width: "100%", padding: "8px" }}
                  value={form.unidad}
                  onChange={e => setForm({ ...form, unidad: e.target.value })}
                >
                  <option value="unidades">Unidades</option>
                  <option value="ml">Mililitros (ml)</option>
                  <option value="litros">Litros</option>
                  <option value="g">Gramos (g)</option>
                  <option value="kg">Kilogramos</option>
                  <option value="cajas">Cajas</option>
                  <option value="pares">Pares</option>
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
