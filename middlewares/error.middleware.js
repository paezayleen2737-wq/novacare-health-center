/**
 * Error controlado de la aplicación. Los controladores lo lanzan
 * (throw new AppError("mensaje", 400)) y el middleware de abajo lo
 * traduce en una respuesta HTTP consistente.
 */
class AppError extends Error {
  constructor(mensaje, statusCode = 400) {
    super(mensaje);
    this.statusCode = statusCode;
    this.isAppError = true;
  }
}

/** Envuelve un controlador async para no repetir try/catch en cada ruta */
function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

/** Middleware de manejo de rutas no encontradas (404) */
function notFoundHandler(req, res) {
  res.status(404).json({ exito: false, mensaje: "Recurso no encontrado" });
}

/** Middleware de manejo de errores. Debe ser el último app.use() */
function errorHandler(err, req, res, next) {
  if (err.isAppError) {
    return res.status(err.statusCode).json({ exito: false, mensaje: err.message });
  }

  // Violación de restricción UNIQUE de SQLite (ej. documento o email duplicado)
  if (err.code === "SQLITE_CONSTRAINT") {
    return res.status(409).json({
      exito: false,
      mensaje: "El registro entra en conflicto con datos ya existentes (dato duplicado)",
    });
  }

  console.error("❌ Error no controlado:", err);
  res.status(500).json({ exito: false, mensaje: "Error interno del servidor" });
}

module.exports = { AppError, asyncHandler, notFoundHandler, errorHandler };
