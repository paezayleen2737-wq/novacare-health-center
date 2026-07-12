require("dotenv").config();

const express = require("express");
const cors = require("cors");

const { initSchema } = require("./config/database");
const { notFoundHandler, errorHandler } = require("./middlewares/error.middleware");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

/**
 * Refuerzo adicional (además del manejo de pageshow/bfcache en el frontend):
 * evita que el navegador guarde en caché HTTP las páginas HTML. No es la
 * defensa principal contra el bfcache, pero ayuda en navegadores/proxies
 * que sí respetan estos encabezados para decidir si cachear la página.
 */
app.use((req, res, next) => {
  if (req.path.endsWith(".html") || req.path === "/") {
    res.set("Cache-Control", "no-store, no-cache, must-revalidate, private");
  }
  next();
});

app.use(express.static("public"));

const { sendSuccess } = require("./utils/apiResponse");

app.get("/api/health", (req, res) => {
  sendSuccess(res, {
    mensaje: "NovaCare API operativa",
    datos: { estado: "ok", timestamp: new Date().toISOString() },
  });
});

app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api/pacientes", require("./routes/pacientes.routes"));
app.use("/api/medicos", require("./routes/medicos.routes"));
app.use("/api/citas", require("./routes/citas.routes"));
app.use("/api/dashboard", require("./routes/dashboard.routes"));
// app.use("/api/medicos", require("./routes/medicos.routes"));
// app.use("/api/citas", require("./routes/citas.routes"));
// app.use("/api/dashboard", require("./routes/dashboard.routes"));

app.use(notFoundHandler);
app.use(errorHandler);

async function start() {
  try {
    await initSchema();

    app.listen(PORT, () => {
      console.log(`🏥 NovaCare Health Center corriendo en http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("❌ No se pudo iniciar el servidor:", err.message);
    process.exit(1);
  }
}

start();
