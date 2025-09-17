import { NextRequest, NextResponse } from 'next/server'
import { executeQuery } from '@/lib/database'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const gameId = parseInt(id)
    
    if (isNaN(gameId)) {
      return NextResponse.json(
        { success: false, message: 'ID de jeu invalide' },
        { status: 400 }
      )
    }

    const media = await executeQuery(
      `SELECT id, type, url, title, description, position, is_primary, is_sidebar_image, created_at 
       FROM game_media 
       WHERE game_id = ? 
       ORDER BY is_primary DESC, position ASC, created_at ASC`,
      [gameId]
    )

    return NextResponse.json({
      success: true,
      media: media || []
    })

  } catch (error) {
    console.error('Erreur lors de la récupération des médias:', error)
    return NextResponse.json(
      { success: false, message: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const gameId = parseInt(id)
    
    if (isNaN(gameId)) {
      return NextResponse.json(
        { success: false, message: 'ID de jeu invalide' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { type, url, title, description, position, is_primary, is_sidebar_image } = body

    // Validation des données
    if (!type || !url) {
      return NextResponse.json(
        { success: false, message: 'Type et URL sont requis' },
        { status: 400 }
      )
    }

    if (!['image', 'video'].includes(type)) {
      return NextResponse.json(
        { success: false, message: 'Type doit être "image" ou "video"' },
        { status: 400 }
      )
    }

    // Si c'est le média principal, supprimer l'ancien principal
    if (is_primary) {
      await executeQuery(
        'UPDATE game_media SET is_primary = null WHERE game_id = ? AND is_primary = 1',
        [gameId]
      )
    }

    // Si c'est l'image de sidebar, supprimer l'ancienne sidebar
    if (is_sidebar_image) {
      await executeQuery(
        'UPDATE game_media SET is_sidebar_image = null WHERE game_id = ? AND is_sidebar_image = 1',
        [gameId]
      )
    }

    // Insérer le nouveau média
    const result = await executeQuery(
      `INSERT INTO game_media (game_id, type, url, title, description, position, is_primary, is_sidebar_image) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [gameId, type, url, title || null, description || null, position || 0, is_primary ? 1 : null, is_sidebar_image ? 1 : null]
    )

    // Mettre à jour la référence dans la table games si c'est le média principal
    if (is_primary) {
      await executeQuery(
        'UPDATE games SET primary_media_id = ? WHERE id = ?',
        [result.insertId, gameId]
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Média ajouté avec succès',
      mediaId: result.insertId
    })

  } catch (error) {
    console.error('Erreur lors de l\'ajout du média:', error)
    return NextResponse.json(
      { success: false, message: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
} 
