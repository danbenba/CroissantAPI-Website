import React, { useState, useEffect } from "react";

const OAUTH2_SERVER_URL = "/downloadables/oauth2-test-server.js";
const OAUTH2_RESULT_IMG = "/assets/oauth2_result.png";

// --- Style constants ---
const containerStyle: React.CSSProperties = {
  maxWidth: 900,
  margin: "40px auto",
  background: "#222",
  borderRadius: 18,
  boxShadow: "0 6px 32px rgba(0,0,0,0.45)",
  padding: "40px 32px 32px 32px",
  fontFamily: "Montserrat, Arial, sans-serif",
  color: "#fff",
};
const titleStyle: React.CSSProperties = {
  color: "#3a8fdc",
  fontSize: "2.5rem",
  marginBottom: 8,
};
const descStyle: React.CSSProperties = {
  fontSize: "1.15rem",
  color: "#ccc",
};
const downloadLinkStyle: React.CSSProperties = {
  display: "inline-block",
  margin: "1em 0 2em 0",
  padding: "0.7em 1.5em",
  background: "#3a8fdc",
  color: "#fff",
  borderRadius: 8,
  textDecoration: "none",
  fontWeight: 700,
  transition: "background 0.2s",
  border: "1px solid #222",
  boxShadow: "0 2px 8px rgba(58,143,220,0.08)",
};
const demoTitleStyle: React.CSSProperties = {
  color: "#fff",
  fontSize: "1.5rem",
  marginTop: 32,
};
const demoDescStyle: React.CSSProperties = {
  color: "#aaa",
};
const oauthBtnStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: "8px",
  padding: "10px 22px",
  fontSize: "1.1rem",
  borderRadius: "8px",
  border: "none",
  background: "#333",
  color: "#fff",
  cursor: "pointer",
  fontWeight: 600,
  marginBottom: 24,
  boxShadow: "0 2px 8px rgba(0,0,0,0.18)",
  transition: "background 0.2s",
};
const oauthBtnImgStyle: React.CSSProperties = {
  width: 24,
  height: 24,
  verticalAlign: "middle",
  display: "inline-block",
};
const oauthBtnSpanStyle: React.CSSProperties = {
  verticalAlign: "middle",
};
const resultTitleStyle: React.CSSProperties = {
  color: "#fff",
  fontSize: "1.5rem",
  marginTop: 32,
};
const resultImgStyle: React.CSSProperties = {
  display: "block",
  margin: "32px auto 0 auto",
  maxWidth: "100%",
  borderRadius: 12,
  boxShadow: "0 2px 12px rgba(58,143,220,0.08)",
};

export default function OAuth2Demo() {
  const [serverCode, setServerCode] = useState<string>("");

  useEffect(() => {
    fetch(OAUTH2_SERVER_URL)
      .then((r) => r.text())
      .then(setServerCode);
  }, []);

  return (
    <div style={containerStyle}>
      <h1 style={titleStyle}>Croissant OAuth2 Integration Example</h1>
      <p style={descStyle}>
        Here is a minimal Node.js server example to test OAuth2 authentication
        with the Croissant API.
        <br />
        Download the script, run it, then follow the authentication flow to get
        user information.
      </p>
      <a
        href={OAUTH2_SERVER_URL}
        download
        style={downloadLinkStyle}
        onMouseOver={(e) => (e.currentTarget.style.background = "#2563eb")}
        onMouseOut={(e) => (e.currentTarget.style.background = "#3a8fdc")}
      >
        📥 Download the example Node.js server
      </a>

      <h2 style={demoTitleStyle}>OAuth2 Demo</h2>
      <p style={demoDescStyle}>
        1. Start the downloaded Node.js server.
        <br />
        2. Click the button below to start authentication:
      </p>
      {/* Croissant OAuth2 Button via external script */}
      <button
        data-client_id="2b90be46-3fdb-45f1-98bd-081b70cc3d9f"
        className="croissant-oauth2-btn"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "8px",
          padding: "8px 16px",
          fontSize: "1rem",
          borderRadius: "6px",
          border: "none",
          background: "#333",
          color: "#fff",
          cursor: "pointer",
        }}
        onClick={(e) => {
          const clientId = e.currentTarget.getAttribute("data-client_id");
          const redirectUri = location.origin;
          let page = window.open(
            `/oauth2/auth?client_id=${clientId}&redirect_uri=${redirectUri}`,
            "_oauth2",
            "width=600,height=600"
          );

          function lookForCode() {
            requestAnimationFrame(lookForCode);
            if (!page || page.closed) return;
            try {
              const code = new URL(page.location.href).searchParams.get("code");
              if (code) {
                page.close();
                const oauthBtn = document.querySelector(
                  ".croissant-oauth2-btn"
                );
                const clientId = oauthBtn.getAttribute("data-client_id");
                fetch(`/api/oauth2/user?code=${code}&client_id=${clientId}`)
                  .then((response) => response.json())
                  .then((data) => {
                    if (data.error) {
                      console.error("Error fetching user by code:", data.error);
                      return;
                    }
                    // console.log("User data received:", data);
                    const user = data;
                    console.log("User data:", user);
                    const callback = oauthBtn.getAttribute("data-callback");
                    if (callback) {
                      window[callback](user);
                    }
                  });
              }
            } catch (e) {
              // console.error("Error checking for OAuth2 code:", e);
            }
          }

          lookForCode();
        }}
      >
        <img
          src="https://croissant-api.fr/assets/icons/favicon-32x32.png"
          alt="icon"
          style={oauthBtnImgStyle}
        />
        Connect with Croissant
      </button>

      {/* Manual OAuth2 Button */}
      {/* <button
      style={oauthBtnStyle}
      onMouseOver={(e) => (e.currentTarget.style.background = "#444")}
      onMouseOut={(e) => (e.currentTarget.style.background = "#333")}
      onClick={() => {
        window.open(
        window.location.origin +
          "/oauth2/auth?client_id=2b90be46-3fdb-45f1-98bd-081b70cc3d9f&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fcroissant-oauth",
        "_blank",
        "width=428,height=320"
        );
      }}
      >
      <img src="/assets/icons/favicon-32x32.png" alt="icon" style={oauthBtnImgStyle} />
      <span style={oauthBtnSpanStyle}>Connect with OAuth2</span>
      </button> */}

      <h2 style={resultTitleStyle}>Expected result</h2>
      <img
        src={OAUTH2_RESULT_IMG}
        alt="Expected result of OAuth2 authentication"
        style={resultImgStyle}
      />
    </div>
  );
}
