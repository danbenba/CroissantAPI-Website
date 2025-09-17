import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/database'
import { requireRole, createErrorResponse, createSuccessResponse } from '@/lib/api-security'

/**
 * GET - Récupérer les informations complètes du compte utilisateur
 */
export async function GET(request: NextRequest) {
  try {
    // Vérifier l'authentification (tous les utilisateurs connectés)
    const authResult = await requireRole(request, ['admin', 'moderateur', 'support', 'plus', 'ultra', 'membre'])
    if (!authResult.success) {
      return createErrorResponse(authResult.error!, authResult.status)
    }

    const userId = authResult.user!.id

    // Récupérer les informations complètes de l'utilisateur
    const [rows] = await db.execute(
      'SELECT nom_utilisateur, email, photo, created_at, role FROM utilisateurs WHERE id = ?',
      [userId]
    ) as any[]

    if (!rows || rows.length === 0) {
      return createErrorResponse('Utilisateur non trouvé', 404)
    }

    const user = rows[0]

    return createSuccessResponse({
      nom_utilisateur: user.nom_utilisateur,
      email: user.email,
      photo: user.photo,
      created_at: user.created_at,
      role: user.role
    })

  } catch (error) {
    console.error('Erreur lors de la récupération des informations du compte:', error)
    return createErrorResponse('Erreur lors de la récupération des informations', 500)
  }
}
