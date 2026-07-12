const { all, get, run } = require("../utils/dbHelpers");

const PacienteModel = {
  findAll() {
    return all("SELECT * FROM pacientes ORDER BY apellido, nombre");
  },

  findById(id) {
    return get("SELECT * FROM pacientes WHERE id = ?", [id]);
  },

  findByDocumento(documento) {
    return get("SELECT * FROM pacientes WHERE documento = ?", [documento]);
  },

  create({ nombre, apellido, documento, sexo, telefono, email, fecha_nacimiento }) {
    return run(
      `INSERT INTO pacientes (nombre, apellido, documento, sexo, telefono, email, fecha_nacimiento)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [nombre, apellido, documento, sexo, telefono, email || null, fecha_nacimiento || null]
    );
  },

  update(id, { nombre, apellido, documento, sexo, telefono, email, fecha_nacimiento }) {
    return run(
      `UPDATE pacientes
       SET nombre = ?, apellido = ?, documento = ?, sexo = ?, telefono = ?, email = ?, fecha_nacimiento = ?
       WHERE id = ?`,
      [nombre, apellido, documento, sexo, telefono, email || null, fecha_nacimiento || null, id]
    );
  },

  remove(id) {
    return run("DELETE FROM pacientes WHERE id = ?", [id]);
  },

  /** Cuenta cuántas citas tiene asociadas un paciente (para bloquear el borrado) */
  countCitas(id) {
    return get(
      "SELECT COUNT(*) AS total FROM citas WHERE paciente_id = ?",
      [id]
    );
  },

  /** Historial de citas de un paciente, con datos del médico incluidos */
  historialCitas(id) {
    return all(
      `SELECT c.id, c.motivo, c.observaciones, c.fecha, c.hora, c.estado,
              m.nombre AS medico_nombre, m.apellido AS medico_apellido, m.especialidad
       FROM citas c
       JOIN medicos m ON m.id = c.medico_id
       WHERE c.paciente_id = ?
       ORDER BY c.fecha DESC, c.hora DESC`,
      [id]
    );
  },

  count() {
    return get("SELECT COUNT(*) AS total FROM pacientes");
  },
};

module.exports = PacienteModel;
