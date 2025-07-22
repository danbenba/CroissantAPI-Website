import React from "react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/router";

const endpoint = "/api";

const GamePage: React.FC = () => {
  const searchParams = useSearchParams();
  const gameId = searchParams.get("gameId");
  const [game, setGame] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const router = useRouter();

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
            <div>
              <b>Price:</b> {game.price}{" "}
              <img src="/assets/credit.png" className="gamepage-credit-icon" />
            </div>
          )}
        </div>
        {/* Add more details or actions as needed */}
      </div>
    </div>
  );
};

export default GamePage;
