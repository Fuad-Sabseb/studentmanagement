import { Navigate } from "react-router-dom";

/**
 * Wraps a route element and enforces:
 *  - the user is logged in
 *  - (optionally) the user's role is in `allow`
 * Students who try to hit an admin-only path (e.g. by typing /admin
 * in the URL bar) are redirected to their own dashboard, and vice versa.
 */
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