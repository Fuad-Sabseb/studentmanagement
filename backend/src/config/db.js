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
