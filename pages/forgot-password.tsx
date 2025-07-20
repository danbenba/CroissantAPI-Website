import React from "react";
import { useRouter } from "next/router";

// Style constants (reuse from your register page for consistency)
const containerStyle: React.CSSProperties = {
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
};

const titleStyle: React.CSSProperties = {
  marginBottom: 32
};

const infoTextStyle: React.CSSProperties = {
  marginTop: 24,
  color: "#aaa",
  fontSize: 14
};

export default function ForgotPassword() {
  const router = useRouter();
  const [email, setEmail] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);
    try {
      const res = await fetch("/api/users/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to send reset email");
      setSuccess("Password reset email sent.");
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={containerStyle}>
      <h2 style={titleStyle}>Forgot Password</h2>
      <form style={{ width: "100%", maxWidth: 340 }} onSubmit={handleSubmit}>
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontWeight: 600, marginBottom: 6, display: "block" }}>Email</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            style={{
              width: "100%",
              padding: "10px 12px",
              borderRadius: 6,
              border: "1px solid #444",
              background: "#18181c",
              color: "#fff",
              fontSize: 16
            }}
            autoComplete="email"
            required
          />
        </div>
        <button
          type="submit"
          style={{
            width: "100%",
            padding: "12px",
            background: "#5865F2",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            fontSize: 16,
            fontWeight: 600,
            cursor: "pointer",
            marginTop: 8
          }}
          disabled={loading}
        >
          {loading ? "Sending..." : "Send Reset Link"}
        </button>
        {error && <div style={{ color: "#ff5252", marginTop: 12 }}>{error}</div>}
        {success && <div style={{ color: "#4caf50", marginTop: 12 }}>{success}</div>}
      </form>
      <div style={infoTextStyle}>
        Enter your email address and we'll send you a link to reset your password.
      </div>
    </div>
  );
}
