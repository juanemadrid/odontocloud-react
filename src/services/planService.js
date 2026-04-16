import { db } from "../firebase/firebaseConfig";
import {
    collection,
    addDoc,
    updateDoc,
    doc,
    query,
    where,
    orderBy,
    getDocs,
    deleteDoc,
    Timestamp
} from "firebase/firestore";

const COLLECTION = "treatment_plans";

/**
 * Creates a new treatment plan
 */
export const createPlan = async (planData) => {
    try {
        const data = {
            ...planData,
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
            status: planData.status || "draft",
            type: planData.type || "presupuesto" // "presupuesto" o "plan"
        };
        const docRef = await addDoc(collection(db, COLLECTION), data);
        return { id: docRef.id, ...data };
    } catch (error) {
        console.error("Error creating plan:", error);
        throw error;
    }
};

/**
 * Get all plans for a specific patient
 */
export const getPlansByPatient = async (patientId) => {
    try {
        // ✅ FIXED: Removed orderBy to avoid Firebase composite index requirement
        // Sorting is now done client-side
        const q = query(
            collection(db, COLLECTION),
            where("patientId", "==", patientId)
        );
        const snapshot = await getDocs(q);
        const plans = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            // Convert timestamps
            date: doc.data().createdAt?.toDate()
        }));

        // Sort client-side by createdAt (newest first)
        return plans.sort((a, b) => {
            const dateA = a.createdAt?.toMillis() || a.date?.getTime() || 0;
            const dateB = b.createdAt?.toMillis() || b.date?.getTime() || 0;
            return dateB - dateA;
        });
    } catch (error) {
        console.error("Error getting plans:", error);
        throw error;
    }
};

/**
 * Updates a treatment plan
 */
export const updatePlan = async (planId, planData) => {
    try {
        const ref = doc(db, COLLECTION, planId);
        const data = {
            ...planData,
            updatedAt: Timestamp.now()
        };
        await updateDoc(ref, data);
        return { id: planId, ...data };
    } catch (error) {
        console.error("Error updating plan:", error);
        throw error;
    }
};

/**
 * Deletes a treatment plan
 */
export const deletePlan = async (planId) => {
    try {
        const ref = doc(db, COLLECTION, planId);
        await deleteDoc(ref);
    } catch (error) {
        console.error("Error deleting plan:", error);
        throw error;
    }
};

/**
 * Update plan status
 */
export const updatePlanStatus = async (planId, status) => {
    try {
        const ref = doc(db, COLLECTION, planId);
        await updateDoc(ref, {
            status,
            updatedAt: Timestamp.now()
        });
    } catch (error) {
        console.error("Error updating plan:", error);
        throw error;
    }
};
