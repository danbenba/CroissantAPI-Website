import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/database'
import { authenticateUser, createErrorResponse, createSuccessResponse } from '@/lib/api-security'

// GET - Récupérer les publicités selon le rôle utilisateur
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const adType = searchParams.get('type')
    const page = searchParams.get('page') || '/'
    
    // Vérifier l'authentification (optionnel pour les pubs)
    let userRole = 'gratuit' // Par défaut gratuit si pas connecté
    const authResult = await authenticateUser(request)
    if (authResult.success && authResult.user) {
      // Mapper les rôles pour les publicités
      const role = authResult.user.role
      if (role === 'membre' || role === 'visiteur') {
        userRole = 'gratuit'
      } else if (role === 'plus') {
        userRole = 'plus'
      } else if (role === 'ultra') {
        userRole = 'ultra'
      } else if (role === 'admin' || role === 'moderateur' || role === 'support') {
        userRole = 'ultra' // Les admins n'ont pas de pub
      } else {
        userRole = 'gratuit'
      }
    }

    // Si l'utilisateur est ultra, pas de pub
    if (userRole === 'ultra') {
      return createSuccessResponse({ ads: [] })
    }

    // Requête simplifiée pour débugger
    let query = `
      SELECT id, title, description, image_url, link_url, ad_type, ad_format, 
             google_ad_slot, google_ad_format, position_priority, target_roles
      FROM ads 
      WHERE is_active = TRUE 
      AND (start_date IS NULL OR start_date <= NOW())
      AND (end_date IS NULL OR end_date >= NOW())
    `
    
    let params: any[] = []
    
    if (adType) {
      query += ' AND ad_type = ?'
      params.push(adType)
    }
    
    query += ' ORDER BY position_priority ASC, RAND()'
    
    const [rawAds] = await db.execute(query, params)
    
    console.log('🔍 Ads brutes récupérées:', rawAds)
    console.log('👤 User role pour filtrage:', userRole)
    
    // Filtrer les publicités côté JavaScript pour plus de flexibilité
    const filteredAds = Array.isArray(rawAds) ? (rawAds as any[]).filter(ad => {
      if (!ad.target_roles) return true
      
      let targetRoles: string[] = []
      try {
        // Gérer les différents formats possibles de target_roles
        if (typeof ad.target_roles === 'string') {
          targetRoles = JSON.parse(ad.target_roles)
        } else if (Array.isArray(ad.target_roles)) {
          targetRoles = ad.target_roles
        } else {
          console.warn('Format target_roles non reconnu:', ad.target_roles)
          return true
        }
      } catch (e) {
        console.warn('Erreur parsing target_roles:', ad.target_roles, e)
        return true
      }
      
      const isTargeted = targetRoles.includes(userRole)
      console.log(`✅ Pub ${ad.id} (${ad.title}): roles=${JSON.stringify(targetRoles)}, userRole=${userRole}, targeted=${isTargeted}`)
      return isTargeted
    }) : []
    
    console.log('✅ Ads filtrées:', filteredAds.length)
    
    // Enregistrer les vues
    if (filteredAds.length > 0) {
      for (const ad of filteredAds) {
        try {
          await db.execute(`
            INSERT INTO ad_stats (ad_id, user_id, action_type, user_role, page_url, created_at)
            VALUES (?, ?, 'view', ?, ?, NOW())
          `, [
            ad.id,
            authResult.user?.id || null,
            userRole,
            page
          ])
          
          // Incrémenter le compteur de vues
          await db.execute('UPDATE ads SET view_count = view_count + 1 WHERE id = ?', [ad.id])
        } catch (statError) {
          console.warn('Erreur enregistrement stats pour ad', ad.id, ':', statError)
        }
      }
    }

    return createSuccessResponse({ ads: filteredAds, userRole, debug: { rawCount: Array.isArray(rawAds) ? rawAds.length : 0, filteredCount: filteredAds.length } })

  } catch (error) {
    console.error('Erreur récupération publicités:', error)
    return createErrorResponse('Erreur interne du serveur', 500)
  }
}
