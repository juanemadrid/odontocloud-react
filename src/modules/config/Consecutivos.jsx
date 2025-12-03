// ===============================
// 🔢 Consecutivos.jsx
// Listado + botón "Nuevo" → formulario (como Sucursales)
// Guarda en Firestore colección: "consecutivos"
// ===============================
import React, { useEffect, useMemo, useState } from "react";
import { db } from "../../firebase/firebaseConfig";
import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";

const normalize = (s) =>
  (s || "")
    .toString()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim();

const toInt = (v) => {
  const n = parseInt(String(v || "0").replace(/\D/g, ""), 10);
  return isNaN(n) || n < 0 ? 0 : n;
};

export default function Consecutivos() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [term, setTerm] = useState("");

  const [mode, setMode] = useState("list"); // "list" | "form"
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    nombre: "",

    contReciboCaja: 0,
    contNotaCredito: 0,
    contNotaDebito: 0,
    contEgresos: 0,
    contPresupuestos: 0,
    contPlanTratamiento: 0,
    contOrdenesCompra: 0,
    contCuentasPorCobrar: 0,
    contUsoSaldoAFavor: 0,
    contUsoNotasCredito: 0,
    contRipsAutomatizados: 0,
    numRipsRes2275: 0,

    datosManuales: false,
    facturaCompra: false,
    facturaVenta: false,
    facturacionElectronica: false,

    enUso: false,
  });

  const resetForm = () =>
    setForm({
      nombre: "",
      contReciboCaja: 0,
      contNotaCredito: 0,
      contNotaDebito: 0,
      contEgresos: 0,
      contPresupuestos: 0,
      contPlanTratamiento: 0,
      contOrdenesCompra: 0,
      contCuentasPorCobrar: 0,
      contUsoSaldoAFavor: 0,
      contUsoNotasCredito: 0,
      contRipsAutomatizados: 0,
      numRipsRes2275: 0,
      datosManuales: false,
      facturaCompra: false,
      facturaVenta: false,
      facturacionElectronica: false,
      enUso: false,
    });

  const load = async () => {
    setLoading(true);
    try {
      const qRef = query(collection(db, "consecutivos"), orderBy("nombre", "asc"));
      const snap = await getDocs(qRef);
      const rows = snap.docs.map((d) => ({ id: d.id, ...(d.data() || {}) }));
      setItems(rows);
    } catch (e) {
      console.error("Error leyendo consecutivos:", e);
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
    return items.filter((x) => normalize(`${x.nombre}`).includes(t));
  }, [items, term]);

  const onBool = (name) => (e) =>
    setForm((f) => ({ ...f, [name]: !!e.target.checked }));

  const onNum = (name) => (e) =>
    setForm((f) => ({ ...f, [name]: toInt(e.target.value) }));

  const onText = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const startCreate = () => {
    setEditingId(null);
    resetForm();
    setMode("form");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const startEdit = (row) => {
    setEditingId(row.id);
    setForm({
      nombre: row.nombre || "",
      contReciboCaja: row.contReciboCaja ?? 0,
      contNotaCredito: row.contNotaCredito ?? 0,
      contNotaDebito: row.contNotaDebito ?? 0,
      contEgresos: row.contEgresos ?? 0,
      contPresupuestos: row.contPresupuestos ?? 0,
      contPlanTratamiento: row.contPlanTratamiento ?? 0,
      contOrdenesCompra: row.contOrdenesCompra ?? 0,
      contCuentasPorCobrar: row.contCuentasPorCobrar ?? 0,
      contUsoSaldoAFavor: row.contUsoSaldoAFavor ?? 0,
      contUsoNotasCredito: row.contUsoNotasCredito ?? 0,
      contRipsAutomatizados: row.contRipsAutomatizados ?? 0,
      numRipsRes2275: row.numRipsRes2275 ?? 0,
      datosManuales: !!row.datosManuales,
      facturaCompra: !!row.facturaCompra,
      facturaVenta: !!row.facturaVenta,
      facturacionElectronica: !!row.facturacionElectronica,
      enUso: !!row.enUso,
    });
    setMode("form");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const cancelForm = () => {
    setEditingId(null);
    resetForm();
    setMode("list");
  };

  const save = async (e) => {
    e?.preventDefault?.();

    const payload = {
      ...form,
      contReciboCaja: toInt(form.contReciboCaja),
      contNotaCredito: toInt(form.contNotaCredito),
      contNotaDebito: toInt(form.contNotaDebito),
      contEgresos: toInt(form.contEgresos),
      contPresupuestos: toInt(form.contPresupuestos),
      contPlanTratamiento: toInt(form.contPlanTratamiento),
      contOrdenesCompra: toInt(form.contOrdenesCompra),
      contCuentasPorCobrar: toInt(form.contCuentasPorCobrar),
      contUsoSaldoAFavor: toInt(form.contUsoSaldoAFavor),
      contUsoNotasCredito: toInt(form.contUsoNotasCredito),
      contRipsAutomatizados: toInt(form.contRipsAutomatizados),
      numRipsRes2275: toInt(form.numRipsRes2275),
      nombre_busqueda: normalize(form.nombre),
      actualizado: serverTimestamp(),
    };

    if (!payload.nombre?.trim()) return alert("El nombre del consecutivo es obligatorio.");

    try {
      if (editingId) {
        await updateDoc(doc(db, "consecutivos", editingId), payload);
      } else {
        await addDoc(collection(db, "consecutivos"), {
          ...payload,
          creado: serverTimestamp(),
        });
      }

      // Si queda en uso, apaga el resto
      if (payload.enUso) {
        try {
          const snap = await getDocs(collection(db, "consecutivos"));
          await Promise.all(
            snap.docs
              .filter((d) => d.id !== (editingId || ""))
              .map((d) => updateDoc(d.ref, { enUso: false }))
          );
        } catch {}
      }

      await load();
      cancelForm(); // vuelve al listado
      alert("✅ Consecutivo guardado.");
    } catch (err) {
      console.error("Error guardando consecutivo:", err);
      alert("❌ No se pudo guardar el consecutivo.");
    }
  };

  const removeItem = async (row) => {
    if (!window.confirm(`¿Eliminar el consecutivo "${row.nombre}"?`)) return;
    try {
      await deleteDoc(doc(db, "consecutivos", row.id));
      await load();
      alert("🗑️ Consecutivo eliminado.");
    } catch (e) {
      console.error("Error eliminando consecutivo:", e);
      alert("❌ No se pudo eliminar.");
    }
  };

  /* ---------- UI helpers ---------- */
  const NumInput = ({ label, name, value, onChange }) => (
    <div className="oc-field">
      <label>{label}</label>
      <input
        name={name}
        value={String(value ?? 0)}
        onChange={onChange}
        inputMode="numeric"
        pattern="[0-9]*"
        placeholder="0"
      />
    </div>
  );

  const Switch = ({ label, name, checked, onChange }) => (
    <label className="oc-switch" style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <input type="checkbox" checked={!!checked} onChange={onChange} />
      <span>{label}</span>
    </label>
  );

  /* ---------- Render ---------- */
  const renderForm = () => (
    <div className="card" style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: 16 }}>
      <h3 style={{ marginTop: 0 }}>{editingId ? "Editar consecutivo" : "Nuevo consecutivo"}</h3>

      <form onSubmit={save} className="oc-form-grid" style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0,1fr))", gap: 12 }}>
        <div className="oc-field oc-col-2">
          <label>Nombre *</label>
          <input name="nombre" value={form.nombre} onChange={onText} required placeholder="Nombre del consecutivo" />
        </div>

        <NumInput label="Cont. Recibo de caja" name="contReciboCaja" value={form.contReciboCaja} onChange={onNum("contReciboCaja")} />
        <NumInput label="Cont. Nota crédito" name="contNotaCredito" value={form.contNotaCredito} onChange={onNum("contNotaCredito")} />
        <NumInput label="Cont. Nota débito" name="contNotaDebito" value={form.contNotaDebito} onChange={onNum("contNotaDebito")} />
        <NumInput label="Cont. Egresos" name="contEgresos" value={form.contEgresos} onChange={onNum("contEgresos")} />
        <NumInput label="Cont. Presupuestos" name="contPresupuestos" value={form.contPresupuestos} onChange={onNum("contPresupuestos")} />
        <NumInput label="Cont. Plan de tratamiento" name="contPlanTratamiento" value={form.contPlanTratamiento} onChange={onNum("contPlanTratamiento")} />
        <NumInput label="Cont. Órdenes de compra" name="contOrdenesCompra" value={form.contOrdenesCompra} onChange={onNum("contOrdenesCompra")} />
        <NumInput label="Cont. Cuentas por cobrar" name="contCuentasPorCobrar" value={form.contCuentasPorCobrar} onChange={onNum("contCuentasPorCobrar")} />
        <NumInput label="Cont. uso saldo a favor" name="contUsoSaldoAFavor" value={form.contUsoSaldoAFavor} onChange={onNum("contUsoSaldoAFavor")} />
        <NumInput label="Cont. uso notas crédito" name="contUsoNotasCredito" value={form.contUsoNotasCredito} onChange={onNum("contUsoNotasCredito")} />
        <NumInput label="Cont. RIPS automatizados" name="contRipsAutomatizados" value={form.contRipsAutomatizados} onChange={onNum("contRipsAutomatizados")} />
        <NumInput label="Num. RIPS (Res. 2275)" name="numRipsRes2275" value={form.numRipsRes2275} onChange={onNum("numRipsRes2275")} />

        <div className="oc-col-2" />

        <div className="oc-col-2" style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0,1fr))", gap: 12 }}>
          <Switch label="¿Datos manuales consecutivo?" name="datosManuales" checked={form.datosManuales} onChange={onBool("datosManuales")} />
          <Switch label="Factura de compra" name="facturaCompra" checked={form.facturaCompra} onChange={onBool("facturaCompra")} />
          <Switch label="Factura de venta" name="facturaVenta" checked={form.facturaVenta} onChange={onBool("facturaVenta")} />
          <Switch label="Facturación electrónica" name="facturacionElectronica" checked={form.facturacionElectronica} onChange={onBool("facturacionElectronica")} />
          <Switch label="Marcar como 'En uso' (por defecto)" name="enUso" checked={form.enUso} onChange={onBool("enUso")} />
        </div>

        <div className="oc-form-actions oc-col-2" style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 8 }}>
          <button type="button" className="oc-btn" onClick={cancelForm}>Cancelar</button>
          <button type="submit" className="oc-btn primary">Guardar</button>
        </div>
      </form>
    </div>
  );

  const renderList = () => (
    <div className="card" style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, marginBottom: 10 }}>
        <h3 style={{ margin: 0 }}>Consecutivos</h3>
        <div style={{ display: "flex", gap: 8 }}>
          <input
            placeholder="Buscar por nombre…"
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            className="search-input"
            style={{ minWidth: 240 }}
          />
          <button className="oc-btn primary" onClick={startCreate}>+ Nuevo consecutivo</button>
        </div>
      </div>

      {loading ? (
        <div className="oc-muted">Cargando…</div>
      ) : filtered.length === 0 ? (
        <div className="oc-muted">Sin consecutivos.</div>
      ) : (
        <div className="table-wrap">
          <table className="appointments-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th className="mono" style={{ width: 110 }}>RIPS 2275</th>
                <th style={{ width: 90 }}>En uso</th>
                <th style={{ width: 180 }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.id}>
                  <td>{r.nombre}</td>
                  <td className="mono">{r.numRipsRes2275 ?? 0}</td>
                  <td>{r.enUso ? "Sí" : "No"}</td>
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
  );

  return (
    <div>
      <h2 style={{ marginTop: 0 }}>Consecutivos</h2>
      {mode === "form" ? renderForm() : renderList()}
    </div>
  );
}
