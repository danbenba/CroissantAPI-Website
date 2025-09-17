import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/database'
import { getCurrentUser } from '@/lib/auth-support'

// PUT - Marquer une notification comme lue
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser(request)
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Non autorisé' },
        { status: 401 }
      )
    }

    const { id } = await params
    const notificationId = parseInt(id)
    const userId = user.id

    if (isNaN(notificationId)) {
      return NextResponse.json(
        { success: false, message: 'ID de notification invalide' },
        { status: 400 }
      )
    }

    // Vérifier que la notification appartient à l'utilisateur
    const [notification] = await db.execute(`
      SELECT id, user_id, is_read FROM notifications WHERE id = ?
    `, [notificationId])

    if (!Array.isArray(notification) || notification.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Notification non trouvée' },
        { status: 404 }
      )
    }

    const notif = notification[0] as any
    if (notif.user_id !== userId) {
      return NextResponse.json(
        { success: false, message: 'Accès refusé' },
        { status: 403 }
      )
    }

    // Si déjà lue, ne rien faire
    if (notif.is_read) {
      return NextResponse.json({
        success: true,
        message: 'Notification déjà marquée comme lue'
      })
    }

    // Marquer comme lue
    await db.execute(`
      UPDATE notifications 
      SET is_read = true, read_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `, [notificationId])

    return NextResponse.json({
      success: true,
      message: 'Notification marquée comme lue'
    })

  } catch (error) {
    console.error('Erreur lors du marquage de la notification:', error)
    return NextResponse.json(
      { success: false, message: 'Erreur lors du marquage de la notification' },
      { status: 500 }
    )
  }
}

// DELETE - Supprimer une notification
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser(request)
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Non autorisé' },
        { status: 401 }
      )
    }

    const { id } = await params
    const notificationId = parseInt(id)
    const userId = user.id

    if (isNaN(notificationId)) {
      return NextResponse.json(
        { success: false, message: 'ID de notification invalide' },
        { status: 400 }
      )
    }

    // Vérifier que la notification appartient à l'utilisateur
    const [notification] = await db.execute(`
      SELECT id, user_id FROM notifications WHERE id = ?
    `, [notificationId])

    if (!Array.isArray(notification) || notification.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Notification non trouvée' },
        { status: 404 }
      )
    }

    const notif = notification[0] as any
    if (notif.user_id !== userId) {
      return NextResponse.json(
        { success: false, message: 'Accès refusé' },
        { status: 403 }
      )
    }

    // Supprimer la notification
    await db.execute(`
      DELETE FROM notifications WHERE id = ?
    `, [notificationId])

    return NextResponse.json({
      success: true,
      message: 'Notification supprimée'
    })

  } catch (error) {
    console.error('Erreur lors de la suppression de la notification:', error)
    return NextResponse.json(
      { success: false, message: 'Erreur lors de la suppression de la notification' },
      { status: 500 }
    )
  }
}
