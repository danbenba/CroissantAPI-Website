import { NextRequest, NextResponse } from 'next/server'
import { executeQuery } from '@/lib/database'
import { requireRole, validateInput, createErrorResponse, createSuccessResponse, ValidationSchema } from '@/lib/api-security'
import bcrypt from 'bcryptjs'

// GET - Récupérer tous les utilisateurs
export async function GET(request: NextRequest) {
  try {
    // Vérifier l'authentification admin
    const authResult = await requireRole(request, ['admin'])
    if (!authResult.success) {
      return createErrorResponse(authResult.error!, authResult.status)
    }

    // Récupérer tous les utilisateurs avec leurs informations
    const users = await executeQuery(`
      SELECT 
        u.id,
        u.nom_utilisateur,
        u.email,
        u.role,
        COALESCE(u.is_banned, FALSE) as is_banned,
        u.ban_reason,
        u.banned_until,
        COALESCE(u.last_login, u.derniere_connexion) as last_login,
        COALESCE(u.created_at, u.date_creation) as created_at,
        u.photo
      FROM utilisateurs u
      ORDER BY COALESCE(u.created_at, u.date_creation) DESC
    `)

    return createSuccessResponse({ users })

  } catch (error) {
    console.error('Erreur lors de la récupération des utilisateurs:', error)
    return createErrorResponse('Erreur interne du serveur', 500)
  }
}

// POST - Créer un nouvel utilisateur
export async function POST(request: NextRequest) {
  try {
    // Vérifier l'authentification admin
    const authResult = await requireRole(request, ['admin'])
    if (!authResult.success) {
      return createErrorResponse(authResult.error!, authResult.status)
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
      },
      password: {
        required: true,
        type: 'string',
        minLength: 8,
        maxLength: 128
      }
    }

    const validation = validateInput(body, schema)
    if (!validation.valid) {
      return createErrorResponse(`Données invalides: ${validation.errors.join(', ')}`, 400)
    }

    const { nom_utilisateur, email, role, password } = validation.sanitized

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await executeQuery(
      'SELECT id FROM utilisateurs WHERE nom_utilisateur = ? OR email = ?',
      [nom_utilisateur, email]
    )

    if (existingUser.length > 0) {
      return createErrorResponse('Un utilisateur avec ce nom ou cet email existe déjà', 400)
    }

    // Créer le nouvel utilisateur
    const hashedPassword = await bcrypt.hash(password, 12)

    const result = await executeQuery(`
      INSERT INTO utilisateurs (nom_utilisateur, email, role, mot_de_passe, created_at, updated_at)
      VALUES (?, ?, ?, ?, NOW(), NOW())
    `, [nom_utilisateur, email, role, hashedPassword])

    if (result.insertId) {
      return createSuccessResponse({ 
        userId: result.insertId 
      }, 'Utilisateur créé avec succès')
    } else {
      throw new Error('Erreur lors de la création de l\'utilisateur')
    }

  } catch (error) {
    console.error('Erreur lors de la création de l\'utilisateur:', error)
    return createErrorResponse('Erreur interne du serveur', 500)
  }
}
