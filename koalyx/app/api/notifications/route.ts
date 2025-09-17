import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/database'
import { getCurrentUser } from '@/lib/auth-support'

// GET - Récupérer les notifications de l'utilisateur
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request)
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Non autorisé' },
        { status: 401 }
      )
    }

    const userId = user.id
    const url = new URL(request.url)
    const limit = parseInt(url.searchParams.get('limit') || '20')
    const unreadOnly = url.searchParams.get('unread_only') === 'true'

    // Construction de la requête avec filtre

    // Version simplifiée sans paramètres dynamiques
    const [notifications] = await db.execute(`
      SELECT 
        id,
        type,
        title,
        message,
        is_read,
        related_id,
        related_type,
        action_url,
        created_at,
        read_at
      FROM notifications
      WHERE user_id = ${userId}${unreadOnly ? ' AND is_read = false' : ''}
      ORDER BY created_at DESC
      LIMIT ${limit}
    `)

    // Compter le nombre de notifications non lues
    const [unreadCount] = await db.execute(`
      SELECT COUNT(*) as count
      FROM notifications
      WHERE user_id = ${userId} AND is_read = false
    `)

    return NextResponse.json({
      success: true,
      notifications: notifications || [],
      unread_count: (unreadCount as any[])[0]?.count || 0
    })

  } catch (error) {
    console.error('Erreur lors de la récupération des notifications:', error)
    return NextResponse.json(
      { success: false, message: 'Erreur lors de la récupération des notifications' },
      { status: 500 }
    )
  }
}

// POST - Créer une nouvelle notification (pour les admins)
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request)
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Non autorisé' },
        { status: 401 }
      )
    }

    if (!['admin'].includes(user.role)) {
      return NextResponse.json(
        { success: false, message: 'Accès refusé' },
        { status: 403 }
      )
    }

    const { user_id, type, title, message, related_id, related_type, action_url } = await request.json()

    // Validation
    if (!user_id || !type || !title || !message) {
      return NextResponse.json(
        { success: false, message: 'Données manquantes' },
        { status: 400 }
      )
    }

    // Créer la notification
    const [result] = await db.execute(`
      INSERT INTO notifications (user_id, type, title, message, related_id, related_type, action_url)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [user_id, type, title, message, related_id || null, related_type || null, action_url || null])

    return NextResponse.json({
      success: true,
      message: 'Notification créée avec succès',
      notification_id: (result as any).insertId
    })

  } catch (error) {
    console.error('Erreur lors de la création de la notification:', error)
    return NextResponse.json(
      { success: false, message: 'Erreur lors de la création de la notification' },
      { status: 500 }
    )
  }
}
