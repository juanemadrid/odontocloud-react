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
        const q = query(
            collection(db, "pacientes"),
            where("inquilino", "==", inquilino),
            where("nombreCompletoLower", ">=", term),
            where("nombreCompletoLower", "<=", term + "\uf8ff"),
            limit(20)
        );
        const snap = await getDocs(q);
        return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (err) {
        console.warn("searchPatients: Composite index might be missing. Using client-side fallback.", err);
        try {
            // Fallback: Fetch all patients for this inquilino (usually fast for a single tenant)
            const qFallback = query(
                collection(db, "pacientes"),
                where("inquilino", "==", inquilino)
            );
            const snap = await getDocs(qFallback);
            const allPatients = snap.docs.map(d => ({ id: d.id, ...d.data() }));
            
            // Client-side filtering with robust fallback for missing nombreCompletoLower
            return allPatients.filter(p => {
                const nameLower = p.nombreCompletoLower || normalize(p.nombreCompleto || p.paciente || "");
                return nameLower && nameLower.includes(term);
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
