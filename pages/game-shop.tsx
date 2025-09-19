import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import GamesGrid, { Game, GameBadge as GameBadgeType, Category, getPlatformIcon, getCategoryName } from '../components/games/games-grid'

// Importation HeroUI pour le style Koalyx
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Input,
  Select,
  SelectItem,
  Chip,
  Spinner,
  Pagination,
  Image,
  Skeleton,
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  NavbarMenuToggle,
  NavbarMenu,
  NavbarMenuItem,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Avatar
} from "@heroui/react"

// Import du hook d'authentification de Croissant
import useAuth from '../hooks/useAuth'
import useUserCache from '../hooks/useUserCache'
import Certification from '../components/common/Certification'

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

// Interface pour les données aléatoires
interface RandomGameData {
  gameId: string
  badges?: GameBadgeType[]
  views: number
  platform: string
  price?: number
  discount_price?: number
}


function GameShopContent() {
  const router = useRouter()
  const { search, categoryId } = router.query
  const { getUser: getUserFromCache } = useUserCache()
  
  // Fonction de traduction simple pour la démo
  const t = (key: string, options?: any) => {
    const translations: Record<string, string> = {
      'games.searchPlaceholder': 'Rechercher un jeu...',
      'games.resultsFound': `${options?.count || 0} jeu trouvé`,
      'games.resultsFoundPlural': `${options?.count || 0} jeux trouvés`,
      'games.noResults': 'Aucun jeu trouvé',
      'games.noResultsDesc': 'Aucun jeu ne correspond à vos critères de recherche',
      'games.resetFilters': 'Réinitialiser les filtres',
      'games.sortBy': 'Trier par',
      'games.newest': 'Plus récent',
      'games.oldest': 'Plus ancien',
      'games.name': 'Nom (A-Z)',
      'games.gameYear': 'Année'
    }
    return translations[key] || key
  }
  
  const [games, setGames] = useState<Game[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [platforms, setPlatforms] = useState<string[]>([])
  const [years, setYears] = useState<number[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedPlatform, setSelectedPlatform] = useState('')
  const [selectedYear, setSelectedYear] = useState('')
  const [sortBy, setSortBy] = useState('newest')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [displayedGamesCount, setDisplayedGamesCount] = useState(15)
  const [hasReachedEnd, setHasReachedEnd] = useState(false)
  const [randomData, setRandomData] = useState<Record<string, RandomGameData>>({})
  const [ownerInfoMap, setOwnerInfoMap] = useState<Record<string, any>>({})

  // Composant Skeleton pour le chargement avec style Koalyx
  const GameShopSkeleton = () => (
    <div className="bg-background text-foreground font-sans relative min-h-screen flex flex-col">
      {/* Background Koalyx style - pixel perfect */}
      <div
        className="absolute h-screen w-full bg-main-overlay max-md:mask-b-from-10% max-md:mask-b-to-70% md:mask-radial-from-10% md:mask-radial-to-70% md:mask-radial-at-top"
        style={{ inset: 0 as unknown as number }}
      />

      {/* Barre de recherche et navigation en état chargement */}
      <div className="relative z-10 w-full max-w-[1400px] mx-auto px-3 py-10">
        <section className="flex items-center">
          <div className="flex w-full flex-col gap-8">
            <div className="flex items-center gap-2 sm:gap-6">
              <form className="max-sm:w-full">
                <Skeleton className="h-10 w-72 rounded-medium" />
              </form>
              <div className="flex items-center gap-6 max-sm:hidden">
                <Skeleton className="h-4 w-16 rounded" />
                <Skeleton className="h-4 w-20 rounded" />
                <div className="shrink-0 bg-divider border-none w-px h-[20px]" role="separator"></div>
                <Skeleton className="h-4 w-12 rounded" />
              </div>
            </div>
          </div>
        </section>
      </div>

      <div className="flex-1 flex flex-col">
        <main className="z-10 w-full max-w-[1400px] flex-1 px-3 py-10 flex flex-col gap-8" style={{ margin: '0 auto' }}>
          <div className="flex gap-6 max-xl:flex-col-reverse">
            {/* Section principale */}
            <section className="flex w-full flex-col gap-6">
              {/* Grille jeux skeleton avec shimmer effect */}
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:col-span-3 xl:grid-cols-3">
                {Array.from({ length: 6 }).map((_, index) => (
                  <Skeleton key={index} className="h-[280px] w-full rounded-xl" />
                ))}
              </div>
            </section>
            
            {/* Sidebar à droite avec spinner de chargement */}
            <aside className="flex w-full flex-col gap-4 xl:max-w-[326px]">
              <div className="flex justify-center items-center p-8">
                <div className="flex flex-col items-center gap-3">
                  <Spinner size="lg" />
                  <span className="text-sm text-default-500">Chargement des données...</span>
                </div>
              </div>
            </aside>
          </div>
        </main>
          </div>
        </div>
  )

  useEffect(() => {
    fetchGamesAndFilters()
  }, [])

  // Gérer les paramètres de l'URL
  useEffect(() => {
    if (search && typeof search === 'string') {
      setSearchTerm(decodeURIComponent(search))
    }
    
    if (categoryId && typeof categoryId === 'string') {
      setSelectedCategory(categoryId)
    }
  }, [search, categoryId])

  const fetchGamesAndFilters = async () => {
    try {
      setLoading(true)
      console.log('🔄 Chargement des jeux et filtres...')

      // Récupération des jeux directement depuis l'API existante
      const gamesRes = await fetch('/api/games', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      console.log('📦 Réponse games:', gamesRes.status, gamesRes.ok)

      if (gamesRes.ok) {
        const gamesData = await gamesRes.json();
        console.log('🎮 Données games reçues:', gamesData)
        
        if (Array.isArray(gamesData)) {
          console.log('✅ Jeux chargés:', gamesData.length)
          
          // Enrichir les jeux avec les infos studio
          const enrichedGames = await Promise.all(gamesData.map(async (game: any) => {
            // Récupérer les infos du studio/propriétaire si disponible
            let studioInfo = null
            if (game.owner_id) {
              try {
                studioInfo = await getUserFromCache(game.owner_id)
                if (studioInfo) {
                  setOwnerInfoMap(prev => ({ ...prev, [game.owner_id]: studioInfo }))
                }
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
              // Données de l'API
              badges: game.badges || [],
              views: game.views?.total_views || 0,
              platform: game.platform || 'Windows',
              price: game.price || 0,
              discount_price: game.discount_price,
              trailer_link: game.trailer_link,
              // Studio
              studio: studioInfo ? {
                id: studioInfo.id,
                username: studioInfo.username,
                verified: studioInfo.verified,
                certification: studioInfo.certification,
                avatar: `/avatar/${studioInfo.id}`
              } : null,
              // Données originales de Croissant
              gameId: game.gameId,
              name: game.name,
              rating: game.rating,
              genre: game.genre,
              bannerHash: game.bannerHash,
              iconHash: game.iconHash,
              owner_id: game.owner_id
            }
          }))
          
          setGames(enrichedGames);
        } else {
          console.log('❌ Format de données games incorrect, pas un tableau:', gamesData)
          setGames([])
        }
      } else {
        console.log('❌ Erreur API games:', gamesRes.status)
        setGames([])
      }

      // Récupération des catégories (si nécessaire)
      try {
        const categoriesRes = await fetch('/api/categories')
        if (categoriesRes.ok) {
          const catData = await categoriesRes.json();
          console.log('📂 Données categories reçues:', catData)
          if (catData.success && catData.data) {
            setCategories(catData.data.categories || []);
            const allPlatforms = catData.data.platforms || [];
            const filteredPlatforms = allPlatforms.filter((platform: string) => {
              const lowerPlatform = platform.toLowerCase();
              return !lowerPlatform.includes('windows 10') && 
                     !lowerPlatform.includes('windows 11') && 
                     !lowerPlatform.includes('macos') && 
                     !lowerPlatform.includes('mac os');
            });
            setPlatforms(['Toutes les plateformes', ...filteredPlatforms]);
            setYears(catData.data.years || []);
          }
        } else {
          // Catégories de test
          setCategories([
            { id: 1, name: 'Action', type: 'action' },
            { id: 2, name: 'Aventure', type: 'aventure' },
            { id: 3, name: 'RPG', type: 'rpg' }
          ])
          setPlatforms(['Toutes les plateformes', 'Windows', 'Mac', 'Linux'])
        }
      } catch (error) {
        console.error('Erreur lors du chargement des catégories:', error)
        setCategories([{ id: 1, name: 'Action', type: 'action' }])
        setPlatforms(['Toutes les plateformes', 'Windows'])
      }
    } catch (error) {
      console.error('❌ Erreur lors du chargement des données:', error)
      setGames([])
      setCategories([{ id: 1, name: 'Action', type: 'action' }])
      setPlatforms(['Toutes les plateformes', 'Windows'])
    } finally {
      setLoading(false)
      console.log('✅ Chargement terminé')
    }
  }

  const filteredGames = games.filter(game => {
    return (
      (game.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
       game.description.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (!selectedCategory || game.category_id === parseInt(selectedCategory)) &&
      (!selectedPlatform || selectedPlatform === 'Toutes les plateformes' || game.platform === selectedPlatform) &&
      (!selectedYear || game.year === parseInt(selectedYear))
    );
  });

  const sortedGames = [...filteredGames].sort((a, b) => {
    switch (sortBy) {
      case 'newest': return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      case 'oldest': return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      case 'name': return a.title.localeCompare(b.title)
      case 'year': return b.year - a.year
      default: return 0
    }
  });

  const currentGames = sortedGames.slice(0, displayedGamesCount)
  const canLoadMore = displayedGamesCount < sortedGames.length

  // Fonction pour charger plus de jeux
  const loadMoreGames = () => {
    const newCount = Math.min(displayedGamesCount + 15, sortedGames.length)
    setDisplayedGamesCount(newCount)
    
    if (newCount >= sortedGames.length && sortedGames.length > 0) {
      setHasReachedEnd(true)
    }
  }

  // Reset quand les filtres changent
  useEffect(() => {
    setDisplayedGamesCount(15)
    setHasReachedEnd(false)
  }, [searchTerm, selectedCategory, selectedPlatform, selectedYear, sortBy])

  // Scroll infini
  useEffect(() => {
    const handleScroll = () => {
      if (hasReachedEnd || loading) return

      const scrollTop = window.pageYOffset || document.documentElement.scrollTop
      const windowHeight = window.innerHeight
      const documentHeight = document.documentElement.scrollHeight

      if (scrollTop + windowHeight >= documentHeight - 100) {
        if (canLoadMore && sortedGames.length > displayedGamesCount) {
          loadMoreGames()
        }
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [canLoadMore, displayedGamesCount, sortedGames.length, hasReachedEnd, loading, loadMoreGames])

  if (loading) {
    return <GameShopSkeleton />
  }

  return (
    <div className="bg-background text-foreground font-sans relative min-h-screen flex flex-col">
      {/* Background Koalyx style - pixel perfect */}
      <div
        className="absolute h-screen w-full bg-main-overlay max-md:mask-b-from-10% max-md:mask-b-to-70% md:mask-radial-from-10% md:mask-radial-to-70% md:mask-radial-at-top"
        style={{ inset: 0 as unknown as number }}
      />

      {/* Barre de recherche et navigation avec style Koalyx */}
      <div className="relative z-10 w-full max-w-[1400px] mx-auto px-3 py-10">
        <section className="flex items-center">
          <div className="flex w-full flex-col gap-8">
            <div className="flex items-center gap-2 sm:gap-6">
              {/* Formulaire de recherche */}
              <form className="max-sm:w-full" onSubmit={(e) => e.preventDefault()}>
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
                          placeholder="Rechercher un jeu..."
                          tabIndex={0} 
                          type="text"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          title=""
                        />
          </div>
        </div>
      </div>
                </div>
              </form>
              
              <div className="flex items-center gap-6 max-sm:hidden">
                <Link className="text-default-500" href="/">Accueil</Link>
                <Link className={!selectedCategory ? "text-foreground" : "text-default-500"} href="/game-shop">Jeux</Link>
                <div className="shrink-0 bg-divider border-none w-px h-[20px]" role="separator"></div>
                <Link className={selectedCategory === '1' ? "text-foreground" : "text-default-500"} href="/game-shop?categoryId=1">Action</Link>
                <Link className={selectedCategory === '2' ? "text-foreground" : "text-default-500"} href="/game-shop?categoryId=2">Aventure</Link>
                <Link className={selectedCategory === '3' ? "text-foreground" : "text-default-500"} href="/game-shop?categoryId=3">RPG</Link>
              </div>
          </div>
          </div>
        </section>
      </div>

      {/* Contenu principal */}
      <div className="flex-1 flex flex-col">
        <main className="z-10 w-full max-w-[1400px] flex-1 px-3 pb-10" style={{ margin: '0 auto' }}>
          <div className="flex flex-col xl:flex-row gap-6">
            {/* Contenu principal - maintenant à gauche */}
            <section className="flex-1 flex flex-col gap-6">
              {/* barre d'outils (compteur + tri + mode vue) */}
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <Chip color="primary" variant="shadow" className="bg-gradient-to-r from-blue-500 to-purple-600">
                  {t(filteredGames.length > 1 ? 'games.resultsFoundPlural' : 'games.resultsFound', { count: filteredGames.length })}
                </Chip>

                <div className="flex items-center gap-4">
                  <Select
                    aria-label={t('games.sortBy')}
                    selectedKeys={[sortBy]}
                    onSelectionChange={(keys) => setSortBy(Array.from(keys)[0] as string)}
                    variant="bordered"
                    className="w-48"
                    classNames={{ label: "text-white", trigger: "text-white", value: "text-white" }}
                  >
                    <SelectItem key="newest" startContent={<i className="fas fa-arrow-down-wide-short" />} className="text-white">{t('games.newest')}</SelectItem>
                    <SelectItem key="oldest" startContent={<i className="fas fa-arrow-up-wide-short" />} className="text-white">{t('games.oldest')}</SelectItem>
                    <SelectItem key="name" startContent={<i className="fas fa-font" />} className="text-white">{t('games.name')}</SelectItem>
                    <SelectItem key="year" startContent={<i className="fas fa-calendar-days" />} className="text-white">{t('games.gameYear')}</SelectItem>
                  </Select>

                  <div className="flex border border-white/20 rounded-xl p-1">
                    <Button
                      isIconOnly
                      variant={viewMode === 'grid' ? 'flat' : 'light'}
                      onPress={() => setViewMode('grid')}
                      className={viewMode === 'grid' ? 'bg-white/10' : ''}
                    >
                      <i className="fas fa-th-large"></i>
                    </Button>
                    <Button
                      isIconOnly
                      variant={viewMode === 'list' ? 'flat' : 'light'}
                      onPress={() => setViewMode('list')}
                      className={viewMode === 'list' ? 'bg-white/10' : ''}
                    >
                      <i className="fas fa-bars"></i>
                    </Button>
            </div>
          </div>
        </div>

              {/* GRILLE / LISTE des jeux avec les nouvelles données */}
              <GamesGrid
                games={currentGames}
                categories={categories}
                viewMode={viewMode}
                showNewBadge={true}
                emptyStateIcon="fas fa-ghost"
                emptyStateTitle={t('games.noResults')}
                emptyStateDescription={t('games.noResultsDesc')}
              />

              {/* Indicateur de chargement pour le scroll infini */}
              {canLoadMore && sortedGames.length > displayedGamesCount && (
                <div className="flex justify-center mt-6">
                  <div className="flex items-center gap-2 text-default-500">
                    <div className="animate-spin w-4 h-4 border-2 border-primary border-t-transparent rounded-full"></div>
                    <span className="text-sm">Chargement automatique...</span>
          </div>
        </div>
      )}

              {/* Message de fin */}
              {hasReachedEnd && sortedGames.length > 0 && (
                <div className="flex flex-col items-center justify-center mt-10 p-8 text-center">
                  <div className="flex items-center gap-3 mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" viewBox="0 0 256 256" className="text-green-500">
                      <path d="M243.31,90.91l-128.4,128.4a16,16,0,0,1-22.62,0l-71.62-71.62a16,16,0,0,1,0-22.63l20-20a16,16,0,0,1,22.58,0L104,144.22l96.76-95.57a16,16,0,0,1,22.59,0l19.95,19.54A16,16,0,0,1,243.31,90.91Z"></path>
                    </svg>
                    <h3 className="text-xl font-bold text-green-500">Bravo !</h3>
                  </div>
                  <p className="text-default-600">
                    🎉 Tu es arrivé à la fin de la page ! Tu as exploré tous les {sortedGames.length} jeux disponibles.
                  </p>
    </div>
              )}

              {/* Bouton de réinitialisation pour l'état vide */}
              {currentGames.length === 0 && (searchTerm || selectedCategory || selectedPlatform || selectedYear) && (
                <div className="flex justify-center mt-6">
                  <Button
                    color="primary"
                    variant="shadow"
                    className="bg-gradient-to-r from-blue-500 to-purple-600"
                    onPress={() => {
                      setSearchTerm('');
                      setSelectedCategory('');
                      setSelectedPlatform('');
                      setSelectedYear('');
                      setDisplayedGamesCount(15);
                      setHasReachedEnd(false);
                    }}
                    startContent={<i className="fas fa-sync-alt" />}
                  >
                    {t('games.resetFilters')}
                  </Button>
        </div>
              )}
            </section>
            
            {/* Sidebar de filtres à droite */}
            <aside className="flex w-full flex-col gap-4 xl:max-w-[326px]">
              {/* Card Filtres */}
              <Card className="bg-content1 shadow-medium">
                <CardHeader className="flex gap-2 text-xl">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 256 256">
                    <path d="M230.6,49.53A15.81,15.81,0,0,0,216,40H40A16,16,0,0,0,28.19,66.76l.08.09L96,139.17V216a16,16,0,0,0,24.87,13.32l32-21.34A16,16,0,0,0,160,194.66V139.17l67.74-72.32.08-.09A15.8,15.8,0,0,0,230.6,49.53ZM40,56h0Zm106.18,74.58A8,8,0,0,0,144,136v58.66L112,216V136a8,8,0,0,0-2.16-5.47L40,56H216Z"></path>
                  </svg>
                  Filtres
                </CardHeader>
                <CardBody className="gap-4">
                  {/* Filtres de catégorie */}
                  <div>
                    <span className="text-foreground-500 text-sm mb-2 block">Catégorie</span>
                    <div className="flex flex-col gap-2">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input 
                          type="radio" 
                          name="category"
                          value="" 
                          checked={selectedCategory === ''} 
                          onChange={(e) => setSelectedCategory(e.target.value)}
                          className="text-primary"
                        />
                        <span>Tout</span>
                      </label>
                      {categories.map((category) => (
                        <label key={category.id} className="flex items-center gap-2 cursor-pointer">
                          <input 
                            type="radio" 
                            name="category"
                            value={category.id.toString()} 
                            checked={selectedCategory === category.id.toString()} 
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="text-primary"
                          />
                          <span>{category.name}</span>
                        </label>
          ))}
        </div>
      </div>

                  {/* Filtres de plateforme */}
                  <div>
                    <span className="text-foreground-500 text-sm mb-2 block">Plateforme</span>
                    <div className="flex flex-col gap-2">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input 
                          type="radio" 
                          name="platform"
                          value="" 
                          checked={selectedPlatform === ''} 
                          onChange={(e) => setSelectedPlatform(e.target.value)}
                          className="text-primary"
                        />
                        <span>Tout</span>
                      </label>
                      {platforms.slice(1).map((platform) => (
                        <label key={platform} className="flex items-center gap-2 cursor-pointer">
                          <input 
                            type="radio" 
                            name="platform"
                            value={platform} 
                            checked={selectedPlatform === platform} 
                            onChange={(e) => setSelectedPlatform(e.target.value)}
                            className="text-primary"
                          />
                          <span>{platform}</span>
                        </label>
            ))}
          </div>
          </div>
                </CardBody>
              </Card>
            </aside>
          </div>
        </main>
      </div>
    </div>
  )
}

export default function GameShop() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <GameShopContent />
    </Suspense>
  )
}