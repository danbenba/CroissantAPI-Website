import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/database'
import { getCurrentUser } from '@/lib/auth-support'

// GET - Récupérer les tickets de l'utilisateur connecté
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
    
    // Récupérer tous les tickets de l'utilisateur avec les derniers messages
    const [tickets] = await db.execute(`
      SELECT 
        t.id,
        t.type,
        t.subject,
        t.status,
        t.priority,
        t.created_at,
        t.updated_at,
        t.closed_at,
        supporter.nom_utilisateur as assigned_to_name,
        supporter.photo as assigned_to_photo,
        (
          SELECT COUNT(*) 
          FROM support_messages sm 
          WHERE sm.ticket_id = t.id
        ) as message_count,
        (
          SELECT sm.message 
          FROM support_messages sm 
          WHERE sm.ticket_id = t.id 
          ORDER BY sm.created_at DESC 
          LIMIT 1
        ) as last_message,
        (
          SELECT sm.created_at 
          FROM support_messages sm 
          WHERE sm.ticket_id = t.id 
          ORDER BY sm.created_at DESC 
          LIMIT 1
        ) as last_message_date
      FROM support_tickets t
      LEFT JOIN utilisateurs supporter ON t.assigned_to = supporter.id
      WHERE t.user_id = ?
      ORDER BY t.updated_at DESC
    `, [userId])

    return NextResponse.json({
      success: true,
      tickets: tickets || []
    })

  } catch (error) {
    console.error('Erreur lors de la récupération des tickets:', error)
    return NextResponse.json(
      { success: false, message: 'Erreur lors de la récupération des tickets' },
      { status: 500 }
    )
  }
}

// POST - Créer un nouveau ticket
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request)
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Non autorisé' },
        { status: 401 }
      )
    }

    const userId = user.id
    const { type, subject, message } = await request.json()

    // Validation
    if (!type || !subject || !message) {
      return NextResponse.json(
        { success: false, message: 'Tous les champs sont requis' },
        { status: 400 }
      )
    }

    if (subject.length > 255) {
      return NextResponse.json(
        { success: false, message: 'Le sujet ne peut pas dépasser 255 caractères' },
        { status: 400 }
      )
    }

    // Créer le ticket
    const [ticketResult] = await db.execute(`
      INSERT INTO support_tickets (user_id, type, subject, status, priority)
      VALUES (?, ?, ?, 'open', 'medium')
    `, [userId, type, subject])

    const ticketId = (ticketResult as any).insertId

    // Ajouter le premier message
    await db.execute(`
      INSERT INTO support_messages (ticket_id, user_id, message, message_type)
      VALUES (?, ?, ?, 'user_message')
    `, [ticketId, userId, message])

    // Créer une notification pour les supports/admins
          const [supportUsers] = await db.execute(`
      SELECT id FROM utilisateurs 
      WHERE role IN ('support', 'admin') 
      AND id != ?
    `, [userId])

    // Notifier tous les supports/admins
    if (Array.isArray(supportUsers)) {
      for (const supportUser of supportUsers as any[]) {
        await db.execute(`
          INSERT INTO notifications (user_id, type, title, message, related_id, related_type)
          VALUES (?, 'support_ticket', ?, ?, ?, 'support_ticket')
        `, [
          supportUser.id,
          'Nouveau ticket de support',
          `Un nouveau ticket "${subject}" a été créé par ${user.nom_utilisateur || 'un utilisateur'}.`,
          ticketId
        ])
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Ticket créé avec succès',
      ticketId
    })

  } catch (error) {
    console.error('Erreur lors de la création du ticket:', error)
    return NextResponse.json(
      { success: false, message: 'Erreur lors de la création du ticket' },
      { status: 500 }
    )
  }
}
