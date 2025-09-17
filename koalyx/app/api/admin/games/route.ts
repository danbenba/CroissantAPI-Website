import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/database'
import { requireRole, validateInput, validateId, createErrorResponse, createSuccessResponse, ValidationSchema } from '@/lib/api-security'

// GET - Récupérer tous les jeux (Admin seulement)
export async function GET(request: NextRequest) {
  try {
    // Vérifier l'authentification admin
    const authResult = await requireRole(request, ['admin'])
    if (!authResult.success) {
      return createErrorResponse(authResult.error!, authResult.status)
    }

    const [rows] = await db.execute(`
      SELECT 
        g.*,
        c.name as category_name,
        c.type as category_type
      FROM games g
      LEFT JOIN categories c ON g.category_id = c.id
      ORDER BY g.created_at DESC
    `)
    
    return createSuccessResponse({ games: rows })
    
  } catch (error) {
    console.error('Erreur lors de la récupération des jeux:', error)
    return createErrorResponse('Erreur lors de la récupération des jeux', 500)
  }
}

// POST - Ajouter un nouveau jeu
export async function POST(request: NextRequest) {
  try {
    // Vérifier l'authentification admin
    const authResult = await requireRole(request, ['admin'])
    if (!authResult.success) {
      return createErrorResponse(authResult.error!, authResult.status)
    }

    const gameData = await request.json()
    
    // Schéma de validation
    const schema: ValidationSchema = {
      title: {
        required: true,
        type: 'string',
        minLength: 1,
        maxLength: 255
      },
      description: {
        required: true,
        type: 'string',
        minLength: 10,
        maxLength: 2000
      },
      category_id: {
        required: true,
        type: 'number',
        min: 1
      },
      platform: {
        required: true,
        type: 'string',
        minLength: 1,
        maxLength: 100
      },
      banner_url: {
        type: 'url',
        maxLength: 500
      },
      zip_password: {
        type: 'string',
        maxLength: 100
      },
      is_vip: {
        type: 'boolean'
      },
      access_level: {
        type: 'string',
        enum: ['free', 'plus', 'ultra']
      },
      specifications: {
        type: 'string',
        maxLength: 2000 // Augmenter la limite pour permettre plus de contenu avec retours à la ligne
      },
      year: {
        type: 'number',
        min: 1980,
        max: new Date().getFullYear() + 1
      }
    }

    const validation = validateInput(gameData, schema)
    if (!validation.valid) {
      return createErrorResponse(`Données invalides: ${validation.errors.join(', ')}`, 400)
    }

    const {
      title,
      description,
      banner_url,
      zip_password,
      is_vip,
      access_level,
      category_id,
      platform,
      specifications,
      year,
      download_links
    } = validation.sanitized
    
    console.log('✅ Données validées:', { title, description, category_id, platform })
    
    // Déterminer le niveau d'accès final
    const finalAccessLevel = access_level || (is_vip ? 'ultra' : 'free')
    
    // Ajout du nouveau jeu
    const [result] = await db.execute(`
      INSERT INTO games (title, description, banner_url, zip_password, is_vip, access_level, category_id, platform, specifications, year, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
    `, [
      title, description, banner_url, zip_password,
      is_vip, finalAccessLevel, category_id, platform, specifications, year
    ])
    
    // Récupérer l'ID du nouveau jeu
    const newGameId = (result as any).insertId
    
    // Ajouter les liens de téléchargement
    if (download_links && Array.isArray(download_links)) {
      for (let i = 0; i < download_links.length; i++) {
        const link = download_links[i]
        if (link.title && link.download_url) {
          // Déterminer le niveau d'accès du lien
          const linkAccessLevel = link.access_level || (link.is_vip ? 'ultra' : 'free')
          
          // Gérer les liens différenciés
          if (link.access_level === 'differentiated' && link.is_differentiated) {
            await db.execute(`
              INSERT INTO game_download_links (game_id, icon_url, title, description, download_url, is_vip, access_level, position, is_differentiated, member_url, plus_url, ultra_url)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [
              newGameId, 
              link.icon_url || 'storage/icons/Mbutton/download.png', 
              link.title, 
              link.description || '', 
              link.member_url || link.download_url, // Utiliser member_url comme URL par défaut
              link.is_vip || false,
              linkAccessLevel,
              i,
              true, // is_differentiated
              link.member_url || link.download_url,
              link.plus_url || '',
              link.ultra_url || ''
            ])
          } else {
            // Lien classique
            await db.execute(`
              INSERT INTO game_download_links (game_id, icon_url, title, description, download_url, is_vip, access_level, position, is_differentiated)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [
              newGameId, 
              link.icon_url || 'storage/icons/Mbutton/download.png', 
              link.title, 
              link.description || '', 
              link.download_url, 
              link.is_vip || false,
              linkAccessLevel,
              i,
              false // is_differentiated
            ])
          }
        }
      }
    }
    
    return NextResponse.json({
      success: true,
      message: 'Jeu ajouté avec succès',
      game_id: newGameId
    })
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'ajout du jeu:', error)
    return NextResponse.json(
      { success: false, message: 'Erreur lors de l\'ajout du jeu' },
      { status: 500 }
    )
  }
}

