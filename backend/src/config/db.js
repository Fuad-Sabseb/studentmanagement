/**
 * =====================================================
 * db.js
 * -----------------------------------------------------
 * Purpose:
 * Handle MySQL database connection.
 * =====================================================
 */

const mysql = require("mysql2/promise");

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

async function connectDB() {
    try {
        const connection = await pool.getConnection();
        console.log("✅ MySQL Database Connected Successfully");

        // Ensure announcements table exists
        await connection.query(`
            CREATE TABLE IF NOT EXISTS announcements (
                id          INT AUTO_INCREMENT PRIMARY KEY,
                title       VARCHAR(200) NOT NULL,
                content     TEXT NOT NULL,
                priority    ENUM('normal', 'important', 'urgent') NOT NULL DEFAULT 'normal',
                audience    ENUM('all', 'students', 'admins') NOT NULL DEFAULT 'all',
                author_name VARCHAR(100) DEFAULT 'Administration',
                created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            ) ENGINE=InnoDB;
        `);

        // Ensure semesters table exists
        await connection.query(`
            CREATE TABLE IF NOT EXISTS semesters (
                id            INT AUTO_INCREMENT PRIMARY KEY,
                name          VARCHAR(100) NOT NULL,
                academic_year VARCHAR(50) NOT NULL DEFAULT '2025/2026',
                is_current    BOOLEAN NOT NULL DEFAULT FALSE,
                created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB;
        `);

        // Ensure class_schedules table exists
        await connection.query(`
            CREATE TABLE IF NOT EXISTS class_schedules (
                id              INT AUTO_INCREMENT PRIMARY KEY,
                course_id       INT NOT NULL,
                day_of_week     ENUM('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday') NOT NULL,
                start_time      VARCHAR(10) NOT NULL,
                end_time        VARCHAR(10) NOT NULL,
                room            VARCHAR(100) NOT NULL,
                instructor_name VARCHAR(150) NOT NULL DEFAULT 'Staff',
                created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
            ) ENGINE=InnoDB;
        `);

        // Safely alter courses table if credit_hours / semester_id columns are missing
        try {
            await connection.query("ALTER TABLE courses ADD COLUMN credit_hours INT NOT NULL DEFAULT 3");
        } catch (_) {}
        try {
            await connection.query("ALTER TABLE courses ADD COLUMN semester_id INT NULL");
        } catch (_) {}

        // Safely alter users table to accept role teacher
        try {
            await connection.query("ALTER TABLE users MODIFY COLUMN role ENUM('admin', 'student', 'teacher') NOT NULL DEFAULT 'student'");
        } catch (_) {}

        // Token version for session invalidation: bumping it (e.g. on password
        // change) invalidates every previously issued JWT for that user.
        try {
            await connection.query("ALTER TABLE users ADD COLUMN token_version INT NOT NULL DEFAULT 0");
        } catch (_) {}

        connection.release();
    } catch (error) {
        console.error("❌ MySQL Database Connection Failed");
        console.error(error.message);
        if (process.env.NODE_ENV !== "test") {
            process.exit(1);
        }
    }
}

module.exports = {
    pool,
    connectDB
};
