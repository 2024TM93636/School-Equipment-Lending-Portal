import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { logoutUser } from "../services/api";
import "../styles/custom-dashboard.css";

const Navbar = ({ userRole, userName, setUser }) => {
  const navigate = useNavigate();
  const [isDark, setIsDark] = useState(
    sessionStorage.getItem("theme") === "dark"
  );
  const [menuOpen, setMenuOpen] = useState(false);

  // Apply saved theme
  useEffect(() => {
    const savedTheme = sessionStorage.getItem("theme") || "light";
    document.body.classList.toggle("dark-mode", savedTheme === "dark");
    setIsDark(savedTheme === "dark");
  }, []);

  // Toggle theme and persist
  const toggleTheme = () => {
    const newTheme = isDark ? "light" : "dark";
    setIsDark(!isDark);
    document.body.classList.toggle("dark-mode", newTheme === "dark");
    sessionStorage.setItem("theme", newTheme);
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch {
      console.warn("Server logout failed; clearing local session.");
    } finally {
      setUser(null);
      sessionStorage.clear();
      navigate("/");
    }
  };

  return (
    <nav
      className={`navbar navbar-expand-lg ${
        isDark ? "navbar-dark bg-dark" : "navbar-light bg-white"
      } shadow-sm sticky-top border-bottom`}
    >
      <div className="container-fluid px-4">
        {/* Brand */}
        <Link
          className="navbar-brand fw-bold text-gradient d-flex align-items-center gap-2"
          to="/dashboard"
          style={{ fontSize: "1.25rem" }}
        >
          🎓 <span>School Equipment Portal</span>
        </Link>

        {/* Mobile toggle */}
        <button
          className="navbar-toggler border-0"
          type="button"
          aria-label="Toggle navigation"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* Menu items */}
        <div
          className={`collapse navbar-collapse justify-content-between ${
            menuOpen ? "show" : ""
          }`}
        >
          <ul className="navbar-nav">
            <li className="nav-item">
              <Link
                className="nav-link fw-semibold d-flex align-items-center gap-1"
                to="/dashboard"
              >
                🏠 <span>Dashboard</span>
              </Link>
            </li>

            <li className="nav-item">
              <Link
                className="nav-link fw-semibold d-flex align-items-center gap-1"
                to="/requests"
              >
                📋 <span>Requests</span>
              </Link>
            </li>

            {userRole?.toUpperCase() === "ADMIN" && (
              <li className="nav-item">
                <Link
                  className="nav-link fw-semibold d-flex align-items-center gap-1"
                  to="/admin"
                >
                  ⚙️ <span>Admin Panel</span>
                </Link>
              </li>
            )}
          </ul>

          {/* Right section */}
          <div className="d-flex align-items-center gap-3">
            {/* Theme toggle */}
            <button
              className="btn btn-outline-primary btn-sm rounded-pill px-3"
              onClick={toggleTheme}
              title={isDark ? "Switch to light mode" : "Switch to dark mode"}
            >
              {isDark ? "☀️ Light" : "🌙 Dark"}
            </button>

            {/* User info */}
            <span className="small fw-semibold">
              Hi, <span className="text-primary">{userName}</span>{" "}
              <span className="text-muted">
                ({userRole ? userRole.toUpperCase() : "GUEST"})
              </span>
            </span>

            {/* Logout */}
            <button
              className="btn btn-outline-danger btn-sm rounded-pill px-3"
              onClick={handleLogout}
            >
              🚪 Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
