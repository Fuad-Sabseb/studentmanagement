/**
 * =====================================================
 * rbacMiddleware.js
 * -----------------------------------------------------
 * Role-Based Access Control (RBAC) & Anti-IDOR Protections:
 * - requireRole(...roles): Restricts access by user role.
 * - verifyStudentOwnership(paramName): Prevents Insecure
 *   Direct Object References (IDOR) on student resources.
 * =====================================================
 */
const { logSecurityEvent } = require("./securityLogger");

const requireRole = (...allowedRoles) => (req, res, next) => {
    if (!req.user) {
        logSecurityEvent({
            eventType: "UNAUTHENTICATED_ACCESS_ATTEMPT",
            severity: "WARN",
            req,
            details: { path: req.originalUrl, requiredRoles: allowedRoles }
        });
        return res.status(401).json({ success: false, message: "Authentication required" });
    }

    if (!allowedRoles.includes(req.user.role)) {
        logSecurityEvent({
            eventType: "RBAC_FORBIDDEN_ACCESS",
            severity: "ALERT",
            user: req.user,
            req,
            details: { path: req.originalUrl, requiredRoles: allowedRoles, userRole: req.user.role }
        });
        return res.status(403).json({
            success: false,
            message: "You do not have permission to perform this action"
        });
    }

    next();
};

/**
 * IDOR Prevention: Compares req.params.id against req.user.studentId.
 * Admin and Teacher roles bypass ownership checks.
 */
const verifyStudentOwnership = (paramName = "id") => (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ success: false, message: "Authentication required" });
    }

    if (req.user.role === "admin" || req.user.role === "teacher") {
        return next();
    }

    const targetId = req.params[paramName];

    if (req.user.role !== "student" || String(req.user.studentId) !== String(targetId)) {
        logSecurityEvent({
            eventType: "IDOR_VIOLATION_ATTEMPT",
            severity: "CRITICAL",
            user: req.user,
            req,
            details: {
                path: req.originalUrl,
                targetStudentId: targetId,
                authenticatedStudentId: req.user.studentId
            }
        });
        return res.status(403).json({
            success: false,
            message: "Access forbidden: You can only access your own student records"
        });
    }

    next();
};

module.exports = { requireRole, verifyStudentOwnership };