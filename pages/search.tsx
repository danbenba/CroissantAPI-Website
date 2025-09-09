import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import useAuth from "../hooks/useAuth";
import useUserCache from "../hooks/useUserCache";
import CachedImage from "../components/utils/CachedImage";
import Certification from "../components/common/Certification";
import { Trans, useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common"])),
    },
  };
}
// API endpoint for user search
const API_ENDPOINT = "/api";

// User type for better type safety
interface User {
  id: string;
  username: string;
  verified: boolean;
  isStudio?: boolean;
  admin?: boolean;
}

// Game type (from Shop.tsx)
interface Game {
  gameId: string;
  name: string;
  price: number;
  rating?: number;
  genre?: string;
  description?: string;
  bannerHash?: string;
  iconHash?: string;
}

// Item type for search results
interface Item {
  itemId: string;
  name: string;
  description: string;
  owner: string;
  price: number;
  iconHash?: string;
  showInStore?: boolean;
}

/**
 * Search page for users.
 * Fetches and displays users matching the search query.
 */
const SearchPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [games, setGames] = useState<Game[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const { user, token } = useAuth();
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";
  const { cacheUser } = useUserCache();
  const { t } = useTranslation("common");

  // Fetch users/games/items with debounce when query or token changes
  useEffect(() => {
    if (!query) {
      setUsers([]);
      setGames([]);
      setItems([]);
      return;
    }

    const controller = new AbortController();
    const debounceTimeout = setTimeout(() => {
      fetch(`${API_ENDPOINT}/search?q=${encodeURIComponent(query)}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        signal: controller.signal,
      })
        .then((res) => res.json())
        .then(async (data) => {
          // On met en cache les users reçus
          if (Array.isArray(data.users)) {
            for (const u of data.users) {
              await cacheUser(u); // met en cache si pas déjà
            }
          }
          setUsers(Array.isArray(data.users) ? data.users : []);
          setGames(Array.isArray(data.games) ? data.games : []);
          setItems(Array.isArray(data.items) ? data.items : []);
        })
        .catch(() => {
          setUsers([]);
          setGames([]);
          setItems([]);
        });
    }, 400); // 400ms debounce

    return () => {
      clearTimeout(debounceTimeout);
      controller.abort();
    };
  }, [query, token, user?.admin]);

  const [buyModalOpen, setBuyModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [buyLoading, setBuyLoading] = useState(false);
  const [buyError, setBuyError] = useState<string | null>(null);
  const [buySuccess, setBuySuccess] = useState<string | null>(null);

  // Buy handler
  const handleBuy = (item: Item) => {
    setSelectedItem(item);
    setBuyModalOpen(true);
    setBuyError(null);
    setBuySuccess(null);
  };
  const handleBuySubmit = async (amount: number) => {
    if (!selectedItem) return;
    setBuyLoading(true);
    setBuyError(null);
    setBuySuccess(null);
    try {
      const res = await fetch(`/api/items/buy/${selectedItem.itemId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ amount }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to buy item");
      setBuySuccess("Item purchased!");
      setBuyModalOpen(false);
    } catch (e: any) {
      setBuyError(e.message);
    } finally {
      setBuyLoading(false);
    }
  };

  if (!query) {
    return (
      <div className="search-container">
        <div className="search-header">{t("search.enterQuery")}</div>
      </div>
    );
  }

  // ItemBuyModal: Modal for buying an item from search
  function ItemBuyModal({
    open,
    onClose,
    onBuy,
    item,
  }: {
    open: boolean;
    onClose: () => void;
    onBuy: (amount: number) => void;
    item: Item | null;
  }) {
    const [amount, setAmount] = useState(1);
    useEffect(() => {
      if (open) setAmount(1);
    }, [open]);
    if (!open || !item) return null;
    return (
      <div className="shop-prompt-overlay">
        <div className="shop-prompt">
          <div className="shop-prompt-item-details">
            <CachedImage
              src={"/items-icons/" + (item.iconHash || item.itemId)}
              alt={item.name}
              className="shop-prompt-item-img"
            />
            <div className="shop-prompt-item-info">
              <div className="shop-prompt-item-name">{item.name}</div>
              <div className="shop-prompt-item-desc">{item.description}</div>
              <div className="shop-prompt-item-price">
                {t("search.price")}: {item.price}
                <CachedImage
                  src="/assets/credit.avif"
                  className="shop-credit-icon"
                />
              </div>
            </div>
          </div>
          <div className="shop-prompt-message">
            <Trans i18nKey="search.buyHowMany" values={{ item: item.name }} />
          </div>
          <div className="shop-prompt-amount">
            <input
              type="number"
              min={1}
              value={amount}
              onChange={(e) => setAmount(Math.max(1, Number(e.target.value)))}
              className="shop-prompt-amount-input"
            />
            <span className="shop-prompt-amount-total">
              <Trans
                i18nKey="search.total"
                values={{ total: amount * (item.price || 0) }}
              />
              <CachedImage
                src="/assets/credit.avif"
                className="shop-credit-icon"
              />
            </span>
          </div>
          <button className="shop-prompt-buy-btn" onClick={() => onBuy(amount)}>
            {t("search.buy")}
          </button>
          <button className="shop-prompt-cancel-btn" onClick={onClose}>
            {t("search.cancel")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="search-container">
      <div className="search-header">
        <Trans
          i18nKey="search.resultsFor"
          values={{ query }}
          components={{ strong: <strong /> }}
        />
      </div>
      {/* Section Users */}
      {users.length > 0 && (
        <>
          <h1 className="search-title">{t("search.users")}</h1>
          <div className="search-users-grid">
            {users.map((user) => (
              <Link
                key={user.id}
                href={`/profile?user=${user.id}`}
                style={{ textDecoration: "none" }}
              >
                <div
                  className="search-user-card"
                  tabIndex={0}
                  onMouseOver={(e) =>
                    (e.currentTarget.style.boxShadow =
                      "0 4px 16px rgba(0,0,0,0.28)")
                  }
                  onMouseOut={(e) =>
                    (e.currentTarget.style.boxShadow =
                      "0 2px 8px rgba(0,0,0,0.18)")
                  }
                >
                  <CachedImage
                    src={`/avatar/${user.id}`}
                    alt="User Avatar"
                    className="search-user-avatar"
                  />
                  <div className="search-user-name">
                    {user.username?.length > 15
                      ? user.username.substring(0, 15) + "..."
                      : user.username}{" "}
                    <Certification
                      user={user}
                      style={{
                        marginLeft: 4,
                        width: 16,
                        height: 16,
                        position: "relative",
                        top: -2,
                        verticalAlign: "middle",
                      }}
                    />
                  </div>
                  <div
                    className="search-user-username"
                    style={{ fontSize: 10 }}
                  >
                    {user.id}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </>
      )}
      {/* Section Games */}
      {games.length > 0 && (
        <>
          <h1 className="search-title" style={{ marginTop: 40 }}>
            {t("search.games")}
          </h1>
          <div className="search-games-grid">
            {games.map((game) => (
              <Link
                key={game.gameId}
                href={`/game?gameId=${game.gameId}`}
                style={{ textDecoration: "none" }}
              >
                <div
                  className="search-game-card"
                  tabIndex={0}
                  onMouseOver={(e) =>
                    (e.currentTarget.style.boxShadow =
                      "0 4px 16px rgba(0,0,0,0.28)")
                  }
                  onMouseOut={(e) =>
                    (e.currentTarget.style.boxShadow =
                      "0 2px 8px rgba(0,0,0,0.18)")
                  }
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 18,
                    padding: 16,
                    borderRadius: 12,
                    background: "var(--background-medium)",
                    marginBottom: 18,
                    border: "2px solid var(--border-color)",
                  }}
                >
                  <CachedImage
                    src={
                      game.iconHash
                        ? `/games-icons/${game.iconHash}`
                        : "/games-icons/default.avif"
                    }
                    alt={game.name}
                    className="search-game-icon"
                    style={{
                      width: 64,
                      height: 64,
                      objectFit: "contain",
                      borderRadius: 12,
                      background: "#23232a",
                      border: "2px solid #888",
                    }}
                  />
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        fontWeight: 700,
                        fontSize: 20,
                        color: "var(--text-color-primary)",
                      }}
                    >
                      {game.name}
                    </div>
                    <div
                      style={{
                        color: "var(--text-color-secondary)",
                        fontSize: 15,
                      }}
                    >
                      {game.genre}
                    </div>
                    <div
                      style={{
                        color: "var(--text-color-secondary)",
                        fontSize: 14,
                        marginTop: 4,
                        minHeight: 18,
                        maxHeight: 36,
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {game.description}
                    </div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        marginTop: 6,
                      }}
                    >
                      <span
                        style={{
                          color: "var(--gold-color)",
                          fontWeight: 700,
                          fontSize: 16,
                        }}
                      >
                        {game.price}{" "}
                        <CachedImage
                          src="/assets/credit.avif"
                          alt="credits"
                          style={{ width: 18, verticalAlign: "middle" }}
                        />
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </>
      )}
      {/* Section Items */}
      {items.length > 0 && (
        <>
          <h1 className="search-title" style={{ marginTop: 40 }}>
            {t("search.items")}
          </h1>
          <div className="search-items-grid">
            {items.map((item) => (
              <Link
                key={item.itemId}
                href={"about:blank"}
                onClick={(e) => {
                  e.preventDefault();
                  handleBuy(item);
                }}
                style={{ textDecoration: "none" }}
              >
                <div
                  className="search-item-card"
                  tabIndex={0}
                  onMouseOver={(e) =>
                    (e.currentTarget.style.boxShadow =
                      "0 4px 16px rgba(0,0,0,0.28)")
                  }
                  onMouseOut={(e) =>
                    (e.currentTarget.style.boxShadow =
                      "0 2px 8px rgba(0,0,0,0.18)")
                  }
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 18,
                    padding: 16,
                    borderRadius: 12,
                    background: "var(--background-medium)",
                    marginBottom: 18,
                    border: "2px solid var(--border-color)",
                  }}
                >
                  <CachedImage
                    src={`/items-icons/${
                      item?.iconHash || item.itemId
                        ? item.iconHash || item.itemId
                        : "default.avif"
                    }`}
                    alt={item.name}
                    className="search-item-icon"
                    style={{
                      width: 64,
                      height: 64,
                      objectFit: "contain",
                      borderRadius: 12,
                      background: "#23232a",
                      border: "2px solid #888",
                    }}
                  />
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        fontWeight: 700,
                        fontSize: 20,
                        color: "var(--text-color-primary)",
                      }}
                    >
                      {item.name}
                    </div>
                    <div
                      style={{
                        color: "var(--text-color-secondary)",
                        fontSize: 15,
                      }}
                    >
                      {item.description}
                    </div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        marginTop: 6,
                      }}
                    >
                      <span
                        style={{
                          color: "var(--gold-color)",
                          fontWeight: 700,
                          fontSize: 16,
                        }}
                      >
                        {item.price}{" "}
                        <CachedImage
                          src="/assets/credit.avif"
                          alt="credits"
                          style={{ width: 18, verticalAlign: "middle" }}
                        />
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </>
      )}
      {/* Item Buy Modal */}
      <ItemBuyModal
        open={buyModalOpen}
        onClose={() => setBuyModalOpen(false)}
        onBuy={handleBuySubmit}
        item={selectedItem}
      />
      {/* Buy feedback overlays */}
      {buyLoading && (
        <div className="shop-alert-overlay">
          <div className="shop-alert">
            <div>{t("search.buyingItem")}</div>
          </div>
        </div>
      )}
      {buyError && (
        <div className="shop-alert-overlay">
          <div className="shop-alert">
            <div style={{ color: "red" }}>{buyError}</div>
            <button
              className="shop-alert-ok-btn"
              onClick={() => setBuyError(null)}
            >
              {t("search.ok")}
            </button>
          </div>
        </div>
      )}
      {buySuccess && (
        <div className="shop-alert-overlay">
          <div className="shop-alert">
            <div>{t("search.itemPurchased")}</div>
            <button
              className="shop-alert-ok-btn"
              onClick={() => setBuySuccess(null)}
            >
              {t("search.ok")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchPage;
