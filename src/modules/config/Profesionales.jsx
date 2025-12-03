// ===============================
// ⚙️ Profesionales.jsx
// Configuración -> Registro de doctores / odontólogos
// ===============================
import React, { useEffect, useState } from "react";
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  getDocs,
  query,
  orderBy,
} from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";

export default function Profesionales() {
  const [items, setItems] = useState([]);
  const [especialidades, setEspecialidades] = useState([]);
  const [consultorios, setConsultorios] = useState([]);
  const [form, setForm] = useState({
    nombreCompleto: "",
    identificacion: "",
    registroProfesional: "",
    entidadRegistro: "",
    correo: "",
    telefono: "",
    especialidades: [],
    sucursal: "",
    consultoriosPermitidos: [],
    disponibilidad: [],
    activo: true,
  });
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [newHorario, setNewHorario] = useState({ dia: "Lunes", desde: "08:00", hasta: "12:00" });

  // --- Cargar datos maestros ---
  useEffect(() => {
    const unsub = onSnapshot(
      query(collection(db, "profesionales"), orderBy("nombreCompleto")),
      (snap) => setItems(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    );
    getDocs(collection(db, "especialidades")).then((s) =>
      setEspecialidades(s.docs.map((d) => ({ id: d.id, ...d.data() })))
    );
    getDocs(collection(db, "recursos")).then((s) =>
      setConsultorios(s.docs.map((d) => ({ id: d.id, ...d.data() })))
    );
    return () => unsub();
  }, []);

  // --- Manejadores de formulario ---
  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  };

  const toggleEspecialidad = (id) => {
    setForm((f) => {
      const arr = f.especialidades.includes(id)
        ? f.especialidades.filter((x) => x !== id)
        : [...f.especialidades, id];
      return { ...f, especialidades: arr };
    });
  };

  const toggleConsultorio = (id) => {
    setForm((f) => {
      const arr = f.consultoriosPermitidos.includes(id)
        ? f.consultoriosPermitidos.filter((x) => x !== id)
        : [...f.consultoriosPermitidos, id];
      return { ...f, consultoriosPermitidos: arr };
    });
  };

  const addHorario = () => {
    setForm((f) => ({
      ...f,
      disponibilidad: [...f.disponibilidad, { ...newHorario }],
    }));
    setNewHorario({ dia: "Lunes", desde: "08:00", hasta: "12:00" });
  };

  const removeHorario = (i) => {
    setForm((f) => ({
      ...f,
      disponibilidad: f.disponibilidad.filter((_, idx) => idx !== i),
    }));
  };

  const resetForm = () => {
    setForm({
      nombreCompleto: "",
      identificacion: "",
      registroProfesional: "",
      entidadRegistro: "",
      correo: "",
      telefono: "",
      especialidades: [],
      sucursal: "",
      consultoriosPermitidos: [],
      disponibilidad: [],
      activo: true,
    });
    setEditId(null);
  };

  // --- Guardar o actualizar ---
  const onSubmit = async (e) => {
    e.preventDefault();
    if (!form.nombreCompleto.trim()) return alert("El nombre es obligatorio.");
    setLoading(true);
    try {
      const data = {
        ...form,
        nombreCompleto: form.nombreCompleto.trim(),
      };
      if (editId) {
        await updateDoc(doc(db, "profesionales", editId), data);
      } else {
        await addDoc(collection(db, "profesionales"), data);
      }
      resetForm();
    } catch (err) {
      console.error(err);
      alert("Error al guardar profesional.");
    }
    setLoading(false);
  };

  // --- Editar existente ---
  const onEdit = (item) => {
    setEditId(item.id);
    setForm({ ...item });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // --- Eliminar ---
  const onDelete = async (id) => {
    if (!window.confirm("¿Eliminar este profesional?")) return;
    try {
      await deleteDoc(doc(db, "profesionales", id));
    } catch (err) {
      console.error(err);
      alert("Error al eliminar.");
    }
  };

  // --- Render ---
  return (
    <div className="oc-main-content">
      <div className="oc-section-title">
        <h2>Configuración · Profesionales</h2>
      </div>

      {/* --- Formulario --- */}
      <div className="emp-card">
        <div className="emp-title">
          {editId ? "Editar profesional" : "Nuevo profesional"}
        </div>

        <form className="emp-form" onSubmit={onSubmit}>
          <div className="oc-form-grid">
            <div className="oc-field oc-col-2">
              <label className="emp-label">Nombre completo *</label>
              <input
                name="nombreCompleto"
                className="emp-input"
                required
                value={form.nombreCompleto}
                onChange={onChange}
              />
            </div>

            <div className="oc-field">
              <label className="emp-label">Identificación</label>
              <input
                name="identificacion"
                className="emp-input"
                value={form.identificacion}
                onChange={onChange}
              />
            </div>

            <div className="oc-field">
              <label className="emp-label">Registro profesional</label>
              <input
                name="registroProfesional"
                className="emp-input"
                value={form.registroProfesional}
                onChange={onChange}
              />
            </div>

            <div className="oc-field">
              <label className="emp-label">Entidad de registro</label>
              <input
                name="entidadRegistro"
                className="emp-input"
                value={form.entidadRegistro}
                onChange={onChange}
              />
            </div>

            <div className="oc-field">
              <label className="emp-label">Correo</label>
              <input
                name="correo"
                type="email"
                className="emp-input"
                value={form.correo}
                onChange={onChange}
              />
            </div>

            <div className="oc-field">
              <label className="emp-label">Teléfono</label>
              <input
                name="telefono"
                className="emp-input"
                value={form.telefono}
                onChange={onChange}
              />
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

            <div className="oc-field oc-col-2">
              <label className="emp-label">Especialidades</label>
              <div className="emp-checkbox-list">
                {especialidades.map((esp) => (
                  <label key={esp.id} style={{ marginRight: "1rem" }}>
                    <input
                      type="checkbox"
                      checked={form.especialidades.includes(esp.id)}
                      onChange={() => toggleEspecialidad(esp.id)}
                    />{" "}
                    {esp.nombre}
                  </label>
                ))}
              </div>
            </div>

            <div className="oc-field oc-col-2">
              <label className="emp-label">Consultorios permitidos</label>
              <div className="emp-checkbox-list">
                {consultorios.map((c) => (
                  <label key={c.id} style={{ marginRight: "1rem" }}>
                    <input
                      type="checkbox"
                      checked={form.consultoriosPermitidos.includes(c.id)}
                      onChange={() => toggleConsultorio(c.id)}
                    />{" "}
                    {c.nombre}
                  </label>
                ))}
              </div>
            </div>

            {/* --- Disponibilidad --- */}
            <div className="oc-field oc-col-2">
              <label className="emp-label">Disponibilidad semanal</label>
              <div style={{ marginBottom: "0.5rem" }}>
                <select
                  name="dia"
                  value={newHorario.dia}
                  onChange={(e) =>
                    setNewHorario((h) => ({ ...h, dia: e.target.value }))
                  }
                >
                  {["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"].map((d) => (
                    <option key={d}>{d}</option>
                  ))}
                </select>{" "}
                <input
                  type="time"
                  value={newHorario.desde}
                  onChange={(e) =>
                    setNewHorario((h) => ({ ...h, desde: e.target.value }))
                  }
                />{" "}
                a{" "}
                <input
                  type="time"
                  value={newHorario.hasta}
                  onChange={(e) =>
                    setNewHorario((h) => ({ ...h, hasta: e.target.value }))
                  }
                />{" "}
                <button
                  type="button"
                  className="oc-btn small"
                  onClick={addHorario}
                >
                  ➕
                </button>
              </div>

              {form.disponibilidad.length > 0 && (
                <ul style={{ marginLeft: "1rem" }}>
                  {form.disponibilidad.map((h, i) => (
                    <li key={i}>
                      {h.dia}: {h.desde} - {h.hasta}{" "}
                      <button
                        type="button"
                        className="oc-btn small danger"
                        onClick={() => removeHorario(i)}
                      >
                        ❌
                      </button>
                    </li>
                  ))}
                </ul>
              )}
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
              <button type="button" className="oc-btn secondary" onClick={resetForm}>
                Cancelar
              </button>
            )}
          </div>
        </form>
      </div>

      {/* --- Listado de profesionales --- */}
      <div className="emp-card" style={{ marginTop: "1.5rem" }}>
        <div className="emp-title">Listado de profesionales</div>

        {items.length === 0 ? (
          <p style={{ padding: "0.5rem 1rem" }}>No hay profesionales registrados.</p>
        ) : (
          <table className="oc-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Registro</th>
                <th>Especialidades</th>
                <th>Sucursal</th>
                <th>Activo</th>
                <th style={{ width: 120 }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {items.map((it) => (
                <tr key={it.id}>
                  <td>{it.nombreCompleto}</td>
                  <td>{it.registroProfesional}</td>
                  <td>
                    {it.especialidades
                      ?.map(
                        (id) =>
                          especialidades.find((e) => e.id === id)?.nombre || "—"
                      )
                      .join(", ")}
                  </td>
                  <td>{it.sucursal || "—"}</td>
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
