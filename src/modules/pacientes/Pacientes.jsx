import React, { useEffect, useMemo, useState, useRef } from "react";
import "./pacientes.css";
import { useNavigate, useLocation } from "react-router-dom";

import { db } from "../../firebase/firebaseConfig";
import {
  collection,
  getDocs,
  setDoc,
  getDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
  serverTimestamp,
  limit,
  startAfter,
  onSnapshot,
  updateDoc,
  where,
} from "firebase/firestore";

import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
  listAll,
  deleteObject,
} from "firebase/storage";

/* =====================================================================
   Config de rutas (ajústalas si en tu app son diferentes)
   ===================================================================== */
const ROUTES = {
  caja: "caja",
  pagos: "facturacion/pagos",
  facturas: "facturacion/facturas",
};

/* =====================================================================
   Utilidades
   ===================================================================== */
const browserLocale =
  typeof navigator !== "undefined" && navigator.language?.startsWith("es")
    ? "es-ES"
    : "en-US";

const COUNTRIES = [
  "Colombia","Argentina","Bolivia","Chile","Costa Rica","Cuba","Ecuador","El Salvador",
  "España","Guatemala","Honduras","México","Nicaragua","Panamá","Paraguay","Perú",
  "Puerto Rico","República Dominicana","Uruguay","Venezuela","Estados Unidos","Canadá"
];

const CITIES_BY_COUNTRY = {
  Colombia: ["Bogotá","Medellín","Cali","Barranquilla","Cartagena","Cúcuta","Bucaramanga","Pereira","Santa Marta","Ibagué"],
  México: ["Ciudad de México","Guadalajara","Monterrey","Puebla","Querétaro","Tijuana","Mérida","León"],
  Perú: ["Lima","Arequipa","Trujillo","Chiclayo","Cusco","Piura"],
  Chile: ["Santiago","Valparaíso","Concepción","La Serena","Antofagasta"],
  Argentina: ["Buenos Aires","Córdoba","Rosario","Mendoza","La Plata"],
  España: ["Madrid","Barcelona","Valencia","Sevilla","Zaragoza","Bilbao"],
  "Estados Unidos": ["Miami","New York","Los Ángeles","Houston","Chicago"],
  Ecuador: ["Quito","Guayaquil","Cuenca","Manta"],
  Venezuela: ["Caracas","Maracaibo","Valencia","Barquisimeto","Maracay"],
};

const calcAge = (yyyyMmDd) => {
  if (!yyyyMmDd) return "";
  const [y, m, d] = yyyyMmDd.split("-").map((x) => parseInt(x, 10));
  const birth = new Date(y, (m || 1) - 1, d || 1);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const mo = today.getMonth() - birth.getMonth();
  if (mo < 0 || (mo === 0 && today.getDate() < birth.getDate())) age--;
  return isNaN(age) ? "" : String(age);
};

async function compressImage(file, { maxW = 900, maxH = 900, quality = 0.82 } = {}) {
  if (!file || !file.type?.startsWith("image/")) return file;
  const img = await new Promise((res, rej) => {
    const i = new Image();
    i.onload = () => res(i);
    i.onerror = rej;
    i.src = URL.createObjectURL(file);
  });

  let { width, height } = img;
  const ratio = Math.min(maxW / width, maxH / height, 1);
  width = Math.round(width * ratio);
  height = Math.round(height * ratio);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(img, 0, 0, width, height);

  const blob = await new Promise((res) => canvas.toBlob(res, "image/jpeg", quality));
  const outFile = new File([blob], (file.name || "foto.jpg").replace(/\.[^.]+$/, ".jpg"), {
    type: "image/jpeg",
    lastModified: Date.now(),
  });

  URL.revokeObjectURL(img.src);
  return outFile;
}

/* ===== Normalización / índice de búsqueda ===== */
const normalize = (s) =>
  (s || "")
    .toString()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim();

const makeSearchIndex = (f) =>
  normalize(
    [
      f.nombres,
      f.apellidos,
      f.nombreCompleto,
      f.nroDocumento,
      f.celular,
      f.email,
    ].filter(Boolean).join(" ")
  );

/* =====================================================================
   Estado inicial
   ===================================================================== */
const INITIAL_FORM = {
  // Identificación
  tipoDocumento: "",
  nroDocumento: "",
  nroHistoria: "",
  nombres: "",
  apellidos: "",
  nombreCompleto: "",
  sexo: "",
  estadoCivil: "",
  paisNacimiento: "",
  ciudadNacimiento: "",
  fechaIngreso: "",
  fechaNacimiento: "",
  edad: "",
  paisDomicilio: "",
  ciudadDomicilio: "",
  barrio: "",
  lugarResidencia: "",
  estrato: "",
  zonaResidencial: "",
  esExtranjero: false,
  permitePublicidad: false,

  // Contacto
  celular: "",
  telDomicilio: "",
  telOficina: "",
  extension: "",
  email: "",
  ocupacion: "",

  // Facturación / Responsable
  nombreResponsable: "",
  parentesco: "",
  celularResponsable: "",
  telefonoResponsable: "",
  emailResponsable: "",

  // Acompañante
  nombreAcompanante: "",
  telefonoAcompanante: "",

  // Mercadeo
  convenioBeneficio: "",
  comoConocio: "",
  campania: "",
  remitidoPor: "",
  asesorComercial: "",

  // EPS
  tipoVinculacion: "",
  nombreEps: "",
  polizaSalud: "",

  // Doctor
  doctor: "",

  // Notas
  notas: "",

  // Multimedia / Clínico / CRM / Facturación
  rxImagenes: [],                    // [{url, name, size, type, created, path}]
  historiaClinica: {                 // editable
    antecedentes: "",
    alergias: "",
    medicamentos: "",
    motivoConsulta: "",
    notas: "",
  },
  odontograma: [],                   // placeholder
  periodontograma: [],               // placeholder
  presupuestos: [],                  // [{id, titulo, costo, estado}]
  evoluciones: [],                   // [{id, fechaISO, nota}]
  facturacion: { saldoFavor: 0, saldoCredito: 0 },

  // Foto
  fotoUrl: "",
  // Estado
  activo: true,
};

const PAGE_SIZE = 20;

/* =====================================================================
   Hooks auxiliares (finanzas y citas)
   ===================================================================== */

// Suma números seguros
const s = (n) => Number(n || 0);

// Devuelve { facturas[], pagos[], totales }
function useFinancials(patientId) {
  const [loading, setLoading] = useState(false);
  const [facturas, setFacturas] = useState([]);
  const [pagos, setPagos] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;
    const run = async () => {
      if (!patientId) { setFacturas([]); setPagos([]); return; }
      setLoading(true); setError("");
      try {
        // FACTURAS
        let qF = query(
          collection(db, "facturas"),
          where("patientId", "==", patientId),
          orderBy("fechaISO", "desc")
        );
        const snapF = await getDocs(qF);
        const rowsF = snapF.docs.map((d) => ({ id: d.id, ...d.data() }));
        const normF = rowsF.map((f) => ({
          ...f,
          total: s(f.total ?? f.valor ?? f.montoTotal),
          estado: (f.estado || "pendiente").toLowerCase(),
          fechaISO: f.fechaISO || f.fecha || null,
        }));
        // PAGOS
        let qP = query(
          collection(db, "pagos"),
          where("patientId", "==", patientId),
          orderBy("fechaISO", "desc")
        );
        const snapP = await getDocs(qP);
        const rowsP = snapP.docs.map((d) => ({ id: d.id, ...d.data() }));
        const normP = rowsP.map((p) => ({
          ...p,
          monto: s(p.monto ?? p.valor ?? p.total),
          fechaISO: p.fechaISO || p.fecha || null,
          medio: p.medio || p.metodo || "—",
        }));

        if (!alive) return;
        setFacturas(normF);
        setPagos(normP);
      } catch (e) {
        console.warn("Finanzas: no se pudo leer colecciones. Continúo solo con saldos del paciente.", e);
        if (alive) setError("No se pudieron leer facturas/pagos.");
      } finally {
        alive && setLoading(false);
      }
    };
    run();
    return () => { alive = false; };
  }, [patientId]);

  const totalFacturado = facturas.reduce((acc, f) => acc + s(f.total), 0);
  const totalPagado = pagos.reduce((acc, p) => acc + s(p.monto), 0);

  const facturasPagadas = facturas.filter((f) => ["pagada","pagado","paid"].includes((f.estado||"").toLowerCase()));
  const facturasPendientes = facturas.filter((f) => ["pendiente","abierta","open","deuda"].includes((f.estado||"").toLowerCase()));

  const totalFacturasPagadas = facturasPagadas.reduce((acc, f) => acc + s(f.total), 0);
  const totalFacturasPendientes = facturasPendientes.reduce((acc, f) => acc + s(f.total), 0);

  const result = {
    loading, error,
    facturas, pagos,
    totalFacturado, totalPagado, totalFacturasPagadas, totalFacturasPendientes
  };
  return result;
}

