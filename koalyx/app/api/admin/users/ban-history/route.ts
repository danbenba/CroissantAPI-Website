import { NextRequest, NextResponse } from 'next/server'
import { TokenEncryption } from '@/lib/crypto'
import { executeQuery } from '@/lib/database'

// GET - Récupérer l'historique des bannissements
export async function GET(request: NextRequest) {
  try {
    // Vérifier l'authentification admin
    const token = request.cookies.get('auth-token')?.value
    if (!token) {
      return NextResponse.json({ success: false, message: 'Token manquant' }, { status: 401 })
    }

    const userInfo = TokenEncryption.getTokenInfo(token)
    if (!userInfo || userInfo.role !== 'admin') {
      return NextResponse.json({ success: false, message: 'Accès refusé' }, { status: 403 })
    }

    // Récupérer l'historique des bannissements
    const history = await executeQuery(`
      SELECT 
        ubh.id,
        ubh.user_id,
        ubh.reason,
        ubh.banned_by,
        ubh.banned_at,
        ubh.unbanned_at,
        ubh.unbanned_by,
        ubh.duration_days,
        u.nom_utilisateur as user_name
      FROM user_ban_history ubh
      LEFT JOIN utilisateurs u ON ubh.user_id = u.id
      ORDER BY ubh.banned_at DESC
    `)

    return NextResponse.json({ 
      success: true, 
      history: history 
    })

  } catch (error) {
    console.error('Erreur lors de la récupération de l\'historique des bannissements:', error)
    return NextResponse.json({ 
      success: false, 
      message: 'Erreur interne du serveur' 
    }, { status: 500 })
  }
}
