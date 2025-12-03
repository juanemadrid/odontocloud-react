// ===============================
// ⚙️ Consultorios.jsx
// Configuración -> Consultorios / Recursos físicos
// ===============================
import React, { useEffect, useState } from "react";
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  orderBy,
} from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";

export default function Consultorios() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({
    nombre: "",
    tipo: "Consultorio",
    sucursal: "",
    capacidad: 1,
    profesionalesPermitidos: "",
    activo: true,
  });
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);

  // --- Cargar consultorios ---
  useEffect(() => {
    const q = query(collection(db, "recursos"), orderBy("nombre", "asc"));
    const unsub = onSnapshot(q, (snap) => {
      setItems(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, []);

  // --- Cambiar campos ---
  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  };

  const resetForm = () => {
    setForm({
      nombre: "",
      tipo: "Consultorio",
      sucursal: "",
      capacidad: 1,
      profesionalesPermitidos: "",
      activo: true,
    });
    setEditId(null);
  };

  // --- Guardar o actualizar ---
  const onSubmit = async (e) => {
    e.preventDefault();
    if (!form.nombre.trim()) {
      alert("El nombre es obligatorio.");
      return;
    }
    setLoading(true);
    try {
      const data = {
        nombre: form.nombre.trim(),
        tipo: form.tipo,
        sucursal: form.sucursal.trim(),
        capacidad: Number(form.capacidad) || 1,
        profesionalesPermitidos: form.profesionalesPermitidos
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        activo: form.activo,
      };
      if (editId) {
        await updateDoc(doc(db, "recursos", editId), data);
      } else {
        await addDoc(collection(db, "recursos"), data);
      }
      resetForm();
    } catch (err) {
      console.error("Error al guardar consultorio:", err);
      alert("Error al guardar.");
    }
    setLoading(false);
  };

  // --- Editar existente ---
  const onEdit = (item) => {
    setEditId(item.id);
    setForm({
      nombre: item.nombre || "",
      tipo: item.tipo || "Consultorio",
      sucursal: item.sucursal || "",
      capacidad: item.capacidad || 1,
      profesionalesPermitidos:
        (item.profesionalesPermitidos || []).join(", "),
      activo: item.activo ?? true,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // --- Eliminar ---
  const onDelete = async (id) => {
    if (!window.confirm("¿Eliminar este consultorio?")) return;
    try {
      await deleteDoc(doc(db, "recursos", id));
    } catch (err) {
      console.error("Error al eliminar:", err);
      alert("No se pudo eliminar.");
    }
  };

  // --- Render ---
  return (
    <div className="oc-main-content">
      <div className="oc-section-title">
        <h2>Configuración · Consultorios</h2>
      </div>

      {/* --- Formulario --- */}
      <div className="emp-card">
        <div className="emp-title">
          {editId ? "Editar consultorio" : "Nuevo consultorio"}
        </div>

        <form className="emp-form" onSubmit={onSubmit}>
          <div className="oc-form-grid">
            <div className="oc-field oc-col-2">
              <label className="emp-label">Nombre *</label>
              <input
                name="nombre"
                className="emp-input"
                required
                value={form.nombre}
                onChange={onChange}
              />
            </div>

            <div className="oc-field">
              <label className="emp-label">Tipo</label>
              <select
                name="tipo"
                className="emp-select"
                value={form.tipo}
                onChange={onChange}
              >
                <option>Consultorio</option>
                <option>Sala</option>
                <option>Silla</option>
                <option>Equipo</option>
              </select>
            </div>

            <div className="oc-field">
              <label className="emp-label">Sucursal</label>
              <input
                name="sucursal"
                className="emp-input"
                value={form.sucursal}
                onChange={onChange}
              />
            </div>

            <div className="oc-field">
              <label className="emp-label">Capacidad</label>
              <input
                name="capacidad"
                className="emp-input"
                inputMode="numeric"
                value={form.capacidad}
                onChange={onChange}
              />
            </div>

            <div className="oc-field oc-col-2">
              <label className="emp-label">Profesionales permitidos</label>
              <input
                name="profesionalesPermitidos"
                className="emp-input"
                placeholder="IDs o nombres separados por coma"
                value={form.profesionalesPermitidos}
                onChange={onChange}
              />
              <small style={{ color: "#666" }}>
                (solo informativo por ahora, se enlaza con doctores más adelante)
              </small>
            </div>

            <div className="oc-field">
              <label className="emp-label">Activo</label>
              <input
                name="activo"
                type="checkbox"
                checked={form.activo}
                onChange={onChange}
              />
            </div>
          </div>

          <div className="oc-form-actions">
            <button type="submit" className="oc-btn primary" disabled={loading}>
              {loading ? "Guardando..." : editId ? "Actualizar" : "Guardar"}
            </button>
            {editId && (
              <button
                type="button"
                className="oc-btn secondary"
                onClick={resetForm}
              >
                Cancelar
              </button>
            )}
          </div>
        </form>
      </div>

      {/* --- Listado --- */}
      <div className="emp-card" style={{ marginTop: "1.5rem" }}>
        <div className="emp-title">Listado de consultorios</div>

        {items.length === 0 ? (
          <p style={{ padding: "0.5rem 1rem" }}>No hay consultorios registrados.</p>
        ) : (
          <table className="oc-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Tipo</th>
                <th>Sucursal</th>
                <th>Capacidad</th>
                <th>Activo</th>
                <th style={{ width: 120 }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {items.map((it) => (
                <tr key={it.id}>
                  <td>{it.nombre}</td>
                  <td>{it.tipo}</td>
                  <td>{it.sucursal}</td>
                  <td>{it.capacidad}</td>
                  <td>{it.activo ? "Sí" : "No"}</td>
                  <td>
                    <button
                      className="oc-btn small"
                      onClick={() => onEdit(it)}
                      title="Editar"
                    >
                      ✏️
                    </button>
                    <button
                      className="oc-btn small danger"
                      onClick={() => onDelete(it.id)}
                      title="Eliminar"
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
