import React, { useEffect, useState } from "react";
import useAuth from "../../hooks/useAuth";
import Link from "next/link";
import { useRouter } from "next/router";

// --- Styles extracted as constants for readability ---
const linkStyle: React.CSSProperties = {
  position: "absolute",
  top: 18,
  right: 18,
  fontSize: 13,
  color: "#aaa",
  opacity: 0.55,
  textDecoration: "underline dotted",
  zIndex: 10,
  transition: "opacity 0.2s",
};

const appCardButtonStyle: React.CSSProperties = {
  width: "100%",
  margin: 0,
  marginBottom: 8,
  background: "#333",
  color: "#fff",
  border: "none",
  borderRadius: 6,
  fontWeight: 500,
  padding: "16px 0",
  fontSize: "1.05rem",
};

const appCardButtonSecondaryStyle: React.CSSProperties = {
  ...appCardButtonStyle,
  background: "#222",
  border: "1px solid #444",
};

const appCardButtonDeleteStyle: React.CSSProperties = {
  ...appCardButtonSecondaryStyle,
  marginBottom: 0,
};

const clientSecretButtonStyle: React.CSSProperties = {
  background: "none",
  border: "none",
  color: "#fff",
  cursor: "pointer",
  fontSize: 13,
  textDecoration: "underline",
  opacity: 0.7,
};

const clientSecretValueStyle: React.CSSProperties = {
  background: "#444",
  borderRadius: 4,
  padding: "2px 6px",
  cursor: "pointer",
  userSelect: "none",
  fontWeight: 500,
  marginRight: 8,
};

