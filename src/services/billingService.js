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
    
    // Total Pagado/Recaudado: sum of actual transactions (excluding internal credit usage to prevent double counting)
    const totalPagado = pagos
        .filter(p => (p.medio || "").toLowerCase() !== "saldo a favor" && p.estado !== "Anulado")
        .reduce((acc, p) => acc + p.monto, 0);
    
    // Credits (Saldo a Favor) - net available balance (total topped up minus total used)
    const totalCredits = pagos
        .filter(p => p.concepto === "SALDO A FAVOR" && p.estado !== "Anulado")
        .reduce((acc, p) => acc + p.monto, 0);

    const usedCredits = pagos
        .filter(p => (p.medio || "").toLowerCase() === "saldo a favor" && p.estado !== "Anulado")
        .reduce((acc, p) => acc + p.monto, 0);

    const totalSaldosAFavor = Math.max(0, totalCredits - usedCredits);

    // Regular payments (abonos to treatment, not credit advances)
    const totalAbonosTratamiento = pagos
        .filter(p => p.concepto !== "SALDO A FAVOR" && p.estado !== "Anulado")
        .reduce((acc, p) => acc + p.monto, 0);

    const facturasPagadas = facturas.filter((f) => ["pagada", "pagado", "paid"].includes(f.estado));
    const facturasPendientes = facturas.filter((f) => ["pendiente", "abierta", "open", "deuda"].includes(f.estado));

    const totalFacturasPagadas = facturasPagadas.reduce((acc, f) => acc + f.total, 0);
    const totalFacturasPendientes = facturasPendientes.reduce((acc, f) => acc + f.total, 0);

    // Raw balance: what is owed (positive = debt, negative = overpaid)
    const rawBalance = totalFacturado - totalPagado;
    
    // Net balance for display: never show negative (overpayment shows as saldo a favor)
    const balance = rawBalance > 0 ? rawBalance : 0;

    return {
        facturas,
        pagos,
        plans,
        totals: {
            totalFacturado,
            totalPagado,
            totalAbonosTratamiento,
            totalFacturasPendientes,
            totalFacturasPagadas,
            totalSaldosAFavor,
            balance,         // Deuda actual (>= 0, nunca negativo)
            rawBalance       // Valor real: negativo = crédito no aplicado
        }
    };
};

