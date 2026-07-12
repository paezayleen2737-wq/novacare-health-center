/**
 * NovaCare — Shell de layout (sidebar + header).
 * Cada página HTML solo necesita dos contenedores vacíos:
 *   <div id="nc-sidebar"></div>  <div id="nc-header"></div>
 * y llamar a NovaCareLayout.mount({ active, pageTitle }).
 * Esto evita repetir el marcado del sidebar/header en cada archivo HTML.
 */
const NovaCareLayout = (() => {
  const NAV_ITEMS = [
    { key: "dashboard", label: "Dashboard", href: "dashboard.html", icon: "dashboard" },
    { key: "pacientes", label: "Pacientes", href: "pacientes.html", icon: "pacientes" },
    { key: "medicos", label: "Médicos", href: "medicos.html", icon: "medicos" },
    { key: "citas", label: "Citas", href: "citas.html", icon: "citas" },
  ];

  /** Nombre del administrador. Se completará al integrar el login (Fase 3, último paso);
   *  por ahora usa lo que haya en localStorage o un valor por defecto razonable. */
  function getAdminNombre() {
    return localStorage.getItem("nc_admin_nombre") || "Administrador NovaCare";
  }

  function getIniciales(nombreCompleto) {
    const partes = nombreCompleto.trim().split(/\s+/);
    const primeras = partes.slice(0, 2).map((p) => p[0]?.toUpperCase() || "");
    return primeras.join("") || "AD";
  }

  function renderSidebar(active) {
    const links = NAV_ITEMS.map((item) => {
      const activeClass = item.key === active ? " is-active" : "";
      return `
        <a class="sidebar-link${activeClass}" href="${item.href}">
          ${NC_ICONS[item.icon]}
          <span>${item.label}</span>
        </a>`;
    }).join("");

    return `
      <div class="sidebar-logo">
        <span class="sidebar-logo-mark">${NC_LOGO_MARK}</span>
        <span class="sidebar-logo-word"><strong>Nova</strong><span>Care</span></span>
      </div>
      <nav class="sidebar-nav">${links}</nav>
      <div class="sidebar-footer">
        <button class="sidebar-logout" id="nc-logout-btn" type="button">
          ${NC_ICONS.logout}
          <span>Cerrar sesión</span>
        </button>
      </div>
    `;
  }

  function renderHeader(pageTitle) {
    const nombre = getAdminNombre();
    const iniciales = getIniciales(nombre);

    return `
      <button class="header-menu-toggle" id="nc-menu-toggle" type="button" aria-label="Abrir menú">
        ${NC_ICONS.menu}
      </button>
      <h1 class="header-title">${pageTitle}</h1>
      <div class="user-menu" id="nc-user-menu">
        <button class="user-menu-trigger" id="nc-user-menu-trigger" type="button">
          <span class="user-avatar">${iniciales}</span>
          <span class="user-menu-name">${nombre}</span>
          ${NC_ICONS.chevronDown}
        </button>
        <div class="user-menu-dropdown">
          <button class="user-menu-dropdown-item" id="nc-logout-dropdown-btn" type="button">
            ${NC_ICONS.logout}
            <span>Cerrar sesión</span>
          </button>
        </div>
      </div>
    `;
  }

  /** Cierra sesión: intenta avisar al backend (best-effort) y limpia el estado local. */
  async function handleLogout() {
    const token = localStorage.getItem("nc_token");
    localStorage.removeItem("nc_token");
    localStorage.removeItem("nc_admin_nombre");

    if (token) {
      try {
        await fetch("/api/auth/logout", {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch (err) {
        // Si falla la llamada (red caída, token ya vencido, etc.) no bloqueamos
        // el cierre de sesión local: el usuario debe poder salir siempre.
      }
    }

    window.location.href = "login.html";
  }

  function wireInteractions() {
    const menuToggle = document.getElementById("nc-menu-toggle");
    const sidebar = document.querySelector(".sidebar");
    const scrim = document.querySelector(".sidebar-scrim");

    if (menuToggle && sidebar) {
      menuToggle.addEventListener("click", () => {
        sidebar.classList.add("is-open");
        scrim?.classList.add("is-visible");
      });
    }

    scrim?.addEventListener("click", () => {
      sidebar?.classList.remove("is-open");
      scrim.classList.remove("is-visible");
    });

    const userMenu = document.getElementById("nc-user-menu");
    const userMenuTrigger = document.getElementById("nc-user-menu-trigger");

    userMenuTrigger?.addEventListener("click", (e) => {
      e.stopPropagation();
      userMenu.classList.toggle("is-open");
    });

    document.addEventListener("click", () => {
      userMenu?.classList.remove("is-open");
    });

    document.getElementById("nc-logout-btn")?.addEventListener("click", handleLogout);
    document.getElementById("nc-logout-dropdown-btn")?.addEventListener("click", handleLogout);
  }

  function mount({ active, pageTitle }) {
    const sidebarRoot = document.getElementById("nc-sidebar");
    const headerRoot = document.getElementById("nc-header");

    if (sidebarRoot) {
      sidebarRoot.classList.add("sidebar");
      sidebarRoot.innerHTML = renderSidebar(active);
    }

    if (headerRoot) {
      headerRoot.classList.add("header");
      headerRoot.innerHTML = renderHeader(pageTitle);
    }

    // Scrim para cerrar el menú móvil al tocar fuera de él
    const scrim = document.createElement("div");
    scrim.className = "sidebar-scrim";
    document.body.appendChild(scrim);

    wireInteractions();
  }

  return { mount };
})();
