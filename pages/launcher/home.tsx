import React, { useState, useEffect } from "react";
import useAuth from "../../hooks/useAuth";

const myUrl = "http://localhost:3333"; // Replace with your actual URL

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
} catch {
  // Do nothing if connection fails
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

  const { user, token } = useAuth(); // Assuming useAuth is defined and provides user info

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
      .catch((err) => {
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
                <img
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
              />
              <img
                src={`/games-icons/${selected.iconHash}`}
                alt={selected.name}
                className="main-icon-steam"
              />
            </div>
            <div className="main-details-content">
              <h2>{selected.name}</h2>
              <p style={{ color: "#bcbcbc" }}>{selected.description}</p>
              <div className="library-details-row">
                <div className="game-properties">
                  {selected.genre && (
                    <div>
                      <b>Genre:</b> {selected.genre}
                    </div>
                  )}
                  {selected.developer && (
                    <div>
                      <b>Developer:</b> {selected.developer}
                    </div>
                  )}
                  {selected.publisher && (
                    <div>
                      <b>Publisher:</b> {selected.publisher}
                    </div>
                  )}
                  {selected.release_date && (
                    <div>
                      <b>Release Date:</b> {selected.release_date}
                    </div>
                  )}
                  {selected.platforms && (
                    <div>
                      <b>Platforms:</b> {selected.platforms}
                    </div>
                  )}
                  {selected.rating !== undefined && (
                    <div>
                      <b>Rating:</b> {selected.rating}
                    </div>
                  )}
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
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
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
