import React, { useEffect, useState } from "react";
import useAuth from "../hooks/useAuth";
import CachedImage from "../components/utils/CachedImage";
import useUserCache from "../hooks/useUserCache";
import Link from "next/link";

interface BuyOrder {
    id: string;
    buyer_id: string;
    item_id: string;
    price: number;
    amount: number;
    status: string;
    created_at: string;
    updated_at: string;
    fulfilled_at?: string;
}

interface ItemDetails {
    itemId: string;
    name: string;
    description: string;
    iconHash: string;
}

export default function MyBuyOrdersPage() {
    const { user, loading: userLoading } = useAuth();
    const [orders, setOrders] = useState<BuyOrder[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [itemDetails, setItemDetails] = useState<Record<string, ItemDetails>>({});

    useEffect(() => {
        if (!user || userLoading) return;
        setLoading(true);
        fetch(`/api/buy-orders/user/${user.id}`)
            .then(async res => {
                const data = await res.json();
                if (!res.ok) throw new Error(data.message || "Failed to fetch buy orders");
                setOrders(data);
                setLoading(false);
            })
            .catch(err => {
                setError(err.message);
                setLoading(false);
            });
    }, [user, userLoading]);

    // Fetch item details for all unique item_ids
    useEffect(() => {
        const uniqueItemIds = Array.from(new Set(orders.map(o => o.item_id)));
        const missing = uniqueItemIds.filter(id => !(id in itemDetails));
        if (missing.length === 0) return;
        Promise.all(missing.map(id =>
            fetch(`/api/items/${id}`).then(res => res.ok ? res.json() : null).catch(() => null)
        )).then(items => {
            const newDetails: Record<string, ItemDetails> = {};
            items.forEach((item, idx) => {
                if (item && item.itemId) newDetails[missing[idx]] = {
                    itemId: item.itemId,
                    name: item.name,
                    description: item.description,
                    iconHash: item.iconHash
                };
            });
            setItemDetails(prev => ({ ...prev, ...newDetails }));
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [orders]);

    const handleCancel = async (order: BuyOrder) => {
        if (!window.confirm("Cancel this buy order?")) return;
        try {
            const res = await fetch(`/api/buy-orders/${order.id}/cancel`, { method: "PUT" });
            if (!res.ok) throw new Error((await res.json()).message);
            setOrders(orders => orders.filter(o => o.id !== order.id));
        } catch (e: any) {
            alert(e.message);
        }
    };

    if (userLoading) return <div>Loading...</div>;
    if (!user) return <div>You must be logged in to view your buy orders.</div>;

    return (
        <div style={{ maxWidth: 900, margin: "0 auto", padding: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h2>My Buy Orders</h2>
                <Link href="/marketplace" style={{ color: "#ffd700", fontWeight: 600, fontSize: 16 }}>← Back to Marketplace</Link>
            </div>
            {loading && <div>Loading...</div>}
            {error && <div style={{ color: "red" }}>{error}</div>}
            {!loading && orders.length === 0 && <div>No buy orders placed.</div>}
            <div className="market-table-wrapper">
                <table className="market-table">
                    <thead>
                        <tr>
                            <th>Item</th>
                            <th>Description</th>
                            <th>Price</th>
                            <th>Status</th>
                            <th>Placed</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.map(order => {
                            const item = itemDetails[order.item_id];
                            return (
                                <tr key={order.id}>
                                    <td>
                                        {item ? (
                                            <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                                <CachedImage src={`/items-icons/${item.iconHash || item.itemId}`} alt="" width={32} height={32} />
                                                {item.name}
                                            </span>
                                        ) : order.item_id}
                                    </td>
                                    <td style={{ maxWidth: 220, color: "#bbb" }}>{item ? item.description : ""}</td>
                                    <td>{order.price} <CachedImage src="/assets/credit.png" alt="credits" style={{ width: 14, verticalAlign: "middle" }} /></td>
                                    <td>{order.status}</td>
                                    <td>{new Date(order.created_at).toLocaleString()}</td>
                                    <td>
                                        {order.status === "active" ? (
                                            <button
                                                onClick={() => handleCancel(order)}
                                                style={{
                                                    background: "#ff6666",
                                                    color: "#fff",
                                                    border: "none",
                                                    borderRadius: 6,
                                                    padding: "6px 14px",
                                                    fontWeight: 600,
                                                    cursor: "pointer"
                                                }}
                                            >
                                                Cancel
                                            </button>
                                        ) : (
                                            <span style={{ color: "#888" }}>—</span>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
            <style jsx>{`
        .market-table {
          width: 100%;
          border-collapse: separate;
          border-spacing: 0;
          background: #23272e;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 2px 16px #0002;
          margin-top: 16px;
        }
        .market-table th, .market-table td {
          padding: 12px 10px;
          text-align: center;
        }
        .market-table th {
          background: #181b20;
          color: #ffd700;
          font-weight: 600;
          font-size: 15px;
          border-bottom: 2px solid #333;
        }
        .market-table td {
          background: #23272e;
          color: #eee;
          font-size: 14px;
          border-bottom: 1px solid #292c33;
          vertical-align: middle;
        }
        .market-table tr:last-child td {
          border-bottom: none;
        }
        .market-table tr:hover td {
          background: #2c313a;
          transition: background 0.15s;
        }
        .market-table img {
          border-radius: 6px;
          background: #181b20;
        }
        .market-table button {
          background: #ff6666;
          color: #fff;
          border: none;
          border-radius: 6px;
          padding: 6px 14px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.15s;
        }
        .market-table button:hover {
          background: #ff3333;
        }

        @media (max-width: 700px) {
          .market-table {
            font-size: 12px;
            min-width: 600px;
            width: 100%;
            border-radius: 0;
            margin-top: 8px;
          }
          .market-table th, .market-table td {
            padding: 8px 4px;
            font-size: 12px;
          }
          .market-table th {
            font-size: 13px;
          }
          .market-table img {
            width: 24px !important;
            height: 24px !important;
          }
          .market-table button {
            padding: 4px 8px;
            font-size: 12px;
          }
          /* Pour permettre le scroll horizontal sur mobile */
          .market-table-wrapper {
            overflow-x: auto;
            -webkit-overflow-scrolling: touch;
          }
        }
      `}</style>
        </div>
    );
}
