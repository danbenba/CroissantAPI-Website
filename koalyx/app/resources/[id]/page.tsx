"use client"

import { useState, useEffect, useRef } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import Navigation from '@/components/navigation'
import Footer from '@/components/footer'
import GameBadge from '@/components/game-badge'
import GameMediaGallery from '@/components/game-media-gallery'
import MarkdownRenderer from '@/components/markdown-renderer'
import { useAuth } from '@/hooks/use-auth'
import { useFavorites } from '@/hooks/use-favorites'
import { useLanguage } from '@/contexts/LanguageContext'
import { getPlatformIcon } from '@/components/games-grid'
import { secureGet, securePost } from '@/lib/api-client'
import { generateGameUrl, validateGameSlug } from '@/lib/slug'
import { useRouter } from 'next/navigation'
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Chip,
  Spinner,
  Divider,
  Avatar,
  Tooltip,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Skeleton,
} from "@heroui/react"

// --- Interfaces (inchangées) ---
interface Game {
  id: number
  title: string
  description: string
  banner_url: string
  zip_password: string
  is_vip: boolean
  access_level: 'free' | 'plus' | 'ultra'
  category_id: number
  platform: string
  specifications: string
  year: number
  created_at: string
  updated_at: string
  views: number
  badges?: GameBadge[]
}

interface GameMedia {
  id: number
  type: 'image' | 'video'
  url: string
  title?: string
  description?: string
  position: number
  is_primary: boolean
  created_at: string
}

interface GameBadge {
  id: number
  name: string
  display_name: string
  color: string
  icon: string
  expires_at: string
}

interface DownloadLink {
  id: number
  icon_url: string
  title: string
  description: string
  download_url: string
  is_vip: boolean
  access_level: 'free' | 'plus' | 'ultra' | 'differentiated'
  position: number
  views: number
  is_differentiated?: boolean
  member_url?: string
  plus_url?: string
  ultra_url?: string
}

interface Category {
  id: number
  name: string
  type: string
  description?: string
}

// Fonction pour obtenir le badge d'accès en fonction du niveau
const getAccessBadge = (game: Game) => {
  // Utiliser access_level si disponible, sinon fallback sur is_vip
  const accessLevel = game.access_level || (game.is_vip ? 'ultra' : 'free')
  
  switch (accessLevel) {
    case 'ultra':
      return {
        color: 'secondary' as const,
        icon: 'fas fa-crown',
        label: 'Ultra',
        className: 'bg-gradient-to-r from-purple-500 to-indigo-600'
      }
    case 'plus':
      return {
        color: 'warning' as const,
        icon: 'fas fa-star',
        label: 'Plus',
        className: 'bg-gradient-to-r from-yellow-500 to-amber-600'
      }
    case 'free':
    default:
      return {
        color: 'success' as const,
        icon: 'fas fa-gift',
        label: 'Gratuit',
        className: 'bg-gradient-to-r from-green-500 to-emerald-500'
      }
  }
}

// Fonction pour obtenir le badge d'accès pour un lien de téléchargement
const getLinkAccessBadge = (link: DownloadLink) => {
  const accessLevel = link.access_level || (link.is_vip ? 'ultra' : 'free')
  
  switch (accessLevel) {
    case 'differentiated':
      return {
        color: 'primary' as const,
        icon: 'fas fa-users-cog',
        label: 'Différencié',
        className: 'bg-gradient-to-r from-blue-500 to-cyan-600'
      }
    case 'ultra':
      return {
        color: 'secondary' as const,
        icon: 'fas fa-crown',
        label: 'Ultra',
        className: 'bg-gradient-to-r from-purple-500 to-indigo-600'
      }
    case 'plus':
      return {
        color: 'warning' as const,
        icon: 'fas fa-star',
        label: 'Plus',
        className: 'bg-gradient-to-r from-yellow-500 to-amber-600'
      }
    case 'free':
    default:
      return {
        color: 'success' as const,
        icon: 'fas fa-gift',
        label: 'Gratuit',
        className: 'bg-gradient-to-r from-green-500 to-emerald-500'
      }
  }
}

