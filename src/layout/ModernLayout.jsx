import React, { useState, useEffect } from 'react';
import { Outlet, useLocation, useParams } from 'react-router-dom';
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import VivaHeader from "./VivaHeader";
import VivaFooter from "./VivaFooter";
import { MASTER_CONFIG } from "../constants/MasterConfig";
import { DEFAULT_CONFIG } from "../constants/DefaultConfig";
import { useAuth } from "../context/AuthContext";

export default function ModernLayout() {
    const { pathname } = useLocation();
    const { clinicSlug } = useParams();
    const { userProfile } = useAuth();

    const masterRoutes = ['/', '/nosotros', '/servicios', '/sedes', '/planes', '/faq'];
    const isMaster = masterRoutes.includes(pathname) || pathname.startsWith('/funcionalidades/');

    const [config, setConfig] = useState(isMaster ? MASTER_CONFIG : {
        ...DEFAULT_CONFIG,
        name: "OdontoCloud"
    });

    useEffect(() => {
        if (isMaster) {
            setConfig(MASTER_CONFIG);
            return;
        }

        const safetyTimer = setTimeout(() => {
            console.warn("⚠️ Layout Data Timeout - Forcing Default");
            setConfig(prev => ({ ...prev, name: "OdontoCloud (Offline Mode)" }));
        }, 3000);

        const loadData = async () => {
            try {
                if (clinicSlug) {
                    const q = query(collection(db, "tenants"), where("slug", "==", clinicSlug));
                    const qSnap = await getDocs(q);
                    if (!qSnap.empty) {
                        const inquilino = qSnap.docs[0].id;
                        const tenantData = qSnap.docs[0].data();

                        const ref = doc(db, "website_config", inquilino);
                        const snap = await getDoc(ref);
                        if (snap.exists()) {
                            setConfig({ ...DEFAULT_CONFIG, ...snap.data(), name: tenantData.name, slug: clinicSlug });
                        } else {
                            setConfig({ ...DEFAULT_CONFIG, name: tenantData.name, slug: clinicSlug });
                        }
                    }
                } else {
                    const ref = doc(db, "website_config", "general");
                    const snap = await getDoc(ref);
                    if (snap.exists()) {
                        setConfig((prev) => ({ ...prev, ...snap.data() }));
                    }
                }
            } catch (e) {
                console.error("Error loading Layout Config:", e);
            } finally {
                clearTimeout(safetyTimer);
            }
        };
        loadData();
    }, [isMaster, clinicSlug]);

    const displayConfig = {
        ...config,
        name: userProfile?.tenant?.name || config.name || "OdontoCloud"
    };

    // Determine if we should use a transparent header (overlay)
    // Applies to Home (Hero) and Inner Pages with PageHeader (Nosotros, Servicios, Sedes)
    // Also applies to clinic home /c/:slug
    const hasHeroHeader =
        pathname === '/' ||
        (pathname.startsWith('/c/') && pathname.split('/').length === 3) || // /c/slug (exactly 3 parts)
        pathname.includes('/nosotros') ||
        pathname.includes('/servicios') ||
        pathname.includes('/sedes');

    return (
        <div className="viva-root landing-mode min-h-screen flex flex-col font-sans antialiased selection:bg-cyan-500/30 selection:text-cyan-200">
            <VivaHeader config={displayConfig} overlay={hasHeroHeader} />

            <main className="flex-1 w-full relative">
                <Outlet context={{ config: displayConfig }} />
            </main>

            <VivaFooter config={displayConfig} />
        </div>
    );
}
