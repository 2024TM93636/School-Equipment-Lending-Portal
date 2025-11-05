import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { logoutUser } from "../services/api";
import "../custom-dashboard.css";

const Navbar = ({ userRole, userName, setUser }) => {
  const navigate = useNavigate();
  const [isDark, setIsDark] = useState(
    localStorage.getItem("theme") === "dark"
  );
  const [menuOpen, setMenuOpen] = useState(false);

  // 🌙 Toggle Dark / Light mode
  const toggleTheme = () => {
    const newTheme = isDark ? "light" : "dark";
    setIsDark(!isDark);
    document.body.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);
  };

  // Restore theme on load
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "light";
    document.body.setAttribute("data-theme", savedTheme);
    setIsDark(savedTheme === "dark");
  }, []);

  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch {
      console.warn("Logout failed on server (ignored).");
    }
    setUser(null);
    sessionStorage.clear();
    navigate("/");
  };

  return (
    <nav className="navbar navbar-expand-lg shadow-sm sticky-top">
      <div className="container-fluid">
        {/* Brand */}
        <Link className="navbar-brand fw-bold text-gradient" to="/dashboard">
          🎓 School Lending
        </Link>

        {/* Hamburger for mobile */}
        <button
          className="navbar-toggler"
          type="button"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* Nav links */}
        <div
          className={`collapse navbar-collapse ${menuOpen ? "show" : ""}`}
          id="navbarNav"
        >
          <ul className="navbar-nav me-auto">
            <li className="nav-item">
              <Link className="nav-link" to="/dashboard">
                Dashboard
              </Link>
            </li>

            <li className="nav-item">
              <Link className="nav-link" to="/requests">
                Requests
              </Link>
            </li>

            {userRole?.toUpperCase() === "ADMIN" && (
              <li className="nav-item">
                <Link className="nav-link" to="/admin">
                  Admin Panel
                </Link>
              </li>
            )}
          </ul>

          {/* Right section */}
          <div className="d-flex align-items-center gap-3">
            {/* Theme toggle */}
            <button
              className="btn btn-outline-primary btn-sm rounded-pill"
              onClick={toggleTheme}
              title="Toggle dark mode"
            >
              {isDark ? "☀️" : "🌙"}
            </button>

            {/* User info */}
            <span className="text-muted small fw-semibold">
              Hi, {userName}{" "}
              <span className="text-primary">({userRole})</span>
            </span>

            {/* Logout */}
            <button
              className="btn btn-outline-danger btn-sm rounded-pill"
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
