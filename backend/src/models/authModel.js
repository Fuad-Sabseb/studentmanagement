/**
 * =====================================================
 * authModel.js
 * -----------------------------------------------------
 * Purpose:
 * Look up a student's login credentials for authentication.
 * password_hash is only ever selected here, in the login
 * flow — never returned by any other model/endpoint.
 * =====================================================
 */

const { pool } = require("../config/db");

const findByUsername = async (username) => {
    const [rows] = await pool.query(
        "SELECT id, name, email, username, password_hash, department_id FROM students WHERE username = ? AND is_deleted = FALSE",
        [username]
    );
    return rows[0];
};

const findById = async (id) => {
    const [rows] = await pool.query(
        "SELECT id, name, email, username, department_id FROM students WHERE id = ? AND is_deleted = FALSE",
        [id]
    );
    return rows[0];
};

module.exports = { findByUsername, findById };