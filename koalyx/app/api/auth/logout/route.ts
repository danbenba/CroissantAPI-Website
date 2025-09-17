import { NextResponse } from "next/server"

export async function POST() {
  try {
    const response = NextResponse.json({ 
      success: true, 
      message: "Déconnexion réussie - Token encrypté supprimé" 
    })

    // Supprimer le cookie du token encrypté
    response.cookies.set("auth-token", "", {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      expires: new Date(0), // Expire immédiatement
      path: "/",
    })

    console.log("[v0] Déconnexion - Token encrypté supprimé")
    return response
  } catch (error) {
    console.error("[v0] Logout error:", error)
    return NextResponse.json({ error: "Erreur lors de la déconnexion" }, { status: 500 })
  }
}
