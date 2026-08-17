/**
 * One-off script to create or update an admin user with custom credentials.
 * Run:  node scripts/setCredentials.js
 */
require("dotenv").config();
const bcrypt = require("bcryptjs");
const { pool } = require("../src/config/db");

const USERNAME = "hundesa";
const PASSWORD = "hundee123";

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
        console.log(`User '${USERNAME}' password has been reset.`);
    } else {
        await pool.execute(
            "INSERT INTO users (username, password_hash, role, student_id) VALUES (?, ?, 'admin', NULL)",
            [USERNAME, hash]
        );
        console.log(`User '${USERNAME}' created as admin.`);
    }

    console.log(`\nYou can now login with:`);
    console.log(`  Username: ${USERNAME}`);
    console.log(`  Password: ${PASSWORD}\n`);
    process.exit(0);
}

run().catch((err) => {
    console.error("Failed to set credentials:", err.message);
    process.exit(1);
});