export default function GameDetailPage() {
  const params = useParams()
  const router = useRouter()
  const gameId = params.id
  const currentSlug = params.slug as string | undefined
  const { user } = useAuth()
  const { t } = useLanguage()
  const { isFavorite, isLoading: favoriteLoading, toggleFavorite } = useFavorites(Number(gameId))

  // --- États du composant ---
  const [game, setGame] = useState<Game | null>(null)
  const [downloadLinks, setDownloadLinks] = useState<DownloadLink[]>([])
  const [category, setCategory] = useState<Category | null>(null)
  const [media, setMedia] = useState<GameMedia[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dominantColor, setDominantColor] = useState('#6b46c1') // Couleur par défaut (violet)
  const [relatedGames, setRelatedGames] = useState<Game[]>([])

  // --- États pour les modales ---
  const { isOpen: isPasswordModalOpen, onOpen: onPasswordModalOpen, onOpenChange: onPasswordModalOpenChange } = useDisclosure()
  const { isOpen: isLinksModalOpen, onOpen: onLinksModalOpen, onOpenChange: onLinksModalOpenChange } = useDisclosure()
  const { isOpen: isUpdateRequestModalOpen, onOpen: onUpdateRequestModalOpen, onOpenChange: onUpdateRequestModalOpenChange } = useDisclosure()
  const { isOpen: isDeadLinkModalOpen, onOpen: onDeadLinkModalOpen, onOpenChange: onDeadLinkModalOpenChange } = useDisclosure()
  const { isOpen: isTorrentTutorialOpen, onOpen: onTorrentTutorialOpen, onOpenChange: onTorrentTutorialOpenChange } = useDisclosure()
  const { isOpen: isDDLTutorialOpen, onOpen: onDDLTutorialOpen, onOpenChange: onDDLTutorialOpenChange } = useDisclosure()
  const { isOpen: isPatchTutorialOpen, onOpen: onPatchTutorialOpen, onOpenChange: onPatchTutorialOpenChange } = useDisclosure()

  const [selectedLink, setSelectedLink] = useState<DownloadLink | null>(null)
  const [selectedLinkForReport, setSelectedLinkForReport] = useState<DownloadLink | null>(null)
  const [copiedPassword, setCopiedPassword] = useState(false)
  const [updateRequestLoading, setUpdateRequestLoading] = useState(false)
  const [deadLinkReportLoading, setDeadLinkReportLoading] = useState(false)

  // --- Fetch des données du jeu ---
  useEffect(() => {
    if (gameId) {
      fetchGameDetails()
      incrementGameView()
    }
  }, [gameId])

  // --- Effet pour extraire la couleur de la bannière ---
  useEffect(() => {
    if (game?.banner_url) {
      const img = new Image()
      img.crossOrigin = "Anonymous"
      img.src = game.banner_url
      img.onload = () => {
        const canvas = document.createElement('canvas')
        canvas.width = img.width
        canvas.height = img.height
        const ctx = canvas.getContext('2d')
        if (ctx) {
          ctx.drawImage(img, 0, 0)
          // Extraire la couleur du centre de l'image
          const data = ctx.getImageData(Math.floor(canvas.width / 2), Math.floor(canvas.height / 2), 1, 1).data
          // Convertir en format hex pour une meilleure compatibilité
          const hex = `#${data[0].toString(16).padStart(2, '0')}${data[1].toString(16).padStart(2, '0')}${data[2].toString(16).padStart(2, '0')}`
          setDominantColor(hex)
        }
      }
      img.onerror = () => {
        // Garde la couleur par défaut si l'image ne peut pas être chargée
        setDominantColor('#6b46c1')
      }
    }
  }, [game])

  // --- Fonction pour incrémenter les vues du jeu ---
  const incrementGameView = async () => {
    try {
      const response = await securePost(`/api/games/${gameId}/increment-view`)
      const data = await response.json()
      if (data.success && !data.alreadyViewed) {
        console.log('👁️ Vue du jeu comptabilisée')
      }
    } catch (error) {
      console.error('Erreur lors de l\'incrémentation des vues:', error)
    }
  }

  const fetchGameDetails = async () => {
    try {
      setLoading(true)
      setError(null)
      const gameResponse = await secureGet(`/api/games/${gameId}`)
      if (!gameResponse.ok) throw new Error('Jeu non trouvé')
      const gameData = await gameResponse.json()
      if (!gameData.success) throw new Error(gameData.message || 'Erreur lors du chargement du jeu')
      setGame(gameData.game)

      // Note: Redirection automatique vers URLs avec slug désactivée temporairement
      // Les nouveaux liens généreront automatiquement les bonnes URLs

      // Récupérer les médias du jeu
      const mediaResponse = await secureGet(`/api/games/${gameId}/media`)
      if (mediaResponse.ok) {
        const mediaData = await mediaResponse.json()
        if (mediaData.success) {
          setMedia(mediaData.media || [])
        }
      }

      const linksResponse = await secureGet(`/api/games/${gameId}/download-links`)
      console.log('🔗 Réponse des liens:', linksResponse.status, linksResponse.statusText)
      
      if (linksResponse.ok) {
        const linksData = await linksResponse.json()
        console.log('📦 Données des liens:', linksData)
        if (linksData.success) {
          setDownloadLinks(linksData.downloadLinks || [])
          console.log('✅ Liens de téléchargement chargés:', linksData.downloadLinks?.length || 0)
        }
      } else {
        console.error('❌ Erreur lors du chargement des liens:', linksResponse.status)
      }

      if (gameData.game.category_id) {
        const categoryResponse = await fetch('/api/categories')
        if (categoryResponse.ok) {
          const categoryData = await categoryResponse.json()
          if (categoryData.success && categoryData.data) {
            const foundCategory = categoryData.data.categories.find(
              (cat: Category) => cat.id === gameData.game.category_id
            )
            setCategory(foundCategory || null)
          }
        }
        
        // Récupérer les jeux de la même catégorie (5 max)
        const relatedResponse = await fetch(`/api/games?category=${gameData.game.category_id}&limit=5&exclude=${gameId}`)
        if (relatedResponse.ok) {
          const relatedData = await relatedResponse.json()
          if (relatedData.success && relatedData.games) {
            setRelatedGames(relatedData.games)
          }
        }
      }
    } catch (err) {
      console.error('Erreur lors du chargement du jeu:', err)
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
    } finally {
      setLoading(false)
    }
  }

  // --- Fonctions utilitaires et gestionnaires ---
  const getCategoryColor = (categoryType: string) => {
    switch (categoryType) {
      case 'action': return 'danger'
      case 'aventure': return 'success'
      case 'rpg': return 'secondary'
      case 'strategy': return 'primary'
      default: return 'primary'
    }
  }

  // Fonction pour vérifier si l'utilisateur peut accéder à un niveau spécifique
  const hasAccessLevel = (requiredLevel: 'free' | 'plus' | 'ultra') => {
    if (!user) return requiredLevel === 'free'
    
    // Staff a toujours accès à tout
    if (['support', 'moderateur', 'admin'].includes(user.role)) return true
    
    // Vérification par niveau d'accès
    switch (requiredLevel) {
      case 'free':
        return true // Gratuit accessible à tous les connectés
      case 'plus':
        return ['plus', 'ultra'].includes(user.role)
      case 'ultra':
        return user.role === 'ultra'
      default:
        return false
    }
  }

  // Fonction pour vérifier si l'utilisateur peut accéder au contenu premium (rétrocompatibilité)
  const hasPremiumAccess = () => {
    return hasAccessLevel('plus') // Plus ou Ultra
  }

  // Fonction pour vérifier si un lien/jeu est accessible avec logique hiérarchique
  const canAccessContent = (isVip: boolean, accessLevel?: 'free' | 'plus' | 'ultra' | 'differentiated') => {
    if (!user) return false // Utilisateur non connecté
    
    // Staff a accès à tout
    if (['admin', 'moderateur', 'support'].includes(user.role)) return true
    
    // Nouveau système : utiliser access_level si disponible
    if (accessLevel) {
      // Liens différenciés sont toujours accessibles (l'API gère le bon lien selon le rôle)
      if (accessLevel === 'differentiated') return true
      
      // Logique hiérarchique : chaque niveau inclut les niveaux inférieurs
      switch (user.role) {
        case 'ultra':
          return ['free', 'plus', 'ultra'].includes(accessLevel)
        case 'plus':
          return ['free', 'plus'].includes(accessLevel)
        case 'membre':
        default:
          return accessLevel === 'free'
      }
    }
    
    // Rétrocompatibilité : utiliser is_vip
    if (!isVip) return true // Contenu gratuit accessible à tous
    return hasPremiumAccess()
  }

  // Fonction pour obtenir le message de restriction
  const getRestrictionMessage = (isVip: boolean, accessLevel?: 'free' | 'plus' | 'ultra' | 'differentiated') => {
    if (!user) {
      return t('gameDetail.mustBeLoggedIn')
    }
    
    // Nouveau système : utiliser access_level si disponible
    if (accessLevel) {
      // Les liens différenciés sont toujours accessibles
      if (accessLevel === 'differentiated') return ""
      
      if (!hasAccessLevel(accessLevel)) {
        switch (accessLevel) {
          case 'plus':
            return t('gameDetail.plusRequired')
          case 'ultra':
            return t('gameDetail.ultraRequired')
          default:
            return ""
        }
      }
      return ""
    }
    
    // Rétrocompatibilité : utiliser is_vip
    if (isVip && !hasPremiumAccess()) {
      return t('gameDetail.premiumRequired')
    }
    return ""
  }

  // Fonction pour gérer le clic sur une restriction VIP/Premium
  const handleVipRestrictionClick = () => {
    window.open('/vip', '_blank')
  }

  const handleDownloadClick = async () => {
    if (downloadLinks.length === 0) return;
    
    // Vérifier les permissions avant de continuer
    if (!user) {
      // Rediriger vers la page de connexion si non connecté
      window.location.href = '/login'
      return
    }
    
    if (downloadLinks.length === 1) {
      const link = downloadLinks[0]
      
      // Vérifier si l'utilisateur peut accéder à ce lien
      if (!canAccessContent(link.is_vip, link.access_level)) {
        // La tooltip s'affichera via le composant, ne rien faire ici
        return
      }
      
      setSelectedLink(link)
      
      // Incrémenter les vues du lien
      try {
        const response = await securePost(`/api/download-links/${link.id}/increment-view`)
        const data = await response.json()
        if (data.success && !data.alreadyViewed) {
          console.log('👁️ Vue du lien comptabilisée')
          // Mettre à jour localement le nombre de vues
          setDownloadLinks(prev => prev.map(l => 
            l.id === link.id ? { ...l, views: l.views + 1 } : l
          ))
        }
      } catch (error) {
        console.error('Erreur lors de l\'incrémentation des vues du lien:', error)
      }
      
      if (game?.zip_password) onPasswordModalOpen()
      else window.open(link.download_url, '_blank')
    } else {
      onLinksModalOpen()
    }
  }

  const handleLinkSelection = async (link: DownloadLink) => {
    // Incrémenter les vues du lien
    try {
      const response = await securePost(`/api/download-links/${link.id}/increment-view`)
      const data = await response.json()
      if (data.success && !data.alreadyViewed) {
        console.log('👁️ Vue du lien comptabilisée')
        setDownloadLinks(prev => prev.map(l => 
          l.id === link.id ? { ...l, views: l.views + 1 } : l
        ))
      }
    } catch (error) {
      console.error('Erreur lors de l\'incrémentation des vues du lien:', error)
    }

    setSelectedLink(link)
    
    // Détermine le type de lien et affiche le tutoriel approprié
    const linkTitle = link.title.toLowerCase()
    
    if (linkTitle.includes('torrent')) {
      onLinksModalOpenChange()
      onTorrentTutorialOpen()
    } else if (linkTitle.includes('patch')) {
      onLinksModalOpenChange()
      onPatchTutorialOpen()
    } else {
      // DDL par défaut
      onLinksModalOpenChange()
      onDDLTutorialOpen()
    }
  }

  const handlePasswordContinue = () => {
    onPasswordModalOpenChange()
    if (selectedLink) window.open(selectedLink.download_url, '_blank')
  }

  // Gestion des favoris
  const handleFavoriteToggle = async () => {
    if (!user) return
    
    const result = await toggleFavorite(Number(gameId))
    if (result.success) {
      // Optionnel: afficher une notification de succès
      console.log(result.message)
    } else {
      console.error(result.message)
    }
  }

  // Gestion de la demande de mise à jour
  const handleUpdateRequest = async () => {
    if (!user) return
    
    setUpdateRequestLoading(true)
    try {
      const response = await fetch('/api/games/update-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ gameId: Number(gameId) }),
      })

      const data = await response.json()
      
      if (data.success) {
        onUpdateRequestModalOpenChange()
        // Optionnel: afficher une notification de succès
        console.log(data.message)
      } else {
        console.error(data.message)
        alert(data.message)
      }
    } catch (error) {
      console.error('Erreur lors de la demande de mise à jour:', error)
      alert('Erreur lors de la demande de mise à jour')
    } finally {
      setUpdateRequestLoading(false)
    }
  }

  // Gestion du signalement de lien mort
  const openDeadLinkModal = (link: DownloadLink) => {
    setSelectedLinkForReport(link)
    onDeadLinkModalOpen()
  }

  const handleDeadLinkReport = async () => {
    if (!user || !selectedLinkForReport) return
    
    setDeadLinkReportLoading(true)
    try {
      const response = await fetch('/api/dead-links', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ linkId: selectedLinkForReport.id }),
      })

      const data = await response.json()
      
      if (data.success) {
        onDeadLinkModalOpenChange()
        // Optionnel: afficher une notification de succès
        console.log(data.message)
      } else {
        console.error(data.message)
        alert(data.message)
      }
    } catch (error) {
      console.error('Erreur lors du signalement:', error)
      alert('Erreur lors du signalement du lien')
    } finally {
      setDeadLinkReportLoading(false)
    }
  }

  const copyPassword = async () => {
    if (game?.zip_password) {
      await navigator.clipboard.writeText(game.zip_password)
      setCopiedPassword(true)
      setTimeout(() => setCopiedPassword(false), 2000)
    }
  }

  // --- Rendu des états de chargement et d'erreur ---
  // --- Composant Skeleton pour le chargement ---
  const GamePageSkeleton = () => (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="flex-1 flex flex-col">
        {/* Background avec effet de blur radial sur toute la page */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="w-full h-full object-cover opacity-30 blur-[100px] bg-gray-500" />
          <div className="absolute inset-0 bg-gradient-radial from-transparent via-black/20 to-black/80"></div>
        </div>
        
        {/* Contenu principal avec le style PotionGang */}
        <div className="z-10 w-full max-w-[1400px] flex-1 px-3 py-10 flex flex-col gap-5 mx-auto">
          {/* Header avec titre et badges */}
          <header className="flex flex-col gap-2">
            <Skeleton className="w-64 h-10 rounded-lg" />
            <div className="flex items-center gap-3">
              <Skeleton className="w-24 h-8 rounded-lg" />
              <Skeleton className="w-20 h-8 rounded-lg" />
            </div>
          </header>
          
          <div className="flex flex-col-reverse gap-3 xl:flex-row">
            <div className="flex flex-col gap-7">
              {/* Vidéo principale */}
              <Skeleton className="w-full xl:w-[936px] h-96 rounded-3xl">
                <div className="w-full h-full bg-gray-200 dark:bg-gray-700 rounded-3xl" />
              </Skeleton>
              
              {/* Boutons d'action */}
              <div className="flex flex-col relative overflow-hidden h-auto text-foreground box-border bg-content1 outline-solid outline-transparent shadow-medium rounded-large">
                <div className="relative flex w-full p-3 flex-auto place-content-inherit align-items-inherit h-auto break-words text-left overflow-y-auto subpixel-antialiased flex-col gap-2 lg:flex-row">
                  <Skeleton className="w-32 h-10 rounded-lg" />
                  <Skeleton className="w-40 h-10 rounded-lg" />
                  <Skeleton className="w-36 h-10 rounded-lg" />
                  <Skeleton className="w-28 h-10 rounded-lg" />
                  <Skeleton className="w-20 h-10 rounded-lg" />
                </div>
              </div>
              
              {/* Section Spécifications techniques */}
              <div className="flex flex-col gap-3">
                <h1 id="specifications" className="scroll-mt-20 text-3xl">Spécifications techniques</h1>
                <div className="flex flex-col relative overflow-hidden h-auto text-foreground box-border bg-content1 outline-solid outline-transparent shadow-medium rounded-large">
                  <div className="relative flex w-full p-3 flex-auto flex-col place-content-inherit align-items-inherit h-auto break-words text-left overflow-y-auto subpixel-antialiased">
                    <Skeleton className="w-full h-32 rounded-lg" />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Sidebar avec informations */}
            <aside>
              <div className="flex flex-col relative overflow-hidden h-auto text-foreground box-border bg-content1 outline-solid outline-transparent shadow-medium rounded-large xl:w-[456px]">
                <div className="relative flex w-full flex-auto flex-col place-content-inherit align-items-inherit h-auto break-words text-left overflow-y-auto subpixel-antialiased p-0">
                  <Skeleton className="w-full h-[300px] rounded-t-large" />
                  <div className="h-auto flex items-center overflow-hidden color-inherit subpixel-antialiased rounded-b-large relative w-full p-0">
                    <div className="z-10 flex w-full flex-col gap-1 p-6">
                      <h3 className="text-xl">Informations sur la ressource :</h3>
                      <ul className="ms-4 flex list-outside list-disc flex-col gap-1">
                        <li><strong>Description :</strong> <Skeleton className="inline w-32 h-4 rounded-lg" /></li>
                        <li><strong>Plateforme :</strong> <Skeleton className="inline w-16 h-4 rounded-lg" /></li>
                        <li><strong>Année :</strong> <Skeleton className="inline w-12 h-4 rounded-lg" /></li>
                        <li><strong>Catégorie :</strong> <Skeleton className="inline w-20 h-4 rounded-lg" /></li>
                        <li><strong>Nombre de vues :</strong> <Skeleton className="inline w-16 h-4 rounded-lg" /></li>
                        <br />
                        <li>Niveau d'accès : <Skeleton className="inline w-20 h-6 rounded-lg" /></li>
                        <li>Mise en ligne le <Skeleton className="inline w-24 h-4 rounded-lg" /></li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </aside>
          </div>
          
          {/* Section Jeux de la même catégorie */}
          <div className="space-y-3">
            <h1 className="text-3xl">Dans la même catégorie...</h1>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Skeleton className="w-[300px] h-[200px] rounded-large" />
              <Skeleton className="w-[300px] h-[200px] rounded-large" />
              <Skeleton className="w-[300px] h-[200px] rounded-large" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  // --- Rendu des états de chargement et d'erreur ---
  if (loading) {
    return <GamePageSkeleton />
  }

  if (error || !game) {
    return (
      <div
        className="min-h-screen bg-background text-foreground font-sans relative flex items-center justify-center p-4"
        style={{}}
      >
        <Card className="bg-gray-800/50 backdrop-blur-sm border border-red-500/30 max-w-md mx-auto">
          <CardBody className="text-center p-10">
            <div className="w-20 h-20 bg-blue-primary rounded-full flex items-center justify-center mx-auto mb-5">
              <i className="fas fa-exclamation-triangle text-3xl text-white"></i>
            </div>
            <h1 className="text-2xl font-bold text-white mb-3">{t('common.error')}</h1>
            <p className="text-gray-400 mb-6">{error || t('games.errorLoading')}</p>
            <Button as={Link} href="/explore" color="primary" variant="shadow" startContent={<i className="fas fa-arrow-left"></i>}>
{t('common.back')}
            </Button>
          </CardBody>
        </Card>
      </div>
    )
  }

  // --- Rendu principal de la page ---
  return (
    <div
      className="min-h-screen bg-background text-foreground font-sans relative flex flex-col"
      style={{}}
    >
      {/* Navigation */}
      <Navigation />
      
      {/* Contenu principal avec flex-1 pour pousser le footer en bas */}
      <div className="flex-1 flex flex-col">
      
      {/* Voile coloré en arrière-plan inspiré du style admin */}
      <div 
        className="absolute h-screen w-full opacity-20 max-md:mask-b-from-10% max-md:mask-b-to-70% md:mask-radial-from-10% md:mask-radial-to-70% md:mask-radial-at-top"
        style={{ 
          inset: 0,
          backgroundColor: dominantColor
        }}
      />
      
      {/* Contenu principal avec le style PotionGang */}
      <div className="z-10 w-full max-w-[1400px] flex-1 px-3 py-10 flex flex-col gap-5 mx-auto">
        {/* Header avec titre et badges */}
        <header className="flex flex-col gap-2">
          <h1 className="text-3xl md:text-4xl">{game.title}</h1>
          <div className="flex items-center gap-3">
            {/* Badge version */}
            <div className="flex flex-col relative overflow-hidden h-auto text-foreground box-border bg-content1 outline-solid outline-transparent data-[focus-visible=true]:z-10 data-[focus-visible=true]:outline-2 data-[focus-visible=true]:outline-focus data-[focus-visible=true]:outline-offset-2 shadow-medium rounded-large transition-transform-background motion-reduce:transition-none" tabIndex={-1}>
              <div className="relative flex w-full p-3 flex-auto place-content-inherit align-items-inherit h-auto break-words text-left overflow-y-auto subpixel-antialiased flex-row items-center gap-2 px-2 py-1">
                <svg xmlns="http://www.w3.org/2000/svg" width="19" height="19" fill="currentColor" viewBox="0 0 256 256">
                  <path d="M223.68,66.15,135.68,18a15.88,15.88,0,0,0-15.36,0l-88,48.17a16,16,0,0,0-8.32,14v95.64a16,16,0,0,0,8.32,14l88,48.17a15.88,15.88,0,0,0,15.36,0l88-48.17a16,16,0,0,0,8.32-14V80.18A16,16,0,0,0,223.68,66.15ZM128,32l80.34,44-29.77,16.3-80.35-44ZM128,120,47.66,76l33.9-18.56,80.34,44ZM40,90l80,43.78v85.79L40,175.82Zm176,85.78h0l-80,43.79V133.82l32-17.51V152a8,8,0,0,0,16,0V107.55L216,90v85.77Z"></path>
                </svg>
                v1.0.28324
        </div>
            </div>
            {/* Badge vues */}
            <div className="flex flex-col relative overflow-hidden h-auto text-foreground box-border bg-content1 outline-solid outline-transparent data-[focus-visible=true]:z-10 data-[focus-visible=true]:outline-2 data-[focus-visible=true]:outline-focus data-[focus-visible=true]:outline-offset-2 shadow-medium rounded-large transition-transform-background motion-reduce:transition-none" tabIndex={-1}>
              <div className="relative flex w-full p-3 flex-auto place-content-inherit align-items-inherit h-auto break-words text-left overflow-y-auto subpixel-antialiased flex-row items-center gap-2 px-2 py-1">
                <svg xmlns="http://www.w3.org/2000/svg" width="19" height="19" fill="currentColor" viewBox="0 0 256 256">
                  <path d="M247.31,124.76c-.35-.79-8.82-19.58-27.65-38.41C194.57,61.26,162.88,48,128,48S61.43,61.26,36.34,86.35C17.51,105.18,9,124,8.69,124.76a8,8,0,0,0,0,6.5c.35.79,8.82,19.57,27.65,38.4C61.43,194.74,93.12,208,128,208s66.57-13.26,91.66-38.34c18.83-18.83,27.3-37.61,27.65-38.4A8,8,0,0,0,247.31,124.76ZM128,192c-30.78,0-57.67-11.19-79.93-33.25A133.47,133.47,0,0,1,25,128,133.33,133.33,0,0,1,48.07,97.25C70.33,75.19,97.22,64,128,64s57.67,11.19,79.93,33.25A133.46,133.46,0,0,1,231.05,128C223.84,141.46,192.43,192,128,192Zm0-112a48,48,0,1,0,48,48A48.05,48.05,0,0,0,128,80Zm0,80a32,32,0,1,1,32-32A32,32,0,0,1,128,160Z"></path>
                </svg>
                {game.views}
              </div>
            </div>
          </div>
        </header>
        
        {/* Layout principal avec vidéo et sidebar */}
        <div className="flex flex-col-reverse gap-3 xl:flex-row">
          <div className="flex flex-col gap-7">
            {/* Vidéo principale */}
               {(() => {
              const primaryMedia = media.find(m => m.is_primary && m.type === 'video')
                 if (primaryMedia) {
                   return (
                  <video 
                    className="rounded-3xl xl:w-[936px]" 
                    autoPlay 
                    loop 
                    playsInline 
                    controls
                    muted
                    preload="auto"
                    onLoadedData={(e) => {
                      // Forcer la lecture automatique même si le navigateur bloque l'autoplay
                      const video = e.target as HTMLVideoElement
                      video.play().catch(console.log)
                    }}
                  >
                    <source src={primaryMedia.url} type="video/mp4" />
                    Votre navigateur ne supporte pas la lecture vidéo.
                  </video>
                   )
                 } else {
                // Fallback sur la bannière si pas de vidéo
                                        return (
                  <img 
                    src={game.banner_url} 
                    alt={game.title}
                    className="rounded-3xl xl:w-[936px] object-cover"
                  />
                     )
                 }
               })()}
            
            {/* Boutons d'action */}
            <div className="flex flex-col relative overflow-hidden h-auto text-foreground box-border bg-content1 outline-solid outline-transparent data-[focus-visible=true]:z-10 data-[focus-visible=true]:outline-2 data-[focus-visible=true]:outline-focus data-[focus-visible=true]:outline-offset-2 shadow-medium rounded-large transition-transform-background motion-reduce:transition-none" tabIndex={-1}>
              <div className="relative flex w-full p-3 flex-auto place-content-inherit align-items-inherit h-auto break-words text-left overflow-y-auto subpixel-antialiased flex-col gap-2 lg:flex-row">
                {/* Bouton Télécharger */}
                    <Button
                      color="primary"
                      variant="shadow"
                  startContent={
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 256 256">
                      <path d="M224,144v64a8,8,0,0,1-8,8H40a8,8,0,0,1-8-8V144a8,8,0,0,1,16,0v56H208V144a8,8,0,0,1,16,0Zm-101.66,5.66a8,8,0,0,0,11.32,0l40-40a8,8,0,0,0-11.32-11.32L136,124.69V32a8,8,0,0,0-16,0v92.69L93.66,98.34a8,8,0,0,0-11.32,11.32Z"></path>
                    </svg>
                  }
                      onPress={handleDownloadClick}
                  className="bg-primary text-primary-foreground data-[hover=true]:opacity-hover"
                >
                  Télécharger
                    </Button>
                
                {/* Bouton Favoris */}
                {user && (
                  <Button
                    color={isFavorite ? "danger" : "default"}
                    variant={isFavorite ? "shadow" : "flat"}
                    startContent={
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 256 256">
                        {isFavorite ? (
                          // Icône cœur rempli (favori)
                          <path d="M240,94c0,70-103.79,126.66-108.21,129a8,8,0,0,1-7.58,0C119.79,220.66,16,164,16,94A62.07,62.07,0,0,1,78,32c20.65,0,38.73,8.88,50,23.89C139.27,40.88,157.35,32,178,32A62.07,62.07,0,0,1,240,94Z"></path>
                        ) : (
                          // Icône cœur vide (pas favori)
                          <path d="M178,32c-20.65,0-38.73,8.88-50,23.89C116.73,40.88,98.65,32,78,32A62.07,62.07,0,0,0,16,94c0,70,103.79,126.66,108.21,129a8,8,0,0,0,7.58,0C136.21,220.66,240,164,240,94A62.07,62.07,0,0,0,178,32ZM128,206.8C109.74,196.16,32,147.69,32,94A46.06,46.06,0,0,1,78,48c19.45,0,35.78,10.36,42.6,27a8,8,0,0,0,14.8,0c6.82-16.67,23.15-27,42.6-27a46.06,46.06,0,0,1,46,46C224,147.61,146.24,196.15,128,206.8Z"></path>
                        )}
                      </svg>
                    }
                    onPress={handleFavoriteToggle}
                    isLoading={favoriteLoading}
                    className={`transition-all duration-300 ${
                      isFavorite 
                        ? 'bg-red-500 text-white hover:bg-red-600 transform hover:scale-105' 
                        : 'bg-default text-default-foreground data-[hover=true]:opacity-hover'
                    }`}
                  >
                    {isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                  </Button>
                )}
                
                {/* Bouton Demande MAJ */}
                  <Button
                  color="default"
                  variant="flat"
                  startContent={
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 256 256">
                      <path d="M223.16,68.42l-16-32A8,8,0,0,0,200,32H56a8,8,0,0,0-7.16,4.42l-16,32A8.08,8.08,0,0,0,32,72V208a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V72A8.08,8.08,0,0,0,223.16,68.42ZM60.94,48H195.06l8,16H52.94ZM208,208H48V80H208V208Zm-42.34-77.66a8,8,0,0,1-11.32,11.32L136,123.31V184a8,8,0,0,1-16,0V123.31l-18.34,18.35a8,8,0,0,1-11.32-11.32l32-32a8,8,0,0,1,11.32,0Z"></path>
                    </svg>
                  }
                  onPress={onUpdateRequestModalOpen}
                  className="bg-default text-default-foreground data-[hover=true]:opacity-hover"
                >
                  Demander une MAJ
                </Button>

                {/* Bouton Discord */}
                <Button
                  as={Link}
                  href="https://discord.gg/votre-serveur"
                  color="default"
                  variant="flat"
                  startContent={
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <path d="M18.942 5.55586C17.6305 4.94114 16.243 4.50395 14.816 4.25586C14.6212 4.61335 14.4446 4.98048 14.287 5.35586C12.7714 5.12486 11.2296 5.12486 9.71401 5.35586C9.55517 4.98003 9.37658 4.61285 9.17901 4.25586C7.75092 4.50339 6.36231 4.94059 5.05001 5.55586C2.73962 8.97934 1.72297 13.1133 2.18201 17.2179C3.67394 18.3456 5.35439 19.1992 7.14501 19.7389C7.55501 19.1749 7.91801 18.5789 8.22901 17.9539C7.63676 17.7286 7.06582 17.4508 6.52301 17.1239C6.66601 17.0179 6.80601 16.9069 6.94101 16.7929C8.51928 17.5526 10.2484 17.9471 12 17.9471C13.7516 17.9471 15.4807 17.5526 17.059 16.7929C17.196 16.9069 17.336 17.0179 17.477 17.1239C16.933 17.4519 16.361 17.7299 15.767 17.9559C16.0782 18.5799 16.4408 19.1769 16.851 19.7409C18.6769 19.1764 20.3905 18.2983 21.915 17.1459C22.3353 13.0518 21.2811 8.94209 18.942 5.55586ZM8.67801 14.8129C8.16945 14.7769 7.6955 14.5422 7.35865 14.1595C7.02181 13.7768 6.84914 13.2769 6.87801 12.7679C6.84594 12.2579 7.01742 11.756 7.35485 11.3723C7.69228 10.9885 8.16811 10.7543 8.67801 10.7209C8.93104 10.7358 9.17858 10.8008 9.40634 10.9121C9.6341 11.0233 9.83754 11.1786 10.0049 11.369C10.1723 11.5593 10.3003 11.7809 10.3815 12.0211C10.4627 12.2612 10.4955 12.515 10.478 12.7679C10.5098 13.2776 10.3382 13.7791 10.0007 14.1624C9.66331 14.5458 9.18763 14.7797 8.67801 14.8129ZM15.322 14.8129C14.8135 14.7769 14.3395 14.5422 14.0027 14.1595C13.6658 13.7768 13.4931 13.2769 13.522 12.7679C13.4899 12.2579 13.6614 11.756 13.9988 11.3723C14.3363 10.9885 14.8121 10.7543 15.322 10.7209C15.575 10.736 15.8225 10.8011 16.0502 10.9123C16.2779 11.0236 16.4813 11.1789 16.6486 11.3692C16.816 11.5596 16.944 11.7811 17.0252 12.0212C17.1065 12.2612 17.1394 12.515 17.122 12.7679C17.1535 13.2775 16.9818 13.7789 16.6444 14.1622C16.3071 14.5455 15.8315 14.7794 15.322 14.8129Z" fill="#F8F8F8"></path>
                    </svg>
                  }
                  className="bg-default text-default-foreground data-[hover=true]:opacity-hover"
                >
                  Rejoindre notre Discord
                </Button>
                
                {/* Bouton FAQ */}
                <Button
                  as={Link}
                  href="/faq"
                  color="default"
                  variant="flat"
                  startContent={
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 256 256">
                      <path d="M192,96c0,28.51-24.47,52.11-56,55.56V160a8,8,0,0,1-16,0V144a8,8,0,0,1,8-8c26.47,0,48-17.94,48-40s-21.53-40-48-40S80,73.94,80,96a8,8,0,0,1-16,0c0-30.88,28.71-56,64-56S192,65.12,192,96Zm-64,96a16,16,0,1,0,16,16A16,16,0,0,0,128,192Z"></path>
                    </svg>
                  }
                  className="bg-default text-default-foreground data-[hover=true]:opacity-hover"
                >
                  FAQ
                </Button>
              </div>
            </div>
            
            {/* Section Spécifications techniques */}
          {game.specifications && (
              <div className="flex flex-col gap-3">
                <h1 id="specifications" className="scroll-mt-20 text-3xl">Spécifications techniques</h1>
                <div className="flex flex-col relative overflow-hidden h-auto text-foreground box-border bg-content1 outline-solid outline-transparent data-[focus-visible=true]:z-10 data-[focus-visible=true]:outline-2 data-[focus-visible=true]:outline-focus data-[focus-visible=true]:outline-offset-2 shadow-medium rounded-large transition-transform-background motion-reduce:transition-none" tabIndex={-1}>
                  <div className="relative flex w-full p-3 flex-auto flex-col place-content-inherit align-items-inherit h-auto break-words text-left overflow-y-auto subpixel-antialiased">
                    <MarkdownRenderer 
                      content={game.specifications} 
                      className="prose-a:text-[color:hsl(296_60%_50%)]" 
                    />
                </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Sidebar avec informations */}
          <aside>
            <div className="flex flex-col relative overflow-hidden h-auto text-foreground box-border bg-content1 outline-solid outline-transparent data-[focus-visible=true]:z-10 data-[focus-visible=true]:outline-2 data-[focus-visible=true]:outline-focus data-[focus-visible=true]:outline-offset-2 shadow-medium rounded-large transition-transform-background motion-reduce:transition-none xl:w-[456px]" tabIndex={-1}>
              <div className="relative flex w-full flex-auto flex-col place-content-inherit align-items-inherit h-auto break-words text-left overflow-y-auto subpixel-antialiased p-0">
                <img loading="lazy" className="max-h-[300px] object-cover" alt={game.title} src={game.banner_url} />
                <div className="h-auto flex items-center overflow-hidden color-inherit subpixel-antialiased rounded-b-large relative w-full p-0">
                  <img alt={game.title} loading="lazy" className="mask-linear mask-dir-to-b pointer-events-none absolute top-0 w-full opacity-30 blur-3xl" src={game.banner_url} />
                  <div className="z-10 flex w-full flex-col gap-1 p-6">
                    <h3 className="text-xl">Informations sur la ressource :</h3>
                    <ul className="ms-4 flex list-outside list-disc flex-col gap-1">
                      <li><strong>Description :</strong> {game.description}</li>
                      <li><strong>Plateforme :</strong> {game.platform}</li>
                      <li><strong>Année :</strong> {game.year}</li>
                      <li><strong>Catégorie :</strong> {category?.name || 'N/A'}</li>
                      <li><strong>Nombre de vues :</strong> {game.views}</li>
                      <br />
                      {(() => {
                        const accessBadge = getAccessBadge(game)
                        return (
                          <li>Niveau d'accès : <strong className={`${accessBadge.className} text-white px-2 py-1 rounded text-sm`}>{accessBadge.label}</strong></li>
                        )
                      })()}
                      <li>Mise en ligne le <strong>{new Date(game.created_at).toLocaleDateString('fr-FR')}</strong></li>
                    </ul>
        </div>
                </div>
              </div>
            </div>
          </aside>
        </div>
        
        {/* Section Jeux de la même catégorie */}
        {relatedGames.length > 0 && (
          <div className="space-y-3">
            <h1 className="text-3xl">Dans la même catégorie...</h1>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
              {relatedGames.map((relatedGame) => (
                <Card
                  key={relatedGame.id}
                  as={Link}
                  href={generateGameUrl(relatedGame.id, relatedGame.title) as any}
                  className="flex flex-col relative overflow-hidden h-auto text-foreground box-border bg-content1 outline-solid outline-transparent shadow-medium rounded-large cursor-pointer transition-transform-background hover:scale-[0.98] min-w-[326px]"
                  isPressable
                >
                  <CardBody className="relative flex w-full flex-auto flex-col h-auto p-0">
                    <img 
                      loading="lazy" 
                      alt={relatedGame.title} 
                      className="z-10 h-[161px] object-cover" 
                      src={relatedGame.banner_url || "https://via.placeholder.com/326x161"}
                    />
                    <div className="flex flex-col gap-1 px-5 py-2">
                      <img 
                        alt={relatedGame.title} 
                        loading="lazy" 
                        className="absolute bottom-0 left-0 opacity-65 blur-2xl" 
                        src={relatedGame.banner_url || "https://via.placeholder.com/326x161"}
                      />
                      <h2 className="z-10 truncate text-xl">{relatedGame.title}</h2>
                      <div className="flex gap-1 text-sm">
                          <div className="flex flex-col relative overflow-hidden h-auto text-foreground box-border bg-content1 outline-solid outline-transparent shadow-medium rounded-large transition-transform-background motion-reduce:transition-none" tabIndex={-1}>
                            <div className="relative flex w-full p-3 flex-auto flex-col justify-center px-2 py-1">
                              {getPlatformIcon(relatedGame.platform)}
                            </div>
                          </div>
                          <div className="flex flex-col relative overflow-hidden h-auto text-foreground box-border bg-content1 outline-solid outline-transparent shadow-medium rounded-large transition-transform-background motion-reduce:transition-none" tabIndex={-1}>
                            <div className="relative flex w-full p-3 flex-auto flex-row items-center gap-1 px-2 py-1">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256">
                              <path d="M247.31,124.76c-.35-.79-8.82-19.58-27.65-38.41C194.57,61.26,162.88,48,128,48S61.43,61.26,36.34,86.35C17.51,105.18,9,124,8.69,124.76a8,8,0,0,0,0,6.5c.35.79,8.82,19.57,27.65,38.4C61.43,194.74,93.12,208,128,208s66.57-13.26,91.66-38.34c18.83-18.83,27.3-37.61,27.65-38.4A8,8,0,0,0,247.31,124.76ZM128,192c-30.78,0-57.67-11.19-79.93-33.25A133.47,133.47,0,0,1,25,128A133.33,133.33,0,0,1,48.07,97.25C70.33,75.19,97.22,64,128,64s57.67,11.19,79.93,33.25A133.46,133.46,0,0,1,231.05,128C223.84,141.46,192.43,192,128,192Zm0-112a48,48,0,1,0,48,48A48.05,48.05,0,0,0,128,80Zm0,80a32,32,0,1,1,32-32A32,32,0,0,1,128,160Z"></path>
                            </svg>
                            {relatedGame.views || 0}
                          </div>
                          </div>
                          <div className="flex flex-col relative overflow-hidden h-auto text-foreground box-border bg-content1 outline-solid outline-transparent shadow-medium rounded-large transition-transform-background motion-reduce:transition-none" tabIndex={-1}>
                            <div className="relative flex w-full p-3 flex-auto flex-row items-center gap-1 px-2 py-1 text-nowrap">
                              {relatedGame.access_level === 'free' ? (
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
          </div>
        )}
      </div>

      {/* --- Modales stylées --- */}
      <Modal isOpen={isPasswordModalOpen} onOpenChange={onPasswordModalOpenChange} backdrop="blur" placement="center" size="sm">
        <ModalContent className="bg-[#18181b] border border-white/10 shadow-2xl rounded-xl max-w-md mx-auto">
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-2 items-center text-center pt-6">
                <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mb-3 shadow-lg">
                  <i className="fas fa-key text-2xl text-white"></i>
                </div>
                <h3 className="text-xl font-bold text-white">Mot de passe requis</h3>
              </ModalHeader>
              <ModalBody className="text-center px-6">
                <p className="text-gray-300 mb-4 text-sm">Un mot de passe est nécessaire pour extraire les fichiers du jeu.</p>
                <div className="bg-gray-800/50 rounded-lg p-4 flex items-center justify-between border border-white/20">
                  <code className="text-white font-mono text-lg font-bold">{game?.zip_password}</code>
                  <Tooltip 
                    content={copiedPassword ? 'Copié !' : 'Copier le mot de passe'} 
                    placement="top"
                    classNames={{
                      content: "bg-black text-white border border-white/30 shadow-xl"
                    }}
                  >
                    <Button 
                      isIconOnly 
                      size="sm" 
                      color={copiedPassword ? 'success' : 'default'} 
                      variant="flat" 
                      onPress={copyPassword} 
                      className={`${copiedPassword ? 'bg-green-600' : 'bg-gray-700 hover:bg-gray-600'} text-white transition-all duration-300`}
                    >
                      <i className={`fas ${copiedPassword ? 'fa-check' : 'fa-copy'} text-sm`}></i>
                    </Button>
                  </Tooltip>
                </div>
              </ModalBody>
              <ModalFooter className="px-6 pb-6">
                <Button color="danger" variant="light" onPress={onClose} className="text-white hover:bg-red-500/20">
                  Annuler
                </Button>
                <Button 
                  color="primary" 
                  variant="shadow" 
                  className="bg-blue-500 hover:bg-blue-600 text-white" 
                  onPress={handlePasswordContinue}
                >
                  Continuer
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      <Modal isOpen={isLinksModalOpen} onOpenChange={onLinksModalOpenChange} size="xl" backdrop="blur" placement="center">
        <ModalContent className="bg-[#18181b] border border-white/10 shadow-2xl rounded-xl max-w-xl mx-auto">
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-2 items-center text-center pt-6">
                 <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mb-3 shadow-lg">
                  <i className="fas fa-link text-2xl text-white"></i>
                </div>
                <h3 className="text-xl font-bold text-white">Choisir un lien de téléchargement</h3>
              </ModalHeader>
              <ModalBody className="px-6">
                <div className="space-y-3 max-h-[60vh] overflow-y-auto p-2 custom-scrollbar">
                  {downloadLinks.sort((a, b) => a.position - b.position).map((link) => {
                    const canAccessLink = canAccessContent(link.is_vip, link.access_level)
                    const restrictionMessage = getRestrictionMessage(link.is_vip, link.access_level)
                    
                    const linkCard = (
                      <div 
                        key={link.id} 
                        onClick={canAccessLink ? () => handleLinkSelection(link) : () => handleVipRestrictionClick()}
                        className={`border border-white/20 transition-all duration-300 group transform rounded-lg ${
                          canAccessLink 
                            ? "bg-gray-800/80 hover:bg-gray-700 hover:border-blue-500/50 hover:scale-[1.02] hover:shadow-xl hover:shadow-blue-500/10 cursor-pointer"
                            : "bg-gray-700/50 border-gray-500/30 cursor-not-allowed opacity-60"
                        }`}
                      >
                        <div className="p-6">
                          <div className="flex items-center justify-between gap-6">
                            <div className="flex items-center gap-5 flex-grow">
                              <div className="relative">
                                <Avatar 
                                  src={link.icon_url || '/placeholder-icon.png'} 
                                  className={`w-16 h-16 border-2 transition-all duration-300 ${
                                    canAccessLink 
                                      ? "border-white/20 group-hover:border-blue-500/50" 
                                      : "border-gray-500/30"
                                  }`}
                                />
                                {(() => {
                                  const linkBadge = getLinkAccessBadge(link)
                                  if (linkBadge.label === 'Gratuit') return null
                                  
                                  const iconBgClass = linkBadge.label === 'Ultra' 
                                    ? 'bg-blue-primary'
                                    : 'bg-blue-secondary'
                                  
                                  return (
                                    <div className={`absolute -top-2 -right-2 w-6 h-6 ${iconBgClass} rounded-full flex items-center justify-center shadow-lg`}>
                                      <i className={`${linkBadge.icon} text-xs text-white`}></i>
                                    </div>
                                  )
                                })()}
                              </div>
                              <div className="flex-1">
                                <h4 className={`font-bold text-lg mb-2 transition-colors duration-300 ${
                                  canAccessLink 
                                    ? "text-white group-hover:text-white" 
                                    : "text-gray-400"
                                }`}>
                                  {link.title}
                                </h4>
                                <p className={`text-sm leading-relaxed ${
                                  canAccessLink ? "text-gray-400" : "text-gray-500"
                                }`}>
                                  {link.description}
                                </p>
                                <div className="flex items-center gap-2 mt-2">
                                  <i className="fas fa-eye text-gray-500 text-xs"></i>
                                  <span className="text-gray-500 text-xs">{link.views} vue{link.views > 1 ? 's' : ''}</span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-4 flex-shrink-0">
                               {(() => {
                                 const linkBadge = getLinkAccessBadge(link)
                                 return (
                                   <Chip 
                                     color={linkBadge.color} 
                                     size="sm" 
                                     variant="shadow" 
                                     startContent={<i className={linkBadge.icon}></i>}
                                     className={`${linkBadge.className} text-white shadow-lg`}
                                   >
                                     {linkBadge.label}
                                   </Chip>
                                 )
                               })()}
                               
                               {/* Bouton Signaler comme lien mort */}
                               {user && (
                                 <Tooltip 
                                   content={
                                     <div className="text-center">
                                       <p className="font-semibold">{t('gameDetail.reportDeadLink')}</p>
                                       <p className="text-xs text-gray-300 mt-1">
                                         {!canAccessLink 
                                           ? t('gameDetail.reportDeadLinkInfo')
                                           : t('gameDetail.reportDeadLinkNote')
                                         }
                                       </p>
                                     </div>
                                   }
                                   className="max-w-xs"
                                 >
                                   <Button
                                     isIconOnly
                                     size="sm"
                                     color="danger"
                                     variant={!canAccessLink ? "shadow" : "light"}
                                     onPress={() => openDeadLinkModal(link)}
                                     className={`w-8 h-8 transition-all duration-300 ${
                                       !canAccessLink 
                                         ? "text-red-300 hover:text-red-200 bg-red-500/20 hover:bg-red-500/30 shadow-red-500/25" 
                                         : "text-red-400 hover:text-red-300 hover:bg-red-500/20"
                                     }`}
                                   >
                                     <i className="fas fa-skull-crossbones text-xs"></i>
                                   </Button>
                                 </Tooltip>
                               )}
                               
                               <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                                 canAccessLink 
                                   ? "bg-blue-primary group-hover:bg-blue-hover" 
                                   : "bg-gray-600"
                               }`}>
                                 <i className={`fas fa-chevron-right text-white transition-transform duration-300 ${
                                   canAccessLink ? "group-hover:scale-125" : ""
                                 }`}></i>
                               </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )

                    // Si pas d'accès, envelopper dans une Tooltip
                    if (!canAccessLink) {
                      return (
                        <Tooltip
                          key={link.id}
                          content={restrictionMessage}
                          placement="top"
                          className="bg-black/90 text-white border border-white/20"
                          classNames={{
                            content: "bg-black/90 text-white border border-white/20 px-3 py-2"
                          }}
                        >
                          {linkCard}
                        </Tooltip>
                      )
                    }

                    return linkCard
                  })}
                </div>
              </ModalBody>
              <ModalFooter className="px-6 pb-6">
                <Button color="danger" variant="light" onPress={onClose} className="text-white hover:bg-red-500/20">
                  Fermer
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Modal Tutoriel Torrent */}
      <Modal isOpen={isTorrentTutorialOpen} onOpenChange={onTorrentTutorialOpenChange} size="md" backdrop="blur" placement="center">
        <ModalContent className="bg-[#18181b] border border-white/10 shadow-2xl rounded-xl max-w-md mx-auto">
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-2 items-center text-center pt-6">
                <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center mb-3 shadow-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 256 256" className="text-white">
                    <path d="M213.66,82.34l-56-56A8,8,0,0,0,152,24H56A16,16,0,0,0,40,40V216a16,16,0,0,0,16,16H200a16,16,0,0,0,16-16V88A8,8,0,0,0,213.66,82.34ZM160,51.31,188.69,80H160ZM200,216H56V40h88V88a8,8,0,0,0,8,8h48V216Z"/>
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white">Téléchargement Torrent</h3>
              </ModalHeader>
              <ModalBody className="px-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="text-white font-semibold mb-2">1. Vérifiez que vous avez qBittorrent :</h4>
                    <Button 
                      as="a"
                      href="https://www.qbittorrent.org/download.php" 
                      target="_blank"
                      color="default" 
                      variant="flat"
                      className="w-full"
                      startContent={
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 256 256">
                          <path d="M221.66,133.66l-72,72a8,8,0,0,1-11.32-11.32L196.69,136H40a8,8,0,0,1,0-16H196.69L138.34,61.66a8,8,0,0,1,11.32-11.32l72,72A8,8,0,0,1,221.66,133.66Z"/>
                        </svg>
                      }
                    >
                      Télécharger qBittorrent
                    </Button>
                  </div>

                  <div>
                    <h4 className="text-white font-semibold mb-2">2. Téléchargez le fichier torrent :</h4>
                    <Button 
                      color="success" 
                      variant="shadow"
                      className="w-full"
                      onPress={() => {
                        if (selectedLink) {
                          window.open(selectedLink.download_url, '_blank')
                        }
                      }}
                      startContent={
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 256 256">
                          <path d="M213.66,82.34l-56-56A8,8,0,0,0,152,24H56A16,16,0,0,0,40,40V216a16,16,0,0,0,16,16H200a16,16,0,0,0,16-16V88A8,8,0,0,0,213.66,82.34ZM160,51.31,188.69,80H160ZM200,216H56V40h88V88a8,8,0,0,0,8,8h48V216Z"/>
                        </svg>
                      }
                    >
                      Télécharger le fichier .torrent
                    </Button>
                  </div>

                  <div>
                    <h4 className="text-white font-semibold mb-2">3. Ouvrez le fichier avec qBittorrent :</h4>
                    <Button 
                      as="a"
                      href="/assets/tutoriel-torrent.mp4" 
                      target="_blank"
                      color="primary" 
                      variant="flat"
                      className="w-full"
                      startContent={
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 256 256">
                          <path d="M164.44,105.34l-48-32A8,8,0,0,0,104,80v64a8,8,0,0,0,12.44,6.66l48-32a8,8,0,0,0,0-13.32ZM120,129.05V95l25.58,17ZM216,40H40A16,16,0,0,0,24,56V168a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V56A16,16,0,0,0,216,40Zm0,128H40V56H216V168Zm16,40a8,8,0,0,1-8,8H32a8,8,0,0,1,0-16H224A8,8,0,0,1,232,208Z"/>
                        </svg>
                      }
                    >
                      Voir le tutoriel vidéo
                    </Button>
                  </div>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Fermer
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Modal Tutoriel DDL */}
      <Modal isOpen={isDDLTutorialOpen} onOpenChange={onDDLTutorialOpenChange} size="md" backdrop="blur" placement="center">
        <ModalContent className="bg-[#18181b] border border-white/10 shadow-2xl rounded-xl max-w-md mx-auto">
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-2 items-center text-center pt-6">
                <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mb-3 shadow-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 256 256" className="text-white">
                    <path d="M224,144v64a8,8,0,0,1-8,8H40a8,8,0,0,1-8-8V144a8,8,0,0,1,16,0v56H208V144a8,8,0,0,1,16,0Zm-101.66,5.66a8,8,0,0,0,11.32,0l40-40a8,8,0,0,0-11.32-11.32L136,124.69V32a8,8,0,0,0-16,0v92.69L93.66,98.34a8,8,0,0,0-11.32,11.32Z"/>
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white">Téléchargement Direct</h3>
              </ModalHeader>
              <ModalBody className="px-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="text-white font-semibold mb-2">1. Vérifiez vos prérequis :</h4>
                    <Button 
                      as="a"
                      href="https://www.potiongang.fr/prerequisites" 
                      target="_blank"
                      color="default" 
                      variant="flat"
                      className="w-full"
                      startContent={
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 256 256">
                          <path d="M221.66,133.66l-72,72a8,8,0,0,1-11.32-11.32L196.69,136H40a8,8,0,0,1,0-16H196.69L138.34,61.66a8,8,0,0,1,11.32-11.32l72,72A8,8,0,0,1,221.66,133.66Z"/>
                        </svg>
                      }
                    >
                      Accéder aux prérequis
                    </Button>
                  </div>

                  <div>
                    <h4 className="text-white font-semibold mb-2">2. Téléchargez le fichier :</h4>
                    <Button 
                      color="success" 
                      variant="shadow"
                      className="w-full"
                      onPress={() => {
                        if (selectedLink) {
                          window.open(selectedLink.download_url, '_blank')
                        }
                      }}
                      startContent={
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 256 256">
                          <path d="M224,144v64a8,8,0,0,1-8,8H40a8,8,0,0,1-8-8V144a8,8,0,0,1,16,0v56H208V144a8,8,0,0,1,16,0Zm-101.66,5.66a8,8,0,0,0,11.32,0l40-40a8,8,0,0,0-11.32-11.32L136,124.69V32a8,8,0,0,0-16,0v92.69L93.66,98.34a8,8,0,0,0-11.32,11.32Z"/>
                        </svg>
                      }
                    >
                      Télécharger maintenant
                    </Button>
                  </div>

                  <div>
                    <h4 className="text-white font-semibold mb-2">3. Extraire et installer :</h4>
                    <Button 
                      as="a"
                      href="/assets/tutoriel-ddl.mp4" 
                      target="_blank"
                      color="primary" 
                      variant="flat"
                      className="w-full"
                      startContent={
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 256 256">
                          <path d="M164.44,105.34l-48-32A8,8,0,0,0,104,80v64a8,8,0,0,0,12.44,6.66l48-32a8,8,0,0,0,0-13.32ZM120,129.05V95l25.58,17ZM216,40H40A16,16,0,0,0,24,56V168a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V56A16,16,0,0,0,216,40Zm0,128H40V56H216V168Zm16,40a8,8,0,0,1-8,8H32a8,8,0,0,1,0-16H224A8,8,0,0,1,232,208Z"/>
                        </svg>
                      }
                    >
                      Voir le tutoriel d'installation
                    </Button>
                  </div>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Fermer
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Modal Tutoriel Patch */}
      <Modal isOpen={isPatchTutorialOpen} onOpenChange={onPatchTutorialOpenChange} size="md" backdrop="blur" placement="center">
        <ModalContent className="bg-[#18181b] border border-white/10 shadow-2xl rounded-xl max-w-md mx-auto">
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-2 items-center text-center pt-6">
                <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center mb-3 shadow-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 256 256" className="text-white">
                    <path d="M227.31,73.37,182.63,28.68a16,16,0,0,0-22.63,0L36.69,152A15.86,15.86,0,0,0,32,163.31V208a16,16,0,0,0,16,16H92.69A15.86,15.86,0,0,0,104,219.31L227.31,96a16,16,0,0,0,0-22.63ZM92.69,208H48V163.31l88-88L180.69,120ZM192,108.68,147.31,64l24-24L216,84.68Z"/>
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white">Installation de Patch</h3>
              </ModalHeader>
              <ModalBody className="px-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="text-white font-semibold mb-2">1. Assurez-vous d'avoir le jeu de base installé</h4>
                    <p className="text-gray-300 text-sm">Ce patch nécessite que le jeu principal soit déjà installé sur votre ordinateur.</p>
                  </div>

                  <div>
                    <h4 className="text-white font-semibold mb-2">2. Téléchargez le patch :</h4>
                    <Button 
                      color="success" 
                      variant="shadow"
                      className="w-full"
                      onPress={() => {
                        if (selectedLink) {
                          window.open(selectedLink.download_url, '_blank')
                        }
                      }}
                      startContent={
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 256 256">
                          <path d="M224,144v64a8,8,0,0,1-8,8H40a8,8,0,0,1-8-8V144a8,8,0,0,1,16,0v56H208V144a8,8,0,0,1,16,0Zm-101.66,5.66a8,8,0,0,0,11.32,0l40-40a8,8,0,0,0-11.32-11.32L136,124.69V32a8,8,0,0,0-16,0v92.69L93.66,98.34a8,8,0,0,0-11.32,11.32Z"/>
                        </svg>
                      }
                    >
                      Télécharger le patch
                    </Button>
                  </div>

                  <div>
                    <h4 className="text-white font-semibold mb-2">3. Appliquez le patch :</h4>
                    <Button 
                      as="a"
                      href="/assets/tutoriel-patch.mp4" 
                      target="_blank"
                      color="primary" 
                      variant="flat"
                      className="w-full"
                      startContent={
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 256 256">
                          <path d="M164.44,105.34l-48-32A8,8,0,0,0,104,80v64a8,8,0,0,0,12.44,6.66l48-32a8,8,0,0,0,0-13.32ZM120,129.05V95l25.58,17ZM216,40H40A16,16,0,0,0,24,56V168a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V56A16,16,0,0,0,216,40Zm0,128H40V56H216V168Zm16,40a8,8,0,0,1-8,8H32a8,8,0,0,1,0-16H224A8,8,0,0,1,232,208Z"/>
                        </svg>
                      }
                    >
                      Voir le tutoriel d'application
                    </Button>
                  </div>

                  <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
                    <p className="text-yellow-200 text-sm">
                      <strong>⚠️ Important :</strong> Sauvegardez vos fichiers de sauvegarde avant d'appliquer le patch.
                    </p>
                  </div>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Fermer
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Modale de confirmation pour la demande de mise à jour */}
      <Modal isOpen={isUpdateRequestModalOpen} onOpenChange={onUpdateRequestModalOpenChange} backdrop="blur" placement="center" size="sm">
        <ModalContent className="bg-[#18181b] border border-white/10 shadow-2xl rounded-xl max-w-md mx-auto">
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-2 items-center text-center pt-6">
                <div className="w-16 h-16 bg-yellow-500 rounded-full flex items-center justify-center mb-3 shadow-lg">
                  <i className="fas fa-sync-alt text-2xl text-white"></i>
                </div>
                <h3 className="text-xl font-bold text-white">Demander une mise à jour</h3>
              </ModalHeader>
              <ModalBody className="text-center px-6">
                <p className="text-gray-300 mb-4 text-sm">
                  Êtes-vous sûr de vouloir demander une mise à jour pour ce jeu ?
                </p>
                <p className="text-gray-400 text-xs">
                  Cette demande sera envoyée aux administrateurs qui examineront la nécessité d'une mise à jour. 
                  Vous ne pouvez faire qu'une seule demande par jeu.
                </p>
              </ModalBody>
              <ModalFooter className="px-6 pb-6">
                <Button color="danger" variant="light" onPress={onClose} className="text-white hover:bg-red-500/20">
                  Annuler
                </Button>
                <Button 
                  color="warning" 
                  variant="shadow" 
                  onPress={handleUpdateRequest}
                  isLoading={updateRequestLoading}
                  className="bg-yellow-500 hover:bg-yellow-600 text-white" 
                >
                  Confirmer la demande
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Modale de confirmation pour le signalement de lien mort */}
      <Modal isOpen={isDeadLinkModalOpen} onOpenChange={onDeadLinkModalOpenChange} backdrop="blur" placement="center" size="sm">
        <ModalContent className="bg-[#18181b] border border-white/10 shadow-2xl rounded-xl max-w-md mx-auto">
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-2 items-center text-center pt-6">
                <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mb-3 shadow-lg">
                  <i className="fas fa-skull-crossbones text-2xl text-white"></i>
                </div>
                <h3 className="text-xl font-bold text-white">Signaler un lien mort</h3>
              </ModalHeader>
              <ModalBody className="text-center px-6">
                <p className="text-gray-300 mb-4 text-sm">
                  Êtes-vous sûr de vouloir signaler ce lien comme mort ?
                </p>
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <i className="fas fa-info-circle text-white"></i>
                    <p className="text-white font-semibold text-xs">Information importante</p>
                  </div>
                  <p className="text-gray-300 text-xs text-left">
                    Vous pouvez signaler un lien mort même si vous n'avez pas accès à ce contenu. 
                    Cela nous aide à maintenir la qualité de notre plateforme pour tous les utilisateurs.
                  </p>
                </div>
                {selectedLinkForReport && (
                  <div className="bg-gray-800/50 rounded-lg p-3 mb-4">
                    <p className="text-white font-semibold mb-1 text-sm">{selectedLinkForReport.title}</p>
                    <p className="text-gray-400 text-xs">{selectedLinkForReport.description}</p>
                    {(() => {
                      const linkBadge = getLinkAccessBadge(selectedLinkForReport)
                      if (linkBadge.label !== 'Gratuit') {
                        return (
                          <div className="mt-2">
                            <Chip 
                              color={linkBadge.color} 
                              size="sm" 
                              variant="shadow" 
                              startContent={<i className={linkBadge.icon}></i>}
                              className={`${linkBadge.className} text-white`}
                            >
                              {linkBadge.label}
                            </Chip>
                          </div>
                        )
                      }
                      return null
                    })()}
                  </div>
                )}
                <p className="text-gray-400 text-xs">
                  Ce signalement sera envoyé aux administrateurs qui examineront le lien. 
                  Vous ne pouvez signaler qu'une seule fois par lien.
                </p>
              </ModalBody>
              <ModalFooter className="px-6 pb-6">
                <Button color="primary" variant="light" onPress={onClose} className="text-white hover:bg-blue-500/20">
                  Annuler
                </Button>
                <Button 
                  color="danger" 
                  variant="shadow" 
                  onPress={handleDeadLinkReport}
                  isLoading={deadLinkReportLoading}
                  className="bg-red-500 hover:bg-red-600 text-white" 
                >
                  Confirmer le signalement
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Styles CSS personnalisés pour la scrollbar */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.3);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.3);
        }
      `}</style>
      
      </div>
      
      {/* Footer */}
      <Footer />
    </div>
  )
}
