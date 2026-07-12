document.addEventListener("DOMContentLoaded", () => {
  // Si ya hay una sesión guardada, no tiene sentido mostrar el login de nuevo
  if (localStorage.getItem("nc_token")) {
    window.location.href = "dashboard.html";
    return;
  }

  document.getElementById("brand-logo-mark").innerHTML = NC_LOGO_MARK;
  document.getElementById("feature-icon-pacientes").innerHTML = NC_ICONS.pacientes;
  document.getElementById("feature-icon-citas").innerHTML = NC_ICONS.citas;
  document.getElementById("feature-icon-dashboard").innerHTML = NC_ICONS.dashboard;

  const form = document.getElementById("login-form");
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");
  const errorBox = document.getElementById("login-error");
  const submitBtn = document.getElementById("login-submit");
  const toggleBtn = document.getElementById("toggle-password");

  toggleBtn.innerHTML = NC_ICONS.eyeOpen;

  // Si venimos redirigidos por una sesión expirada o inválida, lo explicamos
  const params = new URLSearchParams(window.location.search);
  if (params.get("sesion") === "expirada") {
    showError("Tu sesión expiró. Inicia sesión nuevamente.");
  } else if (params.get("sesion") === "invalida") {
    showError("Tu sesión ya no es válida. Inicia sesión nuevamente.");
  }

  toggleBtn.addEventListener("click", () => {
    const isHidden = passwordInput.type === "password";
    passwordInput.type = isHidden ? "text" : "password";
    toggleBtn.innerHTML = isHidden ? NC_ICONS.eyeOff : NC_ICONS.eyeOpen;
    toggleBtn.setAttribute("aria-label", isHidden ? "Ocultar contraseña" : "Mostrar contraseña");
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    hideError();

    const email = emailInput.value.trim();
    const password = passwordInput.value;

    if (!email || !password) {
      showError("Completa tu correo y contraseña para continuar.");
      return;
    }

    setLoading(true);

    try {
      const datos = await ncApiFetch("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });

      localStorage.setItem("nc_token", datos.token);
      localStorage.setItem("nc_admin_nombre", datos.usuario.nombre);
      window.location.href = "dashboard.html";
    } catch (err) {
      showError(err.message || "No se pudo iniciar sesión. Intenta de nuevo.");
      setLoading(false);
    }
  });

  function showError(mensaje) {
    errorBox.textContent = mensaje;
    errorBox.hidden = false;
  }

  function hideError() {
    errorBox.hidden = true;
    errorBox.textContent = "";
  }

  function setLoading(isLoading) {
    submitBtn.disabled = isLoading;
    submitBtn.innerHTML = isLoading
      ? `<span class="spinner"></span> Ingresando…`
      : `Iniciar sesión`;
  }
});
