import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from 'next/navigation'
import useAuth from "../hooks/useAuth";

const url = "https://croissant-api.fr"; // Replace with your actual API URL
const endpoint = "/api"; // Replace with your actual API endpoint

export default function SearchPage() {
    const [users, setUsers] = useState<any[]>([]);
    const { token } = useAuth(); // Assuming useAuth is imported from your auth hook

    const searchParams = useSearchParams();
    const query = searchParams.get('q') || "";

    useEffect(() => {
        if(!query || !token) return;
        fetch(endpoint + `/users/search?q=${encodeURIComponent(query)}`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        })
            .then(res => res.json())
            .then(data => setUsers(data || []))
            .catch(() => setUsers([]));
    }, [query]);

    return query ? (
        <div className="search-container">
            <div className="search-header">
                Search results for <strong>{query}</strong>
            </div>
            <h1 className="search-title">Users</h1>
            <div className="search-users-grid">
                {users.length === 0 && (
                    <div className="search-no-users">
                        No users found.
                    </div>
                )}
                {users.map((user, idx) => (
                    <Link href={`/profile?user=${user.id}`} style={{ textDecoration: "none" }}>
                        <div
                            key={user.id || idx}
                            className="search-user-card"
                            tabIndex={0}
                            onMouseOver={e => (e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.28)")}
                            onMouseOut={e => (e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.18)")}
                        >
                            <img
                                src={url + "/avatar/" + user.id}
                                alt="User Avatar"
                                className="search-user-avatar"
                            />
                            <div className="search-user-name">
                                {user.global_name || user.username}
                            </div>
                            <div className="search-user-username">
                                @{user.username}
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    ) : (
        <div className="search-container">
            <div className="search-header">
                Please enter a search query.
            </div>
        </div>
    );
}
