/**
 * =====================================================
 * rateLimitMiddleware.js
 * -----------------------------------------------------
 * Brute-force protection for the login endpoint (A04/A07)
 * and a generous global limiter to blunt API abuse.
 * Limiters are disabled in the test environment so the
 * test suite is not throttled.
 * =====================================================
 */
const { rateLimit } = require("express-rate-limit");

const skipInTest = () => process.env.NODE_ENV === "test";

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    skip: skipInTest,
    handler: (req, res) => {
        res.status(429).json({
            success: false,
            message: "Too many login attempts. Please try again after 15 minutes."
        });
    }
});

const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 1000,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    skip: skipInTest,
    handler: (req, res) => {
        res.status(429).json({
            success: false,
            message: "Too many requests. Please try again later."
        });
    }
});

// Prevent bulk account creation / credential stuffing via /api/auth/register.
const registerLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    skip: skipInTest,
    handler: (req, res) => {
        res.status(429).json({
            success: false,
            message: "Too many registration attempts. Please try again after 15 minutes."
        });
    }
});

module.exports = { loginLimiter, apiLimiter, registerLimiter };
