"use client"

import React, { useState } from "react";
import Link from "next/link";
import { useTranslation } from "next-i18next";
import useAuth from "../../hooks/useAuth";
import CachedImage from "../utils/CachedImage";
import Searchbar from "../Searchbar";
import Certification from "./Certification";
import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  NavbarMenuToggle,
  NavbarMenu,
  NavbarMenuItem,
  Button,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Avatar,
  Chip,
  Skeleton
} from "@heroui/react";

export default function NavBarDesktop() {
  const { user, loading, setUser } = useAuth();
  const [show, setShow] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isInstallExpanded, setIsInstallExpanded] = useState(false);
  const [isManageExpanded, setIsManageExpanded] = useState(false);
  const { t } = useTranslation("common");

  const handleLogout = () => {
    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    localStorage.removeItem("token");
    setUser(null);
  };

  const handleCloseDropdown = () => {
    setIsUserDropdownOpen(false);
    setIsInstallExpanded(false);
    setIsManageExpanded(false);
  };

  // Fonction pour gérer le changement de rôle
  const handleRoleChange = (role: any) => {
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
        handleCloseDropdown();
      })
      .catch((err) => console.error(err));
  };

  // Créer les éléments du dropdown utilisateur
  const getUserMenuItems = () => {
    const baseItems = [
      <DropdownItem key="profile-header" className="h-auto py-4 cursor-default" textValue="Profile">
        <div className="flex items-center gap-3">
          <Avatar
            src={`/avatar/${user?.role || user?.id}`}
            className="w-12 h-12 border border-[#23242a]"
            showFallback
            fallback={<i className="fas fa-user text-white"></i>}
          />
          <div className="flex flex-col">
            <span className="font-semibold text-white">{user?.username || "User"}</span>
            <div className="flex items-center gap-2">
              <Chip size="sm" className="bg-[#23242a] text-[#bdbdbd] text-xs">
                {user?.balance || 0} crédits
              </Chip>
            </div>
          </div>
        </div>
      </DropdownItem>,

      <DropdownItem 
        key="profile" 
        startContent={<i className="fas fa-user text-blue-400"></i>}
        className="text-white hover:text-blue-300"
        onPress={handleCloseDropdown}
        textValue="Profile"
      >
        <Link href="/profile" className="w-full block">Profile</Link>
      </DropdownItem>,

      <DropdownItem 
        key="buy-credits" 
        startContent={<CachedImage src="/assets/credit.avif" className="w-4 h-4" />}
        className="text-white hover:text-yellow-300"
        onPress={handleCloseDropdown}
        textValue="Buy Credits"
      >
        <Link href="/buy-credits" className="w-full block">Acheter des crédits</Link>
      </DropdownItem>
    ];

    // Ajouter les rôles si disponibles
    if (user?.roles && user.roles.length > 1) {
      baseItems.push(
        <DropdownItem
          key="roles-header"
          className="border-t border-white/10 text-white cursor-default font-semibold"
          textValue="Changer de rôle"
        >
          Changer de rôle
        </DropdownItem>
      );

      user.roles.forEach((role: any) => {
        const studio = user.studios.find((studio: any) => studio.user_id === role);
        baseItems.push(
          <DropdownItem
            key={`role-${role}`}
            className="text-white hover:text-blue-300"
            onPress={() => handleRoleChange(role)}
            textValue={studio?.me.username || "Me"}
          >
            <div className="flex items-center gap-2">
              <Avatar
                src={`/avatar/${role}`}
                className="w-6 h-6 border border-[#23242a]"
                showFallback
              />
              <span className="flex items-center gap-1">
                {studio?.me.username || "Me"}
                <Certification
                  user={studio ? { ...studio, isStudio: true } : studio}
                  className="w-4 h-4 ml-1"
                />
              </span>
            </div>
          </DropdownItem>
        );
      });
    }

    // Menu de gestion pour les utilisateurs connectés
    if (!user?.isStudio) {
      baseItems.push(
        <DropdownItem
          key="manage-toggle"
          className="border-t border-white/10 text-white hover:text-blue-300"
          startContent={
            <i className={`fas fa-chevron-down text-blue-400 transition-transform duration-300 ${
              isManageExpanded ? 'rotate-180' : 'rotate-0'
            }`}></i>
          }
          onPress={() => setIsManageExpanded(!isManageExpanded)}
          textValue={t("navbar.manage")}
        >
          {t("navbar.manage")}
        </DropdownItem>
      );

      if (isManageExpanded) {
        baseItems.push(
          <DropdownItem key="studios" className="text-white hover:text-blue-300" onPress={handleCloseDropdown} textValue="Studios">
            <Link href="/studios" className="w-full block">{t("navbar.studios")}</Link>
          </DropdownItem>,
          <DropdownItem key="oauth2" className="text-white hover:text-blue-300" onPress={handleCloseDropdown} textValue="OAuth2">
            <Link href="/oauth2/apps" className="w-full block">{t("navbar.oauth2")}</Link>
          </DropdownItem>,
          <DropdownItem key="items" className="text-white hover:text-blue-300" onPress={handleCloseDropdown} textValue="Items">
            <Link href="/dev-zone/my-items" className="w-full block">{t("navbar.items")}</Link>
          </DropdownItem>,
          <DropdownItem key="games" className="text-white hover:text-blue-300" onPress={handleCloseDropdown} textValue="Games">
            <Link href="/dev-zone/my-games" className="w-full block">{t("navbar.games")}</Link>
          </DropdownItem>,
          <DropdownItem key="settings" className="text-white hover:text-blue-300 border-t border-white/10" onPress={handleCloseDropdown} textValue="Settings">
            <Link href="/settings" className="w-full block">{t("navbar.settings")}</Link>
          </DropdownItem>
        );
      }
    }

    // Bouton de déconnexion
    baseItems.push(
      <DropdownItem
        key="logout"
        color="danger"
        startContent={<i className="fas fa-sign-out-alt"></i>}
        className="text-white hover:text-red-300 border-t border-white/10"
        onPress={() => {
          handleLogout();
          handleCloseDropdown();
        }}
        textValue="Logout"
      >
        Déconnexion
      </DropdownItem>
    );

    return baseItems;
  };

  return (
    <Navbar
      onMenuOpenChange={setIsMenuOpen}
      isMenuOpen={isMenuOpen}
      isBordered
      className="bg-[#191b20]/95 backdrop-blur-lg border-[#23242a]"
      maxWidth="xl"
    >
      <NavbarContent justify="start">
        <NavbarBrand as={Link} href="/" className="gap-3">
          <CachedImage
            src="/assets/icons/favicon-32x32.avif"
            alt="Croissant Logo"
            className="w-8 h-8"
          />
          <p className="font-black text-xl text-[#f3f3f3] tracking-wider">CROISSANT</p>
        </NavbarBrand>
      </NavbarContent>

      <NavbarContent className="hidden sm:flex flex-1 justify-center max-w-md">
        <NavbarItem className="w-full">
          <Searchbar />
        </NavbarItem>
      </NavbarContent>

      <NavbarContent className="hidden sm:flex gap-4" justify="center">
        <NavbarItem>
          <Link href="/api-docs" className="text-[#bdbdbd] hover:text-white transition-colors flex items-center gap-2">
            <i className="fas fa-book"></i>
            {t("navbar.docs")}
          </Link>
        </NavbarItem>

        <NavbarItem>
          <Link href="/game-shop" className="text-[#bdbdbd] hover:text-white transition-colors flex items-center gap-2">
            <i className="fas fa-shopping-cart"></i>
            {t("navbar.shop")}
          </Link>
        </NavbarItem>

        <NavbarItem>
          <Link href="/marketplace" className="text-[#bdbdbd] hover:text-white transition-colors flex items-center gap-2">
            <i className="fas fa-store"></i>
            {t("navbar.marketplace")}
          </Link>
        </NavbarItem>

        <NavbarItem>
          <Dropdown placement="bottom-end">
            <DropdownTrigger>
              <Button
                variant="light"
                className="bg-transparent data-[hover=true]:bg-[#23242a] text-[#bdbdbd] p-2 h-auto"
              >
                <span className="flex items-center gap-2">
                  <i className="fas fa-download"></i>
                  {t("navbar.install")}
                  <i className="fas fa-chevron-down text-xs"></i>
                </span>
              </Button>
            </DropdownTrigger>
            <DropdownMenu
              aria-label="Installation options"
              className="w-64"
            >
              <DropdownItem key="launcher" textValue="Launcher">
                <Link href="/download-launcher" className="w-full block">
                  <span className="flex items-center gap-2">
                    <i className="fas fa-download text-blue-400"></i>
                    {t("navbar.launcher")}
                  </span>
                </Link>
              </DropdownItem>
              <DropdownItem key="vpn" textValue="VPN">
                <a href="https://github.com/Croissant-API/Croissant-VPN/releases" className="w-full block">
                  <span className="flex items-center gap-2">
                    <i className="fas fa-shield-alt text-green-400"></i>
                    {t("navbar.vpn")}
                  </span>
                </a>
              </DropdownItem>
              <DropdownItem key="bot" textValue="Bot">
                <a href="https://ptb.discord.com/oauth2/authorize?client_id=1324530344900431923" className="w-full block">
                  <span className="flex items-center gap-2">
                    <i className="fab fa-discord text-purple-400"></i>
                    {t("navbar.bot")}
                  </span>
                </a>
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </NavbarItem>
      </NavbarContent>

      <NavbarContent justify="end">
        {loading ? (
          <div className="flex items-center gap-2">
            <Skeleton className="w-8 h-8 rounded-full" />
            <Skeleton className="w-24 h-4 rounded" />
          </div>
        ) : user ? (
          <Dropdown
            placement="bottom-end"
            isOpen={isUserDropdownOpen}
            onOpenChange={setIsUserDropdownOpen}
          >
            <DropdownTrigger>
              <Button
                variant="light"
                className="bg-transparent data-[hover=true]:bg-[#23242a] text-white p-2 h-auto"
              >
                <div className="flex items-center gap-2">
                  <Chip size="sm" className="bg-[#23242a] text-[#bdbdbd] flex items-center gap-1">
                    <CachedImage src="/assets/credit.avif" className="w-3 h-3" />
                    <span>{loading ? "..." : user?.balance}</span>
                  </Chip>
                  <Avatar
                    src={`/avatar/${user?.role || user?.id}`}
                    className="w-8 h-8 border border-[#23242a]"
                    showFallback
                    fallback={<i className="fas fa-user text-white"></i>}
                  />
                  <i className="fas fa-chevron-down text-[#bdbdbd] text-xs"></i>
                </div>
              </Button>
            </DropdownTrigger>
            <DropdownMenu
              aria-label="Actions du profil"
              className="w-80"
              closeOnSelect={false}
            >
              {getUserMenuItems()}
            </DropdownMenu>
          </Dropdown>
        ) : (
          <>
            <NavbarItem className="hidden lg:flex">
              <Button 
                as={Link} 
                href="/login" 
                variant="light" 
                className="text-[#bdbdbd] hover:text-white"
              >
                {t("navbar.login")}
              </Button>
            </NavbarItem>
          </>
        )}
      </NavbarContent>

      <NavbarMenuToggle
        aria-label={isMenuOpen ? "Fermer le menu" : "Ouvrir le menu"}
        className="sm:hidden text-white"
      />

      <NavbarMenu className="bg-[#191b20]/95 backdrop-blur-xl border-t border-[#23242a] pt-6">
        <NavbarMenuItem>
          <div className="w-full mb-4">
            <Searchbar />
          </div>
        </NavbarMenuItem>

        <NavbarMenuItem>
          <Link href="/api-docs" className="w-full flex items-center gap-4 py-3 text-lg text-[#bdbdbd] hover:text-white" onClick={() => setIsMenuOpen(false)}>
            <i className="fas fa-book text-blue-400"></i>
            {t("navbar.docs")}
          </Link>
        </NavbarMenuItem>

        <NavbarMenuItem>
          <Link href="/game-shop" className="w-full flex items-center gap-4 py-3 text-lg text-[#bdbdbd] hover:text-white" onClick={() => setIsMenuOpen(false)}>
            <i className="fas fa-shopping-cart text-green-400"></i>
            {t("navbar.shop")}
          </Link>
        </NavbarMenuItem>

        <NavbarMenuItem>
          <Link href="/marketplace" className="w-full flex items-center gap-4 py-3 text-lg text-[#bdbdbd] hover:text-white" onClick={() => setIsMenuOpen(false)}>
            <i className="fas fa-store text-purple-400"></i>
            {t("navbar.marketplace")}
          </Link>
        </NavbarMenuItem>

        {loading ? (
          <NavbarMenuItem className="pt-6 border-t border-[#23242a]">
            <div className="w-full flex items-center gap-4 py-3">
              <Skeleton className="w-10 h-10 rounded-full" />
              <div className="flex flex-col gap-2 flex-1">
                <Skeleton className="w-20 h-4 rounded" />
                <Skeleton className="w-16 h-3 rounded" />
              </div>
            </div>
          </NavbarMenuItem>
        ) : user ? (
          <>
            <NavbarMenuItem className="pt-6 border-t border-[#23242a]">
              <div className="w-full flex items-center gap-4 py-3">
                <Avatar
                  src={`/avatar/${user?.role || user?.id}`}
                  className="w-10 h-10 border border-[#23242a]"
                  showFallback
                />
                <div className="flex flex-col">
                  <span className="font-semibold text-white">{user?.username || "User"}</span>
                  <div className="flex items-center gap-2">
                    <Chip size="sm" className="bg-[#23242a] text-[#bdbdbd] text-xs flex items-center gap-1">
                      <CachedImage src="/assets/credit.avif" className="w-3 h-3" />
                      <span>{user?.balance || 0}</span>
                    </Chip>
                  </div>
                </div>
              </div>
            </NavbarMenuItem>
            <NavbarMenuItem>
              <Link href="/profile" className="w-full flex items-center gap-4 py-3 text-lg text-[#bdbdbd] hover:text-white" onClick={() => setIsMenuOpen(false)}>
                <i className="fas fa-user text-blue-400"></i>
                Profile
              </Link>
            </NavbarMenuItem>
            <NavbarMenuItem>
              <Button variant="ghost" fullWidth className="text-red-400 hover:text-red-300 justify-start" onPress={handleLogout}>
                <i className="fas fa-sign-out-alt mr-2"></i>
                Déconnexion
              </Button>
            </NavbarMenuItem>
          </>
        ) : (
          <>
            <NavbarMenuItem className="pt-6">
              <Button as={Link} href="/login" variant="ghost" fullWidth className="text-white">
                {t("navbar.login")}
              </Button>
            </NavbarMenuItem>
          </>
        )}
      </NavbarMenu>
    </Navbar>
  );
}