// src/modules/caja/Caja.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import "./caja.css"; // <— estilos locales de Caja
import { onAuthStateChanged } from "firebase/auth";
import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { auth, db } from "../../firebase/firebaseConfig";

/* ===================== utils ===================== */
const toCOP = (n) =>
  (Number(n) || 0).toLocaleString("es-CO", { maximumFractionDigits: 0 });

const sod = (d = new Date()) =>
  new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
const eod = (d = new Date()) =>
  new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1, 0, 0, 0, 0);
const ts = (d) => Timestamp.fromDate(d);

const useAuthUser = () => {
  const [user, setUser] = useState(null);
  useEffect(() => {
    const u = onAuthStateChanged(auth, (x) => setUser(x || null));
    return () => u();
  }, []);
  return user;
};

const StickyTH = ({ children, align }) => (
  <th
    className="oc-th"
    style={{
      position: "sticky",
      top: 0,
      zIndex: 1,
      textAlign: align || "left",
      background: "var(--oc-surface, #fff)",
    }}
  >
    {children}
  </th>
);

/* ===================== main ===================== */
export default function Caja() {
  const user = useAuthUser();

  const MENU = [
    { key: "abrir", label: "Abrir caja", icon: "➕" },
    { key: "abiertas", label: "Cajas abiertas", icon: "📂" },
    { key: "cerradas", label: "Cajas cerradas", icon: "🔒" },
    { key: "mio", label: "Mi caja (hoy)", icon: "🧑" },
    { key: "simulados", label: "Cierres simulados", icon: "🧮" },
    { key: "bancos", label: "Bancos", icon: "🏦" },
  ];
  const [tab, setTab] = useState("abiertas");

  const [banner, setBanner] = useState("");
  const [search, setSearch] = useState("");
  const searchRef = useRef(null);

  /* abrir */
  const [opening, setOpening] = useState(false);
  const [baseInicial, setBaseInicial] = useState("");

  /* abiertas */
  const [openRows, setOpenRows] = useState([]);
  const [openLoading, setOpenLoading] = useState(true);

  /* cerradas */
  const [closedRows, setClosedRows] = useState([]);
  const [closedLoading, setClosedLoading] = useState(true);

  /* mi caja */
  const [myBox, setMyBox] = useState(null);
  const [myLoading, setMyLoading] = useState(true);

  /* -------- realtime: abiertas -------- */
  useEffect(() => {
    const qOpen = query(
      collection(db, "cajas"),
      where("estado", "==", "abierta"),
      orderBy("fechaApertura", "desc")
    );
    const u = onSnapshot(
      qOpen,
      (snap) => {
        setOpenRows(snap.docs.map((d) => normalizeBox(d.id, d.data())));
        setOpenLoading(false);
        setBanner("");
      },
      (err) => {
        console.error(err);
        setBanner(
          err?.code === "failed-precondition"
            ? "Falta índice (estado, fechaApertura) en Firestore."
            : err?.code === "permission-denied"
            ? "Permiso denegado en Firestore (revisa reglas)."
            : "No se pudieron leer las cajas."
        );
        setOpenLoading(false);
      }
    );
    return () => u();
  }, []);

  /* -------- realtime: cerradas -------- */
  useEffect(() => {
    const qC = query(
      collection(db, "cajas"),
      where("estado", "==", "cerrada"),
      orderBy("fechaCierre", "desc")
    );
    const u = onSnapshot(
      qC,
      (snap) => {
        setClosedRows(snap.docs.map((d) => normalizeBox(d.id, d.data())));
        setClosedLoading(false);
      },
      (err) => {
        console.error(err);
        setClosedLoading(false);
      }
    );
    return () => u();
  }, []);

  /* -------- mi caja hoy -------- */
  useEffect(() => {
    if (!user) {
      setMyBox(null);
      setMyLoading(false);
      return;
    }
    setMyLoading(true);
    const qMine = query(
      collection(db, "cajas"),
      where("estado", "==", "abierta"),
      where("usuarioId", "==", user.uid),
      where("fechaApertura", ">=", ts(sod())),
      where("fechaApertura", "<", ts(eod()))
    );
    const u = onSnapshot(
      qMine,
      (snap) => {
        const d = snap.docs[0];
        setMyBox(d ? normalizeBox(d.id, d.data()) : null);
        setMyLoading(false);
      },
      (err) => {
        console.error(err);
        setMyLoading(false);
        if (err?.code === "failed-precondition") {
          setBanner("Falta índice (estado, usuarioId, fechaApertura) en Firestore.");
        }
      }
    );
    return () => u();
  }, [user]);

  function normalizeBox(id, data = {}) {
    const asDate = (x) =>
      x?.toDate?.() || (typeof x === "string" ? new Date(x) : x || null);
    const fechaApertura = asDate(data.fechaApertura);
    const fechaCierre = asDate(data.fechaCierre);
    const baseInicial = Number(data.baseInicial || 0);
    const baseActual = Number(
      data.baseActual !== undefined ? data.baseActual : baseInicial
    );
    const saldoInicial = Number(data.saldoInicial || 0);
    const saldoActual = Number(
      data.saldoActual !== undefined ? data.saldoActual : saldoInicial
    );

    const ia = [];
    if (saldoActual < 0) ia.push("Saldo negativo");
    if (baseActual < 0) ia.push("Base negativa");

    return {
      id,
      estado: data.estado || "abierta",
      usuarioId: data.usuarioId || "",
      usuarioNombre: data.usuarioNombre || "Usuario",
      nombre: data.nombre || data.usuarioNombre || "Caja",
      fechaApertura,
      fechaCierre,
      baseInicial,
      baseActual,
      saldoInicial,
      saldoActual,
      ia,
    };
  }

  /* -------- abrir caja -------- */
  const onOpen = async (e) => {
    e?.preventDefault?.();
    if (!user) {
      setBanner("Debes iniciar sesión para abrir una caja.");
      return;
    }
    setOpening(true);
    try {
      const base = Number(baseInicial || 0);
      await addDoc(collection(db, "cajas"), {
        estado: "abierta",
        usuarioId: user.uid,
        usuarioNombre: user.displayName || user.email || "Usuario",
        fechaApertura: serverTimestamp(),
        baseInicial: base,
        baseActual: base,
        saldoInicial: 0,
        saldoActual: 0,
        dia: new Date().toISOString().slice(0, 10),
      });
      setBaseInicial("");
      setTab("mio");
      setBanner("");
    } catch (e) {
      console.error(e);
      setBanner("No se pudo abrir la caja.");
    } finally {
      setOpening(false);
    }
  };

  /* -------- cerrar caja -------- */
  const onCloseBox = async (id) => {
    try {
      await updateDoc(doc(db, "cajas", id), {
        estado: "cerrada",
        fechaCierre: serverTimestamp(),
      });
      setTab("cerradas");
    } catch (e) {
      console.error(e);
      setBanner("No se pudo cerrar la caja.");
    }
  };

  /* -------- filtro -------- */
  const norm = (s) =>
    (s || "")
      .toString()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();

  const filteredOpen = useMemo(() => {
    const q = norm(search);
    if (!q) return openRows;
    return openRows.filter((r) =>
      [r.nombre, r.usuarioNombre, toCOP(r.saldoActual), toCOP(r.baseActual)]
        .map(norm)
        .some((x) => x.includes(q))
    );
  }, [search, openRows]);

  /* -------- UX: Ctrl/Cmd+K => buscar -------- */
  useEffect(() => {
    const h = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);

  /* ===================== sub-vistas ===================== */
  const ViewAbrir = () => (
    <div className="card">
      <div className="oc-card-head" style={{ marginBottom: 8 }}>
        <h3>Abrir caja</h3>
      </div>
      <form
        className="oc-form"
        onSubmit={onOpen}
        style={{ display: "flex", gap: 12, alignItems: "end", flexWrap: "wrap" }}
      >
        <label style={{ display: "inline-flex", flexDirection: "column", gap: 6 }}>
          <span>Base inicial (COP)</span>
          <input
            type="number"
            className="oc-input"
            min="0"
            step="1000"
            value={baseInicial}
            onChange={(e) => setBaseInicial(e.target.value)}
            placeholder="0"
          />
        </label>
        <button className="oc-btn" type="submit" disabled={opening}>
          {opening ? "Abriendo..." : "Abrir caja"}
        </button>
      </form>
      <p className="oc-muted" style={{ marginTop: 8 }}>
        Se asociará a tu usuario y quedará visible en <b>Mi caja (hoy)</b>.
      </p>
    </div>
  );

  const ViewAbiertas = () => (
    <>
      <div className="card" style={{ marginBottom: 10 }}>
        <div
          className="oc-card-head"
          style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <h3 style={{ margin: 0 }}>Cajas Abiertas</h3>
            <span className="oc-tag">{filteredOpen.length}</span>
            {banner && <span className="oc-tag oc-tag-danger">{banner}</span>}
          </div>
          <input
            ref={searchRef}
            className="oc-input"
            style={{ maxWidth: 280 }}
            placeholder="Buscar..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="card">
        <div className="oc-table-wrap">
          <table className="oc-table">
            <thead className="oc-thead">
              <tr className="oc-tr">
                <StickyTH>Caja</StickyTH>
                <StickyTH>Fecha apertura</StickyTH>
                <StickyTH align="right">Base actual</StickyTH>
                <StickyTH align="right">Saldo inicial</StickyTH>
                <StickyTH align="right">Saldo actual</StickyTH>
                <StickyTH>Usuario</StickyTH>
                <StickyTH>Acciones</StickyTH>
              </tr>
            </thead>
            <tbody className="oc-tbody">
              {openLoading ? (
                <SkeletonRows cols={7} />
              ) : filteredOpen.length === 0 ? (
                <tr className="oc-tr">
                  <td className="oc-td" colSpan={7}>
                    <span className="oc-muted">Sin cajas abiertas.</span>
                  </td>
                </tr>
              ) : (
                filteredOpen.map((r) => (
                  <tr className="oc-tr" key={r.id}>
                    <td className="oc-td">
                      <b>{r.nombre}</b>{" "}
                      {r.ia?.length ? (
                        <span className="oc-tag oc-tag-danger" title={r.ia.join(" · ")}>
                          IA
                        </span>
                      ) : null}
                    </td>
                    <td className="oc-td">
                      {r.fechaApertura ? r.fechaApertura.toLocaleString("es-CO") : "—"}
                    </td>
                    <td className="oc-td" style={{ textAlign: "right" }}>
                      ${toCOP(r.baseActual)}
                    </td>
                    <td className="oc-td" style={{ textAlign: "right" }}>
                      ${toCOP(r.saldoInicial)}
                    </td>
                    <td
                      className="oc-td"
                      style={{
                        textAlign: "right",
                        color: r.saldoActual < 0 ? "#b91c1c" : undefined,
                        fontWeight: 600,
                      }}
                    >
                      ${toCOP(r.saldoActual)}
                    </td>
                    <td className="oc-td">{r.usuarioNombre}</td>
                    <td className="oc-td" style={{ whiteSpace: "nowrap" }}>
                      <button className="oc-small-btn" onClick={() => setTab("mio")}>
                        Ver
                      </button>{" "}
                      <button
                        className="oc-small-btn oc-danger"
                        onClick={() => onCloseBox(r.id)}
                      >
                        Cerrar
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );

  const ViewMiCaja = () => (
    <div className="card">
      <div
        className="oc-card-head"
        style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}
      >
        <h3>Mi caja (hoy)</h3>
        {myBox?.estado === "abierta" && (
          <div style={{ display: "flex", gap: 8 }}>
            <span className="oc-tag oc-tag-success">Abierta</span>
            <button className="oc-small-btn oc-danger" onClick={() => onCloseBox(myBox.id)}>
              Cerrar caja
            </button>
          </div>
        )}
      </div>

      {myLoading ? (
        <div className="oc-muted">Cargando…</div>
      ) : !myBox ? (
        <div className="oc-empty">
          <p className="oc-muted">No tienes una caja abierta hoy.</p>
          <button className="oc-btn" onClick={() => setTab("abrir")}>
            Abrir caja
          </button>
        </div>
      ) : (
        <>
          <div className="oc-stats-row" style={{ marginBottom: 12 }}>
            <div className="stat-card">
              <span className="stat-label">Base actual</span>
              <span className="stat-value">${toCOP(myBox.baseActual)}</span>
            </div>
            <div className="stat-card">
              <span className="stat-label">Saldo actual</span>
              <span
                className="stat-value"
                style={{ color: myBox.saldoActual < 0 ? "#b91c1c" : undefined }}
              >
                ${toCOP(myBox.saldoActual)}
              </span>
            </div>
          </div>
          <div className="card">
            <h4>Movimientos (hoy)</h4>
            <p className="oc-muted">
              Conecta tu colección <code>movimientos</code> para listar ingresos/egresos y
              validar descuadres con IA.
            </p>
          </div>
        </>
      )}
    </div>
  );

  const ViewCerradas = () => (
    <div className="card">
      <div className="oc-card-head" style={{ marginBottom: 8 }}>
        <h3>
          Cajas cerradas <span className="oc-tag">{closedRows.length}</span>
        </h3>
      </div>
      <div className="oc-table-wrap">
        <table className="oc-table">
          <thead className="oc-thead">
            <tr className="oc-tr">
              <StickyTH>Caja</StickyTH>
              <StickyTH>Usuario</StickyTH>
              <StickyTH>Apertura</StickyTH>
              <StickyTH>Cierre</StickyTH>
              <StickyTH align="right">Saldo final</StickyTH>
            </tr>
          </thead>
          <tbody className="oc-tbody">
            {closedLoading ? (
              <SkeletonRows cols={5} />
            ) : closedRows.length === 0 ? (
              <tr className="oc-tr">
                <td className="oc-td" colSpan={5}>
                  <span className="oc-muted">Sin cajas cerradas.</span>
                </td>
              </tr>
            ) : (
              closedRows.map((r) => (
                <tr className="oc-tr" key={r.id}>
                  <td className="oc-td">{r.nombre}</td>
                  <td className="oc-td">{r.usuarioNombre}</td>
                  <td className="oc-td">
                    {r.fechaApertura ? r.fechaApertura.toLocaleString("es-CO") : "—"}
                  </td>
                  <td className="oc-td">
                    {r.fechaCierre ? r.fechaCierre.toLocaleString("es-CO") : "—"}
                  </td>
                  <td className="oc-td" style={{ textAlign: "right" }}>
                    ${toCOP(r.saldoActual)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  const ViewSimulados = () => (
    <div className="card">
      <h3>Cierres simulados</h3>
      <p className="oc-muted">
        El cierre hipotético compara ventas y movimientos detectando errores y descuadres
        con IA. (Conectar fuente de datos para activarlo).
      </p>
    </div>
  );

  const ViewBancos = () => (
    <div className="card">
      <h3>Bancos</h3>
      <p className="oc-muted">
        Conciliación de consignaciones/pagos electrónicos contra caja del día. (Conectar
        pasarela o extractos para habilitar).
      </p>
    </div>
  );

  /* ===================== layout con menú izquierdo ===================== */
  const AsideItem = ({ m }) => (
    <button
      type="button"
      onClick={() => setTab(m.key)}
      className={`oc-menu-item ${tab === m.key ? "active" : ""}`}
      style={{
        width: "100%",
        textAlign: "left",
        padding: "10px 12px",
        borderRadius: 10,
        border: "1px solid transparent",
        background: tab === m.key ? "var(--oc-surface-2, #f3f6ff)" : "transparent",
        fontWeight: 600,
      }}
      title={m.label}
    >
      <span style={{ opacity: 0.8, marginRight: 6 }}>{m.icon}</span>
      {m.label}
    </button>
  );

  return (
    <div
      className="oc-main-content"
      style={{
        display: "grid",
        gridTemplateColumns: "240px 1fr",
        gap: 16,
      }}
    >
      {/* LADO IZQUIERDO: MENÚ */}
      <aside
        className="card"
        role="navigation"
        aria-label="Menú de caja"
        style={{ height: "fit-content", padding: 12 }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {MENU.map((m) => (
            <AsideItem key={m.key} m={m} />
          ))}
        </div>
      </aside>

      {/* LADO DERECHO: CONTENIDO */}
      <section>
        {/* encabezado con breadcrumb y buscador (solo en abiertas) */}
        <div className="card" style={{ marginBottom: 12, padding: 12 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
            }}
          >
            <div className="oc-breadcrumb">
              <span>Caja</span>
              <span>›</span>
              <b>{MENU.find((x) => x.key === tab)?.label}</b>
            </div>
            {tab === "abiertas" && (
              <input
                ref={searchRef}
                className="oc-input"
                placeholder="Buscar..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ maxWidth: 300 }}
              />
            )}
          </div>
        </div>

        {tab === "abrir" && <ViewAbrir />}
        {tab === "abiertas" && <ViewAbiertas />}
        {tab === "cerradas" && <ViewCerradas />}
        {tab === "mio" && <ViewMiCaja />}
        {tab === "simulados" && <ViewSimulados />}
        {tab === "bancos" && <ViewBancos />}
      </section>
    </div>
  );
}

/* ===================== tiny skeleton ===================== */
function SkeletonRows({ cols = 6, n = 3 }) {
  return (
    <>
      {Array.from({ length: n }).map((_, i) => (
        <tr className="oc-tr" key={i}>
          {Array.from({ length: cols }).map((__, j) => (
            <td className="oc-td" key={j}>
              <div
                style={{
                  height: 12,
                  width: j === 0 ? 160 : 100 + (j % 3) * 40,
                  background: "var(--oc-skeleton, #e5e7eb)",
                  borderRadius: 6,
                }}
              />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}
