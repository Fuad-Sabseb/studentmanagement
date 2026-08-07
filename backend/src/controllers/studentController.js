/**
 * =====================================================
 * studentController.js
 *
 * Purpose:
 * Handle HTTP requests and responses.
 * =====================================================
 */

const studentModel = require("../models/studentModel");

/**
 * CREATE STUDENT
 * POST /api/students
 */
const db = require('../config/db');


/**
 * CREATE STUDENT
 * POST /api/students
 */
exports.createStudent = async (req, res) => {
    try {
        const { name, email, department } = req.body;

        // Task 5: Return 400 if name or email is missing
        if (!name || !email) {
            return res.status(400).json({
                success: false,
                message: "Validation error: Name and email are required."
            });
        }

        const newStudentId = await studentModel.createStudent(req.body);
        return res.status(201).json({
            success: true,
            message: "Student created successfully",
            studentId: newStudentId
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


// Get total count of students
exports.getStudentCount = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT COUNT(*) AS count FROM students');
        return res.status(200).json({
            success: true,
            totalStudents: rows[0].count
        });
    } catch (error) {
        console.error('Error fetching student count:', error);
        return res.status(500).json({
            success: false,
            error: 'Internal Server Error'
        });
    }
};

/**
 * COUNT STUDENTS
 * GET /api/students/count
 */
exports.countStudents = async (req, res) => {
    try {
        const result = await studentModel.countStudents();

        res.status(200).json({
            success: true,
            total: result.total
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * GET ALL STUDENTS
 * GET /api/students
 */
exports.getAllStudents = async (req, res) => {
    try {
        const students = await studentModel.getAllStudents();

        res.json({
            success: true,
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
                message: "Student not found"
            });
        }

        res.json(student);

    } catch (error) {
        res.status(500).json({
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
 * UPDATE STUDENT
 * PUT /api/students/:id
 */
exports.updateStudent = async (req, res) => {
    try {
        await studentModel.updateStudent(req.params.id, req.body);

        res.json({
            message: "Student updated successfully"
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

/**
 * DELETE STUDENT
 * DELETE /api/students/:id
 */
exports.deleteStudent = async (req, res) => {
    try {
        await studentModel.deleteStudent(req.params.id);

        res.json({
            message: "Student deleted successfully"
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};