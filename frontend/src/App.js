// src/App.js
import React from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Link,
  useNavigate
} from "react-router-dom";

import Login from "./components/pages/Login";
import Register from "./components/pages/Register";
import Dashboard from "./components/pages/Dashboard";

/* ---------- Auth helper ---------- */
function isLoggedIn() {
  try {
    const e = localStorage.getItem("escrow_user_email");
    return !!(e && e.length > 3);
  } catch {
    return false;
  }
}

/* ---------- Protected Route ---------- */
function ProtectedRoute({ children }) {
  if (!isLoggedIn()) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

/* ---------- Header ---------- */
function AppHeader() {
  const navigate = useNavigate();
  const email = localStorage.getItem("escrow_user_email") || "";

  function handleLogout() {
    localStorage.removeItem("escrow_user_email");
    localStorage.removeItem("escrow_user_profile");

    // disconnect socket safely
    try {
      const { getSocket } = require("./lib/socket");
      const s = getSocket();
      if (s) s.disconnect();
    } catch (e) {}

    navigate("/login", { replace: true });
  }

  return (
    <header
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: 12,
        background: "linear-gradient(90deg,#0f172a,#052f2f)",
        color: "#e6fff9",
      }}
    >
      <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
        <Link
          to="/dashboard"
          style={{ color: "white", textDecoration: "none", fontWeight: 800 }}
        >
          EscrowStack
        </Link>

        <Link
          to="/dashboard"
          style={{ color: "rgba(255,255,255,0.85)", textDecoration: "none" }}
        >
          Dashboard
        </Link>
      </div>

      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <div style={{ fontSize: 13 }}>{email}</div>
        <button
          onClick={handleLogout}
          style={{
            padding: "8px 10px",
            borderRadius: 8,
            border: "1px solid rgba(255,255,255,0.12)",
            background: "transparent",
            color: "#e6fff9",
            cursor: "pointer",
          }}
        >
          Logout
        </button>
      </div>
    </header>
  );
}

/* ---------- Protected Layout ---------- */
function ProtectedLayout({ children }) {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(180deg,#071033 0%, #071a2b 100%)",
        color: "#fff",
      }}
    >
      <AppHeader />
      <main style={{ padding: 18 }}>{children}</main>
    </div>
  );
}

/* ---------- App ---------- */
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Root */}
        <Route
          path="/"
          element={
            isLoggedIn()
              ? <Navigate to="/dashboard" replace />
              : <Navigate to="/login" replace />
          }
        />

        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected route */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <ProtectedLayout>
                <Dashboard />
              </ProtectedLayout>
            </ProtectedRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
