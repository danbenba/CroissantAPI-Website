import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/database'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params // ✅ Correction Next.js 15
    const gameId = parseInt(id)
    
    if (isNaN(gameId)) {
      return NextResponse.json(
        { success: false, message: 'ID de jeu invalide' },
        { status: 400 }
      )
    }
    
    // ✅ Récupération depuis la vraie base de données
    const [rows] = await db.execute(
      `SELECT 
        id,
        icon_url,
        title,
        description,
        download_url,
        is_vip,
        access_level,
        position,
        is_differentiated,
        member_url,
        plus_url,
        ultra_url
       FROM game_download_links 
       WHERE game_id = ? 
       ORDER BY position ASC`,
      [gameId]
    )
    
    return NextResponse.json({
      success: true,
      downloadLinks: rows // Changé de 'links' à 'downloadLinks' pour correspondre au frontend
    })
    
  } catch (error) {
    console.error('Erreur lors de la récupération des liens:', error)
    return NextResponse.json(
      { success: false, message: 'Erreur lors de la récupération des liens' },
      { status: 500 }
    )
  }
}
