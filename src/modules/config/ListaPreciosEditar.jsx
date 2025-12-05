// ===============================
// 💰 ListaPreciosEditar.jsx
// Edición de una lista de precios (categorías + items + export + incremento %)
// Con acordeón, 4 botones por categoría y modal "Agregar/Editar producto"
// Autocompletado (Firestore) + alineación de modal
// Máx. descuento: selector % | $ con un solo input
// ===============================
import React, { useEffect, useMemo, useState, useRef } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  doc, getDoc, updateDoc, collection, getDocs, addDoc, deleteDoc, setDoc
} from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";

/* ---------- helpers de ruta ---------- */
function getDashBase(pathname = "") {
  const segs = pathname.split("/").filter(Boolean);
  const i = segs.findIndex((s) => s.startsWith("dashboard_"));
  return i >= 0 ? `/${segs.slice(0, i + 1).join("/")}` : "";
}

/* ---------- catálogo por defecto (categorías) ---------- */
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

// PUC simple (solo grupos 1..9, sin subniveles)
const PUC_QUICK = [
  { codigo: "1", nombre: "Activos" },
  { codigo: "2", nombre: "Pasivos" },
  { codigo: "3", nombre: "Patrimonio" },
  { codigo: "4", nombre: "Ingresos" },
  { codigo: "5", nombre: "Gastos" },
  { codigo: "6", nombre: "Costos de ventas" },
  { codigo: "7", nombre: "Costos de producción" },
  { codigo: "8", nombre: "Cuentas de orden deudoras" },
  { codigo: "9", nombre: "Cuentas de orden acreedoras" },
];

/* ---------- helpers de paths ---------- */
const docLista = (id) => doc(db, "listas_precios", id);
const colCategorias = (id) => collection(db, "listas_precios", id, "categorias");
const colItems = (id, catId) =>
  collection(db, "listas_precios", id, "categorias", catId, "items");

/* ---------- estilos inline mínimos ---------- */
function useInlineStyles() {
  useEffect(() => {
    const ID = "lp-edit-inline";
    document.getElementById(ID)?.remove();
    const css = `
      .oc-main-content.lp { padding:16px 20px }
      .oc-section-title { margin-bottom:16px }
      .oc-section-title h2 { margin:0; font-weight:800; font-size:20px; color:#0f172a }
      .card { background:#fff; border:1px solid #e5e7eb; border-radius:10px; padding:16px; box-shadow:0 2px 8px rgba(0,0,0,.04) }
      .toolbar { display:flex; gap:8px; align-items:center; }

      .chip { height:34px; padding:0 12px; border-radius:999px; border:1px solid #e5e7eb; cursor:pointer; font-weight:600; background:#f9fafb; transition:.15s }
      .chip:hover { background:#e5e7eb }
      .chip.blue   { background:#3b82f6; color:#fff; border:none }
      .chip.green  { background:#22c55e; color:#fff; border:none }
      .chip.orange { background:#f59e0b; color:#fff; border:none }
      .chip.gray   { background:#64748b; color:#fff; border:none }

      .name-row { display:flex; align-items:center; gap:8px; }
      .text-inp { height:38px; padding:0 10px; border-radius:8px; border:1px solid #cbd5e1; outline:none; width:280px }

      .table-responsive { width:100%; overflow-x:auto }
      table { width:100%; border-collapse:collapse; font-size:.9rem }
      thead tr { background:#f1f5f9 }
      th, td { padding:10px 12px; white-space:nowrap; vertical-align:middle }
      th { text-align:left; border-bottom:1px solid #e2e8f0; color:#475569; font-weight:700 }
      tr + tr { border-top:1px solid #e2e8f0 }
      .muted { color:#64748b }
      .status-pill { padding:2px 8px; border-radius:999px; font-weight:600 }
      .status-on { background:#dcfce7; color:#166534 }
      .status-off{ background:#fee2e2; color:#991b1b }

      .btn { padding:4px 8px; border:none; border-radius:6px; color:#fff; cursor:pointer; margin-right:6px; font-weight:600; transition:.12s }
      .btn:hover { opacity:.9 }
      .btn.blue   { background:#3b82f6 }
      .btn.green  { background:#22c55e }
      .btn.orange { background:#f59e0b }
      .btn.red    { background:#ef4444 }
      .btn.sky    { background:#06b6d4 }
      .btn.sm { height:32px; padding:0 10px; border-radius:8px }

      .toggle-cell{width:34px}
      .arrow{font-weight:900;font-size:18px;opacity:.7;cursor:pointer;display:inline-block}
      .row-cat-actions{display:flex;gap:6px;justify-content:flex-end}

      .cat-details{background:#fafafa}
      .inner-table{width:100%; border-collapse:collapse; font-size:.88rem}
      .inner-table th, .inner-table td{padding:8px 10px}
      .inner-table thead tr{background:#f8fafc}
      .inner-actions{display:flex;gap:6px;justify-content:flex-end}
      .mono{font-family: ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,"Liberation Mono","Courier New",monospace}

      /* Modal base */
      .modal-mask{position:fixed;inset:0;background:rgba(0,0,0,.35);display:flex;align-items:center;justify-content:center;z-index:999}
      .modal{background:#fff;border-radius:12px;box-shadow:0 10px 30px rgba(0,0,0,.2);width:min(880px,94vw);padding:0;border:1px solid #e5e7eb}
      .modal .hd{padding:12px 16px;border-bottom:1px solid #e5e7eb;font-weight:700}
      .modal .bd{padding:16px}
      .modal .ft{padding:12px 16px;border-top:1px solid #e5e7eb;display:flex;gap:8px;justify-content:flex-end}

      /* —— Grilla de 3 columnas con “field” (label arriba, input abajo) —— */
      .form-grid-3{ display:grid; grid-template-columns:1fr 1fr 1fr; gap:12px; align-items:start; }
      .field{ display:flex; flex-direction:column; gap:6px }
      .field label{ font-weight:700; color:#0f172a }

      .form-row-full{ margin-top:12px }

      .inp{height:36px;border:1px solid #cbd5e1;border-radius:8px;padding:0 10px;outline:none;width:100%}
      .ta{border:1px solid #cbd5e1;border-radius:8px;padding:8px;min-height:84px;outline:none;width:100%}

      /* Toggle simple / pill */
      .toggle{display:inline-flex;align-items:center;gap:10px}
      .toggle-pill{display:inline-flex;align-items:center;gap:6px;border:1px solid #cbd5e1;border-radius:999px;padding:2px 8px;height:32px}
      .toggle-pill span{font-weight:700}

      /* Autocomplete */
      .ac-wrap{position:relative}
      .ac-list{
        position:absolute; z-index:1000; top:100%; left:0; right:0;
        background:#fff; border:1px solid #e5e7eb; border-radius:10px;
        box-shadow:0 8px 30px rgba(0,0,0,.12);
        max-height:240px; overflow:auto; margin-top:4px;
      }
      .ac-item{padding:8px 12px; cursor:pointer; display:flex; gap:8px; align-items:center}
      .ac-item:hover{background:#f1f5f9}
      .ac-code{font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace; font-weight:700; color:#0f172a}
      .ac-name{color:#334155}
      .ac-empty{padding:10px 12px; color:#64748b}

      /* —— Selector % | $ para Máximo descuento —— */
      .seg-wrap{ display:flex; align-items:center; gap:8px; }
      .seg{ user-select:none; cursor:pointer; border:1px solid #cbd5e1; border-radius:8px; height:36px; min-width:44px; display:flex; align-items:center; justify-content:center; padding:0 10px; font-weight:700; color:#334155; background:#fff; }
      .seg.on{ background:#0ea5e9; color:#fff; border-color:#0ea5e9; }
    `;
    const tag = document.createElement("style");
    tag.id = ID;
    tag.appendChild(document.createTextNode(css));
    document.head.appendChild(tag);
  }, []);
}

