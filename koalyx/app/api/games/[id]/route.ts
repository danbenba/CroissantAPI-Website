import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/database'
import { validateId, createErrorResponse, createSuccessResponse } from '@/lib/api-security'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    // Valider l'ID de manière sécurisée
    const gameId = validateId(id)
    if (!gameId) {
      return createErrorResponse('ID de jeu invalide', 400)
    }
    
    // Récupérer les détails du jeu depuis la DB
    const [gameRows] = await db.execute(`
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
        c.type as category_type
      FROM games g
      LEFT JOIN categories c ON g.category_id = c.id
      WHERE g.id = ?
    `, [gameId])
    
    if (!gameRows || (gameRows as any[]).length === 0) {
      return createErrorResponse('Jeu non trouvé', 404)
    }
    
    const game = (gameRows as any[])[0]
    
    // Récupérer les liens de téléchargement
    const [linkRows] = await db.execute(`
      SELECT 
        id, icon_url, title, description, download_url, is_vip, access_level, position,
        is_differentiated, member_url, plus_url, ultra_url
      FROM game_download_links 
      WHERE game_id = ? 
      ORDER BY position ASC
    `, [gameId])
    
    // Récupérer les badges actifs
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
    `, [gameId])
    
    return createSuccessResponse({
      game: {
        ...game,
        download_links: linkRows,
        badges: badgeRows || []
      }
    })
    
  } catch (error) {
    console.error('Erreur lors de la récupération du jeu:', error)
    return createErrorResponse('Erreur lors de la récupération du jeu', 500)
  }
}
