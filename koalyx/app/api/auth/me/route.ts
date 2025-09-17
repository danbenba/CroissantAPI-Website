import { type NextRequest, NextResponse } from "next/server"
import { TokenEncryption } from "@/lib/crypto"
import { db } from "@/lib/database"

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

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("auth-token")?.value

    console.log("[v0] Auth check - Token:", token ? "Présent" : "Absent")

    if (!token) {
      console.log("[v0] Auth check - Aucun token trouvé")
      return NextResponse.json({ user: null, error: "Aucun token d'authentification" })
    }

    // Déchiffrer et valider le token AES-256-B
    const tokenInfo = TokenEncryption.getTokenInfo(token)

    if (!tokenInfo) {
      console.log("[v0] Auth check - Token invalide ou expiré")
      return NextResponse.json({ user: null, error: "Token invalide ou expiré" })
    }

    // Récupérer les informations utilisateur depuis la base de données
    const [result] = await db.execute(
      "SELECT id, nom_utilisateur, email, role, photo, discord_id, is_banned, ban_reason, banned_until FROM utilisateurs WHERE id = ?",
      [tokenInfo.userId]
    )

    const users = Array.isArray(result) ? result : [result]

    if (!users || users.length === 0) {
      console.log("[v0] Auth check - Utilisateur non trouvé en base")
      return NextResponse.json({ user: null, error: "Utilisateur non trouvé" })
    }

    const user = users[0] as UserRow

    // Vérifier que le rôle correspond
    if (user.role !== tokenInfo.role) {
      console.log("[v0] Auth check - Rôle modifié, token invalide")
      return NextResponse.json({ user: null, error: "Token invalide (rôle modifié)" })
    }

    console.log(`[v0] Auth check - Utilisateur authentifié: ${user.nom_utilisateur} (${user.role})`)
    
    return NextResponse.json({ 
      user: {
        id: user.id,
        nom_utilisateur: user.nom_utilisateur,
        email: user.email,
        role: user.role,
        photo: user.photo || undefined,
        discord_id: user.discord_id || undefined,
        is_banned: user.is_banned || false,
        ban_reason: user.ban_reason || undefined,
        banned_until: user.banned_until || undefined
      }, 
      success: true,
      tokenInfo: {
        expiresAt: new Date(tokenInfo.expiresAt).toISOString(),
        remainingTime: Math.max(0, tokenInfo.expiresAt - Date.now())
      }
    })
  } catch (error) {
    console.error("[v0] Auth check error:", error)
    return NextResponse.json({ user: null, error: "Erreur lors de la vérification" })
  }
}
