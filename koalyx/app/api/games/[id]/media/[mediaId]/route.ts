import { NextRequest, NextResponse } from 'next/server'
import { executeQuery } from '@/lib/database'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; mediaId: string }> }
) {
  try {
    const { id, mediaId: mediaIdParam } = await params
    const gameId = parseInt(id)
    const mediaId = parseInt(mediaIdParam)
    
    if (isNaN(gameId) || isNaN(mediaId)) {
      return NextResponse.json(
        { success: false, message: 'IDs invalides' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { type, url, title, description, position, is_primary, is_sidebar_image } = body

    // Vérifier que le média existe et appartient au jeu
    const existingMedia = await executeQuery(
      'SELECT * FROM game_media WHERE id = ? AND game_id = ?',
      [mediaId, gameId]
    )

    if (!existingMedia || existingMedia.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Média non trouvé' },
        { status: 404 }
      )
    }

    // Nouvelle approche : supprimer l'ancien principal et définir le nouveau
    if (is_primary) {
      // Supprimer l'ancien média principal (le définir comme non-principal)
      await executeQuery(
        'UPDATE game_media SET is_primary = null WHERE game_id = ? AND is_primary = 1 AND id != ?',
        [gameId, mediaId]
      )
    }

    if (is_sidebar_image) {
      // Supprimer l'ancienne image de sidebar
      await executeQuery(
        'UPDATE game_media SET is_sidebar_image = null WHERE game_id = ? AND is_sidebar_image = 1 AND id != ?',
        [gameId, mediaId]
      )
    }

    // Maintenant, mettre à jour le média en question
    await executeQuery(
      `UPDATE game_media 
       SET type = ?, url = ?, title = ?, description = ?, position = ?, is_primary = ?, is_sidebar_image = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ? AND game_id = ?`,
      [type, url, title || null, description || null, position || 0, is_primary ? 1 : null, is_sidebar_image ? 1 : null, mediaId, gameId]
    )

    // Mettre à jour la référence dans la table games si c'est le média principal
    if (is_primary) {
      await executeQuery(
        'UPDATE games SET primary_media_id = ? WHERE id = ?',
        [mediaId, gameId]
      )
    } else if (existingMedia[0].is_primary) {
      // Si ce média n'est plus principal, retirer la référence
              await executeQuery(
          'UPDATE games SET primary_media_id = NULL WHERE id = ? AND primary_media_id = ?',
          [gameId, mediaId]
        )
    }

    return NextResponse.json({
      success: true,
      message: 'Média mis à jour avec succès'
    })

  } catch (error) {
    console.error('Erreur lors de la mise à jour du média:', error)
    return NextResponse.json(
      { success: false, message: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; mediaId: string }> }
) {
  try {
    const { id, mediaId: mediaIdParam } = await params
    const gameId = parseInt(id)
    const mediaId = parseInt(mediaIdParam)
    
    if (isNaN(gameId) || isNaN(mediaId)) {
      return NextResponse.json(
        { success: false, message: 'IDs invalides' },
        { status: 400 }
      )
    }

    // Vérifier que le média existe et appartient au jeu
    const existingMedia = await executeQuery(
      'SELECT * FROM game_media WHERE id = ? AND game_id = ?',
      [mediaId, gameId]
    )

    if (!existingMedia || existingMedia.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Média non trouvé' },
        { status: 404 }
      )
    }

    const wasPrimary = existingMedia[0].is_primary

    // Supprimer le média
    await executeQuery(
      'DELETE FROM game_media WHERE id = ? AND game_id = ?',
      [mediaId, gameId]
      )

    // Si c'était le média principal, retirer la référence
    if (wasPrimary) {
      await executeQuery(
        'UPDATE games SET primary_media_id = NULL WHERE id = ?',
        [gameId]
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Média supprimé avec succès'
    })

  } catch (error) {
    console.error('Erreur lors de la suppression du média:', error)
    return NextResponse.json(
      { success: false, message: 'Erreur interne du serveur' },
      { status: 500 }
      )
  }
}
