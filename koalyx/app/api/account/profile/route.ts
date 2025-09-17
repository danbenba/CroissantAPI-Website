import { type NextRequest, NextResponse } from "next/server"
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

    const { nom_utilisateur, email, photo } = await request.json()

    // Check if username or email already exists for other users
    const existingUsers = (await executeQuery(
      "SELECT id FROM utilisateurs WHERE (nom_utilisateur = ? OR email = ?) AND id != ?",
      [nom_utilisateur, email, tokenInfo.userId],
    )) as any[]

    if (existingUsers.length > 0) {
      return NextResponse.json({ error: "Nom d'utilisateur ou email déjà utilisé" }, { status: 400 })
    }

    await executeQuery("UPDATE utilisateurs SET nom_utilisateur = ?, email = ?, photo = ? WHERE id = ?", [
      nom_utilisateur,
      email,
      photo || null,
      tokenInfo.userId,
    ])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error updating profile:", error)
    return NextResponse.json({ error: "Erreur lors de la mise à jour du profil" }, { status: 500 })
  }
}
