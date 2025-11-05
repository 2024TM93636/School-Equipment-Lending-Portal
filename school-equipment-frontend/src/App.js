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
import { getUserById } from "./services/api";
import PrivateRoute from "./components/PrivateRoute";
import ThemeToggle from "./components/ThemeToggle";
import "./custom-dashboard.css";

const App = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const savedUser = sessionStorage.getItem("user");
    if (savedUser) setUser(JSON.parse(savedUser));
  }, []);

  return (
    <Router>
      <ThemeToggle />
      <MainLayout user={user} setUser={setUser} />
    </Router>
  );
};

const MainLayout = ({ user, setUser }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const hideNavbar = ["/", "/register"].includes(location.pathname);
  const [userRole, setUserRole] = useState(user?.role || "");

  useEffect(() => {
    const fetchUser = async () => {
      if (!user || !user.id) return;
      try {
        const response = await getUserById(user.id);
        setUserRole(response.data.role);
      } catch {
        sessionStorage.clear();
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
      {/* <footer className="text-center mt-5 mb-3 text-muted small">
        © 2025 School Equipment Lending System | Built with ❤️ using React + Spring Boot
      </footer> */}
    </>
  );
};

export default App;
