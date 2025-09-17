import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/database'
import { getCurrentUser, canManageTicket } from '@/lib/auth-support'

// GET - Récupérer tous les messages d'un ticket
export async function GET(
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
    const ticketId = parseInt(id)
    const userId = user.id

    if (isNaN(ticketId)) {
      return NextResponse.json(
        { success: false, message: 'ID de ticket invalide' },
        { status: 400 }
      )
    }

    // Vérifier que l'utilisateur a accès à ce ticket
    const [ticketCheck] = await db.execute(`
      SELECT user_id, assigned_to FROM support_tickets WHERE id = ?
    `, [ticketId])

    if (!Array.isArray(ticketCheck) || ticketCheck.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Ticket non trouvé' },
        { status: 404 }
      )
    }

    const ticket = ticketCheck[0] as any
    const userRole = user.role

    // Vérifier les permissions avec notre fonction helper
    const canAccess = canManageTicket(user, ticket.user_id, ticket.assigned_to)

    if (!canAccess) {
      return NextResponse.json(
        { success: false, message: 'Accès refusé à ce ticket' },
        { status: 403 }
      )
    }

    // Récupérer tous les messages du ticket
    const [messages] = await db.execute(`
      SELECT 
        sm.id,
        sm.message,
        sm.message_type,
        sm.is_system_message,
        sm.created_at,
        u.id as user_id,
        u.nom_utilisateur,
        u.photo,
        u.role
      FROM support_messages sm
      JOIN utilisateurs u ON sm.user_id = u.id
      WHERE sm.ticket_id = ?
      ORDER BY sm.created_at ASC
    `, [ticketId])

    return NextResponse.json({
      success: true,
      messages: messages || []
    })

  } catch (error) {
    console.error('Erreur lors de la récupération des messages:', error)
    return NextResponse.json(
      { success: false, message: 'Erreur lors de la récupération des messages' },
      { status: 500 }
    )
  }
}

// POST - Ajouter un nouveau message à un ticket
export async function POST(
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
    const ticketId = parseInt(id)
    const userId = user.id
    const userRole = user.role
    const { message } = await request.json()

    if (isNaN(ticketId)) {
      return NextResponse.json(
        { success: false, message: 'ID de ticket invalide' },
        { status: 400 }
      )
    }

    if (!message || message.trim().length === 0) {
      return NextResponse.json(
        { success: false, message: 'Le message ne peut pas être vide' },
        { status: 400 }
      )
    }

    // Vérifier que l'utilisateur a accès à ce ticket
    const [ticketCheck] = await db.execute(`
      SELECT user_id, assigned_to, status FROM support_tickets WHERE id = ?
    `, [ticketId])

    if (!Array.isArray(ticketCheck) || ticketCheck.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Ticket non trouvé' },
        { status: 404 }
      )
    }

    const ticket = ticketCheck[0] as any

    // Vérifier les permissions
    const canReply = canManageTicket(user, ticket.user_id, ticket.assigned_to)

    if (!canReply) {
      return NextResponse.json(
        { success: false, message: 'Vous ne pouvez pas répondre à ce ticket' },
        { status: 403 }
      )
    }

    // Vérifier que le ticket n'est pas fermé
    if (ticket.status === 'closed') {
      return NextResponse.json(
        { success: false, message: 'Impossible de répondre à un ticket fermé' },
        { status: 400 }
      )
    }

    // Déterminer le type de message
    let messageType = 'user_message'
    if (userRole === 'admin' || userRole === 'support') {
      messageType = 'support_message'
    }

    // Ajouter le message
    await db.execute(`
      INSERT INTO support_messages (ticket_id, user_id, message, message_type)
      VALUES (?, ?, ?, ?)
    `, [ticketId, userId, message.trim(), messageType])

    // Mettre à jour la date de dernière modification du ticket
    await db.execute(`
      UPDATE support_tickets SET updated_at = CURRENT_TIMESTAMP WHERE id = ?
    `, [ticketId])

    // Si c'est un message du support/admin, changer le statut si nécessaire
    if (messageType === 'support_message' && ticket.status === 'waiting_user') {
      await db.execute(`
        UPDATE support_tickets SET status = 'in_progress' WHERE id = ?
      `, [ticketId])
    } else if (messageType === 'user_message' && ticket.status === 'in_progress') {
      await db.execute(`
        UPDATE support_tickets SET status = 'waiting_user' WHERE id = ?
      `, [ticketId])
    }

    // Créer une notification pour l'autre partie
    if (messageType === 'support_message') {
      // Notifier le créateur du ticket
      await db.execute(`
        INSERT INTO notifications (user_id, type, title, message, related_id, related_type)
        VALUES (?, 'support_ticket', ?, ?, ?, 'support_ticket')
      `, [
        ticket.user_id,
        'Réponse à votre ticket',
        `Le support a répondu à votre ticket. (Voir plus sur l'histoique de support)`,
        ticketId
      ])
    } else {
      // Notifier le support assigné (s'il y en a un)
      if (ticket.assigned_to) {
        await db.execute(`
          INSERT INTO notifications (user_id, type, title, message, related_id, related_type)
          VALUES (?, 'support_ticket', ?, ?, ?, 'support_ticket')
        `, [
          ticket.assigned_to,
          'Nouvelle réponse utilisateur',
          `L'utilisateur a répondu au ticket (Voir plus sur l'histoique de support).`,
          ticketId
        ])
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Message ajouté avec succès'
    })

  } catch (error) {
    console.error('Erreur lors de l\'ajout du message:', error)
    return NextResponse.json(
      { success: false, message: 'Erreur lors de l\'ajout du message' },
      { status: 500 }
    )
  }
}
