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

/**
 * CREATE STUDENT
 * POST /api/students
 */
exports.createStudent = async (req, res) => {
    try {
        const student = req.body;
        const result = await studentModel.createStudent(student);

        res.status(201).json({
            success: true,
            message: "Student created successfully",
            id: result.insertId
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
