/**
 * factusAdminService.js
 *
 * Manages the centralized Factus credentials (owned by the SaaS admin)
 * and per-tenant invoice quotas.
 *
 * Firestore structure:
 *   /superadmin_config/facturacion
 *     factusClientId, factusClientSecret, factusUsername, factusPassword,
 *     factusTestMode, factusNumberingRangeId
 *     totalComprado:  number  ← total invoices purchased from Factus
 *     totalAsignado:  number  ← sum of all tenant quotas assigned
 *     totalUsado:     number  ← sum of all tenant invoices emitted
 *
 *   /tenants/{inquilino}
 *     facturacionCuota:   number  ← how many invoices this tenant was sold
 *     facturacionUsadas:  number  ← how many this tenant has emitted
 *     facturacionPlan:    string  ← plan name (e.g. "básico", "estándar")
 */

import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  increment,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";

const SUPERADMIN_DOC = () => doc(db, "superadmin_config", "facturacion");

// ─────────────────────────────────────────────
// 1. Get centralized Factus credentials
// ─────────────────────────────────────────────
export const getFactusAdminCredentials = async () => {
  const snap = await getDoc(SUPERADMIN_DOC());
  if (!snap.exists()) return null;
  const d = snap.data();
  if (!d.factusClientId || !d.factusClientSecret) return null;
  return {
    factusClientId:         d.factusClientId,
    factusClientSecret:     d.factusClientSecret,
    factusUsername:         d.factusUsername,
    factusPassword:         d.factusPassword,
    factusTestMode:         d.factusTestMode ?? true,
    factusNumberingRangeId: d.factusNumberingRangeId || null,
  };
};

