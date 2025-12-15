// src/components/pages/Register.js
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState(""); // NEW
  const [err, setErr] = useState("");

  useEffect(() => {
    const styleId = "reg-styles";
    if (document.getElementById(styleId)) return;
    const css = `
      .reg-wrap{ min-height:100vh; display:flex; align-items:center; justify-content:center; background: linear-gradient(135deg,#071033,#0b7a5f); font-family: Arial, sans-serif; padding:28px;}
      .reg-card{ width:100%; max-width:380px; background: rgba(255,255,255,0.03); border-radius:12px; padding:22px; color:#eafaf6; box-shadow:0 8px 30px rgba(0,0,0,0.6); }
      .reg-row{ display:flex; flex-direction:column; gap:6px; margin-bottom:10px;}
      input{
        width:100%;
        box-sizing:border-box;   /* IMPORTANT */
        padding:10px 12px;
        border-radius:8px;
        border:1px solid rgba(255,255,255,0.06);
        background:rgba(255,255,255,0.02);
        color:#eafaf6;
      }
      .actions{ display:flex; gap:10px; margin-top:8px;}
      button.primary{ background: linear-gradient(90deg,#ff7a59,#ffca3a); padding:10px 12px; border:none; border-radius:8px; font-weight:700; color:#071033; cursor:pointer;}
      button.secondary{ padding:10px 12px; border-radius:8px; border:1px solid rgba(255,255,255,0.06); background:transparent; color:#eafaf6; cursor:pointer;}
      .err{ color:#ffb4b4; margin-top:8px;}
    `;
    const st = document.createElement("style");
    st.id = styleId;
    st.appendChild(document.createTextNode(css));
    document.head.appendChild(st);
  }, []);

  function validEmail(e) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
  }

  function handleRegister(ev) {
    ev.preventDefault();
    setErr("");

    if (!name.trim()) { setErr("Please enter your name."); return; }
    if (!email.trim()) { setErr("Please enter your email."); return; }
    if (!validEmail(email)) { setErr("Enter a valid email."); return; }
    if (!password) { setErr("Please enter a password."); return; }
    if (password.length < 6) { setErr("Password must be at least 6 characters."); return; }

    const user = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password, // demo only
      createdAt: new Date().toISOString()
    };

    localStorage.setItem("escrow_user_profile", JSON.stringify(user));
    localStorage.setItem("escrow_user_email", user.email);

    window.location.href = "/dashboard";
  }

  function goToLogin() {
   navigate("/login");
  }

  return (
    <div className="reg-wrap">
      <div className="reg-card">
        <h2 style={{ marginTop: 0 }}>Create demo account</h2>

        <form onSubmit={handleRegister}>
          <div className="reg-row">
            <label>Full name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Jane Doe"
            />
          </div>

          <div className="reg-row">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </div>

          {/* PASSWORD FIELD */}
          <div className="reg-row">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimum 6 characters"
            />
          </div>

          <div className="actions">
            <button className="primary" type="submit">Create account</button>
            <button className="secondary" type="button" onClick={goToLogin}>
              Back to login
            </button>
          </div>

          {err && <div className="err">{err}</div>}
        </form>
      </div>
    </div>
  );
}
