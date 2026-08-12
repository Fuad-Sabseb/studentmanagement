import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState } from "react";

import LoginPage from "./components/LoginPage.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import AdminDashboard from "./components/AdminDashboard.jsx";
import StudentDashboard from "./components/StudentDashboard.jsx";
import TeacherDashboard from "./components/TeacherDashboard.jsx";
import { useToast } from "./components/Toast.jsx";
import { authApi } from "./services/authApi.js";

export default function App() {
  const toast = useToast();
  const [user, setUser] = useState(() => authApi.getStoredUser());
  const isAuthenticated = Boolean(user) && authApi.isAuthenticated();

  const handleLogin = async (username, password) => {
    const loggedInUser = await authApi.login(username, password);
    setUser(loggedInUser);
    toast.success(`Welcome back${loggedInUser.username ? `, ${loggedInUser.username}` : ""}.`);
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
