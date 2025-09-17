import { NextRequest, NextResponse } from 'next/server'
import { TokenEncryption } from '@/lib/crypto'

// GET - Récupérer toutes les demandes de mise à jour (admin seulement)
export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value

    if (!token) {
      return NextResponse.json({ success: false, message: 'Non authentifié' }, { status: 401 })
    }

    const tokenInfo = TokenEncryption.getTokenInfo(token)
    if (!tokenInfo) {
      return NextResponse.json({ success: false, message: 'Token invalide' }, { status: 401 })
    }

    // Vérifier si l'utilisateur est admin
    if (tokenInfo.role !== 'admin') {
      return NextResponse.json({ success: false, message: 'Accès refusé' }, { status: 403 })
    }

    const { executeQuery } = await import('@/lib/database')

    // Récupérer toutes les demandes avec comptage
    const requests = await executeQuery(`
      SELECT 
        game_id,
        g.title as game_title,
        g.banner_url,
        COUNT(*) as request_count,
        MIN(ur.created_at) as first_request,
        MAX(ur.created_at) as last_request,
        GROUP_CONCAT(u.nom_utilisateur ORDER BY ur.created_at SEPARATOR '|') as user_names,
        GROUP_CONCAT(ur.created_at ORDER BY ur.created_at SEPARATOR '|') as request_dates,
        CASE 
          WHEN COUNT(*) >= 5 THEN 'urgent'
          WHEN COUNT(*) >= 3 THEN 'medium'
          ELSE 'low'
        END as priority
      FROM update_requests ur
      JOIN games g ON ur.game_id = g.id
      JOIN utilisateurs u ON ur.user_id = u.id
      WHERE ur.status = 'pending'
      GROUP BY game_id, g.title, g.banner_url
      ORDER BY request_count DESC, first_request ASC
    `)

    return NextResponse.json({
      success: true,
      requests
    })

  } catch (error) {
    console.error('Erreur lors de la récupération des demandes:', error)
    return NextResponse.json({ success: false, message: 'Erreur interne du serveur' }, { status: 500 })
  }
}

// POST - Créer une demande de mise à jour
export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value

    if (!token) {
      return NextResponse.json({ success: false, message: 'Non authentifié' }, { status: 401 })
    }

    const tokenInfo = TokenEncryption.getTokenInfo(token)
    if (!tokenInfo) {
      return NextResponse.json({ success: false, message: 'Token invalide' }, { status: 401 })
    }

    const userId = tokenInfo.userId

    const { gameId } = await request.json()

    if (!gameId) {
      return NextResponse.json({ success: false, message: 'ID du jeu requis' }, { status: 400 })
    }

    const { executeQuery } = await import('@/lib/database')

    // Vérifier si l'utilisateur a déjà fait une demande pour ce jeu
    const existing = await executeQuery(
      'SELECT id FROM update_requests WHERE user_id = ? AND game_id = ? AND status = "pending"',
      [userId, gameId]
    )

    if (existing.length > 0) {
      return NextResponse.json({ 
        success: false, 
        message: 'Vous avez déjà demandé une mise à jour pour ce jeu' 
      }, { status: 400 })
    }

    // Ajouter la demande
    await executeQuery(
      'INSERT INTO update_requests (user_id, game_id, status, created_at) VALUES (?, ?, "pending", NOW())',
      [userId, gameId]
    )

    // Récupérer le nom du jeu pour la notification
    const gameData = await executeQuery(
      'SELECT title FROM games WHERE id = ?',
      [gameId]
    )

    const gameTitle = gameData[0]?.title || 'Jeu inconnu'

    // Créer une notification pour les admins
    const admins = await executeQuery(
      'SELECT id FROM utilisateurs WHERE role = "admin"'
    )

          for (const admin of admins) {
        await executeQuery(
          'INSERT INTO notifications (user_id, type, title, message, created_at) VALUES (?, ?, ?, ?, NOW())',
          [
            admin.id,
            'other',
            'Nouvelle demande de mise à jour',
            `Un utilisateur a demandé une mise à jour pour "${gameTitle}"`
          ]
        )
      }

    return NextResponse.json({
      success: true,
      message: 'Demande de mise à jour envoyée avec succès'
    })

  } catch (error) {
    console.error('Erreur lors de la création de la demande:', error)
    return NextResponse.json({ success: false, message: 'Erreur interne du serveur' }, { status: 500 })
  }
}
