import React, { useEffect, useState } from "react";

const ThemeToggle = () => {
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("theme") === "dark"
  );

  useEffect(() => {
    document.body.classList.toggle("dark-mode", darkMode);
    localStorage.setItem("theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  return (
    <div className="toggle-switch">
      <span className="small text-muted">
        {darkMode ? "🌙 Dark" : "☀️ Light"}
      </span>
      <div className="form-check form-switch m-0">
        <input
          type="checkbox"
          className="form-check-input"
          checked={darkMode}
          onChange={() => setDarkMode(!darkMode)}
        />
      </div>
    </div>
  );
};

export default ThemeToggle;
