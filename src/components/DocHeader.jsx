// src/components/DocHeader.jsx
import React from "react";
import { useBranding } from "../context/BrandingContext.jsx";

/**
 * Encabezado institucional para documentos/impresiones.
 * - Muestra logo (si hay), nombre comercial, NIT/ciudad (si los pasas).
 * - Se ve en pantalla (modo "preview") y en @media print.
 *
 * Props:
 *  - title: título del documento (p.ej. "Agenda del día", "Factura #123")
 *  - subtitle: texto pequeño debajo del título (opcional)
 *  - rightBlock: nodo React para poner info a la derecha (fecha, folio, etc.)
 *  - meta: objeto opcional { nit, ciudad, direccion, telefono, correo }
 *  - compact: boolean (si lo quieres más bajito en pantalla)
 */
export default function DocHeader({
  title = "Documento",
  subtitle = "",
  rightBlock = null,
  meta = {},
  compact = false,
}) {
  const { logoUrl, clinicName } = useBranding();

  return (
    <header
      className={`doc-header ${compact ? "compact" : ""}`}
      aria-label="Encabezado institucional"
    >
      <div className="doc-header-left">
        <div className="doc-brand">
          <div className="doc-logo">
            {logoUrl ? (
              <img src={logoUrl} alt="Logo de la clínica" />
            ) : (
              <div className="doc-logo-empty">Logo</div>
            )}
          </div>
          <div className="doc-brand-text">
            <div className="doc-name">{clinicName || "OdontoCloud"}</div>
            <div className="doc-meta">
              {meta.nit ? <span>NIT: {meta.nit}</span> : null}
              {meta.ciudad ? <span> · {meta.ciudad}</span> : null}
            </div>
            {meta.direccion || meta.telefono || meta.correo ? (
              <div className="doc-meta2">
                {meta.direccion ? <span>{meta.direccion}</span> : null}
                {meta.telefono ? <span> · {meta.telefono}</span> : null}
                {meta.correo ? <span> · {meta.correo}</span> : null}
              </div>
            ) : null}
          </div>
        </div>
        <div className="doc-title-wrap">
          <h1 className="doc-title">{title}</h1>
          {subtitle ? <div className="doc-subtitle">{subtitle}</div> : null}
        </div>
      </div>

      <div className="doc-header-right">
        {rightBlock ?? (
          <div className="doc-right-default">
            <div>Fecha: {new Date().toLocaleDateString("es-CO")}</div>
            <div>Hora: {new Date().toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" })}</div>
          </div>
        )}
      </div>
    </header>
  );
}
