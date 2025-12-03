// ===============================
// 🧾 ListaPrecioProductoEditar.jsx
// Edición de producto de “Lista de precios productos”
// - Carga/guarda el producto principal
// - Subcolecciones:
//     productos/{id}/conversiones
//     productos/{id}/stock_por_almacen
// - Solo muestra “Factores de conversión” y “Stock por almacén” en modo edición (ya existe id)
// ===============================
import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  doc, getDoc, updateDoc, collection, getDocs, addDoc, deleteDoc
} from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";

/* ---------- helpers ---------- */
function getDashBase(pathname = "") {
  const segs = pathname.split("/").filter(Boolean);
  const i = segs.findIndex((s) => s.startsWith("dashboard_"));
  return i >= 0 ? `/${segs.slice(0, i + 1).join("/")}` : "";
}
const fmt = (n) => Number(n || 0).toLocaleString("es-CO");

/* ---------- estilos (reutiliza clases del listado) ---------- */
function useInlineStyles() {
  useEffect(() => {
    const ID = "lp-prod-edit-styles";
    document.getElementById(ID)?.remove();
    const css = `
      .lp-card{background:#fff;border:1px solid #e5e7eb;border-radius:10px;padding:18px;box-shadow:0 1px 2px rgba(0,0,0,.04)}
      .lp-h2{margin:0 0 12px;font-weight:800;font-size:20px;color:#0f172a}
      .lp-subtitle{font-size:16px;font-weight:800;color:#111827;margin:0 0 8px;border-bottom:1px solid #e5e7eb;padding-bottom:6px}
      .chip{display:inline-flex;align-items:center;gap:8px;height:34px;padding:0 12px;border-radius:999px;border:1px solid #d1d5db;background:#fff;color:#374151;font-weight:600;cursor:pointer}
      .btn-soft{display:inline-flex;align-items:center;gap:6px;height:32px;padding:0 12px;border-radius:999px;border:none;cursor:pointer;font-weight:700;font-size:13px;background:#22c55e;color:#fff}
      .btn-soft.gray{background:#6b7280}
      .np-grid{display:grid;grid-template-columns:1fr;gap:12px;margin-top:6px}
      .np-row{display:grid;grid-template-columns:1fr 1fr;gap:10px}
      .np-row-3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px}
      .np-field{display:flex;flex-direction:column;gap:6px}
      .np-label{font-weight:700;color:#334155;font-size:13px}
      .np-input,.np-select,.np-text{border:1px solid #d1d5db;border-radius:8px;padding:8px 10px;font-size:14px;background:#fff}
      .np-text{min-height:72px;resize:vertical}
      .np-toggle{display:flex;align-items:center;gap:10px}
      .np-actions{display:flex;gap:10px;justify-content:flex-end;margin-top:14px}
      .tbl{width:100%;border-collapse:collapse;font-size:14px}
      .tbl thead tr{background:#f9fafb}
      .tbl th,.tbl td{padding:8px 10px;vertical-align:middle;border-top:1px solid #eef2f7}
      .right{text-align:right}
      .muted{color:#6b7280}
      @media (max-width:900px){ .np-row,.np-row-3{grid-template-columns:1fr} }
    `;
    const tag = document.createElement("style");
    tag.id = ID;
    tag.appendChild(document.createTextNode(css));
    document.head.appendChild(tag);
  }, []);
}

/* ---------- colecciones ---------- */
const COL = "listas_precios_productos";
const prodDoc = (id) => doc(db, COL, id);
const colConversiones = (id) => collection(db, COL, id, "conversiones");
const colStock = (id) => collection(db, COL, id, "stock_por_almacen");

