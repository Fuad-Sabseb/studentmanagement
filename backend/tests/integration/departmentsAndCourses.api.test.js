// Mock the database module so tests do not use the real database.
jest.mock("../../src/config/db", () => ({
    pool: {
        execute: jest.fn(),
        query: jest.fn()
    },
    connectDB: jest.fn()
}));

const request = require("supertest");
const { pool } = require("../../src/config/db");
const app = require("../../src/app");

// Clear all mock calls before each test to keep tests independent.
beforeEach(() => {
    jest.clearAllMocks();
});

// Tests for the Departments API
describe("Departments API", () => {

    // Test that GET returns a list of departments.
    test("GET /api/departments returns list", async () => {
        pool.query.mockResolvedValue([[{ id: 1, name: "Software Engineering", student_count: 2 }]]);

        const res = await request(app).get("/api/departments");

        expect(res.status).toBe(200);
        expect(res.body.data[0].name).toBe("Software Engineering");
    });

    // Test that the department name is required when creating a department.
    test("POST /api/departments validates required name", async () => {
        const res = await request(app).post("/api/departments").send({});
        expect(res.status).toBe(400);
    });

    // Test that a new department can be created successfully.
    test("POST /api/departments creates a department", async () => {
        pool.execute.mockResolvedValue([{ insertId: 5 }]);

        const res = await request(app).post("/api/departments").send({ name: "Data Science" });

        expect(res.status).toBe(201);
        expect(res.body.id).toBe(5);
    });
});

// Tests for the Courses API
describe("Courses API", () => {

    // Test that GET returns a list of courses.
    test("GET /api/courses returns list", async () => {
        pool.query.mockResolvedValue([[{ id: 1, name: "DSA", code: "CS201" }]]);

        const res = await request(app).get("/api/courses");

        expect(res.status).toBe(200);
        expect(res.body.data[0].code).toBe("CS201");
    });

    // Test that required course fields are validated.
    test("POST /api/courses validates required fields", async () => {
        const res = await request(app).post("/api/courses").send({ name: "Missing Code" });
        expect(res.status).toBe(400);
    });

    // Test that a new course can be created successfully.
    test("POST /api/courses creates a course", async () => {
        pool.execute.mockResolvedValue([{ insertId: 9 }]);

        const res = await request(app)
            .post("/api/courses")
            .send({ name: "Data Science 101", code: "DS101", department_id: 1 });

        expect(res.status).toBe(201);
        expect(res.body.id).toBe(9);
    });
});