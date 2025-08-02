import React, { useEffect, useState } from "react";
import useAuth from "../../hooks/useAuth";
import Link from "next/link";
import Certification from "../../components/common/Certification";

const endpoint = "/api"; // Replace with your actual API endpoint

type Item = {
  itemId: string;
  name: string;
  description: string;
  price: number;
  showInStore: boolean;
  iconHash?: string;
};

const MyItems = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<any>(null);
  const [iconFile, setIconFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<any>({});
  const [success, setSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [tooltip, setTooltip] = useState<{
    x: number;
    y: number;
    item: Item;
  } | null>(null);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [transferItem, setTransferItem] = useState<Item | null>(null);
  const [transferUserId, setTransferUserId] = useState("");
  const [transferUserSearch, setTransferUserSearch] = useState("");
  const [transferUserResults, setTransferUserResults] = useState<any[]>([]);
  const [transferUserDropdownOpen, setTransferUserDropdownOpen] = useState(false);
  const [transferAmount, setTransferAmount] = useState(1);
  const [transferError, setTransferError] = useState<string | null>(null);
  const [transferLoading, setTransferLoading] = useState(false);
  const transferUserInputRef = React.useRef<HTMLInputElement>(null);
  const [showOwnershipModal, setShowOwnershipModal] = useState(false);
  const [ownershipItem, setOwnershipItem] = useState<Item | null>(null);
  const [ownershipUserId, setOwnershipUserId] = useState("");
  const [ownershipUserSearch, setOwnershipUserSearch] = useState("");
  const [ownershipUserResults, setOwnershipUserResults] = useState<any[]>([]);
  const [ownershipUserDropdownOpen, setOwnershipUserDropdownOpen] = useState(false);
  const [ownershipError, setOwnershipError] = useState<string | null>(null);
  const [ownershipLoading, setOwnershipLoading] = useState(false);
  const ownershipUserInputRef = React.useRef<HTMLInputElement>(null);

  const { user } = useAuth(); // Assuming useAuth is imported from your hooks
  // Fetch items on mount with debounce
  useEffect(() => {
    let abortController = new AbortController();
    let debounceTimer: NodeJS.Timeout;

    const fetchItems = async () => {
      setLoading(true);
      try {
        const res = await fetch(endpoint + "/items/@mine", { signal: abortController.signal });
        if (res.ok) {
          const data = await res.json();
          setItems(Array.isArray(data) ? data : data.items || []);
        }
      } catch (err) {
        if (err.name !== "AbortError") {
          // Optionally handle error
        }
      } finally {
        setLoading(false);
      }
    };

    debounceTimer = setTimeout(fetchItems, 300);

    return () => {
      clearTimeout(debounceTimer);
      abortController.abort();
    };
  }, []);

  // Start editing an item
  const handleEdit = (item: Item) => {
    setEditingId(item.itemId);
    setFormData({
      name: item.name,
      description: item.description,
      price: item.price.toString(),
      showInStore: !!item.showInStore, // Ensure boolean value
      iconHash: item.iconHash || item.itemId,
    });
    setIconFile(null);
    setErrors({});
    setSuccess(null);
  };

  // Cancel editing
  const handleCancel = () => {
    setEditingId(null);
    setFormData(null);
    setIconFile(null);
    setErrors({});
    setSuccess(null);
  };

  // Handle form changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type, checked } = e.target as any;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  // Handle icon file selection
  const handleIconChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setIconFile(e.target.files[0]);
    }
  };

  // Validate form
  const validate = () => {
    const newErrors: any = {};
    if (!formData.name) newErrors.name = "Name is required";
    if (!formData.description)
      newErrors.description = "Description is required";
    if (!formData.price) newErrors.price = "Price is required";
    return newErrors;
  };

  // Submit edit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(null);
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setErrors({});
    setSubmitting(true);

    let iconHash = formData.iconHash;
    if (iconFile) {
      const iconData = new FormData();
      iconData.append("icon", iconFile);
      try {
        const res = await fetch("/upload/item-icon", {
          method: "POST",
          body: iconData,
        });
        if (res.ok) {
          const data = await res.json();
          iconHash = data.hash;
        } else {
          const err = await res.json();
          setErrors({ submit: err.error || "Failed to upload icon." });
          setSubmitting(false);
          return;
        }
      } catch (err: any) {
        setErrors({ submit: err.message || "Failed to upload icon." });
        setSubmitting(false);
        return;
      }
    }

    const data = {
      name: formData.name,
      description: formData.description,
      price: Number(formData.price),
      showInStore: !!formData.showInStore, // Ensure boolean is sent
      ...(iconHash && { iconHash }),
    };

    try {
      const res = await fetch(endpoint + `/items/update/${editingId}`, {
        method: "PUT",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        setSuccess("Item updated successfully!");
        // Update local list
        setItems((items) =>
          items.map((item) =>
            item.itemId === editingId ? { ...item, ...data } : item
          )
        );
        setEditingId(null);
        setFormData(null);
        setIconFile(null);
      } else {
        const err = await res.json();
        setErrors({ submit: err.message || "Failed to update item." });
      }
    } catch (err: any) {
      setErrors({ submit: err.message || "Failed to update item." });
    } finally {
      setSubmitting(false);
    }
  };

  // User search for transfer
  const handleTransferUserSearch = async (q: string) => {
    if (!q || q.length < 2) {
      setTransferUserResults([]);
      return;
    }
    try {
      const res = await fetch(`/api/users/search?q=${encodeURIComponent(q)}`);
      if (!res.ok) return;
      const users = await res.json();
      setTransferUserResults(users);
    } catch (e) {
      setTransferUserResults([]);
    }
  };

  // Handle transfer button click
  const handleTransfer = (item: Item) => {
    setTransferItem(item);
    setShowTransferModal(true);
    setTransferUserId("");
    setTransferUserSearch("");
    setTransferUserResults([]);
    setTransferAmount(1);
    setTransferError(null);
  };

  // Confirm transfer
  const handleConfirmTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!transferItem || !transferUserId || !transferAmount || transferAmount <= 0) {
      setTransferError("Please select a user and enter a valid amount.");
      return;
    }
    setTransferLoading(true);
    setTransferError(null);
    try {
      const res = await fetch(`/api/items/transfer/${transferItem.itemId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: transferAmount,
          targetUserId: transferUserId,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        setTransferError(data.message || "Error transferring item");
      } else {
        setShowTransferModal(false);
        setTransferItem(null);
        setTransferUserId("");
        setTransferUserSearch("");
        setTransferUserResults([]);
        setTransferAmount(1);
        setTransferError(null);
        // Optionally refresh items
        setItems((prev) => prev);
      }
    } catch (err) {
      setTransferError("Error transferring item");
    } finally {
      setTransferLoading(false);
    }
  };

  // User search for ownership transfer
  const handleOwnershipUserSearch = async (q: string) => {
    if (!q || q.length < 2) {
      setOwnershipUserResults([]);
      return;
    }
    try {
      const res = await fetch(`/api/users/search?q=${encodeURIComponent(q)}`);
      if (!res.ok) return;
      const users = await res.json();
      setOwnershipUserResults(users);
    } catch (e) {
      setOwnershipUserResults([]);
    }
  };

  // Handle ownership transfer button click
  const handleOwnershipTransfer = (item: Item) => {
    setOwnershipItem(item);
    setShowOwnershipModal(true);
    setOwnershipUserId("");
    setOwnershipUserSearch("");
    setOwnershipUserResults([]);
    setOwnershipError(null);
  };

  // Confirm ownership transfer
  const handleConfirmOwnershipTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ownershipItem || !ownershipUserId) {
      setOwnershipError("Veuillez sélectionner un utilisateur.");
      return;
    }
    setOwnershipLoading(true);
    setOwnershipError(null);
    try {
      const res = await fetch(`/api/items/transfer-ownership/${ownershipItem.itemId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ newOwnerId: ownershipUserId }),
      });
      if (!res.ok) {
        const data = await res.json();
        setOwnershipError(data.message || "Erreur lors du transfert d'ownership");
      } else {
        setShowOwnershipModal(false);
        setOwnershipItem(null);
        setOwnershipUserId("");
        setOwnershipUserSearch("");
        setOwnershipUserResults([]);
        setOwnershipError(null);
        // Optionally refresh items
        setItems((prev) => prev);
      }
    } catch (err) {
      setOwnershipError("Erreur lors du transfert d'ownership");
    } finally {
      setOwnershipLoading(false);
    }
  };

  return (
    <>
      <div className="myitems-container">
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 18,
          }}
        >
          <h1 className="myitems-title">
            <span className="myitems-title-span">My Items</span>
          </h1>
          <Link
            href="/dev-zone/create-item"
            className="myitems-add-btn"
            style={{
              background: "#333",
              color: "#fff",
              border: "none",
              borderRadius: 6,
              fontWeight: 500,
              padding: "10px 18px",
              fontSize: "1rem",
              textDecoration: "none",
              cursor: "pointer",
            }}
          >
            + Add Item
          </Link>
        </div>
        {loading ? (
          <div className="myitems-loading">Loading...</div>
        ) : (
          <>
            {items.length === 0 && (
              <div className="myitems-empty">No items found.</div>
            )}
            <div className="myitems-grid">
              {items.map((item) => (
                <div
                  key={`item-${item.itemId}`}
                  className="myitems-card"
                  tabIndex={0}
                  draggable={false}
                  onMouseEnter={(e) => {
                    const rect = (
                      e.target as HTMLElement
                    ).getBoundingClientRect();
                    setTooltip({
                      x: rect.right + 8,
                      y: rect.top,
                      item,
                    });
                  }}
                  onMouseLeave={() => setTooltip(null)}
                  onClick={() => handleEdit(item)}
                >
                  <img
                    src={"/items-icons/" + (item?.iconHash || item.itemId)}
                    alt={item.name}
                    className="myitems-card-icon"
                    draggable={false}
                  />
                  <div className="myitems-card-name">{item.name}</div>
                  <div className="myitems-card-price">
                    {item.price}
                    <img src="/assets/credit.png" className="myitems-card-credit" />
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "8px" }}>
                    <button
                      className="myitems-card-editbtn"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(item);
                      }}
                    >
                      Edit
                    </button>
                    <button
                      className="myitems-card-editbtn"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigator.clipboard.writeText(item.itemId);
                        // Optional: Add visual feedback
                        e.currentTarget.textContent = "Copied!";
                        setTimeout(() => {
                          e.currentTarget.textContent = "Copy Id";
                        }, 1000);
                      }}
                    >
                      Copy Id
                    </button>
                    <button
                      className="myitems-card-editbtn"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOwnershipTransfer(item);
                      }}
                    >
                      Transfer
                    </button>
                  </div>
                </div>
              ))}
              {Array.from({
                length: Math.max(
                  0,
                  6 * Math.ceil(items.length / 6) - items.length
                ),
              }).map((_, idx) => (
                <div key={`empty-${idx}`} className="myitems-card-empty" />
              ))}
            </div>
            {tooltip && (
              <div
                className="myitems-tooltip"
                style={{
                  left: tooltip.x,
                  top: tooltip.y,
                }}
              >
                <div className="myitems-tooltip-title">{tooltip.item.name}</div>
                <div className="myitems-tooltip-desc">
                  {tooltip.item.description}
                </div>
                <div className="myitems-tooltip-price">
                  Price: {tooltip.item.price}
                  <img src="/assets/credit.png" className="myitems-card-credit" />
                  <span className="myitems-tooltip-store">
                    Show in Store: {tooltip.item.showInStore ? "Yes" : "No"}
                  </span>
                </div>
              </div>
            )}
            {editingId && (
              <div className="myitems-modal-overlay">
                <form onSubmit={handleSubmit} className="myitems-modal-form">
                  <h2 className="myitems-modal-title">Edit Item</h2>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Name"
                    className="myitems-input"
                    required
                  />
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Description"
                    rows={2}
                    className="myitems-input"
                    required
                  />
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    placeholder="Price"
                    min={0}
                    className="myitems-input"
                    required
                  />
                  <label className="myitems-label">
                    <input
                      type="checkbox"
                      name="showInStore"
                      checked={formData.showInStore}
                      onChange={handleChange}
                      className="myitems-checkbox"
                    />
                    Show in Store
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleIconChange}
                    className="myitems-input"
                  />
                  {errors.submit && (
                    <div className="myitems-error">{errors.submit}</div>
                  )}
                  <div className="myitems-modal-btns">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="myitems-btn-save"
                    >
                      {submitting ? "Saving..." : "Save"}
                    </button>
                    <button
                      type="button"
                      onClick={handleCancel}
                      disabled={submitting}
                      className="myitems-btn-cancel"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}
            {showTransferModal && (
              <div
                className="modal-overlay"
                style={{
                  position: "fixed",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: "rgba(0,0,0,0.35)",
                  zIndex: 1000,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                onClick={() => setShowTransferModal(false)}
              >
                <div
                  className="modal-content"
                  style={{
                    background: "#232323",
                    borderRadius: 10,
                    padding: 32,
                    minWidth: 320,
                    position: "relative",
                    boxShadow: "0 2px 16px #0005",
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    className="close-modal-btn"
                    onClick={() => setShowTransferModal(false)}
                    style={{
                      position: "absolute",
                      top: 12,
                      right: 16,
                      background: "none",
                      border: "none",
                      color: "#fff",
                      fontSize: 24,
                      cursor: "pointer",
                    }}
                  >
                    &times;
                  </button>
                  <h3 style={{ marginBottom: 18 }}>Transfer Item</h3>
                  <form autoComplete="off" onSubmit={handleConfirmTransfer}>
                    <div style={{ marginBottom: 12 }}>
                      <label style={{ color: "#fff", marginBottom: 4, display: "block" }}>
                        Amount:
                      </label>
                      <input
                        type="number"
                        min={1}
                        value={transferAmount}
                        onChange={e => setTransferAmount(Number(e.target.value))}
                        style={{
                          marginRight: 8,
                          padding: "10px 12px",
                          borderRadius: 6,
                          border: "1px solid #444",
                          background: "#181818",
                          color: "#fff",
                          fontSize: "1rem",
                          width: "120px",
                        }}
                        required
                      />
                    </div>
                    <div style={{ position: "relative", marginBottom: 12 }}>
                      <label style={{ color: "#fff", marginBottom: 4, display: "block" }}>
                        Select user:
                      </label>
                      <input
                        ref={transferUserInputRef}
                        type="text"
                        value={transferUserSearch}
                        onChange={async (e) => {
                          setTransferUserSearch(e.target.value);
                          setTransferUserDropdownOpen(true);
                          setTransferUserId("");
                          await handleTransferUserSearch(e.target.value);
                        }}
                        onFocus={() => {
                          if (transferUserSearch.length > 1) setTransferUserDropdownOpen(true);
                        }}
                        onBlur={() =>
                          setTimeout(() => setTransferUserDropdownOpen(false), 150)
                        }
                        placeholder="Search user by name..."
                        style={{
                          marginRight: 8,
                          padding: "10px 12px",
                          borderRadius: 6,
                          border: "1px solid #444",
                          background: "#181818",
                          color: "#fff",
                          fontSize: "1rem",
                          width: "280px",
                        }}
                      />
                      {transferUserDropdownOpen && transferUserResults.length > 0 && (
                        <ul
                          style={{
                            position: "absolute",
                            left: 0,
                            right: 0,
                            top: 40,
                            background: "#232323",
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
                          {transferUserResults.map((u) => (
                            <li
                              key={u.user_id || u.id}
                              style={{
                                padding: "8px 12px",
                                cursor: "pointer",
                                color: "#fff",
                              }}
                              onMouseDown={() => {
                                setTransferUserId(u.user_id || u.id);
                                setTransferUserSearch(u.username);
                                setTransferUserDropdownOpen(false);
                              }}
                            >
                              {u.username}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                    <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                      <button
                        type="submit"
                        disabled={transferLoading || !transferUserId}
                        style={{
                          background: "#333",
                          color: "#fff",
                          border: "none",
                          borderRadius: 6,
                          fontWeight: 500,
                          padding: "10px 24px",
                          fontSize: "1rem",
                          cursor: transferUserId ? "pointer" : "not-allowed",
                        }}
                      >
                        {transferLoading ? "Transferring..." : "Transfer"}
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowTransferModal(false)}
                        style={{
                          background: "#222",
                          border: "1px solid #444",
                          color: "#fff",
                          borderRadius: 6,
                          padding: "10px 24px",
                          fontSize: "1rem",
                          cursor: "pointer",
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                    {transferError && (
                      <div style={{ color: "red", marginTop: 12 }}>
                        {transferError}
                      </div>
                    )}
                  </form>
                </div>
              </div>
            )}
            {showOwnershipModal && (
              <div
                className="modal-overlay"
                style={{
                  position: "fixed",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: "rgba(0,0,0,0.35)",
                  zIndex: 1000,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                onClick={() => setShowOwnershipModal(false)}
              >
                <div
                  className="modal-content"
                  style={{
                    background: "#232323",
                    borderRadius: 10,
                    padding: 32,
                    minWidth: 320,
                    position: "relative",
                    boxShadow: "0 2px 16px #0005",
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    className="close-modal-btn"
                    onClick={() => setShowOwnershipModal(false)}
                    style={{
                      position: "absolute",
                      top: 12,
                      right: 16,
                      background: "none",
                      border: "none",
                      color: "#fff",
                      fontSize: 24,
                      cursor: "pointer",
                    }}
                  >
                    &times;
                  </button>
                  <h3 style={{ marginBottom: 18 }}>Transfer ownership</h3>
                  <form autoComplete="off" onSubmit={handleConfirmOwnershipTransfer}>
                    <div style={{ position: "relative", marginBottom: 12 }}>
                      <label style={{ color: "#fff", marginBottom: 4, display: "block" }}>
                        Select user:
                      </label>
                      <input
                        ref={ownershipUserInputRef}
                        type="text"
                        value={ownershipUserSearch}
                        onChange={async (e) => {
                          setOwnershipUserSearch(e.target.value);
                          setOwnershipUserDropdownOpen(true);
                          setOwnershipUserId("");
                          await handleOwnershipUserSearch(e.target.value);
                        }}
                        onFocus={() => {
                          if (ownershipUserSearch.length > 1) setOwnershipUserDropdownOpen(true);
                        }}
                        onBlur={() =>
                          setTimeout(() => setOwnershipUserDropdownOpen(false), 150)
                        }
                        placeholder="Search user by name..."
                        style={{
                          marginRight: 8,
                          padding: "10px 12px",
                          borderRadius: 6,
                          border: "1px solid #444",
                          background: "#181818",
                          color: "#fff",
                          fontSize: "1rem",
                          width: "280px",
                        }}
                      />
                      {ownershipUserDropdownOpen && ownershipUserResults.length > 0 && (
                        <ul
                          style={{
                            position: "absolute",
                            left: 0,
                            right: 0,
                            top: 60,
                            background: "#232323",
                            border: "1px solid #444",
                            borderRadius: 6,
                            maxHeight: 200,
                            overflowY: "auto",
                            zIndex: 1001,
                            listStyle: "none",
                            margin: 0,
                            padding: 0,
                            width: "304px",
                          }}
                        >
                          {ownershipUserResults.map((u) => (
                            <li
                              key={u.userId || u.user_id || u.id}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 8,
                                padding: "8px 12px",
                                cursor: "pointer",
                                borderBottom: "1px solid #333",
                              }}
                              onMouseDown={() => {
                                setOwnershipUserId(u.userId || u.user_id || u.id);
                                setOwnershipUserSearch(u.username);
                                setOwnershipUserDropdownOpen(false);
                              }}
                            >
                              <img
                                src={`/avatar/${u.userId || u.user_id || u.id}`}
                                alt="avatar"
                                style={{ width: 28, height: 28, borderRadius: "50%" }}
                                onError={(e) => (e.currentTarget.src = "/avatar/default.png")}
                              />
                              <span style={{ color: "#fff" }}>{u.username}</span>
                              <Certification
                                user={u}
                                style={{
                                  width: 16,
                                  height: 16,
                                  verticalAlign: "middle",
                                }}
                              />
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                    <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                      <button
                        type="submit"
                        disabled={ownershipLoading || !ownershipUserId}
                        style={{
                          background: "#333",
                          color: "#fff",
                          border: "none",
                          borderRadius: 6,
                          fontWeight: 500,
                          padding: "10px 24px",
                          fontSize: "1rem",
                          cursor: ownershipUserId ? "pointer" : "not-allowed",
                        }}
                      >
                        {ownershipLoading ? "Transferring..." : "Transfer"}
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowOwnershipModal(false)}
                        style={{
                          background: "#222",
                          border: "1px solid #444",
                          color: "#fff",
                          borderRadius: 6,
                          padding: "10px 24px",
                          fontSize: "1rem",
                          cursor: "pointer",
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                    {ownershipError && (
                      <div style={{ color: "red", marginTop: 12 }}>
                        {ownershipError}
                      </div>
                    )}
                  </form>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
};

export default MyItems;
