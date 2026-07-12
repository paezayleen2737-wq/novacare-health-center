const { all, get, run } = require("../utils/dbHelpers");

// Selección base reutilizada en varias consultas: trae la cita ya "enriquecida"
// con el nombre del paciente y del médico, para no obligar al frontend a cruzar datos.
const SELECT_BASE = `
  SELECT
    c.id, c.motivo, c.observaciones, c.fecha, c.hora, c.estado, c.created_at,
    p.id   AS paciente_id, p.nombre AS paciente_nombre, p.apellido AS paciente_apellido,
    m.id   AS medico_id, m.nombre AS medico_nombre, m.apellido AS medico_apellido,
    m.especialidad AS medico_especialidad, m.consultorio AS medico_consultorio
  FROM citas c
  JOIN pacientes p ON p.id = c.paciente_id
  JOIN medicos m ON m.id = c.medico_id
`;

const CitaModel = {
  findAll() {
    return all(`${SELECT_BASE} ORDER BY c.fecha DESC, c.hora DESC`);
  },

  findById(id) {
    return get(`${SELECT_BASE} WHERE c.id = ?`, [id]);
  },

  create({ paciente_id, medico_id, motivo, observaciones, fecha, hora }) {
    return run(
      `INSERT INTO citas (paciente_id, medico_id, motivo, observaciones, fecha, hora)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [paciente_id, medico_id, motivo, observaciones || null, fecha, hora]
    );
  },

  updateEstado(id, estado) {
    return run("UPDATE citas SET estado = ? WHERE id = ?", [estado, id]);
  },

  update(id, { paciente_id, medico_id, motivo, observaciones, fecha, hora }) {
    return run(
      `UPDATE citas
       SET paciente_id = ?, medico_id = ?, motivo = ?, observaciones = ?, fecha = ?, hora = ?
       WHERE id = ?`,
      [paciente_id, medico_id, motivo, observaciones || null, fecha, hora, id]
    );
  },

  remove(id) {
    return run("DELETE FROM citas WHERE id = ?", [id]);
  },

  /**
   * Busca si ya existe una cita activa (no Cancelada) para el mismo médico,
   * fecha y hora. Se usa para bloquear la doble reserva.
   * excludeId se usa al editar, para no chocar contra sí misma.
   */
  findConflicto({ medico_id, fecha, hora, excludeId = null }) {
    const params = [medico_id, fecha, hora];
    let sql = `
      SELECT * FROM citas
      WHERE medico_id = ? AND fecha = ? AND hora = ? AND estado != 'Cancelada'
    `;
    if (excludeId) {
      sql += " AND id != ?";
      params.push(excludeId);
    }
    return get(sql, params);
  },

  count() {
    return get("SELECT COUNT(*) AS total FROM citas");
  },

  countPendientes() {
    return get(
      "SELECT COUNT(*) AS total FROM citas WHERE estado = 'Pendiente'"
    );
  },
};

module.exports = CitaModel;
