import React from "react";

/*
  Sidebar premium — icons inline, accesible
  Props:
  - activeModule
  - setActiveModule
*/
export default function Sidebar({ activeModule, setActiveModule }) {
  const items = [
    { id: "Inicio", label: "Inicio", icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 3l9 8h-3v8H6v-8H3l9-8z" fill="currentColor"/></svg>
    )},
    { id: "Pacientes", label: "Pacientes", icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 12c2.7 0 5-2.3 5-5s-2.3-5-5-5-5 2.3-5 5 2.3 5 5 5zm0 2c-3.3 0-10 1.7-10 5v1h20v-1c0-3.3-6.7-5-10-5z" fill="currentColor"/></svg>
    )},
    { id: "Agenda", label: "Agenda", icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M7 10h5v5H7zM19 4h-1V2h-2v2H8V2H6v2H5c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2z" fill="currentColor"/></svg>
    )},
    { id: "Facturación", label: "Facturación", icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M21 8V7l-3 2-2-2-3 2V7l-3 2-2-2v12h16V8zM5 21v-2h14v2H5z" fill="currentColor"/></svg>
    )},
    { id: "Inventario", label: "Inventario", icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 2l8 4v6c0 5-3 9-8 10-5-1-8-5-8-10V6l8-4z" fill="currentColor"/></svg>
    )},
    { id: "Odontograma", label: "Odontograma", icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 2C8 2 5 5 5 9c0 3 2 6 7 11 5-5 7-8 7-11 0-4-3-7-7-7z" fill="currentColor"/></svg>
    )},
    { id: "Reportes", label: "Reportes", icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M3 13h2v6H3v-6zm4-8h2v14H7V5zm4 4h2v10h-2V9zm4-6h2v16h-2V3z" fill="currentColor"/></svg>
    )},
  ];

  return (
    <nav className="oc-sidebar-nav" aria-label="Menú principal">
      <div className="oc-sidebar-brand" aria-hidden>
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" style={{marginRight:10}}><path d="M12 2C8 2 5 5 5 9c0 3 2 6 7 11 5-5 7-8 7-11 0-4-3-7-7-7z" fill="currentColor"/></svg>
        <span>OdontoCloud</span>
      </div>

      <ul className="oc-side-list">
        {items.map((it) => (
          <li key={it.id} className={`oc-side-item ${activeModule === it.id ? "active" : ""}`}>
            <button
              onClick={() => setActiveModule(it.id)}
              className="oc-side-btn"
              aria-current={activeModule === it.id}
            >
              <span className="oc-side-ico">{it.icon}</span>
              <span className="oc-side-label">{it.label}</span>
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}
