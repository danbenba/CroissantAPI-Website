import { NextRequest, NextResponse } from 'next/server'
import { TokenEncryption } from '@/lib/crypto'
import { executeQuery } from '@/lib/database'

// POST - Forcer la déconnexion d'un utilisateur
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

    // Générer un nouveau token secret pour invalider l'ancien
    const newTokenSecret = generateRandomString(32)
    
    // Mettre à jour le secret de l'utilisateur pour invalider tous ses tokens
    await executeQuery(`
      UPDATE utilisateurs 
      SET token_secret = ?, updated_at = NOW()
      WHERE id = ?
    `, [newTokenSecret, id])

    // Enregistrer l'action dans un log
    await executeQuery(`
      INSERT INTO admin_actions_log (admin_id, action_type, target_user_id, details, created_at)
      VALUES (?, 'force_logout', ?, 'Déconnexion forcée de l\'utilisateur', NOW())
    `, [userInfo.userId, id])

    return NextResponse.json({ 
      success: true, 
      message: 'Utilisateur déconnecté avec succès. Tous ses tokens sont maintenant invalides.' 
    })

  } catch (error) {
    console.error('Erreur lors de la déconnexion forcée de l\'utilisateur:', error)
    return NextResponse.json({ 
      success: false, 
      message: 'Erreur interne du serveur' 
    }, { status: 500 })
  }
}

// Fonction pour générer une chaîne aléatoire
function generateRandomString(length: number): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}
