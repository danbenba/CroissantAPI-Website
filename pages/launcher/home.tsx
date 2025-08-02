import React, { useState, useEffect, use, useCallback, useRef, useMemo } from "react";
import Link from "next/link";
import useAuth from "../../hooks/useAuth";
import useUserCache from "../../hooks/useUserCache";
import CachedImage from "../../components/utils/CachedImage";
import Certification from "../../components/common/Certification";
import { DiscordRpcManager } from "../../components/discordRpcManager";
import { useLobby } from "../../hooks/LobbyContext";

const myUrl = "http://localhost:3333"; // Replace with your actual URL
let discordRpcManager: DiscordRpcManager;

type Game = {
  id?: number;
  gameId: string;
  name: string;
  description: string;
  price: number;
  ownerId?: string;
  owner_id?: string;
  showInStore?: boolean | number;
  image?: string;
  state?: "installed" | "not_installed" | "playing" | "to_update" | "installing";
  download_link?: string;
  bannerHash?: string;
  iconHash?: string;
  splashHash?: string | null;
  developer?: string;
  publisher?: string;
  genre?: string;
  multiplayer?: number | boolean;
  platforms?: string;
  rating?: number;
  release_date?: string;
  trailer_link?: string;
  website?: string;
};

let ws: WebSocket;
try {
  ws = new WebSocket("ws://localhost:8081"); // Adjust if needed
  ws.onerror = () => { };
  discordRpcManager = new DiscordRpcManager(ws);
} catch {
  // Do nothing if connection fails
}

const ENDPOINT = "/api";



