import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/database'
import { getCurrentUser, canAccessSupport } from '@/lib/auth-support'

// PUT - Changer le statut d'un ticket
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

    if (!canAccessSupport(user)) {
      return NextResponse.json(
        { success: false, message: 'Accès refusé' },
        { status: 403 }
      )
    }

    const { id } = await params
    const ticketId = parseInt(id)
    const { status, reason } = await request.json()

    if (isNaN(ticketId)) {
      return NextResponse.json(
        { success: false, message: 'ID de ticket invalide' },
        { status: 400 }
      )
    }

    // Définir le type pour les statuts valides
    type ValidStatus = 'open' | 'in_progress' | 'waiting_user' | 'resolved' | 'closed'
    const validStatuses: ValidStatus[] = ['open', 'in_progress', 'waiting_user', 'resolved', 'closed']
    
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { success: false, message: 'Statut invalide' },
        { status: 400 }
      )
    }

    // À ce point, status est de type ValidStatus
    const validatedStatus = status as ValidStatus

    // Vérifier que le ticket existe
    const [ticketCheck] = await db.execute(`
      SELECT id, user_id, assigned_to, status as current_status, subject FROM support_tickets WHERE id = ?
    `, [ticketId])

    if (!Array.isArray(ticketCheck) || ticketCheck.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Ticket non trouvé' },
        { status: 404 }
      )
    }

    const ticket = ticketCheck[0] as any
    const userId = user.id
    const userRole = user.role

    // Vérifier les permissions pour modifier ce ticket
    const canModify = (
      userRole === 'admin' || 
      (userRole === 'support' && ticket.assigned_to === userId)
    )

    if (!canModify) {
      return NextResponse.json(
        { success: false, message: 'Vous ne pouvez pas modifier ce ticket' },
        { status: 403 }
      )
    }

    // Si le statut ne change pas, ne rien faire
    if (ticket.current_status === status) {
      return NextResponse.json({
        success: true,
        message: 'Statut inchangé'
      })
    }

    // Mettre à jour le statut
    const closedAt = validatedStatus === 'closed' ? new Date() : null
    
    await db.execute(`
      UPDATE support_tickets 
      SET status = ?, closed_at = ?, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `, [validatedStatus, closedAt, ticketId])

    // Créer les messages système appropriés
    const statusMessages: Record<ValidStatus, string> = {
      'open': 'Ticket rouvert',
      'in_progress': 'Ticket mis en cours de traitement',
      'waiting_user': 'En attente de réponse utilisateur',
      'resolved': 'Ticket marqué comme résolu',
      'closed': 'Ticket fermé'
    }

    let systemMessage = `${statusMessages[validatedStatus]} par ${user.nom_utilisateur || 'un support'}.`
    if (reason) {
      systemMessage += ` Raison: ${reason}`
    }

    await db.execute(`
      INSERT INTO support_messages (ticket_id, user_id, message, message_type, is_system_message)
      VALUES (?, ?, ?, 'system_message', true)
    `, [ticketId, userId, systemMessage])

    // Créer des notifications appropriées
    if (status === 'resolved' || status === 'closed') {
      await db.execute(`
        INSERT INTO notifications (user_id, type, title, message, related_id, related_type)
        VALUES (?, 'support_ticket', ?, ?, ?, 'support_ticket')
      `, [
        ticket.user_id,
        status === 'resolved' ? 'Ticket résolu' : 'Ticket fermé',
        `Votre ticket "${ticket.subject}" a été ${status === 'resolved' ? 'résolu' : 'fermé'}.`,
        ticketId
      ])
    } else if (status === 'waiting_user') {
      await db.execute(`
        INSERT INTO notifications (user_id, type, title, message, related_id, related_type)
        VALUES (?, 'support_ticket', ?, ?, ?, 'support_ticket')
      `, [
        ticket.user_id,
        'Réponse demandée',
        `Le support attend votre réponse sur le ticket "${ticket.subject}".`,
        ticketId
      ])
    }

    return NextResponse.json({
      success: true,
      message: 'Statut mis à jour avec succès'
    })

  } catch (error) {
    console.error('Erreur lors de la mise à jour du statut:', error)
    return NextResponse.json(
      { success: false, message: 'Erreur lors de la mise à jour du statut' },
      { status: 500 }
    )
  }
}
