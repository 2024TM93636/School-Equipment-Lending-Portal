import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../services/api";

const LoginPage = ({ setUser }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await loginUser({ email, password });
      const { user, token } = response.data;

      setUser(user);
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      setLoading(false);
      navigate("/dashboard");
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.error || "Login failed. Please try again.");
    }
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card p-4 shadow">
            <h2 className="card-title mb-4 text-center">Login</h2>
            {error && <div className="alert alert-danger">{error}</div>}
            <form onSubmit={handleLogin}>
              <div className="mb-3">
                <label className="form-label">Email:</label>
                <input
                  type="email"
                  className="form-control"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Password:</label>
                <input
                  type="password"
                  className="form-control"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary w-100"
                disabled={loading}
              >
                {loading && (
                  <span className="spinner-border spinner-border-sm me-2"></span>
                )}
                Login
              </button>
            </form>

            <div className="mt-3 text-center">
              <small>
                Don't have an account? <a href="/register">Register here</a>
              </small>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
