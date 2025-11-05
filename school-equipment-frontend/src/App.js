import { useEffect, useState } from "react";
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
import "./styles/custom-dashboard.css";

const App = () => {
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    const savedUser = sessionStorage.getItem("user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setInitializing(false);
  }, []);

  if (initializing) {
    // Prevent premature redirect
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-primary" role="status"></div>
      </div>
    );
  }

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

  useEffect(() => {
    let mounted = true;
    const fetchUser = async () => {
      if (!user || !user.id) {
        setUserRole("");
        return;
      }
      try {
        const response = await getUserById(user.id);
        if (!mounted) return;
        setUserRole(response.data.role);
      } catch {
        sessionStorage.clear();
        setUser(null);
        navigate("/");
      }
    };
    fetchUser();
    return () => (mounted = false);
  }, [user, navigate, setUser]);

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
