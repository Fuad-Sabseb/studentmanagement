/**
 * =====================================================
 * authRoutes.js
 * =====================================================
 */

const express = require("express");
const router = express.Router();

const authController = require("../controllers/authController");
const { requireAuth } = require("../middleware/authMiddleware");
const { loginLimiter, registerLimiter } = require("../middleware/rateLimitMiddleware");
const { validateRegister } = require("../middleware/validateMiddleware");

router.post("/login", loginLimiter, authController.login);
router.post("/register", registerLimiter, validateRegister, authController.register);
router.post("/logout", authController.logout);
router.get("/me", requireAuth, authController.me);
router.post("/change-password", requireAuth, authController.changePassword);

module.exports = router;
