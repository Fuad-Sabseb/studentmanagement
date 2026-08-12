/**
 * =====================================================
 * studentRoutes.js
 * -----------------------------------------------------
 * Admin: full CRUD + course assignment.
 * Student: read-only, own record only (IDOR-protected).
 * =====================================================
 */
const express = require("express");
const router = express.Router();

const studentController = require("../controllers/studentController");
const { requireRole, verifyStudentOwnership } = require("../middleware/rbacMiddleware");
const {
    validateCreateStudent,
    validateUpdateStudent,
    validateAssignCourse
} = require("../middleware/validateMiddleware");

// Order matters — literal routes before "/:id"

// Admin and Teacher listing endpoints
router.get("/count", requireRole("admin", "teacher"), studentController.getStudentCount);
router.get("/department/:dept", requireRole("admin", "teacher"), studentController.getStudentsByDepartment);

// Admin-only creation
router.post("/", requireRole("admin"), validateCreateStudent, studentController.createStudent);

// Admin and Teacher: full roster listing
router.get("/", requireRole("admin", "teacher"), studentController.getAllStudents);

// Student self-profile (no :id param)
router.get("/me", studentController.getMyProfile);
router.put("/me", studentController.updateMyProfile);

// Admin OR the owning student may view a single record
router.get("/:id", verifyStudentOwnership("id"), studentController.getStudentById);

// Admin-only mutations
router.put("/:id", requireRole("admin"), validateUpdateStudent, studentController.updateStudent);
router.delete("/:id", requireRole("admin"), studentController.deleteStudent);
router.post("/:id/courses", requireRole("admin"), validateAssignCourse, studentController.assignCourse);
router.delete("/:id/courses/:courseId", requireRole("admin"), studentController.removeCourse);

module.exports = router;