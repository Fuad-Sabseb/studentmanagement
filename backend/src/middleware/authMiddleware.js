/**
 * =====================================================
 * authMiddleware.js
 * -----------------------------------------------------
 * Verifies the JWT and attaches the decoded claims to
 * req.user = { id, role, studentId, username }
 * =====================================================
 */
const jwt = require("jsonwebtoken");

const getJwtSecret = () => process.env.JWT_SECRET || "cohort_university_super_secret_jwt_key_2026_production";

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
        const decoded = jwt.verify(token, getJwtSecret());
        req.user = decoded; // { id, role, studentId, username }
        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: "Session expired or invalid token, please log in again"
        });
    }
};

module.exports = { requireAuth };