import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database';
import { TokenEncryption } from '@/lib/crypto';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

// Utility function to safely parse tags
function parseTags(tagsString: string | null): string[] {
  if (!tagsString) return [];
  
  try {
    // Si c'est déjà un tableau JSON valide
    const parsed = JSON.parse(tagsString);
    if (Array.isArray(parsed)) {
      return parsed.filter(tag => tag && typeof tag === 'string').map(tag => tag.trim());
    }
    // Si c'est une string, on la convertit en tableau
    return [parsed.toString().trim()].filter(tag => tag);
  } catch (error) {
    // Si le JSON est invalide, on traite comme une string simple
    console.warn('Tags invalides détectés, conversion en string:', tagsString);
    if (typeof tagsString === 'string' && tagsString.trim()) {
      return [tagsString.trim()];
    }
    return [];
  }
}

// GET single article by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const articleId = parseInt(id);
    
    if (!articleId) {
      return NextResponse.json(
        { success: false, error: 'ID d\'article invalide' },
        { status: 400 }
      );
    }
    
    // Vérifier les permissions utilisateur
    const token = request.cookies.get('auth-token')?.value;
    let userRole = 'public';
    
    if (token) {
      const tokenInfo = TokenEncryption.getTokenInfo(token);
      if (tokenInfo) {
        userRole = tokenInfo.role;
      }
    }
    
    // Get article with author info et vérifications de permissions
    let statusCondition = '';
    if (userRole === 'admin') {
      // Les admins voient tout (y compris les brouillons)
      statusCondition = ` AND a.statut IN ('brouillon', 'publie', 'archive')`;
    } else if (userRole === 'plus' || userRole === 'ultra' || userRole === 'support' || userRole === 'moderateur') {
      // Les utilisateurs plus/ultra voient les articles publiés et archivés
      statusCondition = ` AND a.statut IN ('publie', 'archive')`;
    } else {
      // Les utilisateurs normaux ne voient que les articles publiés
      statusCondition = ` AND a.statut = 'publie'`;
    }
    
    const [articles] = await db.execute<RowDataPacket[]>(
      `SELECT 
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
        u.nom_utilisateur as auteur_nom,
        u.photo as auteur_photo,
        u.email as auteur_email
      FROM articles a
      LEFT JOIN utilisateurs u ON a.auteur_id = u.id
      WHERE a.id = ? AND a.actif = TRUE${statusCondition}`,
      [articleId]
    );
    
    if (articles.length === 0) {
      // Vérifier si l'article existe mais n'est pas accessible
      const [existsCheck] = await db.execute<RowDataPacket[]>(
        'SELECT a.statut FROM articles a WHERE a.id = ? AND a.actif = TRUE',
        [articleId]
      );
      
      if (existsCheck.length > 0) {
        const status = existsCheck[0].statut;
        if (status === 'brouillon') {
          return NextResponse.json(
            { success: false, error: 'Cet article est en cours de rédaction et n\'est pas encore disponible.' },
            { status: 403 }
          );
        } else if (status === 'archive') {
          return NextResponse.json(
            { success: false, error: 'Cet article est archivé et nécessite un abonnement Plus ou Ultra pour y accéder.' },
            { status: 403 }
          );
        }
      }
      
      return NextResponse.json(
        { success: false, error: 'Article non trouvé' },
        { status: 404 }
      );
    }
    
    const article = articles[0];
    
    // Get categories for this article
    const [categories] = await db.execute<RowDataPacket[]>(
      `SELECT ac.nom 
       FROM article_categories ac 
       JOIN article_category_relations acr ON ac.id = acr.category_id 
       WHERE acr.article_id = ?`,
      [articleId]
    );
    
    // Get article media
    const [media] = await db.execute<RowDataPacket[]>(
      `SELECT id, type, url, titre, description, position
       FROM article_media
       WHERE article_id = ?
       ORDER BY position ASC`,
      [articleId]
    );
    
    // Increment view count
    await db.execute(
      'UPDATE articles SET vues = vues + 1 WHERE id = ?',
      [articleId]
    );
    
    const parsedTags = parseTags(article.tags);
    console.log('📝 Debug tags - Raw:', article.tags, 'Parsed:', parsedTags);
    
    return NextResponse.json({
      success: true,
      data: {
        ...article,
        categories: (categories as RowDataPacket[]).map(cat => cat.nom),
        tags: parsedTags,
        media: media
      }
    });
    
  } catch (error) {
    console.error('Error fetching article:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération de l\'article' },
      { status: 500 }
    );
  }
}

// PUT - Update article (admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;
    const articleId = parseInt(id);
    if (!articleId) {
      return NextResponse.json(
        { success: false, error: 'ID d\'article invalide' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const {
      titre,
      contenu,
      contenu_type,
      resume,
      image_principale,
      tags,
      categories,
      statut,
      date_publication
    } = body;

    // Check if article exists
    const [existing] = await db.execute<RowDataPacket[]>(
      'SELECT id FROM articles WHERE id = ? AND actif = TRUE',
      [articleId]
    );
    
    if (existing.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Article non trouvé' },
        { status: 404 }
      );
    }
      
      // Update article
      const updateFields = [];
      const updateValues = [];
      
      if (titre !== undefined) { updateFields.push('titre = ?'); updateValues.push(titre); }
      if (contenu !== undefined) { updateFields.push('contenu = ?'); updateValues.push(contenu); }
      if (contenu_type !== undefined) { updateFields.push('contenu_type = ?'); updateValues.push(contenu_type); }
      if (resume !== undefined) { updateFields.push('resume = ?'); updateValues.push(resume); }
      if (image_principale !== undefined) { updateFields.push('image_principale = ?'); updateValues.push(image_principale); }
      if (tags !== undefined) { 
      updateFields.push('tags = ?'); 
      const cleanTags = Array.isArray(tags) 
        ? tags.filter(tag => tag && typeof tag === 'string' && tag.trim())
               .map(tag => tag.trim())
        : [];
      updateValues.push(JSON.stringify(cleanTags)); 
    }
      if (statut !== undefined) { updateFields.push('statut = ?'); updateValues.push(statut); }
      if (date_publication !== undefined) { updateFields.push('date_publication = ?'); updateValues.push(date_publication); }
      
    if (updateFields.length > 0) {
      updateValues.push(articleId);
      await db.execute(
        `UPDATE articles SET ${updateFields.join(', ')} WHERE id = ?`,
        updateValues
      );
    }
    
    // Update categories if provided
    if (categories !== undefined) {
      // Remove existing category relations
      await db.execute(
        'DELETE FROM article_category_relations WHERE article_id = ?',
        [articleId]
      );
      
      // Add new categories
      for (const categoryName of categories) {
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
      }
    }
    
    return NextResponse.json({
      success: true,
      message: 'Article mis à jour avec succès'
    });
    
  } catch (error) {
    console.error('Error updating article:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la mise à jour de l\'article' },
      { status: 500 }
    );
  }
}

// DELETE article (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;
    const articleId = parseInt(id);
    if (!articleId) {
      return NextResponse.json(
        { success: false, error: 'ID d\'article invalide' },
        { status: 400 }
      );
    }

    // Soft delete (set actif = FALSE)
    const [result] = await db.execute<ResultSetHeader>(
      'UPDATE articles SET actif = FALSE WHERE id = ?',
      [articleId]
    );
    
    if (result.affectedRows === 0) {
      return NextResponse.json(
        { success: false, error: 'Article non trouvé' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Article supprimé avec succès'
    });
    
  } catch (error) {
    console.error('Error deleting article:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la suppression de l\'article' },
      { status: 500 }
    );
  }
}
