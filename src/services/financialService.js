import { db } from "../firebase/firebaseConfig";
import {
    collection,
    addDoc,
    query,
    where,
    orderBy,
    getDocs,
    Timestamp,
    limit
} from "firebase/firestore";

const COLLECTION_NAME = "financial_transactions";

/**
 * Agrega una nueva transacción (Ingreso/Egreso)
 * @param {Object} transactionData 
 * @returns {Promise<string>} ID del documento creado
 */
export const addTransaction = async (transactionData) => {
    try {
        // Ensure date is a Timestamp
        const data = {
            ...transactionData,
            date: transactionData.date ? Timestamp.fromDate(new Date(transactionData.date)) : Timestamp.now(),
            createdAt: Timestamp.now()
        };
        const docRef = await addDoc(collection(db, COLLECTION_NAME), data);
        return docRef.id;
    } catch (error) {
        console.error("Error adding transaction:", error);
        throw error;
    }
};

/**
 * Obtiene las transacciones recientes
 * @param {number} limitCount Número máximo de registros
 * @returns {Promise<Array>} Lista de transacciones
 */
export const getRecentTransactions = async (limitCount = 20) => {
    try {
        const q = query(
            collection(db, COLLECTION_NAME),
            orderBy("date", "desc"),
            limit(limitCount)
        );
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            // Convert Timestamp back to JS Date for UI
            date: doc.data().date?.toDate()
        }));
    } catch (error) {
        console.error("Error fetching transactions:", error);
        throw error;
    }
};

/**
 * Obtiene estadísticas financieras en un rango de fechas
 * @param {Date} startDate 
 * @param {Date} endDate 
 */
export const getFinancialStats = async (startDate, endDate) => {
    try {
        const start = Timestamp.fromDate(startDate);
        const end = Timestamp.fromDate(endDate);

        const q = query(
            collection(db, COLLECTION_NAME),
            where("date", ">=", start),
            where("date", "<=", end)
        );

        const snapshot = await getDocs(q);
        const transactions = snapshot.docs.map(doc => doc.data());

        let income = 0;
        let expense = 0;

        transactions.forEach(t => {
            const amount = parseFloat(t.amount) || 0;
            if (t.type === 'income') income += amount;
            if (t.type === 'expense') expense += amount;
        });

        return {
            income,
            expense,
            balance: income - expense,
            count: transactions.length
        };
    } catch (error) {
        console.error("Error generating stats:", error);
        throw error;
    }
};
