/**
 * =====================================================
 * announcementRoutes.js
 * =====================================================
 */
const express = require("express");
const router = express.Router();
const announcementController = require("../controllers/announcementController");
const { requireAuth } = require("../middleware/authMiddleware");
const { requireRole } = require("../middleware/rbacMiddleware");

// Publicly readable notices
router.get("/", announcementController.getAllAnnouncements);
router.get("/:id", announcementController.getAnnouncementById);

// Admin-only creation and modification
router.post("/", requireAuth, requireRole("admin"), announcementController.createAnnouncement);
router.put("/:id", requireAuth, requireRole("admin"), announcementController.updateAnnouncement);
router.delete("/:id", requireAuth, requireRole("admin"), announcementController.deleteAnnouncement);

module.exports = router;
