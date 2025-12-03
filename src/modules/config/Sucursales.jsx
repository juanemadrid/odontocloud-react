// ===============================
// 🏢 Sucursales.jsx (versión OralDrive-like)
// Listado + "Nueva / Editar" + Asociación de usuarios por oficina
// Firestore: sucursales, almacenes, listas_precios, consecutivos, usuarios
// ===============================
import React, { useEffect, useMemo, useState } from "react";
import { db } from "../../firebase/firebaseConfig";
import {
  collection,
  addDoc,
  getDocs,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  serverTimestamp,
  getDoc,
} from "firebase/firestore";

const normalize = (s) =>
  (s || "")
    .toString()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim();

export default function Sucursales() {
  // ======= estado principal =======
  const [mode, setMode] = useState("list"); // list | new | edit
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [term, setTerm] = useState("");

  // catálogos
  const [almacenes, setAlmacenes] = useState([]);
  const [listas, setListas] = useState([]);
  const [consecutivos, setConsecutivos] = useState([]);
  const [usuarios, setUsuarios] = useState([]);

  // edición
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(getEmptyForm());

  // modal usuarios
  const [usersModalOpen, setUsersModalOpen] = useState(false);
  const [usersForSucursalId, setUsersForSucursalId] = useState(null);
  const [usersSaving, setUsersSaving] = useState(false);

  function getEmptyForm() {
    return {
      nombre: "",
      telefonoFijo: "",
      celular: "",
      ciudad: "",
      direccion: "",
      codigoPostal: "",
      email: "",
      consecutivoId: "",
      listaPreciosId: "",
      almacenIds: [],

      pieHabilitado: false,
      piePersonalizado: "",

      codigoPrestador: "",
      entidadExtranj: "000000",
      entidadNacional: "000000",
      centroCostos: "",
      usuarioSoporteId: "",
      codigoPrestadorPropio: "",

      activo: true, // lo dejo interno (no visible). Útil si luego necesitas desactivar sin borrar.
    };
  }

  // ======= carga inicial =======
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [sucSnap, almSnap, lisSnap, conSnap, usrSnap] = await Promise.all([
          getDocs(query(collection(db, "sucursales"), orderBy("nombre", "asc"))),
          getDocs(query(collection(db, "almacenes"), orderBy("nombre", "asc"))),
          getDocs(query(collection(db, "listas_precios"), orderBy("nombre", "asc"))),
          getDocs(query(collection(db, "consecutivos"), orderBy("nombre", "asc"))),
          getDocs(query(collection(db, "usuarios"), orderBy("displayName", "asc"))).catch(() => ({ empty: true, docs: [] })),
        ]);

        setItems(sucSnap.docs.map((d) => ({ id: d.id, ...(d.data() || {}) })));
        setAlmacenes(almSnap.docs.map((d) => ({ id: d.id, ...(d.data() || {}) })));
        setListas(lisSnap.docs.map((d) => ({ id: d.id, ...(d.data() || {}) })));
        setConsecutivos(conSnap.docs.map((d) => ({ id: d.id, ...(d.data() || {}) })));
        setUsuarios(usrSnap.empty ? [] : usrSnap.docs.map((d) => ({ id: d.id, ...(d.data() || {}) })));
      } catch (e) {
        console.error("Error cargando datos:", e);
        setItems([]);
        setAlmacenes([]);
        setListas([]);
        setConsecutivos([]);
        setUsuarios([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const reloadSucursales = async () => {
    const sucSnap = await getDocs(query(collection(db, "sucursales"), orderBy("nombre", "asc")));
    setItems(sucSnap.docs.map((d) => ({ id: d.id, ...(d.data() || {}) })));
  };

  // ======= búsqueda =======
  const filtered = useMemo(() => {
    const t = normalize(term);
    if (!t) return items;
    return items.filter((x) =>
      normalize(
        `${x.nombre} ${x.telefonoFijo} ${x.celular} ${x.direccion} ${x.ciudad} ${x.email}`
      ).includes(t)
    );
  }, [items, term]);

  // ======= helpers formulario =======
  const onChange = (e) => {
    const { name, type, checked, value } = e.target;
    setForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  };

  const startNew = () => {
    setEditingId(null);
    setForm(getEmptyForm());
    setMode("new");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const startEdit = async (row) => {
    setEditingId(row.id);
    // normalizo campos faltantes
    setForm({
      nombre: row.nombre || "",
      telefonoFijo: row.telefonoFijo || "",
      celular: row.celular || "",
      ciudad: row.ciudad || "",
      direccion: row.direccion || "",
      codigoPostal: row.codigoPostal || "",
      email: row.email || "",
      consecutivoId: row.consecutivoId || "",
      listaPreciosId: row.listaPreciosId || "",
      almacenIds: Array.isArray(row.almacenIds) ? row.almacenIds : [],

      pieHabilitado: !!row.pieHabilitado,
      piePersonalizado: row.piePersonalizado || "",

      codigoPrestador: row.codigoPrestador || "",
      entidadExtranj: row.entidadExtranj || "000000",
      entidadNacional: row.entidadNacional || "000000",
      centroCostos: row.centroCostos || "",
      usuarioSoporteId: row.usuarioSoporteId || "",
      codigoPrestadorPropio: row.codigoPrestadorPropio || "",

      activo: typeof row.activo === "boolean" ? row.activo : true,
    });
    setMode("edit");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm(getEmptyForm());
    setMode("list");
  };

  const validateForm = () => {
    if (!form.nombre.trim()) return "El nombre es obligatorio.";
    if (!form.telefonoFijo.trim()) return "El teléfono fijo es obligatorio.";
    if (!form.celular.trim()) return "El celular es obligatorio.";
    if (!form.ciudad.trim()) return "La ciudad es obligatoria.";
    if (!form.direccion.trim()) return "La dirección es obligatoria.";
    if (!form.email.trim()) return "El correo electrónico es obligatorio.";
    if (!form.consecutivoId) return "Selecciona un consecutivo.";
    if (!form.listaPreciosId) return "Selecciona una lista de precios.";
    return null;
  };

  const save = async (e) => {
    e.preventDefault();
    const err = validateForm();
    if (err) return alert("⚠️ " + err);

    setSaving(true);
    const payload = {
      ...form,
      nombre_busqueda: normalize(form.nombre),
      actualizado: serverTimestamp(),
    };

    try {
      if (editingId) {
        await updateDoc(doc(db, "sucursales", editingId), payload);
      } else {
        await addDoc(collection(db, "sucursales"), {
          ...payload,
          creado: serverTimestamp(),
        });
      }
      await reloadSucursales();
      cancelEdit();
      alert("✅ Sucursal guardada.");
    } catch (e2) {
      console.error("Error guardando sucursal:", e2);
      alert("❌ No se pudo guardar la sucursal.");
    } finally {
      setSaving(false);
    }
  };

  const removeItem = async (row) => {
    if (!window.confirm(`¿Eliminar la sucursal "${row.nombre}"?`)) return;
    try {
      await deleteDoc(doc(db, "sucursales", row.id));
      await reloadSucursales();
      alert("🗑️ Sucursal eliminada.");
    } catch (e) {
      console.error("Error eliminando sucursal:", e);
      alert("❌ No se pudo eliminar.");
    }
  };

  // ======= asociación de usuarios (many-to-many via usuarios.sucursalIds[]) =======
  const openUsersModal = async (sucursalId) => {
    setUsersForSucursalId(sucursalId);
    setUsersModalOpen(true);
    // si la colección usuarios no estaba cargada (vacía por permisos), lo dejamos como []
  };

  const toggleUserForSucursal = async (userId, checked) => {
    // Edición optimista en UI
    setUsuarios((prev) =>
      prev.map((u) =>
        u.id === userId
          ? {
              ...u,
              sucursalIds: checked
                ? Array.from(new Set([...(u.sucursalIds || []), usersForSucursalId]))
                : (u.sucursalIds || []).filter((id) => id !== usersForSucursalId),
            }
          : u
      )
    );
  };

  const persistUsersForSucursal = async () => {
    if (!usersForSucursalId) return;
    setUsersSaving(true);
    try {
      // Guardar sucursalIds en cada usuario
      const updates = usuarios.map(async (u) => {
        const arr = Array.isArray(u.sucursalIds) ? u.sucursalIds : [];
        // No hacemos writes innecesarios: verificamos la versión en servidor
        const ref = doc(db, "usuarios", u.id);
        const snap = await getDoc(ref).catch(() => null);
        const server = snap?.exists() ? snap.data() : {};
        const current = Array.isArray(server?.sucursalIds) ? server.sucursalIds : [];
        // si cambió vs UI:
        const should =
          Array.isArray(u.sucursalIds) ? u.sucursalIds : [];
        const changed =
          current.length !== should.length ||
          current.some((x) => !should.includes(x));
        if (changed) {
          await setDoc(ref, { sucursalIds: should }, { merge: true });
        }
      });
      await Promise.all(updates);
      alert("✅ Usuarios asociados actualizados.");
      setUsersModalOpen(false);
    } catch (e) {
      console.error("Error guardando usuarios por oficina:", e);
      alert("❌ No se pudo actualizar la asociación de usuarios.");
    } finally {
      setUsersSaving(false);
    }
  };

  // ======= UI helpers: doble lista de almacenes =======
  const [almLeftSel, setAlmLeftSel] = useState([]);
  const [almRightSel, setAlmRightSel] = useState([]);

  useEffect(() => {
    // cuando cambio de modo o form, limpio selecciones
    setAlmLeftSel([]);
    setAlmRightSel([]);
  }, [mode, form.almacenIds]);

  const disponibles = useMemo(
    () => almacenes.filter((a) => !(form.almacenIds || []).includes(a.id)),
    [almacenes, form.almacenIds]
  );
  const seleccionados = useMemo(
    () => (form.almacenIds || []).map((id) => almacenes.find((a) => a.id === id)).filter(Boolean),
    [almacenes, form.almacenIds]
  );

  const moveToRight = () => {
    setForm((f) => ({
      ...f,
      almacenIds: Array.from(new Set([...(f.almacenIds || []), ...almLeftSel])),
    }));
    setAlmLeftSel([]);
  };
  const moveToLeft = () => {
    setForm((f) => ({
      ...f,
      almacenIds: (f.almacenIds || []).filter((id) => !almRightSel.includes(id)),
    }));
    setAlmRightSel([]);
  };

  // ======= vistas =======
  if (mode === "new" || mode === "edit") {
    const title = mode === "new" ? "Nueva sucursal" : "Editar sucursal";
    return (
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <h2 style={{ margin: 0 }}>{title}</h2>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="oc-btn" onClick={cancelEdit}>Volver</button>
            <button className="oc-btn primary" form="frmSucursal" disabled={saving}>
              {saving ? "Guardando..." : "Guardar"}
            </button>
          </div>
        </div>

        <div className="card" style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: 16 }}>
          <h3 style={{ marginTop: 0 }}>Información básica</h3>

          <form id="frmSucursal" onSubmit={save} className="oc-form-grid" style={{ display: "grid", gridTemplateColumns: "repeat(2,minmax(0,1fr))", gap: 12 }}>
            <div className="oc-field">
              <label>Nombre *</label>
              <input name="nombre" value={form.nombre} onChange={onChange} required />
            </div>

            <div className="oc-field">
              <label>Teléfono fijo *</label>
              <input name="telefonoFijo" value={form.telefonoFijo} onChange={onChange} required inputMode="tel" />
            </div>

            <div className="oc-field">
              <label>Celular *</label>
              <input name="celular" value={form.celular} onChange={onChange} required inputMode="tel" />
            </div>

            <div className="oc-field">
              <label>Ciudad *</label>
              <input name="ciudad" value={form.ciudad} onChange={onChange} required />
            </div>

            <div className="oc-field oc-col-2">
              <label>Dirección *</label>
              <input name="direccion" value={form.direccion} onChange={onChange} required />
            </div>

            <div className="oc-field">
              <label>Código postal</label>
              <input name="codigoPostal" value={form.codigoPostal} onChange={onChange} />
            </div>

            <div className="oc-field">
              <label>Correo electrónico *</label>
              <input type="email" name="email" value={form.email} onChange={onChange} required />
            </div>

            <div className="oc-field">
              <label>Consecutivo *</label>
              <select name="consecutivoId" value={form.consecutivoId} onChange={onChange} required>
                <option value="">Seleccione...</option>
                {consecutivos.length === 0 && <option value="" disabled>(Sin consecutivos)</option>}
                {consecutivos.map((c) => (
                  <option key={c.id} value={c.id}>{c.nombre || c.id}</option>
                ))}
              </select>
            </div>

            <div className="oc-field">
              <label>Lista de precios *</label>
              <select name="listaPreciosId" value={form.listaPreciosId} onChange={onChange} required>
                <option value="">Seleccione...</option>
                {listas.length === 0 && <option value="" disabled>(Sin listas de precios)</option>}
                {listas.map((l) => (
                  <option key={l.id} value={l.id}>{l.nombre || l.id}</option>
                ))}
              </select>
            </div>

            {/* Almacenes: doble lista */}
            <div className="oc-field oc-col-2">
              <label>Almacenes *</label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: 8 }}>
                <select multiple size={8} value={almLeftSel} onChange={(e) => setAlmLeftSel([...e.target.selectedOptions].map(o => o.value))}>
                  {disponibles.map((a) => (
                    <option key={a.id} value={a.id}>{a.nombre || a.id}</option>
                  ))}
                </select>

                <div style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: "center", justifyContent: "center" }}>
                  <button type="button" className="oc-btn" onClick={moveToRight} title="Agregar →">{">"}</button>
                  <button type="button" className="oc-btn" onClick={moveToLeft} title="← Quitar">{"<"}</button>
                </div>

                <select multiple size={8} value={almRightSel} onChange={(e) => setAlmRightSel([...e.target.selectedOptions].map(o => o.value))}>
                  {seleccionados.map((a) => (
                    <option key={a.id} value={a.id}>{a.nombre || a.id}</option>
                  ))}
                </select>
              </div>
              <small className="oc-muted">Usa los botones para mover almacenes entre “disponibles” y “seleccionados”.</small>
            </div>

            <div className="oc-col-2"><hr style={{ border: "none", borderTop: "1px solid #e5e7eb", margin: "6px 0 2px" }} /></div>
            <h4 className="oc-col-2" style={{ margin: "6px 0" }}>Pie de página en documentos clínicos</h4>

            <div className="oc-field" style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <input id="pieHabilitado" type="checkbox" name="pieHabilitado" checked={form.pieHabilitado} onChange={onChange} />
              <label htmlFor="pieHabilitado">Datos de sucursal en pie de pág. doc. clínicos</label>
            </div>

            <div className="oc-field oc-col-2">
              <label>Pie de página personalizado doc. clínicos</label>
              <input name="piePersonalizado" value={form.piePersonalizado} onChange={onChange} placeholder="Texto opcional que se mostrará en el pie de página" />
            </div>

            <div className="oc-col-2"><hr style={{ border: "none", borderTop: "1px solid #e5e7eb", margin: "6px 0 2px" }} /></div>
            <h4 className="oc-col-2" style={{ margin: "6px 0" }}>Información administrativa</h4>

            <div className="oc-field">
              <label>Código del prestador de servicio</label>
              <input name="codigoPrestador" value={form.codigoPrestador} onChange={onChange} />
            </div>

            <div className="oc-field">
              <label>Código de prestador propio</label>
              <input name="codigoPrestadorPropio" value={form.codigoPrestadorPropio} onChange={onChange} />
            </div>

            <div className="oc-field">
              <label>Entidad Administradora Extranjeros</label>
              <input name="entidadExtranj" value={form.entidadExtranj} onChange={onChange} />
            </div>

            <div className="oc-field">
              <label>Entidad Administradora Nacionales</label>
              <input name="entidadNacional" value={form.entidadNacional} onChange={onChange} />
            </div>

            <div className="oc-field">
              <label>Centro de costos</label>
              <input name="centroCostos" value={form.centroCostos} onChange={onChange} />
            </div>

            <div className="oc-field">
              <label>Usuario para soporte</label>
              <select name="usuarioSoporteId" value={form.usuarioSoporteId} onChange={onChange}>
                <option value="">Ninguno</option>
                {usuarios.map((u) => (
                  <option key={u.id} value={u.id}>{u.displayName || u.nombre || u.email || u.id}</option>
                ))}
              </select>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // ======= vista listado =======
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <h2 style={{ margin: 0 }}>Sucursales</h2>
        <div style={{ display: "flex", gap: 8 }}>
          <input
            placeholder="Buscar por nombre, teléfono, dirección, ciudad, correo…"
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            className="search-input"
            style={{ minWidth: 260 }}
          />
          <button className="oc-btn primary" onClick={startNew}>+ Nueva sucursal</button>
        </div>
      </div>

      <div className="card" style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: 16 }}>
        {loading ? (
          <div className="oc-muted">Cargando…</div>
        ) : filtered.length === 0 ? (
          <div className="oc-muted">Sin sucursales.</div>
        ) : (
          <div className="table-wrap">
            <table className="appointments-table">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th style={{ width: 120 }}>Teléfono</th>
                  <th>Dirección</th>
                  <th>Correo</th>
                  <th style={{ width: 140 }}>Usuarios por oficina</th>
                  <th style={{ width: 180 }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => {
                  const count = (usuarios || []).filter((u) => (u.sucursalIds || []).includes(r.id)).length;
                  return (
                    <tr key={r.id}>
                      <td>{r.nombre}</td>
                      <td className="mono">{r.telefonoFijo || r.celular || "—"}</td>
                      <td>{r.direccion}</td>
                      <td className="mono">{r.email}</td>
                      <td>
                        <button className="oc-btn small" onClick={() => openUsersModal(r.id)}>
                          👁️ Ver ({count})
                        </button>
                      </td>
                      <td>
                        <div style={{ display: "flex", gap: 8 }}>
                          <button className="oc-btn small" onClick={() => startEdit(r)}>Editar</button>
                          <button className="oc-btn danger small" onClick={() => removeItem(r)}>Eliminar</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal usuarios por oficina */}
      {usersModalOpen && (
        <div
          style={{
            position: "fixed", inset: 0, background: "rgba(0,0,0,.5)",
            display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999
          }}
        >
          <div style={{ background: "#fff", borderRadius: 12, width: 560, maxWidth: "95%", maxHeight: "90vh", overflow: "auto", padding: 16, border: "1px solid #e5e7eb" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <h3 style={{ margin: 0 }}>Usuarios asociados</h3>
              <div style={{ display: "flex", gap: 8 }}>
                <button className="oc-btn" onClick={() => setUsersModalOpen(false)}>Cerrar</button>
                <button className="oc-btn primary" onClick={persistUsersForSucursal} disabled={usersSaving}>
                  {usersSaving ? "Guardando..." : "Guardar"}
                </button>
              </div>
            </div>

            {usuarios.length === 0 ? (
              <div className="oc-muted">No hay usuarios para asociar.</div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 120px", gap: 8 }}>
                {usuarios.map((u) => {
                  const checked = (u.sucursalIds || []).includes(usersForSucursalId);
                  return (
                    <React.Fragment key={u.id}>
                      <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={(e) => toggleUserForSucursal(u.id, e.target.checked)}
                        />
                        <span>{u.displayName || u.nombre || u.email || u.id}</span>
                      </label>
                      <span className="oc-muted mono" style={{ alignSelf: "center" }}>{u.email || ""}</span>
                    </React.Fragment>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
