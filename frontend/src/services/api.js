/**
 * =====================================================
 * api.js
 * -----------------------------------------------------
 * Centralized fetch() client for the Student Management
 * Express REST API. Automatically attaches the logged-in
 * student's JWT to every request, and clears the session
 * if the server responds 401 (expired/invalid token).
 * =====================================================
 */

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5001/api";

const TOKEN_KEY = "cohort_auth_token";
const STUDENT_KEY = "cohort_auth_student";

/**
 * Low-level request helper.
 */
async function request(path, options = {}) {
  const token = localStorage.getItem(TOKEN_KEY);

  let response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      ...options
    });
  } catch (networkError) {
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

  if (response.status === 401) {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(STUDENT_KEY);
    window.location.reload();
    throw new Error("Your session expired. Please log in again.");
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
    request("/students", { method: "POST", body: JSON.stringify(student) }),
  update: (id, student) =>
    request(`/students/${id}`, { method: "PUT", body: JSON.stringify(student) }),
  remove: (id) => request(`/students/${id}`, { method: "DELETE" }),
  assignCourse: (studentId, courseId) =>
    request(`/students/${studentId}/courses`, {
      method: "POST",
      body: JSON.stringify({ course_id: courseId })
    }),
  removeCourse: (studentId, courseId) =>
    request(`/students/${studentId}/courses/${courseId}`, { method: "DELETE" })
};

/* ------------------------------------------------------------------ */
/* Departments                                                        */
/* ------------------------------------------------------------------ */

export const departmentsApi = {
  getAll: () => request("/departments"),
  create: (department) =>
    request("/departments", { method: "POST", body: JSON.stringify(department) })
};

/* ------------------------------------------------------------------ */
/* Courses                                                             */
/* ------------------------------------------------------------------ */

export const coursesApi = {
  getAll: () => request("/courses"),
  create: (course) =>
    request("/courses", { method: "POST", body: JSON.stringify(course) })
};