export default function ListaPrecioProductoEditar() {
  useInlineStyles();

  const { id } = useParams();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const baseDash = useMemo(() => getDashBase(pathname), [pathname]);
  const backToList = () => navigate(`${baseDash}/config/lista-de-precios`);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // ---- producto base ----
  const init = {
    nombre: "", referencia: "", descripcion: "",
    cuentaContable: "", categoria: "",
    esServicio: false, precioCompra: "",
    marca: "", principioActivo: "", registroInvima: "",
    formaFarmaceutica: "", concentracion: "", presentacionComercial: "",
    tempAlmacenamiento: "", unidadTemperatura: "",
    humedadAlmacenamiento: "", unidadHumedad: "",
    esInventariable: false, clasificacionRiesgo: "", vidaUtil: "",
    periodicidadMantenimiento: "", periodicidadCalibracion: "",
    extTexto1: "", extTexto2: "", extNumero1: "", extNumero2: "",
    extFecha1: "", extFecha2: "", imgPreview: null,
  };
  const [f, setF] = useState(init);

  // ---- subtablas ----
  const [convs, setConvs] = useState([]); // conversiones
  const [stocks, setStocks] = useState([]); // stock por almacén

  // formularios inline para agregar filas
  const [convForm, setConvForm] = useState({ unidadBase: "Unidades", unidadEq: "", factor: "" });
  const [stockForm, setStockForm] = useState({
    almacenNombre: "", stockActual: "", unidadMedida: "Unidad",
    stockMin: "", stockMax: "", esVendible: true, esInventariable: false,
    precioVenta: "", impuestoId: ""
  });

  // ===== cargar =====
  useEffect(() => {
    (async () => {
      if (!id) return;
      setLoading(true);
      try {
        const d = await getDoc(prodDoc(id));
        if (d.exists()) setF({ ...init, ...d.data() });
        // subcolecciones
        const convSnap = await getDocs(colConversiones(id)).catch(() => null);
        const stockSnap = await getDocs(colStock(id)).catch(() => null);
        setConvs(convSnap ? convSnap.docs.map(x => ({ id: x.id, ...x.data() })) : []);
        setStocks(stockSnap ? stockSnap.docs.map(x => ({ id: x.id, ...x.data() })) : []);
      } finally { setLoading(false); }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // ===== guardar producto base =====
  const guardar = async () => {
    if (!id) return;
    if (!f.nombre.trim()) return alert("El nombre es obligatorio.");
    setSaving(true);
    try {
      await updateDoc(prodDoc(id), {
        ...f,
        precioCompra: f.precioCompra === "" ? 0 : Number(f.precioCompra),
        actualizado: new Date().toISOString(),
      });
      alert("Producto actualizado.");
    } catch (e) {
      console.error(e);
      alert("No se pudo actualizar el producto.");
    } finally { setSaving(false); }
  };

  // ===== conversión =====
  const addConv = async () => {
    if (!id) return;
    const factor = Number(convForm.factor);
    if (!convForm.unidadEq.trim() || !Number.isFinite(factor) || factor <= 0) {
      return alert("Completa unidad equivalente y factor (>0).");
    }
    const payload = {
      unidadBase: convForm.unidadBase || "Unidades",
      unidadEq: convForm.unidadEq.trim(),
      factor,
      creado: new Date().toISOString(),
    };
    const ref = await addDoc(colConversiones(id), payload);
    setConvs((p) => [...p, { id: ref.id, ...payload }]);
    setConvForm({ unidadBase: "Unidades", unidadEq: "", factor: "" });
  };
  const delConv = async (row) => {
    if (!id) return;
    if (!window.confirm(`¿Eliminar conversión "${row.unidadEq}"?`)) return;
    await deleteDoc(doc(colConversiones(id), row.id));
    setConvs((p) => p.filter((x) => x.id !== row.id));
  };

  // ===== stock por almacén =====
  const addStock = async () => {
    if (!id) return;
    if (!stockForm.almacenNombre.trim()) return alert("Selecciona/ingresa un almacén.");
    const payload = {
      almacenNombre: stockForm.almacenNombre.trim(),
      stockActual: Number(stockForm.stockActual || 0),
      unidadMedida: stockForm.unidadMedida || "Unidad",
      stockMin: Number(stockForm.stockMin || 0),
      stockMax: Number(stockForm.stockMax || 0),
      esVendible: !!stockForm.esVendible,
      esInventariable: !!stockForm.esInventariable,
      precioVenta: Number(stockForm.precioVenta || 0),
      impuestoId: stockForm.impuestoId || "",
      creado: new Date().toISOString(),
    };
    const ref = await addDoc(colStock(id), payload);
    setStocks((p) => [...p, { id: ref.id, ...payload }]);
    setStockForm({
      almacenNombre: "", stockActual: "", unidadMedida: "Unidad",
      stockMin: "", stockMax: "", esVendible: true, esInventariable: false,
      precioVenta: "", impuestoId: ""
    });
  };
  const delStock = async (row) => {
    if (!id) return;
    if (!window.confirm(`¿Eliminar línea de almacén "${row.almacenNombre}"?`)) return;
    await deleteDoc(doc(colStock(id), row.id));
    setStocks((p) => p.filter((x) => x.id !== row.id));
  };

  return (
    <div>
      <h2 className="lp-h2">Editar producto</h2>

      <div className="lp-card" style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 8, flexWrap: "wrap" }}>
          <button className="chip" onClick={backToList}>← Volver</button>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn-soft gray" onClick={backToList}>Cancelar</button>
            <button className="btn-soft" onClick={guardar} disabled={saving}>{saving ? "Guardando…" : "Guardar"}</button>
          </div>
        </div>

        {loading ? (
          <p className="muted" style={{ marginTop: 12 }}>Cargando…</p>
        ) : (
          <div className="np-grid" style={{ marginTop: 10 }}>
            <div className="np-row">
              <div className="np-field">
                <label className="np-label">Nombre*</label>
                <input className="np-input" value={f.nombre} onChange={e=>setF({...f,nombre:e.target.value})} />
              </div>
              <div className="np-field">
                <label className="np-label">Referencia</label>
                <input className="np-input" value={f.referencia || ""} onChange={e=>setF({...f,referencia:e.target.value})} />
              </div>
            </div>

            <div className="np-field">
              <label className="np-label">Descripción</label>
              <textarea className="np-text" value={f.descripcion || ""} onChange={e=>setF({...f,descripcion:e.target.value})} />
            </div>

            <div className="np-row">
              <div className="np-field">
                <label className="np-label">Cuenta contable</label>
                <input className="np-input" value={f.cuentaContable || ""} onChange={e=>setF({...f,cuentaContable:e.target.value})} />
              </div>
              <div className="np-field">
                <label className="np-label">Categoría</label>
                <input className="np-input" value={f.categoria || ""} onChange={e=>setF({...f,categoria:e.target.value})} placeholder="Medicamentos / Insumos / Equipos…" />
              </div>
            </div>

            <div className="np-row">
              <div className="np-field np-toggle">
                <label className="np-label" style={{ margin: 0 }}>¿Es servicio?</label>
                <input type="checkbox" checked={!!f.esServicio} onChange={e=>setF({...f,esServicio:e.target.checked})} />
              </div>
              <div className="np-field">
                <label className="np-label">Precio compra*</label>
                <input className="np-input" type="number" value={f.precioCompra ?? ""} onChange={e=>setF({...f,precioCompra:e.target.value})} placeholder="$0" />
              </div>
            </div>

            <div className="np-row">
              <div className="np-field"><label className="np-label">Marca</label>
                <input className="np-input" value={f.marca || ""} onChange={e=>setF({...f,marca:e.target.value})} />
              </div>
              <div className="np-field"><label className="np-label">Principio activo</label>
                <input className="np-input" value={f.principioActivo || ""} onChange={e=>setF({...f,principioActivo:e.target.value})} />
              </div>
            </div>

            <div className="np-row">
              <div className="np-field"><label className="np-label">Registro Invima</label>
                <input className="np-input" value={f.registroInvima || ""} onChange={e=>setF({...f,registroInvima:e.target.value})} />
              </div>
              <div className="np-field"><label className="np-label">Forma farmacéutica</label>
                <input className="np-input" value={f.formaFarmaceutica || ""} onChange={e=>setF({...f,formaFarmaceutica:e.target.value})} />
              </div>
            </div>

            <div className="np-row">
              <div className="np-field"><label className="np-label">Concentración</label>
                <input className="np-input" value={f.concentracion || ""} onChange={e=>setF({...f,concentracion:e.target.value})} />
              </div>
              <div className="np-field"><label className="np-label">Presentación comercial</label>
                <input className="np-input" value={f.presentacionComercial || ""} onChange={e=>setF({...f,presentacionComercial:e.target.value})} />
              </div>
            </div>

            <div className="np-row-3">
              <div className="np-field"><label className="np-label">Temperatura de almacenamiento</label>
                <input className="np-input" value={f.tempAlmacenamiento || ""} onChange={e=>setF({...f,tempAlmacenamiento:e.target.value})} />
              </div>
              <div className="np-field"><label className="np-label">Unidad de temperatura</label>
                <input className="np-input" value={f.unidadTemperatura || ""} onChange={e=>setF({...f,unidadTemperatura:e.target.value})} />
              </div>
              <div className="np-field"><label className="np-label">Humedad de almacenamiento</label>
                <input className="np-input" value={f.humedadAlmacenamiento || ""} onChange={e=>setF({...f,humedadAlmacenamiento:e.target.value})} />
              </div>
            </div>

            <div className="np-row">
              <div className="np-field"><label className="np-label">Unidad de humedad</label>
                <input className="np-input" value={f.unidadHumedad || ""} onChange={e=>setF({...f,unidadHumedad:e.target.value})} />
              </div>
              <div className="np-field np-toggle">
                <label className="np-label" style={{ margin: 0 }}>¿Es inventariable?</label>
                <input type="checkbox" checked={!!f.esInventariable} onChange={e=>setF({...f,esInventariable:e.target.checked})} />
              </div>
            </div>

            <div className="np-row">
              <div className="np-field"><label className="np-label">Clasificación de riesgo</label>
                <input className="np-input" value={f.clasificacionRiesgo || ""} onChange={e=>setF({...f,clasificacionRiesgo:e.target.value})} />
              </div>
              <div className="np-field"><label className="np-label">Vida útil</label>
                <input className="np-input" value={f.vidaUtil || ""} onChange={e=>setF({...f,vidaUtil:e.target.value})} />
              </div>
            </div>

            <div className="np-row">
              <div className="np-field"><label className="np-label">Periodicidad mantenimiento</label>
                <input className="np-input" value={f.periodicidadMantenimiento || ""} onChange={e=>setF({...f,periodicidadMantenimiento:e.target.value})} />
              </div>
              <div className="np-field"><label className="np-label">Periodicidad calibración</label>
                <input className="np-input" value={f.periodicidadCalibracion || ""} onChange={e=>setF({...f,periodicidadCalibracion:e.target.value})} />
              </div>
            </div>

            <div className="np-row">
              <div className="np-field"><label className="np-label">Extensión texto 1</label>
                <input className="np-input" value={f.extTexto1 || ""} onChange={e=>setF({...f,extTexto1:e.target.value})} />
              </div>
              <div className="np-field"><label className="np-label">Extensión texto 2</label>
                <input className="np-input" value={f.extTexto2 || ""} onChange={e=>setF({...f,extTexto2:e.target.value})} />
              </div>
            </div>

            <div className="np-row">
              <div className="np-field"><label className="np-label">Extensión número 1</label>
                <input className="np-input" type="number" value={f.extNumero1 || ""} onChange={e=>setF({...f,extNumero1:e.target.value})} />
              </div>
              <div className="np-field"><label className="np-label">Extensión número 2</label>
                <input className="np-input" type="number" value={f.extNumero2 || ""} onChange={e=>setF({...f,extNumero2:e.target.value})} />
              </div>
            </div>

            <div className="np-row">
              <div className="np-field"><label className="np-label">Extensión fecha 1</label>
                <input className="np-input" type="date" value={f.extFecha1 || ""} onChange={e=>setF({...f,extFecha1:e.target.value})} />
              </div>
              <div className="np-field"><label className="np-label">Extensión fecha 2</label>
                <input className="np-input" type="date" value={f.extFecha2 || ""} onChange={e=>setF({...f,extFecha2:e.target.value})} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ====== SOLO EN EDICIÓN: bloques extra ====== */}
      {!!id && (
        <>
          {/* FACTORES DE CONVERSIÓN */}
          <div className="lp-card" style={{ marginBottom: 16 }}>
            <h3 className="lp-subtitle">Factores de conversión</h3>

            <table className="tbl" style={{ marginBottom: 12 }}>
              <thead>
                <tr>
                  <th>Unidad base</th>
                  <th>Unidad equivalente</th>
                  <th className="right">Factor</th>
                  <th className="right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {convs.length === 0 ? (
                  <tr><td colSpan={4} className="muted">Sin conversiones.</td></tr>
                ) : convs.map((r) => (
                  <tr key={r.id}>
                    <td>{r.unidadBase}</td>
                    <td>{r.unidadEq}</td>
                    <td className="right">{fmt(r.factor)}</td>
                    <td className="right">
                      <button className="chip" onClick={() => delConv(r)}>Eliminar</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="np-row">
              <div className="np-field">
                <label className="np-label">Unidad base</label>
                <input className="np-input" value={convForm.unidadBase} onChange={e=>setConvForm({...convForm,unidadBase:e.target.value})} />
              </div>
              <div className="np-field">
                <label className="np-label">Unidad equivalente</label>
                <input className="np-input" placeholder="Caja (12), Blíster (10)…" value={convForm.unidadEq} onChange={e=>setConvForm({...convForm,unidadEq:e.target.value})} />
              </div>
            </div>
            <div className="np-row">
              <div className="np-field" style={{ maxWidth: 220 }}>
                <label className="np-label">Factor</label>
                <input className="np-input" type="number" min="0" step="1" value={convForm.factor} onChange={e=>setConvForm({...convForm,factor:e.target.value})} />
              </div>
              <div className="np-field" style={{ alignSelf: "end" }}>
                <button className="btn-soft" onClick={addConv}>+ Nuevo factor de conversión</button>
              </div>
            </div>
          </div>

          {/* STOCK POR ALMACÉN */}
          <div className="lp-card" style={{ marginBottom: 16 }}>
            <h3 className="lp-subtitle">Stock por almacén</h3>

            <table className="tbl" style={{ marginBottom: 12 }}>
              <thead>
                <tr>
                  <th>Almacén</th>
                  <th className="right">Stock actual</th>
                  <th>Unidad</th>
                  <th className="right">Stock mín/máx</th>
                  <th>Vendible</th>
                  <th>Inventariable</th>
                  <th className="right">Precio venta</th>
                  <th>Impuesto</th>
                  <th className="right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {stocks.length === 0 ? (
                  <tr><td colSpan={9} className="muted">Sin datos.</td></tr>
                ) : stocks.map((r) => (
                  <tr key={r.id}>
                    <td>{r.almacenNombre}</td>
                    <td className="right">{fmt(r.stockActual)}</td>
                    <td>{r.unidadMedida}</td>
                    <td className="right">{fmt(r.stockMin)} / {fmt(r.stockMax)}</td>
                    <td>{r.esVendible ? "Sí" : "No"}</td>
                    <td>{r.esInventariable ? "Sí" : "No"}</td>
                    <td className="right">${fmt(r.precioVenta)}</td>
                    <td>{r.impuestoId || "—"}</td>
                    <td className="right">
                      <button className="chip" onClick={() => delStock(r)}>Eliminar</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="np-row">
              <div className="np-field">
                <label className="np-label">Almacén</label>
                <input className="np-input" placeholder="Nombre del almacén / sede" value={stockForm.almacenNombre} onChange={e=>setStockForm({...stockForm,almacenNombre:e.target.value})} />
              </div>
              <div className="np-field">
                <label className="np-label">Unidad de medida</label>
                <input className="np-input" value={stockForm.unidadMedida} onChange={e=>setStockForm({...stockForm,unidadMedida:e.target.value})} />
              </div>
            </div>

            <div className="np-row-3">
              <div className="np-field">
                <label className="np-label">Stock actual</label>
                <input className="np-input" type="number" value={stockForm.stockActual} onChange={e=>setStockForm({...stockForm,stockActual:e.target.value})} />
              </div>
              <div className="np-field">
                <label className="np-label">Stock mínimo</label>
                <input className="np-input" type="number" value={stockForm.stockMin} onChange={e=>setStockForm({...stockForm,stockMin:e.target.value})} />
              </div>
              <div className="np-field">
                <label className="np-label">Stock máximo</label>
                <input className="np-input" type="number" value={stockForm.stockMax} onChange={e=>setStockForm({...stockForm,stockMax:e.target.value})} />
              </div>
            </div>

            <div className="np-row">
              <div className="np-field">
                <label className="np-label">Precio de venta</label>
                <input className="np-input" type="number" value={stockForm.precioVenta} onChange={e=>setStockForm({...stockForm,precioVenta:e.target.value})} />
              </div>
              <div className="np-field">
                <label className="np-label">Impuesto (id / nombre)</label>
                <input className="np-input" value={stockForm.impuestoId} onChange={e=>setStockForm({...stockForm,impuestoId:e.target.value})} placeholder="IVA 19%, EXENTO…" />
              </div>
            </div>

            <div className="np-row">
              <div className="np-field np-toggle">
                <label className="np-label" style={{ margin: 0 }}>¿Es vendible?</label>
                <input type="checkbox" checked={!!stockForm.esVendible} onChange={e=>setStockForm({...stockForm,esVendible:e.target.checked})} />
              </div>
              <div className="np-field np-toggle">
                <label className="np-label" style={{ margin: 0 }}>¿Es inventariable?</label>
                <input type="checkbox" checked={!!stockForm.esInventariable} onChange={e=>setStockForm({...stockForm,esInventariable:e.target.checked})} />
              </div>
              <div className="np-field" style={{ alignSelf: "end" }}>
                <button className="btn-soft" onClick={addStock}>Añadir</button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
