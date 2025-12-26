import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import api from "../../services/api";

function LoginForm({ onSwitch }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!username || !password) {
      setMessage("Please enter username and password");
      return;
    }

    try {
      const response = await api.post("/auth/login", {
        username,
        password
      });

      login(response.data);
      setMessage("Login successful! Redirecting...");
      
      // Redirect to dashboard after successful login
      setTimeout(() => {
        navigate("/dashboard");
      }, 1000);

    } catch (error) {
      setMessage(
        error.response?.data?.message || "Login failed"
      );
    }
  };

  return (
    <div className="form-wrapper">
      <h2 className="neon-title">LOGIN</h2>
      
      <form onSubmit={handleLogin} className="auth-form">
        <div className="input-group">
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="neon-input"
          />
          <div className="input-glow"></div>
        </div>

        <div className="input-group">
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="neon-input"
          />
          <div className="input-glow"></div>
        </div>

        <button type="submit" className="neon-button login-btn">
          LOGIN
        </button>
      </form>

      {message && <p className={`message ${message.includes('successful') ? 'success' : 'error'}`}>{message}</p>}
      
      <p className="switch-text">
        Not registered?{" "}
        <button onClick={onSwitch} className="switch-link">
          Create an account
        </button>
      </p>
    </div>
  );
}

export default LoginForm;