export function LobbyManager() {
  const [loading, setLoading] = useState(true);
  const { setLobby } = useLobby();


  const pollingInterval = useRef<number>(2000); // ms
  const pollingTimer = useRef<NodeJS.Timeout | null>(null);
  const lastLobbyUsers = useRef<string>("");
  const pageVisible = useRef<boolean>(true);



  // Polling adaptatif : si la liste des users change, on réduit l'intervalle, sinon on l'augmente
  const fetchLobby = useCallback(
    async (showLoading = true) => {
      if (showLoading) setLoading(true);
      try {
        const res = await fetch(`${ENDPOINT}/lobbies/user/@me`);
        const data = await res.json();
        if (data.success) {
          const users = data.users;
          const usersString = users
            .map((u) => u.id)
            .sort()
            .join(",");
          if (lastLobbyUsers.current !== usersString) {
            pollingInterval.current = 2000; // 2s si changement
          } else {
            pollingInterval.current = Math.min(
              pollingInterval.current + 1000,
              10000
            ); // max 10s
          }
          lastLobbyUsers.current = usersString;
          setLobby({ lobbyId: data.lobbyId, users });
          discordRpcManager.createLobby({
            id: data.lobbyId,
            size: 10,
            max: data.maxUsers,
            joinSecret: data.lobbyId + "secret",
          });
        } else {
          setLobby(null);
          discordRpcManager.clearLobby();
        }
      } finally {
        if (showLoading) setLoading(false);
      }
    },
    []
  );

  // Gestion de la visibilité de l'onglet
  useEffect(() => {
    const handleVisibility = () => {
      pageVisible.current = true;
      if (pageVisible.current && !pollingTimer.current) {
        startPolling();
      } else if (!pageVisible.current && pollingTimer.current) {
        stopPolling();
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibility);
  }, []);

  // Fonction pour démarrer le polling
  const startPolling = useCallback(() => {
    if (pollingTimer.current) return;
    const poll = async () => {
      // if (!pageVisible.current) return;
      try {
        // On ne montre pas le loading spinner à chaque tick
        await fetchLobby(false);
      } finally {
        pollingTimer.current = setTimeout(poll, pollingInterval.current);
      }
    };
    pollingTimer.current = setTimeout(poll, pollingInterval.current);
  }, [fetchLobby]);

  // Fonction pour arrêter le polling
  const stopPolling = useCallback(() => {
    if (pollingTimer.current) {
      clearTimeout(pollingTimer.current);
      pollingTimer.current = null;
    }
  }, []);

  // Démarre le polling au montage
  useEffect(() => {
    fetchLobby(); // premier chargement
    startPolling();
    return () => stopPolling();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <></>
  );
}

const Library: React.FC = () => {
  const [games, setGames] = useState<Game[]>([]);
  const [selected, setSelected] = useState<Game | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFetchError, setShowFetchError] = useState(false);
  const [search, setSearch] = useState("");
  const [downloadPercent, setDownloadPercent] = useState<number>(0);
  const [ownerInfo, setOwnerInfo] = useState<{ id: string; username: string; verified?: boolean; admin?: boolean; isStudio?: boolean } | null>(null);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [transferTarget, setTransferTarget] = useState("");
  const [transferTargetId, setTransferTargetId] = useState("");
  const [transferUserResults, setTransferUserResults] = useState<any[]>([]);
  const [transferUserDropdownOpen, setTransferUserDropdownOpen] = useState(false);
  const [transferLoading, setTransferLoading] = useState(false);
  const [transferError, setTransferError] = useState<string | null>(null);

  const { user, token } = useAuth(); // Assuming useAuth is defined and provides user info
  const { getUser: getUserFromCache } = useUserCache();

  useEffect(() => {
    if (typeof location !== "undefined") {
      if (location.href.includes("?from=app")) {
        document.cookie = "from=app; path=/; expires=Fri, 31 Dec 9999 23:59:59 GMT";
      }
    }
  }, []);

  useEffect(() => {
    if (user && user.id) {
      ws.send(JSON.stringify({
        action: "updateState",
        state: user.username,
      }));
    }
  }, [user]);

  useEffect(() => {
    if (!token) return;
    fetch(myUrl + "/list", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then(async (res) => {
        if (!res.ok) throw new Error("Failed to fetch games");
        return res.json();
      })
      .then((data) => {
        setGames(data);
        const lastGameId = localStorage.getItem("lastSelectedGameId");
        const lastGame = data.find((g: Game) => g.gameId === lastGameId);
        setSelected(lastGame || data[0] || null);
        setLoading(false);
      })
      .catch(() => {
        fetch("/api/games/list/@me", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        })
          .then(async (res) => {
            if (!res.ok) throw new Error("Failed to fetch games from API");
            return res.json();
          })
          .then((data) => {
            setGames(data);
            const lastGameId = localStorage.getItem("lastSelectedGameId");
            const lastGame = data.find((g: Game) => g.gameId === lastGameId);
            setSelected(lastGame || data[0] || null);
            setLoading(false);
          })
          .catch((err) => {
            setError(err.message);
          });
      });
  }, []);

  useEffect(() => {
    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        if (message.action === "joinLobby") {
          const xhr = new XMLHttpRequest();
          xhr.open("POST", `/api/lobbies/${message.lobbyId}/join`, true);
          xhr.setRequestHeader("Content-Type", "application/json");
          xhr.onreadystatechange = function () {
            if (xhr.readyState === 4 && xhr.status === 200) {
              console.log("Successfully joined lobby:", message.lobbyId);
            }
          };
          xhr.send();
        }
        if (message.action === "downloadProgress" && message.gameId === selected?.gameId) {
          setDownloadPercent(message.percent);
        }
        if (
          message.action === "downloadComplete" ||
          message.action === "alreadyInstalled"
        ) {
          setDownloadPercent(0); // Reset progress
          setGames((prevGames) => {
            const updatedGames = prevGames.map((game) =>
              game.gameId === message.gameId
                ? { ...game, state: "installed" as Game["state"] }
                : game
            );
            if (selected && selected.gameId === message.gameId) {
              const updatedSelected = updatedGames.find(
                (g) => g.gameId === selected.gameId
              );
              if (updatedSelected) setSelected(updatedSelected);
            }
            return updatedGames;
          });
        }
        if (message.action === "status") {
          setGames((prevGames) =>
            prevGames.map((game) =>
              game.gameId === message.gameId
                ? {
                  ...game,
                  state:
                    message.status === "installed" ||
                      message.status === "not_installed" ||
                      message.status === "playing" ||
                      message.status === "to_update"
                      ? (message.status as Game["state"])
                      : game.state,
                }
                : game
            )
          );
          if (selected && selected.gameId === message.gameId) {
            setSelected({
              ...selected,
              state:
                message.status === "installed" ||
                  message.status === "not_installed" ||
                  message.status === "playing" ||
                  message.status === "to_update"
                  ? (message.status as Game["state"])
                  : selected.state,
            });
          }
        }
        if (message.action === "updateComplete") {
          setGames((prevGames) =>
            prevGames.map((game) =>
              game.gameId === message.gameId
                ? { ...game, state: "installed" }
                : game
            )
          );
          if (selected && selected.gameId === message.gameId) {
            setSelected({ ...selected, state: "installed" });
          }
        }
        if (message.action === "closeGame" || message.action === "closed") {
          setGames((prevGames) =>
            prevGames.map((game) =>
              game.gameId === message.gameId
                ? { ...game, state: "installed" }
                : game
            )
          );
          if (selected && selected.gameId === message.gameId) {
            setSelected({ ...selected, state: "installed" });
          }
          clearGameActivity();
          setIsPlaying(false);
        }
        if (message.action === "playing") {
          setGames((prevGames) =>
            prevGames.map((game) =>
              game.gameId === message.gameId
                ? { ...game, state: "playing" }
                : game
            )
          );
          if (selected && selected.gameId === message.gameId) {
            setSelected({ ...selected, state: "playing" });
          }
          setIsPlaying(true);
        }
        if (message.action === "deleteComplete") {
          setGames((prevGames) =>
            prevGames.map((game) =>
              game.gameId === message.gameId
                ? { ...game, state: "not_installed" }
                : game
            )
          );
          if (selected && selected.gameId === message.gameId) {
            setSelected({ ...selected, state: "not_installed" });
          }
        }
        if (message.action === "notFound" && message.gameId) {
          setError(`Game ${message.gameId} not found for deletion.`);
        }
      } catch (e) { }
    };
    return () => {
      ws.onmessage = null;
    };
  }, [selected]);

  useEffect(() => {
    if (selected?.owner_id || selected?.ownerId) {
      const ownerId = selected.owner_id || selected.ownerId;
      getUserFromCache(ownerId)
        .then(setOwnerInfo)
        .catch(() => setOwnerInfo(null));
    } else {
      setOwnerInfo(null);
    }
  }, [selected, getUserFromCache]);

  function setPlayingGame(game) {
    discordRpcManager.setActivity({
      details: `Playing ${game.name}`,
      largeImageKey: 'game_icon',
      largeImageText: `Playing ${game.name}`,
      smallImageKey: 'play',
      smallImageText: 'In game',
    });
  }

  function clearGameActivity() {
    discordRpcManager.setActivity({
      details: 'Ready to play',
      state: 'In launcher',
      largeImageKey: 'launcher_icon',
      largeImageText: 'Croissant Launcher',
      smallImageText: 'Ready to play',
      instance: true,
    });
  }

  const handleInstall = () => {
    if (selected && selected.state === "not_installed") {
      setDownloadPercent(0); // Reset progress
      // Met à jour l'état local en "installing"
      setGames((prevGames) =>
        prevGames.map((game) =>
          game.gameId === selected.gameId
            ? { ...game, state: "installing" }
            : game
        )
      );
      setSelected({ ...selected, state: "installing" });
      ws.send(
        JSON.stringify({
          action: "downloadGame",
          gameId: selected.gameId,
          downloadUrl: selected.download_link,
        })
      );
    }
  };

  const handlePlay = () => {
    if (selected && selected.state === "installed") {
      ws.send(
        JSON.stringify({
          action: "playGame",
          gameId: selected.gameId,
          playerId: user.id,
          verificationKey: localStorage.getItem("verificationKey"),
        })
      );
      setPlayingGame(selected);
      setIsPlaying(true);
    }
  };

  const handleUpdate = () => {
    if (selected && selected.state === "to_update") {
      ws.send(
        JSON.stringify({ action: "updateGame", gameId: selected.gameId })
      );
    }
  };

  const handleDelete = () => {
    if (selected && selected.state === "installed") {
      ws.send(
        JSON.stringify({ action: "deleteGame", gameId: selected.gameId })
      );
    }
  };

  const handleSelect = (game: Game) => {
    setSelected(game);
    setIsPlaying(game.state === "playing");
    localStorage.setItem("lastSelectedGameId", game.gameId);
  };

  const filteredGames = games.filter((game) =>
    game.name.toLowerCase().includes(search.toLowerCase())
  );

  // User search for transfer
  const handleTransferUserSearch = async (query: string) => {
    if (!query || query.length < 2) {
      setTransferUserResults([]);
      setTransferUserDropdownOpen(false);
      return;
    }
    try {
      const res = await fetch(`/api/users/search?q=${encodeURIComponent(query)}`);
      if (!res.ok) return;
      const users = await res.json();
      setTransferUserResults(users);
      setTransferUserDropdownOpen(true);
    } catch (e) {
      setTransferUserResults([]);
      setTransferUserDropdownOpen(false);
    }
  };

  const handleTransferGame = async () => {
    if (!selected || !transferTargetId.trim()) {
      setTransferError("Please select a user");
      return;
    }

    setTransferLoading(true);
    setTransferError(null);

    try {
      const response = await fetch(`/api/games/${selected.gameId}/transfer`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ targetUserId: transferTargetId.trim() }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Transfer failed");
      }

      // Supprimer le jeu de la liste locale
      setGames(prevGames => prevGames.filter(g => g.gameId !== selected.gameId));
      setSelected(null);
      setShowTransferModal(false);
      setTransferTarget("");
      setTransferTargetId("");
      setTransferUserResults([]);
      setTransferUserDropdownOpen(false);

      // Optionnel: afficher un message de succès
      alert("Game transferred successfully!");
    } catch (error) {
      setTransferError(error instanceof Error ? error.message : "Transfer failed");
    } finally {
      setTransferLoading(false);
    }
  };

  const handleCloseTransferModal = () => {
    setShowTransferModal(false);
    setTransferTarget("");
    setTransferTargetId("");
    setTransferUserResults([]);
    setTransferUserDropdownOpen(false);
    setTransferError(null);
  };

  // Determines if the transfer option should be shown for the selected game

  if (loading || error) {
    return (
      <div style={{ position: "relative" }}>
        {/* Skeleton UI */}
        <div className="steam-library-layout">
          <aside className="steam-library-sidebar">
            <input
              type="text"
              placeholder="Search games..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="library-search-input"
              disabled
            />
            <ul className="sidebar-list">
              {[...Array(5)].map((_, i) => (
                <li key={i} className="sidebar-game not-installed">
                  <div
                    className="sidebar-thumb skeleton-icon"
                    style={{ width: 36, height: 36 }}
                  />
                  <span
                    className="skeleton-title"
                    style={{ width: "60%", height: 18, margin: 0 }}
                  />
                </li>
              ))}
            </ul>
          </aside>
          <main className="steam-library-main launcher">
            <div className="main-details-steam gamepage-blur">
              <div className="banner-container">
                <div className="main-banner-steam skeleton-banner" />
                <div className="main-icon-steam skeleton-icon" />
              </div>
              <div className="main-details-content">
                <div className="skeleton-title" />
                <div className="skeleton-desc" />
                <div className="skeleton-properties" />
              </div>
            </div>
          </main>
        </div>
        {/* Loading spinner or error overlay */}
        {error ? (
          <div
            className="gamepage-loading-overlay"
            style={{
              background: "rgba(34,34,34,0.92)",
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <div
              style={{
                color: "#fff",
                fontSize: 18,
                fontWeight: 500,
                textAlign: "center",
                padding: "32px 0",
              }}
            >
              {error}
            </div>
          </div>
        ) : (
          <div className="gamepage-loading-overlay">
            <div className="inventory-loading-spinner" />
          </div>
        )}
        {showFetchError && (
          <div
            style={{
              position: "fixed",
              top: 24,
              right: 24,
              background: "#222",
              color: "#fff",
              padding: "16px 28px",
              borderRadius: 8,
              boxShadow: "0 2px 12px rgba(0,0,0,0.18)",
              zIndex: 9999,
              fontSize: 16,
              fontWeight: 500,
              letterSpacing: 0.2,
              minWidth: 220,
              textAlign: "center",
            }}
          >
            Failed to fetch games. Please check your connection or try again
            later.
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="steam-library-layout">
      <LobbyManager></LobbyManager>
      <aside className="steam-library-sidebar">
        <input
          type="text"
          placeholder="Search games..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="library-search-input"
        />
        {filteredGames.length === 0 ? (
          <div className="sidebar-empty">No games found.</div>
        ) : (
          <ul className="sidebar-list">
            {filteredGames.map((game) => (
              <li
                key={game.gameId}
                className={[
                  `sidebar-game`,
                  selected && selected.gameId === game.gameId ? "selected" : "",
                  game.state === "not_installed" ? "not-installed" : "",
                  game.state === "installed" ? "installed" : "",
                  game.state === "to_update" ? "to-update" : "",
                  game.state === "playing" ? "playing" : "",
                ]
                  .filter((i) => !!i)
                  .join(" ")
                  .trim()}
                onClick={() => handleSelect(game)}
                onDoubleClick={() => {
                  if (game.state === "installed") {
                    handlePlay();
                  } else if (game.state === "to_update") {
                    handleUpdate();
                  }
                }}
              >
                <CachedImage
                  src={`/games-icons/${game.iconHash}`}
                  alt={game.name}
                  className="sidebar-thumb"
                />
                <span>{game.name}</span>
              </li>
            ))}
          </ul>
        )}
      </aside>
      <main className="steam-library-main launcher">
        {!selected ? (
          <div className="main-empty">Please select a game.</div>
        ) : (
          <div className="main-details-steam">
            <div className="banner-container">
              <img
                src={`/banners-icons/${selected.bannerHash}`}
                alt={selected.name}
                className="main-banner-steam"
                loading="lazy"
              />
              <img
                src={`/games-icons/${selected.iconHash}`}
                alt={selected.name}
                className="main-icon-steam"
                loading="lazy"
              />
            </div>
            <div className="main-details-content">
              <h2>{selected.name}</h2>
              {/* --- Ajout du propriétaire sous le nom du jeu --- */}
              {ownerInfo && (
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                  <Link
                    href={`/profile?user=${ownerInfo.id}&from=launcher`}
                    style={{ display: "flex", alignItems: "center", textDecoration: "none", color: "#fff" }}
                  >
                    <CachedImage
                      src={`/avatar/${ownerInfo.id}`}
                      alt={ownerInfo.username}
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: "50%",
                        marginRight: 8,
                        objectFit: "cover",
                        border: "2px solid #444"
                      }}
                    />
                    <span style={{ fontWeight: 500 }}>
                      {ownerInfo.username}
                      <Certification
                        user={{ ...ownerInfo, verified: ownerInfo.verified ?? false }}
                        style={{
                          marginLeft: 4,
                          width: 16,
                          height: 16,
                          position: "relative",
                          top: -2,
                          verticalAlign: "middle",
                        }}
                      />
                    </span>
                  </Link>
                </div>
              )}
              {/* --- Fin ajout propriétaire --- */}
              <div className="library-details-row">
                <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16 }}>
                </div>
                <div className="library-btn-col">
                  {selected.state === "not_installed" && (
                    <button
                      className="library-play-btn can-install"
                      onClick={handleInstall}
                    >
                      Install
                    </button>
                  )}
                  {selected.state === "installing" && (
                    <div style={{ width: "100%" }}>
                      <button className="library-play-btn installing" disabled>
                        Installing... {downloadPercent > 0 ? `${downloadPercent}%` : ""}
                      </button>
                      <div style={{
                        width: "100%",
                        height: 8,
                        background: "#333",
                        borderRadius: 4,
                        marginTop: 8,
                        overflow: "hidden"
                      }}>
                        <div style={{
                          width: `${downloadPercent}%`,
                          height: "100%",
                          background: "#4caf50",
                          transition: "width 0.2s"
                        }} />
                      </div>
                    </div>
                  )}
                  {selected.state === "to_update" && (
                    <button
                      className="library-play-btn can-update"
                      onClick={handleUpdate}
                    >
                      Update
                    </button>
                  )}
                  {selected.state === "installed" && (
                    <div className="library-btn-col">
                      <button
                        className="library-play-btn can-play"
                        onClick={handlePlay}
                        disabled={isPlaying}
                      >
                        {isPlaying ? "In Game" : "Play"}
                      </button>
                      <button
                        className="library-play-btn can-delete"
                        onClick={handleDelete}
                        disabled={isPlaying}
                      >
                        Delete
                      </button>
                    </div>
                  )}
                  {selected.state === "playing" && (
                    <button className="library-play-btn playing" disabled>
                      In Game
                    </button>
                  )}
                  <Link href={`/game?gameId=${selected.gameId}&from=launcher`}>
                    <button className="library-play-btn">
                      View
                    </button>
                  </Link>
                  <button
                    className="library-play-btn transfer-btn"
                    onClick={() => setShowTransferModal(true)}
                    disabled={isPlaying}
                  >
                    Transfer
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Modal de transfert */}
      {showTransferModal && (
        <div className="modal-overlay" onClick={handleCloseTransferModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Transfer Game</h3>
            <p>Transfer your copy of "{selected?.name}" to another user.</p>
            <p style={{ fontSize: "14px", color: "#888", marginBottom: "16px" }}>
              Warning: You will lose access to this game permanently.
            </p>

            <div style={{ position: "relative", marginBottom: "16px" }}>
              <label style={{ color: "#fff", marginBottom: "8px", display: "block" }}>
                Select user:
              </label>
              <input
                type="text"
                value={transferTarget}
                onChange={(e) => {
                  setTransferTarget(e.target.value);
                  setTransferTargetId("");
                  handleTransferUserSearch(e.target.value);
                }}
                onFocus={() => {
                  if (transferTarget.length > 1) setTransferUserDropdownOpen(true);
                }}
                onBlur={() => setTimeout(() => setTransferUserDropdownOpen(false), 150)}
                placeholder="Search user by name..."
                className="transfer-input"
                disabled={transferLoading}
              />

              {transferUserDropdownOpen && transferUserResults.length > 0 && (
                <ul
                  style={{
                    position: "absolute",
                    left: 0,
                    right: 0,
                    top: "100%",
                    background: "#2a2a2a",
                    border: "1px solid #444",
                    borderRadius: "4px",
                    maxHeight: "200px",
                    overflowY: "auto",
                    zIndex: 1001,
                    listStyle: "none",
                    margin: 0,
                    padding: 0,
                    marginTop: "4px",
                  }}
                >
                  {transferUserResults.map((user) => (
                    <li
                      key={user.userId || user.user_id || user.id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        padding: "8px 12px",
                        cursor: "pointer",
                        borderBottom: "1px solid #333",
                        color: "#fff",
                      }}
                      onMouseDown={() => {
                        setTransferTargetId(user.userId || user.user_id || user.id);
                        setTransferTarget(user.username);
                        setTransferUserDropdownOpen(false);
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = "#333";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "transparent";
                      }}
                    >
                      <img
                        src={`/avatar/${user.userId || user.user_id || user.id}`}
                        alt="avatar"
                        style={{
                          width: "28px",
                          height: "28px",
                          borderRadius: "50%",
                          objectFit: "cover"
                        }}
                        onError={(e) => {
                          e.currentTarget.src = "/avatar/default.png";
                        }}
                      />
                      <span>{user.username}</span>
                      <Certification
                        user={{ ...user, verified: user.verified ?? false }}
                        style={{
                          marginLeft: 4,
                          width: 16,
                          height: 16,
                          position: "relative",
                          top: -2,
                          verticalAlign: "middle",
                        }}
                      />
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {transferError && (
              <div className="error-message" style={{ color: "#ff4444", fontSize: "14px", marginBottom: "16px" }}>
                {transferError}
              </div>
            )}

            <div className="modal-buttons">
              <button
                onClick={handleCloseTransferModal}
                disabled={transferLoading}
                className="modal-btn cancel"
              >
                Cancel
              </button>
              <button
                onClick={handleTransferGame}
                disabled={transferLoading || !transferTargetId.trim()}
                className="modal-btn confirm"
              >
                {transferLoading ? "Transferring..." : "Transfer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export async function getServerSideProps() {
  return {
    props: {
      isLauncher: true,
    },
  };
}

export default Library;
