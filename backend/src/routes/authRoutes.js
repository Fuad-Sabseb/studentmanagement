/**
 * =====================================================
 * authRoutes.js
 * -----------------------------------------------------
 * Public & Protected Authentication Endpoints.
 * Protected with strict rate limiters against brute-force.
 * =====================================================
 */
const express = require("express");
const router = express.Router();

const authController = require("../controllers/authController");
const { requireAuth } = require("../middleware/authMiddleware");
const { authRateLimiter, sensitiveActionLimiter } = require("../middleware/securityMiddleware");
const { validateRegisterUser, validateChangePassword } = require("../middleware/validateMiddleware");

// Authentication Gateways
router.post("/login", authRateLimiter, authController.login);
router.post("/register", authRateLimiter, validateRegisterUser, authController.register);
router.post("/logout", authController.logout);

// Protected User Endpoints
router.get("/me", requireAuth, authController.me);
router.post("/change-password", requireAuth, sensitiveActionLimiter, validateChangePassword, authController.changePassword);

module.exports = router;