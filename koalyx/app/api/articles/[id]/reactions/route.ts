import { NextRequest, NextResponse } from 'next/server';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import { db } from '@/lib/database';
import { TokenEncryption } from '@/lib/crypto';

interface User {
  id: number;
  username: string;
  email: string;
  role: string;
}

interface ArticleReaction extends RowDataPacket {
  id: number;
  article_id: number;
  user_id: number;
  reaction_type: 'like' | 'dislike';
  date_created: string;
  date_updated: string;
}

// Fonction pour vérifier l'authentification (utilise le système existant)
async function verifyAuth(request: NextRequest): Promise<User | null> {
  const token = request.cookies.get('auth-token')?.value;
  if (!token) return null;

  try {
    const tokenInfo = TokenEncryption.getTokenInfo(token);
    if (!tokenInfo) return null;

    // Récupérer les informations utilisateur depuis la base
    const [result] = await db.execute<RowDataPacket[]>(
      "SELECT id, nom_utilisateur, email, role FROM utilisateurs WHERE id = ?",
      [tokenInfo.userId]
    );

    if (!result || result.length === 0) return null;

    const user = result[0];
    return {
      id: user.id,
      username: user.nom_utilisateur,
      email: user.email,
      role: user.role
    };
  } catch (error) {
    console.error('Erreur vérification auth:', error);
    return null;
  }
}

// GET /api/articles/[id]/reactions - Récupérer les statistiques de réactions d'un article
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const articleId = parseInt(id);

    // Vérifier que l'article existe et est accessible
    const [articleRows] = await db.execute<RowDataPacket[]>(
      'SELECT id, statut FROM articles WHERE id = ?',
      [articleId]
    );

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

    // Récupérer les statistiques des réactions
    const [statsRows] = await db.execute<RowDataPacket[]>(
      `SELECT 
        COUNT(CASE WHEN reaction_type = 'like' THEN 1 END) as likes,
        COUNT(CASE WHEN reaction_type = 'dislike' THEN 1 END) as dislikes,
        COUNT(*) as total_reactions
      FROM article_reactions 
      WHERE article_id = ?`,
      [articleId]
    );

    const stats = statsRows[0];

    // Si l'utilisateur est connecté, récupérer sa réaction
    let userReaction = null;
    if (user) {
      const [userReactionRows] = await db.execute<RowDataPacket[]>(
        'SELECT reaction_type FROM article_reactions WHERE article_id = ? AND user_id = ?',
        [articleId, user.id]
      );
      
      if (userReactionRows.length > 0) {
        userReaction = userReactionRows[0].reaction_type;
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        likes: parseInt(stats.likes) || 0,
        dislikes: parseInt(stats.dislikes) || 0,
        total: parseInt(stats.total_reactions) || 0,
        userReaction: userReaction,
        netScore: (parseInt(stats.likes) || 0) - (parseInt(stats.dislikes) || 0)
      }
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des réactions:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

// POST /api/articles/[id]/reactions - Ajouter ou modifier une réaction
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

    // Vérifier que l'article existe et est accessible
    const [articleRows] = await db.execute<RowDataPacket[]>(
      'SELECT id, statut FROM articles WHERE id = ?',
      [articleId]
    );

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
        { success: false, error: 'Impossible de réagir à un brouillon' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { reactionType } = body;

    // Validation
    if (!reactionType || !['like', 'dislike'].includes(reactionType)) {
      return NextResponse.json(
        { success: false, error: 'Type de réaction invalide (like ou dislike)' },
        { status: 400 }
      );
    }

    // Vérifier si l'utilisateur a déjà une réaction
    const [existingReaction] = await db.execute<RowDataPacket[]>(
      'SELECT id, reaction_type FROM article_reactions WHERE user_id = ? AND article_id = ?',
      [user.id, articleId]
    );

    if (existingReaction.length > 0) {
      const currentReaction = existingReaction[0];
      
      if (currentReaction.reaction_type === reactionType) {
        // Même réaction = suppression
        await db.execute(
          'DELETE FROM article_reactions WHERE id = ?',
          [currentReaction.id]
        );

        return NextResponse.json({
          success: true,
          action: 'removed',
          message: 'Réaction supprimée'
        });
      } else {
        // Réaction différente = mise à jour
        await db.execute(
          'UPDATE article_reactions SET reaction_type = ?, date_updated = CURRENT_TIMESTAMP WHERE id = ?',
          [reactionType, currentReaction.id]
        );

        return NextResponse.json({
          success: true,
          action: 'updated',
          reactionType: reactionType,
          message: 'Réaction mise à jour'
        });
      }
    } else {
      // Nouvelle réaction
      await db.execute<ResultSetHeader>(
        'INSERT INTO article_reactions (article_id, user_id, reaction_type) VALUES (?, ?, ?)',
        [articleId, user.id, reactionType]
      );

      return NextResponse.json({
        success: true,
        action: 'added',
        reactionType: reactionType,
        message: 'Réaction ajoutée'
      });
    }

  } catch (error) {
    console.error('Erreur lors de la gestion de la réaction:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

// DELETE /api/articles/[id]/reactions - Supprimer sa réaction
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: articleId } = await params;
    const user = await verifyAuth(request);

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentification requise' },
        { status: 401 }
      );
    }

    // Supprimer la réaction de l'utilisateur
    const [result] = await db.execute<ResultSetHeader>(
      'DELETE FROM article_reactions WHERE article_id = ? AND user_id = ?',
      [articleId, user.id]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { success: false, error: 'Aucune réaction à supprimer' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Réaction supprimée avec succès'
    });

  } catch (error) {
    console.error('Erreur lors de la suppression de la réaction:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}



