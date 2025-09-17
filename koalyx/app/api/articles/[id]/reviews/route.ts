import { NextRequest, NextResponse } from 'next/server';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import { db } from '@/lib/database';
import { validateId, validateInput, authenticateUser, createErrorResponse, createSuccessResponse, ValidationSchema } from '@/lib/api-security';

interface User {
  id: number;
  username: string;
  email: string;
  role: string;
}

interface Review extends RowDataPacket {
  id: number;
  article_id: number;
  user_id: number;
  username: string;
  avatar_url?: string;
  role: string;
  rating: number;
  title?: string;
  content: string;
  is_verified_purchase: boolean;
  is_approved: boolean;
  is_featured: boolean;
  helpful_count: number;
  date_created: string;
  date_updated: string;
  helpful_reactions: number;
  not_helpful_reactions: number;
}

// Fonction pour vérifier l'authentification (utilise le système sécurisé)
async function verifyAuth(request: NextRequest): Promise<User | null> {
  const authResult = await authenticateUser(request);
  
  if (!authResult.success || !authResult.user) {
    return null;
  }

  return {
    id: authResult.user.id,
    username: authResult.user.username,
    email: authResult.user.email,
    role: authResult.user.role
  };
}

// GET /api/articles/[id]/reviews - Récupérer les avis d'un article
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Validation sécurisée de l'ID
    const articleId = validateId(id);
    if (!articleId) {
      return createErrorResponse('ID d\'article invalide', 400);
    }

    const { searchParams } = new URL(request.url);
    
    // Validation des paramètres de pagination
    const queryParams = {
      page: searchParams.get('page') || '1',
      limit: searchParams.get('limit') || '10',
      sort: searchParams.get('sort') || 'recent'
    };

    const schema: ValidationSchema = {
      page: {
        type: 'number',
        min: 1,
        max: 1000
      },
      limit: {
        type: 'number',
        min: 1,
        max: 50
      },
      sort: {
        type: 'string',
        enum: ['recent', 'helpful', 'rating_high', 'rating_low']
      }
    };

    const validation = validateInput(queryParams, schema);
    if (!validation.valid) {
      return createErrorResponse(`Paramètres invalides: ${validation.errors.join(', ')}`, 400);
    }

    const { page, limit, sort } = validation.sanitized;
    const offset = (page - 1) * limit;

    // Vérifier que l'article existe et est accessible
    const [articleRows] = await db.execute<RowDataPacket[]>(
      'SELECT id, statut FROM articles WHERE id = ?',
      [articleId]
    );
    
    // Test simple pour vérifier si la table existe
    try {
      const [testRows] = await db.execute<RowDataPacket[]>(
        'SELECT COUNT(*) as count FROM article_reviews WHERE article_id = ?',
        [articleId]
      );
    } catch (testError) {
      console.error('Erreur test table article_reviews:', testError);
      return createErrorResponse('Table article_reviews non accessible', 500);
    }

    if (articleRows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Article non trouvé' },
        { status: 404 }
      );
    }

    const article = articleRows[0];
    
    // Vérifier les permissions d'accès à l'article
    const user = await verifyAuth(request);
    const userRole = user?.role || 'public';
    
    if (article.statut === 'brouillon' && !['admin', 'moderateur', 'support'].includes(userRole)) {
      return NextResponse.json(
        { success: false, error: 'Article non accessible' },
        { status: 403 }
      );
    }

    if (article.statut === 'archive' && !['admin', 'moderateur', 'support', 'ultra', 'plus'].includes(userRole)) {
      return NextResponse.json(
        { success: false, error: 'Article archivé - accès réservé aux membres Premium' },
        { status: 403 }
      );
    }

    // Construire la requête avec l'ordre approprié (sans injection SQL)
    let orderClause = 'ar.date_created DESC';
    switch (sort) {
      case 'helpful':
        orderClause = 'ar.helpful_count DESC, ar.date_created DESC';
        break;
      case 'rating_high':
        orderClause = 'ar.rating DESC, ar.date_created DESC';
        break;
      case 'rating_low':
        orderClause = 'ar.rating ASC, ar.date_created DESC';
        break;
      default:
        orderClause = 'ar.date_created DESC';
    }

    // Essayons de récupérer les vrais avis maintenant
    let reviewRows: Review[] = [];
    
    try {
      // Requête simple sans LIMIT/OFFSET d'abord
      const [simpleRows] = await db.execute<RowDataPacket[]>(
        `SELECT 
          ar.id,
          ar.article_id,
          ar.user_id,
          u.nom_utilisateur as username,
          u.photo as avatar_url,
          u.role,
          ar.rating,
          ar.title,
          ar.content,
          ar.is_verified_purchase,
          ar.is_approved,
          ar.is_featured,
          ar.helpful_count,
          ar.date_created,
          ar.date_updated
        FROM article_reviews ar
        JOIN utilisateurs u ON ar.user_id = u.id
        WHERE ar.article_id = ? AND ar.is_approved = 1
        ORDER BY ar.date_created DESC`,
        [articleId]
      );
      
      
      // Convertir en format Review avec les champs manquants
      reviewRows = simpleRows.map(row => ({
        ...row,
        helpful_reactions: 0,
        not_helpful_reactions: 0
      })) as Review[];
      
    } catch (queryError) {
      console.error('🔍 Reviews API - Erreur requête avis:', queryError);
      reviewRows = []; // Fallback à liste vide
    }

    // Compter le total des avis
    const total = reviewRows.length;

    // Calculer les statistiques à partir des avis récupérés
    const stats = {
      average_rating: reviewRows.length > 0 ? reviewRows.reduce((sum, review) => sum + review.rating, 0) / reviewRows.length : 0,
      total_reviews: reviewRows.length,
      rating_5: reviewRows.filter(r => r.rating === 5).length,
      rating_4: reviewRows.filter(r => r.rating === 4).length,
      rating_3: reviewRows.filter(r => r.rating === 3).length,
      rating_2: reviewRows.filter(r => r.rating === 2).length,
      rating_1: reviewRows.filter(r => r.rating === 1).length,
    };

    return createSuccessResponse({
      data: {
        reviews: reviewRows,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
        stats: {
          averageRating: Number(stats.average_rating) || 0,
          totalReviews: Number(stats.total_reviews) || 0,
          distribution: {
            5: Number(stats.rating_5) || 0,
            4: Number(stats.rating_4) || 0,
            3: Number(stats.rating_3) || 0,
            2: Number(stats.rating_2) || 0,
            1: Number(stats.rating_1) || 0,
          }
        }
      }
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des avis:', error);
    return createErrorResponse('Erreur interne du serveur', 500);
  }
}

