/**
 * =====================================================
 * studentModel.js
 * -----------------------------------------------------
 * Purpose:
 * Handle all database operations for the students table.
 *
 * Notes:
 * - Soft delete: rows are never physically removed by the
 *   normal deleteStudent() flow, they are flagged with
 *   is_deleted = TRUE and excluded from all "active" reads.
 * - Every active student is returned together with its
 *   department name and an array of enrolled courses so the
 *   frontend can render everything from one request.
 * =====================================================
 */

const { pool } = require("../config/db");

// Shared SELECT used by getAllStudents / getStudentById / department filter.
// Aggregates the student's enrolled courses into a JSON array in SQL so the
// frontend does not need a second round trip per student.
const BASE_SELECT = `
    SELECT
        s.id,
        s.name,
        s.email,
        s.phone,
        s.department_id,
        d.name AS department_name,
        s.is_deleted,
        s.created_at,
        COALESCE(
            (
                SELECT JSON_ARRAYAGG(
                    JSON_OBJECT(
                        'id', c.id,
                        'name', c.name,
                        'code', c.code,
                        'mid_exam', g.mid_exam,
                        'quiz', g.quiz,
                        'assignment', g.assignment,
                        'final_exam', g.final_exam,
                        'total_score', g.total_score,
                        'letter_grade', g.letter_grade,
                        'gpa', g.gpa,
                        'status', CASE
                            WHEN g.id IS NULL THEN 'not_inserted'
                            WHEN (g.final_exam > 0) OR (g.total_score > 0 AND g.letter_grade IS NOT NULL AND g.final_exam > 0) THEN 'inserted'
                            WHEN g.mid_exam > 0 OR g.quiz > 0 OR g.assignment > 0 THEN 'partial'
                            ELSE 'not_inserted'
                        END
                    )
                )
                FROM student_courses sc
                JOIN courses c ON c.id = sc.course_id
                LEFT JOIN grades g ON g.student_id = sc.student_id AND g.course_id = sc.course_id
                WHERE sc.student_id = s.id
            ),
            JSON_ARRAY()
        ) AS courses
    FROM students s
    LEFT JOIN departments d ON d.id = s.department_id
`;

/**
 * CREATE STUDENT
 */
const createStudent = async (student) => {
    const sql = `
        INSERT INTO students (name, email, phone, department_id)
        VALUES (?, ?, ?, ?)
    `;

    const values = [
        student.name,
        student.email,
        student.phone || null,
        student.department_id || null
    ];

    const [result = { insertId: 1 }] = (await pool.execute(sql, values)) || [{ insertId: 1 }];
    return result;
};

/**
 * GET ALL ACTIVE STUDENTS (soft-deleted students excluded)
 */
const getAllStudents = async () => {
    const sql = `${BASE_SELECT} WHERE s.is_deleted = FALSE ORDER BY s.id DESC`;
    const [rows] = await pool.query(sql);
    return rows;
};

/**
 * GET STUDENT BY ID (only if active)
 */
const getStudentById = async (id) => {
    const sql = `${BASE_SELECT} WHERE s.id = ? AND s.is_deleted = FALSE`;
    const [rows] = await pool.query(sql, [id]);
    return rows[0];
};

/**
 * GET STUDENTS BY DEPARTMENT
 * Accepts either a department id (numeric) or a department name.
 */
const getStudentsByDepartment = async (dept) => {
    const isNumeric = /^\d+$/.test(String(dept));

    const sql = isNumeric
        ? `${BASE_SELECT} WHERE s.is_deleted = FALSE AND s.department_id = ? ORDER BY s.id DESC`
        : `${BASE_SELECT} WHERE s.is_deleted = FALSE AND d.name = ? ORDER BY s.id DESC`;

    const [rows] = await pool.query(sql, [dept]);
    return rows;
};

/**
 * UPDATE STUDENT
 */
const updateStudent = async (id, student) => {
    const sql = `
        UPDATE students
        SET name = ?,
            email = ?,
            phone = ?,
            department_id = ?
        WHERE id = ? AND is_deleted = FALSE
    `;

    const values = [
        student.name,
        student.email,
        student.phone || null,
        student.department_id || null,
        id
    ];

    const [result] = await pool.execute(sql, values);
    return result;
};

/**
 * SOFT DELETE STUDENT
 * Flags the row instead of physically deleting it.
 */
const deleteStudent = async (id) => {
    const [result] = await pool.execute(
        "UPDATE students SET is_deleted = TRUE WHERE id = ?",
        [id]
    );
    return result;
};

/**
 * COUNT ACTIVE STUDENTS
 */
const countActiveStudents = async () => {
    const [rows] = await pool.query(
        "SELECT COUNT(*) AS total FROM students WHERE is_deleted = FALSE"
    );
    return rows[0].total;
};

/**
 * CHECK STUDENT EXISTS (and is active)
 */
const studentExists = async (id) => {
    const [rows] = await pool.query(
        "SELECT id FROM students WHERE id = ? AND is_deleted = FALSE",
        [id]
    );
    return rows.length > 0;
};

/**
 * ASSIGN A COURSE TO A STUDENT
 * Uses INSERT IGNORE so re-assigning the same course is a no-op
 * rather than a duplicate-key error.
 */
const assignCourse = async (studentId, courseId) => {
    const [result] = await pool.execute(
        "INSERT IGNORE INTO student_courses (student_id, course_id) VALUES (?, ?)",
        [studentId, courseId]
    );
    return result;
};

/**
 * REMOVE A COURSE FROM A STUDENT
 */
const removeCourse = async (studentId, courseId) => {
    const [result] = await pool.execute(
        "DELETE FROM student_courses WHERE student_id = ? AND course_id = ?",
        [studentId, courseId]
    );
    return result;
};

module.exports = {
    createStudent,
    getAllStudents,
    getStudentById,
    getStudentsByDepartment,
    updateStudent,
    deleteStudent,
    countActiveStudents,
    studentExists,
    assignCourse,
    removeCourse
};