// ─────────────────────────────────────────────
// 2. Save centralized Factus credentials + pool size
// ─────────────────────────────────────────────
export const saveFactusAdminCredentials = async (data) => {
  await setDoc(
    SUPERADMIN_DOC(),
    {
      ...data,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
};

// ─────────────────────────────────────────────
// 3. Get superadmin facturacion stats
// ─────────────────────────────────────────────
export const getFactusAdminStats = async () => {
  const snap = await getDoc(SUPERADMIN_DOC());
  if (!snap.exists()) return { totalComprado: 0, totalAsignado: 0, totalUsado: 0 };
  const d = snap.data();
  return {
    totalComprado: d.totalComprado || 0,
    totalAsignado: d.totalAsignado || 0,
    totalUsado:    d.totalUsado    || 0,
  };
};

// ─────────────────────────────────────────────
// ─────────────────────────────────────────────
// 4. Get tenant quota info
// ─────────────────────────────────────────────
export const getTenantQuota = async (inquilino) => {
  const snap = await getDoc(doc(db, "tenants", inquilino));
  if (!snap.exists()) return null;
  const d = snap.data();
  return {
    facturacionCuota:  d.facturacionCuota  ?? 0,
    facturacionUsadas: d.facturacionUsadas ?? 0,
    facturacionPlan:   d.facturacionPlan   || "—",
    disponibles: Math.max(0, (d.facturacionCuota ?? 0) - (d.facturacionUsadas ?? 0)),
  };
};

// ─────────────────────────────────────────────
// 4b. Get sucursal quota info (with tenant fallback)
// ─────────────────────────────────────────────
export const getSucursalQuota = async (sucursalId, inquilino) => {
  if (sucursalId) {
    const snap = await getDoc(doc(db, "sucursales", sucursalId));
    if (snap.exists()) {
      const d = snap.data();
      if (d.facturacionCuota !== undefined && d.facturacionCuota !== null) {
        return {
          facturacionCuota:  d.facturacionCuota  ?? 0,
          facturacionUsadas: d.facturacionUsadas ?? 0,
          facturacionPlan:   d.facturacionPlan   || "—",
          disponibles: Math.max(0, (d.facturacionCuota ?? 0) - (d.facturacionUsadas ?? 0)),
          isSucursalQuota: true,
        };
      }
    }
  }
  return await getTenantQuota(inquilino);
};

// ─────────────────────────────────────────────
// 5. Assign quota to a tenant (admin action)
//    additionalUnits: how many NEW invoices to add
// ─────────────────────────────────────────────
export const assignQuotaToTenant = async (inquilino, additionalUnits, planName) => {
  const tenantRef = doc(db, "tenants", inquilino);
  const updates = {
    facturacionCuota: increment(additionalUnits),
    updatedAt: serverTimestamp(),
  };
  if (planName) updates.facturacionPlan = planName;
  await updateDoc(tenantRef, updates);

  // Update global assigned counter
  await updateDoc(SUPERADMIN_DOC(), {
    totalAsignado: increment(additionalUnits),
    updatedAt: serverTimestamp(),
  });
};

// ─────────────────────────────────────────────
// 5b. Assign quota to a specific sucursal
// ─────────────────────────────────────────────
export const assignQuotaToSucursal = async (sucursalId, additionalUnits, planName) => {
  const sucursalRef = doc(db, "sucursales", sucursalId);
  const updates = {
    facturacionCuota: increment(additionalUnits),
    updatedAt: serverTimestamp(),
  };
  if (planName) updates.facturacionPlan = planName;
  await updateDoc(sucursalRef, updates);

  // Update global assigned counter
  await updateDoc(SUPERADMIN_DOC(), {
    totalAsignado: increment(additionalUnits),
    updatedAt: serverTimestamp(),
  });
};

// ─────────────────────────────────────────────
// 6. Consume one invoice from quota (sucursal or tenant)
//    Called after a successful Factus emission
// ─────────────────────────────────────────────
export const consumeOneInvoice = async (inquilino, sucursalId = null) => {
  let consumedAtSucursal = false;
  if (sucursalId) {
    const sucursalRef = doc(db, "sucursales", sucursalId);
    const snap = await getDoc(sucursalRef);
    if (snap.exists() && snap.data()?.facturacionCuota !== undefined) {
      await updateDoc(sucursalRef, {
        facturacionUsadas: increment(1),
        updatedAt: serverTimestamp(),
      });
      consumedAtSucursal = true;
    }
  }

  if (!consumedAtSucursal && inquilino) {
    await updateDoc(doc(db, "tenants", inquilino), {
      facturacionUsadas: increment(1),
      updatedAt: serverTimestamp(),
    });
  }

  await updateDoc(SUPERADMIN_DOC(), {
    totalUsado: increment(1),
    updatedAt: serverTimestamp(),
  });
};

// ─────────────────────────────────────────────
// 8. Get Factus API Credentials for a specific tenant/sucursal (with central fallback)
// ─────────────────────────────────────────────
export const getFactusCredentialsForTenant = async (inquilino, sucursalId = null) => {
  // 1. Check sucursal if specified
  if (sucursalId) {
    const sSnap = await getDoc(doc(db, "sucursales", sucursalId));
    if (sSnap.exists()) {
      const s = sSnap.data();
      if (s.factusClientId && s.factusClientSecret) {
        return {
          factusClientId:         s.factusClientId,
          factusClientSecret:     s.factusClientSecret,
          factusUsername:         s.factusUsername || s.username,
          factusPassword:         s.factusPassword || s.password,
          factusTestMode:         s.factusTestMode ?? true,
          factusNumberingRangeId: s.factusNumberingRangeId || null,
        };
      }
    }
  }

  // 2. Check tenant
  if (inquilino) {
    const tSnap = await getDoc(doc(db, "tenants", inquilino));
    if (tSnap.exists()) {
      const t = tSnap.data();
      if (t.factusClientId && t.factusClientSecret) {
        return {
          factusClientId:         t.factusClientId,
          factusClientSecret:     t.factusClientSecret,
          factusUsername:         t.factusUsername || t.username,
          factusPassword:         t.factusPassword || t.password,
          factusTestMode:         t.factusTestMode ?? true,
          factusNumberingRangeId: t.factusNumberingRangeId || null,
        };
      }
    }
  }

  // 3. Fallback to centralized superadmin credentials
  return await getFactusAdminCredentials();
};

// ─────────────────────────────────────────────
// 9. Save Factus API Credentials for a specific tenant or sucursal (SuperAdmin action)
// ─────────────────────────────────────────────
export const saveTenantFactusCredentials = async (inquilino, sucursalId = null, credsData = {}) => {
  const payload = {
    factusClientId:         credsData.factusClientId         || "",
    factusClientSecret:     credsData.factusClientSecret     || "",
    factusUsername:         credsData.factusUsername         || "",
    factusPassword:         credsData.factusPassword         || "",
    factusTestMode:         credsData.factusTestMode         ?? true,
    factusNumberingRangeId: credsData.factusNumberingRangeId || "",
    updatedAt: serverTimestamp(),
  };

  if (sucursalId) {
    await updateDoc(doc(db, "sucursales", sucursalId), payload);
  } else if (inquilino) {
    await updateDoc(doc(db, "tenants", inquilino), payload);
  }
};


