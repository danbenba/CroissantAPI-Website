"use client"

import { useState, useEffect } from 'react'
import { secureGet, securePost } from '@/lib/api-client'
import { useAuth } from './use-auth'

export function useFavorites(gameId?: number) {
  const [isFavorite, setIsFavorite] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { user } = useAuth()

  // Vérifier si un jeu est favori
  const checkFavorite = async (id: number) => {
    if (!user || !id) return false
    
    try {
      const response = await secureGet(`/api/favorites/check?gameId=${id}`)
      const data = await response.json()
      return data.isFavorite || false
    } catch (error) {
      console.error('Erreur lors de la vérification du favori:', error)
      return false
    }
  }

  // Basculer le statut favori
  const toggleFavorite = async (id: number) => {
    if (!user || !id) return { success: false, message: 'Utilisateur non connecté' }
    
    setIsLoading(true)
    try {
      const response = await securePost('/api/favorites', { gameId: id, action: isFavorite ? 'remove' : 'add' })

      const data = await response.json()
      
      if (data.success) {
        setIsFavorite(data.action === 'added')
        return { success: true, action: data.action, message: data.message }
      } else {
        return { success: false, message: data.message }
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour du favori:', error)
      return { success: false, message: 'Erreur lors de la mise à jour' }
    } finally {
      setIsLoading(false)
    }
  }

  // Récupérer tous les favoris de l'utilisateur
  const getFavorites = async () => {
    if (!user) return []
    
    try {
      const response = await secureGet('/api/favorites')
      const data = await response.json()
      return data.success ? data.favorites : []
    } catch (error) {
      console.error('Erreur lors de la récupération des favoris:', error)
      return []
    }
  }

  // Effet pour vérifier le statut favori du jeu courant
  useEffect(() => {
    if (gameId && user) {
      checkFavorite(gameId).then(setIsFavorite)
    }
  }, [gameId, user])

  return {
    isFavorite,
    isLoading,
    toggleFavorite,
    getFavorites,
    checkFavorite
  }
}
