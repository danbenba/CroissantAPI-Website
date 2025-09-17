import { NextRequest, NextResponse } from 'next/server'
import { executeQuery } from '@/lib/database'
import { TokenEncryption } from '@/lib/crypto'
import type { User } from '@/lib/database'

const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID || "1398032410926518392"
const DISCORD_CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET || "Oqv5S53SDsKhO1znLCb1zMvl360bfoGD"

interface DiscordUser {
  id: string
  username: string
  email: string | null
  avatar: string | null
  discriminator: string
  global_name: string | null
}

// Route pour lier un compte Discord existant
export async function POST(request: NextRequest) {
  try {
    // Vérifier l'authentification
    const token = request.cookies.get('auth-token')?.value
    if (!token) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const tokenInfo = TokenEncryption.getTokenInfo(token)
    if (!tokenInfo) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 })
    }

    // Récupérer les informations utilisateur
    const userResults = await executeQuery<User[]>(
      'SELECT * FROM utilisateurs WHERE id = ? AND actif = TRUE',
      [tokenInfo.userId]
    )

    if (userResults.length === 0) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 401 })
    }

    const authUser = userResults[0]

    const { access_token } = await request.json()

    if (!access_token) {
      return NextResponse.json({ error: 'Token Discord manquant' }, { status: 400 })
    }

    // Récupérer les informations de l'utilisateur Discord
    const userResponse = await fetch('https://discord.com/api/users/@me', {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    })

    if (!userResponse.ok) {
      return NextResponse.json({ error: 'Impossible de récupérer les données Discord' }, { status: 400 })
    }

    const discordUser: DiscordUser = await userResponse.json()

    // Vérifier si ce Discord ID est déjà utilisé
    const existingDiscordUsers = await executeQuery<User[]>(
      'SELECT id FROM utilisateurs WHERE discord_id = ? AND id != ?',
      [discordUser.id, authUser.id]
    )

    if (existingDiscordUsers.length > 0) {
      return NextResponse.json({ 
        error: 'Ce compte Discord est déjà lié à un autre utilisateur' 
      }, { status: 400 })
    }

    // Lier le compte Discord à l'utilisateur actuel
    await executeQuery(
      'UPDATE utilisateurs SET discord_id = ? WHERE id = ?',
      [discordUser.id, authUser.id]
    )

    return NextResponse.json({ 
      success: true, 
      message: 'Compte Discord lié avec succès',
      discord_username: discordUser.global_name || discordUser.username
    })

  } catch (error) {
    console.error('Discord link error:', error)
    return NextResponse.json({ 
      error: 'Erreur lors de la liaison du compte Discord' 
    }, { status: 500 })
  }
}

// Route pour délier un compte Discord
export async function DELETE(request: NextRequest) {
  try {
    // Vérifier l'authentification
    const token = request.cookies.get('auth-token')?.value
    if (!token) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const tokenInfo = TokenEncryption.getTokenInfo(token)
    if (!tokenInfo) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 })
    }

    // Délier le compte Discord
    await executeQuery(
      'UPDATE utilisateurs SET discord_id = NULL WHERE id = ?',
      [tokenInfo.userId]
    )

    return NextResponse.json({ 
      success: true, 
      message: 'Compte Discord délié avec succès' 
    })

  } catch (error) {
    console.error('Discord unlink error:', error)
    return NextResponse.json({ 
      error: 'Erreur lors de la déconnexion du compte Discord' 
    }, { status: 500 })
  }
}
