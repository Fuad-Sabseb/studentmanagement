/**
 * =====================================================
 * headersSecurity.test.js
 * -----------------------------------------------------
 * Security Test Suite: Helmet Security Headers & CORS.
 * Tests OWASP A05: Security Misconfiguration.
 * =====================================================
 */
const request = require("supertest");
const app = require("../../src/app");

describe("Security Headers & CORS (OWASP A05: Security Misconfiguration)", () => {
    test("1. Response contains Helmet security headers (CSP, NoSniff, X-Frame-Options)", async () => {
        const res = await request(app).get("/");

        expect(res.statusCode).toBe(200);
        expect(res.headers["x-frame-options"]).toBe("DENY");
        expect(res.headers["x-content-type-options"]).toBe("nosniff");
        expect(res.headers["content-security-policy"]).toBeDefined();
        expect(res.headers["strict-transport-security"]).toBeDefined();
        expect(res.headers["x-powered-by"]).toBeUndefined(); // Express signature hidden
    });

    test("2. CORS preflight handles allowed origin", async () => {
        const res = await request(app)
            .options("/api/students")
            .set("Origin", "http://localhost:5173")
            .set("Access-Control-Request-Method", "GET");

        expect(res.statusCode).toBe(204);
        expect(res.headers["access-control-allow-origin"]).toBe("http://localhost:5173");
        expect(res.headers["access-control-allow-credentials"]).toBe("true");
    });
});