// POST /api/articles/[id]/reviews - Créer un nouvel avis
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const articleId = parseInt(id);
    const user = await verifyAuth(request);

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentification requise' },
        { status: 401 }
      );
    }

    // Vérifier que l'article existe et est accessible (version simplifiée)
    console.log('🔍 POST Reviews - Vérification article ID:', articleId);
    const [articleRows] = await db.execute<RowDataPacket[]>(
      'SELECT id, statut FROM articles WHERE id = ?',
      [articleId]
    );
    console.log('🔍 POST Reviews - Article trouvé:', articleRows.length > 0);

    if (articleRows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Article non trouvé' },
        { status: 404 }
      );
    }

    const article = articleRows[0];
    const userRole = user.role || 'public';
    
    if (article.statut === 'brouillon' && !['admin', 'moderateur', 'support'].includes(userRole)) {
      return NextResponse.json(
        { success: false, error: 'Impossible de commenter un brouillon' },
        { status: 403 }
      );
    }

    // Vérifier si l'utilisateur a déjà laissé un avis
    const [existingReview] = await db.execute<RowDataPacket[]>(
      'SELECT id FROM article_reviews WHERE user_id = ? AND article_id = ?',
      [user.id, articleId]
    );

    if (existingReview.length > 0) {
      return NextResponse.json(
        { success: false, error: 'Vous avez déjà laissé un avis pour cet article' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { rating, title, content, isVerifiedPurchase } = body;

    // Validation
    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { success: false, error: 'Note invalide (1-5)' },
        { status: 400 }
      );
    }

    if (!content || content.trim().length < 10) {
      return NextResponse.json(
        { success: false, error: 'Le contenu doit contenir au moins 10 caractères' },
        { status: 400 }
      );
    }

    if (title && title.length > 255) {
      return NextResponse.json(
        { success: false, error: 'Le titre ne peut pas dépasser 255 caractères' },
        { status: 400 }
      );
    }

    // Créer l'avis (version simple pour tester)
    console.log('🔍 POST Reviews - Tentative création avis...');
    console.log('🔍 POST Reviews - Données:', { articleId, userId: user.id, rating, title, content: content.trim() });
    
    try {
      const [result] = await db.execute<ResultSetHeader>(
        `INSERT INTO article_reviews (article_id, user_id, rating, title, content, is_verified_purchase, is_approved)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          articleId,
          user.id,
          rating,
          title || null,
          content.trim(),
          isVerifiedPurchase ? 1 : 0,
          1 // Auto-approuvé par défaut
        ]
      );
      console.log('🔍 POST Reviews - Avis créé avec ID:', result.insertId);
    } catch (insertError) {
      console.error('🔍 POST Reviews - Erreur insertion:', insertError);
      throw insertError;
    }

    // Pour l'instant, retournons un avis factice
    const newReview = {
      id: 1, // result.insertId || 1,
      article_id: articleId,
      user_id: user.id,
      username: user.username,
      avatar_url: null,
      role: user.role,
      rating: rating,
      title: title,
      content: content.trim(),
      is_verified_purchase: isVerifiedPurchase || false,
      is_approved: true,
      is_featured: false,
      helpful_count: 0,
      date_created: new Date().toISOString(),
      date_updated: new Date().toISOString(),
      helpful_reactions: 0,
      not_helpful_reactions: 0
    };

    return NextResponse.json({
      success: true,
      data: newReview,
      message: 'Avis créé avec succès'
    });

  } catch (error) {
    console.error('Erreur lors de la création de l\'avis:', error);
    console.error('Stack trace:', error instanceof Error ? error.stack : 'No stack trace');
    return NextResponse.json(
      { success: false, error: `Erreur serveur: ${error instanceof Error ? error.message : 'Erreur inconnue'}` },
      { status: 500 }
    );
  }
}

// DELETE /api/articles/[id]/reviews/[reviewId] - Supprimer un avis (admin seulement)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const articleId = parseInt(id);
    const url = new URL(request.url);
    const reviewId = url.searchParams.get('reviewId');

    if (!reviewId) {
      return NextResponse.json(
        { success: false, error: 'ID de l\'avis manquant' },
        { status: 400 }
      );
    }

    const user = await verifyAuth(request);

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentification requise' },
        { status: 401 }
      );
    }

    // Vérifier que l'utilisateur est admin
    if (!['admin', 'moderateur', 'support'].includes(user.role)) {
      return NextResponse.json(
        { success: false, error: 'Permissions insuffisantes' },
        { status: 403 }
      );
    }

    // Vérifier que l'avis existe et appartient à l'article
    const [reviewRows] = await db.execute<RowDataPacket[]>(
      'SELECT id, user_id FROM article_reviews WHERE id = ? AND article_id = ?',
      [reviewId, articleId]
    );

    if (reviewRows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Avis non trouvé' },
        { status: 404 }
      );
    }

    // Supprimer l'avis (les réactions seront supprimées automatiquement via CASCADE)
    await db.execute(
      'DELETE FROM article_reviews WHERE id = ?',
      [reviewId]
    );

    return NextResponse.json({
      success: true,
      message: 'Avis supprimé avec succès'
    });

  } catch (error) {
    console.error('Erreur lors de la suppression de l\'avis:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
