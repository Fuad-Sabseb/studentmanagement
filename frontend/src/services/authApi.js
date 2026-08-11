/**
 * =====================================================
 * authApi.js
 * -----------------------------------------------------
 * Login / logout / session helpers. The JWT and the
 * logged-in student's basic info are kept in localStorage
 * so the session survives a page refresh.
 * =====================================================
 */

import { API_BASE_URL } from "./api.js";

const TOKEN_KEY = "cohort_auth_token";
const STUDENT_KEY = "cohort_auth_student";

export const authApi = {
  async login(username, password) {
    let response;
    try {
      response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });
    } catch {
      throw new Error("Could not reach the server. Check that the API is running.");
    }

    const payload = await response.json().catch(() => null);

    if (!response.ok) {
      throw new Error(payload?.message || "Login failed. Check your username and password.");
    }

    localStorage.setItem(TOKEN_KEY, payload.token);
    localStorage.setItem(STUDENT_KEY, JSON.stringify(payload.student));

    return payload.student;
  },

  logout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(STUDENT_KEY);
  },

  getToken() {
    return localStorage.getItem(TOKEN_KEY);
  },

  getStoredStudent() {
    const raw = localStorage.getItem(STUDENT_KEY);
    return raw ? JSON.parse(raw) : null;
  },

  isAuthenticated() {
    return Boolean(localStorage.getItem(TOKEN_KEY));
  }
};