import { NextRequest, NextResponse } from 'next/server'
import { TokenEncryption } from '@/lib/crypto'

// PATCH - Marquer un signalement comme traité
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
    const linkId = id
    const { action } = await request.json() // 'resolve' ou 'dismiss'

    if (!['resolve', 'dismiss'].includes(action)) {
      return NextResponse.json({ success: false, message: 'Action invalide' }, { status: 400 })
    }

    const { executeQuery } = await import('@/lib/database')

    // Marquer tous les signalements de ce lien comme traités
    const status = action === 'resolve' ? 'resolved' : 'dismissed'
    
    // D'abord, supprimer les anciens signalements pour ce lien
    await executeQuery(
      'DELETE FROM dead_link_reports WHERE link_id = ?',
      [linkId]
    )
    
    // Puis insérer un nouveau signalement avec le statut traité
    await executeQuery(
      'INSERT INTO dead_link_reports (user_id, link_id, status, resolved_at, resolved_by, created_at) VALUES (?, ?, ?, NOW(), ?, NOW())',
      [tokenInfo.userId, linkId, status, tokenInfo.userId]
    )

    // Si résolu, marquer le lien comme inactif
    if (action === 'resolve') {
      await executeQuery(
        'UPDATE game_download_links SET is_active = FALSE WHERE id = ?',
        [linkId]
      )
    }

    return NextResponse.json({
      success: true,
      message: action === 'resolve' ? 'Lien marqué comme mort' : 'Signalements rejetés'
    })

  } catch (error) {
    console.error('Erreur lors du traitement du signalement:', error)
    return NextResponse.json({ success: false, message: 'Erreur interne du serveur' }, { status: 500 })
  }
}
