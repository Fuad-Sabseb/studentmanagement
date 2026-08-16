/**
 * =====================================================
 * securityMiddleware.js
 * -----------------------------------------------------
 * httpsRedirect: enforces HTTPS in production.
 *
 * The app itself does not terminate TLS — that is the job
 * of a reverse proxy (nginx / Caddy / load balancer). With
 * `app.set("trust proxy", 1)` enabled in production, req.secure
 * reflects the original client connection, so any request that
 * arrives over plain HTTP is 301-redirected to its HTTPS URL.
 * =====================================================
 */

const httpsRedirect = (req, res, next) => {
    if (process.env.NODE_ENV === "production" && !req.secure) {
        return res.redirect(301, `https://${req.headers.host}${req.originalUrl}`);
    }
    next();
};

module.exports = { httpsRedirect };
