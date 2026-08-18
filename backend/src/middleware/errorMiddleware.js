/**
 * =====================================================
 * errorMiddleware.js
 * -----------------------------------------------------
 * Safe Global Error Handler (OWASP A05 & A09).
 * Shields internal database schemas, table names, and
 * stack traces from being leaked to external clients.
 * =====================================================
 */
const { logSecurityEvent } = require("./securityLogger");

const errorHandler = (err, req, res, next) => {
    const statusCode = err.statusCode || (res.statusCode >= 400 ? res.statusCode : 500);
    const isProduction = process.env.NODE_ENV === "production";

    // Log the error securely for debugging & compliance
    logSecurityEvent({
        eventType: "UNHANDLED_SERVER_ERROR",
        severity: "CRITICAL",
        req,
        details: {
            message: err.message,
            stack: err.stack,
            url: req.originalUrl,
            method: req.method
        }
    });

    // In production, do not leak internal SQL errors or system stack traces
    let clientMessage = err.message || "Internal Server Error";
    if (isProduction && statusCode === 500) {
        clientMessage = "An unexpected server error occurred. Please contact the administrator.";
    }

    res.status(statusCode).json({
        success: false,
        message: clientMessage,
        ...(isProduction ? {} : { stack: err.stack })
    });
};

module.exports = errorHandler;
