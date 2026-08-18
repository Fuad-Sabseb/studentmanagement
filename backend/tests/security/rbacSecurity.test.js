/**
 * =====================================================
 * rbacSecurity.test.js
 * -----------------------------------------------------
 * Security Test Suite: Role-Based Access Control (RBAC),
 * Token Tampering Defense, and Anti-IDOR Protections.
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

const app = require("../../src/app");

const JWT_SECRET = process.env.JWT_SECRET || "cohort_university_super_secret_jwt_key_2026_production";

function createToken(payload, expiresIn = "1h") {
    return jwt.sign(payload, JWT_SECRET, { expiresIn });
}

describe("RBAC & Anti-IDOR Security (OWASP A01: Broken Access Control)", () => {
    const adminToken = createToken({ id: 1, username: "admin", role: "admin", studentId: null });
    const teacherToken = createToken({ id: 2, username: "teacher", role: "teacher", studentId: null });
    const student1Token = createToken({ id: 3, username: "student1", role: "student", studentId: 101 });

    describe("Token Verification & Route Protection", () => {
        test("1. Unauthenticated request to protected route returns 401", async () => {
            const res = await request(app).get("/api/students");
            expect(res.statusCode).toBe(401);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toContain("Missing or invalid authorization token");
        });

        test("2. Tampered / Invalid signature JWT returns 401", async () => {
            const tamperedToken = createToken({ id: 1, role: "admin" }) + "tampered";
            const res = await request(app)
                .get("/api/students")
                .set("Authorization", `Bearer ${tamperedToken}`);

            expect(res.statusCode).toBe(401);
            expect(res.body.success).toBe(false);
        });

        test("3. Expired JWT token returns 401 Session Expired", async () => {
            const expiredToken = createToken({ id: 1, role: "admin" }, "-1s");
            const res = await request(app)
                .get("/api/students")
                .set("Authorization", `Bearer ${expiredToken}`);

            expect(res.statusCode).toBe(401);
            expect(res.body.success).toBe(false);
        });
    });

    describe("Granular Role Gates", () => {
        test("4. Student role is forbidden (403) from creating a new student", async () => {
            const res = await request(app)
                .post("/api/students")
                .set("Authorization", `Bearer ${student1Token}`)
                .send({ name: "Hacked Student", email: "hack@cohort.edu" });

            expect(res.statusCode).toBe(403);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toContain("do not have permission");
        });

        test("5. Teacher role is forbidden (403) from deleting a student record", async () => {
            const res = await request(app)
                .delete("/api/students/101")
                .set("Authorization", `Bearer ${teacherToken}`);

            expect(res.statusCode).toBe(403);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toContain("do not have permission");
        });
    });

    describe("Anti-IDOR Ownership Protection", () => {
        test("6. Student cannot access another student's specific grades (IDOR blocked with 403)", async () => {
            const res = await request(app)
                .get("/api/grades/student/102") // Student 101 trying to access Student 102's grades
                .set("Authorization", `Bearer ${student1Token}`);

            expect(res.statusCode).toBe(403);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toContain("only access your own");
        });
    });
});
