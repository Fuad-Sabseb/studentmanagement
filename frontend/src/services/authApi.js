

import { API_BASE_URL } from "./api.js";

const USER_KEY = "cohort_auth_user";

export const authApi = {
  async signup(username, password, confirmPassword) {
    let response;
    try {
      response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ username, password, confirm_password: confirmPassword })
      });
    } catch {
      throw new Error("Could not reach the server. Check that the API is running.");
    }

    const payload = await response.json().catch(() => null);

    if (!response.ok) {
      throw new Error(payload?.message || "Signup failed. Please try again.");
    }

    return payload;
  },

  async login(username, password) {
    let response;
    try {
      response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ username, password })
      });
    } catch {
      throw new Error("Could not reach the server. Check that the API is running.");
    }

    const payload = await response.json().catch(() => null);

    if (!response.ok) {
      throw new Error(payload?.message || "Login failed. Check your username and password.");
    }

    localStorage.setItem(USER_KEY, JSON.stringify(payload.user));

    return payload.user;
  },

  async logout() {
    try {
      await fetch(`${API_BASE_URL}/auth/logout`, { method: "POST", credentials: "include" });
    } catch {
      // Best-effort server-side cookie clear; the local session still ends.
    }
    localStorage.removeItem(USER_KEY);
  },

  getStoredUser() {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  },

  isAuthenticated() {
    return Boolean(localStorage.getItem(USER_KEY));
  }
};
