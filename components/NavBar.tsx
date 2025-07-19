import React, { use, useEffect, useState } from "react";
import Link from "next/link";
function useNavBarResponsive() {
    const [isMobile, setIsMobile] = React.useState(false);
    React.useEffect(() => {
        const check = () => setIsMobile(window.innerWidth <= 700);
        check();
        window.addEventListener("resize", check);
        return () => window.removeEventListener("resize", check);
    }, []);
    // Styles dynamiques
    const headerStyle: React.CSSProperties = {
        width: "100%",
        background: "#191b20",
        color: "#e2e8f0",
        borderBottom: "1px solid #23242a",
        padding: isMobile ? "0.1rem 0 0.1rem 0" : "0.2rem 0 0.1rem 0",
        boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
        position: "relative",
        zIndex: 10,
        display: undefined // handled by parent
    };
    const containerStyle: React.CSSProperties = {
        display: "flex",
        alignItems: isMobile ? undefined : "center",
        justifyContent: isMobile ? undefined : "space-between",
        flexDirection: isMobile ? "column" : "row",
        maxWidth: 1200,
        margin: "0 auto",
        padding: isMobile ? "0.1rem 0.5rem" : "0.2rem 1.2rem 0.1rem 1.2rem",
        width: "100%"
    };
    const rowStyle: React.CSSProperties = {
        display: isMobile ? "block" : "flex",
        alignItems: "center",
        justifyContent: isMobile ? undefined : "space-between",
        width: "100%",
        height: isMobile ? undefined : 48,
        marginBottom: isMobile ? 6 : 0
    };
    const logoStyle: React.CSSProperties = {
        color: "#f3f3f3",
        textDecoration: "none",
        fontWeight: 700,
        fontSize: isMobile ? 18 : 22,
        letterSpacing: 1
    };
    const logoSpanStyle: React.CSSProperties = {
        display: "inline-flex",
        alignItems: "center",
        fontFamily: 'monospace',
        fontWeight: 900
    };
    const logoImgStyle: React.CSSProperties = {
        width: isMobile ? 22 : 28,
        height: isMobile ? 22 : 28,
        verticalAlign: "middle",
        marginRight: 6
    };
    const linksGroupStyle: React.CSSProperties = {
        display: isMobile ? "block" : "flex",
        alignItems: "center",
        gap: isMobile ? undefined : 12,
        marginTop: isMobile ? 8 : 0,
        textAlign: isMobile ? "center" : undefined
    };
    const linkStyle: React.CSSProperties = {
        color: "#bdbdbd",
        textDecoration: "none",
        fontSize: isMobile ? 14 : 15,
        padding: isMobile ? "0.18rem 0.5rem" : "0.2rem 0.7rem",
        borderRadius: 5,
        transition: "background .2s",
        display: isMobile ? "block" : "inline-block",
        margin: isMobile ? "2px 0" : undefined
    };
    const loginStyle: React.CSSProperties = {
        ...linkStyle,
        marginLeft: isMobile ? 0 : 10,
        color: "#8fa1c7",
        fontWeight: 600,
        background: "#23242a"
    };
    const userBlockStyle: React.CSSProperties = {
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        marginLeft: isMobile ? 0 : 10,
        marginTop: isMobile ? 6 : 0
    };
    const avatarStyle: React.CSSProperties = {
        width: isMobile ? 24 : 28,
        height: isMobile ? 24 : 28,
        borderRadius: "50%",
        objectFit: "cover",
        border: "1px solid #23242a"
    };
    const logoutBtnStyle: React.CSSProperties = {
        marginLeft: 4,
        background: "#23242a",
        color: "#fff",
        border: "none",
        borderRadius: 5,
        padding: isMobile ? "3px 8px" : "4px 10px",
        cursor: "pointer",
        fontSize: isMobile ? 13 : 15
    };
    return { headerStyle, containerStyle, rowStyle, logoStyle, logoSpanStyle, logoImgStyle, linksGroupStyle, linkStyle, loginStyle, userBlockStyle, avatarStyle, logoutBtnStyle };
}
import useAuth from "../hooks/useAuth";
import Searchbar from "./Searchbar";

export default function NavBar() {
    const { user, loading, setUser } = useAuth();
    const [show, setShow] = useState("");
    const [isMobile, setIsMobile] = React.useState(false);
    useEffect(() => {
        const check = () => setIsMobile(window.innerWidth <= 700);
        check();
        window.addEventListener("resize", check);
        return () => window.removeEventListener("resize", check);
    }, []);
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

    const {
        headerStyle, containerStyle, rowStyle, logoStyle, logoSpanStyle, logoImgStyle, linksGroupStyle, linkStyle, loginStyle, userBlockStyle, avatarStyle, logoutBtnStyle
    } = useNavBarResponsive();
    return (
        <header style={{ ...headerStyle, display: show }}>
            <div style={containerStyle}>
                <div style={rowStyle}>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: !isMobile ? "flex-start" : "center", minWidth: 0 }}>
                        <Link style={{ ...logoStyle }} href="/" legacyBehavior>
                            <span style={{
                                cursor: "pointer"
                            }}>
                                <img src="/favicon.png" alt="Croissant Logo" style={logoImgStyle} />
                                Croissant Inventory System
                            </span>
                        </Link>

                    </div>
                    <Searchbar />
                    <nav>
                        <div
                            className="links-group"
                            style={linksGroupStyle}
                        >
                            <Link href="/download-launcher" legacyBehavior>
                                <a style={linkStyle}>Launcher</a>
                            </Link>
                            <Link href="/api-docs" legacyBehavior>
                                <a style={linkStyle}>API Docs</a>
                            </Link>
                            <a href="https://ptb.discord.com/oauth2/authorize?client_id=1324530344900431923" style={linkStyle}>Bot</a>
                            {!loading && user && (
                                <Link href="/oauth2/apps" legacyBehavior>
                                    <a style={linkStyle}>Apps</a>
                                </Link>
                            )}
                            {!loading && user ? (
                                <div style={userBlockStyle}>
                                    <Link href="/profile" legacyBehavior>
                                        <a><img src={"/avatar/" + user.id} alt="avatar" style={avatarStyle} /></a>
                                    </Link>
                                    <Link href="/launcher/buy-credits" style={{ textDecoration: "none" }}>
                                        <div className="navbar-credits">
                                            <img src="./credit.png" className="navbar-credit-img" />
                                            <div className="navbar-balance">
                                                <span id="my-balance">{user?.balance}</span>
                                            </div>
                                        </div>
                                    </Link>
                                    <button onClick={handleLogout} style={logoutBtnStyle} title="Logout">
                                        <i className="fa fa-sign-out-alt" aria-hidden="true"></i>
                                    </button>
                                </div>
                            ) : (
                                <Link href="/login" legacyBehavior>
                                    <a style={loginStyle}>Login</a>
                                </Link>
                            )}
                        </div>
                    </nav>
                </div>
            </div>
        </header>
    );
}
