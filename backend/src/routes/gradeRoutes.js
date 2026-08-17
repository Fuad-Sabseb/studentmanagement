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

// Admin, Teacher, or the owning student, viewing a specific student's grades
router.get("/student/:studentId", verifyStudentOwnership("studentId"), gradeController.getGradesForStudent);
router.get("/student/:studentId/course/:courseId", verifyStudentOwnership("studentId"), gradeController.getGradeByStudentAndCourse);

// Admin and Teacher grade entry/management
router.get("/course/:courseId", requireRole("admin", "teacher"), gradeController.getCourseStudentsAndGrades);
router.post("/batch", requireRole("admin", "teacher"), gradeController.batchEnterGrades);
router.post("/", requireRole("admin", "teacher"), validateGrade, gradeController.enterGrade);
router.put("/:id", requireRole("admin", "teacher"), validateGrade, gradeController.updateGrade);
router.delete("/:id", requireRole("admin"), gradeController.deleteGrade);

module.exports = router;