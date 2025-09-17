import { NextRequest, NextResponse } from 'next/server'

// Mock data pour les jeux (à remplacer par votre vraie base de données)
let mockGames = [
  {
    id: 1,
    titre: "Grand Theft Auto V",
    description: "Un jeu d'action-aventure en monde ouvert",
    image: "https://example.com/gtav.jpg",
    version: "1.0.0",
    build: "12345",
    categorie_id: 1,
    plateforme_id: 1,
    reserve_vip: true,
    admin_only: false,
    mdp_zip: "",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z"
  },
  {
    id: 2,
    titre: "Minecraft",
    description: "Un jeu de construction et d'exploration",
    image: "https://example.com/minecraft.jpg",
    version: "1.20.0",
    build: "67890",
    categorie_id: 2,
    plateforme_id: 2,
    reserve_vip: false,
    admin_only: false,
    mdp_zip: "",
    created_at: "2024-01-02T00:00:00Z",
    updated_at: "2024-01-02T00:00:00Z"
  },
  {
    id: 3,
    titre: "Cyberpunk 2077",
    description: "Un RPG futuriste en monde ouvert",
    image: "https://example.com/cyberpunk.jpg",
    version: "2.0.0",
    build: "11111",
    categorie_id: 1,
    plateforme_id: 1,
    reserve_vip: true,
    admin_only: true,
    mdp_zip: "cyberpunk2024",
    created_at: "2024-01-03T00:00:00Z",
    updated_at: "2024-01-03T00:00:00Z"
  }
]

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const gameId = parseInt(id)
    
    if (isNaN(gameId)) {
      return NextResponse.json(
        { success: false, message: 'ID de jeu invalide' },
        { status: 400 }
      )
    }
    
    const gameData = await request.json()
    
    // Récupération des données du JSON
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
    } = gameData
    
    // Validation des données
    if (!title || !description || !category_id || !platform) {
      return NextResponse.json(
        { success: false, message: 'Données manquantes' },
        { status: 400 }
      )
    }
    
    // Sanitisation des données pour éviter les problèmes de sécurité tout en préservant UTF-8
    const sanitizeText = (text: string | null | undefined, preserveLineBreaks = false): string | null => {
      if (!text) return null
      let sanitized = String(text)
      
      if (preserveLineBreaks) {
        // Pour les spécifications, préserver les retours à la ligne (\n et \r\n)
        sanitized = sanitized.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F]/g, '')
      } else {
        // Pour les autres champs, supprimer tous les caractères de contrôle
        sanitized = sanitized.replace(/[\u0000-\u001F\u007F-\u009F]/g, '')
      }
      
      return sanitized.trim()
    }
    
    const sanitizedTitle = sanitizeText(title)
    const sanitizedDescription = sanitizeText(description)
    const sanitizedSpecifications = sanitizeText(specifications, true) // Préserver les retours à la ligne
    const sanitizedZipPassword = sanitizeText(zip_password)
    
    // Mise à jour du jeu dans la base de données
    try {
      const { executeQuery } = await import('@/lib/database')
      
      // Déterminer le niveau d'accès final
      const finalAccessLevel = access_level || (is_vip ? 'ultra' : 'free')
      
      // Mettre à jour les informations du jeu
      await executeQuery(
        `UPDATE games SET 
          title = ?, 
          description = ?, 
          banner_url = ?, 
          category_id = ?, 
          platform = ?, 
          is_vip = ?, 
          access_level = ?,
          specifications = ?,
          year = ?,
          zip_password = ?,
          updated_at = NOW()
        WHERE id = ?`,
        [
          sanitizedTitle,
          sanitizedDescription,
          banner_url || null,
          category_id,
          platform,
          is_vip ? 1 : 0,
          finalAccessLevel,
          sanitizedSpecifications,
          year || new Date().getFullYear(),
          sanitizedZipPassword,
          gameId
        ]
      )
      
      // Mettre à jour les liens de téléchargement
      if (download_links && Array.isArray(download_links)) {
        // Supprimer les anciens liens
        await executeQuery('DELETE FROM game_download_links WHERE game_id = ?', [gameId])
        
        // Ajouter les nouveaux liens
        for (let i = 0; i < download_links.length; i++) {
          const link = download_links[i]
          
          // Pour les liens différenciés, au moins un des champs URL doit être rempli
          const isDifferentiated = link.access_level === 'differentiated' || link.is_differentiated
          const hasValidUrl = isDifferentiated 
            ? (link.member_url || link.plus_url || link.ultra_url)
            : link.download_url
          
          if (link.title && hasValidUrl) {
            // Déterminer le niveau d'accès du lien
            const linkAccessLevel = link.access_level || (link.is_vip ? 'ultra' : 'free')
            
            await executeQuery(
              `INSERT INTO game_download_links 
                (game_id, title, description, download_url, icon_url, is_vip, access_level, position, is_differentiated, member_url, plus_url, ultra_url) 
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
              [
                gameId,
                sanitizeText(link.title),
                sanitizeText(link.description) || '',
                link.download_url || '',
                link.icon_url || 'storage/icons/Mbutton/download.png',
                link.is_vip ? 1 : 0,
                linkAccessLevel,
                i,
                isDifferentiated ? 1 : 0,
                link.member_url || null,
                link.plus_url || null,
                link.ultra_url || null
              ]
            )
          }
        }
      }
      
      return NextResponse.json({ 
        success: true, 
        message: 'Jeu mis à jour avec succès' 
      })
      
    } catch (dbError) {
      console.error('Erreur base de données:', dbError)
      return NextResponse.json(
        { success: false, message: 'Erreur lors de la mise à jour en base de données' },
        { status: 500 }
      )
    }
    
  } catch (error) {
    console.error('Erreur lors de la modification du jeu:', error)
    return NextResponse.json(
      { success: false, message: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const gameId = parseInt(id)
    
    if (isNaN(gameId)) {
      return NextResponse.json(
        { success: false, message: 'ID de jeu invalide' },
        { status: 400 }
      )
    }
    
    // Supprimer le jeu de la base de données
    try {
      const { executeQuery } = await import('@/lib/database')
      
      // Supprimer d'abord les liens de téléchargement
      await executeQuery('DELETE FROM game_download_links WHERE game_id = ?', [gameId])
      
      // Supprimer le jeu
      const result = await executeQuery('DELETE FROM games WHERE id = ?', [gameId])
      
      if (result.affectedRows === 0) {
        return NextResponse.json(
          { success: false, message: 'Jeu non trouvé' },
          { status: 404 }
        )
      }
      
      return NextResponse.json({
        success: true,
        message: 'Jeu supprimé avec succès'
      })
      
    } catch (dbError) {
      console.error('Erreur base de données:', dbError)
      return NextResponse.json(
        { success: false, message: 'Erreur lors de la suppression en base de données' },
        { status: 500 }
      )
    }
    
  } catch (error) {
    console.error('Erreur lors de la suppression du jeu:', error)
    return NextResponse.json(
      { success: false, message: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}
