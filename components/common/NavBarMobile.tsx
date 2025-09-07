import React, { useState, useEffect } from "react";
import Link from "next/link";
import useAuth from "../../hooks/useAuth";
import CachedImage from "../utils/CachedImage";
import Searchbar from "../Searchbar";
import Certification from "./Certification";
import { useTranslation } from "next-i18next";

export default function NavBarMobile() {
  const { user, loading, setUser } = useAuth();
  const { t } = useTranslation("common");
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

  const handleLogout = () => {
    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    localStorage.removeItem("token");
    setUser(null);
  };

  // Bloc crédits + avatar + sélecteur de rôle (pour drawer)
  const UserBlock = ({ loading, user }: any) => (
    <div className="flex items-center gap-2 mb-2.5">
      <Link href="/buy-credits">
        <div className="flex items-center bg-secondary rounded px-2 py-1">
          <CachedImage src="/assets/credit.png" className="w-4 h-4" />
          <span className="text-[#bdbdbd] text-sm font-semibold ml-1">
            {loading ? "..." : user?.balance}
          </span>
        </div>
      </Link>
      <Link href="/profile">
        <CachedImage
          src={
            loading
              ? "/avatar/default.png"
              : `/avatar/${user.role || user.id}`
          }
          alt="avatar"
          className="w-6 h-6 rounded-full object-cover border border-secondary ml-1.5"
        />
      </Link>
      <button
        className="text-[#bdbdbd] p-0 rounded cursor-pointer bg-transparent border-none inline-flex items-center font-semibold"
        onClick={() => setShowRoles((prev) => !prev)}
      >
        <span className="text-xs">▼</span>
      </button>
      <button
        onClick={handleLogout}
        className="ml-1 bg-secondary text-white border-none rounded py-0.5 px-2 cursor-pointer text-sm"
        title="Logout"
      >
        <i className="fa fa-sign-out-alt" aria-hidden="true"></i>
      </button>
    </div>
  );

  // Menu déroulant des rôles (pour drawer)
  const RolesDropdown = ({ user }: any) => (
    <div className="bg-secondary border border-[#35363b] rounded-md min-w-[140px] shadow-lg z-50 mb-2.5 mt-0.5 p-1">
      {user?.roles.map((role: any) => {
        const studio = user.studios.find(
          (studio: any) => studio.user_id === role
        );
        return (
          <button
            className="w-full flex items-center gap-2 text-[#bdbdbd] hover:bg-[#2a2b31] rounded transition-colors px-0 py-1.5 text-left bg-transparent border-none"
            key={role}
            onClick={() => {
              fetch("/api/users/change-role", {
                headers: { "Content-Type": "application/json" },
                method: "POST",
                body: JSON.stringify({ role }),
              })
                .then((res) =>
                  res.ok ? res.json() : Promise.reject("Failed to change role")
                )
                .then(() =>
                  fetch("/api/users/@me", {
                    headers: { "Content-Type": "application/json" },
                  })
                )
                .then((res) => res.json())
                .then((userData) => {
                  setUser(userData);
                  setShowRoles(false);
                })
                .catch((err) => console.error(err));
            }}
          >
            <CachedImage
              src={"/avatar/" + role}
              alt="avatar"
              className="w-6 h-6 rounded-full object-cover border border-secondary ml-1.5"
            />
            <span className="whitespace-nowrap">
              {studio?.me.username || "Me"}
              <Certification
                user={studio ? { ...studio, isStudio: true } : studio}
                className="w-4 h-4 ml-1 relative -top-0.5 align-middle"
              />
            </span>
          </button>
        );
      })}
    </div>
  );

  // Groupe de liens mobile
  function MobileLinks() {
    return (
      <>
        <Link
          href="/api-docs"
          className="text-[#bdbdbd] text-sm py-0.5 px-2 rounded hover:bg-[#2a2b31] transition-colors block my-0.5"
        >
          {t("navbar.docs")}
        </Link>
        <Link
          href="/game-shop"
          className="text-[#bdbdbd] text-sm py-0.5 px-2 rounded hover:bg-[#2a2b31] transition-colors block my-0.5"
        >
          {t("navbar.shop")}
        </Link>
        <Link
          href="/marketplace"
          className="text-[#bdbdbd] text-sm py-0.5 px-2 rounded hover:bg-[#2a2b31] transition-colors block my-0.5"
        >
          {t("navbar.marketplace")}
        </Link>
        <Link
          href="/download-launcher"
          className="text-[#bdbdbd] text-sm py-0.5 px-2 rounded hover:bg-[#2a2b31] transition-colors block my-0.5"
        >
          {t("navbar.downloadLauncher")}
        </Link>
        <Link
          href="https://github.com/Croissant-API/Croissant-VPN/releases"
          className="text-[#bdbdbd] text-sm py-0.5 px-2 rounded hover:bg-[#2a2b31] transition-colors block my-0.5"
        >
          <a style={{ display: "block", borderRadius: 0 }}>{t("navbar.vpn")}</a>
        </Link>
        <a
          href="https://ptb.discord.com/oauth2/authorize?client_id=1324530344900431923"
          className="text-[#bdbdbd] text-sm py-0.5 px-2 rounded hover:bg-[#2a2b31] transition-colors block my-0.5"
        >
          {t("navbar.discordBot")}
        </a>
        {!loading && user && (
          <>
            <Link
              href="/studios"
              className="text-[#bdbdbd] text-sm py-0.5 px-2 rounded hover:bg-[#2a2b31] transition-colors block my-0.5"
            >
              {t("navbar.studios")}
            </Link>
            <Link
              href="/oauth2/apps"
              className="text-[#bdbdbd] text-sm py-0.5 px-2 rounded hover:bg-[#2a2b31] transition-colors block my-0.5"
            >
              {t("navbar.oauth2")}
            </Link>
            <Link
              href="/settings"
              className="text-[#bdbdbd] text-sm py-0.5 px-2 rounded hover:bg-[#2a2b31] transition-colors block my-0.5"
            >
              {t("navbar.settings")}
            </Link>
          </>
        )}
      </>
    );
  }

  return (
    <header className="w-full bg-primary text-[#e2e8f0] border-b border-secondary py-0.5 shadow-sm relative z-10">
      <div className="flex flex-col max-w-[1200px] mx-auto w-full">
        <div className="flex items-center justify-between w-full mb-1.5 relative">
          {/* Hamburger menu */}
          <button
            className="bg-transparent border-none text-[#e2e8f0] text-3xl cursor-pointer p-2 m-0 flex-none z-20"
            aria-label="Open menu"
            onClick={() => setDrawerOpen(true)}
          >
            &#9776;
          </button>

          {/* Logo centré */}
          <div className="flex items-center justify-center mr-0 mb-2.5 flex-auto absolute inset-x-0 pointer-events-none z-10">
            <Link
              href="/"
              className="text-[#f3f3f3] no-underline font-bold text-lg tracking-wide pointer-events-auto"
            >
              <span className="cursor-pointer flex items-center mt-3">
                <CachedImage
                  src="/assets/icons/favicon-32x32.png"
                  alt="Croissant Logo"
                  className="w-7 h-7 relative top-0 align-middle mr-1.5"
                />
                <div className="inline-flex items-center font-black relative text-2xl">
                  CROISSANT
                </div>
              </span>
            </Link>
          </div>

          {/* Zone utilisateur vide */}
          <div className="flex-none flex items-center z-20 ml-auto" />

          {/* Drawer */}
          <nav>
            {drawerOpen && (
              <>
                {/* Drawer content */}
                <div
                  className={`fixed top-0 left-0 w-4/5 max-w-[320px] h-[calc(100vh-2.4rem)] bg-secondary z-[9999] shadow-lg p-5 flex flex-col gap-4.5 transition-transform duration-250 ease-[cubic-bezier(.4,0,.2,1)] ${
                    drawerVisible
                      ? "translate-x-0 opacity-100"
                      : "-translate-x-full opacity-0"
                  }`}
                >
                  <div className="flex flex-row items-center mb-2.5">
                    <div className="flex-1">
                      <Searchbar />
                    </div>
                    <button
                      className="bg-transparent border-none text-[#e2e8f0] text-3xl cursor-pointer ml-2"
                      aria-label="Close menu"
                      onClick={() => setDrawerOpen(false)}
                    >
                      &times;
                    </button>
                  </div>
                  {/* Zone utilisateur and changement de rôle */}
                  {!user && !loading && (
                    <Link href="/login" legacyBehavior>
                      <span className="text-[#8fa1c7] font-semibold bg-[#23242a] rounded px-3 py-1 text-sm block">
                        Login
                      </span>
                    </Link>
                  )}
                  {user && (
                    <div className="flex flex-col items-center w-full">
                      <UserBlock loading={loading} user={user} />
                      {showRoles && <RolesDropdown user={user} />}
                    </div>
                  )}
                  <MobileLinks />
                </div>

                {/* Overlay */}
                <div
                  onClick={() => setDrawerOpen(false)}
                  className="fixed inset-0 bg-black/25 z-[9998]"
                />
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
