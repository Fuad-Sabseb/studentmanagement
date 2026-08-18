/**
 * =====================================================
 * securityLogger.js
 * -----------------------------------------------------
 * Structured Security & Audit Logger for OWASP A09
 * (Security Logging and Monitoring Failures).
 *
 * Records:
 * - Authentication successes and failures
 * - Access control / RBAC violations (401/403)
 * - Password changes and account provisioning
 * - High-risk data mutations (e.g. grade updates, deletions)
 * =====================================================
 */

const fs = require("fs");
const path = require("path");

const LOG_DIR = path.join(__dirname, "../../logs");
const AUDIT_LOG_FILE = path.join(LOG_DIR, "security_audit.log");

// Ensure log directory exists
try {
    if (!fs.existsSync(LOG_DIR)) {
        fs.mkdirSync(LOG_DIR, { recursive: true });
    }
} catch (err) {
    console.error("Failed to initialize security log directory:", err.message);
}

/**
 * Log a security event in JSON Lines format with timestamp and client context.
 */
function logSecurityEvent({ eventType, severity = "INFO", user = null, ip = "unknown", details = {}, req = null }) {
    const timestamp = new Date().toISOString();
    const clientIp = req?.ip || req?.headers["x-forwarded-for"] || ip;
    const userAgent = req?.headers["user-agent"] || "unknown";

    const logEntry = {
        timestamp,
        severity, // INFO, WARN, ALERT, CRITICAL
        eventType, // AUTH_LOGIN_SUCCESS, AUTH_LOGIN_FAILURE, RBAC_FORBIDDEN, PASS_CHANGE, etc.
        clientIp,
        userAgent,
        user: user ? { id: user.id, username: user.username, role: user.role } : null,
        details
    };

    const formattedLog = JSON.stringify(logEntry);

    // Console output for immediate monitoring
    if (severity === "WARN" || severity === "ALERT" || severity === "CRITICAL") {
        console.warn(`[SECURITY AUDIT - ${severity}] ${eventType}:`, formattedLog);
    } else {
        console.log(`[SECURITY AUDIT - ${severity}] ${eventType}:`, formattedLog);
    }

    // Append to file asynchronously
    try {
        fs.appendFile(AUDIT_LOG_FILE, formattedLog + "\n", (err) => {
            if (err) {
                // Non-blocking fail-safe
            }
        });
    } catch {
        // Fail-safe
    }
}

module.exports = {
    logSecurityEvent,
    AUDIT_LOG_FILE
};
