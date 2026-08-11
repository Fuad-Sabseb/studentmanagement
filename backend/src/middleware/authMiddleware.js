/**
 * =====================================================
 * authMiddleware.js
 * -----------------------------------------------------
 * Purpose:
 * Protect routes by requiring a valid JWT in the
 * Authorization header: "Authorization: Bearer <token>"
 * =====================================================
 */

const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET;

const requireAuth = (req, res, next) => {
    const authHeader = req.headers.authorization || "";
    const [scheme, token] = authHeader.split(" ");

    if (scheme !== "Bearer" || !token) {
        return res.status(401).json({
            success: false,
            message: "Missing or invalid authorization token"
        });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.student = decoded; // { id, username }
        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: "Session expired or invalid token, please log in again"
        });
    }
};

module.exports = { requireAuth };