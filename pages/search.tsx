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
  global_name?: string;
}

/**
 * Search page for users.
 * Fetches and displays users matching the search query.
 */
const SearchPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const { token } = useAuth();
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
    if (!query || !token) {
      setUsers([]);
      return;
    }
    fetch(`${API_ENDPOINT}/users/search?q=${encodeURIComponent(query)}`,
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
      <h1 className="search-title">Users</h1>
      <div className="search-users-grid">
        {users.length === 0 ? (
          <div className="search-no-users">No users found.</div>
        ) : (
          users.map((user) => (
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
                  {user.global_name || user.username}
                </div>
                <div className="search-user-username">@{user.username}</div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
};

export default SearchPage;
