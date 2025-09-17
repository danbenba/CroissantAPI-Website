import { NextRequest, NextResponse } from 'next/server'
import { TokenEncryption } from '@/lib/crypto'
import { executeQuery } from '@/lib/database'
import bcrypt from 'bcryptjs'

// POST - Réinitialiser le mot de passe d'un utilisateur
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

    // Générer un mot de passe temporaire aléatoire
    const tempPassword = generateTempPassword()
    
    // Hasher le mot de passe temporaire
    const hashedPassword = await bcrypt.hash(tempPassword, 12)

    // Mettre à jour le mot de passe de l'utilisateur
    await executeQuery(`
      UPDATE utilisateurs 
      SET mot_de_passe = ?, password_reset_required = 1, updated_at = NOW()
      WHERE id = ?
    `, [hashedPassword, id])

    return NextResponse.json({ 
      success: true, 
      message: 'Mot de passe réinitialisé avec succès',
      tempPassword: tempPassword
    })

  } catch (error) {
    console.error('Erreur lors de la réinitialisation du mot de passe:', error)
    return NextResponse.json({ 
      success: false, 
      message: 'Erreur interne du serveur' 
    }, { status: 500 })
  }
}

// Fonction pour générer un mot de passe temporaire
function generateTempPassword(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < 12; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}
