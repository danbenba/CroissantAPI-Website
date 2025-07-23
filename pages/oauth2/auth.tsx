import React, { useEffect, useState } from "react";
import useAuth from "../../hooks/useAuth";

// --- Style constants ---
const popupContainerStyle: React.CSSProperties = {
  //   minWidth: 340,
  minHeight: 180,
  margin: "0 auto",
  marginTop: 0,
  background: "linear-gradient(135deg, #232323 80%, #2d2d2d 100%)",
  borderRadius: 18,
  boxShadow: "0 8px 40px rgba(0,0,0,0.25)",
  padding: "36px 28px 28px 28px",
  color: "#fff",
  fontFamily: "'Segoe UI', Arial, sans-serif",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "flex-start",
  position: "relative",
  maxWidth: "98vw",
  overflow: "hidden",
};
const appInfoStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 18,
  marginBottom: 22,
  width: "100%",
  justifyContent: "center",
  overflow: "hidden",
};
const appAvatarStyle: React.CSSProperties = {
  width: 56,
  height: 56,
  borderRadius: 16,
  background: "#333",
  objectFit: "cover" as const,
  boxShadow: "0 2px 8px rgba(0,0,0,0.18)",
};
const appDescStyle: React.CSSProperties = {
  fontSize: "0.98rem",
  color: "#bdbdbd",
  marginBottom: 0,
};
const errorMsgStyle: React.CSSProperties = {
  color: "#fff",
  background: "#b91c1c",
  borderRadius: 8,
  padding: "10px 14px",
  marginTop: 18,
  fontSize: "1.01rem",
  textAlign: "center" as const,
  width: "100%",
  boxSizing: "border-box" as const,
};
const btnBottomStyle: React.CSSProperties = {
  position: "absolute" as const,
  left: 0,
  right: 0,
  bottom: 48,
  padding: "0 12px",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  zIndex: 2,
};
const oauthBtnStyle: React.CSSProperties = {
  width: "100%",
  background: "linear-gradient(90deg, #3b82f6 60%, #2563eb 100%)",
  color: "#fff",
  border: "none",
  borderRadius: 10,
  padding: "14px 0",
  fontSize: "1.08rem",
  fontWeight: 700,
  cursor: "pointer",
  marginBottom: 12,
  marginTop: 8,
  boxShadow: "0 2px 8px rgba(59,130,246,0.08)",
  transition: "background 0.18s, box-shadow 0.18s",
};
const oauthBtnDisabledStyle: React.CSSProperties = {
  ...oauthBtnStyle,
  background: "#444",
  cursor: "not-allowed",
  boxShadow: "none",
};
const oauthBtnLoginStyle: React.CSSProperties = {
  ...oauthBtnStyle,
  background: "#444",
  color: "#fff",
  fontWeight: 600,
};
const redirectInfoBottomStyle: React.CSSProperties = {
  position: "absolute" as const,
  bottom: 16,
  left: 0,
  width: "100%",
  textAlign: "center" as const,
  fontSize: "0.82rem",
  color: "#888",
  opacity: 0.85,
  padding: "0 12px",
  wordBreak: "break-all" as const,
  pointerEvents: "none" as const,
  userSelect: "text" as const,
  zIndex: 1,
};

export default function OAuth2Auth() {
  const [params, setParams] = useState<{
    client_id?: string;
    redirect_uri?: string;
  }>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userFromApp, setUserFromApp] = useState<any | null>(null);
  const { user, loading: authLoading, token } = useAuth();

  useEffect(() => {
    const search = new URLSearchParams(window.location.search);
    setParams({
      client_id: search.get("client_id") || undefined,
      redirect_uri: search.get("redirect_uri") || undefined,
    });
    if (search.get("client_id")) {
      fetch("/api/oauth2/app/" + search.get("client_id"))
        .then((res) => {
          if (res.ok) return res.json();
          throw new Error("Failed to fetch application info.");
        })
        .then((data) => {
          setUserFromApp(data);
        })
        .catch((err) => {
          setError(err.message);
        });
    }
  }, [token]);

  const handleLogin = () => {
    window.location.href = `/login?redirect=${encodeURIComponent(
      window.location.pathname + window.location.search
    )}`;
  };

  const handleAuth = async () => {
    setLoading(true);
    setError(null);
    try {
      const url = `/api/oauth2/authorize?client_id=${encodeURIComponent(
        params.client_id!
      )}&redirect_uri=${encodeURIComponent(params.redirect_uri!)}`;
      const res = await fetch(url, {
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.message || "Authorization error.");
        setLoading(false);
        return;
      }
      const data = await res.json();
      window.location.href = `${params.redirect_uri}?code=${encodeURIComponent(
        data.code
      )}`;
    } catch (e) {
      setError("Network error.");
      setLoading(false);
    }
  };

  // Toujours afficher le squelette, même si params manquants
  const missingParams = !params.client_id || !params.redirect_uri;

  return (
    <div style={popupContainerStyle}>
      <div style={appInfoStyle}>
        <img
          src={"/assets/icons/favicon-96x96.png"}
          alt="App avatar"
          style={appAvatarStyle}
        />
        <div>
          <div style={appDescStyle}>
            Do you want to authorize{" "}
            <b style={{ color: "white" }}>
              {userFromApp?.name || "Unknown application"}
            </b>{" "}
            to access your user data?
          </div>
        </div>
      </div>
      {(error || missingParams) && (
        <div style={errorMsgStyle}>
          {missingParams ? "Missing parameters." : error}
        </div>
      )}
      {/* Bouton déplacé en bas */}
      <div style={btnBottomStyle}>
        {!authLoading && !user && !missingParams && (
          <button style={oauthBtnLoginStyle} onClick={handleLogin}>
            Log in
          </button>
        )}
        {!authLoading && user && !missingParams && (
          <button
            style={loading ? oauthBtnDisabledStyle : oauthBtnStyle}
            onClick={handleAuth}
            disabled={loading}
          >
            {loading ? "Authorizing..." : "Authorize"}
          </button>
        )}
      </div>
      <div style={redirectInfoBottomStyle}>
        Redirect URI:{" "}
        {params.redirect_uri || <span style={{ color: "#b91c1c" }}>N/A</span>}
      </div>
    </div>
  );
}

export async function getServerSideProps() {
  return {
    props: {
      isOauth2Auth: true,
    },
  };
}
