import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/database'
import { validateInput, createErrorResponse, createSuccessResponse, ValidationSchema } from '@/lib/api-security'

// GET - Récupérer tous les jeux (API publique mais sécurisée)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Récupérer et valider les paramètres de requête
    const queryParams = {
      category: searchParams.get('category') || undefined,
      platform: searchParams.get('platform') || undefined,
      year: searchParams.get('year') || undefined,
      limit: searchParams.get('limit') || '1000'
    }

    // Schéma de validation pour les paramètres de requête
    const schema: ValidationSchema = {
      category: {
        type: 'number',
        min: 1,
        max: 999999
      },
      platform: {
        type: 'string',
        maxLength: 100,
        pattern: /^[a-zA-Z0-9\s\-_]+$/
      },
      year: {
        type: 'number',
        min: 1980,
        max: new Date().getFullYear() + 1
      },
      limit: {
        type: 'number',
        min: 1,
        max: 2000
      }
    }

    const validation = validateInput(queryParams, schema)
    if (!validation.valid) {
      return createErrorResponse(`Paramètres invalides: ${validation.errors.join(', ')}`, 400)
    }

    const { category, platform, year, limit } = validation.sanitized
    
    let query = `
      SELECT 
        g.id,
        g.title,
        g.description,
        g.banner_url,
        g.zip_password,
        g.is_vip,
        g.access_level,
        g.category_id,
        g.platform,
        g.specifications,
        g.year,
        g.created_at,
        g.updated_at,
        COALESCE(g.views, 0) as views,
        c.name as category_name,
        c.type as category_type,
        sidebar_media.url as sidebar_image_url
      FROM games g
      LEFT JOIN categories c ON g.category_id = c.id
      LEFT JOIN game_media sidebar_media ON g.id = sidebar_media.game_id AND sidebar_media.is_sidebar_image = 1
      WHERE 1=1
    `
    
    const params: any[] = []
    
    // Appliquer les filtres validés
    if (category) {
      query += ' AND g.category_id = ?'
      params.push(category)
    }
    
    if (platform) {
      query += ' AND g.platform = ?'
      params.push(platform)
    }
    
    if (year) {
      query += ' AND g.year = ?'
      params.push(year)
    }
    
    // Appliquer la limite sécurisée
    query += ` ORDER BY g.created_at DESC LIMIT ${limit || 1000}`
    
    // Exécuter la requête avec les paramètres validés
    const [rows] = await db.execute(query, params)
    
    // Vérifier que rows est valide
    if (!rows || !Array.isArray(rows)) {
      return createSuccessResponse({
        games: [],
        total: 0
      })
    }
    
    // Récupérer les badges pour chaque jeu
    const gamesWithBadges = await Promise.all(
      (rows as any[]).map(async (game) => {
        try {
          // Vérifier que game.id est valide
          if (!game.id || isNaN(game.id)) {
            console.warn(`⚠️ ID de jeu invalide détecté:`, game.id)
            return {
              ...game,
              badges: []
            }
          }
          
          const [badgeRows] = await db.execute(`
            SELECT 
              gb.id,
              gb.name,
              gb.display_name,
              gb.color,
              gb.icon,
              gba.expires_at
            FROM game_badges gb
            JOIN game_badge_assignments gba ON gb.id = gba.badge_id
            WHERE gba.game_id = ? AND gba.expires_at > NOW()
            ORDER BY gba.created_at DESC
          `, [game.id])
          
          return {
            ...game,
            badges: badgeRows || []
          }
        } catch (error) {
          console.error(`Erreur lors de la récupération des badges pour le jeu ${game.id}:`, error)
          return {
            ...game,
            badges: []
          }
        }
      })
    )
    
    return createSuccessResponse({
      games: gamesWithBadges || [],
      total: gamesWithBadges.length
    })
    
  } catch (error) {
    console.error('❌ Erreur lors de la récupération des jeux:', error)
    return createErrorResponse('Erreur lors de la récupération des jeux', 500)
  }
}
