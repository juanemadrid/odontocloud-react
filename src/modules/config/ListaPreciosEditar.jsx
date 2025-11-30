// ===============================
// 💰 ListaPreciosEditar.jsx
// Edición de una lista de precios (categorías + acciones)
// ===============================
import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  doc, getDoc, updateDoc, collection, getDocs, addDoc, deleteDoc
} from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";

// helpers de ruta
function getDashBase(pathname = "") {
  const segs = pathname.split("/").filter(Boolean);
  const i = segs.findIndex((s) => s.startsWith("dashboard_"));
  return i >= 0 ? `/${segs.slice(0, i + 1).join("/")}` : "";
}

// estilos mínimos para que se vea igual aunque el CSS global no cargue
function useInlineStyles() {
  useEffect(() => {
    const ID = "lp-edit-inline";
    if (document.getElementById(ID)) return;
    const css = `
      .oc-main-content.lp { padding:16px 20px }
      .oc-section-title { margin-bottom:16px }
      .oc-section-title h2 { margin:0; font-weight:800; font-size:20px; color:#0f172a }
      .card { background:#fff; border:1px solid #e5e7eb; border-radius:10px; padding:16px; box-shadow:0 2px 8px rgba(0,0,0,.04) }
      .toolbar { display:flex; gap:8px; align-items:center; }
      .chip { height:34px; padding:0 12px; border-radius:999px; border:1px solid #e5e7eb; cursor:pointer; font-weight:600 }
      .chip.blue { background:#eff6ff }
      .chip.green { background:#65a30d; color:#fff; border:none }
      .name-row { display:flex; align-items:center; gap:8px; }
      .text-inp { height:38px; padding:0 10px; border-radius:8px; border:1px solid #cbd5e1; outline:none; width:280px }
      .table-responsive { width:100%; overflow-x:auto }
      table { width:100%; border-collapse:collapse; font-size:.9rem }
      thead tr { background:#f1f5f9 }
      th, td { padding:10px 12px; white-space:nowrap }
      th { text-align:left; border-bottom:1px solid #e2e8f0; color:#475569; font-weight:700 }
      tr + tr { border-top:1px solid #e2e8f0 }
      .btn { padding:4px 8px; border:none; border-radius:6px; color:#fff; cursor:pointer; margin-right:6px }
      .btn.blue { background:#3b82f6 }
      .btn.sky { background:#06b6d4 }
      .btn.green { background:#22c55e }
      .btn.orange { background:#f59e0b }
      .btn.red { background:#ef4444 }
      .status-pill { padding:2px 8px; border-radius:999px; font-weight:600 }
      .status-on { background:#dcfce7; color:#166534 }
      .status-off{ background:#fee2e2; color:#991b1b }
      @media (max-width:640px){ .text-inp{ width:100% } }
    `;
    const tag = document.createElement("style");
    tag.id = ID;
    tag.appendChild(document.createTextNode(css));
    document.head.appendChild(tag);
  }, []);
}

