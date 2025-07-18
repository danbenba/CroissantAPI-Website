import React from "react";
import useAuth from "../hooks/useAuth";
import { useRouter } from "next/router";

export default function Login() {
  const { user, loading, token } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    if (!loading && user) {
      // router.back();
      location.href = "/transmitToken.html";
    }
  }, [user, loading, router]);

  const handleDiscord = () => {
    window.location.href = "/auth/discord";
  };

  const handleGoogle = () => {
    window.location.href = "/auth/google";
  };

  return (
    <div className="container" style={{
      maxWidth: 400,
      margin: "60px auto",
      background: "#23232a",
      borderRadius: 12,
      boxShadow: "0 2px 12px rgba(0,0,0,0.25)",
      padding: "32px 24px",
      color: "#fff",
      display: "flex",
      flexDirection: "column",
      alignItems: "center"
    }}>
      <h2 style={{ marginBottom: 32 }}>Login</h2>
      <button
        style={{
          width: "260px",
          height: "48px",
          background: "linear-gradient(90deg, #5865F2 60%, #404EED 100%)",
          color: "#fff",
          border: "none",
          borderRadius: "8px",
          fontSize: "16px",
          fontWeight: 600,
          cursor: "pointer",
          marginBottom: "18px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "12px"
        }}
        onClick={handleDiscord}
      >
        <span className="fab fa-discord" style={{ fontSize: "22px" }} aria-hidden="true" />
        Sign in with Discord
      </button>
      <button
        style={{
          width: "260px",
          height: "48px",
          background: "#fff",
          color: "#222",
          border: "1px solid #e0e0e0",
          borderRadius: "8px",
          fontSize: "16px",
          fontWeight: 600,
          cursor: "pointer",
          marginBottom: "8px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "12px"
        }}
        onClick={handleGoogle}
      >
        <span style={{ display: "flex", alignItems: "center" }}>
          <svg width="22" height="22" viewBox="0 0 48 48">
            <g>
              <path fill="#4285F4" d="M24 9.5c3.54 0 6.7 1.22 9.19 3.23l6.86-6.86C36.64 2.69 30.74 0 24 0 14.82 0 6.73 5.8 2.69 14.09l7.98 6.2C12.41 13.41 17.74 9.5 24 9.5z"/>
              <path fill="#34A853" d="M46.1 24.55c0-1.64-.15-3.22-.43-4.74H24v9.01h12.41c-.54 2.91-2.16 5.38-4.61 7.04l7.1 5.53C43.96 37.47 46.1 31.61 46.1 24.55z"/>
              <path fill="#FBBC05" d="M10.67 28.29a14.5 14.5 0 0 1 0-8.58l-7.98-6.2A23.97 23.97 0 0 0 0 24c0 3.77.9 7.34 2.69 10.49l7.98-6.2z"/>
              <path fill="#EA4335" d="M24 48c6.48 0 11.92-2.15 15.89-5.85l-7.1-5.53c-2 1.34-4.56 2.13-8.79 2.13-6.26 0-11.59-3.91-13.33-9.29l-7.98 6.2C6.73 42.2 14.82 48 24 48z"/>
            </g>
          </svg>
        </span>
        Sign in with Google
      </button>
      <div style={{ marginTop: 24, color: "#aaa", fontSize: 14 }}>
        You will be redirected automatically after login.
      </div>
    </div>
  );
}