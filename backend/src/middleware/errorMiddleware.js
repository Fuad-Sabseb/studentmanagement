/**
 * =====================================================
 * errorMiddleware.js
 * -----------------------------------------------------
 * Global error handler.
 * - Internal (5xx) errors are logged server-side and
 *   returned as a generic message to the client so
 *   implementation details / stack traces are never leaked
 *   (A05 - Security Misconfiguration).
 * - Known client errors (4xx) keep their status + message.
 * =====================================================
 */

const errorHandler = (err, req, res, next) => {
    const statusCode = err.statusCode || 500;

    if (statusCode >= 500) {
        console.error(`[${new Date().toISOString()}] Unhandled error on ${req.method} ${req.originalUrl}:`);
        console.error(err.stack || err);
    }

    if (res.headersSent) {
        return next(err);
    }

    res.status(statusCode).json({
        success: false,
        message: statusCode >= 500 ? "Internal server error" : (err.message || "Request failed")
    });
};

module.exports = errorHandler;
