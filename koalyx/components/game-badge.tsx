import React from 'react'
import { Chip } from "@heroui/react"

interface GameBadgeProps {
  badge: {
    name: string
    display_name: string
    color: string
    icon: string
    expires_at: string
  }
  className?: string
  size?: "sm" | "md" | "lg"
  variant?: "solid" | "bordered" | "light" | "flat" | "faded" | "shadow"
}

export default function GameBadge({ 
  badge, 
  className = '', 
  size = "sm",
  variant = "solid"
}: GameBadgeProps) {
  // Vérifier si le badge n'a pas expiré
  const isExpired = new Date(badge.expires_at) < new Date()
  
  if (isExpired) {
    return null
  }

  // Mapper les couleurs des badges vers les couleurs HeroUI
  const getChipColor = (color: string) => {
    if (color.includes('red') || color.includes('#ff') || color.includes('rgb(255')) return 'danger'
    if (color.includes('green') || color.includes('#00') || color.includes('rgb(0')) return 'success'
    if (color.includes('blue') || color.includes('#0000ff') || color.includes('rgb(0,0,255')) return 'primary'
    if (color.includes('yellow') || color.includes('#ffff00') || color.includes('rgb(255,255,0')) return 'warning'
    if (color.includes('purple') || color.includes('#800080') || color.includes('rgb(128,0,128')) return 'secondary'
    if (color.includes('orange') || color.includes('#ffa500') || color.includes('rgb(255,165,0')) return 'warning'
    return 'default'
  }

  // Convertir l'icône HTML en icône simple ou utiliser une icône par défaut
  const getIcon = (icon: string) => {
    if (icon.includes('🔥')) return '🔥'
    if (icon.includes('⭐')) return '⭐'
    if (icon.includes('💎')) return '💎'
    if (icon.includes('🎮')) return '🎮'
    if (icon.includes('🚀')) return '🚀'
    if (icon.includes('⚡')) return '⚡'
    if (icon.includes('🏆')) return '🏆'
    if (icon.includes('💯')) return '💯'
    if (icon.includes('🎯')) return '🎯'
    if (icon.includes('🌟')) return '🌟'
    // Si c'est du HTML, essayer d'extraire le texte
    const tempDiv = document.createElement('div')
    tempDiv.innerHTML = icon
    const textContent = tempDiv.textContent || tempDiv.innerText || ''
    if (textContent.trim()) return textContent.trim()
    return '🏷️' // Icône par défaut
  }

  return (
    <Chip
      color={getChipColor(badge.color)}
      variant={variant}
      size={size}
      className={`${className} font-medium`}
      startContent={<span className="text-sm">{getIcon(badge.icon)}</span>}
    >
      {badge.display_name}
    </Chip>
  )
}
