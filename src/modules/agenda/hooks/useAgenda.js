import { useState, useEffect, useMemo } from "react";
import { collection, query, orderBy, where, onSnapshot, addDoc, updateDoc, deleteDoc, doc, arrayUnion, setDoc, or } from "firebase/firestore";
import { db } from "../../../firebase/firebaseConfig";
import { useAuth } from "../../../context/AuthContext";
import { createOrUpdatePatient } from "../../../services/patientService";

// Utils
const startOfDay = (d) => { const x = new Date(d); x.setHours(0, 0, 0, 0); return x; };
const endOfDay = (d) => { const x = new Date(d); x.setHours(23, 59, 59, 999); return x; };
const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
const startOfWeek = (d) => {
    const x = new Date(d);
    const day = x.getDay();
    const diff = (day === 0 ? -6 : 1) - day;
    x.setDate(x.getDate() + diff);
    x.setHours(0, 0, 0, 0);
    return x;
};

export function useAgenda() {
    const { userProfile } = useAuth();
    const inquilino = userProfile?.inquilino;

    const [selectedDate, setSelectedDate] = useState(startOfDay(new Date()));
    const [viewMode, setViewMode] = useState("day"); // 'day', 'week'
    const [loading, setLoading] = useState(true);
    const [appointments, setAppointments] = useState([]);

    // Catalogs
    const [doctors, setDoctors] = useState([]);
    const [chairs, setChairs] = useState([]);
    const [branches, setBranches] = useState([]);
    const [specialties, setSpecialties] = useState([]);
    const [entities, setEntities] = useState([]);
    const [priceList, setPriceList] = useState([]);

    // Filters
    const [filterDocId, setFilterDocId] = useState("");
    const [filterBranchId, setFilterBranchId] = useState("");

    // === Load Catalogs ===
    useEffect(() => {
        if (!inquilino) return;

        // Fetch doctors: We query all users for the tenant and filter client-side.
        // This ensures we catch anyone marked as doctor (esDoctor == true OR by role/profile) 
        // even if the exact boolean field is missing in older records.
        const unsubDocs = onSnapshot(query(
            collection(db, "usuarios"), 
            or(
                where("inquilino", "==", inquilino),
                where("tenantId", "==", inquilino)
            )
        ), snap => {
            setDoctors(
                snap.docs
                    .map(d => {
                        const data = d.data();
                        return { 
                            id: d.id, 
                            ...data 
                        };
                    })
                    .filter(u => u.activo !== false) // Active users only
                    .filter(u => 
                        u.esDoctor === true || 
                        (typeof u.rol === 'string' && ['doctor', 'odontologo', 'especialista'].includes(u.rol.toLowerCase())) ||
                        (typeof u.profileName === 'string' && u.profileName.toLowerCase().includes('octor'))
                    )
            );
        });
        const unsubChairs = onSnapshot(query(collection(db, "consultorios"), where("inquilino", "==", inquilino)), snap => {
            setChairs(snap.docs.map(d => ({ id: d.id, ...d.data() })).filter(c => c.activo !== false));
        });
        const unsubBranches = onSnapshot(query(collection(db, "sucursales"), where("inquilino", "==", inquilino)), snap => {
            setBranches(snap.docs.map(d => ({ id: d.id, ...d.data() })).filter(b => b.activo !== false));
        });
        const unsubSpecs = onSnapshot(query(collection(db, "especialidades"), where("inquilino", "==", inquilino)), snap => {
            setSpecialties(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        });
        const unsubEntities = onSnapshot(query(collection(db, "entidades"), where("inquilino", "==", inquilino)), snap => {
            setEntities(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        });
        const unsubPrices = onSnapshot(query(collection(db, "precios"), where("inquilino", "==", inquilino)), snap => {
            setPriceList(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        });

        return () => {
            unsubDocs(); unsubChairs(); unsubBranches();
            unsubSpecs(); unsubEntities(); unsubPrices();
        };
    }, [inquilino]);

    // === Load Appointments ===
    useEffect(() => {
        if (!inquilino) {
            setLoading(false);
            return;
        }

        setLoading(true);
        let start, end;
        if (viewMode === 'day') {
            start = startOfDay(selectedDate);
            end = endOfDay(selectedDate);
        } else {
            start = startOfWeek(selectedDate);
            end = addDays(start, 6);
            end.setHours(23, 59, 59, 999);
        }

        console.log("useAgenda - Fetching appointments for range:", { start, end, inquilino });

        const q = query(
            collection(db, "citas"),
            where("inquilino", "==", inquilino)
        );

        const unsub = onSnapshot(q, (snap) => {
            console.log("useAgenda - Snapshot received. docs:", snap.docs.length);
            const raw = snap.docs.map(d => {
                const data = d.data();
                let dateObj = null;
                if (data.fecha?.toDate) dateObj = data.fecha.toDate();
                else if (typeof data.fecha === 'string') {
                    const [y, m, d] = data.fecha.split("-").map(Number);
                    const [hh, mm] = (data.horaInicio || "00:00").split(":").map(Number);
                    dateObj = new Date(y, m - 1, d, hh, mm);
                }

                return {
                    id: d.id,
                    ...data,
                    start: dateObj,
                    end: new Date((dateObj?.getTime() || 0) + ((data.duracion || 30) * 60000)),
                    resourceId: data.doctorId
                };
            });

            const visible = raw.filter(ev => {
                const inRange = ev.start >= start && ev.start <= end;
                const matchDoc = !filterDocId || ev.doctorId === filterDocId;
                const matchBranch = !filterBranchId || ev.sucursalId === filterBranchId;
                return inRange && matchDoc && matchBranch;
            }).sort((a, b) => (a.start || 0) - (b.start || 0));

            console.log("useAgenda - Visible appointments:", visible.length);
            setAppointments(visible);
            setLoading(false);
        }, (err) => {
            console.error("useAgenda - Snapshot error:", err);
            setLoading(false);
        });

        return () => unsub();
    }, [selectedDate, viewMode, inquilino, filterDocId, filterBranchId]);

    // Actions
    const createAppointment = async (data) => {
        const y = data.start.getFullYear();
        const m = String(data.start.getMonth() + 1).padStart(2, '0');
        const d = String(data.start.getDate()).padStart(2, '0');
        const hh = String(data.start.getHours()).padStart(2, '0');
        const mm = String(data.start.getMinutes()).padStart(2, '0');

        let pacienteId = data.pacienteId;

        // Si es un paciente nuevo desde la agenda, creamos el registro base en la colección de pacientes
        if (data.isNewPatient && !pacienteId) {
            try {
                // Preparamos los datos mínimos para el paciente
                const newPatientData = {
                    nombres: data.nombres,
                    apellidos: data.apellidos,
                    nombreCompleto: `${data.nombres} ${data.apellidos}`,
                    tipoDocumento: data.tipoDocumento,
                    nroDocumento: data.nroDocumento,
                    celular: data.celular,
                    email: data.email || "",
                    fechaNacimiento: data.fechaNacimiento,
                    sexo: data.sexo === 'M' ? 'Masculino' : data.sexo === 'F' ? 'Femenino' : 'Otros',
                    estadoCivil: "",
                    paisNacimiento: "Colombia",
                    ciudadNacimiento: "",
                    paisDomicilio: "Colombia",
                    ciudadDomicilio: "",
                    barrio: "",
                    lugarResidencia: "",
                    ocupacion: "",
                    activo: true,
                    registroCompleto: false // Marcamos que le falta información
                };
                
                const created = await createOrUpdatePatient(inquilino, newPatientData, true);
                pacienteId = created.id;
            } catch (err) {
                console.error("Error creating patient from agenda:", err);
                // Si falla la creación del paciente (ej: ya existe), lanzamos el error
                throw err;
            }
        }

        const rawPayload = {
            ...data,
            inquilino,
            pacienteId, // Usamos el ID nuevo o el existente
            fecha: `${y}-${m}-${d}`,
            horaInicio: `${hh}:${mm}`,
            creado: new Date().toISOString()
        };

        const payload = Object.fromEntries(
            Object.entries(rawPayload).filter(([_, v]) => v !== undefined)
        );

        const ref = await addDoc(collection(db, "citas"), payload);
        if (pacienteId) {
            await updateDoc(doc(db, "pacientes", pacienteId), {
                citas: arrayUnion(ref.id)
            });
        }
        return ref.id;
    };

    const updateAppointment = async (id, patch) => {
        let finalPatch = { ...patch };

        // Synchronize string fields if start date is updated (e.g. via drag & drop)
        if (patch.start && patch.start instanceof Date) {
            const y = patch.start.getFullYear();
            const m = String(patch.start.getMonth() + 1).padStart(2, '0');
            const d = String(patch.start.getDate()).padStart(2, '0');
            const hh = String(patch.start.getHours()).padStart(2, '0');
            const mm = String(patch.start.getMinutes()).padStart(2, '0');

            finalPatch.fecha = `${y}-${m}-${d}`;
            finalPatch.horaInicio = `${hh}:${mm}`;
        }

        const cleanPatch = Object.fromEntries(
            Object.entries(finalPatch).filter(([_, v]) => v !== undefined)
        );
        await updateDoc(doc(db, "citas", id), cleanPatch);
    };

    const deleteAppointment = async (id) => {
        await deleteDoc(doc(db, "citas", id));
    };

    return {
        selectedDate, setSelectedDate,
        viewMode, setViewMode,
        loading, appointments,
        doctors, chairs, branches,
        specialties, entities, priceList,
        createAppointment, updateAppointment, deleteAppointment,
        filters: { filterDocId, setFilterDocId, filterBranchId, setFilterBranchId }
    };
}
