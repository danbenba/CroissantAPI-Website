import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import useAuth from "../hooks/useAuth";
import { ShopItem } from "../pages/profile";

const endpoint = "/api";

export interface Item {
  iconHash: string;
  itemId: string;
  name: string;
  description: string;
  amount: number;
  price?: number;
  owner?: string;
  showInStore?: boolean;
  deleted?: boolean;
}

interface User {
  verified: boolean;
  id: string;
  username: string;
  disabled?: boolean;
  admin?: boolean;
  isStudio?: boolean;
  inventory?: (Item & { amount: number })[];
  ownedItems?: ShopItem[];
}

interface Props {
  profile: User;
  isMe?: boolean;
  reloadFlag: number;
}

export default function Inventory({ profile, isMe, reloadFlag }: Props) {
  const searchParams = useSearchParams();

  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [prompt, setPrompt] = useState<{
    message: string;
    resolve: (value: { confirmed: boolean; amount?: number }) => void;
    maxAmount?: number;
    amount?: number;
  } | null>(null);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [ownerUser, setOwnerUser] = useState<any | null>(null);

  const { user } = useAuth();
  const selectedUser = profile.id === "me" ? user?.id || "me" : profile.id;


  useEffect(() => {
    setItems(profile.inventory || []);
    setLoading(false);
  }, [profile.id]);
  useEffect(() => { if (reloadFlag) refreshInventory(); }, [reloadFlag]);

  function refreshInventory() {
    fetch(`${endpoint}/inventory/${selectedUser}`, { headers: { "Content-Type": "application/json" } })
      .then(res => res.ok ? res.json() : Promise.reject(new Error("Failed to fetch inventory")))
      .then(data => { setItems([...data]); setLoading(false); })
      .catch(err => { setError(err.message); setLoading(false); });
    setLoading(false);
  }

  const customPrompt = (message: string, maxAmount?: number) => {
    return new Promise<{ confirmed: boolean; amount?: number }>(resolve =>
      setPrompt({ message, resolve, maxAmount, amount: 1 })
    );
  };

  const handlePromptResult = (confirmed: boolean) => {
    if (prompt) {
      prompt.resolve({ confirmed, amount: prompt.amount });
      setPrompt(null);
    }
  };

  const handlePromptAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (prompt) {
      const value = Math.max(1, Math.min(Number(e.target.value), prompt.maxAmount || 1));
      setPrompt(prev => prev ? { ...prev, amount: value } : null);
    }
  };

  async function handleAction(item: Item, action: "sell" | "drop", actionText: string) {
    if (!isMe) return;
    const result = await customPrompt(`${actionText} how many "${item.name}"?`, item.amount);
    if (result.confirmed && result.amount && result.amount > 0) {
      fetch(`${endpoint}/items/${action}/${item.itemId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: result.amount }),
      })
        .then(async res => {
          const data = await res.json();
          if (!res.ok) throw new Error(data.message || `Failed to ${action} item`);
          return data;
        })
        .then(() => { refreshInventory(); })
        .catch(err => setError(err.message));
    }
  }
  const handleSell = (item: Item) => handleAction(item, "sell", "Sell");
  const handleDrop = (item: Item) => handleAction(item, "drop", "Drop");

  const handleItemClick = async (item: Item) => {
    try {
      const res = await fetch(`${endpoint}/items/${item.itemId}`, { headers: { "Content-Type": "application/json" } });
      if (!res.ok) throw new Error("Failed to fetch item details");
      const details = await res.json();
      let ownerUser = null;
      if (details.owner) {
        const userRes = await fetch(`${endpoint}/users/${details.owner}`);
        if (userRes.ok) ownerUser = await userRes.json();
      }
      setSelectedItem({ ...item, ...details, amount: item.amount });
      setOwnerUser(ownerUser);
    } catch {
      setSelectedItem(item);
      setOwnerUser(null);
    }
  };

  const handleBackToInventory = () => {
    setSelectedItem(null);
    setOwnerUser(null);
  };

  const columns = 8;
  const minRows = 3;
  const totalItems = items.length;
  const rows = Math.max(minRows, Math.ceil(totalItems / columns));
  const totalCells = rows * columns;
  const emptyCells = totalCells - totalItems;

  const InventoryItem = React.memo(function InventoryItem({ item, onSelect, isMe, onSell, onDrop }: {
    item: Item,
    onSelect: (item: Item) => void,
    isMe: boolean,
    onSell: (item: Item) => void,
    onDrop: (item: Item) => void
  }) {
    const [loaded, setLoaded] = React.useState(false);
    const [showTooltip, setShowTooltip] = React.useState(false);
    const [showContext, setShowContext] = React.useState(false);
    const [mousePos, setMousePos] = React.useState<{ x: number, y: number } | null>(null);
    const iconUrl = "/items-icons/" + (item?.iconHash || item.itemId);
    const fallbackUrl = "/assets/System_Shop.webp";

    const handleMouseEnter = (e: React.MouseEvent) => {
      setShowTooltip(true);
      const rect = (e.target as HTMLElement).getBoundingClientRect();
      setMousePos({ x: rect.right + 8, y: rect.top });
    };
    const handleMouseLeave = () => {
      setShowTooltip(false);
      setShowContext(false);
    };
    const handleContextMenu = (e: React.MouseEvent) => {
      e.preventDefault();
      setShowContext(true);
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    return (
      <div className="inventory-item" tabIndex={0} draggable={false}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onContextMenu={handleContextMenu}
        onClick={() => onSelect(item)}>
        <div style={{ position: "relative", width: "48px", height: "48px" }}>
          <img
            src={fallbackUrl}
            alt="default"
            className="inventory-item-img inventory-item-img-blur"
            style={{
              filter: loaded ? "blur(0px)" : "blur(8px)",
              transition: "filter 0.3s",
              position: "absolute",
              inset: 0,
              width: "48px",
              height: "48px",
              objectFit: "contain",
              zIndex: 1,
              display: loaded ? "none" : undefined
            }}
            draggable={false}
          />
          <img
            src={iconUrl}
            alt={item.name}
            className="inventory-item-img"
            style={{
              opacity: loaded ? 1 : 0,
              transition: "opacity 0.3s",
              position: "absolute",
              inset: 0,
              width: "48px",
              height: "48px",
              objectFit: "contain",
              zIndex: 2
            }}
            draggable={false}
            onLoad={() => setLoaded(true)}
            onError={() => setLoaded(true)}
          />
        </div>
        <div className="inventory-item-qty" style={{ position: "absolute", zIndex: 3 }}>x{item.amount}</div>
        {showTooltip && mousePos && (
          <div className="inventory-tooltip" style={{ left: mousePos.x, top: mousePos.y }}>
            <div className="inventory-tooltip-name">{item.name}</div>
            <div className="inventory-tooltip-desc">{item.description}</div>
          </div>
        )}
        {showContext && isMe && mousePos && (
          <div className="inventory-context-menu" style={{ left: mousePos.x, top: mousePos.y }} onClick={e => e.stopPropagation()}>
            <div className="inventory-context-sell" onClick={() => onSell(item)}>Sell</div>
            <div className="inventory-context-drop" onClick={() => onDrop(item)}>Drop</div>
          </div>
        )}
      </div>
    );
  });

  // On mémorise les callbacks pour éviter de recréer les fonctions à chaque rendu
  const memoHandleItemClick = useCallback((item: Item) => handleItemClick(item), [handleItemClick]);

  // Render detailsView if selectedItem, else render inventory grid
  // if (selectedItem) return detailsView;

  return (
    <div className="inventory-root">
      {loading && <div className="inventory-loading"><div className="inventory-loading-spinner"></div></div>}
      {error && <p className="inventory-error">{error}</p>}
      <div className="inventory-grid" style={{ gridTemplateColumns: !selectedItem ? `repeat(${columns}, 1fr)` : "auto", gap: selectedItem ? "0px" : undefined }}>
        {selectedItem ? (<>
          <button onClick={handleBackToInventory} className="inventory-back-btn">← Back to Inventory</button>
          <div className="inventory-details-main">
            <img src={"/items-icons/" + (selectedItem.iconHash || selectedItem.itemId)} alt={selectedItem.name} className="inventory-details-img" />
            <div>
              <div className="inventory-details-name">{selectedItem.amount}x {selectedItem.name}</div>
              <div className="inventory-details-desc">{selectedItem.description}</div>
              <div style={{ display: "flex", flexDirection: "row", gap: "8px" }}>
                {selectedItem.price !== undefined && (
                  <div className="inventory-details-price">
                    Price: {selectedItem.price} <img src="/assets/credit.png" className="inventory-credit-icon" />
                  </div>
                )}
                {selectedItem.owner && ownerUser && (
                  <div className="inventory-details-creator" style={{ position: "relative", top: "-6px" }}>
                    Creator:{" "}
                    <Link href={`/profile?user=${selectedItem.owner}`} className="inventory-details-creator-link">
                      <img className="inventory-details-creator-avatar" src={"/avatar/" + selectedItem.owner} />
                      {ownerUser.username}{" "}
                      {ownerUser.verified && (
                        <img
                          src={
                            "/assets/" +
                            (!ownerUser.admin
                              ? ownerUser.isStudio
                                ? "brand-verified-mark.png"
                                : "verified-mark.png"
                              : "admin-mark.png")
                          }
                          alt="Verified"
                          style={{ marginLeft: "4px", width: "16px", height: "16px", position: "relative", top: "2px" }}
                        />
                      )}
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div></>
        ) : (
          <>
            {!loading && !error && (
              <>
                {items.map((item) => (
                  <InventoryItem
                    key={item.itemId}
                    item={item}
                    onSelect={handleItemClick}
                    isMe={!!isMe}
                    onSell={handleSell}
                    onDrop={handleDrop}
                  />
                ))}
                {Array.from({ length: emptyCells }).map((_, idx) => (
                  <div key={`empty-${idx}`} className="inventory-item-empty" draggable={false} />
                ))}
              </>
            )}
          </>
        )}

      </div>
      {prompt && (
        <div className="inventory-prompt-overlay">
          <div className="inventory-prompt">
            <div className="inventory-prompt-message">{prompt.message}</div>
            {prompt.maxAmount && (
              <div className="inventory-prompt-amount">
                <input type="number" min={1} max={prompt.maxAmount} value={prompt.amount} onChange={handlePromptAmountChange} className="inventory-prompt-amount-input" />
                <span className="inventory-prompt-amount-max">/ {prompt.maxAmount}</span>
              </div>
            )}
            <button className="inventory-prompt-yes-btn" onClick={() => handlePromptResult(true)}>Yes</button>
            <button className="inventory-prompt-no-btn" onClick={() => handlePromptResult(false)}>No</button>
          </div>
        </div>
      )}
    </div>
  );
}
