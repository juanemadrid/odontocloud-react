import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, signOut as firebaseSignOut } from "firebase/auth";
import { auth, db } from "../firebase/firebaseConfig";
import { doc, getDoc, collection, query, where, getDocs, onSnapshot } from "firebase/firestore";
import { DEV_BYPASS_ENABLED, OFFLINE_SESSION_ENABLED } from "../config/runtimeFlags";

const AuthContext = createContext({
    user: null,          // Firebase User
    userProfile: null,   // Firestore User Document (Rol, Permission)
    loading: true,
    logout: () => Promise.resolve(),
});

export const useAuth = () => useContext(AuthContext);

const getOfflineSession = () => {
    if (!OFFLINE_SESSION_ENABLED) return null;

    try {
        const data = JSON.parse(localStorage.getItem("odc_session"));
        if (data && Date.now() - data.timestamp < 1000 * 60 * 60 * 24) return data;
        return null;
    } catch {
        return null;
    }
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [userProfile, setUserProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    // --- EFFECT 1: Auth state change ---
    useEffect(() => {
        const s = getOfflineSession();
        if (DEV_BYPASS_ENABLED && s && (s.email === "admin_test@odontocloud.com" || s.email === "diegomadrid_doc@odontocloud.com" || s.email === "mariarroyo@hotmail.com")) {
            setUser({ 
                email: s.email, 
                uid: s.email === "diegomadrid_doc@odontocloud.com" ? 'diegomadrid-doc-uid' : s.email === "mariarroyo@hotmail.com" ? 'msn3SgNfgThmyBkbVN3dRtTWbAf1' : 'offline-mock-uid' 
            });
            
            const baseProfile = {
                uid: s.email === "diegomadrid_doc@odontocloud.com" ? 'diegomadrid-doc-uid' : s.email === "mariarroyo@hotmail.com" ? 'msn3SgNfgThmyBkbVN3dRtTWbAf1' : 'offline-mock-uid',
                rol: s.rol || (s.email === "diegomadrid_doc@odontocloud.com" ? 'doctor' : 'administrador'),
                nombre: s.email === "diegomadrid_doc@odontocloud.com" ? "Diego" : s.email === "mariarroyo@hotmail.com" ? "Maria Arroyo" : s.email.split('@')[0].toUpperCase(),
                nombreCompleto: s.email === "diegomadrid_doc@odontocloud.com" ? "Diego Madrid" : s.email === "mariarroyo@hotmail.com" ? "Maria Arroyo" : undefined,
                esDoctor: s.email === "diegomadrid_doc@odontocloud.com",
                profileId: s.email === "diegomadrid_doc@odontocloud.com" ? "rIgm7MxjxZZ7ML59zfb5" : undefined,
                inquilino: 'odontosalud-h9ff3',
                tenant: {
                    id: 'odontosalud-h9ff3',
                    nombre: "Clínica Dental",
                    nombreComercial: "Clínica Dental",
                    direccion: "Calle 123",
                    telefono: "3001234567"
                }
            };

            if (baseProfile.profileId) {
                getDoc(doc(db, "perfiles", baseProfile.profileId)).then((profileSnap) => {
                    if (profileSnap.exists()) {
                        const profileData = profileSnap.data();
                        baseProfile.permisos = profileData.permisos || {};
                        baseProfile.profileName = profileData.nombre || "Doctor";
                    }
                    setUserProfile(baseProfile);
                    setLoading(false);
                }).catch((err) => {
                    console.error("Error loading bypass permissions:", err);
                    setUserProfile(baseProfile);
                    setLoading(false);
                });
            } else {
                setUserProfile(baseProfile);
                setLoading(false);
            }
            return () => {};
        }

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
                const s = getOfflineSession();
                if (OFFLINE_SESSION_ENABLED && s && !navigator.onLine) {
                    setUser({ email: s.email, uid: 'offline-mock-uid' });
                    setUserProfile({
                        uid: s.email === "diegomadrid_doc@odontocloud.com" ? 'diegomadrid-doc-uid' : 'offline-mock-uid',
                        rol: s.rol,
                        nombre: s.email.split('@')[0].toUpperCase(),
                        inquilino: 'odontosalud-h9ff3',
                        tenant: {
                            id: 'odontosalud-h9ff3',
                            nombre: "Clínica Dental",
                            nombreComercial: "Clínica Dental",
                            direccion: "Calle 123",
                            telefono: "3001234567"
                        }
                    });
                } else {
                    setUser(null);
                    setUserProfile(null);
                }
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    // --- EFFECT 2: Real-time listener for Tenant/Clinic info ---
    useEffect(() => {
        if (!userProfile?.inquilino) {
            console.log("AuthContext - No inquilino en userProfile, saltando listener de tenant");
            return;
        }

        console.log("AuthContext - Iniciando listener en tiempo real para tenant:", userProfile.inquilino);

        const tenantDocRef = doc(db, "tenants", userProfile.inquilino);
        const unsubscribe = onSnapshot(tenantDocRef, (docSnap) => {
            if (docSnap.exists()) {
                const tenantData = docSnap.data();
                console.log("AuthContext - Datos de tenant actualizados:", {
                    id: docSnap.id,
                    status: tenantData.status,
                    nombre: tenantData.nombreComercial || tenantData.name,
                    subscriptionEndDate: tenantData.subscriptionEndDate
                });

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
            } else {
                console.warn("AuthContext - Documento de tenant no existe:", userProfile.inquilino);
            }
        }, (error) => {
            console.error("Error in tenant real-time listener:", error);
        });

        return () => {
            console.log("AuthContext - Limpiando listener de tenant");
            unsubscribe();
        };
    }, [userProfile?.inquilino]);

    const logout = async () => {
        try {
            await firebaseSignOut(auth);
        } catch (e) {
            // Ignorar error si no hay sesión Firebase activa (usuario de bypass)
        }
        try {
            localStorage.removeItem("odc_session");
        } catch (e) {
            console.warn("No se pudo limpiar la sesión offline al cerrar sesión:", e);
        }
        // Resetear estado explícitamente para cubrir sesiones de bypass (sin Firebase Auth)
        setUser(null);
        setUserProfile(null);
    };

    const value = {
        user,
        userProfile,
        loading,
        logout
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
