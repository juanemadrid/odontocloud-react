import { db, storage, firebaseConfig } from "../firebase/firebaseConfig";
import {
    collection,
    addDoc,
    updateDoc,
    doc,
    query,
    getDocs,
    getDoc,
    where,
    Timestamp,
    setDoc,
    deleteDoc,
    orderBy,
    writeBatch
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, signOut } from "firebase/auth";

// Secondary app for admin user creation without logging out superadmin or main user
// Initialize only once to avoid duplicate app errors
import { getApps } from "firebase/app";
let secondaryApp;
if (getApps().length === 0) {
    secondaryApp = initializeApp(firebaseConfig, "SecondaryAdminApp");
} else {
    secondaryApp = getApps().find(app => app.name === "SecondaryAdminApp") || initializeApp(firebaseConfig, "SecondaryAdminApp");
}
const secondaryAuth = getAuth(secondaryApp);

const TENANTS_COLLECTION = "tenants";
const PLANS_COLLECTION = "subscription_plans";

/**
 * Creates a new Subscription Plan
 * @param {Object} planData { name, maxUsers, monthlyPrice, features: [], allowedRoles: [] }
 */
export const createPlan = async (planData) => {
    try {
        const data = {
            ...planData,
            createdAt: Timestamp.now(),
            active: true
        };
        const docRef = await addDoc(collection(db, PLANS_COLLECTION), data);
        return { id: docRef.id, ...data };
    } catch (error) {
        console.error("Error creating plan:", error);
        throw error;
    }
};

/**
 * Updates an existing Subscription Plan
 */
export const updatePlan = async (planId, updates) => {
    try {
        const ref = doc(db, PLANS_COLLECTION, planId);
        await updateDoc(ref, {
            ...updates,
            updatedAt: Timestamp.now()
        });
    } catch (error) {
        console.error("Error updating plan:", error);
        throw error;
    }
};

/**
 * Delete a Subscription Plan
 */
export const deletePlan = async (planId) => {
    try {
        await deleteDoc(doc(db, PLANS_COLLECTION, planId));
    } catch (error) {
        console.error("Error deleting plan:", error);
        throw error;
    }
};

/**
 * Get all available plans
 */
export const getPlans = async () => {
    try {
        const q = query(collection(db, PLANS_COLLECTION)); // You might want where("active", "==", true)
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error("Error getting plans:", error);
        throw error;
    }
};

/**
 * Register a new Tenant (Clinic)
 * @param {Object} tenantData { name, address, contactEmail, planId }
 */
export const createTenant = async (tenantData) => {
    try {
        // 1. Create Tenant Document
        // Calculate Subscription End Date
        const now = new Date();
        const duration = tenantData.planDuration || "monthly"; // Default to monthly
        const endDate = new Date(now);

        if (duration === "yearly") {
            endDate.setFullYear(endDate.getFullYear() + 1);
        } else {
            endDate.setMonth(endDate.getMonth() + 1);
        }

        const data = {
            ...tenantData,
            planId: tenantData.planId || "basic", // Default plan
            planDuration: duration,
            subscriptionStatus: "active", // active, suspended
            subscriptionEndDate: Timestamp.fromDate(endDate),
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
            features: [] // Will be populated from plan later if needed, or fetched dynamically
        };
        const docRef = await addDoc(collection(db, TENANTS_COLLECTION), data);

        // 2. If Admin User details provided, create the user
        if (tenantData.adminEmail && tenantData.adminPassword) {
            try {
                const userCred = await createUserWithEmailAndPassword(secondaryAuth, tenantData.adminEmail, tenantData.adminPassword);
                const uid = userCred.user.uid;

                // Create user profile linked to this tenant
                await setDoc(doc(db, "usuarios", uid), {
                    uid: uid,
                    email: tenantData.adminEmail,
                    displayName: tenantData.adminName || "Administrador",
                    rol: "administrador",
                    inquilino: docRef.id,
                    createdAt: new Date(),
                    status: "active",
                    permisos: ["all"] // Admin has all permissions within tenant
                });

                // Safe sign out from secondary to clean up session
                await signOut(secondaryAuth);
                console.log("Admin user created for tenant", docRef.id);
            } catch (authErr) {
                console.error("Error creating admin user:", authErr);
                // We don't rollback tenant creation for now.
                // Throwing error here might be good to let UI know.
                // We will return a warning flag
                return { id: docRef.id, ...data, warning: "Tenant created but Admin User failed: " + authErr.message };
            }
        }

        return { id: docRef.id, ...data };
    } catch (error) {
        console.error("Error creating tenant:", error);
        throw error;
    }
};

