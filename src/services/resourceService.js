import { collection, query, where, getDocs, onSnapshot, addDoc, updateDoc, doc } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";

const DOCTORS_COLLECTION = "profesionales";
const CHAIRS_COLLECTION = "consultorios";

/**
 * Subscribe to the list of active doctors.
 * @param {Function} callback 
 * @returns {Function} unsubscribe
 */
export const subscribeToDoctors = (inquilino, callback) => {
    if (!inquilino) { callback([]); return () => { }; }
    const q = query(
        collection(db, DOCTORS_COLLECTION),
        where("inquilino", "==", inquilino),
        where("activo", "==", true)
    );
    return onSnapshot(q, (snapshot) => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        callback(data);
    }, (error) => {
        console.error("Error fetching doctors:", error);
        callback([]);
    });
};

export const subscribeToChairs = (inquilino, callback) => {
    if (!inquilino) { callback([]); return () => { }; }
    const q = query(
        collection(db, CHAIRS_COLLECTION),
        where("inquilino", "==", inquilino),
        where("activo", "==", true)
    );
    return onSnapshot(q, (snapshot) => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        callback(data);
    }, (error) => {
        console.error("Error fetching chairs:", error);
        callback([]);
    });
};

export const getDoctors = async (inquilino) => {
    if (!inquilino) return [];
    const q = query(
        collection(db, DOCTORS_COLLECTION),
        where("inquilino", "==", inquilino),
        where("activo", "==", true)
    );
    const snap = await getDocs(q);
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};
const SPECIALTIES_COLLECTION = "especialidades";

export const subscribeToSpecialties = (inquilino, callback) => {
    if (!inquilino) { callback([]); return () => { }; }
    const q = query(
        collection(db, SPECIALTIES_COLLECTION),
        where("inquilino", "==", inquilino),
        where("activo", "==", true)
    );
    return onSnapshot(q, (snapshot) => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        // Sort alphabetically by nombre
        data.sort((a, b) => (a.nombre || "").localeCompare(b.nombre || ""));
        callback(data);
    }, (error) => {
        console.error("Error fetching specialties:", error);
        callback([]);
    });
};

export const createSpecialty = async (inquilino, data) => {
    try {
        await addDoc(collection(db, SPECIALTIES_COLLECTION), {
            ...data,
            inquilino,
            activo: true,
            createdAt: new Date()
        });
        return true;
    } catch (error) {
        console.error("Error creating specialty:", error);
        throw error;
    }
};

export const updateSpecialty = async (id, data) => {
    try {
        const ref = doc(db, SPECIALTIES_COLLECTION, id);
        await updateDoc(ref, data);
        return true;
    } catch (error) {
        console.error("Error updating specialty:", error);
        throw error;
    }
};

export const deleteSpecialty = async (id) => {
    try {
        const ref = doc(db, SPECIALTIES_COLLECTION, id);
        await updateDoc(ref, { activo: false }); // Soft delete
        return true;
    } catch (error) {
        console.error("Error deleting specialty:", error);
        throw error;
    }
};

const CATEGORIES_COLLECTION = "categorias_inventario";

export const subscribeToCategories = (inquilino, callback) => {
    if (!inquilino) { callback([]); return () => { }; }
    const q = query(
        collection(db, CATEGORIES_COLLECTION),
        where("inquilino", "==", inquilino),
        where("activo", "==", true)
    );
    return onSnapshot(q, (snapshot) => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        // Sort alphabetically by nombre
        data.sort((a, b) => (a.nombre || "").localeCompare(b.nombre || ""));
        callback(data);
    }, (error) => {
        console.error("Error fetching categories:", error);
        callback([]);
    });
};

export const createCategory = async (inquilino, data) => {
    try {
        await addDoc(collection(db, CATEGORIES_COLLECTION), {
            ...data,
            inquilino,
            activo: true,
            createdAt: new Date()
        });
        return true;
    } catch (error) {
        console.error("Error creating category:", error);
        throw error;
    }
};

export const updateCategory = async (id, data) => {
    try {
        const ref = doc(db, CATEGORIES_COLLECTION, id);
        await updateDoc(ref, data);
        return true;
    } catch (error) {
        console.error("Error updating category:", error);
        throw error;
    }
};

export const deleteCategory = async (id) => {
    try {
        const ref = doc(db, CATEGORIES_COLLECTION, id);
        await updateDoc(ref, { activo: false }); // Soft delete
        return true;
    } catch (error) {
        console.error("Error deleting category:", error);
        throw error;
    }
};
