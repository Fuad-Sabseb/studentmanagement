/**
 * =====================================================
 * gradeRoutes.js
 * =====================================================
 */
const express = require("express");
const router = express.Router();

const gradeController = require("../controllers/gradeController");
const { requireRole, verifyStudentOwnership } = require("../middleware/rbacMiddleware");
const { validateGrade } = require("../middleware/validateMiddleware");

// Student self-service (no :id param -> uses req.user.studentId, no IDOR surface)
router.get("/my-grades", gradeController.getMyGrades);

// Admin, or the owning student, viewing a specific student's grades
router.get("/student/:studentId", verifyStudentOwnership("studentId"), gradeController.getGradesForStudent);
router.get("/student/:studentId/course/:courseId", verifyStudentOwnership("studentId"), gradeController.getGradeByStudentAndCourse);

// Admin-only grade entry/management
router.get("/course/:courseId", requireRole("admin"), gradeController.getCourseStudentsAndGrades);
router.post("/batch", requireRole("admin"), gradeController.batchEnterGrades);
router.post("/", requireRole("admin"), validateGrade, gradeController.enterGrade);
router.put("/:id", requireRole("admin"), validateGrade, gradeController.updateGrade);
router.delete("/:id", requireRole("admin"), gradeController.deleteGrade);

module.exports = router;