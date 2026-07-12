const { all, get, run } = require("../utils/dbHelpers");

const MedicoModel = {
  findAll() {
    return all("SELECT * FROM medicos ORDER BY apellido, nombre");
  },

  findById(id) {
    return get("SELECT * FROM medicos WHERE id = ?", [id]);
  },

  create({ nombre, apellido, especialidad, consultorio, telefono, email }) {
    return run(
      `INSERT INTO medicos (nombre, apellido, especialidad, consultorio, telefono, email)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [nombre, apellido, especialidad, consultorio, telefono || null, email || null]
    );
  },

  update(id, { nombre, apellido, especialidad, consultorio, telefono, email }) {
    return run(
      `UPDATE medicos
       SET nombre = ?, apellido = ?, especialidad = ?, consultorio = ?, telefono = ?, email = ?
       WHERE id = ?`,
      [nombre, apellido, especialidad, consultorio, telefono || null, email || null, id]
    );
  },

  remove(id) {
    return run("DELETE FROM medicos WHERE id = ?", [id]);
  },

  /** Cuenta cuántas citas tiene asociadas un médico (para bloquear el borrado) */
  countCitas(id) {
    return get(
      "SELECT COUNT(*) AS total FROM citas WHERE medico_id = ?",
      [id]
    );
  },

  count() {
    return get("SELECT COUNT(*) AS total FROM medicos");
  },
};

module.exports = MedicoModel;
