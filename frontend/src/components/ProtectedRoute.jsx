import { Navigate } from "react-router-dom";


export default function ProtectedRoute({ user, allow, children }) {
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allow && !allow.includes(user.role)) {
    const fallback = user.role === "admin" ? "/admin" : "/student";
    return <Navigate to={fallback} replace />;
  }

  return children;
}