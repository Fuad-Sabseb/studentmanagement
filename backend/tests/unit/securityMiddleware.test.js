/**
 * Unit tests for HTTPS enforcement, XSS sanitization and the new validators.
 */
const { httpsRedirect } = require("../../src/middleware/securityMiddleware");
const {
    sanitizeString,
    sanitizeBody,
    validateRegister,
    validateSemester,
    validateSchedule,
    validateAnnouncement
} = require("../../src/middleware/validateMiddleware");

function mockRes() {
    const res = { statusCode: null, body: null, redirectedTo: null };
    res.status = function (code) {
        this.statusCode = code;
        return this;
    };
    res.json = function (payload) {
        this.body = payload;
        return this;
    };
    res.redirect = function (code, url) {
        this.redirectedTo = { code, url };
        return this;
    };
    return res;
}

describe("httpsRedirect", () => {
    const ORIGINAL_ENV = process.env.NODE_ENV;

    afterEach(() => {
        process.env.NODE_ENV = ORIGINAL_ENV;
    });

    test("redirects HTTP to HTTPS when NODE_ENV is production", () => {
        process.env.NODE_ENV = "production";
        const req = { secure: false, headers: { host: "example.com" }, originalUrl: "/api/students" };
        const res = mockRes();
        const next = jest.fn();

        httpsRedirect(req, res, next);

        expect(res.redirectedTo.code).toBe(301);
        expect(res.redirectedTo.url).toBe("https://example.com/api/students");
        expect(next).not.toHaveBeenCalled();
    });

    test("does not redirect already-secure requests in production", () => {
        process.env.NODE_ENV = "production";
        const req = { secure: true, headers: { host: "example.com" }, originalUrl: "/api/students" };
        const res = mockRes();
        const next = jest.fn();

        httpsRedirect(req, res, next);

        expect(res.redirectedTo).toBeNull();
        expect(next).toHaveBeenCalledTimes(1);
    });

    test("passes through in development/test", () => {
        process.env.NODE_ENV = "development";
        const req = { secure: false, headers: { host: "localhost:5001" }, originalUrl: "/" };
        const res = mockRes();
        const next = jest.fn();

        httpsRedirect(req, res, next);

        expect(res.redirectedTo).toBeNull();
        expect(next).toHaveBeenCalledTimes(1);
    });
});

describe("sanitizeString / sanitizeBody (XSS defence-in-depth)", () => {
    test("strips HTML tags", () => {
        expect(sanitizeString("<script>alert(1)</script>John")).toBe("alert(1)John");
        expect(sanitizeString("<b>Bold</b>")).toBe("Bold");
    });

    test("removes javascript: URIs", () => {
        expect(sanitizeString("javascript:alert(1)")).toBe("alert(1)");
    });

    test("removes control characters", () => {
        expect(sanitizeString("hello\u0000world")).toBe("helloworld");
    });

    test("sanitizeBody mutates every string field in the request body", () => {
        const req = { body: { name: "<img src=x onerror=alert(1)>Sara", course_id: 3 } };
        const res = mockRes();
        const next = jest.fn();

        sanitizeBody(req, res, next);

        expect(req.body.name).toBe("Sara");
        expect(req.body.course_id).toBe(3);
        expect(next).toHaveBeenCalledTimes(1);
    });

    test("sanitizeBody leaves non-object bodies untouched", () => {
        const req = { body: undefined };
        const res = mockRes();
        const next = jest.fn();

        expect(() => sanitizeBody(req, res, next)).not.toThrow();
        expect(next).toHaveBeenCalledTimes(1);
    });
});

describe("validateRegister", () => {
    test("accepts a valid username + matching strong password", () => {
        const req = { body: { username: "john_doe", password: "StrongPass1", confirm_password: "StrongPass1" } };
        const res = mockRes();
        const next = jest.fn();

        validateRegister(req, res, next);

        expect(next).toHaveBeenCalledTimes(1);
    });

    test("rejects a username with illegal characters", () => {
        const req = { body: { username: "john<doe>", password: "StrongPass1", confirm_password: "StrongPass1" } };
        const res = mockRes();
        const next = jest.fn();

        validateRegister(req, res, next);

        expect(res.statusCode).toBe(400);
        expect(next).not.toHaveBeenCalled();
    });

    test("rejects when confirm_password does not match", () => {
        const req = { body: { username: "john_doe", password: "StrongPass1", confirm_password: "StrongPass2" } };
        const res = mockRes();
        const next = jest.fn();

        validateRegister(req, res, next);

        expect(res.statusCode).toBe(400);
        expect(res.body.errors).toContain("confirm_password must match password");
    });
});

describe("validateSemester", () => {
    test("accepts a name", () => {
        const req = { body: { name: "Spring 2026" } };
        const res = mockRes();
        const next = jest.fn();

        validateSemester(req, res, next);

        expect(next).toHaveBeenCalledTimes(1);
    });

    test("rejects a missing name", () => {
        const req = { body: {} };
        const res = mockRes();
        const next = jest.fn();

        validateSemester(req, res, next);

        expect(res.statusCode).toBe(400);
    });
});

describe("validateSchedule", () => {
    test("accepts a valid schedule", () => {
        const req = {
            body: { course_id: 1, day_of_week: "Mon", start_time: "09:00", end_time: "10:30", room: "A-101" }
        };
        const res = mockRes();
        const next = jest.fn();

        validateSchedule(req, res, next);

        expect(next).toHaveBeenCalledTimes(1);
    });

    test("rejects an invalid day and non-numeric course_id", () => {
        const req = {
            body: { course_id: "abc", day_of_week: "monday", start_time: "9:00", end_time: "10:30", room: "A-101" }
        };
        const res = mockRes();
        const next = jest.fn();

        validateSchedule(req, res, next);

        expect(res.statusCode).toBe(400);
        expect(res.body.errors).toContain("course_id must be a number");
    });

    test("rejects a malformed time", () => {
        const req = {
            body: { course_id: 1, day_of_week: "Mon", start_time: "not-a-time", end_time: "10:30", room: "A-101" }
        };
        const res = mockRes();
        const next = jest.fn();

        validateSchedule(req, res, next);

        expect(res.statusCode).toBe(400);
    });
});

describe("validateAnnouncement", () => {
    test("accepts title + content", () => {
        const req = { body: { title: "Midterm results", content: "Check your portal" } };
        const res = mockRes();
        const next = jest.fn();

        validateAnnouncement(req, res, next);

        expect(next).toHaveBeenCalledTimes(1);
    });

    test("rejects an out-of-range priority", () => {
        const req = { body: { title: "t", content: "c", priority: "critical" } };
        const res = mockRes();
        const next = jest.fn();

        validateAnnouncement(req, res, next);

        expect(res.statusCode).toBe(400);
        expect(res.body.errors).toContain("priority must be one of: low, normal, high, urgent");
    });

    test("rejects missing content", () => {
        const req = { body: { title: "t" } };
        const res = mockRes();
        const next = jest.fn();

        validateAnnouncement(req, res, next);

        expect(res.statusCode).toBe(400);
    });
});
