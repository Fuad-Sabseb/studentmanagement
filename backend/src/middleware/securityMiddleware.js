/**
 * =====================================================
 * securityMiddleware.js
 * -----------------------------------------------------
 * Centralized Security Middleware for OWASP Controls:
 * - A04: Insecure Design & Rate Limiting
 * - A03: Injection & Cross-Site Scripting (XSS) Prevention
 * - A05: Security Misconfiguration
 * =====================================================
 */

const rateLimit = require("express-rate-limit");
const { logSecurityEvent } = require("./securityLogger");

/**
 * Global Rate Limiter: 200 requests per 15-minute window per IP.
 */
const globalRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: "Too many requests from this IP. Please try again after 15 minutes."
    },
    handler: (req, res, next, options) => {
        logSecurityEvent({
            eventType: "RATE_LIMIT_GLOBAL_EXCEEDED",
            severity: "WARN",
            req,
            details: { path: req.originalUrl }
        });
        res.status(429).json(options.message);
    }
});

/**
 * Strict Auth Rate Limiter: 10 failed/successful login attempts per 15-minute window.
 * Mitigates credential stuffing, password spraying, and brute force attacks.
 */
const authRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: "Too many authentication attempts. Please try again after 15 minutes."
    },
    handler: (req, res, next, options) => {
        logSecurityEvent({
            eventType: "AUTH_BRUTE_FORCE_THROTTLED",
            severity: "ALERT",
            req,
            details: { username: req.body?.username }
        });
        res.status(429).json(options.message);
    }
});

/**
 * Sensitive Action Rate Limiter (Password change, Account resets): 5 attempts per 15 mins.
 */
const sensitiveActionLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: "Too many sensitive action attempts. Please try again later."
    }
});

/**
 * Strips dangerous HTML, script tags, event handlers, and protocol-based XSS vectors.
 */
function sanitizeString(str) {
    if (typeof str !== "string") return str;

    return str
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "") // Remove <script>...</script>
        .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, "") // Remove <iframe>...</iframe>
        .replace(/javascript:[^"']*/gi, "")                                // Remove javascript: pseudo-protocol
        .replace(/on\w+\s*=\s*["'][^"']*["']/gi, "")                        // Remove inline event handlers like onerror="...", onclick="..."
        .replace(/on\w+\s*=\s*[^>\s]+/gi, "")                               // Remove unquoted event handlers like onerror=alert(1)
        .trim();
}

/**
 * Recursively sanitizes any object or array.
 */
function sanitizeObject(obj) {
    if (!obj || typeof obj !== "object") return obj;

    if (Array.isArray(obj)) {
        return obj.map((item) => (typeof item === "string" ? sanitizeString(item) : sanitizeObject(item)));
    }

    const sanitized = {};
    for (const [key, value] of Object.entries(obj)) {
        if (typeof value === "string") {
            sanitized[key] = sanitizeString(value);
        } else if (typeof value === "object" && value !== null) {
            sanitized[key] = sanitizeObject(value);
        } else {
            sanitized[key] = value;
        }
    }
    return sanitized;
}

/**
 * XSS & Input Sanitization Middleware.
 * Automatically sanitizes req.body, req.query, and req.params before passing to controllers.
 */
const xssSanitizer = (req, res, next) => {
    if (req.body && typeof req.body === "object") {
        req.body = sanitizeObject(req.body);
    }
    if (req.query && typeof req.query === "object") {
        req.query = sanitizeObject(req.query);
    }
    if (req.params && typeof req.params === "object") {
        req.params = sanitizeObject(req.params);
    }
    next();
};

module.exports = {
    globalRateLimiter,
    authRateLimiter,
    sensitiveActionLimiter,
    xssSanitizer,
    sanitizeString
};
