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
