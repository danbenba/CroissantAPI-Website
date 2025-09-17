import { NextRequest, NextResponse } from 'next/server'
import { TokenEncryption } from '@/lib/crypto'

// GET - Récupérer tous les signalements de liens morts (admin seulement)
export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value

    if (!token) {
      return NextResponse.json({ success: false, message: 'Non authentifié' }, { status: 401 })
    }

    const tokenInfo = TokenEncryption.getTokenInfo(token)
    if (!tokenInfo) {
      return NextResponse.json({ success: false, message: 'Token invalide' }, { status: 401 })
    }

    // Vérifier si l'utilisateur est admin
    if (tokenInfo.role !== 'admin') {
      return NextResponse.json({ success: false, message: 'Accès refusé' }, { status: 403 })
    }

    const { executeQuery } = await import('@/lib/database')

    // Récupérer tous les signalements avec comptage
    const reports = await executeQuery(`
      SELECT 
        dl.id as link_id,
        dl.title as link_title,
        dl.description as link_description,
        dl.download_url,
        dl.icon_url,
        g.id as game_id,
        g.title as game_title,
        g.banner_url as game_banner,
        COUNT(dlr.id) as report_count,
        MIN(dlr.created_at) as first_report,
        MAX(dlr.created_at) as last_report,
        GROUP_CONCAT(u.nom_utilisateur ORDER BY dlr.created_at SEPARATOR '|') as user_names,
        GROUP_CONCAT(dlr.created_at ORDER BY dlr.created_at SEPARATOR '|') as report_dates,
        CASE 
          WHEN COUNT(dlr.id) >= 5 THEN 'urgent'
          WHEN COUNT(dlr.id) >= 3 THEN 'medium'
          ELSE 'low'
        END as priority
      FROM dead_link_reports dlr
      JOIN game_download_links dl ON dlr.link_id = dl.id
      JOIN games g ON dl.game_id = g.id
      JOIN utilisateurs u ON dlr.user_id = u.id
      WHERE dlr.status = 'pending'
      GROUP BY dl.id, dl.title, dl.description, dl.download_url, dl.icon_url, g.id, g.title, g.banner_url
      ORDER BY report_count DESC, first_report ASC
    `)

    return NextResponse.json({
      success: true,
      reports
    })

  } catch (error) {
    console.error('Erreur lors de la récupération des signalements:', error)
    return NextResponse.json({ success: false, message: 'Erreur interne du serveur' }, { status: 500 })
  }
}

// POST - Créer un signalement de lien mort
export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value

    if (!token) {
      return NextResponse.json({ success: false, message: 'Non authentifié' }, { status: 401 })
    }

    const tokenInfo = TokenEncryption.getTokenInfo(token)
    if (!tokenInfo) {
      return NextResponse.json({ success: false, message: 'Token invalide' }, { status: 401 })
    }

    const userId = tokenInfo.userId

    const { linkId } = await request.json()

    if (!linkId) {
      return NextResponse.json({ success: false, message: 'ID du lien requis' }, { status: 400 })
    }

    const { executeQuery } = await import('@/lib/database')

    // Vérifier si l'utilisateur a déjà signalé ce lien
    const existing = await executeQuery(
      'SELECT id FROM dead_link_reports WHERE user_id = ? AND link_id = ? AND status = "pending"',
      [userId, linkId]
    )

    if (existing.length > 0) {
      return NextResponse.json({ 
        success: false, 
        message: 'Vous avez déjà signalé ce lien comme mort' 
      }, { status: 400 })
    }

    // Ajouter le signalement
    await executeQuery(
      'INSERT INTO dead_link_reports (user_id, link_id, status, created_at) VALUES (?, ?, "pending", NOW())',
      [userId, linkId]
    )

    // Récupérer les informations du lien pour la notification
    const linkData = await executeQuery(`
      SELECT dl.title, g.title as game_title 
      FROM game_download_links dl 
      JOIN games g ON dl.game_id = g.id 
      WHERE dl.id = ?
    `, [linkId])

    const linkTitle = linkData[0]?.title || 'Lien inconnu'
    const gameTitle = linkData[0]?.game_title || 'Jeu inconnu'

    // Créer une notification pour les admins
    const admins = await executeQuery(
      'SELECT id FROM utilisateurs WHERE role = "admin"'
    )

    for (const admin of admins) {
      await executeQuery(
        'INSERT INTO notifications (user_id, type, title, message, created_at) VALUES (?, ?, ?, ?, NOW())',
        [
          admin.id,
          'other',
          'Nouveau signalement de lien mort',
          `Un utilisateur a signalé le lien "${linkTitle}" du jeu "${gameTitle}" comme mort`
        ]
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Signalement envoyé avec succès'
    })

  } catch (error) {
    console.error('Erreur lors de la création du signalement:', error)
    return NextResponse.json({ success: false, message: 'Erreur interne du serveur' }, { status: 500 })
  }
}
