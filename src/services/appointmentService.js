import {
    collection,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    query,
    where,
    getDocs,
    onSnapshot,
    Timestamp,
    serverTimestamp
} from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";

const APPOINTMENTS_COLLECTION = "citas";

/**
 * Subscribe to appointments for a given date or range
 * @param {Date} date - The focal date
 * @param {string} viewType - 'day' or 'month'
 * @param {Function} callback - Function to receive the data array
 * @returns {Function} unsubscribe function
 */
export const subscribeToAppointments = (inquilino, date, viewType, callback) => {
    if (!inquilino) {
        callback([]);
        return () => { };
    }

    let start, end;

    const d = new Date(date);

    if (viewType === 'month') {
        // Start of month
        start = new Date(d.getFullYear(), d.getMonth(), 1, 0, 0, 0);
        // End of month
        end = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);
    } else {
        // Start of day
        start = new Date(d);
        start.setHours(0, 0, 0, 0);
        // End of day
        end = new Date(d);
        end.setHours(23, 59, 59, 999);
    }

    const q = query(
        collection(db, APPOINTMENTS_COLLECTION),
        where("inquilino", "==", inquilino),
        where("start", ">=", Timestamp.fromDate(start)),
        where("start", "<=", Timestamp.fromDate(end))
    );

    return onSnapshot(q, (snapshot) => {
        const appointments = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                // Convert Firestore Timestamps to JS Dates for UI
                start: data.start?.toDate(),
                end: data.end?.toDate()
            };
        });
        callback(appointments);
    }, (error) => {
        console.error("Error fetching appointments:", error);
        callback([]); // Fail gracefully
    });
};

export const checkConflict = async (inquilino, doctorId, start, end, excludeId = null) => {
    if (!inquilino) return false;

    // Basic query: Same doctor, overlapping time
    // Overlap logic: (StartA <= EndB) and (EndA >= StartB)
    // Firestore lacks simple OR or efficient interval overlap queries directly easily without multiple queries.
    // Strategy: Fetch doctor's appointments for that day and filter in JS (dataset is small per doctor/day).

    const dayStart = new Date(start);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(start);
    dayEnd.setHours(23, 59, 59, 999);

    const q = query(
        collection(db, APPOINTMENTS_COLLECTION),
        where("inquilino", "==", inquilino),
        where("doctorId", "==", doctorId),
        where("start", ">=", Timestamp.fromDate(dayStart)),
        where("start", "<=", Timestamp.fromDate(dayEnd))
    );

    const snap = await getDocs(q);

    const hasConflict = snap.docs.some(doc => {
        if (excludeId && doc.id === excludeId) return false;

        const data = doc.data();
        const existingStart = data.start.toDate().getTime();
        const existingEnd = data.end.toDate().getTime();
        const newStart = start.getTime();
        const newEnd = end.getTime();

        return (newStart < existingEnd && newEnd > existingStart);
    });

    return hasConflict;
};

export const createAppointment = async (inquilino, appointmentData) => {
    if (!inquilino) throw new Error("Tenant ID requerido");
    const { doctorId, start, end } = appointmentData;

    // 1. Validation
    if (!doctorId || !start || !end) throw new Error("Datos incompletos");
    if (start >= end) throw new Error("La hora de inicio debe ser anterior al fin");

    // 2. Conflict Check
    const isConflict = await checkConflict(inquilino, doctorId, start, end);
    if (isConflict) throw new Error("El doctor ya tiene una cita en ese horario.");

    // 3. Save
    const payload = {
        ...appointmentData,
        inquilino, // Force inquilino
        start: Timestamp.fromDate(start),
        end: Timestamp.fromDate(end),
        createdAt: serverTimestamp(),
        status: "confirmed"
    };

    const ref = await addDoc(collection(db, APPOINTMENTS_COLLECTION), payload);
    return { id: ref.id, ...payload };
};

export const updateAppointment = async (inquilino, id, appointmentData) => {
    if (!inquilino) throw new Error("Tenant ID requerido");
    const { doctorId, start, end } = appointmentData;

    // Conflict Check (excluding self)
    if (doctorId && start && end) {
        const isConflict = await checkConflict(inquilino, doctorId, start, end, id);
        if (isConflict) throw new Error("Conflicto de horario al actualizar.");
    }

    const payload = { ...appointmentData };

    // If updating dates, convert to Timestamp
    if (start instanceof Date) payload.start = Timestamp.fromDate(start);
    if (end instanceof Date) payload.end = Timestamp.fromDate(end);

    payload.updatedAt = serverTimestamp();

    await updateDoc(doc(db, APPOINTMENTS_COLLECTION, id), payload);
    return { id, ...payload };
};

export const deleteAppointment = async (id) => {
    // Ideally check inquilino ownership, but typically ID is obscure enough or rules handle it.
    await deleteDoc(doc(db, APPOINTMENTS_COLLECTION, id));
};
