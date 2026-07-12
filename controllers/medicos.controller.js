const MedicoModel = require("../models/medico.model");
const { AppError, asyncHandler } = require("../middlewares/error.middleware");
const { sendSuccess } = require("../utils/apiResponse");
const { requireFields } = require("../utils/validators");

const CAMPOS_OBLIGATORIOS = ["nombre", "apellido", "especialidad", "consultorio"];

const listar = asyncHandler(async (req, res) => {
  const medicos = await MedicoModel.findAll();
  sendSuccess(res, { mensaje: "Médicos obtenidos", datos: medicos });
});

const obtener = asyncHandler(async (req, res) => {
  const medico = await MedicoModel.findById(req.params.id);
  if (!medico) throw new AppError("Médico no encontrado", 404);
  sendSuccess(res, { mensaje: "Médico obtenido", datos: medico });
});

const crear = asyncHandler(async (req, res) => {
  requireFields(req.body, CAMPOS_OBLIGATORIOS);

  const { lastID } = await MedicoModel.create(req.body);
  const medico = await MedicoModel.findById(lastID);
  sendSuccess(res, { statusCode: 201, mensaje: "Médico creado", datos: medico });
});

const actualizar = asyncHandler(async (req, res) => {
  const medico = await MedicoModel.findById(req.params.id);
  if (!medico) throw new AppError("Médico no encontrado", 404);

  requireFields(req.body, CAMPOS_OBLIGATORIOS);

  await MedicoModel.update(req.params.id, req.body);
  const actualizado = await MedicoModel.findById(req.params.id);
  sendSuccess(res, { mensaje: "Médico actualizado", datos: actualizado });
});

const eliminar = asyncHandler(async (req, res) => {
  const medico = await MedicoModel.findById(req.params.id);
  if (!medico) throw new AppError("Médico no encontrado", 404);

  const { total } = await MedicoModel.countCitas(req.params.id);
  if (total > 0) {
    throw new AppError(
      `No se puede eliminar: este médico tiene ${total} cita(s) asociada(s). Gestione o cancele esas citas primero`,
      409
    );
  }

  await MedicoModel.remove(req.params.id);
  sendSuccess(res, { mensaje: "Médico eliminado" });
});

module.exports = { listar, obtener, crear, actualizar, eliminar };
