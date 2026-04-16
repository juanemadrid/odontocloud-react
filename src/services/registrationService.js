import { auth, db } from "../firebase/firebaseConfig";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, collection, Timestamp } from "firebase/firestore";

/**
 * Registra una nueva clínica con periodo de prueba de 30 días.
 * @param {Object} data { adminEmail, adminPassword, adminName, clinicName }
 */
export const registerTrialClinic = async ({ adminEmail, adminPassword, adminName, clinicName, requestedPlan, requestedPlanFeatures }) => {
    try {
        // 1. Crear usuario en Firebase Auth
        const userCredential = await createUserWithEmailAndPassword(auth, adminEmail, adminPassword);
        const user = userCredential.user;

        // 2. Generar un Tenant ID único
        const inquilino = clinicName.toLowerCase().replace(/[^a-z0-9]/g, '-') + '-' + Math.random().toString(36).substring(2, 7);

        // 3. Crear el Documento del Tenant (Clínica)
        const expirationDate = new Date();
        expirationDate.setDate(expirationDate.getDate() + 30); // 30 días de prueba

        const tenantData = {
            name: clinicName,
            email: adminEmail,
            planId: "trial",
            planDuration: "monthly",
            subscriptionStatus: "active",
            subscriptionEndDate: Timestamp.fromDate(expirationDate),
            createdAt: Timestamp.now(),
            active: true,
            features: requestedPlanFeatures || [],
            requestedPlan: requestedPlan || "Basic",
            settings: {
                primaryColor: "#3b82f6",
                accentColor: "#f59e0b"
            },
            // Default fields for "Datos Básicos"
            pais: "Colombia",
            moneda: "Pesos colombianos (COP)",
            zonaHoraria: "Hora de Colombia",
            tipoDocumento: "NIT",
            nit: "900.123.456-7",
            regimen: "Responsable de IVA",
            entidadLegal: "Persona Jurídica",
            direccion: "Calle Principal #123",
            ciudad: "Bogotá D.C.",
            email: adminEmail,
            telCelular: "3001234567",
            telFijo: "6011234567",
            documentoTipo: "NIT",
            documentoNumero: "900123456",
        };

        await setDoc(doc(db, "tenants", inquilino), tenantData);

        // 3.1 Initial System Parameters (config/parameters)
        await setDoc(doc(db, "tenants", inquilino, "config", "parameters"), {
            facturacion: {
                plantillaRecibo: "Recibo caja carta",
                plantillaFactura: "Factura media carta",
                permitirPlanesCero: false,
            },
            agenda: {
                tipoWhatsapp: "gratis",
                mensajeWhatsapp: "Cordial saludo [PatientName], por favor confirme su asistencia a la cita en [TenantName]. Día: [Date], Hora: [Hour].",
                duracionAgendaRapida: 30,
            },
            general: {
                vigenciaPresupuestos: 30,
                historiaIgualIdentidad: true,
                editarPlanClinico: true
            },
            createdAt: Timestamp.now()
        });

        // 3.1 Crear Solicitud de Suscripción para el SuperAdmin (Buzón Comercial)
        // Esto permite que el admin vea la intención de compra/prueba de un plan específico
        await setDoc(doc(db, "subscription_requests", `${inquilino}-initial`), {
            inquilino,
            tenantName: clinicName,
            currentPlanId: "trial",
            requestedPlanName: requestedPlan || "Basic",
            status: "pending",
            type: "initial_registration",
            tenantPhone: tenantData.telCelular || "",
            createdAt: Timestamp.now()
        });

        // 4. Crear el Perfil del Usuario Administrador
        const profileData = {
            uid: user.uid,
            email: adminEmail,
            nombre: adminName,
            rol: "Administrador",
            inquilino: inquilino,
            active: true,
            permisos: { all: true }, // Ensure initial permissions are not null
            createdAt: Timestamp.now()
        };

        await setDoc(doc(db, "usuarios", user.uid), profileData);

        // 5. Crear Sede, Almacén y Lista de Precios iniciales
        // 5.1 Sede Principal
        const sucursalId = `${inquilino}-sede-1`;
        await setDoc(doc(db, "sucursales", sucursalId), {
            inquilino,
            nombre: "Sede Principal",
            ciudad: "Bogotá D.C.",
            direccion: "Calle Principal #123",
            telefono: "6011234567",
            celular: "3001234567",
            email: adminEmail,
            activa: true,
            creado: Timestamp.now()
        });

        // 5.2 Almacén Principal
        const almacenId = `${inquilino}-alm-1`;
        await setDoc(doc(db, "almacenes", almacenId), {
            inquilino,
            nombre: "Almacén Principal",
            creado: Timestamp.now()
        });

        // 5.3 Lista de Precios "General"
        const listaId = `${inquilino}-lp-1`;
        await setDoc(doc(db, "listas_precios", listaId), {
            inquilino,
            nombre: "Lista General",
            activa: true,
            principal: true,
            creado: Timestamp.now()
        });

        // 5.4 Sembrar categorías base en la lista de precios
        const defaultCats = [
            "Rehabilitación Oral", "Implantología", "Cirugía Oral",
            "Periodoncia", "Endodoncia", "Ortodoncia",
            "Odontología General", "Radiología"
        ];

        for (const catName of defaultCats) {
            const catSlug = catName.toLowerCase().replace(/\s+/g, '-');
            await setDoc(doc(db, "listas_precios", listaId, "categorias", catSlug), {
                nombre: catName,
                activa: true,
                creado: Timestamp.now()
            });
        }

        // 5.5 Consultorio por defecto vinculado a la sede
        await setDoc(doc(db, "consultorios", `${inquilino}-def`), {
            inquilino,
            nombre: "Consultorio Principal",
            tipo: "Consultorio",
            sucursal: "Sede Principal",
            sucursalId: sucursalId,
            activo: true,
            createdAt: Timestamp.now()
        });

        return { user, inquilino };
    } catch (error) {
        console.error("Error in registerTrialClinic:", error);
        throw error;
    }
};
