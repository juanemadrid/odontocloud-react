// src/modules/pacientes/Pacientes.jsx
import React, { useEffect, useMemo, useState } from "react";
import "./pacientes.css";

import { db } from "../../firebase/firebaseConfig";
import {
  collection,
  getDocs,
  setDoc,
  doc,
  query,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";

// 🔹 Foto: Firebase Storage
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

/* ========================
   Utilidades de UI / Datos
   ======================== */

const browserLocale =
  typeof navigator !== "undefined" && navigator.language?.startsWith("es")
    ? "es-ES"
    : "en-US";

const COUNTRIES = [
  "Colombia","Argentina","Bolivia","Chile","Costa Rica","Cuba","Ecuador","El Salvador",
  "España","Guatemala","Honduras","México","Nicaragua","Panamá","Paraguay","Perú",
  "Puerto Rico","República Dominicana","Uruguay","Venezuela","Estados Unidos","Canadá"
];

const CITIES_BY_COUNTRY = {
  Colombia: ["Bogotá","Medellín","Cali","Barranquilla","Cartagena","Cúcuta","Bucaramanga","Pereira","Santa Marta","Ibagué"],
  México: ["Ciudad de México","Guadalajara","Monterrey","Puebla","Querétaro","Tijuana","Mérida","León"],
  Perú: ["Lima","Arequipa","Trujillo","Chiclayo","Cusco","Piura"],
  Chile: ["Santiago","Valparaíso","Concepción","La Serena","Antofagasta"],
  Argentina: ["Buenos Aires","Córdoba","Rosario","Mendoza","La Plata"],
  España: ["Madrid","Barcelona","Valencia","Sevilla","Zaragoza","Bilbao"],
  "Estados Unidos": ["Miami","New York","Los Ángeles","Houston","Chicago"],
  Ecuador: ["Quito","Guayaquil","Cuenca","Manta"],
  Venezuela: ["Caracas","Maracaibo","Valencia","Barquisimeto","Maracay"],
};

const calcAge = (yyyyMmDd) => {
  if (!yyyyMmDd) return "";
  const [y, m, d] = yyyyMmDd.split("-").map((x) => parseInt(x, 10));
  const birth = new Date(y, (m || 1) - 1, d || 1);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const mo = today.getMonth() - birth.getMonth();
  if (mo < 0 || (mo === 0 && today.getDate() < birth.getDate())) age--;
  return isNaN(age) ? "" : String(age);
};

/* ========================
   Componente principal
   ======================== */

const INITIAL_FORM = {
  // Identificación
  tipoDocumento: "",
  nroDocumento: "",
  nroHistoria: "",
  nombres: "",
  apellidos: "",
  nombreCompleto: "",
  sexo: "",
  estadoCivil: "",
  paisNacimiento: "",
  ciudadNacimiento: "",
  fechaIngreso: "",
  fechaNacimiento: "",
  edad: "",
  paisDomicilio: "",
  ciudadDomicilio: "",
  barrio: "",
  lugarResidencia: "",
  estrato: "",
  zonaResidencial: "",
  esExtranjero: false,
  permitePublicidad: false,

  // Contacto
  celular: "",
  telDomicilio: "",
  telOficina: "",
  extension: "",
  email: "",
  ocupacion: "",

  // Facturación / Responsable
  nombreResponsable: "",
  parentesco: "",
  celularResponsable: "",
  telefonoResponsable: "",
  emailResponsable: "",

  // Acompañante
  nombreAcompanante: "",
  telefonoAcompanante: "",

  // Mercadeo
  convenioBeneficio: "",
  comoConocio: "",
  campania: "",
  remitidoPor: "",
  asesorComercial: "",

  // EPS
  tipoVinculacion: "",
  nombreEps: "",
  polizaSalud: "",

  // Doctor
  doctor: "",

  // Notas
  notas: "",

  // Foto (Storage)
  fotoUrl: "",
};

export default function Pacientes() {
  // listado
  const [loading, setLoading] = useState(true);
  const [pacientes, setPacientes] = useState([]);
  const [term, setTerm] = useState("");

  // modal
  const [open, setOpen] = useState(false);

  // formulario
  const [form, setForm] = useState(INITIAL_FORM);

  // archivo de foto y preview local
  const [fotoFile, setFotoFile] = useState(null);
  const [fotoPreview, setFotoPreview] = useState("");

  // EPS (para autocompletar)
  const [epsList, setEpsList] = useState([]);

  const ciudadesDisponibles = useMemo(
    () => CITIES_BY_COUNTRY[form.paisNacimiento] || [],
    [form.paisNacimiento]
  );

  /* ======= cargar pacientes + eps ======= */
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const qPac = query(collection(db, "pacientes"), orderBy("creado", "desc"));
        const snapPac = await getDocs(qPac);
        const rows = snapPac.docs.map((d) => ({ id: d.id, ...d.data() }));
        setPacientes(rows);

        const snapEps = await getDocs(collection(db, "eps"));
        const eps = snapEps.docs
          .map((d) => d.data()?.nombre)
          .filter(Boolean);

        // Unicos e insensibles a mayúsculas
        const uniqueByLower = Array.from(
          new Map(eps.map((n) => [String(n).toLowerCase(), n])).values()
        ).sort((a, b) => a.localeCompare(b, "es"));
        setEpsList(uniqueByLower);
      } catch (e) {
        console.error(e);
        alert("No se pudieron cargar pacientes/EPS.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  /* ======= sincronizaciones de campos ======= */
  useEffect(() => {
    setForm((f) => ({ ...f, nombreCompleto: `${f.nombres} ${f.apellidos}`.trim() }));
  }, [form.nombres, form.apellidos]);

  useEffect(() => {
    setForm((f) => ({ ...f, nroHistoria: f.nroDocumento }));
  }, [form.nroDocumento]);

  useEffect(() => {
    setForm((f) => ({ ...f, edad: calcAge(f.fechaNacimiento) }));
  }, [form.fechaNacimiento]);

  useEffect(() => {
    const now = new Date();
    const fmt =
      now.toLocaleDateString(browserLocale) +
      " - " +
      now.toLocaleTimeString(browserLocale, { hour: "2-digit", minute: "2-digit", hour12: true });
    setForm((f) => ({ ...f, fechaIngreso: fmt }));
  }, []);

  const handleChange = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const clearForm = () => {
    setForm(INITIAL_FORM);
    // volver a setear fechaIngreso “bonita”
    const now = new Date();
    const fmt =
      now.toLocaleDateString(browserLocale) +
      " - " +
      now.toLocaleTimeString(browserLocale, { hour: "2-digit", minute: "2-digit", hour12: true });
    setForm((f) => ({ ...f, fechaIngreso: fmt }));
    setFotoFile(null);
    setFotoPreview("");
  };

  /* ======= foto: selección y preview ======= */
  const onFotoChange = (file) => {
    setFotoFile(file || null);
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setFotoPreview(ev.target.result);
      reader.readAsDataURL(file);
    } else {
      setFotoPreview("");
    }
  };

  /* ======= guardar paciente ======= */
  const handleSubmit = async (e) => {
    e.preventDefault();

    // validaciones clave
    if (!form.nroDocumento.trim()) return alert("El número de documento es obligatorio.");
    if (!form.nombres.trim()) return alert("Los nombres son obligatorios.");
    if (!form.apellidos.trim()) return alert("Los apellidos son obligatorios.");
    if (!form.sexo.trim()) return alert("El sexo es obligatorio.");
    if (!form.fechaNacimiento.trim()) return alert("La fecha de nacimiento es obligatoria.");
    if (!form.celular.trim()) return alert("El celular es obligatorio.");
    if (!form.email.trim()) return alert("El correo electrónico es obligatorio.");
    if (!form.tipoVinculacion.trim()) return alert("El tipo de vinculación es obligatorio.");
    if (!form.nombreEps.trim()) return alert("El nombre de la EPS es obligatorio.");

    try {
      // 1) EPS: persistir si no existe (comparación case-insensitive)
      const epsName = (form.nombreEps || "").trim();
      const existsCI = epsList.map((x) => x.toLowerCase()).includes(epsName.toLowerCase());
      if (epsName && !existsCI) {
        const addIt = window.confirm(
          `La EPS "${epsName}" no existe en el listado. ¿Deseas guardarla para futuras selecciones?`
        );
        if (addIt) {
          const idEps = epsName.toLowerCase().replace(/\s+/g, "_");
          await setDoc(doc(db, "eps", idEps), {
            nombre: epsName,
            nombreLower: epsName.toLowerCase(),
            creado: serverTimestamp(),
          });
          // refresco local (ordenado)
          setEpsList((prev) =>
            Array.from(new Map([...prev, epsName].map((n) => [n.toLowerCase(), n])).values()).sort(
              (a, b) => a.localeCompare(b, "es")
            )
          );
        }
      }

      // 2) Subir foto (opcional)
      let fotoUrlSubida = form.fotoUrl || "";
      if (fotoFile) {
        const storage = getStorage(); // usa app por defecto
        const path = `pacientes/${form.nroDocumento}.jpg`;
        const storageRef = ref(storage, path);
        await uploadBytes(storageRef, fotoFile);
        fotoUrlSubida = await getDownloadURL(storageRef);
      }

      // 3) Guardar paciente (ID = nroDocumento)
      const id = form.nroDocumento.trim();
      const payload = {
        ...form,
        fotoUrl: fotoUrlSubida,
        creado: serverTimestamp(),
        activo: true,
        // campos útiles para Agenda:
        celularPaciente: form.celular,
        telefonoPaciente: form.telDomicilio || "",
        documento: form.nroDocumento,
        paciente: form.nombreCompleto,
      };

      await setDoc(doc(db, "pacientes", id), payload);

      alert("✅ Paciente guardado correctamente.");
      setPacientes((old) => [{ id, ...payload }, ...old.filter((p) => p.id !== id)]);
      setOpen(false);
      clearForm();
    } catch (err) {
      console.error("Error guardando paciente:", err);
      alert("❌ No se puede guardar el paciente.\n\nDetalle: " + (err?.message || err));
    }
  };

  /* ======= tabla / filtro ======= */
  const filtered = useMemo(() => {
    const t = term.trim().toLowerCase();
    if (!t) return pacientes;
    return pacientes.filter((p) => {
      const blob = `${p.nombreCompleto || p.paciente || ""} ${p.nroDocumento || ""} ${
        p.celular || p.celularPaciente || ""
      } ${p.email || ""}`.toLowerCase();
      return blob.includes(t);
    });
  }, [pacientes, term]);

  /* ======= UI ======= */
  return (
    <div className="odc-container">
      <div className="odc-topbar-green" />
      <div className="odc-topbar-blue">
        <div className="odc-top-inner">
          <div className="odc-breadcrumbs">Pacientes</div>
        </div>
      </div>

      {/* Card principal: búsqueda + acciones */}
      <div className="odc-card">
        <div className="odc-card-header">
          <h3 className="odc-title">Pacientes</h3>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <input
              className="search-input"
              style={{ minWidth: 280 }}
              placeholder="Buscar por nombre, documento o teléfono…"
              value={term}
              onChange={(e) => setTerm(e.target.value)}
            />
            <button className="btn green" onClick={() => setOpen(true)}>
              + Nuevo paciente
            </button>
          </div>
        </div>

        <div className="table-wrap">
          <table className="appointments-table">
            <thead>
              <tr>
                <th>Foto</th>
                <th>Nombre</th>
                <th>Documento</th>
                <th>Celular</th>
                <th>Correo</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td className="no-data" colSpan={6}>
                    Cargando…
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td className="no-data" colSpan={6}>
                    No hay pacientes o no coinciden con la búsqueda.
                  </td>
                </tr>
              ) : (
                filtered.map((p) => (
                  <tr key={p.id}>
                    <td>
                      {p.fotoUrl ? (
                        <img
                          src={p.fotoUrl}
                          alt="Foto"
                          style={{ width: 36, height: 36, borderRadius: "50%", objectFit: "cover" }}
                        />
                      ) : (
                        <div className="avatar-fallback">{(p.nombreCompleto || "P")[0]}</div>
                      )}
                    </td>
                    <td>{p.nombreCompleto || p.paciente || "—"}</td>
                    <td>{p.nroDocumento || p.documento || "—"}</td>
                    <td>{p.celular || p.celularPaciente || "—"}</td>
                    <td>{p.email || "—"}</td>
                    <td>
                      <span className="pill pill-ok">{p.activo ? "Activo" : "Inactivo"}</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========= MODAL NUEVO PACIENTE ========= */}
      {open && (
        <div className="odc-modal" role="dialog" aria-modal="true">
          <div className="odc-modal-backdrop" onClick={() => setOpen(false)} />
          <div className="odc-card" style={{ width: 1000, maxWidth: "95%", maxHeight: "92vh", overflowY: "auto" }}>
            <div className="odc-card-header">
              <h3 className="odc-title">Nuevo paciente</h3>
              <button className="btn" onClick={() => setOpen(false)}>✕</button>
            </div>

            <form onSubmit={handleSubmit}>
              {/* FOTO */}
              <div className="form-section-title">Foto del paciente</div>
              <div className="foto-row">
                <label className="foto-drop">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => onFotoChange(e.target.files?.[0] || null)}
                    style={{ display: "none" }}
                  />
                  {fotoPreview ? (
                    <img src={fotoPreview} alt="Preview" className="foto-preview" />
                  ) : (
                    <div className="foto-empty">Arrastra o haz clic para cargar</div>
                  )}
                </label>
                {fotoPreview && (
                  <button type="button" className="btn" onClick={() => onFotoChange(null)}>
                    Quitar foto
                  </button>
                )}
              </div>

              {/* Identificación */}
              <div className="form-section-title">Datos de identificación</div>
              <div className="form-grid">
                <div>
                  <label className="form-label">Tipo de documento *</label>
                  <select
                    className="form-input"
                    value={form.tipoDocumento}
                    onChange={(e) => handleChange("tipoDocumento", e.target.value)}
                  >
                    <option value="">Seleccione…</option>
                    <option value="CC">Cédula</option>
                    <option value="TI">Tarjeta de identidad</option>
                    <option value="PA">Pasaporte</option>
                    <option value="OTRO">Otro</option>
                  </select>
                </div>

                <div>
                  <label className="form-label">Nro. de documento *</label>
                  <input
                    className="form-input"
                    value={form.nroDocumento}
                    onChange={(e) => handleChange("nroDocumento", e.target.value)}
                    placeholder="Número de documento"
                    required
                  />
                </div>

                <div>
                  <label className="form-label">Número de Historia</label>
                  <input className="form-input" value={form.nroHistoria} readOnly />
                </div>

                <div>
                  <label className="form-label">Nombres *</label>
                  <input
                    className="form-input"
                    value={form.nombres}
                    onChange={(e) => handleChange("nombres", e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="form-label">Apellidos *</label>
                  <input
                    className="form-input"
                    value={form.apellidos}
                    onChange={(e) => handleChange("apellidos", e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="form-label">Nombre completo</label>
                  <input className="form-input" value={form.nombreCompleto} readOnly />
                </div>

                <div>
                  <label className="form-label">Sexo *</label>
                  <select
                    className="form-input"
                    value={form.sexo}
                    onChange={(e) => handleChange("sexo", e.target.value)}
                    required
                  >
                    <option value="">Seleccione…</option>
                    <option>Masculino</option>
                    <option>Femenino</option>
                    <option>Otro</option>
                  </select>
                </div>

                <div>
                  <label className="form-label">Estado civil *</label>
                  <select
                    className="form-input"
                    value={form.estadoCivil}
                    onChange={(e) => handleChange("estadoCivil", e.target.value)}
                    required
                  >
                    <option value="">Seleccione…</option>
                    <option>Soltero</option>
                    <option>Casado</option>
                    <option>Unión libre</option>
                    <option>Divorciado</option>
                    <option>Viudo</option>
                  </select>
                </div>

                <div>
                  <label className="form-label">País de nacimiento *</label>
                  <input
                    className="form-input"
                    list="listCountries"
                    value={form.paisNacimiento}
                    onChange={(e) => handleChange("paisNacimiento", e.target.value)}
                    placeholder="Escribe y elige…"
                    required
                  />
                  <datalist id="listCountries">
                    {COUNTRIES.map((c) => (
                      <option key={c} value={c} />
                    ))}
                  </datalist>
                </div>

                <div>
                  <label className="form-label">Ciudad de nacimiento</label>
                  <input
                    className="form-input"
                    list="listCitiesBirth"
                    value={form.ciudadNacimiento}
                    onChange={(e) => handleChange("ciudadNacimiento", e.target.value)}
                    placeholder="Escribe y elige…"
                  />
                  <datalist id="listCitiesBirth">
                    {ciudadesDisponibles.map((c) => (
                      <option key={c} value={c} />
                    ))}
                  </datalist>
                </div>

                <div>
                  <label className="form-label">Fecha de ingreso</label>
                  <input className="form-input" value={form.fechaIngreso} readOnly />
                </div>

                <div>
                  <label className="form-label">Fecha de nacimiento *</label>
                  <input
                    type="date"
                    className="form-input"
                    value={form.fechaNacimiento}
                    onChange={(e) => handleChange("fechaNacimiento", e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="form-label">Edad</label>
                  <input className="form-input" value={form.edad} readOnly />
                </div>

                <div>
                  <label className="form-label">País de domicilio *</label>
                  <input
                    className="form-input"
                    list="listCountries"
                    value={form.paisDomicilio}
                    onChange={(e) => handleChange("paisDomicilio", e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="form-label">Ciudad de domicilio *</label>
                  <input
                    className="form-input"
                    list="listCitiesHome"
                    value={form.ciudadDomicilio}
                    onChange={(e) => handleChange("ciudadDomicilio", e.target.value)}
                    required
                  />
                  <datalist id="listCitiesHome">
                    {(CITIES_BY_COUNTRY[form.paisDomicilio] || []).map((c) => (
                      <option key={c} value={c} />
                    ))}
                  </datalist>
                </div>

                <div>
                  <label className="form-label">Barrio *</label>
                  <input
                    className="form-input"
                    value={form.barrio}
                    onChange={(e) => handleChange("barrio", e.target.value)}
                    required
                    placeholder="Barrio"
                  />
                </div>

                <div>
                  <label className="form-label">Lugar de residencia *</label>
                  <input
                    className="form-input"
                    value={form.lugarResidencia}
                    onChange={(e) => handleChange("lugarResidencia", e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="form-label">Estrato</label>
                  <select
                    className="form-input"
                    value={form.estrato}
                    onChange={(e) => handleChange("estrato", e.target.value)}
                  >
                    <option value="">Seleccione…</option>
                    <option>1</option><option>2</option><option>3</option>
                    <option>4</option><option>5</option><option>6</option>
                  </select>
                </div>

                <div>
                  <label className="form-label">Zona residencial *</label>
                  <select
                    className="form-input"
                    value={form.zonaResidencial}
                    onChange={(e) => handleChange("zonaResidencial", e.target.value)}
                    required
                  >
                    <option value="">Seleccione…</option>
                    <option>Urbana</option>
                    <option>Rural</option>
                  </select>
                </div>

                <div className="checkbox-cell">
                  <label className="form-label">¿Es extranjero?</label>
                  <input
                    type="checkbox"
                    checked={form.esExtranjero}
                    onChange={(e) => handleChange("esExtranjero", e.target.checked)}
                  />
                </div>

                <div className="checkbox-cell">
                  <label className="form-label">¿Permite publicidad?</label>
                  <input
                    type="checkbox"
                    checked={form.permitePublicidad}
                    onChange={(e) => handleChange("permitePublicidad", e.target.checked)}
                  />
                </div>
              </div>

              {/* Contacto */}
              <div className="form-section-title">Contacto</div>
              <div className="form-grid">
                <div>
                  <label className="form-label">Celular *</label>
                  <input
                    className="form-input"
                    value={form.celular}
                    onChange={(e) => handleChange("celular", e.target.value)}
                    required
                    placeholder="Celular del paciente"
                  />
                </div>
                <div>
                    <label className="form-label">Teléfono de domicilio</label>
                    <input
                      className="form-input"
                      value={form.telDomicilio}
                      onChange={(e) => handleChange("telDomicilio", e.target.value)}
                    />
                </div>
                <div>
                    <label className="form-label">Teléfono de oficina</label>
                    <input
                      className="form-input"
                      value={form.telOficina}
                      onChange={(e) => handleChange("telOficina", e.target.value)}
                    />
                </div>
                <div>
                    <label className="form-label">Extensión</label>
                    <input
                      className="form-input"
                      value={form.extension}
                      onChange={(e) => handleChange("extension", e.target.value)}
                    />
                </div>
                <div>
                  <label className="form-label">Correo electrónico *</label>
                  <input
                    type="email"
                    className="form-input"
                    value={form.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    required
                    placeholder="correo@dominio.com"
                  />
                </div>
                <div>
                  <label className="form-label">Ocupación *</label>
                  <input
                    className="form-input"
                    value={form.ocupacion}
                    onChange={(e) => handleChange("ocupacion", e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Facturación */}
              <div className="form-section-title">Datos de facturación</div>
              <div className="form-grid">
                <div>
                  <label className="form-label">Responsable</label>
                  <input
                    className="form-input"
                    value={form.nombreResponsable}
                    onChange={(e) => handleChange("nombreResponsable", e.target.value)}
                  />
                </div>
                <div>
                  <label className="form-label">Parentesco</label>
                  <select
                    className="form-input"
                    value={form.parentesco}
                    onChange={(e) => handleChange("parentesco", e.target.value)}
                  >
                    <option value="">Seleccione…</option>
                    <option>Padre/Madre</option><option>Hermano</option>
                    <option>Esposo/a</option><option>Otro</option>
                  </select>
                </div>
                <div>
                  <label className="form-label">Celular</label>
                  <input
                    className="form-input"
                    value={form.celularResponsable}
                    onChange={(e) => handleChange("celularResponsable", e.target.value)}
                  />
                </div>
                <div>
                  <label className="form-label">Teléfono</label>
                  <input
                    className="form-input"
                    value={form.telefonoResponsable}
                    onChange={(e) => handleChange("telefonoResponsable", e.target.value)}
                  />
                </div>
                <div>
                  <label className="form-label">Correo electrónico</label>
                  <input
                    type="email"
                    className="form-input"
                    value={form.emailResponsable}
                    onChange={(e) => handleChange("emailResponsable", e.target.value)}
                  />
                </div>
              </div>

              {/* Acompañante */}
              <div className="form-section-title">Acompañante</div>
              <div className="form-grid">
                <div>
                  <label className="form-label">Nombre</label>
                  <input
                    className="form-input"
                    value={form.nombreAcompanante}
                    onChange={(e) => handleChange("nombreAcompanante", e.target.value)}
                    placeholder="Nombre acompañante"
                  />
                </div>
                <div>
                  <label className="form-label">Teléfono</label>
                  <input
                    className="form-input"
                    value={form.telefonoAcompanante}
                    onChange={(e) => handleChange("telefonoAcompanante", e.target.value)}
                    placeholder="Teléfono acompañante"
                  />
                </div>
              </div>

              {/* Mercadeo */}
              <div className="form-section-title">Mercadeo</div>
              <div className="form-grid">
                <div>
                  <label className="form-label">Convenio beneficio</label>
                  <input
                    className="form-input"
                    value={form.convenioBeneficio}
                    onChange={(e) => handleChange("convenioBeneficio", e.target.value)}
                  />
                </div>
                <div>
                  <label className="form-label">¿Cómo nos conoció?</label>
                  <select
                    className="form-input"
                    value={form.comoConocio}
                    onChange={(e) => handleChange("comoConocio", e.target.value)}
                  >
                    <option value="">Seleccione…</option>
                    <option>Redes sociales</option>
                    <option>Publicidad</option>
                    <option>Recomendación</option>
                    <option>Otro</option>
                  </select>
                </div>
                <div>
                  <label className="form-label">Campaña</label>
                  <input
                    className="form-input"
                    value={form.campania}
                    onChange={(e) => handleChange("campania", e.target.value)}
                  />
                </div>
                <div>
                  <label className="form-label">Remitido por</label>
                  <input
                    className="form-input"
                    value={form.remitidoPor}
                    onChange={(e) => handleChange("remitidoPor", e.target.value)}
                  />
                </div>
                <div>
                  <label className="form-label">Asesor comercial</label>
                  <input
                    className="form-input"
                    value={form.asesorComercial}
                    onChange={(e) => handleChange("asesorComercial", e.target.value)}
                  />
                </div>
              </div>

              {/* EPS */}
              <div className="form-section-title">EPS</div>
              <div className="form-grid">
                <div>
                  <label className="form-label">Tipo de vinculación *</label>
                  <select
                    className="form-input"
                    value={form.tipoVinculacion}
                    onChange={(e) => handleChange("tipoVinculacion", e.target.value)}
                    required
                  >
                    <option value="">Seleccione…</option>
                    <option>Contributivo</option>
                    <option>Subsidiado</option>
                    <option>Particular</option>
                    <option>Otro</option>
                  </select>
                </div>

                <div>
                  <label className="form-label">Nombre de la EPS *</label>
                  <input
                    className="form-input"
                    list="listEps"
                    value={form.nombreEps}
                    onChange={(e) => handleChange("nombreEps", e.target.value)}
                    placeholder="Escribe y selecciona…"
                    required
                  />
                  <datalist id="listEps">
                    {epsList.map((e) => (
                      <option key={e} value={e} />
                    ))}
                  </datalist>
                </div>

                <div>
                  <label className="form-label">Póliza de salud</label>
                  <input
                    className="form-input"
                    value={form.polizaSalud}
                    onChange={(e) => handleChange("polizaSalud", e.target.value)}
                  />
                </div>
              </div>

              {/* Doctor */}
              <div className="form-section-title">Doctor</div>
              <div className="form-grid">
                <div>
                  <label className="form-label">Doctor</label>
                  <input
                    className="form-input"
                    value={form.doctor}
                    onChange={(e) => handleChange("doctor", e.target.value)}
                    placeholder="Usuario / Libre"
                  />
                </div>
              </div>

              {/* Notas */}
              <div className="form-section-title">Alertas y Notas</div>
              <div className="form-grid">
                <textarea
                  className="form-input"
                  rows={3}
                  value={form.notas}
                  onChange={(e) => handleChange("notas", e.target.value)}
                  placeholder="Notas del paciente…"
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 12 }}>
                <button type="button" className="btn" onClick={() => setOpen(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn blue">
                  Guardar paciente
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
