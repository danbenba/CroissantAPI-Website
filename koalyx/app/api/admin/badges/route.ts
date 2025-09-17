import { NextRequest, NextResponse } from 'next/server'
import { executeQuery } from '@/lib/database'

export async function GET(request: NextRequest) {
  try {
    // Récupérer tous les badges disponibles
    const badges = await executeQuery(`
      SELECT 
        id,
        name,
        display_name,
        color,
        icon,
        description,
        created_at
      FROM game_badges
      ORDER BY display_name ASC
    `)

    return NextResponse.json({
      success: true,
      badges: badges || []
    })

  } catch (error) {
    console.error('Erreur lors de la récupération des badges:', error)
    return NextResponse.json(
      { success: false, message: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
