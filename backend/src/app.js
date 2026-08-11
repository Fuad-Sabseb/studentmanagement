/**
 * =====================================================
 * app.js
 * -----------------------------------------------------
 * Purpose:
 * This file configures the Express application.
 * =====================================================
 */

const express = require("express");
const cors = require("cors");

const app = express();

// ---------------------------------------------------
// 1. BUILT-IN / THIRD-PARTY MIDDLEWARE
// ---------------------------------------------------
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ---------------------------------------------------
// 2. CUSTOM LOGGER MIDDLEWARE
// ---------------------------------------------------
const logger = require("./middleware/loggerMiddleware");
app.use(logger);

// ---------------------------------------------------
// 3. ROUTES
// ---------------------------------------------------
const { requireAuth } = require("./middleware/authMiddleware");

const authRoutes = require("./routes/authRoutes");
const studentRoutes = require("./routes/studentRoutes");
const departmentRoutes = require("./routes/departmentRoutes");
const courseRoutes = require("./routes/courseRoutes");

// Public: logging in does not require a token yet.
app.use("/api/auth", authRoutes);

// Protected: every request below this line requires a valid JWT.
app.use("/api/students", requireAuth, studentRoutes);
app.use("/api/departments", requireAuth, departmentRoutes);
app.use("/api/courses", requireAuth, courseRoutes);

// ---------------------------------------------------
// 4. ROOT ROUTE
// ---------------------------------------------------
app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "Welcome to Student Management API",
        endpoints: {
            auth: "/api/auth",
            students: "/api/students",
            departments: "/api/departments",
            courses: "/api/courses"
        }
    });
});

// ---------------------------------------------------
// 5. 404 NOT FOUND MIDDLEWARE
// ---------------------------------------------------
const notFound = require("./middleware/notFoundMiddleware");
app.use(notFound);

// ---------------------------------------------------
// 6. GLOBAL ERROR HANDLER
// ---------------------------------------------------
const errorHandler = require("./middleware/errorMiddleware");
app.use(errorHandler);

module.exports = app;