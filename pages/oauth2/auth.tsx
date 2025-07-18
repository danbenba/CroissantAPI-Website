import React, { useEffect, useState } from "react";
import useAuth from "../../hooks/useAuth";

export default function OAuth2Auth() {
    const [params, setParams] = useState<{client_id?: string, redirect_uri?: string}>({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [userFromApp, setUserFromApp] = useState<any | null>(null);

    const { user, loading: authLoading, token } = useAuth();

    useEffect(() => {
        const search = new URLSearchParams(window.location.search);
        setParams({
            client_id: search.get("client_id") || undefined,
            redirect_uri: search.get("redirect_uri") || undefined
        });
        fetch("/api/oauth2/app/" + search.get("client_id"), {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        }).then(res => {
            if (res.ok) return res.json();
            throw new Error("Failed to fetch application info.");
        }).then(data => {
            setUserFromApp(data);
        }).catch(err => {
            setError(err.message);
        });
    }, [token]);

    const handleLogin = () => {
        window.location.href = `/login?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`;
    };

    const handleAuth = async () => {
        setLoading(true);
        setError(null);
        try {
            const url = `/api/oauth2/authorize?client_id=${encodeURIComponent(params.client_id!)}&redirect_uri=${encodeURIComponent(params.redirect_uri!)}`;
            const res = await fetch(url, { credentials: "include", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` } });
            if (!res.ok) {
                const data = await res.json();
                setError(data.message || "Authorization error.");
                setLoading(false);
                return;
            }
            const data = await res.json();
            window.location.href = `${params.redirect_uri}?code=${encodeURIComponent(data.code)}`;
        } catch (e) {
            setError("Network error.");
            setLoading(false);
        }
    };

    if (!params.client_id || !params.redirect_uri) {
        return <div className="container">Missing parameters.</div>;
    }

    return (
        <div className="oauth2-popup-container">
            <style>{`
                html, body {
                    overflow: hidden !important;
                }

                .oauth2-popup-container {
                    min-width: 340px;
                    min-height: 180px;
                    margin: 0 auto;
                    margin-top: 0;
                    background: linear-gradient(135deg, #232323 80%, #2d2d2d 100%);
                    border-radius: 18px;
                    box-shadow: 0 8px 40px rgba(0,0,0,0.25);
                    padding: 36px 28px 28px 28px;
                    color: #fff;
                    font-family: 'Segoe UI', Arial, sans-serif;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: flex-start;
                    position: relative;
                }
                .app-info {
                    display: flex;
                    align-items: center;
                    gap: 18px;
                    margin-bottom: 22px;
                    width: 100%;
                    justify-content: center;
                }
                .app-avatar {
                    width: 56px;
                    height: 56px;
                    border-radius: 16px;
                    background: #333;
                    object-fit: cover;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.18);
                }
                .app-name {
                    font-size: 1.22rem;
                    font-weight: 700;
                    letter-spacing: 0.01em;
                    margin-bottom: 2px;
                }
                .app-desc {
                    font-size: 0.98rem;
                    color: #bdbdbd;
                    margin-bottom: 0;
                }
                .redirect-info {
                    font-size: 1rem;
                    color: #bdbdbd;
                    margin-bottom: 24px;
                    word-break: break-all;
                    background: #232323;
                    border-radius: 8px;
                    padding: 8px 12px;
                    width: 100%;
                    text-align: center;
                }
                .oauth2-btn {
                    width: 100%;
                    background: linear-gradient(90deg, #3b82f6 60%, #2563eb 100%);
                    color: #fff;
                    border: none;
                    border-radius: 10px;
                    padding: 14px 0;
                    font-size: 1.08rem;
                    font-weight: 700;
                    cursor: pointer;
                    margin-bottom: 12px;
                    margin-top: 8px;
                    box-shadow: 0 2px 8px rgba(59,130,246,0.08);
                    transition: background 0.18s, box-shadow 0.18s;
                }
                .oauth2-btn:disabled {
                    background: #444;
                    cursor: not-allowed;
                    box-shadow: none;
                }
                .oauth2-btn.login {
                    background: #444;
                    color: #fff;
                    font-weight: 600;
                }
                .error-msg {
                    color: #fff;
                    background: #b91c1c;
                    border-radius: 8px;
                    padding: 10px 14px;
                    margin-top: 18px;
                    font-size: 1.01rem;
                    text-align: center;
                    width: 100%;
                    box-sizing: border-box;
                }
                .oauth2-btn-bottom {
                    position: absolute;
                    left: 0;
                    right: 0;
                    bottom: 48px; /* espace au-dessus de redirect-info-bottom */
                    padding: 0 12px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    z-index: 2;
                }
                .oauth2-btn-bottom .oauth2-btn {
                    margin-bottom: 0;
                    margin-top: 0;
                }
                .redirect-info-bottom {
                    position: absolute;
                    bottom: 16px;
                    left: 0;
                    width: 100%;
                    text-align: center;
                    font-size: 0.82rem;
                    color: #888;
                    opacity: 0.85;
                    padding: 0 12px;
                    word-break: break-all;
                    pointer-events: none;
                    user-select: text;
                    z-index: 1;
                }
                @media (max-width: 500px) {
                    .oauth2-popup-container {
                        max-width: 98vw;
                        min-width: 0;
                        padding: 18px 4vw 18px 4vw;
                    }
                    .oauth2-btn-bottom {
                        padding: 0 4vw;
                    }
                }
            `}</style>
            <div className="app-info">
                <img src={"/favicon.png"} alt="App avatar" className="app-avatar" />
                <div>
                    <div className="app-desc">
                        Do you want to authorize <b style={{color: "white"}}>{userFromApp?.name || "Unknown application"}</b> to access your user data?
                    </div>
                </div>
            </div>
            {error && <div className="error-msg">{error}</div>}
            {/* Bouton déplacé en bas */}
            <div className="oauth2-btn-bottom">
                {!authLoading && !user && (
                    <button className="oauth2-btn login" onClick={handleLogin}>Log in</button>
                )}
                {!authLoading && user && (
                    <button className="oauth2-btn" onClick={handleAuth} disabled={loading}>
                        {loading ? "Authorizing..." : "Authorize"}
                    </button>
                )}
            </div>
            <div className="redirect-info-bottom">
                Redirect URI: {params.redirect_uri}
            </div>
        </div>
    );
}