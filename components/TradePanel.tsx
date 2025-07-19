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
        global_name?: string;
        username: string;
    };
    apiBase?: string; // e.g. "/api"
}

export default function TradePanel({ tradeId, userId, token, inventory, reloadInventory, onClose, profile, apiBase = "/api" }: TradePanelProps) {
    const [trade, setTrade] = useState<Trade | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    // Poll trade state every second
    useEffect(() => {
        let stopped = false;
        const fetchTrade = async () => {
            try {
                const res = await fetch(`${apiBase}/trades/${tradeId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
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
                headers: { Authorization: `Bearer ${token}` }
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
                headers: { Authorization: `Bearer ${token}` }
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
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ userKey: trade?.fromUserId === userId ? "fromUserItems" : "toUserItems", tradeItem: item })
            });
            if (!res.ok) throw new Error("Failed to remove item");
            reloadInventory();
        } catch (e: any) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    };

    // UI
    if (loading && !trade) return <div>Loading trade...</div>;
    if (error) return <div style={{ color: "red" }}>{error}</div>;
    if (!trade) return <div>Trade not found.</div>;

    async function addItem(item: { itemId: string; amount: number; }) {
        setLoading(true);
        try {
            const res = await fetch(`${apiBase}/trades/${tradeId}/add-item`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    userKey: trade?.fromUserId === userId ? "fromUserItems" : "toUserItems",
                    tradeItem: item
                })
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
                    userSelect: "none"
                }}
            >
                ×
            </div>
            <h2>Trade with {profile?.global_name || profile?.username}</h2>
            <div className="trade-main-columns">
                <div style={{ display: "flex", flexDirection: "column" }}>
                    <h3>Your items in the trade</h3>
                    <div
                        className={
                            "trade-column" +
                            ((trade.fromUserId === userId
                                ? trade.approvedFromUser
                                : trade.approvedToUser)
                                ? " trade-approved"
                                : "")
                        }
                    >
                        <div className="trade-inventory-grid">
                            {(trade.fromUserId === userId ? trade.fromUserItems : trade.toUserItems).map(item =>
                                <div key={item.itemId} className="trade-inventory-item">
                                    <img src={"/items-icons/" + (item.iconHash || item.itemId)} alt={item.name} />
                                    <div>x{item.amount}</div>
                                    <div>{item.name}</div>
                                    <div style={{ marginTop: 4 }}>
                                        <button onClick={() => removeItem({ ...item, amount: 1 })}>–1</button>
                                        {/* <button onClick={() => removeItem({ ...item, amount: 10 })}>–10</button> */}
                                        {/* <button onClick={() => removeItem({ ...item, amount: item.amount })}>Remove all</button> */}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column" }}>
                    <h3>Other user's items</h3>
                    <div
                        className={
                            "trade-column" +
                            ((trade.fromUserId !== userId
                                ? trade.approvedFromUser
                                : trade.approvedToUser)
                                ? " trade-approved"
                                : "")
                        }
                    >
                        <div className="trade-inventory-grid">
                            {(trade.fromUserId !== userId ? trade.fromUserItems : trade.toUserItems).map(item =>
                                <div key={item.itemId} className="trade-inventory-item">
                                    <img src={"/items-icons/" + (item.iconHash || item.itemId)} alt={item.name} />
                                    <div>x{item.amount}</div>
                                    <div>{item.name}</div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            <div className="trade-inventory-section">
                <h3>Your inventory</h3>
                <div className="trade-inventory-grid" style={{ justifyContent: "flex-start" }}>
                    {inventory
                        .map(item => {
                            const inTrade = (trade.fromUserId === userId ? trade.fromUserItems : trade.toUserItems)
                                .find(ti => ti.itemId === item.itemId)?.amount || 0;
                            const available = item.amount - inTrade;
                            return { ...item, available };
                        })
                        .filter(item => item.available > 0)
                        .map(item => (
                            <div
                                key={item.itemId}
                                className="trade-inventory-item"
                                onClick={() => addItem({ itemId: item.itemId, amount: 1 })}
                                title={`Add ${item.name} to the trade`}
                            >
                                <img src={"/items-icons/" + (item.iconHash || item.itemId)} alt={item.name} />
                                <div>x{item.available}</div>
                                <div>{item.name}</div>
                            </div>
                        ))}
                </div>
            </div>
            <div className="trade-actions">
                <button onClick={approve} disabled={trade.status !== "pending"} style={{ background: "#0e0" }}>Approve</button>
                <button onClick={cancel} disabled={trade.status !== "pending"} style={{ background: "#e00" }}>Cancel</button>
            </div>
            <div className="trade-status">
                <span>
                    {trade.fromUserId === userId
                        ? (trade.approvedFromUser ? "You have approved" : "You have not approved yet")
                        : (trade.approvedToUser ? "You have approved" : "You have not approved yet")}
                </span>
            </div>
        </div>
    );
}