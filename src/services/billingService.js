import {
    collection,
    query,
    where,
    orderBy,
    getDocs
} from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";

// Helpers
const s = (n) => Number(n || 0);


export const getPatientFinancials = async (patientId) => {
    if (!patientId) return { facturas: [], pagos: [], totals: {} };

    const [snapF, snapP, snapPlans] = await Promise.all([
        getDocs(query(collection(db, "facturas"), where("patientId", "==", patientId))),
        getDocs(query(collection(db, "pagos"), where("patientId", "==", patientId))),
        getDocs(query(collection(db, "treatment_plans"), where("patientId", "==", patientId)))
    ]);

    const facturas = snapF.docs.map(d => {
        const f = d.data();
        return {
            id: d.id,
            ...f,
            total: s(f.total ?? f.valor ?? f.montoTotal),
            estado: (f.estado || "pendiente").toLowerCase(),
            fechaISO: f.fechaISO || f.fecha || null
        };
    }).sort((a, b) => (b.fechaISO || "").localeCompare(a.fechaISO || ""));

    const pagos = snapP.docs.map(d => {
        const p = d.data();
        return {
            id: d.id,
            ...p,
            monto: s(p.monto ?? p.valor ?? p.total),
            fechaISO: p.fechaISO || p.fecha || null,
            medio: p.medio || p.metodo || "—"
        };
    }).sort((a, b) => (b.fechaISO || "").localeCompare(a.fechaISO || ""));

    const plans = snapPlans.docs.map(d => ({
        id: d.id,
        ...d.data(),
        costoTotal: s(d.data().total || d.data().costoTotal || 0),
        pagado: s(d.data().recaudado || d.data().pagado || 0)
    }));

    // Calculations
    const totalFacturado = facturas.reduce((acc, f) => acc + f.total, 0);
    const totalPagado = pagos.reduce((acc, p) => acc + p.monto, 0);
    
    // Credits (Saldo a Favor)
    // In this logic, a credit is a payment that hasn't been linked to an invoice yet
    // or specifically marked as Concepto: SALDO A FAVOR
    const totalSaldosAFavor = pagos
        .filter(p => p.concepto === "SALDO A FAVOR")
        .reduce((acc, p) => acc + p.monto, 0);

    const facturasPagadas = facturas.filter((f) => ["pagada", "pagado", "paid"].includes(f.estado));
    const facturasPendientes = facturas.filter((f) => ["pendiente", "abierta", "open", "deuda"].includes(f.estado));

    const totalFacturasPagadas = facturasPagadas.reduce((acc, f) => acc + f.total, 0);
    const totalFacturasPendientes = facturasPendientes.reduce((acc, f) => acc + f.total, 0);

    return {
        facturas,
        pagos,
        plans,
        totals: {
            totalFacturado,
            totalPagado,
            totalFacturasPendientes,
            totalFacturasPagadas,
            totalSaldosAFavor,
            balance: totalFacturado - totalPagado
        }
    };
};

