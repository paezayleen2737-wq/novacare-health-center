const { all, get } = require("../utils/dbHelpers");

const CITA_ACTIVA = "('Pendiente', 'Confirmada')";

const DashboardModel = {
  async resumen() {
    const [totalPacientes, totalMedicos, totalCitas, citasPendientes, porEstado] =
      await Promise.all([
        get("SELECT COUNT(*) AS total FROM pacientes"),
        get("SELECT COUNT(*) AS total FROM medicos"),
        get("SELECT COUNT(*) AS total FROM citas"),
        get("SELECT COUNT(*) AS total FROM citas WHERE estado = 'Pendiente'"),
        all("SELECT estado, COUNT(*) AS total FROM citas GROUP BY estado"),
      ]);

    // Normalizamos a un objeto con los 4 estados siempre presentes,
    // aunque todavía no existan citas en alguno de ellos (evita que el
    // frontend tenga que hacer chequeos de "undefined" en las tarjetas).
    const citasPorEstado = {
      Pendiente: 0,
      Confirmada: 0,
      Atendida: 0,
      Cancelada: 0,
    };
    porEstado.forEach((fila) => {
      citasPorEstado[fila.estado] = fila.total;
    });

    return {
      totalPacientes: totalPacientes.total,
      totalMedicos: totalMedicos.total,
      totalCitas: totalCitas.total,
      citasPendientes: citasPendientes.total,
      citasPorEstado,
    };
  },

  /** Pacientes con cita programada para hoy, aún no atendidos ni cancelados */
  espera(fechaHoy) {
    return all(
      `SELECT c.id, c.motivo, c.hora, c.estado,
              p.nombre AS paciente_nombre, p.apellido AS paciente_apellido,
              m.nombre AS medico_nombre, m.apellido AS medico_apellido
       FROM citas c
       JOIN pacientes p ON p.id = c.paciente_id
       JOIN medicos m ON m.id = c.medico_id
       WHERE c.fecha = ? AND c.estado IN ${CITA_ACTIVA}
       ORDER BY c.hora ASC`,
      [fechaHoy]
    );
  },

  /** Próximas citas activas (hoy en adelante), para tener visibilidad de lo que viene */
  proximas(fechaHoy, horaActual, limite = 8) {
    return all(
      `SELECT c.id, c.motivo, c.fecha, c.hora, c.estado,
              p.nombre AS paciente_nombre, p.apellido AS paciente_apellido,
              m.nombre AS medico_nombre, m.apellido AS medico_apellido
       FROM citas c
       JOIN pacientes p ON p.id = c.paciente_id
       JOIN medicos m ON m.id = c.medico_id
       WHERE c.estado IN ${CITA_ACTIVA}
         AND (c.fecha > ? OR (c.fecha = ? AND c.hora >= ?))
       ORDER BY c.fecha ASC, c.hora ASC
       LIMIT ?`,
      [fechaHoy, fechaHoy, horaActual, limite]
    );
  },
};

module.exports = DashboardModel;