// PUT - Modifier un jeu existant
export async function PUT(request: NextRequest) {
  try {
    const gameData = await request.json()
    
    console.log('📝 Modification - Données reçues:', gameData)
    
    const {
      id,
      title,
      description,
      banner_url,
      zip_password,
      is_vip,
      access_level,
      category_id,
      platform,
      specifications,
      year,
      download_links
    } = gameData
    
    // Validation des champs requis
    if (!title || !description || !category_id || !platform) {
      console.error('❌ Validation échouée:', { title: !!title, description: !!description, category_id: !!category_id, platform: !!platform })
      return NextResponse.json(
        { success: false, message: 'Titre, description, catégorie et plateforme sont requis' },
        { status: 400 }
      )
    }
    
    if (!id) {
      return NextResponse.json(
        { success: false, message: 'ID de jeu requis pour la modification' },
        { status: 400 }
      )
    }
    
    const gameId = validateId(id)
    if (!gameId) {
      return createErrorResponse('ID de jeu invalide', 400)
    }
    
    console.log('✅ Données validées pour modification:', { id, title, description, category_id, platform })
    
    // Déterminer le niveau d'accès final
    const finalAccessLevel = access_level || (is_vip ? 'ultra' : 'free')
    
    // Modification du jeu existant
    await db.execute(`
      UPDATE games SET 
        title = ?, description = ?, banner_url = ?, zip_password = ?,
        is_vip = ?, access_level = ?, category_id = ?, platform = ?, specifications = ?, year = ?
      WHERE id = ?
    `, [
      title, description, banner_url, zip_password,
      is_vip, finalAccessLevel, category_id, platform, specifications, year,
      gameId
    ])
    
    // Supprimer les anciens liens de téléchargement
    await db.execute('DELETE FROM game_download_links WHERE game_id = ?', [gameId])
    
    // Ajouter les nouveaux liens de téléchargement
    if (download_links && Array.isArray(download_links)) {
      console.log('🔗 Ajout des liens de téléchargement:', download_links)
      
      for (let i = 0; i < download_links.length; i++) {
        const link = download_links[i]
        if (link.title && link.download_url) {
          // Déterminer le niveau d'accès du lien
          const linkAccessLevel = link.access_level || (link.is_vip ? 'ultra' : 'free')
          
          // Gérer les liens différenciés
          if (link.access_level === 'differentiated' && link.is_differentiated) {
            await db.execute(`
              INSERT INTO game_download_links (game_id, icon_url, title, description, download_url, is_vip, access_level, position, is_differentiated, member_url, plus_url, ultra_url)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [
              gameId, 
              link.icon_url || 'storage/icons/Mbutton/download.png', 
              link.title, 
              link.description || '', 
              link.member_url || link.download_url, // Utiliser member_url comme URL par défaut
              link.is_vip || false,
              linkAccessLevel,
              i,
              true, // is_differentiated
              link.member_url || link.download_url,
              link.plus_url || '',
              link.ultra_url || ''
            ])
          } else {
            // Lien classique
            await db.execute(`
              INSERT INTO game_download_links (game_id, icon_url, title, description, download_url, is_vip, access_level, position, is_differentiated)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [
              gameId, 
              link.icon_url || 'storage/icons/Mbutton/download.png', 
              link.title, 
              link.description || '', 
              link.download_url, 
              link.is_vip || false,
              linkAccessLevel,
              i,
              false // is_differentiated
            ])
          }
          
          console.log('✅ Lien ajouté:', link.title)
        }
      }
    } else {
      console.log('⚠️ Aucun lien de téléchargement à ajouter')
    }
    
    return NextResponse.json({
      success: true,
      message: 'Jeu modifié avec succès',
      gameId: gameId
    })
    
  } catch (error) {
    console.error('❌ Erreur lors de la modification du jeu:', error)
    return NextResponse.json(
      { success: false, message: 'Erreur lors de la modification du jeu' },
      { status: 500 }
    )
  }
}

// DELETE - Supprimer un jeu
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const gameId = searchParams.get('id')
    
    if (!gameId) {
      return NextResponse.json(
        { success: false, message: 'ID de jeu requis' },
        { status: 400 }
      )
    }
    
    // Valider l'ID du jeu à supprimer
    const validGameId = validateId(gameId)
    if (!validGameId) {
      return createErrorResponse('ID de jeu invalide', 400)
    }

    // Supprimer d'abord les liens de téléchargement
    await db.execute('DELETE FROM game_download_links WHERE game_id = ?', [validGameId])
    
    // Puis supprimer le jeu
    await db.execute('DELETE FROM games WHERE id = ?', [validGameId])
    
    return NextResponse.json({
      success: true,
      message: 'Jeu supprimé avec succès'
    })
    
  } catch (error) {
    console.error('Erreur lors de la suppression du jeu:', error)
    return NextResponse.json(
      { success: false, message: 'Erreur lors de la suppression du jeu' },
      { status: 500 }
    )
  }
}
