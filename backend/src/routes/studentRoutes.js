/**
 * =====================================================
 * studentRoutes.js
 * -----------------------------------------------------
 * Purpose:
 * Define all student API endpoints.
 * =====================================================
 */

const express = require("express");
const router = express.Router();

const studentController = require("../controllers/studentController");
const {
    validateCreateStudent,
    validateUpdateStudent,
    validateAssignCourse
} = require("../middleware/validateMiddleware");

// NOTE: order matters — specific literal routes ("/count", "/department/:dept")
// must be declared BEFORE the generic "/:id" route, otherwise Express would
// try to treat "count" or "department" as an :id value.

// GET /api/students/count -> total number of active students
router.get("/count", studentController.getStudentCount);

// GET /api/students/department/:dept -> students in a given department
router.get("/department/:dept", studentController.getStudentsByDepartment);

// POST /api/students -> create student
router.post("/", validateCreateStudent, studentController.createStudent);

// GET /api/students -> list active students
router.get("/", studentController.getAllStudents);

// GET /api/students/:id -> single student
router.get("/:id", studentController.getStudentById);

// PUT /api/students/:id -> update student
router.put("/:id", validateUpdateStudent, studentController.updateStudent);

// DELETE /api/students/:id -> soft delete student
router.delete("/:id", studentController.deleteStudent);

// POST /api/students/:id/courses -> assign a course to a student
router.post("/:id/courses", validateAssignCourse, studentController.assignCourse);

// DELETE /api/students/:id/courses/:courseId -> unassign a course
router.delete("/:id/courses/:courseId", studentController.removeCourse);

module.exports = router;
