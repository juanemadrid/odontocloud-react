// ===============================
// 🗂️ Planes.jsx — Catálogo de Planes (producción)
// Estructura soportada (en este orden):
//  1) listas_precios/{listaId}/items
//  2) listas_precios_productos (campo listaId)
//  3) catalogo_procedimientos
// Guarda renglones en: planes/{planId}/planes_items
// ===============================
import React, { useEffect, useMemo, useRef, useState } from "react";
import { db } from "../../firebase/firebaseConfig";
import {
  addDoc, collection, deleteDoc, doc, getDoc, getDocs, orderBy, query,
  serverTimestamp, updateDoc, where
} from "firebase/firestore";

/* ===================== utilidades ===================== */
const COP = new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 });
const normalize = (s) =>
  (s || "")
    .toString()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim();
const clamp = (n, min, max) => Math.min(max, Math.max(min, Number.isFinite(+n) ? +n : min));
const sameCat = (a, b) => {
  const na = normalize(a), nb = normalize(b);
  if (!na || !nb) return false;
  return na === nb || na.includes(nb) || nb.includes(na);
};

/* ===================== estilos inyectados ===================== */
function usePlanesStyles() {
  useEffect(() => {
    const id = "oc-planes-styles-v3";
    if (document.getElementById(id)) return;
    const css = `
      :root{
        --oc-primary:#3b82f6; --oc-primary-600:#2563eb;
        --oc-green:#22c55e; --oc-green-600:#16a34a;
        --oc-red:#ef4444; --oc-red-600:#dc2626;
        --oc-gray:#e5e7eb; --oc-muted:#64748b;
      }
      .oc-muted{color:var(--oc-muted)} .mono{font-family:ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace}
      .oc-input,.oc-select{height:34px;border:1px solid #d6dbe6;border-radius:8px;background:#fff;padding:0 10px;font-size:14px}
      .oc-input:focus,.oc-select:focus{outline:none;border-color:#60a5fa;box-shadow:0 0 0 2px rgba(96,165,250,.15)}
      .oc-btn{display:inline-flex;align-items:center;justify-content:center;height:30px;padding:0 10px;border-radius:8px;border:1px solid var(--oc-gray);background:#fff;color:#0f172a;font-weight:700;font-size:12px;cursor:pointer;transition:.15s}
      .oc-btn:hover{background:#f8fafc} .oc-btn.small{height:26px;padding:0 8px}
      .oc-btn.primary{background:var(--oc-primary);border-color:var(--oc-primary-600);color:#fff}
      .oc-btn.primary:hover{background:var(--oc-primary-600)}
      .oc-btn.success{background:var(--oc-green);border-color:var(--oc-green-600);color:#fff}
      .oc-btn.success:hover{background:var(--oc-green-600)}
      .oc-btn.danger{background:var(--oc-red);border-color:var(--oc-red-600);color:#fff}
      .oc-btn.danger:hover{background:var(--oc-red-600)}
      .oc-btn.outline{background:#fff;color:var(--oc-primary);border-color:var(--oc-primary)}
      .oc-btn.outline:hover{background:#eff6ff}
      .oc-tbl{width:100%;border-collapse:separate;border-spacing:0;border:1px solid #e6e9ef;border-radius:10px;overflow:hidden}
      .oc-tbl thead th{background:#f8fafc;text-align:left;padding:8px 10px;border-bottom:1px solid #e6e9ef;font-weight:700}
      .oc-tbl tbody td{padding:8px 10px;border-bottom:1px solid #f0f3f8}
      .oc-tbl tbody tr:last-child td{border-bottom:0}
      .oc-mask{position:fixed;inset:0;background:rgba(0,0,0,.45);z-index:999999;display:flex;align-items:center;justify-content:center}
      .oc-modal{width:min(1200px,96vw);max-height:92vh;background:#fff;border:1px solid #e5e7eb;border-radius:14px;box-shadow:0 22px 60px rgba(0,0,0,.28);display:flex;flex-direction:column}
      .oc-modal-h,.oc-modal-f{padding:10px 12px;border-bottom:1px solid #eef2f7;display:flex;align-items:center;justify-content:space-between}
      .oc-modal-f{border-top:1px solid #eef2f7;border-bottom:0;gap:8;justify-content:flex-end}
      .oc-modal-t{padding:10px 12px;border-bottom:1px solid #eef2f7;display:grid;grid-template-columns:minmax(180px,260px) 1fr minmax(120px,160px) auto;gap:8px;align-items:center}
      .oc-modal-b{padding:12px;overflow:auto}
      .oc-sug{position:absolute;top:100%;left:0;right:0;background:#fff;border:1px solid #e5e7eb;border-radius:10px;margin-top:4px;max-height:260px;overflow:auto;box-shadow:0 12px 28px rgba(0,0,0,.15);z-index:99}
      .oc-sug-item{padding:8px 10px;display:flex;justify-content:space-between;gap:10px;cursor:pointer}
      .oc-sug-item:hover,.oc-sug-item.is-active{background:#eff6ff}
    `;
    const tag = document.createElement("style");
    tag.id = id;
    tag.textContent = css;
    document.head.appendChild(tag);
  }, []);
}

