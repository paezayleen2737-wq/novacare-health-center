const { AppError } = require("../middlewares/error.middleware");

const FECHA_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const HORA_REGEX = /^([01]\d|2[0-3]):([0-5]\d)$/;
const SEXOS_VALIDOS = ["M", "F", "Otro"];
const ESTADOS_VALIDOS = ["Pendiente", "Confirmada", "Atendida", "Cancelada"];

/** Lanza un AppError 400 listando los campos obligatorios que falten en `body` */
function requireFields(body, campos) {
  const faltantes = campos.filter((campo) => {
    const valor = body[campo];
    return valor === undefined || valor === null || String(valor).trim() === "";
  });

  if (faltantes.length > 0) {
    throw new AppError(`Campos obligatorios faltantes: ${faltantes.join(", ")}`, 400);
  }
}

function validarSexo(sexo) {
  if (!SEXOS_VALIDOS.includes(sexo)) {
    throw new AppError(`Sexo inválido. Valores permitidos: ${SEXOS_VALIDOS.join(", ")}`, 400);
  }
}

function validarFormatoFecha(fecha) {
  if (!FECHA_REGEX.test(fecha) || Number.isNaN(new Date(fecha).getTime())) {
    throw new AppError("Formato de fecha inválido. Use YYYY-MM-DD", 400);
  }
}

function validarFormatoHora(hora) {
  if (!HORA_REGEX.test(hora)) {
    throw new AppError("Formato de hora inválido. Use HH:MM (24 horas)", 400);
  }
}

/** Rechaza fechas anteriores a hoy (comparando solo la fecha, no la hora) */
function validarFechaNoPasada(fecha) {
  const hoy = new Date().toISOString().slice(0, 10);
  if (fecha < hoy) {
    throw new AppError("No se pueden agendar citas en una fecha pasada", 400);
  }
}

function validarEstado(estado) {
  if (!ESTADOS_VALIDOS.includes(estado)) {
    throw new AppError(`Estado inválido. Valores permitidos: ${ESTADOS_VALIDOS.join(", ")}`, 400);
  }
}

module.exports = {
  requireFields,
  validarSexo,
  validarFormatoFecha,
  validarFormatoHora,
  validarFechaNoPasada,
  validarEstado,
  ESTADOS_VALIDOS,
};
