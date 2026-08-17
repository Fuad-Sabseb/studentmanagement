/**
 * =====================================================
 * scheduleRoutes.js
 * =====================================================
 */
const express = require("express");
const router = express.Router();
const scheduleController = require("../controllers/scheduleController");
const { requireRole } = require("../middleware/rbacMiddleware");

// Read endpoints
router.get("/", scheduleController.getAllSchedules);
router.get("/my-schedule", scheduleController.getMySchedule);
router.get("/:id", scheduleController.getScheduleById);

// Admin mutations
router.post("/", requireRole("admin"), scheduleController.createSchedule);
router.put("/:id", requireRole("admin"), scheduleController.updateSchedule);
router.delete("/:id", requireRole("admin"), scheduleController.deleteSchedule);

module.exports = router;
