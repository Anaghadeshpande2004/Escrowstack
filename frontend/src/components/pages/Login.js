// src/components/pages/Login.js
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");   // NEW
  const [error, setError] = useState("");

  useEffect(() => {
    const styleId = "login-styles";
    if (document.getElementById(styleId)) return;
    const css = `
      .login-wrap{ min-height:100vh; display:flex; align-items:center; justify-content:center; background: linear-gradient(135deg,#0f172a,#0ea5a4); font-family: Arial, sans-serif; padding:28px;}
      .login-card{ width:100%; max-width:480px; background: rgba(255,255,255,0.03); border-radius:12px; padding:22px; color:#eafaf6; box-shadow: 0 8px 30px rgba(0,0,0,0.6); }
      .login-title{ font-size:20px; font-weight:700; margin-bottom:6px;}
      input{ width:100%; box-sizing: border-box;padding:10px 12px; border-radius:8px; border:1px solid rgba(255,255,255,0.06); background: rgba(255,255,255,0.02); color:#eafaf6; margin-bottom:10px;}
      .actions{ display:flex; gap:10px; margin-top:12px;}
      button.primary{ background: linear-gradient(90deg,#06b6d4,#7c3aed); padding:10px 12px; border:none; border-radius:8px; color:white; font-weight:700; cursor:pointer;}
      button.secondary{ background:transparent; border:1px solid rgba(255,255,255,0.08); color:#eafaf6; padding:10px 12px; border-radius:8px; cursor:pointer;}
      .error{ color:#ffb4b4; margin-top:10px; }
    `;
    const st = document.createElement("style");
    st.id = styleId;
    st.appendChild(document.createTextNode(css));
    document.head.appendChild(st);
  }, []);

  function validEmail(e) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
  }

  function handleSubmit(ev) {
    ev.preventDefault();
    setError("");

    if (!email) {
      setError("Please enter your email.");
      return;
    }
    if (!validEmail(email)) {
      setError("Please enter a valid email.");
      return;
    }
    if (!password) {
      setError("Please enter your password.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    const normalized = email.trim().toLowerCase();

    // Demo storage (NOT secure, only for assignment)
    localStorage.setItem("escrow_user_email", normalized);
    localStorage.setItem("escrow_user_password", password);

       navigate("/dashboard");  
  }

  function goToRegister() {
    navigate("/register");
  }

  return (
    <div className="login-wrap">
      <div className="login-card">
        <div className="login-title">EscrowStack — Login</div>
        <div style={{ marginBottom: 8 }}>
          Enter your credentials to continue.
        </div>

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          {/* NEW PASSWORD FIELD */}
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <div className="actions">
            <button type="submit" className="primary">Login</button>
            <button type="button" className="secondary" onClick={goToRegister}>
              Register
            </button>
          </div>

          {error && <div className="error">{error}</div>}
        </form>
      </div>
    </div>
  );
}
