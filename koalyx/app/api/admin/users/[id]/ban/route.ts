import { NextRequest, NextResponse } from 'next/server'
import { TokenEncryption } from '@/lib/crypto'
import { executeQuery } from '@/lib/database'

// POST - Bannir un utilisateur
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    // Vérifier l'authentification admin
    const token = request.cookies.get('auth-token')?.value
    if (!token) {
      return NextResponse.json({ success: false, message: 'Token manquant' }, { status: 401 })
    }

    const userInfo = TokenEncryption.getTokenInfo(token)
    if (!userInfo || userInfo.role !== 'admin') {
      return NextResponse.json({ success: false, message: 'Accès refusé' }, { status: 403 })
    }

    const body = await request.json()
    const { reason, duration_days } = body

    // Validation des données
    if (!reason || !duration_days) {
      return NextResponse.json({ 
        success: false, 
        message: 'Raison et durée du bannissement requises' 
      }, { status: 400 })
    }

    // Vérifier si l'utilisateur existe
    const existingUser = await executeQuery(
      'SELECT id, nom_utilisateur FROM utilisateurs WHERE id = ?',
      [id]
    )

    if (existingUser.length === 0) {
      return NextResponse.json({ 
        success: false, 
        message: 'Utilisateur non trouvé' 
      }, { status: 404 })
    }

    // Calculer la date de fin du bannissement
    let bannedUntil = null
    if (duration_days !== 9999) { // 9999 = permanent
      bannedUntil = new Date()
      bannedUntil.setDate(bannedUntil.getDate() + duration_days)
    }

    // Mettre à jour le statut de l'utilisateur
    await executeQuery(`
      UPDATE utilisateurs 
      SET is_banned = 1, ban_reason = ?, banned_until = ?, updated_at = NOW()
      WHERE id = ?
    `, [reason, bannedUntil, id])

    // Enregistrer dans l'historique des bannissements
    await executeQuery(`
      INSERT INTO user_ban_history (user_id, reason, banned_by, banned_at, duration_days)
      VALUES (?, ?, ?, NOW(), ?)
    `, [id, reason, userInfo.userId, duration_days])

    return NextResponse.json({ 
      success: true, 
      message: 'Utilisateur banni avec succès' 
    })

  } catch (error) {
    console.error('Erreur lors du bannissement de l\'utilisateur:', error)
    return NextResponse.json({ 
      success: false, 
      message: 'Erreur interne du serveur' 
    }, { status: 500 })
  }
}