/* ===================== heurísticas de categoría (fallback) ===================== */
const KEYWORDS_BY_CAT = {
  "Cirugía Oral": ["cirugia","quirurg","exodon","alveolo","fenestr","colgajo","apicect"],
  "Endodoncia": ["endodon","conducto","pulpar","apex","biopul","necros"],
  "Implantología": ["implante","implanto","pilar","injerto","osteointeg"],
  "Odontología General": ["profilaxis","resina","amalgama","sellante","consulta","control"],
  "Ortodoncia": ["ortodon","bracket","alinead","arco","retencion"],
  "Periodoncia": ["periodon","curet","raspaje","aliser","flap"],
  "Psicología": ["psicol","terap","sesion"],
  "Radiología": ["radio","rx","radiogr","periap","panoram","cefalo"],
  "Rehabilitación Oral": ["rehabil","corona","puente","carilla","incrusta","protes"]
};
const tok = (s) => normalize(s).replace(/[^a-z0-9ñ ]/gi, " ").split(/\s+/).filter(Boolean);
const deriveCategoriaByKeywords = (nombre = "", catName = "", kwMap = KEYWORDS_BY_CAT) => {
  const k = kwMap[catName] || []; if (!k.length) return "";
  const words = tok(nombre);
  return k.some((kw) => words.some((w) => w.includes(kw))) ? catName : "";
};
const deriveCategoria = (codigo = "", nombre = "", catName = "", catMap = []) => {
  const code = (codigo || "").toString();
  if (catMap && catMap.length && catName) {
    const ent = catMap.find((c) => sameCat(c.nombre, catName));
    if (ent && Array.isArray(ent.prefijos)) {
      if (ent.prefijos.some((p) => p && code.startsWith((p || "").replace(/\./g, "")))) return ent.nombre;
    }
  }
  const kwCat = deriveCategoriaByKeywords(nombre, catName);
  if (kwCat) return kwCat;
  return "";
};

