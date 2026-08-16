/**
 * =====================================================
 * securityConfig.js
 * -----------------------------------------------------
 * Central place for JWT/cookie security settings and
 * startup validation. Prevents weak secrets from being
 * used in production (A02 / A05 hardening).
 * =====================================================
 */

const JWT_SECRET =
    process.env.JWT_SECRET ||
    (process.env.NODE_ENV === "test" ? "test_secret_0123456789abcdef_0123456789abcdef" : "");

const AUTH_COOKIE = "cohort_auth_token";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "8h";

const COOKIE_MAX_AGE_MS = 8 * 60 * 60 * 1000; // matches JWT expiry (8h)

const WEAK_SECRET_PATTERNS = /(super_secret|secret_jwt|change_me|your_jwt|key_12345|^test_)/i;

function isWeakSecret() {
    return !JWT_SECRET || JWT_SECRET.length < 32 || WEAK_SECRET_PATTERNS.test(JWT_SECRET);
}

function validateSecurityConfig() {
    if (isWeakSecret()) {
        const msg =
            "JWT_SECRET is missing or too weak. Set a random secret of at least 32 characters in backend/.env";
        if (process.env.NODE_ENV === "production") {
            throw new Error(`FATAL: ${msg}`);
        }
        console.warn(`WARNING: ${msg}`);
    }
}

function getCookieOptions() {
    return {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: COOKIE_MAX_AGE_MS,
        path: "/"
    };
}

module.exports = {
    JWT_SECRET,
    AUTH_COOKIE,
    JWT_EXPIRES_IN,
    COOKIE_MAX_AGE_MS,
    validateSecurityConfig,
    getCookieOptions
};
