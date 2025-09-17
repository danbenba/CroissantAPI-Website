import { type NextRequest, NextResponse } from "next/server"
import { authenticateUser } from "@/lib/auth"
import { TokenEncryption } from "@/lib/crypto"
import { executeQuery } from "@/lib/database"
import { validateInput, createErrorResponse, createSuccessResponse, ValidationSchema, sanitizeHtml } from "@/lib/api-security"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Schéma de validation pour le login
    const schema: ValidationSchema = {
      username: {
        required: true,
        type: 'string',
        minLength: 3,
        maxLength: 50,
        pattern: /^[a-zA-Z0-9_.-]+$/
      },
      password: {
        required: true,
        type: 'string',
        minLength: 1,
        maxLength: 128
      }
    }

    const validation = validateInput(body, schema)
    if (!validation.valid) {
      return createErrorResponse(`Données invalides: ${validation.errors.join(', ')}`, 400)
    }

    const { username, password } = validation.sanitized

    const user = await authenticateUser(username, password)

    if (!user) {
      return createErrorResponse("Identifiants invalides", 401)
    }

    // Vérifier si l'utilisateur est banni
    const userStatus = await executeQuery(
      'SELECT is_banned, ban_reason, banned_until FROM utilisateurs WHERE id = ?',
      [user.id]
    )

    if (userStatus.length > 0 && userStatus[0].is_banned) {
      const banInfo = userStatus[0]
      let banMessage = `Votre compte a été banni. Raison: ${banInfo.ban_reason}`
      
      if (banInfo.banned_until) {
        const banDate = new Date(banInfo.banned_until)
        const now = new Date()
        
        if (banDate > now) {
          banMessage += `. Bannissement jusqu'au ${banDate.toLocaleDateString('fr-FR')}`
        } else {
          // Le bannissement est expiré, le débloquer automatiquement
          await executeQuery(`
            UPDATE utilisateurs 
            SET is_banned = 0, ban_reason = NULL, banned_until = NULL, updated_at = NOW()
            WHERE id = ?
          `, [user.id])
          
          // Mettre à jour l'historique
          await executeQuery(`
            UPDATE user_ban_history 
            SET unbanned_at = NOW(), unbanned_by = 'Système (expiration)'
            WHERE user_id = ? AND unbanned_at IS NULL
          `, [user.id])
        }
      } else {
        banMessage += '. Bannissement permanent'
      }
      
      return createErrorResponse(banMessage, 403)
    }

    // Mettre à jour la dernière connexion
    await executeQuery(
      'UPDATE utilisateurs SET last_login = NOW() WHERE id = ?',
      [user.id]
    )

    // Générer un token encrypté AES-256-B valable 1 semaine
    const encryptedToken = TokenEncryption.generateToken(user.id, user.role)

    const response = createSuccessResponse({
      user: {
        id: user.id,
        nom_utilisateur: user.nom_utilisateur,
        email: user.email,
        role: user.role,
        photo: user.photo
      }
    }, "Connexion réussie avec token encrypté AES-256-B")

    // Définir le cookie avec le token encrypté
    response.cookies.set("auth-token", encryptedToken, {
      httpOnly: false, // Accessible côté client pour le debug
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 jours (1 semaine)
      path: "/", // Accessible partout sur le site
    })

    console.log(`[v0] Connexion réussie pour ${username} (${user.role}) avec token encrypté`)

    return response
  } catch (error) {
    console.error("Erreur login:", error)
    return createErrorResponse("Erreur interne du serveur", 500)
  }
}
