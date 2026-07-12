/**
 * NovaCare — Helpers de UI compartidos entre módulos: toasts y diálogo
 * de confirmación. Ambos inyectan su propio marcado en el DOM la primera
 * vez que se usan, así cada página solo necesita incluir este script.
 */

function ncToast(mensaje, type = "success") {
  let stack = document.getElementById("nc-toast-stack");
  if (!stack) {
    stack = document.createElement("div");
    stack.id = "nc-toast-stack";
    stack.className = "toast-stack";
    document.body.appendChild(stack);
  }

  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `${type === "error" ? NC_ICONS.alertCircle : NC_ICONS.checkCircle}<span>${mensaje}</span>`;
  stack.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transition = "opacity 200ms ease";
    setTimeout(() => toast.remove(), 200);
  }, 4000);
}

/**
 * Devuelve una Promise<boolean>: true si el usuario confirma, false si cancela.
 * options: { title, message, confirmLabel, cancelLabel, danger }
 */
function ncConfirm(options) {
  const {
    title = "¿Confirmar acción?",
    message = "",
    confirmLabel = "Confirmar",
    cancelLabel = "Cancelar",
    danger = false,
  } = options;

  return new Promise((resolve) => {
    let overlay = document.getElementById("nc-confirm-overlay");
    if (!overlay) {
      overlay = document.createElement("div");
      overlay.id = "nc-confirm-overlay";
      overlay.className = "modal-overlay";
      overlay.innerHTML = `
        <div class="modal modal-sm">
          <div class="modal-body" style="padding-top:32px;">
            <div class="modal-danger-icon" id="nc-confirm-icon">${NC_ICONS.alertTriangle}</div>
            <h2 id="nc-confirm-title" style="margin-bottom:8px;"></h2>
            <p id="nc-confirm-message" style="font-size:0.88rem; color:var(--color-ink-soft); line-height:1.5;"></p>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" id="nc-confirm-cancel" type="button"></button>
            <button class="btn btn-danger" id="nc-confirm-accept" type="button"></button>
          </div>
        </div>
      `;
      document.body.appendChild(overlay);
    }

    overlay.querySelector("#nc-confirm-title").textContent = title;
    overlay.querySelector("#nc-confirm-message").textContent = message;
    overlay.querySelector("#nc-confirm-cancel").textContent = cancelLabel;
    const acceptBtn = overlay.querySelector("#nc-confirm-accept");
    acceptBtn.textContent = confirmLabel;
    acceptBtn.className = danger ? "btn btn-danger" : "btn btn-primary";

    overlay.classList.add("is-open");

    function cleanup(result) {
      overlay.classList.remove("is-open");
      acceptBtn.removeEventListener("click", onAccept);
      cancelBtn.removeEventListener("click", onCancel);
      overlay.removeEventListener("click", onOverlayClick);
      resolve(result);
    }

    const cancelBtn = overlay.querySelector("#nc-confirm-cancel");
    function onAccept() { cleanup(true); }
    function onCancel() { cleanup(false); }
    function onOverlayClick(e) { if (e.target === overlay) cleanup(false); }

    acceptBtn.addEventListener("click", onAccept);
    cancelBtn.addEventListener("click", onCancel);
    overlay.addEventListener("click", onOverlayClick);
  });
}
