const bcrypt = require("bcrypt");

const UsuarioModel = require("../models/usuario.model");
const { generarToken } = require("../utils/jwt");
const { AppError, asyncHandler } = require("../middlewares/error.middleware");
const { sendSuccess } = require("../utils/apiResponse");

/**
 * POST /api/auth/login
 * Body: { email, password }
 */
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new AppError("Email y contraseña son obligatorios", 400);
  }

  const usuario = await UsuarioModel.findByEmail(email.trim().toLowerCase());

  // Mensaje deliberadamente genérico: no revelamos si falló el email o la
  // contraseña, para no facilitar enumeración de usuarios.
  if (!usuario) {
    throw new AppError("Credenciales inválidas", 401);
  }

  const passwordValida = await bcrypt.compare(password, usuario.password_hash);
  if (!passwordValida) {
    throw new AppError("Credenciales inválidas", 401);
  }

  const token = generarToken({ id: usuario.id, email: usuario.email });

  sendSuccess(res, {
    mensaje: "Inicio de sesión exitoso",
    datos: {
      token,
      usuario: { id: usuario.id, nombre: usuario.nombre, email: usuario.email },
    },
  });
});

/**
 * GET /api/auth/me
 * Requiere estar autenticado (req.usuario lo llena el auth.middleware.js).
 * Útil para que el frontend valide la sesión al cargar la app.
 */
const me = asyncHandler(async (req, res) => {
  const usuario = await UsuarioModel.findById(req.usuario.id);

  if (!usuario) {
    throw new AppError("Usuario no encontrado", 404);
  }

  sendSuccess(res, { mensaje: "Sesión válida", datos: { usuario } });
});

/**
 * POST /api/auth/logout
 * Con JWT no hay estado de sesión en el servidor que "cerrar": el token
 * seguirá siendo técnicamente válido hasta que expire. Este endpoint existe
 * para que el frontend tenga un flujo explícito y consistente (llamarlo,
 * recibir confirmación, y ahí sí eliminar el token guardado localmente).
 */
const logout = asyncHandler(async (req, res) => {
  sendSuccess(res, { mensaje: "Sesión cerrada correctamente" });
});

module.exports = { login, me, logout };
