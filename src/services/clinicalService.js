import { collection, doc, setDoc, getDoc, updateDoc, serverTimestamp, query, where, getDocs, orderBy, limit, onSnapshot } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";

const PATIENTS_COLLECTION = "pacientes";
const CLINICAL_HISTORY_SUBCOLLECTION = "historia_clinica";

// --- ANAMNESIS ---
export const saveAnamnesis = async (patientId, data) => {
    if (!patientId) throw new Error("Patient ID is required");
    try {
        const ref = doc(db, PATIENTS_COLLECTION, patientId, CLINICAL_HISTORY_SUBCOLLECTION, "anamnesis");
        await setDoc(ref, {
            ...data,
            updatedAt: serverTimestamp()
        }, { merge: true });
        return true;
    } catch (error) {
        console.error("Error saving anamnesis:", error);
        throw error;
    }
};

export const getAnamnesis = async (patientId) => {
    if (!patientId) return null;
    try {
        const ref = doc(db, PATIENTS_COLLECTION, patientId, CLINICAL_HISTORY_SUBCOLLECTION, "anamnesis");
        const snap = await getDoc(ref);
        return snap.exists() ? snap.data() : {};
    } catch (error) {
        console.error("Error fetching anamnesis:", error);
        return {};
    }
};

// --- PHYSICAL EXAM ---
export const savePhysicalExam = async (patientId, data) => {
    if (!patientId) throw new Error("Patient ID is required");
    try {
        const ref = doc(db, PATIENTS_COLLECTION, patientId, CLINICAL_HISTORY_SUBCOLLECTION, "examen_fisico");
        await setDoc(ref, {
            ...data,
            updatedAt: serverTimestamp()
        }, { merge: true });
        return true;
    } catch (error) {
        console.error("Error saving physical exam:", error);
        throw error;
    }
};

export const getPhysicalExam = async (patientId) => {
    if (!patientId) return null;
    try {
        const ref = doc(db, PATIENTS_COLLECTION, patientId, CLINICAL_HISTORY_SUBCOLLECTION, "examen_fisico");
        const snap = await getDoc(ref);
        return snap.exists() ? snap.data() : {};
    } catch (error) {
        console.error("Error fetching physical exam:", error);
        return {};
    }
};

// --- ODONTOGRAM SNAPSHOTS ---
export const saveOdontogramSnapshot = async (patientId, type, data) => {
    if (!patientId) throw new Error("Patient ID is required");
    try {
        // We might want to keep history of changes, or just the current state.
        // For now, let's save the current state per type (initial, plan, evolution)
        const ref = doc(db, PATIENTS_COLLECTION, patientId, CLINICAL_HISTORY_SUBCOLLECTION, `odontograma_${type}`);
        await setDoc(ref, {
            ...data,
            updatedAt: serverTimestamp()
        });
        return true;
    } catch (error) {
        console.error("Error saving odontogram:", error);
        throw error;
    }
};

export const getOdontogramSnapshot = async (patientId, type) => {
    if (!patientId) return null;
    try {
        const ref = doc(db, PATIENTS_COLLECTION, patientId, CLINICAL_HISTORY_SUBCOLLECTION, `odontograma_${type}`);
        const snap = await getDoc(ref);
        return snap.exists() ? snap.data() : {};
    } catch (error) {
        console.error("Error fetching odontogram:", error);
        return {};
    }
};

export const subscribeToOdontogramSnapshot = (patientId, type, callback) => {
    if (!patientId) return () => { };
    const ref = doc(db, PATIENTS_COLLECTION, patientId, CLINICAL_HISTORY_SUBCOLLECTION, `odontograma_${type}`);
    return onSnapshot(ref, (snap) => {
        callback(snap.exists() ? snap.data() : {});
    });
};
