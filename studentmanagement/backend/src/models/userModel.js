/**
 * =====================================================
 * userModel.js
 * -----------------------------------------------------
 * Auth lookups against the role-aware `users` table.
 * password_hash is only ever selected in findByUsername,
 * for the login flow — never exposed elsewhere.
 * =====================================================
 */
const { pool } = require("../config/db");

const findByUsername = async (username) => {
    const [rows] = await pool.query(
        `SELECT id, username, password_hash, role, student_id, is_active
         FROM users WHERE username = ?`,
        [username]
    );
    return rows[0];
};

const findById = async (id) => {
    const [rows] = await pool.query(
        `SELECT u.id, u.username, u.role, u.student_id,
                s.name, s.email, s.department_id
         FROM users u
         LEFT JOIN students s ON s.id = u.student_id
         WHERE u.id = ?`,
        [id]
    );
    return rows[0];
};

module.exports = { findByUsername, findById };