/**
 * Get all Tenants
 */
export const getTenants = async () => {
    try {
        const q = query(collection(db, TENANTS_COLLECTION));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error("Error getting tenants:", error);
        throw error;
    }
};

/**
 * Update Tenant Plan with Duration
 */
export const updateTenantPlan = async (inquilino, planId, planDuration = "monthly") => {
    try {
        const ref = doc(db, TENANTS_COLLECTION, inquilino);
        await updateDoc(ref, {
            planId,
            planDuration,
            updatedAt: Timestamp.now()
        });
    } catch (error) {
        console.error("Error updating tenant plan:", error);
        throw error;
    }
};

/**
 * Grant 1 Free Month to a Tenant
 */
export const grantFreeMonth = async (inquilino) => {
    try {
        const ref = doc(db, TENANTS_COLLECTION, inquilino);
        const snap = await getDoc(ref);
        if (!snap.exists()) throw new Error("Clínica no encontrada");

        const tenantData = snap.data();
        const currentEnd = tenantData.subscriptionEndDate?.toDate() || new Date();
        const newEnd = new Date(currentEnd);
        newEnd.setDate(newEnd.getDate() + 30); // Add 30 days

        await updateDoc(ref, {
            subscriptionEndDate: Timestamp.fromDate(newEnd),
            subscriptionStatus: "active",
            updatedAt: Timestamp.now()
        });
        return newEnd;
    } catch (error) {
        console.error("Error granting free month:", error);
        throw error;
    }
};

/**
 * Toggle Tenant Status (Active/Suspended)
 */
export const toggleTenantStatus = async (inquilino, currentStatus) => {
    try {
        const newStatus = currentStatus === "active" ? "suspended" : "active";
        const ref = doc(db, TENANTS_COLLECTION, inquilino);
        await updateDoc(ref, {
            status: newStatus,
            updatedAt: Timestamp.now()
        });
        return newStatus;
    } catch (error) {
        console.error("Error toggling tenant status:", error);
        throw error;
    }
};
/**
 * Get all pending subscription requests
 */
export const getSubscriptionRequests = async () => {
    try {
        const q = query(
            collection(db, "subscription_requests"),
            where("status", "==", "pending")
        );
        const snapshot = await getDocs(q);
        const requests = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        return requests;
    } catch (error) {
        console.error("Error getting subscription requests:", error);
        throw error;
    }
};

/**
 * Approve a subscription request and update the tenant's plan
 */
export const approveSubscriptionRequest = async (requestId) => {
    try {
        const reqRef = doc(db, "subscription_requests", requestId);
        const reqSnap = await getDoc(reqRef);

        if (!reqSnap.exists()) throw new Error("Solicitud no encontrada");
        const reqData = reqSnap.data();

        // 1. Update Tenant
        const tenantRef = doc(db, TENANTS_COLLECTION, reqData.inquilino);

        // Calculate new end date based on duration
        const now = new Date();
        const endDate = new Date(now);
        const duration = reqData.planDuration || "monthly";

        if (duration === "yearly") {
            endDate.setFullYear(endDate.getFullYear() + 1);
        } else {
            endDate.setMonth(endDate.getMonth() + 1);
        }

        await updateDoc(tenantRef, {
            planId: reqData.requestedPlanId,
            planDuration: duration,
            subscriptionEndDate: Timestamp.fromDate(endDate),
            subscriptionStatus: "active",
            updatedAt: Timestamp.now()
        });

        // 2. Mark request as completed
        await updateDoc(reqRef, {
            status: "approved",
            approvedAt: Timestamp.now(),
            paymentStatus: "confirmed"
        });

        return { success: true };
    } catch (error) {
        console.error("Error approving request:", error);
        throw error;
    }
};

/**
 * Reject a subscription request
 */
export const rejectSubscriptionRequest = async (requestId, reason = "") => {
    try {
        const ref = doc(db, "subscription_requests", requestId);
        await updateDoc(ref, {
            status: "rejected",
            rejectionReason: reason,
            updatedAt: Timestamp.now()
        });
    } catch (error) {
        console.error("Error rejecting request:", error);
        throw error;
    }
};

