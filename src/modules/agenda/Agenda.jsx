// src/modules/agenda/Agenda.jsx
// 🗓️ Agenda PRO OdontoCloud – impresión en ventana emergente + exportación con cabecera de empresa
import React, { useEffect, useMemo, useState } from "react";
import "./agenda.css";

import { db } from "../../firebase/firebaseConfig";
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  where,
  addDoc,
  doc,
  setDoc,
  getDoc,
  getDocs,
  arrayUnion,
  updateDoc,
  deleteDoc,
  startAt,
  endAt,
  limit,
} from "firebase/firestore";

import { useLocation } from "react-router-dom";

/* =========================
   Branding centralizado (lee <meta> y fallback a localStorage)
   ========================= */
const lsGet = (k, def = "") => {
  try { return localStorage.getItem(k) ?? def; } catch { return def; }
};

const getCompanyName = () =>
  document.querySelector('meta[name="company-name"]')?.getAttribute("content") ||
  lsGet("empresa_nombre", "OdontoCloud");

const getCompanyLogo = () =>
  document.querySelector('meta[name="company-logo"]')?.getAttribute("content") ||
  lsGet("empresa_logo_url", "");

const getSoftwareFooter = () =>
  document.querySelector('meta[name="software-footer"]')?.getAttribute("content") ||
  lsGet("software_footer_text", "Generado por OdontoCloud");

/* =========================
   Utilidades
   ========================= */
const todayDate = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};
const startOfDay = (date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};
const endOfDay = (date) => {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
};
const addDays = (date, days) => {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
};
const startOfWeekMonday = (date) => {
  const d = new Date(date);
  const day = d.getDay(); // 0 domingo
  const diff = (day === 0 ? -6 : 1) - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
};
const sameDay = (a, b) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

const browserLocale =
  typeof navigator !== "undefined" && navigator.language?.startsWith("es")
    ? "es-ES"
    : "en-US";

