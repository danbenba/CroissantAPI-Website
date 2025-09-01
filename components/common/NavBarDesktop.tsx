import React, { useState } from "react";
import Link from "next/link";
import { useTranslation } from "next-i18next";
import useAuth from "../../hooks/useAuth";
import CachedImage from "../utils/CachedImage";
import Searchbar from "../Searchbar";
import Certification from "./Certification";

export default function NavBarDesktop() {
  const { user, loading, setUser } = useAuth();
  const [show, setShow] = useState("");

  // Styles desktop uniquement
  const headerStyle: React.CSSProperties = {
    width: "100%",
    background: "#191b20",
    color: "#e2e8f0",
    borderBottom: "1px solid #23242a",
    padding: "0.2rem 0 0.1rem 0",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
    position: "relative",
    zIndex: 10,
  };
  const containerStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    flexDirection: "row",
    maxWidth: 1200,
    margin: "0 auto",
    padding: "0.2rem 1.2rem 0.1rem 1.2rem",
    width: "100%",
  };
  const rowStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    height: 48,
    marginBottom: 0,
  };
  const logoStyle: React.CSSProperties = {
    color: "#f3f3f3",
    textDecoration: "none",
    fontWeight: 700,
    fontSize: 22,
    letterSpacing: 1,
  };
  const logoSpanStyle: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    fontWeight: 900,
    position: "relative",
    fontSize: 20,
    top: -2,
  };
  const logoImgStyle: React.CSSProperties = {
    width: 28,
    height: 28,
    position: "relative",
    top: -4,
    verticalAlign: "middle",
    marginRight: 6,
  };
  const linksGroupStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: 12,
    marginTop: 0,
    flexDirection: "row",
    position: "relative",
  };
  const linkStyle: React.CSSProperties = {
    color: "#bdbdbd",
    textDecoration: "none",
    fontSize: 15,
    padding: "0.2rem 0.7rem",
    borderRadius: 5,
    transition: "background .2s",
    display: "inline-block",
    cursor: "pointer",
  };
  const loginStyle: React.CSSProperties = {
    ...linkStyle,
    marginLeft: 10,
    color: "#8fa1c7",
    fontWeight: 600,
    background: "#23242a",
    cursor: "pointer",
  };
  const logoutBtnStyle: React.CSSProperties = {
    marginLeft: 4,
    background: "#23242a",
    color: "#fff",
    border: "none",
    borderRadius: 5,
    padding: "4px 10px",
    cursor: "pointer",
    fontSize: 15,
  };
  const logoGroupStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    marginRight: 20,
  };
  const avatarStyle: React.CSSProperties = {
    width: 28,
    height: 28,
    borderRadius: "50%",
    objectFit: "cover",
    border: "1px solid #23242a",
  };
  const userBlockStyle: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    marginLeft: 10,
    marginTop: 0,
  };

  const handleLogout = () => {
    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    localStorage.removeItem("token");
    setUser(null);
  };

  // Bloc crédits + avatar + sélecteur de rôle
  const UserBlock = ({ loading, user }: any) => (
    <div style={userBlockStyle}>
      <Link href="/buy-credits" style={{ textDecoration: "none" }}>
        <div className="navbar-credits">
          <CachedImage src="/assets/credit.png" className="navbar-credit-img" />
          <div className="navbar-balance">
            <span id="my-balance">{loading ? "..." : user?.balance}</span>
          </div>
        </div>
      </Link>
      <Link href="/profile" legacyBehavior>
        <a>
          <CachedImage
            src={
              loading
                ? "/avatar/default.png"
                : "/avatar/" + (user.role || user.id)
            }
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
        }}
        onClick={(e) => {
          e.preventDefault();
          setShow((prev) => (prev === "roles" ? "" : "roles"));
        }}
      >
        <span style={{ fontSize: 12 }}>▼</span>
      </button>
    </div>
  );

  // Menu déroulant des rôles
  const RolesDropdown = ({ user }: any) => (
    <div
      style={{
        position: "absolute",
        top: "100%",
        left: 0,
        background: "#23242a",
        border: "1px solid #23242a",
        borderRadius: 6,
        minWidth: 140,
        width: 300,
        boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
        zIndex: 100,
        marginTop: 2,
      }}
      onMouseLeave={() => setShow("")}
    >
      {user &&
        user?.roles.map((role: any) => {
          const studio = user.studios.find(
            (studio: any) => studio.user_id === role
          );
          return (
            <button
              style={{
                ...linkStyle,
                display: "flex",
                alignItems: "center",
                gap: 8,
                width: "100%",
                textAlign: "left",
              }}
              key={role}
              onClick={() => {
                fetch("/api/users/change-role", {
                  headers: { "Content-Type": "application/json" },
                  method: "POST",
                  body: JSON.stringify({ role }),
                })
                  .then((res) =>
                    res.ok
                      ? res.json()
                      : Promise.reject("Failed to change role")
                  )
                  .then(() =>
                    fetch("/api/users/@me", {
                      headers: { "Content-Type": "application/json" },
                    })
                  )
                  .then((res) => res.json())
                  .then((userData) => {
                    setUser(userData);
                    setShow("");
                  })
                  .catch((err) => console.error(err));
              }}
            >
              <CachedImage
                src={"/avatar/" + role}
                alt="avatar"
                style={avatarStyle}
              />
              <span style={{ whiteSpace: "nowrap" }}>
                {studio?.me.username || "Me"}
                <Certification
                  user={studio ? { ...studio, isStudio: true } : studio}
                  style={{
                    width: 16,
                    height: 16,
                    marginLeft: 4,
                    position: "relative",
                    top: -2,
                    verticalAlign: "middle",
                  }}
                />
              </span>
            </button>
          );
        })}
    </div>
  );

  // Groupe de liens desktop
  function DesktopLinks() {
    const { t } = useTranslation("common");
    return (
      <>
        <Link href="/api-docs" legacyBehavior>
          <span style={linkStyle}>{t("navbar.docs")}</span>
        </Link>
        <Link href="/game-shop" legacyBehavior>
          <span style={linkStyle}>{t("navbar.shop")}</span>
        </Link>
        <Link href="/marketplace" legacyBehavior>
          <span style={linkStyle}>{t("navbar.marketplace")}</span>
        </Link>
        <DropdownButton label={t("navbar.install")} showKey="install">
          {show === "install" && (
            <div
              style={{
                position: "absolute",
                top: "100%",
                left: 0,
                background: "#23242a",
                border: "1px solid #23242a",
                borderRadius: 6,
                minWidth: 140,
                boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
                zIndex: 100,
                marginTop: 2,
              }}
              onMouseLeave={() => setShow("")}
            >
              <Link href="/download-launcher" legacyBehavior>
                <a style={{ ...linkStyle, display: "block", borderRadius: 0 }}>
                  {t("navbar.launcher")}
                </a>
              </Link>
              <Link
                href="https://github.com/Croissant-API/Croissant-VPN/releases"
                legacyBehavior
              >
                <a style={{ ...linkStyle, display: "block", borderRadius: 0 }}>
                  {t("navbar.vpn")}
                </a>
              </Link>
              <a
                href="https://ptb.discord.com/oauth2/authorize?client_id=1324530344900431923"
                style={{
                  ...linkStyle,
                  display: "block",
                  borderRadius: "0 0 6px 6px",
                }}
              >
                {t("navbar.bot")}
              </a>
            </div>
          )}
        </DropdownButton>
        {!loading && user && (
          <>
            <DropdownButton label={t("navbar.manage")} showKey="manage">
              {show === "manage" && (
                <div
                  style={{
                    position: "absolute",
                    top: "100%",
                    left: 0,
                    background: "#23242a",
                    border: "1px solid #23242a",
                    borderRadius: 6,
                    minWidth: 140,
                    boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
                    zIndex: 100,
                    marginTop: 2,
                  }}
                  onMouseLeave={() => setShow("")}
                >
                  {!user.isStudio && (
                    <Link href="/studios" legacyBehavior>
                      <span
                        style={{
                          ...linkStyle,
                          display: "block",
                          borderRadius: 0,
                        }}
                      >
                        {t("navbar.studios")}
                      </span>
                    </Link>
                  )}
                  <Link href="/oauth2/apps" legacyBehavior>
                    <span
                      style={{
                        ...linkStyle,
                        display: "block",
                        borderRadius: 0,
                      }}
                    >
                      {t("navbar.oauth2")}
                    </span>
                  </Link>
                  <Link href="/dev-zone/my-items" legacyBehavior>
                    <span
                      style={{
                        ...linkStyle,
                        display: "block",
                        borderRadius: 0,
                      }}
                    >
                      {t("navbar.items")}
                    </span>
                  </Link>
                  <Link href="/dev-zone/my-games" legacyBehavior>
                    <span
                      style={{
                        ...linkStyle,
                        display: "block",
                        borderRadius: "0 0 6px 6px",
                      }}
                    >
                      {t("navbar.games")}
                    </span>
                  </Link>
                  <hr
                    style={{
                      border: "none",
                      borderTop: "1px solid #35363b",
                      margin: "6px 0",
                    }}
                  />
                  <Link href="/settings" legacyBehavior>
                    <span
                      style={{
                        ...linkStyle,
                        display: "block",
                        borderRadius: "0 0 6px 6px",
                      }}
                    >
                      {t("navbar.settings")}
                    </span>
                  </Link>
                </div>
              )}
            </DropdownButton>
            <button
              onClick={handleLogout}
              style={logoutBtnStyle}
              title={t("navbar.logout")}
            >
              <i className="fa fa-sign-out-alt" aria-hidden="true"></i>
            </button>
          </>
        )}
        {!user && !loading && (
          <Link href="/login" legacyBehavior>
            <span style={loginStyle}>{t("navbar.login")}</span>
          </Link>
        )}
      </>
    );
  }

  // Dropdown utilitaire
  const DropdownButton = ({ label, showKey, children }: any) => (
    <div style={{ display: "inline-block", position: "relative" }}>
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
        }}
        onClick={(e) => {
          e.preventDefault();
          setShow((prev) => (prev === showKey ? "" : showKey));
        }}
      >
        {label} <span style={{ fontSize: 12 }}>▼</span>
      </button>
      {show === showKey && children}
    </div>
  );

  return (
    <header style={headerStyle}>
      <div style={containerStyle}>
        <div style={rowStyle}>
          <div style={logoGroupStyle}>
            <Link style={logoStyle} href="/" legacyBehavior>
              <span
                style={{
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <CachedImage
                  src="/assets/icons/favicon-32x32.png"
                  alt="Croissant Logo"
                  style={logoImgStyle}
                />
                <div style={logoSpanStyle}>CROISSANT</div>
              </span>
            </Link>
          </div>
          <Searchbar />
          <nav>
            <div className="links-group" style={linksGroupStyle}>
              {show === "roles" && user && <RolesDropdown user={user} />}
              {user && <UserBlock loading={loading} user={user} />}
              <DesktopLinks />
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}
