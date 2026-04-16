import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
// Acceso al contexto de auth para saber quién edita (si existe, o placeholder)
// import { useAuth } from "../context/AuthContext"; // Asumiremos esto o pasaremos usuario manual

export function useAudit() {

    // const { user } = useAuth(); // Idealmente

    const logAction = async (patientId, actionType, details, userId = "unknown", userName = "Sistema") => {
        try {
            await addDoc(collection(db, "audit_logs"), {
                patientId,
                action: actionType, // e.g., "UPDATE_HISTORY"
                details, // Object with { changes, oldVal, newVal }
                timestamp: serverTimestamp(),
                performedBy: {
                    uid: userId,
                    name: userName
                },
                deviceInfo: navigator.userAgent
            });
            console.log("Audit log create:", actionType);
        } catch (error) {
            console.error("Error creating audit log:", error);
            // No bloquear la app si falla el log, pero reportar
        }
    };

    return { logAction };
}
