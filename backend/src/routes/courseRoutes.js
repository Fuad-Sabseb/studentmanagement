/**
 * =====================================================
 * courseRoutes.js
 * -----------------------------------------------------
 * Public read access for curriculum.
 * Admin-only mutations with requireAuth.
 * =====================================================
 */
const express = require("express");
const router = express.Router();

const courseController = require("../controllers/courseController");
const { requireAuth } = require("../middleware/authMiddleware");
const { requireRole } = require("../middleware/rbacMiddleware");
const { validateCourse } = require("../middleware/validateMiddleware");

// Publicly readable curriculum
router.get("/", courseController.getAllCourses);
router.get("/:id", courseController.getCourseById);

// Admin-only mutations
router.post("/", requireAuth, requireRole("admin"), validateCourse, courseController.createCourse);
router.put("/:id", requireAuth, requireRole("admin"), validateCourse, courseController.updateCourse);
router.delete("/:id", requireAuth, requireRole("admin"), courseController.deleteCourse);

module.exports = router;