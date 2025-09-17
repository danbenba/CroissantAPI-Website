"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Navigation from '@/components/navigation'
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Input,
  Select,
  SelectItem,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  Tooltip,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Pagination,
  Spinner,
  Avatar,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Badge,
  Tabs,
  Tab
} from "@heroui/react"
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  EyeIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ChevronDownIcon,
  ComputerDesktopIcon,
  ChartBarIcon,
  AdjustmentsHorizontalIcon
} from "@heroicons/react/24/outline"
import { secureGet, secureDelete } from '@/lib/api-client'
import { generateGameUrl } from '@/lib/slug'

interface Game {
  id: number
  title: string
  description: string
  banner_url: string
  zip_password: string
  is_vip: boolean
  access_level: 'free' | 'plus' | 'ultra'
  category_id: number
  category_name?: string
  platform: string
  specifications: string
  year: number
  views: number
  created_at: string
  updated_at: string
  badges?: Array<{
    id: number
    name: string
    display_name: string
    color: string
    icon: string
    expires_at: string
  }>
}

interface Category {
  id: number
  name: string
  type: string
  description?: string
}

interface Badge {
  id: number
  name: string
  display_name: string
  color: string
  icon: string
  description: string
}

export default function AdminGamesPage() {
  const router = useRouter()
  
  // Data states
  const [games, setGames] = useState<Game[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [badges, setBadges] = useState<Badge[]>([])
  const [platforms, setPlatforms] = useState<string[]>([])
  const [years, setYears] = useState<number[]>([])
  const [loading, setLoading] = useState(true)

  // Filter and pagination states
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [selectedPlatform, setSelectedPlatform] = useState<string>('')
  const [selectedYear, setSelectedYear] = useState<string>('')
  const [selectedAccessLevel, setSelectedAccessLevel] = useState<string>('')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(12)

  // Modal states
  const { isOpen: isDeleteModalOpen, onOpen: onDeleteModalOpen, onClose: onDeleteModalClose } = useDisclosure()
  const [gameToDelete, setGameToDelete] = useState<Game | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  // Tab state
  const [selectedTab, setSelectedTab] = useState("all")

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      await Promise.all([
        fetchGames(),
        fetchCategories(),
        fetchBadges()
      ])
    } finally {
      setLoading(false)
    }
  }

  const fetchGames = async () => {
    try {
      const response = await secureGet('/api/admin/games')
      const data = await response.json()
      if (data.success) {
        setGames(data.games)
        // Extract unique platforms and years
        const uniquePlatforms = [...new Set(data.games.map((game: Game) => game.platform))] as string[]
        const uniqueYears = [...new Set(data.games.map((game: Game) => game.year))].sort((a, b) => (b as number) - (a as number)) as number[]
        setPlatforms(uniquePlatforms)
        setYears(uniqueYears)
      }
    } catch (error) {
      console.error('Erreur lors du chargement des jeux:', error)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await secureGet('/api/categories')
      const data = await response.json()
      if (data.success && data.data) {
        setCategories(data.data.categories || [])
      }
    } catch (error) {
      console.error('Erreur lors du chargement des catégories:', error)
    }
  }

  const fetchBadges = async () => {
    try {
      const response = await secureGet('/api/admin/badges')
      const data = await response.json()
      if (data.success) {
        setBadges(data.badges)
      }
    } catch (error) {
      console.error('Erreur lors du chargement des badges:', error)
    }
  }

  const handleDelete = async () => {
    if (!gameToDelete) return
    
    setDeleteLoading(true)
    try {
      const response = await secureDelete(`/api/admin/games/${gameToDelete.id}`)
      const data = await response.json()
      
      if (data.success) {
        setGames((games || []).filter(game => game.id !== gameToDelete.id))
        onDeleteModalClose()
      } else {
        console.error('Erreur lors de la suppression:', data.message)
      }
    } catch (error) {
      console.error('Erreur lors de la suppression:', error)
    } finally {
      setDeleteLoading(false)
      setGameToDelete(null)
    }
  }

  const openDeleteModal = (game: Game) => {
    setGameToDelete(game)
    onDeleteModalOpen()
  }

  // Filter games based on search and filters
  const filteredGames = (games || []).filter(game => {
    const matchesSearch = game.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         game.description.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesCategory = !selectedCategory || game.category_id.toString() === selectedCategory
    const matchesPlatform = !selectedPlatform || game.platform === selectedPlatform
    const matchesYear = !selectedYear || game.year.toString() === selectedYear
    const matchesAccessLevel = !selectedAccessLevel || game.access_level === selectedAccessLevel
    
    // Tab filtering
    const matchesTab = selectedTab === "all" || 
                      (selectedTab === "vip" && game.is_vip) ||
                      (selectedTab === "free" && game.access_level === "free") ||
                      (selectedTab === "plus" && game.access_level === "plus") ||
                      (selectedTab === "ultra" && game.access_level === "ultra")

    return matchesSearch && matchesCategory && matchesPlatform && matchesYear && matchesAccessLevel && matchesTab
  })

  // Pagination
  const totalPages = Math.ceil(filteredGames.length / itemsPerPage)
  const paginatedGames = filteredGames.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const getAccessLevelColor = (level: string) => {
    switch (level) {
      case 'ultra': return 'secondary'
      case 'plus': return 'warning'
      case 'free': return 'success'
      default: return 'default'
    }
  }

  const getAccessLevelIcon = (level: string) => {
    switch (level) {
      case 'ultra': return '👑'
      case 'plus': return '⭐'
      case 'free': return '🎁'
      default: return '📦'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground relative">
        <Navigation />
        
        {/* Voile violet en arrière-plan */}
        <div 
          className="absolute h-screen w-full opacity-20 max-md:mask-b-from-10% max-md:mask-b-to-70% md:mask-radial-from-10% md:mask-radial-to-70% md:mask-radial-at-top bg-purple-500"
          style={{ inset: 0 }}
        />
        
        <div className="flex items-center justify-center min-h-screen">
          <Card className="bg-gray-900/60 backdrop-blur-lg border border-white/10 shadow-2xl">
            <CardBody className="text-center p-10">
              <Spinner size="lg" color="primary" label="Chargement des jeux..." />
            </CardBody>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground relative">
      <Navigation />
      
      {/* Voile violet en arrière-plan */}
      <div 
        className="absolute h-screen w-full opacity-20 max-md:mask-b-from-10% max-md:mask-b-to-70% md:mask-radial-from-10% md:mask-radial-to-70% md:mask-radial-at-top bg-purple-500"
        style={{ inset: 0 }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600/20 to-pink-600/20 text-purple-300 px-6 py-3 rounded-full text-sm font-medium mb-8 backdrop-blur-sm border border-purple-500/30">
            <ComputerDesktopIcon className="w-4 h-4" />
            Gestion des Jeux
          </div>
          
          <h1 className="text-5xl md:text-6xl font-extrabold mb-6 tracking-tight text-white" 
              style={{textShadow: '2px 2px 20px rgba(0,0,0,0.5)'}}>
            <span className="bg-gradient-to-r from-purple-400 via-pink-500 to-purple-600 bg-clip-text text-transparent">
              Bibliothèque de Jeux
            </span>
          </h1>
          
          <div className="flex flex-wrap items-center justify-center gap-4 text-gray-300">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm">{games?.length || 0} jeux total</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-sm">{filteredGames?.length || 0} résultats</span>
            </div>
          </div>
        </div>

        {/* Actions et filtres */}
        <Card className="bg-gray-900/60 backdrop-blur-lg border border-white/10 shadow-2xl mb-8">
          <CardHeader>
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 w-full">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                  <AdjustmentsHorizontalIcon className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white">Contrôles & Filtres</h2>
              </div>
              
              <Button
                color="success"
                variant="shadow"
                size="lg"
                startContent={<PlusIcon className="w-5 h-5" />}
                onPress={() => router.push('/admin/games/add')}
                className="bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold"
              >
                Nouveau Jeu
              </Button>
              
              <Button
                color="primary"
                variant="shadow"
                size="lg"
                startContent={<i className="fas fa-tags w-5 h-5" />}
                onPress={() => router.push('/admin/categories' as any)}
                className="bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold"
              >
                Catégories
              </Button>
              
              <Button
                color="warning"
                variant="shadow"
                size="lg"
                startContent={<i className="fas fa-exclamation-triangle w-5 h-5" />}
                onPress={() => router.push('/admin/games/deadlinks' as any)}
                className="bg-gradient-to-r from-orange-500 to-red-600 text-white font-semibold"
              >
                Liens Morts
              </Button>
              
              <Button
                color="secondary"
                variant="shadow"
                size="lg"
                startContent={<i className="fas fa-sync-alt w-5 h-5" />}
                onPress={() => router.push('/admin/games/updatesrequests' as any)}
                className="bg-gradient-to-r from-purple-500 to-pink-600 text-white font-semibold"
              >
                Demandes MAJ
              </Button>
            </div>
          </CardHeader>
          <CardBody>
            {/* Barre de recherche */}
            <div className="mb-6">
              <Input
                size="lg"
                placeholder="Rechercher par titre ou description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                startContent={<MagnifyingGlassIcon className="w-5 h-5 text-gray-400" />}
                classNames={{
                  input: "text-white",
                  inputWrapper: "bg-gray-800/50 border-gray-600 hover:border-purple-500/50 group-data-[focus=true]:border-purple-500"
                }}
              />
            </div>

            {/* Onglets de filtrage rapide */}
            <Tabs 
              selectedKey={selectedTab} 
              onSelectionChange={(key) => setSelectedTab(key as string)}
              color="primary"
              variant="underlined"
              classNames={{
                tabList: "gap-6 w-full relative rounded-none p-0 border-b border-divider",
                cursor: "w-full bg-purple-500",
                tab: "max-w-fit px-0 h-12",
                tabContent: "group-data-[selected=true]:text-purple-400"
              }}
            >
              <Tab key="all" title={
                <div className="flex items-center space-x-2">
                  <span>Tous</span>
                  <Chip size="sm" variant="flat">{games?.length || 0}</Chip>
                </div>
              } />
              <Tab key="free" title={
                <div className="flex items-center space-x-2">
                  <span>🎁 Gratuit</span>
                  <Chip size="sm" variant="flat" color="success">
                    {games?.filter(g => g.access_level === 'free').length || 0}
                  </Chip>
                </div>
              } />
              <Tab key="plus" title={
                <div className="flex items-center space-x-2">
                  <span>⭐ Plus</span>
                  <Chip size="sm" variant="flat" color="warning">
                    {games?.filter(g => g.access_level === 'plus').length || 0}
                  </Chip>
                </div>
              } />
              <Tab key="ultra" title={
                <div className="flex items-center space-x-2">
                  <span>👑 Ultra</span>
                  <Chip size="sm" variant="flat" color="secondary">
                    {games?.filter(g => g.access_level === 'ultra').length || 0}
                  </Chip>
                </div>
              } />
              <Tab key="vip" title={
                <div className="flex items-center space-x-2">
                  <span>💎 VIP</span>
                  <Chip size="sm" variant="flat" color="danger">
                    {games?.filter(g => g.is_vip).length || 0}
                  </Chip>
                </div>
              } />
            </Tabs>

            {/* Filtres avancés */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
              <Select
                placeholder="Toutes les catégories"
                selectedKeys={selectedCategory ? [selectedCategory] : []}
                onSelectionChange={(keys) => setSelectedCategory(Array.from(keys)[0]?.toString() || '')}
                classNames={{
                  trigger: "bg-gray-800/50 border-gray-600 hover:border-purple-500/50",
                  value: "text-white",
                  popoverContent: "bg-gray-800 border-gray-600",
                  listbox: "bg-gray-800"
                }}
              >
                      {categories?.map(category => (
                        <SelectItem key={category.id} className="text-white">
                          {category.name}
                        </SelectItem>
                      )) || []}
              </Select>

              <Select
                placeholder="Toutes les plateformes"
                selectedKeys={selectedPlatform ? [selectedPlatform] : []}
                onSelectionChange={(keys) => setSelectedPlatform(Array.from(keys)[0]?.toString() || '')}
                classNames={{
                  trigger: "bg-gray-800/50 border-gray-600 hover:border-purple-500/50",
                  value: "text-white",
                  popoverContent: "bg-gray-800 border-gray-600",
                  listbox: "bg-gray-800"
                }}
              >
                {platforms?.map(platform => (
                  <SelectItem key={platform} className="text-white">
                    {platform}
                  </SelectItem>
                )) || []}
              </Select>

              <Select
                placeholder="Toutes les années"
                selectedKeys={selectedYear ? [selectedYear] : []}
                onSelectionChange={(keys) => setSelectedYear(Array.from(keys)[0]?.toString() || '')}
                classNames={{
                  trigger: "bg-gray-800/50 border-gray-600 hover:border-purple-500/50",
                  value: "text-white",
                  popoverContent: "bg-gray-800 border-gray-600",
                  listbox: "bg-gray-800"
                }}
              >
                {years?.map(year => (
                  <SelectItem key={year} className="text-white">
                    {year}
                  </SelectItem>
                )) || []}
              </Select>

              <Select
                placeholder="Tous les niveaux"
                selectedKeys={selectedAccessLevel ? [selectedAccessLevel] : []}
                onSelectionChange={(keys) => setSelectedAccessLevel(Array.from(keys)[0]?.toString() || '')}
                classNames={{
                  trigger: "bg-gray-800/50 border-gray-600 hover:border-purple-500/50",
                  value: "text-white",
                  popoverContent: "bg-gray-800 border-gray-600",
                  listbox: "bg-gray-800"
                }}
              >
                <SelectItem key="free" className="text-white">🎁 Gratuit</SelectItem>
                <SelectItem key="plus" className="text-white">⭐ Plus</SelectItem>
                <SelectItem key="ultra" className="text-white">👑 Ultra</SelectItem>
              </Select>
            </div>

            {/* Bouton pour réinitialiser les filtres */}
            {(searchTerm || selectedCategory || selectedPlatform || selectedYear || selectedAccessLevel || selectedTab !== "all") && (
              <div className="mt-4">
                <Button
                  variant="flat"
                  color="default"
                  size="sm"
                  onPress={() => {
                    setSearchTerm('')
                    setSelectedCategory('')
                    setSelectedPlatform('')
                    setSelectedYear('')
                    setSelectedAccessLevel('')
                    setSelectedTab("all")
                    setCurrentPage(1)
                  }}
                >
                  Réinitialiser les filtres
                </Button>
              </div>
            )}
          </CardBody>
        </Card>

        {/* Grille des jeux */}
        <Card className="bg-gray-900/60 backdrop-blur-lg border border-white/10 shadow-2xl">
          <CardHeader>
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <ChartBarIcon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Résultats</h3>
                  <p className="text-gray-400 text-sm">{filteredGames.length} jeu(x) trouvé(s)</p>
                </div>
              </div>

              {totalPages > 1 && (
                <Pagination
                  total={totalPages}
                  page={currentPage}
                  onChange={setCurrentPage}
                  color="primary"
                  variant="flat"
                  showControls
                  classNames={{
                    wrapper: "gap-0 overflow-visible h-8 rounded border border-divider",
                    item: "w-8 h-8 text-small rounded-none bg-transparent",
                    cursor: "bg-gradient-to-b shadow-lg from-purple-500 to-purple-600 dark:from-purple-600 dark:to-purple-700 text-white font-bold",
                  }}
                />
              )}
            </div>
          </CardHeader>
          <CardBody>
            {paginatedGames.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ComputerDesktopIcon className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Aucun jeu trouvé</h3>
                <p className="text-gray-400 mb-6">Essayez de modifier vos critères de recherche</p>
                <Button
                  color="primary"
                  variant="flat"
                  onPress={() => {
                    setSearchTerm('')
                    setSelectedCategory('')
                    setSelectedPlatform('')
                    setSelectedYear('')
                    setSelectedAccessLevel('')
                    setSelectedTab("all")
                  }}
                >
                  Réinitialiser les filtres
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {paginatedGames.map((game) => (
                  <Card 
                    key={game.id} 
                    className="bg-gray-800/50 backdrop-blur-sm border border-white/5 hover:border-white/20 transition-all duration-300 group"
                  >
                    <CardBody className="p-0">
                      {/* Image de bannière */}
                      <div className="relative h-48 overflow-hidden rounded-t-lg">
                        <img
                          src={game.banner_url}
                          alt={game.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            e.currentTarget.src = '/api/storage/placeholder-game.jpg'
                          }}
                        />
                        
                        {/* Overlay avec badges */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                        
                        {/* Badges et actions en overlay */}
                        <div className="absolute top-3 left-3 flex flex-wrap gap-2">
                          <Chip
                            size="sm"
                            color={getAccessLevelColor(game.access_level)}
                            variant="flat"
                            className="backdrop-blur-sm"
                          >
                            {getAccessLevelIcon(game.access_level)} {game.access_level.toUpperCase()}
                          </Chip>
                          
                          {game.is_vip && (
                            <Chip size="sm" color="danger" variant="flat" className="backdrop-blur-sm">
                              💎 VIP
                            </Chip>
                          )}
                        </div>

                        {/* Actions rapides */}
                        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <div className="flex gap-1">
                            <Tooltip content="Voir le jeu">
                              <Button
                                isIconOnly
                                size="sm"
                                color="primary"
                                variant="flat"
                                className="backdrop-blur-sm"
                                onPress={() => window.open(generateGameUrl(game.id, game.title), '_blank')}
                              >
                                <EyeIcon className="w-4 h-4" />
                              </Button>
                            </Tooltip>
                            
                            <Tooltip content="Modifier">
                              <Button
                                isIconOnly
                                size="sm"
                                color="warning"
                                variant="flat"
                                className="backdrop-blur-sm"
                                onPress={() => router.push(`/admin/games/edit/${game.id}`)}
                              >
                                <PencilIcon className="w-4 h-4" />
                              </Button>
                            </Tooltip>
                            
                            <Tooltip content="Supprimer" color="danger">
                              <Button
                                isIconOnly
                                size="sm"
                                color="danger"
                                variant="flat"
                                className="backdrop-blur-sm"
                                onPress={() => openDeleteModal(game)}
                              >
                                <TrashIcon className="w-4 h-4" />
                              </Button>
                            </Tooltip>
                          </div>
                        </div>

                        {/* Statistiques en bas */}
                        <div className="absolute bottom-3 left-3 right-3">
                          <div className="flex items-center justify-between text-white text-sm">
                            <div className="flex items-center gap-2">
                              <EyeIcon className="w-4 h-4" />
                              <span>{game.views.toLocaleString()}</span>
                            </div>
                            <span className="text-xs opacity-75">{game.year}</span>
                          </div>
                        </div>
                      </div>

                      {/* Contenu de la carte */}
                      <div className="p-4">
                        <h3 className="text-white font-semibold text-lg mb-2 line-clamp-1 group-hover:text-purple-300 transition-colors">
                          {game.title}
                        </h3>
                        
                        <p className="text-gray-400 text-sm line-clamp-2 mb-3">
                          {game.description}
                        </p>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Chip size="sm" variant="flat" color="default">
                              {game.platform}
                            </Chip>
                            {game.category_name && (
                              <Chip size="sm" variant="flat" color="primary">
                                {game.category_name}
                              </Chip>
                            )}
                          </div>
                          
                          <div className="text-xs text-gray-500">
                            ID: {game.id}
                          </div>
                        </div>

                        {/* Badges du jeu */}
                        {game.badges && game.badges.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-3">
                            {game.badges.slice(0, 2).map((badge) => (
                              <Chip
                                key={badge.id}
                                size="sm"
                                variant="flat"
                                style={{ backgroundColor: `${badge.color}20`, color: badge.color }}
                              >
                                <i className={badge.icon} /> {badge.display_name}
                              </Chip>
                            ))}
                            {game.badges.length > 2 && (
                              <Chip size="sm" variant="flat" color="default">
                                +{game.badges.length - 2}
                              </Chip>
                            )}
                          </div>
                        )}
                      </div>
                    </CardBody>
                  </Card>
                ))}
              </div>
            )}
          </CardBody>
        </Card>

        {/* Pagination en bas */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-8">
            <Pagination
              total={totalPages}
              page={currentPage}
              onChange={setCurrentPage}
              color="primary"
              variant="flat"
              showControls
              classNames={{
                wrapper: "gap-0 overflow-visible h-10 rounded border border-divider",
                item: "w-10 h-10 text-small rounded-none bg-transparent",
                cursor: "bg-gradient-to-b shadow-lg from-purple-500 to-purple-600 dark:from-purple-600 dark:to-purple-700 text-white font-bold",
              }}
            />
          </div>
        )}
      </div>

      {/* Modal de suppression */}
      <Modal 
        isOpen={isDeleteModalOpen} 
        onClose={onDeleteModalClose}
        backdrop="opaque"
        classNames={{
          backdrop: "bg-gradient-to-t from-zinc-900 to-zinc-900/10 backdrop-opacity-20"
        }}
      >
        <ModalContent className="bg-gray-900 border border-red-500/30">
          <ModalHeader className="flex flex-col gap-1 text-white">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center">
                <TrashIcon className="w-4 h-4 text-white" />
              </div>
              Confirmer la suppression
            </div>
          </ModalHeader>
          <ModalBody className="text-white">
            {gameToDelete && (
              <div>
                <p className="mb-4">
                  Êtes-vous sûr de vouloir supprimer le jeu <strong>"{gameToDelete.title}"</strong> ?
                </p>
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                  <p className="text-red-300 text-sm">
                    ⚠️ Cette action est irréversible. Toutes les données associées seront définitivement perdues.
                  </p>
                </div>
              </div>
            )}
          </ModalBody>
          <ModalFooter>
            <Button 
              color="default" 
              variant="flat" 
              onPress={onDeleteModalClose}
              disabled={deleteLoading}
            >
              Annuler
            </Button>
            <Button 
              color="danger" 
              onPress={handleDelete}
              isLoading={deleteLoading}
            >
              Supprimer définitivement
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  )
}