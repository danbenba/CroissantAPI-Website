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

    // Récupérer les badges actifs du jeu
    const badges = await executeQuery(`
      SELECT 
        gb.id,
        gb.name,
        gb.display_name,
        gb.color,
        gb.icon,
        gba.expires_at,
        gba.created_at as assigned_at
      FROM game_badges gb
      JOIN game_badge_assignments gba ON gb.id = gba.badge_id
      WHERE gba.game_id = ? AND gba.expires_at > NOW()
      ORDER BY gba.created_at DESC
    `, [gameId])

    return NextResponse.json({
      success: true,
      badges: badges || []
    })

  } catch (error) {
    console.error('Erreur lors de la récupération des badges:', error)
    return NextResponse.json(
      { success: false, message: 'Erreur serveur' },
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
    const { badgeId, expiresAt } = await request.json()
    
    if (isNaN(gameId)) {
      return NextResponse.json(
        { success: false, message: 'ID de jeu invalide' },
        { status: 400 }
      )
    }

    if (!badgeId || !expiresAt) {
      return NextResponse.json(
        { success: false, message: 'Badge et date d\'expiration requis' },
        { status: 400 }
      )
    }

    // Vérifier que le jeu existe
    const game = await executeQuery('SELECT id FROM games WHERE id = ?', [gameId])
    if (!game || game.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Jeu non trouvé' },
        { status: 404 }
      )
    }

    // Vérifier que le badge existe
    const badge = await executeQuery('SELECT id FROM game_badges WHERE id = ?', [badgeId])
    if (!badge || badge.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Badge non trouvé' },
        { status: 404 }
      )
    }

    // Supprimer l'ancien badge s'il existe (on supprimer tous les badges du jeu)
    await executeQuery('DELETE FROM game_badge_assignments WHERE game_id = ?', [gameId])

    // Ajouter le nouveau badge avec gestion de duplication
    await executeQuery(`
      INSERT INTO game_badge_assignments (game_id, badge_id, expires_at)
      VALUES (?, ?, ?)
      ON DUPLICATE KEY UPDATE 
        expires_at = VALUES(expires_at),
        created_at = NOW()
    `, [gameId, badgeId, expiresAt])

    return NextResponse.json({
      success: true,
      message: 'Badge ajouté avec succès'
    })

  } catch (error) {
    console.error('Erreur lors de l\'ajout du badge:', error)
    return NextResponse.json(
      { success: false, message: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

export async function DELETE(
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

    // Supprimer tous les badges du jeu
    await executeQuery('DELETE FROM game_badge_assignments WHERE game_id = ?', [gameId])

    return NextResponse.json({
      success: true,
      message: 'Badges supprimés avec succès'
    })

  } catch (error) {
    console.error('Erreur lors de la suppression des badges:', error)
    return NextResponse.json(
      { success: false, message: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
