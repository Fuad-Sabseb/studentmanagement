/**
 * =====================================================
 * announcementRoutes.js
 * =====================================================
 */
const express = require("express");
const router = express.Router();
const announcementController = require("../controllers/announcementController");
const { requireRole } = require("../middleware/rbacMiddleware");

// All authenticated users can read announcements
router.get("/", announcementController.getAllAnnouncements);
router.get("/:id", announcementController.getAnnouncementById);

// Admin-only creation and modification
router.post("/", requireRole("admin"), announcementController.createAnnouncement);
router.put("/:id", requireRole("admin"), announcementController.updateAnnouncement);
router.delete("/:id", requireRole("admin"), announcementController.deleteAnnouncement);

module.exports = router;
