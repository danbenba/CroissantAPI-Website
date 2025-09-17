import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/database'
import { requireRole, validateInput, createErrorResponse, createSuccessResponse, ValidationSchema } from '@/lib/api-security'

// GET - Récupérer toutes les publicités (Admin)
export async function GET(request: NextRequest) {
  try {
    // Vérifier les permissions admin
    const authResult = await requireRole(request, ['admin'])
    if (!authResult.success) {
      return createErrorResponse(authResult.error!, authResult.status)
    }

    // Essayer d'abord avec les nouvelles colonnes, avec fallback si elles n'existent pas
    let query = `
      SELECT 
        a.id, a.title, a.description, a.image_url, a.link_url, a.ad_type,
        COALESCE(a.ad_format, 'custom') as ad_format,
        a.google_ad_slot, a.google_ad_format,
        a.target_roles, a.position_priority, a.is_active,
        a.start_date, a.end_date, a.click_count, a.view_count,
        a.created_at, a.updated_at, a.created_by,
        u.nom_utilisateur as created_by_username,
        COALESCE(a.view_count, 0) as total_views,
        COALESCE(a.click_count, 0) as total_clicks
      FROM ads a
      LEFT JOIN utilisateurs u ON a.created_by = u.id
      ORDER BY a.created_at DESC
    `

    const [ads] = await db.execute(query)

    return createSuccessResponse({ ads })

  } catch (error) {
    console.error('Erreur récupération publicités admin:', error)
    return createErrorResponse('Erreur interne du serveur', 500)
  }
}

// POST - Créer une nouvelle publicité (Admin)
export async function POST(request: NextRequest) {
  try {
    // Vérifier les permissions admin
    const authResult = await requireRole(request, ['admin'])
    if (!authResult.success) {
      return createErrorResponse(authResult.error!, authResult.status)
    }

    const body = await request.json()

    // Schéma de validation
    const schema: ValidationSchema = {
      title: {
        required: true,
        type: 'string',
        minLength: 3,
        maxLength: 255
      },
      description: {
        type: 'string',
        maxLength: 1000
      },
      image_url: {
        type: 'url',
        maxLength: 500
      },
      link_url: {
        type: 'url',
        maxLength: 500
      },
      ad_type: {
        required: true,
        type: 'string',
        enum: ['popup', 'banner_top', 'banner_bottom', 'sidebar_left', 'sidebar_right', 'inline_content']
      },
      ad_format: {
        required: true,
        type: 'string',
        enum: ['custom', 'google_ads']
      },
      google_ad_slot: {
        type: 'string',
        maxLength: 255
      },
      google_ad_format: {
        type: 'string',
        maxLength: 100
      },
      target_roles: {
        required: true
      },
      position_priority: {
        type: 'number',
        min: 1,
        max: 100
      },
      start_date: {
        type: 'string'
      },
      end_date: {
        type: 'string'
      }
    }

    const validation = validateInput(body, schema)
    if (!validation.valid) {
      return createErrorResponse(`Données invalides: ${validation.errors.join(', ')}`, 400)
    }

    const {
      title,
      description,
      image_url,
      link_url,
      ad_type,
      ad_format,
      google_ad_slot,
      google_ad_format,
      target_roles,
      position_priority = 1,
      start_date,
      end_date
    } = validation.sanitized

    // Valider target_roles
    const validRoles = ['gratuit', 'plus', 'ultra']
    if (!Array.isArray(target_roles) || !target_roles.every(role => validRoles.includes(role))) {
      return createErrorResponse('Les rôles cibles doivent être un tableau contenant: gratuit, plus, ultra', 400)
    }

    // Convertir les dates ISO en format MySQL si nécessaire
    const mysqlStartDate = start_date && typeof start_date === 'string' ? 
      new Date(start_date).toISOString().slice(0, 19).replace('T', ' ') : null
    const mysqlEndDate = end_date && typeof end_date === 'string' ? 
      new Date(end_date).toISOString().slice(0, 19).replace('T', ' ') : null

    const result = await db.execute(`
      INSERT INTO ads (
        title, description, image_url, link_url, ad_type, ad_format,
        google_ad_slot, google_ad_format, target_roles, position_priority, 
        start_date, end_date, created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      title,
      description || null,
      image_url || null,
      link_url || null,
      ad_type,
      ad_format,
      google_ad_slot || null,
      google_ad_format || null,
      JSON.stringify(target_roles),
      position_priority,
      mysqlStartDate,
      mysqlEndDate,
      authResult.user!.id
    ])

    return createSuccessResponse({
      adId: (result as any).insertId
    }, 'Publicité créée avec succès')

  } catch (error) {
    console.error('Erreur création publicité:', error)
    return createErrorResponse('Erreur interne du serveur', 500)
  }
}
