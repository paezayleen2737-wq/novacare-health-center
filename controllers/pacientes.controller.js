const PacienteModel = require("../models/paciente.model");
const { AppError, asyncHandler } = require("../middlewares/error.middleware");
const { sendSuccess } = require("../utils/apiResponse");
const { requireFields, validarSexo } = require("../utils/validators");

const CAMPOS_OBLIGATORIOS = ["nombre", "apellido", "documento", "sexo", "telefono"];

const listar = asyncHandler(async (req, res) => {
  const pacientes = await PacienteModel.findAll();
  sendSuccess(res, { mensaje: "Pacientes obtenidos", datos: pacientes });
});

const obtener = asyncHandler(async (req, res) => {
  const paciente = await PacienteModel.findById(req.params.id);
  if (!paciente) throw new AppError("Paciente no encontrado", 404);
  sendSuccess(res, { mensaje: "Paciente obtenido", datos: paciente });
});

const crear = asyncHandler(async (req, res) => {
  requireFields(req.body, CAMPOS_OBLIGATORIOS);
  validarSexo(req.body.sexo);

  const existente = await PacienteModel.findByDocumento(req.body.documento.trim());
  if (existente) {
    throw new AppError("Ya existe un paciente registrado con ese documento", 409);
  }

  const { lastID } = await PacienteModel.create(req.body);
  const paciente = await PacienteModel.findById(lastID);
  sendSuccess(res, { statusCode: 201, mensaje: "Paciente creado", datos: paciente });
});

const actualizar = asyncHandler(async (req, res) => {
  const paciente = await PacienteModel.findById(req.params.id);
  if (!paciente) throw new AppError("Paciente no encontrado", 404);

  requireFields(req.body, CAMPOS_OBLIGATORIOS);
  validarSexo(req.body.sexo);

  const otro = await PacienteModel.findByDocumento(req.body.documento.trim());
  if (otro && otro.id !== paciente.id) {
    throw new AppError("Ya existe otro paciente registrado con ese documento", 409);
  }

  await PacienteModel.update(req.params.id, req.body);
  const actualizado = await PacienteModel.findById(req.params.id);
  sendSuccess(res, { mensaje: "Paciente actualizado", datos: actualizado });
});

const eliminar = asyncHandler(async (req, res) => {
  const paciente = await PacienteModel.findById(req.params.id);
  if (!paciente) throw new AppError("Paciente no encontrado", 404);

  const { total } = await PacienteModel.countCitas(req.params.id);
  if (total > 0) {
    throw new AppError(
      `No se puede eliminar: este paciente tiene ${total} cita(s) asociada(s). Gestione o cancele esas citas primero`,
      409
    );
  }

  await PacienteModel.remove(req.params.id);
  sendSuccess(res, { mensaje: "Paciente eliminado" });
});

const historial = asyncHandler(async (req, res) => {
  const paciente = await PacienteModel.findById(req.params.id);
  if (!paciente) throw new AppError("Paciente no encontrado", 404);

  const citas = await PacienteModel.historialCitas(req.params.id);
  sendSuccess(res, { mensaje: "Historial de citas obtenido", datos: citas });
});

module.exports = { listar, obtener, crear, actualizar, eliminar, historial };
