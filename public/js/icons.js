/**
 * NovaCare — Set de íconos de línea.
 * Trazo 1.75px, 24x24, esquinas redondeadas. Se reutilizan tal cual
 * en toda la interfaz (nav, botones, estados vacíos) para que la
 * iconografía se sienta como un sistema y no una mezcla de estilos.
 */
/**
 * Marca gráfica de NovaCare — "estallido" de 4 rayos, uno en dorado.
 * Se usa en el sidebar, y es la base para el favicon.
 * currentColor no aplica aquí: los rayos usan fill explícito porque
 * combinan dos colores de marca (verde/blanco + dorado), no un solo tono.
 */
const NC_LOGO_MARK = `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M50 50 L41 4 Q50 -4 59 4 Z" fill="#E5A93C"/>
  <path d="M50 50 L96 41 Q104 50 96 59 Z" fill="#EAF3EF"/>
  <path d="M50 50 L59 96 Q50 104 41 96 Z" fill="#EAF3EF" opacity="0.8"/>
  <path d="M50 50 L4 59 Q-4 50 4 41 Z" fill="#EAF3EF" opacity="0.6"/>
  <circle cx="50" cy="50" r="9" fill="#0F2B24"/>
</svg>`;

const NC_ICONS = {
  dashboard: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
    <rect x="3.5" y="3.5" width="7.5" height="7.5" rx="1.5"/>
    <rect x="13" y="3.5" width="7.5" height="4.5" rx="1.5"/>
    <rect x="13" y="10.5" width="7.5" height="10" rx="1.5"/>
    <rect x="3.5" y="13.5" width="7.5" height="7" rx="1.5"/>
  </svg>`,

  pacientes: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="9" cy="8" r="3"/>
    <path d="M3.5 19c0-3 2.5-5 5.5-5s5.5 2 5.5 5"/>
    <circle cx="17" cy="7.5" r="2.25"/>
    <path d="M14.8 12c2.4.2 4.2 2 4.7 4.3"/>
  </svg>`,

  medicos: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
    <path d="M8 3.5v4.2a4 4 0 0 0 8 0V3.5"/>
    <path d="M8 5.5H6.5A1.5 1.5 0 0 0 5 7v3.5a7 7 0 0 0 14 0V7a1.5 1.5 0 0 0-1.5-1.5H16"/>
    <circle cx="18.5" cy="16.5" r="2.5"/>
  </svg>`,

  citas: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
    <rect x="3.5" y="4.5" width="17" height="16" rx="2"/>
    <path d="M3.5 9.5h17"/>
    <path d="M8 3v3M16 3v3"/>
    <path d="M8 13.5h2M8 17h5"/>
  </svg>`,

  logout: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
    <path d="M9 4.5H6a1.5 1.5 0 0 0-1.5 1.5v12A1.5 1.5 0 0 0 6 19.5h3"/>
    <path d="M14.5 16 19 12l-4.5-4"/>
    <path d="M19 12H9"/>
  </svg>`,

  chevronDown: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M6 9l6 6 6-6"/>
  </svg>`,

  menu: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
    <path d="M4 6.5h16M4 12h16M4 17.5h16"/>
  </svg>`,
  eyeOpen: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
    <path d="M2.5 12S6 5 12 5s9.5 7 9.5 7-3.5 7-9.5 7-9.5-7-9.5-7Z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>`,

  eyeOff: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
    <path d="M3 3l18 18"/>
    <path d="M10.6 5.2A9.4 9.4 0 0 1 12 5c6 0 9.5 7 9.5 7a15 15 0 0 1-3.1 3.9M6.6 6.6C3.9 8.3 2.5 12 2.5 12s3.5 7 9.5 7a9.3 9.3 0 0 0 4-1"/>
    <path d="M9.9 10a3 3 0 0 0 4.1 4.1"/>
  </svg>`,
  search: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/>
  </svg>`,

  close: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
    <path d="M6 6l12 12M18 6 6 18"/>
  </svg>`,

  plus: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M12 5v14M5 12h14"/>
  </svg>`,

  edit: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
    <path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/>
  </svg>`,

  trash: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
    <path d="M4 7h16M9 7V4.5A1.5 1.5 0 0 1 10.5 3h3A1.5 1.5 0 0 1 15 4.5V7m2 0v12.5A1.5 1.5 0 0 1 15.5 21h-7A1.5 1.5 0 0 1 7 19.5V7"/>
  </svg>`,

  alertTriangle: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
    <path d="M10.4 4 2.9 18a1.5 1.5 0 0 0 1.3 2.2h15.6a1.5 1.5 0 0 0 1.3-2.2L13.6 4a1.5 1.5 0 0 0-2.6 0Z"/>
    <path d="M12 9.5v4M12 17h.01"/>
  </svg>`,

  checkCircle: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="12" cy="12" r="9"/><path d="m8.5 12.5 2.4 2.4L16 10"/>
  </svg>`,

  alertCircle: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="12" cy="12" r="9"/><path d="M12 8v5M12 16h.01"/>
  </svg>`,

  clock: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2"/>
  </svg>`,
};
