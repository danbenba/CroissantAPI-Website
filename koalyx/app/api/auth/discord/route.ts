import { NextRequest, NextResponse } from 'next/server'

const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID || "1398032410926518392"
const DISCORD_CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET || "Oqv5S53SDsKhO1znLCb1zMvl360bfoGD"
const DISCORD_REDIRECT_URI = process.env.DISCORD_REDIRECT_URI || `http://localhost:3000/api/auth/discord/callback`

export async function GET(request: NextRequest) {
  if (!DISCORD_CLIENT_ID) {
    return NextResponse.json(
      { error: 'Discord client ID not configured' },
      { status: 500 }
    )
  }

  const { searchParams } = new URL(request.url)
  const action = searchParams.get('action') // 'link' pour lier un compte existant

  // Générer un state aléatoire pour la sécurité CSRF
  const state = crypto.randomUUID()
  
  // Construire l'URL d'autorisation Discord
  const discordAuthUrl = new URL('https://discord.com/api/oauth2/authorize')
  discordAuthUrl.searchParams.set('client_id', DISCORD_CLIENT_ID)
  discordAuthUrl.searchParams.set('redirect_uri', DISCORD_REDIRECT_URI)
  discordAuthUrl.searchParams.set('response_type', 'code')
  discordAuthUrl.searchParams.set('scope', 'identify email')
  discordAuthUrl.searchParams.set('state', state)

  // Créer une réponse avec redirection et cookie sécurisé pour le state
  const response = NextResponse.redirect(discordAuthUrl.toString())
  response.cookies.set('discord_oauth_state', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 600 // 10 minutes
  })

  // Stocker l'action dans un cookie si c'est une liaison de compte
  if (action === 'link') {
    response.cookies.set('discord_oauth_action', 'link', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 600 // 10 minutes
    })
  }

  return response
}
