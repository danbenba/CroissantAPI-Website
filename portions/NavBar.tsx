import React, { use, useEffect, useState } from "react";
import useAuth from "../hooks/useAuth";

export default function NavBar() {
    const { user, loading, setUser } = useAuth();
    const [show, setShow] = useState("");

    useEffect(() => {
        if (loading) return;
        if (window.location.href.startsWith(window.location.origin + "/oauth2/auth")) {
            setShow("none");
        } else {
            setShow("");
        }
    }, [loading]);

    const handleLogout = () => {
        document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        setUser(null);
        window.location.reload();
    };

    return (
        <header style={{display: show}}>
            <a href="/" style={{ color: "white", textDecoration: "none" }}>
                <h1>Croissant API</h1>
            </a>
            <h4 style={{ color: "gray" }}>
                Creative and Reusable Opensource Inventory System, Scalable, APIful, and Network Technology
            </h4>
            <nav>
                <div
                    className="links-group"
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 16
                    }}
                >
                    <a href="/download-launcher">Launcher</a>
                    <a href="/api-docs">API Documentation</a>
                    <a href="https://ptb.discord.com/oauth2/authorize?client_id=1324530344900431923">Bot</a>
                    {!loading && user && (
                        <a href="/oauth2/apps">Applications</a>
                    )}
                    {!loading && user ? (
                        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, marginLeft: 16 }}>
                            <img src={"https://croissant-api.fr/avatar/" + user.id} alt="avatar" style={{ width: 32, height: 32, borderRadius: "50%", objectFit: "cover" }} />
                            {/* <span>{user.username}</span> */}
                            <button onClick={handleLogout} style={{
                                marginLeft: 8, background: "#333", color: "#fff", border: "none", borderRadius: 6, padding: "6px 12px", cursor: "pointer"
                            }}>
                                <i className="fa fa-sign-out-alt" aria-hidden="true"></i>
                            </button>
                        </div>
                    ) : (
                        <a href="/login" style={{ marginLeft: 16 }}>Login</a>
                    )}
                </div>
            </nav>
        </header>
    );
}
