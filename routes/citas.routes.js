const express = require("express");
const router = express.Router();

const {
  listar,
  obtener,
  crear,
  actualizar,
  cambiarEstado,
  eliminar,
} = require("../controllers/citas.controller");
const { requireAuth } = require("../middlewares/auth.middleware");

router.use(requireAuth);

router.get("/", listar);
router.get("/:id", obtener);
router.post("/", crear);
router.put("/:id", actualizar);
router.patch("/:id/estado", cambiarEstado);
router.delete("/:id", eliminar);

module.exports = router;