export default function ListaPreciosEditar() {
  useInlineStyles();

  const { id } = useParams(); // id de la lista
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const baseDash = useMemo(() => getDashBase(pathname), [pathname]);
  const baseConfig = `${baseDash}/config/lista-de-precios`;

  const [nombre, setNombre] = useState("");
  const [saving, setSaving] = useState(false);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);

  // cargar cabecera (nombre) y categorías — manejo de errores mejorado
  useEffect(() => {
    async function loadAll() {
      setLoading(true);

      // 1️⃣ Cargar documento principal
      try {
        const ref = doc(db, "listas_precios", id);
        const snap = await getDoc(ref);
        if (!snap.exists()) {
          console.warn("[LP editar] El documento NO existe:", id);
          setNombre(""); // seguimos mostrando la pantalla
        } else {
          setNombre(snap.data().nombre || "");
        }
      } catch (e) {
        console.error("[LP editar] Error getDoc listas_precios/" + id, e.code, e.message);
        setNombre("");
      }

      // 2️⃣ Cargar categorías (si falla, seguimos con vacío)
      try {
        const catRef = collection(db, "listas_precios", id, "categorias");
        const catSnap = await getDocs(catRef);
        const rows = catSnap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
          activa: d.data().activa ?? true,
        }));
        rows.sort((a, b) => (a.nombre || "").localeCompare(b.nombre || ""));
        setCategorias(rows);
      } catch (e) {
        console.warn("[LP editar] No se pudieron leer categorías (seguimos con vacío)", e.code, e.message);
        setCategorias([]);
      } finally {
        setLoading(false);
      }
    }
    loadAll();
  }, [id]);

  async function guardarNombre() {
    try {
      setSaving(true);
      await updateDoc(doc(db, "listas_precios", id), {
        nombre: (nombre || "").trim(),
        actualizado: new Date().toLocaleString("es-CO"),
      });
    } catch (e) {
      console.error(e);
      alert("No se pudo actualizar el nombre.");
    } finally {
      setSaving(false);
    }
  }

  async function agregarCategoria() {
    const nom = prompt("Nombre de la categoría:");
    if (!nom) return;
    try {
      const catRef = collection(db, "listas_precios", id, "categorias");
      await addDoc(catRef, {
        nombre: nom.trim(),
        comentario: "",
        activa: true,
        creado: new Date().toLocaleString("es-CO"),
      });
      const catSnap = await getDocs(catRef);
      setCategorias(
        catSnap.docs.map((d) => ({ id: d.id, ...d.data(), activa: d.data().activa ?? true }))
      );
    } catch (e) {
      console.error(e);
      alert("No se pudo agregar la categoría.");
    }
  }

  async function toggleActiva(cat) {
    try {
      await updateDoc(doc(db, "listas_precios", id, "categorias", cat.id), {
        activa: !cat.activa,
      });
      setCategorias((cs) =>
        cs.map((c) => (c.id === cat.id ? { ...c, activa: !c.activa } : c))
      );
    } catch (e) {
      console.error(e);
      alert("No se pudo cambiar el estado.");
    }
  }

  async function duplicar(cat) {
    try {
      const catRef = collection(db, "listas_precios", id, "categorias");
      await addDoc(catRef, {
        ...cat,
        nombre: `${cat.nombre || "Categoría"} (copia)`,
        creado: new Date().toLocaleString("es-CO"),
      });
      const catSnap = await getDocs(catRef);
      setCategorias(
        catSnap.docs.map((d) => ({ id: d.id, ...d.data(), activa: d.data().activa ?? true }))
      );
    } catch (e) {
      console.error(e);
      alert("No se pudo duplicar.");
    }
  }

  async function eliminar(cat) {
    if (!confirm(`¿Eliminar categoría "${cat.nombre}"?`)) return;
    try {
      await deleteDoc(doc(db, "listas_precios", id, "categorias", cat.id));
      setCategorias((cs) => cs.filter((c) => c.id !== cat.id));
    } catch (e) {
      console.error(e);
      alert("No se pudo eliminar.");
    }
  }

  return (
    <div className="oc-main-content lp">
      <div className="oc-section-title">
        <h2>Configuración · Edición Lista de precios</h2>
      </div>

      <div className="card">
        {/* barra superior: nombre + botones */}
        <div className="toolbar" style={{ justifyContent: "space-between", marginBottom: 12 }}>
          <div className="name-row">
            <label style={{ fontWeight: 700 }}>Nombre*</label>
            <input
              className="text-inp"
              value={nombre}
              placeholder="Principal"
              onChange={(e) => setNombre(e.target.value)}
            />
            <button
              className="btn green"
              onClick={guardarNombre}
              disabled={saving}
              title="Guardar nombre"
            >
              {saving ? "Guardando…" : "Guardar"}
            </button>
          </div>

          <div style={{ display: "flex", gap: 8 }}>
            <button className="chip blue" title="Exportar" onClick={() => alert("Exportar…")}>
              Exportar
            </button>
            <button className="chip" title="Opciones" onClick={() => alert("Opciones…")}>
              ⚙️
            </button>
            <button className="chip green" onClick={agregarCategoria}>
              + Agregar categoría
            </button>
          </div>
        </div>

        {/* tabla de categorías */}
        <div className="table-responsive">
          <table>
            <thead>
              <tr>
                <th style={{ width: 40 }}></th>
                <th>Categoría</th>
                <th>Comentario</th>
                <th style={{ width: 140 }}>Estado</th>
                <th style={{ width: 220, textAlign: "right" }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: "center", padding: 20 }}>
                    Cargando…
                  </td>
                </tr>
              ) : categorias.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: "center", padding: 20 }}>
                    Sin categorías.
                  </td>
                </tr>
              ) : (
                categorias.map((c) => (
                  <tr key={c.id}>
                    <td>▾</td>
                    <td style={{ fontWeight: 700 }}>{c.nombre || "Categoría"}</td>
                    <td style={{ color: "#475569" }}>{c.comentario || "—"}</td>
                    <td>
                      <span className={`status-pill ${c.activa ? "status-on" : "status-off"}`}>
                        {c.activa ? "Conectado" : "Desconectado"}
                      </span>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <button className="btn green" title="Agregar ítem" onClick={() => alert("Agregar ítem…")}>＋</button>
                      <button className="btn orange" title="Descuento %" onClick={() => alert("Descuento…")}>%</button>
                      <button className="btn sky" title="Duplicar" onClick={() => duplicar(c)}>↗</button>
                      <button className="btn red" title="Eliminar" onClick={() => eliminar(c)}>B</button>
                      <button
                        className="btn blue"
                        title={c.activa ? "Desactivar" : "Activar"}
                        onClick={() => toggleActiva(c)}
                        style={{ marginLeft: 6 }}
                      >
                        {c.activa ? "⏻" : "▶"}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* volver */}
        <div style={{ marginTop: 16 }}>
          <button className="chip" onClick={() => navigate(baseConfig)}>← Volver</button>
        </div>
      </div>
    </div>
  );
}
