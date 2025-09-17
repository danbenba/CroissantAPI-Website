"use client"

import Link from 'next/link'
import {
  Card,
  CardBody,
  Chip,
  Button,
  Image
} from "@heroui/react"
import { generateGameUrl } from '@/lib/slug'

// Fonction pour obtenir l'icône de plateforme
export const getPlatformIcon = (platform: string = ''): JSX.Element => {
  const p = platform.toLowerCase()

  if (/(windows|win|pc)/.test(p)) {
    return (
      <img 
        width="14" 
        height="14" 
        alt="Windows" 
        src="https://potiongang.fr/assets/windows-DEvRsgzQ.png"
        className="object-contain"
      />
    )
  }
  if (/android/.test(p)) {
    return (
      <img 
        width="14" 
        height="14" 
        alt="Android" 
        src="https://potiongang.fr/assets/android-ySOnKk9N.png"
        className="object-contain"
      />
    )
  }
  if (/(mac|macos|os ?x|apple|ios|iphone|ipad)/.test(p)) {
    return (
      <img 
        width="14" 
        height="14" 
        alt="Apple" 
        src="https://potiongang.fr/assets/apple-MUj67YEv.png"
        className="object-contain"
      />
    )
  }

  // fallback (par défaut Windows)
  return (
    <img 
      width="14" 
      height="14" 
      alt="Windows" 
      src="https://potiongang.fr/assets/windows-DEvRsgzQ.png"
      className="object-contain"
    />
  )
}

// --- Interfaces ---
export interface Game {
  id: number
  title: string
  description: string
  banner_url: string
  sidebar_image_url?: string
  is_vip: boolean
  access_level: 'free' | 'plus' | 'ultra'
  category_id: number
  platform: string
  year: number
  created_at: string
  updated_at?: string
  views: number
  badges?: GameBadge[]
}

export interface GameBadge {
  id: number
  name: string
  display_name: string
  color: string
  icon: string
  expires_at: string
}

export interface Category {
  id: number
  name: string
  type: string
}

interface GamesGridProps {
  games: Game[]
  categories?: Category[]
  viewMode?: 'grid' | 'list'
  showTrendingNumbers?: boolean
  showNewBadge?: boolean
  emptyStateIcon?: string
  emptyStateTitle?: string
  emptyStateDescription?: string
  className?: string
  gridClassName?: string
}

// Fonction pour obtenir la couleur de la catégorie
export const getCategoryColor = (categoryId: number, categories: Category[] = []): "danger" | "success" | "secondary" | "primary" | "warning" | "default" => {
  const category = categories.find(cat => cat.id === categoryId)
  if (!category) return 'default'
  switch (category.type) {
    case 'action': return 'danger'
    case 'aventure': return 'success'
    case 'rpg': return 'secondary'
    case 'strategy': return 'primary'
    case 'sport': return 'warning'
    case 'racing': return 'warning'
    default: return 'primary'
  }
}

// Fonction pour obtenir le nom de la catégorie
export const getCategoryName = (categoryId: number, categories: Category[] = []) => {
  return categories.find(cat => cat.id === categoryId)?.name || 'Inconnu'
}

// Fonction pour obtenir l'icône de la plateforme

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

export default function GamesGrid({
  games,
  categories = [],
  viewMode = 'grid',
  showTrendingNumbers = false,
  showNewBadge = true,
  emptyStateIcon = 'fas fa-gamepad',
  emptyStateTitle = 'Aucun jeu trouvé',
  emptyStateDescription = 'Aucun jeu ne correspond à vos critères',
  className = '',
  gridClassName = ''
}: GamesGridProps) {

  // État vide
  if (games.length === 0) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <div className="w-20 h-20 bg-gradient-to-br from-gray-700 to-gray-900 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg animate-bounce">
          <i className={`${emptyStateIcon} text-3xl text-gray-400`}></i>
        </div>
        <h3 className="text-2xl font-bold text-white mb-2">{emptyStateTitle}</h3>
        <p className="text-gray-400 text-lg">{emptyStateDescription}</p>
      </div>
    )
  }

  // Vue Grille
  if (viewMode === 'grid') {
    return (
      <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 ${gridClassName} ${className}`}>
        {games.map((game, index) => (
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
                {showTrendingNumbers && (
                  <Chip 
                    color="warning" 
                    variant="shadow" 
                    startContent={<i className="fas fa-fire text-orange-300"></i>}
                    className="bg-gradient-to-r from-orange-500 to-red-600 text-white font-semibold"
                  >
                    #{index + 1}
                  </Chip>
                )}
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
    )
  }

  // Vue Liste
  return (
    <div className={`space-y-4 ${className}`}>
      {games.map((game) => (
        <Link key={game.id} href={generateGameUrl(game.id, game.title) as any} className="block group">
          <Card className="bg-gray-800/50 backdrop-blur-lg border border-white/10 hover:border-blue-500/50 transition-all duration-300">
            <CardBody>
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <Image
                  src={game.banner_url || '/placeholder-game.png'}
                  alt={game.title}
                  className="w-full sm:w-48 h-48 sm:h-32 object-cover rounded-xl shadow-lg"
                />
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-100 group-hover:text-blue-400 transition-colors">
                    {game.title}
                  </h3>
                  <p className="text-gray-400 line-clamp-2 mt-1">{game.description}</p>
                  <div className="flex items-center flex-wrap gap-2 mt-3 text-sm">
                    <Chip color={getCategoryColor(game.category_id, categories)} size="sm" variant="flat">
                      {getCategoryName(game.category_id, categories)}
                    </Chip>
                    <Chip variant="flat" size="sm" startContent={getPlatformIcon(game.platform)}>
                      {game.platform}
                    </Chip>
                    <Chip variant="flat" size="sm" startContent={<i className="fas fa-calendar" />}>
                      {game.year}
                    </Chip>
                    {(() => {
                      const accessBadge = getAccessBadge(game)
                      return (
                        <Chip 
                          color={accessBadge.color}
                          size="sm" 
                          variant="shadow" 
                          startContent={<i className={accessBadge.icon}></i>}
                          className={`${accessBadge.className} text-white shadow-lg`}
                        >
                          {accessBadge.label}
                        </Chip>
                      )
                    })()}
                  </div>
                </div>
                <Button isIconOnly color="primary" variant="ghost" className="hidden sm:flex group-hover:scale-110 group-hover:bg-blue-500/20 transition-transform">
                  <i className="fas fa-chevron-right"></i>
                </Button>
              </div>
            </CardBody>
          </Card>
        </Link>
      ))}
    </div>
  )
}
