import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/database'
import { authenticateUser, validateInput, createErrorResponse, createSuccessResponse, ValidationSchema } from '@/lib/api-security'

// POST - Enregistrer un clic sur une publicité
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validation des données
    const schema: ValidationSchema = {
      adId: {
        required: true,
        type: 'number',
        min: 1
      },
      pageUrl: {
        type: 'string',
        maxLength: 500
      }
    }

    const validation = validateInput(body, schema)
    if (!validation.valid) {
      return createErrorResponse(`Données invalides: ${validation.errors.join(', ')}`, 400)
    }

    const { adId, pageUrl } = validation.sanitized
    
    // Vérifier l'authentification (optionnel)
    let userId = null
    let userRole = 'gratuit'
    const authResult = await authenticateUser(request)
    if (authResult.success && authResult.user) {
      userId = authResult.user.id
      userRole = authResult.user.role
    }

    // Vérifier que la publicité existe et est active
    const [adRows] = await db.execute(`
      SELECT id, link_url FROM ads 
      WHERE id = ? AND is_active = TRUE
    `, [adId])

    if (!Array.isArray(adRows) || adRows.length === 0) {
      return createErrorResponse('Publicité non trouvée', 404)
    }

    const ad = adRows[0] as any

    // Enregistrer le clic
    await db.execute(`
      INSERT INTO ad_stats (ad_id, user_id, action_type, user_role, page_url, created_at)
      VALUES (?, ?, 'click', ?, ?, NOW())
    `, [adId, userId, userRole, pageUrl || '/'])

    // Incrémenter le compteur de clics
    await db.execute('UPDATE ads SET click_count = click_count + 1 WHERE id = ?', [adId])

    return createSuccessResponse({ 
      redirectUrl: ad.link_url 
    }, 'Clic enregistré')

  } catch (error) {
    console.error('Erreur enregistrement clic publicité:', error)
    return createErrorResponse('Erreur interne du serveur', 500)
  }
}
