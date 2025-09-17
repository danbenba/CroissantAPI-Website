"use client"

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import Navigation from '@/components/navigation'
import Footer from '@/components/footer'
import GameBadge from '@/components/game-badge'
import GamesGrid, { Game, GameBadge as GameBadgeType, Category, getPlatformIcon, getCategoryName } from '@/components/games-grid'
import { useLanguage } from '@/contexts/LanguageContext'
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
  Skeleton
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

function GamesPageContent() {
  const searchParams = useSearchParams()
  const { t } = useLanguage()
  const [games, setGames] = useState<Game[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [platforms, setPlatforms] = useState<string[]>([])
  const [years, setYears] = useState<number[]>([])
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedPlatform, setSelectedPlatform] = useState('')
  const [selectedYear, setSelectedYear] = useState('')
  const [sortBy, setSortBy] = useState('newest')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [displayedGamesCount, setDisplayedGamesCount] = useState(15) // Commencer avec 15 jeux
  const [hasReachedEnd, setHasReachedEnd] = useState(false)

  // --- Composant Skeleton pour le chargement ---
  const GamesPageSkeleton = () => (
    <div className="min-h-screen bg-background text-foreground font-sans relative flex flex-col">
      <Navigation />

      {/* Barre de recherche et navigation en état chargement */}
      <div className="relative z-10 w-full max-w-[1400px] mx-auto px-3 py-10">
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
                          placeholder="Rechercher une application..." 
                          tabIndex={0} 
                          type="text" 
                          defaultValue=""
                          title=""
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </form>
              
              {/* Navigation horizontale */}
              <div className="flex items-center gap-6 max-sm:hidden">
                <Link className="text-default-500" href="/">Accueil</Link>
                <Link className="text-foreground" href={"/explore" as any}>Applications</Link>
                <div className="shrink-0 bg-divider border-none w-px h-[20px]" role="separator"></div>
                <Link className="text-default-500" href={"/explore?categoryId=1" as any}>Tools</Link>
                <Link className="text-default-500" href={"/explore?categoryId=2" as any}>OS</Link>
                <Link className="text-default-500" href={"/explore?categoryId=3" as any}>Kits</Link>
              </div>
            </div>
          </div>
        </section>
      </div>

      <div className="flex-1 flex flex-col">
        <div className="absolute h-screen w-full bg-main-overlay max-md:mask-b-from-10% max-md:mask-b-to-70% md:mask-radial-from-10% md:mask-radial-to-70% md:mask-radial-at-top" style={{ inset: 0 as unknown as number }}></div>

        <main className="z-10 w-full max-w-[1400px] flex-1 px-3 py-10 flex flex-col gap-8" style={{ margin: '0 auto' }}>
          {/* Barre de recherche et navigation skeleton */}
          <div className="flex items-center gap-2 sm:gap-6">
            {/* Barre de recherche skeleton */}
            <form className="max-sm:w-full">
              <div className="group flex flex-col relative justify-end w-fit">
                <div className="h-full flex flex-col">
                  <div className="relative w-full inline-flex tap-highlight-transparent flex-row items-center shadow-xs px-3 gap-3 bg-default-100 h-10 min-h-10 rounded-medium transition-background motion-reduce:transition-none !duration-150 outline-solid outline-transparent">
                    <div className="inline-flex w-full items-center h-full box-border">
                      <div className="h-4 w-4 bg-default-200 rounded animate-pulse"></div>
                      <div className="h-4 w-32 bg-default-200 rounded animate-pulse ml-2"></div>
                    </div>
                  </div>
                </div>
              </div>
            </form>
            
            {/* Navigation skeleton */}
            <div className="flex items-center gap-6 max-sm:hidden">
              <div className="h-4 w-16 bg-default-200 rounded animate-pulse"></div>
              <div className="h-4 w-20 bg-default-200 rounded animate-pulse"></div>
              <div className="shrink-0 bg-divider border-none w-divider h-[20px]" role="separator"></div>
              <div className="h-4 w-12 bg-default-200 rounded animate-pulse"></div>
              <div className="h-4 w-20 bg-default-200 rounded animate-pulse"></div>
              <div className="h-4 w-8 bg-default-200 rounded animate-pulse"></div>
            </div>
            
            {/* Bouton mobile skeleton */}
            <div className="group relative inline-flex items-center justify-center box-border appearance-none select-none whitespace-nowrap font-normal overflow-hidden tap-highlight-transparent transform-gpu cursor-pointer outline-solid outline-transparent px-4 min-w-20 h-10 text-small gap-2 rounded-medium transition-transform-colors-opacity motion-reduce:transition-none bg-transparent text-default-foreground w-full sm:hidden">
              <div className="h-4 w-20 bg-default-200 rounded animate-pulse"></div>
              <div className="h-4 w-4 bg-default-200 rounded animate-pulse"></div>
            </div>
          </div>

          <div className="flex gap-6 max-xl:flex-col-reverse">
            {/* Section principale */}
            <section className="flex w-full flex-col gap-6">
              {/* Grille jeux skeleton avec shimmer effect */}
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:col-span-3 xl:grid-cols-3">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div key={index} className="group relative overflow-hidden bg-content3 dark:bg-content2 pointer-events-none before:opacity-100 before:absolute before:inset-0 before:-translate-x-full before:animate-shimmer before:border-t before:border-content4/30 before:bg-gradient-to-r before:from-transparent before:via-content4 dark:before:via-default-700/10 before:to-transparent after:opacity-100 after:absolute after:inset-0 after:-z-10 after:bg-content3 dark:after:bg-content2 transition-background !duration-300 rounded-xl">
                    <div className="opacity-0 transition-opacity motion-reduce:transition-none !duration-300">
                      <div className="h-[237px] w-[326px]"></div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Bouton fin de page skeleton */}
              <button data-disabled="true" type="button" className="z-0 group relative inline-flex items-center justify-center box-border appearance-none select-none whitespace-nowrap font-normal subpixel-antialiased overflow-hidden tap-highlight-transparent transform-gpu cursor-pointer outline-solid outline-transparent px-3 min-w-16 h-8 text-tiny gap-2 rounded-small opacity-disabled pointer-events-none transition-transform-colors-opacity motion-reduce:transition-none bg-primary text-primary-foreground">
                <div className="h-4 w-4 bg-primary-foreground/20 rounded animate-pulse"></div>
                <div className="h-3 w-32 bg-primary-foreground/20 rounded animate-pulse"></div>
              </button>
            </section>
            
            {/* Sidebar à droite avec spinner de chargement */}
            <aside className="flex w-full flex-col gap-4 xl:max-w-[326px]">
              <div className="flex justify-center items-center p-8">
                <div className="flex flex-col items-center gap-3">
                  <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
                  <span className="text-sm text-default-500">Chargement des catégories...</span>
                </div>
              </div>
            </aside>
          </div>
        </main>
      </div>
      
      <Footer />
    </div>
  )

  useEffect(() => {
    fetchGamesAndFilters()
    fetchArticles()
  }, [])

  // Gérer les paramètres de l'URL
  useEffect(() => {
    const searchParam = searchParams.get('search')
    const categoryParam = searchParams.get('categoryId')
    
    if (searchParam) {
      setSearchTerm(decodeURIComponent(searchParam))
    }
    
    if (categoryParam) {
      setSelectedCategory(categoryParam)
    }
  }, [searchParams])

  const fetchGamesAndFilters = async () => {
    try {
      setLoading(true)
      const [gamesRes, categoriesRes] = await Promise.all([
        fetch('/api/games?limit=1700'),
        fetch('/api/categories')
      ]);

      if (gamesRes.ok) {
        const gamesData = await gamesRes.json();
        if (gamesData.success && Array.isArray(gamesData.games)) {
          setGames(gamesData.games);
        }
      }

      if (categoriesRes.ok) {
        const catData = await categoriesRes.json();
        if (catData.success && catData.data) {
          setCategories(catData.data.categories || []);
          // Filtrer les plateformes pour éviter les doublons et garder les principales
          const allPlatforms = catData.data.platforms || [];
          const filteredPlatforms = allPlatforms.filter((platform: string) => {
            // Garder seulement les plateformes principales, éviter les variantes
            const lowerPlatform = platform.toLowerCase();
            return !lowerPlatform.includes('windows 10') && 
                   !lowerPlatform.includes('windows 11') && 
                   !lowerPlatform.includes('macos') && 
                   !lowerPlatform.includes('mac os');
          });
          // Ajouter "Toutes les plateformes" en premier puis les plateformes filtrées
          setPlatforms(['Toutes les plateformes', ...filteredPlatforms]);
          setYears(catData.data.years || []);
        }
      }
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchArticles = async () => {
    try {
      const response = await fetch('/api/articles?limit=4&status=publie')
      if (response.ok) {
        const data = await response.json()
        if (data.success && data.data) {
          setArticles(data.data.articles || [])
        }
      }
    } catch (error) {
      console.error('Erreur lors du chargement des articles:', error)
    }
  }

  // Fonctions utilitaires pour les articles
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('fr-FR', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
  }

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + '...'
  }

  // Fonctions utilitaires déplacées dans le composant GamesGrid

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
    
    // Vérifier si on a atteint la fin (seulement si on a vraiment affiché tous les jeux)
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

      // Déclencher le chargement quand on est à 100px du bas
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
    return <GamesPageSkeleton />
  }

  return (
    <div
      className="min-h-screen bg-background text-foreground font-sans relative flex flex-col"
      style={{}}
    >
      {/* Navigation */}
      <Navigation />

      {/* Barre de recherche et navigation */}
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
                          placeholder={t('games.searchPlaceholder')}
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
                <Link className="text-default-500" href="/">{t('nav.home')}</Link>
                <Link className={!selectedCategory ? "text-foreground" : "text-default-500"} href={"/explore" as any}>{t('nav.games')}</Link>
                <div className="shrink-0 bg-divider border-none w-px h-[20px]" role="separator"></div>
                <Link className={selectedCategory === '1' ? "text-foreground" : "text-default-500"} href={"/explore?categoryId=1" as any}>Tools</Link>
                <Link className={selectedCategory === '2' ? "text-foreground" : "text-default-500"} href={"/explore?categoryId=2" as any}>OS</Link>
                <Link className={selectedCategory === '3' ? "text-foreground" : "text-default-500"} href={"/explore?categoryId=3" as any}>Kits</Link>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Contenu principal */}
      <div className="flex-1 flex flex-col">

      {/* voile violet en arrière-plan, calqué sur la page HTML */}
      <div
        className="absolute h-screen w-full bg-main-overlay max-md:mask-b-from-10% max-md:mask-b-to-70% md:mask-radial-from-10% md:mask-radial-to-70% md:mask-radial-at-top"
        style={{ inset: 0 as unknown as number }}
      />

      {/* Contenu principal */}
        <main
          className="z-10 w-full max-w-[1400px] flex-1 px-3 pb-10"
          style={{ margin: '0 auto' }}
        >
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

          {/* GRILLE / LISTE des jeux */}
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
          <div className="flex flex-col relative overflow-hidden h-auto text-foreground box-border bg-content1 outline-solid outline-transparent data-[focus-visible=true]:z-10 data-[focus-visible=true]:outline-2 data-[focus-visible=true]:outline-focus data-[focus-visible=true]:outline-offset-2 shadow-medium rounded-large transition-transform-background motion-reduce:transition-none p-2" tabIndex={-1}>
            <div className="flex p-3 z-10 w-full justify-start items-center shrink-0 overflow-inherit color-inherit subpixel-antialiased rounded-t-large gap-2 text-xl">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 256 256">
                <path d="M230.6,49.53A15.81,15.81,0,0,0,216,40H40A16,16,0,0,0,28.19,66.76l.08.09L96,139.17V216a16,16,0,0,0,24.87,13.32l32-21.34A16,16,0,0,0,160,194.66V139.17l67.74-72.32.08-.09A15.8,15.8,0,0,0,230.6,49.53ZM40,56h0Zm106.18,74.58A8,8,0,0,0,144,136v58.66L112,216V136a8,8,0,0,0-2.16-5.47L40,56H216Z"></path>
              </svg>
              Filtres
            </div>
            <div className="relative flex w-full p-3 flex-auto flex-col place-content-inherit align-items-inherit h-auto break-words text-left overflow-y-auto subpixel-antialiased gap-2">
              {/* Radio Group Catégorie */}
              <div className="relative flex flex-col gap-2" aria-label="Catégorie" role="radiogroup" aria-orientation="vertical">
                <span className="relative text-foreground-500">Catégorie</span>
                <div className="flex flex-col flex-wrap gap-2 data-[orientation=horizontal]:flex-row" role="presentation" data-orientation="vertical">
                  <label className="group relative max-w-fit inline-flex items-center justify-start cursor-pointer tap-highlight-transparent p-2 -m-2 select-none gap-2" data-selected={selectedCategory === ''}>
                    <input 
                      type="radio" 
                      value="" 
                      checked={selectedCategory === ''} 
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="font-inherit text-[100%] leading-[1.15] m-0 p-0 overflow-visible box-border absolute top-0 w-full h-full opacity-[0.0001] z-[1] cursor-pointer disabled:cursor-default"
                    />
                    <span aria-hidden="true" className="relative inline-flex items-center justify-center shrink-0 overflow-hidden border-solid border-medium box-border border-default rounded-full group-data-[hover-unselected=true]:bg-default-100 outline-solid outline-transparent group-data-[focus-visible=true]:z-10 group-data-[focus-visible=true]:ring-2 group-data-[focus-visible=true]:ring-focus group-data-[focus-visible=true]:ring-offset-2 group-data-[focus-visible=true]:ring-offset-background group-data-[selected=true]:border-primary w-5 h-5 group-data-[pressed=true]:scale-95 transition-transform-colors motion-reduce:transition-none">
                      <span className="z-10 opacity-0 scale-0 origin-center rounded-full group-data-[selected=true]:opacity-100 group-data-[selected=true]:scale-100 bg-primary text-primary-foreground w-2 h-2 transition-transform-opacity motion-reduce:transition-none"></span>
                    </span>
                    <div className="flex flex-col ml-1 ms-2">
                      <span className="relative text-foreground select-none text-medium transition-colors motion-reduce:transition-none">Tout</span>
                    </div>
                  </label>
                  {categories.map((category) => (
                    <label key={category.id} className="group relative max-w-fit inline-flex items-center justify-start cursor-pointer tap-highlight-transparent p-2 -m-2 select-none gap-2" data-selected={selectedCategory === category.id.toString()}>
                      <input 
                        type="radio" 
                        value={category.id.toString()} 
                        checked={selectedCategory === category.id.toString()} 
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="font-inherit text-[100%] leading-[1.15] m-0 p-0 overflow-visible box-border absolute top-0 w-full h-full opacity-[0.0001] z-[1] cursor-pointer disabled:cursor-default"
                      />
                      <span aria-hidden="true" className="relative inline-flex items-center justify-center shrink-0 overflow-hidden border-solid border-medium box-border border-default rounded-full group-data-[hover-unselected=true]:bg-default-100 outline-solid outline-transparent group-data-[focus-visible=true]:z-10 group-data-[focus-visible=true]:ring-2 group-data-[focus-visible=true]:ring-focus group-data-[focus-visible=true]:ring-offset-2 group-data-[focus-visible=true]:ring-offset-background group-data-[selected=true]:border-primary w-5 h-5 group-data-[pressed=true]:scale-95 transition-transform-colors motion-reduce:transition-none">
                        <span className="z-10 opacity-0 scale-0 origin-center rounded-full group-data-[selected=true]:opacity-100 group-data-[selected=true]:scale-100 bg-primary text-primary-foreground w-2 h-2 transition-transform-opacity motion-reduce:transition-none"></span>
                      </span>
                      <div className="flex flex-col ml-1 ms-2">
                        <span className="relative text-foreground select-none text-medium transition-colors motion-reduce:transition-none">{category.name}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Radio Group Plateforme */}
              <div className="relative flex flex-col gap-2" aria-label="Plateforme" role="radiogroup" aria-orientation="vertical">
                <span className="relative text-foreground-500">Plateforme</span>
                <div className="flex flex-col flex-wrap gap-2 data-[orientation=horizontal]:flex-row" role="presentation" data-orientation="vertical">
                  <label className="group relative max-w-fit inline-flex items-center justify-start cursor-pointer tap-highlight-transparent p-2 -m-2 select-none gap-2" data-selected={selectedPlatform === ''}>
                    <input 
                      type="radio" 
                      value="" 
                      checked={selectedPlatform === ''} 
                      onChange={(e) => setSelectedPlatform(e.target.value)}
                      className="font-inherit text-[100%] leading-[1.15] m-0 p-0 overflow-visible box-border absolute top-0 w-full h-full opacity-[0.0001] z-[1] cursor-pointer disabled:cursor-default"
                    />
                    <span aria-hidden="true" className="relative inline-flex items-center justify-center shrink-0 overflow-hidden border-solid border-medium box-border border-default rounded-full group-data-[hover-unselected=true]:bg-default-100 outline-solid outline-transparent group-data-[focus-visible=true]:z-10 group-data-[focus-visible=true]:ring-2 group-data-[focus-visible=true]:ring-focus group-data-[focus-visible=true]:ring-offset-2 group-data-[focus-visible=true]:ring-offset-background group-data-[selected=true]:border-primary w-5 h-5 group-data-[pressed=true]:scale-95 transition-transform-colors motion-reduce:transition-none">
                      <span className="z-10 opacity-0 scale-0 origin-center rounded-full group-data-[selected=true]:opacity-100 group-data-[selected=true]:scale-100 bg-primary text-primary-foreground w-2 h-2 transition-transform-opacity motion-reduce:transition-none"></span>
                    </span>
                    <div className="flex flex-col ml-1 ms-2">
                      <span className="relative text-foreground select-none text-medium transition-colors motion-reduce:transition-none">Tout</span>
                    </div>
                  </label>
                  {platforms.map((platform) => (
                    <label key={platform} className="group relative max-w-fit inline-flex items-center justify-start cursor-pointer tap-highlight-transparent p-2 -m-2 select-none gap-2" data-selected={selectedPlatform === platform}>
                      <input 
                        type="radio" 
                        value={platform} 
                        checked={selectedPlatform === platform} 
                        onChange={(e) => setSelectedPlatform(e.target.value)}
                        className="font-inherit text-[100%] leading-[1.15] m-0 p-0 overflow-visible box-border absolute top-0 w-full h-full opacity-[0.0001] z-[1] cursor-pointer disabled:cursor-default"
                      />
                      <span aria-hidden="true" className="relative inline-flex items-center justify-center shrink-0 overflow-hidden border-solid border-medium box-border border-default rounded-full group-data-[hover-unselected=true]:bg-default-100 outline-solid outline-transparent group-data-[focus-visible=true]:z-10 group-data-[focus-visible=true]:ring-2 group-data-[focus-visible=true]:ring-focus group-data-[focus-visible=true]:ring-offset-2 group-data-[focus-visible=true]:ring-offset-background group-data-[selected=true]:border-primary w-5 h-5 group-data-[pressed=true]:scale-95 transition-transform-colors motion-reduce:transition-none">
                        <span className="z-10 opacity-0 scale-0 origin-center rounded-full group-data-[selected=true]:opacity-100 group-data-[selected=true]:scale-100 bg-primary text-primary-foreground w-2 h-2 transition-transform-opacity motion-reduce:transition-none"></span>
                      </span>
                      <div className="flex flex-col ml-1 ms-2">
                        <span className="relative text-foreground select-none text-medium transition-colors motion-reduce:transition-none">{platform}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Card Trier par */}
          <div className="flex flex-col relative overflow-hidden h-auto text-foreground box-border bg-content1 outline-solid outline-transparent data-[focus-visible=true]:z-10 data-[focus-visible=true]:outline-2 data-[focus-visible=true]:outline-focus data-[focus-visible=true]:outline-offset-2 shadow-medium rounded-large transition-transform-background motion-reduce:transition-none p-2" tabIndex={-1}>
            <div className="flex p-3 z-10 w-full justify-start items-center shrink-0 overflow-inherit color-inherit subpixel-antialiased rounded-t-large gap-2 text-xl">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 256 256">
                <path d="M128,128a8,8,0,0,1-8,8H48a8,8,0,0,1,0-16h72A8,8,0,0,1,128,128ZM48,72H184a8,8,0,0,0,0-16H48a8,8,0,0,0,0,16Zm56,112H48a8,8,0,0,0,0,16h56a8,8,0,0,0,0-16Zm125.66-21.66a8,8,0,0,0-11.32,0L192,188.69V112a8,8,0,0,0-16,0v76.69l-26.34-26.35a8,8,0,0,0-11.32,11.32l40,40a8,8,0,0,0,11.32,0l40-40A8,8,0,0,0,229.66,162.34Z"></path>
              </svg>
              Trier par
            </div>
            <div className="relative flex w-full p-3 flex-auto flex-col place-content-inherit align-items-inherit h-auto break-words text-left overflow-y-auto subpixel-antialiased gap-5">
              <div className="relative flex flex-col gap-2" role="radiogroup" aria-orientation="vertical">
                <div className="flex flex-col flex-wrap gap-2 data-[orientation=horizontal]:flex-row" role="presentation" data-orientation="vertical">
                  <label className="group relative max-w-fit inline-flex items-center justify-start cursor-pointer tap-highlight-transparent p-2 -m-2 select-none gap-2 overflow-x-hidden" data-selected={sortBy === 'newest'}>
                    <input 
                      type="radio" 
                      value="newest" 
                      checked={sortBy === 'newest'} 
                      onChange={(e) => setSortBy(e.target.value)}
                      className="font-inherit text-[100%] leading-[1.15] m-0 p-0 overflow-visible box-border absolute top-0 w-full h-full opacity-[0.0001] z-[1] cursor-pointer disabled:cursor-default"
                    />
                    <span aria-hidden="true" className="relative inline-flex items-center justify-center shrink-0 overflow-hidden border-solid border-medium box-border border-default rounded-full group-data-[hover-unselected=true]:bg-default-100 outline-solid outline-transparent group-data-[focus-visible=true]:z-10 group-data-[focus-visible=true]:ring-2 group-data-[focus-visible=true]:ring-focus group-data-[focus-visible=true]:ring-offset-2 group-data-[focus-visible=true]:ring-offset-background group-data-[selected=true]:border-primary w-5 h-5 group-data-[pressed=true]:scale-95 transition-transform-colors motion-reduce:transition-none">
                      <span className="z-10 opacity-0 scale-0 origin-center rounded-full group-data-[selected=true]:opacity-100 group-data-[selected=true]:scale-100 bg-primary text-primary-foreground w-2 h-2 transition-transform-opacity motion-reduce:transition-none"></span>
                    </span>
                    <div className="flex flex-col ml-1 ms-2">
                      <span className="relative text-foreground select-none text-medium transition-colors motion-reduce:transition-none">
                        Date d'ajout <br/>
                        <span className="text-default-500">(le plus récent en premier)</span>
                      </span>
                    </div>
                  </label>
                  <label className="group relative max-w-fit inline-flex items-center justify-start cursor-pointer tap-highlight-transparent p-2 -m-2 select-none gap-2 overflow-x-hidden" data-selected={sortBy === 'oldest'}>
                    <input 
                      type="radio" 
                      value="oldest" 
                      checked={sortBy === 'oldest'} 
                      onChange={(e) => setSortBy(e.target.value)}
                      className="font-inherit text-[100%] leading-[1.15] m-0 p-0 overflow-visible box-border absolute top-0 w-full h-full opacity-[0.0001] z-[1] cursor-pointer disabled:cursor-default"
                    />
                    <span aria-hidden="true" className="relative inline-flex items-center justify-center shrink-0 overflow-hidden border-solid border-medium box-border border-default rounded-full group-data-[hover-unselected=true]:bg-default-100 outline-solid outline-transparent group-data-[focus-visible=true]:z-10 group-data-[focus-visible=true]:ring-2 group-data-[focus-visible=true]:ring-focus group-data-[focus-visible=true]:ring-offset-2 group-data-[focus-visible=true]:ring-offset-background group-data-[selected=true]:border-primary w-5 h-5 group-data-[pressed=true]:scale-95 transition-transform-colors motion-reduce:transition-none">
                      <span className="z-10 opacity-0 scale-0 origin-center rounded-full group-data-[selected=true]:opacity-100 group-data-[selected=true]:scale-100 bg-primary text-primary-foreground w-2 h-2 transition-transform-opacity motion-reduce:transition-none"></span>
                    </span>
                    <div className="flex flex-col ml-1 ms-2">
                      <span className="relative text-foreground select-none text-medium transition-colors motion-reduce:transition-none">
                        Dernière mise à jour <br/>
                        <span className="text-default-500">(le plus récent en premier)</span>
                      </span>
                    </div>
                  </label>
                  <label className="group relative max-w-fit inline-flex items-center justify-start cursor-pointer tap-highlight-transparent p-2 -m-2 select-none gap-2 overflow-x-hidden" data-selected={sortBy === 'name'}>
                    <input 
                      type="radio" 
                      value="name" 
                      checked={sortBy === 'name'} 
                      onChange={(e) => setSortBy(e.target.value)}
                      className="font-inherit text-[100%] leading-[1.15] m-0 p-0 overflow-visible box-border absolute top-0 w-full h-full opacity-[0.0001] z-[1] cursor-pointer disabled:cursor-default"
                    />
                    <span aria-hidden="true" className="relative inline-flex items-center justify-center shrink-0 overflow-hidden border-solid border-medium box-border border-default rounded-full group-data-[hover-unselected=true]:bg-default-100 outline-solid outline-transparent group-data-[focus-visible=true]:z-10 group-data-[focus-visible=true]:ring-2 group-data-[focus-visible=true]:ring-focus group-data-[focus-visible=true]:ring-offset-2 group-data-[focus-visible=true]:ring-offset-background group-data-[selected=true]:border-primary w-5 h-5 group-data-[pressed=true]:scale-95 transition-transform-colors motion-reduce:transition-none">
                      <span className="z-10 opacity-0 scale-0 origin-center rounded-full group-data-[selected=true]:opacity-100 group-data-[selected=true]:scale-100 bg-primary text-primary-foreground w-2 h-2 transition-transform-opacity motion-reduce:transition-none"></span>
                    </span>
                    <div className="flex flex-col ml-1 ms-2">
                      <span className="relative text-foreground select-none text-medium transition-colors motion-reduce:transition-none">
                        Nom <span className="text-default-500">(A-Z)</span>
                      </span>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </aside>
        </div>
      </main>
      
      </div>
      
      {/* Footer */}
      <Footer />
    </div>
  )
}

export default function GamesPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <GamesPageContent />
    </Suspense>
  )
}