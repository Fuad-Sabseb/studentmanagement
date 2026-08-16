/**
 * Unit tests for requireAuth (JWT verification + token_version session control).
 */
jest.mock("jsonwebtoken", () => ({
    verify: jest.fn()
}));
jest.mock("../../src/config/db", () => ({
    pool: { query: jest.fn() }
}));

const jwt = require("jsonwebtoken");
const { pool } = require("../../src/config/db");
const { requireAuth } = require("../../src/middleware/authMiddleware");
const { AUTH_COOKIE } = require("../../src/config/securityConfig");

function mockReq({ token, cookies }) {
    return {
        headers: {},
        cookies: token ? { [AUTH_COOKIE]: token } : cookies || {}
    };
}

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

describe("requireAuth", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test("rejects requests with no token (401)", async () => {
        const req = mockReq({ token: null });
        const res = mockRes();
        const next = jest.fn();

        await requireAuth(req, res, next);

        expect(res.statusCode).toBe(401);
        expect(res.body.message).toContain("Missing or invalid authorization token");
        expect(next).not.toHaveBeenCalled();
    });

    test("rejects an invalid/expired token (401)", async () => {
        jwt.verify.mockImplementation(() => {
            throw new Error("jwt expired");
        });
        const req = mockReq({ token: "expired.token.here" });
        const res = mockRes();
        const next = jest.fn();

        await requireAuth(req, res, next);

        expect(res.statusCode).toBe(401);
        expect(next).not.toHaveBeenCalled();
    });

    test("rejects a valid token for a deleted user (401)", async () => {
        jwt.verify.mockReturnValue({ id: 99, role: "student", username: "ghost", token_version: 1 });
        pool.query.mockResolvedValue([[]]);

        const req = mockReq({ token: "valid.token" });
        const res = mockRes();
        const next = jest.fn();

        await requireAuth(req, res, next);

        expect(res.statusCode).toBe(401);
        expect(next).not.toHaveBeenCalled();
    });

    test("rejects an inactive user (401)", async () => {
        jwt.verify.mockReturnValue({ id: 1, role: "student", username: "bob", token_version: 1 });
        pool.query.mockResolvedValue([[{ token_version: 1, is_active: 0 }]]);

        const req = mockReq({ token: "valid.token" });
        const res = mockRes();
        const next = jest.fn();

        await requireAuth(req, res, next);

        expect(res.statusCode).toBe(401);
        expect(next).not.toHaveBeenCalled();
    });

    test("rejects a token whose token_version is stale (password changed) (401)", async () => {
        jwt.verify.mockReturnValue({ id: 1, role: "student", username: "bob", token_version: 0 });
        pool.query.mockResolvedValue([[{ token_version: 1, is_active: 1 }]]);

        const req = mockReq({ token: "valid.token" });
        const res = mockRes();
        const next = jest.fn();

        await requireAuth(req, res, next);

        expect(res.statusCode).toBe(401);
        expect(next).not.toHaveBeenCalled();
    });

    test("attaches req.user and calls next() for a valid, current token", async () => {
        jwt.verify.mockReturnValue({
            id: 1,
            role: "admin",
            username: "admin",
            studentId: null,
            token_version: 2
        });
        pool.query.mockResolvedValue([[{ token_version: 2, is_active: 1 }]]);

        const req = mockReq({ token: "valid.token" });
        const res = mockRes();
        const next = jest.fn();

        await requireAuth(req, res, next);

        expect(next).toHaveBeenCalledTimes(1);
        expect(res.statusCode).toBeNull();
        expect(req.user).toEqual({ id: 1, role: "admin", studentId: null, username: "admin" });
    });

    test("reads the Bearer token from the Authorization header as well as the cookie", async () => {
        jwt.verify.mockReturnValue({ id: 2, role: "student", username: "sara", studentId: 5, token_version: 0 });
        pool.query.mockResolvedValue([[{ token_version: 0, is_active: 1 }]]);

        const req = { headers: { authorization: "Bearer header.token" }, cookies: {} };
        const res = mockRes();
        const next = jest.fn();

        await requireAuth(req, res, next);

        expect(jwt.verify).toHaveBeenCalledWith("header.token", expect.any(String));
        expect(next).toHaveBeenCalledTimes(1);
        expect(req.user.studentId).toBe(5);
    });
});