/**
 * Completely delete a Tenant and its associated data (Firestore only)
 */
export const deleteTenant = async (inquilino) => {
    try {
        const batch = writeBatch(db);

        // 1. Delete associated users (profiles)
        const qUsers = query(collection(db, "usuarios"), where("inquilino", "==", inquilino));
        const usersSnap = await getDocs(qUsers);
        usersSnap.forEach(uDoc => {
            batch.delete(uDoc.ref);
        });

        // 2. Delete consultorios
        const qCons = query(collection(db, "consultorios"), where("inquilino", "==", inquilino));
        const consSnap = await getDocs(qCons);
        consSnap.forEach(cDoc => {
            batch.delete(cDoc.ref);
        });

        // 3. Delete pacientes
        const qPacs = query(collection(db, "pacientes"), where("inquilino", "==", inquilino));
        const pacsSnap = await getDocs(qPacs);
        pacsSnap.forEach(pDoc => {
            batch.delete(pDoc.ref);
        });

        // 4. Delete citas
        const qCitas = query(collection(db, "citas"), where("inquilino", "==", inquilino));
        const citasSnap = await getDocs(qCitas);
        citasSnap.forEach(ciDoc => {
            batch.delete(ciDoc.ref);
        });

        // 5. Delete subscription requests
        const qReqs = query(collection(db, "subscription_requests"), where("inquilino", "==", inquilino));
        const reqsSnap = await getDocs(qReqs);
        reqsSnap.forEach(rDoc => {
            batch.delete(rDoc.ref);
        });

        // 4. Delete the Tenant itself
        const tenantRef = doc(db, TENANTS_COLLECTION, inquilino);
        batch.delete(tenantRef);

        await batch.commit();
        return true;
    } catch (error) {
        console.error("Error deleting tenant:", error);
        throw error;
    }
};

// --- PAYMENT METHODS MANAGEMENT ---

const PAYMENTS_COLLECTION = "payment_methods";

/**
 * Get all payment methods
 */
export const getPaymentMethods = async () => {
    try {
        const q = query(collection(db, PAYMENTS_COLLECTION));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error("Error getting payment methods:", error);
        throw error;
    }
};

/**
 * Add a new payment method
 */
export const addPaymentMethod = async (data) => {
    try {
        const docRef = await addDoc(collection(db, PAYMENTS_COLLECTION), {
            ...data,
            active: true,
            createdAt: Timestamp.now()
        });
        return { id: docRef.id, ...data };
    } catch (error) {
        console.error("Error adding payment method:", error);
        throw error;
    }
};

/**
 * Update an existing payment method
 */
export const updatePaymentMethod = async (id, data) => {
    try {
        const ref = doc(db, PAYMENTS_COLLECTION, id);
        await updateDoc(ref, {
            ...data,
            updatedAt: Timestamp.now()
        });
    } catch (error) {
        console.error("Error updating payment method:", error);
        throw error;
    }
};

/**
 * Delete a payment method
 */
export const deletePaymentMethod = async (id) => {
    try {
        await deleteDoc(doc(db, PAYMENTS_COLLECTION, id));
    } catch (error) {
        console.error("Error deleting payment method:", error);
        throw error;
    }
};

// --- GLOBAL CONFIGURATION (WhatsApp, etc) ---

/**
 * Get global platform config (admin phone, etc)
 */
export const getGlobalConfig = async () => {
    try {
        const ref = doc(db, "website_config", "general");
        const snap = await getDoc(ref);
        if (snap.exists()) return snap.data();
        return { adminPhone: "573124119846" }; // Fallback
    } catch (error) {
        console.error("Error getting global config:", error);
        return { adminPhone: "573124119846" };
    }
};

/**
 * Update global platform config
 */
export const updateGlobalConfig = async (data) => {
    try {
        const ref = doc(db, "website_config", "general");
        await setDoc(ref, data, { merge: true });
    } catch (error) {
        console.error("Error updating global config:", error);
        throw error;
    }
};

/**
 * Upload a file to Firebase Storage
 * @param {File} file 
 * @param {string} path 
 */
export const uploadFile = async (file, path = "uploads") => {
    try {
        const storageRef = ref(storage, `${path}/${Date.now()}_${file.name}`);
        const snapshot = await uploadBytes(storageRef, file);
        return await getDownloadURL(snapshot.ref);
    } catch (error) {
        console.error("Error uploading file:", error);
        throw error;
    }
};
