/**
 * Unit tests for the authentication controller (login / register / change-password).
 */
jest.mock("bcryptjs", () => ({
    compare: jest.fn(),
    hash: jest.fn()
}));
jest.mock("../../src/models/userModel", () => ({
    findByUsername: jest.fn(),
    findById: jest.fn(),
    usernameExists: jest.fn(),
    createUser: jest.fn()
}));
jest.mock("../../src/config/db", () => ({
    pool: { query: jest.fn(), execute: jest.fn() }
}));

const bcrypt = require("bcryptjs");
const userModel = require("../../src/models/userModel");
const { pool } = require("../../src/config/db");
const authController = require("../../src/controllers/authController");
const { AUTH_COOKIE } = require("../../src/config/securityConfig");

function mockRes() {
    const res = {
        statusCode: null,
        body: null,
        cookie: jest.fn(),
        clearCookie: jest.fn()
    };
    res.status = function (code) {
        this.statusCode = code;
        return this;
    };
    res.json = function (payload) {
        // Express defaults an unspecified status code to 200.
        if (this.statusCode === null) this.statusCode = 200;
        this.body = payload;
        return this;
    };
    return res;
}

const VALID_USER = {
    id: 1,
    username: "fuad",
    password_hash: "hashed",
    role: "student",
    student_id: 5,
    is_active: 1,
    token_version: 0,
    name: "Fuad",
    email: "fuad@uni.edu"
};

describe("authController.login", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test("returns 400 when username or password is missing", async () => {
        const req = { body: { username: "fuad" } };
        const res = mockRes();
        await authController.login(req, res, jest.fn());

        expect(res.statusCode).toBe(400);
    });

    test("returns 401 (generic message) when the user does not exist", async () => {
        userModel.findByUsername.mockResolvedValue(undefined);
        const req = { body: { username: "nobody", password: "Passw0rd" } };
        const res = mockRes();

        await authController.login(req, res, jest.fn());

        expect(res.statusCode).toBe(401);
        expect(res.body.message).toBe("Invalid username or password");
    });

    test("returns 401 when the password is wrong", async () => {
        userModel.findByUsername.mockResolvedValue(VALID_USER);
        bcrypt.compare.mockResolvedValue(false);
        const req = { body: { username: "fuad", password: "WrongPass1" } };
        const res = mockRes();

        await authController.login(req, res, jest.fn());

        expect(res.statusCode).toBe(401);
        expect(res.body.message).toBe("Invalid username or password");
    });

    test("returns 200 and sets the HttpOnly cookie on success", async () => {
        userModel.findByUsername.mockResolvedValue(VALID_USER);
        bcrypt.compare.mockResolvedValue(true);
        const req = { body: { username: "fuad", password: "Correct1!" } };
        const res = mockRes();

        await authController.login(req, res, jest.fn());

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.cookie).toHaveBeenCalledWith(AUTH_COOKIE, expect.any(String), expect.objectContaining({ httpOnly: true }));
        expect(res.body.user.password).toBeUndefined();
        expect(res.body.user.password_hash).toBeUndefined();
    });
});

describe("authController.register", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test("returns 400 when username or password is missing", async () => {
        const req = { body: { username: "" } };
        const res = mockRes();

        await authController.register(req, res, jest.fn());

        expect(res.statusCode).toBe(400);
    });

    test("returns 400 for a weak password (complexity policy)", async () => {
        const req = { body: { username: "newbie", password: "short" } };
        const res = mockRes();

        await authController.register(req, res, jest.fn());

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toMatch(/at least 8 characters/i);
    });

    test("returns 409 when the username is already taken", async () => {
        userModel.usernameExists.mockResolvedValue(true);
        const req = { body: { username: "taken", password: "StrongPass1" } };
        const res = mockRes();

        await authController.register(req, res, jest.fn());

        expect(res.statusCode).toBe(409);
        expect(userModel.createUser).not.toHaveBeenCalled();
    });

    test("creates the account as a student role and returns 201", async () => {
        userModel.usernameExists.mockResolvedValue(false);
        bcrypt.hash.mockResolvedValue("bcrypt-hash");
        const req = { body: { username: "newstudent", password: "StrongPass1" } };
        const res = mockRes();

        await authController.register(req, res, jest.fn());

        expect(res.statusCode).toBe(201);
        expect(bcrypt.hash).toHaveBeenCalledWith("StrongPass1", 12);
        expect(userModel.createUser).toHaveBeenCalledWith("newstudent", "bcrypt-hash", "student");
    });
});

describe("authController.changePassword", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test("returns 400 for a weak new password", async () => {
        const req = { user: { id: 1 }, body: { currentPassword: "OldPass1", newPassword: "weak" } };
        const res = mockRes();

        await authController.changePassword(req, res, jest.fn());

        expect(res.statusCode).toBe(400);
    });

    test("returns 401 when the current password is wrong", async () => {
        pool.query.mockResolvedValue([[{ password_hash: "current-hash" }]]);
        bcrypt.compare.mockResolvedValue(false);
        const req = { user: { id: 1 }, body: { currentPassword: "WrongOld1", newPassword: "NewPass1" } };
        const res = mockRes();

        await authController.changePassword(req, res, jest.fn());

        expect(res.statusCode).toBe(401);
    });

    test("updates the hash, bumps token_version, and clears the cookie on success", async () => {
        pool.query.mockResolvedValue([[{ password_hash: "current-hash" }]]);
        bcrypt.compare.mockResolvedValue(true);
        bcrypt.hash.mockResolvedValue("new-hash");
        pool.execute.mockResolvedValue([{ affectedRows: 1 }]);
        const req = { user: { id: 1 }, body: { currentPassword: "OldPass1", newPassword: "NewPass1" } };
        const res = mockRes();

        await authController.changePassword(req, res, jest.fn());

        expect(pool.execute).toHaveBeenCalledWith(
            expect.stringContaining("token_version = token_version + 1"),
            ["new-hash", 1]
        );
        expect(res.clearCookie).toHaveBeenCalled();
        expect(res.body.message).toMatch(/log in again/i);
    });
});
