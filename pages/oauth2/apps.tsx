import React, { useEffect, useState } from "react";
import useAuth from "../../hooks/useAuth";
import Link from "next/link";
import { useRouter } from "next/router";
import useIsMobile from "../../hooks/useIsMobile";

// --- Styles ---
const linkStyle: React.CSSProperties = {
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

// --- Logic hook ---
function useOAuth2AppsLogic() {
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
      headers: { "Content-Type": "application/json" },
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
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name,
          redirect_urls: redirectUrls.split(",").map((s) => s.trim()),
        }),
      });
      if (res.ok) {
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
        headers: { "Content-Type": "application/json" },
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
    setIframeCode(
      `<script src="https://croissant-api.fr/oauth2/script.js"></script>
<button 
  data-client_id="${client_id}"
  data-callback="function(user) { console.log('User data:', user); }"
  class="croissant-oauth2-btn">
  <img
    src="https://croissant-api.fr/assets/icons/favicon-32x32.png"
    alt="icon"
  />
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
      headers: { "Content-Type": "application/json" },
    });
    if (res.ok) setApps(apps.filter((a) => a.client_id !== client_id));
    if (editing === client_id) handleCancelEdit();
  };

  function isFromLauncher() {
    if (typeof window === "undefined") return "";
    return window.location.pathname.startsWith("/launcher") ||
      window.location.search.includes("from=launcher")
      ? "&from=launcher"
      : "";
  }

  function toggleSpoiler(client_id: string) {
    setSpoilers((s) => ({ ...s, [client_id]: !s[client_id] }));
  }

  return {
    apps,
    name,
    setName,
    redirectUrls,
    setRedirectUrls,
    iframeCode,
    setIframeCode,
    editing,
    setEditing,
    showForm,
    setShowForm,
    showEditForm,
    setShowEditForm,
    spoilers,
    setSpoilers,
    handleCreate,
    handleIframe,
    handleEdit,
    handleCancelEdit,
    handleDelete,
    isFromLauncher,
    toggleSpoiler,
  };
}

// --- Desktop version ---
function OAuth2AppsDesktop(props: ReturnType<typeof useOAuth2AppsLogic>) {
  const {
    apps, name, setName, redirectUrls, setRedirectUrls, iframeCode, setIframeCode,
    editing, showForm, setShowForm, showEditForm, handleCreate, handleIframe,
    handleEdit, handleCancelEdit, handleDelete, isFromLauncher, spoilers, toggleSpoiler,
    setEditing
  } = props;

  return (
    <div className="container-oauth2" style={{ position: "relative", maxWidth: 900, margin: "0 auto" }}>
      <div style={{
        display: "flex", flexDirection: "row", justifyContent: "space-between", alignItems: "center"
      }}>
        <h2 style={{ marginBottom: 18 }}>My OAuth2 Applications</h2>
        <div style={{ display: "flex", gap: 16, flexDirection: "row" }}>
          <Link
            href={"/oauth2/test" + isFromLauncher()}
            style={linkStyle}
            tabIndex={-1}
          >
            Test OAuth2 ↗
          </Link>
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
        </div>
      </div>
      <div className="apps-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24 }}>
        {apps &&
          apps.map((app) => (
            <div key={app.client_id} className="app-card">
              <div className="app-card-main">
                <div className="app-card-title">{app.name}</div>
                <div className="app-card-meta">
                  <span>Client ID:</span>{" "}
                  <code
                    className="oauth2-code"
                    style={{ userSelect: "all", cursor: "pointer" }}
                    tabIndex={0}
                    onClick={() => navigator.clipboard.writeText(app.client_id)}
                    title="Click to copy"
                  >
                    {app.client_id}
                  </code>
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
      {/* Modals */}
      {showForm && !editing && (
        <OAuth2AppModal
          title="Create Application"
          name={name}
          setName={setName}
          redirectUrls={redirectUrls}
          setRedirectUrls={setRedirectUrls}
          onSubmit={handleCreate}
          onCancel={handleCancelEdit}
          submitLabel="Create App"
        />
      )}
      {showEditForm && editing && (
        <OAuth2AppModal
          title="Edit Application"
          name={name}
          setName={setName}
          redirectUrls={redirectUrls}
          setRedirectUrls={setRedirectUrls}
          onSubmit={handleCreate}
          onCancel={handleCancelEdit}
          submitLabel="Update App"
        />
      )}
      {iframeCode && (
        <OAuth2CodeModal code={iframeCode} onClose={() => setIframeCode(null)} />
      )}
    </div>
  );
}

// --- Mobile version ---
function OAuth2AppsMobile(props: ReturnType<typeof useOAuth2AppsLogic>) {
  const {
    apps, name, setName, redirectUrls, setRedirectUrls, iframeCode, setIframeCode,
    editing, showForm, setShowForm, showEditForm, handleCreate, handleIframe,
    handleEdit, handleCancelEdit, handleDelete, isFromLauncher, spoilers, toggleSpoiler,
    setEditing
  } = props;

  return (
    <div className="container-oauth2" style={{ position: "relative", maxWidth: 480, margin: "0 auto", padding: 8 }}>
      <div style={{
        display: "flex", flexDirection: "column", alignItems: "center", gap: 8, marginBottom: 10
      }}>
        <h2 style={{ marginBottom: 8, fontSize: "1.1em" }}>My OAuth2 Applications</h2>
        <div style={{ display: "flex", gap: 10, flexDirection: "row" }}>
          <Link
            href={"/oauth2/test" + isFromLauncher()}
            style={{ ...linkStyle, position: "static", fontSize: 14 }}
            tabIndex={-1}
          >
            Test OAuth2 ↗
          </Link>
          <button
            className="add-app-btn"
            style={{ fontSize: "1em", padding: "6px 12px", borderRadius: 8 }}
            onClick={() => {
              setShowForm(true);
              setEditing(null);
              setName("");
              setRedirectUrls("");
            }}
          >
            + Add
          </button>
        </div>
      </div>
      <div className="apps-grid" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {apps &&
          apps.map((app) => (
            <div key={app.client_id} className="app-card" style={{
              background: "#23272e",
              borderRadius: 10,
              boxShadow: "0 2px 8px #0003",
              padding: 12,
              marginBottom: 2,
              display: "flex",
              flexDirection: "column",
              gap: 6,
            }}>
              <div className="app-card-main">
                <div className="app-card-title" style={{ fontWeight: 600, fontSize: "1.05em" }}>{app.name}</div>
                <div className="app-card-meta" style={{ fontSize: 13 }}>
                  <span>Client ID:</span>{" "}
                  <code
                    className="oauth2-code"
                    style={{ userSelect: "all", cursor: "pointer" }}
                    tabIndex={0}
                    onClick={() => navigator.clipboard.writeText(app.client_id)}
                    title="Click to copy"
                  >
                    {app.client_id}
                  </code>
                </div>
                {app.client_secret && (
                  <div className="app-card-meta" style={{ fontSize: 13 }}>
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
                <div className="app-card-redirects" style={{ fontSize: 13 }}>
                  <span>Redirects:</span>{" "}
                  {Array.isArray(app.redirect_urls)
                    ? app.redirect_urls.join(", ")
                    : app.redirect_urls}
                </div>
              </div>
              <div className="app-card-actions" style={{ width: "100%", display: "flex", flexDirection: "column", gap: 6, marginTop: 8 }}>
                <button
                  style={{ ...appCardButtonStyle, padding: "10px 0", fontSize: "1em" }}
                  onClick={() => handleIframe(app.client_id)}
                >
                  Integration code
                </button>
                <button
                  style={{ ...appCardButtonSecondaryStyle, padding: "10px 0", fontSize: "1em" }}
                  onClick={() => handleEdit(app)}
                >
                  Edit
                </button>
                <button
                  style={{ ...appCardButtonDeleteStyle, padding: "10px 0", fontSize: "1em" }}
                  onClick={() => handleDelete(app.client_id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
      </div>
      {/* Modals */}
      {showForm && !editing && (
        <OAuth2AppModal
          title="Create Application"
          name={name}
          setName={setName}
          redirectUrls={redirectUrls}
          setRedirectUrls={setRedirectUrls}
          onSubmit={handleCreate}
          onCancel={handleCancelEdit}
          submitLabel="Create App"
        />
      )}
      {showEditForm && editing && (
        <OAuth2AppModal
          title="Edit Application"
          name={name}
          setName={setName}
          redirectUrls={redirectUrls}
          setRedirectUrls={setRedirectUrls}
          onSubmit={handleCreate}
          onCancel={handleCancelEdit}
          submitLabel="Update App"
        />
      )}
      {iframeCode && (
        <OAuth2CodeModal code={iframeCode} onClose={() => setIframeCode(null)} />
      )}
    </div>
  );
}

// --- Modal for create/edit ---
function OAuth2AppModal({
  title,
  name,
  setName,
  redirectUrls,
  setRedirectUrls,
  onSubmit,
  onCancel,
  submitLabel,
}: {
  title: string;
  name: string;
  setName: (v: string) => void;
  redirectUrls: string;
  setRedirectUrls: (v: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  submitLabel: string;
}) {
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{ position: "relative", maxWidth: 340, width: "95%" }}
      >
        <button className="close-modal-btn" onClick={onCancel}>
          &times;
        </button>
        <h3>{title}</h3>
        <form className="oauth2-form" onSubmit={onSubmit}>
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
              {submitLabel}
            </button>
            <button
              type="button"
              onClick={onCancel}
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
  );
}

// --- Modal for integration code ---
function OAuth2CodeModal({ code, onClose }: { code: string; onClose: () => void }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{ position: "relative", maxWidth: 340, width: "95%" }}
      >
        <button className="close-modal-btn" onClick={onClose}>
          &times;
        </button>
        <h4>Integration button code:</h4>
        <pre className="oauth2-pre" style={{ fontSize: 13, whiteSpace: "pre-wrap" }}>{code}</pre>
      </div>
    </div>
  );
}

// --- Main export ---
export default function OAuth2Apps() {
  const isMobile = useIsMobile();
  const logic = useOAuth2AppsLogic();
  return isMobile ? <OAuth2AppsMobile {...logic} /> : <OAuth2AppsDesktop {...logic} />;
}
