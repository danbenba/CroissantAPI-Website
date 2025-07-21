import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import useAuth from "../hooks/useAuth";

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

/**
 * Search page for users.
 * Fetches and displays users matching the search query.
 */
const SearchPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [games, setGames] = useState<Game[]>([]);
  const { user, token } = useAuth();
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";

  // Helper to check if the request is from the launcher
  const isFromLauncher = useCallback(() => {
    if (typeof window === "undefined") return "";
    return window.location.pathname.startsWith("/launcher") || window.location.search.includes("from=launcher")
      ? "&from=launcher"
      : "";
  }, []);

  // Fetch users when query or token changes
  useEffect(() => {
    // if(!user) return;
    fetch(`${API_ENDPOINT}/users${user?.admin ? "/admin" : ""}/search?q=${encodeURIComponent(query)}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    )
      .then((res) => res.json())
      .then((data) => setUsers(Array.isArray(data) ? data : []))
      .catch(() => setUsers([]));

    // Fetch games (en utilisant GameController côté API)
    fetch(`${API_ENDPOINT}/games/search?q=${encodeURIComponent(query)}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    )
      .then((res) => res.json())
      .then((data) => setGames(Array.isArray(data) ? data : []))
      .catch(() => setGames([]));
  }, [query, token]);

  if (!query) {
    return (
      <div className="search-container">
        <div className="search-header">Please enter a search query.</div>
      </div>
    );
  }

  return (
    <div className="search-container">
      <div className="search-header">
        Search results for <strong>{query}</strong>
      </div>
      {/* Section Users */}
      {users.length > 0 && (
        <>
          <h1 className="search-title">Users</h1>
          <div className="search-users-grid">
            {users.map((user) => (
              <Link
                key={user.id}
                href={`/profile?user=${user.id}${isFromLauncher()}`}
                style={{ textDecoration: "none" }}
              >
                <div
                  className="search-user-card"
                  tabIndex={0}
                  onMouseOver={(e) => (e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.28)")}
                  onMouseOut={(e) => (e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.18)")}
                >
                  <img
                    src={`/avatar/${user.id}`}
                    alt="User Avatar"
                    className="search-user-avatar"
                  />
                  <div className="search-user-name">
                    {user.username || user.username} {user?.verified ? (
                      <img
                        src={!user.admin ? (user.isStudio ? "/assets/brand-verified-mark.png" : "/assets/verified-mark.png") : "/assets/admin-mark.png"}
                        alt="Verified"
                        style={{
                          width: "16px",
                          height: "16px",
                          position: "relative",
                          top: "2px"
                        }}
                      />
                    ) : null}
                  </div>
                  <div className="search-user-username">@{user.username}</div>
                </div>
              </Link>
            ))}
          </div>
        </>
      )}
      {/* Section Games */}
      {games.length > 0 && (
        <>
          <h1 className="search-title" style={{ marginTop: 40 }}>Games</h1>
          <div className="search-games-grid">
            {games.map((game) => (
              <Link
                key={game.gameId}
                href={`/game?gameId=${game.gameId}` + isFromLauncher()}
                style={{ textDecoration: "none" }}
              >
                <div
                  className="search-game-card"
                  tabIndex={0}
                  onMouseOver={(e) => (e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.28)")}
                  onMouseOut={(e) => (e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.18)")}
                  style={{ display: "flex", alignItems: "center", gap: 18, padding: 16, borderRadius: 12, background: "var(--background-medium)", marginBottom: 18, border: "2px solid var(--border-color)" }}
                >
                  <img
                    src={game.iconHash ? `/games-icons/${game.iconHash}` : "/games-icons/default.png"}
                    alt={game.name}
                    className="search-game-icon"
                    style={{ width: 64, height: 64, objectFit: "contain", borderRadius: 12, background: "#23232a", border: "2px solid #888" }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 20, color: "var(--text-color-primary)" }}>{game.name}</div>
                    <div style={{ color: "var(--text-color-secondary)", fontSize: 15 }}>{game.genre}</div>
                    <div style={{ color: "var(--text-color-secondary)", fontSize: 14, marginTop: 4, minHeight: 18, maxHeight: 36, overflow: "hidden", textOverflow: "ellipsis" }}>{game.description}</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 6 }}>
                      <span style={{ color: "var(--gold-color)", fontWeight: 700, fontSize: 16 }}>{game.price} <img src="/credit.png" alt="credits" style={{ width: 18, verticalAlign: "middle" }} /></span>
                      <span style={{ color: "var(--text-color-secondary)", fontSize: 14 }}>Rating: {game.rating ?? "N/A"}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default SearchPage;
