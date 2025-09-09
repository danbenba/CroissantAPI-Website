import React, { useEffect, useState, useCallback, useMemo } from "react";
import Link from "next/link";
import useAuth from "../hooks/useAuth";
import useUserCache from "../hooks/useUserCache";
import router, { useRouter } from "next/router";
import CachedImage from "../components/utils/CachedImage";
import useIsMobile from "../hooks/useIsMobile";
import Certification from "../components/common/Certification";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common"])),
    },
  };
}
const ENDPOINT = "/api";

// Types et interfaces
interface User {
  id: string;
  username: string;
  verified: boolean;
  certification?: boolean;
}

interface Game {
  gameId: string;
  name: string;
  price: number;
  rating?: number;
  genre?: string;
  description?: string;
  bannerHash?: string;
  iconHash?: string;
  owner_id?: string;
}

interface PromptState {
  message: string;
  resolve: (value: { confirmed: boolean }) => void;
  item?: Game;
}

interface AlertState {
  message: string;
}

type OwnerInfo = User;

interface ShopProps {
  games: Game[];
  loading: boolean;
  error: string | null;
  prompt: PromptState | null;
  alert: AlertState | null;
  handleBuyGame: (game: Game) => void;
  setAlert: (alert: AlertState | null) => void;
  ownerInfoMap: Record<string, OwnerInfo>;
  handlePromptResult: (confirmed: boolean) => void;
}

