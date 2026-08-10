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
        "INSERT INTO courses (name, code, department_id) VALUES (?, ?, ?)",
        [course.name, course.code, course.department_id || null]
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
            d.name AS department_name,
            c.created_at,
            (SELECT COUNT(*) FROM student_courses sc WHERE sc.course_id = c.id) AS enrolled_count
        FROM courses c
        LEFT JOIN departments d ON d.id = c.department_id
        ORDER BY c.name ASC
    `);
    return rows;
};

const getCourseById = async (id) => {
    const [rows] = await pool.query("SELECT * FROM courses WHERE id = ?", [id]);
    return rows[0];
};

const updateCourse = async (id, course) => {
    const [result] = await pool.execute(
        "UPDATE courses SET name = ?, code = ?, department_id = ? WHERE id = ?",
        [course.name, course.code, course.department_id || null, id]
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
