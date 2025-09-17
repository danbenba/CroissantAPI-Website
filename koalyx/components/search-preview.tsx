"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { generateGameUrl } from '@/lib/slug'
import { useLanguage } from '@/contexts/LanguageContext'
import { Game, Category, getPlatformIcon } from '@/components/games-grid'
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownSection,
  DropdownItem,
  Button,
  cn,
  Chip,
} from "@heroui/react"

// Icônes personnalisées
export const SearchIcon = (props: any) => {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      focusable="false"
      height="1em"
      role="presentation"
      viewBox="0 0 24 24"
      width="1em"
      {...props}
    >
      <path
        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export const GameIcon = (props: any) => {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      focusable="false"
      height="1em"
      role="presentation"
      viewBox="0 0 24 24"
      width="1em"
      {...props}
    >
      <path
        d="M17.5 12c.96 0 1.75.79 1.75 1.75s-.79 1.75-1.75 1.75-1.75-.79-1.75-1.75.79-1.75 1.75-1.75zm-3-4c.96 0 1.75.79 1.75 1.75S15.46 11.5 14.5 11.5s-1.75-.79-1.75-1.75S13.54 8 14.5 8zM12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
        fill="currentColor"
      />
    </svg>
  )
}

export const ViewAllIcon = (props: any) => {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      focusable="false"
      height="1em"
      role="presentation"
      viewBox="0 0 24 24"
      width="1em"
      {...props}
    >
      <path
        d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

interface SearchPreviewProps {
  searchTerm: string
  games: Game[]
  categories: Category[]
  onClose: () => void
  maxResults?: number
  isOpen?: boolean
  isPositioned?: boolean
}

export default function SearchPreview({
  searchTerm,
  games,
  categories,
  onClose,
  maxResults = 3,
  isOpen = false,
  isPositioned = false
}: SearchPreviewProps) {
  const router = useRouter()
  const { t } = useLanguage()
  const [searchResults, setSearchResults] = useState<Game[]>([])

  const iconClasses = "text-small text-default-500 pointer-events-none shrink-0"

  // Fonction pour obtenir le nom de la catégorie
  const getCategoryName = (categoryId: number) => {
    const category = categories.find(cat => cat.id === categoryId)
    return category ? category.name : 'Inconnu'
  }

  // Effectuer la recherche quand le terme change
  useEffect(() => {
    if (searchTerm.trim()) {
      const filtered = games.filter(game => 
        game.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        game.description.toLowerCase().includes(searchTerm.toLowerCase())
      ).slice(0, maxResults)

      setSearchResults(filtered)
    } else {
      setSearchResults([])
    }
  }, [searchTerm, games, maxResults])

  if (!searchTerm.trim() || searchResults.length === 0) {
    return null
  }

  const handleGameClick = (gameId: number, gameTitle: string) => {
    window.location.href = generateGameUrl(gameId, gameTitle)
    onClose()
  }

  const handleViewAllClick = () => {
    router.push(`/explore?search=${encodeURIComponent(searchTerm.trim())}` as any)
    onClose()
  }

  return (
    <Dropdown isOpen={isOpen} onOpenChange={onClose} placement="bottom-start">
      <DropdownTrigger>
        <div></div>
      </DropdownTrigger>
       <DropdownMenu 
         aria-label="Search results" 
         variant="faded"
         className="w-64"
         onAction={() => {}} // Empêche la fermeture automatique
       >
        <DropdownSection 
          title={`Résultats de recherche (${searchResults.length})`}
          showDivider
          className="text-white"
        >
          {searchResults.map((game) => (
            <DropdownItem
              key={game.id}
              description={
                <div className="flex flex-col gap-1 text-white">
                  <p className="text-xs text-white/70 line-clamp-1">
                    {game.description}
                  </p>
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Plateforme */}
                    <div className="flex items-center gap-1">
                      {getPlatformIcon(game.platform)}
                      <span className="text-xs text-white/60">{game.platform}</span>
                    </div>
                    
                    {/* Vues */}
                    <div className="flex items-center gap-1">
                      <i className="fas fa-eye text-xs text-white/60"></i>
                      <span className="text-xs text-white/60">{game.views || 0}</span>
                    </div>

                    {/* Niveau d'accès */}
                    <Chip
                      size="sm"
                      variant="flat"
                      className={cn(
                        "text-xs h-4 min-h-4",
                        game.access_level === 'free' 
                          ? 'bg-success-100 text-success-600 dark:bg-success-900/20 dark:text-success-400'
                          : game.access_level === 'plus'
                          ? 'bg-warning-100 text-warning-600 dark:bg-warning-900/20 dark:text-warning-400'
                          : 'bg-secondary-100 text-secondary-600 dark:bg-secondary-900/20 dark:text-secondary-400'
                      )}
                    >
                      {game.access_level === 'free' ? 'Gratuit' : 
                       game.access_level === 'plus' ? 'Plus' : 'Ultra'}
                    </Chip>
                  </div>
                </div>
              }
              startContent={
                (game as any).sidebar_image_url || game.banner_url ? (
                  <div className="w-[40px] h-[60px] sm:w-[60px] sm:h-[80px] rounded-md overflow-hidden bg-default-200 shrink-0">
                    <img
                      src={(game as any).sidebar_image_url || game.banner_url}
                      alt={game.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-[40px] h-[60px] sm:w-[60px] sm:h-[80px] rounded-md bg-gradient-to-br from-default-200 to-default-300 flex items-center justify-center shrink-0">
                    <GameIcon className={iconClasses} />
                  </div>
                )
              }
                      onPress={() => handleGameClick(game.id, game.title)}
              className="py-3"
            >
              <span className="font-medium text-sm text-white">{game.title}</span>
            </DropdownItem>
          ))}
        </DropdownSection>
        
        <DropdownSection className="text-white">
          <DropdownItem
            key="view-all"
            description="Voir tous les résultats de recherche"
            startContent={<ViewAllIcon className={cn(iconClasses, "text-white")} />}
            onPress={handleViewAllClick}
            className="text-white"
          >
            <span className="text-white">Voir tous les résultats</span>
          </DropdownItem>
        </DropdownSection>
      </DropdownMenu>
    </Dropdown>
  )
}
