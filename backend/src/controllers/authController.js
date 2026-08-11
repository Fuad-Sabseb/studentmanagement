/**
 * =====================================================
 * authController.js
 * -----------------------------------------------------
 * Purpose:
 * Handle login (verifies username + password against the
 * bcrypt hash in MySQL, issues a JWT) and "who am I".
 * =====================================================
 */

const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const authModel = require("../models/authModel");

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "8h";

/**
 * POST /api/auth/login
 * Body: { username, password }
 */
exports.login = async (req, res) => {
    try {
        const { username, password } = req.body || {};

        if (!username || !password) {
            return res.status(400).json({
                success: false,
                message: "Username and password are required"
            });
        }

        const student = await authModel.findByUsername(username.trim());

        // Same generic message whether the username doesn't exist or the
        // password is wrong — never reveal which one was incorrect.
        if (!student || !student.password_hash) {
            return res.status(401).json({
                success: false,
                message: "Invalid username or password"
            });
        }

        const passwordMatches = await bcrypt.compare(password, student.password_hash);

        if (!passwordMatches) {
            return res.status(401).json({
                success: false,
                message: "Invalid username or password"
            });
        }

        const token = jwt.sign(
            { id: student.id, username: student.username },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES_IN }
        );

        res.json({
            success: true,
            message: "Login successful",
            token,
            student: {
                id: student.id,
                name: student.name,
                email: student.email,
                username: student.username,
                department_id: student.department_id
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * GET /api/auth/me  (protected — requires a valid token)
 */
exports.me = async (req, res) => {
    try {
        const student = await authModel.findById(req.student.id);

        if (!student) {
            return res.status(404).json({ success: false, message: "Student not found" });
        }

        res.json({ success: true, data: student });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};