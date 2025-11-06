import { Navigate } from "react-router-dom";

/**
 * Protects routes from unauthorized access.
 * - Redirects unauthenticated users to login
 * - Redirects users without the required role to dashboard
 */
const PrivateRoute = ({ user, requiredRole, children }) => {
  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (
    requiredRole &&
    (!user.role || user.role.toUpperCase() !== requiredRole.toUpperCase())
  ) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default PrivateRoute;
