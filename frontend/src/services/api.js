/**
 * =====================================================
 * api.js
 * -----------------------------------------------------
 * Centralized fetch() client for the Student Management
 * Express REST API.
 *
 * Every function returns the *parsed data* on success and
 * throws an Error (with a readable .message) on failure, so
 * calling code can use a single try/catch + loading/error
 * state pattern everywhere.
 * =====================================================
 */

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5001/api";

/**
 * Low-level request helper.
 * Wraps fetch(), parses JSON, and normalizes errors.
 */
async function request(path, options = {}) {
  let response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      headers: { "Content-Type": "application/json" },
      ...options
    });
  } catch (networkError) {
    // fetch() itself throws for network failures / server unreachable
    throw new Error(
      "Could not reach the server. Check that the API is running and try again."
    );
  }

  let payload = null;
  try {
    payload = await response.json();
  } catch {
    // No JSON body (e.g. 204 No Content) — that's fine.
  }

  if (!response.ok) {
    const message =
      payload?.message ||
      (payload?.errors && payload.errors.join(", ")) ||
      `Request failed with status ${response.status}`;
    const error = new Error(message);
    error.status = response.status;
    error.errors = payload?.errors;
    throw error;
  }

  return payload;
}

/* ------------------------------------------------------------------ */
/* Students                                                           */
/* ------------------------------------------------------------------ */

export const studentsApi = {
  getAll: () => request("/students"),

  getById: (id) => request(`/students/${id}`),

  getByDepartment: (dept) =>
    request(`/students/department/${encodeURIComponent(dept)}`),

  getCount: () => request("/students/count"),

  create: (student) =>
    request("/students", {
      method: "POST",
      body: JSON.stringify(student)
    }),

  update: (id, student) =>
    request(`/students/${id}`, {
      method: "PUT",
      body: JSON.stringify(student)
    }),

  remove: (id) =>
    request(`/students/${id}`, {
      method: "DELETE"
    }),

  assignCourse: (studentId, courseId) =>
    request(`/students/${studentId}/courses`, {
      method: "POST",
      body: JSON.stringify({ course_id: courseId })
    }),

  removeCourse: (studentId, courseId) =>
    request(`/students/${studentId}/courses/${courseId}`, {
      method: "DELETE"
    })
};

/* ------------------------------------------------------------------ */
/* Departments                                                        */
/* ------------------------------------------------------------------ */

export const departmentsApi = {
  getAll: () => request("/departments"),
  create: (department) =>
    request("/departments", {
      method: "POST",
      body: JSON.stringify(department)
    })
};

/* ------------------------------------------------------------------ */
/* Courses                                                             */
/* ------------------------------------------------------------------ */

export const coursesApi = {
  getAll: () => request("/courses"),
  create: (course) =>
    request("/courses", {
      method: "POST",
      body: JSON.stringify(course)
    })
};
