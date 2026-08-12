/**
 * =====================================================
 * authController.js
 * -----------------------------------------------------
 * Login against the role-aware `users` table. JWT claims
 * carry role + studentId so downstream middleware never
 * needs an extra DB round trip to authorize a request.
 * =====================================================
 */
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const userModel = require("../models/userModel");
const { pool } = require("../config/db");

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "8h";

exports.login = async (req, res) => {
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
            return res.status(401).json({ success: false, message: "Invalid username or password" });
        }

        const passwordMatches = await bcrypt.compare(password, user.password_hash);
        if (!passwordMatches) {
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

        res.json({
            success: true,
            message: "Login successful",
            token,
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
        res.status(500).json({ success: false, message: error.message });
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
 * Body: { currentPassword, newPassword }
 */
exports.changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body || {};
        if (!currentPassword || !newPassword) {
            return res.status(400).json({ success: false, message: "Current password and new password are required" });
        }
        if (newPassword.length < 6) {
            return res.status(400).json({ success: false, message: "New password must be at least 6 characters long" });
        }

        const [rows] = await pool.query("SELECT password_hash FROM users WHERE id = ?", [req.user.id]);
        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        const matches = await bcrypt.compare(currentPassword, rows[0].password_hash);
        if (!matches) {
            return res.status(401).json({ success: false, message: "Current password is incorrect" });
        }

        const newHash = await bcrypt.hash(newPassword, 10);
        await pool.execute("UPDATE users SET password_hash = ? WHERE id = ?", [newHash, req.user.id]);

        res.json({ success: true, message: "Password updated successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};