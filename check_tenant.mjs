import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, doc, getDoc, updateDoc, query, where, addDoc, setDoc } from "firebase/firestore";
import { firebaseConfig } from "./src/firebase/firebaseConfig.js";

// Initialize Firebase (using the same config as the app)
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function checkTenants() {
    console.log("🔍 Checking Tenants in Firestore...");

    try {
        const tenantsRef = collection(db, "tenants");
        const snap = await getDocs(tenantsRef);

        if (snap.empty) {
            console.log("❌ No tenants found in 'tenants' collection.");
        } else {
            console.log(`✅ Found ${snap.size} tenants.`);
            let found = false;
            snap.forEach(doc => {
                const data = doc.data();
                console.log(`- ID: ${doc.id} | Name: ${data.name} | Slug: ${data.slug}`);
                if (data.slug === 'juanemadrid') found = true;
            });

            if (found) {
                console.log("✅ Tenant 'juanemadrid' EXISTS.");
            } else {
                console.log("❌ Tenant 'juanemadrid' DOES NOT EXIST.");
                await createTestTenant();
            }
        }
    } catch (e) {
        console.error("Error checking tenants:", e);
    }
}

async function createTestTenant() {
    console.log("🛠️ Creating Test Tenant 'Juan Madrid'...");
    try {
        // 1. Create Tenant
        const tenantData = {
            name: "Juan Madrid Odontología",
            slug: "juanemadrid",
            email: "juan@odonto.com",
            plan: "pro",
            active: true
        };
        const tenantRef = await addDoc(collection(db, "tenants"), tenantData);
        console.log("✅ Tenant created with ID:", tenantRef.id);

        // 2. Create Website Config
        const configData = {
            name: "Juan Madrid Odontología",
            domain: "juanemadrid.odontocloud.com",
            primaryColor: "#4f46e5", // Indigo
            accentColor: "#ec4899", // Pink
            heroTitle: "Tu Sonrisa, Nuestra Pasión",
            heroSubtitle: "Odontología especializada al alcance de todos.",
            mission: "Nuestra misión es brindar atención odontológica integral con calidez y profesionalismo.",
            vision: "Ser la clínica líder en transformación de sonrisas.",
            services: [
                { title: "Ortodoncia", desc: "Brackets y alineadores.", icon: "🦷" },
                { title: "Implantes", desc: "Recupera tu sonrisa.", icon: "🔩" },
                { title: "Diseño", desc: "Estética dental.", icon: "✨" }
            ],
            contactPhone: "3001234567"
        };
        await setDoc(doc(db, "website_config", tenantRef.id), configData);
        console.log("✅ Website Config created for ID:", tenantRef.id);

    } catch (e) {
        console.error("Error creating test tenant:", e);
    }
}

checkTenants();
