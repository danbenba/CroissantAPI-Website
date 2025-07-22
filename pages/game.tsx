import React from "react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/router";
import useAuth from "../hooks/useAuth";

const endpoint = "/api";

const GamePage: React.FC = () => {
  const searchParams = useSearchParams();
  const gameId = searchParams.get("gameId");
  const [game, setGame] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const router = useRouter();
  const { token } = useAuth();
  const [prompt, setPrompt] = React.useState<string | null>(null);
  const [alert, setAlert] = React.useState<string | null>(null);
  const [buying, setBuying] = React.useState(false);

  React.useEffect(() => {
    fetch(endpoint + "/games/" + gameId)
      .then((res) => res.json())
      .then(setGame)
      .finally(() => setLoading(false));
  }, [gameId]);

  // Skeleton content for loading state
  const skeleton = (
    <div className="main-details-steam gamepage-root gamepage-blur">
      <button className="gamepage-back-btn" style={{ opacity: 0 }}>
        ← Back
      </button>
      <div className="banner-container" style={{ width: "105%" }}>
        <div className="main-banner-steam skeleton-banner" />
        <div className="main-icon-steam skeleton-icon" />
      </div>
      <div className="main-details-content">
        <div className="skeleton-title" />
        <div className="skeleton-desc" />
        <div className="skeleton-properties" />
      </div>
    </div>
  );

  if (loading) {
    return (
      <div style={{ position: "relative" }}>
        {skeleton}
        <div className="gamepage-loading-overlay">
          <div className="inventory-loading-spinner" />
        </div>
      </div>
    );
  }
  if (!game) return <div>Game not found.</div>;

  // Buy game logic
  const handleBuyGame = async () => {
    if (!game) return;
    setPrompt(`Buy "${game.name}"?\nPrice: ${game.price}`);
  };

  const confirmBuy = async () => {
    setPrompt(null);
    setBuying(true);
    try {
      const res = await fetch(`${endpoint}/games/${game.gameId}/buy`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token || ""}`,
        },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to buy game");
      setAlert("Purchase successful!");
    } catch (err: any) {
      setAlert(err.message);
    } finally {
      setBuying(false);
    }
  };

  return (
    <div className="main-details-steam gamepage-root">
      <button onClick={() => router.back()} className="gamepage-back-btn">
        ← Back
      </button>
      <div className="banner-container" style={{ width: "105%" }}>
        <img
          src={`/banners-icons/${game.bannerHash}`}
          alt={game.name}
          className="main-banner-steam"
        />
        <img
          src={`/games-icons/${game.iconHash}`}
          alt={game.name}
          className="main-icon-steam"
        />
      </div>
      <div className="main-details-content">
        <h2>{game.name}</h2>
        <p className="gamepage-desc">{game.description}</p>
        <div className="game-properties">
          {game.genre && (
            <div>
              <b>Genre:</b> {game.genre}
            </div>
          )}
          {game.developer && (
            <div>
              <b>Developer:</b> {game.developer}
            </div>
          )}
          {game.publisher && (
            <div>
              <b>Publisher:</b> {game.publisher}
            </div>
          )}
          {game.release_date && (
            <div>
              <b>Release Date:</b> {game.release_date}
            </div>
          )}
          {game.platforms && (
            <div>
              <b>Platforms:</b> {game.platforms}
            </div>
          )}
          {game.rating !== undefined && (
            <div>
              <b>Rating:</b> {game.rating}
            </div>
          )}
          {game.price !== undefined && (
            <div style={{ display: "flex", alignItems: "center", gap: 16, margin: "16px 0" }}>
              <div>
                <b>Price:</b> {game.price}{" "}
                <img src="/assets/credit.png" className="gamepage-credit-icon" />
              </div>
              <button
                className="shop-game-buy-btn"
                style={{
                  padding: "10px 32px",
                  fontSize: 16,
                  borderRadius: 8,
                  fontWeight: 700,
                  background: "#4caf50",
                  color: "var(--text-color-primary)",
                  border: "none",
                  cursor: buying ? "not-allowed" : "pointer",
                  opacity: buying ? 0.7 : 1,
                }}
                onClick={handleBuyGame}
                disabled={buying}
              >
                Buy
              </button>
            </div>
          )}
        </div>
        {/* Add more details or actions as needed */}
      </div>
      {/* Prompt overlay */}
      {prompt && (
        <div className="shop-prompt-overlay">
          <div className="shop-prompt">
            <div className="shop-prompt-message">{prompt}</div>
            <button className="shop-prompt-buy-btn" onClick={confirmBuy} disabled={buying}>
              Buy
            </button>
            <button className="shop-prompt-cancel-btn" onClick={() => setPrompt(null)} disabled={buying}>
              Cancel
            </button>
          </div>
        </div>
      )}
      {/* Alert overlay */}
      {alert && (
        <div className="shop-alert-overlay">
          <div className="shop-alert">
            <div className="shop-alert-message">{alert}</div>
            <button className="shop-alert-ok-btn" onClick={() => setAlert(null)}>
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GamePage;
