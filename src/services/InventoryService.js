// src/services/InventoryService.js
import { collection, query, where, getDocs, runTransaction, doc } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import { getRecetaForTratamiento } from "../api/recetasCatalog";

/**
 * Descuenta del inventario los insumos asociados a una lista de servicios facturados.
 * @param {Array} itemsFactura Array de items { desc: "Resina", qty: 1, ... }
 */
export const processInventoryDeduction = async (itemsFactura) => {
    if (!itemsFactura || itemsFactura.length === 0) return;

    try {
        console.log("📦 Iniciando descuento de inventario automático...");

        // 1. Aplanar todos los insumos necesarios
        // Mapa: productoCodigo -> cantidadTotal
        const insumosRequeridos = {};

        itemsFactura.forEach(item => {
            // Intentar matchear la descripción con una receta (simple heuristic for MVP)
            let tratamientoKey = 'consulta'; // default
            const d = item.desc.toLowerCase();

            if (d.includes('resina') || d.includes('calza')) tratamientoKey = 'caries';
            else if (d.includes('endo') || d.includes('conducto')) tratamientoKey = 'endodoncia';
            else if (d.includes('extrac') || d.includes('sacar')) tratamientoKey = 'extraccion';
            else if (d.includes('limpieza') || d.includes('higiene')) tratamientoKey = 'limpieza';

            const receta = getRecetaForTratamiento(tratamientoKey);

            receta.forEach(insumo => {
                if (!insumosRequeridos[insumo.productoId]) {
                    insumosRequeridos[insumo.productoId] = 0;
                }
                insumosRequeridos[insumo.productoId] += (insumo.cantidad * (item.qty || 1));
            });
        });

        console.log("📋 Lista de compras interna:", insumosRequeridos);

        // 2. Ejecutar Transacción en Firebase (Atomicidad)
        await runTransaction(db, async (transaction) => {
            const productCodes = Object.keys(insumosRequeridos);
            const updates = [];

            // Buscar documentos de inventario que coincidan con los códigos
            // OJO: En Firestore 'where' con 'in' soporta max 10, para prod iterar en lotes.
            // Aquí asumimos < 10 insumos diferentes por factura para MVP.

            const invRef = collection(db, "inventario");
            // Nota: Esto asume que tienes un campo 'codigo' en el doc inventario que hace match con 'productoId'
            // O que el ID del documento ES el productoId. Usaremos ID del documento para ser más rápidos.

            for (const codigo of productCodes) {
                // Opción A: Buscar por campo 'codigo'
                const q = query(invRef, where("codigo", "==", codigo));
                const snap = await getDocs(q);

                if (!snap.empty) {
                    snap.forEach(docSnap => {
                        const currentStock = Number(docSnap.data().cantidad || 0);
                        const deduction = insumosRequeridos[codigo];
                        const newStock = currentStock - deduction;

                        // Agregar update a la transacción
                        transaction.update(docSnap.ref, {
                            cantidad: newStock,
                            updatedAt: new Date()
                        });
                        updates.push(`${codigo}: ${currentStock} -> ${newStock}`);
                    });
                } else {
                    console.warn(`⚠️ Producto receta no encontrado en inventario: ${codigo}`);
                }
            }
        });

        console.log("✅ Inventario actualizado correctamente.");
        return true;

    } catch (error) {
        console.error("❌ Error actualizando inventario:", error);
        return false;
    }
};
