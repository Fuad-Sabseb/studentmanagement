/**
 * =====================================================
 * server.js
 * -----------------------------------------------------
 * Purpose:
 * Entry point of the application.
 * =====================================================
 */

require("dotenv").config();

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
