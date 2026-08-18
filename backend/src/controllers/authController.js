/**
 * =====================================================
 * authController.js
 * -----------------------------------------------------
 * Hardened Authentication Controller aligning with:
 * - OWASP A07: Identification and Authentication Failures
 * - OWASP A01: Broken Access Control
 * - OWASP A09: Security Logging & Monitoring
 * =====================================================
 */
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const userModel = require("../models/userModel");
const studentModel = require("../models/studentModel");
const { logSecurityEvent } = require("../middleware/securityLogger");
const { checkPasswordComplexity } = require("../middleware/validateMiddleware");

const JWT_SECRET = process.env.JWT_SECRET || "cohort_university_super_secret_jwt_key_2026_production";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "8h";
const ADMIN_REGISTRATION_KEY = process.env.ADMIN_REGISTRATION_KEY || "cohort_admin_secure_key_2026";

/**
 * POST /api/auth/login
 */
exports.login = async (req, res) => {
    try {
        const { username, password } = req.body || {};

        if (!username || !password) {
            logSecurityEvent({
                eventType: "AUTH_LOGIN_INVALID_INPUT",
                severity: "WARN",
                req,
                details: { reason: "Missing username or password" }
            });
            return res.status(400).json({
                success: false,
                message: "Username and password are required"
            });
        }

        const user = await userModel.findByUsername(username.trim());

        // Generic error message whether username does not exist, account is disabled, or password is bad
        // Prevents account enumeration attacks
        if (!user || !user.is_active) {
            logSecurityEvent({
                eventType: "AUTH_LOGIN_FAILURE",
                severity: "WARN",
                req,
                details: { attemptedUsername: username, reason: !user ? "User not found" : "User inactive" }
            });
            return res.status(401).json({ success: false, message: "Invalid username or password" });
        }

        const passwordMatches = await bcrypt.compare(password, user.password_hash);
        if (!passwordMatches) {
            logSecurityEvent({
                eventType: "AUTH_LOGIN_FAILURE",
                severity: "WARN",
                req,
                details: { attemptedUsername: username, reason: "Password mismatch" }
            });
            return res.status(401).json({ success: false, message: "Invalid username or password" });
        }

        const token = jwt.sign(
            {
                id: user.id,
                username: user.username,
                role: user.role,
                studentId: user.student_id || null,
                student_id: user.student_id || null
            },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES_IN }
        );

        logSecurityEvent({
            eventType: "AUTH_LOGIN_SUCCESS",
            severity: "INFO",
            user: { id: user.id, username: user.username, role: user.role },
            req
        });

        res.json({
            success: true,
            message: "Login successful",
            token,
            user: {
                id: user.id,
                username: user.username,
                role: user.role,
                studentId: user.student_id || null,
                student_id: user.student_id || null
            }
        });
    } catch (error) {
        logSecurityEvent({
            eventType: "AUTH_LOGIN_ERROR",
            severity: "CRITICAL",
            req,
            details: { error: error.message }
        });
        res.status(500).json({ success: false, message: "An internal authentication error occurred." });
    }
};

/**
 * POST /api/auth/register
 * Supports self-registration for students, with role escalation prevention.
 */
exports.register = async (req, res) => {
    try {
        const { username, password, email, name, role = "student", adminKey } = req.body || {};

        // Check if username already exists
        const existing = await userModel.findByUsername(username.trim());
        if (existing) {
            return res.status(409).json({
                success: false,
                message: "Username is already registered. Please choose another username."
            });
        }

        // Prevent unauthorized privilege escalation (admin / teacher role assignment)
        let assignedRole = "student";
        if (role === "admin" || role === "teacher") {
            const isAdminCalling = req.user && req.user.role === "admin";
            const hasValidKey = adminKey && adminKey === ADMIN_REGISTRATION_KEY;

            if (isAdminCalling || hasValidKey) {
                assignedRole = role;
            } else {
                logSecurityEvent({
                    eventType: "PRIVILEGE_ESCALATION_ATTEMPT",
                    severity: "ALERT",
                    req,
                    details: { requestedRole: role, username }
                });
                return res.status(403).json({
                    success: false,
                    message: "You do not have permission to register as an administrator or faculty member."
                });
            }
        }

        // Hash password with bcrypt (10 rounds)
        const passwordHash = await bcrypt.hash(password, 10);

        // If registering as student, create a linked student profile if name/email provided
        let studentId = null;
        if (assignedRole === "student" && name && email) {
            const createdStudent = await studentModel.createStudent({
                name: name.trim(),
                email: email.trim(),
                phone: req.body.phone || null,
                department_id: req.body.department_id || null
            });
            studentId = createdStudent.id;
        }

        const newUser = await userModel.createUser({
            username: username.trim(),
            passwordHash,
            role: assignedRole,
            studentId
        });

        logSecurityEvent({
            eventType: "AUTH_REGISTER_SUCCESS",
            severity: "INFO",
            user: { id: newUser.id, username: newUser.username, role: newUser.role },
            req
        });

        res.status(201).json({
            success: true,
            message: "User registered successfully",
            data: {
                id: newUser.id,
                username: newUser.username,
                role: newUser.role,
                studentId: newUser.student_id
            }
        });
    } catch (error) {
        logSecurityEvent({
            eventType: "AUTH_REGISTER_ERROR",
            severity: "CRITICAL",
            req,
            details: { error: error.message }
        });
        res.status(500).json({ success: false, message: "Failed to register user." });
    }
};

/**
 * GET /api/auth/me (protected)
 */
exports.me = async (req, res) => {
    try {
        const user = await userModel.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        res.json({ success: true, data: user });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * POST /api/auth/change-password (protected)
 */
exports.changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body || {};

        const user = await userModel.findByUsername(req.user.username);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        const matches = await bcrypt.compare(currentPassword, user.password_hash);
        if (!matches) {
            logSecurityEvent({
                eventType: "PASSWORD_CHANGE_FAILURE",
                severity: "WARN",
                user: { id: req.user.id, username: req.user.username },
                req,
                details: { reason: "Incorrect current password" }
            });
            return res.status(401).json({ success: false, message: "Current password is incorrect" });
        }

        const newHash = await bcrypt.hash(newPassword, 10);
        await userModel.updatePassword(req.user.id, newHash);

        logSecurityEvent({
            eventType: "PASSWORD_CHANGE_SUCCESS",
            severity: "INFO",
            user: { id: req.user.id, username: req.user.username },
            req
        });

        res.json({ success: true, message: "Password updated successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to update password" });
    }
};

/**
 * POST /api/auth/logout (protected or public)
 */
exports.logout = async (req, res) => {
    logSecurityEvent({
        eventType: "AUTH_LOGOUT",
        severity: "INFO",
        user: req.user || null,
        req
    });
    res.json({
        success: true,
        message: "Session ended successfully"
    });
};