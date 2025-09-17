import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/database'
import { TokenEncryption } from '@/lib/crypto'

export async function GET(
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

    // Récupérer les informations de l'utilisateur depuis le token (même système que les autres APIs)
    let userRole = 'membre'; // Rôle par défaut pour les visiteurs non connectés
    
    const token = request.cookies.get('auth-token')?.value;
    if (token) {
      try {
        const tokenInfo = TokenEncryption.getTokenInfo(token);
        if (tokenInfo && tokenInfo.role) {
          userRole = tokenInfo.role;
        }
      } catch (authError) {
        // Si l'authentification échoue, continuer avec le rôle par défaut
        console.log('Authentification échouée, utilisation du rôle par défaut:', authError);
      }
    }
    
    // Récupération des liens de téléchargement depuis la base de données
    const [rows] = await db.execute(
      `SELECT 
        id,
        icon_url,
        title,
        description,
        download_url,
        is_vip,
        access_level,
        position,
        is_differentiated,
        member_url,
        plus_url,
        ultra_url,
        COALESCE(views, 0) as views
       FROM game_download_links 
       WHERE game_id = ? 
       ORDER BY position ASC`,
      [gameId]
    )

    // Traiter les liens selon le rôle de l'utilisateur
    const processedLinks = (rows as any[]).map(link => {
      let finalDownloadUrl = link.download_url;

      // Si le lien est différencié, choisir la bonne URL selon le rôle
      if (link.is_differentiated) {
        switch (userRole) {
          case 'ultra':
          case 'admin':
          case 'moderateur':
          case 'support':
            finalDownloadUrl = link.ultra_url || link.plus_url || link.member_url || link.download_url;
            break;
          case 'plus':
            finalDownloadUrl = link.plus_url || link.member_url || link.download_url;
            break;
          case 'membre':
          case 'visiteur':
          default:
            finalDownloadUrl = link.member_url || link.download_url;
            break;
        }
      }

      // Retourner le lien avec l'URL appropriée (sans exposer les autres URLs)
      return {
        id: link.id,
        icon_url: link.icon_url,
        title: link.title,
        description: link.description,
        download_url: finalDownloadUrl,
        is_vip: link.is_vip,
        access_level: link.access_level,
        position: link.position,
        views: link.views
      };
    });
    
    return NextResponse.json({
      success: true,
      downloadLinks: processedLinks,
      userRole: userRole // Pour debug, peut être retiré en production
    })
    
  } catch (error) {
    console.error('Erreur lors de la récupération des liens de téléchargement:', error)
    return NextResponse.json(
      { success: false, message: 'Erreur lors de la récupération des liens' },
      { status: 500 }
    )
  }
}
