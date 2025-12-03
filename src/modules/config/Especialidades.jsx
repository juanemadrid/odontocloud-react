// ===============================
// 🧪 Especialidades.jsx
// CRUD de especialidades (código, nombre, color, orden, activo, descripción)
// ===============================
import React, { useEffect, useMemo, useState } from "react";
import { db } from "../../firebase/firebaseConfig";
import {
  collection, addDoc, getDocs, doc, updateDoc, deleteDoc,
  query, orderBy, serverTimestamp
} from "firebase/firestore";

const normalize = (s) =>
  (s || "")
    .toString()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim();

export default function Especialidades() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [term, setTerm] = useState("");

  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    codigo: "",
    nombre: "",
    color: "#38a169",
    orden: 1,
    activo: true,
    descripcion: "",
  });

  const resetForm = () =>
    setForm({
      codigo: "",
      nombre: "",
      color: "#38a169",
      orden: (items?.length || 0) + 1,
      activo: true,
      descripcion: "",
    });

  const load = async () => {
    setLoading(true);
    try {
      const qRef = query(collection(db, "especialidades"), orderBy("orden", "asc"));
      const snap = await getDocs(qRef);
      setItems(snap.docs.map((d) => ({ id: d.id, ...(d.data() || {}) })));
    } catch (e) {
      console.error("Error leyendo especialidades:", e);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const t = normalize(term);
    if (!t) return items;
    return items.filter((x) =>
      normalize(`${x.codigo} ${x.nombre} ${x.descripcion}`).includes(t)
    );
  }, [items, term]);

  const onChange = (e) => {
    const { name, type, value, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  };

  const startEdit = (row) => {
    setEditingId(row.id);
    setForm({
      codigo: row.codigo || "",
      nombre: row.nombre || "",
      color: row.color || "#38a169",
      orden: row.orden ?? 1,
      activo: !!row.activo,
      descripcion: row.descripcion || "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const cancelEdit = () => {
    setEditingId(null);
    resetForm();
  };

  const save = async (e) => {
    e.preventDefault();

    const payload = {
      ...form,
      nombre_busqueda: normalize(`${form.nombre} ${form.codigo}`),
      actualizado: serverTimestamp(),
    };

    if (!payload.nombre?.trim()) return alert("El nombre es obligatorio.");
    if (!payload.codigo?.trim()) return alert("El código es obligatorio.");

    try {
      if (editingId) {
        await updateDoc(doc(db, "especialidades", editingId), payload);
      } else {
        await addDoc(collection(db, "especialidades"), {
          ...payload,
          creado: serverTimestamp(),
        });
      }
      await load();
      cancelEdit();
      alert("✅ Especialidad guardada.");
    } catch (e) {
      console.error("Error guardando especialidad:", e);
      alert("❌ No se pudo guardar la especialidad.");
    }
  };

  const removeItem = async (row) => {
    if (!window.confirm(`¿Eliminar la especialidad "${row.nombre}"?`)) return;
    try {
      await deleteDoc(doc(db, "especialidades", row.id));
      await load();
      alert("🗑️ Especialidad eliminada.");
    } catch (e) {
      console.error("Error eliminando especialidad:", e);
      alert("❌ No se pudo eliminar.");
    }
  };

  return (
    <div>
      <h2 style={{ marginTop: 0 }}>Especialidades</h2>

      {/* Formulario */}
      <div
        className="card"
        style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: 16, marginBottom: 16 }}
      >
        <h3 style={{ marginTop: 0 }}>{editingId ? "Editar especialidad" : "Nueva especialidad"}</h3>

        <form onSubmit={save} className="oc-form-grid" style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0,1fr))", gap: 12 }}>
          <div className="oc-field">
            <label>Código *</label>
            <input name="codigo" value={form.codigo} onChange={onChange} required />
          </div>

          <div className="oc-field">
            <label>Nombre *</label>
            <input name="nombre" value={form.nombre} onChange={onChange} required />
          </div>

          <div className="oc-field oc-col-2">
            <label>Descripción</label>
            <textarea name="descripcion" value={form.descripcion} onChange={onChange} rows={2} />
          </div>

          <div className="oc-field">
            <label>Color</label>
            <input name="color" value={form.color} onChange={onChange} type="color" />
          </div>

          <div className="oc-field">
            <label>Orden</label>
            <input name="orden" value={form.orden} onChange={onChange} type="number" />
          </div>

          <div className="oc-field" style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <input id="activoEsp" name="activo" checked={form.activo} onChange={onChange} type="checkbox" />
            <label htmlFor="activoEsp">Activo</label>
          </div>

          <div className="oc-form-actions oc-col-2" style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 8 }}>
            {editingId && (
              <button type="button" className="oc-btn" onClick={cancelEdit}>
                Cancelar
              </button>
            )}
            <button type="submit" className="oc-btn primary">Guardar</button>
          </div>
        </form>
      </div>

      {/* Búsqueda + Tabla */}
      <div className="card" style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, marginBottom: 10 }}>
          <h3 style={{ margin: 0 }}>Listado</h3>
          <input
            placeholder="Buscar por nombre o código…"
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            className="search-input"
            style={{ minWidth: 240 }}
          />
        </div>

        {loading ? (
          <div className="oc-muted">Cargando…</div>
        ) : filtered.length === 0 ? (
          <div className="oc-muted">Sin especialidades.</div>
        ) : (
          <div className="table-wrap">
            <table className="appointments-table">
              <thead>
                <tr>
                  <th style={{ width: 90 }}>Código</th>
                  <th>Nombre</th>
                  <th>Descripción</th>
                  <th style={{ width: 70 }}>Color</th>
                  <th style={{ width: 70 }}>Orden</th>
                  <th style={{ width: 90 }}>Activo</th>
                  <th style={{ width: 160 }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr key={r.id}>
                    <td className="mono">{r.codigo}</td>
                    <td>{r.nombre}</td>
                    <td>{r.descripcion}</td>
                    <td>
                      <div style={{ width: 18, height: 18, borderRadius: 4, background: r.color || "#999", border: "1px solid #e5e7eb" }} />
                    </td>
                    <td className="mono">{r.orden ?? ""}</td>
                    <td>{r.activo ? "Sí" : "No"}</td>
                    <td>
                      <div style={{ display: "flex", gap: 8 }}>
                        <button className="oc-btn small" onClick={() => startEdit(r)}>Editar</button>
                        <button className="oc-btn danger small" onClick={() => removeItem(r)}>Eliminar</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
