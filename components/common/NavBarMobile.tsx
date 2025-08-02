import React, { useState, useEffect } from "react";
import Link from "next/link";
import useAuth from "../../hooks/useAuth";
import CachedImage from "../utils/CachedImage";
import Searchbar from "../Searchbar";
import Certification from "./Certification";

export default function NavBarMobile() {
    const { user, loading, setUser } = useAuth();
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [drawerVisible, setDrawerVisible] = useState(false);
    const [showRoles, setShowRoles] = useState(false);

    useEffect(() => {
        if (drawerOpen) {
            setTimeout(() => setDrawerVisible(true), 10);
        } else {
            setDrawerVisible(false);
        }
    }, [drawerOpen]);

    // Styles mobile uniquement
    const headerStyle: React.CSSProperties = {
        // width: "100%",
        background: "#191b20",
        color: "#e2e8f0",
        borderBottom: "1px solid #23242a",
        // padding: "0.1rem 0 0.1rem 0",
        boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
        position: "relative",
        zIndex: 10,
    };
    const containerStyle: React.CSSProperties = {
        display: "flex",
        flexDirection: "column",
        maxWidth: 1200,
        margin: "0 auto",
        // padding: "0.1rem 0.5rem",
        width: "100%",
    };
    const rowStyle: React.CSSProperties = {
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        width: "100%",
        marginBottom: 6,
        position: "relative",
    };
    const logoStyle: React.CSSProperties = {
        color: "#f3f3f3",
        textDecoration: "none",
        fontWeight: 700,
        fontSize: 18,
        letterSpacing: 1
    };
    const logoSpanStyle: React.CSSProperties = {
        display: "inline-flex",
        alignItems: "center",
        fontWeight: 900,
        position: "relative",
        fontSize: 24,
        top: 6,
    };
    const logoImgStyle: React.CSSProperties = {
        width: 30,
        height: 30,
        position: "relative",
        top: 0,
        verticalAlign: "middle",
        marginRight: 6,
    };
    const loginStyle: React.CSSProperties = {
        color: "#8fa1c7",
        fontWeight: 600,
        background: "#23242a",
        borderRadius: 5,
        padding: "0.18rem 0.5rem",
        fontSize: 14,
        marginLeft: 0,
        textDecoration: "none",
        cursor: "pointer",
        display: "block",
    };
    const linkStyle: React.CSSProperties = {
        color: "#bdbdbd",
        textDecoration: "none",
        fontSize: 14,
        padding: "0.18rem 0.5rem",
        borderRadius: 5,
        transition: "background .2s",
        display: "block",
        margin: "2px 0",
        cursor: "pointer",
    };
    const logoutBtnStyle: React.CSSProperties = {
        marginLeft: 4,
        background: "#23242a",
        color: "#fff",
        border: "none",
        borderRadius: 5,
        padding: "3px 8px",
        cursor: "pointer",
        fontSize: 13,
    };
    const logoGroupStyle: React.CSSProperties = {
        marginRight: 0,
        marginBottom: 10,
        flex: "1 1 auto",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        position: "absolute",
        left: 0,
        right: 0,
        pointerEvents: "none",
        zIndex: 1,
    };
    const avatarStyle: React.CSSProperties = {
        width: 24,
        height: 24,
        borderRadius: "50%",
        objectFit: "cover",
        border: "1px solid #23242a",
        marginLeft: 6,
    };

    const creditsStyle: React.CSSProperties = {
        display: "inline-flex",
        alignItems: "center",
        background: "#23242a",
        borderRadius: 5,
        padding: "2px 8px",
        fontSize: 13,
        color: "#ccc",
        fontWeight: 600,
        marginLeft: 6,
        marginRight: 2,
        gap: 4,
    };

    const handleLogout = () => {
        document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        localStorage.removeItem("token");
        setUser(null);
    };

    // Bloc crédits + avatar + sélecteur de rôle (pour drawer)
    const UserBlock = ({ loading, user }: any) => (
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <Link href="/buy-credits" legacyBehavior>
                <span style={creditsStyle}>
                    <CachedImage src="/assets/credit.png" style={{ width: 16, height: 16 }} />
                    <span>{loading ? "..." : user?.balance}</span>
                </span>
            </Link>
            <Link href="/profile" legacyBehavior>
                <a>
                    <CachedImage
                        src={loading ? "/avatar/default.png" : "/avatar/" + (user.role || user.id)}
                        alt="avatar"
                        style={avatarStyle}
                    />
                </a>
            </Link>
            <button
                style={{
                    ...linkStyle,
                    cursor: "pointer",
                    background: "none",
                    border: "none",
                    outline: "none",
                    display: "inline-flex",
                    alignItems: "center",
                    fontWeight: 600,
                    gap: 4,
                    padding: 0,
                }}
                onClick={(e) => {
                    e.preventDefault();
                    setShowRoles((prev) => !prev);
                }}
            >
                <span style={{ fontSize: 12 }}>▼</span>
            </button>
            <button
                onClick={handleLogout}
                style={logoutBtnStyle}
                title="Logout"
            >
                <i className="fa fa-sign-out-alt" aria-hidden="true"></i>
            </button>
        </div>
    );

    // Menu déroulant des rôles (pour drawer)
    const RolesDropdown = ({ user }: any) => (
        <div
            style={{
                background: "#23242a",
                border: "1px solid #35363b",
                borderRadius: 6,
                minWidth: 140,
                boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
                zIndex: 100,
                marginBottom: 10,
                marginTop: 2,
                padding: 4,
            }}
        >
            {user &&
                user?.roles.map((role: any) => {
                    const studio = user.studios.find((studio: any) => studio.user_id === role);
                    return (
                        <button
                            style={{
                                ...linkStyle,
                                display: "flex",
                                alignItems: "center",
                                gap: 8,
                                width: "100%",
                                textAlign: "left",
                                background: "none",
                                border: "none",
                                padding: "6px 0",
                            }}
                            key={role}
                            onClick={() => {
                                fetch("/api/users/change-role", {
                                    headers: { "Content-Type": "application/json" },
                                    method: "POST",
                                    body: JSON.stringify({ role }),
                                })
                                    .then((res) => res.ok ? res.json() : Promise.reject("Failed to change role"))
                                    .then(() => fetch("/api/users/@me", { headers: { "Content-Type": "application/json" } }))
                                    .then((res) => res.json())
                                    .then((userData) => {
                                        setUser(userData);
                                        setShowRoles(false);
                                    })
                                    .catch((err) => console.error(err));
                            }}
                        >
                            <CachedImage src={"/avatar/" + role} alt="avatar" style={avatarStyle} />
                            <span style={{ whiteSpace: "nowrap" }}>
                                {studio?.username || "Me"}
                                <Certification user={studio ? { ...studio, isStudio: true } : studio} style={{
                                    width: 16,
                                    height: 16,
                                    marginLeft: 4,
                                    position: "relative",
                                    top: -2,
                                    verticalAlign: "middle",
                                }} />
                            </span>
                        </button>
                    );
                })}
        </div>
    );

    // Groupe de liens mobile (en anglais)
    function MobileLinks() {
        return (
            <>
                <Link href="/api-docs" legacyBehavior>
                    <span style={linkStyle}>Docs</span>
                </Link>
                <Link href="/game-shop" legacyBehavior>
                    <span style={linkStyle}>Shop</span>
                </Link>
                <Link href="/marketplace" legacyBehavior>
                    <span style={linkStyle}>Marketplace</span>
                </Link>
                <Link href="/download-launcher" legacyBehavior>
                    <span style={linkStyle}>Download Launcher</span>
                </Link>
                <a
                    href="https://ptb.discord.com/oauth2/authorize?client_id=1324530344900431923"
                    style={linkStyle}
                >
                    Discord Bot
                </a>
                {!loading && user && (
                    <>
                        <Link href="/studios" legacyBehavior>
                            <span style={linkStyle}>Studios</span>
                        </Link>
                        <Link href="/oauth2/apps" legacyBehavior>
                            <span style={linkStyle}>OAuth2</span>
                        </Link>
                        <Link href="/settings" legacyBehavior>
                            <span style={linkStyle}>Settings</span>
                        </Link>
                    </>
                )}
            </>
        );
    }

    return (
        <header style={headerStyle}>
            <div style={containerStyle}>
                <div style={rowStyle}>
                    {/* Hamburger menu à gauche */}
                    <button
                        style={{
                            background: "none",
                            border: "none",
                            color: "#e2e8f0",
                            fontSize: 28,
                            cursor: "pointer",
                            padding: 8,
                            marginRight: 0,
                            marginLeft: 0,
                            flex: "0 0 auto",
                            zIndex: 2,
                        }}
                        aria-label="Open menu"
                        onClick={() => setDrawerOpen(true)}
                    >
                        &#9776;
                    </button>
                    {/* Logo centré */}
                    <div style={logoGroupStyle}>
                        <span style={{
                            cursor: "pointer", display: "flex", alignItems: "center",
                            marginTop: 12
                        }}>
                            <Link style={{ ...logoStyle, pointerEvents: "auto" }} href="/">
                                <>
                                    <CachedImage src="/assets/icons/favicon-32x32.png" alt="Croissant Logo" style={logoImgStyle} />
                                    <div style={logoSpanStyle}>CROISSANT</div>
                                </>
                            </Link>
                        </span>
                    </div>
                    {/* Zone utilisateur à droite (vide, tout est dans le drawer) */}
                    <div style={{ flex: "0 0 auto", display: "flex", alignItems: "center", zIndex: 2, marginLeft: "auto" }} />
                    {/* Drawer */}
                    <nav>
                        {drawerOpen && (
                            <>
                                <div
                                    style={{
                                        position: "fixed",
                                        top: 0,
                                        left: 0,
                                        width: "80vw",
                                        maxWidth: 320,
                                        height: "calc(100vh - 2.4rem)",
                                        background: "#23242a",
                                        zIndex: 9999,
                                        boxShadow: "2px 0 12px rgba(0,0,0,0.18)",
                                        padding: "1.2rem 1rem",
                                        display: "flex",
                                        flexDirection: "column",
                                        gap: 18,
                                        transition: "transform 0.25s cubic-bezier(.4,0,.2,1), opacity 0.2s",
                                        transform: drawerVisible ? "translateX(0)" : "translateX(-100%)",
                                        opacity: drawerVisible ? 1 : 0,
                                    }}
                                >
                                    <div style={{ display: "flex", flexDirection: "row", alignItems: "center", marginBottom: 10 }}>
                                        <div style={{ flex: 1 }}>
                                            <Searchbar />
                                        </div>
                                        <button
                                            style={{
                                                background: "none",
                                                border: "none",
                                                color: "#e2e8f0",
                                                fontSize: 28,
                                                cursor: "pointer",
                                                marginLeft: 8,
                                                marginBottom: 0,
                                                alignSelf: "auto",
                                            }}
                                            aria-label="Close menu"
                                            onClick={() => setDrawerOpen(false)}
                                        >
                                            &times;
                                        </button>
                                    </div>
                                    {/* Zone utilisateur et changement de rôle */}
                                    {!user && !loading && (
                                        <Link href="/login" legacyBehavior>
                                            <span style={loginStyle}>Login</span>
                                        </Link>
                                    )}
                                    {user && (
                                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%" }}>
                                            <UserBlock loading={loading} user={user} />
                                            {showRoles && <RolesDropdown user={user} />}
                                        </div>
                                    )}
                                    <MobileLinks />
                                </div>
                                <div
                                    onClick={() => setDrawerOpen(false)}
                                    style={{
                                        position: "fixed",
                                        top: 0,
                                        left: 0,
                                        width: "100vw",
                                        height: "100vh",
                                        background: "rgba(0,0,0,0.25)",
                                        zIndex: 9998,
                                    }}
                                />
                            </>
                        )}
                    </nav>
                </div>
            </div>
        </header>
    );
}