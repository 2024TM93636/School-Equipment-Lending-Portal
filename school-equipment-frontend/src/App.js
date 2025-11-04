import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  useNavigate,
} from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import Dashboard from "./pages/Dashboard";
import AdminDashboard from "./pages/AdminDashboard";
import RequestsPage from "./pages/RequestsPage";
import Navbar from "./components/Navbar";
import { getUserById, logoutUser } from "./services/api";
import PrivateRoute from "./components/PrivateRoute";

const App = () => {
  const [user, setUser] = useState(null);

  // Load user from sessionStorage
  useEffect(() => {
    const savedUser = sessionStorage.getItem("user");
    if (savedUser) setUser(JSON.parse(savedUser));
  }, []);

  return (
    <Router>
      <MainLayout user={user} setUser={setUser} />
    </Router>
  );
};

const MainLayout = ({ user, setUser }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const hideNavbar = ["/", "/register"].includes(location.pathname);

  const [userRole, setUserRole] = useState(user?.role || "");

  // Fetch updated user info from backend
  useEffect(() => {
    const fetchUser = async () => {
      if (!user || !user.id) return;
      try {
        const response = await getUserById(user.id);
        setUserRole(response.data.role);
      } catch (err) {
        console.error("Error fetching user:", err);
        // If user not found, clear storage and redirect to login
        sessionStorage.removeItem("user");
        sessionStorage.removeItem("token");
        setUser(null);
        navigate("/");
      }
    };
    fetchUser();
  }, [user, navigate]);

  return (
    <>
      {!hideNavbar && (
        <Navbar
          userRole={userRole}
          userName={user?.name || "Guest"}
          setUser={setUser}
        />
      )}
      <Routes>
        <Route path="/" element={<LoginPage setUser={setUser} />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route
          path="/dashboard"
          element={
            <PrivateRoute user={user}>
              <Dashboard user={user} userRole={userRole} />
            </PrivateRoute>
          }
        />
        <Route
          path="/requests"
          element={
            <PrivateRoute user={user}>
              <RequestsPage userRole={userRole} userId={user?.id} />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <PrivateRoute user={user} requiredRole="ADMIN">
              <AdminDashboard />
            </PrivateRoute>
          }
        />
      </Routes>
    </>
  );
};

export default App;
