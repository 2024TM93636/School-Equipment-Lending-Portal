import React from "react";
import { Navigate } from "react-router-dom";

/**
 * Protects routes from unauthorized access.
 * - Redirects unauthenticated users to login
 * - Redirects users without the required role to dashboard
 */
const PrivateRoute = ({ user, requiredRole, children }) => {
  if (!user) {
    console.warn("Unauthorized access attempt → Redirecting to login");
    return <Navigate to="/" replace />;
  }

  if (
    requiredRole &&
    user.role.toUpperCase() !== requiredRole.toUpperCase()
  ) {
    console.warn(
      `Role mismatch: user=${user.role}, required=${requiredRole} → Redirecting`
    );
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default PrivateRoute;
