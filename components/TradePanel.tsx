// TradePanel.tsx
import React, { useEffect, useState, useRef } from "react";
import type { Item } from "./Inventory";

type TradeStatus = "pending" | "approved" | "completed" | "canceled";

interface TradeItem extends Item {
  itemId: string;
  amount: number;
}

interface Trade {
  id: string;
  fromUserId: string;
  toUserId: string;
  fromUserItems: TradeItem[];
  toUserItems: TradeItem[];
  approvedFromUser: boolean;
  approvedToUser: boolean;
  status: TradeStatus;
  createdAt: string;
  updatedAt: string;
}

interface TradePanelProps {
  tradeId: string;
  userId: string;
  token: string;
  inventory: Item[];
  reloadInventory: () => void;
  onClose: () => void;
  profile?: {
    username: string;
  };
  apiBase?: string; // e.g. "/api"
}

// Sous-composant pour un item d'inventaire
function TradeInventoryItem({
  item,
  onClick,
  removable,
}: {
  item: TradeItem;
  onClick?: () => void;
  removable?: boolean;
}) {
  return (
    <div
      className="trade-inventory-item"
      onClick={onClick}
      title={onClick ? `Add ${item.name} to the trade` : undefined}
    >
      <img
        src={"/items-icons/" + (item.iconHash || item.itemId)}
        alt={item.name}
      />
      <div>x{item.amount}</div>
      <div>{item.name}</div>
      {removable && (
        <div style={{ marginTop: 4 }}>
          <button onClick={onClick}>–1</button>
        </div>
      )}
    </div>
  );
}

// Sous-composant pour une colonne d'items de trade
function TradeColumn({
  title,
  items,
  approved,
  removable,
  onRemoveItem,
}: {
  title: string;
  items: TradeItem[];
  approved: boolean;
  removable?: boolean;
  onRemoveItem?: (item: TradeItem) => void;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <h3>{title}</h3>
      <div
        className={
          "trade-column" + (approved ? " trade-approved" : "")
        }
      >
        <div className="trade-inventory-grid">
          {items.map((item) => (
            <TradeInventoryItem
              key={item.itemId}
              item={item}
              removable={removable}
              onClick={
                removable && onRemoveItem
                  ? () => onRemoveItem({ ...item, amount: 1 })
                  : undefined
              }
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function TradePanel({
  tradeId,
  userId,
  token,
  inventory,
  reloadInventory,
  onClose,
  profile,
  apiBase = "/api",
}: TradePanelProps) {
  const [trade, setTrade] = useState<Trade | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Poll trade state every second
  useEffect(() => {
    let stopped = false;
    const fetchTrade = async () => {
      try {
        const res = await fetch(`${apiBase}/trades/${tradeId}`);
        if (!res.ok) throw new Error("Failed to fetch trade");
        const data = await res.json();
        setTrade(data);
        setError(null);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    fetchTrade();
    intervalRef.current = setInterval(fetchTrade, 1000);
    return () => {
      stopped = true;
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [tradeId, token, apiBase]);

  // Close panel if trade is completed
  useEffect(() => {
    if (trade?.status === "completed" || trade?.status === "canceled") {
      onClose();
    }
  }, [trade?.status, onClose]);

  // Actions
  const approve = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${apiBase}/trades/${tradeId}/approve`, {
        method: "PUT",
      });
      if (!res.ok) throw new Error("Failed to approve trade");
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const cancel = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${apiBase}/trades/${tradeId}/cancel`, {
        method: "PUT",
      });
      if (!res.ok) throw new Error("Failed to cancel trade");
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const removeItem = async (item: TradeItem) => {
    setLoading(true);
    try {
      const res = await fetch(`${apiBase}/trades/${tradeId}/remove-item`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userKey:
            trade?.fromUserId === userId ? "fromUserItems" : "toUserItems",
          tradeItem: item,
        }),
      });
      if (!res.ok) throw new Error("Failed to remove item");
      reloadInventory();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  // Helpers
  const isCurrentUserFrom = trade?.fromUserId === userId;
  const userItems = isCurrentUserFrom ? trade?.fromUserItems || [] : trade?.toUserItems || [];
  const otherItems = isCurrentUserFrom ? trade?.toUserItems || [] : trade?.fromUserItems || [];
  const userApproved = isCurrentUserFrom ? trade?.approvedFromUser : trade?.approvedToUser;
  const otherApproved = isCurrentUserFrom ? trade?.approvedToUser : trade?.approvedFromUser;

  // UI
  if (loading && !trade) return <div>Loading trade...</div>;
  if (error) return <div style={{ color: "red" }}>{error}</div>;
  if (!trade) return <div>Trade not found.</div>;

  async function addItem(item: { itemId: string; amount: number }) {
    setLoading(true);
    try {
      const res = await fetch(`${apiBase}/trades/${tradeId}/add-item`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userKey: isCurrentUserFrom ? "fromUserItems" : "toUserItems",
          tradeItem: item,
        }),
      });
      if (!res.ok) throw new Error("Failed to add item");
      reloadInventory();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="trade-panel">
      <div
        className="trade-close-x"
        onClick={onClose}
        title="Fermer"
        style={{
          position: "absolute",
          top: 18,
          right: 22,
          fontSize: "2rem",
          color: "#aaa",
          cursor: "pointer",
          zIndex: 10,
          userSelect: "none",
        }}
      >
        ×
      </div>
      <h2>Trade with {profile?.username || profile?.username}</h2>
      <div className="trade-main-columns">
        <TradeColumn
          title="Your items in the trade"
          items={userItems}
          approved={!!userApproved}
          removable={true}
          onRemoveItem={removeItem}
        />
        <TradeColumn
          title="Other user's items"
          items={otherItems}
          approved={!!otherApproved}
        />
      </div>
      <div className="trade-inventory-section">
        <h3>Your inventory</h3>
        <div
          className="trade-inventory-grid"
          style={{ justifyContent: "flex-start" }}
        >
          {inventory
            .map((item) => {
              const inTrade =
                userItems.find((ti) => ti.itemId === item.itemId)?.amount || 0;
              const available = item.amount - inTrade;
              return { ...item, available };
            })
            .filter((item) => item.available > 0)
            .map((item) => (
              <TradeInventoryItem
                key={item.itemId}
                item={{ ...item, amount: item.available }}
                onClick={() => addItem({ itemId: item.itemId, amount: 1 })}
              />
            ))}
        </div>
      </div>
      <div className="trade-actions">
        <button
          onClick={approve}
          disabled={trade.status !== "pending"}
          style={{ background: "#0e0" }}
        >
          Approve
        </button>
        <button
          onClick={cancel}
          disabled={trade.status !== "pending"}
          style={{ background: "#e00" }}
        >
          Cancel
        </button>
      </div>
      <div className="trade-status">
        <span>
          {userApproved ? "You have approved" : "You have not approved yet"}
        </span>
      </div>
    </div>
  );
}
