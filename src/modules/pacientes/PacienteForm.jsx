// src/modules/pacientes/PacienteForm.jsx
// 🧾 Crear/editar paciente (prefill con datos capturados desde “Nueva cita”)

import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "../../firebase/firebaseConfig";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";

const emptyPatient = {
  nombre: "",
  apellido: "",
  tipoDocumento: "",
  documento: "",
  correo: "",
  indicativo: "+57",
  celular: "",
  telefono: "",
  nacimiento: "",
  sexo: "",
  direccion: "",
  ciudad: "",
  ocupacion: "",
  eps: "",
  fotoUrl: "",
  antecedentes: "",
  alergias: "",
  comentario: "",
  activo: true,
};

export default function PacienteForm() {
  const { pacienteId } = useParams(); // "nuevo" o id real
  const navigate = useNavigate();
  const isNew = !pacienteId || pacienteId === "nuevo";

  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyPatient);

  // Cargar si es edición
  useEffect(() => {
    (async () => {
      if (isNew) {
        setLoading(false);
        return;
      }
      try {
        const ref = doc(db, "pacientes", pacienteId);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          setForm({ ...emptyPatient, ...snap.data() });
        } else {
          setForm(emptyPatient);
        }
      } catch (e) {
        console.error("Error cargando paciente:", e);
        setForm(emptyPatient);
      } finally {
        setLoading(false);
      }
    })();
  }, [isNew, pacienteId]);

  const title = useMemo(
    () => (isNew ? "Registrar Paciente" : "Editar Paciente"),
    [isNew]
  );

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const onToggleActivo = () => {
    setForm((f) => ({ ...f, activo: !f.activo }));
  };

  const onSave = async (e) => {
    e.preventDefault();

    const nombreOk = (form.nombre || "").trim();
    const telefonoOk = (form.celular || form.telefono || "").trim();

    if (!nombreOk) {
      alert("⚠️ El nombre del paciente es obligatorio.");
      return;
    }
    if (!telefonoOk) {
      alert("⚠️ Debes registrar al menos un número de teléfono.");
      return;
    }

    try {
      setSaving(true);

      let id = pacienteId;
      if (isNew) {
        id =
          (form.documento || `${form.nombre} ${form.apellido}`)
            .toLowerCase()
            .replace(/\s+/g, "_")
            .replace(/[^a-z0-9_]/g, "") || `p_${Date.now()}`;
      }

      await setDoc(
        doc(db, "pacientes", id),
        {
          ...form,
          nombre: (form.nombre || "").trim(),
          apellido: (form.apellido || "").trim(),
          documento: (form.documento || "").trim(),
          correo: (form.correo || "").trim().toLowerCase(),
          celular: (form.celular || "").trim(),
          telefono: (form.telefono || "").trim(),
          updatedAt: serverTimestamp(),
          createdAt: isNew ? serverTimestamp() : undefined,
        },
        { merge: true }
      );

      alert("✅ Paciente guardado correctamente.");
      navigate(`/pacientes/${id}`);
    } catch (e) {
      console.error("Error guardando paciente:", e);
      alert("❌ No se pudo guardar el paciente.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="odc-content-card" style={{ padding: 20 }}>
        Cargando ficha del paciente...
      </div>
    );
  }

  return (
    <>
      <div className="odc-topbar-blue">{title}</div>
      <section className="odc-agenda-root" style={{ padding: 16 }}>
        <div className="odc-agenda-inner" style={{ maxWidth: 900, margin: "0 auto" }}>
          <form
            className="odc-content-card"
            style={{ display: "grid", gap: 12, padding: 16 }}
            onSubmit={onSave}
          >
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <input
                name="nombre"
                placeholder="Nombre *"
                value={form.nombre}
                onChange={onChange}
              />
              <input
                name="apellido"
                placeholder="Apellido"
                value={form.apellido}
                onChange={onChange}
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
              <select name="tipoDocumento" value={form.tipoDocumento} onChange={onChange}>
                <option value="">Tipo de documento</option>
                <option value="CC">Cédula de Ciudadanía</option>
                <option value="CE">Cédula de Extranjería</option>
                <option value="TI">Tarjeta de Identidad</option>
                <option value="PA">Pasaporte</option>
                <option value="DI">Documento Internacional</option>
                <option value="OTRO">Otro</option>
              </select>
              <input
                name="documento"
                placeholder="Número de documento"
                value={form.documento}
                onChange={onChange}
              />
              <input
                type="email"
                name="correo"
                placeholder="Correo electrónico"
                value={form.correo}
                onChange={onChange}
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "130px 1fr 1fr", gap: 10 }}>
              <select name="indicativo" value={form.indicativo} onChange={onChange}>
                <option value="+57">🇨🇴 +57</option>
                <option value="+1">🇺🇸 +1</option>
                <option value="+34">🇪🇸 +34</option>
                <option value="+52">🇲🇽 +52</option>
                <option value="+54">🇦🇷 +54</option>
                <option value="+593">🇪🇨 +593</option>
                <option value="+56">🇨🇱 +56</option>
                <option value="+58">🇻🇪 +58</option>
              </select>
              <input
                name="celular"
                placeholder="Celular (obligatorio)"
                value={form.celular}
                onChange={onChange}
              />
              <input
                name="telefono"
                placeholder="Teléfono fijo (opcional)"
                value={form.telefono}
                onChange={onChange}
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
              <input
                type="date"
                name="nacimiento"
                placeholder="Fecha de nacimiento"
                value={form.nacimiento}
                onChange={onChange}
              />
              <select name="sexo" value={form.sexo} onChange={onChange}>
                <option value="">Sexo</option>
                <option value="Masculino">Masculino</option>
                <option value="Femenino">Femenino</option>
                <option value="Otro">Otro</option>
              </select>
              <input
                name="fotoUrl"
                placeholder="URL foto (opcional)"
                value={form.fotoUrl}
                onChange={onChange}
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <input name="direccion" placeholder="Dirección" value={form.direccion} onChange={onChange} />
              <input name="ciudad" placeholder="Ciudad" value={form.ciudad} onChange={onChange} />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <input name="ocupacion" placeholder="Ocupación" value={form.ocupacion} onChange={onChange} />
              <input name="eps" placeholder="EPS / Aseguradora" value={form.eps} onChange={onChange} />
            </div>

            <textarea
              name="antecedentes"
              placeholder="Antecedentes / Historia clínica"
              value={form.antecedentes}
              onChange={onChange}
              rows={3}
            />
            <textarea
              name="alergias"
              placeholder="Alergias"
              value={form.alergias}
              onChange={onChange}
              rows={2}
            />
            <textarea
              name="comentario"
              placeholder="Notas / Observaciones"
              value={form.comentario}
              onChange={onChange}
              rows={2}
            />

            <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <input type="checkbox" checked={!!form.activo} onChange={onToggleActivo} />
              Activo
            </label>

            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 6 }}>
              <button type="button" className="btn" onClick={() => navigate(-1)} disabled={saving}>
                Cancelar
              </button>
              <button type="submit" className="btn blue" disabled={saving}>
                {saving ? "Guardando..." : "Guardar"}
              </button>
            </div>
          </form>
        </div>
      </section>
    </>
  );
}
