import { type NextRequest, NextResponse } from "next/server"
import { verifyPassword, hashPassword } from "@/lib/auth"
import { TokenEncryption } from "@/lib/crypto"
import { executeQuery } from "@/lib/database"

export async function PUT(request: NextRequest) {
  try {
    const token = request.cookies.get("auth-token")?.value

    if (!token) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 })
    }

    // Déchiffrer et valider le token AES-256-B
    const tokenInfo = TokenEncryption.getTokenInfo(token)
    if (!tokenInfo) {
      return NextResponse.json({ error: "Token invalide ou expiré" }, { status: 401 })
    }

    const { currentPassword, newPassword } = await request.json()

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: "Mots de passe requis" }, { status: 400 })
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: "Le nouveau mot de passe doit contenir au moins 6 caractères" },
        { status: 400 },
      )
    }

    // Get current user data
    const users = (await executeQuery("SELECT mot_de_passe FROM utilisateurs WHERE id = ?", [tokenInfo.userId])) as any[]

    if (users.length === 0) {
      return NextResponse.json({ error: "Utilisateur non trouvé" }, { status: 404 })
    }

    // Verify current password
    const isValidPassword = await verifyPassword(currentPassword, users[0].mot_de_passe)
    if (!isValidPassword) {
      return NextResponse.json({ error: "Mot de passe actuel incorrect" }, { status: 400 })
    }

    // Hash new password and update
    const hashedNewPassword = await hashPassword(newPassword)
    await executeQuery("UPDATE utilisateurs SET mot_de_passe = ? WHERE id = ?", [hashedNewPassword, tokenInfo.userId])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error updating password:", error)
    return NextResponse.json({ error: "Erreur lors de la mise à jour du mot de passe" }, { status: 500 })
  }
}
