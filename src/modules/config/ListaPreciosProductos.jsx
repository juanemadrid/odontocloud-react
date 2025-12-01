// ===============================
// 🧾 ListaPreciosProductos.jsx
// Pestaña: "Lista de precios productos"
// - Listado básico con crear / usar / editar (navega a tu ruta de edición) / eliminar
// - Sin estilos globales nuevos: reutiliza los que inyecta el contenedor
// ===============================
import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  collection, getDocs, addDoc, updateDoc, deleteDoc, doc
} from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";

// 💾 Ajusta aquí si tu colección tiene otro nombre
const COLLECTION = "listas_precios_productos";

// ---------- helpers de ruta (igual patrón que el contenedor) ----------
function getDashBase(pathname = "") {
  const segs = pathname.split("/").filter(Boolean);
  const i = segs.findIndex((s) => s.startsWith("dashboard_"));
  return i >= 0 ? `/${segs.slice(0, i + 1).join("/")}` : "";
}

export default function ListaPreciosProductos() {
  const [loading, setLoading] = useState(true);
  const [listas, setListas] = useState([]);

  const { pathname } = useLocation();
  const navigate = useNavigate();
  const baseDash = useMemo(() => getDashBase(pathname), [pathname]);

  // Ruta de edición para productos (ajústala a tu editor real)
  const irEditar = (row) =>
    navigate(`${baseDash}/config/lista-de-precios/productos/editar/${row.id}`);

  // Cargar
  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const snap = await getDocs(collection(db, COLLECTION));
        const arr = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        // Orden básico por actualizado/creado desc
        arr.sort((a, b) => {
          const da = a.actualizado || a.creado || "";
          const dbb = b.actualizado || b.creado || "";
          if (da && dbb) return String(dbb).localeCompare(String(da));
          return (a?.nombre || "").localeCompare(b?.nombre || "");
        });
        setListas(arr);
      } catch (e) {
        console.error("[LP Productos] cargar:", e?.code, e?.message);
        setListas([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // Crear listado nuevo
  async function crearLista() {
    try {
      const nombre = `Lista de productos ${new Date().toLocaleDateString("es-CO")}`;
      const payload = {
        nombre,
        creado: new Date().toLocaleString("es-CO"),
        actualizado: new Date().toLocaleString("es-CO"),
        en_uso: false,
        tipo: "productos", // útil si quieres filtrar por tipo
      };
      const ref = await addDoc(collection(db, COLLECTION), payload);
      setListas((prev) => [{ id: ref.id, ...payload }, ...prev]);
    } catch (e) {
      console.error(e);
      alert("No se pudo crear el listado de productos.");
    }
  }

  // Marcar uno "En uso" (desactiva los demás)
  async function setEnUso(row) {
    try {
      const snap = await getDocs(collection(db, COLLECTION));
      const ops = snap.docs.map((d) =>
        updateDoc(doc(db, COLLECTION, d.id), { en_uso: d.id === row.id })
      );
      await Promise.all(ops);
      setListas((prev) => prev.map((x) => ({ ...x, en_uso: x.id === row.id })));
    } catch (e) {
      console.error(e);
      alert("No se pudo cambiar el estado de uso.");
    }
  }

  // Eliminar
  async function eliminarLista(row) {
    if (!window.confirm(`¿Eliminar "${row?.nombre}"?`)) return;
    try {
      await deleteDoc(doc(db, COLLECTION, row.id));
      setListas((prev) => prev.filter((x) => x.id !== row.id));
    } catch (e) {
      console.error(e);
      alert("No se pudo eliminar.");
    }
  }

  return (
    <div className="lp-card">
      {/* Header con CTA */}
      <div className="lp-tabs" style={{ justifyContent: "space-between" }}>
        <div style={{ display: "flex", gap: 8 }}>
          <span className="lp-pill active">Lista de precios productos</span>
        </div>
        <button className="btn blue" onClick={crearLista}>
          + Nuevo listado de productos
        </button>
      </div>

      {/* Tabla */}
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
              <tr>
                <td colSpan={5} style={{ textAlign: "center", padding: 20 }}>
                  Cargando…
                </td>
              </tr>
            ) : listas.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ textAlign: "center", padding: 20 }}>
                  <span className="muted">Sin datos</span>
                </td>
              </tr>
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
                      <button className="btn blue"  onClick={() => irEditar(r)}>Editar</button>
                      <button className="btn green" onClick={() => setEnUso(r)}>Usar</button>
                      <button className="btn red"   onClick={() => eliminarLista(r)}>Eliminar</button>
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
