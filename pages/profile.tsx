"use client"

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import useAuth from "../hooks/useAuth";
import useUserCache from "../hooks/useUserCache";
import useIsMobile from "../hooks/useIsMobile";
import CachedImage from "../components/utils/CachedImage";
import TradePanel from "../components/TradePanel";
import Inventory from "../components/Inventory";
import Certification from "../components/common/Certification";
import { useTranslation, Trans } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import {
  Card,
  CardBody,
  Button,
  Input,
  Chip,
  Skeleton,
} from "@heroui/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserShield, faShieldHalved, faUsers, faBolt, faBug, faCodeBranch, faHandshake, faHeadset, faScrewdriverWrench } from "@fortawesome/free-solid-svg-icons";

export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common"])),
    },
  };
}

const endpoint = "/api";

// Give Credits Modal
function GiveCreditsModal({ open, onClose, onSubmit, maxAmount, username }) {
  const { t } = useTranslation("common");
  const [amount, setAmount] = useState(1);
  useEffect(() => {
    if (open) setAmount(1);
  }, [open]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <Card className="max-w-md mx-4 bg-content1/90 backdrop-blur">
        <CardBody className="p-6">
          <h3 className="text-xl font-semibold mb-4">
            <Trans i18nKey="profile.giveCreditsTo" values={{ username }} components={{ b: <b /> }} />
          </h3>
          <div className="space-y-4">
            <Input
              type="number"
              label="Montant"
              placeholder="Entrez le montant"
              value={amount}
              onChange={(e) => setAmount(Math.max(1, Math.min(Number(e.target.value), maxAmount || Number.MAX_SAFE_INTEGER)))}
              min="1"
              max={maxAmount || undefined}
              startContent={
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256" className="text-default-400">
                  <path d="M244,80a28,28,0,0,0-12.64-23.34c-7.64-5.12-18.18-6.66-32.83-6.66H57.47c-14.65,0-25.19,1.54-32.83,6.66A28,28,0,0,0,12,80v96a28,28,0,0,0,12.64,23.34c7.64,5.12,18.18,6.66,32.83,6.66H198.53c14.65,0,25.19-1.54,32.83-6.66A28,28,0,0,0,244,176V80Z"/>
                </svg>
              }
            />
            {maxAmount && <span className="text-small text-default-500">{t("profile.max", { max: maxAmount })}</span>}
            <div className="flex gap-3 justify-end">
              <Button 
                color="danger" 
                variant="light" 
                onClick={onClose}
              >
                {t("profile.cancel")}
              </Button>
              <Button 
                color="primary" 
                onClick={() => onSubmit(amount)}
              >
                {t("profile.giveCredits")}
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}

export interface ShopItem {
  itemId: string;
  name: string;
  description: string;
  price: number;
  stock?: number;
  iconHash: string;
}

interface InventoryHandle {
  reload: () => void;
}

interface User {
  verified: boolean;
  id: string;
  username: string;
  disabled?: boolean;
  admin?: boolean;
  isStudio?: boolean;
  inventory?: ({
    itemId: string;
    name: string;
    description: string;
    price: number;
    iconHash: string;
    rarity: "very-common" | "common" | "uncommon" | "rare" | "very-rare" | "epic" | "ultra-epic" | "legendary" | "ancient" | "mythic" | "godlike" | "radiant";
    custom_url_link?: string;
  } & { amount: number })[];
  ownedItems?: ShopItem[];
  badges: ("staff" | "moderator" | "community_manager" | "early_user" | "bug_hunter" | "contributor" | "partner")[];
}

type ProfileProps = {
  userId: string;
};

const inventoryGridStyle = (columns: number): React.CSSProperties => ({
  gridTemplateColumns: `repeat(${columns}, 1fr)`,
});
const inventoryItemStyle: React.CSSProperties = {
  cursor: "pointer",
};
const tooltipStyle = (x: number, y: number): React.CSSProperties => ({
  left: x,
  top: y,
  position: "fixed",
  zIndex: 1000,
});

function ProfileShop({ user, onBuySuccess }: { user: User; onBuySuccess: () => void }) {
  const { t } = useTranslation("common");
  const [items, setItems] = useState<ShopItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tooltip, setTooltip] = useState<{
    x: number;
    y: number;
    item: ShopItem;
  } | null>(null);
  const [prompt, setPrompt] = useState<{
    message: string;
    resolve: (value: { confirmed: boolean; amount?: number }) => void;
    maxAmount?: number;
    amount?: number;
    item?: ShopItem;
  } | null>(null);
  const [promptOwnerUser, setPromptOwnerUser] = useState<any | null>(null);
  const [alert, setAlert] = useState<{ message: string } | null>(null);

  useEffect(() => {
    setItems(user.ownedItems || []);
    setLoading(false);
  }, [user.ownedItems]);

  const handleMouseEnter = (e: React.MouseEvent, item: ShopItem) => {
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    const tooltipWidth = 320;
    const tooltipHeight = 120;
    const padding = 8;
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    let x = rect.right + padding;
    let y = rect.top;
    if (x + tooltipWidth > windowWidth) {
      x = rect.left - tooltipWidth - padding;
      if (x < 0) x = windowWidth - tooltipWidth - padding;
    }
    if (y + tooltipHeight > windowHeight) {
      y = windowHeight - tooltipHeight - padding;
      if (y < 0) y = padding;
    }
    setTooltip({ x, y, item });
  };
  const handleMouseLeave = () => setTooltip(null);

  const { getUser: getUserFromCache } = useUserCache();
  const customPrompt = async (message: string, maxAmount?: number, item?: ShopItem) => {
    let ownerUser: any = null;
    if (item && (item as any).owner) {
      try {
        ownerUser = await getUserFromCache((item as any).owner);
      } catch {}
    }
    setPrompt({ message, resolve: () => {}, maxAmount, amount: 1, item });
    setPromptOwnerUser(ownerUser);
    return new Promise<{ confirmed: boolean; amount?: number }>((resolve) => {
      setPrompt({ message, resolve, maxAmount, amount: 1, item });
      setPromptOwnerUser(ownerUser);
    });
  };

  const handlePromptResult = (confirmed: boolean) => {
    if (prompt) {
      const { amount } = prompt;
      prompt.resolve({ confirmed, amount });
      setPrompt(null);
      setPromptOwnerUser(null);
    }
  };

  const handlePromptAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.max(1, Math.min(Number(e.target.value), prompt?.maxAmount || Number.MAX_SAFE_INTEGER));
    setPrompt((prev) => (prev ? { ...prev, amount: value } : null));
  };

  const handleBuy = async (item: ShopItem) => {
    const maxAmount = item.stock ?? undefined;
    const result = await customPrompt(`Buy how many "${item.name}"?\nPrice: ${item.price} each${maxAmount ? `\nStock: ${maxAmount}` : ""}`, maxAmount, item);
    if (result.confirmed && result.amount && result.amount > 0) {
      fetch(endpoint + "/items/buy/" + item.itemId, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ amount: result.amount }),
      })
        .then(async (res) => {
          const data = await res.json();
          if (!res.ok) throw new Error(data.message || "Failed to buy item");
          return data;
        })
        .then(() => {
          fetch(endpoint + "/items", {
            headers: {
              "Content-Type": "application/json",
            },
          })
            .then((res) => res.json())
            .then((data) => setItems(data.filter((item: any) => item.owner === user.id)))
            .finally(() => setLoading(false));
          onBuySuccess();
        })
        .catch((err) => {
          setAlert({ message: err.message });
        });
    }
  };

  const columns = 4;
  const minRows = 8;
  const totalItems = items.length;
  const rows = Math.max(minRows, Math.ceil(totalItems / columns));
  const totalCells = rows * columns;
  const emptyCells = totalCells - totalItems;

  if (loading) return <p>{t("profile.loading")}</p>;
  if (error) return <p style={{ color: "red" }}>{t("profile.error")}</p>;
  if (items.length === 0) return <p>{t("profile.noItems")}</p>;

  return (
    <div className="profile-shop">
      <div className="inventory-grid" style={inventoryGridStyle(columns)}>
        {items.map((item) => (
          <div
            key={item.itemId}
            className="inventory-item"
            style={inventoryItemStyle}
            onClick={() => handleBuy(item)}
            onMouseEnter={(e) => handleMouseEnter(e, item)}
            onMouseLeave={handleMouseLeave}
          >
            <ShopItemImage item={item} />
          </div>
        ))}
        {Array.from({ length: emptyCells }, (_, i) => (
          <div key={`empty-${i}`} className="inventory-item-empty" />
        ))}
      </div>
      {tooltip && (
        <div className="inventory-tooltip" style={tooltipStyle(tooltip.x, tooltip.y)}>
          <div className="inventory-tooltip-header">
            <img src={"/items-icons/" + (tooltip.item?.iconHash || tooltip.item.itemId)} alt={tooltip.item.name} className="inventory-tooltip-img" />
            <div className="inventory-tooltip-info">
              <div className="inventory-tooltip-name">{tooltip.item.name}</div>
              <div className="inventory-tooltip-price">
                {tooltip.item.price} <CachedImage src="/assets/credit.avif" className="inventory-tooltip-credit" />
              </div>
            </div>
          </div>
          <div className="inventory-tooltip-desc">{tooltip.item.description}</div>
        </div>
      )}
      {prompt && (
        <div className="shop-prompt-overlay">
          <div className="shop-prompt" style={{ display: "inline-flex", flexDirection: "column", gap: 8 }}>
            {prompt.item && (
              <div className="shop-prompt-item-details" style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                <CachedImage src={"/items-icons/" + (prompt.item?.iconHash || prompt.item.itemId)} alt={prompt.item.name} className="shop-prompt-item-img" />
                <div className="shop-prompt-item-info" style={{ display: "inline-flex", flexDirection: "column", gap: 4 }}>
                  <div className="shop-prompt-item-name">{prompt.item.name}</div>
                  <div className="shop-prompt-item-desc">{prompt.item.description}</div>
                  <div className="shop-prompt-item-price" style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                    {t("profile.price")} {prompt.item.price}
                    <CachedImage src="/assets/credit.avif" className="shop-credit-icon" />
                    {prompt.item.stock !== undefined && (
                      <span className="shop-prompt-item-stock">
                        {t("profile.stockLabel")}: {prompt.item.stock}
                      </span>
                    )}
                  </div>
                  {(prompt.item as any).owner && promptOwnerUser && (
                    <div className="shop-prompt-owner">
                      Owner: {promptOwnerUser.username}
                    </div>
                  )}
                </div>
              </div>
            )}
            <div className="shop-prompt-message">{prompt.message}</div>
            <div className="shop-prompt-amount" style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
              <input
                type="number"
                min={1}
                max={prompt.maxAmount || undefined}
                value={prompt.amount || 1}
                onChange={handlePromptAmountChange}
                className="shop-prompt-amount-input"
              />
              {prompt.maxAmount && <span className="shop-prompt-amount-max">Max: {prompt.maxAmount}</span>}
            </div>
            <div style={{ display: "inline-flex", gap: 8 }}>
              <button className="shop-prompt-buy-btn" onClick={() => handlePromptResult(true)}>
                Buy
              </button>
              <button className="shop-prompt-cancel-btn" onClick={() => handlePromptResult(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      {alert && (
        <div className="shop-alert-overlay">
          <div className="shop-alert">
            <div className="shop-alert-message">{alert.message}</div>
            <button
              className="shop-alert-ok-btn"
              onClick={() => setAlert(null)}
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const ShopItemImage = React.memo(function ShopItemImage({ item }: { item: ShopItem }) {
  const iconUrl = "/items-icons/" + (item?.iconHash || item.itemId);
  return (
    <div style={{ position: "relative", width: "48px", height: "48px", background: "#181a1a", borderRadius: "6px", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <CachedImage src={iconUrl} alt="default" className="inventory-item-img inventory-item-img-blur" style={{ width: "100%", height: "100%", objectFit: "contain", borderRadius: "6px", background: "#181a1a", display: "block" }} draggable={false} />
    </div>
  );
});

function useProfileLogic(userId: string) {
  const [profile, setProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [giveCreditsOpen, setGiveCreditsOpen] = useState(false);
  const [giveCreditsLoading, setGiveCreditsLoading] = useState(false);
  const [giveCreditsError, setGiveCreditsError] = useState<string | null>(null);
  const [giveCreditsSuccess, setGiveCreditsSuccess] = useState<string | null>(null);
  const [showTradeModal, setShowTradeModal] = useState(false);
  const [currentTradeId, setCurrentTradeId] = useState<string | null>(null);
  const [inventoryReloadFlag, setInventoryReloadFlag] = useState(0);
  const [isProfileReloading, setIsProfileReloading] = useState(false);

  const reloadInventory = () => setInventoryReloadFlag((f) => f + 1);

  const searchParams = useSearchParams();
  const search = searchParams ? searchParams.get("user") : null;

  const { user, token } = useAuth();
  const router = useRouter();
  const { getUser: getUserFromCache } = useUserCache();

  const reloadProfile = useCallback(
    (reloadCache: boolean = false) => {
      if (isProfileReloading) return;
      
      setLoading(true);
      setIsProfileReloading(true);
      setError(null);
      
      const selectedUserId = search || "@me";
      
      if (selectedUserId === "@me" || selectedUserId === user?.id) {
        if (user) {
          setProfile(user);
          setLoading(false);
          setIsProfileReloading(false);
          return;
        }
      }

      if (!token) {
        if (selectedUserId === "@me") {
          router.push("/login");
          return;
        }
        setError("Token manquant");
        setLoading(false);
        setIsProfileReloading(false);
        return;
      }

      getUserFromCache(selectedUserId, !reloadCache, user?.admin)
        .then((fetchedProfile) => {
          if (fetchedProfile) {
            setProfile(fetchedProfile);
            setError(null);
          } else {
            setError("Profil non trouvé");
          }
        })
        .catch((e) => {
          console.error("Erreur lors du chargement du profil:", e);
          setError(e.message || "Erreur lors du chargement du profil");
          if (selectedUserId === "@me" && !token) {
            router.push("/login");
            return;
          }
        })
        .finally(() => {
          setLoading(false);
          setIsProfileReloading(false);
        });
    },
    [search, user, token, router, getUserFromCache, isProfileReloading]
  );

  useEffect(() => {
    if (!isProfileReloading) {
      const handler = setTimeout(() => {
        reloadProfile();
      }, 100);
      return () => clearTimeout(handler);
    }
  }, [search, user, token, reloadProfile, isProfileReloading]);

  const handleDisableAccount = async () => {
    if (!user?.admin || !token || !profile) return;
    try {
      const res = await fetch(`/api/users/admin/disable/${profile.id}`, {
        method: "POST",
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to disable account");
      reloadProfile(true);
    } catch (e: any) {
      setError(e.message);
    }
  };

  const handleReenableAccount = async () => {
    if (!user?.admin || !token || !profile) return;
    try {
      const res = await fetch(`/api/users/admin/enable/${profile.id}`, {
        method: "POST",
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to re-enable account");
      reloadProfile(true);
    } catch (e: any) {
      setError(e.message);
    }
  };

  const handleProfilePictureChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0) return;

    const file = event.target.files[0];
    const formData = new FormData();
    formData.append("avatar", file);

    try {
      const response = await fetch("/upload/avatar", {
        method: "POST",
        body: formData,
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to upload avatar");
      }

      reloadProfile(true);
    } catch (error) {
      console.error("Error uploading avatar:", error);
    }
  };

  const handleStartTrade = async () => {
    if (!user?.id || !profile?.id) {
      console.error("Missing user or profile ID");
      return;
    }
  
    try {
      const response = await fetch(`/api/trades/start-or-latest/${profile.id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || errorData.error || "Failed to create trade");
      }
  
      const trade = await response.json();
      setCurrentTradeId(trade.id);
      setShowTradeModal(true);
    } catch (error) {
      console.error("Error creating trade:", error);
      setError(error.message);
    }
  };  

  const handleGiveCredits = async (amount: number) => {
    if (!profile || !token) return;
    setGiveCreditsLoading(true);
    setGiveCreditsError(null);
    setGiveCreditsSuccess(null);
    try {
      const res = await fetch("/api/users/transfer-credits", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ targetUserId: profile.id, amount }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to transfer credits");
      setGiveCreditsSuccess("Credits sent!");
      setInventoryReloadFlag((f) => f + 1);
      setGiveCreditsOpen(false);
    } catch (e: any) {
      setGiveCreditsError(e.message);
    } finally {
      setGiveCreditsLoading(false);
    }
  };

  return { 
    showTradeModal, 
    setShowTradeModal, 
    search, 
    profile, 
    loading, 
    error, 
    giveCreditsOpen, 
    giveCreditsLoading, 
    giveCreditsError, 
    giveCreditsSuccess, 
    currentTradeId, 
    inventoryReloadFlag, 
    isProfileReloading, 
    setGiveCreditsOpen, 
    setCurrentTradeId, 
    reloadInventory, 
    handleDisableAccount, 
    handleReenableAccount, 
    handleProfilePictureChange, 
    handleStartTrade, 
    handleGiveCredits, 
    setLoading, 
    reloadProfile, 
    setProfile, 
    setError, 
    setGiveCreditsSuccess, 
    setGiveCreditsError, 
    setGiveCreditsLoading, 
    setIsProfileReloading, 
    setInventoryReloadFlag 
  };  
}

const BADGE_INFO: Record<string, { label: string; icon: string; color: string }> = {
  staff: { label: "Staff", icon: "fa-screwdriver-wrench", color: "#7289DA" },
  moderator: { label: "Moderator", icon: "fa-shield-halved", color: "#f2ad58ff" },
  community_manager: { label: "Community Manager", icon: "fa-users", color: "#23a548ff" },
  early_user: { label: "Early User", icon: "fa-bolt", color: "#ff3535ff" },
  bug_hunter: { label: "Bug Hunter", icon: "fa-bug", color: "#fff200ff" },
  contributor: { label: "Contributor", icon: "fa-code-branch", color: "#7200b8ff" },
  partner: { label: "Partner", icon: "fa-handshake", color: "#677BC4" },
  support: { label: "Support", icon: "fa-headset", color: "#e51ed8ff" },
};

const BADGE_ICONS = {
  "fa-user-shield": faUserShield,
  "fa-shield-halved": faShieldHalved,
  "fa-screwdriver-wrench": faScrewdriverWrench,
  "fa-users": faUsers,
  "fa-bolt": faBolt,
  "fa-bug": faBug,
  "fa-code-branch": faCodeBranch,
  "fa-handshake": faHandshake,
  "fa-headset": faHeadset,
};

function BadgesBox({ badges, studio }: { badges: (string | number)[]; studio?: boolean }) {
  // Conversion et filtrage strict
  const filteredBadges = (badges || [])
    .map(badge => String(badge)) // Convertir en string
    .filter((badge) => {
      // Éliminer tous les cas de "0" et valeurs vides
      if (badge === "0" || badge === "false" || badge === "" || !badge || badge === "null" || badge === "undefined") {
        return false;
      }
      // Filtrer early_user si c'est un studio
    if (badge === "early_user" && studio) return false;
      // Vérifier que le badge existe dans BADGE_INFO
      return BADGE_INFO[badge] !== undefined;
  });
  
  // Ne rien retourner si pas de badges valides
  if (filteredBadges.length === 0) return null;
  
  return (
    <div style={{ 
      display: "flex", 
      gap: 8, 
      border: "1px solid #36393f", 
      background: "rgba(54,57,63,0.85)", 
      borderRadius: 8, 
      padding: "6px 12px", 
      marginTop: 8, 
      alignItems: "center", 
      flexWrap: "wrap", 
      boxShadow: "0 1px 4px 0 rgba(0,0,0,0.12)" 
    }}>
      {filteredBadges.map((badge) => {
        const info = BADGE_INFO[badge];
        if (!info) return null;
        const icon = BADGE_ICONS[info.icon];
        if (!icon) return null;
        
        return (
          <Link key={badge} href={`/badges#${badge}`} passHref legacyBehavior>
            <a 
              title={info.label} 
              style={{ 
                display: "flex", 
                alignItems: "center", 
                borderRadius: 6, 
                padding: "2px 10px", 
                fontWeight: 500, 
                fontSize: 15, 
                transition: "transform 0.1s", 
                textDecoration: "none", 
                cursor: "pointer", 
                outline: "none" 
              }} 
              tabIndex={0}
            >
              <FontAwesomeIcon 
                icon={icon} 
                style={{ 
                  fontSize: 20, 
                  filter: "drop-shadow(0 0px 0px rgba(0, 0, 0, 0))" 
                }} 
                color={info.color} 
                fixedWidth 
              />
            </a>
            </Link>
        );
      })}
    </div>
  );
}


function ProfileDesktop(props: ReturnType<typeof useProfileLogic>) {
  const { 
    showTradeModal, 
    search, 
    profile,
    loading,
    error,
    giveCreditsOpen,
    giveCreditsLoading,
    giveCreditsError,
    giveCreditsSuccess, 
    currentTradeId, 
    inventoryReloadFlag, 
    setGiveCreditsOpen, 
    setCurrentTradeId,
    setShowTradeModal,
    setInventoryReloadFlag,
    handleDisableAccount, 
    handleReenableAccount, 
    handleProfilePictureChange, 
    handleStartTrade, 
    handleGiveCredits, 
    setGiveCreditsError,
    setGiveCreditsSuccess 
  } = props;
  
  const { t } = useTranslation();
  const { user, token } = useAuth();
  const isMe = !search || search === user?.id || search === "@me";

  useEffect(() => {
    const style = document.createElement('style')
    style.textContent = `
      @keyframes progressWave {
        0% { 
          transform: scaleX(0);
        }
        100% { 
          transform: scaleX(1);
        }
      }
  
      @keyframes subtleGlow {
        0%, 100% { 
          box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.1);
        }
        50% { 
          box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.3), 0 0 15px rgba(255, 255, 255, 0.1);
        }
      }
  
      @keyframes fadeInUp {
        0% { 
          opacity: 0; 
          transform: translateY(30px); 
        }
        100% { 
          opacity: 1; 
          transform: translateY(0); 
        }
      }

      @keyframes fadeIn {
        0% { 
          opacity: 0; 
        }
        100% { 
          opacity: 1; 
        }
      }

      .animate-fade-in {
        animation: fadeIn 800ms ease-in-out forwards;
      }
  
      @keyframes slideUpDelay {
        0% { 
          opacity: 0; 
          transform: translateY(20px); 
        }
        100% { 
          opacity: 1; 
          transform: translateY(0); 
        }
      }
  
      .active-game-glow {
        border: 1px solid rgba(255, 255, 255, 0.2);
        animation: subtleGlow 5s ease-in-out infinite;
      }
  
      .progress-wave {
        animation: progressWave 10s linear infinite;
        transform: scaleX(0);
        transform-origin: left;
      }
  
      .animate-fade-in-up {
        animation: fadeInUp 0.6s ease-out forwards;
      }
  
      .animate-slide-up-delay-1 {
        opacity: 0;
        animation: slideUpDelay 0.5s ease-out 0.1s forwards;
      }
  
      .animate-slide-up-delay-2 {
        opacity: 0;
        animation: slideUpDelay 0.5s ease-out 0.2s forwards;
      }
  
      .animate-slide-up-delay-3 {
        opacity: 0;
        animation: slideUpDelay 0.5s ease-out 0.3s forwards;
      }
    `
    document.head.appendChild(style)
  
    return () => {
      if (document.head.contains(style)) {
        document.head.removeChild(style)
      }
      }
  }, [])

  if (loading) {
    return (
      <div className="bg-background text-foreground font-sans relative min-h-screen">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-blue-900/10 to-indigo-900/20">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/20 via-slate-900/5 to-transparent"></div>
        </div>
        
        <div className="relative z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <Card className="bg-content1/50 backdrop-blur-sm border-0 shadow-xl animate-fade-in-up">
            <CardBody className="p-8">
                <div className="flex items-center justify-center space-x-4">
                  <Skeleton className="w-12 h-12 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-6 w-32 rounded-lg" />
                    <Skeleton className="h-4 w-24 rounded-lg" />
                </div>
              </div>
            </CardBody>
          </Card>
          </div>
          </div>
        </div>
    );
  }

  if (error) {
    return (
      <div className="bg-background text-foreground font-sans relative min-h-screen">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-blue-900/10 to-indigo-900/20">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/20 via-slate-900/5 to-transparent"></div>
        </div>
        
        <div className="relative z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <Card className="bg-content1/50 backdrop-blur-sm border-0 shadow-xl animate-fade-in-up">
              <CardBody className="p-8 text-center">
                <div className="text-danger text-xl font-semibold mb-4">
                  {error}
                </div>
                <Button 
                  color="primary" 
                  variant="shadow"
                  onClick={() => window.location.reload()}
                >
                  Réessayer
                </Button>
              </CardBody>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="bg-background text-foreground font-sans relative min-h-screen">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-blue-900/10 to-indigo-900/20">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/20 via-slate-900/5 to-transparent"></div>
        </div>
        
        <div className="relative z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <Card className="bg-content1/50 backdrop-blur-sm border-0 shadow-xl animate-fade-in-up">
              <CardBody className="p-8 text-center">
                <div className="text-foreground text-xl font-semibold">
                  Profil non trouvé
              </div>
            </CardBody>
          </Card>
        </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background text-foreground font-sans relative min-h-screen">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-blue-900/10 to-indigo-900/20">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/20 via-slate-900/5 to-transparent"></div>
      </div>
      
      <div className="relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
          
          {/* Section Profil Principal */}
          <Card className="bg-content1/50 backdrop-blur-sm border-0 shadow-xl animate-fade-in-up">
            <CardBody className="p-8">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-6">
                  <div className="relative">
                    <label 
                      htmlFor="profile-picture-input" 
                      className={`block ${isMe ? 'cursor-pointer' : 'cursor-default'}`}
                    >
                      <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-primary/20 shadow-lg">
                        <CachedImage 
                          src={"/avatar/" + (search || user?.id)} 
                          alt={profile.username} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      {isMe && (
                        <input 
                          id="profile-picture-input" 
                          type="file" 
                          accept="image/*" 
                          className="hidden" 
                          onChange={handleProfilePictureChange} 
                        />
                      )}
                    </label>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <h1 className="text-3xl font-bold text-foreground">
                        {profile.username}
                      </h1>
                      <Certification 
                        user={profile} 
                        style={{ width: 28, height: 28 }} 
                      />
                      {profile.disabled && (
                        <Chip color="danger" variant="flat" size="sm">
                          {t("profile.disabledLabel")}
                        </Chip>
                      )}
                    </div>
                    
                    <BadgesBox badges={profile.badges || []} studio={profile.isStudio} />
                  </div>
                </div>

                {/* Boutons d'action */}
                {user && (
                  <div className="flex flex-wrap gap-3">
                    {!isMe ? (
                      <>
                        {user.admin && profile.disabled && (
                          <Button
                            color="primary"
                            variant="shadow"
                            onClick={handleReenableAccount}
                          >
                            {t("profile.reenable")}
                          </Button>
                        )}
                        {user.admin && !profile.disabled && (
                          <Button
                            color="danger"
                            variant="shadow"
                            onClick={handleDisableAccount}
                          >
                            {t("profile.disable")}
                          </Button>
                        )}
                        {!profile.disabled && (
                          <>
                            <Button
                              color="secondary"
                              variant="shadow"
                              onClick={() => {
                                setGiveCreditsOpen(true);
                                setGiveCreditsError(null);
                                setGiveCreditsSuccess(null);
                              }}
                              startContent={
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256">
                                  <path d="M244,80a28,28,0,0,0-12.64-23.34c-7.64-5.12-18.18-6.66-32.83-6.66H57.47c-14.65,0-25.19,1.54-32.83,6.66A28,28,0,0,0,12,80v96a28,28,0,0,0,12.64,23.34c7.64,5.12,18.18,6.66,32.83,6.66H198.53c14.65,0,25.19-1.54,32.83-6.66A28,28,0,0,0,244,176V80Z"/>
                                </svg>
                              }
                            >
                              {t("profile.giveCredits")}
                            </Button>
                  <Button
                    color="primary"
                              variant="shadow"
                              onClick={handleStartTrade}
                              startContent={
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256">
                                  <path d="M240,124a60.07,60.07,0,0,0-60-60H65.37L80.73,48.66a8,8,0,1,0-11.46-11.32l-24,24a8,8,0,0,0,0,11.32l24,24A8,8,0,0,0,80.73,85.34L65.37,70H180a44.05,44.05,0,0,1,44,44,8,8,0,0,0,16,0ZM195.06,165.38a8,8,0,0,0-11.32,11.28L198.63,192H76a44.05,44.05,0,0,1-44-44,8,8,0,0,0-16,0,60.07,60.07,0,0,0,60,60H198.63l-14.89,14.89a8,8,0,0,0,11.32,11.32l24-24a8,8,0,0,0,0-11.32Z"/>
                                </svg>
                              }
                            >
                              {t("profile.trade")}
                            </Button>
                          </>
                        )}
                      </>
                    ) : (
                      <>
                        <Button
                          as={Link}
                          href="/my-market-listings"
                          color="primary"
                          variant="bordered"
                          startContent={
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256">
                              <path d="M184,89.57V84c0-25.08-37.83-44-88-44S8,58.92,8,84v40c0,20.89,26.25,37.49,64,42.46V172c0,25.08,37.83,44,88,44s88-18.92,88-44V132C248,111.3,222.58,94.68,184,89.57ZM232,132c0,13.22-30.79,28-72,28-3.73,0-7.43-.13-11.08-.37C170.49,151.77,184,139,184,124V105.74C213.87,110.19,232,122.27,232,132Z"/>
                            </svg>
                          }
                        >
                          Mes Annonces
                  </Button>
                  <Button
                          as={Link}
                          href="/inventory"
                          color="secondary"
                    variant="bordered"
                          startContent={
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256">
                              <path d="M216,40H40A16,16,0,0,0,24,56V200a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V56A16,16,0,0,0,216,40ZM40,56H216V88H40ZM40,200V104H216v96Z"/>
                            </svg>
                          }
                        >
                          Inventaire
                  </Button>
                      </>
                    )}
                </div>
              )}
                </div>
              </CardBody>
            </Card>

          {/* Section Inventaire */}
          <Card className="bg-content1/50 backdrop-blur-sm border-0 shadow-xl animate-slide-up-delay-1">
            <CardBody className="p-8">
              <div className="flex items-center space-x-3 mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 256 256" className="text-primary">
                  <path d="M216,40H40A16,16,0,0,0,24,56V200a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V56A16,16,0,0,0,216,40ZM40,56H216V88H40ZM40,200V104H216v96Z"/>
                </svg>
                <h2 className="text-2xl font-bold text-foreground">
                  {isMe ? "Mon Inventaire" : `Inventaire de ${profile.username}`}
                </h2>
                </div>
              
              <Inventory 
                key={inventoryReloadFlag}
                userId={search || user?.id || "@me"}
                />
              </CardBody>
            </Card>

          {/* Section Shop (si l'utilisateur a des items à vendre) */}
          {profile.ownedItems && profile.ownedItems.length > 0 && (
            <Card className="bg-content1/50 backdrop-blur-sm border-0 shadow-xl animate-slide-up-delay-2">
              <CardBody className="p-8">
                <div className="flex items-center space-x-3 mb-6">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 256 256" className="text-primary">
                    <path d="M184,89.57V84c0-25.08-37.83-44-88-44S8,58.92,8,84v40c0,20.89,26.25,37.49,64,42.46V172c0,25.08,37.83,44,88,44s88-18.92,88-44V132C248,111.3,222.58,94.68,184,89.57Z"/>
                  </svg>
                  <h2 className="text-2xl font-bold text-foreground">
                    {isMe ? "Ma Boutique" : `Boutique de ${profile.username}`}
                  </h2>
                </div>
                
                <ProfileShop 
                  user={profile} 
                  onBuySuccess={() => {
                    setInventoryReloadFlag(f => f + 1);
                  }}
                />
              </CardBody>
            </Card>
          )}
        </div>
      </div>

      {/* Trade Panel */}
      {showTradeModal && currentTradeId && user && (
        <TradePanel
          tradeId={currentTradeId}
          userId={user.id}
          token={token}
          inventory={user?.inventory || []}
          reloadInventory={() => setInventoryReloadFlag(f => f + 1)}
          onClose={() => {
            setCurrentTradeId(null);
            setShowTradeModal(false);
          }}
          profile={profile}
          apiBase="/api"
        />
      )}


      {/* Give Credits Modal */}
      <GiveCreditsModal
        open={giveCreditsOpen}
        onClose={() => setGiveCreditsOpen(false)}
        onSubmit={handleGiveCredits}
        maxAmount={user?.balance}
        username={profile.username}
      />

      {/* Loading Modal pour envoi de crédits */}
      {giveCreditsLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <Card className="bg-content1/90 backdrop-blur">
              <CardBody className="p-6 text-center">
              <div className="flex items-center justify-center space-x-3">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                <span>{t("profile.sendingCredits")}</span>
                </div>
              </CardBody>
            </Card>
                </div>
              )}

      {/* Error Modal */}
      {giveCreditsError && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <Card className="max-w-md mx-4 bg-content1/90 backdrop-blur">
            <CardBody className="p-6 text-center">
              <p className="text-danger mb-4">{giveCreditsError}</p>
              <Button 
                color="primary"
                onClick={() => setGiveCreditsError(null)}
              >
                OK
              </Button>
                      </CardBody>
                    </Card>
                </div>
      )}

      {/* Success Modal */}
      {giveCreditsSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <Card className="max-w-md mx-4 bg-content1/90 backdrop-blur">
            <CardBody className="p-6 text-center">
              <p className="text-success mb-4">{t("profile.creditsSent")}</p>
                  <Button 
                    color="primary"
                onClick={() => setGiveCreditsSuccess(null)}
                  >
                {t("profile.ok")}
                  </Button>
            </CardBody>
          </Card>
      </div>
      )}
            </div>
  );
}

function ProfileMobile(props: any) {
  return <ProfileDesktop {...props} />;
}

export default function Profile({ userId }: ProfileProps) {
  const isMobile = useIsMobile();
  const logic = useProfileLogic(userId);
  return isMobile ? <ProfileMobile {...logic} /> : <ProfileDesktop {...logic} />;
}

