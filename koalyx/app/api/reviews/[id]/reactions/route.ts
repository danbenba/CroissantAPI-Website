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

interface ReviewReaction extends RowDataPacket {
  id: number;
  review_id: number;
  user_id: number;
  reaction_type: 'helpful' | 'not_helpful';
  date_created: string;
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

// GET /api/reviews/[id]/reactions - Récupérer les statistiques de réactions d'un avis
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const reviewId = parseInt(id);

    // Vérifier que l'avis existe et est approuvé
    const [reviewRows] = await db.execute<RowDataPacket[]>(
      'SELECT id, article_id, is_approved FROM article_reviews WHERE id = ?',
      [reviewId]
    );

    if (reviewRows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Avis non trouvé' },
        { status: 404 }
      );
    }

    const review = reviewRows[0];
    
    if (!review.is_approved) {
      return NextResponse.json(
        { success: false, error: 'Avis non approuvé' },
        { status: 403 }
      );
    }

    // Récupérer les statistiques des réactions
    const [statsRows] = await db.execute<RowDataPacket[]>(
      `SELECT 
        COUNT(CASE WHEN reaction_type = 'helpful' THEN 1 END) as helpful,
        COUNT(CASE WHEN reaction_type = 'not_helpful' THEN 1 END) as not_helpful,
        COUNT(*) as total_reactions
      FROM review_reactions 
      WHERE review_id = ?`,
      [reviewId]
    );

    const stats = statsRows[0];

    // Si l'utilisateur est connecté, récupérer sa réaction
    let userReaction = null;
    const user = await verifyAuth(request);
    if (user) {
      const [userReactionRows] = await db.execute<RowDataPacket[]>(
        'SELECT reaction_type FROM review_reactions WHERE review_id = ? AND user_id = ?',
        [reviewId, user.id]
      );
      
      if (userReactionRows.length > 0) {
        userReaction = userReactionRows[0].reaction_type;
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        helpful: parseInt(stats.helpful) || 0,
        notHelpful: parseInt(stats.not_helpful) || 0,
        total: parseInt(stats.total_reactions) || 0,
        userReaction: userReaction,
        helpfulScore: (parseInt(stats.helpful) || 0) - (parseInt(stats.not_helpful) || 0)
      }
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des réactions de l\'avis:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

// POST /api/reviews/[id]/reactions - Ajouter ou modifier une réaction à un avis
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const reviewId = parseInt(id);
    const user = await verifyAuth(request);

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentification requise' },
        { status: 401 }
      );
    }

    // Vérifier que l'avis existe et est approuvé
    const [reviewRows] = await db.execute<RowDataPacket[]>(
      'SELECT id, user_id, article_id, is_approved FROM article_reviews WHERE id = ?',
      [reviewId]
    );

    if (reviewRows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Avis non trouvé' },
        { status: 404 }
      );
    }

    const review = reviewRows[0];
    
    if (!review.is_approved) {
      return NextResponse.json(
        { success: false, error: 'Avis non approuvé' },
        { status: 403 }
      );
    }

    // Empêcher un utilisateur de réagir à son propre avis
    if (review.user_id === user.id) {
      return NextResponse.json(
        { success: false, error: 'Impossible de réagir à votre propre avis' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { reactionType } = body;

    // Validation
    if (!reactionType || !['helpful', 'not_helpful'].includes(reactionType)) {
      return NextResponse.json(
        { success: false, error: 'Type de réaction invalide (helpful ou not_helpful)' },
        { status: 400 }
      );
    }

    // Vérifier si l'utilisateur a déjà une réaction
    const [existingReaction] = await db.execute<RowDataPacket[]>(
      'SELECT id, reaction_type FROM review_reactions WHERE user_id = ? AND review_id = ?',
      [user.id, reviewId]
    );

    if (existingReaction.length > 0) {
      const currentReaction = existingReaction[0];
      
      if (currentReaction.reaction_type === reactionType) {
        // Même réaction = suppression
        await db.execute(
          'DELETE FROM review_reactions WHERE id = ?',
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
          'UPDATE review_reactions SET reaction_type = ? WHERE id = ?',
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
        'INSERT INTO review_reactions (review_id, user_id, reaction_type) VALUES (?, ?, ?)',
        [reviewId, user.id, reactionType]
      );

      return NextResponse.json({
        success: true,
        action: 'added',
        reactionType: reactionType,
        message: 'Réaction ajoutée'
      });
    }

  } catch (error) {
    console.error('Erreur lors de la gestion de la réaction à l\'avis:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

// DELETE /api/reviews/[id]/reactions - Supprimer sa réaction à un avis
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: reviewId } = await params;
    const user = await verifyAuth(request);

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentification requise' },
        { status: 401 }
      );
    }

    // Supprimer la réaction de l'utilisateur
    const [result] = await db.execute<ResultSetHeader>(
      'DELETE FROM review_reactions WHERE review_id = ? AND user_id = ?',
      [reviewId, user.id]
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
    console.error('Erreur lors de la suppression de la réaction à l\'avis:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}



