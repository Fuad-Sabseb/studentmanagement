const requestLogger = (req, res, next) => {
    const start = Date.now();

    // Log status code when the response finishes
    res.on('finish', () => {
        const duration = Date.now() - start;
        console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} - Status: ${res.statusCode} (${duration}ms)`);
    });

    next();
};

module.exports = requestLogger;