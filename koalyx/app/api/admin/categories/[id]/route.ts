import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/database'
import { validateId, createErrorResponse, createSuccessResponse } from '@/lib/api-security'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const categoryId = validateId(id)
    if (!categoryId) {
      return createErrorResponse('ID de catégorie invalide', 400)
    }

    const body = await request.json()
    const { name, type, description } = body

    // Validation
    if (!name || !type) {
      return createErrorResponse('Le nom et le type sont requis', 400)
    }

    // Vérifier si la catégorie existe
    const [existingRows] = await db.execute(
      'SELECT id FROM categories WHERE id = ?',
      [categoryId]
    )

    if (!existingRows || (existingRows as any[]).length === 0) {
      return createErrorResponse('Catégorie non trouvée', 404)
    }

    // Vérifier si le nom n'est pas déjà utilisé par une autre catégorie
    const [duplicateRows] = await db.execute(
      'SELECT id FROM categories WHERE name = ? AND id != ?',
      [name, categoryId]
    )

    if (duplicateRows && (duplicateRows as any[]).length > 0) {
      return createErrorResponse('Une catégorie avec ce nom existe déjà', 409)
    }

    // Mettre à jour la catégorie
    await db.execute(
      'UPDATE categories SET name = ?, type = ?, description = ? WHERE id = ?',
      [name, type, description || null, categoryId]
    )

    return createSuccessResponse({ message: 'Catégorie modifiée avec succès' })

  } catch (error) {
    console.error('Erreur lors de la modification de la catégorie:', error)
    return createErrorResponse('Erreur serveur', 500)
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const categoryId = validateId(id)
    if (!categoryId) {
      return createErrorResponse('ID de catégorie invalide', 400)
    }

    // Vérifier si la catégorie existe
    const [existingRows] = await db.execute(
      'SELECT id FROM categories WHERE id = ?',
      [categoryId]
    )

    if (!existingRows || (existingRows as any[]).length === 0) {
      return createErrorResponse('Catégorie non trouvée', 404)
    }

    // Vérifier si des jeux utilisent cette catégorie
    const [gamesRows] = await db.execute(
      'SELECT COUNT(*) as count FROM games WHERE category_id = ?',
      [categoryId]
    )

    const gamesCount = (gamesRows as any[])[0]?.count || 0
    if (gamesCount > 0) {
      return createErrorResponse(
        `Impossible de supprimer cette catégorie car ${gamesCount} jeu(x) l'utilisent`, 
        409
      )
    }

    // Supprimer la catégorie
    await db.execute('DELETE FROM categories WHERE id = ?', [categoryId])

    return createSuccessResponse({ message: 'Catégorie supprimée avec succès' })

  } catch (error) {
    console.error('Erreur lors de la suppression de la catégorie:', error)
    return createErrorResponse('Erreur serveur', 500)
  }
}
