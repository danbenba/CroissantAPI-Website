"use client"

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { useFavorites } from '@/hooks/use-favorites'
import { useLanguage } from '@/contexts/LanguageContext'
import Navigation from '@/components/navigation'
import Footer from '@/components/footer'
import GamesGrid, { Game, Category } from '@/components/games-grid'
import {
  Card,
  CardHeader,
  CardBody,
  Button,
  Spinner,
  Input,
  Select,
  SelectItem,
  Chip
} from "@heroui/react"

interface FavoriteGame extends Game {
  favorite_created_at: string
}

export default function FavoritesPage() {
  const { user } = useAuth()
  const { getFavorites } = useFavorites()
  const { t } = useLanguage()
  
  const [favorites, setFavorites] = useState<FavoriteGame[]>([])
  const [filteredFavorites, setFilteredFavorites] = useState<FavoriteGame[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  
  // États pour les filtres
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedPlatform, setSelectedPlatform] = useState<string>('all')
  const [sortBy, setSortBy] = useState<string>('recent')

  // Redirection si non connecté
  useEffect(() => {
    if (!user) {
      window.location.href = '/account'
    }
  }, [user])

  // Charger les favoris et catégories
  useEffect(() => {
    if (user) {
      loadData()
    }
  }, [user])

  // Appliquer les filtres
  useEffect(() => {
    applyFilters()
  }, [favorites, searchTerm, selectedCategory, selectedPlatform, sortBy])

  const loadData = async () => {
    try {
      setLoading(true)
      
      // Charger les favoris
      const favoritesData = await getFavorites()
      setFavorites(favoritesData)
      
      // Charger les catégories
      const categoryResponse = await fetch('/api/categories')
      if (categoryResponse.ok) {
        const categoryData = await categoryResponse.json()
        if (categoryData.success) {
          setCategories(categoryData.data.categories)
        }
      }
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error)
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = [...favorites]

    // Filtre par recherche
    if (searchTerm) {
      filtered = filtered.filter(game =>
        game.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        game.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filtre par catégorie
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(game => game.category_id === parseInt(selectedCategory))
    }

    // Filtre par plateforme
    if (selectedPlatform !== 'all') {
      filtered = filtered.filter(game => game.platform === selectedPlatform)
    }

    // Tri
    switch (sortBy) {
      case 'recent':
        filtered.sort((a, b) => new Date(b.favorite_created_at).getTime() - new Date(a.favorite_created_at).getTime())
        break
      case 'alphabetical':
        filtered.sort((a, b) => a.title.localeCompare(b.title))
        break
      case 'year':
        filtered.sort((a, b) => b.year - a.year)
        break
      case 'views':
        filtered.sort((a, b) => b.views - a.views)
        break
    }

    setFilteredFavorites(filtered)
  }

  // Obtenir les plateformes uniques
  const uniquePlatforms = Array.from(new Set(favorites.map(game => game.platform)))

  if (!user) {
    return <div>{t('account.favorites.redirecting')}</div>
  }

  return (
    <div className="min-h-screen bg-background text-foreground font-sans relative flex flex-col">
      {/* Background avec effet de voile violet */}
      <div className="fixed inset-0 bg-gradient-to-br from-purple-900/20 via-black/50 to-blue-900/20 pointer-events-none" />
      
      <Navigation />
      
      <main className="flex-1 relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-block mb-4">
            <Chip
              size="lg"
              variant="shadow"
              classNames={{
                base: "bg-gradient-to-r from-red-500 to-pink-600 border-small border-white/20 shadow-lg",
                content: "text-white font-semibold text-sm px-2"
              }}
              startContent={<i className="fas fa-heart"></i>}
            >
{t('account.favorites.myFavorites')}
            </Chip>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white via-purple-200 to-white bg-clip-text text-transparent">
{t('account.favorites.title')}
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
{t('account.favorites.subtitle')}
          </p>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gray-800/50 backdrop-blur-lg border border-white/10">
            <CardBody className="p-6 text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <i className="fas fa-heart text-white text-xl"></i>
              </div>
              <p className="text-3xl font-bold text-white mb-2">{favorites.length}</p>
              <p className="text-gray-400">{t('account.favorites.totalFavorites')}</p>
            </CardBody>
          </Card>
          
          <Card className="bg-gray-800/50 backdrop-blur-lg border border-white/10">
            <CardBody className="p-6 text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <i className="fas fa-filter text-white text-xl"></i>
              </div>
              <p className="text-3xl font-bold text-white mb-2">{filteredFavorites.length}</p>
              <p className="text-gray-400">{t('account.favorites.afterFilters')}</p>
            </CardBody>
          </Card>
          
          <Card className="bg-gray-800/50 backdrop-blur-lg border border-white/10">
            <CardBody className="p-6 text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <i className="fas fa-gamepad text-white text-xl"></i>
              </div>
              <p className="text-3xl font-bold text-white mb-2">{uniquePlatforms.length}</p>
              <p className="text-gray-400">{t('account.favorites.platforms')}</p>
            </CardBody>
          </Card>
        </div>

        {/* Filtres et Recherche */}
        <Card className="bg-gradient-to-r from-gray-800/40 to-gray-900/40 backdrop-blur-lg border border-white/10 mb-8">
          <CardHeader>
            <h3 className="text-xl font-semibold text-white">{t('account.favorites.filtersAndSearch')}</h3>
          </CardHeader>
          <CardBody>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Input
                placeholder={t('account.favorites.searchPlaceholder')}
                value={searchTerm}
                onValueChange={setSearchTerm}
                startContent={<i className="fas fa-search text-gray-400"></i>}
                classNames={{
                  input: "bg-transparent text-white placeholder:text-gray-400",
                  inputWrapper: "bg-gray-800/50 border-white/20 hover:border-white/40"
                }}
              />
              
              <Select
                placeholder={t('account.favorites.allCategories')}
                selectedKeys={selectedCategory !== 'all' ? [selectedCategory] : []}
                onSelectionChange={(keys) => setSelectedCategory(Array.from(keys)[0] as string || 'all')}
                classNames={{
                  trigger: "bg-gray-800/50 border-white/20 hover:border-white/40",
                  value: "text-white"
                }}
              >
{[
                  <SelectItem key="all" className="text-white">{t('account.favorites.allCategories')}</SelectItem>,
                  ...categories.map((category) => (
                    <SelectItem key={category.id.toString()} className="text-white">
                      {category.name}
                    </SelectItem>
                  ))
                ]}
              </Select>
              
              <Select
                placeholder={t('account.favorites.allPlatforms')}
                selectedKeys={selectedPlatform !== 'all' ? [selectedPlatform] : []}
                onSelectionChange={(keys) => setSelectedPlatform(Array.from(keys)[0] as string || 'all')}
                classNames={{
                  trigger: "bg-gray-800/50 border-white/20 hover:border-white/40",
                  value: "text-white"
                }}
              >
{[
                  <SelectItem key="all" className="text-white">{t('account.favorites.allPlatforms')}</SelectItem>,
                  ...uniquePlatforms.map((platform) => (
                    <SelectItem key={platform} className="text-white">
                      {platform}
                    </SelectItem>
                  ))
                ]}
              </Select>
              
              <Select
                placeholder={t('account.favorites.sortBy')}
                selectedKeys={[sortBy]}
                onSelectionChange={(keys) => setSortBy(Array.from(keys)[0] as string)}
                classNames={{
                  trigger: "bg-gray-800/50 border-white/20 hover:border-white/40",
                  value: "text-white"
                }}
              >
                <SelectItem key="recent" className="text-white">{t('account.favorites.recentlyAdded')}</SelectItem>
                <SelectItem key="alphabetical" className="text-white">{t('account.favorites.alphabetical')}</SelectItem>
                <SelectItem key="year" className="text-white">{t('account.favorites.yearDesc')}</SelectItem>
                <SelectItem key="views" className="text-white">{t('account.favorites.mostViewed')}</SelectItem>
              </Select>
            </div>
          </CardBody>
        </Card>

        {/* Grille des jeux favoris */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Spinner size="lg" color="primary" label={t('account.favorites.loading')} />
          </div>
        ) : (
          <GamesGrid
            games={filteredFavorites}
            categories={categories}
            viewMode="grid"
            showNewBadge={false}
            showTrendingNumbers={false}
            emptyStateIcon="fas fa-heart-broken"
            emptyStateTitle={t('account.favorites.noFavorites')}
            emptyStateDescription={
              favorites.length === 0 
                ? t('account.favorites.noFavoritesDesc')
                : t('account.favorites.noResultsDesc')
            }
            className="fade-in"
          />
        )}

        {/* Bouton retour vers les jeux */}
        {favorites.length === 0 && (
          <div className="text-center mt-8">
            <Button
              as="a"
              href="/explore"
              color="primary"
              variant="shadow"
              size="lg"
              startContent={<i className="fas fa-gamepad"></i>}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white transform hover:scale-105 transition-all duration-300"
            >
{t('account.favorites.discoverGames')}
            </Button>
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  )
}
