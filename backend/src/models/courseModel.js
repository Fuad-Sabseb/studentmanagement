/**
 * =====================================================
 * courseModel.js
 * -----------------------------------------------------
 * Purpose:
 * Handle all database operations for the courses table.
 * =====================================================
 */

const { pool } = require("../config/db");

const createCourse = async (course) => {
    const [result] = await pool.execute(
        "INSERT INTO courses (name, code, department_id, credit_hours, semester_id) VALUES (?, ?, ?, ?, ?)",
        [course.name, course.code, course.department_id || null, course.credit_hours || 3, course.semester_id || null]
    );
    return result;
};

const getAllCourses = async () => {
    const [rows] = await pool.query(`
        SELECT
            c.id,
            c.name,
            c.code,
            c.department_id,
            COALESCE(c.credit_hours, 3) AS credit_hours,
            c.semester_id,
            s.name AS semester_name,
            d.name AS department_name,
            c.created_at,
            (SELECT COUNT(*) FROM student_courses sc WHERE sc.course_id = c.id) AS enrolled_count
        FROM courses c
        LEFT JOIN departments d ON d.id = c.department_id
        LEFT JOIN semesters s ON s.id = c.semester_id
        ORDER BY c.name ASC
    `);
    return rows;
};

const getCourseById = async (id) => {
    const [rows] = await pool.query(`
        SELECT
            c.*,
            COALESCE(c.credit_hours, 3) AS credit_hours,
            s.name AS semester_name,
            d.name AS department_name
        FROM courses c
        LEFT JOIN departments d ON d.id = c.department_id
        LEFT JOIN semesters s ON s.id = c.semester_id
        WHERE c.id = ?
    `, [id]);
    return rows[0];
};

const updateCourse = async (id, course) => {
    const [result] = await pool.execute(
        `UPDATE courses
         SET name = COALESCE(?, name),
             code = COALESCE(?, code),
             department_id = ?,
             credit_hours = COALESCE(?, credit_hours),
             semester_id = ?
         WHERE id = ?`,
        [
            course.name || null,
            course.code || null,
            course.department_id !== undefined ? (course.department_id || null) : null,
            course.credit_hours !== undefined ? Number(course.credit_hours) : null,
            course.semester_id !== undefined ? (course.semester_id || null) : null,
            id
        ]
    );
    return result;
};

const deleteCourse = async (id) => {
    const [result] = await pool.execute("DELETE FROM courses WHERE id = ?", [id]);
    return result;
};

module.exports = {
    createCourse,
    getAllCourses,
    getCourseById,
    updateCourse,
    deleteCourse
};
