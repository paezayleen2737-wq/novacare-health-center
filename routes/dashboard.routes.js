const express = require("express");
const router = express.Router();

const { resumen, espera, proximas } = require("../controllers/dashboard.controller");
const { requireAuth } = require("../middlewares/auth.middleware");

router.use(requireAuth);

router.get("/resumen", resumen);
router.get("/espera", espera);
router.get("/proximas", proximas);

module.exports = router;
