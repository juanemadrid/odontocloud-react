// src/components/PrintSection.jsx
import React, { forwardRef, useRef } from "react";
import DocHeader from "./DocHeader.jsx";

/**
 * Envuelve contenido imprimible y pone DocHeader arriba.
 *
 * Props:
 *  - headerProps: props que se pasan a <DocHeader/> (title, subtitle, meta, etc.)
 *  - children: lo que quieras imprimir (tablas, listas, etc.)
 *  - className: estilos extra
 *
 * Uso:
 *  <PrintSection headerProps={{ title: "Citas del día", subtitle: "Dr. Pérez", meta:{nit:"...", ciudad:"..."} }}>
 *     ...tu tabla/lista...
 *  </PrintSection>
 *
 *  Botón para imprimir:
 *    <button onClick={() => printRef.current()}>Imprimir</button>
 */
const PrintSection = ({ headerProps = {}, children, className = "" }) => {
  const containerRef = useRef(null);

  return (
    <section className={`print-section ${className}`} ref={containerRef}>
      <DocHeader {...headerProps} />
      <div className="print-body">
        {children}
      </div>
    </section>
  );
};

export default PrintSection;
