import { NextRequest, NextResponse } from 'next/server'
import { executeQuery } from '@/lib/database'
import { TokenEncryption } from '@/lib/crypto'
import type { User } from '@/lib/database'

const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID || "1398032410926518392"
const DISCORD_CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET || "Oqv5S53SDsKhO1znLCb1zMvl360bfoGD"
const DISCORD_REDIRECT_URI = process.env.DISCORD_REDIRECT_URI || `http://localhost:3000/api/auth/discord/callback`
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"

interface DiscordTokenResponse {
  access_token: string
  token_type: string
  expires_in: number
  refresh_token: string
  scope: string
}

interface DiscordUser {
  id: string
  username: string
  email: string | null
  avatar: string | null
  discriminator: string
  global_name: string | null
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const code = searchParams.get('code')
    const state = searchParams.get('state')
    const error = searchParams.get('error')

    // Vérifier si c'est une liaison de compte ou une connexion normale
    const action = request.cookies.get('discord_oauth_action')?.value
    const isLinking = action === 'link'

    // Vérifier les erreurs de Discord
    if (error) {
      const redirectUrl = isLinking ? '/account?error=discord_cancelled' : '/login?error=discord_cancelled'
      return NextResponse.redirect(`${APP_URL}${redirectUrl}`)
    }

    if (!code || !state) {
      const redirectUrl = isLinking ? '/account?error=missing_code' : '/login?error=missing_code'
      return NextResponse.redirect(`${APP_URL}${redirectUrl}`)
    }

    // Vérifier le state CSRF
    const storedState = request.cookies.get('discord_oauth_state')?.value
    if (!storedState || storedState !== state) {
      const redirectUrl = isLinking ? '/account?error=invalid_state' : '/login?error=invalid_state'
      return NextResponse.redirect(`${APP_URL}${redirectUrl}`)
    }

    // Échanger le code contre un token d'accès
    const tokenResponse = await fetch('https://discord.com/api/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: DISCORD_CLIENT_ID!,
        client_secret: DISCORD_CLIENT_SECRET!,
        grant_type: 'authorization_code',
        code,
        redirect_uri: DISCORD_REDIRECT_URI,
      }),
    })

    if (!tokenResponse.ok) {
      throw new Error('Failed to exchange code for token')
    }

    const tokenData: DiscordTokenResponse = await tokenResponse.json()

    // Récupérer les informations de l'utilisateur Discord
    const userResponse = await fetch('https://discord.com/api/users/@me', {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    })

    if (!userResponse.ok) {
      throw new Error('Failed to fetch user data from Discord')
    }

    const discordUser: DiscordUser = await userResponse.json()

    if (isLinking) {
      // Mode liaison : vérifier que l'utilisateur est connecté et lier le compte Discord
      const token = request.cookies.get('auth-token')?.value
      if (!token) {
        return NextResponse.redirect(`${APP_URL}/account?error=not_authenticated`)
      }

      // Utiliser le même système de vérification que l'API /me
      const tokenInfo = TokenEncryption.getTokenInfo(token)
      if (!tokenInfo) {
        return NextResponse.redirect(`${APP_URL}/account?error=invalid_token`)
      }

      // Récupérer les informations utilisateur depuis la base de données
      const userResults = await executeQuery<User[]>(
        'SELECT * FROM utilisateurs WHERE id = ? AND actif = TRUE',
        [tokenInfo.userId]
      )

      if (userResults.length === 0) {
        return NextResponse.redirect(`${APP_URL}/account?error=user_not_found`)
      }

      const authUser = userResults[0]

      // Vérifier si ce Discord ID est déjà utilisé par un autre compte
      const existingDiscordUsers = await executeQuery<User[]>(
        'SELECT id FROM utilisateurs WHERE discord_id = ? AND id != ?',
        [discordUser.id, authUser.id]
      )

      if (existingDiscordUsers.length > 0) {
        return NextResponse.redirect(`${APP_URL}/account?error=discord_already_linked`)
      }

      // Lier le compte Discord à l'utilisateur connecté
      await executeQuery(
        'UPDATE utilisateurs SET discord_id = ? WHERE id = ?',
        [discordUser.id, authUser.id]
      )

      const response = NextResponse.redirect(`${APP_URL}/account?success=discord_linked`)
      response.cookies.delete('discord_oauth_state')
      response.cookies.delete('discord_oauth_action')
      
      return response
    } else {
      // Mode connexion : vérifier si un utilisateur existe avec cet ID Discord
      const existingUsers = await executeQuery<User[]>(
        'SELECT * FROM utilisateurs WHERE discord_id = ? AND actif = TRUE',
        [discordUser.id]
      )

      if (existingUsers.length > 0) {
        // Utilisateur existant - connexion directe
        const user = existingUsers[0]
        
        // Mettre à jour la dernière connexion
        await executeQuery(
          'UPDATE utilisateurs SET derniere_connexion = NOW(), last_login = NOW() WHERE id = ?',
          [user.id]
        )

        // Log de connexion
        await executeQuery(
          'INSERT INTO logs_connexion (utilisateur_id, adresse_ip, succes) VALUES (?, ?, TRUE)',
          [user.id, request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown']
        )

        // Générer un token encrypté AES-256-B valable 1 semaine
        const encryptedToken = TokenEncryption.generateToken(user.id, user.role)
        
        // Rediriger vers la page de connexion avec succès au lieu de l'accueil
        const response = NextResponse.redirect(`${APP_URL}/login?success=discord_login`)
        response.cookies.set('auth-token', encryptedToken, {
          httpOnly: false, // Accessible côté client pour le debug
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 7 * 24 * 60 * 60, // 7 jours
          path: "/", // Accessible partout sur le site
        })
        
        // Supprimer le cookie de state
        response.cookies.delete('discord_oauth_state')
        
        return response
      } else {
        // Aucun compte lié - rediriger vers l'inscription avec les données pré-remplies
        const registerUrl = new URL(`${APP_URL}/register`)
        registerUrl.searchParams.set('discord_id', discordUser.id)
        registerUrl.searchParams.set('username', discordUser.global_name || discordUser.username)
        if (discordUser.email) {
          registerUrl.searchParams.set('email', discordUser.email)
        }
        if (discordUser.avatar) {
          registerUrl.searchParams.set('avatar', `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.png`)
        }

        const response = NextResponse.redirect(registerUrl.toString())
        response.cookies.delete('discord_oauth_state')
        
        return response
      }
    }
  } catch (error) {
    console.error('Discord OAuth error:', error)
    return NextResponse.redirect(`${APP_URL}/login?error=discord_error`)
  }
}
