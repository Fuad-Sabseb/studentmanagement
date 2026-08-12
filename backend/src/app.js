const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const logger = require("./middleware/loggerMiddleware");
app.use(logger);

const { requireAuth } = require("./middleware/authMiddleware");

const authRoutes = require("./routes/authRoutes");
const studentRoutes = require("./routes/studentRoutes");
const departmentRoutes = require("./routes/departmentRoutes");
const courseRoutes = require("./routes/courseRoutes");
const gradeRoutes = require("./routes/gradeRoutes");
const announcementRoutes = require("./routes/announcementRoutes");

// Public
app.use("/api/auth", authRoutes);

// Protected — every request below requires a valid JWT; per-route RBAC
// (requireRole / verifyStudentOwnership) is applied inside each router.
app.use("/api/students", requireAuth, studentRoutes);
app.use("/api/departments", requireAuth, departmentRoutes);
app.use("/api/courses", requireAuth, courseRoutes);
app.use("/api/grades", requireAuth, gradeRoutes);
app.use("/api/announcements", requireAuth, announcementRoutes);

app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "Welcome to Student Management API",
        endpoints: {
            auth: "/api/auth",
            students: "/api/students",
            departments: "/api/departments",
            courses: "/api/courses",
            grades: "/api/grades"
        }
    });
});

const notFound = require("./middleware/notFoundMiddleware");
app.use(notFound);

const errorHandler = require("./middleware/errorMiddleware");
app.use(errorHandler);

module.exports = app;