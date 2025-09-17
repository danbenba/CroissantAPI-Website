import { type NextRequest, NextResponse } from "next/server"
import { TokenEncryption } from "@/lib/crypto"
import { executeQuery } from "@/lib/database"
import { writeFile, mkdir } from "fs/promises"
import { join } from "path"
import { existsSync } from "fs"

export async function POST(request: NextRequest) {
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

    // Vérifier le Content-Type
    const contentType = request.headers.get('content-type') || ''
    
    if (!contentType.includes('multipart/form-data')) {
      return NextResponse.json({ 
        error: "Content-Type doit être multipart/form-data pour l'upload de fichiers",
        received: contentType
      }, { status: 400 })
    }

    const formData = await request.formData()
    const photo = formData.get('photo') as File
    const userId = formData.get('userId') as string

    if (!photo) {
      return NextResponse.json({ error: "Aucune photo fournie" }, { status: 400 })
    }

    // Vérifier le type de fichier
    if (!photo.type.startsWith('image/')) {
      return NextResponse.json({ error: "Le fichier doit être une image" }, { status: 400 })
    }

    // Vérifier la taille (max 5MB)
    if (photo.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "L'image doit faire moins de 5MB" }, { status: 400 })
    }

    // Récupérer les informations utilisateur depuis la base de données
    const userResult = await executeQuery(
      "SELECT nom_utilisateur FROM utilisateurs WHERE id = ?",
      [tokenInfo.userId]
    ) as any[]

    if (!userResult || userResult.length === 0) {
      return NextResponse.json({ error: "Utilisateur non trouvé" }, { status: 404 })
    }

    const user = userResult[0]

    // Créer le dossier de profil s'il n'existe pas
    const profileDir = join(process.cwd(), 'storage', 'profile', user.nom_utilisateur)
    if (!existsSync(profileDir)) {
      await mkdir(profileDir, { recursive: true })
    }

    // Générer un nom de fichier unique avec pseudo + 32 caractères aléatoires
    const fileExtension = photo.name.split('.').pop() || 'jpg'
    const randomString = Array.from({length: 32}, () => 
      'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'.charAt(Math.floor(Math.random() * 62))
    ).join('')
    const fileName = `${user.nom_utilisateur}_${randomString}.${fileExtension}`
    const filePath = join(profileDir, fileName)

    // Lire et écrire le fichier
    const bytes = await photo.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filePath, buffer)

    // Construire l'URL relative
    const photoUrl = `/api/storage/profile/${user.nom_utilisateur}/${fileName}`

    // Mettre à jour la base de données
    await executeQuery(
      "UPDATE utilisateurs SET photo = ? WHERE id = ?",
      [photoUrl, tokenInfo.userId]
    )

    return NextResponse.json({ 
      success: true, 
      photoUrl: photoUrl 
    })

  } catch (error) {
    console.error("[v0] Error uploading photo:", error)
    return NextResponse.json({ 
      error: "Erreur lors du téléchargement de la photo" 
    }, { status: 500 })
  }
}