/* ===================== Modal: Agregar productos ===================== */
function AgregarProductosModal({ listaId, onClose, onLoadLines }) {
  const [cats, setCats] = useState(["*"]);
  const [cat, setCat] = useState("*");
  const [term, setTerm] = useState("");
  const [qty, setQty] = useState(1);

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  const [openSug, setOpenSug] = useState(false);
  const [hover, setHover] = useState(-1);
  const inputRef = useRef(null);
  const [bag, setBag] = useState([]);
  const [catMap, setCatMap] = useState([]);

  const FALLBACK_CATS = ["*","Cirugía Oral","Endodoncia","Implantología","Odontología General","Ortodoncia","Periodoncia","Psicología","Radiología","Rehabilitación Oral"];

  // Cargar categorías + prefijos (catalogo_categorias) y descubrir categorías presentes
  useEffect(() => {
    let alive = true;
    (async () => {
      const setC = new Set();
      let map = [];
      try {
        // catálogo de categorías (si existe)
        const snapCats = await getDocs(collection(db, "catalogo_categorias")).catch(() => null);
        if (snapCats && !snapCats.empty) {
          setC.add("*");
          snapCats.forEach((d) => {
            const data = d.data() || {};
            const nombre = (data.nombre || "").toString().trim();
            const prefijos = Array.isArray(data.prefijos) ? data.prefijos.map((p) => (p || "").toString()) : [];
            if (nombre) { setC.add(nombre); map.push({ nombre, prefijos }); }
          });
        }

        // categorías implícitas desde la lista seleccionada
        if (listaId) {
          // subcolección items
          const subItems = await getDocs(collection(db, "listas_precios", listaId, "items")).catch(() => null);
          subItems?.forEach((d) => {
            const c = (d.data()?.categoria || d.data()?.categoriaNombre || d.data()?.grupo || "").toString().trim();
            if (c) setC.add(c);
          });
          // colección espejo
          const qLP = query(collection(db, "listas_precios_productos"), where("listaId", "==", listaId));
          const snapLP = await getDocs(qLP).catch(() => null);
          snapLP?.forEach((d) => {
            const c = (d.data()?.categoria || d.data()?.categoriaNombre || d.data()?.grupo || "").toString().trim();
            if (c) setC.add(c);
          });
        }
      } finally {
        if (setC.size === 0) FALLBACK_CATS.forEach((c) => setC.add(c));
        if (!setC.has("*")) setC.add("*");
        if (alive) { setCats(Array.from(setC)); setCatMap(map); }
      }
    })();
    return () => { alive = false; };
  }, [listaId]);

  useEffect(() => { if (cat !== "*") { setOpenSug(true); setHover(-1); } else setOpenSug(false); }, [cat]);

  // Query de items (subcolección -> espejo -> catálogo)
  useEffect(() => {
    let alive = true;
    const mustQuery = (normalize(term).length >= 2) || (cat !== "*");
    if (!mustQuery) { setRows([]); return; }
    (async () => {
      setLoading(true);
      try {
        let merged = [];

        // 1) Preferido: subcolección listas_precios/{listaId}/items
        if (listaId) {
          const subItems = await getDocs(collection(db, "listas_precios", listaId, "items")).catch(() => null);
          if (subItems && !subItems.empty) {
            merged = subItems.docs.map((d) => {
              const x = d.data() || {};
              const codigo = (x.codigo || "").toString().trim() || d.id;
              const nombre = (x.nombre || x.descripcion || codigo).toString().trim();
              const precio = Number(x.precio ?? x.valor ?? 0) || 0;
              let categoria = (x.categoria || x.categoriaNombre || x.grupo || "").toString().trim();
              if (!categoria) {
                if (cat !== "*") categoria = deriveCategoria(codigo, nombre, cat, catMap);
                if (!categoria && catMap.length) {
                  for (const c of catMap) { const maybe = deriveCategoria(codigo, nombre, c.nombre, catMap); if (maybe) { categoria = maybe; break; } }
                }
                if (!categoria) categoria = "Sin categoría";
              }
              return {
                id: d.id, codigo, nombre, precio, categoria,
                // topes/flags si existen:
                max_desc_pct: Number(x.max_desc_pct || 0),
                max_desc_valor: Number(x.max_desc_valor || 0),
                permite_desc: !!(x.permite_desc ?? true),
                genera_rips: !!x.genera_rips,
                es_consulta: !!x.es_consulta,
                ver_en_agenda: !!x.ver_en_agenda,
                _norm: normalize(`${codigo} ${nombre} ${categoria}`)
              };
            });
          }
        }

        // 2) Colección espejo
        if (!merged.length && listaId) {
          const qLP = query(collection(db, "listas_precios_productos"), where("listaId", "==", listaId));
          const snapLP = await getDocs(qLP).catch(() => null);
          merged = (snapLP?.docs || []).map((d) => {
            const x = d.data() || {};
            const codigo = (x.codigo || "").toString().trim() || d.id;
            const nombre = (x.nombre || x.descripcion || codigo).toString().trim();
            const precio = Number(x.precio ?? x.valor ?? 0) || 0;
            let categoria = (x.categoria || x.categoriaNombre || x.grupo || "").toString().trim();
            if (!categoria) {
              if (cat !== "*") categoria = deriveCategoria(codigo, nombre, cat, catMap);
              if (!categoria && catMap.length) {
                for (const c of catMap) { const maybe = deriveCategoria(codigo, nombre, c.nombre, catMap); if (maybe) { categoria = maybe; break; } }
              }
              if (!categoria) categoria = "Sin categoría";
            }
            return {
              id: d.id, codigo, nombre, precio, categoria,
              max_desc_pct: Number(x.max_desc_pct || 0),
              max_desc_valor: Number(x.max_desc_valor || 0),
              permite_desc: !!(x.permite_desc ?? true),
              genera_rips: !!x.genera_rips,
              es_consulta: !!x.es_consulta,
              ver_en_agenda: !!x.ver_en_agenda,
              _norm: normalize(`${codigo} ${nombre} ${categoria}`)
            };
          });
        }

        // 3) Catálogo genérico
        if (!merged.length) {
          const catSnap = await getDocs(collection(db, "catalogo_procedimientos")).catch(() => null);
          catSnap?.forEach((d) => {
            const x = d.data() || {};
            const codigo = (x.codigo || "").toString().trim() || d.id;
            const nombre = (x.nombre || x.descripcion || codigo).toString().trim();
            const precio = Number(x.precio ?? x.valor ?? 0) || 0;
            let categoria = (x.categoria || x.grupo || "").toString().trim();
            if (!categoria) {
              if (cat !== "*") categoria = deriveCategoria(codigo, nombre, cat, catMap);
              if (!categoria && catMap.length) {
                for (const c of catMap) { const maybe = deriveCategoria(codigo, nombre, c.nombre, catMap); if (maybe) { categoria = maybe; break; } }
              }
              if (!categoria) categoria = "Sin categoría";
            }
            merged.push({
              id: d.id, codigo, nombre, precio, categoria,
              max_desc_pct: Number(x.max_desc_pct || 0),
              max_desc_valor: Number(x.max_desc_valor || 0),
              permite_desc: !!(x.permite_desc ?? true),
              genera_rips: !!x.genera_rips,
              es_consulta: !!x.es_consulta,
              ver_en_agenda: !!x.ver_en_agenda,
              _norm: normalize(`${codigo} ${nombre} ${categoria}`)
            });
          });
        }

        // Filtro/sort
        const tnorm = normalize(term);
        let filtered = merged.filter((r) => {
          if (cat !== "*" && !sameCat(r.categoria || "", cat)) return false;
          if (tnorm && !r._norm.includes(tnorm)) return false;
          return true;
        });
        filtered.sort((a, b) => (a.codigo || "").localeCompare(b.codigo || "") || (a.nombre || "").localeCompare(b.nombre || ""));
        if (cat !== "*" && !tnorm) filtered = filtered.slice(0, 70);
        if (alive) setRows(filtered);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [listaId, cat, term, catMap]);

  const addFromRow = (r) => {
    const cantidad = Math.max(1, Number(qty) || 1);
    setBag((prev) => {
      const idx = prev.findIndex((x) => x.codigo === r.codigo);
      const base = {
        codigo: r.codigo,
        nombre: r.nombre,
        precio: Number(r.precio || 0),
        cantidad,
        descuentoPct: 0,
        observaciones: "",
        // metadatos de control si existen:
        _max_desc_pct: Number(r.max_desc_pct || 0),
        _max_desc_valor: Number(r.max_desc_valor || 0),
        _permite_desc: !!(r.permite_desc ?? true),
        _flags: {
          genera_rips: !!r.genera_rips,
          es_consulta: !!r.es_consulta,
          ver_en_agenda: !!r.ver_en_agenda
        }
      };
      if (idx >= 0) {
        const next = [...prev];
        const row = { ...next[idx] };
        row.cantidad = clamp((row.cantidad || 1) + cantidad, 1, 999999);
        // recalcular total respetando tope:
        const pct = clamp(row.descuentoPct || 0, 0, base._max_desc_pct || 100);
        const unit = row.precio || base.precio || 0;
        row.total = Math.max(0, (unit * row.cantidad) * (pct >= 100 ? 0 : (1 - pct / 100)));
        next[idx] = row;
        return next;
      }
      const pct = 0;
      const total = Math.max(0, (base.precio * cantidad) * (pct >= 100 ? 0 : (1 - pct / 100)));
      return [...prev, { ...base, total }];
    });
  };
  const updateBag = (i, patch) => {
    setBag((prev) => {
      const next = [...prev];
      const row = { ...next[i], ...patch };
      // aplicar topes
      const pctTope = Number.isFinite(row._max_desc_pct) ? row._max_desc_pct : 100;
      const pct = clamp(row.descuentoPct, 0, pctTope);
      const cant = clamp(row.cantidad, 1, 999999);
      const unit = Number(row.precio || 0);
      row.descuentoPct = pct;
      row.cantidad = cant;
      row.precio = unit;
      row.total = Math.max(0, unit * cant * (pct >= 100 ? 0 : (1 - pct / 100)));
      next[i] = row; return next;
    });
  };
  const removeBag = (i) => setBag((p) => p.filter((_, idx) => idx !== i));
  const cargar = () => {
    if (!bag.length && rows.length) {
      const cantidad = Math.max(1, Number(qty) || 1);
      const all = rows.map((r) => ({
        codigo:r.codigo, nombre:r.nombre, precio:Number(r.precio||0),
        cantidad, descuentoPct:0, observaciones:"",
        _max_desc_pct:Number(r.max_desc_pct||0), _max_desc_valor:Number(r.max_desc_valor||0),
        _permite_desc:!!(r.permite_desc ?? true),
        _flags:{ genera_rips:!!r.genera_rips, es_consulta:!!r.es_consulta, ver_en_agenda:!!r.ver_en_agenda },
        total:Number(r.precio||0)*cantidad
      }));
      onLoadLines(all); onClose(); return;
    }
    if (bag.length) onLoadLines(bag);
    onClose();
  };

  const visibleSug = openSug && (loading || rows.length > 0);

  const showHint = rows.length === 0 && normalize(term).length < 2 && cat === "*";
  const showRowsTable = !visibleSug && cat === "*";

  return (
    <div className="oc-mask" role="dialog" aria-modal="true">
      <div className="oc-modal">
        <div className="oc-modal-h">
          <b>Agregar productos</b>
          <button className="oc-btn" onClick={onClose}>Cerrar</button>
        </div>

        <div className="oc-modal-t">
          <select className="oc-select" value={cat} onChange={(e) => setCat(e.target.value)}>
            {cats.map((c) => <option key={c} value={c}>{c === "*" ? "Todas las categorías" : c}</option>)}
          </select>

          <div style={{ position: "relative" }}>
            <input
              ref={inputRef}
              className="oc-input"
              placeholder="Buscar ítem por código o nombre…"
              value={term}
              onChange={(e) => { setTerm(e.target.value); setOpenSug(true); }}
              onFocus={() => { if (cat !== "*") { setOpenSug(true); } }}
            />
            {visibleSug && (
              <div className="oc-sug">
                {loading ? (
                  <div className="oc-muted" style={{ padding: 10 }}>Cargando…</div>
                ) : rows.length === 0 ? (
                  <div className="oc-muted" style={{ padding: 10 }}>Sin resultados.</div>
                ) : rows.map((r, i) => (
                  <div
                    key={`${r.id}-${r.codigo}`}
                    className={`oc-sug-item`}
                    onMouseDown={(e) => { e.preventDefault(); addFromRow(r); }}
                  >
                    <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.nombre}</div>
                    <div className="mono" style={{ opacity:.85 }}>{r.codigo}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <label style={{ display:"flex", alignItems:"center", gap:6, justifySelf:"start" }}>
            <span className="oc-muted" style={{ fontSize:12, fontWeight:700 }}>Cantidad</span>
            <input type="number" min={1} value={qty} onChange={(e) => setQty(e.target.value)} className="oc-input" style={{ width:90 }} />
          </label>

          <button className="oc-btn success" onClick={cargar}>Agregar</button>
        </div>

        <div className="oc-modal-b">
          {showHint ? (
            <div className="oc-muted">Escribe al menos 2 caracteres o elige una categoría para ver resultados.</div>
          ) : loading ? (
            <div className="oc-muted">Cargando…</div>
          ) : rows.length === 0 ? (
            <div className="oc-muted">Sin resultados.</div>
          ) : (
            showRowsTable && (
              <table className="oc-tbl" style={{ marginBottom:10 }}>
                <thead>
                  <tr>
                    <th style={{ width:110 }}>Código</th>
                    <th>Nombre</th>
                    <th style={{ width:140 }}>Valor unit.</th>
                    <th style={{ width:160 }}>Categoría</th>
                    <th style={{ width:120 }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={`${r.id}-${r.codigo}`}>
                      <td className="mono">{r.codigo}</td>
                      <td>{r.nombre}</td>
                      <td className="mono">{COP.format(r.precio || 0)}</td>
                      <td>{r.categoria || "—"}</td>
                      <td><button className="oc-btn success small" onClick={() => addFromRow(r)}>Agregar</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )
          )}

          {!!bag.length && (
            <>
              <div style={{ margin:"6px 0 8px", fontWeight:700 }} className="oc-muted">Ítems a cargar</div>
              <table className="oc-tbl">
                <thead>
                  <tr>
                    <th style={{ width:110 }}>Código</th>
                    <th>Nombre</th>
                    <th style={{ width:120 }}>Valor unit.</th>
                    <th style={{ width:80 }}>Cant.</th>
                    <th style={{ width:90 }}>Desc. %</th>
                    <th>Observaciones</th>
                    <th style={{ width:120 }}>Total</th>
                    <th style={{ width:100 }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {bag.map((it, i) => (
                    <tr key={i}>
                      <td className="mono">{it.codigo}</td>
                      <td>{it.nombre}</td>
                      <td><input type="number" min={0} value={Number.isFinite(it.precio)?it.precio:0} onChange={(e)=>updateBag(i,{precio:e.target.value})} className="oc-input" style={{ width:110 }} /></td>
                      <td><input type="number" min={1} value={it.cantidad} onChange={(e)=>updateBag(i,{cantidad:e.target.value})} className="oc-input" style={{ width:80 }} /></td>
                      <td><input type="number" min={0} max={100} value={it.descuentoPct} onChange={(e)=>updateBag(i,{descuentoPct:e.target.value})} className="oc-input" style={{ width:80 }} /></td>
                      <td><input value={it.observaciones||""} onChange={(e)=>updateBag(i,{observaciones:e.target.value})} className="oc-input" /></td>
                      <td className="mono">{COP.format(it.total || 0)}</td>
                      <td><button className="oc-btn danger small" onClick={()=>removeBag(i)}>Quitar</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
        </div>

        <div className="oc-modal-f">
          <button className="oc-btn" onClick={onClose}>Cerrar</button>
          <button className="oc-btn success" onClick={cargar} disabled={!bag.length && !rows.length}>Cargar</button>
        </div>
      </div>
    </div>
  );
}

/* ===================== Editor de Plan ===================== */
function PlanEditor({ planId, onBack }) {
  const [plan, setPlan] = useState(null);
  const [listas, setListas] = useState([]);
  const [lines, setLines] = useState([]);
  const [saving, setSaving] = useState(false);
  const [openModal, setOpenModal] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      const snapL = await getDocs(query(collection(db, "listas_precios"), orderBy("nombre", "asc"))).catch(() => null);
      if (alive) setListas(snapL ? snapL.docs.map((d) => ({ id: d.id, ...(d.data() || {}) })) : []);

      const pSnap = await getDoc(doc(db, "planes", planId));
      if (!pSnap.exists()) return;
      const pdata = { id: pSnap.id, ...(pSnap.data() || {}) };
      if (alive) setPlan(pdata);

      const itemsSnap = await getDocs(collection(db, "planes", planId, "planes_items"));
      const its = itemsSnap.docs.map((d) => ({ id: d.id, ...(d.data() || {}) }));
      if (alive) setLines(its);
    })();
    return () => { alive = false; };
  }, [planId]);

  const listaId = plan?.listaId || "";
  const updateHead = (patch) => setPlan((p) => ({ ...(p || {}), ...patch }));

  const recompute = (ln) => {
    const cant = clamp(ln.cantidad, 1, 999999);
    const pctTope = Number.isFinite(ln._max_desc_pct) ? ln._max_desc_pct : 100;
    const pct = clamp(ln.descuentoPct, 0, pctTope);
    const precio = Number(ln.precio || 0);
    const total = Math.max(0, precio * cant * (pct >= 100 ? 0 : (1 - pct / 100)));
    return { ...ln, cantidad: cant, descuentoPct: pct, precio, total };
  };

  const addLines = (arr) => {
    setLines((prev) => {
      const map = new Map(prev.map((x) => [x.codigo, { ...x }]));
      for (const it of arr) {
        if (map.has(it.codigo)) {
          const m = { ...map.get(it.codigo) };
          m.cantidad = clamp((m.cantidad || 1) + (Number(it.cantidad) || 1), 1, 999999);
          m.precio = Number(it.precio || m.precio || 0);
          m.descuentoPct = Number(m.descuentoPct || 0);
          m.observaciones = m.observaciones || "";
          // conservar metadatos de tope/flags si llegan
          m._max_desc_pct = Number(m._max_desc_pct ?? it._max_desc_pct ?? 0);
          m._max_desc_valor = Number(m._max_desc_valor ?? it._max_desc_valor ?? 0);
          m._permite_desc = (m._permite_desc ?? it._permite_desc ?? true);
          m._flags = m._flags || it._flags || {};
          map.set(it.codigo, recompute(m));
        } else {
          map.set(it.codigo, recompute({ ...it }));
        }
      }
      return Array.from(map.values());
    });
  };

  const updateLine = (idx, patch) => {
    setLines((prev) => {
      const next = [...prev];
      next[idx] = recompute({ ...next[idx], ...patch });
      return next;
    });
  };

  const removeLine = async (id, idx) => {
    if (!plan?.id) { setLines((p) => p.filter((_, i) => i !== idx)); return; }
    if (id) await deleteDoc(doc(db, "planes", plan.id, "planes_items", id));
    setLines((p) => id ? p.filter((x) => x.id !== id) : p.filter((_, i) => i !== idx));
  };

  const saveAll = async () => {
    if (!plan?.nombre?.trim()) return alert("El nombre del plan es obligatorio.");
    if (!plan?.listaId) return alert("Selecciona la lista de precios.");
    setSaving(true);
    try {
      await updateDoc(doc(db, "planes", plan.id), {
        nombre: plan.nombre.trim(),
        listaId: plan.listaId,
        actualizado: serverTimestamp(),
      });
      const colRef = collection(db, "planes", plan.id, "planes_items");
      await Promise.all(
        lines.map(async (ln) => {
          const payload = {
            codigo: ln.codigo || "",
            nombre: ln.nombre || "",
            precio: Number(ln.precio || 0),
            cantidad: Number(ln.cantidad || 1),
            descuentoPct: Number(ln.descuentoPct || 0),
            observaciones: ln.observaciones || "",
            total: Number(recompute(ln).total || 0),
            // persistimos metadatos útiles para validaciones futuras
            _max_desc_pct: Number(ln._max_desc_pct || 0),
            _max_desc_valor: Number(ln._max_desc_valor || 0),
            _permite_desc: !!(ln._permite_desc ?? true),
            _flags: ln._flags || {},
            actualizado: serverTimestamp(),
          };
          if (ln.id) await updateDoc(doc(colRef, ln.id), payload);
          else await addDoc(colRef, { ...payload, creado: serverTimestamp() });
        })
      );
      alert("✅ Plan guardado.");
    } catch (e) {
      console.error(e);
      alert("❌ No se pudo guardar el plan.");
    } finally {
      setSaving(false);
    }
  };

  if (!plan) return <div className="oc-muted">Cargando plan…</div>;

  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
        <h3 style={{ margin:0 }}>Edición de plan</h3>
        <div style={{ display:"flex", gap:8 }}>
          <button className="oc-btn" onClick={onBack}>Volver</button>
          <button className="oc-btn primary" onClick={saveAll} disabled={saving}>{saving?"Guardando…":"Guardar cambios"}</button>
        </div>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"120px 1fr", gap:10, alignItems:"center", marginBottom:8 }}>
        <label>Nombre</label>
        <input className="oc-input" value={plan.nombre || ""} onChange={(e) => updateHead({ nombre: e.target.value })} />
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"120px 1fr auto", gap:10, alignItems:"center", marginBottom:16 }}>
        <label>Lista de precios</label>
        <select className="oc-select" value={plan.listaId || ""} onChange={(e) => updateHead({ listaId: e.target.value })}>
          <option value="">Seleccione…</option>
          {listas.map((l) => <option key={l.id} value={l.id}>{l.nombre || l.id}</option>)}
        </select>
        <button className="oc-btn outline small" onClick={() => setOpenModal(true)}>+ Productos</button>
      </div>

      <div className="table-wrap">
        <table className="oc-tbl">
          <thead>
            <tr>
              <th style={{ width:110 }}>Código</th>
              <th>Nombre</th>
              <th style={{ width:120 }}>Valor unit.</th>
              <th style={{ width:80 }}>Cant.</th>
              <th style={{ width:90 }}>Desc. %</th>
              <th>Observaciones</th>
              <th style={{ width:120 }}>Total</th>
              <th style={{ width:160 }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {lines.length === 0 ? (
              <tr><td colSpan={8} className="oc-muted">Sin productos en el plan.</td></tr>
            ) : lines.map((ln, i) => (
              <tr key={ln.id || `new-${i}`}>
                <td className="mono">{ln.codigo}</td>
                <td>{ln.nombre}</td>
                <td><input type="number" min={0} value={Number.isFinite(ln.precio)?ln.precio:0} onChange={(e)=>updateLine(i,{precio:e.target.value})} className="oc-input" style={{ width:110 }} /></td>
                <td><input type="number" min={1} value={ln.cantidad||1} onChange={(e)=>updateLine(i,{cantidad:e.target.value})} className="oc-input" style={{ width:80 }} /></td>
                <td><input type="number" min={0} max={100} value={ln.descuentoPct||0} onChange={(e)=>updateLine(i,{descuentoPct:e.target.value})} className="oc-input" style={{ width:80 }} /></td>
                <td><input className="oc-input" value={ln.observaciones||""} onChange={(e)=>updateLine(i,{observaciones:e.target.value})} /></td>
                <td className="mono">{COP.format((Number(ln.precio||0)*(ln.cantidad||1)*((ln.descuentoPct||0)>=100?0:(1-(ln.descuentoPct||0)/100)))||0)}</td>
                <td><button className="oc-btn danger small" onClick={()=>removeLine(ln.id, i)}>Eliminar</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {openModal && (
        <AgregarProductosModal
          listaId={listaId}
          onClose={() => setOpenModal(false)}
          onLoadLines={addLines}
        />
      )}
    </div>
  );
}

/* ===================== Listado / Crear / Editar (wrapper) ===================== */
/**
 * Props opcionales desde tu router:
 * - mode: "list" | "new" | "edit"
 * - planId: string (si mode === "edit")
 */
export default function Planes({ mode, planId }) {
  usePlanesStyles();

  const [localMode, setLocalMode] = useState(mode || "list");
  const [editId, setEditId] = useState(planId || null);

  const [term, setTerm] = useState("");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [listas, setListas] = useState([]);
  const [nuevo, setNuevo] = useState({ nombre: "", listaId: "" });

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      try {
        const snapL = await getDocs(query(collection(db, "listas_precios"), orderBy("nombre", "asc"))).catch(() => null);
        if (alive) setListas(snapL ? snapL.docs.map((d) => ({ id: d.id, ...(d.data() || {}) })) : []);
        const snap = await getDocs(query(collection(db, "planes"), orderBy("nombre", "asc")));
        if (alive) setRows(snap.docs.map((d) => ({ id: d.id, ...(d.data() || {}) })));
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  useEffect(() => { if (mode) setLocalMode(mode); }, [mode]);
  useEffect(() => { if (planId) setEditId(planId); }, [planId]);

  const filtered = useMemo(() => {
    const t = normalize(term);
    if (!t) return rows;
    return rows.filter((r) => normalize(`${r.nombre} ${r.listaNombre || ""}`).includes(t));
  }, [rows, term]);

  const crear = async () => {
    if (!nuevo.nombre?.trim()) return alert("El nombre es obligatorio.");
    if (!nuevo.listaId) return alert("Selecciona una lista de precios.");
    const lista = listas.find((l) => l.id === nuevo.listaId);
    const ref = await addDoc(collection(db, "planes"), {
      nombre: nuevo.nombre.trim(),
      listaId: nuevo.listaId,
      listaNombre: lista?.nombre || "",
      creado: serverTimestamp(),
      actualizado: serverTimestamp(),
    });
    setRows((p) => [...p, { id: ref.id, nombre: nuevo.nombre.trim(), listaId: nuevo.listaId, listaNombre: lista?.nombre || "" }]);
    setNuevo({ nombre: "", listaId: "" });
    setEditId(ref.id);
    setLocalMode("edit");
  };

  const eliminar = async (row) => {
    if (!window.confirm(`¿Eliminar el plan "${row.nombre}"?`)) return;
    await deleteDoc(doc(db, "planes", row.id));
    setRows((p) => p.filter((x) => x.id !== row.id));
  };

  if (localMode === "edit" && editId) {
    return (
      <PlanEditor
        planId={editId}
        onBack={() => { setLocalMode("list"); setEditId(null); }}
      />
    );
  }

  if (localMode === "new") {
    return (
      <div>
        <h2 style={{ marginTop:0 }}>Nuevo plan</h2>
        <div className="card" style={{ background:"#fff",border:"1px solid #e5e7eb",borderRadius:12,padding:12,marginBottom:12 }}>
          <div style={{ display:"grid", gridTemplateColumns:"minmax(220px, 1fr) minmax(240px, 1fr) auto", gap:8, alignItems:"center" }}>
            <input className="oc-input" placeholder="Nombre del plan" value={nuevo.nombre} onChange={(e)=>setNuevo((p)=>({ ...p, nombre:e.target.value }))} />
            <select className="oc-select" value={nuevo.listaId} onChange={(e)=>setNuevo((p)=>({ ...p, listaId:e.target.value }))}>
              <option value="">Seleccione lista de precios…</option>
              {listas.map((l)=> <option key={l.id} value={l.id}>{l.nombre || l.id}</option>)}
            </select>
            <button className="oc-btn primary" onClick={crear}>Crear</button>
          </div>
        </div>
        <button className="oc-btn" onClick={() => setLocalMode("list")}>Volver</button>
      </div>
    );
  }

  return (
    <div>
      <h2 style={{ marginTop:0 }}>Planes</h2>

      <div className="card" style={{ background:"#fff",border:"1px solid #e5e7eb",borderRadius:12,padding:12,marginBottom:12 }}>
        <h3 style={{ marginTop:0 }}>Nuevo plan</h3>
        <div style={{ display:"grid", gridTemplateColumns:"minmax(220px, 1fr) minmax(240px, 1fr) auto", gap:8, alignItems:"center" }}>
          <input className="oc-input" placeholder="Nombre del plan" value={nuevo.nombre} onChange={(e)=>setNuevo((p)=>({ ...p, nombre:e.target.value }))} />
          <select className="oc-select" value={nuevo.listaId} onChange={(e)=>setNuevo((p)=>({ ...p, listaId:e.target.value }))}>
            <option value="">Seleccione lista de precios…</option>
            {listas.map((l)=> <option key={l.id} value={l.id}>{l.nombre || l.id}</option>)}
          </select>
          <button className="oc-btn primary" onClick={crear}>Crear</button>
        </div>
      </div>

      <div className="card" style={{ background:"#fff",border:"1px solid #e5e7eb",borderRadius:12,padding:12 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
          <h3 style={{ margin:0 }}>Listado</h3>
          <input className="oc-input" placeholder="Buscar…" value={term} onChange={(e)=>setTerm(e.target.value)} style={{ minWidth:240 }} />
        </div>

        {loading ? (
          <div className="oc-muted">Cargando…</div>
        ) : filtered.length === 0 ? (
          <div className="oc-muted">Sin planes.</div>
        ) : (
          <div className="table-wrap">
            <table className="oc-tbl">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Lista de precios</th>
                  <th style={{ width:220 }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr key={r.id}>
                    <td>{r.nombre}</td>
                    <td>{r.listaNombre || r.listaId || "—"}</td>
                    <td>
                      <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                        <button className="oc-btn outline small" onClick={()=>{ setEditId(r.id); setLocalMode("edit"); }}>Editar</button>
                        <button className="oc-btn danger small" onClick={()=>eliminar(r)}>Eliminar</button>
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
