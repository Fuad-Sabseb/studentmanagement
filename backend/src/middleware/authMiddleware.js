/**
 * =====================================================
 * authMiddleware.js
 * -----------------------------------------------------
 * Verifies the JWT (from an HttpOnly cookie or the
 * Authorization header) and attaches the decoded claims
 * to req.user = { id, role, studentId, username }.
 *
 * Every authenticated request is validated against the
 * user's current token_version so that changing a
 * password invalidates all previously issued tokens.
 * =====================================================
 */
const jwt = require("jsonwebtoken");
const { pool } = require("../config/db");
const { JWT_SECRET, AUTH_COOKIE } = require("../config/securityConfig");

const extractToken = (req) => {
    const authHeader = req.headers.authorization || "";
    const [scheme, token] = authHeader.split(" ");

    if (scheme === "Bearer" && token) return token;
    if (req.cookies && req.cookies[AUTH_COOKIE]) return req.cookies[AUTH_COOKIE];
    return null;
};

const requireAuth = async (req, res, next) => {
    const token = extractToken(req);
    if (!token) {
        return res.status(401).json({
            success: false,
            message: "Missing or invalid authorization token"
        });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);

        const [rows] = await pool.query(
            "SELECT token_version, is_active FROM users WHERE id = ?",
            [decoded.id]
        );
        const user = rows[0];

        if (!user || user.is_active !== 1) {
            return res.status(401).json({
                success: false,
                message: "Session expired or invalid token, please log in again"
            });
        }

        // Password was changed after this token was issued -> invalidate it.
        if (Number(decoded.token_version || 0) !== Number(user.token_version || 0)) {
            return res.status(401).json({
                success: false,
                message: "Session expired or invalid token, please log in again"
            });
        }

        req.user = {
            id: decoded.id,
            role: decoded.role,
            studentId: decoded.studentId ?? decoded.student_id ?? null,
            username: decoded.username
        };
        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: "Session expired or invalid token, please log in again"
        });
    }
};

module.exports = { requireAuth };
