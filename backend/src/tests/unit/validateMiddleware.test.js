const {
    validateCreateStudent,
    validateDepartment,
    validateCourse,
    validateAssignCourse
} = require("../../middleware/validateMiddleware");

/**
 * Helper to build fake Express req/res/next objects.
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
    test("calls next() when name and email are present", () => {
        const { req, res, next } = mockReqRes({ name: "Fuad", email: "fuad@test.com" });
        validateCreateStudent(req, res, next);
        expect(next).toHaveBeenCalledTimes(1);
        expect(res.statusCode).toBeNull();
    });

    test("returns 400 when name is missing", () => {
        const { req, res, next } = mockReqRes({ email: "fuad@test.com" });
        validateCreateStudent(req, res, next);
        expect(next).not.toHaveBeenCalled();
        expect(res.statusCode).toBe(400);
        expect(res.body.success).toBe(false);
        expect(res.body.errors).toContain("name is required");
    });

    test("returns 400 when email is missing", () => {
        const { req, res, next } = mockReqRes({ name: "Fuad" });
        validateCreateStudent(req, res, next);
        expect(res.statusCode).toBe(400);
        expect(res.body.errors).toContain("email is required");
    });

    test("returns 400 when email is malformed", () => {
        const { req, res, next } = mockReqRes({ name: "Fuad", email: "not-an-email" });
        validateCreateStudent(req, res, next);
        expect(res.statusCode).toBe(400);
        expect(res.body.errors).toContain("email must be a valid email address");
    });

    test("returns 400 when body is empty", () => {
        const { req, res, next } = mockReqRes(undefined);
        validateCreateStudent(req, res, next);
        expect(res.statusCode).toBe(400);
    });
});

describe("validateDepartment", () => {
    test("calls next() when name is present", () => {
        const { req, res, next } = mockReqRes({ name: "Computer Science" });
        validateDepartment(req, res, next);
        expect(next).toHaveBeenCalledTimes(1);
    });

    test("returns 400 when name missing", () => {
        const { req, res, next } = mockReqRes({});
        validateDepartment(req, res, next);
        expect(res.statusCode).toBe(400);
    });
});

describe("validateCourse", () => {
    test("calls next() when name and code are present", () => {
        const { req, res, next } = mockReqRes({ name: "Databases", code: "CS305" });
        validateCourse(req, res, next);
        expect(next).toHaveBeenCalledTimes(1);
    });

    test("returns 400 when code missing", () => {
        const { req, res, next } = mockReqRes({ name: "Databases" });
        validateCourse(req, res, next);
        expect(res.statusCode).toBe(400);
        expect(res.body.errors).toContain("code is required");
    });
});

describe("validateAssignCourse", () => {
    test("calls next() when course_id is a number", () => {
        const { req, res, next } = mockReqRes({ course_id: 3 });
        validateAssignCourse(req, res, next);
        expect(next).toHaveBeenCalledTimes(1);
    });

    test("returns 400 when course_id missing", () => {
        const { req, res, next } = mockReqRes({});
        validateAssignCourse(req, res, next);
        expect(res.statusCode).toBe(400);
    });

    test("returns 400 when course_id is not numeric", () => {
        const { req, res, next } = mockReqRes({ course_id: "abc" });
        validateAssignCourse(req, res, next);
        expect(res.statusCode).toBe(400);
    });
});
