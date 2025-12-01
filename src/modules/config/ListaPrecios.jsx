// ===============================
// 🧾 ListaPrecios.jsx
// Configuración → Lista de precios (Clínicos + Productos unificados estilo OralDrive)
// ===============================
import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  collection, getDocs, addDoc, updateDoc, deleteDoc, doc
} from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";

// Si más adelante quieres usar tu componente propio de productos,
// puedes importarlo y enchufarlo dentro de <ListaProductosInline />
// import ListaPreciosProductos from "./ListaPreciosProductos";

// ---------- helpers ----------
function getDashBase(pathname = "") {
  const segs = pathname.split("/").filter(Boolean);
  const i = segs.findIndex((s) => s.startsWith("dashboard_"));
  return i >= 0 ? `/${segs.slice(0, i + 1).join("/")}` : "";
}

// ---------- estilos inline unificados ----------
function useInlineStyles() {
  useEffect(() => {
    const ID = "lp-oraldrive-unificado";
    if (document.getElementById(ID)) return;
    const css = `
      .lp-wrap{padding:0;}
      .lp-h2{margin:0 0 12px;font-weight:800;font-size:20px;color:#0f172a;}

      /* Tabs arriba */
      .lp-tabs{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:14px;}
      .lp-pill{padding:7px 16px;border-radius:999px;border:1px solid #d1d5db;background:#fff;
        font-weight:600;color:#374151;cursor:pointer;font-size:14px;transition:.2s;}
      .lp-pill:hover{background:#f3f4f6;}
      .lp-pill.active{background:#2b6cb0;color:#fff;border-color:#2b6cb0;}

      /* Card y encabezados internos */
      .lp-card{background:#fff;border:1px solid #e5e7eb;border-radius:10px;padding:18px;box-shadow:0 1px 2px rgba(0,0,0,.04);}
      .lp-card-header{display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;margin-bottom:12px;}
      .lp-subtitle{font-size:16px;font-weight:800;color:#111827;margin:0 0 8px;border-bottom:1px solid #e5e7eb;padding-bottom:6px;}

      /* Botón chip y botón principal */
      .chip{display:inline-flex;align-items:center;gap:8px;height:34px;padding:0 12px;border-radius:999px;border:1px solid #d1d5db;
        background:#fff;color:#374151;font-weight:600;cursor:pointer;transition:.2s;white-space:nowrap;}
      .chip:hover{background:#f3f4f6;}
      .btn-primary{display:inline-flex;align-items:center;gap:8px;height:40px;padding:0 16px;border-radius:999px;border:none;cursor:pointer;
        font-weight:700;font-size:14px;white-space:nowrap;background:#84cc16;color:#fff;}
      .btn-primary:hover{filter:brightness(.97);}

      /* Inputs */
      .lp-input{height:36px;border:1px solid #d1d5db;border-radius:8px;padding:0 12px;outline:none;font-size:14px;background:#fff;}
      .lp-input:focus{border-color:#9ca3af;box-shadow:0 0 0 3px rgba(148,163,184,.15);}

      /* Tabla */
      .lp-table-wrap{overflow-x:hidden;width:100%;}
      .lp-card table{width:100%;border-collapse:collapse;table-layout:fixed;font-size:14px;}
      thead tr{background:#f9fafb;}
      th,td{padding:8px 10px;white-space:normal;word-break:break-word;vertical-align:middle;}
      th{text-align:left;border-bottom:1px solid #e5e7eb;font-weight:700;color:#475569;}
      tbody tr{border-top:1px solid #f1f5f9;}
      .muted{color:#6b7280;}

      /* Badges y acciones */
      .badge{display:inline-block;padding:5px 10px;border-radius:999px;font-weight:700;font-size:12px;line-height:1;white-space:nowrap;}
      .badge.green{background:#e8f7ee;color:#16a34a;border:1px solid #cbead7;}
      .btn-soft{display:inline-flex;align-items:center;gap:6px;height:36px;padding:0 14px;border-radius:999px;border:none;cursor:pointer;
        font-weight:700;font-size:13px;white-space:nowrap;background:#22c55e;color:#fff;}
      .btn-soft:hover{filter:brightness(.95);}

      .lp-actions{display:flex;gap:8px;flex-wrap:wrap;justify-content:flex-start;}
      .iconbtn{display:inline-flex;align-items:center;justify-content:center;width:34px;height:30px;border-radius:8px;border:none;cursor:pointer;transition:.2s;}
      .iconbtn.green{background:#ecfdf5;color:#16a34a;border:1px solid #bbf7d0;}
      .iconbtn.blue{background:#eff6ff;color:#2563eb;border:1px solid #bfdbfe;}
      .iconbtn.red{background:#fef2f2;color:#dc2626;border:1px solid #fecaca;}
      .iconbtn:hover{filter:brightness(.97);}
      .iconbtn svg{width:16px;height:16px;}
    `;
    const tag = document.createElement("style");
    tag.id = ID;
    tag.appendChild(document.createTextNode(css));
    document.head.appendChild(tag);
  }, []);
}

