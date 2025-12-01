// ===============================
// 🧾 ListaPrecios.jsx
// Configuración → Lista de precios (pestañas internas)
// - Pestañas: clínicos / productos / servicios
// - Clínicos: tu listado de listas (como lo tenías)
// - Productos: usa ListaPreciosProductos.jsx
// ===============================
import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  collection, getDocs, addDoc, updateDoc, deleteDoc, doc
} from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";

// 👉 importa la pantalla de productos (la que ya pegaste antes)
import ListaPreciosProductos from "./ListaPreciosProductos";

// ---------- helpers de ruta ----------
function getDashBase(pathname = "") {
  const segs = pathname.split("/").filter(Boolean);
  const i = segs.findIndex((s) => s.startsWith("dashboard_"));
  return i >= 0 ? `/${segs.slice(0, i + 1).join("/")}` : "";
}
function getConfigSegs(pathname = "") {
  const idx = pathname.toLowerCase().indexOf("/config/");
  if (idx === -1) return [];
  const rest = pathname.slice(idx + "/config/".length);
  return rest.split("/").filter(Boolean); // p.ej. ["lista-de-precios","productos"]
}

// ---------- estilos locales mínimos (no tocan tu CSS global) ----------
function useInlineStyles() {
  useEffect(() => {
    const ID = "lp-tabs-inline";
    if (document.getElementById(ID)) return;
    const css = `
      .lp-wrap { padding: 0; }
      .lp-card { background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:16px }
      .lp-tabs{display:flex;gap:8px;align-items:center;margin-bottom:14px}
      .lp-pill{height:34px;padding:0 14px;border-radius:999px;border:1px solid #e5e7eb;background:#f8fafc;cursor:pointer;font-weight:700}
      .lp-pill.active{background:#3b82f6;color:#fff;border-color:#3b82f6}
      .lp-h2{margin:0 0 12px 0;font-weight:800;font-size:20px;color:#0f172a}

      .lp-table-wrap{width:100%;overflow:auto}
      table{width:100%;border-collapse:collapse}
      thead tr{background:#f1f5f9}
      th,td{padding:10px 12px;white-space:nowrap}
      th{text-align:left;border-bottom:1px solid #e2e8f0;color:#475569;font-weight:800}
      tbody tr + tr{border-top:1px solid #e2e8f0}
      .muted{color:#64748b}
      .btn{padding:8px 12px;border:none;border-radius:10px;font-weight:700;color:#fff;cursor:pointer}
      .btn.blue{background:#3b82f6}
      .btn.green{background:#22c55e}
      .btn.red{background:#ef4444}
      .btn.gray{background:#64748b}
    `;
    const tag = document.createElement("style");
    tag.id = ID;
    tag.appendChild(document.createTextNode(css));
    document.head.appendChild(tag);
  }, []);
}

