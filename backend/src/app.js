const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");

const app = express();

// HTTPS enforcement (production only). TLS is terminated by a reverse
// proxy; trust proxy makes req.secure reflect the real client connection.
if (process.env.NODE_ENV === "production") {
    app.set("trust proxy", 1);
}
const { httpsRedirect } = require("./middleware/securityMiddleware");
app.use(httpsRedirect);

// Security headers (CSP only enforced in production to keep Vite HMR working in dev)
app.use(helmet({ contentSecurityPolicy: process.env.NODE_ENV === "production" ? undefined : false }));

// Locked-down CORS: only explicit origins may call the API with credentials.
const allowedOrigins = (process.env.CORS_ORIGINS || "http://localhost:5173,http://127.0.0.1:5173")
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean);

app.use(
    cors({
        origin(origin, callback) {
            // Allow same-origin / non-browser requests (curl, tests) and whitelisted origins.
            if (!origin || allowedOrigins.includes(origin)) {
                return callback(null, true);
            }
            const error = new Error("Not allowed by CORS");
            error.statusCode = 403;
            return callback(error);
        },
        credentials: true,
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"]
    })
);

app.use(cookieParser());
app.use(express.json({ limit: "100kb" }));
app.use(express.urlencoded({ extended: true, limit: "100kb" }));

// XSS defence-in-depth: strip HTML tags from every string field in request bodies.
const { sanitizeBody } = require("./middleware/validateMiddleware");
app.use(sanitizeBody);

const { apiLimiter } = require("./middleware/rateLimitMiddleware");
app.use("/api", apiLimiter);

const logger = require("./middleware/loggerMiddleware");
app.use(logger);

const { requireAuth } = require("./middleware/authMiddleware");

const authRoutes = require("./routes/authRoutes");
const studentRoutes = require("./routes/studentRoutes");
const departmentRoutes = require("./routes/departmentRoutes");
const courseRoutes = require("./routes/courseRoutes");
const gradeRoutes = require("./routes/gradeRoutes");
const announcementRoutes = require("./routes/announcementRoutes");
const semesterRoutes = require("./routes/semesterRoutes");
const scheduleRoutes = require("./routes/scheduleRoutes");

// Public
app.use("/api/auth", authRoutes);

// Protected — every request below requires a valid JWT; per-route RBAC
// (requireRole / verifyStudentOwnership) is applied inside each router.
app.use("/api/students", requireAuth, studentRoutes);
app.use("/api/departments", requireAuth, departmentRoutes);
app.use("/api/courses", requireAuth, courseRoutes);
app.use("/api/grades", requireAuth, gradeRoutes);
app.use("/api/announcements", requireAuth, announcementRoutes);
app.use("/api/semesters", requireAuth, semesterRoutes);
app.use("/api/schedules", requireAuth, scheduleRoutes);

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
