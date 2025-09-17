import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import GamesGrid, { Game, Category, getPlatformIcon, getCategoryName } from '../components/games/games-grid'
import { generateGameUrl } from '../lib/slug'
import useUserCache from '../hooks/useUserCache'
// Pas besoin de lucide-react, on utilisera des icônes simples
import {
  Card,
  CardBody,
  Button,
  Input,
  Chip,
  Spinner,
  Skeleton,
} from "@heroui/react"

// Interfaces importées depuis le composant GamesGrid

// Interface pour les articles
interface Article {
  id: number
  titre: string
  contenu: string
  resume?: string
  auteur_nom: string
  auteur_photo?: string
  date_publication: string
  date_creation: string
  categories: string[]
  tags: string[]
  vues: number
  image_principale?: string
}

// Fonction pour obtenir l'icône de la plateforme
// utils/icons.ts

// --- Composant Principal ---
// Page d'accueil adaptée de Koalyx pour Croissant
export default function HomePage() {
  // Ajouter les styles CSS pour les animations personnalisées
  useEffect(() => {
    const style = document.createElement('style')
    style.textContent = `
      @keyframes progressWave {
        0% { 
          transform: scaleX(0);
        }
        100% { 
          transform: scaleX(1);
        }
      }
  
      @keyframes subtleGlow {
        0%, 100% { 
          box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.1);
        }
        50% { 
          box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.3), 0 0 15px rgba(255, 255, 255, 0.1);
        }
      }
  
      @keyframes fadeInUp {
        0% { 
          opacity: 0; 
          transform: translateY(30px); 
        }
        100% { 
          opacity: 1; 
          transform: translateY(0); 
        }
      }

      @keyframes fadeIn {
        0% { 
          opacity: 0; 
        }
        100% { 
          opacity: 1; 
        }
      }

      .animate-fade-in {
        animation: fadeIn 800ms ease-in-out forwards;
      }
  
      @keyframes slideUpDelay {
        0% { 
          opacity: 0; 
          transform: translateY(20px); 
        }
        100% { 
          opacity: 1; 
          transform: translateY(0); 
        }
      }
  
      .active-game-glow {
        border: 1px solid rgba(255, 255, 255, 0.2);
        animation: subtleGlow 5s ease-in-out infinite;
      }
  
      .progress-wave {
        animation: progressWave 10s linear infinite;
        transform: scaleX(0);
        transform-origin: left;
      }
  
      .animate-fade-in-up {
        animation: fadeInUp 0.6s ease-out forwards;
      }
  
      .animate-slide-up-delay-1 {
        opacity: 0;
        animation: slideUpDelay 0.5s ease-out 0.1s forwards;
      }
  
      .animate-slide-up-delay-2 {
        opacity: 0;
        animation: slideUpDelay 0.5s ease-out 0.2s forwards;
      }
  
      .animate-slide-up-delay-3 {
        opacity: 0;
        animation: slideUpDelay 0.5s ease-out 0.3s forwards;
      }
    `
    document.head.appendChild(style)
  
    return () => {
      if (document.head.contains(style)) {
        document.head.removeChild(style)
      }
    }
  }, [])
  
  const router = useRouter()
  const { getUser: getUserFromCache } = useUserCache()
  
  // Fonction de traduction simple pour la démo
  const t = (key: string, options?: any) => {
    const translations: Record<string, string> = {
      'homepage.title': 'Découvrez une collection de jeux incroyables',
      'homepage.subtitle': 'Explorez notre bibliothèque de jeux soigneusement sélectionnés',
      'homepage.searchPlaceholder': 'Rechercher un jeu...',
      'homepage.featuredGames': 'Jeux en vedette',
      'homepage.latestNews': 'Dernières actualités'
    }
    return translations[key] || key
  }
  const [games, setGames] = useState<Game[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentFeaturedIndex, setCurrentFeaturedIndex] = useState(0)

  useEffect(() => {
    fetchGames()
    fetchCategories()
    fetchArticles()
    
    // Nettoyer le timeout au démontage du composant
    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout)
      }
    }
  }, [])

  // Carrousel automatique pour les jeux en vedette
  useEffect(() => {
    const featuredGames = getTrendingGames()
    if (featuredGames.length <= 1) return

    const interval = setInterval(() => {
      setCurrentFeaturedIndex((prevIndex) => 
        (prevIndex + 1) % featuredGames.length
      )
    }, 10000) // Change toutes les 10 secondes

    return () => clearInterval(interval)
  }, [games, currentFeaturedIndex])

  const fetchGames = async () => {
    try {
      // Récupération des données aléatoires pour enrichir les jeux
      const [randomDataRes] = await Promise.all([
        fetch('/api/games-random-data?count=20')
      ]);

      let randomDataMap: Record<string, any> = {}
      if (randomDataRes.ok) {
        const randomDataResult = await randomDataRes.json()
        if (randomDataResult.success) {
          randomDataMap = randomDataResult.data.reduce((acc: any, item: any) => {
            acc[item.gameId] = item
            return acc
          }, {})
        }
      }

      // Récupération des jeux comme dans l'ancienne version de Croissant
      const gamesRes = await fetch('/api/games', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      if (gamesRes.ok) {
        const gamesData = await gamesRes.json();
        
        if (Array.isArray(gamesData)) {
          // Enrichir les jeux avec les données aléatoires et les infos studio
          const enrichedGames = await Promise.all(gamesData.slice(0, 6).map(async (game: any) => {
            const gameIdStr = game.gameId?.toString()
            const randomGameData = randomDataMap[gameIdStr] || randomDataMap[Math.floor(Math.random() * 20) + 1]
            
            // Récupérer les infos du studio/propriétaire si disponible
            let studioInfo = null
            if (game.owner_id) {
              try {
                studioInfo = await getUserFromCache(game.owner_id)
              } catch (error) {
                console.warn('Impossible de charger les infos du studio:', error)
              }
            }
            
            return {
              id: parseInt(game.gameId) || Math.random(),
              title: game.name || 'Jeu sans nom',
              description: game.description || 'Aucune description disponible',
              banner_url: game.bannerHash ? `/banners-icons/${game.bannerHash}` : 'https://via.placeholder.com/326x161',
              sidebar_image_url: game.iconHash ? `/games-icons/${game.iconHash}` : undefined,
              is_vip: false,
              access_level: 'free' as const,
              category_id: 1,
              year: 2023,
              created_at: new Date().toISOString(),
              // Données aléatoires temporaires
              badges: randomGameData?.badges || [],
              views: randomGameData?.views || Math.floor(Math.random() * 1000) + 50,
              platform: randomGameData?.platform || 'Windows',
                   price: game.price || 0, // Utiliser le vrai prix de l'API
                   discount_price: game.discount_price,
              // Studio
              studio: studioInfo ? {
                id: studioInfo.id,
                username: studioInfo.username,
                verified: studioInfo.verified,
                certification: studioInfo.certification,
                avatar: `/avatar/${studioInfo.id}`
              } : null
            }
          }))
          
          setGames(enrichedGames);
        }
      }
    } catch (error) {
      console.error('Erreur lors du chargement des jeux:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories')
      if (response.ok) {
        const data = await response.json()
        if (data.success && data.data) {
          setCategories(data.data.categories || [])
        }
      }
    } catch (error) {
      console.error('Erreur lors du chargement des catégories:', error)
    }
  }

  const fetchArticles = async () => {
    // Pour le moment, pas d'articles dans Croissant
    setArticles([])
  }


  // Fonction pour formater les dates
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('fr-FR', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
  }

  // Fonction pour tronquer le texte
  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + '...'
  }

  // Fonction pour gérer la recherche
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchTerm.trim()) {
      router.push(`/explore?search=${encodeURIComponent(searchTerm.trim())}` as any)
    }
  }

  // Fonction pour gérer la touche Entrée
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      if (searchTerm.trim()) {
        router.push(`/explore?search=${encodeURIComponent(searchTerm.trim())}` as any)
      }
    }
  }

  // États pour la gestion de l'aperçu de recherche
  const [showSearchPreview, setShowSearchPreview] = useState(false)
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null)

  // Fonction pour gérer la recherche en temps réel (quand l'utilisateur tape)
  const handleSearchInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchTerm(value)
    
    // Nettoyer le timeout précédent
    if (searchTimeout) {
      clearTimeout(searchTimeout)
    }
    
    if (value.trim()) {
      // Afficher l'aperçu de recherche après 300ms (au lieu de rediriger)
      const newTimeout = setTimeout(() => {
        setShowSearchPreview(true)
      }, 300)
      setSearchTimeout(newTimeout)
    } else {
      setShowSearchPreview(false)
    }
  }

  // Obtenir les jeux avec le badge "Nouveauté" (triés par date de création)
  const getNewGames = () => {
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    
    return [...games]
      .filter(game => {
        // Vérifier si le jeu a le badge "nouveaute"
        const hasNouveauteBadge = game.badges && game.badges.some(badge => badge.name === 'nouveaute')
        if (!hasNouveauteBadge) return false
        
        // Vérifier la date de création (dans les 30 derniers jours)
        const createdAt = new Date(game.created_at)
        return createdAt > thirtyDaysAgo
      })
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 6)
  }

  // Obtenir les jeux les plus vus (tendances)
  const getTrendingGames = () => {
    return [...games]
      .sort((a, b) => (b.views || 0) - (a.views || 0))
      .slice(0, 5)
  }

  // Obtenir le jeu actuellement en vedette
  const getCurrentFeaturedGame = () => {
    const featuredGames = getTrendingGames()
    return featuredGames[currentFeaturedIndex] || featuredGames[0]
  }

  // Obtenir les jeux récemment mis à jour (uniquement ceux avec le badge "Mise à jour")
  const getRecentlyUpdatedGames = () => {
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    
    return [...games]
      .filter(game => {
        // Vérifier si le jeu a le badge "mise-a-jour"
        const hasUpdateBadge = game.badges && game.badges.some(badge => badge.name === 'mise-a-jour')
        if (!hasUpdateBadge) return false
        
        // Vérifier la date de mise à jour
        const updatedAt = new Date(game.updated_at || game.created_at)
        return updatedAt > thirtyDaysAgo
      })
      .sort((a, b) => new Date(b.updated_at || b.created_at).getTime() - new Date(a.updated_at || a.created_at).getTime())
      .slice(0, 4)
  }

  // Gérer le clic sur un jeu dans la liste
  const handleGameClick = (gameIndex: number) => {
    setCurrentFeaturedIndex(gameIndex)
    // Le useEffect avec currentFeaturedIndex dans les dépendances va automatiquement redémarrer le timer
  }

    if (loading) {
        return (
            <div className="bg-background text-foreground font-sans relative min-h-screen">
                {/* Background violet en arrière-plan */}
                <div
                    className="fixed inset-0 w-full h-full bg-main-overlay opacity-20 max-md:mask-b-from-10%-to-70% md:mask-radial-from-10%-to-70%-at-top -z-10"
                    style={{ inset: 0 as unknown as number }}
                />

                {/* Container principal */}
                <div className="z-10 w-full max-w-[1400px] flex-1 px-3 py-10 flex flex-col gap-16 pb-10" style={{ margin: '0 auto' }}>
                    
                    {/* Section de recherche et navigation en état chargement */}
                    <section className="flex items-center">
                        <div className="flex w-full flex-col gap-8">
                            <div className="flex items-center gap-2 sm:gap-6">
                                <form className="max-sm:w-full">
                                    <div className="group flex flex-col relative justify-end w-fit">
                                        <div className="h-full flex flex-col">
                                            <div className="relative w-full inline-flex tap-highlight-transparent flex-row items-center shadow-xs px-3 gap-3 bg-default-100 hover:bg-default-200 h-10 min-h-10 rounded-medium transition-background outline-solid outline-transparent focus-within:ring-2 focus-within:ring-primary" style={{cursor: 'text'}}>
                                                <div className="inline-flex w-full items-center h-full box-border">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 256 256">
                                                        <path d="M229.66,218.34l-50.07-50.06a88.11,88.11,0,1,0-11.31,11.31l50.06,50.07a8,8,0,0,0,11.32-11.32ZM40,112a72,72,0,1,1,72,72A72.08,72.08,0,0,1,40,112Z"></path>
                                                    </svg>
                                                    <input 
                                                      data-slot="input" 
                                                      data-has-start-content="true" 
                                                      className="w-full font-normal bg-transparent !outline-solid placeholder:text-foreground-500 focus-visible:outline-solid outline-transparent data-[has-start-content=true]:ps-1.5 data-[has-end-content=true]:pe-1.5 data-[type=color]:rounded-none file:cursor-pointer file:bg-transparent file:border-0 autofill:bg-transparent bg-clip-text text-small peer pe-6 input-search-cancel-button-none group-data-[has-value=true]:text-default-foreground" 
                                                      aria-label="Rechercher" 
                                                      placeholder={t('home.searchPlaceholder')}
                                                      tabIndex={0} 
                                                      type="text" 
                                                      value={searchTerm}
                                                      onChange={handleSearchInput}
                                                      onKeyDown={handleKeyDown}
                                                      title=""
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </form>
                                
                                {/* Navigation horizontale */}
                                <div className="flex items-center gap-6 max-sm:hidden">
                                    <Link className="text-foreground" href="/">Accueil</Link>
                <Link className="text-default-500" href={"/explore" as any}>Applications</Link>
                <div className="shrink-0 bg-divider border-none w-px h-[20px]" role="separator"></div>
                <Link className="text-default-500" href={"/explore?categoryId=1" as any}>Tools</Link>
                <Link className="text-default-500" href={"/explore?categoryId=2" as any}>OS</Link>
                <Link className="text-default-500" href={"/explore?categoryId=3" as any}>Kits</Link>
                                </div>
                            </div>
                            
                            {/* Section hero skeleton */}
                            <div className="flex gap-5 max-md:flex-col">
                                <Skeleton className="w-full max-md:h-[300px] md:h-[640px] rounded-2xl" />
                                
                                <div className="flex max-w-[256px] flex-col gap-5 max-md:hidden sm:w-full">
                                    {Array.from({ length: 5 }).map((_, index) => (
                                        <Skeleton key={index} className="w-full h-[96px] rounded-large" />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Section Tendances skeleton */}
                    <section className="flex flex-col gap-4">
                        <header className="flex items-center justify-between">
                            <div className="flex items-center gap-2.5 text-xl">
                                <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" fill="currentColor" viewBox="0 0 256 256">
                                    <path d="M183.89,153.34a57.6,57.6,0,0,1-46.56,46.55A8.75,8.75,0,0,1,136,200a8,8,0,0,1-1.32-15.89c16.57-2.79,30.63-16.85,33.44-33.45a8,8,0,0,1,15.78,2.68ZM216,144a88,88,0,0,1-176,0c0-27.92,11-56.47,32.66-84.85a8,8,0,0,1,11.93-.89l24.12,23.41,22-60.41a8,8,0,0,1,12.63-3.41C165.21,36,216,84.55,216,144Zm-16,0c0-46.09-35.79-85.92-58.21-106.33L119.52,98.74a8,8,0,0,1-13.09,3L80.06,76.16C64.09,99.21,56,122,56,144a72,72,0,0,0,144,0Z"></path>
                                </svg>
                                Tendances
                            </div>
                            <Skeleton className="w-20 h-4 rounded" />
                        </header>
                        
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
                            {Array.from({ length: 4 }).map((_, index) => (
                                <Skeleton key={index} className="w-full h-[240px] rounded-large" />
                            ))}
                        </div>
                    </section>

                    {/* Section Game Guides skeleton */}
                    <section className="flex flex-col gap-4">
                        <header className="flex items-center justify-between">
                            <div className="flex items-center gap-2.5 text-xl">
                                <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" fill="currentColor" viewBox="0 0 256 256">
                                    <path d="M208,24H72A32,32,0,0,0,40,56V224a8,8,0,0,0,11.58,7.16L72,224.94l20.42,6.22a8,8,0,0,0,4.84,0L120,223.78l22.74,7.38a8,8,0,0,0,4.84,0L168,223.78l20.42,6.22a8,8,0,0,0,4.84,0L216,224.94l20.42,6.22A8,8,0,0,0,248,224V56A32,32,0,0,0,208,24ZM72,40H208a16,16,0,0,1,16,16V208.06l-12.42-3.78a8,8,0,0,0-4.84,0L184,212.22l-22.74-7.38a8,8,0,0,0-4.84,0L136,212.22l-22.74-7.38a8,8,0,0,0-4.84,0L88,212.22l-20.42-6.22a8,8,0,0,0-4.84,0L56,208.06V56A16,16,0,0,1,72,40ZM184,80a8,8,0,0,1-8,8H80a8,8,0,0,1,0-16h96A8,8,0,0,1,184,80Zm0,32a8,8,0,0,1-8,8H80a8,8,0,0,1,0-16h96A8,8,0,0,1,184,112Zm0,32a8,8,0,0,1-8,8H80a8,8,0,0,1,0-16h96A8,8,0,0,1,184,144Z"></path>
                                </svg>
                                Guides de Jeux
                            </div>
                            <Skeleton className="w-20 h-4 rounded" />
                        </header>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                            {Array.from({ length: 4 }).map((_, index) => (
                                <Skeleton key={index} className="w-full h-[240px] rounded-large" />
                            ))}
                        </div>
                    </section>

                    {/* Section Nouveautés skeleton */}
                    <section className="flex flex-col gap-4">
                        <header className="flex items-center justify-between">
                            <div className="flex items-center gap-2.5 text-xl">
                                <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" fill="currentColor" viewBox="0 0 256 256">
                                    <path d="M232,136.66A104.12,104.12,0,1,1,119.34,24,8,8,0,0,1,120.66,40,88.12,88.12,0,1,0,216,135.34,8,8,0,0,1,232,136.66ZM120,72v56a8,8,0,0,0,8,8h56a8,8,0,0,0,0-16H136V72a8,8,0,0,0-16,0Zm40-24a12,12,0,1,0-12-12A12,12,0,0,0,160,48Zm36,24a12,12,0,1,0-12-12A12,12,0,0,0,196,72Zm24,36a12,12,0,1,0-12-12A12,12,0,0,0,220,108Z"></path>
                                </svg>
                                Ajouts récents
                            </div>
                            <Skeleton className="w-20 h-4 rounded" />
                        </header>
                        
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
                            {Array.from({ length: 4 }).map((_, index) => (
                                <Skeleton key={index} className="w-full h-[240px] rounded-large" />
                            ))}
                        </div>
                    </section>
                </div>
            </div>
        )
    }

  return (
    <div className="bg-background text-foreground font-sans relative min-h-screen">
      {/* Background Koalyx style - pixel perfect */}
      <div
        className="absolute h-screen w-full bg-main-overlay max-md:mask-b-from-10% max-md:mask-b-to-70% md:mask-radial-from-10% md:mask-radial-to-70% md:mask-radial-at-top"
        style={{ inset: 0 as unknown as number }}
      />

      {/* Pas de VipAutoPopup dans Croissant */}
      
      {/* Section Hero avec layout inspiré de PotionGang */}
      <div className="relative z-10 w-full max-w-[1400px] flex-1 px-3 py-10 flex flex-col gap-16 pb-10 mx-auto">
        
        {/* Section de recherche et navigation */}
        <section className="flex items-center">
          <div className="flex w-full flex-col gap-8">
            
            {/* Barre de recherche et navigation */}
            <div className="flex items-center gap-2 sm:gap-6">
              {/* Formulaire de recherche avec conteneur relatif */}
              <div className="relative max-sm:w-full">
                <form onSubmit={handleSearch}>
                <div className="group flex flex-col data-[hidden=true]:hidden relative justify-end data-[has-label=true]:mt-[calc(var(--heroui-font-size-small)_+_10px)] w-fit" data-slot="base" data-filled="true" data-filled-within="true">
                  <div data-slot="main-wrapper" className="h-full flex flex-col">
                    <div data-slot="input-wrapper" className="relative w-full inline-flex tap-highlight-transparent flex-row items-center shadow-xs px-3 gap-3 bg-default-100 data-[hover=true]:bg-default-200 group-data-[focus=true]:bg-default-100 h-10 min-h-10 rounded-medium transition-background motion-reduce:transition-none !duration-150 outline-solid outline-transparent group-data-[focus-visible=true]:z-10 group-data-[focus-visible=true]:ring-2 group-data-[focus-visible=true]:ring-focus group-data-[focus-visible=true]:ring-offset-2 group-data-[focus-visible=true]:ring-offset-background focus-within:ring-[#e20ef1]" style={{cursor: 'text'}}>
                      <div data-slot="inner-wrapper" className="inline-flex w-full items-center h-full box-border">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 256 256">
                          <path d="M229.66,218.34l-50.07-50.06a88.11,88.11,0,1,0-11.31,11.31l50.06,50.07a8,8,0,0,0,11.32-11.32ZM40,112a72,72,0,1,1,72,72A72.08,72.08,0,0,1,40,112Z"></path>
                        </svg>
                        <input 
                          data-slot="input" 
                          data-has-start-content="true" 
                          className="w-full font-normal bg-transparent !outline-solid placeholder:text-foreground-500 focus-visible:outline-solid outline-transparent data-[has-start-content=true]:ps-1.5 data-[has-end-content=true]:pe-1.5 data-[type=color]:rounded-none file:cursor-pointer file:bg-transparent file:border-0 autofill:bg-transparent bg-clip-text text-small peer pe-6 input-search-cancel-button-none group-data-[has-value=true]:text-default-foreground" 
                          aria-label="Rechercher" 
                          placeholder={t('home.searchPlaceholder')}
                          tabIndex={0} 
                          type="text" 
                          value={searchTerm}
                          onChange={handleSearchInput}
                          onKeyDown={handleKeyDown}
                          title=""
                        />
                        <button 
                          type="button" 
                          tabIndex={-1} 
                          aria-label="clear input" 
                          data-slot="clear-button" 
                          className="p-2 -m-2 z-10 absolute end-3 start-auto pointer-events-none appearance-none select-none opacity-0 cursor-pointer active:!opacity-70 rounded-full outline-solid outline-transparent data-[focus-visible=true]:z-10 data-[focus-visible=true]:outline-2 data-[focus-visible=true]:outline-focus data-[focus-visible=true]:outline-offset-2 text-large hover:!opacity-100 peer-data-[filled=true]:pointer-events-auto peer-data-[filled=true]:opacity-70 peer-data-[filled=true]:block peer-data-[filled=true]:scale-100 scale-90 ease-out duration-150 transition-[opacity,transform] motion-reduce:transition-none motion-reduce:scale-100" 
                          data-react-aria-pressable="true"
                        >
                          <svg aria-hidden="true" focusable="false" height="1em" role="presentation" viewBox="0 0 24 24" width="1em">
                            <path d="M12 2a10 10 0 1010 10A10.016 10.016 0 0012 2zm3.36 12.3a.754.754 0 010 1.06.748.748 0 01-1.06 0l-2.3-2.3-2.3 2.3a.748.748 0 01-1.06 0 .754.754 0 010-1.06l2.3-2.3-2.3-2.3A.75.75 0 019.7 8.64l2.3 2.3 2.3-2.3a.75.75 0 011.06 1.06l-2.3 2.3z" fill="currentColor"></path>
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </form>
                
                {/* Aperçu de recherche positionné */}
                {/* SearchPreview à implémenter plus tard */}
              </div>
              
              {/* Navigation horizontale */}
              <div className="flex items-center gap-6 max-sm:hidden">
                <Link className="text-foreground" href="/">{t('nav.home')}</Link>
                <Link className="text-default-500" href={"/explore" as any}>{t('nav.games')}</Link>
                <div className="shrink-0 bg-divider border-none w-px h-[20px]" role="separator"></div>
                <Link className="text-default-500" href={"/explore?categoryId=1" as any}>Tools</Link>
                <Link className="text-default-500" href={"/explore?categoryId=2" as any}>OS</Link>
                <Link className="text-default-500" href={"/explore?categoryId=3" as any}>Kits</Link>
              </div>
            </div>

            {/* Section hero avec image principale et sidebar */}
            <div className="flex gap-5 max-md:flex-col">
              {/* Image principale avec contenu */}
              <div className="relative w-full max-md:h-[300px] md:h-[640px]">
                {/* Image actuelle */}
                <img 
                  key={`main-${currentFeaturedIndex}`}
                  className="absolute inset-0 w-full h-full object-cover rounded-2xl max-md:h-[300px] max-sm:mask-b-from-10 max-sm:mask-b-to-black/60 max-sm:mask-b-to-40% sm:mask-l-from-25% sm:mask-l-to-black/45 sm:mask-l-to-100% md:h-[640px] opacity-0 animate-fade-in" 
                  alt="Featured Application"
                  src={getCurrentFeaturedGame()?.banner_url || "https://via.placeholder.com/800x640"}
                  onLoad={(e) => {
                    // Ajouter la classe d'opacité complète une fois l'image chargée
                    e.currentTarget.classList.remove('opacity-0')
                    e.currentTarget.classList.add('opacity-100')
                  }}
                />
                
                
                <div className="absolute bottom-0 left-0 p-8 sm:p-14 z-10">
                  <div 
                    key={`content-${currentFeaturedIndex}`} // Force re-render pour l'animation du contenu
                    className="flex max-w-[360px] flex-col gap-5 animate-fade-in-up"
                  >
                    <h4 className="text-2xl lg:text-4xl text-white drop-shadow-2xl animate-slide-up-delay-1">
                      {getCurrentFeaturedGame()?.title || 'Application en vedette'}
                    </h4>
                    <p className="max-lg:text-sm text-gray-200 drop-shadow-lg line-clamp-3 animate-slide-up-delay-2">
                      {getCurrentFeaturedGame()?.description || 'Découvrez notre application mise en avant cette semaine.'}
                    </p>
                    <Button 
                      as={Link}
                      href={getCurrentFeaturedGame() ? generateGameUrl(getCurrentFeaturedGame().id, getCurrentFeaturedGame().title) as any : '/explore'}
                      className="z-0 group relative inline-flex items-center justify-center box-border appearance-none select-none whitespace-nowrap font-normal subpixel-antialiased overflow-hidden tap-highlight-transparent transform-gpu cursor-pointer outline-solid outline-transparent px-4 min-w-20 h-10 text-small gap-2 rounded-medium transition-all duration-200 w-fit bg-white text-black hover:opacity-80 hover:scale-105 active:scale-95 animate-slide-up-delay-3"
                    >
                      Découvrir
                    </Button>
                  </div>
                </div>
              </div>
              
              {/* Sidebar avec applications populaires */}
              <div className="flex max-w-[256px] flex-col justify-between gap-5 max-md:hidden sm:w-full">
              {getTrendingGames().map((game, index) => (
                <button
                  key={game.id}
                  onClick={() => handleGameClick(index)}
                  className={`flex flex-col overflow-hidden text-foreground box-border outline-solid outline-transparent shadow-medium rounded-large cursor-pointer transition-transform-background motion-reduce:transition-none hover:bg-default/50 relative h-full w-full ${
                    index === currentFeaturedIndex 
                      ? 'bg-default/50 sm:bg-default/40' 
                      : 'bg-default/50 sm:bg-transparent'
                  }`}
                  tabIndex={0}
                  type="button"
                >
                  {/* Barre de progression pour l'élément actif */}
                  {index === currentFeaturedIndex && (
                    <div className="absolute bottom-0 left-0 h-full w-full">
                      <div 
                        key={`sidebar-progress-${currentFeaturedIndex}`}
                        className="bg-default/50 h-full origin-left progress-wave"
                      />
                    </div>
                  )}

                  <div className="relative flex w-full p-3 flex-auto h-auto flex-row items-center gap-4">
                    <img 
                      className="h-[60px] w-[40px] rounded-md object-cover sm:h-[80px] sm:w-[60px]"
                        alt={game.title} 
                        src={(game as any).sidebar_image_url || game.banner_url || "https://via.placeholder.com/60x80"}
                      />
                    <p className="text-sm">{game.title}</p>
                  </div>
                </button>
              ))}

              </div>
            </div>
            
            {/* Aperçu de recherche */}
            {/* SearchPreview à implémenter plus tard */}
          </div>
        </section>

        {/* Section Tendances */}
        <section className="flex flex-col gap-4">
          <header className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 text-xl">
              <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" fill="currentColor" viewBox="0 0 256 256">
                <path d="M183.89,153.34a57.6,57.6,0,0,1-46.56,46.55A8.75,8.75,0,0,1,136,200a8,8,0,0,1-1.32-15.89c16.57-2.79,30.63-16.85,33.44-33.45a8,8,0,0,1,15.78,2.68ZM216,144a88,88,0,0,1-176,0c0-27.92,11-56.47,32.66-84.85a8,8,0,0,1,11.93-.89l24.12,23.41,22-60.41a8,8,0,0,1,12.63-3.41C165.21,36,216,84.55,216,144Zm-16,0c0-46.09-35.79-85.92-58.21-106.33L119.52,98.74a8,8,0,0,1-13.09,3L80.06,76.16C64.09,99.21,56,122,56,144a72,72,0,0,0,144,0Z"></path>
              </svg>
            {t('home.trending')}
            </div>
            <Link className="cursor-pointer underline" href={"/explore?sortBy=views" as any}>{t('nav.seeMore')}</Link>
          </header>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {getTrendingGames().slice(0, 4).map((game, index) => (
              <Card
                key={game.id}
                as={Link}
                      href={generateGameUrl(game.id, game.title) as any}
                className="flex flex-col relative overflow-hidden h-auto text-foreground box-border bg-content1 outline-solid outline-transparent shadow-medium rounded-large cursor-pointer transition-transform-background hover:scale-[0.98] min-w-[326px]"
                isPressable
              >
                <CardBody className="relative flex w-full flex-auto flex-col h-auto p-0">
                  {/* Badges du haut */}
                  <div className="absolute top-4 right-4 z-20 flex gap-2">
                    {/* Badges de jeu de la DB */}
                    {game.badges && game.badges.map((badge) => (
                      <Chip 
                        key={badge.id}
                        size="sm" 
                        variant="shadow" 
                        startContent={<span dangerouslySetInnerHTML={{ __html: badge.icon }} />}
                        className={`${
                          badge.name === 'nouveaute' ? 'bg-gradient-to-r from-red-500 to-pink-600' :
                          badge.name === 'mise-a-jour' ? 'bg-gradient-to-r from-orange-500 to-yellow-600' :
                          badge.name === 'exclusif' ? 'bg-gradient-to-r from-purple-500 to-indigo-600' :
                          'bg-gradient-to-r from-blue-500 to-purple-600'
                        } text-white font-semibold`}
                      >
                        {badge.display_name}
                      </Chip>
                    ))}

                    {/* Badge de position pour les tendances */}
                    <Chip 
                      color="warning" 
                      variant="shadow" 
                      startContent={<i className="fas fa-fire text-orange-300"></i>}
                      className="bg-gradient-to-r from-orange-500 to-red-600 text-white font-semibold"
                    >
                      #{index + 1}
                    </Chip>
                  </div>

                  <img 
                    loading="lazy" 
                    alt={game.title} 
                    className="z-10 h-[161px] object-cover" 
                    src={game.banner_url || "https://via.placeholder.com/326x161"}
                  />
                  <div className="flex flex-col gap-1 px-5 py-2">
                    <img 
                      alt={game.title} 
                      loading="lazy" 
                      className="absolute bottom-0 left-0 opacity-65 blur-2xl" 
                      src={game.banner_url || "https://via.placeholder.com/326x161"}
                    />
                    <h2 className="z-10 truncate text-xl">{game.title}</h2>
                    <div className="flex gap-1 text-sm">
                        <div className="flex flex-col relative overflow-hidden h-auto text-foreground box-border bg-content1 outline-solid outline-transparent shadow-medium rounded-large transition-transform-background motion-reduce:transition-none" tabIndex={-1}>
                          <div className="relative flex w-full p-3 flex-auto flex-col justify-center px-2 py-1">
                            {getPlatformIcon(game.platform)}
                          </div>
                        </div>
                        <div className="flex flex-col relative overflow-hidden h-auto text-foreground box-border bg-content1 outline-solid outline-transparent shadow-medium rounded-large transition-transform-background motion-reduce:transition-none" tabIndex={-1}>
                          <div className="relative flex w-full p-3 flex-auto flex-row items-center gap-1 px-2 py-1">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256">
                            <path d="M247.31,124.76c-.35-.79-8.82-19.58-27.65-38.41C194.57,61.26,162.88,48,128,48S61.43,61.26,36.34,86.35C17.51,105.18,9,124,8.69,124.76a8,8,0,0,0,0,6.5c.35.79,8.82,19.57,27.65,38.4C61.43,194.74,93.12,208,128,208s66.57-13.26,91.66-38.34c18.83-18.83,27.3-37.61,27.65-38.4A8,8,0,0,0,247.31,124.76ZM128,192c-30.78,0-57.67-11.19-79.93-33.25A133.47,133.47,0,0,1,25,128A133.33,133.33,0,0,1,48.07,97.25C70.33,75.19,97.22,64,128,64s57.67,11.19,79.93,33.25A133.46,133.46,0,0,1,231.05,128C223.84,141.46,192.43,192,128,192Zm0-112a48,48,0,1,0,48,48A48.05,48.05,0,0,0,128,80Zm0,80a32,32,0,1,1,32-32A32,32,0,0,1,128,160Z"></path>
                          </svg>
                          {game.views || 0}
                        </div>
                        </div>
                        <div className="flex flex-col relative overflow-hidden h-auto text-foreground box-border bg-content1 outline-solid outline-transparent shadow-medium rounded-large transition-transform-background motion-reduce:transition-none" tabIndex={-1}>
                          <div className="relative flex w-full p-3 flex-auto flex-row items-center gap-1 px-2 py-1 text-nowrap">
                            {game.access_level === 'free' ? (
                              <>
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256">
                                  <path d="M128,24A104,104,0,1,0,232,128,104.13,104.13,0,0,0,128,24Zm40,112H136v32a8,8,0,0,1-16,0V136H88a8,8,0,0,1,0-16h32V88a8,8,0,0,1,16,0v32h32a8,8,0,0,1,0,16Z"></path>
                                </svg>
                                Gratuit
                              </>
                            ) : (
                              <>
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256">
                                  <path d="M183.89,153.34a57.6,57.6,0,0,1-46.56,46.55A8.75,8.75,0,0,1,136,200a8,8,0,0,1-1.32-15.89c16.57-2.79,30.63-16.85,33.44-33.45a8,8,0,0,1,15.78,2.68ZM216,144a88,88,0,0,1-176,0c0-27.92,11-56.47,32.66-84.85a8,8,0,0,1,11.93-.89l24.12,23.41,22-60.41a8,8,0,0,1,12.63-3.41C165.21,36,216,84.55,216,144Zm-16,0c0-46.09-35.79-85.92-58.21-106.33L119.52,98.74a8,8,0,0,1-13.09,3L80.06,76.16C64.09,99.21,56,122,56,144a72,72,0,0,0,144,0Z"></path>
                                </svg>
                                Plus
                              </>
                            )}
                          </div>
                        </div>
                    </div>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        </section>

        {/* Section Jeux Récemment Mis à Jour */}
        <section className="flex flex-col gap-4">
          <header className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 text-xl">
              <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" fill="currentColor" viewBox="0 0 256 256">
                <path d="M227.31,73.37,182.63,28.68a16,16,0,0,0-22.63,0L36.68,152A15.89,15.89,0,0,0,32,163.31V208a16,16,0,0,0,16,16H92.69A15.86,15.86,0,0,0,104,219.31l123.31-123.32a16,16,0,0,0,0-22.62ZM51.31,160l90.35-90.35,16.68,16.69L68,176.68ZM48,179.31,76.69,208H48Zm48,25.38L79.31,188l90.35-90.35h0l16.68,16.69Z"></path>
              </svg>
              Récemment Mis à Jour
            </div>
            <Link className="cursor-pointer underline" href={"/explore?sortBy=updated" as any}>Voir plus</Link>
          </header>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {getRecentlyUpdatedGames().length === 0 ? (
              <div className="col-span-full text-center py-8">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-yellow-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-sync-alt text-2xl text-white"></i>
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Aucune mise à jour récente</h3>
                <p className="text-gray-400">Aucun jeu n'a été mis à jour récemment</p>
              </div>
            ) : (
              getRecentlyUpdatedGames().map((game) => (
                <Card
                  key={game.id}
                  as={Link}
                  href={generateGameUrl(game.id, game.title) as any}
                  className="flex flex-col relative overflow-hidden h-auto text-foreground box-border bg-content1 outline-solid outline-transparent shadow-medium rounded-large cursor-pointer transition-transform-background hover:scale-[0.98] min-w-[326px]"
                  isPressable
                >
                  <CardBody className="relative flex w-full flex-auto flex-col h-auto p-0">
                    {/* Badges du haut */}
                    <div className="absolute top-4 right-4 z-20 flex gap-2">
                      {/* Badges de jeu de la DB */}
                      {game.badges && game.badges.map((badge) => (
                        <Chip 
                          key={badge.id}
                          size="sm" 
                          variant="shadow" 
                          startContent={<span dangerouslySetInnerHTML={{ __html: badge.icon }} />}
                          className={`${
                            badge.name === 'nouveaute' ? 'bg-gradient-to-r from-red-500 to-pink-600' :
                            badge.name === 'mise-a-jour' ? 'bg-gradient-to-r from-orange-500 to-yellow-600' :
                            badge.name === 'exclusif' ? 'bg-gradient-to-r from-purple-500 to-indigo-600' :
                            'bg-gradient-to-r from-blue-500 to-purple-600'
                          } text-white font-semibold`}
                        >
                          {badge.display_name}
                        </Chip>
                      ))}

                    </div>

                    <img 
                      loading="lazy" 
                      alt={game.title} 
                      className="z-10 h-[161px] object-cover" 
                      src={game.banner_url || "https://via.placeholder.com/326x161"}
                    />
                    <div className="flex flex-col gap-1 px-5 py-2">
                      <img 
                        alt={game.title} 
                        loading="lazy" 
                        className="absolute bottom-0 left-0 opacity-65 blur-2xl" 
                        src={game.banner_url || "https://via.placeholder.com/326x161"}
                      />
                      <h2 className="z-10 truncate text-xl">{game.title}</h2>
                      <div className="flex gap-1 text-sm">
                        <div className="flex flex-col relative overflow-hidden h-auto text-foreground box-border bg-content1 outline-solid outline-transparent shadow-medium rounded-large transition-transform-background motion-reduce:transition-none" tabIndex={-1}>
                          <div className="relative flex w-full p-3 flex-auto flex-col justify-center px-2 py-1">
                            {getPlatformIcon(game.platform)}
                          </div>
                        </div>
                        <div className="flex flex-col relative overflow-hidden h-auto text-foreground box-border bg-content1 outline-solid outline-transparent shadow-medium rounded-large transition-transform-background motion-reduce:transition-none" tabIndex={-1}>
                          <div className="relative flex w-full p-3 flex-auto flex-row items-center gap-1 px-2 py-1">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256">
                              <path d="M247.31,124.76c-.35-.79-8.82-19.58-27.65-38.41C194.57,61.26,162.88,48,128,48S61.43,61.26,36.34,86.35C17.51,105.18,9,124,8.69,124.76a8,8,0,0,0,0,6.5c.35.79,8.82,19.57,27.65,38.4C61.43,194.74,93.12,208,128,208s66.57-13.26,91.66-38.34c18.83-18.83,27.3-37.61,27.65-38.4A8,8,0,0,0,247.31,124.76ZM128,192c-30.78,0-57.67-11.19-79.93-33.25A133.47,133.47,0,0,1,25,128A133.33,133.33,0,0,1,48.07,97.25C70.33,75.19,97.22,64,128,64s57.67,11.19,79.93,33.25A133.46,133.46,0,0,1,231.05,128C223.84,141.46,192.43,192,128,192Zm0-112a48,48,0,1,0,48,48A48.05,48.05,0,0,0,128,80Zm0,80a32,32,0,1,1,32-32A32,32,0,0,1,128,160Z"></path>
                            </svg>
                            {game.views || 0}
                          </div>
                        </div>
                        <div className="flex flex-col relative overflow-hidden h-auto text-foreground box-border bg-content1 outline-solid outline-transparent shadow-medium rounded-large transition-transform-background motion-reduce:transition-none" tabIndex={-1}>
                          <div className="relative flex w-full p-3 flex-auto flex-row items-center gap-1 px-2 py-1 text-nowrap">
                            {game.access_level === 'free' ? (
                              <>
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256">
                                  <path d="M128,24A104,104,0,1,0,232,128,104.13,104.13,0,0,0,128,24Zm40,112H136v32a8,8,0,0,1-16,0V136H88a8,8,0,0,1,0-16h32V88a8,8,0,0,1,16,0v32h32a8,8,0,0,1,0,16Z"></path>
                                </svg>
                                Gratuit
                              </>
                            ) : (
                              <>
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256">
                                  <path d="M183.89,153.34a57.6,57.6,0,0,1-46.56,46.55A8.75,8.75,0,0,1,136,200a8,8,0,0,1-1.32-15.89c16.57-2.79,30.63-16.85,33.44-33.45a8,8,0,0,1,15.78,2.68ZM216,144a88,88,0,0,1-176,0c0-27.92,11-56.47,32.66-84.85a8,8,0,0,1,11.93-.89l24.12,23.41,22-60.41a8,8,0,0,1,12.63-3.41C165.21,36,216,84.55,216,144Zm-16,0c0-46.09-35.79-85.92-58.21-106.33L119.52,98.74a8,8,0,0,1-13.09,3L80.06,76.16C64.09,99.21,56,122,56,144a72,72,0,0,0,144,0Z"></path>
                                </svg>
                                Plus
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              ))
            )}
          </div>
        </section>

        {/* Section Ajouts récents */}
        <section className="flex flex-col gap-4">
          <header className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 text-xl">
              <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" fill="currentColor" viewBox="0 0 256 256">
                <path d="M232,136.66A104.12,104.12,0,1,1,119.34,24,8,8,0,0,1,120.66,40,88.12,88.12,0,1,0,216,135.34,8,8,0,0,1,232,136.66ZM120,72v56a8,8,0,0,0,8,8h56a8,8,0,0,0,0-16H136V72a8,8,0,0,0-16,0Zm40-24a12,12,0,1,0-12-12A12,12,0,0,0,160,48Zm36,24a12,12,0,1,0-12-12A12,12,0,0,0,196,72Zm24,36a12,12,0,1,0-12-12A12,12,0,0,0,220,108Z"></path>
              </svg>
              Nouveautés
            </div>
            <Link className="underline" href={"/explore?sortBy=newest" as any}>{t('nav.seeMore')}</Link>
          </header>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 scroll-mt-32">
            {getNewGames().length === 0 ? (
              <div className="col-span-full text-center py-8">
                <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-star text-2xl text-white"></i>
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Aucune nouveauté</h3>
                <p className="text-gray-400">Aucun jeu avec le badge "Nouveauté" n'a été trouvé</p>
              </div>
            ) : (
              getNewGames().slice(0, 4).map((game, index) => (
              <Card
                key={game.id}
                as={Link}
                      href={generateGameUrl(game.id, game.title) as any}
                className="flex flex-col relative overflow-hidden h-auto text-foreground box-border bg-content1 outline-solid outline-transparent shadow-medium rounded-large cursor-pointer transition-transform-background hover:scale-[0.98] min-w-[326px]"
                isPressable
              >
                <CardBody className="relative flex w-full flex-auto flex-col h-auto p-0">
                  {/* Badges du haut */}
                  <div className="absolute top-4 right-4 z-20 flex gap-2">
                    {/* Badges de jeu de la DB */}
                    {game.badges && game.badges.map((badge) => (
                      <Chip 
                        key={badge.id}
                        size="sm" 
                        variant="shadow" 
                        startContent={<span dangerouslySetInnerHTML={{ __html: badge.icon }} />}
                        className={`${
                          badge.name === 'nouveaute' ? 'bg-gradient-to-r from-red-500 to-pink-600' :
                          badge.name === 'mise-a-jour' ? 'bg-gradient-to-r from-orange-500 to-yellow-600' :
                          badge.name === 'exclusif' ? 'bg-gradient-to-r from-purple-500 to-indigo-600' :
                          'bg-gradient-to-r from-blue-500 to-purple-600'
                        } text-white font-semibold`}
                      >
                        {badge.display_name}
                      </Chip>
                    ))}
                  </div>
                  <img 
                    loading="lazy" 
                    alt={game.title} 
                    className="z-10 h-[161px] object-cover" 
                    src={game.banner_url || "https://via.placeholder.com/326x161"}
                  />
                  <div className="flex flex-col gap-1 px-5 py-2">
                    <img 
                      alt={game.title} 
                      loading="lazy" 
                      className="absolute bottom-0 left-0 opacity-65 blur-2xl" 
                      src={game.banner_url || "https://via.placeholder.com/326x161"}
                    />
                    <h2 className="z-10 truncate text-xl">{game.title}</h2>
                    <div className="flex gap-1 text-sm">
                        <div className="flex flex-col relative overflow-hidden h-auto text-foreground box-border bg-content1 outline-solid outline-transparent shadow-medium rounded-large transition-transform-background motion-reduce:transition-none" tabIndex={-1}>
                          <div className="relative flex w-full p-3 flex-auto flex-col justify-center px-2 py-1">
                            {getPlatformIcon(game.platform)}
                          </div>
                        </div>
                        <div className="flex flex-col relative overflow-hidden h-auto text-foreground box-border bg-content1 outline-solid outline-transparent shadow-medium rounded-large transition-transform-background motion-reduce:transition-none" tabIndex={-1}>
                          <div className="relative flex w-full p-3 flex-auto flex-row items-center gap-1 px-2 py-1">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256">
                            <path d="M247.31,124.76c-.35-.79-8.82-19.58-27.65-38.41C194.57,61.26,162.88,48,128,48S61.43,61.26,36.34,86.35C17.51,105.18,9,124,8.69,124.76a8,8,0,0,0,0,6.5c.35.79,8.82,19.57,27.65,38.4C61.43,194.74,93.12,208,128,208s66.57-13.26,91.66-38.34c18.83-18.83,27.3-37.61,27.65-38.4A8,8,0,0,0,247.31,124.76ZM128,192c-30.78,0-57.67-11.19-79.93-33.25A133.47,133.47,0,0,1,25,128A133.33,133.33,0,0,1,48.07,97.25C70.33,75.19,97.22,64,128,64s57.67,11.19,79.93,33.25A133.46,133.46,0,0,1,231.05,128C223.84,141.46,192.43,192,128,192Zm0-112a48,48,0,1,0,48,48A48.05,48.05,0,0,0,128,80Zm0,80a32,32,0,1,1,32-32A32,32,0,0,1,128,160Z"></path>
                          </svg>
                          {game.views || 0}
                        </div>
                        </div>
                        <div className="flex flex-col relative overflow-hidden h-auto text-foreground box-border bg-content1 outline-solid outline-transparent shadow-medium rounded-large transition-transform-background motion-reduce:transition-none" tabIndex={-1}>
                          <div className="relative flex w-full p-3 flex-auto flex-row items-center gap-1 px-2 py-1 text-nowrap">
                            {game.access_level === 'free' ? (
                              <>
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256">
                                  <path d="M128,24A104,104,0,1,0,232,128,104.13,104.13,0,0,0,128,24Zm40,112H136v32a8,8,0,0,1-16,0V136H88a8,8,0,0,1,0-16h32V88a8,8,0,0,1,16,0v32h32a8,8,0,0,1,0,16Z"></path>
                                </svg>
                                Gratuit
                              </>
                            ) : (
                              <>
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256">
                                  <path d="M183.89,153.34a57.6,57.6,0,0,1-46.56,46.55A8.75,8.75,0,0,1,136,200a8,8,0,0,1-1.32-15.89c16.57-2.79,30.63-16.85,33.44-33.45a8,8,0,0,1,15.78,2.68ZM216,144a88,88,0,0,1-176,0c0-27.92,11-56.47,32.66-84.85a8,8,0,0,1,11.93-.89l24.12,23.41,22-60.41a8,8,0,0,1,12.63-3.41C165.21,36,216,84.55,216,144Zm-16,0c0-46.09-35.79-85.92-58.21-106.33L119.52,98.74a8,8,0,0,1-13.09,3L80.06,76.16C64.09,99.21,56,122,56,144a72,72,0,0,0,144,0Z"></path>
                                </svg>
                                Plus
                              </>
                            )}
                          </div>
                        </div>
                    </div>
                  </div>
                </CardBody>
              </Card>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  )
}

