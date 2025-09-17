import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/database'
import { requireRole, validateInput, validateId, createErrorResponse, createSuccessResponse, ValidationSchema } from '@/lib/api-security'

// PUT - Modifier une publicité (Admin)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Vérifier les permissions admin
    const authResult = await requireRole(request, ['admin'])
    if (!authResult.success) {
      return createErrorResponse(authResult.error!, authResult.status)
    }

    const { id } = await params
    const adId = validateId(id)
    if (!adId) {
      return createErrorResponse('ID de publicité invalide', 400)
    }

    const body = await request.json()

    // Schéma de validation
    const schema: ValidationSchema = {
      title: {
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
        type: 'string',
        enum: ['popup', 'banner_top', 'banner_bottom', 'sidebar_left', 'sidebar_right', 'inline_content']
      },
      position_priority: {
        type: 'number',
        min: 1,
        max: 100
      },
      is_active: {
        type: 'boolean'
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

    // Vérifier que la publicité existe
    const [existingAd] = await db.execute('SELECT id FROM ads WHERE id = ?', [adId])
    if (!Array.isArray(existingAd) || existingAd.length === 0) {
      return createErrorResponse('Publicité non trouvée', 404)
    }

    // Construire la requête de mise à jour dynamiquement
    const updateFields = []
    const updateValues = []

    for (const [key, value] of Object.entries(validation.sanitized)) {
      if (value !== undefined) {
        if (key === 'target_roles') {
          const validRoles = ['gratuit', 'plus', 'ultra']
          if (!Array.isArray(value) || !value.every(role => validRoles.includes(role))) {
            return createErrorResponse('Les rôles cibles doivent être un tableau contenant: gratuit, plus, ultra', 400)
          }
          updateFields.push('target_roles = ?')
          updateValues.push(JSON.stringify(value))
        } else if (key === 'start_date' || key === 'end_date') {
          // Convertir les dates ISO en format MySQL DATETIME
          if (value && typeof value === 'string') {
            const date = new Date(value)
            if (!isNaN(date.getTime())) {
              const mysqlDate = date.toISOString().slice(0, 19).replace('T', ' ')
              updateFields.push(`${key} = ?`)
              updateValues.push(mysqlDate)
            }
          } else if (value === null || value === '') {
            updateFields.push(`${key} = ?`)
            updateValues.push(null)
          }
        } else {
          updateFields.push(`${key} = ?`)
          updateValues.push(value)
        }
      }
    }

    if (updateFields.length === 0) {
      return createErrorResponse('Aucun champ à mettre à jour', 400)
    }

    updateValues.push(adId)

    await db.execute(`
      UPDATE ads 
      SET ${updateFields.join(', ')}, updated_at = NOW()
      WHERE id = ?
    `, updateValues)

    return createSuccessResponse({}, 'Publicité mise à jour avec succès')

  } catch (error) {
    console.error('Erreur modification publicité:', error)
    return createErrorResponse('Erreur interne du serveur', 500)
  }
}

// DELETE - Supprimer une publicité (Admin)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Vérifier les permissions admin
    const authResult = await requireRole(request, ['admin'])
    if (!authResult.success) {
      return createErrorResponse(authResult.error!, authResult.status)
    }

    const { id } = await params
    const adId = validateId(id)
    if (!adId) {
      return createErrorResponse('ID de publicité invalide', 400)
    }

    // Vérifier que la publicité existe
    const [existingAd] = await db.execute('SELECT id FROM ads WHERE id = ?', [adId])
    if (!Array.isArray(existingAd) || existingAd.length === 0) {
      return createErrorResponse('Publicité non trouvée', 404)
    }

    // Supprimer la publicité (les stats seront supprimées automatiquement via CASCADE)
    await db.execute('DELETE FROM ads WHERE id = ?', [adId])

    return createSuccessResponse({}, 'Publicité supprimée avec succès')

  } catch (error) {
    console.error('Erreur suppression publicité:', error)
    return createErrorResponse('Erreur interne du serveur', 500)
  }
}
