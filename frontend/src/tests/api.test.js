import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";
import { studentsApi } from "../services/api.js";

describe("studentsApi", () => {
  // Mock fetch before each test
  beforeEach(() => {
    global.fetch = vi.fn();
  });

  // Restore mocks after each test
  afterEach(() => {
    vi.restoreAllMocks();
  });

  // Test successful retrieval of all students
  test("getAll() resolves with parsed JSON on success", async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, data: [{ id: 1, name: "Fuad" }] })
    });

    const result = await studentsApi.getAll();
    expect(result.data).toHaveLength(1);
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/students"),
      expect.any(Object)
    );
  });

  // Test error handling for a failed HTTP response
  test("throws a readable error on a non-OK response", async () => {
    global.fetch.mockResolvedValue({
      ok: false,
      status: 404,
      json: async () => ({ success: false, message: "Student not found" })
    });

    await expect(studentsApi.getById(999)).rejects.toThrow("Student not found");
  });

  // Test error handling when the server cannot be reached
  test("throws a network error message when fetch itself fails", async () => {
    global.fetch.mockRejectedValue(new TypeError("Failed to fetch"));

    await expect(studentsApi.getAll()).rejects.toThrow(/could not reach the server/i);
  });

  // Test that create() sends a POST request with JSON data
  test("create() sends a POST with a JSON body", async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, id: 5 })
    });

    await studentsApi.create({ name: "Fuad", email: "fuad@test.com" });

    const [, options] = global.fetch.mock.calls[0];
    expect(options.method).toBe("POST");
    expect(JSON.parse(options.body)).toEqual({ name: "Fuad", email: "fuad@test.com" });
  });
});