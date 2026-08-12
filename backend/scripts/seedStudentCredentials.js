/**
 * Generates a login username + hashed password for every active student
 * that doesn't yet have a `users` row. Run:  node scripts/seedStudentCredentials.js
 */
require("dotenv").config();
const bcrypt = require("bcryptjs");
const { pool } = require("../src/config/db");

const DEFAULT_PASSWORD = "Student@123";

async function run() {
    const [students] = await pool.query(`
        SELECT s.id, s.name, s.email
        FROM students s
        LEFT JOIN users u ON u.student_id = s.id
        WHERE s.is_deleted = FALSE AND u.id IS NULL
    `);

    if (students.length === 0) {
        console.log("Every active student already has login credentials. Nothing to do.");
        process.exit(0);
    }

    const passwordHash = await bcrypt.hash(DEFAULT_PASSWORD, 10);
    const generated = [];

    for (const student of students) {
        let username = student.email.split("@")[0].toLowerCase();

        // Ensure username uniqueness even if two students share an email prefix
        const [clash] = await pool.query("SELECT id FROM users WHERE username = ?", [username]);
        if (clash.length > 0) username = `${username}${student.id}`;

        await pool.execute(
            "INSERT INTO users (username, password_hash, role, student_id) VALUES (?, ?, 'student', ?)",
            [username, passwordHash, student.id]
        );

        generated.push({ name: student.name, username, password: DEFAULT_PASSWORD });
    }

    console.log("\nGenerated login credentials (share these with each student):\n");
    console.table(generated);
    console.log("\nEach student should change their password after first login.\n");
    process.exit(0);
}

run().catch((err) => {
    console.error("Failed to seed credentials:", err.message);
    process.exit(1);
});