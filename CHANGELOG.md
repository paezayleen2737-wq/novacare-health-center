# CHANGELOG — NovaCare Health Center

## Fase 1 — Base de datos y arquitectura
✔ Estructura de carpetas por capas (config, middlewares, routes, controllers, models, utils)
✔ Esquema de base de datos: `usuarios`, `pacientes`, `medicos`, `citas` con relaciones e índices
✔ Restricciones `CHECK` a nivel de base de datos (sexo, estado)
✔ Conexión SQLite con `PRAGMA foreign_keys ON`
✔ Middleware de errores centralizado (`AppError`, `asyncHandler`, 404, 500)
✔ Helper de promesas sobre `sqlite3` (`dbHelpers.js`)

## Fase 2 — Autenticación y CRUD completo
✔ Login con JWT + bcrypt, expiración configurable vía `JWT_EXPIRES_IN`
✔ Endpoint `GET /api/auth/me` para validar sesión activa
✔ Endpoint `POST /api/auth/logout`
✔ Manejo diferenciado de sesión expirada (`codigo: TOKEN_EXPIRADO`)
✔ Endpoint `GET /api/health`
✔ Formato uniforme de respuestas en toda la API (`{ exito, mensaje, datos }`)
✔ Usuario administrador único, creado vía `npm run seed`
✔ CRUD completo de **pacientes** (con historial de citas y bloqueo de borrado si tiene citas asociadas)
✔ CRUD completo de **médicos** (con bloqueo de borrado si tiene citas asociadas)
✔ CRUD completo de **citas**, con:
&nbsp;&nbsp;&nbsp;&nbsp;— validación de paciente/médico existentes
&nbsp;&nbsp;&nbsp;&nbsp;— bloqueo de fechas pasadas
&nbsp;&nbsp;&nbsp;&nbsp;— bloqueo de doble reserva (mismo médico, fecha y hora)
&nbsp;&nbsp;&nbsp;&nbsp;— flujo de estados controlado (`Pendiente → Confirmada → Atendida`, `Cancelada` desde cualquier estado no terminal)
✔ Dashboard: resumen general (incluye conteo de citas por estado), pacientes en espera del día, próximas citas
✔ `requireAuth` aplicado de forma uniforme sobre pacientes, médicos, citas y dashboard
✔ `/api/health` se mantiene público (requerido para monitoreo/uptime en Railway)
✔ `/api/auth/login` se mantiene público (obviamente); `/api/auth/me` y `/api/auth/logout` protegidos

**Fase 2 cerrada.** Backend funcionalmente completo y protegido, validado por el usuario como primera versión candidata.

## Fase 3 — Frontend
✔ Identidad visual propia de NovaCare: paleta verde + dorado ("spark"), tipografía Manrope/Inter/IBM Plex Mono, marca gráfica de 4 rayos
✔ Sistema de componentes reutilizable: sidebar, header, hero, tarjetas, tabla, badges de estado, botones, formularios, modal, confirmación, toasts, buscador, estado vacío, skeleton de carga
✔ Layout base responsive (sidebar colapsable en móvil, sin desbordamientos horizontales verificados en todas las pantallas)
✔ **Dashboard**: conectado a los endpoints reales (`/api/dashboard/resumen`, `/espera`, `/proximas`) — pacientes en espera hoy, próxima cita, listas y totales en vivo
✔ **Login**: panel de marca + formulario conectado a `POST /api/auth/login`, mostrar/ocultar contraseña, manejo de errores, guarda JWT y redirige
✔ **Pacientes**: CRUD completo, buscador, historial de citas, bloqueo de borrado con citas asociadas (verificado end-to-end)
✔ **Médicos**: CRUD completo, buscador, bloqueo de borrado con citas asociadas (verificado end-to-end)
✔ **Citas**: CRUD completo, selects de paciente/médico con hint de especialidad, filtro por estado + buscador, flujo de transición de estados controlado, validación de fecha pasada y conflicto de horario (todo verificado end-to-end)
✔ Manejo de sesión centralizado en `api.js`: cualquier `401` con token adjunto cierra sesión y redirige al login con mensaje contextual (expirada / inválida); las credenciales incorrectas en el login NO disparan este flujo (son errores de negocio, no de sesión)

**Bugs encontrados y corregidos durante la revisión final de extremo a extremo:**
- El manejo global de sesión interceptaba también los intentos de login fallidos (credenciales incorrectas), causando una redirección incorrecta en vez de mostrar "Credenciales inválidas". Corregido: solo se trata como sesión inválida si ya existía un token adjunto a la petición.
- El atributo `hidden` no ocultaba realmente los mensajes de error de formulario (`.form-error`) porque la regla `display: flex` del componente tenía más especificidad que la regla nativa del navegador para `[hidden]`. Corregido con `.form-error[hidden] { display: none; }`.
- Tabla sin scroll propio y buscador sin breakpoint causaban desbordamiento horizontal en móvil en Pacientes (detectado y corregido antes del cierre del módulo).

**Fase 3 cerrada.** Sistema completo (backend + frontend) funcional de extremo a extremo, con la arquitectura, identidad visual y reglas de negocio acordadas. Pendiente: despliegue en Railway y preparación de pruebas finales (Postman/JMeter) y documentación — a definir en la siguiente fase.

## Ajuste post-entrega — Botón "Atrás" tras cerrar sesión
✔ Corregido: tras cerrar sesión, el botón "Atrás" del navegador podía mostrar brevemente una pantalla protegida restaurada desde el bfcache (back-forward cache), aunque el servidor ya rechazaba correctamente cualquier llamada a la API sin token válido.
✔ `ncGuardSession()` (en `api.js`): además de la verificación inicial, escucha el evento `pageshow` y vuelve a comprobar la sesión cuando `event.persisted === true` (restauración desde bfcache), forzando la redirección a login si ya no hay token. Aplicado en Dashboard, Pacientes, Médicos y Citas.
✔ Encabezados `Cache-Control: no-store, no-cache, must-revalidate, private` agregados a todas las respuestas HTML del servidor, como refuerzo adicional (los assets estáticos como CSS/JS mantienen su cache normal).
✔ Verificado con dos pruebas: disparo manual del evento `pageshow(persisted=true)` sobre una página ya cargada, y navegación real con el botón "Atrás" tras logout — ambos casos redirigen correctamente a login.
