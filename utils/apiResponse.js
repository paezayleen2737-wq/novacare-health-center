/**
 * Formato uniforme de respuesta para toda la API:
 *
 * Éxito:
 * { "exito": true, "mensaje": "...", "datos": {...} }
 *
 * Error (generado por el error.middleware.js):
 * { "exito": false, "mensaje": "..." }
 */

function sendSuccess(res, { statusCode = 200, mensaje = "OK", datos = null } = {}) {
  return res.status(statusCode).json({ exito: true, mensaje, datos });
}

module.exports = { sendSuccess };
