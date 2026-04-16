// src/modules/agenda/Agenda.jsx
// 🗓️ Agenda PRO OdontoCloud (vista Día / Semana / Detalle)

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
  deleteDoc, // 👈 para eliminar citas
} from "firebase/firestore";

// ------------ Utilidades de fechas ------------
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

// ------------ Componente principal ------------
export default function Agenda() {
  const [viewMode, setViewMode] = useState("day"); // "day" | "week" | "detail"
  const [selectedDate, setSelectedDate] = useState(todayDate());
  const [monthDate, setMonthDate] = useState(todayDate());

  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState([]);

  const [filterSucursal, setFilterSucursal] = useState("");
  const [filterDoctor, setFilterDoctor] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

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

          // 1) Hora de la cita (string). Si no viene, usamos "00:00"
          const horaRaw = data.horaInicio || data.hora || "00:00"; // "HH:MM"
          const [hStr = "0", mStr = "0"] = horaRaw.split(":");
          const h = parseInt(hStr, 10) || 0;
          const m = parseInt(mStr, 10) || 0;

          // 2) Normalizamos la fecha y le ponemos la hora
          let f;
          if (data.fecha && data.fecha.toDate) {
            // Timestamp de Firestore
            f = data.fecha.toDate();
            f.setHours(h, m, 0, 0);
          } else if (typeof data.fecha === "string") {
            // "YYYY-MM-DD" como fecha local
            const [year, month, day] = data.fecha.split("-");
            f = new Date(
              parseInt(year, 10),
              parseInt(month, 10) - 1,
              parseInt(day, 10),
              h,
              m,
              0,
              0
            );
          } else if (data.fecha instanceof Date) {
            f = new Date(data.fecha);
            f.setHours(h, m, 0, 0);
          } else {
            // fallback
            f = new Date();
            f.setHours(h, m, 0, 0);
          }

          // 3) Posibles nombres de documento y teléfono
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

          // 4) Objeto cita normalizado
          return {
            id: docu.id,
            raw: data,
            fecha: f, // incluye fecha + hora
            horaInicio: horaRaw,
            paciente: data.paciente || data.pacienteNombre || "Sin nombre",
            doctor: data.doctor || data.doctorNombre || "—",
            sucursal: data.sucursal || "",
            espacio: data.espacio || data.consultorio || "",
            comentario: data.comentario || "",
            estado: data.estado || "En espera",
            recordatorio: data.recordatorio || "",
            documento,
            telefono,
          };
        });

        // Rango según la vista
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
          // Detalle: 30 días atrás y 60 días adelante
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

  // ------------ Opciones de filtros ------------
  const sucursalesOptions = useMemo(() => {
    const s = new Set();
    appointments.forEach((c) => c.sucursal && s.add(c.sucursal));
    return Array.from(s);
  }, [appointments]);

  const doctoresOptions = useMemo(() => {
    const s = new Set();
    appointments.forEach((c) => c.doctor && s.add(c.doctor));
    return Array.from(s);
  }, [appointments]);

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

  // ------------ Info de ocupación ------------
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

  // ------------ Navegación fecha principal ------------
  const goPrev = () => {
    if (viewMode === "day") {
      setSelectedDate(addDays(selectedDate, -1));
    } else if (viewMode === "week") {
      setSelectedDate(addDays(selectedDate, -7));
    } else {
      setSelectedDate(addDays(selectedDate, -1));
    }
  };

  const goNext = () => {
    if (viewMode === "day") {
      setSelectedDate(addDays(selectedDate, 1));
    } else if (viewMode === "week") {
      setSelectedDate(addDays(selectedDate, 7));
    } else {
      setSelectedDate(addDays(selectedDate, 1));
    }
  };

  const goToday = () => {
    const t = todayDate();
    setSelectedDate(t);
    setMonthDate(t);
    setViewMode("day");
  };

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

  // ------------ Acciones de herramientas ------------
  const handlePrint = () => {
    window.print();
  };

  const handleConfirmar = () => {
    alert("Función de confirmar citas se integrará con n8n / correo.");
  };

  const handleHoyCitas = () => {
    goToday();
  };

  const handleExport = () => {
    if (filteredAppointments.length === 0) {
      alert("No hay citas para exportar.");
      return;
    }

    const header = [
      "Fecha",
      "Hora",
      "Paciente",
      "Doctor",
      "Sucursal",
      "Espacio",
      "Comentario",
      "Estado",
      "Recordatorio",
    ];

    const rows = filteredAppointments.map((c) => {
      const fechaStr = c.fecha.toLocaleDateString(browserLocale);
      const horaStr = c.fecha.toLocaleTimeString(browserLocale, {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
      return [
        fechaStr,
        horaStr,
        c.paciente,
        c.doctor,
        c.sucursal,
        c.espacio,
        (c.comentario || "").replace(/\r?\n/g, " "),
        c.estado,
        c.recordatorio,
      ];
    });

    const csvContent = [header, ...rows]
      .map((r) => r.map((x) => `"${x || ""}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "citas_odontocloud.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  // ------------ Cambiar estado de la cita ------------
  const handleEstadoChange = async (citaId, nuevoEstado) => {
    try {
      const ref = doc(db, "citas", citaId);
      await updateDoc(ref, { estado: nuevoEstado });
    } catch (err) {
      console.error("Error actualizando estado:", err);
      alert("No se pudo actualizar el estado de la cita.");
    }
  };

  // ------------ Enviar WhatsApp ------------
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

  // ------------ NUEVA CITA ------------
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
        <input
          type="text"
          id="buscarPaciente"
          placeholder="Buscar por nombre, apellido o documento..."
        />
        <small style="color:gray;">Si el paciente no existe, marca “Nuevo paciente” para registrarlo.</small>

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
        <input type="text" id="ncDoctor" placeholder="Doctor asignado" required />
        <input type="date" id="ncFecha" required value="${toIsoDate(
          selectedDate
        )}" />
        <input type="time" id="ncHora" required />
        <input type="text" id="ncEspacio" placeholder="Espacio físico / Sala" />
        <textarea id="ncComentario" placeholder="Comentario sobre la cita" rows="3"></textarea>

        <div style="display:flex;justify-content:flex-end;gap:10px;margin-top:10px;">
          <button type="button" id="btnCancelarModal" class="btn-cancelar">Cancelar</button>
          <button type="submit" class="btn-guardar">Guardar</button>
        </div>
      </form>
    `;

    const style = document.createElement("style");
    style.textContent = `
      .btn-cancelar, .btn-guardar {
        padding: 8px 14px;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        font-weight: 600;
        font-size: 14px;
        transition: 0.2s;
      }
      .btn-cancelar { background: #e0e0e0; color: #333; }
      .btn-cancelar:hover { background: #d5d5d5; }
      .btn-guardar { background: #0a86d8; color: white; }
      .btn-guardar:hover { background: #0669ac; }
      input, select, textarea {
        width: 100%;
        padding: 8px 10px;
        border: 1px solid #ccc;
        border-radius: 6px;
        font-size: 14px;
        outline: none;
      }
      input:focus, select:focus, textarea:focus {
        border-color: #0a86d8;
        box-shadow: 0 0 0 2px rgba(10,134,216,0.2);
      }
    `;
    document.head.appendChild(style);

    modal.appendChild(box);
    document.body.appendChild(modal);

    const chkNuevo = box.querySelector("#esNuevoPaciente");
    const camposNuevo = box.querySelector("#nuevoPacienteCampos");
    chkNuevo.addEventListener("change", () => {
      camposNuevo.style.display = chkNuevo.checked ? "flex" : "none";
    });

    box
      .querySelector("#btnCancelarModal")
      .addEventListener("click", () => modal.remove());

    const form = box.querySelector("#formNuevaCita");

    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const esNuevo = chkNuevo.checked;
      const nombrePaciente = esNuevo
        ? `${form.querySelector("#npNombre").value.trim()} ${form
            .querySelector("#npApellido")
            .value.trim()}`.trim()
        : form.querySelector("#buscarPaciente").value.trim();

      if (!nombrePaciente) {
        alert("⚠️ Por favor, ingresa o selecciona un paciente.");
        return;
      }

      try {
        let pacienteId = null;
        let pacienteRef = null;

        // siempre trabajamos con estos 2
        let celularParaCita = "";
        let telefonoParaCita = "";

        if (esNuevo) {
          const docPaciente = form.querySelector("#npDocumento").value.trim();
          const celularNuevo = form.querySelector("#npCelular").value.trim();
          const telefonoNuevo = form.querySelector("#npTelefono").value.trim();

          // ✅ TELÉFONO OBLIGATORIO PARA NUEVO PACIENTE
          if (!celularNuevo && !telefonoNuevo) {
            alert(
              "⚠️ Debes registrar al menos un teléfono (celular o fijo) del paciente o de un acudiente."
            );
            return;
          }

          pacienteId =
            docPaciente || nombrePaciente.toLowerCase().replace(/\s+/g, "_");
          pacienteRef = doc(db, "pacientes", pacienteId);

          const pacienteSnap = await getDoc(pacienteRef);
          if (!pacienteSnap.exists()) {
            const pacienteData = {
              nombre: form.querySelector("#npNombre").value.trim(),
              apellido: form.querySelector("#npApellido").value.trim(),
              tipoDocumento: form.querySelector("#npTipoDocumento").value,
              documento: docPaciente,
              correo: form.querySelector("#npCorreo").value.trim(),
              indicativo: form.querySelector("#npIndicativo").value,
              celular: celularNuevo,
              telefono: telefonoNuevo,
              nacimiento: form.querySelector("#npNacimiento").value,
              sexo: form.querySelector("#npSexo").value,
              comentario: form.querySelector("#npComentario").value.trim(),
              creado: new Date().toISOString(),
              activo: true,
              citas: [],
            };
            await setDoc(pacienteRef, pacienteData);
          }

          celularParaCita = celularNuevo;
          telefonoParaCita = telefonoNuevo;
        } else {
          const nombreBuscar = nombrePaciente.toLowerCase();
          const docBuscar = form.querySelector("#buscarPaciente").value.trim();

          const q1 = query(
            collection(db, "pacientes"),
            where("nombre", "==", nombreBuscar)
          );
          const q2 = query(
            collection(db, "pacientes"),
            where("documento", "==", docBuscar)
          );

          const [snapNombre, snapDoc] = await Promise.all([
            getDocs(q1),
            getDocs(q2),
          ]);
          const snap = !snapDoc.empty ? snapDoc : snapNombre;

          if (!snap.empty) {
            pacienteRef = snap.docs[0].ref;
            pacienteId = snap.docs[0].id;

            const pacData = snap.docs[0].data() || {};
            celularParaCita =
              pacData.celularPaciente ||
              pacData.celular ||
              pacData.telefonoPaciente ||
              "";
            telefonoParaCita =
              pacData.telefono ||
              pacData.telefonoPaciente ||
              pacData.celular ||
              "";
          } else {
            console.warn(
              "⚠️ No se encontró el paciente, se guardará la cita sin ID asociado."
            );
          }
        }

        // 🔒 VALIDACIÓN GLOBAL: NUNCA GUARDAR CITA SIN TELÉFONO
        const telefonoFinal = (celularParaCita || telefonoParaCita || "").trim();
        if (!telefonoFinal) {
          alert(
            "⚠️ Este paciente no tiene ningún teléfono registrado. Edita sus datos y agrega un número antes de guardar la cita."
          );
          return;
        }

        const fechaSeleccionada = form.querySelector("#ncFecha").value;
        const horaSeleccionada = form.querySelector("#ncHora").value;

        if (!fechaSeleccionada || !horaSeleccionada) {
          alert("⚠️ Debes seleccionar fecha y hora para la cita.");
          return;
        }

        const nuevaCita = {
          paciente: nombrePaciente,
          pacienteId: pacienteId || null,
          doctor: form.querySelector("#ncDoctor").value.trim(),
          fecha: fechaSeleccionada, // string YYYY-MM-DD
          horaInicio: horaSeleccionada,
          espacio: form.querySelector("#ncEspacio").value.trim(),
          comentario: form.querySelector("#ncComentario").value.trim(),
          estado: "En espera",
          creado: new Date().toISOString(),
          // guardamos también en la cita
          celularPaciente: celularParaCita || "",
          telefonoPaciente: telefonoParaCita || "",
        };

        const citaRef = await addDoc(collection(db, "citas"), nuevaCita);

        if (pacienteRef) {
          await setDoc(
            pacienteRef,
            { citas: arrayUnion(citaRef.id) },
            { merge: true }
          );
        }

        alert("✅ Cita registrada correctamente y vinculada al paciente.");
        modal.remove();
      } catch (err) {
        console.error("❌ Error al guardar cita:", err);
        alert("❌ Error al guardar la cita. Revisa la consola para más detalles.");
      }
    });
  };

  // ------------ EDITAR CITA ------------
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

    const horaInicial =
      cita.raw?.horaInicio || cita.fecha.toTimeString().slice(0, 5);

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
          <option value="En espera" ${
            cita.estado === "En espera" ? "selected" : ""
          }>En espera</option>
          <option value="En sala" ${
            cita.estado === "En sala" ? "selected" : ""
          }>En sala</option>
          <option value="Atendiendo" ${
            cita.estado === "Atendiendo" ? "selected" : ""
          }>Atendiendo</option>
          <option value="Finalizada" ${
            cita.estado === "Finalizada" ? "selected" : ""
          }>Finalizada</option>
          <option value="pendiente" ${
            cita.estado === "pendiente" ? "selected" : ""
          }>Pendiente</option>
          <option value="No asistió" ${
            cita.estado === "No asistió" ? "selected" : ""
          }>No asistió</option>
        </select>

        <label>Comentario</label>
        <textarea id="editComentario" rows="3">${
          cita.comentario || ""
        }</textarea>

        <div style="display:flex;justify-content:flex-end;gap:10px;margin-top:10px;">
          <button type="button" id="btnCancelarEdit" class="btn-cancelar">Cancelar</button>
          <button type="submit" class="btn-guardar">Guardar cambios</button>
        </div>
      </form>
    `;

    const style = document.createElement("style");
    style.textContent = `
      .btn-cancelar, .btn-guardar {
        padding: 8px 14px;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        font-weight: 600;
        font-size: 14px;
        transition: 0.2s;
      }
      .btn-cancelar { background: #e0e0e0; color: #333; }
      .btn-cancelar:hover { background: #d5d5d5; }
      .btn-guardar { background: #0a86d8; color: white; }
      .btn-guardar:hover { background: #0669ac; }
      #formEditarCita input,
      #formEditarCita select,
      #formEditarCita textarea {
        width: 100%;
        padding: 8px 10px;
        border: 1px solid #ccc;
        border-radius: 6px;
        font-size: 14px;
        outline: none;
      }
      #formEditarCita input:focus,
      #formEditarCita select:focus,
      #formEditarCita textarea:focus {
        border-color: #0a86d8;
        box-shadow: 0 0 0 2px rgba(10,134,216,0.2);
      }
    `;
    document.head.appendChild(style);

    modal.appendChild(box);
    document.body.appendChild(modal);

    box
      .querySelector("#btnCancelarEdit")
      .addEventListener("click", () => modal.remove());

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

      if (!paciente) {
        alert("⚠️ El nombre del paciente es obligatorio.");
        return;
      }

      if (!fecha || !hora) {
        alert("⚠️ Debes indicar fecha y hora.");
        return;
      }

      try {
        const citaRef = doc(db, "citas", cita.id);

        const updateData = {
          paciente,
          doctor,
          fecha,
          horaInicio: hora,
          espacio,
          estado,
          comentario,
        };

        await updateDoc(citaRef, updateData);

        alert("✅ Cita actualizada correctamente.");
        modal.remove();
      } catch (err) {
        console.error("❌ Error al actualizar cita:", err);
        alert(
          "❌ Error al actualizar la cita. Revisa la consola para más detalles."
        );
      }
    });
  };

  // ------------ Render fila de citas ------------
  const renderRow = (cita) => {
    const fechaStr = cita.fecha.toLocaleDateString(browserLocale);
    const horaStr = cita.fecha.toLocaleTimeString(browserLocale, {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

    // 👉 Siempre mostramos fecha + hora
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

        {/* Estado editable sin abrir el modal */}
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

        {/* Recordatorio + WhatsApp + Eliminar */}
        <td
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
            <span>Sin celular</span>
          )}

          <button
            type="button"
            className="btn"
            style={{
              marginLeft: 6,
              padding: "4px 8px",
              backgroundColor: "#ff4d4f",
              color: "#fff",
              borderRadius: 4,
              border: "none",
              fontSize: 12,
            }}
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteCita(cita);
            }}
          >
            Eliminar
          </button>

          {cita.recordatorio && (
            <span style={{ marginLeft: 8 }}>{cita.recordatorio}</span>
          )}
        </td>
      </tr>
    );
  };

  // ------------ JSX principal ------------
  return (
    <>
      <div className="odc-topbar-green" />
      <div className="odc-topbar-blue">Agenda</div>

      <section className="odc-agenda-root">
        <div className="odc-agenda-inner">
          {/* LEFT: calendario + filtros */}
          <aside
            className="odc-left"
            aria-label="Panel izquierdo - calendario y filtros"
          >
            {/* Mini calendario */}
            <div
              className="odc-mini-calendar-card"
              role="region"
              aria-label="Mini calendario"
            >
              <div className="mini-cal-header">
                <button
                  className="cal-arrow"
                  id="miniCalPrev"
                  aria-label="Mes anterior"
                  onClick={handleMiniPrev}
                >
                  ‹
                </button>
                <div id="miniCalMonthYear" aria-live="polite">
                  {miniMonthLabel}
                </div>
                <button
                  className="cal-arrow"
                  id="miniCalNext"
                  aria-label="Mes siguiente"
                  onClick={handleMiniNext}
                >
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
                          onClick={() =>
                            day.isCurrentMonth && handleMiniClick(day.date)
                          }
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
              <select
                id="filterSucursal"
                value={filterSucursal}
                onChange={(e) => setFilterSucursal(e.target.value)}
              >
                <option value="">— Todas —</option>
                {sucursalesOptions.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>

              <label htmlFor="filterDoctor">Doctores</label>
              <select
                id="filterDoctor"
                value={filterDoctor}
                onChange={(e) => setFilterDoctor(e.target.value)}
              >
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
            {/* Header */}
            <div
              className="odc-header-bar"
              role="region"
              aria-label="Controles de la agenda"
            >
              <div className="odc-header-left">
                <h3 className="odc-title">Agenda</h3>
                <div className="view-buttons" role="tablist" aria-label="Vistas">
                  <button
                    className={`btn view ${
                      viewMode === "day" ? "active" : ""
                    }`}
                    data-view="day"
                    role="tab"
                    aria-selected={viewMode === "day"}
                    onClick={() => setViewMode("day")}
                  >
                    Día
                  </button>
                  <button
                    className={`btn view ${
                      viewMode === "week" ? "active" : ""
                    }`}
                    data-view="week"
                    role="tab"
                    aria-selected={viewMode === "week"}
                    onClick={() => setViewMode("week")}
                  >
                    Semana
                  </button>
                  <button
                    className={`btn view ${
                      viewMode === "detail" ? "active" : ""
                    }`}
                    data-view="detail"
                    role="tab"
                    aria-selected={viewMode === "detail"}
                    onClick={() => setViewMode("detail")}
                  >
                    Detalle
                  </button>
                </div>
              </div>

              <div className="odc-header-right">
                <div className="date-nav">
                  <button
                    className="btn icon"
                    id="btnPrev"
                    aria-label="Anterior"
                    onClick={goPrev}
                  >
                    ‹
                  </button>
                  <button
                    className="btn icon"
                    id="btnNext"
                    aria-label="Siguiente"
                    onClick={goNext}
                  >
                    ›
                  </button>
                  <span
                    id="currentDateDisplay"
                    className="current-date"
                    aria-live="polite"
                  >
                    {currentDateLabel}
                  </span>
                  <button id="btnHoy" className="btn small" onClick={goToday}>
                    Hoy
                  </button>
                </div>

                <div className="right-actions">
                  <input
                    id="searchCitas"
                    placeholder="Buscar..."
                    className="search-input"
                    aria-label="Buscar citas"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <button
                    id="btnNuevaCita"
                    className="btn green"
                    aria-label="Nueva cita"
                    onClick={handleNuevaCita}
                  >
                    + Nueva cita
                  </button>
                </div>
              </div>
            </div>

            {/* Contenido principal */}
            <div
              className="odc-content-card"
              role="region"
              aria-label="Contenido agenda"
            >
              <div className="tools-row">
                <div className="tools-left">
                  <div id="ocupacionInfo" className="ocupacion-info">
                    {ocupacionInfoText}
                  </div>
                </div>

                <div className="tools-right">
                  <button
                    id="btnPrint"
                    className="btn"
                    title="Imprimir agenda"
                    onClick={handlePrint}
                  >
                    🖨️ Imprimir
                  </button>

                  <button
                    id="btnConfirmar"
                    className="btn blue"
                    title="Confirmar citas"
                    onClick={handleConfirmar}
                  >
                    📧 Confirmar
                  </button>

                  <button
                    id="btnHoyCitas"
                    className="btn"
                    title="Ver citas de hoy"
                    onClick={handleHoyCitas}
                  >
                    📅 Hoy
                  </button>

                  <button
                    id="btnExportar"
                    className="btn"
                    title="Exportar citas a CSV"
                    onClick={handleExport}
                  >
                    📤 Exportar
                  </button>
                </div>
              </div>

              {/* Tabla de citas */}
              <div
                className="table-wrap"
                role="region"
                aria-label="Lista de citas"
              >
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
                      <tr>
                        <td colSpan={7} className="no-data">
                          Cargando citas...
                        </td>
                      </tr>
                    ) : filteredAppointments.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="no-data">
                          No hay citas registradas para este rango.
                        </td>
                      </tr>
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
