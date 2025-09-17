import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/database'
import { getCurrentUser, canAccessSupport } from '@/lib/auth-support'

// POST - Assigner un ticket à un support
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

    if (!canAccessSupport(user)) {
      return NextResponse.json(
        { success: false, message: 'Accès refusé' },
        { status: 403 }
      )
    }

    const { id } = await params
    const ticketId = parseInt(id)
    const { assignedTo } = await request.json()

    if (isNaN(ticketId)) {
      return NextResponse.json(
        { success: false, message: 'ID de ticket invalide' },
        { status: 400 }
      )
    }

    // Vérifier que le ticket existe
    const [ticketCheck] = await db.execute(`
      SELECT id, user_id, assigned_to, status, subject FROM support_tickets WHERE id = ?
    `, [ticketId])

    if (!Array.isArray(ticketCheck) || ticketCheck.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Ticket non trouvé' },
        { status: 404 }
      )
    }

    const ticket = ticketCheck[0] as any

    // Si assignedTo est null, on désassigne le ticket
    if (assignedTo === null) {
      await db.execute(`
        UPDATE support_tickets 
        SET assigned_to = NULL, updated_at = CURRENT_TIMESTAMP 
        WHERE id = ?
      `, [ticketId])

      // Ajouter un message système
      await db.execute(`
        INSERT INTO support_messages (ticket_id, user_id, message, message_type, is_system_message)
        VALUES (?, ?, ?, 'system_message', true)
      `, [
        ticketId,
        user.id,
        `Ticket désassigné par ${user.nom_utilisateur || 'un administrateur'}.`
      ])

      return NextResponse.json({
        success: true,
        message: 'Ticket désassigné avec succès'
      })
    }

    // Vérifier que l'utilisateur assigné est un support/admin
    const [supportCheck] = await db.execute(`
      SELECT id, nom_utilisateur, role FROM utilisateurs WHERE id = ? AND role IN ('support', 'admin')
    `, [assignedTo])

    if (!Array.isArray(supportCheck) || supportCheck.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Utilisateur support non trouvé' },
        { status: 400 }
      )
    }

    const support = supportCheck[0] as any

    // Assigner le ticket
    await db.execute(`
      UPDATE support_tickets 
      SET assigned_to = ?, status = CASE WHEN status = 'open' THEN 'in_progress' ELSE status END, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `, [assignedTo, ticketId])

    // Ajouter un message système
    await db.execute(`
      INSERT INTO support_messages (ticket_id, user_id, message, message_type, is_system_message)
      VALUES (?, ?, ?, 'system_message', true)
    `, [
      ticketId,
      user.id,
      `Ticket assigné à ${support.nom_utilisateur} par ${user.nom_utilisateur || 'un administrateur'}.`
    ])

    // Créer une notification pour le support assigné
    if (assignedTo !== user.id) {
      await db.execute(`
        INSERT INTO notifications (user_id, type, title, message, related_id, related_type)
        VALUES (?, 'support_ticket', ?, ?, ?, 'support_ticket')
      `, [
        assignedTo,
        'Ticket assigné',
        `Le ticket "${ticket.subject}" vous a été assigné.`,
        ticketId
      ])
    }

    // Notifier le créateur du ticket
    await db.execute(`
      INSERT INTO notifications (user_id, type, title, message, related_id, related_type)
      VALUES (?, 'support_ticket', ?, ?, ?, 'support_ticket')
    `, [
      ticket.user_id,
      'Ticket pris en charge',
      `Votre ticket "${ticket.subject}" a été pris en charge par notre équipe support.`,
      ticketId
    ])

    return NextResponse.json({
      success: true,
      message: 'Ticket assigné avec succès'
    })

  } catch (error) {
    console.error('Erreur lors de l\'assignation du ticket:', error)
    return NextResponse.json(
      { success: false, message: 'Erreur lors de l\'assignation du ticket' },
      { status: 500 }
    )
  }
}
