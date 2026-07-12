const express = require("express");
const router = express.Router();

const { listar, obtener, crear, actualizar, eliminar } = require("../controllers/medicos.controller");
const { requireAuth } = require("../middlewares/auth.middleware");

router.use(requireAuth);

router.get("/", listar);
router.get("/:id", obtener);
router.post("/", crear);
router.put("/:id", actualizar);
router.delete("/:id", eliminar);

module.exports = router;