// Citas: tolerante a patientId y pacienteId
function useAppointments(patientId) {
  const [loading, setLoading] = useState(false);
  const [citas, setCitas] = useState([]);

  useEffect(() => {
    let alive = true;
    const fetchCitas = async () => {
      if (!patientId) { setCitas([]); return; }
      setLoading(true);
      try {
        // 1) intenta con patientId
        const q1 = query(
          collection(db, "citas"),
          where("patientId", "==", patientId),
          orderBy("fechaISO", "desc")
        );
        const s1 = await getDocs(q1);
        let rows = s1.docs.map((d) => ({ id: d.id, ...d.data() }));
        // 2) si nada, intenta con pacienteId
        if (rows.length === 0) {
          const q2 = query(
            collection(db, "citas"),
            where("pacienteId", "==", patientId),
            orderBy("fechaISO", "desc")
          );
          const s2 = await getDocs(q2);
          rows = s2.docs.map((d) => ({ id: d.id, ...d.data() }));
        }
        if (alive) setCitas(rows);
      } catch (e) {
        console.warn("No se pudieron leer citas:", e);
        alive && setCitas([]);
      } finally {
        alive && setLoading(false);
      }
    };
    fetchCitas();
    return () => { alive = false; };
  }, [patientId]);

  return { loading, citas };
}

/* =====================================================================
   Componente principal
   ===================================================================== */
