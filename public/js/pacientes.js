ncGuardSession();

document.addEventListener("DOMContentLoaded", () => {
  NovaCareLayout.mount({ active: "pacientes", pageTitle: "Pacientes" });

  // Íconos estáticos de la página
  document.getElementById("icon-search").innerHTML = NC_ICONS.search;
  document.getElementById("icon-plus").innerHTML = NC_ICONS.plus;
  document.getElementById("icon-empty").innerHTML = NC_ICONS.pacientes;
  document.getElementById("icon-close-1").innerHTML = NC_ICONS.close;
  document.getElementById("icon-close-2").innerHTML = NC_ICONS.close;

  const tbody = document.getElementById("pacientes-tbody");
  const emptyState = document.getElementById("pacientes-empty");
  const emptyStateSub = document.getElementById("pacientes-empty-sub");
  const searchInput = document.getElementById("search-pacientes");

  const modalPaciente = document.getElementById("modal-paciente");
  const formPaciente = document.getElementById("form-paciente");
  const modalPacienteTitle = document.getElementById("modal-paciente-title");
  const formError = document.getElementById("paciente-form-error");

  const modalHistorial = document.getElementById("modal-historial");
  const historialBody = document.getElementById("historial-body");
  const modalHistorialTitle = document.getElementById("modal-historial-title");

  let pacientes = [];
  let editandoId = null;

  const SEXO_LABEL = { M: "Masculino", F: "Femenino", Otro: "Otro" };

  cargarPacientes();

  // ---------- Carga y renderizado ----------

  async function cargarPacientes() {
    tbody.innerHTML = `<tr><td colspan="6"><div class="skeleton-row"></div></td></tr>`.repeat(1);
    tbody.innerHTML = `
      <tr><td colspan="6" style="padding:8px 18px;"><div class="skeleton-row"></div></td></tr>
      <tr><td colspan="6" style="padding:8px 18px;"><div class="skeleton-row"></div></td></tr>
      <tr><td colspan="6" style="padding:8px 18px;"><div class="skeleton-row"></div></td></tr>
    `;
    emptyState.hidden = true;

    try {
      pacientes = await ncApiFetch("/pacientes");
      renderTabla(pacientes);
    } catch (err) {
      tbody.innerHTML = "";
      ncToast(err.message, "error");
    }
  }

  function renderTabla(lista) {
    if (lista.length === 0) {
      tbody.innerHTML = "";
      emptyStateSub.textContent = searchInput.value.trim()
        ? "Ningún paciente coincide con tu búsqueda."
        : 'Registra el primer paciente con el botón "Nuevo paciente".';
      emptyState.hidden = false;
      return;
    }

    emptyState.hidden = true;
    tbody.innerHTML = lista
      .map(
        (p) => `
      <tr>
        <td class="cell-name">${escapeHtml(p.nombre)} ${escapeHtml(p.apellido)}</td>
        <td class="dato">${escapeHtml(p.documento)}</td>
        <td>${SEXO_LABEL[p.sexo] || p.sexo}</td>
        <td class="dato">${escapeHtml(p.telefono)}</td>
        <td class="dato">${p.fecha_nacimiento ? escapeHtml(p.fecha_nacimiento) : "—"}</td>
        <td>
          <div class="cell-actions">
            <button class="icon-btn" data-action="historial" data-id="${p.id}" title="Ver historial de citas">${NC_ICONS.clock}</button>
            <button class="icon-btn" data-action="editar" data-id="${p.id}" title="Editar paciente">${NC_ICONS.edit}</button>
            <button class="icon-btn danger" data-action="eliminar" data-id="${p.id}" title="Eliminar paciente">${NC_ICONS.trash}</button>
          </div>
        </td>
      </tr>
    `
      )
      .join("");
  }

  function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str ?? "";
    return div.innerHTML;
  }

  // ---------- Buscador (cliente, sin llamada al backend) ----------

  searchInput.addEventListener("input", () => {
    const q = searchInput.value.trim().toLowerCase();
    if (!q) return renderTabla(pacientes);

    const filtrados = pacientes.filter((p) =>
      `${p.nombre} ${p.apellido} ${p.documento}`.toLowerCase().includes(q)
    );
    renderTabla(filtrados);
  });

  // ---------- Acciones de la tabla (delegación de eventos) ----------

  tbody.addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-action]");
    if (!btn) return;
    const id = Number(btn.dataset.id);
    const paciente = pacientes.find((p) => p.id === id);

    if (btn.dataset.action === "editar") abrirModalEditar(paciente);
    if (btn.dataset.action === "eliminar") eliminarPaciente(paciente);
    if (btn.dataset.action === "historial") abrirHistorial(paciente);
  });

  // ---------- Modal crear/editar ----------

  document.getElementById("btn-nuevo-paciente").addEventListener("click", abrirModalNuevo);
  document.getElementById("btn-cancelar-paciente").addEventListener("click", cerrarModalPaciente);
  document.getElementById("modal-paciente-close").addEventListener("click", cerrarModalPaciente);
  modalPaciente.addEventListener("click", (e) => {
    if (e.target === modalPaciente) cerrarModalPaciente();
  });

  function abrirModalNuevo() {
    editandoId = null;
    modalPacienteTitle.textContent = "Nuevo paciente";
    formPaciente.reset();
    hideFormError();
    modalPaciente.classList.add("is-open");
    document.getElementById("p-nombre").focus();
  }

  function abrirModalEditar(paciente) {
    editandoId = paciente.id;
    modalPacienteTitle.textContent = "Editar paciente";
    hideFormError();

    document.getElementById("p-nombre").value = paciente.nombre;
    document.getElementById("p-apellido").value = paciente.apellido;
    document.getElementById("p-documento").value = paciente.documento;
    document.getElementById("p-sexo").value = paciente.sexo;
    document.getElementById("p-telefono").value = paciente.telefono;
    document.getElementById("p-fecha-nacimiento").value = paciente.fecha_nacimiento || "";
    document.getElementById("p-email").value = paciente.email || "";

    modalPaciente.classList.add("is-open");
  }

  function cerrarModalPaciente() {
    modalPaciente.classList.remove("is-open");
  }

  function showFormError(msg) {
    formError.textContent = msg;
    formError.hidden = false;
  }
  function hideFormError() {
    formError.hidden = true;
  }

  formPaciente.addEventListener("submit", async (e) => {
    e.preventDefault();
    hideFormError();

    const payload = {
      nombre: document.getElementById("p-nombre").value.trim(),
      apellido: document.getElementById("p-apellido").value.trim(),
      documento: document.getElementById("p-documento").value.trim(),
      sexo: document.getElementById("p-sexo").value,
      telefono: document.getElementById("p-telefono").value.trim(),
      fecha_nacimiento: document.getElementById("p-fecha-nacimiento").value || null,
      email: document.getElementById("p-email").value.trim() || null,
    };

    const submitBtn = document.getElementById("btn-guardar-paciente");
    submitBtn.disabled = true;
    submitBtn.innerHTML = `<span class="spinner"></span> Guardando…`;

    try {
      if (editandoId) {
        await ncApiFetch(`/pacientes/${editandoId}`, { method: "PUT", body: JSON.stringify(payload) });
        ncToast("Paciente actualizado correctamente");
      } else {
        await ncApiFetch("/pacientes", { method: "POST", body: JSON.stringify(payload) });
        ncToast("Paciente creado correctamente");
      }
      cerrarModalPaciente();
      cargarPacientes();
    } catch (err) {
      showFormError(err.message);
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = "Guardar paciente";
    }
  });

  // ---------- Eliminar ----------

  async function eliminarPaciente(paciente) {
    const confirmado = await ncConfirm({
      title: "¿Eliminar paciente?",
      message: `Se eliminará a ${paciente.nombre} ${paciente.apellido} del sistema. Esta acción no se puede deshacer.`,
      confirmLabel: "Eliminar",
      danger: true,
    });
    if (!confirmado) return;

    try {
      await ncApiFetch(`/pacientes/${paciente.id}`, { method: "DELETE" });
      ncToast("Paciente eliminado correctamente");
      cargarPacientes();
    } catch (err) {
      // Incluye el caso 409: "tiene N cita(s) asociada(s)..." ya viene
      // redactado por el backend, así que lo mostramos tal cual.
      ncToast(err.message, "error");
    }
  }

  // ---------- Historial de citas ----------

  const ESTADO_CLASS = {
    Pendiente: "badge-pendiente",
    Confirmada: "badge-confirmada",
    Atendida: "badge-atendida",
    Cancelada: "badge-cancelada",
  };

  document.getElementById("modal-historial-close").addEventListener("click", () => {
    modalHistorial.classList.remove("is-open");
  });
  modalHistorial.addEventListener("click", (e) => {
    if (e.target === modalHistorial) modalHistorial.classList.remove("is-open");
  });

  async function abrirHistorial(paciente) {
    modalHistorialTitle.textContent = `Historial de ${paciente.nombre} ${paciente.apellido}`;
    historialBody.innerHTML = `<div class="skeleton-row"></div><div class="skeleton-row"></div>`;
    modalHistorial.classList.add("is-open");

    try {
      const citas = await ncApiFetch(`/pacientes/${paciente.id}/citas`);
      if (citas.length === 0) {
        historialBody.innerHTML = `
          <div class="empty-state">
            <div class="empty-state-icon">${NC_ICONS.clock}</div>
            <div class="empty-state-title">Sin citas registradas</div>
            <div class="empty-state-sub">Este paciente aún no tiene citas en el sistema.</div>
          </div>`;
        return;
      }

      historialBody.innerHTML = citas
        .map(
          (c) => `
        <div class="wait-row" style="cursor:default;">
          <div class="wait-patient">
            <span class="wait-avatar dato">${c.fecha.slice(8, 10)}</span>
            <div>
              <div class="wait-patient-name">${escapeHtml(c.motivo)}</div>
              <div class="wait-meta">Dr(a). ${escapeHtml(c.medico_nombre)} ${escapeHtml(c.medico_apellido)} · ${escapeHtml(c.especialidad)}</div>
            </div>
          </div>
          <div style="text-align:right;">
            <div class="dato" style="font-size:12.5px; margin-bottom:4px;">${c.fecha} · ${c.hora}</div>
            <span class="badge ${ESTADO_CLASS[c.estado]}">${c.estado}</span>
          </div>
        </div>
      `
        )
        .join("");
    } catch (err) {
      historialBody.innerHTML = `<div class="form-error">${err.message}</div>`;
    }
  }
});
