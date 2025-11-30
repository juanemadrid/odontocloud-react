import React, { useCallback, useRef, useState } from "react";
import "./empresa.css";

const LOCAL_KEY = "empresa_logo_url";

function upsertMeta(name, value) {
  let m = document.querySelector(`meta[name="${name}"]`);
  if (!m) { m = document.createElement("meta"); m.setAttribute("name", name); document.head.appendChild(m); }
  m.setAttribute("content", value);
}

export default function EmpresaLogo() {
  const [logoUrl, setLogoUrl] = useState(() => {
    try { return localStorage.getItem(LOCAL_KEY) || ""; } catch { return ""; }
  });

  const [fileObj, setFileObj] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef(null);

  const handleFiles = useCallback((files) => {
    const file = files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      alert("Por favor selecciona una imagen (PNG/JPG/SVG/WebP).");
      return;
    }
    setFileObj(file);
    const reader = new FileReader();
    reader.onload = (e) => setLogoUrl(String(e.target?.result || ""));
    reader.readAsDataURL(file);
  }, []);

  const onInputChange = (e) => handleFiles(e.target.files);

  const onDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
    handleFiles(e.dataTransfer.files);
  };

  const onDragOver = (e) => { e.preventDefault(); setDragOver(true); };
  const onDragLeave = () => setDragOver(false);
  const onClickUploader = () => inputRef.current?.click();

  const onRemove = () => {
    setFileObj(null);
    setLogoUrl("");
  };

  const onSave = async () => {
    try {
      if (!logoUrl) {
        localStorage.removeItem(LOCAL_KEY);
        upsertMeta("company-logo", "");
      } else {
        localStorage.setItem(LOCAL_KEY, logoUrl);
        upsertMeta("company-logo", logoUrl);
      }
      alert("Logo guardado.");
    } catch (e) {
      console.error(e);
      alert("No se pudo guardar localmente.");
    }
  };

  return (
    <div className="oc-main-content">
      <div className="oc-section-title">
        <h2>Configuración · Logo empresa</h2>
      </div>

      <div className="emp-card">
        <div className="emp-title">Logo</div>

        <div className="logo-wrap">
          <div className="logo-current">
            <div className="emp-label">Logo actual</div>

            <div className="logo-preview" aria-live="polite">
              {logoUrl ? (
                <img src={logoUrl} alt="Logo actual de la empresa" />
              ) : (
                <div className="logo-empty">Sin logo</div>
              )}
            </div>

            <div className="logo-actions">
              <button
                type="button"
                className="oc-btn danger"
                onClick={onRemove}
                disabled={!logoUrl}
              >
                Eliminar
              </button>
            </div>
          </div>

          <div className="logo-uploader">
            <div className="emp-label">Cargar foto</div>

            <div
              className={`logo-drop ${dragOver ? "over" : ""}`}
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onDrop={onDrop}
              onClick={onClickUploader}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onClickUploader()}
              aria-label="Arrastra o haz click para cargar la imagen del logo"
            >
              <input
                ref={inputRef}
                type="file"
                accept="image/*"
                onChange={onInputChange}
                style={{ display: "none" }}
              />
              <div className="logo-drop-hint">
                Arrastra o click para cargar la foto.
                <div className="logo-subhint">Solo archivos de imagen</div>
              </div>
            </div>

            {fileObj && (
              <div className="logo-file-name">
                Archivo seleccionado: <b>{fileObj.name}</b>
              </div>
            )}
          </div>
        </div>

        <div className="oc-form-actions">
          <button type="button" className="oc-btn primary" onClick={onSave}>
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
}
