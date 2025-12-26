import { useState } from "react";
import api from "../../services/api";

function RegisterForm({ onSwitch }) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!username || !email || !password) {
      setMessage("Please fill all fields");
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setMessage("Please enter a valid email address");
      return;
    }

    try {
      await api.post("/auth/register", {
        username,
        email,
        password
      });

      setMessage("Registration successful! You can now login.");
      setTimeout(() => {
        onSwitch();
      }, 2000);

    } catch (error) {
      setMessage(
        error.response?.data?.message || "Registration failed"
      );
    }
  };

  return (
    <div className="form-wrapper">
      <h2 className="neon-title">REGISTER</h2>
      
      <form onSubmit={handleRegister} className="auth-form">
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
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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

        <button type="submit" className="neon-button register-btn">
          REGISTER
        </button>
      </form>

      {message && <p className={`message ${message.includes('successful') ? 'success' : 'error'}`}>{message}</p>}
      
      <p className="switch-text">
        Already have an account?{" "}
        <button onClick={onSwitch} className="switch-link">
          Login here
        </button>
      </p>
    </div>
  );
}

export default RegisterForm;