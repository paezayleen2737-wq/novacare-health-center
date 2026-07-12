ncGuardSession();

document.addEventListener("DOMContentLoaded", () => {
  NovaCareLayout.mount({ active: "medicos", pageTitle: "Médicos" });

  document.getElementById("icon-search").innerHTML = NC_ICONS.search;
  document.getElementById("icon-plus").innerHTML = NC_ICONS.plus;
  document.getElementById("icon-empty").innerHTML = NC_ICONS.medicos;
  document.getElementById("icon-close-1").innerHTML = NC_ICONS.close;

  const tbody = document.getElementById("medicos-tbody");
  const emptyState = document.getElementById("medicos-empty");
  const emptyStateSub = document.getElementById("medicos-empty-sub");
  const searchInput = document.getElementById("search-medicos");

  const modalMedico = document.getElementById("modal-medico");
  const formMedico = document.getElementById("form-medico");
  const modalMedicoTitle = document.getElementById("modal-medico-title");
  const formError = document.getElementById("medico-form-error");

  let medicos = [];
  let editandoId = null;

  cargarMedicos();

  // ---------- Carga y renderizado ----------

  async function cargarMedicos() {
    tbody.innerHTML = `
      <tr><td colspan="6" style="padding:8px 18px;"><div class="skeleton-row"></div></td></tr>
      <tr><td colspan="6" style="padding:8px 18px;"><div class="skeleton-row"></div></td></tr>
      <tr><td colspan="6" style="padding:8px 18px;"><div class="skeleton-row"></div></td></tr>
    `;
    emptyState.hidden = true;

    try {
      medicos = await ncApiFetch("/medicos");
      renderTabla(medicos);
    } catch (err) {
      tbody.innerHTML = "";
      ncToast(err.message, "error");
    }
  }

  function renderTabla(lista) {
    if (lista.length === 0) {
      tbody.innerHTML = "";
      emptyStateSub.textContent = searchInput.value.trim()
        ? "Ningún médico coincide con tu búsqueda."
        : 'Registra el primer médico con el botón "Nuevo médico".';
      emptyState.hidden = false;
      return;
    }

    emptyState.hidden = true;
    tbody.innerHTML = lista
      .map(
        (m) => `
      <tr>
        <td class="cell-name">Dr(a). ${escapeHtml(m.nombre)} ${escapeHtml(m.apellido)}</td>
        <td>${escapeHtml(m.especialidad)}</td>
        <td class="dato">${escapeHtml(m.consultorio)}</td>
        <td class="dato">${m.telefono ? escapeHtml(m.telefono) : "—"}</td>
        <td>${m.email ? escapeHtml(m.email) : "—"}</td>
        <td>
          <div class="cell-actions">
            <button class="icon-btn" data-action="editar" data-id="${m.id}" title="Editar médico">${NC_ICONS.edit}</button>
            <button class="icon-btn danger" data-action="eliminar" data-id="${m.id}" title="Eliminar médico">${NC_ICONS.trash}</button>
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

  // ---------- Buscador ----------

  searchInput.addEventListener("input", () => {
    const q = searchInput.value.trim().toLowerCase();
    if (!q) return renderTabla(medicos);

    const filtrados = medicos.filter((m) =>
      `${m.nombre} ${m.apellido} ${m.especialidad}`.toLowerCase().includes(q)
    );
    renderTabla(filtrados);
  });

  // ---------- Acciones de la tabla ----------

  tbody.addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-action]");
    if (!btn) return;
    const id = Number(btn.dataset.id);
    const medico = medicos.find((m) => m.id === id);

    if (btn.dataset.action === "editar") abrirModalEditar(medico);
    if (btn.dataset.action === "eliminar") eliminarMedico(medico);
  });

  // ---------- Modal crear/editar ----------

  document.getElementById("btn-nuevo-medico").addEventListener("click", abrirModalNuevo);
  document.getElementById("btn-cancelar-medico").addEventListener("click", cerrarModal);
  document.getElementById("modal-medico-close").addEventListener("click", cerrarModal);
  modalMedico.addEventListener("click", (e) => {
    if (e.target === modalMedico) cerrarModal();
  });

  function abrirModalNuevo() {
    editandoId = null;
    modalMedicoTitle.textContent = "Nuevo médico";
    formMedico.reset();
    hideFormError();
    modalMedico.classList.add("is-open");
    document.getElementById("m-nombre").focus();
  }

  function abrirModalEditar(medico) {
    editandoId = medico.id;
    modalMedicoTitle.textContent = "Editar médico";
    hideFormError();

    document.getElementById("m-nombre").value = medico.nombre;
    document.getElementById("m-apellido").value = medico.apellido;
    document.getElementById("m-especialidad").value = medico.especialidad;
    document.getElementById("m-consultorio").value = medico.consultorio;
    document.getElementById("m-telefono").value = medico.telefono || "";
    document.getElementById("m-email").value = medico.email || "";

    modalMedico.classList.add("is-open");
  }

  function cerrarModal() {
    modalMedico.classList.remove("is-open");
  }

  function showFormError(msg) {
    formError.textContent = msg;
    formError.hidden = false;
  }
  function hideFormError() {
    formError.hidden = true;
  }

  formMedico.addEventListener("submit", async (e) => {
    e.preventDefault();
    hideFormError();

    const payload = {
      nombre: document.getElementById("m-nombre").value.trim(),
      apellido: document.getElementById("m-apellido").value.trim(),
      especialidad: document.getElementById("m-especialidad").value.trim(),
      consultorio: document.getElementById("m-consultorio").value.trim(),
      telefono: document.getElementById("m-telefono").value.trim() || null,
      email: document.getElementById("m-email").value.trim() || null,
    };

    const submitBtn = document.getElementById("btn-guardar-medico");
    submitBtn.disabled = true;
    submitBtn.innerHTML = `<span class="spinner"></span> Guardando…`;

    try {
      if (editandoId) {
        await ncApiFetch(`/medicos/${editandoId}`, { method: "PUT", body: JSON.stringify(payload) });
        ncToast("Médico actualizado correctamente");
      } else {
        await ncApiFetch("/medicos", { method: "POST", body: JSON.stringify(payload) });
        ncToast("Médico creado correctamente");
      }
      cerrarModal();
      cargarMedicos();
    } catch (err) {
      showFormError(err.message);
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = "Guardar médico";
    }
  });

  // ---------- Eliminar ----------

  async function eliminarMedico(medico) {
    const confirmado = await ncConfirm({
      title: "¿Eliminar médico?",
      message: `Se eliminará a Dr(a). ${medico.nombre} ${medico.apellido} del sistema. Esta acción no se puede deshacer.`,
      confirmLabel: "Eliminar",
      danger: true,
    });
    if (!confirmado) return;

    try {
      await ncApiFetch(`/medicos/${medico.id}`, { method: "DELETE" });
      ncToast("Médico eliminado correctamente");
      cargarMedicos();
    } catch (err) {
      ncToast(err.message, "error");
    }
  }
});
