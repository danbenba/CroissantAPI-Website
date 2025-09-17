import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database';
import { RowDataPacket } from 'mysql2';

// GET all articles with pagination and filtering (PUBLIC API)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 50);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const author = searchParams.get('author');
    
    const offset = (page - 1) * limit;
    
    // Vérifier les permissions utilisateur pour les articles avec restrictions
    const token = request.cookies.get('auth-token')?.value;
    let userRole = 'public'; // Par défaut pour les utilisateurs non connectés
    
    if (token) {
      const { TokenEncryption } = await import('@/lib/crypto');
      const tokenInfo = TokenEncryption.getTokenInfo(token);
      if (tokenInfo) {
        userRole = tokenInfo.role;
      }
    }
    
    console.log('🔍 Articles API - Paramètres:', { page, limit, offset, category, search, author });
    
    // Construction de la requête principale avec filtrage des permissions
    let baseQuery = `
      SELECT 
        a.id,
        a.titre,
        a.resume,
        a.image_principale,
        a.date_publication,
        a.vues,
        u.nom_utilisateur as auteur_nom,
        u.photo as auteur_photo
      FROM articles a
      LEFT JOIN utilisateurs u ON a.auteur_id = u.id
      WHERE a.actif = 1
    `;
    
    // Filtrage par statut basé sur les permissions
    if (userRole === 'admin') {
      // Les admins voient tout (y compris les brouillons)
      baseQuery += ` AND a.statut IN ('brouillon', 'publie', 'archive')`;
    } else if (userRole === 'plus' || userRole === 'ultra' || userRole === 'support' || userRole === 'moderateur') {
      // Les utilisateurs plus/ultra voient les articles publiés et archivés
      baseQuery += ` AND a.statut IN ('publie', 'archive')`;
    } else {
      // Les utilisateurs normaux ne voient que les articles publiés
      baseQuery += ` AND a.statut = 'publie'`;
    }
    
    let queryParams = [];
    
    // Ajout des filtres
    if (category) {
      baseQuery += ` AND EXISTS (
        SELECT 1 FROM article_category_relations acr 
        JOIN article_categories ac ON acr.category_id = ac.id 
        WHERE acr.article_id = a.id AND ac.nom = ?
      )`;
      queryParams.push(category);
    }
    
    if (search) {
      baseQuery += ` AND (a.titre LIKE ? OR a.resume LIKE ?)`;
      const searchPattern = `%${search}%`;
      queryParams.push(searchPattern, searchPattern);
    }
    
    if (author) {
      baseQuery += ` AND u.nom_utilisateur = ?`;
      queryParams.push(author);
    }
    
    // Tri et pagination
    baseQuery += ` ORDER BY a.date_publication DESC, a.date_creation DESC LIMIT ${limit} OFFSET ${offset}`;
    
    console.log('📝 Requête SQL:', baseQuery);
    console.log('📝 Paramètres:', queryParams);
    
    const [articles] = await db.execute<RowDataPacket[]>(baseQuery, queryParams);
    console.log('✅ Articles récupérés:', Array.isArray(articles) ? articles.length : 'Non-array');
    
    // Récupération des catégories pour chaque article
    const articlesWithCategories = await Promise.all(
      (articles as RowDataPacket[]).map(async (article) => {
        const [categories] = await db.execute<RowDataPacket[]>(
          `SELECT ac.nom 
           FROM article_categories ac 
           JOIN article_category_relations acr ON ac.id = acr.category_id 
           WHERE acr.article_id = ?`,
          [article.id]
        );
        
        return {
          ...article,
          categories: (categories as RowDataPacket[]).map(cat => cat.nom)
        };
      })
    );
    
    // Requête pour le compte total avec les mêmes filtres de permission
    let countQuery = `
      SELECT COUNT(a.id) as total
      FROM articles a
      LEFT JOIN utilisateurs u ON a.auteur_id = u.id
      WHERE a.actif = 1
    `;
    
    // Même filtrage par statut que la requête principale
    if (userRole === 'admin') {
      countQuery += ` AND a.statut IN ('brouillon', 'publie', 'archive')`;
    } else if (userRole === 'plus' || userRole === 'ultra' || userRole === 'support' || userRole === 'moderateur') {
      countQuery += ` AND a.statut IN ('publie', 'archive')`;
    } else {
      countQuery += ` AND a.statut = 'publie'`;
    }
    
    let countParams = [];
    
    if (category) {
      countQuery += ` AND EXISTS (
        SELECT 1 FROM article_category_relations acr 
        JOIN article_categories ac ON acr.category_id = ac.id 
        WHERE acr.article_id = a.id AND ac.nom = ?
      )`;
      countParams.push(category);
    }
    
    if (search) {
      countQuery += ` AND (a.titre LIKE ? OR a.resume LIKE ?)`;
      const searchPattern = `%${search}%`;
      countParams.push(searchPattern, searchPattern);
    }
    
    if (author) {
      countQuery += ` AND u.nom_utilisateur = ?`;
      countParams.push(author);
    }
    
    const [countResult] = await db.execute<RowDataPacket[]>(countQuery, countParams);
    const total = countResult[0]?.total || 0;
    const totalPages = Math.ceil(total / limit);
    
    return NextResponse.json({
      success: true,
      data: {
        articles: articlesWithCategories || [],
        pagination: {
          currentPage: page,
          totalPages,
          totalItems: total,
          itemsPerPage: limit,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      }
    });
    
  } catch (error) {
    console.error('❌ Error fetching articles:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération des articles' },
      { status: 500 }
    );
  }
}