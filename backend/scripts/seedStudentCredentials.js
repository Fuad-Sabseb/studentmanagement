/**
 * =====================================================
 * seedStudentCredentials.js
 * -----------------------------------------------------
 * Generates a login username + a securely hashed password
 * for every active student that doesn't have one yet.
 *
 * Run once after applying auth-migration.sql:
 *   cd backend
 *   node scripts/seedStudentCredentials.js
 *
 * Username = the part of their email before the "@"
 * (e.g. fuad.sabseb@example.com -> fuad.sabseb)
 *
 * Every generated student starts with the SAME temporary
 * password below. Change it, and consider adding a
 * "change password on first login" flow before real use.
 * =====================================================
 */

require("dotenv").config();
const bcrypt = require("bcryptjs");
const { pool } = require("../src/config/db");

const DEFAULT_PASSWORD = "Student@123";

async function run() {
    const [students] = await pool.query(
        "SELECT id, name, email FROM students WHERE is_deleted = FALSE AND (username IS NULL OR password_hash IS NULL)"
    );

    if (students.length === 0) {
        console.log("Every active student already has login credentials. Nothing to do.");
        process.exit(0);
    }

    const passwordHash = await bcrypt.hash(DEFAULT_PASSWORD, 10);
    const generated = [];

    for (const student of students) {
        const username = student.email.split("@")[0].toLowerCase();

        await pool.execute(
            "UPDATE students SET username = ?, password_hash = ? WHERE id = ?",
            [username, passwordHash, student.id]
        );

        generated.push({ name: student.name, username, password: DEFAULT_PASSWORD });
    }

    console.log("\nGenerated login credentials (share these with each student):\n");
    console.table(generated);
    console.log(
        "\nEach student should log in once and change their password. Add a 'change password' endpoint before using this in production.\n"
    );

    process.exit(0);
}

run().catch((err) => {
    console.error("Failed to seed credentials:", err.message);
    process.exit(1);
});