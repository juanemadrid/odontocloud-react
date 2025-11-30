import React, { createContext, useContext, useEffect, useState } from "react";

const LOCAL_LOGO_KEY = "empresa_logo_url";
const LOCAL_NAME_KEY = "empresa_nombre";
const BrandingContext = createContext(null);

export function BrandingProvider({ children }) {
  const [logoUrl, setLogoUrl] = useState("");
  const [clinicName, setClinicName] = useState("OdontoCloud");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Logo: primero lo guardado; si no, /assets/logo.png
    let url = "";
    try { url = localStorage.getItem(LOCAL_LOGO_KEY) || ""; } catch {}
    if (!url) url = "/assets/logo.png";
    setLogoUrl(url);

    // Nombre: primero localStorage (empresa_nombre), luego meta, luego OdontoCloud
    let name = "OdontoCloud";
    try {
      name =
        localStorage.getItem(LOCAL_NAME_KEY) ||
        document.querySelector('meta[name="company-name"]')?.getAttribute("content") ||
        "OdontoCloud";
    } catch {}
    setClinicName(name);

    setLoading(false);
  }, []);

  // si alguien cambia el nombre aquí, actualizamos localStorage y la meta para que imprimir lo reciba
  const updateClinicName = (name) => {
    const val = name || "OdontoCloud";
    try { localStorage.setItem(LOCAL_NAME_KEY, val); } catch {}
    let m = document.querySelector('meta[name="company-name"]');
    if (!m) {
      m = document.createElement("meta");
      m.setAttribute("name", "company-name");
      document.head.appendChild(m);
    }
    m.setAttribute("content", val);
    setClinicName(val);
  };

  const value = { logoUrl, clinicName, loading, setLogoUrl, setClinicName: updateClinicName };
  return <BrandingContext.Provider value={value}>{children}</BrandingContext.Provider>;
}

export function useBranding() {
  return useContext(BrandingContext);
}
