/**
 * =====================================================
 * app.js
 * -----------------------------------------------------
 * Express Application configured with OWASP Top 10
 * Security Controls:
 * - Helmet.js (CSP, HSTS, X-Frame-Options, NoSniff)
 * - Strict CORS Whitelist
 * - Rate Limiting & DoS Protection
 * - XSS Input Sanitization
 * - Request Size Limits
 * - Structured Audit Logging & Shielded Error Handling
 * =====================================================
 */
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");

const app = express();

// 1. Helmet Security Headers & Content Security Policy (CSP)
app.use(
    helmet({
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                scriptSrc: ["'self'", "'unsafe-inline'"],
                styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
                fontSrc: ["'self'", "https://fonts.gstatic.com"],
                imgSrc: ["'self'", "data:", "https://images.unsplash.com"],
                connectSrc: ["'self'", "http://localhost:5001", "http://localhost:5173", "http://127.0.0.1:5173"],
                objectSrc: ["'none'"],
                upgradeInsecureRequests: process.env.NODE_ENV === "production" ? [] : null
            }
        },
        crossOriginEmbedderPolicy: false,
        crossOriginResourcePolicy: { policy: "cross-origin" },
        hsts: {
            maxAge: 31536000,
            includeSubDomains: true,
            preload: true
        },
        frameguard: { action: "deny" }
    })
);

// 2. Strict CORS Configuration
const allowedOrigins = [
    process.env.FRONTEND_URL,
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000"
].filter(Boolean);

app.use(
    cors({
        origin: (origin, callback) => {
            // Allow requests with no origin (like mobile apps or curl/postman) or matching whitelist
            if (!origin || allowedOrigins.includes(origin)) {
                callback(null, true);
            } else {
                callback(new Error(`CORS blocked: Origin ${origin} not allowed.`));
            }
        },
        credentials: true,
        methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"]
    })
);

// 3. Body Parsing with Strict Size Limits (DoS Mitigation)
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

// 4. XSS & Input Sanitization
const { xssSanitizer, globalRateLimiter } = require("./middleware/securityMiddleware");
app.use(xssSanitizer);

// 5. Global Rate Limiter (Skipped in test environment for test runner performance)
if (process.env.NODE_ENV !== "test") {
    app.use(globalRateLimiter);
}

// 6. Request Logging
const logger = require("./middleware/loggerMiddleware");
app.use(logger);

// 7. Routes & Middleware
const { requireAuth } = require("./middleware/authMiddleware");

const authRoutes = require("./routes/authRoutes");
const studentRoutes = require("./routes/studentRoutes");
const departmentRoutes = require("./routes/departmentRoutes");
const courseRoutes = require("./routes/courseRoutes");
const gradeRoutes = require("./routes/gradeRoutes");
const announcementRoutes = require("./routes/announcementRoutes");
const semesterRoutes = require("./routes/semesterRoutes");
const scheduleRoutes = require("./routes/scheduleRoutes");

// Public Auth Endpoints (Rate limited inside authRoutes)
app.use("/api/auth", authRoutes);

// Publicly readable curriculum & announcements (mutations protected inside routers)
app.use("/api/courses", courseRoutes);
app.use("/api/announcements", announcementRoutes);

// Protected — requires valid JWT + RBAC
app.use("/api/students", requireAuth, studentRoutes);
app.use("/api/departments", requireAuth, departmentRoutes);
app.use("/api/grades", requireAuth, gradeRoutes);
app.use("/api/semesters", requireAuth, semesterRoutes);
app.use("/api/schedules", requireAuth, scheduleRoutes);

// Health & System Info
app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "Welcome to Cohort Student Management API (OWASP Hardened)",
        security: {
            authentication: "JWT (HS256)",
            rbac: "Enforced (Admin, Teacher, Student)",
            headers: "Helmet CSP & HSTS Active",
            rateLimiting: "Enabled"
        },
        endpoints: {
            auth: "/api/auth",
            students: "/api/students",
            departments: "/api/departments",
            courses: "/api/courses",
            grades: "/api/grades",
            announcements: "/api/announcements",
            semesters: "/api/semesters",
            schedules: "/api/schedules"
        }
    });
});

// 8. Not Found & Shielded Error Handling
const notFound = require("./middleware/notFoundMiddleware");
app.use(notFound);

const errorHandler = require("./middleware/errorMiddleware");
app.use(errorHandler);

module.exports = app;