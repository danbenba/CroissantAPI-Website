import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/database'
import { requireRole, createErrorResponse, createSuccessResponse } from '@/lib/api-security'
import bcrypt from 'bcryptjs'

/**
 * POST - Vérifier le mot de passe de l'utilisateur
 */
export async function POST(request: NextRequest) {
  try {
    // Vérifier l'authentification (tous les utilisateurs connectés)
    const authResult = await requireRole(request, ['admin', 'moderateur', 'support', 'plus', 'ultra', 'membre'])
    if (!authResult.success) {
      return createErrorResponse(authResult.error!, authResult.status)
    }

    const userId = authResult.user!.id
    const requestData = await request.json()
    const { password } = requestData

    // Vérifications de base
    if (!password) {
      return createErrorResponse('Le mot de passe est requis', 400)
    }

    // Récupérer les informations utilisateur
    const [userRows] = await db.execute(
      'SELECT mot_de_passe FROM utilisateurs WHERE id = ?',
      [userId]
    ) as any[]

    if (!userRows || userRows.length === 0) {
      return createErrorResponse('Utilisateur non trouvé', 404)
    }

    const user = userRows[0]

    // Vérifier le mot de passe
    const isPasswordValid = await bcrypt.compare(password, user.mot_de_passe)
    if (!isPasswordValid) {
      return createErrorResponse('Mot de passe incorrect', 401)
    }

    return createSuccessResponse({
      message: 'Mot de passe vérifié avec succès',
      valid: true
    })

  } catch (error) {
    console.error('Erreur lors de la vérification du mot de passe:', error)
    return createErrorResponse('Erreur lors de la vérification du mot de passe', 500)
  }
}
