import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, signOut as firebaseSignOut } from "firebase/auth";
import { auth, db } from "../firebase/firebaseConfig";
import { doc, getDoc, collection, query, where, getDocs, onSnapshot } from "firebase/firestore";

const AuthContext = createContext({
    user: null,          // Firebase User
    userProfile: null,   // Firestore User Document (Rol, Permission)
    loading: true,
    logout: () => Promise.resolve(),
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [userProfile, setUserProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    // --- EFFECT 1: Auth state change ---
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            setLoading(true);
            if (currentUser) {
                setUser(currentUser);
                try {
                    let docRef = doc(db, "usuarios", currentUser.uid);
                    let snap = await getDoc(docRef);

                    if (!snap.exists()) {
                        try {
                            const q = query(collection(db, "usuarios"), where("email", "==", currentUser.email));
                            const qSnap = await getDocs(q);
                            if (!qSnap.empty) {
                                const profile = qSnap.docs[0].data();
                                profile.uid = qSnap.docs[0].id;
                                
                                // Mapping tenantId to inquilino for consistency
                                if (profile && profile.tenantId && !profile.inquilino) {
                                    profile.inquilino = profile.tenantId;
                                }

                                if (profile && profile.rol) {
                                    profile.rol = profile.rol.trim().toLowerCase();
                                }

                                if (currentUser.email === "madridsystem@outlook.es") {
                                    profile.rol = "superadmin";
                                }

                                setUserProfile(profile);
                            } else {
                                const qLegacy = query(collection(db, "users"), where("correo", "==", currentUser.email));
                                const qLegacySnap = await getDocs(qLegacy);
                                if (!qLegacySnap.empty) {
                                    const profile = qLegacySnap.docs[0].data();
                                    profile.uid = qLegacySnap.docs[0].id;
                                    setUserProfile(profile);
                                } else {
                                    setUserProfile({ rol: "guest" });
                                }
                            }
                        } catch (e) {
                            console.error("Fallback lookup failed", e);
                            setUserProfile({ rol: "guest" });
                        }
                    } else {
                        const profile = snap.data();
                        profile.uid = snap.id;

                        if (profile.profileId) {
                            try {
                                const profileSnap = await getDoc(doc(db, "perfiles", profile.profileId));
                                if (profileSnap.exists()) {
                                    const profileData = profileSnap.data();
                                    profile.permisos = profileData.permisos || {};
                                    profile.profileName = profileData.nombre || "Administrativo";
                                    // Robust name fallback
                                    if (!profile.nombre) {
                                        profile.nombre = profile.displayName || profile.nombres || profile.nombreCompleto || currentUser.displayName || currentUser.email;
                                    }
                                }
                            } catch (permErr) {
                                console.error("Error fetching profile permissions", permErr);
                            }
                        }

                        if (profile && profile.rol) {
                            profile.rol = profile.rol.trim().toLowerCase();
                        }
                        if (profile && profile.tenantId && !profile.inquilino) {
                            profile.inquilino = profile.tenantId;
                        }

                        if (currentUser.email === "madridsystem@outlook.es") {
                            profile.rol = "superadmin";
                        }

                        setUserProfile(profile);
                    }
                } catch (err) {
                    console.error("Error fetching user profile", err);
                    setUserProfile(null);
                }
            } else {
                setUser(null);
                setUserProfile(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    // --- EFFECT 2: Real-time listener for Tenant/Clinic info ---
    useEffect(() => {
        if (!userProfile?.inquilino) return;

        const tenantDocRef = doc(db, "tenants", userProfile.inquilino);
        const unsubscribe = onSnapshot(tenantDocRef, (docSnap) => {
            if (docSnap.exists()) {
                const tenantData = docSnap.data();
                setUserProfile(prev => ({
                    ...prev,
                    tenant: {
                        id: docSnap.id,
                        ...tenantData,
                        // Compatibility fallbacks
                        nombre: tenantData.nombreComercial || tenantData.name || tenantData.nombre || "Clínica",
                        nombreComercial: tenantData.nombreComercial || tenantData.name || tenantData.nombre || "Clínica",
                        direccion: tenantData.direccion || tenantData.address || "No configurada",
                        telefono: tenantData.telefono || tenantData.phone || "---",
                        logo: tenantData.logoUrl || tenantData.logo || ""
                    }
                }));
            }
        }, (error) => {
            console.error("Error in tenant real-time listener:", error);
        });

        return () => unsubscribe();
    }, [userProfile?.inquilino]);

    const logout = async () => {
        await firebaseSignOut(auth);
        try {
            localStorage.removeItem("odc_session");
        } catch (e) {
            console.warn("No se pudo limpiar la sesión offline al cerrar sesión:", e);
        }
    };

    const value = {
        user,
        userProfile,
        loading,
        logout
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
