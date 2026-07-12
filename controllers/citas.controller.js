const CitaModel = require("../models/cita.model");
const PacienteModel = require("../models/paciente.model");
const MedicoModel = require("../models/medico.model");
const { AppError, asyncHandler } = require("../middlewares/error.middleware");
const { sendSuccess } = require("../utils/apiResponse");
const {
  requireFields,
  validarFormatoFecha,
  validarFormatoHora,
  validarFechaNoPasada,
  validarEstado,
} = require("../utils/validators");

const CAMPOS_OBLIGATORIOS = ["paciente_id", "medico_id", "motivo", "fecha", "hora"];

// Transiciones de estado permitidas. Cualquier combinación que no esté
// listada aquí se considera inválida (incluye los estados terminales
// Atendida y Cancelada, que no permiten salir hacia ningún otro estado).
const TRANSICIONES_VALIDAS = {
  Pendiente: ["Confirmada", "Cancelada"],
  Confirmada: ["Atendida", "Cancelada"],
  Atendida: [],
  Cancelada: [],
};

async function validarPacienteYMedico(paciente_id, medico_id) {
  const [paciente, medico] = await Promise.all([
    PacienteModel.findById(paciente_id),
    MedicoModel.findById(medico_id),
  ]);
  if (!paciente) throw new AppError("El paciente indicado no existe", 400);
  if (!medico) throw new AppError("El médico indicado no existe", 400);
}

async function validarSinConflicto({ medico_id, fecha, hora, excludeId = null }) {
  const conflicto = await CitaModel.findConflicto({ medico_id, fecha, hora, excludeId });
  if (conflicto) {
    throw new AppError(
      "El médico ya tiene una cita activa agendada en esa fecha y hora",
      409
    );
  }
}

const listar = asyncHandler(async (req, res) => {
  const citas = await CitaModel.findAll();
  sendSuccess(res, { mensaje: "Citas obtenidas", datos: citas });
});

const obtener = asyncHandler(async (req, res) => {
  const cita = await CitaModel.findById(req.params.id);
  if (!cita) throw new AppError("Cita no encontrada", 404);
  sendSuccess(res, { mensaje: "Cita obtenida", datos: cita });
});

const crear = asyncHandler(async (req, res) => {
  requireFields(req.body, CAMPOS_OBLIGATORIOS);
  const { paciente_id, medico_id, fecha, hora } = req.body;

  validarFormatoFecha(fecha);
  validarFormatoHora(hora);
  validarFechaNoPasada(fecha);
  await validarPacienteYMedico(paciente_id, medico_id);
  await validarSinConflicto({ medico_id, fecha, hora });

  const { lastID } = await CitaModel.create(req.body);
  const cita = await CitaModel.findById(lastID);
  sendSuccess(res, { statusCode: 201, mensaje: "Cita creada", datos: cita });
});

const actualizar = asyncHandler(async (req, res) => {
  const cita = await CitaModel.findById(req.params.id);
  if (!cita) throw new AppError("Cita no encontrada", 404);

  requireFields(req.body, CAMPOS_OBLIGATORIOS);
  const { paciente_id, medico_id, fecha, hora } = req.body;

  validarFormatoFecha(fecha);
  validarFormatoHora(hora);
  validarFechaNoPasada(fecha);
  await validarPacienteYMedico(paciente_id, medico_id);
  await validarSinConflicto({ medico_id, fecha, hora, excludeId: cita.id });

  await CitaModel.update(req.params.id, req.body);
  const actualizada = await CitaModel.findById(req.params.id);
  sendSuccess(res, { mensaje: "Cita actualizada", datos: actualizada });
});

/**
 * PATCH /api/citas/:id/estado
 * Cambia únicamente el estado de la cita, respetando el flujo:
 * Pendiente -> Confirmada -> Atendida
 * Pendiente/Confirmada -> Cancelada
 * Atendida y Cancelada son estados terminales.
 */
const cambiarEstado = asyncHandler(async (req, res) => {
  const cita = await CitaModel.findById(req.params.id);
  if (!cita) throw new AppError("Cita no encontrada", 404);

  const { estado: nuevoEstado } = req.body;
  requireFields(req.body, ["estado"]);
  validarEstado(nuevoEstado);

  const permitidos = TRANSICIONES_VALIDAS[cita.estado] || [];
  if (!permitidos.includes(nuevoEstado)) {
    throw new AppError(
      `Transición de estado no permitida: de "${cita.estado}" a "${nuevoEstado}"`,
      400
    );
  }

  await CitaModel.updateEstado(req.params.id, nuevoEstado);
  const actualizada = await CitaModel.findById(req.params.id);
  sendSuccess(res, { mensaje: "Estado de la cita actualizado", datos: actualizada });
});

const eliminar = asyncHandler(async (req, res) => {
  const cita = await CitaModel.findById(req.params.id);
  if (!cita) throw new AppError("Cita no encontrada", 404);

  await CitaModel.remove(req.params.id);
  sendSuccess(res, { mensaje: "Cita eliminada" });
});

module.exports = { listar, obtener, crear, actualizar, cambiarEstado, eliminar };