const toIsoDate = (dateObj) => {
  const y = dateObj.getFullYear();
  const m = String(dateObj.getMonth() + 1).padStart(2, "0");
  const d = String(dateObj.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

// normaliza cadenas (para búsquedas consistentes con nombre_busqueda)
const normalize = (s) =>
  (s || "")
    .toString()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim();

/* ======== Leer fecha objetivo desde URL / sessionStorage ======== */
const readTargetDateFromSearch = (search) => {
  try {
    const qs = new URLSearchParams(search || "");
    const raw =
      qs.get("date") ||
      qs.get("day") ||
      qs.get("d") ||
      qs.get("fecha") ||
      qs.get("selectedDate") ||
      (typeof sessionStorage !== "undefined"
        ? sessionStorage.getItem("agenda.targetDate")
        : "");

    const s = String(raw || "").slice(0, 10); // YYYY-MM-DD
    if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return null;

    const [y, m, d] = s.split("-").map((n) => parseInt(n, 10));
    const local = new Date(y, (m || 1) - 1, d || 1, 0, 0, 0, 0); // fecha local sin UTC
    return local;
  } catch {
    return null;
  }
};

/* =========================
   Componente principal
   ========================= */
export default function Agenda() {
  const location = useLocation();

  const [viewMode, setViewMode] = useState("day"); // "day" | "week" | "detail"
  const [selectedDate, setSelectedDate] = useState(todayDate());
  const [monthDate, setMonthDate] = useState(todayDate());

  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState([]);

  const [filterSucursal, setFilterSucursal] = useState("");
  const [filterDoctor, setFilterDoctor] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // ===== Catálogos (🎯 NUEVO): doctores, consultorios, sucursales =====
  const [catDoctores, setCatDoctores] = useState([]);       // {id, nombre, especialidad?, activo}
  const [catConsultorios, setCatConsultorios] = useState([]); // {id, nombre, sucursalId?, sucursalNombre?, activo}
  const [catSucursales, setCatSucursales] = useState([]);     // {id, nombre, activo}

  useEffect(() => {
    // Profesionales (doctores)
    const qDocs = query(collection(db, "profesionales"), where("activo", "==", true));
    const u1 = onSnapshot(qDocs, (snap) => {
      setCatDoctores(
        snap.docs.map((d) => {
          const x = d.data() || {};
          return {
            id: d.id,
            nombre: x.nombre || x.nombres || x.nombreCompleto || d.id,
            especialidad: x.especialidad || x.especialidadNombre || "",
            activo: x.activo !== false,
          };
        })
      );
    }, () => setCatDoctores([]));

    // Consultorios / espacios físicos
    const qCons = query(collection(db, "consultorios"), where("activo", "==", true));
    const u2 = onSnapshot(qCons, (snap) => {
      setCatConsultorios(
        snap.docs.map((d) => {
          const x = d.data() || {};
          return {
            id: d.id,
            nombre: x.nombre || x.descripcion || d.id,
            sucursalId: x.sucursalId || x.sedeId || "",
            sucursalNombre: x.sucursalNombre || x.sede || "",
            activo: x.activo !== false,
          };
        })
      );
    }, () => setCatConsultorios([]));

    // Sucursales
    const qSeds = query(collection(db, "sucursales"), where("activo", "==", true));
    const u3 = onSnapshot(qSeds, (snap) => {
      setCatSucursales(
        snap.docs.map((d) => {
          const x = d.data() || {};
          return {
            id: d.id,
            nombre: x.nombre || x.alias || d.id,
            activo: x.activo !== false,
          };
        })
      );
    }, () => setCatSucursales([]));

    return () => { try { u1(); u2(); u3(); } catch {} };
  }, []);

  /* ======== posicionar agenda según la URL al montar/cambiar ======== */
  useEffect(() => {
    const target = readTargetDateFromSearch(location.search);
    if (target) {
      const day = startOfDay(target);
      setSelectedDate(day);
      setMonthDate(day);
      setViewMode("day"); // aseguramos vista día al aterrizar
      try {
        sessionStorage.removeItem("agenda.targetDate");
      } catch {}
    }
  }, [location.search]);

  // ------------ Cargar citas desde Firebase ------------
  useEffect(() => {
    setLoading(true);
    const citasRef = collection(db, "citas");
    const qRef = query(citasRef, orderBy("fecha", "asc"));

    const unsub = onSnapshot(
      qRef,
      (snapshot) => {
        const allItems = snapshot.docs.map((docu) => {
          const data = docu.data();

          // hora
          const horaRaw = data.horaInicio || data.hora || "00:00";
          const [hStr = "0", mStr = "0"] = horaRaw.split(":");
          const h = parseInt(hStr, 10) || 0;
          const m = parseInt(mStr, 10) || 0;

          // fecha -> Date con hora (sin usar ISO/UTC)
          let f;
          if (data.fecha && data.fecha.toDate) {
            f = data.fecha.toDate();
            f.setHours(h, m, 0, 0);
          } else if (typeof data.fecha === "string") {
            const [year, month, day] = data.fecha.split("-");
            f = new Date(parseInt(year, 10), parseInt(month, 10) - 1, parseInt(day, 10), h, m, 0, 0);
          } else if (data.fecha instanceof Date) {
            f = new Date(data.fecha);
            f.setHours(h, m, 0, 0);
          } else {
            f = new Date();
            f.setHours(h, m, 0, 0);
          }

          const documento =
            data.documentoPaciente ||
            data.docPaciente ||
            data.pacienteDocumento ||
            data.documento ||
            "";

          const telefono =
            data.celularPaciente ||
            data.telefonoPaciente ||
            data.celular ||
            data.telefono ||
            "";

          return {
            id: docu.id,
            raw: data,
            fecha: f,
            horaInicio: horaRaw,
            paciente: data.paciente || data.pacienteNombre || "Sin nombre",

            // 👇 soporta tanto nombre como id (legado + nuevo)
            doctor: data.doctor || data.doctorNombre || "—",
            doctorId: data.doctorId || "",

            sucursal: data.sucursal || data.sucursalNombre || "",
            sucursalId: data.sucursalId || "",

            espacio: data.espacio || data.consultorio || data.consultorioNombre || "",
            consultorioId: data.consultorioId || "",

            comentario: data.comentario || "",
            estado: data.estado || "En espera",
            recordatorio: data.recordatorio || "",
            documento,
            telefono,
          };
        });

        // rango por vista
        let startRange;
        let endRange;

        if (viewMode === "day") {
          startRange = startOfDay(selectedDate);
          endRange = endOfDay(selectedDate);
        } else if (viewMode === "week") {
          const start = startOfWeekMonday(selectedDate);
          const end = addDays(start, 6);
          startRange = startOfDay(start);
          endRange = endOfDay(end);
        } else {
          const center = startOfDay(selectedDate);
          const start = addDays(center, -30);
          const end = addDays(center, 60);
          startRange = startOfDay(start);
          endRange = endOfDay(end);
        }

        const itemsInRange = allItems.filter(
          (c) => c.fecha >= startRange && c.fecha <= endRange
        );

        setAppointments(itemsInRange);
        setLoading(false);
      },
      (error) => {
        console.error("Error leyendo citas:", error);
        setAppointments([]);
        setLoading(false);
      }
    );

    return () => unsub();
  }, [viewMode, selectedDate]);

  // ------------ Opciones de filtros (desde catálogos; fallback a citas) ------------
  const sucursalesOptions = useMemo(() => {
    const a = catSucursales.map((s) => s.nombre).filter(Boolean);
    if (a.length) return a;
    const s = new Set();
    appointments.forEach((c) => c.sucursal && s.add(c.sucursal));
    return Array.from(s);
  }, [appointments, catSucursales]);

  const doctoresOptions = useMemo(() => {
    const a = catDoctores.map((d) => d.nombre).filter(Boolean);
    if (a.length) return a;
    const s = new Set();
    appointments.forEach((c) => c.doctor && s.add(c.doctor));
    return Array.from(s);
  }, [appointments, catDoctores]);

  // ------------ Filtro combinado ------------
  const filteredAppointments = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    return appointments.filter((c) => {
      if (filterSucursal && c.sucursal !== filterSucursal) return false;
      if (filterDoctor && c.doctor !== filterDoctor) return false;

      if (!term) return true;

      const baseFields = [
        c.paciente,
        c.doctor,
        c.comentario,
        c.documento,
        c.sucursal,
        c.espacio,
        c.estado,
      ];

      const rawText = c.raw ? JSON.stringify(c.raw) : "";

      const hayMatch = [...baseFields, rawText]
        .filter(Boolean)
        .some((field) => String(field).toLowerCase().includes(term));

      return hayMatch;
    });
  }, [appointments, filterSucursal, filterDoctor, searchTerm]);

  // ------------ Info ocupación ------------
  const ocupacionInfoText = useMemo(() => {
    if (loading) return "Ocupación: cargando...";
    if (filteredAppointments.length === 0)
      return "Ocupación: sin citas para el rango seleccionado.";
    return `Ocupación: ${filteredAppointments.length} cita${
      filteredAppointments.length !== 1 ? "s" : ""
    } en el rango actual.`;
  }, [filteredAppointments, loading]);

  // ------------ Mini calendario ------------
  const miniMonthMatrix = useMemo(() => {
    const first = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
    const startWeekDay = (first.getDay() + 6) % 7; // Lunes=0
    const cursor = new Date(first);
    cursor.setDate(cursor.getDate() - startWeekDay);

    const weeks = [];
    for (let w = 0; w < 6; w++) {
      const row = [];
      for (let d = 0; d < 7; d++) {
        const current = new Date(cursor);
        const isCurrentMonth = current.getMonth() === monthDate.getMonth();
        const isToday = sameDay(current, todayDate());
        const isSelected = sameDay(current, selectedDate);
        row.push({
          date: current,
          isCurrentMonth,
          isToday,
          isSelected,
        });
        cursor.setDate(cursor.getDate() + 1);
      }
      weeks.push(row);
    }
    return weeks;
  }, [monthDate, selectedDate]);

  const handleMiniPrev = () => {
    const d = new Date(monthDate);
    d.setMonth(d.getMonth() - 1);
    setMonthDate(d);
  };

  const handleMiniNext = () => {
    const d = new Date(monthDate);
    d.setMonth(d.getMonth() + 1);
    setMonthDate(d);
  };

  const handleMiniClick = (date) => {
    setSelectedDate(startOfDay(date));
    setMonthDate(startOfDay(date));
    setViewMode("day");
  };

  const miniMonthLabel = useMemo(
    () =>
      monthDate.toLocaleDateString(browserLocale, {
        month: "long",
        year: "numeric",
      }),
    [monthDate]
  );

  // ------------ Navegación fecha principal (texto) ------------
  const currentDateLabel = useMemo(() => {
    if (viewMode === "day") {
      return selectedDate.toLocaleDateString(browserLocale, {
        weekday: "long",
        day: "2-digit",
        month: "long",
        year: "numeric",
      });
    }
    if (viewMode === "week") {
      const start = startOfWeekMonday(selectedDate);
      const end = addDays(start, 6);
      return (
        start.toLocaleDateString(browserLocale, {
          day: "2-digit",
          month: "short",
        }) +
        " - " +
        end.toLocaleDateString(browserLocale, {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })
      );
    }
    return "Últimas citas (detalle)";
  }, [viewMode, selectedDate]);

  // ------------ Controles fecha ------------
  const goPrev = () => {
    if (viewMode === "day") setSelectedDate(addDays(selectedDate, -1));
    else if (viewMode === "week") setSelectedDate(addDays(selectedDate, -7));
    else setSelectedDate(addDays(selectedDate, -1));
  };
  const goNext = () => {
    if (viewMode === "day") setSelectedDate(addDays(selectedDate, 1));
    else if (viewMode === "week") setSelectedDate(addDays(selectedDate, 7));
    else setSelectedDate(addDays(selectedDate, 1));
  };
  const goToday = () => {
    const t = todayDate();
    setSelectedDate(t);
    setMonthDate(t);
    setViewMode("day");
  };

  /* =========================
     Imprimir en ventana emergente (estilo OralDrive)
     ========================= */
  const handlePrint = () => {
    const safe = (t) =>
      String(t ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");

    const companyName = getCompanyName();
    const companyLogoUrl = getCompanyLogo();
    const softwareFooter = getSoftwareFooter();

    const sedeActual = filterSucursal || "—";
    const doctorActual = filterDoctor || "—";

    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const rowsHtml =
      filteredAppointments.length === 0
        ? `<tr class="empty"><td colspan="10">No hay citas registradas para este rango.</td></tr>`
        : filteredAppointments
            .map((c, idx) => {
              const hora = c.fecha.toLocaleTimeString(browserLocale, {
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
              });

              const documento =
                c.documento ||
                c.raw?.documento ||
                c.raw?.nroDocumento ||
                "";

              const celular =
                c.raw?.celularPaciente ||
                c.raw?.celular ||
                "";

              const telefonoFijo =
                c.raw?.telefonoPaciente ||
                c.raw?.telefono ||
                "";

              const fechaSolo = new Date(
                c.fecha.getFullYear(),
                c.fecha.getMonth(),
                c.fecha.getDate()
              );
              let actualidad = "Futura";
              if (fechaSolo.getTime() === hoy.getTime()) actualidad = "Hoy";
              else if (fechaSolo.getTime() < hoy.getTime()) actualidad = "Pasada";

              return `<tr class="${idx % 2 ? "zebra" : ""}">
                <td class="mono">${safe(hora)}</td>
                <td>${safe(c.paciente)}</td>
                <td class="mono">${safe(documento)}</td>
                <td class="mono">${safe(celular)}</td>
                <td class="mono">${safe(telefonoFijo)}</td>
                <td>${safe(c.doctor)}</td>
                <td>${safe(c.espacio)}</td>
                <td>${safe(c.comentario)}</td>
                <td class="status">${safe(c.estado)}</td>
                <td class="actual">${safe(actualidad)}</td>
              </tr>`;
            })
            .join("");

    const css = `
      @page { size: A4 portrait; margin: 14mm 16mm; }
      * { box-sizing: border-box; }
      html, body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      body { font-family: "Segoe UI", Roboto, Arial, sans-serif; color:#0f172a; line-height:1.35; }

      /* Cabecera */
      .hdr {
        display:flex; flex-direction:column; align-items:center; text-align:center;
        margin-bottom:14px;
      }
      .logo {
        max-height:120px; width:auto; max-width:100%; object-fit:contain;
        filter: drop-shadow(0 1px 0 rgba(0,0,0,.04));
      }
      .brand {
        margin-top:4px; font-weight:800; letter-spacing:.5px; text-transform:uppercase;
        font-size:26px; color:#0a86d8;
      }
      .sub { margin-top:2px; font-size:12px; color:#64748b; }

      /* Tarjeta info Sede/Doctor */
      .info-card {
        width:100%; display:flex; justify-content:center; margin:8px 0 16px;
      }
      .info {
        width:70%; border:1px solid #e5e7eb; border-radius:10px; overflow:hidden; border-collapse:separate;
        font-size:12px;
      }
      .info-row { display:flex; border-top:1px solid #e5e7eb; }
      .info-row:first-child { border-top:0; }
      .label {
        width:22%; padding:8px 10px; background:#f8fafc; font-weight:600; color:#334155; border-right:1px solid #e5e7eb;
      }
      .value { flex:1; padding:8px 10px; }

      /* Tabla principal */
      table { width:100%; border-collapse:separate; border-spacing:0; font-size:12px; }
      thead th {
        background:#0f172a; color:#ffffff; text-align:center; font-weight:700;
        padding:9px 8px; position:relative;
      }
      thead th + th { box-shadow: inset 1px 0 0 rgba(255,255,255,.08); }
      tbody td {
        padding:8px 8px; vertical-align:top; border-bottom:1px solid #e5e7eb;
      }
      tbody tr.zebra td { background:#fafafa; }
      tbody tr.empty td {
        padding:16px; color:#6b7280; text-align:center; background:#fafafa;
        border:1px dashed #e5e7eb; border-radius:8px;
      }
      td.mono { font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, "Liberation Mono", monospace; }
      td.status { white-space:nowrap; }
      td.actual { font-weight:600; }
      /* Bordes exteriores suaves */
      .tbl-wrap { border:1px solid #e5e7eb; border-radius:10px; overflow:hidden; }

      /* Notas pie */
      .note { margin-top:10px; font-size:10px; color:#6b7280; }

      /* Evitar cortes feos */
      tr, .hdr, .info-card { page-break-inside: avoid; }
    `;

    const html = `<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <title>Agenda – ${safe(companyName)}</title>
  <style>${css}</style>
</head>
<body>
  <div class="hdr">
    ${companyLogoUrl ? `<img src="${companyLogoUrl}" alt="Logo" class="logo">` : ""}
    <div class="brand">${safe(companyName)}</div>
    <div class="sub">Agenda de citas · ${safe(currentDateLabel)}</div>
  </div>

  <div class="info-card">
    <div class="info">
      <div class="info-row"><div class="label">Sede</div><div class="value">${safe(sedeActual)}</div></div>
      <div class="info-row"><div class="label">Doctor</div><div class="value">${safe(doctorActual)}</div></div>
    </div>
  </div>

  <div class="tbl-wrap">
    <table>
      <thead>
        <tr>
          <th style="width:9%">Hora</th>
          <th style="width:17%">Nombre paciente</th>
          <th style="width:12%">Documento</th>
          <th style="width:12%">Celular</th>
          <th style="width:12%">Teléfono</th>
          <th style="width:10%">Doctor</th>
          <th style="width:11%">Espacio</th>
          <th>Comentario</th>
          <th style="width:9%">Estado</th>
          <th style="width:9%">Actualidad</th>
        </tr>
      </thead>
      <tbody>${rowsHtml}</tbody>
    </table>
  </div>

  <div class="note">
    ${safe(softwareFooter)} · ${safe(new Date().toLocaleString(browserLocale))}
  </div>

  <script>
    window.addEventListener('load', function() {
      try { window.focus(); window.print(); } catch (e) {}
    });
  </script>
</body>
</html>`;

    const blob = new Blob([html], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const w = window.open(url, "_blank", "noopener,noreferrer,width=900,height=700");

    if (!w) {
      alert("El navegador bloqueó la ventana de impresión. Permite pop-ups para este sitio.");
      URL.revokeObjectURL(url);
      return;
    }

    const revoke = () => { try { URL.revokeObjectURL(url); } catch (_) {} };
    w.addEventListener?.("load", revoke);
    setTimeout(revoke, 15000);
  };

  // ------------ Confirmar / Hoy ------------
  const handleConfirmar = () =>
    alert("Función de confirmar citas se integrará con n8n / correo.");
  const handleHoyCitas = () => goToday();

  /* =========================
     Exportar CSV con cabecera de empresa
     ========================= */
  const handleExport = () => {
    if (filteredAppointments.length === 0) {
      alert("No hay citas para exportar.");
      return;
    }

    const companyName = getCompanyName();
    const softwareFooter = getSoftwareFooter();

    const headerRow1 = [`Empresa: ${companyName}`];
    const header = ["Fecha", "Hora", "Paciente", "Doctor", "Espacio", "Comentario"];

    const rows = filteredAppointments.map((c) => {
      const fechaStr = c.fecha.toLocaleDateString(browserLocale);
      const horaStr = c.fecha.toLocaleTimeString(browserLocale, {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
      return [
        fechaStr,
        horaStr,
        c.paciente || "",
        c.doctor || "",
        c.espacio || "",
        (c.comentario || "").replace(/\r?\n/g, " "),
      ];
    });

    const footerRow = [softwareFooter];

    const csv = [
      headerRow1,
      [],
      header,
      ...rows,
      [],
      footerRow,
    ]
      .map((r) =>
        (r || [])
          .map((cell) => `"${String(cell ?? "").replace(/"/g, '""')}"`)
          .join(",")
      )
      .join("\n");

    const fileName =
      `citas_${companyName.toLowerCase().replace(/\s+/g, "_")}_${toIsoDate(startOfDay(selectedDate))}` +
      (viewMode === "week" ? "_semana" : viewMode === "detail" ? "_detalle" : "") +
      ".csv";

    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ------------ Estado de cita ------------
  const handleEstadoChange = async (citaId, nuevoEstado) => {
    try {
      const ref = doc(db, "citas", citaId);
      await updateDoc(ref, { estado: nuevoEstado });
    } catch (err) {
      console.error("Error actualizando estado:", err);
      alert("No se pudo actualizar el estado de la cita.");
    }
  };

  // ------------ WhatsApp ------------
  const handleWhatsApp = (telefono, cita) => {
    if (!telefono) {
      alert("Este paciente no tiene celular registrado.");
      return;
    }
    const numero = String(telefono).replace(/\D/g, "");
    const fechaStr = cita.fecha.toLocaleDateString(browserLocale);
    const horaStr = cita.fecha.toLocaleTimeString(browserLocale, {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
    const mensaje = encodeURIComponent(
      `Hola ${cita.paciente}, le recordamos su cita odontológica el ${fechaStr} a las ${horaStr}. Por favor confirme su asistencia.`
    );
    const url = `https://wa.me/${numero}?text=${mensaje}`;
    window.open(url, "_blank");
  };

  // ------------ Eliminar cita ------------
  const handleDeleteCita = async (cita) => {
    const ok = window.confirm(
      `¿Seguro que deseas eliminar la cita de ${cita.paciente} del ${cita.fecha.toLocaleDateString(
        browserLocale
      )}?`
    );
    if (!ok) return;

    try {
      const ref = doc(db, "citas", cita.id);
      await deleteDoc(ref);
    } catch (err) {
      console.error("Error eliminando cita:", err);
      alert("❌ No se pudo eliminar la cita.");
    }
  };

  /* =========================
     Nueva Cita — ahora con catálogos (doctor/consultorio/sucursal)
     ========================= */
  const handleNuevaCita = () => {
    const modal = document.createElement("div");
    Object.assign(modal.style, {
      position: "fixed",
      top: "0",
      left: "0",
      width: "100%",
      height: "100%",
      background: "rgba(0,0,0,0.55)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: "9999",
    });

    const box = document.createElement("div");
    Object.assign(box.style, {
      background: "#fff",
      padding: "25px 30px",
      borderRadius: "14px",
      width: "520px",
      maxWidth: "95%",
      maxHeight: "95%",
      overflowY: "auto",
      boxShadow: "0 8px 30px rgba(0,0,0,0.3)",
      fontFamily: "Segoe UI, Roboto, sans-serif",
    });

    box.innerHTML = `
      <h2 style="margin-top:0;text-align:center;color:#0a86d8;font-weight:600;">🗓️ Nueva Cita</h2>
      <form id="formNuevaCita" style="display:flex;flex-direction:column;gap:12px;margin-top:10px;">
        <label style="font-weight:600;">Paciente existente</label>
        <div style="position:relative;">
          <input type="text" id="buscarPaciente" placeholder="Buscar por nombre, apellido o documento..." autocomplete="off"/>
          <div id="acResultados" style="position:absolute;left:0;right:0;top:calc(100% + 6px);z-index:10000;display:none;background:#fff;border:1px solid #ddd;border-radius:8px;box-shadow:0 8px 22px rgba(0,0,0,.12);max-height:240px;overflow:auto;"></div>
        </div>
        <small style="color:gray;">Si el paciente no existe, marca “Registrar nuevo paciente”.</small>

        <label style="display:flex;align-items:center;gap:8px;margin-top:5px;">
          <input type="checkbox" id="esNuevoPaciente" />
          <span>Registrar nuevo paciente</span>
        </label>

        <div id="nuevoPacienteCampos" style="display:none;flex-direction:column;gap:8px;margin-top:10px;padding:10px;border-radius:8px;background:#f9f9f9;border:1px solid #ddd;">
          <h4 style="margin:0;text-align:center;color:#0a86d8;">Datos del paciente</h4>
          <div style="display:flex;gap:8px;">
            <input type="text" id="npNombre" placeholder="Nombre" style="flex:1;" />
            <input type="text" id="npApellido" placeholder="Apellido" style="flex:1;" />
          </div>
          <select id="npTipoDocumento">
            <option value="">Tipo de documento</option>
            <option value="CC">Cédula de Ciudadanía</option>
            <option value="CE">Cédula de Extranjería</option>
            <option value="TI">Tarjeta de Identidad</option>
            <option value="PA">Pasaporte</option>
            <option value="DI">Documento Internacional</option>
            <option value="OTRO">Otro</option>
          </select>
          <input type="text" id="npDocumento" placeholder="Número de documento" />
          <input type="email" id="npCorreo" placeholder="Correo electrónico" />
          <div style="display:flex;gap:5px;">
            <select id="npIndicativo" style="width:40%;">
              <option value="+57">🇨🇴 +57</option>
              <option value="+1">🇺🇸 +1</option>
              <option value="+34">🇪🇸 +34</option>
              <option value="+52">🇲🇽 +52</option>
              <option value="+54">🇦🇷 +54</option>
              <option value="+593">🇪🇨 +593</option>
              <option value="+56">🇨🇱 +56</option>
              <option value="+58">🇻🇪 +58</option>
            </select>
            <input type="tel" id="npCelular" placeholder="Celular (obligatorio)" style="flex:1;" />
          </div>
          <input type="tel" id="npTelefono" placeholder="Teléfono fijo (opcional)" />
          <label style="font-weight:500;">Fecha de nacimiento:</label>
          <input type="date" id="npNacimiento" />
          <select id="npSexo">
            <option value="">Sexo</option>
            <option value="Masculino">Masculino</option>
            <option value="Femenino">Femenino</option>
            <option value="Otro">Otro</option>
          </select>
          <textarea id="npComentario" placeholder="Comentario o antecedentes del paciente" rows="2"></textarea>
        </div>

        <hr style="margin:10px 0;border:none;border-top:1px solid #ddd;" />
        <h4 style="margin:0;text-align:center;color:#0a86d8;">Detalles de la cita</h4>

        <!-- 👇 Catálogos -->
        <label>Doctor asignado</label>
        <select id="ncDoctorSel" required>
          <option value="">Seleccione doctor…</option>
        </select>

        <label>Fecha</label>
        <input type="date" id="ncFecha" required value="${toIsoDate(selectedDate)}" />

        <label>Hora</label>
        <input type="time" id="ncHora" required />

        <label>Espacio físico / Consultorio</label>
        <select id="ncConsultorioSel">
          <option value="">Seleccione consultorio…</option>
        </select>

        <label>Sucursal</label>
        <select id="ncSucursalSel">
          <option value="">Seleccione sucursal…</option>
        </select>

        <label>Comentario</label>
        <textarea id="ncComentario" placeholder="Comentario sobre la cita" rows="3"></textarea>

        <div style="display:flex;justify-content:flex-end;gap:10px;margin-top:10px;">
          <button type="button" id="btnCancelarModal" class="btn-cancelar">Cancelar</button>
          <button type="submit" class="btn-guardar">Guardar</button>
        </div>
      </form>
    `;

    const style = document.createElement("style");
    style.textContent = `
      .btn-cancelar, .btn-guardar { padding: 8px 14px; border: none; border-radius: 6px; cursor: pointer; font-weight: 600; font-size: 14px; transition: .2s; }
      .btn-cancelar { background: #e0e0e0; color: #333; } .btn-cancelar:hover { background: #d5d5d5; }
      .btn-guardar { background: #0a86d8; color: white; } .btn-guardar:hover { background: #0669ac; }
      input, select, textarea { width: 100%; padding: 8px 10px; border: 1px solid #ccc; border-radius: 6px; font-size: 14px; outline: none; }
      input:focus, select:focus, textarea:focus { border-color: #0a86d8; box-shadow: 0 0 0 2px rgba(10,134,216,.2); }
      .ac-item { padding: 8px 10px; display:flex; gap:8px; align-items:baseline; cursor:pointer; }
      .ac-item:hover, .ac-item.active { background:#f5f7fb; }
      .ac-name { font-weight:600; } .ac-doc { color:#64748b; font-size:12px; } .ac-tel { margin-left:auto; font-size:12px; color:#0f172a; }
      .ac-empty { padding:10px; color:#9aa4b2; font-size:13px; }
    `;
    document.head.appendChild(style);

    modal.appendChild(box);
    document.body.appendChild(modal);

    const chkNuevo = box.querySelector("#esNuevoPaciente");
    const camposNuevo = box.querySelector("#nuevoPacienteCampos");
    const inputBuscar = box.querySelector("#buscarPaciente");
    const acResultados = box.querySelector("#acResultados");

    // 👉 Poblar selects desde catálogos actuales (estado React capturado por cierre/closure)
    const selDoc = box.querySelector("#ncDoctorSel");
    const selCon = box.querySelector("#ncConsultorioSel");
    const selSed = box.querySelector("#ncSucursalSel");

    const addOption = (sel, value, text) => {
      const opt = document.createElement("option");
      opt.value = value;
      opt.textContent = text;
      sel.appendChild(opt);
    };

    // Doctores
    (catDoctores || []).forEach((d) => {
      const label = d.especialidad ? `${d.nombre} · ${d.especialidad}` : d.nombre;
      addOption(selDoc, d.id, label);
    });
    // Consultorios (mostrar sucursal si viene)
    (catConsultorios || []).forEach((c) => {
      const label = c.sucursalNombre ? `${c.nombre} · ${c.sucursalNombre}` : c.nombre;
      addOption(selCon, c.id, label);
    });
    // Sucursales
    (catSucursales || []).forEach((s) => addOption(selSed, s.id, s.nombre));

    chkNuevo.addEventListener("change", () => {
      camposNuevo.style.display = chkNuevo.checked ? "flex" : "none";
      if (chkNuevo.checked) acResultados.style.display = "none";
    });
    box.querySelector("#btnCancelarModal").addEventListener("click", () => modal.remove());

    // ================== AUTOCOMPLETAR PACIENTE ==================
    let debounceTimer = null;
    let seleccionado = null; // { id, nombre, documento, celular, telefono }
    let activeIndex = -1;
    let currentItems = [];

    const paintResults = (items) => {
      currentItems = items || [];
      activeIndex = -1;

      if (!items || items.length === 0) {
        acResultados.innerHTML = `<div class="ac-empty">Sin resultados</div>`;
        acResultados.style.display = "block";
        return;
      }
      acResultados.innerHTML = items
        .map(
          (p, i) => `
            <div class="ac-item" data-index="${i}" data-id="${p.id}">
              <span class="ac-name">${p.nombre}</span>
              <span class="ac-doc">· ${p.documento || "s/doc"}</span>
              <span class="ac-tel">${p.celular || p.telefono || ""}</span>
            </div>`
        )
        .join("");
      acResultados.style.display = "block";

      [...acResultados.querySelectorAll(".ac-item")].forEach((el) => {
        el.addEventListener("click", () => {
          const idx = Number(el.getAttribute("data-index"));
          selectByIndex(idx);
        });
      });
    };

    const selectByIndex = (idx) => {
      const p = currentItems[idx];
      if (!p) return;
      seleccionado = p;
      inputBuscar.value = p.nombre;
      acResultados.style.display = "none";
      chkNuevo.checked = false;
      camposNuevo.style.display = "none";
    };

    const moveActive = (delta) => {
      if (!currentItems.length) return;
      activeIndex = (activeIndex + delta + currentItems.length) % currentItems.length;
      [...acResultados.querySelectorAll(".ac-item")].forEach((el, i) => {
        if (i === activeIndex) el.classList.add("active");
        else el.classList.remove("active");
      });
    };

    const normalizeNameFromDoc = (x, id) =>
      x.nombreCompleto ||
      x.paciente ||
      [x.nombres, x.apellidos].filter(Boolean).join(" ") ||
      id;

    const buscarPacientes = async (term) => {
      const tRaw = (term || "").toString().trim();
      const t = normalize(tRaw);
      if (!t || t.length < 2) return [];

      // 1) documento exacto
      if (/^\d{5,}$/.test(tRaw)) {
        try {
          const qs1 = query(collection(db, "pacientes"), where("documento", "==", tRaw));
          const qs2 = query(collection(db, "pacientes"), where("nroDocumento", "==", tRaw));
          const [s1, s2] = await Promise.all([getDocs(qs1), getDocs(qs2)]);
          const snap = !s1.empty ? s1 : s2;
          if (!snap.empty) {
            return snap.docs.slice(0, 10).map((d) => {
              const x = d.data() || {};
              return {
                id: d.id,
                nombre: normalizeNameFromDoc(x, d.id),
                documento: x.documento || x.nroDocumento || d.id,
                celular: x.celularPaciente || x.celular || "",
                telefono: x.telefonoPaciente || x.telefono || "",
              };
            });
          }
        } catch {}
      }

      // 2) prefijo por nombre_busqueda
      try {
        const qPref = query(
          collection(db, "pacientes"),
          orderBy("nombre_busqueda"),
          startAt(t),
          endAt(t + "\uf8ff"),
          limit(10)
        );
        const snap = await getDocs(qPref);
        if (!snap.empty) {
          return snap.docs.map((d) => {
            const x = d.data() || {};
            return {
              id: d.id,
              nombre: normalizeNameFromDoc(x, d.id),
              documento: x.documento || x.nroDocumento || d.id,
              celular: x.celularPaciente || x.celular || "",
              telefono: x.telefonoPaciente || x.telefono || "",
            };
          });
        }
      } catch {}

      // 3) fallback últimos 50
      try {
        const qFallback = query(
          collection(db, "pacientes"),
          orderBy("creado", "desc"),
          limit(50)
        );
        const s = await getDocs(qFallback);
        const all = s.docs.map((d) => ({ id: d.id, ...(d.data() || {}) }));

        const list = all
          .map((x) => ({
            id: x.id,
            nombre: normalizeNameFromDoc(x, x.id),
            documento: x.documento || x.nroDocumento || x.id,
            celular: x.celularPaciente || x.celular || "",
            telefono: x.telefonoPaciente || x.telefono || "",
            _norm: normalize(
              `${x.nombreCompleto || x.paciente || ""} ${x.nombres || ""} ${x.apellidos || ""} ${
                x.documento || x.nroDocumento || ""
              }`
            ),
          }))
          .filter((p) => p._norm.includes(t))
          .slice(0, 10)
          .map(({ _norm, ...rest }) => rest);

        return list;
      } catch {}

      return [];
    };

    inputBuscar.addEventListener("input", () => {
      seleccionado = null;
      const term = inputBuscar.value;
      clearTimeout(debounceTimer);
      if (!term || term.trim().length < 2) {
        acResultados.style.display = "none";
        return;
      }
      debounceTimer = setTimeout(async () => {
        const items = await buscarPacientes(term.trim());
        paintResults(items);
      }, 220);
    });

    inputBuscar.addEventListener("keydown", (e) => {
      if (acResultados.style.display !== "block") return;
      if (e.key === "ArrowDown") {
        e.preventDefault();
        moveActive(1);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        moveActive(-1);
      } else if (e.key === "Enter") {
        if (activeIndex >= 0) {
          e.preventDefault();
          selectByIndex(activeIndex);
        }
      } else if (e.key === "Escape") {
        acResultados.style.display = "none";
      }
    });

    document.addEventListener(
      "click",
      (ev) => {
        if (!box.contains(ev.target)) return;
        if (!acResultados.contains(ev.target) && ev.target !== inputBuscar) {
          acResultados.style.display = "none";
        }
      },
      { capture: true }
    );

    // ================== SUBMIT ==================
    const form = box.querySelector("#formNuevaCita");

    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const esNuevo = chkNuevo.checked;
      const nombreLibre = (form.querySelector("#buscarPaciente").value || "").trim();

      // datos de cita
      const doctorIdSel = selDoc.value;
      const fechaSeleccionada = form.querySelector("#ncFecha").value;
      const horaSeleccionada = form.querySelector("#ncHora").value;
      const consultorioIdSel = selCon.value;
      const sucursalIdSel = selSed.value;
      const comentarioSel = (form.querySelector("#ncComentario").value || "").trim();

      if (!fechaSeleccionada || !horaSeleccionada) {
        alert("⚠️ Debes seleccionar fecha y hora para la cita.");
        return;
      }
      if (!doctorIdSel) {
        alert("⚠️ Indica el doctor asignado.");
        return;
      }

      // Resolver nombres desde catálogos
      const docRow = (catDoctores || []).find((d) => d.id === doctorIdSel);
      const doctorNombre = docRow?.nombre || "";

      let consultorioNombre = "";
      let consultorioSucursalNombre = "";
      if (consultorioIdSel) {
        const conRow = (catConsultorios || []).find((c) => c.id === consultorioIdSel);
        consultorioNombre = conRow?.nombre || "";
        consultorioSucursalNombre = conRow?.sucursalNombre || "";
      }

      let sucursalNombre = "";
      if (sucursalIdSel) {
        const sRow = (catSucursales || []).find((s) => s.id === sucursalIdSel);
        sucursalNombre = sRow?.nombre || "";
      }
      // Si no se eligió sucursal explícita, pero el consultorio tiene sucursal, úsala
      if (!sucursalIdSel && consultorioSucursalNombre) {
        sucursalNombre = consultorioSucursalNombre;
      }

      try {
        let pacienteId = null;
        let pacienteRef = null;
        let pacienteNombre = "";
        let celularParaCita = "";
        let telefonoParaCita = "";

        if (esNuevo) {
          const npNombre = (form.querySelector("#npNombre").value || "").trim();
          const npApellido = (form.querySelector("#npApellido").value || "").trim();
          pacienteNombre = `${npNombre} ${npApellido}`.trim();

          if (!pacienteNombre) {
            alert("⚠️ Debes indicar nombre y apellido para el nuevo paciente.");
            return;
          }

          const docPaciente = (form.querySelector("#npDocumento").value || "").trim();
          const celularNuevo = (form.querySelector("#npCelular").value || "").trim();
          const telefonoNuevo = (form.querySelector("#npTelefono").value || "").trim();

          if (!celularNuevo && !telefonoNuevo) {
            alert("⚠️ Debes registrar al menos un teléfono (celular o fijo) del paciente o de un acudiente.");
            return;
          }

          pacienteId =
            docPaciente ||
            pacienteNombre
              .toLowerCase()
              .normalize("NFD")
              .replace(/[\u0300-\u036f]/g, "")
              .replace(/\s+/g, "_");
          pacienteRef = doc(db, "pacientes", pacienteId);

          const existe = await getDoc(pacienteRef);
          if (!existe.exists()) {
            const nombreBusqueda = normalize(pacienteNombre);
            await setDoc(
              pacienteRef,
              {
                nombres: npNombre,
                apellidos: npApellido,
                nombreCompleto: pacienteNombre,
                paciente: pacienteNombre,
                nombre_busqueda: nombreBusqueda,
                variantes_busqueda: [nombreBusqueda, normalize(npNombre), normalize(npApellido)],
                tipoDocumento: form.querySelector("#npTipoDocumento").value,
                documento: docPaciente,
                correo: (form.querySelector("#npCorreo").value || "").trim(),
                indicativo: form.querySelector("#npIndicativo").value,
                celular: celularNuevo,
                telefono: telefonoNuevo,
                celularPaciente: celularNuevo,
                telefonoPaciente: telefonoNuevo,
                fechaNacimiento: form.querySelector("#npNacimiento").value,
                sexo: form.querySelector("#npSexo").value,
                notas: (form.querySelector("#npComentario").value || "").trim(),
                creado: new Date().toISOString(),
                activo: true,
                citas: [],
              },
              { merge: true }
            );
          }

          celularParaCita = celularNuevo;
          telefonoParaCita = telefonoNuevo;
        } else {
          if (seleccionado) {
            pacienteId = seleccionado.id;
            pacienteNombre = seleccionado.nombre;
            pacienteRef = doc(db, "pacientes", pacienteId);
            celularParaCita = seleccionado.celular || "";
            telefonoParaCita = seleccionado.telefono || "";
          } else {
            if (!nombreLibre) {
              alert("⚠️ Por favor, escribe o selecciona un paciente.");
              return;
            }

            const qDoc1 = query(collection(db, "pacientes"), where("documento", "==", nombreLibre));
            const qDoc2 = query(collection(db, "pacientes"), where("nroDocumento", "==", nombreLibre));
            const [s1, s2] = await Promise.all([getDocs(qDoc1), getDocs(qDoc2)]);
            const sDoc = !s1.empty ? s1 : s2;

            if (!sDoc.empty) {
              const d = sDoc.docs[0];
              const data = d.data() || {};
              pacienteId = d.id;
              pacienteRef = d.ref;
              pacienteNombre =
                data.nombreCompleto ||
                data.paciente ||
                [data.nombres, data.apellidos].filter(Boolean).join(" ") ||
                nombreLibre;
              celularParaCita = data.celularPaciente || data.celular || "";
              telefonoParaCita = data.telefonoPaciente || data.telefono || "";
            } else {
              // prefijo nombre_busqueda
              let encontrado = null;
              try {
                const t = normalize(nombreLibre);
                const qPref = query(
                  collection(db, "pacientes"),
                  orderBy("nombre_busqueda"),
                  startAt(t),
                  endAt(t + "\uf8ff"),
                  limit(1)
                );
                const s = await getDocs(qPref);
                if (!s.empty) {
                  const d = s.docs[0];
                  const x = d.data() || {};
                  encontrado = {
                    id: d.id,
                    ref: d.ref,
                    nombre:
                      x.nombreCompleto || x.paciente || [x.nombres, x.apellidos].filter(Boolean).join(" "),
                    cel: x.celularPaciente || x.celular || "",
                    tel: x.telefonoPaciente || x.telefono || "",
                  };
                }
              } catch {}

              if (encontrado) {
                pacienteId = encontrado.id;
                pacienteRef = encontrado.ref;
                pacienteNombre = encontrado.nombre || nombreLibre;
                celularParaCita = encontrado.cel || "";
                telefonoParaCita = encontrado.tel || "";
              } else {
                pacienteNombre = nombreLibre; // último fallback
              }
            }
          }
        }

        const telefonoFinal = (celularParaCita || telefonoParaCita || "").trim();
        if (!telefonoFinal) {
          alert("⚠️ Este paciente no tiene ningún teléfono registrado. Edita sus datos y agrega un número antes de guardar la cita.");
          return;
        }

        const nuevaCita = {
          paciente: pacienteNombre || "Paciente",
          pacienteId: pacienteId || null,

          // 🔗 Catálogos
          doctorId: doctorIdSel,
          doctor: doctorNombre || "Doctor",
          consultorioId: consultorioIdSel || "",
          consultorioNombre: consultorioNombre || "",
          sucursalId: sucursalIdSel || "",
          sucursal: sucursalNombre || "",

          // Compatibilidad con tus campos existentes
          espacio: consultorioNombre || "",
          fecha: fechaSeleccionada,
          horaInicio: horaSeleccionada,
          comentario: comentarioSel,
          estado: "En espera",
          creado: new Date().toISOString(),
          celularPaciente: celularParaCita || "",
          telefonoPaciente: telefonoParaCita || "",
        };

        const citaRef = await addDoc(collection(db, "citas"), nuevaCita);
        if (pacienteRef) await setDoc(pacienteRef, { citas: arrayUnion(citaRef.id) }, { merge: true });

        alert("✅ Cita registrada correctamente y vinculada al paciente.");
        modal.remove();
      } catch (err) {
        console.error("❌ Error al guardar cita:", err);
        alert("❌ Error al guardar la cita. Revisa la consola para más detalles.");
      }
    });
  };

  // ------------ Editar Cita ------------
  const handleEditCita = (cita) => {
    const modal = document.createElement("div");
    Object.assign(modal.style, {
      position: "fixed",
      top: "0",
      left: "0",
      width: "100%",
      height: "100%",
      background: "rgba(0,0,0,0.55)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: "9999",
    });

    const box = document.createElement("div");
    Object.assign(box.style, {
      background: "#fff",
      padding: "25px 30px",
      borderRadius: "14px",
      width: "520px",
      maxWidth: "95%",
      maxHeight: "95%",
      overflowY: "auto",
      boxShadow: "0 8px 30px rgba(0,0,0,0.3)",
      fontFamily: "Segoe UI, Roboto, sans-serif",
    });

    const fechaInicial =
      cita.raw?.fecha && typeof cita.raw.fecha === "string"
        ? cita.raw.fecha
        : toIsoDate(cita.fecha);

    const horaInicial = cita.raw?.horaInicio || cita.fecha.toTimeString().slice(0, 5);

    // Mantenemos inputs de texto para edición (compatibilidad con existentes)
    box.innerHTML = `
      <h2 style="margin-top:0;text-align:center;color:#0a86d8;font-weight:600;">✏️ Editar Cita</h2>
      <form id="formEditarCita" style="display:flex;flex-direction:column;gap:12px;margin-top:10px;">
        <label>Paciente</label>
        <input type="text" id="editPaciente" value="${cita.paciente || ""}" />

        <label>Doctor asignado</label>
        <input type="text" id="editDoctor" value="${cita.doctor || ""}" />

        <div style="display:flex;gap:8px;">
          <div style="flex:1;">
            <label>Fecha</label>
            <input type="date" id="editFecha" value="${fechaInicial}" />
          </div>
          <div style="flex:1;">
            <label>Hora</label>
            <input type="time" id="editHora" value="${horaInicial}" />
          </div>
        </div>

        <label>Espacio físico / Sala</label>
        <input type="text" id="editEspacio" value="${cita.espacio || ""}" />

        <label>Estado</label>
        <select id="editEstado" class="estado-select">
          <option value="En espera" ${cita.estado === "En espera" ? "selected" : ""}>En espera</option>
          <option value="En sala" ${cita.estado === "En sala" ? "selected" : ""}>En sala</option>
          <option value="Atendiendo" ${cita.estado === "Atendiendo" ? "selected" : ""}>Atendiendo</option>
          <option value="Finalizada" ${cita.estado === "Finalizada" ? "selected" : ""}>Finalizada</option>
          <option value="pendiente" ${cita.estado === "pendiente" ? "selected" : ""}>Pendiente</option>
          <option value="No asistió" ${cita.estado === "No asistió" ? "selected" : ""}>No asistió</option>
        </select>

        <label>Comentario</label>
        <textarea id="editComentario" rows="3">${cita.comentario || ""}</textarea>

        <div style="display:flex;justify-content:flex-end;gap:10px;margin-top:10px;">
          <button type="button" id="btnCancelarEdit" class="btn-cancelar">Cancelar</button>
          <button type="submit" class="btn-guardar">Guardar cambios</button>
        </div>
      </form>
    `;

    const style = document.createElement("style");
    style.textContent = `
      .btn-cancelar, .btn-guardar { padding: 8px 14px; border: none; border-radius: 6px; cursor: pointer; font-weight: 600; font-size: 14px; transition: .2s; }
      .btn-cancelar { background: #e0e0e0; color: #333; } .btn-cancelar:hover { background: #d5d5d5; }
      .btn-guardar { background: #0a86d8; color: white; } .btn-guardar:hover { background: #0669ac; }
      #formEditarCita input, #formEditarCita select, #formEditarCita textarea { width: 100%; padding: 8px 10px; border: 1px solid #ccc; border-radius: 6px; font-size: 14px; outline: none; }
      #formEditarCita input:focus, #formEditarCita select:focus, #formEditarCita textarea:focus { border-color: #0a86d8; box-shadow: 0 0 0 2px rgba(10,134,216,.2); }
    `;
    document.head.appendChild(style);

    modal.appendChild(box);
    document.body.appendChild(modal);

    box.querySelector("#btnCancelarEdit").addEventListener("click", () => modal.remove());

    const form = box.querySelector("#formEditarCita");
    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const paciente = form.querySelector("#editPaciente").value.trim();
      const doctor = form.querySelector("#editDoctor").value.trim();
      const fecha = form.querySelector("#editFecha").value;
      const hora = form.querySelector("#editHora").value;
      const espacio = form.querySelector("#editEspacio").value.trim();
      const estado = form.querySelector("#editEstado").value;
      const comentario = form.querySelector("#editComentario").value.trim();

      if (!paciente) return alert("⚠️ El nombre del paciente es obligatorio.");
      if (!fecha || !hora) return alert("⚠️ Debes indicar fecha y hora.");

      try {
        const citaRef = doc(db, "citas", cita.id);
        const updateData = { paciente, doctor, fecha, horaInicio: hora, espacio, estado, comentario };
        await updateDoc(citaRef, updateData);
        alert("✅ Cita actualizada correctamente.");
        modal.remove();
      } catch (err) {
        console.error("❌ Error al actualizar cita:", err);
        alert("❌ Error al actualizar la cita. Revisa la consola para más detalles.");
      }
    });
  };

  // ------------ Render fila (pantalla) ------------
  const renderRow = (cita) => {
    const fechaStr = cita.fecha.toLocaleDateString(browserLocale);
    const horaStr = cita.fecha.toLocaleTimeString(browserLocale, {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
    const fechaHoraDisplay = `${fechaStr} · ${horaStr}`;

    return (
      <tr
        key={cita.id}
        className="fade-in-row"
        onClick={() => handleEditCita(cita)}
        style={{ cursor: "pointer" }}
      >
        <td>{fechaHoraDisplay}</td>
        <td>{cita.paciente}</td>
        <td>{cita.doctor}</td>
        <td>{cita.espacio}</td>
        <td>{cita.comentario}</td>

        <td
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          <select
            className="estado-select"
            value={cita.estado}
            onChange={(e) => handleEstadoChange(cita.id, e.target.value)}
          >
            <option value="En espera">En espera</option>
            <option value="En sala">En sala</option>
            <option value="Atendiendo">Atendiendo</option>
            <option value="Finalizada">Finalizada</option>
            <option value="pendiente">Pendiente</option>
            <option value="No asistió">No asistió</option>
          </select>
        </td>

        <td
          className="acciones-cell"
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          {cita.telefono ? (
            <button
              type="button"
              className="btn-whatsapp"
              onClick={(e) => {
                e.stopPropagation();
                handleWhatsApp(cita.telefono, cita);
              }}
            >
              WhatsApp
            </button>
          ) : (
            <span className="acciones-texto">Sin celular</span>
          )}

          <button
            type="button"
            className="btn-delete"
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteCita(cita);
            }}
          >
            Eliminar
          </button>

          {cita.recordatorio && <span className="acciones-texto">{cita.recordatorio}</span>}
        </td>
      </tr>
    );
  };

  /* =========================
     JSX principal
     ========================= */
  return (
    <>
      {/* Barras superiores existentes */}
      <div className="odc-topbar-green" />
      <div className="odc-topbar-blue">Agenda</div>

      <section className="odc-agenda-root">
        <div className="odc-agenda-inner">
          {/* LEFT: calendario + filtros */}
          <aside className="odc-left" aria-label="Panel izquierdo - calendario y filtros">
            {/* Mini calendario */}
            <div className="odc-mini-calendar-card" role="region" aria-label="Mini calendario">
              <div className="mini-cal-header">
                <button className="cal-arrow" id="miniCalPrev" aria-label="Mes anterior" onClick={handleMiniPrev}>
                  ‹
                </button>
                <div id="miniCalMonthYear" aria-live="polite">
                  {miniMonthLabel}
                </div>
                <button className="cal-arrow" id="miniCalNext" aria-label="Mes siguiente" onClick={handleMiniNext}>
                  ›
                </button>
              </div>

              <table className="mini-month-table" aria-hidden="false">
                <thead>
                  <tr>
                    <th>Lu</th>
                    <th>Ma</th>
                    <th>Mi</th>
                    <th>Ju</th>
                    <th>Vi</th>
                    <th>Sa</th>
                    <th>Do</th>
                  </tr>
                </thead>
                <tbody id="miniCalendar">
                  {miniMonthMatrix.map((week, wi) => (
                    <tr key={wi}>
                      {week.map((day, di) => (
                        <td
                          key={di}
                          className={[
                            !day.isCurrentMonth ? "empty" : "",
                            day.isToday ? "today" : "",
                            day.isSelected ? "selected" : "",
                          ]
                            .filter(Boolean)
                            .join(" ")}
                          onClick={() => day.isCurrentMonth && handleMiniClick(day.date)}
                        >
                          {day.date.getDate()}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Filtros */}
            <div className="odc-filters-card" aria-label="Filtros de agenda">
              <label htmlFor="filterSucursal">Sucursal</label>
              <select id="filterSucursal" value={filterSucursal} onChange={(e) => setFilterSucursal(e.target.value)}>
                <option value="">— Todas —</option>
                {sucursalesOptions.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>

              <label htmlFor="filterDoctor">Doctores</label>
              <select id="filterDoctor" value={filterDoctor} onChange={(e) => setFilterDoctor(e.target.value)}>
                <option value="">— Todos —</option>
                {doctoresOptions.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
          </aside>

          {/* RIGHT: agenda */}
          <main className="odc-right" aria-label="Panel principal - agenda">
            {/* Header fijo con fecha alineada */}
            <div className="odc-header-bar" role="region" aria-label="Controles de la agenda"
              style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}
            >
              <div className="odc-header-left" style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                <h3 className="odc-title" style={{ marginRight: 8 }}>Agenda</h3>

                <div className="view-buttons" role="tablist" aria-label="Vistas" style={{ display: "flex", gap: 6 }}>
                  <button
                    className={`btn view ${viewMode === "day" ? "active" : ""}`}
                    data-view="day"
                    role="tab"
                    aria-selected={viewMode === "day"}
                    onClick={() => setViewMode("day")}
                  >
                    Día
                  </button>
                  <button
                    className={`btn view ${viewMode === "week" ? "active" : ""}`}
                    data-view="week"
                    role="tab"
                    aria-selected={viewMode === "week"}
                    onClick={() => setViewMode("week")}
                  >
                    Semana
                  </button>
                  <button
                    className={`btn view ${viewMode === "detail" ? "active" : ""}`}
                    data-view="detail"
                    role="tab"
                    aria-selected={viewMode === "detail"}
                    onClick={() => setViewMode("detail")}
                  >
                    Detalle
                  </button>
                </div>

                {/* FECHA */}
                <div className="date-nav" style={{ display: "flex", alignItems: "center", gap: 6, flex: "0 0 auto" }}>
                  <button className="btn icon" id="btnPrev" aria-label="Anterior" onClick={goPrev}>‹</button>
                  <button className="btn icon" id="btnNext" aria-label="Siguiente" onClick={goNext}>›</button>
                  <span id="currentDateDisplay" className="current-date" aria-live="polite" style={{ whiteSpace: "nowrap" }}>
                    {currentDateLabel}
                  </span>
                  <button id="btnHoy" className="btn small" onClick={goToday}>Hoy</button>
                </div>
              </div>

              <div className="odc-header-right" style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                <div className="right-actions" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <input
                    id="searchCitas"
                    placeholder="Buscar..."
                    className="search-input"
                    aria-label="Buscar citas"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <button id="btnNuevaCita" className="btn green" aria-label="Nueva cita" onClick={handleNuevaCita}>
                    + Nueva cita
                  </button>
                </div>
              </div>
            </div>

            {/* Contenido principal */}
            <div className="odc-content-card" role="region" aria-label="Contenido agenda">
              <div className="tools-row">
                <div className="tools-left">
                  <div id="ocupacionInfo" className="ocupacion-info">{ocupacionInfoText}</div>
                </div>

                <div className="tools-right">
                  <button id="btnPrint" className="btn" title="Imprimir agenda" onClick={handlePrint}>🖨️ Imprimir</button>
                  <button id="btnConfirmar" className="btn blue" title="Confirmar citas" onClick={handleConfirmar}>📧 Confirmar</button>
                  <button id="btnHoyCitas" className="btn" title="Ver citas de hoy" onClick={handleHoyCitas}>📅 Hoy</button>
                  <button id="btnExportar" className="btn" title="Exportar citas a CSV" onClick={handleExport}>📤 Exportar</button>
                </div>
              </div>

              {/* Tabla de citas */}
              <div className="table-wrap" role="region" aria-label="Lista de citas">
                <table className="appointments-table" aria-live="polite">
                  <thead>
                    <tr>
                      <th style={{ width: "180px" }}>Fecha / Hora</th>
                      <th>Paciente</th>
                      <th>Doctor</th>
                      <th>Espacio físico</th>
                      <th>Comentario</th>
                      <th style={{ width: "120px" }}>Estado</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody id="citasTbody">
                    {loading ? (
                      <tr><td colSpan={7} className="no-data">Cargando citas...</td></tr>
                    ) : filteredAppointments.length === 0 ? (
                      <tr><td colSpan={7} className="no-data">No hay citas registradas para este rango.</td></tr>
                    ) : (
                      filteredAppointments.map(renderRow)
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </main>
        </div>
      </section>
    </>
  );
}
