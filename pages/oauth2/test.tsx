import React, { useState, useEffect } from "react";
import useIsMobile from "../../hooks/useIsMobile";

const OAUTH2_SERVER_URL = "/downloadables/oauth2-test-server.js";
const OAUTH2_RESULT_IMG = "/assets/oauth2_result.avif";

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
const containerMobileStyle: React.CSSProperties = {
  ...containerStyle,
  maxWidth: 420,
  margin: "18px auto",
  borderRadius: 10,
  padding: "18px 18px",
  fontSize: "0.98em",
};
const titleStyle: React.CSSProperties = {
  color: "#3a8fdc",
  fontSize: "2.5rem",
  marginBottom: 8,
};
const titleMobileStyle: React.CSSProperties = {
  ...titleStyle,
  fontSize: "1.5rem",
  marginBottom: 6,
};
const descStyle: React.CSSProperties = {
  fontSize: "1.15rem",
  color: "#ccc",
};
const descMobileStyle: React.CSSProperties = {
  ...descStyle,
  fontSize: "1em",
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
const downloadLinkMobileStyle: React.CSSProperties = {
  ...downloadLinkStyle,
  width: "100%",
  textAlign: "center",
  padding: "0.7em 0.5em",
  fontSize: "1em",
};
const demoTitleStyle: React.CSSProperties = {
  color: "#fff",
  fontSize: "1.5rem",
  marginTop: 32,
};
const demoTitleMobileStyle: React.CSSProperties = {
  ...demoTitleStyle,
  fontSize: "1.1rem",
  marginTop: 18,
};
const demoDescStyle: React.CSSProperties = {
  color: "#aaa",
};
const demoDescMobileStyle: React.CSSProperties = {
  ...demoDescStyle,
  fontSize: "0.97em",
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
const oauthBtnMobileStyle: React.CSSProperties = {
  ...oauthBtnStyle,
  width: "100%",
  padding: "10px 0",
  fontSize: "1em",
  borderRadius: "7px",
  justifyContent: "center",
  marginBottom: 16,
};
const oauthBtnImgStyle: React.CSSProperties = {
  width: 24,
  height: 24,
  verticalAlign: "middle",
  display: "inline-block",
};
const oauthBtnImgMobileStyle: React.CSSProperties = {
  ...oauthBtnImgStyle,
  width: 20,
  height: 20,
};
const oauthBtnSpanStyle: React.CSSProperties = {
  verticalAlign: "middle",
};
const resultTitleStyle: React.CSSProperties = {
  color: "#fff",
  fontSize: "1.5rem",
  marginTop: 32,
};
const resultTitleMobileStyle: React.CSSProperties = {
  ...resultTitleStyle,
  fontSize: "1.08rem",
  marginTop: 18,
};
const resultImgStyle: React.CSSProperties = {
  maxWidth: "100%",
  borderRadius: 12,
  boxShadow: "0 2px 12px rgba(58,143,220,0.08)",
  textAlign: "left"
};

function OAuth2DemoDesktop() {
  const [serverCode, setServerCode] = useState<string>("");

  useEffect(() => {
    fetch(OAUTH2_SERVER_URL)
      .then((r) => r.text())
      .then(setServerCode);
  }, []);

  return (
    <div style={containerStyle}>
      <h1 style={titleStyle}>Croissant OAuth2 Integration Example</h1>

      <h2 style={demoTitleStyle}>OAuth2 Demo</h2>
      <p style={demoDescStyle}>
        Open the console to see the OAuth2 flow in action. This example
        demonstrates how to authenticate users with Croissant's OAuth2 service.
        Just click the button below to start authentication:
      </p>
      {/* Croissant OAuth2 Button via external script */}
      <button
        data-client_id="2b90be46-3fdb-45f1-98bd-081b70cc3d9f"
        className="croissant-oauth2-btn"
        style={oauthBtnStyle}
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
                    const user = {...data, code};
                    console.log("User data:", user);
                    const callback = oauthBtn.getAttribute("data-callback");
                    if (callback) {
                      window[callback](user);
                    }
                  });
              }
            } catch (e) {
              // ignore
            }
          }

          lookForCode();
        }}
      >
        <img
          src="https://croissant-api.fr/assets/icons/favicon-32x32.avif"
          alt="icon"
          style={oauthBtnImgStyle}
        />
        <span style={oauthBtnSpanStyle}>Connect with Croissant</span>
      </button>

      <h2 style={resultTitleStyle}>Expected result</h2>
      <p>
        After clicking the button, a popup will open for authentication. Once
        you log in, the popup will close and the user data will be logged in the
        console.
      </p>
      <img
        src={OAUTH2_RESULT_IMG}
        alt="Expected result of OAuth2 authentication"
        style={resultImgStyle}
      /><br /><br/>

      <a
        href="/downloadables/oauth2-test.html"
        style={downloadLinkStyle}
        download
        target="_blank"
        rel="noopener noreferrer"
      >
        Download OAuth2 Test HTML to study the code
      </a>
    </div>
  );
}

function OAuth2DemoMobile() {
  const [serverCode, setServerCode] = useState<string>("");

  useEffect(() => {
    fetch(OAUTH2_SERVER_URL)
      .then((r) => r.text())
      .then(setServerCode);
  }, []);

  return (
    <div style={containerMobileStyle}>
      <h1 style={titleMobileStyle}>Croissant OAuth2 Example</h1>

      <h2 style={demoTitleMobileStyle}>OAuth2 Demo</h2>
      <p style={demoDescMobileStyle}>
        Open the console to see the OAuth2 flow in action. This example
        demonstrates how to authenticate users with Croissant's OAuth2 service.
        Just click the button below to start authentication:
      </p>
      <button
        data-client_id="2b90be46-3fdb-45f1-98bd-081b70cc3d9f"
        className="croissant-oauth2-btn"
        style={oauthBtnMobileStyle}
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
                    const user = {...data, code};
                    alert("User data:" + JSON.stringify(user, null, 2));
                    const callback = oauthBtn.getAttribute("data-callback");
                    if (callback) {
                      window[callback](user);
                    }
                  });
              }
            } catch (e) {
              // ignore
            }
          }

          lookForCode();
        }}
      >
        <img
          src="https://croissant-api.fr/assets/icons/favicon-32x32.avif"
          alt="icon"
          style={oauthBtnImgMobileStyle}
        />
        <span style={oauthBtnSpanStyle}>Connect with Croissant</span>
      </button>

      <h2 style={resultTitleMobileStyle}>Expected result</h2>
      <p style={{ fontSize: "0.97em" }}>
        After clicking the button, a popup will open for authentication. Once
        you log in, the popup will close and the user data will be logged in the
        console.
      </p>
      <img
        src={OAUTH2_RESULT_IMG}
        alt="Expected result of OAuth2 authentication"
        style={resultImgStyle}
      /><br /><br/>
    </div>
  );
}

export default function OAuth2Demo() {
  const isMobile = useIsMobile();
  return isMobile ? <OAuth2DemoMobile /> : <OAuth2DemoDesktop />;
}
