import React, { useState, useRef, useEffect } from "react";
import useAuth from "../hooks/useAuth";
import { useRouter } from "next/router";

export default function StudiosPage() {
  const { user, token, setUser } = useAuth();
  const router = useRouter();
  const [studioName, setStudioName] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Add user modal state
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [addUserStudioId, setAddUserStudioId] = useState<string | null>(null);
  const [addUserId, setAddUserId] = useState("");
  const [addUserSearch, setAddUserSearch] = useState("");
  const [addUserResults, setAddUserResults] = useState<any[]>([]);
  const [addUserDropdownOpen, setAddUserDropdownOpen] = useState(false);
  const addUserInputRef = useRef<HTMLInputElement>(null);
  const [addUserError, setAddUserError] = useState<string | null>(null);

  useEffect(() => {
    if (user?.isStudio) {
      router.push("/");
    }
  }, [user, router]);

  const [apiKeySpoilers, setApiKeySpoilers] = useState<{
    [k: string]: boolean;
  }>({});

  const handleCreateStudio = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/studios", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ studioName }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.message || "Error creating studio");
      } else {
        refreshStudiosList();
      }
    } catch (err) {
      setError("Error creating studio");
    }
    setLoading(false);
  };

  const refreshStudiosList = async () => {
    console.log("Refreshing studios list...");
    fetch(`/api/users/@me`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.studios) {
          setUser((prevUser) => ({
            ...prevUser,
            studios: data.studios,
          }));
        }
      });
  };

  const handleRemoveUser = async (studioId: string, userId: string) => {
    if (!confirm("Are you sure you want to remove this user?")) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/studios/${studioId}/remove-user`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userId }),
      });
      if (!res.ok) {
        const data = await res.json();
        alert(data.message || "Error removing user");
      } else {
        // Refresh page or update user context
        // window.location.reload();
        refreshStudiosList();
      }
    } catch (err) {
      alert("Error removing user");
    } finally {
      setLoading(false);
    }
  };

  // Search users by username (not studio)
  const handleUserSearch = async (q: string) => {
    if (!q || q.length < 2) {
      setAddUserResults([]);
      return;
    }
    try {
      const res = await fetch(`/api/users/search?q=${encodeURIComponent(q)}`);
      if (!res.ok) return;
      const users = await res.json();
      setAddUserResults(users.filter((u: any) => !u.isStudio));
    } catch (e) {
      setAddUserResults([]);
    }
  };

  const handleAddUser = async (studioId: string, userId: string) => {
    setLoading(true);
    setAddUserError(null);
    try {
      const res = await fetch(`/api/studios/${studioId}/add-user`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userId }),
      });
      if (!res.ok) {
        const data = await res.json();
        setAddUserError(data.message || "Error adding user");
      } else {
        setShowAddUserModal(false);
        setAddUserId("");
        setAddUserError(null);
        refreshStudiosList();
      }
    } catch (err) {
      setAddUserError("Error adding user");
    } finally {
      setLoading(false);
    }
  };

  // Helper to toggle API key spoiler
  function toggleApiKeySpoiler(studioId: string) {
    setApiKeySpoilers((s) => ({ ...s, [studioId]: !s[studioId] }));
  }

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: 24 }}>
      <h2 style={{ marginBottom: 18 }}>My studios</h2>
      <button
        onClick={() => setShowForm(true)}
        style={{
          marginBottom: 24,
          background: "#333",
          color: "#fff",
          border: "none",
          borderRadius: 6,
          fontWeight: 500,
          padding: "12px 24px",
          fontSize: "1.05rem",
          cursor: "pointer",
        }}
      >
        + Create a studio
      </button>
      {showForm && (
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
          onClick={() => setShowForm(false)}
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
              onClick={() => setShowForm(false)}
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
            <h3 style={{ marginBottom: 18 }}>Create a studio</h3>
            <form onSubmit={handleCreateStudio}>
              <input
                type="text"
                value={studioName}
                onChange={(e) => setStudioName(e.target.value)}
                placeholder="Studio name"
                required
                style={{
                  marginRight: 8,
                  padding: "10px 12px",
                  borderRadius: 6,
                  border: "1px solid #444",
                  background: "#181818",
                  color: "#fff",
                  fontSize: "1rem",
                  marginBottom: 12,
                  width: "280px",
                }}
              />
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    background: "#333",
                    color: "#fff",
                    border: "none",
                    borderRadius: 6,
                    fontWeight: 500,
                    padding: "10px 24px",
                    fontSize: "1rem",
                    cursor: "pointer",
                  }}
                >
                  Create
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
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
              {error && (
                <div style={{ color: "red", marginTop: 12 }}>{error}</div>
              )}
            </form>
          </div>
        </div>
      )}
      <div
        className="studios-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: 24,
          marginTop: 24,
        }}
      >
        {user?.studios && user.studios.length > 0 ? (
          user.studios.map(
            (studio: any) =>
              studio.admin_id == user.id && (
                <div
                  key={studio.user_id}
                  className="studio-card"
                  style={{
                    background: "#232323",
                    borderRadius: 10,
                    padding: 24,
                    boxShadow: "0 2px 12px #0002",
                    display: "flex",
                    flexDirection: "column",
                    gap: 10,
                  }}
                >
                  <img
                    src={"/avatar/" + studio.user_id}
                    style={{
                      width: 64,
                      height: 64,
                      borderRadius: "50%",
                      marginBottom: 12,
                    }}
                    alt="Studio Avatar"
                    onError={(e) =>
                      (e.currentTarget.src = "/avatar/default.png")
                    }
                  ></img>
                  <div
                    className="studio-card-title"
                    style={{
                      fontWeight: 600,
                      fontSize: "1.15rem",
                      marginBottom: 6,
                    }}
                  >
                    {studio.username}{" "}
                    {studio.verified ? (
                      <img
                        src="/assets/brand-verified-mark.png"
                        alt="Verified"
                        style={{
                          width: 20,
                          height: 20,
                          verticalAlign: "middle",
                        }}
                      />
                    ) : null}
                  </div>
                  <div
                    className="studio-card-meta"
                    style={{ fontSize: 13, color: "#aaa" }}
                  >
                    <span>Users:</span>
                    <ul>
                      {studio.users && studio.users.length > 0 ? (
                        studio.users.map((user: any) => (
                          <li
                            key={user.userId}
                            style={{
                              marginBottom: 4,
                              display: "flex",
                              flexDirection: "row",
                              gap: 4,
                            }}
                          >
                            <img
                              src={"/avatar/" + user.userId}
                              style={{
                                width: 24,
                                height: 24,
                                borderRadius: "50%",
                                marginRight: 8,
                                position: "relative",
                                top: "-4px",
                              }}
                              alt="User Avatar"
                              onError={(e) =>
                                (e.currentTarget.src = "/avatar/default.png")
                              }
                            ></img>
                            {user.username}
                            {user.admin ? (
                              <img
                                src="/assets/admin-mark.png"
                                alt="Admin"
                                style={{
                                  width: 16,
                                  height: 16,
                                  verticalAlign: "middle",
                                }}
                              />
                            ) : (
                              <>
                                {" "}
                                {user.verified ? (
                                  <img
                                    src="/assets/verified-mark.png"
                                    alt="Verified"
                                    style={{
                                      width: 16,
                                      height: 16,
                                      verticalAlign: "middle",
                                    }}
                                  />
                                ) : null}
                              </>
                            )}
                            {studio.admin_id === user.userId ? (
                              <span
                                style={{
                                  fontSize: 12,
                                  color: "#4caf50",
                                  marginLeft: 4,
                                }}
                              >
                                (You)
                              </span>
                            ) : (
                              <i
                                className="fa fa-trash"
                                aria-hidden="true"
                                style={{
                                  color: "red",
                                  position: "relative",
                                  top: "2px",
                                }}
                                onClick={() =>
                                  handleRemoveUser(studio.user_id, user.userId)
                                }
                              ></i>
                            )}
                          </li>
                        ))
                      ) : (
                        <li>No users</li>
                      )}
                    </ul>
                    <div>
                      <span>
                        API Key:{" "}
                        {apiKeySpoilers[studio.user_id] ? (
                          <code
                            style={{
                              background: "#444",
                              borderRadius: 4,
                              padding: "2px 6px",
                              fontWeight: 500,
                              marginRight: 8,
                              userSelect: "all",
                              cursor: "pointer",
                            }}
                            onClick={() =>
                              navigator.clipboard.writeText(studio.apiKey)
                            }
                            title="Click to copy"
                          >
                            {studio.apiKey}
                          </code>
                        ) : (
                          <code
                            style={{
                              background: "#444",
                              borderRadius: 4,
                              padding: "2px 6px",
                              fontWeight: 500,
                              marginRight: 8,
                              userSelect: "none",
                              cursor: "pointer",
                            }}
                            title="Click to reveal"
                          >
                            {"*".repeat(
                              Math.max(8, String(studio.apiKey).length)
                            )}
                          </code>
                        )}
                        <button
                          type="button"
                          style={{
                            background: "none",
                            border: "none",
                            color: "#fff",
                            cursor: "pointer",
                            fontSize: 13,
                            textDecoration: "underline",
                            opacity: 0.7,
                            marginLeft: 4,
                          }}
                          onClick={() => toggleApiKeySpoiler(studio.user_id)}
                        >
                          {apiKeySpoilers[studio.user_id] ? "Hide" : "Show"}
                        </button>
                        <button
                          type="button"
                          style={{
                            background: "none",
                            border: "none",
                            color: "#fff",
                            cursor: "pointer",
                            fontSize: 13,
                            textDecoration: "underline",
                            opacity: 0.7,
                            marginLeft: 8,
                          }}
                          onClick={() =>
                            navigator.clipboard.writeText(studio.apiKey)
                          }
                        >
                          Copy
                        </button>
                      </span>
                    </div>
                    <br />
                    <button
                      style={{
                        marginBottom: 24,
                        background: "#333",
                        color: "#fff",
                        border: "none",
                        borderRadius: 6,
                        fontWeight: 500,
                        padding: "12px 24px",
                        fontSize: "1.05rem",
                        cursor: "pointer",
                      }}
                      onClick={() => {
                        setAddUserStudioId(
                          studio.studio_id || studio.id || studio.user_id
                        );
                        setShowAddUserModal(true);
                        setAddUserId("");
                        setAddUserError(null);
                      }}
                    >
                      + Add user
                    </button>
                  </div>
                  {/* Add more info if needed */}
                </div>
              )
          )
        ) : (
          <div style={{ color: "#aaa", fontSize: 16, gridColumn: "1/-1" }}>
            You don't have any studios yet.
          </div>
        )}
      </div>
      {/* Add User Modal */}
      {showAddUserModal && (
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
          onClick={() => setShowAddUserModal(false)}
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
              onClick={() => setShowAddUserModal(false)}
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
            <h3 style={{ marginBottom: 18 }}>Add user to studio</h3>
            <form
              autoComplete="off"
              onSubmit={(e) => {
                e.preventDefault();
                if (addUserStudioId && addUserId) {
                  handleAddUser(addUserStudioId, addUserId);
                }
              }}
            >
              <div style={{ position: "relative", marginBottom: 12 }}>
                <input
                  ref={addUserInputRef}
                  type="text"
                  value={addUserSearch}
                  onChange={async (e) => {
                    setAddUserSearch(e.target.value);
                    setAddUserDropdownOpen(true);
                    setAddUserId("");
                    await handleUserSearch(e.target.value);
                  }}
                  onFocus={() => {
                    if (addUserSearch.length > 1) setAddUserDropdownOpen(true);
                  }}
                  onBlur={() =>
                    setTimeout(() => setAddUserDropdownOpen(false), 150)
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
                {addUserDropdownOpen && addUserResults.length > 0 && (
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
                    {addUserResults.map((u) => (
                      <li
                        key={u.userId}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          padding: "8px 12px",
                          cursor: "pointer",
                          borderBottom: "1px solid #333",
                        }}
                        onMouseDown={() => {
                          setAddUserId(u.userId);
                          setAddUserSearch(u.username);
                          setAddUserDropdownOpen(false);
                        }}
                      >
                        <img
                          src={`/avatar/${u.userId}`}
                          alt="avatar"
                          style={{ width: 28, height: 28, borderRadius: "50%" }}
                          onError={(e) =>
                            (e.currentTarget.src = "/avatar/default.png")
                          }
                        />
                        <span style={{ color: "#fff" }}>{u.username}</span>
                        {u.admin ? (
                          <img
                            src="/assets/admin-mark.png"
                            alt="Admin"
                            style={{
                              width: 16,
                              height: 16,
                              verticalAlign: "middle",
                            }}
                          />
                        ) : (
                          <>
                            {u.verified ? (
                              <img
                                src="/assets/verified-mark.png"
                                alt="Verified"
                                style={{
                                  width: 16,
                                  height: 16,
                                  verticalAlign: "middle",
                                }}
                              />
                            ) : null}
                          </>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <button
                  type="submit"
                  disabled={loading || !addUserId}
                  style={{
                    background: "#333",
                    color: "#fff",
                    border: "none",
                    borderRadius: 6,
                    fontWeight: 500,
                    padding: "10px 24px",
                    fontSize: "1rem",
                    cursor: addUserId ? "pointer" : "not-allowed",
                  }}
                >
                  Add
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddUserModal(false)}
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
              {addUserError && (
                <div style={{ color: "red", marginTop: 12 }}>
                  {addUserError}
                </div>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
