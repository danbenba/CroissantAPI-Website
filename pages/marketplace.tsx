import React, { useEffect, useState } from "react";
import useAuth from "../hooks/useAuth";
import useUserCache from "../hooks/useUserCache";
import CachedImage from "../components/utils/CachedImage";
import Link from "next/link";
import useIsMobile from "../hooks/useIsMobile";

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

function useMarketplaceLogic() {
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

    // Buy order modal logic
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

    return {
        user,
        listings,
        loading,
        error,
        showBuyOrderModal,
        setShowBuyOrderModal,
        sellerNames,
        handleBuy,
        buyOrderItemId,
        setBuyOrderItemId,
        buyOrderPrice,
        setBuyOrderPrice,
        placingOrder,
        buyOrderItemSearch,
        setBuyOrderItemSearch,
        buyOrderItemResults,
        setBuyOrderItemResults,
        buyOrderDropdownOpen,
        setBuyOrderDropdownOpen,
        handlePlaceBuyOrder,
        handleItemSearch,
    };
}

function MarketplaceDesktop(props: ReturnType<typeof useMarketplaceLogic>) {
    const {
        user,
        listings,
        loading,
        error,
        showBuyOrderModal,
        setShowBuyOrderModal,
        sellerNames,
        handleBuy,
        buyOrderItemId,
        setBuyOrderItemId,
        buyOrderPrice,
        setBuyOrderPrice,
        placingOrder,
        buyOrderItemSearch,
        setBuyOrderItemSearch,
        buyOrderItemResults,
        buyOrderDropdownOpen,
        setBuyOrderDropdownOpen,
        handlePlaceBuyOrder,
        handleItemSearch,
    } = props;

    return (
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h2>Marketplace</h2>
                <div style={{ display: "flex", gap: 12 }}>
                    <button
                        style={{
                            background: "#fff",
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
                        <Link href="/my-buy-orders" style={{ color: "#fff", fontWeight: 600, fontSize: 16 }}>
                            <button
                                style={{
                                    background: "#23272e",
                                    color: "#fff",
                                    border: "1px solid #fff",
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
                <div className="market-table-wrapper">
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
                                        <span style={{ display: "flex", alignItems: "center", gap: 8, position: "relative" }}>
                                            <CachedImage src={`/items-icons/${listing.item_icon_hash || listing.item_id}`} alt="" width={32} height={32} />
                                            {/* Indicateur metadata */}
                                            {listing.metadata?._unique_id && (
                                                <span
                                                    style={{
                                                        position: "absolute",
                                                        top: 2,
                                                        left: 26,
                                                        width: 10,
                                                        height: 10,
                                                        borderRadius: "50%",
                                                        backgroundColor: "#ffd700",
                                                        border: "1px solid #000",
                                                        zIndex: 2,
                                                        cursor: "pointer"
                                                    }}
                                                    // title="This item has metadata"
                                                    onMouseEnter={e => {
                                                        const tooltip = document.createElement("div");
                                                        tooltip.innerText = Object.entries(listing.metadata)
                                                            .filter(([key]) => key !== "_unique_id")
                                                            .map(([key, value]) => `${key}: ${value}`)
                                                            .join(", ") || "Metadata";
                                                        tooltip.style.position = "fixed";
                                                        tooltip.style.left = e.clientX + 12 + "px";
                                                        tooltip.style.top = e.clientY + "px";
                                                        tooltip.style.background = "#23272e";
                                                        tooltip.style.color = "#ffd700";
                                                        tooltip.style.padding = "6px 12px";
                                                        tooltip.style.borderRadius = "8px";
                                                        tooltip.style.fontSize = "13px";
                                                        tooltip.style.zIndex = "9999";
                                                        tooltip.className = "marketplace-metadata-tooltip";
                                                        document.body.appendChild(tooltip);
                                                        const removeTooltip = () => {
                                                            document.body.querySelectorAll(".marketplace-metadata-tooltip").forEach(t => t.remove());
                                                            e.target.removeEventListener("mouseleave", removeTooltip);
                                                        };
                                                        e.target.addEventListener("mouseleave", removeTooltip);
                                                    }}
                                                />
                                            )}
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
                </div>
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
                                background: "#fff",
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
          color: #fff;
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
          .market-table-wrapper {
            overflow-x: auto;
            -webkit-overflow-scrolling: touch;
          }
        }
      `}</style>
        </div>
    );
}

function MarketplaceMobile(props: ReturnType<typeof useMarketplaceLogic>) {
    const {
        user,
        listings,
        loading,
        error,
        showBuyOrderModal,
        setShowBuyOrderModal,
        sellerNames,
        handleBuy,
        buyOrderItemId,
        setBuyOrderItemId,
        buyOrderPrice,
        setBuyOrderPrice,
        placingOrder,
        buyOrderItemSearch,
        setBuyOrderItemSearch,
        buyOrderItemResults,
        buyOrderDropdownOpen,
        setBuyOrderDropdownOpen,
        handlePlaceBuyOrder,
        handleItemSearch,
    } = props;

    return (
        <div style={{ maxWidth: 480, margin: "0 auto", padding: 8, fontSize: "0.98em" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 10 }}>
                <h2 style={{ fontSize: "1.1em" }}>Marketplace</h2>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <button
                        style={{
                            background: "#fff",
                            color: "#222",
                            border: "none",
                            borderRadius: 8,
                            padding: "7px 12px",
                            fontWeight: 700,
                            fontSize: "1em",
                            cursor: "pointer",
                            boxShadow: "0 2px 8px #0002"
                        }}
                        onClick={() => setShowBuyOrderModal(true)}
                    >
                        Place Buy Order
                    </button>
                    {user && (
                        <Link href="/my-buy-orders" style={{ color: "#fff", fontWeight: 600, fontSize: "1em" }}>
                            <button
                                style={{
                                    background: "#23272e",
                                    color: "#fff",
                                    border: "1px solid #fff",
                                    borderRadius: 8,
                                    padding: "7px 12px",
                                    fontWeight: 700,
                                    fontSize: "1em",
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
            {!loading && listings.length === 0 ? (
                <div>No items available for sale.</div>
            ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {listings.map(listing => (
                        <div
                            key={listing.id}
                            style={{
                                background: "#23272e",
                                borderRadius: 10,
                                boxShadow: "0 2px 8px #0003",
                                padding: 12,
                                marginBottom: 2,
                                display: "flex",
                                flexDirection: "column",
                                gap: 6,
                                position: "relative"
                            }}
                        >
                            <div style={{ display: "flex", alignItems: "center", gap: 10, position: "relative" }}>
                                <CachedImage
                                    src={`/items-icons/${listing.item_icon_hash || listing.item_id}`}
                                    alt=""
                                    width={36}
                                    height={36}
                                    style={{ borderRadius: 8, background: "#181b20" }}
                                />
                                {/* Indicateur metadata */}
                                {listing.metadata?._unique_id && (
                                    <div
                                        style={{
                                            position: "absolute",
                                            top: 4,
                                            left: 32,
                                            width: 10,
                                            height: 10,
                                            borderRadius: "50%",
                                            backgroundColor: "#ffd700",
                                            border: "1px solid #000",
                                            zIndex: 2
                                        }}
                                        // title="This item has metadata"
                                        onMouseEnter={e => {
                                            const tooltip = document.createElement("div");
                                            tooltip.innerText = Object.entries(listing.metadata)
                                                .filter(([key]) => key !== "_unique_id")
                                                .map(([key, value]) => `${key}: ${value}`)
                                                .join(", ") || "Metadata";
                                            tooltip.style.position = "fixed";
                                            tooltip.style.left = e.clientX + 12 + "px";
                                            tooltip.style.top = e.clientY + "px";
                                            tooltip.style.background = "#23272e";
                                            tooltip.style.color = "#ffd700";
                                            tooltip.style.padding = "6px 12px";
                                            tooltip.style.borderRadius = "8px";
                                            tooltip.style.fontSize = "13px";
                                            tooltip.style.zIndex = "9999";
                                            tooltip.className = "marketplace-metadata-tooltip";
                                            document.body.appendChild(tooltip);
                                            const removeTooltip = () => {
                                                document.body.querySelectorAll(".marketplace-metadata-tooltip").forEach(t => t.remove());
                                                e.target.removeEventListener("mouseleave", removeTooltip);
                                            };
                                            e.target.addEventListener("mouseleave", removeTooltip);
                                        }}
                                    />
                                )}
                                <div>
                                    <div style={{ fontWeight: 600, fontSize: "1.05em", color: "#fff" }}>
                                        {listing.item_name}
                                    </div>
                                    <div style={{ color: "#bbb", fontSize: "0.97em" }}>
                                        {listing.item_description}
                                    </div>
                                </div>
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
                                <CachedImage
                                    src={`/avatar/${listing.seller_id}`}
                                    alt=""
                                    style={{ borderRadius: "50%", width: 22, height: 22 }}
                                />
                                <span style={{ color: "#fff", fontSize: "0.97em" }}>
                                    {sellerNames[listing.seller_id] || listing.seller_id}
                                </span>
                                <span style={{ marginLeft: "auto", color: "#fff", fontWeight: 600 }}>
                                    {listing.price}{" "}
                                    <CachedImage src="/assets/credit.png" alt="credits" style={{ width: 14, verticalAlign: "middle" }} />
                                </span>
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 2 }}>
                                <span style={{ color: "#aaa", fontSize: "0.93em" }}>
                                    Listed: {new Date(listing.created_at).toLocaleString()}
                                </span>
                                <span style={{ marginLeft: "auto" }}>
                                    {user && listing.seller_id !== user.id ? (
                                        <button
                                            style={{
                                                background: "#66ff66",
                                                color: "#222",
                                                border: "none",
                                                borderRadius: 6,
                                                padding: "5px 14px",
                                                fontWeight: 600,
                                                fontSize: "0.97em",
                                                cursor: "pointer"
                                            }}
                                            onClick={() => handleBuy(listing)}
                                        >
                                            Buy
                                        </button>
                                    ) : (
                                        <span style={{ color: "#888" }}>—</span>
                                    )}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            {/* Buy Order Modal */}
            {showBuyOrderModal && (
                <div
                    style={{
                        position: "fixed",
                        left: 0,
                        top: 0,
                        width: "100vw",
                        height: "100vh",
                        background: "#000a",
                        zIndex: 1000,
                        display: "flex",
                        alignItems: "flex-end",
                        justifyContent: "center",
                        padding: 0,
                    }}
                >
                    <div
                        style={{
                            background: "#23272e",
                            borderTopLeftRadius: 16,
                            borderTopRightRadius: 16,
                            padding: 18,
                            width: "100%",
                            maxWidth: 480,
                            boxShadow: "0 -2px 16px #0008",
                            fontSize: "1em",
                            position: "relative",
                            animation: "slideUpModal 0.18s cubic-bezier(.4,1.4,.6,1) 1"
                        }}
                    >
                        <div
                            style={{
                                width: 40,
                                height: 4,
                                background: "#444",
                                borderRadius: 2,
                                margin: "0 auto 12px auto",
                            }}
                        />
                        <h3 style={{ fontSize: "1.08em", textAlign: "center", marginBottom: 14 }}>Place Buy Order</h3>
                        <div style={{ marginBottom: 12, position: "relative" }}>
                            <label style={{ fontWeight: 500, fontSize: "1em" }}>
                                Item&nbsp;
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
                                    style={{
                                        width: "95%",
                                        fontSize: "1em",
                                        padding: "8px",
                                        borderRadius: 6,
                                        border: "1px solid #444",
                                        marginTop: 4,
                                        background: "#181b20",
                                        color: "#fff"
                                    }}
                                />
                                {buyOrderDropdownOpen && buyOrderItemResults.length > 0 && (
                                    <ul
                                        style={{
                                            position: "absolute",
                                            left: 0,
                                            right: 0,
                                            top: 46,
                                            background: "#23272e",
                                            border: "1px solid #444",
                                            borderRadius: 6,
                                            maxHeight: 140,
                                            overflowY: "auto",
                                            zIndex: 1001,
                                            listStyle: "none",
                                            margin: 0,
                                            padding: 0,
                                            fontSize: "1em"
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
                                                    style={{ width: 22, height: 22, borderRadius: 5 }}
                                                />
                                                <span style={{ color: "#fff" }}>{item.name}</span>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </label>
                        </div>
                        <div style={{ marginBottom: 14 }}>
                            <label style={{ fontWeight: 500, fontSize: "1em" }}>
                                Price&nbsp;
                                <input
                                    type="number"
                                    min={1}
                                    value={buyOrderPrice}
                                    onChange={e => setBuyOrderPrice(Number(e.target.value))}
                                    style={{
                                        width: "95%",
                                        fontSize: "1em",
                                        padding: "8px",
                                        borderRadius: 6,
                                        border: "1px solid #444",
                                        marginTop: 4,
                                        background: "#181b20",
                                        color: "#fff"
                                    }}
                                />
                            </label>
                        </div>
                        <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                            <button
                                onClick={handlePlaceBuyOrder}
                                disabled={placingOrder}
                                style={{
                                    background: "#fff",
                                    color: "#222",
                                    border: "none",
                                    borderRadius: 8,
                                    padding: "10px 0",
                                    fontWeight: 700,
                                    fontSize: "1em",
                                    cursor: "pointer",
                                    flex: 1
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
                                    padding: "10px 0",
                                    fontWeight: 700,
                                    fontSize: "1em",
                                    cursor: "pointer",
                                    flex: 1
                                }}
                            >
                                Cancel
                            </button>
                        </div>
                        <style>
                            {`
                            @keyframes slideUpModal {
                                from { transform: translateY(100%); opacity: 0.7; }
                                to { transform: translateY(0); opacity: 1; }
                            }
                            `}
                        </style>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function MarketplacePage() {
    const isMobile = useIsMobile();
    const logic = useMarketplaceLogic();
    return isMobile ? <MarketplaceMobile {...logic} /> : <MarketplaceDesktop {...logic} />;
}