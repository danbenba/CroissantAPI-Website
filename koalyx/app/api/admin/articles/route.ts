import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database';
import { requireRole, validateInput, createErrorResponse, createSuccessResponse, ValidationSchema } from '@/lib/api-security';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

// Fonction utilitaire pour parser les tags de manière sécurisée
function parseTags(tagsString: string | null): string[] {
  if (!tagsString) return [];
  
  try {
    // Si c'est déjà un tableau JSON valide
    const parsed = JSON.parse(tagsString);
    if (Array.isArray(parsed)) {
      return parsed;
    }
    // Si c'est une string, on la convertit en tableau
    return [parsed.toString()];
  } catch (error) {
    // Si le JSON est invalide, on traite comme une string simple
    console.warn('Tags invalides détectés, conversion en string:', tagsString);
    return [tagsString];
  }
}


// GET all articles for admin (including drafts, archived, etc.)
export async function GET(request: NextRequest) {
  try {
    const authResult = await requireRole(request, ['admin']);
    if (!authResult.success) {
      return createErrorResponse(authResult.error!, authResult.status)
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
    const status = searchParams.get('status') || 'all';
    const search = searchParams.get('search');
    const author = searchParams.get('author');
    
    const offset = (page - 1) * limit;
    
    console.log('🔍 Admin Articles API - Paramètres:', { page, limit, offset, status, search, author });
    
    // Requête simplifiée pour admin
    let baseQuery = `
      SELECT 
        a.id,
        a.titre,
        a.contenu,
        a.contenu_type,
        a.auteur_id,
        a.date_creation,
        a.date_modification,
        a.date_publication,
        a.statut,
        a.image_principale,
        a.resume,
        a.tags,
        a.vues,
        a.actif,
        u.nom_utilisateur as auteur_nom,
        u.photo as auteur_photo
      FROM articles a
      LEFT JOIN utilisateurs u ON a.auteur_id = u.id
      WHERE a.actif = 1
    `;
    
    let queryParams = [];
    
    if (status !== 'all') {
      baseQuery += ` AND a.statut = ?`;
      queryParams.push(status);
    }
    
    if (search) {
      baseQuery += ` AND (a.titre LIKE ? OR a.resume LIKE ? OR a.contenu LIKE ?)`;
      const searchPattern = `%${search}%`;
      queryParams.push(searchPattern, searchPattern, searchPattern);
    }
    
    if (author) {
      baseQuery += ` AND u.nom_utilisateur = ?`;
      queryParams.push(author);
    }
    
    baseQuery += ` ORDER BY a.date_creation DESC LIMIT ${limit} OFFSET ${offset}`;
    
    console.log('📝 Admin SQL:', baseQuery);
    console.log('📝 Paramètres:', queryParams);
    
    const [articles] = await db.execute(baseQuery, queryParams);
    console.log('✅ Admin articles récupérés:', Array.isArray(articles) ? articles.length : 'Non-array');
    
    // Récupérer les catégories pour chaque article séparément
    const articlesWithCategories = await Promise.all(
      ((articles as RowDataPacket[]) || []).map(async (article) => {
        try {
          const [categories] = await db.execute(
            `SELECT ac.nom 
             FROM article_categories ac 
             JOIN article_category_relations acr ON ac.id = acr.category_id 
             WHERE acr.article_id = ?`,
            [article.id]
          );
          
          return {
            ...article,
            tags: parseTags(article.tags),
            categories: (categories as RowDataPacket[]).map(cat => cat.nom)
          };
        } catch (error) {
          console.error(`Erreur récupération catégories pour article ${article.id}:`, error);
          return {
            ...article,
            tags: parseTags(article.tags),
            categories: []
          };
        }
      })
    );
    
    // Requête pour le compte total
    let countQuery = `
      SELECT COUNT(a.id) as total
      FROM articles a
      LEFT JOIN utilisateurs u ON a.auteur_id = u.id
      WHERE a.actif = 1
    `;
    
    let countParams = [];
    
    if (status !== 'all') {
      countQuery += ` AND a.statut = ?`;
      countParams.push(status);
    }
    
    if (search) {
      countQuery += ` AND (a.titre LIKE ? OR a.resume LIKE ? OR a.contenu LIKE ?)`;
      const searchPattern = `%${search}%`;
      countParams.push(searchPattern, searchPattern, searchPattern);
    }
    
    if (author) {
      countQuery += ` AND u.nom_utilisateur = ?`;
      countParams.push(author);
    }
    
    const [countResult] = await db.execute(countQuery, countParams);
    const total = (countResult as RowDataPacket[])[0]?.total || 0;
    const totalPages = Math.ceil(total / limit);
    
    return createSuccessResponse({
      articles: articlesWithCategories,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: total,
        itemsPerPage: limit,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    })
    
  } catch (error) {
    console.error('❌ Error fetching admin articles:', error);
    return createErrorResponse('Erreur lors de la récupération des articles', 500)
  }
}

// POST - Create new article (admin only)
export async function POST(request: NextRequest) {
  try {
    const authResult = await requireRole(request, ['admin']);
    if (!authResult.success) {
      return createErrorResponse(authResult.error!, authResult.status)
    }

    const body = await request.json();
    const {
      titre,
      contenu,
      contenu_type = 'markdown',
      resume,
      image_principale,
      tags = [],
      categories = [],
      statut = 'brouillon',
      date_publication
    } = body;

    if (!titre || !contenu) {
      return NextResponse.json(
        { success: false, error: 'Titre et contenu requis' },
        { status: 400 }
      );
    }

    console.log('📝 Création article:', { titre, contenu_type, statut, categories: categories.length });

    // Insert article - date_creation sera automatiquement définie par DEFAULT CURRENT_TIMESTAMP
    // Formatage correct de la date pour MySQL
    let formattedDatePublication = null;
    if (date_publication) {
      formattedDatePublication = new Date(date_publication).toISOString().slice(0, 19).replace('T', ' ');
    } else if (statut === 'publie') {
      formattedDatePublication = new Date().toISOString().slice(0, 19).replace('T', ' ');
    }

    const [articleResult] = await db.execute<ResultSetHeader>(
      `INSERT INTO articles (
        titre, contenu, contenu_type, auteur_id, resume, 
        image_principale, tags, statut, date_publication
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        titre,
        contenu || '',
        contenu_type,
        authResult.user!.id,
        resume || '',
        image_principale || null,
        JSON.stringify(tags ? tags.filter((tag: string) => tag && tag.trim()) : []),
        statut,
        formattedDatePublication || null
      ]
    );
    
    const articleId = articleResult.insertId;
    console.log('✅ Article créé avec ID:', articleId);
    
    // Add categories if provided
    if (categories && categories.length > 0) {
      for (const categoryName of categories) {
        try {
                  // Get or create category
        const [categoryResult] = await db.execute<RowDataPacket[]>(
          'SELECT id FROM article_categories WHERE nom = ?',
          [categoryName]
        );
        
        let categoryId;
        if (categoryResult.length > 0) {
          categoryId = categoryResult[0].id;
        } else {
          const [newCategory] = await db.execute<ResultSetHeader>(
            'INSERT INTO article_categories (nom) VALUES (?)',
            [categoryName]
          );
          categoryId = newCategory.insertId;
        }
          
          // Link article to category
          await db.execute(
            'INSERT INTO article_category_relations (article_id, category_id) VALUES (?, ?)',
            [articleId, categoryId]
          );
        } catch (error) {
          console.error(`Erreur ajout catégorie ${categoryName}:`, error);
        }
      }
    }
    
    return createSuccessResponse({ id: articleId }, 'Article créé avec succès')
    
  } catch (error) {
    console.error('❌ Error creating article:', error);
    return createErrorResponse('Erreur lors de la création de l\'article', 500)
  }
}