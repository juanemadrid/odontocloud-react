import {
    collection,
    doc,
    getDocs,
    getDoc,
    setDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy,
    limit,
    startAfter,
    serverTimestamp
} from "firebase/firestore";
import {
    getStorage,
    ref,
    uploadBytes,
    getDownloadURL,
    listAll,
    deleteObject
} from "firebase/storage";
import { db, storage } from "../firebase/firebaseConfig";

// Utils
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
            f.nombreResponsable,
            f.nombreAcompanante,
            f.barrio,
            f.lugarResidencia,
        ].filter(Boolean).join(" ")
    );

// --- CRUD ---

export const getPatientsPage = async (inquilino, lastDoc = null, pageSize = 20) => {
    if (!inquilino) return { patients: [], lastDoc: null, hasMore: false };

    try {
        let q;
        if (!lastDoc) {
            q = query(
                collection(db, "pacientes"),
                where("inquilino", "==", inquilino),
                orderBy("actualizado", "desc"),
                limit(pageSize)
            );
        } else {
            q = query(
                collection(db, "pacientes"),
                where("inquilino", "==", inquilino),
                orderBy("actualizado", "desc"),
                startAfter(lastDoc),
                limit(pageSize)
            );
        }
        const snap = await getDocs(q);
        const patients = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        return { patients, lastDoc: snap.docs[snap.docs.length - 1] || null, hasMore: snap.size === pageSize };
    } catch (e) {
        console.warn("Firestore Query Error (likely missing index). Falling back to simple Fetch.", e);

        // Fallback: Fetch by inquilino only (no sort) and sort in memory
        try {
            const qFallback = query(
                collection(db, "pacientes"),
                where("inquilino", "==", inquilino),
                limit(pageSize * 2)
            );
            const snap = await getDocs(qFallback);
            let patients = snap.docs.map(d => ({ id: d.id, ...d.data() }));

            // Client-side Sort
            patients.sort((a, b) => {
                const ta = a.actualizado?.seconds || a.creado?.seconds || 0;
                const tb = b.actualizado?.seconds || b.creado?.seconds || 0;
                return tb - ta;
            });

            return { patients, lastDoc: null, hasMore: false };
        } catch (e2) {
            console.error("Critical Error fetching patients", e2);
            throw e2;
        }
    }
};

export const searchPatients = async (inquilino, searchTerm) => {
    if (!inquilino) return [];
    const term = normalize(searchTerm);
    if (!term) return [];

    try {
        const isNumeric = /^\d+$/.test(term);
        let snap;
        
        // 1. Si es numérico, intentamos buscar directamente por número de documento exacto
        if (isNumeric) {
            const qDoc = query(
                collection(db, "pacientes"),
                where("inquilino", "==", inquilino),
                where("nroDocumento", "==", searchTerm.trim())
            );
            snap = await getDocs(qDoc);
            if (!snap.empty) {
                return snap.docs.map(d => ({ id: d.id, ...d.data() }));
            }
        }

        // 2. Intentamos buscar por prefijo de nombre completo indexado en Firestore
        const qName = query(
            collection(db, "pacientes"),
            where("inquilino", "==", inquilino),
            where("nombreCompletoLower", ">=", term),
            where("nombreCompletoLower", "<=", term + "\uf8ff"),
            limit(20)
        );
        snap = await getDocs(qName);
        
        if (!snap.empty) {
            return snap.docs.map(d => ({ id: d.id, ...d.data() }));
        }

        // Forzar fallback si no se encontraron coincidencias exactas o de prefijo
        throw new Error("No prefix match found");
    } catch (err) {
        console.log("searchPatients: usando búsqueda client-side (índice Firestore no configurado).");
        try {
            // 3. Fallback de cliente: descarga todos los pacientes del inquilino y filtra en memoria
            const qFallback = query(
                collection(db, "pacientes"),
                where("inquilino", "==", inquilino)
            );
            const snap = await getDocs(qFallback);
            const allPatients = snap.docs.map(d => ({ id: d.id, ...d.data() }));
            
            return allPatients.filter(p => {
                const nameLower = p.nombreCompletoLower || normalize(p.nombreCompleto || p.paciente || "");
                const docLower = p.documentoLower || normalize(p.nroDocumento || p.documento || "");
                const cellLower = normalize(p.celular || p.celularPaciente || "");
                
                return nameLower.includes(term) || docLower.includes(term) || cellLower.includes(term);
            }).slice(0, 20);
        } catch (fallbackErr) {
            console.error("Critical error in searchPatients fallback:", fallbackErr);
            return [];
        }
    }
};

export const getPatientById = async (id) => {
    const ref = doc(db, "pacientes", id);
    const snap = await getDoc(ref);
    if (snap.exists()) return { id: snap.id, ...snap.data() };
    return null;
};