export default function Pacientes() {
  const nav = useNavigate();
  const location = useLocation();

  // === Base de la app
  const appBase = React.useMemo(() => {
    const segs = location.pathname.split("/").filter(Boolean);
    const cutAt = segs.findIndex((s) =>
      ["pacientes", "agenda", "caja", "facturacion", "config", "reportes", "software"].includes(s)
    );
    const baseSegs = segs.slice(0, cutAt >= 0 ? cutAt : segs.length);
    const base = "/" + baseSegs.join("/");
    return base === "/" ? "" : base;
  }, [location.pathname]);

  /** Navegación ABSOLUTA segura */
  const navAbs = (subpath) => {
    const clean = String(subpath || "").replace(/^\//, "");
    const prefix = appBase ? `${appBase}/` : "/";
    nav(`${prefix}${clean}`);
  };

  /** Construye ruta + querystring */
  const buildUrl = (path, params) => {
    const clean = String(path || "").replace(/^\//, "");
    const qs = params ? new URLSearchParams(params).toString() : "";
    const prefix = appBase ? `${appBase}/` : "/";
    return `${prefix}${clean}${qs ? `?${qs}` : ""}`;
  };

  const [loading, setLoading] = useState(true);
  const [pacientes, setPacientes] = useState([]);
  const [term, setTerm] = useState("");

  const [lastDocSnap, setLastDocSnap] = useState(null);
  const [hasMore, setHasMore] = useState(true);

  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Ficha
  const [viewing, setViewing] = useState(null);   // snapshot live
  const unsubRef = useRef(null);
  const [activeTab, setActiveTab] = useState("datos"); // tabs en ficha

  // Form
  const [form, setForm] = useState(INITIAL_FORM);
  const [fotoFile, setFotoFile] = useState(null);
  const [fotoPreview, setFotoPreview] = useState("");

  const [epsList, setEpsList] = useState([]);

  // RX upload state + input ref
  const [rxUploading, setRxUploading] = useState(false);
  const rxInputRef = useRef(null);

  const ciudadesDisponibles = useMemo(
    () => CITIES_BY_COUNTRY[form.paisNacimiento] || [],
    [form.paisNacimiento]
  );

  /* =================== Boot =================== */
  useEffect(() => {
    const boot = async () => {
      setLoading(true);
      try {
        const snapEps = await getDocs(collection(db, "eps"));
        const eps = snapEps.docs.map((d) => d.data()?.nombre).filter(Boolean);
        const uniqueByLower = Array.from(
          new Map(eps.map((n) => [String(n).toLowerCase(), n])).values()
        ).sort((a, b) => a.localeCompare(b, "es"));
        setEpsList(uniqueByLower);
        await fetchPage(true);
      } catch (e) {
        console.error(e);
        alert("No se pudieron cargar pacientes/EPS.");
      } finally {
        setLoading(false);
      }
    };
    boot();
    return () => {
      if (unsubRef.current) { unsubRef.current(); unsubRef.current = null; }
    };
  }, []);

  /* =================== Sync derivados =================== */
  useEffect(() => {
    setForm((f) => ({ ...f, nombreCompleto: `${f.nombres} ${f.apellidos}`.trim() }));
  }, [form.nombres, form.apellidos]);

  useEffect(() => {
    setForm((f) => ({ ...f, nroHistoria: f.nroDocumento }));
  }, [form.nroDocumento]);

  useEffect(() => {
    setForm((f) => ({ ...f, edad: calcAge(f.fechaNacimiento) }));
  }, [form.fechaNacimiento]);

  useEffect(() => {
    const now = new Date();
    const fmt =
      now.toLocaleDateString(browserLocale) +
      " - " +
      now.toLocaleTimeString(browserLocale, { hour: "2-digit", minute: "2-digit", hour12: true });
    setForm((f) => ({ ...f, fechaIngreso: fmt }));
  }, []);

  const handleChange = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const clearForm = () => {
    setForm(INITIAL_FORM);
    const now = new Date();
    const fmt =
      now.toLocaleDateString(browserLocale) +
      " - " +
      now.toLocaleTimeString(browserLocale, { hour: "2-digit", minute: "2-digit", hour12: true });
    setForm((f) => ({ ...f, fechaIngreso: fmt }));
    setFotoFile(null);
    setFotoPreview("");
    setEditingId(null);
  };

  const onFotoChange = async (file) => {
    if (!file) { setFotoFile(null); setFotoPreview(""); return; }
    try {
      const compressed = await compressImage(file, { maxW: 900, maxH: 900, quality: 0.82 });
      setFotoFile(compressed);
      const reader = new FileReader();
      reader.onload = (ev) => setFotoPreview(ev.target.result);
      reader.readAsDataURL(compressed);
    } catch {
      setFotoFile(file);
      const reader = new FileReader();
      reader.onload = (ev) => setFotoPreview(ev.target.result);
      reader.readAsDataURL(file);
    }
  };

  /* =================== Paginación =================== */
  const fetchPage = async (first = false) => {
    setLoading(true);
    try {
      let qPac;
      if (first || !lastDocSnap) {
        qPac = query(collection(db, "pacientes"), orderBy("creado", "desc"), limit(PAGE_SIZE));
      } else {
        qPac = query(
          collection(db, "pacientes"),
          orderBy("creado", "desc"),
          startAfter(lastDocSnap),
          limit(PAGE_SIZE)
        );
      }
      const snap = await getDocs(qPac);
      const rows = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      if (first) setPacientes(rows);
      else setPacientes((prev) => [...prev, ...rows]);
      setLastDocSnap(snap.docs[snap.docs.length - 1] || null);
      setHasMore(snap.size === PAGE_SIZE);
    } catch (e) {
      console.error(e);
      alert("No se pudo cargar pacientes.");
    } finally {
      setLoading(false);
    }
  };

  /* =================== Guardar (crear/editar) =================== */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.nroDocumento.trim()) return alert("El número de documento es obligatorio.");
    if (!form.nombres.trim()) return alert("Los nombres son obligatorios.");
    if (!form.apellidos.trim()) return alert("Los apellidos son obligatorios.");
    if (!form.sexo.trim()) return alert("El sexo es obligatorio.");
    if (!form.fechaNacimiento.trim()) return alert("La fecha de nacimiento es obligatoria.");
    if (!form.celular.trim()) return alert("El celular es obligatorio.");
    if (!form.email.trim()) return alert("El correo electrónico es obligatorio.");
    if (!form.tipoVinculacion.trim()) return alert("El tipo de vinculación es obligatorio.");
    if (!form.nombreEps.trim()) return alert("El nombre de la EPS es obligatorio.");

    try {
      const id = form.nroDocumento.trim();

      if (!editingId) {
        const exists = await getDoc(doc(db, "pacientes", id));
        if (exists.exists()) return alert("Ya existe un paciente con ese número de documento.");
      }

      // EPS nueva
      const epsName = (form.nombreEps || "").trim();
      const existsCI = epsList.map((x) => x.toLowerCase()).includes(epsName.toLowerCase());
      if (epsName && !existsCI) {
        const addIt = window.confirm(
          `La EPS "${epsName}" no existe. ¿Deseas guardarla para futuras selecciones?`
        );
        if (addIt) {
          const idEps = epsName.toLowerCase().replace(/\s+/g, "_");
          await setDoc(
            doc(db, "eps", idEps),
            { nombre: epsName, nombreLower: epsName.toLowerCase(), creado: serverTimestamp() },
            { merge: true }
          );
        }
      }

      // Foto
      let fotoUrlSubida = form.fotoUrl || "";
      let uploadedPath = "";
      if (fotoFile) {
        try {
          const storage = getStorage();
          const safeName = (fotoFile.name || "foto.jpg").replace(/\s+/g, "_");
          uploadedPath = `pacientes/${id}/${Date.now()}_${safeName}`;
          const storageRef = ref(storage, uploadedPath);
          const metadata = { contentType: fotoFile.type || "image/jpeg", cacheControl: "public, max-age=86400" };
          await uploadBytes(storageRef, fotoFile, metadata);
          fotoUrlSubida = await getDownloadURL(storageRef);
        } catch (stgErr) {
          console.error("Foto (warning):", stgErr);
        }
      }

      // Índices y timestamps
      const creadoPrev = form.creado || null;
      const createdStamp = editingId ? (creadoPrev || serverTimestamp()) : serverTimestamp();

      const payload = {
        ...form,
        fotoUrl: fotoUrlSubida,

        // índices y normalizados
        nombre_busqueda: makeSearchIndex({ ...form, fotoUrl: fotoUrlSubida }),
        nombresLower: normalize(form.nombres),
        apellidosLower: normalize(form.apellidos),
        documentoLower: normalize(form.nroDocumento),
        emailLower: normalize(form.email),

        // timestamps
        creado: createdStamp,
        createdAt: createdStamp,
        actualizado: serverTimestamp(),
        updatedAt: serverTimestamp(),

        // alias/compatibilidad
        activo: form.activo ?? true,
        celularPaciente: form.celular,
        telefonoPaciente: form.telDomicilio || "",
        documento: form.nroDocumento,
        paciente: form.nombreCompleto,
      };

      await setDoc(doc(db, "pacientes", id), payload, { merge: true });

      // Limpieza fotos viejas
      if (uploadedPath) {
        try {
          const storage = getStorage();
          const folderRef = ref(storage, `pacientes/${id}`);
          const listing = await listAll(folderRef);
          const keep = uploadedPath;
          const deletions = listing.items
            .filter((it) => it.fullPath !== keep)
            .map((it) => deleteObject(it).catch(() => null));
          await Promise.allSettled(deletions);
        } catch (cleanErr) {
          console.warn("No se pudo limpiar fotos antiguas:", cleanErr);
        }
      }

      alert(editingId ? "✅ Paciente actualizado." : "✅ Paciente guardado.");
      setPacientes((prev) => {
        const without = prev.filter((p) => p.id !== id);
        return [{ id, ...payload }, ...without];
      });
      setOpen(false);
      setEditingId(null);
      clearForm();
    } catch (err) {
      console.error("Error guardando paciente:", err);
      alert("No se pudo guardar el paciente.\n\n" + (err?.message || err));
    }
  };

  /* =================== Acciones listado =================== */
  const openNew = () => { clearForm(); setOpen(true); };

  const openEditFromViewing = () => {
    if (!viewing) return;
    setForm({ ...INITIAL_FORM, ...viewing, fotoUrl: viewing.fotoUrl || "" });
    setFotoFile(null);
    setFotoPreview(viewing.fotoUrl || "");
    setEditingId(viewing.id);
    stopViewing();
    setOpen(true);
  };

  const handleDelete = async (p) => {
    if (!window.confirm(`¿Eliminar al paciente "${p.nombreCompleto}"?`)) return;
    try {
      await deleteDoc(doc(db, "pacientes", p.id));
      setPacientes((prev) => prev.filter((x) => x.id !== p.id));
      try {
        const storage = getStorage();
        const folderRef = ref(storage, `pacientes/${p.id}`);
        const listing = await listAll(folderRef);
        const deletions = listing.items.map((it) => deleteObject(it).catch(() => null));
        await Promise.allSettled(deletions);
      } catch (e) {
        console.warn("No se pudo borrar la carpeta de fotos:", e);
      }
    } catch (e) {
      console.error(e);
      alert("No se pudo eliminar.");
    }
  };

  /* =================== Filtro en memoria =================== */
  const filtered = useMemo(() => {
    const t = term.trim().toLowerCase();
    if (!t) return pacientes;
    return pacientes.filter((p) => {
      const blob = `${p.nombreCompleto || p.paciente || ""} ${p.nroDocumento || ""} ${
        p.celular || p.celularPaciente || ""
      } ${p.email || ""}`.toLowerCase();
      return blob.includes(t);
    });
  }, [pacientes, term]);

  /* =================== Ficha: live subscribe =================== */
  const startViewing = (row) => {
    stopViewing();
    const dref = doc(db, "pacientes", row.id);
    const unsub = onSnapshot(dref, (snap) => {
      if (snap.exists()) {
        setViewing({ id: snap.id, ...mergeWithDefaults(snap.data()) });
      } else {
        setViewing(null);
      }
    });
    unsubRef.current = unsub;
    setActiveTab("datos");
  };

  const stopViewing = () => {
    if (unsubRef.current) { unsubRef.current(); unsubRef.current = null; }
    setViewing(null);
  };

  const mergeWithDefaults = (data) => {
    return {
      ...INITIAL_FORM,
      ...data,
      historiaClinica: { ...INITIAL_FORM.historiaClinica, ...(data.historiaClinica || {}) },
      facturacion: { ...INITIAL_FORM.facturacion, ...(data.facturacion || {}) },
      rxImagenes: Array.isArray(data.rxImagenes) ? data.rxImagenes : [],
      odontograma: Array.isArray(data.odontograma) ? data.odontograma : [],
      periodontograma: Array.isArray(data.periodontograma) ? data.periodontograma : [],
      presupuestos: Array.isArray(data.presupuestos) ? data.presupuestos : [],
      evoluciones: Array.isArray(data.evoluciones) ? data.evoluciones : [],
    };
  };

  const updatePatientField = async (patch) => {
    if (!viewing?.id) return;
    try {
      await updateDoc(doc(db, "pacientes", viewing.id), { ...patch, actualizado: serverTimestamp(), updatedAt: serverTimestamp() });
    } catch (e) {
      console.error(e);
      alert("No se pudo actualizar.");
    }
  };

  /* =================== Rx/Imágenes: subir/borrar =================== */
  const handleRxUpload = async (files) => {
    if (!viewing?.id || !files?.length) return;
    const storage = getStorage();

    try {
      setRxUploading(true);
      const uploads = [];

      for (const file of files) {
        // Intento de compresión si es imagen (opcional)
        let fileToSend = file;
        if (file.type?.startsWith("image/")) {
          try {
            fileToSend = await compressImage(file, { maxW: 1600, maxH: 1600, quality: 0.85 });
          } catch {
            fileToSend = file;
          }
        }

        const safe = (fileToSend.name || "archivo").replace(/\s+/g, "_");
        const path = `pacientes/${viewing.id}/rx/${Date.now()}_${safe}`;
        const sref = ref(storage, path);

        // Nota: algunos navegadores no envían contentType en PDF/doc.
        const meta = {
          contentType: fileToSend.type || "application/octet-stream",
          cacheControl: "public, max-age=31536000",
        };

        await uploadBytes(sref, fileToSend, meta);
        const url = await getDownloadURL(sref);
        uploads.push({
          url,
          name: file.name,
          type: file.type,
          size: file.size || 0,
          created: Date.now(),
          path,
        });
      }

      await updatePatientField({ rxImagenes: [...(viewing.rxImagenes || []), ...uploads] });
    } catch (e) {
      console.error("RX upload error:", e);
      // Mensaje con pistas de reglas típicas
      const msg =
        "No se pudo subir el/los archivo(s).\n" +
        "• Verifica que el usuario esté autenticado.\n" +
        "• Revisa reglas de Storage para permitir escribir en 'pacientes/{id}/**'.\n" +
        "• Si usas Emulador, confirma que el bucket coincida.\n\n" +
        (e?.message || "");
      alert(msg);
    } finally {
      setRxUploading(false);
      try {
        if (rxInputRef.current) rxInputRef.current.value = "";
      } catch {}
    }
  };

  const removeRxItem = async (idx) => {
    if (!viewing?.id) return;
    const item = viewing.rxImagenes[idx];
    const next = viewing.rxImagenes.filter((_, i) => i !== idx);
    await updatePatientField({ rxImagenes: next });
    try {
      if (item?.path) {
        const storage = getStorage();
        await deleteObject(ref(storage, item.path));
      }
    } catch (e) {
      console.warn("No se pudo borrar del Storage:", e);
    }
  };

  /* =================== Historia clínica / odontograma / etc =================== */
  const setHistoria = (key, val) => {
    const next = { ...(viewing.historiaClinica || {}), [key]: val };
    updatePatientField({ historiaClinica: next });
  };

  const addPresupuesto = (p) => {
    const next = [...(viewing.presupuestos || []), { id: String(Date.now()), ...p }];
    updatePatientField({ presupuestos: next });
  };

  const removePresupuesto = (id) => {
    updatePatientField({ presupuestos: (viewing.presupuestos || []).filter((x) => x.id !== id) });
  };

  const addEvolucion = (nota) => {
    const next = [
      ...(viewing.evoluciones || []),
      { id: String(Date.now()), fechaISO: new Date().toISOString(), nota }
    ];
    updatePatientField({ evoluciones: next });
  };

  const removeEvolucion = (id) => {
    updatePatientField({ evoluciones: (viewing.evoluciones || []).filter((x) => x.id !== id) });
  };

  // Odontograma/Periodontograma placeholders simples
  const togglePieza = (campo, pieza) => {
    const arr = Array.isArray(viewing[campo]) ? viewing[campo] : [];
    const exists = arr.find((p) => p.pieza === pieza);
    let next;
    if (exists) next = arr.filter((p) => p.pieza !== pieza);
    else next = [...arr, { pieza, estado: "marcada" }];
    updatePatientField({ [campo]: next });
  };

  /* =================== Hooks: Finanzas & Citas =================== */
  const patientId = viewing?.id || null;
  const fin = useFinancials(patientId);
  const { loading: loadingCitas, citas } = useAppointments(patientId);

  /* =================== UI =================== */
  return (
    <div className="odc-container">
      <div className="odc-topbar-green" />
      <div className="odc-topbar-blue">
        <div className="odc-top-inner">
          <div className="odc-breadcrumbs">Pacientes</div>
        </div>
      </div>

      {/* Card principal */}
      <div className="odc-card">
        <div className="odc-card-header">
          <h3 className="odc-title">Pacientes</h3>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <input
              className="search-input"
              style={{ minWidth: 280 }}
              placeholder="Buscar por nombre, documento o teléfono…"
              value={term}
              onChange={(e) => setTerm(e.target.value)}
            />
            <button type="button" className="btn green" onClick={openNew}>+ Nuevo paciente</button>
          </div>
        </div>

        <div className="table-wrap">
          <table className="appointments-table">
            <thead>
              <tr>
                <th>Foto</th>
                <th>Nombre</th>
                <th>Documento</th>
                <th>Celular</th>
                <th>Correo</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {loading && pacientes.length === 0 ? (
                <tr><td className="no-data" colSpan={6}>Cargando…</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td className="no-data" colSpan={6}>No hay pacientes o no coinciden con la búsqueda.</td></tr>
              ) : (
                filtered.map((p) => (
                  <tr key={p.id} className="row-click" onClick={() => startViewing(p)}>
                    <td onClick={(e) => e.stopPropagation()}>
                      {p.fotoUrl ? (
                        <img src={p.fotoUrl} alt="Foto" style={{ width: 36, height: 36, borderRadius: "50%", objectFit: "cover" }} />
                      ) : (
                        <div className="avatar-fallback">{(p.nombreCompleto || "P")[0]}</div>
                      )}
                    </td>
                    <td>{p.nombreCompleto || p.paciente || "—"}</td>
                    <td>{p.nroDocumento || p.documento || "—"}</td>
                    <td>{p.celular || p.celularPaciente || "—"}</td>
                    <td>{p.email || "—"}</td>
                    <td><span className="pill pill-ok">{p.activo ? "Activo" : "Inactivo"}</span></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="footer-actions">
          <button type="button" className="btn" disabled={loading || !hasMore} onClick={() => fetchPage(false)}>
            {hasMore ? "Cargar más" : "No hay más"}
          </button>
          <div className="hint">{pacientes.length} registros cargados</div>
        </div>
      </div>

      {/* ========= MODAL CREAR/EDITAR ========= */}
      {open && (
        <div className="odc-modal" role="dialog" aria-modal="true">
          <div className="odc-modal-backdrop" onClick={() => setOpen(false)} />
          <div className="odc-card" style={{ width: 1000, maxWidth: "95%", maxHeight: "92vh", overflowY: "auto" }}>
            <div className="odc-card-header">
              <h3 className="odc-title">{editingId ? "Editar paciente" : "Nuevo paciente"}</h3>
              <button type="button" className="btn" onClick={() => setOpen(false)}>✕</button>
            </div>

            <form onSubmit={handleSubmit}>
              {/* FOTO */}
              <div className="form-section-title">Foto del paciente</div>
              <div className="foto-row">
                <label className="foto-drop">
                  <input type="file" accept="image/*" onChange={(e) => onFotoChange(e.target.files?.[0] || null)} style={{ display: "none" }} />
                  {fotoPreview ? (
                    <img src={fotoPreview} alt="Preview" className="foto-preview" />
                  ) : (
                    <div className="foto-empty">Arrastra o haz clic para cargar</div>
                  )}
                </label>
                {fotoPreview && (
                  <button type="button" className="btn" onClick={() => onFotoChange(null)}>Quitar foto</button>
                )}
              </div>

              {/* Identificación */}
              <div className="form-section-title">Datos de identificación</div>
              <div className="form-grid">
                <div>
                  <label className="form-label">Tipo de documento *</label>
                  <select className="form-input" value={form.tipoDocumento} onChange={(e) => handleChange("tipoDocumento", e.target.value)}>
                    <option value="">Seleccione…</option>
                    <option value="CC">Cédula</option>
                    <option value="TI">Tarjeta de identidad</option>
                    <option value="PA">Pasaporte</option>
                    <option value="OTRO">Otro</option>
                  </select>
                </div>
                <div>
                  <label className="form-label">Nro. de documento *</label>
                  <input className="form-input" value={form.nroDocumento} onChange={(e) => handleChange("nroDocumento", e.target.value)} placeholder="Número de documento" required />
                </div>
                <div>
                  <label className="form-label">Número de Historia</label>
                  <input className="form-input" value={form.nroHistoria} readOnly />
                </div>
                <div>
                  <label className="form-label">Nombres *</label>
                  <input className="form-input" value={form.nombres} onChange={(e) => handleChange("nombres", e.target.value)} required />
                </div>
                <div>
                  <label className="form-label">Apellidos *</label>
                  <input className="form-input" value={form.apellidos} onChange={(e) => handleChange("apellidos", e.target.value)} required />
                </div>
                <div>
                  <label className="form-label">Nombre completo</label>
                  <input className="form-input" value={form.nombreCompleto} readOnly />
                </div>
                <div>
                  <label className="form-label">Sexo *</label>
                  <select className="form-input" value={form.sexo} onChange={(e) => handleChange("sexo", e.target.value)} required>
                    <option value="">Seleccione…</option>
                    <option>Masculino</option>
                    <option>Femenino</option>
                    <option>Otro</option>
                  </select>
                </div>
                <div>
                  <label className="form-label">Estado civil *</label>
                  <select className="form-input" value={form.estadoCivil} onChange={(e) => handleChange("estadoCivil", e.target.value)} required>
                    <option value="">Seleccione…</option>
                    <option>Soltero</option>
                    <option>Casado</option>
                    <option>Unión libre</option>
                    <option>Divorciado</option>
                    <option>Viudo</option>
                  </select>
                </div>
                <div>
                  <label className="form-label">País de nacimiento *</label>
                  <input className="form-input" list="listCountries" value={form.paisNacimiento} onChange={(e) => handleChange("paisNacimiento", e.target.value)} placeholder="Escribe y elige…" required />
                  <datalist id="listCountries">
                    {COUNTRIES.map((c) => (<option key={c} value={c} />))}
                  </datalist>
                </div>
                <div>
                  <label className="form-label">Ciudad de nacimiento</label>
                  <input className="form-input" list="listCitiesBirth" value={form.ciudadNacimiento} onChange={(e) => handleChange("ciudadNacimiento", e.target.value)} placeholder="Escribe y elige…" />
                  <datalist id="listCitiesBirth">
                    {ciudadesDisponibles.map((c) => (<option key={c} value={c} />))}
                  </datalist>
                </div>
                <div>
                  <label className="form-label">Fecha de ingreso</label>
                  <input className="form-input" value={form.fechaIngreso} readOnly />
                </div>
                <div>
                  <label className="form-label">Fecha de nacimiento *</label>
                  <input type="date" className="form-input" value={form.fechaNacimiento} onChange={(e) => handleChange("fechaNacimiento", e.target.value)} required />
                </div>
                <div>
                  <label className="form-label">Edad</label>
                  <input className="form-input" value={form.edad} readOnly />
                </div>
                <div>
                  <label className="form-label">País de domicilio *</label>
                  <input className="form-input" list="listCountries" value={form.paisDomicilio} onChange={(e) => handleChange("paisDomicilio", e.target.value)} required />
                </div>
                <div>
                  <label className="form-label">Ciudad de domicilio *</label>
                  <input className="form-input" list="listCitiesHome" value={form.ciudadDomicilio} onChange={(e) => handleChange("ciudadDomicilio", e.target.value)} required />
                  <datalist id="listCitiesHome">
                    {(CITIES_BY_COUNTRY[form.paisDomicilio] || []).map((c) => (<option key={c} value={c} />))}
                  </datalist>
                </div>
                <div>
                  <label className="form-label">Barrio *</label>
                  <input className="form-input" value={form.barrio} onChange={(e) => handleChange("barrio", e.target.value)} required placeholder="Barrio" />
                </div>
                <div>
                  <label className="form-label">Lugar de residencia *</label>
                  <input className="form-input" value={form.lugarResidencia} onChange={(e) => handleChange("lugarResidencia", e.target.value)} required />
                </div>
                <div>
                  <label className="form-label">Estrato</label>
                  <select className="form-input" value={form.estrato} onChange={(e) => handleChange("estrato", e.target.value)}>
                    <option value="">Seleccione…</option>
                    <option>1</option><option>2</option><option>3</option>
                    <option>4</option><option>5</option><option>6</option>
                  </select>
                </div>
                <div>
                  <label className="form-label">Zona residencial *</label>
                  <select className="form-input" value={form.zonaResidencial} onChange={(e) => handleChange("zonaResidencial", e.target.value)} required>
                    <option value="">Seleccione…</option>
                    <option>Urbana</option>
                    <option>Rural</option>
                  </select>
                </div>
                <div className="checkbox-cell">
                  <label className="form-label">¿Es extranjero?</label>
                  <input type="checkbox" checked={form.esExtranjero} onChange={(e) => handleChange("esExtranjero", e.target.checked)} />
                </div>
                <div className="checkbox-cell">
                  <label className="form-label">¿Permite publicidad?</label>
                  <input type="checkbox" checked={form.permitePublicidad} onChange={(e) => handleChange("permitePublicidad", e.target.checked)} />
                </div>
              </div>

              {/* Contacto */}
              <div className="form-section-title">Contacto</div>
              <div className="form-grid">
                <div>
                  <label className="form-label">Celular *</label>
                  <input className="form-input" value={form.celular} onChange={(e) => handleChange("celular", e.target.value)} required placeholder="Celular del paciente" />
                </div>
                <div>
                  <label className="form-label">Teléfono de domicilio</label>
                  <input className="form-input" value={form.telDomicilio} onChange={(e) => handleChange("telDomicilio", e.target.value)} />
                </div>
                <div>
                  <label className="form-label">Teléfono de oficina</label>
                  <input className="form-input" value={form.telOficina} onChange={(e) => handleChange("telOficina", e.target.value)} />
                </div>
                <div>
                  <label className="form-label">Extensión</label>
                  <input className="form-input" value={form.extension} onChange={(e) => handleChange("extension", e.target.value)} />
                </div>
                <div>
                  <label className="form-label">Correo electrónico *</label>
                  <input type="email" className="form-input" value={form.email} onChange={(e) => handleChange("email", e.target.value)} required placeholder="correo@dominio.com" />
                </div>
                <div>
                  <label className="form-label">Ocupación *</label>
                  <input className="form-input" value={form.ocupacion} onChange={(e) => handleChange("ocupacion", e.target.value)} required />
                </div>
              </div>

              {/* Facturación */}
              <div className="form-section-title">Datos de facturación</div>
              <div className="form-grid">
                <div>
                  <label className="form-label">Responsable</label>
                  <input className="form-input" value={form.nombreResponsable} onChange={(e) => handleChange("nombreResponsable", e.target.value)} />
                </div>
                <div>
                  <label className="form-label">Parentesco</label>
                  <select className="form-input" value={form.parentesco} onChange={(e) => handleChange("parentesco", e.target.value)}>
                    <option value="">Seleccione…</option>
                    <option>Padre/Madre</option><option>Hermano</option>
                    <option>Esposo/a</option><option>Otro</option>
                  </select>
                </div>
                <div>
                  <label className="form-label">Celular</label>
                  <input className="form-input" value={form.celularResponsable} onChange={(e) => handleChange("celularResponsable", e.target.value)} />
                </div>
                <div>
                  <label className="form-label">Teléfono</label>
                  <input className="form-input" value={form.telefonoResponsable} onChange={(e) => handleChange("telefonoResponsable", e.target.value)} />
                </div>
                <div>
                  <label className="form-label">Correo electrónico</label>
                  <input type="email" className="form-input" value={form.emailResponsable} onChange={(e) => handleChange("emailResponsable", e.target.value)} />
                </div>
              </div>

              {/* Acompañante */}
              <div className="form-section-title">Acompañante</div>
              <div className="form-grid">
                <div>
                  <label className="form-label">Nombre</label>
                  <input className="form-input" value={form.nombreAcompanante} onChange={(e) => handleChange("nombreAcompanante", e.target.value)} placeholder="Nombre acompañante" />
                </div>
                <div>
                  <label className="form-label">Teléfono</label>
                  <input className="form-input" value={form.telefonoAcompanante} onChange={(e) => handleChange("telefonoAcompanante", e.target.value)} placeholder="Teléfono acompañante" />
                </div>
              </div>

              {/* Marketing */}
              <div className="form-section-title">Mercadeo</div>
              <div className="form-grid">
                <div>
                  <label className="form-label">Convenio beneficio</label>
                  <input className="form-input" value={form.convenioBeneficio} onChange={(e) => handleChange("convenioBeneficio", e.target.value)} />
                </div>
                <div>
                  <label className="form-label">¿Cómo nos conoció?</label>
                  <select className="form-input" value={form.comoConocio} onChange={(e) => handleChange("comoConocio", e.target.value)}>
                    <option value="">Seleccione…</option>
                    <option>Redes sociales</option>
                    <option>Publicidad</option>
                    <option>Recomendación</option>
                    <option>Otro</option>
                  </select>
                </div>
                <div>
                  <label className="form-label">Campaña</label>
                  <input className="form-input" value={form.campania} onChange={(e) => handleChange("campania", e.target.value)} />
                </div>
                <div>
                  <label className="form-label">Remitido por</label>
                  <input className="form-input" value={form.remitidoPor} onChange={(e) => handleChange("remitidoPor", e.target.value)} />
                </div>
                <div>
                  <label className="form-label">Asesor comercial</label>
                  <input className="form-input" value={form.asesorComercial} onChange={(e) => handleChange("asesorComercial", e.target.value)} />
                </div>
              </div>

              {/* EPS */}
              <div className="form-section-title">EPS</div>
              <div className="form-grid">
                <div>
                  <label className="form-label">Tipo de vinculación *</label>
                  <select className="form-input" value={form.tipoVinculacion} onChange={(e) => handleChange("tipoVinculacion", e.target.value)} required>
                    <option value="">Seleccione…</option>
                    <option>Contributivo</option>
                    <option>Subsidiado</option>
                    <option>Particular</option>
                    <option>Otro</option>
                  </select>
                </div>
                <div>
                  <label className="form-label">Nombre de la EPS *</label>
                  <input className="form-input" list="listEps" value={form.nombreEps} onChange={(e) => handleChange("nombreEps", e.target.value)} placeholder="Escribe y selecciona…" required />
                  <datalist id="listEps">
                    {epsList.map((e) => (<option key={e} value={e} />))}
                  </datalist>
                </div>
                <div>
                  <label className="form-label">Póliza de salud</label>
                  <input className="form-input" value={form.polizaSalud} onChange={(e) => handleChange("polizaSalud", e.target.value)} />
                </div>
              </div>

              {/* Doctor */}
              <div className="form-section-title">Doctor</div>
              <div className="form-grid">
                <div>
                  <label className="form-label">Doctor</label>
                  <input className="form-input" value={form.doctor} onChange={(e) => handleChange("doctor", e.target.value)} placeholder="Usuario / Libre" />
                </div>
              </div>

              {/* Notas */}
              <div className="form-section-title">Alertas y Notas</div>
              <div className="form-grid">
                <textarea className="form-input" rows={3} value={form.notas} onChange={(e) => handleChange("notas", e.target.value)} placeholder="Notas del paciente…" />
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", gap: 8, marginTop: 12 }}>
                {editingId ? (
                  <button type="button" className="btn" onClick={() => handleDelete({ id: editingId, nombreCompleto: form.nombreCompleto })}>Eliminar</button>
                ) : <div />}
                <div style={{ display: "flex", gap: 8 }}>
                  <button type="button" className="btn" onClick={() => setOpen(false)}>Cancelar</button>
                  <button type="submit" className="btn blue">{editingId ? "Actualizar" : "Guardar paciente"}</button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========= MODAL FICHA COMPLETA ========= */}
      {viewing && (
        <div className="odc-modal" role="dialog" aria-modal="true">
          <div className="odc-modal-backdrop" onClick={stopViewing} />
          <div className="odc-card ficha-card">
            {/* Header */}
            <div className="ficha-header">
              <div className="ficha-header-left">
                {viewing.fotoUrl ? (
                  <img src={viewing.fotoUrl} alt="Foto" className="ficha-avatar" />
                ) : (
                  <div className="avatar-fallback ficha-avatar-fallback">
                    {(viewing.nombreCompleto || "P")[0]}
                  </div>
                )}
                <div>
                  <div className="ficha-nombre">{viewing.nombreCompleto || "—"}</div>
                  <div className="ficha-doc">{viewing.tipoDocumento || "—"} {viewing.nroDocumento || "—"}</div>
                  <div className="ficha-badges">
                    <span className="ficha-badge blue">En valoración</span>
                    <span className="ficha-badge green">Sin deuda</span>
                  </div>
                </div>
              </div>
              <div className="ficha-header-right">
                <div className="ficha-actions">
                  <button type="button" className="btn" onClick={stopViewing}>Cerrar</button>
                  <button type="button" className="btn blue" onClick={openEditFromViewing}>Editar</button>
                  <button
                    type="button"
                    className="btn green"
                    onClick={() => nav(buildUrl(ROUTES.caja, { cobro: 1, patientId: viewing.id }))}
                    title="Ir a Caja para cobrar a este paciente"
                  >
                    Cobrar
                  </button>
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="ficha-body">
              {/* Sidebar */}
              <aside className="ficha-sidebar">
                <div className="ficha-sidebar-title">Información general</div>
                <button type="button" className={`ficha-link ${activeTab==="datos"?"active":""}`} onClick={() => setActiveTab("datos")}>Datos personales</button>
                <button type="button" className={`ficha-link ${activeTab==="marketing"?"active":""}`} onClick={() => setActiveTab("marketing")}>Marketing</button>
                <button type="button" className={`ficha-link ${activeTab==="eps"?"active":""}`} onClick={() => setActiveTab("eps")}>EPS</button>
                <button type="button" className={`ficha-link ${activeTab==="prof"?"active":""}`} onClick={() => setActiveTab("prof")}>Profesionales</button>
                <button type="button" className={`ficha-link ${activeTab==="rx"?"active":""}`} onClick={() => setActiveTab("rx")}>Rx/Imágenes/Doc</button>
                <button type="button" className={`ficha-link ${activeTab==="citas"?"active":""}`} onClick={() => setActiveTab("citas")}>Citas</button>
                <button type="button" className={`ficha-link ${activeTab==="crm"?"active":""}`} onClick={() => setActiveTab("crm")}>CRM</button>

                <div className="ficha-sidebar-title mt">Historia clínica</div>
                <button type="button" className={`ficha-link ${activeTab==="doc"?"active":""}`} onClick={() => setActiveTab("doc")}>Doc. Clínicos</button>
                <button type="button" className={`ficha-link ${activeTab==="odonto"?"active":""}`} onClick={() => setActiveTab("odonto")}>Odontogramas</button>
                <button type="button" className={`ficha-link ${activeTab==="perio"?"active":""}`} onClick={() => setActiveTab("perio")}>Periodontogramas</button>
                <button type="button" className={`ficha-link ${activeTab==="presu"?"active":""}`} onClick={() => setActiveTab("presu")}>Presupuestos</button>
                <button type="button" className={`ficha-link ${activeTab==="evo"?"active":""}`} onClick={() => setActiveTab("evo")}>Evoluciones</button>

                <div className="ficha-sidebar-title mt">Facturación</div>
                <button
                  type="button"
                  className={`ficha-link ${activeTab==="fact"?"active":""}`}
                  onClick={() => setActiveTab("fact")}
                >
                  Resumen
                </button>

                {/* Acciones rápidas de Facturación */}
                <div className="ficha-sidebar-actions" style={{ display: "grid", gap: 8, marginTop: 8 }}>
                  <button
                    type="button"
                    className="btn pay"
                    onClick={() => nav(buildUrl(ROUTES.caja, { cobro: 1, patientId: viewing.id }))}
                    title="Cobrar a este paciente"
                  >
                    Realizar pago
                  </button>
                  <button
                    type="button"
                    className="btn history"
                    onClick={() => navAbs(`${ROUTES.pagos}?patientId=${encodeURIComponent(viewing.id)}`)}
                    title="Ver histórico de pagos"
                  >
                    Histórico de pagos
                  </button>
                  <button
                    type="button"
                    className="btn history"
                    onClick={() => navAbs(`${ROUTES.facturas}?patientId=${encodeURIComponent(viewing.id)}`)}
                    title="Ver histórico de facturación"
                  >
                    Histórico de facturación
                  </button>
                </div>
              </aside>

              {/* Content */}
              <main className="ficha-content">
                {/* Tabs */}
                {activeTab === "datos" && (
                  <section className="ficha-section">
                    <h4 className="ficha-section-title">Datos personales</h4>
                    <div className="ficha-grid">
                      {[
                        ["Tipo de documento", viewing.tipoDocumento],
                        ["Nro. de documento", viewing.nroDocumento],
                        ["Número de Historia", viewing.nroHistoria],
                        ["Fecha de ingreso", viewing.fechaIngreso],
                        ["Nombres", viewing.nombres],
                        ["Apellidos", viewing.apellidos],
                        ["Nombre completo", viewing.nombreCompleto],
                        ["Sexo", viewing.sexo],
                        ["Estado civil", viewing.estadoCivil],
                        ["País de nacimiento", viewing.paisNacimiento],
                        ["Ciudad de nacimiento", viewing.ciudadNacimiento],
                        ["Fecha de nacimiento", viewing.fechaNacimiento],
                        ["Edad", viewing.edad],
                        ["País de domicilio", viewing.paisDomicilio],
                        ["Ciudad de domicilio", viewing.ciudadDomicilio],
                        ["Barrio", viewing.barrio],
                        ["Lugar de residencia", viewing.lugarResidencia],
                        ["Estrato", viewing.estrato],
                        ["Zona residencial", viewing.zonaResidencial],
                        ["Extranjero", viewing.esExtranjero ? "Sí" : "No"],
                        ["Permite publicidad", viewing.permitePublicidad ? "Sí" : "No"],
                        ["Celular", viewing.celular || viewing.celularPaciente],
                        ["Teléfono domicilio", viewing.telDomicilio || viewing.telefonoPaciente],
                        ["Teléfono oficina", viewing.telOficina],
                        ["Extensión", viewing.extension],
                        ["Correo electrónico", viewing.email],
                        ["Ocupación", viewing.ocupacion],
                        ["Responsable", viewing.nombreResponsable],
                        ["Parentesco", viewing.parentesco],
                        ["Cel. responsable", viewing.celularResponsable],
                        ["Tel. responsable", viewing.telefonoResponsable],
                        ["Email responsable", viewing.emailResponsable],
                        ["Acompañante", viewing.nombreAcompanante],
                        ["Tel. acompañante", viewing.telefonoAcompanante],
                      ].map(([k, v]) => (
                        <div className="field" key={k}>
                          <label>{k}</label>
                          <input className="form-input" value={v || ""} readOnly />
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {activeTab === "marketing" && (
                  <section className="ficha-section">
                    <h4 className="ficha-section-title">Marketing</h4>
                    <div className="ficha-grid">
                      {[
                        ["Convenio beneficio", viewing.convenioBeneficio],
                        ["¿Cómo nos conoció?", viewing.comoConocio],
                        ["Campaña", viewing.campania],
                        ["Remitido por", viewing.remitidoPor],
                        ["Asesor comercial", viewing.asesorComercial],
                      ].map(([k, v]) => (
                        <div className="field" key={k}>
                          <label>{k}</label>
                          <input className="form-input" value={v || ""} readOnly />
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {activeTab === "eps" && (
                  <section className="ficha-section">
                    <h4 className="ficha-section-title">EPS</h4>
                    <div className="ficha-grid">
                      {[
                        ["Tipo de vinculación", viewing.tipoVinculacion],
                        ["Nombre EPS", viewing.nombreEps],
                        ["Póliza de salud", viewing.polizaSalud],
                      ].map(([k, v]) => (
                        <div className="field" key={k}>
                          <label>{k}</label>
                          <input className="form-input" value={v || ""} readOnly />
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {activeTab === "prof" && (
                  <section className="ficha-section">
                    <h4 className="ficha-section-title">Profesionales</h4>
                    <div className="ficha-grid">
                      <div className="field">
                        <label>Doctor</label>
                        <input className="form-input" value={viewing.doctor || ""} readOnly />
                      </div>
                    </div>
                  </section>
                )}

                {activeTab === "rx" && (
                  <section className="ficha-section">
                    <h4 className="ficha-section-title">Rx / Imágenes / Documentos</h4>
                    <div className="rx-actions">
                      <label className="btn blue">
                        Subir archivos
                        <input
                          ref={rxInputRef}
                          type="file"
                          multiple
                          accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
                          style={{ display: "none" }}
                          onChange={(e) => handleRxUpload([...(e.target.files || [])])}
                        />
                      </label>
                      {rxUploading && <span className="hint" style={{ marginLeft: 10 }}>Subiendo…</span>}
                    </div>
                    <div className="rx-grid">
                      {(viewing.rxImagenes || []).map((it, i) => (
                        <div className="rx-item" key={`${it.url}-${i}`}>
                          {it.type?.startsWith("image/") ? (
                            <a href={it.url} target="_blank" rel="noreferrer">
                              <img src={it.url} alt={it.name} />
                            </a>
                          ) : (
                            <a className="rx-file" href={it.url} target="_blank" rel="noreferrer">
                              {it.name || "archivo"}
                            </a>
                          )}
                          <div className="rx-meta">
                            <span>{it.name}</span>
                            <button type="button" className="btn small" onClick={() => removeRxItem(i)}>Eliminar</button>
                          </div>
                        </div>
                      ))}
                      {(!viewing.rxImagenes || viewing.rxImagenes.length === 0) && (
                        <div className="no-data">Sin archivos aún.</div>
                      )}
                    </div>
                  </section>
                )}

                {activeTab === "doc" && (
                  <section className="ficha-section">
                    <h4 className="ficha-section-title">Doc. Clínicos</h4>
                    <div className="ficha-grid">
                      <div className="field">
                        <label>Motivo de consulta</label>
                        <textarea className="form-input" rows={3}
                          value={viewing.historiaClinica?.motivoConsulta || ""}
                          onChange={(e) => setHistoria("motivoConsulta", e.target.value)} />
                      </div>
                      <div className="field">
                        <label>Antecedentes</label>
                        <textarea className="form-input" rows={3}
                          value={viewing.historiaClinica?.antecedentes || ""}
                          onChange={(e) => setHistoria("antecedentes", e.target.value)} />
                      </div>
                      <div className="field">
                        <label>Alergias</label>
                        <textarea className="form-input" rows={2}
                          value={viewing.historiaClinica?.alergias || ""}
                          onChange={(e) => setHistoria("alergias", e.target.value)} />
                      </div>
                      <div className="field">
                        <label>Medicamentos</label>
                        <textarea className="form-input" rows={2}
                          value={viewing.historiaClinica?.medicamentos || ""}
                          onChange={(e) => setHistoria("medicamentos", e.target.value)} />
                      </div>
                      <div className="field">
                        <label>Notas</label>
                        <textarea className="form-input" rows={3}
                          value={viewing.historiaClinica?.notas || ""}
                          onChange={(e) => setHistoria("notas", e.target.value)} />
                      </div>
                    </div>
                  </section>
                )}

                {activeTab === "odonto" && (
                  <section className="ficha-section">
                    <h4 className="ficha-section-title">Odontograma (placeholder)</h4>
                    <div className="odont-grid">
                      {Array.from({ length: 32 }, (_, i) => i + 1).map((pieza) => {
                        const marcada = (viewing.odontograma || []).some((p) => p.pieza === pieza);
                        return (
                          <button
                            type="button"
                            key={pieza}
                            className={`tooth ${marcada ? "on" : ""}`}
                            onClick={() => togglePieza("odontograma", pieza)}
                            title={`Pieza ${pieza}`}
                          >
                            {pieza}
                          </button>
                        );
                      })}
                    </div>
                  </section>
                )}

                {activeTab === "perio" && (
                  <section className="ficha-section">
                    <h4 className="ficha-section-title">Periodontograma (placeholder)</h4>
                    <div className="odont-grid">
                      {Array.from({ length: 32 }, (_, i) => i + 1).map((pieza) => {
                        const marcada = (viewing.periodontograma || []).some((p) => p.pieza === pieza);
                        return (
                          <button
                            type="button"
                            key={pieza}
                            className={`tooth ${marcada ? "on" : ""}`}
                            onClick={() => togglePieza("periodontograma", pieza)}
                            title={`Pieza ${pieza}`}
                          >
                            {pieza}
                          </button>
                        );
                      })}
                    </div>
                  </section>
                )}

                {activeTab === "presu" && (
                  <section className="ficha-section">
                    <h4 className="ficha-section-title">Presupuestos & planes</h4>
                    <PresupuestoForm onAdd={addPresupuesto} />
                    <div className="presu-list">
                      {(viewing.presupuestos || []).map((it) => (
                        <div className="presu-item" key={it.id}>
                          <div>
                            <div className="presu-title">{it.titulo}</div>
                            <div className="presu-meta">Costo: ${it.costo || 0} · Estado: {it.estado || "Pendiente"}</div>
                          </div>
                          <button type="button" className="btn small" onClick={() => removePresupuesto(it.id)}>Eliminar</button>
                        </div>
                      ))}
                      {(!viewing.presupuestos || viewing.presupuestos.length === 0) && (
                        <div className="no-data">Sin presupuestos aún.</div>
                      )}
                    </div>
                  </section>
                )}

                {activeTab === "evo" && (
                  <section className="ficha-section">
                    <h4 className="ficha-section-title">Evoluciones & Remisiones</h4>
                    <EvolucionForm onAdd={addEvolucion} />
                    <div className="evo-list">
                      {(viewing.evoluciones || []).map((ev) => (
                        <div className="evo-item" key={ev.id}>
                          <div className="evo-date">{new Date(ev.fechaISO).toLocaleString()}</div>
                          <div className="evo-note">{ev.nota}</div>
                          <button type="button" className="btn small" onClick={() => removeEvolucion(ev.id)}>Eliminar</button>
                        </div>
                      ))}
                      {(!viewing.evoluciones || viewing.evoluciones.length === 0) && (
                        <div className="no-data">Sin evoluciones aún.</div>
                      )}
                    </div>
                  </section>
                )}

                {activeTab === "fact" && (
                  <section className="ficha-section">
                    <h4 className="ficha-section-title">Facturación</h4>

                    {/* Tarjetas resumen */}
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px,1fr))", gap: 12 }}>
                      <Kpi title="Total facturado" value={`$ ${fin.totalFacturado.toLocaleString()}`} />
                      <Kpi title="Total pagado" value={`$ ${fin.totalPagado.toLocaleString()}`} />
                      <Kpi title="Facturas pendientes" value={`$ ${fin.totalFacturasPendientes.toLocaleString()}`} />
                      <Kpi title="Saldo pendiente (facturas - pagos)" value={`$ ${(fin.totalFacturado - fin.totalPagado).toLocaleString()}`} />
                      <Kpi title="Saldo a favor" value={`$ ${(viewing.facturacion?.saldoFavor ?? 0).toLocaleString()}`} />
                      <Kpi title="Saldo crédito" value={`$ ${(viewing.facturacion?.saldoCredito ?? 0).toLocaleString()}`} />
                    </div>

                    {fin.error && <div className="hint" style={{ marginTop: 6 }}>⚠️ {fin.error}</div>}

                    {/* Editables de saldos rápidos */}
                    <div className="ficha-grid" style={{ marginTop: 12 }}>
                      <div className="field">
                        <label>Saldo a favor</label>
                        <input
                          type="number"
                          className="form-input"
                          value={viewing.facturacion?.saldoFavor ?? 0}
                          onChange={(e) =>
                            updatePatientField({ facturacion: { ...(viewing.facturacion || {}), saldoFavor: Number(e.target.value || 0) }})
                          }
                        />
                      </div>
                      <div className="field">
                        <label>Saldo crédito</label>
                        <input
                          type="number"
                          className="form-input"
                          value={viewing.facturacion?.saldoCredito ?? 0}
                          onChange={(e) =>
                            updatePatientField({ facturacion: { ...(viewing.facturacion || {}), saldoCredito: Number(e.target.value || 0) }})
                          }
                        />
                      </div>
                    </div>
                  </section>
                )}

                {/* Citas (solo lectura + abrir en Agenda) */}
                {activeTab === "citas" && (
                  <section className="ficha-section">
                    <h4 className="ficha-section-title">Citas</h4>

                    <div className="table-wrap">
                      <table className="appointments-table">
                        <thead>
                          <tr>
                            <th>Fecha</th>
                            <th>Estado</th>
                            <th>Motivo</th>
                            <th>Profesional / Acciones</th>
                          </tr>
                        </thead>
                        <tbody>
                          {loadingCitas ? (
                            <tr><td className="no-data" colSpan={4}>Cargando…</td></tr>
                          ) : citas.length === 0 ? (
                            <tr><td className="no-data" colSpan={4}>Sin citas registradas.</td></tr>
                          ) : (
                            citas.map((c) => (
                              <tr key={c.id}>
                                <td>{c.fechaISO ? new Date(c.fechaISO).toLocaleString() : "—"}</td>
                                <td>{(c.estado || "—")}</td>
                                <td>{c.motivo || "—"}</td>
                                <td>
                                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                    <span>{c.profesional || "—"}</span>
                                    <button
                                      type="button"
                                      className="btn small"
                                      onClick={() => {
                                        const d = c.fechaISO ? new Date(c.fechaISO) : null;
                                        const isoDay = d ? d.toISOString().slice(0,10) : "";
                                        navAbs(`agenda?date=${encodeURIComponent(isoDay)}&patientId=${encodeURIComponent(viewing.id)}`);
                                      }}
                                      title="Abrir en Agenda"
                                    >
                                      Ver en Agenda
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </section>
                )}

                {activeTab === "crm" && (
                  <section className="ficha-section">
                    <h4 className="ficha-section-title">CRM</h4>
                    <div className="no-data">Notas / recordatorios comerciales del paciente.</div>
                  </section>
                )}

                {/* Footer ficha */}
                <div className="ficha-footer"></div>
              </main>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ========================== Subcomponentes simples ========================== */
function Kpi({ title, value }) {
  return (
    <div className="mini-card">
      <div className="mini-card-title">{title}</div>
      <div style={{ fontWeight: 700, fontSize: 20, marginTop: 6 }}>{value}</div>
    </div>
  );
}

function PresupuestoForm({ onAdd }) {
  const [titulo, setTitulo] = useState("");
  const [costo, setCosto] = useState("");
  const [estado, setEstado] = useState("Pendiente");
  return (
    <div className="presu-form">
      <input className="form-input" placeholder="Procedimiento / plan" value={titulo} onChange={(e) => setTitulo(e.target.value)} />
      <input type="number" className="form-input" placeholder="Costo" value={costo} onChange={(e) => setCosto(e.target.value)} />
      <select className="form-input" value={estado} onChange={(e) => setEstado(e.target.value)}>
        <option>Pendiente</option>
        <option>Aprobado</option>
        <option>Rechazado</option>
      </select>
      <button
        type="button"
        className="btn blue"
        onClick={() => {
          if (!titulo) return alert("Título requerido");
          onAdd({ titulo, costo: Number(costo || 0), estado });
          setTitulo(""); setCosto(""); setEstado("Pendiente");
        }}
      >
        Agregar
      </button>
    </div>
  );
}

function EvolucionForm({ onAdd }) {
  const [nota, setNota] = useState("");
  return (
    <div className="evo-form">
      <textarea className="form-input" rows={2} placeholder="Escribe la evolución / remisión…" value={nota} onChange={(e) => setNota(e.target.value)} />
      <button type="button" className="btn blue" onClick={() => { if (!nota.trim()) return; onAdd(nota.trim()); setNota(""); }}>
        Guardar evolución
      </button>
    </div>
  );
}
