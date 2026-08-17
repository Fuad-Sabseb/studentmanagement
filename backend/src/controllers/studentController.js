/**
 * =====================================================
 * studentController.js
 * -----------------------------------------------------
 * Purpose:
 * Handle HTTP requests and responses for students.
 * =====================================================
 */

const studentModel = require("../models/studentModel");
const courseModel = require("../models/courseModel");
const bcrypt = require("bcryptjs");
const { pool } = require("../config/db");

/**
 * CREATE STUDENT
 * POST /api/students
 */
exports.createStudent = async (req, res) => {
    try {
        const student = req.body;
        const result = await studentModel.createStudent(student);
        const studentId = result.insertId;

        // Auto-generate login credentials for the student
        let username = (student.email || "").split("@")[0].toLowerCase().replace(/[^a-z0-9._-]/g, "");
        if (!username) username = `student${studentId}`;

        // Ensure username uniqueness
        const [clash] = await pool.query("SELECT id FROM users WHERE username = ?", [username]);
        if (clash.length > 0) {
            username = `${username}${studentId}`;
        }

        const DEFAULT_PASSWORD = "Student@123";
        const passwordHash = await bcrypt.hash(DEFAULT_PASSWORD, 10);

        await pool.execute(
            "INSERT INTO users (username, password_hash, role, student_id) VALUES (?, ?, 'student', ?)",
            [username, passwordHash, studentId]
        );

        res.status(201).json({
            success: true,
            message: "Student created successfully",
            id: studentId,
            credentials: {
                username,
                defaultPassword: DEFAULT_PASSWORD
            }
        });
    } catch (error) {
        if (error.code === "ER_DUP_ENTRY") {
            return res.status(409).json({
                success: false,
                message: "A student with this email already exists"
            });
        }

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * GET ALL ACTIVE STUDENTS
 * GET /api/students
 */
exports.getAllStudents = async (req, res) => {
    try {
        const students = await studentModel.getAllStudents();

        res.json({
            success: true,
            count: students.length,
            data: students
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * GET LOGGED-IN STUDENT PROFILE
 * GET /api/students/me
 */
exports.getMyProfile = async (req, res) => {
    try {
        const studentId = req.user.studentId || req.user.student_id;
        if (!studentId) {
            return res.status(404).json({
                success: false,
                message: "No student profile associated with this account"
            });
        }

        const student = await studentModel.getStudentById(studentId);
        if (!student) {
            return res.status(404).json({
                success: false,
                message: "Student profile not found"
            });
        }

        res.json({
            success: true,
            data: student
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * UPDATE LOGGED-IN STUDENT PROFILE (SELF-SERVICE)
 * PUT /api/students/me
 */
exports.updateMyProfile = async (req, res) => {
    try {
        const studentId = req.user.studentId || req.user.student_id;
        if (!studentId) {
            return res.status(404).json({
                success: false,
                message: "No student profile associated with this account"
            });
        }

        const { phone } = req.body || {};
        await pool.execute(
            "UPDATE students SET phone = ? WHERE id = ? AND is_deleted = FALSE",
            [phone || null, studentId]
        );

        const updated = await studentModel.getStudentById(studentId);
        res.json({
            success: true,
            message: "Profile updated successfully",
            data: updated
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * GET STUDENT BY ID
 * GET /api/students/:id
 */
exports.getStudentById = async (req, res) => {
    try {
        const student = await studentModel.getStudentById(req.params.id);

        if (!student) {
            return res.status(404).json({
                success: false,
                message: "Student not found"
            });
        }

        res.json({
            success: true,
            data: student
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * GET STUDENTS BY DEPARTMENT
 * GET /api/students/department/:dept
 */
exports.getStudentsByDepartment = async (req, res) => {
    try {
        const students = await studentModel.getStudentsByDepartment(req.params.dept);

        res.json({
            success: true,
            count: students.length,
            data: students
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * GET COUNT OF ACTIVE STUDENTS
 * GET /api/students/count
 */
exports.getStudentCount = async (req, res) => {
    try {
        const total = await studentModel.countActiveStudents();

        res.json({
            success: true,
            data: { total }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * UPDATE STUDENT
 * PUT /api/students/:id
 */
exports.updateStudent = async (req, res) => {
    try {
        const exists = await studentModel.studentExists(req.params.id);
        if (!exists) {
            return res.status(404).json({
                success: false,
                message: "Student not found"
            });
        }

        await studentModel.updateStudent(req.params.id, req.body);

        res.json({
            success: true,
            message: "Student updated successfully"
        });
    } catch (error) {
        if (error.code === "ER_DUP_ENTRY") {
            return res.status(409).json({
                success: false,
                message: "A student with this email already exists"
            });
        }

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * SOFT DELETE STUDENT
 * DELETE /api/students/:id
 */
exports.deleteStudent = async (req, res) => {
    try {
        const exists = await studentModel.studentExists(req.params.id);
        if (!exists) {
            return res.status(404).json({
                success: false,
                message: "Student not found"
            });
        }

        await studentModel.deleteStudent(req.params.id);

        res.json({
            success: true,
            message: "Student deleted successfully"
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * ASSIGN COURSE TO STUDENT
 * POST /api/students/:id/courses
 * Body: { course_id }
 */
exports.assignCourse = async (req, res) => {
    try {
        const studentId = req.params.id;
        const { course_id } = req.body;

        const studentExists = await studentModel.studentExists(studentId);
        if (!studentExists) {
            return res.status(404).json({
                success: false,
                message: "Student not found"
            });
        }

        const course = await courseModel.getCourseById(course_id);
        if (!course) {
            return res.status(404).json({
                success: false,
                message: "Course not found"
            });
        }

        await studentModel.assignCourse(studentId, course_id);

        res.status(201).json({
            success: true,
            message: "Course assigned to student successfully"
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * REMOVE COURSE FROM STUDENT
 * DELETE /api/students/:id/courses/:courseId
 */
exports.removeCourse = async (req, res) => {
    try {
        await studentModel.removeCourse(req.params.id, req.params.courseId);

        res.json({
            success: true,
            message: "Course removed from student successfully"
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
