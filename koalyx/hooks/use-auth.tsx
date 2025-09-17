"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import BanPopup from "@/components/ban-popup"

// Interface utilisateur compatible avec le nouveau système
interface AuthUser {
  id: number
  nom_utilisateur: string
  email: string
  role: string
  photo?: string
  discord_id?: string
  is_banned?: boolean
  ban_reason?: string
  banned_until?: string
}

interface BanInfo {
  reason: string
  bannedUntil?: string
  banDuration?: string
}

interface AuthContextType {
  user: AuthUser | null
  loading: boolean
  loadingMessage: string
  isBanned: boolean
  banInfo: BanInfo | null
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>
  register: (
    username: string,
    email: string,
    password: string,
    confirmPassword: string,
  ) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadingMessage, setLoadingMessage] = useState("Chargement de la session...")
  const [isBanned, setIsBanned] = useState(false)
  const [banInfo, setBanInfo] = useState<BanInfo | null>(null)

  const refreshUser = async () => {
    try {
      console.log("[v0] useAuth - Rafraîchissement de l'utilisateur...")
      setLoadingMessage("Chargement de la session...")
      
      const response = await fetch("/api/auth/me", {
        credentials: "include", // Important pour inclure les cookies
        cache: "no-cache" // Éviter la mise en cache
      })
      
      console.log("[v0] useAuth - Réponse API:", response.status)
      setLoadingMessage("Vérification...")
      
      if (response.ok) {
        const data = await response.json()
        console.log("[v0] useAuth - Données reçues:", data)
        
        if (data.user && data.success) {
          setUser(data.user)
          console.log("[v0] useAuth - Utilisateur défini:", data.user.nom_utilisateur)
          
          // Vérifier le statut de bannissement
          if (data.user.is_banned) {
            console.log("[v0] useAuth - Utilisateur banni détecté")
            setIsBanned(true)
            
            // Calculer la durée du bannissement
            let banDuration = ''
            if (data.user.banned_until) {
              const banEndDate = new Date(data.user.banned_until)
              const now = new Date()
              const timeDiff = banEndDate.getTime() - now.getTime()
              
              if (timeDiff > 0) {
                const days = Math.ceil(timeDiff / (1000 * 60 * 60 * 24))
                if (days > 365) {
                  banDuration = 'Bannissement permanent'
                } else if (days > 1) {
                  banDuration = `${days} jours restants`
                } else {
                  const hours = Math.ceil(timeDiff / (1000 * 60 * 60))
                  banDuration = `${hours} heures restantes`
                }
              } else {
                banDuration = 'Bannissement expiré'
              }
            } else {
              banDuration = 'Bannissement permanent'
            }
            
            setBanInfo({
              reason: data.user.ban_reason || 'Aucune raison spécifiée',
              bannedUntil: data.user.banned_until,
              banDuration
            })
          } else {
            setIsBanned(false)
            setBanInfo(null)
          }
        } else {
          console.log("[v0] useAuth - Aucun utilisateur valide")
          setUser(null)
          setIsBanned(false)
          setBanInfo(null)
        }
      } else {
        console.log("[v0] useAuth - Réponse non OK:", response.status)
        const data = await response.json()
        
        // Si le token est invalide, déconnecter automatiquement
        if (data.error && (data.error.includes("Token invalide") || data.error.includes("expiré"))) {
          console.log("[v0] useAuth - Token invalide, déconnexion automatique")
          setUser(null)
          // Optionnel : rediriger vers la page de connexion
          if (typeof window !== 'undefined') {
            window.location.href = '/login'
          }
        } else {
          setUser(null)
          setIsBanned(false)
          setBanInfo(null)
        }
      }
    } catch (error) {
      console.error("[v0] useAuth - Erreur lors du rafraîchissement:", error)
      setUser(null)
      setIsBanned(false)
      setBanInfo(null)
    } finally {
      setLoading(false)
    }
  }

  const login = async (username: string, password: string) => {
    try {
      console.log("[v0] useAuth - Tentative de connexion pour:", username)
      
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // Important pour inclure les cookies
        body: JSON.stringify({ username, password }),
      })

      const data = await response.json()
      console.log("[v0] useAuth - Réponse de connexion:", data)

      if (data.success) {
        setUser(data.user)
        console.log("[v0] useAuth - Connexion réussie pour:", data.user.nom_utilisateur)
        
        // Vérifier le bannissement lors de la connexion
        if (data.user.is_banned) {
          console.log("[v0] useAuth - Utilisateur banni détecté lors de la connexion")
          return { success: false, error: "Votre compte est suspendu. Contactez l'administration." }
        }
        
        return { success: true }
      } else {
        console.log("[v0] useAuth - Échec de connexion:", data.error)
        return { success: false, error: data.error }
      }
    } catch (error) {
      console.error("[v0] useAuth - Erreur de connexion:", error)
      return { success: false, error: "Erreur de connexion" }
    }
  }

  const register = async (username: string, email: string, password: string, confirmPassword: string) => {
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ username, email, password, confirmPassword }),
      })

      const data = await response.json()

      if (data.success) {
        setUser(data.user)
        return { success: true }
      } else {
        return { success: false, error: data.error }
      }
    } catch (error) {
      return { success: false, error: "Erreur lors de l'inscription" }
    }
  }

  const logout = async () => {
    try {
      console.log("[v0] useAuth - Déconnexion...")
      
      await fetch("/api/auth/logout", { 
        method: "POST",
        credentials: "include"
      })
      
      setUser(null)
      setIsBanned(false)
      setBanInfo(null)
      console.log("[v0] useAuth - Déconnexion réussie")
    } catch (error) {
      console.error("[v0] useAuth - Erreur de déconnexion:", error)
      setUser(null)
      setIsBanned(false)
      setBanInfo(null)
    }
  }

  // Vérifier l'authentification au chargement initial
  useEffect(() => {
    console.log("[v0] useAuth - Vérification initiale de l'authentification")
    refreshUser()
  }, [])

  // Vérifier l'authentification quand la page redevient visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && !user) {
        console.log("[v0] useAuth - Page redevenue visible, rafraîchissement...")
        refreshUser()
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange)

    // Vérifier aussi quand la fenêtre reprend le focus
    const handleFocus = () => {
      if (!user) {
        console.log("[v0] useAuth - Fenêtre reprend le focus, rafraîchissement...")
        refreshUser()
      }
    }

    window.addEventListener("focus", handleFocus)

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange)
      window.removeEventListener("focus", handleFocus)
    }
  }, [user])

  // Vérifier l'authentification toutes les 5 minutes
  useEffect(() => {
    if (user) {
      const interval = setInterval(() => {
        console.log("[v0] useAuth - Rafraîchissement périodique...")
        refreshUser()
      }, 5 * 60 * 1000) // 5 minutes

      return () => clearInterval(interval)
    }
  }, [user])

  return (
    <AuthContext.Provider value={{ user, loading, loadingMessage, isBanned, banInfo, login, register, logout, refreshUser }}>
      {children}
      
      {/* Popup de bannissement non-fermable */}
      {isBanned && banInfo && (
        <BanPopup 
          isOpen={isBanned} 
          banInfo={banInfo}
        />
      )}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
