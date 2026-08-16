/**
 * =====================================================
 * authController.js
 * -----------------------------------------------------
 * Login against the role-aware `users` table. JWT claims
 * carry role + studentId so downstream middleware never
 * needs an extra DB round trip to authorize a request.
 *
 * The JWT is delivered in an HttpOnly cookie (A07), so it
 * is not readable by client-side JavaScript and cannot be
 * exfiltrated by XSS. Changing the password bumps
 * token_version, invalidating every previously issued JWT.
 * =====================================================
 */
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const userModel = require("../models/userModel");
const { pool } = require("../config/db");
const {
    JWT_SECRET,
    AUTH_COOKIE,
    JWT_EXPIRES_IN,
    getCookieOptions
} = require("../config/securityConfig");

const PASSWORD_MIN_LENGTH = 8;

// Enforces length + complexity: upper, lower and a digit.
function isWeakPassword(password) {
    return (
        !password ||
        password.length < PASSWORD_MIN_LENGTH ||
        !/[A-Z]/.test(password) ||
        !/[a-z]/.test(password) ||
        !/[0-9]/.test(password)
    );
}

// Keeps usernames out of log-injection vectors when written to audit logs.
const safeLogValue = (value) => String(value || "").replace(/[\r\n]/g, "");

exports.login = async (req, res, next) => {
    try {
        const { username, password } = req.body || {};

        if (!username || !password) {
            return res.status(400).json({
                success: false,
                message: "Username and password are required"
            });
        }

        const user = await userModel.findByUsername(username.trim());

        // Same generic message whether username doesn't exist, is inactive,
        // or the password is wrong — never reveal which one was incorrect.
        if (!user || !user.is_active) {
            console.warn(
                `SECURITY AUDIT: failed login for username '${safeLogValue(username)}' (no such user or inactive)`
            );
            return res.status(401).json({ success: false, message: "Invalid username or password" });
        }

        const passwordMatches = await bcrypt.compare(password, user.password_hash);
        if (!passwordMatches) {
            console.warn(
                `SECURITY AUDIT: failed login attempt for username '${safeLogValue(username)}'`
            );
            return res.status(401).json({ success: false, message: "Invalid username or password" });
        }

        const tokenVersion = Number(user.token_version || 0);
        const token = jwt.sign(
            {
                id: user.id,
                username: user.username,
                role: user.role,
                studentId: user.student_id || null,
                token_version: tokenVersion
            },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES_IN }
        );

        res.cookie(AUTH_COOKIE, token, getCookieOptions());

        res.json({
            success: true,
            message: "Login successful",
            user: {
                id: user.id,
                username: user.username,
                role: user.role,
                studentId: user.student_id || null,
                student_id: user.student_id || null,
                name: user.name || null,
                email: user.email || null
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * POST /api/auth/logout (clears the session cookie)
 */
exports.logout = (req, res) => {
    res.clearCookie(AUTH_COOKIE, { path: "/" });
    res.json({ success: true, message: "Logged out successfully" });
};

/**
 * POST /api/auth/register (self-registration, rate limited)
 * Body: { username, password, confirm_password }
 * New accounts are created with the 'student' role only; admin/teacher
 * accounts are provisioned directly in the database.
 */
exports.register = async (req, res, next) => {
    try {
        const { username, password } = req.body || {};
        const trimmed = String(username || "").trim();

        if (!trimmed || !password) {
            return res.status(400).json({ success: false, message: "Username and password are required" });
        }
        if (isWeakPassword(password)) {
            return res.status(400).json({
                success: false,
                message: `Password must be at least ${PASSWORD_MIN_LENGTH} characters and include upper and lower case letters and a number`
            });
        }

        const exists = await userModel.usernameExists(trimmed);
        if (exists) {
            return res.status(409).json({ success: false, message: "Username is already taken" });
        }

        const hash = await bcrypt.hash(password, 12);
        await userModel.createUser(trimmed, hash, "student");

        console.info(`SECURITY AUDIT: new account registered for username '${safeLogValue(trimmed)}'`);
        return res.status(201).json({
            success: true,
            message: "Account created successfully. Please log in."
        });
    } catch (error) {
        next(error);
    }
};

/**
 * GET /api/auth/me (protected)
 */
exports.me = async (req, res, next) => {
    try {
        const user = await userModel.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        res.json({ success: true, data: user });
    } catch (error) {
        next(error);
    }
};

/**
 * POST /api/auth/change-password (protected)
 * Body: { currentPassword, newPassword }
 */
exports.changePassword = async (req, res, next) => {
    try {
        const { currentPassword, newPassword } = req.body || {};
        if (!currentPassword || !newPassword) {
            return res.status(400).json({ success: false, message: "Current password and new password are required" });
        }
        if (isWeakPassword(newPassword)) {
            return res.status(400).json({
                success: false,
                message: `New password must be at least ${PASSWORD_MIN_LENGTH} characters and include upper and lower case letters and a number`
            });
        }

        const [rows] = await pool.query("SELECT password_hash FROM users WHERE id = ?", [req.user.id]);
        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        const matches = await bcrypt.compare(currentPassword, rows[0].password_hash);
        if (!matches) {
            return res.status(401).json({ success: false, message: "Current password is incorrect" });
        }

        const newHash = await bcrypt.hash(newPassword, 12);

        // Bump token_version -> all previously issued JWTs for this user are now invalid.
        await pool.execute(
            "UPDATE users SET password_hash = ?, token_version = token_version + 1 WHERE id = ?",
            [newHash, req.user.id]
        );

        res.clearCookie(AUTH_COOKIE, { path: "/" });
        res.json({ success: true, message: "Password updated successfully. Please log in again." });
    } catch (error) {
        next(error);
    }
};
