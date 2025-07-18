import React, { useEffect, useState } from "react";
import useAuth from "../../hooks/useAuth";
// Ajout du style CSS directement dans le composant via une balise <style>
export default function OAuth2Apps() {
    const [apps, setApps] = useState<any[]>([]);
    const [name, setName] = useState("");
    const [redirectUrls, setRedirectUrls] = useState("");
    const [iframeCode, setIframeCode] = useState<string | null>(null);
    const {token} = useAuth(); 

    useEffect(() => {
        fetch("/api/oauth2/apps", { credentials: "include", headers: { "Content-Type": "application/json" , "Authorization": `Bearer ${document.cookie.split('token=')[1]}` } })
            .then(res => res.json())
            .then(setApps)
            .catch(() => setApps([]));
    }, []);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        const res = await fetch("/api/oauth2/app", {
            method: "POST",
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${document.cookie.split('token=')[1]}` },
            credentials: "include",
            body: JSON.stringify({
                name,
                redirect_urls: redirectUrls.split(",").map(s => s.trim())
            })
        });
        if (res.ok) {
            const data = await res.json();
            setApps([...apps, { client_id: data.client_id, name, redirect_urls: redirectUrls.split(",") }]);
            setName("");
            setRedirectUrls("");
        }
    };

    const handleIframe = (client_id: string) => {
        const app = apps.find(a => a.client_id === client_id);
        const redirect = app && Array.isArray(app.redirect_urls) && app.redirect_urls.length > 0
            ? app.redirect_urls[0]
            : "";
        setIframeCode(
            `<button style="display:inline-flex;align-items:center;gap:8px;padding:8px 16px;font-size:1rem;border-radius:6px;border:none;background:#333;color:#fff;cursor:pointer;" onclick="window.open('${window.location.origin}/oauth2/auth?client_id=${client_id}${redirect ? `&redirect_uri=${encodeURIComponent(redirect)}` : ""}', '_blank', 'width=428,height=238')">
    <img src="https://croissant-api.fr/favicon.png" alt="icon" style="width:20px;height:20px;vertical-align:middle;display:inline-block;" />
    <span style="vertical-align:middle;">Login with Croissant</span>
</button>`
        );
    };

    const handleEdit = (app: any) => {
        setName(app.name);
        setRedirectUrls(Array.isArray(app.redirect_urls) ? app.redirect_urls.join(",") : app.redirect_urls);
        // Optionally, store the editing client_id in state to PATCH on submit
        // setEditingClientId(app.client_id);
    };

    const handleDelete = async (client_id: string) => {
        if (!window.confirm("Are you sure you want to delete this app?")) return;
        const res = await fetch(`/api/oauth2/app/${client_id}`, {
            method: "DELETE",
            credentials: "include",
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` }
        });
        if (res.ok) setApps(apps.filter(a => a.client_id !== client_id));
    };

    return (
        <div className="container-oauth2" style={{ position: "relative" }}>
            {/* Lien discret vers la page de test OAuth2 */}
            <a
                href="/oauth2/test"
                style={{
                    position: "absolute",
                    top: 18,
                    right: 18,
                    fontSize: 13,
                    color: "#aaa",
                    opacity: 0.55,
                    textDecoration: "underline dotted",
                    zIndex: 10,
                    transition: "opacity 0.2s",
                }}
                onMouseOver={e => (e.currentTarget.style.opacity = "0.95")}
                onMouseOut={e => (e.currentTarget.style.opacity = "0.55")}
                tabIndex={-1}
            >
                Test OAuth2 ↗
            </a>
            <style>{`
                .container-oauth2 {
                    max-width: 600px;
                    margin: 40px auto;
                    background: #222;
                    border-radius: 12px;
                    box-shadow: 0 2px 12px rgba(0,0,0,0.25);
                    padding: 32px 24px;
                    color: #fff;
                }
                form {
                    margin-bottom: 32px;
                    display: flex;
                    flex-direction: column;
                    gap: 18px;
                }
                .form-group {
                    margin-bottom: 0;
                    display: flex;
                    flex-direction: column;
                }
                label {
                    display: block;
                    font-weight: bold;
                    margin-bottom: 6px;
                    color: #fff;
                }
                input[type="text"], input[type="email"], textarea {
                    width: 95%;
                    padding: 10px 12px;
                    border: 1.5px solid #444;
                    border-radius: 6px;
                    font-size: 1rem;
                    background: #333;
                    color: #fff;
                    transition: border 0.2s, background 0.2s;
                    margin-bottom: 4px;
                }
                input[type="text"]:focus, input[type="email"]:focus, textarea:focus {
                    border-color: #fff;
                    outline: none;
                    background: #2c2c2c;
                }
                button {
                    background: #333;
                    color: #fff;
                    border: none;
                    border-radius: 6px;
                    padding: 10px 22px;
                    font-size: 1rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: background 0.2s, color 0.2s;
                    margin-top: 8px;
                }
                button:hover {
                    background: #444;
                    color: #fff;
                }
                ul {
                    list-style: none;
                    padding: 0;
                }
                li {
                    background: #292929;
                    border-radius: 8px;
                    margin-bottom: 18px;
                    padding: 16px 14px;
                    box-shadow: 0 1px 4px rgba(0,0,0,0.10);
                    color: #fff;
                }
                pre {
                    background: #181818;
                    border-radius: 6px;
                    padding: 12px;
                    font-size: 0.95rem;
                    overflow-x: auto;
                    color: #fff;
                }
                code {
                    background: #333;
                    color: #fff;
                    padding: 2px 6px;
                    border-radius: 4px;
                }
                a.integration-link {
                    display: inline-block;
                    margin-top: 10px;
                    color: #fff;
                    text-decoration: underline;
                    font-weight: 600;
                }
                @media screen and (max-width: 768px) {
                    .container-oauth2 {
                        padding: 16px 6px;
                    }
                    pre {
                        font-size: 0.9rem;
                    }
                }
            `}</style>
            <h2>My apps</h2>
            <form className="oauth2-form" onSubmit={handleCreate}>
                <div className="form-group">
                    <label>App Name</label>
                    <input
                        type="text"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Redirect URLs (comma-separated)</label>
                    <input
                        type="text"
                        value={redirectUrls}
                        onChange={e => setRedirectUrls(e.target.value)}
                        required
                    />
                </div>
                <button type="submit">Create App</button>
            </form>
            <h3>Your Apps</h3>
            <ul>
                {apps.map(app => (
                    <li key={app.client_id} style={{ display: "flex", alignItems: "center", gap: 16 }}>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 600, fontSize: 18, marginBottom: 2 }}>{app.name}</div>
                            <div style={{ fontSize: 14, color: "#fff", marginBottom: 2 }}>
                                <span style={{ opacity: 0.7 }}>Client ID:</span> <code>{app.client_id}</code>
                            </div>
                            {app.client_secret && (
                                <div style={{ fontSize: 14, color: "#fff", marginBottom: 2 }}>
                                    <span style={{ opacity: 0.7 }}>Client Secret:</span> <code>{app.client_secret}</code>
                                </div>
                            )}
                            <div style={{ fontSize: 14, color: "#fff", marginBottom: 8 }}>
                                <span style={{ opacity: 0.7 }}>Redirects:</span> {Array.isArray(app.redirect_urls) ? app.redirect_urls.join(", ") : app.redirect_urls}
                            </div>
                            <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                                <button
                                    onClick={() => handleIframe(app.client_id)}
                                    style={{
                                        background: "#333",
                                        color: "#fff",
                                        border: "none",
                                        borderRadius: 6,
                                        padding: "8px 18px",
                                        fontWeight: 500,
                                        cursor: "pointer"
                                    }}
                                >
                                    Generate integration code
                                </button>
                                <button
                                    onClick={() => handleEdit(app)}
                                    style={{
                                        background: "#222",
                                        color: "#fff",
                                        border: "1px solid #444",
                                        borderRadius: 6,
                                        padding: "8px 18px",
                                        fontWeight: 500,
                                        cursor: "pointer"
                                    }}
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={() => handleDelete(app.client_id)}
                                    style={{
                                        background: "#222",
                                        color: "#fff",
                                        border: "1px solid #444",
                                        borderRadius: 6,
                                        padding: "8px 18px",
                                        fontWeight: 500,
                                        cursor: "pointer"
                                    }}
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </li>
                ))}
            </ul>
            {iframeCode && (
                <div>
                    <h4>Integration button code:</h4>
                    <pre>{iframeCode}</pre>
                    <a
                        href={iframeCode.match(/src="([^"]+)"/)?.[1] || "#"}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="integration-link"
                    >
                        Open integration URL in a new tab
                    </a>
                </div>
            )}
        </div>
    );
}