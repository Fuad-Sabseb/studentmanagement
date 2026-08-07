/**
 * =====================================================
 * studentModel.js
 *
 * Purpose:
 * Handle all database operations for students table.
 *
 * Responsibilities:
 * - Insert student
 * - Get students
 * - Get student by ID
 * - Update student
 * - Soft delete student
 * - Count students
 * =====================================================
 */

// Import database connection pool
const { pool } = require("../config/db");

/**
 * =====================================================
 * CREATE STUDENT
 * =====================================================
 */
const createStudent = async (student) => {

    const sql = `
        INSERT INTO students
        (name, email, department, phone)
        VALUES (?, ?, ?, ?)
    `;

    const values = [
        student.name || null,
        student.email || null,
        student.department || null,
        student.phone || null // This turns undefined into null safely
    ];

    const [result] = await pool.execute(sql, values);

    return result;
};

/**
 * =====================================================
 * GET ALL STUDENTS
 * =====================================================
 */
const getAllStudents = async () => {

    const [rows] = await pool.execute(
        "SELECT * FROM students WHERE is_deleted = FALSE"
    );

    return rows;
};

/**
 * =====================================================
 * GET STUDENT BY ID
 * =====================================================
 */
const getStudentById = async (id) => {

    const [rows] = await pool.execute(
        "SELECT * FROM students WHERE id = ? AND is_deleted = FALSE",
        [id]
    );

    return rows[0];
};

/**
 * =====================================================
 * GET STUDENTS BY DEPARTMENT
 * =====================================================
 */
const getStudentsByDepartment = async (dept) => {

    const [rows] = await pool.execute(
        "SELECT * FROM students WHERE department = ? AND is_deleted = FALSE",
        [dept]
    );

    return rows;
};

/**
 * =====================================================
 * UPDATE STUDENT
 * =====================================================
 */
const updateStudent = async (id, student) => {

    const sql = `
        UPDATE students
        SET
            name = ?,
            email = ?,
            department = ?,
            phone = ?
        WHERE id = ?
    `;

    const values = [
        student.name,
        student.email,
        student.department,
        student.phone,
        id
    ];

    const [result] = await pool.execute(sql, values);

    return result;
};

/**
 * =====================================================
 * COUNT STUDENTS
 * =====================================================
 */
const countStudents = async () => {

    const [rows] = await pool.execute(
        "SELECT COUNT(*) AS total FROM students WHERE is_deleted = FALSE"
    );

    return rows[0];
};

/**
 * =====================================================
 * SOFT DELETE STUDENT
 * =====================================================
 */
const deleteStudent = async (id) => {

    const [result] = await pool.execute(
        "UPDATE students SET is_deleted = TRUE WHERE id = ?",
        [id]
    );

    return result;
};

// Export functions
module.exports = {
    createStudent,
    getAllStudents,
    getStudentById,
    getStudentsByDepartment,
    updateStudent,
    deleteStudent,
    countStudents
};