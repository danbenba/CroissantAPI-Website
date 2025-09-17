import { NextRequest, NextResponse } from 'next/server'
import { authenticateUser, validateInput, validateId, createErrorResponse, createSuccessResponse, ValidationSchema } from '@/lib/api-security'

// GET - Récupérer les favoris de l'utilisateur
export async function GET(request: NextRequest) {
  try {
    // Vérifier l'authentification
    const authResult = await authenticateUser(request)
    if (!authResult.success || !authResult.user) {
      return createErrorResponse('Non authentifié', 401)
    }

    const userId = authResult.user.id

    // Récupérer les favoris de l'utilisateur avec les informations des jeux
    const { executeQuery } = await import('@/lib/database')
    
    const favorites = await executeQuery(`
      SELECT f.*, g.title, g.description, g.banner_url, g.is_vip, g.category_id, 
             g.platform, g.year, g.views, g.created_at as game_created_at
      FROM favorites f
      JOIN games g ON f.game_id = g.id
      WHERE f.user_id = ?
      ORDER BY f.created_at DESC
    `, [userId])

    return createSuccessResponse({ favorites })

  } catch (error) {
    console.error('Erreur lors de la récupération des favoris:', error)
    return createErrorResponse('Erreur interne du serveur', 500)
  }
}

// POST - Ajouter/Supprimer un favori
export async function POST(request: NextRequest) {
  try {
    // Vérifier l'authentification
    const authResult = await authenticateUser(request)
    if (!authResult.success || !authResult.user) {
      return createErrorResponse('Non authentifié', 401)
    }

    const userId = authResult.user.id

    const body = await request.json()

    // Validation sécurisée de l'ID du jeu
    const schema: ValidationSchema = {
      gameId: {
        required: true,
        type: 'number',
        min: 1
      }
    }

    const validation = validateInput(body, schema)
    if (!validation.valid) {
      return createErrorResponse(`Données invalides: ${validation.errors.join(', ')}`, 400)
    }

    const { gameId } = validation.sanitized

    const { executeQuery } = await import('@/lib/database')

    // Vérifier si le favori existe déjà
    const existing = await executeQuery(
      'SELECT id FROM favorites WHERE user_id = ? AND game_id = ?',
      [userId, gameId]
    )

    if (existing.length > 0) {
      // Supprimer le favori
      await executeQuery(
        'DELETE FROM favorites WHERE user_id = ? AND game_id = ?',
        [userId, gameId]
      )
      
      return createSuccessResponse({
        action: 'removed'
      }, 'Jeu retiré des favoris')
    } else {
      // Ajouter aux favoris
      await executeQuery(
        'INSERT INTO favorites (user_id, game_id, created_at) VALUES (?, ?, NOW())',
        [userId, gameId]
      )
      
      return createSuccessResponse({
        action: 'added'
      }, 'Jeu ajouté aux favoris')
    }

  } catch (error) {
    console.error('Erreur lors de la gestion du favori:', error)
    return createErrorResponse('Erreur interne du serveur', 500)
  }
}
