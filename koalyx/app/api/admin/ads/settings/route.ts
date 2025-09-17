import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/database'
import { requireRole, createErrorResponse, createSuccessResponse } from '@/lib/api-security'

// GET - Récupérer les paramètres publicitaires
export async function GET(request: NextRequest) {
  try {
    // Vérifier les permissions admin
    const authResult = await requireRole(request, ['admin'])
    if (!authResult.success) {
      return createErrorResponse(authResult.error!, authResult.status)
    }

    const [settings] = await db.execute(`
      SELECT setting_key, setting_value, description 
      FROM ad_settings 
      ORDER BY setting_key
    `)

    return createSuccessResponse({ settings })

  } catch (error) {
    console.error('Erreur récupération paramètres ads:', error)
    return createErrorResponse('Erreur interne du serveur', 500)
  }
}

// PUT - Mettre à jour les paramètres publicitaires
export async function PUT(request: NextRequest) {
  try {
    // Vérifier les permissions admin
    const authResult = await requireRole(request, ['admin'])
    if (!authResult.success) {
      return createErrorResponse(authResult.error!, authResult.status)
    }

    const { settings } = await request.json()

    if (!Array.isArray(settings)) {
      return createErrorResponse('Format invalide: attendu un tableau de paramètres', 400)
    }

    // Mettre à jour chaque paramètre
    for (const setting of settings) {
      if (!setting.setting_key || setting.setting_value === undefined) {
        continue
      }

      await db.execute(`
        UPDATE ad_settings 
        SET setting_value = ?, updated_at = NOW(), updated_by = ?
        WHERE setting_key = ?
      `, [setting.setting_value, authResult.user!.id, setting.setting_key])
    }

    return createSuccessResponse({}, 'Paramètres mis à jour avec succès')

  } catch (error) {
    console.error('Erreur mise à jour paramètres ads:', error)
    return createErrorResponse('Erreur interne du serveur', 500)
  }
}
