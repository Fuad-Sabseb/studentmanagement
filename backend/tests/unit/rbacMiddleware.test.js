/**
 * Unit tests for RBAC middleware (requireRole + verifyStudentOwnership / IDOR).
 */
const { requireRole, verifyStudentOwnership } = require("../../src/middleware/rbacMiddleware");

function mockRes() {
    const res = { statusCode: null, body: null };
    res.status = function (code) {
        this.statusCode = code;
        return this;
    };
    res.json = function (payload) {
        this.body = payload;
        return this;
    };
    return res;
}

describe("requireRole", () => {
    test("denies when there is no authenticated user (401)", () => {
        const req = {};
        const res = mockRes();
        const next = jest.fn();

        requireRole("admin")(req, res, next);

        expect(res.statusCode).toBe(401);
        expect(next).not.toHaveBeenCalled();
    });

    test("allows a user whose role is in the allowed list", () => {
        const req = { user: { role: "admin" } };
        const res = mockRes();
        const next = jest.fn();

        requireRole("admin")(req, res, next);

        expect(next).toHaveBeenCalledTimes(1);
        expect(res.statusCode).toBeNull();
    });

    test("allows a teacher on a teacher route", () => {
        const req = { user: { role: "teacher" } };
        const res = mockRes();
        const next = jest.fn();

        requireRole("admin", "teacher")(req, res, next);

        expect(next).toHaveBeenCalledTimes(1);
    });

    test("denies a student on an admin-only route (403)", () => {
        const req = { user: { role: "student" } };
        const res = mockRes();
        const next = jest.fn();

        requireRole("admin")(req, res, next);

        expect(res.statusCode).toBe(403);
        expect(res.body.message).toContain("permission");
        expect(next).not.toHaveBeenCalled();
    });

    test("denies an admin on a student-only route (403)", () => {
        const req = { user: { role: "admin" } };
        const res = mockRes();
        const next = jest.fn();

        requireRole("student")(req, res, next);

        expect(res.statusCode).toBe(403);
        expect(next).not.toHaveBeenCalled();
    });
});

describe("verifyStudentOwnership (IDOR protection)", () => {
    test("admin always passes", () => {
        const req = { user: { role: "admin" }, params: { id: "10" } };
        const res = mockRes();
        const next = jest.fn();

        verifyStudentOwnership("id")(req, res, next);

        expect(next).toHaveBeenCalledTimes(1);
    });

    test("teacher always passes", () => {
        const req = { user: { role: "teacher" }, params: { id: "10" } };
        const res = mockRes();
        const next = jest.fn();

        verifyStudentOwnership("id")(req, res, next);

        expect(next).toHaveBeenCalledTimes(1);
    });

    test("student may access their own record", () => {
        const req = { user: { role: "student", studentId: 7 }, params: { id: "7" } };
        const res = mockRes();
        const next = jest.fn();

        verifyStudentOwnership("id")(req, res, next);

        expect(next).toHaveBeenCalledTimes(1);
    });

    test("student cannot access another student's record (403)", () => {
        const req = { user: { role: "student", studentId: 7 }, params: { id: "42" } };
        const res = mockRes();
        const next = jest.fn();

        verifyStudentOwnership("id")(req, res, next);

        expect(res.statusCode).toBe(403);
        expect(res.body.message).toContain("own records");
        expect(next).not.toHaveBeenCalled();
    });

    test("student with no linked student_id cannot access any record (403)", () => {
        const req = { user: { role: "student", studentId: null }, params: { id: "7" } };
        const res = mockRes();
        const next = jest.fn();

        verifyStudentOwnership("id")(req, res, next);

        expect(res.statusCode).toBe(403);
        expect(next).not.toHaveBeenCalled();
    });
});
