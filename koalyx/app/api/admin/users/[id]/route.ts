import { NextRequest, NextResponse } from 'next/server'
import { executeQuery } from '@/lib/database'
import { requireRole, validateInput, validateId, createErrorResponse, createSuccessResponse, ValidationSchema } from '@/lib/api-security'

// GET - Récupérer un utilisateur
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    // Vérifier l'authentification admin
    const authResult = await requireRole(request, ['admin'])
    if (!authResult.success) {
      return createErrorResponse(authResult.error!, authResult.status)
    }

    // Valider l'ID
    const userId = validateId(id)
    if (!userId) {
      return createErrorResponse('ID utilisateur invalide', 400)
    }

    // Récupérer l'utilisateur
    const users = await executeQuery(
      'SELECT id, nom_utilisateur, email, role, is_banned, ban_reason, banned_until FROM utilisateurs WHERE id = ?',
      [userId]
    )

    if (!users || users.length === 0) {
      return createErrorResponse('Utilisateur non trouvé', 404)
    }

    return createSuccessResponse({ user: users[0] })

  } catch (error) {
    console.error('Erreur récupération utilisateur:', error)
    return createErrorResponse('Erreur interne du serveur', 500)
  }
}

// PUT - Modifier un utilisateur
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    // Vérifier l'authentification admin
    const authResult = await requireRole(request, ['admin'])
    if (!authResult.success) {
      return createErrorResponse(authResult.error!, authResult.status)
    }

    // Valider l'ID
    const userId = validateId(id)
    if (!userId) {
      return createErrorResponse('ID utilisateur invalide', 400)
    }

    const body = await request.json()

    // Schéma de validation
    const schema: ValidationSchema = {
      nom_utilisateur: {
        required: true,
        type: 'string',
        minLength: 3,
        maxLength: 50,
        pattern: /^[a-zA-Z0-9_-]+$/
      },
      email: {
        required: true,
        type: 'email',
        maxLength: 255
      },
      role: {
        required: true,
        type: 'string',
        minLength: 1,
        maxLength: 50
      }
    }

    const validation = validateInput(body, schema)
    if (!validation.valid) {
      return createErrorResponse(`Données invalides: ${validation.errors.join(', ')}`, 400)
    }

    const { nom_utilisateur, email, role } = validation.sanitized

    // Vérifier si l'utilisateur existe
    const existingUser = await executeQuery(
      'SELECT id FROM utilisateurs WHERE id = ?',
      [userId]
    )

    if (existingUser.length === 0) {
      return createErrorResponse('Utilisateur non trouvé', 404)
    }

    // Vérifier si le nom d'utilisateur ou l'email est déjà utilisé par un autre utilisateur
    const duplicateUser = await executeQuery(
      'SELECT id FROM utilisateurs WHERE (nom_utilisateur = ? OR email = ?) AND id != ?',
      [nom_utilisateur, email, userId]
    )

    if (duplicateUser.length > 0) {
      return createErrorResponse('Un utilisateur avec ce nom ou cet email existe déjà', 400)
    }

    // Mettre à jour l'utilisateur
    await executeQuery(`
      UPDATE utilisateurs 
      SET nom_utilisateur = ?, email = ?, role = ?, updated_at = NOW()
      WHERE id = ?
    `, [nom_utilisateur, email, role, userId])

    return createSuccessResponse({}, 'Utilisateur modifié avec succès')

  } catch (error) {
    console.error('Erreur lors de la modification de l\'utilisateur:', error)
    return createErrorResponse('Erreur interne du serveur', 500)
  }
}
