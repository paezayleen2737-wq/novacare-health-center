const { get, run } = require("../utils/dbHelpers");

const UsuarioModel = {
  /** Busca un usuario por email (usado en el login) */
  findByEmail(email) {
    return get("SELECT * FROM usuarios WHERE email = ?", [email]);
  },

  /** Busca un usuario por id (usado al validar el JWT) */
  findById(id) {
    return get(
      "SELECT id, nombre, email, created_at FROM usuarios WHERE id = ?",
      [id]
    );
  },

  /** Crea un usuario. password_hash ya debe venir cifrado con bcrypt */
  create({ nombre, email, password_hash }) {
    return run(
      "INSERT INTO usuarios (nombre, email, password_hash) VALUES (?, ?, ?)",
      [nombre, email, password_hash]
    );
  },
};

module.exports = UsuarioModel;
