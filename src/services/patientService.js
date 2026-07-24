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
    serverTimestamp,
    getCountFromServer
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

export const getPatientsCount = async (inquilino) => {
    if (!inquilino) return 0;
    try {
        const q = query(
            collection(db, "pacientes"),
            where("inquilino", "==", inquilino)
        );
        const snap = await getCountFromServer(q);
        return snap.data().count || 0;
    } catch (e) {
        console.warn("Error calculando el número total de pacientes:", e);
        return 0;
    }
};

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
        console.warn("Firestore Query Error (orderBy actualizado). Usando fallback seguro sin índice compuesto.", e);

        // Fallback: Consulta paginada básica por inquilino
        try {
            let qFallback;
            if (!lastDoc) {
                qFallback = query(
                    collection(db, "pacientes"),
                    where("inquilino", "==", inquilino),
                    limit(pageSize)
                );
            } else {
                qFallback = query(
                    collection(db, "pacientes"),
                    where("inquilino", "==", inquilino),
                    orderBy("__name__"),
                    startAfter(lastDoc),
                    limit(pageSize)
                );
            }
            const snap = await getDocs(qFallback);
            let patients = snap.docs.map(d => ({ id: d.id, ...d.data() }));

            // Ordenamiento local sobre la página actual
            patients.sort((a, b) => {
                const ta = a.actualizado?.seconds || a.creado?.seconds || a.createdAt?.seconds || 0;
                const tb = b.actualizado?.seconds || b.creado?.seconds || b.createdAt?.seconds || 0;
                return tb - ta;
            });

            return { patients, lastDoc: snap.docs[snap.docs.length - 1] || null, hasMore: snap.size === pageSize };
        } catch (e2) {
            console.error("Error en fallback de getPatientsPage:", e2);
            return { patients: [], lastDoc: null, hasMore: false };
        }
    }
};

export const searchPatients = async (inquilino, searchTerm, maxResults = 30) => {
    if (!inquilino) return [];
    const rawTerm = (searchTerm || "").trim();
    const term = normalize(rawTerm);
    if (!term) return [];

    try {
        const isNumeric = /^\d+$/.test(term);
        const resultsMap = new Map();

        // 1. Crear lote de consultas paralelas sobre campos indexados clave
        const queries = [];

        if (isNumeric) {
            queries.push(
                query(
                    collection(db, "pacientes"),
                    where("inquilino", "==", inquilino),
                    where("nroDocumento", "==", rawTerm),
                    limit(maxResults)
                )
            );
            queries.push(
                query(
                    collection(db, "pacientes"),
                    where("inquilino", "==", inquilino),
                    where("celular", "==", rawTerm),
                    limit(maxResults)
                )
            );
        }

        queries.push(
            query(
                collection(db, "pacientes"),
                where("inquilino", "==", inquilino),
                where("nombreCompletoLower", ">=", term),
                where("nombreCompletoLower", "<=", term + "\uf8ff"),
                limit(maxResults)
            )
        );
        queries.push(
            query(
                collection(db, "pacientes"),
                where("inquilino", "==", inquilino),
                where("nombresLower", ">=", term),
                where("nombresLower", "<=", term + "\uf8ff"),
                limit(maxResults)
            )
        );
        queries.push(
            query(
                collection(db, "pacientes"),
                where("inquilino", "==", inquilino),
                where("apellidosLower", ">=", term),
                where("apellidosLower", "<=", term + "\uf8ff"),
                limit(maxResults)
            )
        );
        queries.push(
            query(
                collection(db, "pacientes"),
                where("inquilino", "==", inquilino),
                where("documentoLower", ">=", term),
                where("documentoLower", "<=", term + "\uf8ff"),
                limit(maxResults)
            )
        );
        queries.push(
            query(
                collection(db, "pacientes"),
                where("inquilino", "==", inquilino),
                where("emailLower", ">=", term),
                where("emailLower", "<=", term + "\uf8ff"),
                limit(maxResults)
            )
        );

        const snapshots = await Promise.allSettled(queries.map(q => getDocs(q)));

        snapshots.forEach(res => {
            if (res.status === "fulfilled" && res.value && !res.value.empty) {
                res.value.docs.forEach(docSnap => {
                    if (!resultsMap.has(docSnap.id)) {
                        resultsMap.set(docSnap.id, { id: docSnap.id, ...docSnap.data() });
                    }
                });
            }
        });

        // 2. Fallback acotado a 50 registros por si hay pacientes antiguos sin campos *_Lower
        if (resultsMap.size === 0) {
            const qFallback = query(
                collection(db, "pacientes"),
                where("inquilino", "==", inquilino),
                limit(50)
            );
            const snap = await getDocs(qFallback);
            snap.docs.forEach(d => {
                const p = { id: d.id, ...d.data() };
                const blob = normalize(
                    `${p.nombreCompleto || p.paciente || ""} ${p.nombres || ""} ${p.apellidos || ""} ${p.nroDocumento || p.documento || ""} ${p.celular || p.celularPaciente || ""} ${p.email || ""}`
                );
                if (blob.includes(term)) {
                    resultsMap.set(p.id, p);
                }
            });
        }

        return Array.from(resultsMap.values()).slice(0, maxResults);
    } catch (err) {
        console.error("Error en searchPatients:", err);
        return [];
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
