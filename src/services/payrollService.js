import {
    collection,
    addDoc,
    updateDoc,
    doc,
    getDocs,
    query,
    where,
    orderBy,
    serverTimestamp,
    deleteDoc
} from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";

const EMPLOYEES_COLLECTION = "empleados";
const PAYROLL_COLLECTION = "nominas";

/**
 * Obtiene todos los empleados de un tenant
 */
export const getEmployees = async (inquilino) => {
    if (!inquilino) return [];
    const q = query(
        collection(db, EMPLOYEES_COLLECTION),
        where("inquilino", "==", inquilino),
        orderBy("nombre", "asc")
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

/**
 * Agrega un nuevo empleado
 */
export const addEmployee = async (inquilino, employeeData) => {
    const docRef = await addDoc(collection(db, EMPLOYEES_COLLECTION), {
        ...employeeData,
        inquilino,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        status: "activo"
    });
    return docRef.id;
};

/**
 * Actualiza un empleado existente
 */
export const updateEmployee = async (employeeId, employeeData) => {
    const docRef = doc(db, EMPLOYEES_COLLECTION, employeeId);
    await updateDoc(docRef, {
        ...employeeData,
        updatedAt: serverTimestamp()
    });
};

/**
 * Elimina (o desactiva) un empleado
 */
export const deleteEmployee = async (employeeId) => {
    // Para simplificar, haremos delete físico, aunque lo ideal sería un status "eliminado"
    const docRef = doc(db, EMPLOYEES_COLLECTION, employeeId);
    await deleteDoc(docRef);
};

/**
 * Obtiene registros de nómina por periodo
 */
export const getPayrollRecords = async (inquilino, period) => {
    if (!inquilino) return [];
    const q = query(
        collection(db, PAYROLL_COLLECTION),
        where("inquilino", "==", inquilino),
        where("period", "==", period),
        orderBy("createdAt", "desc")
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

/**
 * Genera la nómina para un empleado en un periodo
 */
export const generatePayrollRecord = async (inquilino, employee, period) => {
    const salaryBase = Number(employee.salary || employee.salarioBase || 0);

    // Lógica Simple Colombiana: Salud (4%) y Pensión (4%)
    const salud = salaryBase * 0.04;
    const pension = salaryBase * 0.04;
    const totalDeducciones = salud + pension;
    const totalNeto = salaryBase - totalDeducciones;

    const payrollData = {
        inquilino,
        employeeId: employee.id,
        employeeName: employee.nombre || employee.name,
        period,
        salaryBase,
        deducciones: {
            salud,
            pension,
            total: totalDeducciones
        },
        totalNeto,
        statusDian: "Pendiente",
        createdAt: serverTimestamp()
    };

    const docRef = await addDoc(collection(db, PAYROLL_COLLECTION), payrollData);
    return { id: docRef.id, ...payrollData };
};

/**
 * Simula el envío a la DIAN
 */
export const sendPayrollToDian = async (payrollId) => {
    const docRef = doc(db, PAYROLL_COLLECTION, payrollId);
    // Simulamos un delay de red
    await new Promise(resolve => setTimeout(resolve, 1500));

    // 90% de probabilidad de éxito
    const success = Math.random() > 0.1;
    const status = success ? "Enviado" : "Error";

    await updateDoc(docRef, {
        statusDian: status,
        sentAt: serverTimestamp()
    });

    return status;
};
