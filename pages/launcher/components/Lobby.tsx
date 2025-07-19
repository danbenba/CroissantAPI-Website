
import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import Profile from "../../profile";
import useAuth from "../../../hooks/useAuth";

const ENDPOINT = "/api";

interface DiscordUser {
    id: string;
    username: string;
    avatar: string | null;
    discriminator: string;
    global_name?: string;
    banner?: string | null;
    accent_color?: number | null;
    banner_color?: string | null;
}

type Lobby = {
    lobbyId: string;
    users: DiscordUser[];
};

export default function LobbyPage() {
    const [lobby, setLobby] = useState<Lobby | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedUser, setSelectedUser] = useState<string | null>(null);
    const [actionLoading, setActionLoading] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(true);
    const [tooltip, setTooltip] = useState<string | null>(null);


    const router = useRouter();
    const { user, token } = useAuth();

    // Constantes réutilisées
    const AUTH_HEADER = useMemo(() => ({
        "Content-Type": "application/json",
        Authorization: `Bearer ${token || ""}`,
    }), [token]);

    const lobbyLink = useMemo(() =>
        lobby ? `https://croissant-api.fr/join-lobby?lobbyId=${lobby.lobbyId}` : "",
        [lobby]
    );

    // Tooltip
    const showTooltip = useCallback((msg: string) => {
        setTooltip(msg);
        setTimeout(() => setTooltip(null), 2000);
    }, []);

    // Récupération du lobby
    const fetchLobby = useCallback((showLoading = true) => {
        setLoading(showLoading);
        fetch(`${ENDPOINT}/lobbies/user/@me`, { headers: AUTH_HEADER })
            .then(async (res) => {
                if (!res.ok) {
                    const data = await res.json().catch(() => ({}));
                    throw new Error(data.message || "Failed to fetch lobby");
                }
                return res.json();
            })
            .then(async (data) => {
                const usersIds = JSON.parse(data.users) as string[];
                const users: DiscordUser[] = [];
                for (const userId of usersIds) {
                    const res = await fetch(`${ENDPOINT}/users/${userId}`);
                    if (!res.ok) {
                        const data = await res.json().catch(() => ({}));
                        throw new Error(data.message || "Failed to fetch user");
                    }
                    const user = await res.json();
                    users.push(user);
                }
                setLobby({ lobbyId: data.lobbyId, users });
            })
            .catch(() => setLobby(null))
            .finally(() => setLoading(false));
    }, [AUTH_HEADER]);


    useEffect(() => {
        fetchLobby();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);


    const handleCreateLobby = useCallback(async () => {
        setActionLoading(true);
        setError(null);
        try {
            const res = await fetch(`${ENDPOINT}/lobbies`, {
                method: "POST",
                headers: AUTH_HEADER,
            });
            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data.message || "Failed to create lobby");
            }
            await fetchLobby();
        } catch (e: any) {
            setError(e.message);
        } finally {
            setActionLoading(false);
        }
    }, [AUTH_HEADER, fetchLobby]);


    const handleLeaveLobby = useCallback(async () => {
        if (!lobby) return;
        setActionLoading(true);
        setError(null);
        try {
            const res = await fetch(`${ENDPOINT}/lobbies/${lobby.lobbyId}/leave`, {
                method: "POST",
                headers: AUTH_HEADER,
            });
            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data.message || "Failed to leave lobby");
            }
            setLobby(null);
        } catch (e: any) {
            setError(e.message);
        } finally {
            setActionLoading(false);
        }
    }, [AUTH_HEADER, lobby]);

    const isFromLauncher = useCallback(() => {
        if (typeof window === "undefined") return "";
        return window.location.pathname.startsWith("/launcher") || window.location.search.includes("from=launcher")
            ? "&from=launcher"
            : "";
    }, []);

    // UI helpers
    const isUserInLobby = !!lobby;
    const isUserSelected = !!selectedUser;

    return (
        <>
            {/* Tooltip notification */}
            {tooltip && (
                <div className="lobby-tooltip">
                    <i className="fa fa-check-circle lobby-tooltip-icon" aria-hidden="true"></i>
                    {tooltip}
                </div>
            )}
            {isCollapsed ? (
                <button
                    onClick={() => setIsCollapsed(false)}
                    className="lobby-expand-btn"
                    aria-label="Expand lobby"
                >
                    ...
                </button>
            ) : (
                <div className="lobby-container">
                    <button
                        onClick={() => setIsCollapsed(true)}
                        className="lobby-collapse-btn"
                        aria-label="Collapse lobby"
                    >
                        X
                    </button>
                    {!isCollapsed && (
                        <>
                            <h1>Lobby</h1>
                            {loading && <p>Loading...</p>}
                            {error && <p className="lobby-error">{error}</p>}

                            {isUserSelected && (
                                <div className="lobby-profile-wrapper">
                                    <button onClick={() => setSelectedUser(null)} className="lobby-back-btn">
                                        ← Retour au lobby
                                    </button>
                                    <Profile userId={selectedUser!} />
                                </div>
                            )}

                            {!isUserSelected && (
                                <>
                                    {isUserInLobby ? (
                                        <div>
                                            <ul className="lobby-users-list">
                                                {lobby!.users.map((lobbyUser: DiscordUser) => (
                                                    <li key={lobbyUser.id}>
                                                        <button
                                                            className="lobby-user-btn"
                                                            onClick={() => router.push(`/profile?user=${lobbyUser.id}` + isFromLauncher())}
                                                        >
                                                            <img className="lobby-user-avatar"
                                                                src={`/avatar/${lobbyUser.id}`} />
                                                            <span className="lobby-user-name">
                                                                {lobbyUser.global_name} {lobbyUser.id === user.id ? "(You)" : ""}
                                                            </span>
                                                        </button>
                                                    </li>
                                                ))}
                                            </ul>
                                            {/* Copy Lobby Link and Leave Lobby Buttons in a flex row */}
                                            <div className="lobby-actions">
                                                <button
                                                    onClick={async () => {
                                                        try {
                                                            await navigator.clipboard.writeText(lobbyLink);
                                                            showTooltip("Lobby link copied!");
                                                        } catch {
                                                            showTooltip("Failed to copy link.");
                                                        }
                                                    }}
                                                >
                                                    Copy Lobby Link
                                                </button>
                                                <button
                                                    onClick={handleLeaveLobby}
                                                    disabled={actionLoading}
                                                >
                                                    {actionLoading ? "Leaving..." : "Leave Lobby"}
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div>
                                            <p>You are not in any lobby.</p>
                                            <button
                                                onClick={handleCreateLobby}
                                                disabled={actionLoading}
                                            >
                                                {actionLoading ? "Creating..." : "Create and Join Lobby"}
                                            </button>
                                        </div>
                                    )}
                                </>
                            )}
                        </>
                    )}
                </div>
            )}
        </>
    );
}