function useShopLogic() {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [prompt, setPrompt] = useState<PromptState | null>(null);
  const [alert, setAlert] = useState<AlertState | null>(null);

  const { token } = useAuth();
  const { getUser: getUserFromCache } = useUserCache();
  const router = useRouter();

  // Constantes réutilisées
  const AUTH_HEADER = useMemo(
    () => ({
      "Content-Type": "application/json",
    }),
    [token]
  );

  // Récupération des jeux
  const fetchGames = useCallback(() => {
    setLoading(true);
    fetch(`${ENDPOINT}/games`, {
      method: "GET",
      headers: AUTH_HEADER,
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch games");
        return res.json();
      })
      .then((data) => {
        setGames(data);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [AUTH_HEADER]);

  useEffect(() => {
    fetchGames();
  }, [fetchGames]);

  // Prompt personnalisé
  const customPrompt = useCallback((message: string, item?: Game) => {
    return new Promise<{ confirmed: boolean }>((resolve) => {
      setPrompt({ message, resolve, item });
    });
  }, []);

  // Résultat du prompt
  const handlePromptResult = useCallback(
    (confirmed: boolean) => {
      if (prompt) {
        prompt.resolve({ confirmed });
        setPrompt(null);
      }
    },
    [prompt]
  );

  // Achat d'un jeu
  const handleBuyGame = useCallback(
    async (game: Game) => {
      const result = await customPrompt(`Buy "${game.name}"?\nPrice: ${game.price}`, game);
      if (result.confirmed) {
        fetch(`${ENDPOINT}/games/${game.gameId}/buy`, {
          method: "POST",
          headers: AUTH_HEADER,
        })
          .then(async (res) => {
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Failed to buy game");
            return data;
          })
          .then(() => {
            fetchGames();
          })
          .catch((err) => {
            setAlert({ message: err.message });
          });
      }
    },
    [AUTH_HEADER, customPrompt, fetchGames]
  );

  // Shop skeleton cards for loading
  const skeletons = useMemo(
    () =>
      Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          className="shop-game-modern-card shop-blur"
          style={{
            width: 420,
            background: "var(--background-medium)",
            borderRadius: 16,
            boxShadow: "0 2px 12px rgba(0,0,0,0.22)",
            overflow: "hidden",
            position: "relative",
            display: "flex",
            flexDirection: "column",
            marginBottom: 24,
            border: "2px solid var(--border-color)",
            filter: "blur(0.5px) grayscale(0.2) brightness(0.8)",
            pointerEvents: "none",
          }}
        >
          <div
            style={{
              position: "relative",
              width: "100%",
              height: 160,
              background: "#18181c",
            }}
          >
            <div className="skeleton-banner" />
            <div className="skeleton-icon" style={{ left: 32, bottom: -48, position: "absolute" }} />
          </div>
          <div
            style={{
              padding: "56px 32px 24px 32px",
              display: "flex",
              flexDirection: "column",
              gap: 8,
              position: "relative",
              minHeight: 160,
            }}
          >
            <div className="skeleton-title" style={{ width: "60%" }} />
            <div className="skeleton-desc" style={{ width: "90%" }} />
            <div className="skeleton-properties" style={{ width: "40%", height: 32 }} />
          </div>
        </div>
      )),
    []
  );

  // Map pour stocker les infos propriétaires par id
  const [ownerInfoMap, setOwnerInfoMap] = useState<Record<string, OwnerInfo>>({});
  const [invalidOwnerIds, setInvalidOwnerIds] = useState<Set<string>>(new Set());

  // Charger les infos propriétaires pour chaque jeu
  useEffect(() => {
    const fetchOwners = async () => {
      const ownersToFetch = games
        .map((g) => g.owner_id)
        .filter(Boolean)
        .filter((id) => !ownerInfoMap[id] && !invalidOwnerIds.has(id));

      if (ownersToFetch.length === 0) return;

      const newMap: Record<string, OwnerInfo> = {};
      const newInvalidIds: string[] = [];

      await Promise.all(
        ownersToFetch.map(async (id) => {
          try {
            const info = await getUserFromCache(id);
            if (info) {
              newMap[id] = info;
            } else {
              newInvalidIds.push(id);
            }
          } catch {
            newInvalidIds.push(id);
          }
        })
      );

      if (Object.keys(newMap).length > 0) {
        setOwnerInfoMap((prev) => ({ ...prev, ...newMap }));
      }
      if (newInvalidIds.length > 0) {
        setInvalidOwnerIds((prev) => new Set([...prev, ...newInvalidIds]));
      }

      setLoading(false);
    };
    if (games.length > 0) fetchOwners();
  }, [games, getUserFromCache, ownerInfoMap, invalidOwnerIds]);

  // Filtrer les jeux pour exclure ceux dont le propriétaire n'existe plus
  const validGames = useMemo(() => {
    return games.filter((game) => {
      if (!game.owner_id) return true;
      return ownerInfoMap[game.owner_id] && !invalidOwnerIds.has(game.owner_id);
    });
  }, [games, ownerInfoMap, invalidOwnerIds]);

  return {
    games: validGames, // On renvoie uniquement les jeux valides
    loading,
    error,
    prompt,
    alert,
    handleBuyGame,
    setAlert,
    setPrompt,
    ownerInfoMap,
    skeletons,
    handlePromptResult,
  };
}

// Version Desktop
const Desktop: React.FC<ShopProps> = ({ games, loading, error, prompt, alert, handleBuyGame, setAlert, ownerInfoMap, handlePromptResult }) => {
  const { t } = useTranslation("common");
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Get unique genres
  const genres = useMemo(() => {
    const uniqueGenres = new Set(games.map((game) => game.genre).filter(Boolean));
    return Array.from(uniqueGenres);
  }, [games]);

  // Filter games based on search and genre
  const filteredGames = useMemo(() => {
    return games.filter((game) => {
      const matchesSearch = searchTerm === "" || game.name.toLowerCase().includes(searchTerm.toLowerCase()) || game.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesGenre = !selectedGenre || game.genre === selectedGenre;
      return matchesSearch && matchesGenre;
    });
  }, [games, searchTerm, selectedGenre]);

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header Section */}
      <div className="mb-8 w-full justify-content">
        <h1 className="text-3xl font-bold text-white mb-6">{t("shop.title")}</h1>
        <div className="flex gap-6 items-center">
          {/* Search Bar */}
          <div className="flex-1">
            <input type="text" placeholder={t("shop.searchPlaceholder")} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-[#2a2a32] border border-[#444] rounded-xl py-3 px-4 text-white placeholder-[#666] focus:outline-none focus:border-[#1e90ff]" style={{ minWidth: 0 }} />
          </div>

          {/* Genre Filter */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            <button onClick={() => setSelectedGenre(null)} className={`px-4 py-2 rounded-lg transition-colors whitespace-nowrap ${selectedGenre === null ? "bg-[#1e90ff] text-white" : "bg-[#2a2a32] text-[#999] hover:bg-[#32323a]"}`}>
              {t("shop.allGames")}
            </button>
            {genres.map((genre) => (
              <button key={genre} onClick={() => setSelectedGenre(genre)} className={`px-4 py-2 rounded-lg transition-colors whitespace-nowrap ${selectedGenre === genre ? "bg-[#1e90ff] text-white" : "bg-[#2a2a32] text-[#999] hover:bg-[#32323a]"}`}>
                {genre}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Games Grid */}
      <div className="min-h-[calc(100vh-16rem)]  w-full justify-content">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="shop-game-modern-card shop-blur" style={{ width: 400, background: "var(--background-medium)", borderRadius: 16, boxShadow: "0 2px 12px rgba(0,0,0,0.22)", overflow: "hidden", position: "relative", display: "flex", flexDirection: "column", marginBottom: 24, border: "2px solid var(--border-color)", filter: "blur(0.5px) grayscale(0.2) brightness(0.8)", pointerEvents: "none" }}>
                <div style={{ position: "relative", width: "100%", height: 160, background: "#18181c" }}>
                  <div className="skeleton-banner" />
                  <div className="skeleton-icon" style={{ left: 32, bottom: -48, position: "absolute" }} />
                </div>
                <div style={{ padding: "56px 32px 24px 32px", display: "flex", flexDirection: "column", gap: 8, position: "relative", minHeight: 160 }}>
                  <div className="skeleton-title" style={{ width: "60%" }} />
                  <div className="skeleton-desc" style={{ width: "90%" }} />
                  <div className="skeleton-properties" style={{ width: "40%", height: 32 }} />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <div className="text-red-500 text-lg mb-2">{t("shop.error")}</div>
            <button onClick={() => window.location.reload()} className="text-[#1e90ff] hover:underline">
              {t("shop.retry")}
            </button>
          </div>
        ) : filteredGames.length === 0 ? (
          <div className="text-center py-12 text-[#999]">{searchTerm || selectedGenre ? t("shop.noResults") : t("shop.noGames")}</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGames.map((game) => (
              <GameCard key={game.gameId} game={game} ownerInfo={game.owner_id ? ownerInfoMap[game.owner_id] : null} />
            ))}
          </div>
        )}
      </div>

      {/* Prompt Modal */}
      {prompt && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-[#2a2a32] rounded-xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-white mb-4">{t("shop.confirmPurchase")}</h3>
            <p className="text-[#999] mb-6">{prompt.message}</p>
            <div className="flex gap-3">
              <button onClick={() => handlePromptResult(true)} className="flex-1 bg-[#1e90ff] text-white py-2 px-4 rounded-lg hover:bg-[#1a7ad4] transition-colors">
                {t("shop.buy")}
              </button>
              <button onClick={() => handlePromptResult(false)} className="flex-1 bg-[#444] text-white py-2 px-4 rounded-lg hover:bg-[#555] transition-colors">
                {t("shop.cancel")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Alert Modal */}
      {alert && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-[#2a2a32] rounded-xl p-6 max-w-md w-full">
            <p className="text-white mb-4">{alert.message}</p>
            <button onClick={() => setAlert(null)} className="w-full bg-[#1e90ff] text-white py-2 px-4 rounded-lg hover:bg-[#1a7ad4] transition-colors">
              {t("shop.ok")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// Version Mobile
const Mobile: React.FC<ShopProps> = ({ games, loading, error, prompt, alert, handleBuyGame, setAlert, ownerInfoMap, handlePromptResult }) => {
  const { t } = useTranslation("common");
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Get unique genres
  const genres = useMemo(() => {
    const uniqueGenres = new Set(games.map((game) => game.genre).filter(Boolean));
    return Array.from(uniqueGenres);
  }, [games]);

  // Filter games based on search and genre
  const filteredGames = useMemo(() => {
    return games.filter((game) => {
      const matchesSearch = searchTerm === "" || game.name.toLowerCase().includes(searchTerm.toLowerCase()) || game.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesGenre = !selectedGenre || game.genre === selectedGenre;
      return matchesSearch && matchesGenre;
    });
  }, [games, searchTerm, selectedGenre]);

  return (
    <div className="px-4 py-6">
      {/* Header Section */}
      <div className="mb-6 w-full justify-content">
        <h1 className="text-2xl font-bold text-white mb-4">{t("shop.title")}</h1>

        {/* Search Bar */}
        <div className="mb-4">
          <input type="text" placeholder={t("shop.searchPlaceholder")} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-[#2a2a32] border border-[#444] rounded-xl py-2.5 px-4 text-white placeholder-[#666] focus:outline-none focus:border-[#1e90ff]" />
        </div>

        {/* Genre Filter */}
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4">
          <button onClick={() => setSelectedGenre(null)} className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap text-sm ${selectedGenre === null ? "bg-[#1e90ff] text-white" : "bg-[#2a2a32] text-[#999] hover:bg-[#32323a]"}`}>
            {t("shop.allGames")}
          </button>
          {genres.map((genre) => (
            <button key={genre as string} onClick={() => setSelectedGenre(genre as string)} className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap text-sm ${selectedGenre === genre ? "bg-[#1e90ff] text-white" : "bg-[#2a2a32] text-[#999] hover:bg-[#32323a]"}`}>
              {genre}
            </button>
          ))}
        </div>
      </div>

      {/* Games List */}
      <div className="min-h-[calc(100vh-16rem)]">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="w-full bg-gray-800 rounded-lg overflow-hidden shadow-lg animate-pulse">
                <div className="h-48 bg-gray-700"></div>
                <div className="p-4">
                  <div className="h-4 bg-gray-700 rounded w-3/4 mb-4"></div>
                  <div className="h-4 bg-gray-700 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <div className="text-red-500 text-base mb-2">{t("shop.error")}</div>
            <button onClick={() => window.location.reload()} className="text-[#1e90ff] hover:underline text-sm">
              {t("shop.retry")}
            </button>
          </div>
        ) : filteredGames.length === 0 ? (
          <div className="text-center py-8 text-[#999] text-sm">{searchTerm || selectedGenre ? t("shop.noResults") : t("shop.noGames")}</div>
        ) : (
          <div className="space-y-4">
            {filteredGames.map((game) => (
              <GameCard key={game.gameId} game={game} ownerInfo={game.owner_id ? ownerInfoMap[game.owner_id] : null} />
            ))}
          </div>
        )}
      </div>

      {/* Prompt Modal */}
      {prompt && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-[#2a2a32] rounded-xl p-5 w-full max-w-sm mx-4">
            <h3 className="text-lg font-bold text-white mb-3">{t("shop.confirmPurchase")}</h3>
            <p className="text-[#999] mb-4 text-sm">{prompt.message}</p>
            <div className="flex gap-2">
              <button onClick={() => handlePromptResult(true)} className="flex-1 bg-[#1e90ff] text-white py-2 rounded-lg text-sm hover:bg-[#1a7ad4] transition-colors">
                {t("shop.buy")}
              </button>
              <button onClick={() => handlePromptResult(false)} className="flex-1 bg-[#444] text-white py-2 rounded-lg text-sm hover:bg-[#555] transition-colors">
                {t("shop.cancel")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Alert Modal */}
      {alert && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-[#2a2a32] rounded-xl p-5 w-full max-w-sm mx-4">
            <p className="text-white mb-4 text-sm">{alert.message}</p>
            <button onClick={() => setAlert(null)} className="w-full bg-[#1e90ff] text-white py-2 rounded-lg text-sm hover:bg-[#1a7ad4] transition-colors">
              {t("shop.ok")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

function GameCard({ game, ownerInfo }: { game: Game; ownerInfo: OwnerInfo | null }) {
  return (
    <div className="bg-[#1c1c24] rounded-xl overflow-hidden flex flex-col border border-[#333] shadow-lg transform transition-transform hover:scale-[1.02] hover:shadow-xl">
      {/* Banner et Icon avec effet de verre */}
      <div className="relative h-40 bg-[#18181c]">
        {game?.bannerHash && <img src={"/banners-icons/" + game.bannerHash} alt="banner" className="absolute inset-0 w-full h-full object-cover opacity-50" />}
        <div className="absolute inset-0 bg-gradient-to-t from-[#1c1c24] to-transparent opacity-60" />
        <img src={"/games-icons/" + game.iconHash} alt={game.name} className="absolute -bottom-8 left-8 w-24 h-24 rounded-xl object-contain bg-[#23232a] border-2 border-[#444] shadow-lg" />
      </div>

      {/* Contenu avec effet de verre */}
      <div className="pt-12 px-8 pb-6 flex flex-col gap-4">
        {/* En-tête avec titre et prix */}
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <Link href={`/game?gameId=${game.gameId}`} className="text-xl font-bold text-white hover:text-[#1e90ff] transition-colors">
              {game.name}
            </Link>
            {game.genre && <span className="text-sm text-[#888] mt-1">{game.genre}</span>}
          </div>
          <div className="flex items-center gap-2 bg-[#2a2a32] px-4 py-2 rounded-lg">
            <span className="text-[#ffd700] font-bold">{game.price}</span>
            <CachedImage src="/assets/credit.png" alt="credits" className="w-5 h-5" />
          </div>
        </div>

        {/* Information du créateur avec effet de verre */}
        {ownerInfo && (
          <Link href={`/profile?user=${ownerInfo.id}`} className="flex items-center gap-3 bg-[#2a2a32] rounded-lg p-2 hover:bg-[#32323a] transition-colors w-fit">
            <CachedImage src={`/avatar/${ownerInfo.id}`} alt={ownerInfo.username} className="w-8 h-8 rounded-full object-cover border-2 border-[#444]" />
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-white">{ownerInfo.username}</span>
              <Certification user={ownerInfo} className="w-4 h-4 relative -top-0.5" />
            </div>
          </Link>
        )}

        {/* Description avec effet de verre */}
        <p className="text-[#999] text-sm line-clamp-3 bg-[#2a2a32] p-3 rounded-lg">{game.description}</p>
      </div>
    </div>
  );
}

const GameShop: React.FC = () => {
  const shop = useShopLogic();
  const isMobile = useIsMobile();

  return isMobile ? <Mobile {...shop} /> : <Desktop {...shop} />;
};

export default GameShop;
