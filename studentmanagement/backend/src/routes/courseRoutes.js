/**
 * =====================================================
 * courseRoutes.js
 * -----------------------------------------------------
 * Read access: any authenticated user (admin or student).
 * Mutations: admin only.
 * =====================================================
 */
const express = require("express");
const router = express.Router();

const courseController = require("../controllers/courseController");
const { requireRole } = require("../middleware/rbacMiddleware");
const { validateCourse } = require("../middleware/validateMiddleware");

router.get("/", courseController.getAllCourses);
router.get("/:id", courseController.getCourseById);

router.post("/", requireRole("admin"), validateCourse, courseController.createCourse);
router.put("/:id", requireRole("admin"), validateCourse, courseController.updateCourse);
router.delete("/:id", requireRole("admin"), courseController.deleteCourse);

module.exports = router;