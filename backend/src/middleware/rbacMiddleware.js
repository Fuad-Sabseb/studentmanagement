/**
 * =====================================================
 * rbacMiddleware.js
 * -----------------------------------------------------
 * requireRole(...roles)      -> only allow specific roles
 * verifyStudentOwnership     -> a 'student' may only act on
 *                                their OWN student_id; 'admin' & 'teacher'
 *                                always pass. Prevents IDOR.
 *
 * Expects req.user to already be set by requireAuth, shaped:
 *   { id, role, studentId, username }
 * =====================================================
 */

const requireRole = (...allowedRoles) => (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ success: false, message: "Not authenticated" });
    }
    if (!allowedRoles.includes(req.user.role)) {
        return res.status(403).json({
            success: false,
            message: "You do not have permission to perform this action"
        });
    }
    next();
};

// Compares req.params.id (or req.params.studentId) against req.user.studentId.
const verifyStudentOwnership = (paramName = "id") => (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ success: false, message: "Not authenticated" });
    }

    if (req.user.role === "admin" || req.user.role === "teacher") return next();

    const targetId = req.params[paramName];

    if (req.user.role !== "student" || String(req.user.studentId) !== String(targetId)) {
        return res.status(403).json({
            success: false,
            message: "You can only access your own records"
        });
    }

    next();
};

module.exports = { requireRole, verifyStudentOwnership };