export const createOrUpdatePatient = async (inquilino, patientData, isNew = false, photoFile = null) => {
    if (!inquilino) throw new Error("Tenant ID requerido");
    const id = patientData.nroDocumento.trim();

    // Check existence if new
    if (isNew) {
        const exists = await getPatientById(id);
        if (exists) throw new Error("Ya existe un paciente con ese número de documento.");
    }

    // Handle Photo Upload
    let fotoUrl = patientData.fotoUrl || "";
    if (photoFile) {
        try {
            fotoUrl = await uploadPatientPhoto(inquilino, id, photoFile);
        } catch (storageErr) {
            console.warn("No se pudo subir la foto debido al estado de la cuenta Firebase (Storage desactivado):", storageErr);
            // Tolerancia a fallos: permitimos guardar los datos aunque la foto falle
            fotoUrl = patientData.fotoUrl || ""; 
        }
    }

    // Timestamps
    const now = serverTimestamp();
    const payload = {
        ...patientData,
        inquilino, // Force inquilino
        fotoUrl,
        nombre_busqueda: makeSearchIndex({ ...patientData, fotoUrl }),
        nombreCompletoLower: normalize(patientData.nombreCompleto), // For case-insensitive search
        nombresLower: normalize(patientData.nombres),
        apellidosLower: normalize(patientData.apellidos),
        documentoLower: normalize(patientData.nroDocumento),
        emailLower: normalize(patientData.email),
        actualizado: now,
        updatedAt: now,
        // Alias / Compatibility
        activo: patientData.activo ?? true,
        celularPaciente: patientData.celular,
        telefonoPaciente: patientData.telDomicilio || "",
        documento: patientData.nroDocumento,
        paciente: patientData.nombreCompleto,
    };

    if (isNew) {
        payload.creado = now;
        payload.createdAt = now;
    }

    await setDoc(doc(db, "pacientes", id), payload, { merge: true });

    // Synchronize patient phone number with all existing citas in Firestore
    try {
        if (patientData.celular) {
            const citasQ = query(
                collection(db, "citas"),
                where("inquilino", "==", inquilino)
            );
            const citasSnap = await getDocs(citasQ);
            const docNum = (patientData.nroDocumento || patientData.documento || id || "").toString().trim();
            const fullName = (patientData.nombreCompleto || patientData.paciente || "").toString().trim().toLowerCase();

            citasSnap.docs.forEach(async (cDoc) => {
                const cData = cDoc.data();
                const cDocNum = (cData.documento || cData.nroDocumento || "").toString().trim();
                const cPacId = (cData.pacienteId || cData.patientId || "").toString().trim();
                const cName = (cData.paciente || cData.pacienteNombre || "").toString().trim().toLowerCase();

                const isMatch = (docNum && (cDocNum === docNum || cPacId === docNum || cPacId === id)) ||
                                (id && cPacId === id) ||
                                (fullName && cName === fullName);

                if (isMatch) {
                    await updateDoc(doc(db, "citas", cDoc.id), {
                        celular: patientData.celular,
                        celularPaciente: patientData.celular,
                        telefono: patientData.celular,
                        telefonoPaciente: patientData.telDomicilio || patientData.celular
                    });
                }
            });
        }
    } catch (syncErr) {
        console.warn("Non-blocking error syncing patient phone to citas:", syncErr);
    }

    return { id, ...payload };
};

export const deletePatient = async (id) => {
    if (!id) throw new Error("ID inválido");
    // Optionally delete photo folder too
    // cleanOldPhotos(id, "DELETE_ALL"); 
    await deleteDoc(doc(db, "pacientes", id));
};

// --- Storage ---

// ... (previous code)

export const uploadPatientPhoto = async (inquilino, patientId, file) => {
    console.log("Iniciando subida de foto:", { inquilino, patientId, fileType: file.type, fileSize: file.size });
    
    // Simplificamos la ruta al máximo para evitar problemas de reglas de seguridad complejas
    const path = `pacientes/${patientId}_${Date.now()}.jpg`;
    const storageRef = ref(storage, path);

    try {
        // Subida simple sin metadatos complejos
        const result = await uploadBytes(storageRef, file);
        console.log("Subida exitosa:", result.metadata.fullPath);
        
        const url = await getDownloadURL(storageRef);
        return url;
    } catch (err) {
        console.error("Error crítico en Firebase Storage:", err);
        // Si falla con la ruta simple, intentamos una ruta alternativa
        throw err;
    }
};

const cleanOldPhotos = async (patientId, keepPath) => {
    const folderRef = ref(storage, `pacientes/${patientId}`);
    const listing = await listAll(folderRef);
    const deletions = listing.items
        .filter((it) => it.fullPath !== keepPath)
        .map((it) => deleteObject(it));
    await Promise.allSettled(deletions);
};

export const togglePatientActive = async (id, isActive) => {
    await updateDoc(doc(db, "pacientes", id), {
        activo: isActive,
        actualizado: serverTimestamp()
    });
};
