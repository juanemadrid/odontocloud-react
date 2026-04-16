import { db } from "../firebase/firebaseConfig";
import {
    collection,
    addDoc,
    deleteDoc,
    doc,
    query,
    where,
    orderBy,
    getDocs,
    Timestamp
} from "firebase/firestore";

const COLLECTION = "clinical_evolutions";

/**
 * Adds a new clinical evolution
 */
export const addEvolution = async (evolutionData) => {
    try {
        const data = {
            ...evolutionData,
            createdAt: Timestamp.now(),
            date: evolutionData.date ? Timestamp.fromDate(new Date(evolutionData.date)) : Timestamp.now()
        };
        const docRef = await addDoc(collection(db, COLLECTION), data);
        return { id: docRef.id, ...data };
    } catch (error) {
        console.error("Error adding evolution:", error);
        throw error;
    }
};

/**
 * Get all evolutions for a specific patient
 */
export const getEvolutionsByPatient = async (patientId) => {
    try {
        const q = query(
            collection(db, COLLECTION),
            where("patientId", "==", patientId),
            orderBy("date", "desc")
        );
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            // Convert timestamps for UI
            date: doc.data().date?.toDate()
        }));
    } catch (error) {
        console.error("Error getting evolutions:", error);
        throw error;
    }
};

/**
 * Delete an evolution (Restricted)
 */
export const deleteEvolution = async (id) => {
    try {
        await deleteDoc(doc(db, COLLECTION, id));
    } catch (error) {
        console.error("Error deleting evolution:", error);
        throw error;
    }
};
