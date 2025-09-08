import React, { useCallback, useEffect, useState } from "react";
import useAuth from "../hooks/useAuth";
import useUserCache from "../hooks/useUserCache";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import CachedImage from "../components/utils/CachedImage";
import TradePanel from "../components/TradePanel";
import useIsMobile from "../hooks/useIsMobile";
import Inventory from "../components/Inventory";
import Certification from "../components/common/Certification";
import { useTranslation, Trans } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common"])),
    },
  };
}
const endpoint = "/api";

// --- Give Credits Modal ---
function GiveCreditsModal({ open, onClose, onSubmit, maxAmount, username }) {
  const { t } = useTranslation("common");
  const [amount, setAmount] = useState(1);
  useEffect(() => {
    if (open) setAmount(1);
  }, [open]);
  if (!open) return null;
  return (
    <div className="shop-prompt-overlay">
      <div className="shop-prompt">
        <div className="shop-prompt-message">
          <Trans i18nKey="profile.giveCreditsTo" values={{ username }} components={{ b: <b /> }} />
        </div>
        <div className="shop-prompt-amount">
          <input type="number" min={1} max={maxAmount || undefined} value={amount} onChange={(e) => setAmount(Math.max(1, Math.min(Number(e.target.value), maxAmount || Number.MAX_SAFE_INTEGER)))} className="shop-prompt-amount-input" />
          {maxAmount ? <span className="shop-prompt-amount-max">{t("profile.max", { max: maxAmount })}</span> : null}
        </div>
        <button className="shop-prompt-buy-btn" onClick={() => onSubmit(amount)}>
          {t("profile.giveCredits")}
        </button>
        <button className="shop-prompt-cancel-btn" onClick={onClose}>
          {t("profile.cancel")}
        </button>
      </div>
    </div>
  );
}

export interface ShopItem {
  itemId: string;
  name: string;
  description: string;
  price: number;
  stock?: number; // optionnel, si le backend le fournit,
  iconHash: string;
}

// Define the InventoryHandle interface for the ref
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
  userId: string; // userId
};

