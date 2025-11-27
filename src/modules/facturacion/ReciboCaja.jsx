import React, { useMemo, useState, useEffect } from "react";

/**
 * ReciboCaja
 * - Filtros: fecha inicial / fecha final / buscador
 * - Tabla simple (con placeholder) lista para conectar a Firestore
 *
 * Props opcionales:
 *   fetchRows: async ({dateFrom, dateTo, q}) => rows
 *     - Si lo pasas, el componente cargará datos reales.
 *     - Cada row debe tener: { id, fecha, paciente, profesional, medioPago, referencia, venceEn, tipoDoc, valor }
 */
export default function ReciboCaja({ fetchRows }) {
  const todayIso = useMemo(() => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  }, []);

  const monthStartIso = useMemo(() => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    return `${y}-${m}-01`;
  }, []);

  const [dateFrom, setDateFrom] = useState(monthStartIso);
  const [dateTo, setDateTo] = useState(todayIso);
  const [q, setQ] = useState("");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      if (typeof fetchRows === "function") {
        const data = await fetchRows({ dateFrom, dateTo, q });
        setRows(Array.isArray(data) ? data : []);
      } else {
        // Placeholder con datos simulados para que compile sin backend
        setRows([
          { id: "1600", fecha: dateTo, paciente: "Carlos Esteban Perez Acosta", profesional: "Guillermo J.", medioPago: "Efectivo", referencia: "", venceEn: 0, tipoDoc: "Recibo de caja", valor: 2335140 },
          { id: "1599", fecha: dateTo, paciente: "Yessica Isabel Guzmán Cano", profesional: "Guillermo J.", medioPago: "Efectivo", referencia: "", venceEn: 0, tipoDoc: "Recibo de caja", valor: 150000 },
          { id: "1598", fecha: dateTo, paciente: "Ana Estefany Martínez Pérez", profesional: "Guillermo J.", medioPago: "Transferencia Débito", referencia: "", venceEn: 0, tipoDoc: "Recibo de caja", valor: 640000 }
        ]);
      }
    } catch (e) {
      console.error(e);
      setError("No se pudieron cargar los datos.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); /* carga inicial */ }, []); // eslint-disable-line

  const total = rows.reduce((sum, r) => sum + (Number(r.valor) || 0), 0);

  return (
    <div className="card">
      <h3>Recibo de caja</h3>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr)) 120px", gap: 12, alignItems: "end" }}>
        <div>
          <label className="oc-muted" htmlFor="rc-desde">Fecha inicial</label>
          <input id="rc-desde" type="date" className="oc-search" style={{height: 36, width: "100%"}} value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
        </div>
        <div>
          <label className="oc-muted" htmlFor="rc-hasta">Fecha final</label>
          <input id="rc-hasta" type="date" className="oc-search" style={{height: 36, width: "100%"}} value={dateTo} onChange={e => setDateTo(e.target.value)} />
        </div>
        <div>
          <label className="oc-muted" htmlFor="rc-q">Buscar</label>
          <input id="rc-q" type="search" placeholder="Paciente, referencia..." className="oc-search" style={{height: 36, width: "100%"}} value={q} onChange={e => setQ(e.target.value)} />
        </div>
        <button className="oc-nav-btn" onClick={load}>Buscar</button>
      </div>

      {loading ? <p className="oc-muted" style={{marginTop: 10}}>Cargando…</p> : null}
      {error ? <p style={{ color: "#dc2626", marginTop: 10 }}>{error}</p> : null}

      <div style={{ overflowX: "auto", marginTop: 12 }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <Th>Doc.</Th>
              <Th>Tipo doc.</Th>
              <Th>Fecha</Th>
              <Th>Pac./Ter.</Th>
              <Th>Profesional</Th>
              <Th>Medio de pago</Th>
              <Th>Referencia</Th>
              <Th>Vence en</Th>
              <Th style={{ textAlign: "right" }}>Valor</Th>
            </tr>
          </thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.id} style={{ borderTop: "1px solid #e5e7eb" }}>
                <Td>{r.id}</Td>
                <Td>{r.tipoDoc || "Recibo de caja"}</Td>
                <Td>{r.fecha}</Td>
                <Td>{r.paciente}</Td>
                <Td>{r.profesional}</Td>
                <Td>{r.medioPago}</Td>
                <Td>{r.referencia || "—"}</Td>
                <Td>{r.venceEn || 0}</Td>
                <Td style={{ textAlign: "right" }}>{Number(r.valor || 0).toLocaleString("es-CO")}</Td>
              </tr>
            ))}
            {rows.length === 0 && !loading && (
              <tr>
                <Td colSpan={9} style={{ textAlign: "center", padding: 12 }} className="oc-muted">Sin resultados.</Td>
              </tr>
            )}
          </tbody>
          <tfoot>
            <tr>
              <Td colSpan={8} style={{ textAlign: "right", fontWeight: 600 }}>Total</Td>
              <Td style={{ textAlign: "right", fontWeight: 700 }}>{total.toLocaleString("es-CO")}</Td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}

function Th({ children, style }) {
  return <th style={{ textAlign: "left", fontSize: ".82rem", color: "#64748b", fontWeight: 600, padding: "10px 8px", ...style }}>{children}</th>;
}
function Td({ children, style, ...rest }) {
  return <td {...rest} style={{ fontSize: ".9rem", padding: "10px 8px", ...style }}>{children}</td>;
}
