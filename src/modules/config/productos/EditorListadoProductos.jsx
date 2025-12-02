/* ==========================================================
   PRODUCTOS — gestionar LISTADOS (no productos)
========================================================== */
function ListaProductosInline() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const baseDash = getDashBase(pathname);

  const [rows, setRows] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const snap = await getDocs(collection(db, "listas_precios_productos"));
        const arr = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        // orden por actualizado/creado desc
        arr.sort((a, b) => String((b.actualizado||b.creado||"")).localeCompare(String(a.actualizado||a.creado||"")));
        setRows(arr);
      } catch { setRows([]); }
    })();
  }, []);

  const crearListado = async () => {
    const nombre = `Lista de productos ${new Date().toLocaleDateString("es-CO")}`;
    const payload = {
      nombre,
      creado: new Date().toLocaleString("es-CO"),
      actualizado: new Date().toLocaleString("es-CO"),
      en_uso: false,
      tipo: "productos",
    };
    const ref = await addDoc(collection(db, "listas_precios_productos"), payload);
    setRows((p) => [{ id: ref.id, ...payload }, ...p]);
  };

  const setEnUso = async (row) => {
    const snap = await getDocs(collection(db, "listas_precios_productos"));
    await Promise.all(
      snap.docs.map((d) => updateDoc(doc(db, "listas_precios_productos", d.id), { en_uso: d.id === row.id }))
    );
    setRows((p) => p.map((x) => ({ ...x, en_uso: x.id === row.id })));
  };

  const eliminarListado = async (row) => {
    if (!window.confirm(`¿Eliminar "${row?.nombre}"?`)) return;
    await deleteDoc(doc(db, "listas_precios_productos", row.id));
    setRows((p) => p.filter((x) => x.id !== row.id));
  };

  const irEditar = (row) =>
    navigate(`${baseDash}/config/lista-de-precios/productos/editar/${row.id}`);

  return (
    <div className="lp-card">
      <h3 className="lp-subtitle">Lista de precios productos</h3>

      <div className="lp-card-header">
        <div></div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="chip" onClick={crearListado}>
            <span style={{ fontWeight: 800, fontSize: 16 }}>＋</span> Nuevo listado de productos
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
              <th className="actions">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr><td colSpan={5} className="muted" style={{ textAlign: "center", padding: 18 }}>Sin datos</td></tr>
            ) : rows.map((r) => (
              <tr key={r.id}>
                <td style={{ fontWeight: 600 }}>{r?.nombre || "—"}</td>
                <td>{r?.creado || "—"}</td>
                <td>{r?.actualizado || "—"}</td>
                <td>{r?.en_uso ? <span className="badge green">En uso</span> : "—"}</td>
                <td className="actions">
                  <div className="lp-actions">
                    <button className="iconbtn blue"  title="Editar" onClick={() => irEditar(r)} aria-label="Editar">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L8 18l-4 1 1-4 11.5-11.5z"/></svg>
                    </button>
                    <button className="iconbtn green" title="Usar" onClick={() => setEnUso(r)} aria-label="Usar">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"></path></svg>
                    </button>
                    <button className="iconbtn red"   title="Eliminar" onClick={() => eliminarListado(r)} aria-label="Eliminar">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/></svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
