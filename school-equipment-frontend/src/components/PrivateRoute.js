import { Navigate } from "react-router-dom";

const PrivateRoute = ({ user, requiredRole, children }) => {
  if (!user) return <Navigate to="/" />;
  if (requiredRole && user.role.toUpperCase() !== requiredRole.toUpperCase()) {
    return <Navigate to="/dashboard" />;
  }
  return children;
};

export default PrivateRoute;
