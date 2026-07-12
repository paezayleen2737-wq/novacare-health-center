const jwt = require("jsonwebtoken");
const { verificarToken } = require("../utils/jwt");

/**
 * Exige un header "Authorization: Bearer <token>" válido.
 * Si es correcto, agrega el payload decodificado en req.usuario.
 * Distingue explícitamente el caso de token expirado, para que el
 * frontend pueda redirigir al login con un mensaje claro.
 */
function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      exito: false,
      mensaje: "No autorizado: token no proporcionado",
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const payload = verificarToken(token);
    req.usuario = payload;
    next();
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      return res.status(401).json({
        exito: false,
        mensaje: "Sesión expirada, por favor inicia sesión nuevamente",
        codigo: "TOKEN_EXPIRADO",
      });
    }
    return res.status(401).json({
      exito: false,
      mensaje: "Token inválido",
    });
  }
}

module.exports = { requireAuth };
