const express = require("express");
const router = express.Router();

const { login, me, logout } = require("../controllers/auth.controller");
const { requireAuth } = require("../middlewares/auth.middleware");

router.post("/login", login);
router.get("/me", requireAuth, me);
router.post("/logout", requireAuth, logout);

module.exports = router;