/* ---------- util: normalizar ---------- */
const norm = (s = "") =>
  s?.toString().toLowerCase().normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, " ").trim();

/* ---------- formateo COP en vivo ---------- */
function formatCOPInput(v) {
  let digits = String(v || "").replace(/\D/g, "");
  if (digits === "") return "";
  digits = digits.replace(/^0+(?=\d)/, "");
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

/* ---------- AutoInput ---------- */
function AutoInput({ value, onChange, placeholder, suggestions = [], getLabel = (o) => o?.nombre || "", onPick, renderRow, minChars = 1 }) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);
  useEffect(() => {
    function onDoc(e) { if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false); }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);
  const showList = open && (value?.length || 0) >= minChars;
  return (
    <div className="ac-wrap" ref={wrapRef}>
      <input
        className="inp"
        value={value}
        placeholder={placeholder}
        onChange={(e) => { onChange(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
      />
      {showList && (
        <div className="ac-list">
          {suggestions.length === 0 ? (
            <div className="ac-empty">Sin resultados…</div>
          ) : suggestions.map((sug, i) => (
            <div key={i} className="ac-item" onClick={() => { onPick?.(sug); setOpen(false); }}>
              {renderRow ? renderRow(sug) : (<><span className="ac-code">{sug.codigo}</span><span className="ac-name">{getLabel(sug)}</span></>)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------- componente principal ---------- */
export default function ListaPreciosEditar(props) {
  useInlineStyles();

  const p = useParams();
  const listaId = props?.listaId ?? p.id ?? p.listaId ?? p.priceListId ?? p.listId ?? null;
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const baseDash = useMemo(() => getDashBase(pathname), [pathname]);
  const baseConfig = `${baseDash}/config/lista-de-precios`;

  const [nombre, setNombre] = useState("");
  const [saving, setSaving] = useState(false);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errMsg, setErrMsg] = useState("");

  const [showBulk, setShowBulk] = useState(false);
  const [showCats, setShowCats] = useState(false);

  // ---- Modal Producto (crear/editar) ----
  const [showItemModal, setShowItemModal] = useState(false);
  const [itemCat, setItemCat] = useState(null);
  const [itemMode, setItemMode] = useState("create"); // "create" | "edit"
  const [itemEditId, setItemEditId] = useState(null);

  const emptyItem = {
    codigo: "", nombre: "", precio: "", observaciones: "",
    usa_pago_fijo: false, pago_valor_fijo: "0",
    permite_descuento: false, genera_rips: false, es_consulta: false,
    ver_en_agenda: false, cuenta_contable: "",
    // único input de descuento + tipo
    max_descuento_tipo: "pct",   // 'pct' | 'valor'
    max_descuento_value: ""      // string mostrado en input
  };
  const [itemForm, setItemForm] = useState(emptyItem);

  // Catálogos (solo Firestore)
  const [procCatalog, setProcCatalog] = useState([]);
  const [pucList] = useState(PUC_QUICK);

  // incremento % (botón superior)
  const [pct, setPct] = useState(0);
  const [roundMode, setRoundMode] = useState("none"); // none | up | down

  // pestañas modal categorías
  const [catTab, setCatTab] = useState("existentes"); // existentes | nueva
  const [catalogo, setCatalogo] = useState([]);
  const [newCatName, setNewCatName] = useState("");
  const [newCatComment, setNewCatComment] = useState("");

  /* ---------- carga doc + categorías ---------- */
  useEffect(() => {
    async function loadAll() {
      if (!listaId) { setErrMsg("Ruta inválida: falta el id de la lista."); setLoading(false); return; }
      setLoading(true);

      try {
        const snap = await getDoc(docLista(listaId));
        setNombre(snap.exists() ? (snap.data().nombre || "") : "");
      } catch {
        setNombre("");
        setErrMsg("No se pudo cargar la lista. Revisa la ruta y permisos.");
      }

      try {
        const catSnap = await getDocs(colCategorias(listaId));
        const rows = catSnap.docs.map((d) => ({
          id: d.id, expanded: false, itemsLoaded: false, items: [],
          activa: d.data().activa ?? true, ...d.data(),
        }));
        rows.sort((a, b) => (a.nombre || "").localeCompare(b.nombre || ""));
        setCategorias(rows);
      } finally {
        setLoading(false);
      }
    }
    loadAll();
  }, [listaId]);

  /* ---------- cargar catálogo de procedimientos desde Firestore ---------- */
  useEffect(() => {
    async function loadProcs() {
      try {
        const snap = await getDocs(collection(db, "catalogo_procedimientos"));
        const arr = snap.docs.map(d => ({ id: d.id, ...d.data() }))
          .filter(x => x.codigo && x.nombre);
        setProcCatalog(arr);
      } catch {
        setProcCatalog([]);
      }
    }
    loadProcs();
  }, []);

  /* ---------- guardar nombre ---------- */
  async function guardarNombre() {
    try {
      if (!listaId) return;
      setSaving(true);
      await updateDoc(docLista(listaId), {
        nombre: (nombre || "").trim(),
        actualizado: new Date().toLocaleString("es-CO"),
      });
    } catch {
      alert("No se pudo actualizar el nombre.");
    } finally {
      setSaving(false);
    }
  }

  /* ---------- acordeón ---------- */
  async function toggleExpand(cat) {
    setCategorias((cs) => cs.map((c) => (c.id === cat.id ? { ...c, expanded: !c.expanded } : c)));
    if (!cat.itemsLoaded && listaId) {
      const itemsSnap = await getDocs(colItems(listaId, cat.id)).catch(() => null);
      const items = itemsSnap ? itemsSnap.docs.map((d) => ({ id: d.id, ...d.data() })) : [];
      setCategorias((cs) =>
        cs.map((c) => (c.id === cat.id ? { ...c, items, itemsLoaded: true } : c))
      );
    }
  }

  /* ---------- acciones de categoría (4 botones) ---------- */
  async function editarCategoria(cat) {
    if (!listaId) return;
    const nombreNuevo = (prompt("Editar nombre de la categoría:", cat.nombre) || "").trim();
    if (!nombreNuevo) return;
    const comentario = (prompt("Comentario (opcional):", cat.comentario || "") || "").trim();
    await updateDoc(doc(colCategorias(listaId), cat.id), { nombre: nombreNuevo, comentario });
    setCategorias((cs) => cs.map((c) => (c.id === cat.id ? { ...c, nombre: nombreNuevo, comentario } : c)));
  }

  async function eliminarCategoria(cat) {
    if (!listaId) return;
    if (!confirm(`¿Eliminar categoría "${cat.nombre}" y TODOS sus ítems?`)) return;
    const itemsSnap = await getDocs(colItems(listaId, cat.id)).catch(() => null);
    if (itemsSnap) {
      await Promise.all(itemsSnap.docs.map((d) => deleteDoc(doc(colItems(listaId, cat.id), d.id))));
    }
    await deleteDoc(doc(colCategorias(listaId), cat.id));
    setCategorias((cs) => cs.filter((c) => c.id !== cat.id));
  }

  async function actualizarPctCategoria(cat) {
    if (!listaId) return;
    const s = prompt("Ajuste porcentual (ej.: 5 para +5%, -10 para -10%)", "5");
    if (s == null) return;
    const pnum = Number(s);
    if (Number.isNaN(pnum)) return alert("Valor inválido.");
    const itemsSnap = await getDocs(colItems(listaId, cat.id)).catch(() => null);
    if (!itemsSnap) return;
    await Promise.all(
      itemsSnap.docs.map(async (d) => {
        const it = d.data() || {};
        const nuevo = Math.round(Number(it.precio || 0) * (1 + pnum / 100));
        await updateDoc(doc(colItems(listaId, cat.id), d.id), { precio: nuevo, actualizado: new Date().toLocaleString("es-CO") });
      })
    );
    setCategorias((cs) =>
      cs.map((c) =>
        c.id === cat.id
          ? { ...c, items: c.items.map((it) => ({ ...it, precio: Math.round(Number(it.precio || 0) * (1 + pnum / 100)) })) }
          : c
      )
    );
    alert("Precios actualizados.");
  }

  /* ---------- items ---------- */
  function openNuevoItem(cat) {
    setItemCat(cat);
    setItemMode("create");
    setItemEditId(null);
    setItemForm(emptyItem);
    setShowItemModal(true);
  }

  // NUEVO: abrir modal en modo EDITAR, precargar (con compatibilidad de nombres)
  function openEditarItem(cat, it) {
    setItemCat(cat);
    setItemMode("edit");
    setItemEditId(it.id);

    // inferir tipo y valor del “máximo descuento” unificado
    const pctV = Number(it.max_descuento_pct ?? it.max_desc_pct ?? 0);
    const valV = Number(it.max_descuento_valor ?? it.max_desc_valor ?? 0);
    let mdTipo = "pct";
    let mdValue = "";
    if (valV > 0) { mdTipo = "valor"; mdValue = String(valV); }
    else if (pctV > 0) { mdTipo = "pct"; mdValue = String(pctV); }

    setItemForm({
      codigo: it.codigo || "",
      nombre: it.nombre || "",
      precio: formatCOPInput(it.precio || 0),
      observaciones: it.comentario || "",
      usa_pago_fijo: !!it.usa_pago_fijo,
      pago_valor_fijo: String(it.pago_valor_fijo ?? "0"),
      permite_descuento: !!(it.permite_descuento ?? it.permite_desc ?? false),
      genera_rips: !!it.genera_rips,
      es_consulta: !!it.es_consulta,
      ver_en_agenda: !!it.ver_en_agenda,
      cuenta_contable: it.cuenta_contable || "",
      max_descuento_tipo: mdTipo,
      max_descuento_value: mdTipo === "valor" ? formatCOPInput(mdValue) : mdValue,
    });
    setShowItemModal(true);
  }

  async function guardarItem() {
    if (!listaId || !itemCat) return;
    if (!itemForm.nombre.trim()) return alert("El nombre es obligatorio.");

    const toNumber = (v) => Number(String(v).replace(/\D/g, "")) || 0;

    // convertir el único input de descuento según tipo
    let md_pct = 0, md_valor = 0;
    if (itemForm.permite_descuento) {
      if (itemForm.max_descuento_tipo === "pct") {
        md_pct = Math.max(0, Number(String(itemForm.max_descuento_value).replace(",", ".") || 0));
      } else {
        md_valor = toNumber(itemForm.max_descuento_value);
      }
    }

    // Payload con tus campos + ALIAS para compatibilidad con otros módulos
    const payload = {
      codigo: itemForm.codigo.trim(),
      nombre: itemForm.nombre.trim(),
      // ——— Nombres “tuyos”:
      permite_descuento: !!itemForm.permite_descuento,
      max_descuento_pct: md_pct,
      max_descuento_valor: md_valor,
      // ——— Alias para compatibilidad:
      permite_desc: !!itemForm.permite_descuento,
      max_desc_pct: md_pct,
      max_desc_valor: md_valor,

      genera_rips: !!itemForm.genera_rips,
      es_consulta: !!itemForm.es_consulta,
      ver_en_agenda: !!itemForm.ver_en_agenda,
      cuenta_contable: itemForm.cuenta_contable.trim(),
      comentario: itemForm.observaciones.trim(),
      precio: toNumber(itemForm.precio),
      usa_pago_fijo: !!itemForm.usa_pago_fijo,
      pago_valor_fijo: toNumber(itemForm.pago_valor_fijo),
      actualizado: new Date().toLocaleString("es-CO"),
    };

    if (itemMode === "create") {
      const ref = await addDoc(colItems(listaId, itemCat.id), {
        ...payload,
        creado: new Date().toLocaleString("es-CO"),
      });
      setCategorias((cs) =>
        cs.map((c) =>
          c.id === itemCat.id
            ? { ...c, items: [...c.items, { id: ref.id, ...payload }], expanded: true }
            : c
        )
      );
    } else {
      await updateDoc(doc(colItems(listaId, itemCat.id), itemEditId), payload);
      setCategorias((cs) =>
        cs.map((c) =>
          c.id === itemCat.id
            ? {
                ...c,
                items: c.items.map((x) =>
                  x.id === itemEditId ? { ...x, ...payload, id: itemEditId } : x
                ),
              }
            : c
        )
      );
    }

    setShowItemModal(false);
  }

  // (dejamos la versión con prompt desactivada para no romper nada que la llame)
  async function editarItem(/*cat, it*/) {
    alert("Ahora la edición abre el mismo modal del alta con los campos precargados.");
  }

  async function eliminarItem(cat, it) {
    if (!listaId) return;
    if (!confirm(`¿Eliminar "${it.nombre}"?`)) return;
    await deleteDoc(doc(colItems(listaId, cat.id), it.id));
    setCategorias((cs) => cs.map((c) => (c.id === cat.id ? { ...c, items: c.items.filter((x) => x.id !== it.id) } : c)));
  }

  /* ---------- sembrar categorías base (modal de categorías) ---------- */
  async function seedCatalogoBase() {
    try {
      const colRef = collection(db, "catalogo_categorias");
      for (const c of DEFAULT_CATS) {
        const idAuto = `${c.nombre}`.toLowerCase().normalize("NFD")
          .replace(/[\u0300-\u036f]/g,"").replace(/\s+/g,"-");
        await setDoc(doc(colRef, idAuto), { nombre: c.nombre, comentario: c.comentario || "" }, { merge: true });
      }
      alert("Catálogo base creado/actualizado. Vuelve a abrir 'Categorías existentes'.");
    } catch {
      alert("No se pudo sembrar el catálogo base.");
    }
  }

  /* ---------- categorías: modal ---------- */
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
    if (!listaId) return;
    try {
      const catRef = colCategorias(listaId);
      await addDoc(catRef, {
        nombre: cat.nombre,
        comentario: cat.comentario || "",
        activa: true,
        creado: new Date().toLocaleString("es-CO"),
      });
      const catSnap = await getDocs(catRef);
      setCategorias(catSnap.docs.map((d) => ({ id: d.id, ...d.data(), activa: d.data().activa ?? true, expanded:false, itemsLoaded:false, items:[] })));
      alert("Categoría agregada.");
    } catch {
      alert("No se pudo agregar la categoría.");
    }
  }

  async function addNewCategory() {
    if (!listaId) return;
    if (!newCatName.trim()) return alert("Escribe el nombre de la categoría.");
    try {
      const catRef = colCategorias(listaId);
      await addDoc(catRef, {
        nombre: newCatName.trim(),
        comentario: newCatComment.trim(),
        activa: true,
        creado: new Date().toLocaleString("es-CO"),
      });
      const catSnap = await getDocs(catRef);
      setCategorias(catSnap.docs.map((d) => ({ id: d.id, ...d.data(), activa: d.data().activa ?? true, expanded:false, itemsLoaded:false, items:[] })));
      setShowCats(false);
    } catch {
      alert("No se pudo crear la categoría.");
    }
  }

  /* ---------- util XLSX ---------- */
  function ensureXLSX() {
    return new Promise((resolve) => {
      if (typeof window !== "undefined" && window.XLSX) return resolve(window.XLSX);
      const s = document.createElement("script");
      s.src = "https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js";
      s.onload = () => resolve(window.XLSX || null);
      s.onerror = () => resolve(null);
      document.head.appendChild(s);
    });
  }

  /* ---------- incremento porcentual (global) ---------- */
  function roundValue(value, mode) {
    if (mode === "up") return Math.ceil(value);
    if (mode === "down") return Math.floor(value);
    return value;
  }
  async function applyBulkIncrement() {
    if (!listaId) return;
    const percent = Number(pct);
    if (!Number.isFinite(percent)) return alert("Ingresa un porcentaje válido.");
    try {
      for (const cat of categorias) {
        const itemsSnap = await getDocs(colItems(listaId, cat.id)).catch(() => null);
        if (!itemsSnap) continue;
        for (const d of itemsSnap.docs) {
          const it = d.data() || {};
          const nuevo = roundValue(Number(it.precio || 0) * (1 + percent / 100), roundMode);
          await updateDoc(doc(colItems(listaId, cat.id), d.id), {
            precio: nuevo,
            actualizado: new Date().toLocaleString("es-CO"),
          });
        }
      }
      alert("Precios actualizados.");
      setShowBulk(false);
    } catch {
      alert("No se pudo aplicar el incremento.");
    }
  }

  /* ---------- export ---------- */
  async function exportar() {
    try {
      if (!listaId) return;
      const HEAD = [
        "Categoría", "Código", "Nombre", "Permite desc", "Precio",
        "Genera RIPS", "Es consulta", "Ver en agenda",
        "Nombre en la agenda", "Tiempo", "Identificador", "Cuenta contable"
      ];
      const aoa = [];
      const titulo = `OdontoCloud · Lista de precios — ${(nombre || "Principal")}`;
      const fecha = `Exportado: ${new Date().toLocaleString("es-CO")}`;
      aoa.push([titulo]); aoa.push([fecha]); aoa.push([]); aoa.push(HEAD);
      const headerRowIndex = 4;
      const toSiNo = (v) => (v ? "si" : "no");

      for (const cat of categorias) {
        const itemsSnap = await getDocs(colItems(listaId, cat.id)).catch(() => null);
        const items = itemsSnap ? itemsSnap.docs.map(d => ({ id: d.id, ...d.data() })) : [];
        for (const it of items) {
          aoa.push([
            cat.nombre || "",
            it.codigo || "",
            it.nombre || "",
            toSiNo(!!(it.permite_descuento ?? it.permite_desc)),
            Number(it.precio || 0),
            toSiNo(!!it.genera_rips),
            toSiNo(!!it.es_consulta),
            toSiNo(!!it.ver_en_agenda),
            it.nombre_en_agenda || "",
            Number(it.tiempo || 0),
            it.identificador || "",
            it.cuenta_contable || "",
          ]);
        }
      }

      const XLSX = await ensureXLSX();
      const fileBase = `OdontoCloud-ListaPrecios-${(nombre || "Principal")}`;

      if (XLSX && XLSX.utils && aoa.length > headerRowIndex - 1) {
        const ws = XLSX.utils.aoa_to_sheet(aoa);
        ws["!cols"] = [
          { wch: 22 }, { wch: 14 }, { wch: 36 }, { wch: 12 }, { wch: 14 },
          { wch: 12 }, { wch: 12 }, { wch: 14 }, { wch: 28 }, { wch: 10 }, { wch: 16 }, { wch: 18 },
        ];
        ws["!merges"] = [{ s:{r:0,c:0}, e:{r:0,c:11} }, { s:{r:1,c:0}, e:{r:1,c:11} }];
        const lastRow = aoa.length;
        ws["!autofilter"] = { ref: `A${headerRowIndex}:L${lastRow}` };
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Lista de precios");
        const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
        const blob = new Blob([wbout], { type: "application/octet-stream" });
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = `${fileBase}.xlsx`; a.click(); URL.revokeObjectURL(a.href);
      } else {
        const csv = aoa
          .map(row => row.map(v => {
            const s = String(v ?? "").replace(/"/g, '""');
            return /[",\n]/.test(s) ? `"${s}"` : s;
          }).join(","))
          .join("\n");
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = `${fileBase}.csv`; a.click(); URL.revokeObjectURL(a.href);
      }
    } catch {
      alert("No se pudo exportar.");
    }
  }

  /* ---------- Filtros para autocompletar ---------- */
  const procSugsByNombre = useMemo(() => {
    const q = norm(itemForm.nombre);
    if (!q) return [];
    return procCatalog
      .filter(p => norm(p.nombre).includes(q) || norm(p.codigo).startsWith(q))
      .slice(0, 12);
  }, [itemForm.nombre, procCatalog]);

  const procSugsByCodigo = useMemo(() => {
    const q = norm(itemForm.codigo);
    if (!q) return [];
    return procCatalog
      .filter(p => norm(p.codigo).startsWith(q) || norm(p.nombre).includes(q))
      .slice(0, 12);
  }, [itemForm.codigo, procCatalog]);

  const cuentaSugs = useMemo(() => {
    const q = norm(itemForm.cuenta_contable);
    if (!q) return PUC_QUICK.slice(0, 12);
    return pucList
      .filter(c => norm(c.codigo).startsWith(q) || norm(c.nombre).includes(q))
      .slice(0, 20);
  }, [itemForm.cuenta_contable, pucList]);

  /* ---------- UI ---------- */
  return (
    <div className="oc-main-content lp">
      <div className="oc-section-title">
        <h2>Configuración · Edición Lista de precios</h2>
      </div>

      {errMsg && (
        <div style={{marginBottom:12, padding:"8px 12px", border:"1px solid #fecaca", background:"#fef2f2", color:"#991b1b", borderRadius:8}}>
          {errMsg}
        </div>
      )}

      <div className="card">
        {/* barra superior */}
        <div className="toolbar" style={{ justifyContent: "space-between", marginBottom: 12 }}>
          <div className="name-row">
            <label style={{ fontWeight: 700 }}>Nombre*</label>
            <input className="text-inp" value={nombre} placeholder="Principal" onChange={(e) => setNombre(e.target.value)} />
            <button className="btn green" onClick={guardarNombre} disabled={saving} title="Guardar nombre">
              {saving ? "Guardando…" : "Guardar"}
            </button>
          </div>

          {/* Orden estilo OralDrive: %  |  + Agregar categoría  |  Exportar */}
          <div style={{ display: "flex", gap: 8 }}>
            <button className="chip orange" title="Incrementar %" onClick={()=>{setPct(0);setRoundMode("none");setShowBulk(true);}}>%</button>
            <button className="chip green"  onClick={openCats}>+ Agregar categoría</button>
            <button className="chip blue"   title="Exportar"      onClick={exportar}>Exportar</button>
          </div>
        </div>

        {/* tabla categorías + acordeón */}
        <div className="table-responsive">
          <table>
            <thead>
              <tr>
                <th className="toggle-cell"></th>
                <th>Categoría</th>
                <th>Comentario</th>
                <th style={{ width: 140 }}>Estado</th>
                <th style={{ width: 360, textAlign: "right" }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} style={{ textAlign: "center", padding: 20 }}>Cargando…</td></tr>
              ) : categorias.length === 0 ? (
                <tr><td colSpan={5} style={{ textAlign: "center", padding: 20 }}>Sin categorías.</td></tr>
              ) : (
                categorias.map((c) => (
                  <React.Fragment key={c.id}>
                    <tr>
                      <td className="toggle-cell">
                        <span className="arrow" onClick={()=>toggleExpand(c)}>{c.expanded ? "▾" : "▸"}</span>
                      </td>
                      <td style={{ fontWeight: 700 }}>{c.nombre || "Categoría"}</td>
                      <td className="muted">{c.comentario || "—"}</td>
                      <td>
                        <span className={`status-pill ${c.activa ? "status-on" : "status-off"}`}>
                          {c.activa ? "Conectado" : "Desconectado"}
                        </span>
                      </td>
                      <td style={{ textAlign: "right" }}>
                        <div className="row-cat-actions">
                          {/* SOLO 4 BOTONES */}
                          <button className="btn green sm"  title="Nuevo ítem"          onClick={()=>openNuevoItem(c)}>＋</button>
                          <button className="btn orange sm" title="Actualizar precios %" onClick={()=>actualizarPctCategoria(c)}>%</button>
                          <button className="btn sky sm"    title="Editar categoría"     onClick={()=>editarCategoria(c)}>✏️</button>
                          <button className="btn red sm"    title="Eliminar categoría"   onClick={()=>eliminarCategoria(c)}>🗑️</button>
                        </div>
                      </td>
                    </tr>

                    {/* fila expandida con items */}
                    {c.expanded && (
                      <tr className="cat-details">
                        <td></td>
                        <td colSpan={4}>
                          <div className="table-responsive">
                            <table className="inner-table">
                              <thead>
                                <tr>
                                  <th style={{width:110}}>Código</th>
                                  <th>Lista de precios</th>
                                  <th style={{width:160}}>Permite descuento</th>
                                  <th style={{width:140}}>Precio</th>
                                  <th style={{width:140, textAlign:"right"}}>Acciones</th>
                                </tr>
                              </thead>
                              <tbody>
                                {(!c.items || c.items.length===0) ? (
                                  <tr>
                                    <td colSpan={5} className="muted" style={{ textAlign:"center", padding:12 }}>
                                      Sin ítems en esta categoría.
                                    </td>
                                  </tr>
                                ) : c.items.map((it)=>(
                                  <tr key={it.id}>
                                    <td className="mono">{it.codigo || "—"}</td>
                                    <td style={{ fontWeight: 600 }}>{it.nombre || "—"}</td>
                                    <td>{(it.permite_descuento ?? it.permite_desc) ? "Sí" : "No"}</td>
                                    <td className="mono">${Number(it.precio||0).toLocaleString("es-CO")}</td>
                                    <td style={{ textAlign:"right" }}>
                                      <div className="inner-actions">
                                        <button className="btn sky sm" onClick={()=>openEditarItem(c,it)}>✏️</button>
                                        <button className="btn red sm" onClick={()=>eliminarItem(c,it)}>🗑️</button>
                                      </div>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
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

      {/* ---------- Modal Agregar Categoría ---------- */}
      {showCats && (
        <div className="modal-mask" onClick={() => setShowCats(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="hd">Categoría</div>
            <div className="bd">
              <div className="row" style={{gap:6, marginBottom:12}}>
                <button className={`chip ${catTab==="existentes"?"blue":""}`} onClick={()=>setCatTab("existentes")}>Categorías existentes</button>
                <button className={`chip ${catTab==="nueva"?"blue":""}`} onClick={()=>setCatTab("nueva")}>Editar/Nueva categoría</button>
                <button className="chip green" onClick={seedCatalogoBase}>Sembrar catálogo base</button>
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

      {/* ---------- Modal Incremento % (global) ---------- */}
      {showBulk && (
        <div className="modal-mask" onClick={() => setShowBulk(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="hd">Incrementar todos los precios</div>
            <div className="bd">
              <div className="col">
                <label className="label-strong">Porcentaje de incremento *</label>
                <div className="row">
                  <input className="inp" style={{maxWidth:160}} type="number" min="0" step="0.01" placeholder="0" value={pct} onChange={(e)=>setPct(e.target.value)} />
                </div>
                <div className="col" style={{gap:8}}>
                  <label className="toggle"><input type="radio" name="round" checked={roundMode === "down"} onChange={()=>setRoundMode("down")} /> Redondear hacia abajo</label>
                  <label className="toggle"><input type="radio" name="round" checked={roundMode === "up"} onChange={()=>setRoundMode("up")} /> Redondear hacia arriba</label>
                  <label className="toggle"><input type="radio" name="round" checked={roundMode === "none"} onChange={()=>setRoundMode("none")} /> No redondear</label>
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

      {/* ---------- Modal Agregar/Editar Producto ---------- */}
      {showItemModal && (
        <div className="modal-mask" onClick={() => setShowItemModal(false)}>
          <div className="modal" onClick={(e)=>e.stopPropagation()}>
            <div className="hd">
              {itemMode === "edit"
                ? <>Editar producto{itemCat ? ` · ${itemCat.nombre}` : ""}</>
                : <>Agregar producto{itemCat ? ` · ${itemCat.nombre}` : ""}</>}
            </div>
            <div className="bd">
              {/* === Fila “perfecta”: Código | Nombre | Precio === */}
              <div className="form-grid-3">
                <div className="field">
                  <label>Código *</label>
                  <AutoInput
                    value={itemForm.codigo}
                    onChange={(v)=>setItemForm({...itemForm, codigo:v})}
                    placeholder="Código (ej. 890203)"
                    suggestions={procSugsByCodigo}
                    onPick={(p)=>setItemForm({...itemForm, codigo:p.codigo, nombre:p.nombre})}
                    renderRow={(p)=>(<>
                      <span className="ac-code">{p.codigo}</span>
                      <span className="ac-name">{p.nombre}</span>
                    </>)}
                    minChars={1}
                  />
                </div>

                <div className="field">
                  <label>Nombre *</label>
                  <AutoInput
                    value={itemForm.nombre}
                    onChange={(v)=>setItemForm({...itemForm, nombre:v})}
                    placeholder="Nombre del procedimiento"
                    suggestions={procSugsByNombre}
                    onPick={(p)=>setItemForm({...itemForm, codigo:p.codigo, nombre:p.nombre})}
                    renderRow={(p)=>(<>
                      <span className="ac-code">{p.codigo}</span>
                      <span className="ac-name">{p.nombre}</span>
                    </>)}
                    minChars={1}
                  />
                </div>

                <div className="field">
                  <label>Precio *</label>
                  <input
                    className="inp"
                    type="text"
                    inputMode="numeric"
                    pattern="\\d*"
                    placeholder="$0"
                    value={itemForm.precio}
                    onChange={(e)=>setItemForm({...itemForm, precio: formatCOPInput(e.target.value)})}
                  />
                </div>
              </div>

              {/* Observaciones */}
              <div className="form-row-full">
                <div className="field">
                  <label>Observaciones</label>
                  <textarea className="ta" value={itemForm.observaciones} onChange={e=>setItemForm({...itemForm, observaciones:e.target.value})} />
                </div>
              </div>

              {/* Pago fijo a doctores */}
              <div className="form-row-full" style={{display:"grid", gridTemplateColumns:"160px auto auto", gap:"12px", alignItems:"center"}}>
                <div className="field" style={{margin:0}}>
                  <label>Pago valor fijo a doctores</label>
                  <input className="inp" type="number" min="0"
                    value={itemForm.pago_valor_fijo}
                    onChange={e=>setItemForm({...itemForm, pago_valor_fijo:e.target.value})}/>
                </div>
                <label className="toggle" style={{marginTop:18}}>
                  <input type="checkbox" checked={itemForm.usa_pago_fijo}
                         onChange={e=>setItemForm({...itemForm, usa_pago_fijo:e.target.checked})} />
                  Usar valor fijo
                </label>
                <div className="muted">Use este campo para no liquidar a los doctores por su % configurado sino por un valor fijo en dinero $</div>
              </div>

              {/* Toggles */}
              <div className="form-row-full" style={{display:"flex", gap:18, flexWrap:"wrap"}}>
                <label className="toggle">
                  <input
                    type="checkbox"
                    checked={itemForm.permite_descuento}
                    onChange={e=>setItemForm({
                      ...itemForm,
                      permite_descuento:e.target.checked,
                      ...(e.target.checked ? {} : {max_descuento_value:""})
                    })}
                  />
                  Permite descuento
                </label>
                <label className="toggle">
                  <input type="checkbox" checked={itemForm.genera_rips} onChange={e=>setItemForm({...itemForm, genera_rips:e.target.checked})}/>
                  Genera RIPS
                </label>
                <label className="toggle">
                  <input type="checkbox" checked={itemForm.es_consulta} onChange={e=>setItemForm({...itemForm, es_consulta:e.target.checked})}/>
                  Es consulta
                </label>
                <div className="toggle">
                  <span>Ver en agenda</span>
                  <label className="toggle-pill">
                    <input type="checkbox" checked={itemForm.ver_en_agenda}
                           onChange={e=>setItemForm({...itemForm, ver_en_agenda:e.target.checked})}/>
                    <span>{itemForm.ver_en_agenda ? "Sí" : "No"}</span>
                  </label>
                </div>
              </div>

              {/* Máximo descuento: UN solo input con selector % | $ */}
              {itemForm.permite_descuento && (
                <div className="form-row-full">
                  <div className="field">
                    <label>Máximo descuento</label>
                    <div className="seg-wrap">
                      <div
                        className={`seg ${itemForm.max_descuento_tipo === "pct" ? "on" : ""}`}
                        onClick={()=>setItemForm({...itemForm, max_descuento_tipo:"pct", max_descuento_value: String(itemForm.max_descuento_value).replace(/\D+/g,"") })}
                        title="Porcentaje"
                      >
                        %
                      </div>
                      <div
                        className={`seg ${itemForm.max_descuento_tipo === "valor" ? "on" : ""}`}
                        onClick={()=>setItemForm({...itemForm, max_descuento_tipo:"valor", max_descuento_value: formatCOPInput(itemForm.max_descuento_value) })}
                        title="Valor en $"
                      >
                        $
                      </div>

                      {/* Input único */}
                      {itemForm.max_descuento_tipo === "pct" ? (
                        <input
                          className="inp"
                          type="number"
                          min="0"
                          step="0.01"
                          placeholder="0"
                          value={String(itemForm.max_descuento_value).replace(/[^\d.,-]/g,"")}
                          onChange={(e)=>setItemForm({...itemForm, max_descuento_value:e.target.value})}
                        />
                      ) : (
                        <input
                          className="inp"
                          type="text"
                          inputMode="numeric"
                          placeholder="$0"
                          value={formatCOPInput(itemForm.max_descuento_value)}
                          onChange={(e)=>setItemForm({...itemForm, max_descuento_value: formatCOPInput(e.target.value)})}
                        />
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Cuenta contable */}
              <div className="form-row-full">
                <div className="field">
                  <label>Cuenta contable</label>
                  <AutoInput
                    value={itemForm.cuenta_contable}
                    onChange={(v)=>setItemForm({...itemForm, cuenta_contable:v})}
                    placeholder="Buscar ítem..."
                    suggestions={cuentaSugs}
                    onPick={(c)=>setItemForm({...itemForm, cuenta_contable: `${c.codigo} · ${c.nombre}`})}
                    renderRow={(c)=>(<>
                      <span className="ac-code" style={{minWidth:72}}>{c.codigo}</span>
                      <span className="ac-name">{c.nombre}</span>
                    </>)}
                    minChars={0}
                  />
                </div>
              </div>
            </div>
            <div className="ft">
              <button className="chip gray" onClick={()=>setShowItemModal(false)}>Cerrar</button>
              <button className="chip green" onClick={guardarItem}>
                {itemMode === "edit" ? "Actualizar" : "Guardar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
