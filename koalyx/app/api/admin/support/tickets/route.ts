import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/database'
import { getCurrentUser, canAccessSupport } from '@/lib/auth-support'

// GET - Récupérer tous les tickets pour l'administration
export async function GET(request: NextRequest) {
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

    const userId = user.id
    const userRole = user.role
    const url = new URL(request.url)
    const status = url.searchParams.get('status')
    const assignedTo = url.searchParams.get('assigned_to')
    const page = parseInt(url.searchParams.get('page') || '1')
    const limit = parseInt(url.searchParams.get('limit') || '20')
    const offset = (page - 1) * limit

    // S'assurer que les valeurs sont des nombres valides
    if (isNaN(limit) || isNaN(offset)) {
      return NextResponse.json(
        { success: false, message: 'Paramètres de pagination invalides' },
        { status: 400 }
      )
    }

    // Variables pour la construction de la requête avec filtres

    // Construire la requête complète avec les filtres
    let fullWhereClause = '1=1'
    const queryParams: any[] = []

    if (status && status !== 'all') {
      fullWhereClause += ' AND t.status = ?'
      queryParams.push(status)
    }

    if (assignedTo === 'unassigned') {
      fullWhereClause += ' AND t.assigned_to IS NULL'
    } else if (assignedTo === 'me') {
      // Pour les admins: voir tous les tickets assignés à eux
      // Pour les supports: voir uniquement leurs tickets
      fullWhereClause += ' AND t.assigned_to = ?'
      queryParams.push(userId)
    } else if (assignedTo && assignedTo !== 'all') {
      fullWhereClause += ' AND t.assigned_to = ?'
      queryParams.push(parseInt(assignedTo))
    }
    // Si assignedTo === 'all' ou undefined, on ne filtre pas (voir tous les tickets)
    
    const [tickets] = await db.execute(`
      SELECT 
        t.id,
        t.subject,
        t.status,
        t.created_at,
        creator.nom_utilisateur as creator_name
      FROM support_tickets t
      JOIN utilisateurs creator ON t.user_id = creator.id
      ORDER BY t.created_at DESC
      LIMIT 10 OFFSET 0
    `)

    // Compter le total (simplifié)
    const [countResult] = await db.execute(`
      SELECT COUNT(*) as total
      FROM support_tickets t
    `)

    const total = (countResult as any[])[0]?.total || 0

    // Récupérer la liste des supports pour les filtres
    const [supports] = await db.execute(`
      SELECT id, nom_utilisateur, photo
      FROM utilisateurs 
      WHERE role IN ('support', 'admin')
      ORDER BY nom_utilisateur
    `)

    return NextResponse.json({
      success: true,
      tickets: tickets || [],
      pagination: {
        current_page: page,
        total_pages: Math.ceil(total / limit),
        total_items: total,
        items_per_page: limit
      },
      supports: supports || []
    })

  } catch (error) {
    console.error('Erreur lors de la récupération des tickets admin:', error)
    return NextResponse.json(
      { success: false, message: 'Erreur lors de la récupération des tickets' },
      { status: 500 }
    )
  }
}
