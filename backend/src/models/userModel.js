/**
 * =====================================================
 * userModel.js
 * -----------------------------------------------------
 * Auth and account operations against the `users` table.
 * All queries are parameterized with ? placeholders.
 * password_hash is never exposed in general selects.
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
        `SELECT u.id, u.username, u.role, u.student_id, u.is_active,
                s.name, s.email, s.department_id
         FROM users u
         LEFT JOIN students s ON s.id = u.student_id
         WHERE u.id = ?`,
        [id]
    );
    return rows[0];
};

const createUser = async ({ username, passwordHash, role = "student", studentId = null }) => {
    const [result] = await pool.execute(
        `INSERT INTO users (username, password_hash, role, student_id, is_active)
         VALUES (?, ?, ?, ?, TRUE)`,
        [username, passwordHash, role, studentId]
    );
    return {
        id: result.insertId,
        username,
        role,
        student_id: studentId,
        is_active: true
    };
};

const updatePassword = async (userId, newHash) => {
    const [result] = await pool.execute(
        `UPDATE users SET password_hash = ? WHERE id = ?`,
        [newHash, userId]
    );
    return result.affectedRows > 0;
};

module.exports = {
    findByUsername,
    findById,
    createUser,
    updatePassword
};