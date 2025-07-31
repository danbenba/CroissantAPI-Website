import React, { useEffect, useState } from "react";
import useAuth from "../hooks/useAuth";
import useUserCache from "../hooks/useUserCache";
import CachedImage from "../components/CachedImage";
import Link from "next/link";

export interface EnrichedMarketListing {
    id: string;
    seller_id: string;
    item_id: string;
    price: number;
    status: string;
    metadata?: { [key: string]: unknown; _unique_id?: string };
    created_at: string;
    updated_at: string;
    sold_at?: string;
    buyer_id?: string;
    purchasePrice?: number;
    item_name: string;
    item_description: string;
    item_icon_hash: string;
    sellerName?: string;
}

export default function MarketplacePage() {
    const { user, loading: userLoading } = useAuth();
    const [listings, setListings] = useState<EnrichedMarketListing[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showBuyOrderModal, setShowBuyOrderModal] = useState(false);
    const [selectedItem, setSelectedItem] = useState<EnrichedMarketListing | null>(null);
    const [sellerNames, setSellerNames] = useState<Record<string, string>>({});
    const { getUser: getUserFromCache } = useUserCache();

    useEffect(() => {
        setLoading(true);
        fetch(`/api/market-listings?limit=100`)
            .then(async res => {
                const data = await res.json();
                if (!res.ok) throw new Error(data.message || "Failed to fetch listings");
                setListings(data);
                setLoading(false);
            })
            .catch(err => {
                setError(err.message);
                setLoading(false);
            });
    }, []);

    // Fetch seller usernames for all unique seller_ids
    useEffect(() => {
        const uniqueSellerIds = Array.from(new Set(listings.map(l => l.seller_id)));
        const missing = uniqueSellerIds.filter(id => !(id in sellerNames));
        if (missing.length === 0) return;
        Promise.all(missing.map(id => getUserFromCache(id).catch(() => null)))
            .then(users => {
                const newNames: Record<string, string> = {};
                users.forEach((user, idx) => {
                    if (user && user.username) newNames[missing[idx]] = user.username;
                });
                setSellerNames(prev => ({ ...prev, ...newNames }));
            });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [listings]);

    const handleBuy = async (listing: EnrichedMarketListing) => {
        if (!user) return alert("You must be logged in to buy.");
        if (!confirm(`Buy "${listing.item_name}" for ${listing.price} credits?`)) return;
        try {
            const res = await fetch(`/api/market-listings/${listing.id}/buy`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Purchase failed");
            alert("Purchase successful!");
            setListings(listings => listings.filter(l => l.id !== listing.id));
        } catch (e: any) {
            alert(e.message);
        }
    };

    // Simple modal for placing a buy order (WIP)
    const [buyOrderItemId, setBuyOrderItemId] = useState("");
    const [buyOrderPrice, setBuyOrderPrice] = useState(1);
    const [placingOrder, setPlacingOrder] = useState(false);
    const [buyOrderItemSearch, setBuyOrderItemSearch] = useState("");
    const [buyOrderItemResults, setBuyOrderItemResults] = useState<any[]>([]);
    const [buyOrderDropdownOpen, setBuyOrderDropdownOpen] = useState(false);

    const handlePlaceBuyOrder = async () => {
        if (!user) return alert("You must be logged in.");
        if (!buyOrderItemId || buyOrderPrice <= 0) return alert("All fields are required.");
        setPlacingOrder(true);
        try {
            const res = await fetch("/api/buy-orders", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    itemId: buyOrderItemId,
                    price: buyOrderPrice
                    // amount is no longer sent
                }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Failed to place buy order");
            alert("Buy order placed!");
            setShowBuyOrderModal(false);
        } catch (e: any) {
            alert(e.message);
        } finally {
            setPlacingOrder(false);
        }
    };

    const handleItemSearch = async (q: string) => {
        if (!q || q.length < 2) {
            setBuyOrderItemResults([]);
            return;
        }
        try {
            const res = await fetch(`/api/items/search?q=${encodeURIComponent(q)}`);
            if (!res.ok) return;
            const items = await res.json();
            setBuyOrderItemResults(items);
        } catch {
            setBuyOrderItemResults([]);
        }
    };

    return (
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h2>Marketplace</h2>
                <div style={{ display: "flex", gap: 12 }}>
                    <button
                        style={{
                            background: "#ffd700",
                            color: "#222",
                            border: "none",
                            borderRadius: 8,
                            padding: "8px 18px",
                            fontWeight: 700,
                            fontSize: 16,
                            cursor: "pointer",
                            boxShadow: "0 2px 8px #0002"
                        }}
                        onClick={() => setShowBuyOrderModal(true)}
                    >
                        Place Buy Order
                    </button>
                    {user && (
                        <Link href="/my-buy-orders" style={{ color: "#ffd700", fontWeight: 600, fontSize: 16 }}>
                            <button
                                style={{
                                    background: "#23272e",
                                    color: "#ffd700",
                                    border: "1px solid #ffd700",
                                    borderRadius: 8,
                                    padding: "8px 18px",
                                    fontWeight: 700,
                                    fontSize: 16,
                                    cursor: "pointer"
                                }}
                            >
                                My Buy Orders
                            </button>
                        </Link>
                    )}
                </div>
            </div>
            {loading && <div>Loading...</div>}
            {error && <div style={{ color: "red" }}>{error}</div>}
            {!loading && listings.length === 0 ? <div>No items available for sale.</div> : (
                <table className="market-table">
                    <thead>
                        <tr>
                            <th>Item</th>
                            <th>Description</th>
                            <th>Seller</th>
                            <th>Price</th>
                            <th>Listed</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {listings.map(listing => (
                            <tr key={listing.id}>
                                <td>
                                    <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                        <CachedImage src={`/items-icons/${listing.item_icon_hash || listing.item_id}`} alt="" width={32} height={32} />
                                        {listing.item_name}
                                    </span>
                                </td>
                                <td style={{ maxWidth: 260, color: "#bbb" }}>{listing.item_description}</td>
                                <td>
                                    <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                        <CachedImage src={`/avatar/${listing.seller_id}`} alt="" style={{ borderRadius: "50%", width: 28, height: 28 }} />
                                        {sellerNames[listing.seller_id] || listing.seller_id}
                                    </span>
                                </td>
                                <td>
                                    {listing.price} <CachedImage src="/assets/credit.png" alt="credits" style={{ width: 14, verticalAlign: "middle" }} />
                                </td>
                                <td>{new Date(listing.created_at).toLocaleString()}</td>
                                <td>
                                    {user && listing.seller_id !== user.id ? (
                                        <button
                                            style={{
                                                background: "#66ff66",
                                                color: "#222",
                                                border: "none",
                                                borderRadius: 6,
                                                padding: "6px 14px",
                                                fontWeight: 600,
                                                cursor: "pointer"
                                            }}
                                            onClick={() => handleBuy(listing)}
                                        >
                                            Buy
                                        </button>
                                    ) : (
                                        <span style={{ color: "#888" }}>—</span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
            {/* Buy Order Modal */}
            {showBuyOrderModal && (
                <div style={{
                    position: "fixed", left: 0, top: 0, width: "100vw", height: "100vh",
                    background: "#000a", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center"
                }}>
                    <div style={{
                        background: "#23272e", borderRadius: 12, padding: 32, minWidth: 340, boxShadow: "0 2px 16px #0008"
                    }}>
                        <h3>Place Buy Order</h3>

                        <div style={{ marginBottom: 12, position: "relative" }}>
                            <label>Item&nbsp;
                                <input
                                    type="text"
                                    value={buyOrderItemSearch}
                                    onChange={async (e) => {
                                        setBuyOrderItemSearch(e.target.value);
                                        setBuyOrderDropdownOpen(true);
                                        await handleItemSearch(e.target.value);
                                    }}
                                    onFocus={() => {
                                        if (buyOrderItemSearch.length > 1) setBuyOrderDropdownOpen(true);
                                    }}
                                    onBlur={() => setTimeout(() => setBuyOrderDropdownOpen(false), 150)}
                                    placeholder="Search item by name..."
                                    style={{ width: 180 }}
                                />
                                {buyOrderDropdownOpen && buyOrderItemResults.length > 0 && (
                                    <ul
                                        style={{
                                            position: "absolute",
                                            left: 0,
                                            right: 0,
                                            top: 36,
                                            background: "#23272e",
                                            border: "1px solid #444",
                                            borderRadius: 6,
                                            maxHeight: 200,
                                            overflowY: "auto",
                                            zIndex: 1001,
                                            listStyle: "none",
                                            margin: 0,
                                            padding: 0,
                                        }}
                                    >
                                        {buyOrderItemResults.map((item) => (
                                            <li
                                                key={item.itemId}
                                                style={{
                                                    display: "flex",
                                                    alignItems: "center",
                                                    gap: 8,
                                                    padding: "8px 12px",
                                                    cursor: "pointer",
                                                    borderBottom: "1px solid #333",
                                                }}
                                                onMouseDown={() => {
                                                    setBuyOrderItemId(item.itemId);
                                                    setBuyOrderItemSearch(item.name);
                                                    setBuyOrderPrice(item.price || 1);
                                                    setBuyOrderDropdownOpen(false);
                                                }}
                                            >
                                                <CachedImage
                                                    src={`/items-icons/${item.iconHash || item.itemId}`}
                                                    alt="icon"
                                                    style={{ width: 28, height: 28, borderRadius: 6 }}
                                                />
                                                <span style={{ color: "#fff" }}>{item.name}</span>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </label>
                        </div>
                        <div style={{ marginBottom: 12 }}>
                            <label>Price&nbsp;
                                <input type="number" min={1} value={buyOrderPrice} onChange={e => setBuyOrderPrice(Number(e.target.value))} style={{ width: 100 }} />
                            </label>
                        </div>
                        <button
                            onClick={handlePlaceBuyOrder}
                            disabled={placingOrder}
                            style={{
                                background: "#ffd700",
                                color: "#222",
                                border: "none",
                                borderRadius: 8,
                                padding: "8px 18px",
                                fontWeight: 700,
                                fontSize: 16,
                                cursor: "pointer",
                                marginRight: 12
                            }}
                        >
                            {placingOrder ? "Placing..." : "Confirm"}
                        </button>
                        <button
                            onClick={() => setShowBuyOrderModal(false)}
                            style={{
                                background: "#23272e",
                                color: "#fff",
                                border: "1px solid #444",
                                borderRadius: 8,
                                padding: "8px 18px",
                                fontWeight: 700,
                                fontSize: 16,
                                cursor: "pointer"
                            }}
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}
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
          background: #66ff66;
          color: #222;
          border: none;
          border-radius: 6px;
          padding: 6px 14px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.15s;
        }
        .market-table button:hover {
          background: #33ff33;
        }
      `}</style>
        </div>
    );
}