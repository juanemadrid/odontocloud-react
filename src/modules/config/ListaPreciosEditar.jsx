// ===============================
// 💰 ListaPreciosEditar.jsx
// Edición de una lista de precios (categorías + items + export + incremento %)
// ===============================
import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  doc, getDoc, updateDoc, collection, getDocs, addDoc, deleteDoc, setDoc
} from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";

// ---------- helpers de ruta ----------
function getDashBase(pathname = "") {
  const segs = pathname.split("/").filter(Boolean);
  const i = segs.findIndex((s) => s.startsWith("dashboard_"));
  return i >= 0 ? `/${segs.slice(0, i + 1).join("/")}` : "";
}

// ---------- catálogo por defecto ----------
const DEFAULT_CATS = [
  { nombre: "Rehabilitación Oral", comentario: "" },
  { nombre: "Implantología", comentario: "" },
  { nombre: "Cirugía Oral", comentario: "" },
  { nombre: "Periodoncia", comentario: "" },
  { nombre: "Endodoncia", comentario: "" },
  { nombre: "Ortodoncia", comentario: "" },
  { nombre: "Odontología General", comentario: "" },
  { nombre: "Radiología", comentario: "" },
  { nombre: "Psicología", comentario: "" },
];

// ---------- estilos inline mínimos ----------
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

      /* Chips */
      .chip { height:34px; padding:0 12px; border-radius:999px; border:1px solid #e5e7eb; cursor:pointer; font-weight:600; background:#f9fafb; transition:.15s }
      .chip:hover { background:#e5e7eb }
      .chip.blue   { background:#3b82f6; color:#fff; border:none }
      .chip.green  { background:#22c55e; color:#fff; border:none }
      .chip.orange { background:#f59e0b; color:#fff; border:none }
      .chip.indigo { background:#6366f1; color:#fff; border:none }
      .chip.gray   { background:#64748b; color:#fff; border:none }

      .name-row { display:flex; align-items:center; gap:8px; }
      .text-inp { height:38px; padding:0 10px; border-radius:8px; border:1px solid #cbd5e1; outline:none; width:280px }

      .table-responsive { width:100%; overflow-x:auto }
      table { width:100%; border-collapse:collapse; font-size:.9rem }
      thead tr { background:#f1f5f9 }
      th, td { padding:10px 12px; white-space:nowrap }
      th { text-align:left; border-bottom:1px solid #e2e8f0; color:#475569; font-weight:700 }
      tr + tr { border-top:1px solid #e2e8f0 }

      /* Botones fila */
      .btn { padding:4px 8px; border:none; border-radius:6px; color:#fff; cursor:pointer; margin-right:6px; font-weight:600; transition:.12s }
      .btn:hover { opacity:.9 }
      .btn.blue   { background:#3b82f6 }
      .btn.sky    { background:#06b6d4 }
      .btn.green  { background:#22c55e }
      .btn.orange { background:#f59e0b }
      .btn.red    { background:#ef4444 }
      .btn.sm { height:32px; padding:0 10px; border-radius:8px }

      .status-pill { padding:2px 8px; border-radius:999px; font-weight:600 }
      .status-on { background:#dcfce7; color:#166534 }
      .status-off{ background:#fee2e2; color:#991b1b }
      .muted { color:#64748b }

      /* Modal base */
      .modal-mask{position:fixed;inset:0;background:rgba(0,0,0,.35);display:flex;align-items:center;justify-content:center;z-index:999}
      .modal{background:#fff;border-radius:12px;box-shadow:0 10px 30px rgba(0,0,0,.2);width:min(840px,92vw);padding:0;border:1px solid #e5e7eb}
      .modal .hd{padding:12px 16px;border-bottom:1px solid #e5e7eb;font-weight:700}
      .modal .bd{padding:16px}
      .modal .ft{padding:12px 16px;border-top:1px solid #e5e7eb;display:flex;gap:8px;justify-content:flex-end}

      /* Pestañas modal Categoría */
      .tabs{display:flex;gap:6px;border-bottom:1px solid #e5e7eb;margin-bottom:12px;padding:0 4px}
      .tab{padding:8px 10px;border-radius:8px 8px 0 0;border:1px solid #e5e7eb;border-bottom:none;background:#f8fafc;cursor:pointer;font-weight:700;color:#334155}
      .tab.active{background:#3b82f6;color:#fff;border-color:#3b82f6}

      .row{display:flex;gap:10px;align-items:center;margin-bottom:10px}
      .inp{height:36px;border:1px solid #cbd5e1;border-radius:8px;padding:0 10px;outline:none}
      .ta{border:1px solid #cbd5e1;border-radius:8px;padding:8px;min-height:80px;outline:none}

      /* —— Estilos del modal de Incremento —— */
      .field-col{display:flex;flex-direction:column;gap:6px;width:100%}
      .label-strong{font-weight:700;color:#0f172a}
      .percent-row{display:flex;align-items:center;gap:10px}
      .prefix{width:40px;height:36px;border:1px solid #cbd5e1;border-radius:8px;background:#f8fafc;display:flex;align-items:center;justify-content:center;color:#334155;font-weight:700}
      .num-inp{height:36px;border:1px solid #cbd5e1;border-radius:8px;padding:0 10px;outline:none;flex:1;min-width:160px}
      .checks{display:flex;flex-direction:column;gap:10px;margin-top:6px}
      .check-row{display:flex;align-items:center;gap:10px}
      .check-row input{width:18px;height:18px}

      @media (max-width:640px){
        .text-inp{ width:100% }
        .row{flex-direction:column;align-items:stretch}
        .percent-row{flex-direction:row}
      }
    `;
    const tag = document.createElement("style");
    tag.id = ID;
    tag.appendChild(document.createTextNode(css));
    document.head.appendChild(tag);
  }, []);
}

// ---------- componente ----------
export default function ListaPreciosEditar() {
  useInlineStyles();

  const { id } = useParams();
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const baseDash = useMemo(() => getDashBase(pathname), [pathname]);
  const baseConfig = `${baseDash}/config/lista-de-precios`;

  const [nombre, setNombre] = useState("");
  const [saving, setSaving] = useState(false);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);

  // modales
  const [showBulk, setShowBulk] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [showCats, setShowCats] = useState(false);

  // incremento %
  const [pct, setPct] = useState(0);
  const [roundMode, setRoundMode] = useState("none"); // none | up | down

  // pestañas modal categorías
  const [catTab, setCatTab] = useState("existentes"); // existentes | nueva
  const [catalogo, setCatalogo] = useState([]);
  const [newCatName, setNewCatName] = useState("");
  const [newCatComment, setNewCatComment] = useState("");

  // ---------- carga doc + categorías ----------
  useEffect(() => {
    async function loadAll() {
      setLoading(true);

      try {
        const ref = doc(db, "listas_precios", id);
        const snap = await getDoc(ref);
        setNombre(snap.exists() ? (snap.data().nombre || "") : "");
      } catch (e) {
        console.error("[LP editar] getDoc", e?.code, e?.message);
        setNombre("");
      }

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
        console.warn("[LP editar] categorías vacías o sin permiso", e?.code, e?.message);
        setCategorias([]);
      } finally {
        setLoading(false);
      }
    }
    loadAll();
  }, [id]);

  // ---------- acciones básicas ----------
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
        nombre: `${cat.nombre || "Categoría"} (copia)`,
        comentario: cat.comentario || "",
        activa: true,
        creado: new Date().toLocaleString("es-CO"),
      });
      const catSnap = await getDocs(catRef);
      setCategorias(catSnap.docs.map((d) => ({ id: d.id, ...d.data(), activa: d.data().activa ?? true })));
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

  // ---------- agregar categoría (modal) ----------
  async function openCats() {
    setShowCats(true);
    setCatTab("existentes");
    setNewCatName("");
    setNewCatComment("");

    try {
      const snap = await getDocs(collection(db, "catalogo_categorias"));
      const arr = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setCatalogo(arr.length ? arr : DEFAULT_CATS.map((c, i) => ({ id: `def-${i}`, ...c })));
    } catch {
      setCatalogo(DEFAULT_CATS.map((c, i) => ({ id: `def-${i}`, ...c })));
    }
  }

  async function addExistingToList(cat) {
    try {
      const catRef = collection(db, "listas_precios", id, "categorias");
      await addDoc(catRef, {
        nombre: cat.nombre,
        comentario: cat.comentario || "",
        activa: true,
        creado: new Date().toLocaleString("es-CO"),
      });
      const catSnap = await getDocs(catRef);
      setCategorias(catSnap.docs.map((d) => ({ id: d.id, ...d.data(), activa: d.data().activa ?? true })));
      alert("Categoría agregada.");
    } catch (e) {
      console.error(e);
      alert("No se pudo agregar la categoría.");
    }
  }

  async function addNewCategory() {
    if (!newCatName.trim()) return alert("Escribe el nombre de la categoría.");
    try {
      const catRef = collection(db, "listas_precios", id, "categorias");
      await addDoc(catRef, {
        nombre: newCatName.trim(),
        comentario: newCatComment.trim(),
        activa: true,
        creado: new Date().toLocaleString("es-CO"),
      });
      const catSnap = await getDocs(catRef);
      setCategorias(catSnap.docs.map((d) => ({ id: d.id, ...d.data(), activa: d.data().activa ?? true })));
      setShowCats(false);
    } catch (e) {
      console.error(e);
      alert("No se pudo crear la categoría.");
    }
  }

  // ---------- sembrar catálogo base ----------
  async function seedCatalogoBase() {
    try {
      const colRef = collection(db, "catalogo_categorias");
      for (const c of DEFAULT_CATS) {
        const idAuto = `${c.nombre}`.toLowerCase().normalize("NFD")
          .replace(/[\u0300-\u036f]/g,"").replace(/\s+/g,"-");
        await setDoc(doc(colRef, idAuto), { nombre: c.nombre, comentario: c.comentario || "" }, { merge: true });
      }
      alert("Catálogo base creado/actualizado. Vuelve a abrir 'Agregar categoría'.");
    } catch (e) {
      console.error(e);
      alert("No se pudo sembrar el catálogo base.");
    }
  }

  // ---------- incremento porcentual ----------
  function roundValue(value, mode) {
    if (mode === "up") return Math.ceil(value);
    if (mode === "down") return Math.floor(value);
    return value;
  }
  async function applyBulkIncrement() {
    const percent = Number(pct);
    if (!Number.isFinite(percent)) return alert("Ingresa un porcentaje válido.");
    try {
      for (const cat of categorias) {
        const itemsRef = collection(db, "listas_precios", id, "categorias", cat.id, "items");
        const itemsSnap = await getDocs(itemsRef).catch(() => null);
        if (!itemsSnap) continue;
        for (const d of itemsSnap.docs) {
          const it = d.data() || {};
          const precioNum = Number(it.precio || 0);
          const nuevo = roundValue(precioNum * (1 + percent / 100), roundMode);
          await updateDoc(doc(db, "listas_precios", id, "categorias", cat.id, "items", d.id), {
            precio: nuevo,
            actualizado: new Date().toLocaleString("es-CO"),
          });
        }
      }
      alert("Precios actualizados.");
      setShowBulk(false);
    } catch (e) {
      console.error(e);
      alert("No se pudo aplicar el incremento.");
    }
  }

  // ---------- export ----------
  async function exportar() {
    try {
      const rows = [];
      for (const cat of categorias) {
        const itemsRef = collection(db, "listas_precios", id, "categorias", cat.id, "items");
        const itemsSnap = await getDocs(itemsRef).catch(() => null);
        const items = itemsSnap ? itemsSnap.docs.map(d => ({ id: d.id, ...d.data() })) : [{}];

        for (const it of items) {
          rows.push({
            Categoria: cat.nombre || "",
            Código: it.codigo || "",
            Nombre: it.nombre || "",
            "Permite desc": (it.permite_descuento ? "SI" : "No"),
            Precio: Number(it.precio || 0),
            "Genera RIPS": (it.genera_rips ? "SI" : "No"),
            "Es consulta": (it.es_consulta ? "SI" : "No"),
            "Ver en agenda": (it.ver_en_agenda ? "SI" : "No"),
            "Nombre en la agenda": it.nombre_en_agenda || "",
            Tiempo: it.tiempo || "",
            Identificador: it.identificador || "",
            "Cuenta contable": it.cuenta_contable || "",
          });
        }
      }

      const XLSX = typeof window !== "undefined" && window.XLSX ? window.XLSX : null;

      if (XLSX && XLSX.utils && rows.length) {
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(rows);
        XLSX.utils.book_append_sheet(wb, ws, "Lista de precios");
        const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
        const blob = new Blob([wbout], { type: "application/octet-stream" });
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = `${(nombre || "Lista")}.xlsx`;
        a.click();
        URL.revokeObjectURL(a.href);
      } else {
        const headers = Object.keys(rows[0] || {
          Categoria:"", Código:"", Nombre:"", "Permite desc":"", Precio:"", "Genera RIPS":"", "Es consulta":"", "Ver en agenda":"", "Nombre en la agenda":"", Tiempo:"", Identificador:"", "Cuenta contable":""
        });
        const csv = [
          headers.join(","),
          ...rows.map(r => headers.map(h => {
            const v = r[h] ?? "";
            const s = String(v).replace(/"/g,'""');
            return /[",\n]/.test(s) ? `"${s}"` : s;
          }).join(","))
        ].join("\n");

        const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = `${(nombre || "Lista")}.csv`;
        a.click();
        URL.revokeObjectURL(a.href);
      }
    } catch (e) {
      console.error(e);
      alert("No se pudo exportar.");
    }
  }

  // ---------- UI ----------
  return (
    <div className="oc-main-content lp">
      <div className="oc-section-title">
        <h2>Configuración · Edición Lista de precios</h2>
      </div>

      <div className="card">
        {/* barra superior */}
        <div className="toolbar" style={{ justifyContent: "space-between", marginBottom: 12 }}>
          <div className="name-row">
            <label style={{ fontWeight: 700 }}>Nombre*</label>
            <input
              className="text-inp"
              value={nombre}
              placeholder="Principal"
              onChange={(e) => setNombre(e.target.value)}
            />
            <button className="btn green" onClick={guardarNombre} disabled={saving} title="Guardar nombre">
              {saving ? "Guardando…" : "Guardar"}
            </button>
          </div>

          <div style={{ display: "flex", gap: 8 }}>
            <button className="chip blue"   title="Exportar"      onClick={exportar}>Exportar</button>
            <button className="chip orange" title="Incrementar %" onClick={()=>{setPct(0);setRoundMode("none");setShowBulk(true);}}>%</button>
            <button className="chip indigo" title="Opciones"      onClick={() => setShowOptions(true)}>⚙️ Opciones</button>
            <button className="chip green"  onClick={openCats}>+ Agregar categoría</button>
          </div>
        </div>

        {/* tabla categorías */}
        <div className="table-responsive">
          <table>
            <thead>
              <tr>
                <th style={{ width: 40 }}></th>
                <th>Categoría</th>
                <th>Comentario</th>
                <th style={{ width: 140 }}>Estado</th>
                <th style={{ width: 260, textAlign: "right" }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} style={{ textAlign: "center", padding: 20 }}>Cargando…</td></tr>
              ) : categorias.length === 0 ? (
                <tr><td colSpan={5} style={{ textAlign: "center", padding: 20 }}>Sin categorías.</td></tr>
              ) : (
                categorias.map((c) => (
                  <tr key={c.id}>
                    <td>▾</td>
                    <td style={{ fontWeight: 700 }}>{c.nombre || "Categoría"}</td>
                    <td className="muted">{c.comentario || "—"}</td>
                    <td>
                      <span className={`status-pill ${c.activa ? "status-on" : "status-off"}`}>
                        {c.activa ? "Conectado" : "Desconectado"}
                      </span>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <button className="btn green"  title="Agregar ítem" onClick={() => alert("Agregar ítem…")}>＋</button>
                      <button className="btn orange" title="Descuento %" onClick={() => alert("Descuento…")}>%</button>
                      <button className="btn sky"    title="Duplicar"    onClick={() => duplicar(c)}>↗</button>
                      <button className="btn red"    title="Eliminar"    onClick={() => eliminar(c)}>B</button>
                      <button className="btn blue"   title={c.activa ? "Desactivar" : "Activar"} onClick={() => toggleActiva(c)} style={{ marginLeft: 6 }}>
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
          <button className="chip gray" onClick={() => navigate(baseConfig)}>← Volver</button>
        </div>
      </div>

      {/* ---------- Modal Incremento % (nuevo layout) ---------- */}
      {showBulk && (
        <div className="modal-mask" onClick={() => setShowBulk(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="hd">Incrementar todos los precios</div>
            <div className="bd">
              <div className="field-col">
                <label className="label-strong">Porcentaje de incremento *</label>
                <div className="percent-row">
                  <div className="prefix">%</div>
                  <input
                    className="num-inp"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="Ingrese el porcentaje"
                    value={pct}
                    onChange={(e)=>setPct(e.target.value)}
                  />
                </div>

                <div className="checks">
                  <label className="check-row">
                    <input
                      type="radio"
                      name="round"
                      checked={roundMode === "down"}
                      onChange={()=>setRoundMode("down")}
                    />
                    <span>Redondear hacia abajo</span>
                  </label>

                  <label className="check-row">
                    <input
                      type="radio"
                      name="round"
                      checked={roundMode === "up"}
                      onChange={()=>setRoundMode("up")}
                    />
                    <span>Redondear hacia arriba</span>
                  </label>

                  <label className="check-row">
                    <input
                      type="radio"
                      name="round"
                      checked={roundMode === "none"}
                      onChange={()=>setRoundMode("none")}
                    />
                    <span>No redondear</span>
                  </label>
                </div>
              </div>
            </div>
            <div className="ft">
              <button className="chip gray" onClick={()=>setShowBulk(false)}>Cerrar</button>
              <button className="chip green" onClick={applyBulkIncrement}>Incrementar</button>
            </div>
          </div>
        </div>
      )}

      {/* ---------- Modal Opciones ---------- */}
      {showOptions && (
        <div className="modal-mask" onClick={() => setShowOptions(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="hd">Opciones</div>
            <div className="bd">
              <p className="muted" style={{ marginTop:0 }}>Acciones generales de la lista.</p>
              <button className="chip green" onClick={seedCatalogoBase}>Sembrar catálogo base</button>
            </div>
            <div className="ft">
              <button className="chip gray" onClick={()=>setShowOptions(false)}>Cerrar</button>
            </div>
          </div>
        </div>
      )}

      {/* ---------- Modal Agregar Categoría ---------- */}
      {showCats && (
        <div className="modal-mask" onClick={() => setShowCats(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="hd">Categoría</div>
            <div className="bd">
              <div className="tabs">
                <button className={`tab ${catTab==="existentes"?"active":""}`} onClick={()=>setCatTab("existentes")}>Categorías existentes</button>
                <button className={`tab ${catTab==="nueva"?"active":""}`} onClick={()=>setCatTab("nueva")}>Editar categoría / Nueva categoría</button>
              </div>

              {catTab === "existentes" ? (
                <div>
                  {catalogo.length === 0 ? (
                    <p className="muted">No hay catálogo disponible. Puedes crear una nueva categoría en la pestaña de la derecha.</p>
                  ) : (
                    <table>
                      <thead>
                        <tr>
                          <th>Nombre</th>
                          <th>Comentario</th>
                          <th>Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {catalogo.map(cat => (
                          <tr key={cat.id}>
                            <td>{cat.nombre}</td>
                            <td className="muted">{cat.comentario || "—"}</td>
                            <td>
                              <button className="btn green sm" onClick={()=>addExistingToList(cat)}>Agregar</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              ) : (
                <div>
                  <div className="row">
                    <label style={{ minWidth: 140 }}>Nombre *</label>
                    <input className="inp" placeholder="Ingrese el nombre de la categoría" value={newCatName} onChange={(e)=>setNewCatName(e.target.value)} />
                  </div>
                  <div className="row" style={{ alignItems: "flex-start" }}>
                    <label style={{ minWidth: 140, paddingTop: 6 }}>Comentario</label>
                    <textarea className="ta" placeholder="" value={newCatComment} onChange={(e)=>setNewCatComment(e.target.value)} />
                  </div>
                </div>
              )}
            </div>
            <div className="ft">
              <button className="chip gray" onClick={()=>setShowCats(false)}>Cerrar</button>
              {catTab === "nueva" && <button className="chip green" onClick={addNewCategory}>Guardar</button>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
