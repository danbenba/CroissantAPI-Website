import React, { Component, useEffect, useState } from "react";
import Link from "next/link";
import SearchBar from "../../../components/Searchbar";
import useAuth from "../../../hooks/useAuth";
import CachedImage from "../../../components/utils/CachedImage";

const Navbar: React.FC = () => {
  const { user, token, setUser } = useAuth();
  const [showRoles, setShowRoles] = useState(false);

  if (!token) {
    return null; // or a loading spinner
  }

  const handleRoleChange = async (role: string) => {
    try {
      await fetch("/api/users/change-role", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });
      const res = await fetch("/api/users/@me", {
        headers: { "Content-Type": "application/json" },
      });
      const userData = await res.json();
      setUser(userData);
      setShowRoles(false);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="navbar-fixed">
      <header>
        {/* <h1>Croissant Inventory System</h1> */}
        <nav className="navbar-nav">
          <div className="links-group">
            <Link href="/launcher/home">Library</Link>
            <Link href="/game-shop?from=launcher">Shop</Link>
            <div className="create-dropdown">
              Manage
              <div className="create-dropdown-content">
                <Link href="/studios?from=launcher">Studios</Link>
                <Link href="/oauth2/apps?from=launcher">OAuth2</Link>
                <Link href="/dev-zone/my-items?from=launcher">My Items</Link>
                <Link href="/dev-zone/my-games?from=launcher">My Games</Link>
              </div>
            </div>
          </div>
          <SearchBar />
          <div className="navbar-user-group" style={{ position: "relative" }}>
            <Link
              href="/buy-credits?from=launcher"
              style={{ textDecoration: "none" }}
            >
              <div className="navbar-credits">
                <CachedImage src="/assets/credit.png" className="navbar-credit-img" />
                <div className="navbar-balance">
                  <span id="my-balance">{user?.balance}</span>
                </div>
              </div>
            </Link>
            <Link
              href="/profile?from=launcher"
              style={{
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              <CachedImage
                className="navbar-avatar"
                src={`/avatar/${user?.id}`}
                style={{
                  objectFit: "cover",
                  cursor: user?.roles?.length > 1 ? "pointer" : "default",
                }}
              />
            </Link>
            {user?.roles?.length > 1 && (
              <span
                style={{
                  fontSize: 14,
                  color: "#bdbdbd",
                  cursor: "pointer",
                  userSelect: "none",
                  transition: "transform 0.2s",
                  transform: showRoles ? "rotate(180deg)" : "none",
                  marginRight: 24,
                }}
                onClick={e => {
                  e.preventDefault();
                  setShowRoles(v => !v);
                }}
              >
                ▼
              </span>
            )}
            {/* Dropdown pour changer de rôle */}
            {showRoles && user?.roles?.length > 1 && (
              <div
                style={{
                  position: "absolute",
                  top: 48,
                  right: 0,
                  background: "#23242a",
                  border: "1px solid #23242a",
                  borderRadius: 6,
                  minWidth: 140,
                  boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
                  zIndex: 100,
                  marginTop: 2,
                }}
                onMouseLeave={() => setShowRoles(false)}
              >
                {user.roles.map((role: string) => (
                  <button
                    key={role}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      width: "100%",
                      background: "none",
                      border: "none",
                      color: "#e2e8f0",
                      padding: "8px 12px",
                      cursor: "pointer",
                      textAlign: "left",
                    }}
                    onClick={() => handleRoleChange(role)}
                  >
                    <CachedImage
                      src={`/avatar/${role}`}
                      alt="avatar"
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: "50%",
                        objectFit: "cover",
                        marginRight: 8,
                      }}
                    />
                    <span>
                      {user.studios?.find((s: any) => s.user_id === role)
                        ?.username || "Me"}
                    </span>
                  </button>
                ))}
              </div>
            )}
            <button
              className="method navbar-logout-btn"
              onClick={() => {
                localStorage.removeItem("token");
                localStorage.removeItem("verificationKey");
                document.cookie =
                  "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
                location.reload();
              }}
            >
              <i className="fa fa-sign-out"></i>
            </button>
          </div>
        </nav>
      </header>
    </div>
  );
};

export default Navbar;