// ===============================
// CLÍNICOS
// ===============================
function ListaClinicosInline() {
  const [loading, setLoading] = useState(true);
  const [listas, setListas] = useState([]);
  const [modo, setModo] = useState("list");
  const [nombre, setNombre] = useState("");

  const { pathname } = useLocation();
  const navigate = useNavigate();
  const baseDash = useMemo(() => getDashBase(pathname), [pathname]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const snap = await getDocs(collection(db, "listas_precios"));
        const arr = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        arr.sort((a, b) => (String(b.actualizado||b.creado||"")).localeCompare(String(a.actualizado||a.creado||"")));
        setListas(arr);
      } finally { setLoading(false); }
    })();
  }, []);

  const crear = async () => {
    if (!nombre.trim()) return alert("Escribe el nombre de la lista.");
    const ahora = new Date().toLocaleString("es-CO");
    const data = { nombre: nombre.trim(), creado: ahora, actualizado: ahora, en_uso: false, tipo: "clinicos" };
    const ref = await addDoc(collection(db, "listas_precios"), data);
    setListas((prev) => [{ id: ref.id, ...data }, ...prev]);
    setNombre(""); setModo("list");
  };

  const usar = async (row) => {
    const snap = await getDocs(collection(db, "listas_precios"));
    await Promise.all(snap.docs.map((d) => updateDoc(doc(db, "listas_precios", d.id), { en_uso: d.id === row.id })));
    setListas((prev) => prev.map((x) => ({ ...x, en_uso: x.id === row.id })));
  };

  const eliminar = async (row) => {
    if (!window.confirm(`¿Eliminar "${row?.nombre}"?`)) return;
    await deleteDoc(doc(db, "listas_precios", row.id));
    setListas((prev) => prev.filter((x) => x.id !== row.id));
  };

  const clonar = async (row) => {
    const ahora = new Date().toLocaleString("es-CO");
    const { id, ...base } = row;
    const payload = { ...base, nombre: `${row?.nombre || "Lista"} (copia)`, en_uso: false, creado: ahora, actualizado: ahora };
    const ref = await addDoc(collection(db, "listas_precios"), payload);
    setListas((prev) => [{ id: ref.id, ...payload }, ...prev]);
  };

  const irEditar = (row) => navigate(`${baseDash}/config/lista-de-precios/editar/${row.id}`);

  const EditIcon  = () => (<svg viewBox="0 0 24 24" fill="currentColor"><path d="M5 19h4l9-9-4-4-9 9v4zM14.5 6.5l3 3"/></svg>);
  const CopyIcon  = () => (<svg viewBox="0 0 24 24" fill="currentColor"><path d="M16 1H4a2 2 0 0 0-2 2v12h2V3h12V1zm3 4H8a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2zm0 16H8V7h11v14z"/></svg>);
  const TrashIcon = () => (<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 7h12l-1 14H7L6 7zm3-4h6l1 2H8l1-2z"/></svg>);
  const CheckIcon = () => (<svg viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.2 4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4z"/></svg>);

  return (
    <div className="lp-card">
      <h3 className="lp-subtitle">Lista de precios clínicos</h3>

      {modo === "list" ? (
        <>
          <div className="lp-card-header">
            <div></div>
            <div style={{ display: "flex", gap: 8 }}>
              <button className="chip" onClick={() => setModo("nuevo")}>
                <span style={{ fontWeight: 800, fontSize: 16 }}>＋</span> Nuevo listado de precios
              </button>
              <button className="chip" onClick={() => alert("Exportar plantilla (próximamente)")}>
                Exportar plantilla
              </button>
            </div>
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
                  <tr><td colSpan={5} style={{ textAlign: "center" }}>Cargando…</td></tr>
                ) : listas.length === 0 ? (
                  <tr><td colSpan={5} style={{ textAlign: "center" }} className="muted">Sin datos</td></tr>
                ) : (
                  listas.map((r) => (
                    <tr key={r.id}>
                      <td style={{ fontWeight: 600 }}>{r?.nombre || "—"}</td>
                      <td>{r?.creado || "—"}</td>
                      <td>{r?.actualizado || "—"}</td>
                      <td>
                        {r?.en_uso ? (
                          <span className="badge green">En uso</span>
                        ) : (
                          <button className="btn-soft" onClick={() => usar(r)}>
                            <CheckIcon /> Usar
                          </button>
                        )}
                      </td>
                      <td>
                        <div className="lp-actions">
                          <button className="iconbtn green" title="Clonar" onClick={() => clonar(r)}><CopyIcon /></button>
                          <button className="iconbtn blue"  title="Editar" onClick={() => irEditar(r)}><EditIcon /></button>
                          <button className="iconbtn red"   title="Eliminar" onClick={() => eliminar(r)}><TrashIcon /></button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <div>
          <div className="lp-card-header">
            <h4 style={{ margin: 0, fontWeight: 700 }}>Nueva lista de precios</h4>
            <button
              className="chip"
              onClick={() => setModo("list")}
            >← Volver</button>
          </div>

          <div style={{ display: "flex", gap: 10, alignItems: "center", maxWidth: 560, marginTop: 10 }}>
            <input
              className="lp-input"
              type="text"
              placeholder="Nombre de la lista"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              style={{ flex: 1 }}
            />
            <button
              type="button"
              title="Sugerir nombre automático"
              className="chip"
              onClick={() => setNombre("Lista de precios " + new Date().toLocaleDateString("es-CO"))}
            >
              ⓘ
            </button>
            <button className="btn-soft" onClick={crear}>Guardar</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ===============================
// PRODUCTOS (UI unificada; sin botón duplicado dentro)
// ===============================
function ListaProductosInline() {
  // Si luego conectas Firestore para productos, reemplaza estos estados
  const [rows] = useState([]); // aquí pintarás tus productos
  const [q, setQ] = useState("");

  const AddIcon = () => (<svg viewBox="0 0 24 24" fill="currentColor"><path d="M11 11V5h2v6h6v2h-6v6h-2v-6H5v-2z"/></svg>);
  const EditIcon= () => (<svg viewBox="0 0 24 24" fill="currentColor"><path d="M5 19h4l9-9-4-4-9 9v4zM14.5 6.5l3 3"/></svg>);
  const CopyIcon= () => (<svg viewBox="0 0 24 24" fill="currentColor"><path d="M16 1H4a2 2 0 0 0-2 2v12h2V3h12V1zm3 4H8a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2zm0 16H8V7h11v14z"/></svg>);
  const TrashIcon= () => (<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 7h12l-1 14H7L6 7zm3-4h6l1 2H8l1-2z"/></svg>);

  return (
    <div className="lp-card">
      <h3 className="lp-subtitle">Lista de precios productos</h3>

      {/* Header tipo OralDrive: búsqueda + botón verde */}
      <div className="lp-card-header">
        <input
          className="lp-input"
          placeholder="Buscar…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          style={{ minWidth: 220 }}
        />
        <button className="btn-primary" onClick={() => alert("Nuevo producto (próximamente)")}>
          <AddIcon /> Nuevo producto
        </button>
      </div>

      <div className="lp-table-wrap">
        <table>
          <thead>
            <tr>
              <th style={{ width: "32%" }}>Nombre</th>
              <th style={{ width: "18%" }}>Marca</th>
              <th>Descripción</th>
              <th style={{ width: "18%" }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={4} style={{ textAlign: "center", padding: 18 }} className="muted">
                  Sin datos
                </td>
              </tr>
            ) : (
              rows.map((r) => (
                <tr key={r.id}>
                  <td style={{ fontWeight: 600 }}>{r.nombre}</td>
                  <td>{r.marca || "—"}</td>
                  <td>{r.descripcion || "—"}</td>
                  <td>
                    <div className="lp-actions">
                      <button className="iconbtn green" title="Clonar"><CopyIcon /></button>
                      <button className="iconbtn blue"  title="Editar"><EditIcon /></button>
                      <button className="iconbtn red"   title="Eliminar"><TrashIcon /></button>
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

// ===============================
// CONTENEDOR PRINCIPAL
// ===============================
export default function ListaPrecios() {
  useInlineStyles();
  const [tab, setTab] = useState("clinicos");

  return (
    <div className="lp-wrap">
      <h2 className="lp-h2">Configuración · Lista de precios</h2>

      {/* Pestañas superiores (únicas) */}
      <div className="lp-tabs">
        <button className={`lp-pill ${tab === "clinicos" ? "active" : ""}`} onClick={() => setTab("clinicos")}>
          Lista de precios clínicos
        </button>
        <button className={`lp-pill ${tab === "productos" ? "active" : ""}`} onClick={() => setTab("productos")}>
          Lista de precios productos
        </button>
        <button className={`lp-pill ${tab === "servicios" ? "active" : ""}`} onClick={() => setTab("servicios")}>
          Lista de precios servicios
        </button>
      </div>

      {/* Contenido por pestaña (sin botones duplicados adentro) */}
      {tab === "productos" ? (
        <ListaProductosInline />
      ) : tab === "servicios" ? (
        <div className="lp-card">
          <h3 className="lp-subtitle">Lista de precios servicios</h3>
          <p className="muted">Próximamente</p>
        </div>
      ) : (
        <ListaClinicosInline />
      )}
    </div>
  );
}
