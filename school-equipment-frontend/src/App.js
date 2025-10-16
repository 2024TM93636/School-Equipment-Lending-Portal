import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import Dashboard from "./pages/Dashboard";
import AdminDashboard from "./pages/AdminDashboard";
import RequestsPage from "./pages/RequestsPage";
import Navbar from "./components/Navbar";
import { getUserById } from "./services/api";
import PrivateRoute from "./components/PrivateRoute";

const App = () => {
  const [user, setUser] = useState(null);
  const [userId, setUserId] = useState(null);
  const [userRole, setUserRole] = useState("");

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) setUser(JSON.parse(savedUser));
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      if (!user || !user.id) return;
      try {
        const response = await getUserById(user.id);
        setUserId(response.data.id);
        setUserRole(response.data.role);
      } catch (err) {
        console.error("Error fetching user:", err);
      }
    };
    fetchUser();
  }, [user]);

  return (
    <Router>
      <MainLayout
        user={user}
        userRole={userRole}
        setUser={setUser}
        userId={userId}
      />
    </Router>
  );
};

const MainLayout = ({ user, userRole, setUser, userId }) => {
  const location = useLocation();
  const hideNavbar = ["/", "/register"].includes(location.pathname);

  return (
    <>
      {!hideNavbar && (
        <Navbar
          userRole={userRole || "GUEST"}
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
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/requests"
          element={
            <PrivateRoute user={user}>
              <RequestsPage userRole={userRole} userId={userId} />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <PrivateRoute user={user}>
              <AdminDashboard />
            </PrivateRoute>
          }
        />
      </Routes>
    </>
  );
};

export default App;
