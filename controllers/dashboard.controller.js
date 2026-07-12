const DashboardModel = require("../models/dashboard.model");
const { asyncHandler } = require("../middlewares/error.middleware");
const { sendSuccess } = require("../utils/apiResponse");

function fechaHoy() {
  return new Date().toISOString().slice(0, 10); // YYYY-MM-DD
}

function horaAhora() {
  return new Date().toTimeString().slice(0, 5); // HH:MM
}

const resumen = asyncHandler(async (req, res) => {
  const datos = await DashboardModel.resumen();
  sendSuccess(res, { mensaje: "Resumen del dashboard obtenido", datos });
});

const espera = asyncHandler(async (req, res) => {
  const datos = await DashboardModel.espera(fechaHoy());
  sendSuccess(res, { mensaje: "Pacientes en espera obtenidos", datos });
});

const proximas = asyncHandler(async (req, res) => {
  const datos = await DashboardModel.proximas(fechaHoy(), horaAhora());
  sendSuccess(res, { mensaje: "Próximas citas obtenidas", datos });
});

module.exports = { resumen, espera, proximas };
