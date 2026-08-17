/**
 * =====================================================
 * departmentModel.js
 * -----------------------------------------------------
 * Purpose:
 * Handle all database operations for the departments table.
 * =====================================================
 */

const { pool } = require("../config/db");

const createDepartment = async (department) => {
    const [result] = await pool.execute(
        "INSERT INTO departments (name) VALUES (?)",
        [department.name]
    );
    return result;
};

const getAllDepartments = async () => {
    const [rows] = await pool.query(`
        SELECT
            d.id,
            d.name,
            d.created_at,
            (SELECT COUNT(*) FROM students s WHERE s.department_id = d.id AND s.is_deleted = FALSE) AS student_count,
            (SELECT COUNT(*) FROM courses c WHERE c.department_id = d.id) AS course_count
        FROM departments d
        ORDER BY d.name ASC
    `);
    return rows;
};

const getDepartmentById = async (id) => {
    const [rows] = await pool.query("SELECT * FROM departments WHERE id = ?", [id]);
    return rows[0];
};

const updateDepartment = async (id, department) => {
    const [result] = await pool.execute(
        "UPDATE departments SET name = ? WHERE id = ?",
        [department.name, id]
    );
    return result;
};

const deleteDepartment = async (id) => {
    const [result] = await pool.execute("DELETE FROM departments WHERE id = ?", [id]);
    return result;
};

module.exports = {
    createDepartment,
    getAllDepartments,
    getDepartmentById,
    updateDepartment,
    deleteDepartment
};