// ==========================================================
// VISTA CLÍNICOS (igual a tu lista anterior, manteniendo UX)
// ==========================================================
function ListaClinicos() {
  // estado
  const [loading, setLoading] = useState(true);
  const [listas, setListas] = useState([]);

  // carga (ajusta colecciones si las tienes distintas)
  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const snap = await getDocs(collection(db, "listas_precios"));
        const arr = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        // ordena por actualizado/creado descendente si existe; si no, por nombre
        arr.sort((a, b) => {
          const da = a.actualizado || a.creado || "";
          const dbb = b.actualizado || b.creado || "";
          if (da && dbb) return String(dbb).localeCompare(String(da));
          return (a?.nombre || "").localeCompare(b?.nombre || "");
        });
        setListas(arr);
      } catch (e) {
        console.error("[LP Clinicos] cargar:", e?.code, e?.message);
        setListas([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function crearLista() {
    try {
      const nombre = `Lista de precios ${new Date().toLocaleDateString("es-CO")}`;
      const ref = await addDoc(collection(db, "listas_precios"), {
        nombre,
        creado: new Date().toLocaleString("es-CO"),
        actualizado: new Date().toLocaleString("es-CO"),
        en_uso: false,
      });
      setListas((prev) => [{ id: ref.id, nombre, en_uso: false }, ...prev]);
    } catch (e) {
      console.error(e);
      alert("No se pudo crear el listado.");
    }
  }

  async function setEnUso(row) {
    try {
      // desactiva todas y activa esta
      const snap = await getDocs(collection(db, "listas_precios"));
      const ops = snap.docs.map((d) =>
        updateDoc(doc(db, "listas_precios", d.id), { en_uso: d.id === row.id })
      );
      await Promise.all(ops);
      setListas((prev) => prev.map((x) => ({ ...x, en_uso: x.id === row.id })));
    } catch (e) {
      console.error(e);
      alert("No se pudo cambiar el estado de uso.");
    }
  }

  async function eliminarLista(row) {
    if (!window.confirm(`¿Eliminar "${row?.nombre}"?`)) return;
    try {
      await deleteDoc(doc(db, "listas_precios", row.id));
      setListas((prev) => prev.filter((x) => x.id !== row.id));
    } catch (e) {
      console.error(e);
      alert("No se pudo eliminar.");
    }
  }

  const navigate = useNavigate();
  const { pathname } = useLocation();
  const baseDash = useMemo(() => getDashBase(pathname), [pathname]);
  const irEditar = (row) => navigate(`${baseDash}/config/lista-de-precios/editar/${row.id}`);

  return (
    <div className="lp-card">
      {/* Título dentro de la tarjeta */}
      <div className="lp-tabs" style={{ justifyContent: "space-between" }}>
        <div style={{ display: "flex", gap: 8 }}>
          <span className="lp-pill active">Lista de precios clínicos</span>
          <span className="lp-pill" style={{ pointerEvents: "none", opacity: .5 }}>Lista de precios productos</span>
          <span className="lp-pill" style={{ pointerEvents: "none", opacity: .5 }}>Lista de precios servicios</span>
        </div>
        <button className="btn blue" onClick={crearLista}>+ Nuevo listado de precios</button>
      </div>

      <div className="lp-table-wrap">
        <table>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Fecha de creación</th>
              <th>Fecha de actualización</th>
              <th>En uso</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} style={{ textAlign: "center", padding: 20 }}>Cargando…</td></tr>
            ) : listas.length === 0 ? (
              <tr><td colSpan={5} style={{ textAlign: "center", padding: 20 }}><span className="muted">Sin datos</span></td></tr>
            ) : (
              listas.map((r) => (
                <tr key={r.id}>
                  <td style={{ fontWeight: 700 }}>{r?.nombre || "—"}</td>
                  <td>{r?.creado || "—"}</td>
                  <td>{r?.actualizado || "—"}</td>
                  <td style={{ color: r?.en_uso ? "#16a34a" : "#64748b" }}>
                    {r?.en_uso ? "En uso" : "—"}
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button className="btn blue" onClick={() => irEditar(r)}>Editar</button>
                      <button className="btn green" onClick={() => setEnUso(r)}>Usar</button>
                      <button className="btn red" onClick={() => eliminarLista(r)}>Eliminar</button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ==========================================================
// CONTENEDOR con pestañas internas y navegación por URL
// ==========================================================
export default function ListaPrecios() {
  useInlineStyles();

  const { pathname } = useLocation();
  const navigate = useNavigate();
  const baseDash = useMemo(() => getDashBase(pathname), [pathname]);
  const segs = getConfigSegs(pathname); // ["lista-de-precios", ...]
  const sub = segs[1] || "";            // "" | "productos" | "servicios"

  const irClinicos  = () => navigate(`${baseDash}/config/lista-de-precios`);
  const irProductos = () => navigate(`${baseDash}/config/lista-de-precios/productos`);
  const irServicios = () => navigate(`${baseDash}/config/lista-de-precios/servicios`);

  const isClinicos  = sub === "" || sub === "clinicos";
  const isProductos = sub === "productos";
  const isServicios = sub === "servicios";

  return (
    <div className="lp-wrap">
      <h2 className="lp-h2">Configuración · Lista de precios</h2>

      {/* Pestañas (clic navega cambiando SOLO lo que hay dentro) */}
      <div className="lp-tabs" style={{ marginTop: 4 }}>
        <button className={`lp-pill ${isClinicos ? "active" : ""}`} onClick={irClinicos}>
          Lista de precios clínicos
        </button>
        <button className={`lp-pill ${isProductos ? "active" : ""}`} onClick={irProductos}>
          Lista de precios productos
        </button>
        <button className={`lp-pill ${isServicios ? "active" : ""}`} onClick={irServicios}>
          Lista de precios servicios
        </button>
      </div>

      {/* Contenido según pestaña */}
      {isProductos ? (
        <ListaPreciosProductos />
      ) : isServicios ? (
        <div className="lp-card">
          <p className="muted" style={{ margin: 0 }}>Módulo de servicios — próximamente.</p>
        </div>
      ) : (
        <ListaClinicos /> /* clínicos por defecto */
      )}
    </div>
  );
}
