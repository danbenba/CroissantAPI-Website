import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database';
import { TokenEncryption } from '@/lib/crypto';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

// GET all article categories
export async function GET(request: NextRequest) {
  try {
    // Vérifier les permissions utilisateur pour le comptage des articles
    const token = request.cookies.get('auth-token')?.value;
    let userRole = 'public';
    
    if (token) {
      const tokenInfo = TokenEncryption.getTokenInfo(token);
      if (tokenInfo) {
        userRole = tokenInfo.role;
      }
    }
    
    // Construire la condition de statut pour le comptage selon les permissions
    let statusCondition = `a.statut = 'publie'`; // Par défaut pour les utilisateurs normaux
    
    if (userRole === 'admin') {
      // Les admins voient le compte total (brouillons + publiés + archivés)
      statusCondition = `a.statut IN ('brouillon', 'publie', 'archive')`;
    } else if (userRole === 'plus' || userRole === 'ultra' || userRole === 'support' || userRole === 'moderateur') {
      // Les utilisateurs plus/ultra voient les publiés + archivés
      statusCondition = `a.statut IN ('publie', 'archive')`;
    }
    
    const [categories] = await db.execute<RowDataPacket[]>(
      `SELECT 
        ac.id,
        ac.nom,
        ac.description,
        ac.couleur,
        ac.created_at,
        COUNT(acr.article_id) as article_count
      FROM article_categories ac
      LEFT JOIN article_category_relations acr ON ac.id = acr.category_id
      LEFT JOIN articles a ON acr.article_id = a.id AND a.actif = TRUE AND ${statusCondition}
      GROUP BY ac.id
      ORDER BY ac.nom ASC`
    );
    
    return NextResponse.json({
      success: true,
      data: categories
    });
    
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération des catégories' },
      { status: 500 }
    );
  }
}

// POST - Create new category (admin only)
export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Token manquant' },
        { status: 401 }
      );
    }

    const tokenInfo = TokenEncryption.getTokenInfo(token);
    if (!tokenInfo || tokenInfo.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Accès refusé - Admin requis' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { nom, description, couleur = '#3498db' } = body;

    if (!nom) {
      return NextResponse.json(
        { success: false, error: 'Nom de catégorie requis' },
        { status: 400 }
      );
    }

    try {
      const [result] = await db.execute<ResultSetHeader>(
        'INSERT INTO article_categories (nom, description, couleur) VALUES (?, ?, ?)',
        [nom, description, couleur]
      );
      
      return NextResponse.json({
        success: true,
        data: { id: result.insertId, message: 'Catégorie créée avec succès' }
      });
      
    } catch (error: any) {
      if (error.code === 'ER_DUP_ENTRY') {
        return NextResponse.json(
          { success: false, error: 'Cette catégorie existe déjà' },
          { status: 400 }
        );
      }
      throw error;
    }
    
  } catch (error) {
    console.error('Error creating category:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la création de la catégorie' },
      { status: 500 }
    );
  }
}
