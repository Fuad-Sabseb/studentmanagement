/**
 * Integration tests
 * -----------------------------------------------------
 * These tests exercise the full Express request pipeline:
 * route -> validation middleware -> controller -> model -> db pool
 *
 * The MySQL pool itself is mocked (no live database required to run
 * `npm test` in CI/sandbox), but every layer of the application
 * (routing, validation, controllers, models, error handling) runs
 * for real. Against a real MySQL instance, only tests/setupEnv.js's
 * mock would be removed — the test bodies stay identical.
 */

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

beforeEach(() => {
    jest.clearAllMocks();
});

describe("POST /api/students", () => {
    test("creates a student and returns 201", async () => {
        pool.execute.mockResolvedValue([{ insertId: 1 }]);

        const res = await request(app)
            .post("/api/students")
            .send({ name: "Fuad Sabseb", email: "fuad@test.com", phone: "0911000001", department_id: 2 });

        expect(res.status).toBe(201);
        expect(res.body.success).toBe(true);
        expect(res.body.id).toBe(1);
    });

    test("returns 400 when required fields are missing", async () => {
        const res = await request(app).post("/api/students").send({ name: "No Email" });

        expect(res.status).toBe(400);
        expect(res.body.success).toBe(false);
        expect(pool.execute).not.toHaveBeenCalled();
    });

    test("returns 400 when email is malformed", async () => {
        const res = await request(app)
            .post("/api/students")
            .send({ name: "Bad Email", email: "not-an-email" });

        expect(res.status).toBe(400);
    });
});

describe("GET /api/students", () => {
    test("returns the list of active students", async () => {
        pool.query.mockResolvedValue([[
            { id: 1, name: "Fuad Sabseb", is_deleted: 0 },
            { id: 2, name: "Abebe Kebede", is_deleted: 0 }
        ]]);

        const res = await request(app).get("/api/students");

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data).toHaveLength(2);
    });

    test("returns an empty array when there are no active students", async () => {
        pool.query.mockResolvedValue([[]]);

        const res = await request(app).get("/api/students");

        expect(res.status).toBe(200);
        expect(res.body.data).toEqual([]);
    });
});

describe("GET /api/students/count", () => {
    test("returns the total number of active students", async () => {
        pool.query.mockResolvedValue([[{ total: 5 }]]);

        const res = await request(app).get("/api/students/count");

        expect(res.status).toBe(200);
        expect(res.body.data.total).toBe(5);
    });
});

describe("GET /api/students/department/:dept", () => {
    test("returns students filtered by department", async () => {
        pool.query.mockResolvedValue([[{ id: 1, name: "Fuad Sabseb", department_name: "Software Engineering" }]]);

        const res = await request(app).get("/api/students/department/Software%20Engineering");

        expect(res.status).toBe(200);
        expect(res.body.data[0].department_name).toBe("Software Engineering");
    });
});

describe("PUT /api/students/:id", () => {
    test("updates a student", async () => {
        pool.query.mockResolvedValue([[{ id: 1 }]]); // studentExists check
        pool.execute.mockResolvedValue([{ affectedRows: 1 }]);

        const res = await request(app)
            .put("/api/students/1")
            .send({ name: "Fuad Updated", email: "fuad@test.com" });

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
    });

    test("returns 404 when the student does not exist", async () => {
        pool.query.mockResolvedValue([[]]); // studentExists check -> not found

        const res = await request(app)
            .put("/api/students/999")
            .send({ name: "Ghost", email: "ghost@test.com" });

        expect(res.status).toBe(404);
    });

    test("returns 400 when payload invalid", async () => {
        const res = await request(app).put("/api/students/1").send({ name: "" });
        expect(res.status).toBe(400);
    });
});

describe("DELETE /api/students/:id (soft delete)", () => {
    test("soft-deletes an existing student", async () => {
        pool.query.mockResolvedValue([[{ id: 1 }]]); // studentExists
        pool.execute.mockResolvedValue([{ affectedRows: 1 }]);

        const res = await request(app).delete("/api/students/1");

        expect(res.status).toBe(200);
        expect(res.body.message).toMatch(/deleted successfully/i);
        expect(pool.execute).toHaveBeenCalledWith(
            expect.stringContaining("SET is_deleted = TRUE"),
            expect.anything()
        );
    });

    test("returns 404 for a non-existent student", async () => {
        pool.query.mockResolvedValue([[]]);

        const res = await request(app).delete("/api/students/999");

        expect(res.status).toBe(404);
    });
});

describe("POST /api/students/:id/courses (assign course)", () => {
    test("assigns a course to a student", async () => {
        pool.query
            .mockResolvedValueOnce([[{ id: 1 }]]) // studentExists
            .mockResolvedValueOnce([[{ id: 3, name: "DSA" }]]); // getCourseById
        pool.execute.mockResolvedValue([{ affectedRows: 1 }]);

        const res = await request(app).post("/api/students/1/courses").send({ course_id: 3 });

        expect(res.status).toBe(201);
        expect(res.body.success).toBe(true);
    });

    test("returns 400 when course_id missing", async () => {
        const res = await request(app).post("/api/students/1/courses").send({});
        expect(res.status).toBe(400);
    });
});

describe("Unknown route", () => {
    test("returns 404 for an undefined route", async () => {
        const res = await request(app).get("/api/nonexistent");
        expect(res.status).toBe(404);
        expect(res.body.success).toBe(false);
    });
});
