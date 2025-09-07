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

  const handleLogout = () => {
    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    localStorage.removeItem("token");
    setUser(null);
  };

  // Bloc crédits + avatar + sélecteur de rôle
  const UserBlock = ({ loading, user }: any) => (
    <div className="inline-flex items-center gap-1.5 ml-2.5">
      <Link href="/buy-credits" className="no-underline">
        <div className="flex items-center bg-[#23242a] rounded px-2 py-1">
          <CachedImage src="/assets/credit.png" className="w-4 h-4 mr-1.5" />
          <div className="text-[#bdbdbd] text-sm font-semibold">
            <span>{loading ? "..." : user?.balance}</span>
          </div>
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
          className="w-7 h-7 rounded-full object-cover border border-[#23242a]"
        />
      </Link>
      <button
        className="text-[#bdbdbd] px-2 py-0.5 rounded cursor-pointer bg-transparent border-none inline-flex items-center font-semibold gap-1"
        onClick={(e) => {
          e.preventDefault();
          setShow((prev) => (prev === "roles" ? "" : "roles"));
        }}
      >
        <span className="text-xs">▼</span>
      </button>
    </div>
  );

  // Menu déroulant des rôles
  const RolesDropdown = ({ user }: any) => (
    <div
      className="absolute top-full left-0 bg-[#23242a] border border-[#23242a] rounded-md min-w-[140px] w-[300px] shadow-lg z-100 mt-0.5"
      onMouseLeave={() => setShow("")}
    >
      {user?.roles.map((role: any) => {
        const studio = user.studios.find(
          (studio: any) => studio.user_id === role
        );
        return (
          <button
            className="w-full text-left p-2 flex items-center gap-2 text-[#bdbdbd] hover:bg-[#2a2b31] rounded transition-colors"
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
                  setShow("");
                })
                .catch((err) => console.error(err));
            }}
          >
            <CachedImage
              src={"/avatar/" + role}
              alt="avatar"
              className="w-7 h-7 rounded-full object-cover border border-[#23242a]"
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

  // Groupe de liens desktop
  function DesktopLinks() {
    const { t } = useTranslation("common");
    return (
      <>
        <Link
          href="/api-docs"
          className="text-[#bdbdbd] text-[15px] p-[0.2rem_0.7rem] rounded hover:bg-[#23242a] transition-colors"
        >
          {t("navbar.docs")}
        </Link>
        <Link
          href="/game-shop"
          className="text-[#bdbdbd] text-[15px] p-[0.2rem_0.7rem] rounded hover:bg-[#23242a] transition-colors"
        >
          {t("navbar.shop")}
        </Link>
        <Link
          href="/marketplace"
          className="text-[#bdbdbd] text-[15px] p-[0.2rem_0.7rem] rounded hover:bg-[#23242a] transition-colors"
        >
          {t("navbar.marketplace")}
        </Link>
        <DropdownButton label={t("navbar.install")} showKey="install">
          {show === "install" && (
            <div
              className="absolute top-full left-0 bg-[#23242a] border border-[#23242a] rounded-md min-w-[140px] shadow-lg z-100 mt-0.5"
              onMouseLeave={() => setShow("")}
            >
              <Link
                href="/download-launcher"
                className="text-[#bdbdbd] text-[15px] p-[0.2rem_0.7rem] rounded hover:bg-[#2a2b31] transition-colors"
              >
                {t("navbar.launcher")}
              </Link>
              <Link
                href="https://github.com/Croissant-API/Croissant-VPN/releases"
                className="text-[#bdbdbd] text-[15px] p-[0.2rem_0.7rem] rounded hover:bg-[#2a2b31] transition-colors"
              >
                {t("navbar.vpn")}
              </Link>
              <a
                href="https://ptb.discord.com/oauth2/authorize?client_id=1324530344900431923"
                className="text-[#bdbdbd] text-[15px] p-[0.2rem_0.7rem] rounded-b-md hover:bg-[#2a2b31] transition-colors"
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
                  className="absolute top-full left-0 bg-[#23242a] border border-[#23242a] rounded-md min-w-[140px] shadow-lg z-100 mt-0.5"
                  onMouseLeave={() => setShow("")}
                >
                  {!user.isStudio && (
                    <Link
                      href="/studios"
                      className="text-[#bdbdbd] text-[15px] p-[0.2rem_0.7rem] rounded hover:bg-[#2a2b31] transition-colors"
                    >
                      {t("navbar.studios")}
                    </Link>
                  )}
                  <Link
                    href="/oauth2/apps"
                    className="text-[#bdbdbd] text-[15px] p-[0.2rem_0.7rem] rounded hover:bg-[#2a2b31] transition-colors"
                  >
                    {t("navbar.oauth2")}
                  </Link>
                  <Link
                    href="/dev-zone/my-items"
                    className="text-[#bdbdbd] text-[15px] p-[0.2rem_0.7rem] rounded hover:bg-[#2a2b31] transition-colors"
                  >
                    {t("navbar.items")}
                  </Link>
                  <Link
                    href="/dev-zone/my-games"
                    className="text-[#bdbdbd] text-[15px] p-[0.2rem_0.7rem] rounded-b-md hover:bg-[#2a2b31] transition-colors"
                  >
                    {t("navbar.games")}
                  </Link>
                  <Divider />
                  <Link
                    href="/settings"
                    className="text-[#bdbdbd] text-[15px] p-[0.2rem_0.7rem] rounded-b-md hover:bg-[#2a2b31] transition-colors"
                  >
                    {t("navbar.settings")}
                  </Link>
                </div>
              )}
            </DropdownButton>
            <button
              onClick={handleLogout}
              className="ml-1 bg-[#23242a] text-white border-none rounded-md py-1 px-3 cursor-pointer text-[15px]"
              title={t("navbar.logout")}
            >
              <i className="fa fa-sign-out-alt" aria-hidden="true"></i>
            </button>
          </>
        )}
        {!user && !loading && (
          <Link href="/login" legacyBehavior>
            <span className="text-[#8fa1c7] font-semibold bg-[#23242a] p-[0.2rem_0.7rem] rounded cursor-pointer">
              {t("navbar.login")}
            </span>
          </Link>
        )}
      </>
    );
  }

  // Dropdown utilitaire
  const DropdownButton = ({ label, showKey, children }: any) => (
    <div className="inline-block relative">
      <button
        className="cursor-pointer bg-transparent border-none outline-none inline-flex items-center font-semibold gap-1 text-[#bdbdbd] px-2 py-0.5 rounded hover:bg-[#23242a] transition-colors"
        onClick={(e) => {
          e.preventDefault();
          setShow((prev) => (prev === showKey ? "" : showKey));
        }}
      >
        {label} <span className="text-xs">▼</span>
      </button>
      {show === showKey && children}
    </div>
  );

  // Convertir la ligne HR en div avec Tailwind
  const Divider = () => (
    <div className="h-px bg-[#35363b] my-1.5" />
  );

  return (
    <header className="w-full bg-[#191b20] text-[#e2e8f0] border-b border-[#23242a] py-1 shadow-sm relative z-10">
      <div className="flex items-center justify-between max-w-[1200px] mx-auto px-5">
        <div className="flex items-center justify-between w-full h-12">
          <div className="flex items-center mr-5">
            <Link
              href="/"
              className="text-[#f3f3f3] no-underline font-bold text-2xl tracking-wider"
            >
              <span className="cursor-pointer flex items-center">
                <CachedImage
                  src="/assets/icons/favicon-32x32.avif"
                  alt="Croissant Logo"
                  className="w-7 h-7 relative -top-1 align-middle mr-1.5"
                />
                <div className="inline-flex items-center font-black relative text-xl -top-0.5">
                  CROISSANT
                </div>
              </span>
            </Link>
          </div>
          <Searchbar />
          <nav>
            <div className="flex items-center gap-3 mt-0 flex-row relative">
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
