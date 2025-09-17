import { NextRequest, NextResponse } from 'next/server'
import { TokenEncryption } from '@/lib/crypto'
import { executeQuery } from '@/lib/database'

// POST - Débannir un utilisateur
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

    // Vérifier si l'utilisateur existe et est banni
    const existingUser = await executeQuery(
      'SELECT id, nom_utilisateur, is_banned FROM utilisateurs WHERE id = ?',
      [id]
    )

    if (existingUser.length === 0) {
      return NextResponse.json({ 
        success: false, 
        message: 'Utilisateur non trouvé' 
      }, { status: 404 })
    }

    if (!existingUser[0].is_banned) {
      return NextResponse.json({ 
        success: false, 
        message: 'Cet utilisateur n\'est pas banni' 
      }, { status: 400 })
    }

    // Débannir l'utilisateur
    await executeQuery(`
      UPDATE utilisateurs 
      SET is_banned = 0, ban_reason = NULL, banned_until = NULL, updated_at = NOW()
      WHERE id = ?
    `, [id])

    // Mettre à jour l'historique des bannissements
    await executeQuery(`
      UPDATE user_ban_history 
      SET unbanned_at = NOW(), unbanned_by = ?
      WHERE user_id = ? AND unbanned_at IS NULL
    `, [userInfo.userId, id])

    return NextResponse.json({ 
      success: true, 
      message: 'Utilisateur débanni avec succès' 
    })

  } catch (error) {
    console.error('Erreur lors du débannissement de l\'utilisateur:', error)
    return NextResponse.json({ 
      success: false, 
      message: 'Erreur interne du serveur' 
    }, { status: 500 })
  }
}
