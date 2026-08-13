// Mock the student and course models so no real database operations are performed.
jest.mock("../../src/models/studentModel");
jest.mock("../../src/models/courseModel");

const studentModel = require("../../src/models/studentModel");
const courseModel = require("../../src/models/courseModel");
const studentController = require("../../src/controllers/studentController");

// Create a fake Express response object for testing controller responses.
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

// Clear all mock calls before each test.
beforeEach(() => {
    jest.clearAllMocks();
});

describe("studentController.createStudent", () => {
    // Test successful student creation.
    test("returns 201 and the new id on success", async () => {
        studentModel.createStudent.mockResolvedValue({ insertId: 10 });

        const req = { body: { name: "Fuad", email: "fuad@test.com" } };
        const res = mockRes();

        await studentController.createStudent(req, res);

        expect(res.statusCode).toBe(201);
        expect(res.body.success).toBe(true);
        expect(res.body.id).toBe(10);
    });

    // Test handling of duplicate email addresses.
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

    // Test handling of unexpected server errors.
    test("returns 500 on unexpected error", async () => {
        studentModel.createStudent.mockRejectedValue(new Error("DB down"));

        const req = { body: { name: "Fuad", email: "fuad@test.com" } };
        const res = mockRes();

        await studentController.createStudent(req, res);

        expect(res.statusCode).toBe(500);
    });
});

describe("studentController.getAllStudents", () => {
    // Test that active students are returned correctly.
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
    // Test that a missing student returns a 404 response.
    test("returns 404 when the student does not exist", async () => {
        studentModel.getStudentById.mockResolvedValue(undefined);

        const req = { params: { id: 999 } };
        const res = mockRes();

        await studentController.getStudentById(req, res);

        expect(res.statusCode).toBe(404);
    });

    // Test that an existing student is returned successfully.
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
    // Test that deleting a non-existent student returns 404.
    test("returns 404 when student does not exist", async () => {
        studentModel.studentExists.mockResolvedValue(false);

        const req = { params: { id: 999 } };
        const res = mockRes();

        await studentController.deleteStudent(req, res);

        expect(res.statusCode).toBe(404);
        expect(studentModel.deleteStudent).not.toHaveBeenCalled();
    });

    // Test that an existing student is soft-deleted successfully.
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
    // Test that assigning a course fails when the student does not exist.
    test("returns 404 when student not found", async () => {
        studentModel.studentExists.mockResolvedValue(false);

        const req = { params: { id: 1 }, body: { course_id: 2 } };
        const res = mockRes();

        await studentController.assignCourse(req, res);

        expect(res.statusCode).toBe(404);
        expect(res.body.message).toMatch(/student not found/i);
    });

    // Test that assigning a missing course returns 404.
    test("returns 404 when course not found", async () => {
        studentModel.studentExists.mockResolvedValue(true);
        courseModel.getCourseById.mockResolvedValue(undefined);

        const req = { params: { id: 1 }, body: { course_id: 999 } };
        const res = mockRes();

        await studentController.assignCourse(req, res);

        expect(res.statusCode).toBe(404);
        expect(res.body.message).toMatch(/course not found/i);
    });

    // Test successful course assignment to a student.
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