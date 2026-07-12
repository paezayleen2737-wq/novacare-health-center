const express = require("express");
const router = express.Router();

const {
  listar,
  obtener,
  crear,
  actualizar,
  eliminar,
  historial,
} = require("../controllers/pacientes.controller");
const { requireAuth } = require("../middlewares/auth.middleware");

router.use(requireAuth);

router.get("/", listar);
router.get("/:id", obtener);
router.get("/:id/citas", historial);
router.post("/", crear);
router.put("/:id", actualizar);
router.delete("/:id", eliminar);

module.exports = router;
