ncGuardSession();

document.addEventListener("DOMContentLoaded", async () => {
  NovaCareLayout.mount({ active: "dashboard", pageTitle: "Dashboard" });

  document.getElementById("icon-pacientes").innerHTML = NC_ICONS.pacientes;
  document.getElementById("icon-medicos").innerHTML = NC_ICONS.medicos;
  document.getElementById("icon-citas").innerHTML = NC_ICONS.citas;

  const hoyTexto = new Date().toLocaleDateString("es-DO", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
  document.getElementById("dash-fecha").textContent = hoyTexto.charAt(0).toUpperCase() + hoyTexto.slice(1);

  const ESTADO_DOT_CLASS = {
    Confirmada: "",
    Pendiente: "is-pendiente",
  };

  try {
    const [resumen, espera, proximas] = await Promise.all([
      ncApiFetch("/dashboard/resumen"),
      ncApiFetch("/dashboard/espera"),
      ncApiFetch("/dashboard/proximas"),
    ]);

    renderHero(espera, proximas, resumen.citasPorEstado);
    renderEspera(espera);
    renderProximas(proximas);
    renderTotales(resumen);
  } catch (err) {
    ncToast(err.message, "error");
  }

  // ---------- Hero ----------

  function renderHero(espera, proximas, citasPorEstado) {
    document.getElementById("dash-hero-number").textContent = espera.length;
    document.getElementById("dash-hero-label").textContent =
      espera.length === 1 ? "paciente en espera hoy" : "pacientes en espera hoy";

    const total = Object.values(citasPorEstado).reduce((a, b) => a + b, 0);
    const stackbar = document.getElementById("dash-stackbar");
    stackbar.querySelectorAll("span").forEach((span) => {
      const estado = span.dataset.estado;
      const valor = citasPorEstado[estado] || 0;
      span.style.flex = total > 0 ? String(valor || 0.001) : "1";
    });
    stackbar.style.opacity = total > 0 ? "1" : "0.25";

    const proximaValor = document.getElementById("dash-proxima-valor");
    const proximaSub = document.getElementById("dash-proxima-sub");

    if (proximas.length === 0) {
      proximaValor.textContent = "Sin citas próximas";
      proximaSub.textContent = "";
      return;
    }

    const p = proximas[0];
    const hoy = new Date().toISOString().slice(0, 10);
    const cuando = p.fecha === hoy ? "Hoy" : formatFecha(p.fecha);
    proximaValor.textContent = `${p.hora} — ${p.paciente_nombre} ${p.paciente_apellido}`;
    proximaSub.textContent = `${cuando} · con Dr(a). ${p.medico_nombre} ${p.medico_apellido}`;
  }

  // ---------- Pacientes en espera ----------

  function renderEspera(lista) {
    const el = document.getElementById("dash-espera-list");

    if (lista.length === 0) {
      el.innerHTML = `
        <div class="empty-state" style="padding:32px 16px;">
          <div class="empty-state-icon">${NC_ICONS.pacientes}</div>
          <div class="empty-state-title">Sin pacientes en espera</div>
          <div class="empty-state-sub">No hay citas activas programadas para hoy.</div>
        </div>`;
      return;
    }

    el.innerHTML = lista
      .map(
        (c) => `
      <div class="wait-row">
        <div class="wait-patient">
          <span class="wait-avatar">${iniciales(c.paciente_nombre, c.paciente_apellido)}</span>
          <div>
            <div class="wait-patient-name">${escapeHtml(c.paciente_nombre)} ${escapeHtml(c.paciente_apellido)}</div>
            <div class="wait-meta">${escapeHtml(c.motivo)} · Dr(a). ${escapeHtml(c.medico_nombre)} ${escapeHtml(c.medico_apellido)}</div>
          </div>
        </div>
        <span class="wait-time dato">${c.hora}</span>
      </div>
    `
      )
      .join("");
  }

  // ---------- Próximas citas ----------

  function renderProximas(lista) {
    const el = document.getElementById("dash-proximas-list");

    if (lista.length === 0) {
      el.innerHTML = `
        <div class="empty-state" style="padding:32px 16px;">
          <div class="empty-state-icon">${NC_ICONS.citas}</div>
          <div class="empty-state-title">Sin citas próximas</div>
          <div class="empty-state-sub">No hay citas confirmadas o pendientes por venir.</div>
        </div>`;
      return;
    }

    const hoy = new Date().toISOString().slice(0, 10);

    el.innerHTML = lista
      .map(
        (c) => `
      <div class="timeline-item">
        <span class="timeline-dot ${ESTADO_DOT_CLASS[c.estado] || ""}"></span>
        <div>
          <div class="timeline-time dato">${c.fecha === hoy ? "Hoy" : formatFecha(c.fecha)} · ${c.hora}</div>
          <div class="timeline-name">${escapeHtml(c.paciente_nombre)} ${escapeHtml(c.paciente_apellido)}</div>
          <div class="timeline-doc">Dr(a). ${escapeHtml(c.medico_nombre)} ${escapeHtml(c.medico_apellido)}</div>
        </div>
      </div>
    `
      )
      .join("");
  }

  // ---------- Totales ----------

  function renderTotales(resumen) {
    document.getElementById("stat-pacientes").textContent = resumen.totalPacientes;
    document.getElementById("stat-medicos").textContent = resumen.totalMedicos;
    document.getElementById("stat-citas").textContent = resumen.totalCitas;
  }

  // ---------- Utilidades ----------

  function iniciales(nombre, apellido) {
    return `${nombre?.[0] || ""}${apellido?.[0] || ""}`.toUpperCase();
  }

  function formatFecha(fecha) {
    const [, mes, dia] = fecha.split("-");
    return `${dia}/${mes}`;
  }

  function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str ?? "";
    return div.innerHTML;
  }
});
