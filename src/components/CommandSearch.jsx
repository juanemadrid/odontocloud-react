// src/components/CommandSearch.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";

export default function CommandSearch({
  onNavigate,          // (moduleName) => void
  onAction,            // (actionKey) => void
  className = "oc-search",
}) {
  const [term, setTerm] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const ref = useRef(null);

  const commands = useMemo(() => ([
    // Navegación
    { group: "Navegación", label: "Ir a Inicio",        keywords: "inicio home overview",   onRun: () => onNavigate?.("Inicio") },
    { group: "Navegación", label: "Ir a Agenda",        keywords: "agenda calendario schedule", onRun: () => onNavigate?.("Agenda") },
    { group: "Navegación", label: "Ir a Pacientes",     keywords: "pacientes pacientes",     onRun: () => onNavigate?.("Pacientes") },
    { group: "Navegación", label: "Ir a Facturación",   keywords: "facturas facturación billing", onRun: () => onNavigate?.("Facturación") },
    { group: "Navegación", label: "Ir a Inventario",    keywords: "inventario stock",        onRun: () => onNavigate?.("Inventario") },
    { group: "Navegación", label: "Ir a Odontograma",   keywords: "odontograma",             onRun: () => onNavigate?.("Odontograma") },
    { group: "Navegación", label: "Ir a Reportes",      keywords: "reportes informes",       onRun: () => onNavigate?.("Reportes") },

    // Acciones rápidas
    { group: "Acciones", label: "Nueva cita",           keywords: "nueva cita agendar",      onRun: () => onAction?.("new_appointment") },
    { group: "Acciones", label: "Nuevo paciente",       keywords: "nuevo paciente alta",     onRun: () => onAction?.("new_patient") },
    { group: "Acciones", label: "Nueva factura",        keywords: "nueva factura",           onRun: () => onAction?.("new_invoice") },
    { group: "Acciones", label: "Exportar agenda",      keywords: "exportar agenda",         onRun: () => onAction?.("export_agenda") },
    { group: "Acciones", label: "Ir a hoy (Agenda)",    keywords: "hoy today",               onRun: () => onAction?.("agenda_today") },
    { group: "Acciones", label: "Cambiar modo oscuro",  keywords: "oscuro dark mode",        onRun: () => onAction?.("toggle_dark") },
    { group: "Acciones", label: "Cerrar sesión",        keywords: "logout salir cerrar",     onRun: () => onAction?.("logout") },

    // Ayuda
    { group: "Ayuda", label: "Ver atajos de teclado",   keywords: "atajos ayuda",            onRun: () => onAction?.("show_shortcuts") },
    { group: "Ayuda", label: "Soporte / Contacto",      keywords: "soporte ayuda contacto",  onRun: () => onAction?.("support") },
  ]), [onNavigate, onAction]);

  const filtered = useMemo(() => {
    const q = term.toLowerCase().trim();
    if (!q) return [];
    return commands.filter(c =>
      c.label.toLowerCase().includes(q) || c.keywords.includes(q)
    );
  }, [term, commands]);

  useEffect(() => {
    const clickAway = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", clickAway);
    return () => document.removeEventListener("mousedown", clickAway);
  }, []);

  const run = (cmd) => {
    cmd.onRun?.();
    setTerm("");
    setOpen(false);
  };

  const onKeyDown = (e) => {
    if (!open && e.key !== "Escape") return;
    if (e.key === "ArrowDown") { e.preventDefault(); setActive(i => (i + 1) % filtered.length); }
    if (e.key === "ArrowUp")   { e.preventDefault(); setActive(i => (i - 1 + filtered.length) % filtered.length); }
    if (e.key === "Enter")     { e.preventDefault(); if (filtered[active]) run(filtered[active]); }
    if (e.key === "Escape")    { setOpen(false); }
  };

  // Agrupar por grupo para mostrar
  const grouped = useMemo(() => {
    const m = new Map();
    filtered.forEach(c => { if (!m.has(c.group)) m.set(c.group, []); m.get(c.group).push(c); });
    return Array.from(m.entries()); // [ [group, items[]], ... ]
  }, [filtered]);

  return (
    <div className="oc-search-wrap" ref={ref}>
      <input
        className={className}
        placeholder="Buscar acciones o ir a…"
        value={term}
        onChange={e => { setTerm(e.target.value); setOpen(!!e.target.value); setActive(0); }}
        onFocus={() => setOpen(!!term)}
        onKeyDown={onKeyDown}
      />
      {open && (
        <div className="oc-search-dropdown">
          {grouped.length === 0 ? (
            <div className="oc-search-item empty">Escribe para ver opciones…</div>
          ) : grouped.map(([group, items]) => (
            <div key={group}>
              <div className="oc-search-group">{group}</div>
              {items.map((c, idx) => {
                const flatIndex = filtered.indexOf(c);
                return (
                  <button
                    key={c.label}
                    className={`oc-search-item ${flatIndex === active ? "active" : ""}`}
                    onMouseEnter={() => setActive(flatIndex)}
                    onClick={() => run(c)}
                  >
                    <span className="oc-search-title">{c.label}</span>
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
