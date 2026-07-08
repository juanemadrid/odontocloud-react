import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { updateDoc, doc } from "firebase/firestore";
import { useSearchParams } from "react-router-dom";
import "./pacientes.css";

// 🔹 Slender Pro Components
import PatientList from "./components/PatientList";
import PatientDetails from "./components/PatientDetails";
import PatientForm from "./components/PatientForm";

import { db } from "../../firebase/firebaseConfig";
import {
  collection,
  getDocs,
  query,
  orderBy,
  where,
} from "firebase/firestore";
import { createOrUpdatePatient, deletePatient } from "../../services/patientService";
import ImportadorPacientes from "./components/ImportadorPacientes";

/* ========================
   Utilidades de UI / Datos
   ======================== */

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

/* ========================
   Componente principal
   ======================== */

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

  // Foto (Storage)
  fotoUrl: "",
};

export default function Pacientes() {
  const { userProfile } = useAuth();
  const toast = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  // listado
  const [loading, setLoading] = useState(true);
  const [pacientes, setPacientes] = useState([]);
  const [term, setTerm] = useState("");
  const [showImporter, setShowImporter] = useState(false);

  // modal control
  const [open, setOpen] = useState(false);
  const [editData, setEditData] = useState(null);

  /* ======= cargar pacientes ======= */
  useEffect(() => {
    const load = () => reloadData();
    load();
  }, [userProfile?.inquilino]);

  // Handle URL ID pre-selection (supporting both query param '?id=' and pathname '/pacientes/:id/planes')
  useEffect(() => {
    if (!loading && pacientes.length > 0) {
      const pathParts = window.location.pathname.split("/pacientes/");
      const idFromPath = pathParts[1] ? pathParts[1].split("/")[0] : null;
      const targetId = idFromPath || searchParams.get("id");

      if (targetId) {
        const found = pacientes.find(p => 
          p.id.toLowerCase() === targetId.toLowerCase() || 
          p.nroDocumento?.toLowerCase() === targetId.toLowerCase()
        );
        if (found) {
          setSelectedPatient(found);
        }
      }
    }
  }, [loading, pacientes, searchParams]);

  // Handle action=new query parameter to automatically open the new patient form modal
  useEffect(() => {
    const action = searchParams.get("action");
    if (action === "new") {
      handleOpenNew();
      
      // Clean query parameter after a small delay to prevent overriding the modal open state
      const timer = setTimeout(() => {
        const currentParams = new URLSearchParams(window.location.search);
        if (currentParams.get("action") === "new") {
          currentParams.delete("action");
          setSearchParams(currentParams, { replace: true });
        }
      }, 300);
      
      return () => clearTimeout(timer);
    }
  }, [searchParams, setSearchParams]);

  const reloadData = async () => {
    setLoading(true);
    try {
      const qPac = userProfile?.inquilino
        ? query(collection(db, "pacientes"), where("inquilino", "==", userProfile.inquilino))
        : query(collection(db, "pacientes"));

      const snapPac = await getDocs(qPac);
      const data = snapPac.docs.map((d) => ({ id: d.id, ...d.data() }));

      // Sort in memory to avoid missing index error
      data.sort((a, b) => {
        const dateA = a.creado?.seconds || 0;
        const dateB = b.creado?.seconds || 0;
        return dateB - dateA; // DESC
      });

      setPacientes(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  /* ======= handle actions ======= */
  const handleOpenNew = () => {
    setEditData(null); // For new patient, pass null or an empty object
    setOpen(true);
  };

  const handleOpenEdit = (p) => {
    setEditData(p);
    setOpen(true);
  };

  const handleSubmit = async (formData, fotoFile) => {
    if (!userProfile?.inquilino) return;
    try {
      await createOrUpdatePatient(
        userProfile.inquilino,
        formData,
        !editData, // isNew if no editData
        fotoFile
      );
      toast.success(editData ? "Ficha actualizada" : "Paciente registrado");
      setOpen(false);
      reloadData();
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Error al guardar");
    }
  };

  const handleDelete = async (patient) => {
    try {
      await deletePatient(patient.id);
      toast.success("Paciente eliminado correctamente");
      reloadData();
    } catch (err) {
      console.error("Error eliminando paciente:", err?.code, err?.message, err);
      if (err?.code === "permission-denied") {
        toast.error("No tienes permisos para eliminar pacientes. Verifica las reglas de Firestore.");
      } else {
        toast.error(`Error al eliminar el paciente: ${err?.message || "Error desconocido"}`);
      }
    }
  };

  /* ======= tabla / filtro ======= */
  const filtered = useMemo(() => {
    const t = term.trim().toLowerCase();
    if (!t) return pacientes;
    return pacientes.filter((p) => {
      const blob = `${p.nombreCompleto || p.paciente || ""} ${p.nroDocumento || ""} ${p.celular || p.celularPaciente || ""
        } ${p.email || ""}`.toLowerCase();
      return blob.includes(t);
    });
  }, [pacientes, term]);

  /* ======= UI ======= */
  const [selectedPatient, setSelectedPatient] = useState(null);

  return (
    <div className="relative w-full h-[calc(100vh-64px)] overflow-hidden flex flex-col bg-slate-50/50">
      {!selectedPatient ? (
        <PatientList
          pacientes={pacientes}
          loading={loading}
          hasMore={false}
          onLoadMore={() => { }}
          onSelect={setSelectedPatient}
          searchTerm={term}
          onSearchChange={setTerm}
          onCreateNew={handleOpenNew}
          onDelete={handleDelete}
          onEdit={handleOpenEdit}
          onToggleStatus={async (p) => {
            const isCurrentlyActive = p.activo !== false;
            try {
              await updateDoc(doc(db, "pacientes", p.id), { activo: !isCurrentlyActive });
              reloadData();
            } catch (e) { toast.error("Error al cambiar estado"); }
          }}
        />
      ) : (
        <PatientDetails
          initialData={selectedPatient}
          onClose={() => setSelectedPatient(null)}
          onEdit={(p) => {
            handleOpenEdit(p);
            setSelectedPatient(null);
          }}
          onDelete={(p) => {
            handleDelete(p);
            setSelectedPatient(null);
          }}
        />
      )}

      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 md:p-10 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
          <div className="w-full h-full md:max-w-6xl md:max-h-[90vh] overflow-hidden">
            <PatientForm
              initialData={editData}
              onSubmit={handleSubmit}
              onCancel={() => setOpen(false)}
              onDelete={handleDelete}
            />
          </div>
        </div>
      )}
    </div>
  );
}