// ProfileShop: Shop section for a user's profile
// --- Style constants for ProfileShop ---
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
  // Tooltip handlers
  const handleMouseEnter = (e: React.MouseEvent, item: ShopItem) => {
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    // Calculate tooltip position to avoid out-of-bounds
    const tooltipWidth = 320; // Approximate width of tooltip (px)
    const tooltipHeight = 120; // Approximate height of tooltip (px)
    const padding = 8;
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    let x = rect.right + padding;
    let y = rect.top;
    // Adjust X if tooltip would overflow right
    if (x + tooltipWidth > windowWidth) {
      x = rect.left - tooltipWidth - padding;
      if (x < 0) x = windowWidth - tooltipWidth - padding;
    }
    // Adjust Y if tooltip would overflow bottom
    if (y + tooltipHeight > windowHeight) {
      y = windowHeight - tooltipHeight - padding;
      if (y < 0) y = padding;
    }
    setTooltip({ x, y, item });
  };
  const handleMouseLeave = () => setTooltip(null);

  // Custom prompt for buying items
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

  // Handle prompt result
  const handlePromptResult = (confirmed: boolean) => {
    if (prompt) {
      const { amount } = prompt;
      prompt.resolve({ confirmed, amount });
      setPrompt(null);
      setPromptOwnerUser(null);
    }
  };

  // Handle amount change in prompt
  const handlePromptAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.max(1, Math.min(Number(e.target.value), prompt?.maxAmount || Number.MAX_SAFE_INTEGER));
    setPrompt((prev) => (prev ? { ...prev, amount: value } : null));
  };

  // Buy logic
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
          // Refresh items
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

  // Grid layout calculations
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
    <div className="profile-shop-section">
      <h2 className="profile-shop-title">{t("profile.shop")}</h2>
      <div className="inventory-grid" style={inventoryGridStyle(columns)}>
        {items.map((item) => (
          <div key={item.itemId} className="inventory-item" tabIndex={0} draggable={false} onMouseEnter={(e) => handleMouseEnter(e, item)} onMouseLeave={handleMouseLeave} onClick={() => handleBuy(item)} style={inventoryItemStyle}>
            <ShopItemImage item={item} />
          </div>
        ))}
        {Array.from({ length: emptyCells }).map((_, idx) => (
          <div key={`empty-${idx}`} className="inventory-item-empty" draggable={false} />
        ))}
      </div>
      {/* Tooltip overlay */}
      {tooltip && (
        <div className="shop-tooltip" style={tooltipStyle(tooltip.x, tooltip.y)}>
          <div className="shop-tooltip-name">{tooltip.item.name}</div>
          <div className="shop-tooltip-desc">{tooltip.item.description}</div>
          <div className="shop-tooltip-price">
            {t("profile.price")} {tooltip.item.price}
            <CachedImage src="/assets/credit.png" className="shop-credit-icon" />
            {tooltip.item.stock !== undefined && <span className="shop-tooltip-stock">{t("profile.shopTooltipStock", { stock: tooltip.item.stock })}</span>}
          </div>
        </div>
      )}
      {/* Buy prompt overlay */}
      {prompt && (
        <div className="shop-prompt-overlay">
          <div className="shop-prompt">
            {prompt.item && (
              <div className="shop-prompt-item-details">
                <CachedImage src={"/items-icons/" + (prompt.item?.iconHash || prompt.item.itemId)} alt={prompt.item.name} className="shop-prompt-item-img" />
                <div className="shop-prompt-item-info">
                  <div className="shop-prompt-item-name">{prompt.item.name}</div>
                  <div className="shop-prompt-item-desc">{prompt.item.description}</div>
                  <div className="shop-prompt-item-price">
                    {t("profile.price")} {prompt.item.price}
                    <CachedImage src="/assets/credit.png" className="shop-credit-icon" />
                    {prompt.item.stock !== undefined && (
                      <span className="shop-prompt-item-stock">
                        {t("profile.stockLabel")}: {prompt.item.stock}
                      </span>
                    )}
                  </div>
                  {(prompt.item as any).owner && promptOwnerUser && (
                    <div className="shop-prompt-item-owner">
                      {t("profile.creatorLabel")}{" "}
                      <Link href={`/profile?user=${(prompt.item as any).owner}`} className="shop-prompt-owner-link">
                        <CachedImage className="shop-prompt-owner-avatar" src={"/avatar/" + (prompt.item as any).owner} />
                        {promptOwnerUser.username} <Certification user={{ ...promptOwnerUser, verified: promptOwnerUser.verified ?? false }} style={{ marginLeft: 4, width: 16, height: 16, position: "relative", top: -2, verticalAlign: "middle" }} />
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            )}
            <div className="shop-prompt-message">{prompt.message}</div>
            {prompt.maxAmount !== 1 && (
              <div className="shop-prompt-amount">
                <input type="number" min={1} max={prompt.maxAmount || undefined} value={prompt.amount} onChange={handlePromptAmountChange} className="shop-prompt-amount-input" />
                {prompt.maxAmount && <span className="shop-prompt-amount-max">/ {prompt.maxAmount}</span>}
                {prompt.item && (
                  <span className="shop-prompt-amount-total">
                    {t("profile.totalLabel")} {(prompt.amount || 1) * (prompt.item.price || 0)}
                    <CachedImage src="/assets/credit.png" className="shop-credit-icon" />
                  </span>
                )}
              </div>
            )}
            <button className="shop-prompt-buy-btn" onClick={() => handlePromptResult(true)}>
              {t("profile.buy")}
            </button>
            <button className="shop-prompt-cancel-btn" onClick={() => handlePromptResult(false)}>
              {t("profile.cancel")}
            </button>
          </div>
        </div>
      )}
      {/* Alert overlay */}
      {alert && (
        <div className="shop-alert-overlay">
          <div className="shop-alert">
            <div className="shop-alert-message">{alert.message}</div>
            <button className="shop-alert-ok-btn" onClick={() => setAlert(null)}>
              {t("profile.ok")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Sous-composant pour préchargement/flou progressif des images d'item du shop
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

  // Give credits modal state
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
  const search = searchParams.get("user"); // Use directly, don't store in state

  const { user, token } = useAuth();
  const router = useRouter();
  const { getUser: getUserFromCache } = useUserCache();

  // Helper to reload profile (debounced to avoid too many fetches)
  const reloadProfile = useCallback(
    (reloadCache: boolean = false) => {
      setLoading(true);
      setIsProfileReloading(true);
      const selectedUserId = search || "@me";
      if (selectedUserId === "@me" || selectedUserId === user?.id) {
        setProfile(user);
        setLoading(false);
        return;
      }
      getUserFromCache(selectedUserId, !reloadCache, user?.admin)
        .then(setProfile)
        .catch((e) => {
          setError(e.message);
          if ((search || "@me") == "@me" && !token) {
            router.push("/login");
            return;
          }
        })
        .finally(() => {
          setLoading(false);
        });
    },
    [token, user?.admin, search, router]
  );

  // Debounce reloadProfile to avoid too many fetches
  useEffect(() => {
    if (isProfileReloading) return;
    const handler = setTimeout(() => {
      reloadProfile();
      setIsProfileReloading(false);
    }, 250); // 250ms debounce
    return () => clearTimeout(handler);
  }, [search, isProfileReloading, reloadProfile]);

  // Désactiver le compte (admin)
  const handleDisableAccount = async () => {
    if (!user?.admin || !token || !profile) return;
    try {
      const res = await fetch(`/api/users/admin/disable/${profile.id}`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to disable account");
      reloadProfile(true);
    } catch (e: any) {
      setError(e.message);
    }
  };

  // Réactiver le compte (admin)
  const handleReenableAccount = async () => {
    if (!user?.admin || !token || !profile) return;
    try {
      const res = await fetch(`/api/users/admin/enable/${profile.id}`, {
        method: "POST",
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
      });

      if (!response.ok) {
        throw new Error("Failed to upload avatar");
      }

      // Reload the profile picture
      // setProfile((prev) =>
      //   prev ? { ...prev, avatar: `${prev.avatar}?t=${Date.now()}` } : null
      // );
    } catch (error) {
      console.error("Error uploading avatar:", error);
    }
  };

  // Start or resume trade with the profile owner
  const handleStartTrade = async () => {
    const res = await fetch(`/api/trades/start-or-latest/${profile.id}`, {
      method: "POST",
    });
    const data = await res.json();
    setCurrentTradeId(data.id);
  };

  // Handler for giving credits
  const handleGiveCredits = async (amount: number) => {
    setGiveCreditsLoading(true);
    setGiveCreditsError(null);
    setGiveCreditsSuccess(null);
    try {
      const res = await fetch("/api/users/transfer-credits", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ targetUserId: profile.id, amount }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to transfer credits");
      setGiveCreditsSuccess("Credits sent!");
      setInventoryReloadFlag((f) => f + 1); // Optionally reload inventory
    } catch (e) {
      setGiveCreditsError(e.message);
    } finally {
      setGiveCreditsLoading(false);
    }
  };

  return { showTradeModal, setShowTradeModal, search, profile, loading, error, giveCreditsOpen, giveCreditsLoading, giveCreditsError, giveCreditsSuccess, currentTradeId, inventoryReloadFlag, isProfileReloading, setGiveCreditsOpen, setCurrentTradeId, reloadInventory, handleDisableAccount, handleReenableAccount, handleProfilePictureChange, handleStartTrade, handleGiveCredits, setLoading, reloadProfile, setProfile, setError, setGiveCreditsSuccess, setGiveCreditsError, setGiveCreditsLoading, setIsProfileReloading, setInventoryReloadFlag };
}

// Version Desktop
function ProfileDesktop(props: ReturnType<typeof useProfileLogic>) {
  const { profile, loading, error, giveCreditsOpen, giveCreditsLoading, giveCreditsError, giveCreditsSuccess, currentTradeId, inventoryReloadFlag, isProfileReloading, setGiveCreditsOpen, setCurrentTradeId, reloadInventory, handleDisableAccount, handleReenableAccount, handleProfilePictureChange, handleStartTrade, handleGiveCredits, search, setIsProfileReloading, reloadProfile, setGiveCreditsError, setGiveCreditsSuccess, setInventoryReloadFlag, setLoading, setShowTradeModal } = props;

  const { user, token } = useAuth();
  const { t } = useTranslation("common");

  // Debounce reloadProfile to avoid too many fetches
  useEffect(() => {
    if (isProfileReloading) return;
    const handler = setTimeout(() => {
      reloadProfile();
      setIsProfileReloading(false);
    }, 250); // 250ms debounce
    return () => clearTimeout(handler);
  }, [search, isProfileReloading, reloadProfile]);

  if (loading)
    return (
      <div className="container">
        <p>{t("profile.loading")}</p>
      </div>
    );
  if (error)
    return (
      <div className="container">
        <p style={{ color: "red" }}>{t("profile.error")}</p>
      </div>
    );
  if (!profile)
    return (
      <div className="container">
        <p>{t("profile.notFound")}</p>
      </div>
    );

  // Only show give credits if not our own profile
  const isMe = !search || search === user?.id;

  return (
    <div className="profile-root">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        <div className="profile-picture-container">
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              gap: "64px",
            }}
          >
            <label htmlFor="profile-picture-input" style={{ cursor: isMe ? "pointer" : "default", margin: 0 }}>
              <CachedImage src={"/avatar/" + (search || user?.id)} alt={profile.username} className="profile-avatar" />
              {isMe && <input id="profile-picture-input" type="file" accept="image/*" style={{ display: "none" }} onChange={handleProfilePictureChange} />}
            </label>
            <div className="profile-header">
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                }}
              >
                <div
                  className="profile-name"
                  style={{
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  {profile.username}{" "}
                  <Certification
                    user={profile}
                    style={{
                      marginLeft: 4,
                      width: 32,
                      height: 32,
                      position: "relative",
                      top: 0,
                      verticalAlign: "middle",
                    }}
                  />
                  {profile.disabled ? <span style={{ color: "red", marginLeft: 8 }}>{t("profile.disabledLabel")}</span> : null}
                </div>
                <BadgesBox badges={profile.badges || []} studio={profile.isStudio} />
              </div>
            </div>
          </div>
        </div>
        {user && (
          <>
            {!isMe ? (
              <div>
                {user.admin &&
                  (profile.disabled ? (
                    <button
                      className="shop-prompt-buy-btn"
                      style={{
                        marginTop: 8,
                        marginRight: 8,
                        float: "right",
                        background: "#4c7aafff",
                      }}
                      onClick={handleReenableAccount}
                    >
                      {t("profile.reenable")}
                    </button>
                  ) : (
                    <button
                      className="shop-prompt-buy-btn"
                      style={{
                        marginTop: 8,
                        marginRight: 8,
                        float: "right",
                        background: "#f44336",
                      }}
                      onClick={handleDisableAccount}
                    >
                      {t("profile.disable")}
                    </button>
                  ))}
                {!profile.disabled && (
                  <>
                    <button
                      className="shop-prompt-buy-btn"
                      style={{
                        marginTop: 8,
                        marginRight: 8,
                        float: "right",
                      }}
                      onClick={() => {
                        setGiveCreditsOpen(true);
                        setGiveCreditsError(null);
                        setGiveCreditsSuccess(null);
                      }}
                    >
                      {t("profile.giveCredits")}
                    </button>
                    <button
                      className="shop-prompt-buy-btn"
                      style={{
                        marginTop: 8,
                        marginRight: 8,
                        float: "right",
                      }}
                      onClick={handleStartTrade}
                    >
                      {t("profile.trade")}
                    </button>
                  </>
                )}
              </div>
            ) : (
              <div>
                <Link
                  href="/my-market-listings"
                  style={{
                    marginTop: 8,
                    marginRight: 8,
                    // float: "right",
                  }}
                  onClick={handleDisableAccount}
                >
                  <button className="shop-prompt-buy-btn">{t("profile.myMarketListings")}</button>
                </Link>
                <Link
                  href="/settings"
                  style={{
                    marginTop: 4,
                    marginRight: 8,
                    float: "right",
                    fontSize: 24,
                    color: "#888",
                  }}
                  title={t("profile.settings")}
                >
                  <i className="fa fa-cog" aria-hidden="true"></i>
                </Link>
              </div>
            )}
          </>
        )}
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          width: "100%",
          gap: 0,
        }}
      >
        <div style={{ flex: "0 0 70%" }}>
          <div className="profile-shop-section">
            <h2 className="profile-inventory-title">{t("profile.inventoryTitle")}</h2>
            {/* Pass inventoryReloadFlag as a prop */}
            <Inventory
              profile={{
                ...profile,
                inventory: profile.inventory
                  ? profile.inventory.map((item) => ({
                      ...item,
                      item_id: item.itemId,
                      icon_hash: item.iconHash,
                      // Optionally remove itemId/iconHash if Inventory expects only snake_case
                    }))
                  : [],
              }}
              isMe={isMe}
              reloadFlag={inventoryReloadFlag}
            />
          </div>
        </div>
        <div style={{ flex: "0 0 30%" }}>
          {/* Increment inventoryReloadFlag after buy */}
          <ProfileShop user={profile} onBuySuccess={() => setInventoryReloadFlag((f) => f + 1)} />
        </div>
      </div>
      {/* Trade Panel - only show if not our own profile */}
      {user && user.id !== profile.id && (
        <>
          {currentTradeId && (
            <TradePanel
              tradeId={currentTradeId}
              userId={user.id}
              token={token}
              inventory={user.inventory}
              reloadInventory={reloadInventory}
              onClose={() => {
                setCurrentTradeId(null);
                setShowTradeModal(false);
              }}
              profile={profile}
              apiBase="/api"
            />
          )}
        </>
      )}
      {/* Give Credits Modal */}
      <GiveCreditsModal
        open={giveCreditsOpen}
        onClose={() => setGiveCreditsOpen(false)}
        onSubmit={(amount) => {
          setGiveCreditsOpen(false);
          handleGiveCredits(amount);
        }}
        maxAmount={user?.balance}
        username={profile.username || profile.username}
      />
      {/* Feedback for give credits */}
      {giveCreditsLoading && (
        <div className="shop-alert-overlay">
          <div className="shop-alert">
            <div>{t("profile.sendingCredits")}</div>
          </div>
        </div>
      )}
      {giveCreditsError && (
        <div className="shop-alert-overlay">
          <div className="shop-alert">
            <div style={{ color: "red" }}>{giveCreditsError}</div>
            <button className="shop-alert-ok-btn" onClick={() => setGiveCreditsError(null)}>
              OK
            </button>
          </div>
        </div>
      )}
      {giveCreditsSuccess && (
        <div className="shop-alert-overlay">
          <div className="shop-alert">
            <div>{t("profile.creditsSent")}</div>
            <button className="shop-alert-ok-btn" onClick={() => setGiveCreditsSuccess(null)}>
              {t("profile.ok")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Version Mobile
function ProfileMobile(props: ReturnType<typeof useProfileLogic>) {
  const { profile, loading, error, giveCreditsOpen, giveCreditsLoading, giveCreditsError, giveCreditsSuccess, currentTradeId, inventoryReloadFlag, isProfileReloading, setGiveCreditsOpen, setCurrentTradeId, reloadInventory, handleDisableAccount, handleReenableAccount, handleProfilePictureChange, handleStartTrade, handleGiveCredits, search, setIsProfileReloading, reloadProfile, setGiveCreditsError, setShowTradeModal, setInventoryReloadFlag, setGiveCreditsSuccess } = props;

  const { user, token } = useAuth();
  const { t } = useTranslation("common");

  useEffect(() => {
    if (isProfileReloading) return;
    const handler = setTimeout(() => {
      reloadProfile();
      setIsProfileReloading(false);
    }, 250);
    return () => clearTimeout(handler);
  }, [search, isProfileReloading, reloadProfile]);

  if (loading)
    return (
      <div className="container">
        <p>{t("profile.loading")}</p>
      </div>
    );
  if (error)
    return (
      <div className="container">
        <p style={{ color: "red" }}>{error}</p>
      </div>
    );
  if (!profile)
    return (
      <div className="container">
        <p>{t("profile.notFound")}</p>
      </div>
    );

  const isMe = !search || search === user?.id;

  return (
    <div className="profile-root">
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          width: "100%",
        }}
      >
        <div className="profile-picture-container">
          <label
            htmlFor="profile-picture-input"
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              cursor: isMe ? "pointer" : "default",
            }}
          >
            <CachedImage src={"/avatar/" + (search || user?.id)} alt={profile.username} className="profile-avatar" />
          </label>
          {isMe && <input id="profile-picture-input" type="file" accept="image/*" style={{ display: "none" }} onChange={handleProfilePictureChange} />}
        </div>
        <div
          className="profile-header"
          style={{
            width: "100%",
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <div className="profile-name" style={{ fontSize: "1.2em", fontWeight: 600 }}>
            {profile.username}{" "}
            <Certification
              user={profile}
              style={{
                marginLeft: 4,
                width: 24,
                height: 24,
                position: "relative",
                top: -2,
                verticalAlign: "middle",
              }}
            />
            {profile.disabled ? <span style={{ color: "red" }}>{t("profile.disabledLabel")}</span> : null}
          </div>
          <BadgesBox badges={profile.badges || []} studio={profile.isStudio} /> {/* <-- Ajout ici */}
          {/* Action buttons below username */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 8,
              justifyContent: "center",
              marginTop: 8,
              marginBottom: 8,
            }}
          >
            {user && !isMe && (
              <>
                {user.admin && profile.disabled ? (
                  <button
                    className="shop-prompt-buy-btn"
                    style={{
                      background: "#4c7aafff",
                      minWidth: 90,
                    }}
                    onClick={handleReenableAccount}
                  >
                    {t("profile.reenable")}
                  </button>
                ) : null}
                {user.admin && !profile.disabled ? (
                  <button
                    className="shop-prompt-buy-btn"
                    style={{
                      background: "#f44336",
                      minWidth: 90,
                    }}
                    onClick={handleDisableAccount}
                  >
                    {t("profile.disable")}
                  </button>
                ) : null}
                {!profile.disabled ? (
                  <>
                    <button
                      className="shop-prompt-buy-btn"
                      style={{ minWidth: 90 }}
                      onClick={() => {
                        setGiveCreditsOpen(true);
                        setGiveCreditsError(null);
                        setGiveCreditsSuccess(null);
                      }}
                    >
                      {t("profile.giveCredits")}
                    </button>
                    <button className="shop-prompt-buy-btn" style={{ minWidth: 90 }} onClick={handleStartTrade}>
                      {t("profile.trade")}
                    </button>
                  </>
                ) : null}
              </>
            )}
            {user && isMe && (
              <>
                <Link href="/my-market-listings">
                  <button className="shop-prompt-buy-btn" style={{ minWidth: 90 }}>
                    {t("profile.myListings")}
                  </button>
                </Link>
                <Link href="/settings" title={t("profile.settings")}>
                  <button className="shop-prompt-buy-btn" style={{ minWidth: 90 }}>
                    <i className="fa fa-cog" aria-hidden="true"></i>
                  </button>
                </Link>
              </>
            )}
          </div>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            width: "100%",
            padding: "0 8px",
          }}
        >
          <div className="profile-shop-section">
            <h2 className="profile-inventory-title">{t("profile.inventoryTitle")}</h2>
            <Inventory
              profile={{
                ...profile,
                inventory: profile.inventory
                  ? profile.inventory.map((item) => ({
                      ...item,
                      item_id: item.itemId,
                      icon_hash: item.iconHash,
                      // Optionally remove itemId/iconHash if Inventory expects only snake_case
                    }))
                  : [],
              }}
              isMe={isMe}
              reloadFlag={inventoryReloadFlag}
            />
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              width: "100%",
              gap: 8,
            }}
          >
            <ProfileShop user={profile} onBuySuccess={() => setInventoryReloadFlag((f) => f + 1)} />
          </div>
        </div>
      </div>
      {/* Trade Panel - only show if not our own profile */}
      {user && user.id !== profile.id && currentTradeId && (
        <TradePanel
          tradeId={currentTradeId}
          userId={user.id}
          token={token}
          inventory={user.inventory}
          reloadInventory={reloadInventory}
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
        onSubmit={(amount) => {
          setGiveCreditsOpen(false);
          handleGiveCredits(amount);
        }}
        maxAmount={user?.balance}
        username={profile.username || profile.username}
      />
      {/* Feedback for give credits */}
      {giveCreditsLoading && (
        <div className="shop-alert-overlay">
          <div className="shop-alert">
            <div>{t("profile.sendingCredits")}</div>
          </div>
        </div>
      )}
      {giveCreditsError && (
        <div className="shop-alert-overlay">
          <div className="shop-alert">
            <div style={{ color: "red" }}>{giveCreditsError}</div>
            <button className="shop-alert-ok-btn" onClick={() => setGiveCreditsError(null)}>
              OK
            </button>
          </div>
        </div>
      )}
      {giveCreditsSuccess && (
        <div className="shop-alert-overlay">
          <div className="shop-alert">
            <div>{t("profile.creditsSent")}</div>
            <button className="shop-alert-ok-btn" onClick={() => setGiveCreditsSuccess(null)}>
              {t("profile.ok")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Utilitaire pour badge
const BADGE_INFO: Record<string, { label: string; icon: string; color: string }> = {
  staff: { label: "Staff", icon: "fa-screwdriver-wrench", color: "#7289DA" }, // Discord Blurple
  moderator: {
    label: "Moderator",
    icon: "fa-shield-halved",
    color: "#f2ad58ff",
  }, // Discord Blurple (slightly different)
  community_manager: {
    label: "Community Manager",
    icon: "fa-users",
    color: "#23a548ff",
  }, // Discord Green
  early_user: { label: "Early User", icon: "fa-bolt", color: "#ff3535ff" }, // Discord Yellow
  bug_hunter: { label: "Bug Hunter", icon: "fa-bug", color: "#fff200ff" }, // Discord Pink
  contributor: {
    label: "Contributor",
    icon: "fa-code-branch",
    color: "#7200b8ff",
  }, // Another Discord Green variant
  partner: { label: "Partner", icon: "fa-handshake", color: "#677BC4" }, // Discord Partner color
  support: { label: "Support", icon: "fa-headset", color: "#e51ed8ff" },
};

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserShield, faShieldHalved, faUsers, faBolt, faBug, faCodeBranch, faHandshake, faHeadset, faScrewdriverWrench } from "@fortawesome/free-solid-svg-icons";

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

function BadgesBox({ badges, studio }: { badges: string[]; studio?: boolean }) {
  const filteredBadges = badges.filter((badge) => {
    if (badge === "early_user" && studio) return false;
    return true;
  });
  if (!filteredBadges || filteredBadges.length === 0) return null;
  return (
    <div
      style={{
        display: "flex",
        gap: 8,
        border: "1px solid #36393f",
        background: "rgba(54,57,63,0.85)",
        borderRadius: 8,
        padding: "6px 12px",
        marginTop: 8,
        alignItems: "center",
        flexWrap: "wrap",
        boxShadow: "0 1px 4px 0 rgba(0,0,0,0.12)",
      }}
    >
      {filteredBadges.map((badge) => {
        const info = BADGE_INFO[badge];
        if (!info) return null;
        const icon = BADGE_ICONS[info.icon];
        return (
          <Link key={badge} href={`/badges#${badge}`} passHref legacyBehavior>
            <a
              title={info.label}
              style={{
                display: "flex",
                alignItems: "center",
                borderRadius: 6,
                padding: "2px 10px 2px 10px",
                fontWeight: 500,
                fontSize: 15,
                transition: "transform 0.1s",
                textDecoration: "none",
                cursor: "pointer",
                outline: "none",
              }}
              tabIndex={0}
            >
              <FontAwesomeIcon
                icon={icon}
                style={{
                  fontSize: 20,
                  filter: "drop-shadow(0 0px 0px rgba(0, 0, 0, 0))",
                }}
                color={info.color}
                fixedWidth
              />
              {/* {info.label} */}
            </a>
          </Link>
        );
      })}
    </div>
  );
}

export default function Profile({ userId }: ProfileProps) {
  const isMobile = useIsMobile();
  const logic = useProfileLogic(userId);
  return isMobile ? <ProfileMobile {...logic} /> : <ProfileDesktop {...logic} />;
}
