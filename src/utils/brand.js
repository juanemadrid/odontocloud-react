// src/utils/brand.js
export function setCompanyName(name) {
  const v = (name || "").trim();
  try { localStorage.setItem("oc_company_name", v); } catch {}
  // avisa a toda la app que cambió
  try { window.dispatchEvent(new CustomEvent("oc-company-name-updated", { detail: v })); } catch {}
}

export function getCompanyName() {
  try { return localStorage.getItem("oc_company_name") || ""; } catch { return ""; }
}
