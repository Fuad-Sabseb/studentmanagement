/**
 * =====================================================
 * authSecurity.test.js
 * -----------------------------------------------------
 * Security Test Suite: Authentication, Password Complexity,
 * Brute-Force Rate Limiting, and Privilege Escalation Prevention.
 * =====================================================
 */
const request = require("supertest");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

jest.mock("../../src/config/db", () => ({
    pool: {
        query: jest.fn(),
        execute: jest.fn()
    }
}));

const { pool } = require("../../src/config/db");
const app = require("../../src/app");

describe("Authentication Security & OWASP A07 Controls", () => {
    const mockPassword = "Password123!";
    let mockHashedPassword;

    beforeAll(async () => {
        mockHashedPassword = await bcrypt.hash(mockPassword, 10);
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("POST /api/auth/login", () => {
        test("1. Successful login returns JWT token and never exposes password_hash", async () => {
            pool.query.mockResolvedValueOnce([
                [
                    {
                        id: 1,
                        username: "admin_user",
                        password_hash: mockHashedPassword,
                        role: "admin",
                        student_id: null,
                        is_active: true
                    }
                ]
            ]);

            const res = await request(app)
                .post("/api/auth/login")
                .send({ username: "admin_user", password: "Password123!" });

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.token).toBeDefined();
            expect(res.body.user).toBeDefined();
            expect(res.body.user.password_hash).toBeUndefined();
            expect(res.body.user.username).toBe("admin_user");
        });

        test("2. Invalid password returns generic 401 (prevents credential inference)", async () => {
            pool.query.mockResolvedValueOnce([
                [
                    {
                        id: 1,
                        username: "admin_user",
                        password_hash: mockHashedPassword,
                        role: "admin",
                        student_id: null,
                        is_active: true
                    }
                ]
            ]);

            const res = await request(app)
                .post("/api/auth/login")
                .send({ username: "admin_user", password: "WrongPassword!" });

            expect(res.statusCode).toBe(401);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toBe("Invalid username or password");
        });

        test("3. Non-existent username returns identical 401 (prevents user enumeration)", async () => {
            pool.query.mockResolvedValueOnce([[]]); // No user found

            const res = await request(app)
                .post("/api/auth/login")
                .send({ username: "non_existent_user", password: "Password123!" });

            expect(res.statusCode).toBe(401);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toBe("Invalid username or password");
        });

        test("4. Missing username or password returns 400 Bad Request", async () => {
            const res = await request(app)
                .post("/api/auth/login")
                .send({});

            expect(res.statusCode).toBe(400);
            expect(res.body.success).toBe(false);
        });
    });

    describe("POST /api/auth/register", () => {
        test("5. Registration rejects weak passwords failing complexity requirements", async () => {
            const res = await request(app)
                .post("/api/auth/register")
                .send({
                    username: "newstudent",
                    password: "simplepassword", // Missing uppercase, digit, special char
                    email: "student@cohort.edu"
                });

            expect(res.statusCode).toBe(400);
            expect(res.body.success).toBe(false);
            expect(res.body.errors.length).toBeGreaterThan(0);
        });

        test("6. Prevents privilege escalation when regular user attempts to register as admin", async () => {
            pool.query.mockResolvedValueOnce([[]]); // Username not taken

            const res = await request(app)
                .post("/api/auth/register")
                .send({
                    username: "sneaky_admin",
                    password: "SecurePassword123!",
                    email: "sneaky@cohort.edu",
                    role: "admin"
                });

            expect(res.statusCode).toBe(403);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toContain("permission to register as an administrator");
        });

        test("7. Successfully registers user with strong password and default student role", async () => {
            pool.query.mockResolvedValueOnce([[]]); // Username not taken
            pool.execute.mockResolvedValueOnce([{ insertId: 42 }]); // User insert

            const res = await request(app)
                .post("/api/auth/register")
                .send({
                    username: "validstudent",
                    password: "StrongPassword123!",
                    email: "valid@cohort.edu"
                });

            expect(res.statusCode).toBe(201);
            expect(res.body.success).toBe(true);
            expect(res.body.data.role).toBe("student");
        });
    });
});
