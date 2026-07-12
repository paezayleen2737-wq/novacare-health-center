const jwt = require("jsonwebtoken");

const SECRET = process.env.JWT_SECRET;
const EXPIRES_IN = process.env.JWT_EXPIRES_IN || "8h";

if (!SECRET) {
  // Falla rápido y claro si alguien olvida configurar el .env, en vez de
  // firmar tokens con "undefined" como secreto.
  throw new Error("JWT_SECRET no está definido en las variables de entorno");
}

function generarToken(payload) {
  return jwt.sign(payload, SECRET, { expiresIn: EXPIRES_IN });
}

/**
 * Verifica el token. Retorna el payload decodificado o lanza el error
 * original de la librería (jwt.TokenExpiredError, jwt.JsonWebTokenError),
 * para que el middleware que lo llama decida cómo responder.
 */
function verificarToken(token) {
  return jwt.verify(token, SECRET);
}

module.exports = { generarToken, verificarToken };
