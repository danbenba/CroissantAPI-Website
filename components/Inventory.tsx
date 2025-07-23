import React, { useState, useEffect } from "react";
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
  const [tooltip, setTooltip] = useState<{ x: number; y: number; item: Item } | null>(null);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; item: Item } | null>(null);
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

  const handleMouseEnter = (e: React.MouseEvent, item: Item) => {
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    setTooltip({ x: rect.right + 8, y: rect.top, item });
  };
  const handleMouseLeave = () => setTooltip(null);

  const handleContextMenu = (e: React.MouseEvent, item: Item) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, item });
  };

  const customPrompt = (message: string, maxAmount?: number) => {
    setContextMenu(null);
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
        .then(() => { setContextMenu(null); refreshInventory(); })
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
    setTooltip(null);
    setContextMenu(null);
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
  if (selectedItem) return (
    <div className="inventory-details-container">
      <button onClick={handleBackToInventory} className="inventory-back-btn">← Back to Inventory</button>
      <div className="inventory-details-main">
        <img src={"/items-icons/" + (selectedItem.iconHash || selectedItem.itemId)} alt={selectedItem.name} className="inventory-details-img" />
        <div>
          <div className="inventory-details-name">{selectedItem.name}</div>
          <div className="inventory-details-desc">{selectedItem.description}</div>
          <div className="inventory-details-qty">Quantity: x{selectedItem.amount}</div>
          {selectedItem.price !== undefined && (
            <div className="inventory-details-price">
              Price: {selectedItem.price} <img src="/assets/credit.png" className="inventory-credit-icon" />
            </div>
          )}
          {selectedItem.owner && ownerUser && (
            <div className="inventory-details-creator">
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
    </div>
  );

  return (
    <div className="inventory-root">
      {loading && <div className="inventory-loading"><div className="inventory-loading-spinner"></div></div>}
      {error && <p className="inventory-error">{error}</p>}
      <div className="inventory-grid" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
        {!loading && !error && (
          <>
            {items.map((item) => (
              <div key={item.itemId} className="inventory-item" tabIndex={0} draggable={false}
                onMouseEnter={e => handleMouseEnter(e, item)}
                onMouseLeave={handleMouseLeave}
                onContextMenu={e => handleContextMenu(e, item)}
                onClick={() => handleItemClick(item)}>
                <img src={"/items-icons/" + (item?.iconHash || item.itemId)} alt={item.name} className="inventory-item-img" draggable={false} />
                <div className="inventory-item-qty">x{item.amount}</div>
              </div>
            ))}
            {Array.from({ length: emptyCells }).map((_, idx) => (
              <div key={`empty-${idx}`} className="inventory-item-empty" draggable={false} />
            ))}
          </>
        )}
      </div>
      {tooltip && (
        <div className="inventory-tooltip" style={{ left: tooltip.x, top: tooltip.y }}>
          <div className="inventory-tooltip-name">{tooltip.item.name}</div>
          <div className="inventory-tooltip-desc">{tooltip.item.description}</div>
        </div>
      )}
      {contextMenu && isMe && (
        <div className="inventory-context-menu" style={{ left: contextMenu.x, top: contextMenu.y }} onClick={e => e.stopPropagation()}>
          <div className="inventory-context-sell" onClick={() => handleSell(contextMenu.item)}>Sell</div>
          <div className="inventory-context-drop" onClick={() => handleDrop(contextMenu.item)}>Drop</div>
        </div>
      )}
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
