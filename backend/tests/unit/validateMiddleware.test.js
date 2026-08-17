const {
    validateCreateStudent,
    validateDepartment,
    validateCourse,
    validateAssignCourse
} = require("../../src/middleware/validateMiddleware");

/**
 * Helper function to create fake Express req, res, and next objects
 * for testing the validation middleware.
 */
function mockReqRes(body) {
    const req = { body };
    const res = {
        statusCode: null,
        body: null,
        status(code) {
            this.statusCode = code;
            return this;
        },
        json(payload) {
            this.body = payload;
            return this;
        }
    };
    const next = jest.fn();
    return { req, res, next };
}

describe("validateCreateStudent", () => {
    // Valid student data should allow the request to continue.
    test("calls next() when name and email are present", () => {
        const { req, res, next } = mockReqRes({ name: "Fuad", email: "fuad@test.com" });
        validateCreateStudent(req, res, next);
        expect(next).toHaveBeenCalledTimes(1);
        expect(res.statusCode).toBeNull();
    });

    // Missing name should return a validation error.
    test("returns 400 when name is missing", () => {
        const { req, res, next } = mockReqRes({ email: "fuad@test.com" });
        validateCreateStudent(req, res, next);
        expect(next).not.toHaveBeenCalled();
        expect(res.statusCode).toBe(400);
        expect(res.body.success).toBe(false);
        expect(res.body.errors).toContain("name is required");
    });

    // Missing email should return a validation error.
    test("returns 400 when email is missing", () => {
        const { req, res, next } = mockReqRes({ name: "Fuad" });
        validateCreateStudent(req, res, next);
        expect(res.statusCode).toBe(400);
        expect(res.body.errors).toContain("email is required");
    });

    // Invalid email format should be rejected.
    test("returns 400 when email is malformed", () => {
        const { req, res, next } = mockReqRes({ name: "Fuad", email: "not-an-email" });
        validateCreateStudent(req, res, next);
        expect(res.statusCode).toBe(400);
        expect(res.body.errors).toContain("email must be a valid email address");
    });

    // An empty request body should be rejected.
    test("returns 400 when body is empty", () => {
        const { req, res, next } = mockReqRes(undefined);
        validateCreateStudent(req, res, next);
        expect(res.statusCode).toBe(400);
    });
});

describe("validateDepartment", () => {
    // A department with a name should pass validation.
    test("calls next() when name is present", () => {
        const { req, res, next } = mockReqRes({ name: "Computer Science" });
        validateDepartment(req, res, next);
        expect(next).toHaveBeenCalledTimes(1);
    });

    // A missing department name should return 400.
    test("returns 400 when name missing", () => {
        const { req, res, next } = mockReqRes({});
        validateDepartment(req, res, next);
        expect(res.statusCode).toBe(400);
    });
});

describe("validateCourse", () => {
    // A course with both name and code should pass validation.
    test("calls next() when name and code are present", () => {
        const { req, res, next } = mockReqRes({ name: "Databases", code: "CS305" });
        validateCourse(req, res, next);
        expect(next).toHaveBeenCalledTimes(1);
    });

    // A course without a code should be rejected.
    test("returns 400 when code missing", () => {
        const { req, res, next } = mockReqRes({ name: "Databases" });
        validateCourse(req, res, next);
        expect(res.statusCode).toBe(400);
        expect(res.body.errors).toContain("code is required");
    });
});

describe("validateAssignCourse", () => {
    // A numeric course ID should pass validation.
    test("calls next() when course_id is a number", () => {
        const { req, res, next } = mockReqRes({ course_id: 3 });
        validateAssignCourse(req, res, next);
        expect(next).toHaveBeenCalledTimes(1);
    });

    // A missing course ID should be rejected.
    test("returns 400 when course_id missing", () => {
        const { req, res, next } = mockReqRes({});
        validateAssignCourse(req, res, next);
        expect(res.statusCode).toBe(400);
    });

    // A non-numeric course ID should be rejected.
    test("returns 400 when course_id is not numeric", () => {
        const { req, res, next } = mockReqRes({ course_id: "abc" });
        validateAssignCourse(req, res, next);
        expect(res.statusCode).toBe(400);
    });
});