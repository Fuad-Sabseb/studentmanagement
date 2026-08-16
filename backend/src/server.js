/**
 * =====================================================
 * server.js
 * -----------------------------------------------------
 * Purpose:
 * Entry point of the application.
 * =====================================================
 */

const path = require("path");
const dotenv = require("dotenv");

// Always load .env from the backend folder, no matter which directory the
// server is started from (e.g. `node src/server.js` run from the repo root).
dotenv.config({ path: path.join(__dirname, "..", ".env") });

const { validateSecurityConfig } = require("./config/securityConfig");
validateSecurityConfig();

const app = require("./app");
const { connectDB } = require("./config/db");

const PORT = process.env.PORT || 5001;

connectDB();

app.listen(PORT, () => {
    console.log("=================================");
    console.log("🚀 Server Started Successfully");
    console.log(`🌐 http://localhost:${PORT}`);
    console.log("=================================");
});
