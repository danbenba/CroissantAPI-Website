import { NextRequest, NextResponse } from 'next/server'
import { TokenEncryption } from '@/lib/crypto'

// GET - Vérifier si un jeu est dans les favoris
export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value

    if (!token) {
      return NextResponse.json({ success: false, isFavorite: false }, { status: 200 })
    }

    const tokenInfo = TokenEncryption.getTokenInfo(token)
    if (!tokenInfo) {
      return NextResponse.json({ success: false, isFavorite: false }, { status: 200 })
    }

    const userId = tokenInfo.userId

    const { searchParams } = new URL(request.url)
    const gameId = searchParams.get('gameId')

    if (!gameId) {
      return NextResponse.json({ success: false, message: 'ID du jeu requis' }, { status: 400 })
    }

    const { executeQuery } = await import('@/lib/database')

    const favorites = await executeQuery(
      'SELECT id FROM favorites WHERE user_id = ? AND game_id = ?',
      [userId, gameId]
    )

    return NextResponse.json({
      success: true,
      isFavorite: favorites.length > 0
    })

  } catch (error) {
    console.error('Erreur lors de la vérification du favori:', error)
    return NextResponse.json({ success: false, isFavorite: false }, { status: 200 })
  }
}
