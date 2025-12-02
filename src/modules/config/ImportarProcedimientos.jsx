// ===============================
// ⚙️ ImportarProcedimientos.jsx
// Carga CSV (codigo;nombre) -> Firestore/catalago_procedimientos (area=Odontología)
// ===============================
import React, { useState } from "react";
import { db } from "../../firebase/firebaseConfig";
import { doc, setDoc } from "firebase/firestore";

export default function ImportarProcedimientos() {
  const [file, setFile] = useState(null);
  const [log, setLog] = useState([]);
  const [running, setRunning] = useState(false);
  const [ok, setOk] = useState(0);
  const [fail, setFail] = useState(0);

  const addLog = (m) => setLog((l) => [...l, m]);

  async function handleRun() {
    if (!file) return alert("Selecciona el CSV primero.");
    setRunning(true); setOk(0); setFail(0); setLog([]);

    try {
      // lee el CSV tal cual sale de Excel con separador ;
      const text = await file.text();
      const lines = text.split(/\r?\n/).filter(Boolean);

      // encabezado esperado: codigo;nombre
      const header = lines.shift();
      if (!/codigo\s*;\s*nombre/i.test(header || "")) {
        addLog("Encabezado inválido. Debe ser: codigo;nombre (separado por punto y coma ;)");
        setRunning(false); return;
      }

      // procesa por tandas para no saturar
      const chunkSize = 250;
      for (let i = 0; i < lines.length; i += chunkSize) {
        const chunk = lines.slice(i, i + chunkSize);
        await Promise.all(
          chunk.map(async (line) => {
            const parts = line.split(";");
            const codigo = (parts[0] || "").trim().replace(/\./g, "");
            const nombre = (parts.slice(1).join(";") || "").trim().replace(/^"|"$/g, "");
            if (!codigo || !nombre) { setFail((x)=>x+1); return; }

            try {
              await setDoc(doc(db, "catalogo_procedimientos", codigo), {
                codigo,
                nombre,
                area: "Odontología",
                activo: true,
                fuente: "CUPS",
                version: "2024",
                updatedAt: new Date().toISOString(),
              }, { merge: true });
              setOk((x)=>x+1);
            } catch (e) {
              setFail((x)=>x+1);
              addLog(`Error ${codigo}: ${e?.message || e}`);
            }
          })
        );
        addLog(`Cargado ${Math.min(i + chunkSize, lines.length)} / ${lines.length}`);
      }

      addLog("✅ Importación finalizada.");
    } catch (e) {
      addLog(`❌ Error: ${e?.message || e}`);
    } finally {
      setRunning(false);
    }
  }

  return (
    <div style={{ maxWidth: 760, margin: "24px auto", background: "#fff", padding: 16, borderRadius: 12, border: "1px solid #e5e7eb" }}>
      <h2 style={{ marginTop: 0 }}>Importar procedimientos (Odontología · CUPS 2024)</h2>
      <p>Sube tu CSV con columnas <b>codigo;nombre</b> (punto y coma).</p>

      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
        <input type="file" accept=".csv" onChange={(e) => setFile(e.target.files?.[0] || null)} />
        <button disabled={!file || running} onClick={handleRun}
                style={{ padding: "8px 12px", borderRadius: 8, background: "#22c55e", color: "#fff", border: "none", fontWeight: 700 }}>
          {running ? "Cargando..." : "Cargar"}
        </button>
      </div>

      <div style={{ marginTop: 12, display:"flex", gap:12 }}>
        <span>✅ OK: {ok}</span>
        <span>❌ Fallidos: {fail}</span>
        {running && <span>⏳ Procesando…</span>}
      </div>

      <pre style={{ background: "#f8fafc", padding: 12, borderRadius: 8, marginTop: 12, maxHeight: 260, overflow: "auto", fontSize: 12 }}>
        {log.join("\n")}
      </pre>
    </div>
  );
}
