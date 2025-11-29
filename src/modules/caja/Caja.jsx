// src/modules/caja/Caja.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import "./caja.css";
import { onAuthStateChanged } from "firebase/auth";
import {
  addDoc,
  collection,
  doc,
  increment,
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
const todayISO = () => new Date().toISOString().slice(0, 10);

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

/* peque util de ids para links mock */
const rid = () =>
  Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);

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

  /* pacientes (búsqueda mínima) */
  const [patientQuery, setPatientQuery] = useState("");
  const [patientRows, setPatientRows] = useState([]);
  const [patientSelected, setPatientSelected] = useState(null);

  /* cobro rápido */
  const [payAmount, setPayAmount] = useState("");
  const [payMethod, setPayMethod] = useState("efectivo");
  const [payLoading, setPayLoading] = useState(false);

  /* movimiento manual */
  const [movType, setMovType] = useState("ingreso");
  const [movConcept, setMovConcept] = useState("");
  const [movAmount, setMovAmount] = useState("");
  const [movLoading, setMovLoading] = useState(false);

  /* streams del día para mi caja */
  const [movRows, setMovRows] = useState([]);
  const [payRows, setPayRows] = useState([]);

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

  /* -------- movimientos y pagos de mi caja (hoy) -------- */
  useEffect(() => {
    if (!myBox?.id) {
      setMovRows([]);
      setPayRows([]);
      return;
    }
    const qMov = query(
      collection(db, "movimientos"),
      where("cashId", "==", myBox.id),
      where("dia", "==", todayISO()),
      orderBy("fecha", "desc")
    );
    const u1 = onSnapshot(
      qMov,
      (snap) => setMovRows(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
      (e) => console.error(e)
    );

    const qPay = query(
      collection(db, "payments"),
      where("cashId", "==", myBox.id),
      where("dia", "==", todayISO()),
      orderBy("fecha", "desc")
    );
    const u2 = onSnapshot(
      qPay,
      (snap) => setPayRows(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
      (e) => console.error(e)
    );

    return () => {
      u1();
      u2();
    };
  }, [myBox?.id]);

  /* -------- búsqueda básica de pacientes -------- */
  useEffect(() => {
    if (!patientQuery?.trim()) {
      setPatientRows([]);
      return;
    }
    // Nota: si tu colección no se llama "patients", cámbiala aquí.
    const qPat = query(
      collection(db, "patients"),
      where("q", ">=", norm(patientQuery)),
      where("q", "<=", norm(patientQuery) + "\uf8ff"),
      orderBy("q", "asc")
    );
    const u = onSnapshot(
      qPat,
      (snap) =>
        setPatientRows(
          snap.docs.map((d) => ({ id: d.id, ...d.data() }))
        ),
      (e) => console.error(e)
    );
    return () => u();
  }, [patientQuery]);

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
        dia: todayISO(),
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

  /* -------- registrar movimiento manual -------- */
  const onAddMovement = async (e) => {
    e?.preventDefault?.();
    if (!myBox?.id) {
      setBanner("Debes abrir tu caja para registrar movimientos.");
      return;
    }
    const val = Number(movAmount || 0);
    if (!val || val <= 0) return;
    setMovLoading(true);
    try {
      await addDoc(collection(db, "movimientos"), {
        cashId: myBox.id,
        tipo: movType, // ingreso | egreso
        concepto: movConcept || (movType === "ingreso" ? "Ingreso" : "Egreso"),
        valor: val,
        fecha: serverTimestamp(),
        dia: todayISO(),
        usuarioId: user?.uid || null,
      });
      // ajusta saldoActual: ingresos suman, egresos restan
      const delta = movType === "ingreso" ? val : -val;
      await updateDoc(doc(db, "cajas", myBox.id), {
        saldoActual: increment(delta),
      });
      setMovConcept("");
      setMovAmount("");
    } catch (e) {
      console.error(e);
      setBanner("No se pudo registrar el movimiento.");
    } finally {
      setMovLoading(false);
    }
  };

  /* -------- registrar pago (efectivo/tarjeta/transferencia) -------- */
  const onRegisterPayment = async (e) => {
    e?.preventDefault?.();
    if (!myBox?.id) return setBanner("Abre tu caja para cobrar.");
    const val = Number(payAmount || 0);
    if (!val || val <= 0) return;
    if (!patientSelected) return setBanner("Selecciona un paciente.");

    setPayLoading(true);
    try {
      const payDoc = await addDoc(collection(db, "payments"), {
        cashId: myBox.id,
        patientId: patientSelected.id,
        patientName: patientSelected.nombre || patientSelected.name || "Paciente",
        invoiceId: null, // luego lo vinculamos al emitir factura
        valor: val,
        medio: payMethod, // efectivo | tarjeta | transferencia | link
        estado: "aprobado", // para link será 'pending' hasta webhook
        fecha: serverTimestamp(),
        dia: todayISO(),
      });

      // efectivo/transferencia/tarjeta ajustan saldo en caja (asumimos ingresan al día)
      await updateDoc(doc(db, "cajas", myBox.id), {
        saldoActual: increment(val),
      });

      // TODO: si ya tienes facturas: crea/actualiza invoice borrador→emitida y guarda invoiceId en el pago

      setPayAmount("");
      setPayMethod("efectivo");
      setBanner(`Pago registrado (${payDoc.id}).`);
    } catch (e) {
      console.error(e);
      setBanner("No se pudo registrar el pago.");
    } finally {
      setPayLoading(false);
    }
  };

  /* -------- link de pago (mock listo para pasarela) -------- */
  const onCreatePayLink = async (e) => {
    e?.preventDefault?.();
    if (!myBox?.id) return setBanner("Abre tu caja para cobrar.");
    const val = Number(payAmount || 0);
    if (!val || val <= 0) return;
    if (!patientSelected) return setBanner("Selecciona un paciente.");

    setPayLoading(true);
    try {
      const token = rid();
      const fakeUrl = `https://pay.odontocloud/mock/${token}`;
      const payDoc = await addDoc(collection(db, "payments"), {
        cashId: myBox.id,
        patientId: patientSelected.id,
        patientName: patientSelected.nombre || patientSelected.name || "Paciente",
        invoiceId: null,
        valor: val,
        medio: "link",
        estado: "pending",
        linkUrl: fakeUrl,
        fecha: serverTimestamp(),
        dia: todayISO(),
      });

      // NOTA: NO ajustamos saldo hasta webhook de aprobación.
      // TODO: Reemplazar con Wompi/ePayco → crear link real, guardar referencia
      // y consumir webhook en /api/webhooks/wompi|epayco para marcar 'aprobado'
      // y hacer: updateDoc(cajaRef, { saldoActual: increment(val) })

      setBanner(`Link de pago generado: ${fakeUrl}`);
      setPayAmount("");
    } catch (e) {
      console.error(e);
      setBanner("No se pudo generar link de pago.");
    } finally {
      setPayLoading(false);
    }
  };

  /* -------- filtro texto -------- */
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

          {/* === Cobro rápido === */}
          <div className="card" style={{ marginBottom: 12 }}>
            <h4 style={{ marginBottom: 8 }}>Cobro rápido</h4>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr auto", gap: 8 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label className="oc-muted">Paciente</label>
                <input
                  className="oc-input"
                  placeholder="Buscar nombre o documento…"
                  value={patientQuery}
                  onChange={(e) => setPatientQuery(e.target.value)}
                />
                {patientQuery && patientRows.length > 0 && (
                  <div className="oc-dropdown">
                    {patientRows.slice(0, 6).map((p) => (
                      <button
                        key={p.id}
                        className={`oc-menu-item ${patientSelected?.id === p.id ? "active" : ""}`}
                        onClick={() => {
                          setPatientSelected(p);
                          setPatientQuery(p.nombre || p.name || p.doc || "");
                        }}
                        type="button"
                      >
                        {(p.nombre || p.name || "Paciente") + (p.doc ? ` · ${p.doc}` : "")}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label className="oc-muted">Monto (COP)</label>
                <input
                  className="oc-input"
                  type="number"
                  min="0"
                  step="1000"
                  placeholder="0"
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value)}
                />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label className="oc-muted">Medio</label>
                <select
                  className="oc-input"
                  value={payMethod}
                  onChange={(e) => setPayMethod(e.target.value)}
                >
                  <option value="efectivo">Efectivo</option>
                  <option value="tarjeta">Tarjeta</option>
                  <option value="transferencia">Transferencia</option>
                  <option value="link">Link (en línea)</option>
                </select>
              </div>

              <div style={{ display: "flex", alignItems: "end", gap: 6 }}>
                {payMethod === "link" ? (
                  <button className="oc-btn" onClick={onCreatePayLink} disabled={payLoading}>
                    {payLoading ? "Creando…" : "Generar link"}
                  </button>
                ) : (
                  <button className="oc-btn" onClick={onRegisterPayment} disabled={payLoading}>
                    {payLoading ? "Guardando…" : "Registrar pago"}
                  </button>
                )}
              </div>
            </div>
            <p className="oc-muted" style={{ marginTop: 8 }}>
              Para link, el saldo se actualiza cuando el pago pase a <b>aprobado</b> (webhook).
            </p>
          </div>

          {/* === Movimiento manual === */}
          <div className="card" style={{ marginBottom: 12 }}>
            <h4 style={{ marginBottom: 8 }}>Movimiento manual</h4>
            <form
              onSubmit={onAddMovement}
              style={{ display: "grid", gridTemplateColumns: "120px 1fr 180px auto", gap: 8 }}
            >
              <select
                className="oc-input"
                value={movType}
                onChange={(e) => setMovType(e.target.value)}
              >
                <option value="ingreso">Ingreso</option>
                <option value="egreso">Egreso</option>
              </select>
              <input
                className="oc-input"
                placeholder="Concepto (ej. Caja chica, Arriendo, etc.)"
                value={movConcept}
                onChange={(e) => setMovConcept(e.target.value)}
              />
              <input
                className="oc-input"
                type="number"
                min="0"
                step="1000"
                placeholder="0"
                value={movAmount}
                onChange={(e) => setMovAmount(e.target.value)}
              />
              <button className="oc-btn" disabled={movLoading}>
                {movLoading ? "Guardando…" : "Agregar"}
              </button>
            </form>
          </div>

          {/* === Listados del día === */}
          <div className="card">
            <h4 style={{ marginBottom: 8 }}>Movimientos y pagos (hoy)</h4>
            <div className="oc-table-wrap" style={{ marginBottom: 12 }}>
              <table className="oc-table">
                <thead className="oc-thead">
                  <tr className="oc-tr">
                    <StickyTH>Tipo</StickyTH>
                    <StickyTH>Concepto / Paciente</StickyTH>
                    <StickyTH>Medio</StickyTH>
                    <StickyTH>Estado</StickyTH>
                    <StickyTH align="right">Valor</StickyTH>
                    <StickyTH>Hora</StickyTH>
                  </tr>
                </thead>
                <tbody className="oc-tbody">
                  {movRows.length === 0 && payRows.length === 0 ? (
                    <tr className="oc-tr">
                      <td className="oc-td" colSpan={6}>
                        <span className="oc-muted">Sin movimientos ni pagos aún.</span>
                      </td>
                    </tr>
                  ) : (
                    <>
                      {payRows.map((p) => (
                        <tr className="oc-tr" key={`pay-${p.id}`}>
                          <td className="oc-td">Pago</td>
                          <td className="oc-td">
                            {p.patientName || "Paciente"}{" "}
                            {p.linkUrl ? (
                              <a href={p.linkUrl} target="_blank" rel="noreferrer">
                                (link)
                              </a>
                            ) : null}
                          </td>
                          <td className="oc-td">{p.medio}</td>
                          <td className="oc-td">
                            <span
                              className={`oc-tag ${
                                p.estado === "aprobado"
                                  ? "oc-tag-success"
                                  : p.estado === "pending"
                                  ? "oc-tag-warning"
                                  : "oc-tag-danger"
                              }`}
                            >
                              {p.estado}
                            </span>
                          </td>
                          <td className="oc-td" style={{ textAlign: "right" }}>
                            ${toCOP(p.valor)}
                          </td>
                          <td className="oc-td">
                            {p.fecha?.toDate?.()
                              ? p.fecha.toDate().toLocaleTimeString("es-CO")
                              : "—"}
                          </td>
                        </tr>
                      ))}
                      {movRows.map((m) => (
                        <tr className="oc-tr" key={`mov-${m.id}`}>
                          <td className="oc-td">{m.tipo}</td>
                          <td className="oc-td">{m.concepto}</td>
                          <td className="oc-td">—</td>
                          <td className="oc-td">
                            <span className="oc-tag">{m.tipo === "ingreso" ? "ok" : "ok"}</span>
                          </td>
                          <td className="oc-td" style={{ textAlign: "right" }}>
                            ${toCOP(m.valor)}
                          </td>
                          <td className="oc-td">
                            {m.fecha?.toDate?.()
                              ? m.fecha.toDate().toLocaleTimeString("es-CO")
                              : "—"}
                          </td>
                        </tr>
                      ))}
                    </>
                  )}
                </tbody>
              </table>
            </div>
            <p className="oc-muted">
              Sugerencia: crea índice compuesto para `movimientos(cashId, dia, fecha)` y
              `payments(cashId, dia, fecha)` para rendimiento.
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
        {/* encabezado */}
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
