/**
 * =====================================================
 * semesterModel.js
 * -----------------------------------------------------
 * Database operations for academic terms & semesters.
 * =====================================================
 */
const { pool } = require("../config/db");

const createSemester = async ({ name, academic_year = "2025/2026", is_current = false }) => {
    if (is_current) {
        await pool.execute("UPDATE semesters SET is_current = FALSE");
    }
    const [result] = await pool.execute(
        "INSERT INTO semesters (name, academic_year, is_current) VALUES (?, ?, ?)",
        [name, academic_year, is_current ? 1 : 0]
    );
    return result;
};

const getAllSemesters = async () => {
    const [rows] = await pool.query(`
        SELECT
            s.id,
            s.name,
            s.academic_year,
            s.is_current,
            s.created_at,
            (SELECT COUNT(*) FROM courses c WHERE c.semester_id = s.id) AS course_count
        FROM semesters s
        ORDER BY s.created_at DESC
    `);
    return rows;
};

const getSemesterById = async (id) => {
    const [rows] = await pool.query("SELECT * FROM semesters WHERE id = ?", [id]);
    return rows[0];
};

const updateSemester = async (id, { name, academic_year, is_current }) => {
    if (is_current) {
        await pool.execute("UPDATE semesters SET is_current = FALSE");
    }
    const [result] = await pool.execute(
        `UPDATE semesters
         SET name = COALESCE(?, name),
             academic_year = COALESCE(?, academic_year),
             is_current = COALESCE(?, is_current)
         WHERE id = ?`,
        [name || null, academic_year || null, is_current !== undefined ? (is_current ? 1 : 0) : null, id]
    );
    return result;
};

const deleteSemester = async (id) => {
    await pool.execute("UPDATE courses SET semester_id = NULL WHERE semester_id = ?", [id]);
    const [result] = await pool.execute("DELETE FROM semesters WHERE id = ?", [id]);
    return result;
};

module.exports = {
    createSemester,
    getAllSemesters,
    getSemesterById,
    updateSemester,
    deleteSemester
};
