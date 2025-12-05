// src/utils/router.js
// Helpers reutilizables para rutas dentro de /dashboard_* y /config/*

import { useLocation } from "react-router-dom";
import { useMemo } from "react";

/** Devuelve el prefijo /dashboard_xxx de la URL actual */
export function getDashBase(pathname = "") {
  const segs = String(pathname).split("/").filter(Boolean);
  const i = segs.findIndex((s) => s.startsWith("dashboard_"));
  return i >= 0 ? `/${segs.slice(0, i + 1).join("/")}` : "";
}

/** Extrae los segmentos que siguen a /config/ (p.ej. ["lista-de-precios","editar","abc123"]) */
export function getConfigSegs(pathname = "") {
  const idx = String(pathname).toLowerCase().indexOf("/config/");
  if (idx === -1) return [];
  const rest = pathname.slice(idx + "/config/".length);
  return rest.split("/").filter(Boolean);
}

/** Une base (/dashboard_xxx) con /config y los segmentos dados */
export function joinConfig(base = "", ...segs) {
  const clean = segs.flat().filter(Boolean).join("/");
  return `${base}/config/${clean}`;
}

/** Hook para obtener memorizado el dashBase (con useLocation) */
export function useDashBase() {
  const { pathname } = useLocation();
  return useMemo(() => getDashBase(pathname), [pathname]);
}
