import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/database'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const linkId = parseInt(id)
    
    if (isNaN(linkId)) {
      return NextResponse.json(
        { success: false, message: 'ID de lien invalide' },
        { status: 400 }
      )
    }

    // Vérifier le cookie pour éviter les vues multiples
    const cookieName = `link_view_${linkId}`
    const hasViewed = request.cookies.get(cookieName)
    
    if (hasViewed) {
      return NextResponse.json({
        success: true,
        message: 'Vue déjà comptabilisée',
        alreadyViewed: true
      })
    }

    // Incrémenter la vue dans la base de données
    const [result] = await db.execute(
      `UPDATE game_download_links SET views = COALESCE(views, 0) + 1 WHERE id = ?`,
      [linkId]
    )

    // Créer la réponse avec le cookie
    const response = NextResponse.json({
      success: true,
      message: 'Vue comptabilisée',
      alreadyViewed: false
    })

    // Définir le cookie pour 24h (éviter les vues multiples)
    response.cookies.set(cookieName, 'viewed', {
      maxAge: 60 * 60 * 24, // 24 heures
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    })

    return response
    
  } catch (error) {
    console.error('Erreur lors de l\'incrémentation des vues du lien:', error)
    return NextResponse.json(
      { success: false, message: 'Erreur lors de l\'incrémentation des vues' },
      { status: 500 }
    )
  }
}
