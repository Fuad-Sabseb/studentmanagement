jest.mock("../../models/studentModel");
jest.mock("../../models/courseModel");
jest.mock("../../config/db", () => ({
    pool: { execute: jest.fn(), query: jest.fn() },
    connectDB: jest.fn()
}));

const studentModel = require("../../models/studentModel");
const courseModel = require("../../models/courseModel");
const { pool } = require("../../config/db");
const studentController = require("../../controllers/studentController");

function mockRes() {
    return {
        statusCode: 200,
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
}

beforeEach(() => {
    jest.clearAllMocks();
});

describe("studentController.createStudent", () => {
    test("returns 201 and the new id on success", async () => {
        studentModel.createStudent.mockResolvedValue({ insertId: 10 });
        pool.query.mockResolvedValue([[]]); // no username clash
        pool.execute.mockResolvedValue([{ insertId: 1 }]); // insert users row

        const req = { body: { name: "Fuad", email: "fuad@test.com" } };
        const res = mockRes();
        const next = jest.fn();

        await studentController.createStudent(req, res, next);

        expect(res.statusCode).toBe(201);
        expect(res.body.success).toBe(true);
        expect(res.body.id).toBe(10);
    });

    test("returns 409 on duplicate email", async () => {
        const dupError = new Error("Duplicate entry");
        dupError.code = "ER_DUP_ENTRY";
        studentModel.createStudent.mockRejectedValue(dupError);

        const req = { body: { name: "Fuad", email: "dup@test.com" } };
        const res = mockRes();

        await studentController.createStudent(req, res);

        expect(res.statusCode).toBe(409);
        expect(res.body.success).toBe(false);
    });

    test("forwards unexpected errors to the error handler instead of leaking details", async () => {
        studentModel.createStudent.mockRejectedValue(new Error("DB down"));

        const req = { body: { name: "Fuad", email: "fuad@test.com" } };
        const res = mockRes();
        const next = jest.fn();

        await studentController.createStudent(req, res, next);

        expect(next).toHaveBeenCalledWith(expect.any(Error));
    });
});

describe("studentController.getAllStudents", () => {
    test("returns the list of active students", async () => {
        studentModel.getAllStudents.mockResolvedValue([{ id: 1 }, { id: 2 }]);

        const res = mockRes();
        await studentController.getAllStudents({}, res);

        expect(res.statusCode).toBe(200);
        expect(res.body.count).toBe(2);
        expect(res.body.data).toHaveLength(2);
    });
});

describe("studentController.getStudentById", () => {
    test("returns 404 when the student does not exist", async () => {
        studentModel.getStudentById.mockResolvedValue(undefined);

        const req = { params: { id: 999 } };
        const res = mockRes();

        await studentController.getStudentById(req, res);

        expect(res.statusCode).toBe(404);
    });

    test("returns 200 with the student when found", async () => {
        studentModel.getStudentById.mockResolvedValue({ id: 1, name: "Fuad" });

        const req = { params: { id: 1 } };
        const res = mockRes();

        await studentController.getStudentById(req, res);

        expect(res.statusCode).toBe(200);
        expect(res.body.data.name).toBe("Fuad");
    });
});

describe("studentController.deleteStudent (soft delete)", () => {
    test("returns 404 when student does not exist", async () => {
        studentModel.studentExists.mockResolvedValue(false);

        const req = { params: { id: 999 } };
        const res = mockRes();

        await studentController.deleteStudent(req, res);

        expect(res.statusCode).toBe(404);
        expect(studentModel.deleteStudent).not.toHaveBeenCalled();
    });

    test("soft-deletes and returns success message", async () => {
        studentModel.studentExists.mockResolvedValue(true);
        studentModel.deleteStudent.mockResolvedValue({ affectedRows: 1 });

        const req = { params: { id: 1 } };
        const res = mockRes();

        await studentController.deleteStudent(req, res);

        expect(studentModel.deleteStudent).toHaveBeenCalledWith(1);
        expect(res.statusCode).toBe(200);
        expect(res.body.message).toMatch(/deleted successfully/i);
    });
});

describe("studentController.assignCourse", () => {
    test("returns 404 when student not found", async () => {
        studentModel.studentExists.mockResolvedValue(false);

        const req = { params: { id: 1 }, body: { course_id: 2 } };
        const res = mockRes();

        await studentController.assignCourse(req, res);

        expect(res.statusCode).toBe(404);
        expect(res.body.message).toMatch(/student not found/i);
    });

    test("returns 404 when course not found", async () => {
        studentModel.studentExists.mockResolvedValue(true);
        courseModel.getCourseById.mockResolvedValue(undefined);

        const req = { params: { id: 1 }, body: { course_id: 999 } };
        const res = mockRes();

        await studentController.assignCourse(req, res);

        expect(res.statusCode).toBe(404);
        expect(res.body.message).toMatch(/course not found/i);
    });

    test("assigns course successfully", async () => {
        studentModel.studentExists.mockResolvedValue(true);
        courseModel.getCourseById.mockResolvedValue({ id: 2, name: "DSA" });
        studentModel.assignCourse.mockResolvedValue({ affectedRows: 1 });

        const req = { params: { id: 1 }, body: { course_id: 2 } };
        const res = mockRes();

        await studentController.assignCourse(req, res);

        expect(studentModel.assignCourse).toHaveBeenCalledWith(1, 2);
        expect(res.statusCode).toBe(201);
    });
});
