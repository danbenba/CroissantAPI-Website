import { NextRequest } from 'next/server'
import { TokenEncryption } from "@/lib/crypto"
import { db } from "@/lib/database"

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

interface UserRow {
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

/**
 * Récupère l'utilisateur authentifié depuis la requête
 * Compatible avec le système d'authentification custom du projet
 */
export async function getCurrentUser(request: NextRequest): Promise<AuthUser | null> {
  try {
    const token = request.cookies.get("auth-token")?.value

    if (!token) {
      return null
    }

    // Déchiffrer et valider le token AES-256
    const tokenInfo = TokenEncryption.getTokenInfo(token)

    if (!tokenInfo) {
      return null
    }

    // Récupérer les informations utilisateur depuis la base de données
    const [result] = await db.execute(
      "SELECT id, nom_utilisateur, email, role, photo, discord_id, is_banned, ban_reason, banned_until FROM utilisateurs WHERE id = ?",
      [tokenInfo.userId]
    )

    const users = Array.isArray(result) ? result : [result]

    if (!users || users.length === 0) {
      return null
    }

    const user = users[0] as UserRow

    // Vérifier que le rôle correspond
    if (user.role !== tokenInfo.role) {
      return null
    }

    // Vérifier que l'utilisateur n'est pas banni
    if (user.is_banned) {
      return null
    }

    return {
      id: user.id,
      nom_utilisateur: user.nom_utilisateur,
      email: user.email,
      role: user.role,
      photo: user.photo || undefined,
      discord_id: user.discord_id || undefined,
      is_banned: user.is_banned || false,
      ban_reason: user.ban_reason || undefined,
      banned_until: user.banned_until || undefined
    }
  } catch (error) {
    console.error('Erreur lors de l\'authentification:', error)
    return null
  }
}

/**
 * Vérifie si l'utilisateur a le bon rôle pour accéder à une ressource
 */
export function hasRole(user: AuthUser | null, allowedRoles: string[]): boolean {
  if (!user) return false
  return allowedRoles.includes(user.role)
}

/**
 * Vérifie si l'utilisateur peut accéder aux fonctions de support
 */
export function canAccessSupport(user: AuthUser | null): boolean {
  return hasRole(user, ['admin', 'support'])
}

/**
 * Vérifie si l'utilisateur peut gérer un ticket spécifique
 */
export function canManageTicket(user: AuthUser | null, ticketUserId: number, assignedToId?: number): boolean {
  if (!user) return false
  
  // L'admin peut tout gérer
  if (user.role === 'admin') return true
  
  // Le créateur du ticket peut le gérer
  if (user.id === ticketUserId) return true
  
  // Le support assigné peut le gérer
  if (user.role === 'support' && assignedToId === user.id) return true
  
  return false
}
