import React from "react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/router";
import useAuth from "../hooks/useAuth";
import useUserCache from "../hooks/useUserCache"; // Ajouté

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

  const { getUser: getUserFromCache } = useUserCache(); // Ajouté
  const [ownerInfo, setOwnerInfo] = React.useState<{
    id: string;
    username: string;
    verified?: boolean;
    admin?: boolean;
    isStudio?: boolean;
  } | null>(null); // Ajouté

  React.useEffect(() => {
    fetch(endpoint + "/games/" + gameId)
      .then((res) => res.json())
      .then(setGame)
      .finally(() => setLoading(false));
  }, [gameId]);

  // Ajouté : récupération des infos propriétaire
  React.useEffect(() => {
    if (game?.owner_id || game?.ownerId) {
      const ownerId = game.owner_id || game.ownerId;
      getUserFromCache(ownerId)
        .then(setOwnerInfo)
        .catch(() => setOwnerInfo(null));
    } else {
      setOwnerInfo(null);
    }
  }, [game, getUserFromCache]);

  // Skeleton content for loading state
  const skeleton = (
    <div className="main-details-steam gamepage-root gamepage-blur">
      <button className="gamepage-back-btn" style={{ opacity: 0 }}>
        ← Back
      </button>
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
      <div className="banner-container">
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
        {/* --- Ajout du propriétaire sous le nom du jeu --- */}
        {ownerInfo && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <a
              href={`/profile?user=${ownerInfo.id}`}
              style={{ display: "flex", alignItems: "center", textDecoration: "none", color: "#fff" }}
            >
              <img
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
                {ownerInfo.admin ? (
                  <img src="/assets/admin-mark.png" alt="Admin" style={{ marginLeft: 4, width: 16, height: 16, verticalAlign: "middle" }} />
                ) : ownerInfo.verified ? (
                  <img src={ownerInfo.isStudio ? "/assets/brand-verified-mark.png" : "/assets/verified-mark.png"} alt="Verified" style={{ marginLeft: 4, width: 16, height: 16, verticalAlign: "middle" }} />
                ) : null}
              </span>
            </a>
          </div>
        )}
        {/* --- Fin ajout propriétaire --- */}
        {game.price !== undefined && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              margin: "16px 0",
            }}
          >
            <div>
              <b>Price:</b> {game.price}{" "}
              <img
                src="/assets/credit.png"
                className="gamepage-credit-icon"
              />
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
        <p className="gamepage-desc" style={{ overflowY: "auto" }}>
          {game.description
            .split('\n')
            .map((line, idx) => (
              <React.Fragment key={idx}>
                {line}
                <br />
              </React.Fragment>
            ))}</p>
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

        </div>
        {/* Add more details or actions as needed */}
      </div>
      {/* Prompt overlay */}
      {prompt && (
        <div className="shop-prompt-overlay">
          <div className="shop-prompt">
            <div className="shop-prompt-message">{prompt}</div>
            <button
              className="shop-prompt-buy-btn"
              onClick={confirmBuy}
              disabled={buying}
            >
              Buy
            </button>
            <button
              className="shop-prompt-cancel-btn"
              onClick={() => setPrompt(null)}
              disabled={buying}
            >
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
            <button
              className="shop-alert-ok-btn"
              onClick={() => setAlert(null)}
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GamePage;
