import React, { useEffect, useState } from "react";
import "./empresa.css";

/* Utilidad: crea/actualiza meta tags */
function upsertMeta(name, value) {
  try {
    let m = document.querySelector(`meta[name="${name}"]`);
    if (!m) {
      m = document.createElement("meta");
      m.setAttribute("name", name);
      document.head.appendChild(m);
    }
    m.setAttribute("content", value);
  } catch {}
}

/* Claves usadas como “fuente única de verdad” */
const LS_KEY_FULL = "empresa_datos_basicos";   // todo el formulario
const LS_KEY_NAME = "oc_company_name";         // nombre visible en UI
const LS_KEY_NAME_COMPAT = "empresa_nombre";   // compatibilidad vieja

export default function EmpresaDatosBasicos() {
  const [form, setForm] = useState({
    nombre: "",
    marca: "",
    pais: "Colombia",
    ciudad: "",
    tipoDocumento: "NIT",
    numeroDocumento: "",
    tipoPersona: "",
    telefono: "",
    celular: "",
    direccion: "",
    sitioWeb: "",
    urlAgendamiento: "",
    regimen: "",
    responsabilidadTributaria: "",
    correo: "",
    moneda: "Pesos colombianos (COP)",
    zonaHoraria: "Hora de Colombia",
    cuentaContable: "",
    esIPS: false,
    usuarioSispro: "",
    tipoDocSispro: "Cédula de Ciudadanía",
    passwordSispro: "",
    codigoPrestador: "",
  });

  // Carga inicial (localStorage o <meta company-name>)
  useEffect(() => {
    try {
      const saved = localStorage.getItem(LS_KEY_FULL);
      if (saved) {
        const data = JSON.parse(saved);
        setForm((f) => ({ ...f, ...data }));
        return;
      }
      const metaName =
        document.querySelector('meta[name="company-name"]')?.getAttribute("content");
      if (metaName) setForm((f) => ({ ...f, nombre: metaName }));
    } catch {}
  }, []);

  const onChange = (e) => {
    const { name, type, value, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  };

  const onSave = (e) => {
    e.preventDefault();

    // 1) Guardar todo el formulario
    try {
      localStorage.setItem(LS_KEY_FULL, JSON.stringify(form));
    } catch {}

    // 2) Guardar el nombre (dos claves por compatibilidad)
    const nombre = (form.nombre || "OdontoCloud").trim();
    try {
      localStorage.setItem(LS_KEY_NAME, nombre);
      localStorage.setItem(LS_KEY_NAME_COMPAT, nombre);
    } catch {}

    // 3) Meta para impresión/otros consumidores
    upsertMeta("company-name", nombre);

    // 4) Refrescar INMEDIATO el topbar (sin recargar)
    try {
      // a) Disparo un CustomEvent
      window.dispatchEvent(new CustomEvent("oc-company-name-updated", { detail: { nombre } }));
      // b) Fallback ultra-directo por si el componente aún no escucha
      const el = document.querySelector(".oc-topbar-title");
      if (el) el.textContent = nombre;
    } catch {}

    console.log("✅ Datos básicos guardados:", form);
    alert("Datos básicos guardados.");
  };

  return (
    <div className="oc-main-content">
      <div className="oc-section-title">
        <h2>Configuración · Datos básicos</h2>
      </div>

      <div className="emp-card">
        <div className="emp-title">Datos básicos</div>

        <form className="emp-form" onSubmit={onSave}>
          <div className="oc-form-grid">
            <div className="oc-field">
              <label className="emp-label">Nombre *</label>
              <input
                name="nombre"
                className="emp-input"
                autoComplete="organization"
                required
                value={form.nombre}
                onChange={onChange}
              />
            </div>

            <div className="oc-field">
              <label className="emp-label">Marca</label>
              <input
                name="marca"
                className="emp-input"
                value={form.marca}
                onChange={onChange}
              />
            </div>

            <div className="oc-field">
              <label className="emp-label">País</label>
              <select
                name="pais"
                className="emp-select"
                value={form.pais}
                onChange={onChange}
              >
                <option>Colombia</option>
                <option>México</option>
                <option>Perú</option>
                <option>Chile</option>
                <option>Argentina</option>
                <option>España</option>
              </select>
            </div>

            <div className="oc-field">
              <label className="emp-label">Ciudad</label>
              <input
                name="ciudad"
                className="emp-input"
                value={form.ciudad}
                onChange={onChange}
              />
            </div>

            <div className="oc-field">
              <label className="emp-label">Tipo documento *</label>
              <select
                name="tipoDocumento"
                className="emp-select"
                required
                value={form.tipoDocumento}
                onChange={onChange}
              >
                <option>NIT</option>
                <option>CC</option>
                <option>CE</option>
                <option>PA</option>
              </select>
            </div>

            <div className="oc-field">
              <label className="emp-label">Número de documento *</label>
              <input
                name="numeroDocumento"
                className="emp-input"
                required
                value={form.numeroDocumento}
                onChange={onChange}
              />
            </div>

            <div className="oc-field">
              <label className="emp-label">Tipo de persona</label>
              <select
                name="tipoPersona"
                className="emp-select"
                value={form.tipoPersona}
                onChange={onChange}
              >
                <option value="">Seleccione…</option>
                <option>Natural</option>
                <option>Jurídica</option>
              </select>
            </div>

            <div className="oc-field">
              <label className="emp-label">Teléfono fijo</label>
              <input
                name="telefono"
                className="emp-input"
                inputMode="tel"
                autoComplete="tel"
                value={form.telefono}
                onChange={onChange}
              />
            </div>

            <div className="oc-field">
              <label className="emp-label">Celular</label>
              <input
                name="celular"
                className="emp-input"
                inputMode="tel"
                autoComplete="tel"
                value={form.celular}
                onChange={onChange}
              />
            </div>

            <div className="oc-field oc-col-2">
              <label className="emp-label">Dirección</label>
              <input
                name="direccion"
                className="emp-input"
                autoComplete="street-address"
                value={form.direccion}
                onChange={onChange}
              />
            </div>

            <div className="oc-field oc-col-2">
              <label className="emp-label">Sitio web</label>
              <input
                name="sitioWeb"
                className="emp-input"
                inputMode="url"
                placeholder="https://…"
                value={form.sitioWeb}
                onChange={onChange}
              />
            </div>

            <div className="oc-field oc-col-2">
              <label className="emp-label">Agendamiento (URL)</label>
              <input
                name="urlAgendamiento"
                className="emp-input"
                inputMode="url"
                placeholder="https://…"
                value={form.urlAgendamiento}
                onChange={onChange}
              />
            </div>

            <div className="oc-field">
              <label className="emp-label">Régimen legal</label>
              <select
                name="regimen"
                className="emp-select"
                value={form.regimen}
                onChange={onChange}
              >
                <option value="">Seleccione…</option>
                <option>Común</option>
                <option>Simplificado</option>
              </select>
            </div>

            <div className="oc-field">
              <label className="emp-label">Responsabilidad tributaria</label>
              <select
                name="responsabilidadTributaria"
                className="emp-select"
                value={form.responsabilidadTributaria}
                onChange={onChange}
              >
                <option value="">Seleccione…</option>
                <option>No aplica</option>
                <option>Autorretenedor</option>
              </select>
            </div>

            <div className="oc-field oc-col-2">
              <label className="emp-label">Correo electrónico</label>
              <input
                name="correo"
                className="emp-input"
                type="email"
                autoComplete="email"
                value={form.correo}
                onChange={onChange}
              />
            </div>

            <div className="oc-field">
              <label className="emp-label">Moneda</label>
              <select
                name="moneda"
                className="emp-select"
                value={form.moneda}
                onChange={onChange}
              >
                <option>Pesos colombianos (COP)</option>
                <option>Dólares (USD)</option>
                <option>Euros (EUR)</option>
              </select>
            </div>

            <div className="oc-field">
              <label className="emp-label">Zona horaria</label>
              <select
                name="zonaHoraria"
                className="emp-select"
                value={form.zonaHoraria}
                onChange={onChange}
              >
                <option>Hora de Colombia</option>
                <option>America/Bogota</option>
                <option>UTC-5</option>
              </select>
            </div>

            <div className="oc-field oc-col-2">
              <label className="emp-label">Cuenta contable</label>
              <input
                name="cuentaContable"
                className="emp-input"
                value={form.cuentaContable}
                onChange={onChange}
              />
            </div>

            <div className="oc-field">
              <label className="emp-label">¿Es una institución prestadora de salud (IPS)?</label>
              <div className="emp-inline">
                <input
                  id="esIPS"
                  type="checkbox"
                  name="esIPS"
                  checked={form.esIPS}
                  onChange={onChange}
                />
                <label htmlFor="esIPS">Sí</label>
              </div>
            </div>

            <div className="oc-field">
              <label className="emp-label">Usuario SISPRO</label>
              <input
                name="usuarioSispro"
                className="emp-input"
                value={form.usuarioSispro}
                onChange={onChange}
              />
            </div>

            <div className="oc-field">
              <label className="emp-label">Tipo documento SISPRO</label>
              <select
                name="tipoDocSispro"
                className="emp-select"
                value={form.tipoDocSispro}
                onChange={onChange}
              >
                <option>Cédula de Ciudadanía</option>
                <option>Cédula de Extranjería</option>
                <option>NIT</option>
              </select>
            </div>

            <div className="oc-field">
              <label className="emp-label">Contraseña SISPRO</label>
              <input
                name="passwordSispro"
                className="emp-input"
                type="password"
                value={form.passwordSispro}
                onChange={onChange}
              />
            </div>

            <div className="oc-field">
              <label className="emp-label">Código de prestador</label>
              <input
                name="codigoPrestador"
                className="emp-input"
                value={form.codigoPrestador}
                onChange={onChange}
              />
            </div>
          </div>

          <div className="oc-form-actions">
            <button type="submit" className="oc-btn primary">
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
