/**
 * NovaCare — Helper centralizado para consumir la API.
 * Adjunta el JWT automáticamente si existe, normaliza el formato de
 * respuesta { exito, mensaje, datos } y maneja la sesión expirada
 * de forma consistente en todos los módulos.
 */
const NC_API_BASE = "/api";

async function ncApiFetch(path, options = {}) {
  const token = localStorage.getItem("nc_token");
  const headers = { "Content-Type": "application/json", ...(options.headers || {}) };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  let res;
  try {
    res = await fetch(`${NC_API_BASE}${path}`, { ...options, headers });
  } catch (err) {
    throw new Error("No se pudo conectar con el servidor. Verifica tu conexión.");
  }

  let body = null;
  try {
    body = await res.json();
  } catch (err) {
    // Respuesta sin cuerpo JSON (poco común, pero no debe romper el flujo)
  }

  // Un 401 solo significa "sesión inválida" si ya había un token adjunto.
  // Si no se envió token (por ejemplo, un intento de login fallido), el 401
  // es simplemente "credenciales incorrectas" y debe manejarlo quien llamó.
  if (res.status === 401 && token) {
    localStorage.removeItem("nc_token");
    localStorage.removeItem("nc_admin_nombre");
    const motivo = body?.codigo === "TOKEN_EXPIRADO" ? "expirada" : "invalida";
    window.location.href = `login.html?sesion=${motivo}`;
    return new Promise(() => {}); // corta la cadena: ya estamos redirigiendo
  }

  if (!res.ok) {
    throw new Error(body?.mensaje || "Ocurrió un error inesperado. Intenta de nuevo.");
  }

  return body?.datos;
}

/** Redirige a login si no hay token guardado. Lo usarán las pantallas protegidas. */
function ncRequireSession() {
  if (!localStorage.getItem("nc_token")) {
    window.location.href = "login.html";
  }
}

/**
 * Igual que ncRequireSession(), pero además vuelve a verificar la sesión
 * cuando la página se restaura desde el bfcache del navegador (típicamente
 * al presionar "Atrás"/"Adelante"). Sin esto, después de cerrar sesión el
 * botón "Atrás" podía mostrar brevemente una captura cacheada de la pantalla
 * protegida antes de que el usuario notara que ya no hay sesión activa.
 * Todas las pantallas protegidas deben usar esta función en vez de
 * ncRequireSession() directamente.
 */
function ncGuardSession() {
  ncRequireSession();
  window.addEventListener("pageshow", (event) => {
    if (event.persisted) {
      ncRequireSession();
    }
  });
}
