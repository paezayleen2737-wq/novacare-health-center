require("dotenv").config();

const bcrypt = require("bcrypt");
const { initSchema } = require("../config/database");
const UsuarioModel = require("../models/usuario.model");

const SALT_ROUNDS = 10;

async function seedAdmin() {
  const nombre = process.env.ADMIN_NAME;
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!nombre || !email || !password) {
    console.error(
      "❌ Faltan ADMIN_NAME, ADMIN_EMAIL o ADMIN_PASSWORD en el archivo .env"
    );
    process.exit(1);
  }

  await initSchema();

  const existente = await UsuarioModel.findByEmail(email.toLowerCase());
  if (existente) {
    console.log(`ℹ️  El usuario administrador (${email}) ya existe. No se creó ninguno nuevo.`);
    process.exit(0);
  }

  const password_hash = await bcrypt.hash(password, SALT_ROUNDS);
  await UsuarioModel.create({ nombre, email: email.toLowerCase(), password_hash });

  console.log(`✅ Usuario administrador creado: ${email}`);
  process.exit(0);
}

seedAdmin().catch((err) => {
  console.error("❌ Error al crear el usuario administrador:", err);
  process.exit(1);
});
