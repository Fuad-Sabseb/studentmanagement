/**
 * =====================================================
 * loggerMiddleware.js
 * -----------------------------------------------------
 * Purpose:
 * Log every incoming HTTP request AND its final response
 * status code / duration once the response has finished.
 *
 * Example output:
 *
 *   --> GET /api/students
 *   <-- GET /api/students 200 (12ms)
 *
 * Implementation notes:
 * `res.on('finish', ...)` fires after the response has been
 * sent to the client, which is the correct place to read
 * `res.statusCode` because it is not guaranteed to be set
 * yet at the time the request first comes in.
 * =====================================================
 */

const logger = (req, res, next) => {
    const start = Date.now();

    console.log(`--> ${req.method} ${req.originalUrl}`);

    res.on("finish", () => {
        const duration = Date.now() - start;

        const statusColorSafe = res.statusCode;

        console.log(
            `<-- ${req.method} ${req.originalUrl} ${statusColorSafe} (${duration}ms)`
        );
    });

    next();
};

module.exports = logger;
