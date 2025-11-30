// ===============================
// 💰 ListaPrecios.jsx
// Configuración -> Lista de precios (listado + formulario /nuevo)
// ===============================
import React, { useState, useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { collection, getDocs, addDoc, doc, deleteDoc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";

// helpers de ruta para trabajar dentro de /dashboard_*/config/...
function getDashBase(pathname = "") {
  const segs = pathname.split("/").filter(Boolean);
  const i = segs.findIndex((s) => s.startsWith("dashboard_"));
  return i >= 0 ? `/${segs.slice(0, i + 1).join("/")}` : "";
}
const endsWith = (p, tail) => p.toLowerCase().endsWith(tail.toLowerCase());

/* -------------------- UTIL: exportar Excel/CSV -------------------- */
async function exportarExcelPlantilla(nombreArchivo = "OdontoCloud-PriceList") {
  // Cabeceras exactamente como en tu imagen
  const headers = [
    "Categoría",
    "Código",
    "Nombre",
    "Permite desc",
    "Precio",
    "Genera RIPS",
    "Es consulta",
    "Ver en la agenda",
    "Nombre en la agenda",
    "Tiempo",
    "Identificador",
    "Ver en agenda",
    "Cuenta contable",
  ];

  // intentamos usar SheetJS desde CDN; si falla, exportamos CSV
  try {
    // Import dinámico desde CDN (funciona en Vite)
    const XLSX = await import("https://cdn.sheetjs.com/xlsx-0.20.3/package/xlsx.mjs");

    // Hoja 1: Lista de precios (solo headers, filas en blanco para que llenes)
    const data = [headers];
    const ws = XLSX.utils.aoa_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Lista de precios");

    // (opcional) Hojas extra si luego las llenas:
    const ws2 = XLSX.utils.aoa_to_sheet([["Formato"]]);
    XLSX.utils.book_append_sheet(wb, ws2, "Formatos");
    const ws3 = XLSX.utils.aoa_to_sheet([["Identificador", "Descripción"]]);
    XLSX.utils.book_append_sheet(wb, ws3, "Identificadores de tipo de cita");

    const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const blob = new Blob([wbout], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${nombreArchivo}.xlsx`;
    a.click();
    URL.revokeObjectURL(url);
  } catch (err) {
    // Fallback: CSV (Excel lo abre perfecto)
    console.warn("No se pudo cargar XLSX, exportando CSV.", err);
    const csv = [headers.join(",")].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${nombreArchivo}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }
}

/* -------------------- Formulario: Nueva lista -------------------- */
function NuevoPrecioForm({ tipo = "clinicos", onCancel, onSaved }) {
  const [nombre, setNombre] = useState("");
  const [saving, setSaving] = useState(false);

  const guardar = async () => {
    if (!nombre.trim()) {
      alert("Por favor, escribe el nombre de la lista.");
      return;
    }
    setSaving(true);
    try {
      const ahora = new Date().toLocaleString("es-CO", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
      await addDoc(collection(db, "listas_precios"), {
        nombre: nombre.trim(),
        tipo,                    // clinicos | productos | servicios
        creado: ahora,
        actualizado: ahora,
        enUso: true,
      });
      onSaved?.();
    } catch (e) {
      console.error("Error creando lista:", e);
      alert("No se pudo crear la lista. Revisa consola.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="card" style={{ position: "relative" }}>
      {/* botón Exportar */}
      <button
        type="button"
        title="Exportar"
        className="ghost-chip"
        style={{
          position: "absolute",
          right: 16,
          top: 16,
          height: 34,
          padding: "0 12px",
          borderRadius: 999,
          border: "1px solid #e5e7eb",
          background: "#eff6ff",
          fontWeight: 600,
          cursor: "pointer",
          opacity: 0.9,
        }}
        onClick={() => exportarExcelPlantilla("OdontoCloud-PriceList")}
      >
        Exportar
      </button>

      <div
        className="lp-formbox"
        style={{
          border: "1px solid #e5e7eb",
          borderRadius: 10,
          padding: 16,
          background: "#fff",
          maxWidth: 720,
        }}
      >
        <label
          htmlFor="nombreLista"
          style={{ display: "block", fontWeight: 700, marginBottom: 8 }}
        >
          Nombre *
        </label>

        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <input
            id="nombreLista"
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Nombre de la lista"
            style={{
              flex: 1,
              height: 38,
              padding: "0 10px",
              borderRadius: 8,
              border: `1px solid ${nombre ? "#cbd5e1" : "#fca5a5"}`,
              outline: "none",
            }}
          />
          <button
            type="button"
            title="Sugerir nombre"
            className="round-tip"
            onClick={() =>
              setNombre("Lista de precios " + new Date().toLocaleDateString("es-CO"))
            }
            style={{
              height: 38,
              width: 38,
              borderRadius: 999,
              border: "1px solid #e5e7eb",
              background: "#f9fafb",
              cursor: "pointer",
              fontWeight: 700,
            }}
          >
            ⓘ
          </button>
        </div>

        <div style={{ marginTop: 16, display: "flex", gap: 8 }}>
          <button
            type="button"
            onClick={guardar}
            disabled={saving}
            className="save-btn"
            style={{
              height: 36,
              padding: "0 14px",
              borderRadius: 8,
              border: 0,
              background: "#22c55e",
              color: "#fff",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            {saving ? "Guardando..." : "Guardar"}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="neutral-btn"
            style={{
              height: 36,
              padding: "0 14px",
              borderRadius: 8,
              border: "1px solid #e5e7eb",
              background: "#fff",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}

/* -------------------- Listado + Tabs -------------------- */
export default function ListaPrecios() {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const baseDash = useMemo(() => getDashBase(pathname), [pathname]);
  const baseConfig = `${baseDash}/config/lista-de-precios`;
  const isNuevo = endsWith(pathname, "/config/lista-de-precios/nuevo");

  const [tab, setTab] = useState("clinicos");
  const [precios, setPrecios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reloadTick, setReloadTick] = useState(0);

  // 🔧 CSS FORZADO – estructura base
  useEffect(() => {
    const STYLE_ID = "lp-inline-styles-2";
    if (!document.getElementById(STYLE_ID)) {
      const css = `
        .oc-main-content.lp { padding: 16px 20px !important; }
        .oc-section-title { margin-bottom: 16px !important; }
        .oc-section-title h2 { margin: 0 !important; font-weight: 800 !important; font-size: 20px !important; color: #0f172a !important; }
        .lp .card { background:#fff !important; border:1px solid #e5e7eb !important; border-radius:10px !important; padding:16px !important; box-shadow: 0 2px 8px rgba(0,0,0,.04) !important; }
        .lp .lp-formbox { width:100% !important; max-width: 900px !important; }
        .lp .card .lp-formbox input[type="text"] { width: 100% !important; }
        .lp .table-responsive { width:100% !important; overflow-x:auto !important; }
        .lp .table-responsive table { width:100% !important; border-collapse: collapse !important; }
        .lp .table-responsive th, .lp .table-responsive td { white-space: nowrap !important; }
        .lp .tabs-btn { padding: 8px 14px !important; border-radius: 8px !important; border: 1px solid #cbd5e1 !important; font-weight: 600 !important; cursor: pointer !important; }
        @media (max-width: 640px){ .oc-main-content.lp { padding: 12px !important; } .oc-section-title h2 { font-size: 18px !important; } }
      `;
      const tag = document.createElement("style");
      tag.id = STYLE_ID;
      tag.appendChild(document.createTextNode(css));
      document.head.appendChild(tag);
    }
  }, []);

  // 🔧 CSS COLORES BOTONES – asegura fondo sólido
  useEffect(() => {
    const ID = "lp-solid-btns";
    if (document.getElementById(ID)) return;
    const css = `
      .lp .tabs-btn{appearance:none!important;-webkit-appearance:none!important;border:1px solid #cbd5e1!important;font-weight:600!important;cursor:pointer!important}
      .lp .tabs-btn{background:#f8fafc!important;color:#1e293b!important}
      .lp .tabs-btn.active{background:#2563eb!important;color:#fff!important;border-color:#1d4ed8!important}

      .lp .save-btn{appearance:none!important;-webkit-appearance:none!important;border:none!important;background:#22c55e!important;color:#fff!important}
      .lp .neutral-btn{appearance:none!important;-webkit-appearance:none!important;border:1px solid #e5e7eb!important;background:#fff!important;color:#111827!important}

      .lp .btn-blue{appearance:none!important;-webkit-appearance:none!important;border:none!important;background:#3b82f6!important;color:#fff!important}
      .lp .btn-sky{appearance:none!important;-webkit-appearance:none!important;border:none!important;background:#06b6d4!important;color:#fff!important}
      .lp .btn-red{appearance:none!important;-webkit-appearance:none!important;border:none!important;background:#ef4444!important;color:#fff!important}

      .lp .round-tip{appearance:none!important;-webkit-appearance:none!important;background:#f9fafb!important;border:1px solid #e5e7eb!important;color:#111827!important}
      .lp .ghost-chip{appearance:none!important;-webkit-appearance:none!important;background:#eff6ff!important;border:1px solid #e5e7eb!important;color:#0f172a!important;opacity:1!important}
    `;
    const tag = document.createElement("style");
    tag.id = ID;
    tag.appendChild(document.createTextNode(css));
    document.head.appendChild(tag);
  }, []);

  // Cargar datos de Firestore
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const ref = collection(db, "listas_precios");
        const snap = await getDocs(ref);
        const arr = snap.docs.map((d) => ({
          id: d.id,
          nombre: d.data().nombre || "Sin nombre",
          creado: d.data().creado || "—",
          actualizado: d.data().actualizado || "—",
          enUso: d.data().enUso ?? true,
        }));
        setPrecios(arr);
      } catch (e) {
        console.error("Error cargando listas:", e);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [reloadTick]);

  // acciones de la fila
  const editar = (id) => navigate(`${baseConfig}/editar/${id}`);

  const duplicar = async (id) => {
    try {
      const ref = doc(db, "listas_precios", id);
      const snap = await getDoc(ref);
      if (!snap.exists()) return alert("No se encontró la lista para duplicar.");
      const data = snap.data();
      const ahora = new Date().toLocaleString("es-CO");
      // nuevo doc con nombre " (copia)"
      await addDoc(collection(db, "listas_precios"), {
        ...data,
        nombre: `${data.nombre || "Lista"} (copia)`,
        creado: ahora,
        actualizado: ahora,
      });
      setReloadTick((t) => t + 1);
    } catch (e) {
      console.error(e);
      alert("No se pudo duplicar la lista.");
    }
  };

  const eliminar = async (id) => {
    if (!confirm("¿Eliminar esta lista de precios?")) return;
    try {
      await deleteDoc(doc(db, "listas_precios", id));
      setPrecios((prev) => prev.filter((x) => x.id !== id));
    } catch (e) {
      console.error(e);
      alert("No se pudo eliminar.");
    }
  };

  const irNuevo = () => navigate(`${baseConfig}/nuevo`);
  const volverListado = () => navigate(baseConfig);

  return (
    <div className="oc-main-content lp">
      <div className="oc-section-title">
        <h2>
          Configuración · {isNuevo ? "Nueva lista de precios" : "Lista de precios"}
        </h2>
      </div>

      {/* Si estamos en /nuevo, renderiza el formulario */}
      {isNuevo ? (
        <NuevoPrecioForm
          tipo={tab}
          onCancel={volverListado}
          onSaved={() => {
            setReloadTick((t) => t + 1);
            volverListado();
          }}
        />
      ) : (
        <div className="card">
          {/* Pestañas + botón nuevo */}
          <div
            style={{
              display: "flex",
              gap: 8,
              marginBottom: 16,
              flexWrap: "wrap",
            }}
          >
            {[
              { key: "clinicos", label: "Lista de precios clínicos" },
              { key: "productos", label: "Lista de precios productos" },
              { key: "servicios", label: "Lista de precios servicios" },
            ].map((t) => (
              <button
                key={t.key}
                className={`tabs-btn ${tab === t.key ? "active" : ""}`}
                onClick={() => setTab(t.key)}
                style={{
                  background: tab === t.key ? "#2563eb" : "#f8fafc",
                  color: tab === t.key ? "#fff" : "#1e293b",
                }}
              >
                {t.label}
              </button>
            ))}

            <button
              className="tabs-btn active"
              style={{
                marginLeft: "auto",
                background: "#65a30d",
                color: "#fff",
                border: "none",
                borderRadius: 8,
                padding: "8px 14px",
                cursor: "pointer",
                fontWeight: 600,
              }}
              onClick={irNuevo}
            >
              + Nuevo listado de precios
            </button>
          </div>

          {/* Tabla */}
          <div className="table-responsive">
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: ".9rem",
              }}
            >
              <thead>
                <tr style={{ background: "#f1f5f9" }}>
                  <th style={th}>Nombre</th>
                  <th style={th}>Fecha de creación</th>
                  <th style={th}>Fecha de actualización</th>
                  <th style={th}>En uso</th>
                  <th style={th}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: "center", padding: 20 }}>
                      Cargando…
                    </td>
                  </tr>
                ) : precios.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: "center", padding: 20 }}>
                      No hay listas registradas.
                    </td>
                  </tr>
                ) : (
                  precios.map((p) => (
                    <tr key={p.id} style={{ borderBottom: "1px solid #e2e8f0" }}>
                      <td style={td}>{p.nombre}</td>
                      <td style={td}>{p.creado}</td>
                      <td style={td}>{p.actualizado}</td>
                      <td style={td}>
                        <span
                          style={{
                            color: p.enUso ? "#15803d" : "#dc2626",
                            fontWeight: 600,
                          }}
                        >
                          {p.enUso ? "En uso" : "Inactivo"}
                        </span>
                      </td>
                      <td style={td}>
                        <button
                          className="btn-blue"
                          style={btnBlue}
                          title="Editar"
                          onClick={() => editar(p.id)}
                        >
                          ✏️
                        </button>
                        <button
                          className="btn-sky"
                          style={btnSky}
                          title="Duplicar"
                          onClick={() => duplicar(p.id)}
                        >
                          📋
                        </button>
                        <button
                          className="btn-red"
                          style={btnRed}
                          title="Eliminar"
                          onClick={() => eliminar(p.id)}
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// ===== Estilos base de tabla =====
const th = {
  padding: "10px 12px",
  textAlign: "left",
  borderBottom: "1px solid #e2e8f0",
  color: "#475569",
  fontWeight: 700,
};
const td = {
  padding: "10px 12px",
  color: "#0f172a",
};
const btnBlue = {
  background: "#3b82f6",
  border: "none",
  color: "#fff",
  padding: "4px 8px",
  borderRadius: 6,
  marginRight: 6,
  cursor: "pointer",
};
const btnSky = {
  background: "#06b6d4",
  border: "none",
  color: "#fff",
  padding: "4px 8px",
  borderRadius: 6,
  marginRight: 6,
  cursor: "pointer",
};
const btnRed = {
  background: "#ef4444",
  border: "none",
  color: "#fff",
  padding: "4px 8px",
  borderRadius: 6,
  cursor: "pointer",
};
