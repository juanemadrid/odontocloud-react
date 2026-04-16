// ===============================
// Script para MARCAR USUARIOS COMO ADMIN en Firebase
// Proyecto: taxisabanapp-717ca
// ===============================
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json'); // ya lo tienes en la raíz

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'taxisabanapp-717ca',
});

// 👉 Agrega aquí todos los correos que quieras marcar como admin
const ADMIN_EMAILS = [
  'admin@outlook.es',
];

async function setAdminByEmail(email) {
  try {
    const user = await admin.auth().getUserByEmail(email);
    // asigna/actualiza el claim
    await admin.auth().setCustomUserClaims(user.uid, { role: 'admin' });
    console.log(`✅ ADMIN OK → ${email} (UID: ${user.uid})`);
  } catch (err) {
    console.error(`❌ Error con ${email}:`, err.message || err);
  }
}

(async () => {
  for (const email of ADMIN_EMAILS) {
    await setAdminByEmail(email);
  }
  console.log('\n🎉 Listo. Cierra sesión e inicia de nuevo en la app para refrescar el token.');
  process.exit(0);
})();
