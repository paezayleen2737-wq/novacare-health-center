ncGuardSession();

document.addEventListener("DOMContentLoaded", () => {
  NovaCareLayout.mount({ active: "citas", pageTitle: "Citas" });

  document.getElementById("icon-search").innerHTML = NC_ICONS.search;
  document.getElementById("icon-plus").innerHTML = NC_ICONS.plus;
  document.getElementById("icon-empty").innerHTML = NC_ICONS.citas;
  document.getElementById("icon-close-1").innerHTML = NC_ICONS.close;

  const tbody = document.getElementById("citas-tbody");
  const emptyState = document.getElementById("citas-empty");
  const emptyStateSub = document.getElementById("citas-empty-sub");
  const searchInput = document.getElementById("search-citas");
  const filtroEstado = document.getElementById("filtro-estado");

  const modalCita = document.getElementById("modal-cita");
  const formCita = document.getElementById("form-cita");
  const modalCitaTitle = document.getElementById("modal-cita-title");
  const formError = document.getElementById("cita-form-error");
  const selectPaciente = document.getElementById("c-paciente");
  const selectMedico = document.getElementById("c-medico");
  const medicoHint = document.getElementById("c-medico-hint");

  const ESTADO_CLASS = {
    Pendiente: "badge-pendiente",
    Confirmada: "badge-confirmada",
    Atendida: "badge-atendida",
    Cancelada: "badge-cancelada",
  };

  // Misma regla que el backend (controllers/citas.controller.js): así el
  // frontend solo ofrece transiciones que el servidor efectivamente aceptará.
  const TRANSICIONES = {
    Pendiente: [
      { estado: "Confirmada", label: "Confirmar", danger: false },
      { estado: "Cancelada", label: "Cancelar", danger: true },
    ],
    Confirmada: [
      { estado: "Atendida", label: "Marcar atendida", danger: false },
      { estado: "Cancelada", label: "Cancelar", danger: true },
    ],
    Atendida: [],
    Cancelada: [],
  };

  let citas = [];
  let pacientes = [];
  let medicos = [];
  let editandoId = null;

  cargarTodo();

  async function cargarTodo() {
    tbody.innerHTML = `
      <tr><td colspan="7" style="padding:8px 18px;"><div class="skeleton-row"></div></td></tr>
      <tr><td colspan="7" style="padding:8px 18px;"><div class="skeleton-row"></div></td></tr>
      <tr><td colspan="7" style="padding:8px 18px;"><div class="skeleton-row"></div></td></tr>
    `;
    emptyState.hidden = true;

    try {
      [citas, pacientes, medicos] = await Promise.all([
        ncApiFetch("/citas"),
        ncApiFetch("/pacientes"),
        ncApiFetch("/medicos"),
      ]);
      poblarSelects();
      aplicarFiltros();
    } catch (err) {
      tbody.innerHTML = "";
      ncToast(err.message, "error");
    }
  }

  function poblarSelects() {
    selectPaciente.innerHTML =
      `<option value="" disabled selected>Selecciona un paciente…</option>` +
      pacientes.map((p) => `<option value="${p.id}">${escapeHtml(p.nombre)} ${escapeHtml(p.apellido)} · ${escapeHtml(p.documento)}</option>`).join("");

    selectMedico.innerHTML =
      `<option value="" disabled selected>Selecciona un médico…</option>` +
      medicos.map((m) => `<option value="${m.id}" data-especialidad="${escapeHtml(m.especialidad)}" data-consultorio="${escapeHtml(m.consultorio)}">Dr(a). ${escapeHtml(m.nombre)} ${escapeHtml(m.apellido)}</option>`).join("");
  }

  selectMedico.addEventListener("change", () => {
    const opt = selectMedico.selectedOptions[0];
    medicoHint.textContent = opt?.dataset?.especialidad
      ? `${opt.dataset.especialidad} · Consultorio ${opt.dataset.consultorio}`
      : "";
  });

  // ---------- Filtros (estado + búsqueda), ambos en cliente ----------

  filtroEstado.addEventListener("change", aplicarFiltros);
  searchInput.addEventListener("input", aplicarFiltros);

  function aplicarFiltros() {
    const estado = filtroEstado.value;
    const q = searchInput.value.trim().toLowerCase();

    let filtradas = citas;
    if (estado) filtradas = filtradas.filter((c) => c.estado === estado);
    if (q) {
      filtradas = filtradas.filter((c) =>
        `${c.paciente_nombre} ${c.paciente_apellido} ${c.medico_nombre} ${c.medico_apellido}`
          .toLowerCase()
          .includes(q)
      );
    }
    renderTabla(filtradas);
  }

  // ---------- Renderizado ----------

  function renderTabla(lista) {
    if (lista.length === 0) {
      tbody.innerHTML = "";
      const hayFiltro = filtroEstado.value || searchInput.value.trim();
      emptyStateSub.textContent = hayFiltro
        ? "Ninguna cita coincide con los filtros aplicados."
        : 'Registra la primera cita con el botón "Nueva cita".';
      emptyState.hidden = false;
      return;
    }

    emptyState.hidden = true;

    // Más próximas primero: por fecha/hora ascendente
    const ordenadas = [...lista].sort((a, b) => (a.fecha + a.hora).localeCompare(b.fecha + b.hora));

    tbody.innerHTML = ordenadas
      .map((c) => {
        const transiciones = TRANSICIONES[c.estado] || [];
        const botonesTransicion = transiciones
          .map(
            (t) =>
              `<button class="btn ${t.danger ? "btn-danger" : "btn-secondary"} btn-xs" data-transicion="${t.estado}" data-id="${c.id}">${t.label}</button>`
          )
          .join("");

        return `
        <tr>
          <td class="cell-name">${escapeHtml(c.paciente_nombre)} ${escapeHtml(c.paciente_apellido)}</td>
          <td>Dr(a). ${escapeHtml(c.medico_nombre)} ${escapeHtml(c.medico_apellido)}</td>
          <td>${escapeHtml(c.motivo)}</td>
          <td class="dato">${c.fecha}</td>
          <td class="dato">${c.hora}</td>
          <td><span class="badge ${ESTADO_CLASS[c.estado]}">${c.estado}</span></td>
          <td>
            <div class="cell-actions">
              ${botonesTransicion}
              <button class="icon-btn" data-action="editar" data-id="${c.id}" title="Editar cita">${NC_ICONS.edit}</button>
              <button class="icon-btn danger" data-action="eliminar" data-id="${c.id}" title="Eliminar cita">${NC_ICONS.trash}</button>
            </div>
          </td>
        </tr>
      `;
      })
      .join("");
  }

  function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str ?? "";
    return div.innerHTML;
  }

  // ---------- Acciones de la tabla ----------

  tbody.addEventListener("click", (e) => {
    const transBtn = e.target.closest("button[data-transicion]");
    if (transBtn) {
      const id = Number(transBtn.dataset.id);
      const nuevoEstado = transBtn.dataset.transicion;
      return cambiarEstado(id, nuevoEstado);
    }

    const actionBtn = e.target.closest("button[data-action]");
    if (!actionBtn) return;
    const id = Number(actionBtn.dataset.id);
    const cita = citas.find((c) => c.id === id);

    if (actionBtn.dataset.action === "editar") abrirModalEditar(cita);
    if (actionBtn.dataset.action === "eliminar") eliminarCita(cita);
  });

  async function cambiarEstado(id, nuevoEstado) {
    if (nuevoEstado === "Cancelada") {
      const confirmado = await ncConfirm({
        title: "¿Cancelar esta cita?",
        message: "El paciente y el médico quedarán liberados de este horario. Esta acción no se puede deshacer.",
        confirmLabel: "Sí, cancelar",
        danger: true,
      });
      if (!confirmado) return;
    }

    try {
      await ncApiFetch(`/citas/${id}/estado`, { method: "PATCH", body: JSON.stringify({ estado: nuevoEstado }) });
      ncToast(`Cita marcada como "${nuevoEstado}"`);
      const actualizadas = await ncApiFetch("/citas");
      citas = actualizadas;
      aplicarFiltros();
    } catch (err) {
      ncToast(err.message, "error");
    }
  }

  // ---------- Modal crear/editar ----------

  document.getElementById("btn-nueva-cita").addEventListener("click", abrirModalNueva);
  document.getElementById("btn-cancelar-cita").addEventListener("click", cerrarModal);
  document.getElementById("modal-cita-close").addEventListener("click", cerrarModal);
  modalCita.addEventListener("click", (e) => {
    if (e.target === modalCita) cerrarModal();
  });

  function abrirModalNueva() {
    if (pacientes.length === 0 || medicos.length === 0) {
      ncToast("Registra al menos un paciente y un médico antes de crear una cita.", "error");
      return;
    }
    editandoId = null;
    modalCitaTitle.textContent = "Nueva cita";
    formCita.reset();
    medicoHint.textContent = "";
    hideFormError();
    modalCita.classList.add("is-open");
  }

  function abrirModalEditar(cita) {
    editandoId = cita.id;
    modalCitaTitle.textContent = "Editar cita";
    hideFormError();

    selectPaciente.value = cita.paciente_id;
    selectMedico.value = cita.medico_id;
    selectMedico.dispatchEvent(new Event("change"));
    document.getElementById("c-motivo").value = cita.motivo;
    document.getElementById("c-fecha").value = cita.fecha;
    document.getElementById("c-hora").value = cita.hora;
    document.getElementById("c-observaciones").value = cita.observaciones || "";

    modalCita.classList.add("is-open");
  }

  function cerrarModal() {
    modalCita.classList.remove("is-open");
  }

  function showFormError(msg) {
    formError.textContent = msg;
    formError.hidden = false;
  }
  function hideFormError() {
    formError.hidden = true;
  }

  formCita.addEventListener("submit", async (e) => {
    e.preventDefault();
    hideFormError();

    const payload = {
      paciente_id: Number(selectPaciente.value),
      medico_id: Number(selectMedico.value),
      motivo: document.getElementById("c-motivo").value.trim(),
      fecha: document.getElementById("c-fecha").value,
      hora: document.getElementById("c-hora").value,
      observaciones: document.getElementById("c-observaciones").value.trim() || null,
    };

    const submitBtn = document.getElementById("btn-guardar-cita");
    submitBtn.disabled = true;
    submitBtn.innerHTML = `<span class="spinner"></span> Guardando…`;

    try {
      if (editandoId) {
        await ncApiFetch(`/citas/${editandoId}`, { method: "PUT", body: JSON.stringify(payload) });
        ncToast("Cita actualizada correctamente");
      } else {
        await ncApiFetch("/citas", { method: "POST", body: JSON.stringify(payload) });
        ncToast("Cita creada correctamente");
      }
      cerrarModal();
      citas = await ncApiFetch("/citas");
      aplicarFiltros();
    } catch (err) {
      showFormError(err.message);
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = "Guardar cita";
    }
  });

  // ---------- Eliminar ----------

  async function eliminarCita(cita) {
    const confirmado = await ncConfirm({
      title: "¿Eliminar cita?",
      message: `Se eliminará la cita de ${cita.paciente_nombre} ${cita.paciente_apellido} del ${cita.fecha}. Esta acción no se puede deshacer.`,
      confirmLabel: "Eliminar",
      danger: true,
    });
    if (!confirmado) return;

    try {
      await ncApiFetch(`/citas/${cita.id}`, { method: "DELETE" });
      ncToast("Cita eliminada correctamente");
      citas = await ncApiFetch("/citas");
      aplicarFiltros();
    } catch (err) {
      ncToast(err.message, "error");
    }
  }
});
