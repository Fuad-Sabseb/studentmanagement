/**
 * Creates (or resets) the default admin account in the `users` table.
 * Run once:  node backend/scripts/seedAdmin.js
 * Override via env vars ADMIN_USERNAME / ADMIN_PASSWORD if desired.
 */
require("dotenv").config();
const bcrypt = require("bcryptjs");
const { pool } = require("../src/config/db");

const USERNAME = process.env.ADMIN_USERNAME || "hundesa";
const PASSWORD = process.env.ADMIN_PASSWORD || "hero0";

async function run() {
    const hash = await bcrypt.hash(PASSWORD, 10);

    const [existing] = await pool.query(
        "SELECT id FROM users WHERE username = ?",
        [USERNAME]
    );

    if (existing.length > 0) {
        await pool.execute(
            "UPDATE users SET password_hash = ?, role = 'admin', is_active = TRUE WHERE username = ?",
            [hash, USERNAME]
        );
        console.log(`Admin '${USERNAME}' password reset.`);
    } else {
        await pool.execute(
            "INSERT INTO users (username, password_hash, role, student_id) VALUES (?, ?, 'admin', NULL)",
            [USERNAME, hash]
        );
        console.log(`Admin '${USERNAME}' created.`);
    }

    console.log(`Login with username="${USERNAME}" password="${PASSWORD}" — change this password after first login.`);
    process.exit(0);
}

run().catch((err) => {
    console.error("Failed to seed admin:", err.message);
    process.exit(1);
});