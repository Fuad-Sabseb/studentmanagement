/**
 * =====================================================
 * api.js
 * -----------------------------------------------------
 * Centralized fetch() client for the Student Management
 * Express REST API. Automatically attaches the logged-in
 * user's JWT to every request, and clears the session
 * if the server responds 401 (expired/invalid token).
 * =====================================================
 */

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5001/api";

const TOKEN_KEY = "cohort_auth_token";
const USER_KEY = "cohort_auth_user";

/**
 * Low-level request helper.
 */
async function request(path, options = {}) {
  const token = typeof localStorage !== "undefined" ? localStorage.getItem(TOKEN_KEY) : null;

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
    if (typeof localStorage !== "undefined") {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    }
    if (typeof window !== "undefined" && window.location) {
      window.location.reload();
    }
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

export const authApi = {
  login: (credentials) =>
    request("/auth/login", { method: "POST", body: JSON.stringify(credentials) }),
  me: () => request("/auth/me"),
  changePassword: (payload) =>
    request("/auth/change-password", { method: "POST", body: JSON.stringify(payload) })
};

/* ------------------------------------------------------------------ */
/* Students                                                           */
/* ------------------------------------------------------------------ */

export const studentsApi = {
  getAll: () => request("/students"),
  getMyProfile: () => request("/students/me"),
  updateMyProfile: (payload) =>
    request("/students/me", { method: "PUT", body: JSON.stringify(payload) }),
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
  getById: (id) => request(`/departments/${id}`),
  create: (department) =>
    request("/departments", { method: "POST", body: JSON.stringify(department) }),
  update: (id, department) =>
    request(`/departments/${id}`, { method: "PUT", body: JSON.stringify(department) }),
  remove: (id) => request(`/departments/${id}`, { method: "DELETE" })
};

/* ------------------------------------------------------------------ */
/* Courses                                                             */
/* ------------------------------------------------------------------ */

export const coursesApi = {
  getAll: () => request("/courses"),
  getById: (id) => request(`/courses/${id}`),
  create: (course) =>
    request("/courses", { method: "POST", body: JSON.stringify(course) }),
  update: (id, course) =>
    request(`/courses/${id}`, { method: "PUT", body: JSON.stringify(course) }),
  remove: (id) => request(`/courses/${id}`, { method: "DELETE" })
};

/* ------------------------------------------------------------------ */
/* Grades                                                              */
/* ------------------------------------------------------------------ */

export const gradesApi = {
  getMyGrades: () => request("/grades/my-grades"),
  getByStudent: (studentId) => request(`/grades/student/${studentId}`),
  getByStudentAndCourse: (studentId, courseId) => request(`/grades/student/${studentId}/course/${courseId}`),
  getCourseStudentsAndGrades: (courseId) => request(`/grades/course/${courseId}`),
  batchEnter: (payload) => request("/grades/batch", { method: "POST", body: JSON.stringify(payload) }),
  enter: (payload) => request("/grades", { method: "POST", body: JSON.stringify(payload) }),
  update: (id, payload) => request(`/grades/${id}`, { method: "PUT", body: JSON.stringify(payload) }),
  remove: (id) => request(`/grades/${id}`, { method: "DELETE" })
};

/* ------------------------------------------------------------------ */
/* Announcements / Notice Board                                       */
/* ------------------------------------------------------------------ */

export const announcementsApi = {
  getAll: () => request("/announcements"),
  getById: (id) => request(`/announcements/${id}`),
  create: (payload) => request("/announcements", { method: "POST", body: JSON.stringify(payload) }),
  update: (id, payload) => request(`/announcements/${id}`, { method: "PUT", body: JSON.stringify(payload) }),
  remove: (id) => request(`/announcements/${id}`, { method: "DELETE" })
};