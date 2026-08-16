import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState } from "react";

import LoginPage from "./components/LoginPage.jsx";
import SignupPage from "./components/SignupPage.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import AdminDashboard from "./components/AdminDashboard.jsx";
import StudentDashboard from "./components/StudentDashboard.jsx";
import TeacherDashboard from "./components/TeacherDashboard.jsx";
import { useToast } from "./components/Toast.jsx";
import { authApi } from "./services/authApi.js";
//this file exported touse in other area
export default function App() {
  const toast = useToast();
  const [user, setUser] = useState(() => authApi.getStoredUser());
  // The JWT now lives in an HttpOnly cookie (not localStorage); the stored user
  // record drives the UI. Expired/invalid cookies are caught by the first 401.
  const isAuthenticated = Boolean(user);

  const handleLogin = async (username, password) => {
    const loggedInUser = await authApi.login(username, password);
    setUser(loggedInUser);
    toast.success(`Welcome back${loggedInUser.username ? `, ${loggedInUser.username}` : ""}.`);
  };

  const handleSignup = async (username, password, confirmPassword) => {
    await authApi.signup(username, password, confirmPassword);
    toast.success("Account created! Please log in with your new credentials.");
  };

  const handleLogout = () => {
    authApi.logout();
    setUser(null);
  };

  const getRoleRedirect = (role) => {
    if (role === "admin") return "/admin";
    if (role === "teacher") return "/teacher";
    return "/student";
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={
            isAuthenticated ? (
              <Navigate to={getRoleRedirect(user.role)} replace />
            ) : (
              <LoginPage onLogin={handleLogin} />
            )
          }
        />

        <Route
          path="/signup"
          element={
            isAuthenticated ? (
              <Navigate to={getRoleRedirect(user.role)} replace />
            ) : (
              <SignupPage onSignup={handleSignup} />
            )
          }
        />

        <Route
          path="/admin/*"
          element={
            <ProtectedRoute user={isAuthenticated ? user : null} allow={["admin"]}>
              <AdminDashboard currentUser={user} onLogout={handleLogout} />
            </ProtectedRoute>
          }
        />

        <Route
          path="/teacher/*"
          element={
            <ProtectedRoute user={isAuthenticated ? user : null} allow={["teacher", "admin"]}>
              <TeacherDashboard currentUser={user} onLogout={handleLogout} />
            </ProtectedRoute>
          }
        />

        <Route
          path="/student/*"
          element={
            <ProtectedRoute user={isAuthenticated ? user : null} allow={["student"]}>
              <StudentDashboard currentUser={user} onLogout={handleLogout} />
            </ProtectedRoute>
          }
        />

        <Route
          path="*"
          element={
            <Navigate
              to={isAuthenticated ? getRoleRedirect(user.role) : "/login"}
              replace
            />
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
