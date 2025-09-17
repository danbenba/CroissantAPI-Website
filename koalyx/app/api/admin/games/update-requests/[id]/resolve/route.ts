import { NextRequest, NextResponse } from 'next/server'
import { TokenEncryption } from '@/lib/crypto'

// PATCH - Marquer une demande comme traitée
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params
    const gameId = id
    const { action } = await request.json() // 'resolve' ou 'dismiss'

    if (!['resolve', 'dismiss'].includes(action)) {
      return NextResponse.json({ success: false, message: 'Action invalide' }, { status: 400 })
    }

    const { executeQuery } = await import('@/lib/database')

    // Marquer toutes les demandes de ce jeu comme traitées
    const status = action === 'resolve' ? 'resolved' : 'dismissed'
    
    // D'abord, supprimer les anciennes demandes pour ce jeu
    await executeQuery(
      'DELETE FROM update_requests WHERE game_id = ?',
      [gameId]
    )
    
    // Puis insérer une nouvelle demande avec le statut traité
    await executeQuery(
      'INSERT INTO update_requests (user_id, game_id, status, resolved_at, resolved_by, created_at) VALUES (?, ?, ?, NOW(), ?, NOW())',
      [tokenInfo.userId, gameId, status, tokenInfo.userId]
    )

    // Si résolu, mettre à jour la date de mise à jour du jeu
    if (action === 'resolve') {
      await executeQuery(
        'UPDATE games SET updated_at = NOW() WHERE id = ?',
        [gameId]
      )
    }

    return NextResponse.json({
      success: true,
      message: action === 'resolve' ? 'Mise à jour validée' : 'Demandes rejetées'
    })

  } catch (error) {
    console.error('Erreur lors du traitement de la demande:', error)
    return NextResponse.json({ success: false, message: 'Erreur interne du serveur' }, { status: 500 })
  }
}