export default function OAuth2Apps() {
  const [apps, setApps] = useState<any[]>([]);
  const [name, setName] = useState("");
  const [redirectUrls, setRedirectUrls] = useState("");
  const [iframeCode, setIframeCode] = useState<string | null>(null);
  const [editing, setEditing] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [spoilers, setSpoilers] = useState<{ [k: string]: boolean }>({});
  const { token } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!token) {
      router.push("/login");
      return;
    }

    fetch("/api/oauth2/apps", {
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then(setApps)
      .catch(() => setApps([]));
  }, [token]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editing) {
      // PATCH
      const res = await fetch(`/api/oauth2/app/${editing}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
        body: JSON.stringify({
          name,
          redirect_urls: redirectUrls.split(",").map((s) => s.trim()),
        }),
      });
      if (res.ok) {
        const updated = await res.json();
        setApps(
          apps.map((a) =>
            a.client_id === editing
              ? { ...a, name, redirect_urls: redirectUrls.split(",") }
              : a
          )
        );
        setEditing(null);
        setName("");
        setRedirectUrls("");
        setShowEditForm(false);
      }
    } else {
      // POST
      const res = await fetch("/api/oauth2/app", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
        body: JSON.stringify({
          name,
          redirect_urls: redirectUrls.split(",").map((s) => s.trim()),
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setApps([
          ...apps,
          {
            client_id: data.client_id,
            name,
            redirect_urls: redirectUrls.split(","),
          },
        ]);
        setName("");
        setRedirectUrls("");
        setShowForm(false);
      }
    }
  };

  const handleIframe = (client_id: string) => {
    const app = apps.find((a) => a.client_id === client_id);
    const redirect =
      app && Array.isArray(app.redirect_urls) && app.redirect_urls.length > 0
        ? app.redirect_urls[0]
        : "";
    setIframeCode(
      `<script src="https://croissant-api.fr/oauth2/script.js"></script>
<button 
  data-client_id="${client_id}"
  class="croissant-oauth2-btn">
  <img src="https://croissant-api.fr/assets/icons/favicon-32x32.png" alt="icon"/>
  Login with Croissant
</button>`
    );
  };

  const handleEdit = (app: any) => {
    setName(app.name);
    setRedirectUrls(
      Array.isArray(app.redirect_urls)
        ? app.redirect_urls.join(",")
        : app.redirect_urls
    );
    setEditing(app.client_id);
    setShowEditForm(true);
  };

  const handleCancelEdit = () => {
    setEditing(null);
    setName("");
    setRedirectUrls("");
    setShowEditForm(false);
    setShowForm(false);
  };

  const handleDelete = async (client_id: string) => {
    if (!window.confirm("Are you sure you want to delete this app?")) return;
    const res = await fetch(`/api/oauth2/app/${client_id}`, {
      method: "DELETE",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    if (res.ok) setApps(apps.filter((a) => a.client_id !== client_id));
    if (editing === client_id) handleCancelEdit();
  };

  // Helper to toggle spoilers

  // Helper to append launcher query if needed
  function isFromLauncher() {
    if (typeof window === "undefined") return "";
    return window.location.pathname.startsWith("/launcher") ||
      window.location.search.includes("from=launcher")
      ? "&from=launcher"
      : "";
  }

  // Helper to toggle spoilers
  function toggleSpoiler(client_id: string) {
    setSpoilers((s) => ({ ...s, [client_id]: !s[client_id] }));
  }

  return (
    <div className="container-oauth2" style={{ position: "relative" }}>
      <Link
        href={"/oauth2/test" + isFromLauncher()}
        style={linkStyle}
        onMouseOver={(e) => (e.currentTarget.style.opacity = "0.95")}
        onMouseOut={(e) => (e.currentTarget.style.opacity = "0.55")}
        tabIndex={-1}
      >
        Test OAuth2 ↗
      </Link>

      <h2 style={{ marginBottom: 18 }}>My OAuth2 Applications</h2>
      <button
        className="add-app-btn"
        onClick={() => {
          setShowForm(true);
          setEditing(null);
          setName("");
          setRedirectUrls("");
        }}
      >
        + Add Application
      </button>
      <div className="apps-grid">
        {apps &&
          apps.map((app) => (
            <div key={app.client_id} className="app-card">
              <div className="app-card-main">
                <div className="app-card-title">{app.name}</div>
                <div className="app-card-meta">
                  <span>Client ID:</span>{" "}
                  <code className="oauth2-code">{app.client_id}</code>
                </div>
                {app.client_secret && (
                  <div className="app-card-meta">
                    <span>Client Secret:</span>
                    <span style={{ marginLeft: 8 }}>
                      {spoilers[app.client_id] ? (
                        <span
                          style={clientSecretValueStyle}
                          onClick={() => toggleSpoiler(app.client_id)}
                        >
                          {app.client_secret}
                        </span>
                      ) : null}
                      <button
                        type="button"
                        style={clientSecretButtonStyle}
                        onClick={() => toggleSpoiler(app.client_id)}
                      >
                        {spoilers[app.client_id] ? "Hide" : "Show"}
                      </button>
                      <button
                        type="button"
                        style={{ ...clientSecretButtonStyle, marginLeft: 8 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          navigator.clipboard.writeText(app.client_secret);
                        }}
                      >
                        Copy
                      </button>
                    </span>
                  </div>
                )}
                <div className="app-card-redirects">
                  <span>Redirects:</span>{" "}
                  {Array.isArray(app.redirect_urls)
                    ? app.redirect_urls.join(", ")
                    : app.redirect_urls}
                </div>
              </div>
              <div className="app-card-actions" style={{ width: "100%" }}>
                <button
                  style={appCardButtonStyle}
                  onClick={() => handleIframe(app.client_id)}
                >
                  Integration code
                </button>
                <button
                  style={appCardButtonSecondaryStyle}
                  onClick={() => handleEdit(app)}
                >
                  Edit
                </button>
                <button
                  style={appCardButtonDeleteStyle}
                  onClick={() => handleDelete(app.client_id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
      </div>
      {/* Modal for Create App */}
      {showForm && !editing && (
        <div className="modal-overlay" onClick={handleCancelEdit}>
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{ position: "relative" }}
          >
            <button className="close-modal-btn" onClick={handleCancelEdit}>
              &times;
            </button>
            <h3>Create Application</h3>
            <form className="oauth2-form" onSubmit={handleCreate}>
              <div className="form-group">
                <label className="oauth2-label">App Name</label>
                <input
                  className="oauth2-input"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="My Game, My Website..."
                />
              </div>
              <div className="form-group">
                <label className="oauth2-label">
                  Redirect URLs{" "}
                  <span style={{ fontWeight: 400, opacity: 0.7 }}>
                    (comma-separated)
                  </span>
                </label>
                <input
                  className="oauth2-input"
                  type="text"
                  value={redirectUrls}
                  onChange={(e) => setRedirectUrls(e.target.value)}
                  required
                  placeholder="https://myapp.com/callback, http://localhost:3000/cb"
                />
              </div>
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <button type="submit" className="oauth2-button">
                  Create App
                </button>
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="oauth2-button"
                  style={{
                    background: "#222",
                    border: "1px solid #444",
                    color: "#fff",
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Modal for Edit App */}
      {showEditForm && editing && (
        <div className="modal-overlay" onClick={handleCancelEdit}>
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{ position: "relative" }}
          >
            <button className="close-modal-btn" onClick={handleCancelEdit}>
              &times;
            </button>
            <h3>Edit Application</h3>
            <form className="oauth2-form" onSubmit={handleCreate}>
              <div className="form-group">
                <label className="oauth2-label">App Name</label>
                <input
                  className="oauth2-input"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="My Game, My Website..."
                />
              </div>
              <div className="form-group">
                <label className="oauth2-label">
                  Redirect URLs{" "}
                  <span style={{ fontWeight: 400, opacity: 0.7 }}>
                    (comma-separated)
                  </span>
                </label>
                <input
                  className="oauth2-input"
                  type="text"
                  value={redirectUrls}
                  onChange={(e) => setRedirectUrls(e.target.value)}
                  required
                  placeholder="https://myapp.com/callback, http://localhost:3000/cb"
                />
              </div>
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <button type="submit" className="oauth2-button">
                  Update App
                </button>
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="oauth2-button"
                  style={{
                    background: "#222",
                    border: "1px solid #444",
                    color: "#fff",
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Modal for Integration Code */}
      {iframeCode && (
        <div className="modal-overlay" onClick={() => setIframeCode(null)}>
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{ position: "relative" }}
          >
            <button
              className="close-modal-btn"
              onClick={() => setIframeCode(null)}
            >
              &times;
            </button>
            <h4>Integration button code:</h4>
            <pre className="oauth2-pre">{iframeCode}</pre>
          </div>
        </div>
      )}
    </div>
  );
}
