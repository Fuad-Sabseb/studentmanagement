// Mock the DB pool BEFORE requiring the model so no real MySQL connection
// is ever attempted during unit tests.
jest.mock("../../src/config/db", () => ({
    pool: {
        execute: jest.fn(),
        query: jest.fn()
    }
}));

const { pool } = require("../../src/config/db");
const studentModel = require("../../src/models/studentModel");

beforeEach(() => {
    jest.clearAllMocks();
});

describe("studentModel.createStudent", () => {
    test("inserts a student with the correct SQL values", async () => {
        pool.execute.mockResolvedValue([{ insertId: 42 }]);

        const result = await studentModel.createStudent({
            name: "Fuad Sabseb",
            email: "fuad@test.com",
            phone: "0911000001",
            department_id: 2
        });

        expect(pool.execute).toHaveBeenCalledWith(
            expect.stringContaining("INSERT INTO students"),
            ["Fuad Sabseb", "fuad@test.com", "0911000001", 2]
        );
        expect(result.insertId).toBe(42);
    });

    test("defaults phone and department_id to null when omitted", async () => {
        pool.execute.mockResolvedValue([{ insertId: 1 }]);

        await studentModel.createStudent({ name: "A", email: "a@test.com" });

        expect(pool.execute).toHaveBeenCalledWith(
            expect.any(String),
            ["A", "a@test.com", null, null]
        );
    });
});

describe("studentModel.getAllStudents", () => {
    test("only queries active (non-deleted) students", async () => {
        pool.query.mockResolvedValue([[{ id: 1, name: "A" }]]);

        const rows = await studentModel.getAllStudents();

        expect(pool.query).toHaveBeenCalledWith(
            expect.stringContaining("WHERE s.is_deleted = FALSE")
        );
        expect(rows).toHaveLength(1);
    });
});

describe("studentModel.getStudentsByDepartment", () => {
    test("filters by department_id when a numeric id is passed", async () => {
        pool.query.mockResolvedValue([[]]);

        await studentModel.getStudentsByDepartment("2");

        expect(pool.query).toHaveBeenCalledWith(
            expect.stringContaining("s.department_id = ?"),
            ["2"]
        );
    });

    test("filters by department name when a non-numeric value is passed", async () => {
        pool.query.mockResolvedValue([[]]);

        await studentModel.getStudentsByDepartment("Software Engineering");

        expect(pool.query).toHaveBeenCalledWith(
            expect.stringContaining("d.name = ?"),
            ["Software Engineering"]
        );
    });
});

describe("studentModel.deleteStudent (soft delete)", () => {
    test("sets is_deleted = TRUE instead of removing the row", async () => {
        pool.execute.mockResolvedValue([{ affectedRows: 1 }]);

        await studentModel.deleteStudent(5);

        expect(pool.execute).toHaveBeenCalledWith(
            expect.stringContaining("SET is_deleted = TRUE"),
            [5]
        );
    });
});

describe("studentModel.countActiveStudents", () => {
    test("returns the total from the query result", async () => {
        pool.query.mockResolvedValue([[{ total: 7 }]]);

        const total = await studentModel.countActiveStudents();

        expect(total).toBe(7);
        expect(pool.query).toHaveBeenCalledWith(
            expect.stringContaining("WHERE is_deleted = FALSE")
        );
    });
});

describe("studentModel.assignCourse", () => {
    test("inserts into student_courses using INSERT IGNORE", async () => {
        pool.execute.mockResolvedValue([{ affectedRows: 1 }]);

        await studentModel.assignCourse(1, 3);

        expect(pool.execute).toHaveBeenCalledWith(
            expect.stringContaining("INSERT IGNORE INTO student_courses"),
            [1, 3]
        );
    });
});
