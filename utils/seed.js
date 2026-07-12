const bcrypt = require("bcrypt");
const UsuarioModel = require("../models/usuario.model");

const SALT_ROUNDS = 10;

/**
 * Crea el usuario administrador a partir de ADMIN_NAME / ADMIN_EMAIL /
 * ADMIN_PASSWORD (variables de entorno) si todavía no existe uno con ese
 * email. Es segura de llamar en cada arranque de la aplicación: si el
 * administrador ya existe, no hace nada (no duplica, no sobreescribe).
 *
 * Se usa tanto desde server.js (arranque automático en cualquier entorno,
 * incluido Railway) como desde este mismo archivo cuando se ejecuta como
 * script CLI (`npm run seed`), para no duplicar la lógica en dos lugares.
 *
 * @returns {Promise<{creado: boolean, email: string} | null>}
 *   null si faltan variables de entorno (no se pudo intentar la creación).
 */
async function ensureAdminUser() {
  const nombre = process.env.ADMIN_NAME;
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!nombre || !email || !password) {
    console.warn(
      "⚠️  ADMIN_NAME, ADMIN_EMAIL o ADMIN_PASSWORD no están definidos: " +
        "no se pudo verificar/crear el usuario administrador."
    );
    return null;
  }

  const emailNormalizado = email.trim().toLowerCase();
  const existente = await UsuarioModel.findByEmail(emailNormalizado);

  if (existente) {
    return { creado: false, email: emailNormalizado };
  }

  const password_hash = await bcrypt.hash(password, SALT_ROUNDS);
  await UsuarioModel.create({ nombre, email: emailNormalizado, password_hash });

  return { creado: true, email: emailNormalizado };
}

module.exports = { ensureAdminUser };

/**
 * Permite seguir sembrando manualmente en local con `npm run seed`, sin
 * duplicar la lógica de arriba: este bloque solo corre si el archivo se
 * ejecuta directamente (`node utils/seed.js`), no cuando otro módulo lo
 * importa con require("./utils/seed").
 */
if (require.main === module) {
  require("dotenv").config();
  const { initSchema } = require("../config/database");

  (async () => {
    try {
      await initSchema();
      const resultado = await ensureAdminUser();

      if (!resultado) process.exit(1);

      console.log(
        resultado.creado
          ? `✅ Usuario administrador creado: ${resultado.email}`
          : `ℹ️  El usuario administrador (${resultado.email}) ya existe. No se creó ninguno nuevo.`
      );
      process.exit(0);
    } catch (err) {
      console.error("❌ Error al crear el usuario administrador:", err);
      process.exit(1);
    }
  })();
}