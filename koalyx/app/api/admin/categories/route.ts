import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/database'
import { createErrorResponse, createSuccessResponse } from '@/lib/api-security'

export async function GET() {
  try {
    console.log('🔍 Récupération des catégories admin...')
    
    // Récupérer les catégories depuis la DB
    const [categories] = await db.execute('SELECT * FROM categories ORDER BY name ASC')
    console.log(`✅ ${Array.isArray(categories) ? categories.length : 0} catégories trouvées`)
    
    // Récupérer les plateformes depuis la table categories (pas games)
    const [platforms] = await db.execute('SELECT name FROM categories WHERE type = "platform" ORDER BY name ASC')
    console.log(`✅ ${Array.isArray(platforms) ? platforms.length : 0} plateformes trouvées`)
    
    // Récupérer les années depuis les jeux existants
    const [years] = await db.execute('SELECT DISTINCT year FROM games WHERE year IS NOT NULL ORDER BY year DESC')
    console.log(`✅ ${Array.isArray(years) ? years.length : 0} années trouvées`)
    
    const responseData = {
      success: true,
      data: {
        categories: categories,
        platforms: (platforms as any[]).map((p: any) => p.name),
        years: (years as any[]).map((y: any) => y.year),
        vipStatuses: [
          { value: true, label: 'VIP uniquement' },
          { value: false, label: 'Tout le monde' }
        ]
      }
    }
    
    console.log('📤 Envoi des données:', responseData)
    
    return NextResponse.json(responseData)
    
  } catch (error) {
    console.error('❌ Erreur lors de la récupération des catégories:', error)
    return NextResponse.json(
      { success: false, message: 'Erreur lors de la récupération des catégories' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, type, description } = body

    // Validation
    if (!name || !type) {
      return createErrorResponse('Le nom et le type sont requis', 400)
    }

    // Vérifier si le nom n'est pas déjà utilisé
    const [existingRows] = await db.execute(
      'SELECT id FROM categories WHERE name = ?',
      [name]
    )

    if (existingRows && (existingRows as any[]).length > 0) {
      return createErrorResponse('Une catégorie avec ce nom existe déjà', 409)
    }

    // Insérer la nouvelle catégorie
    const [result] = await db.execute(
      'INSERT INTO categories (name, type, description) VALUES (?, ?, ?)',
      [name, type, description || null]
    )

    const insertId = (result as any).insertId

    return createSuccessResponse({ 
      message: 'Catégorie créée avec succès',
      categoryId: insertId
    })

  } catch (error) {
    console.error('Erreur lors de la création de la catégorie:', error)
    return createErrorResponse('Erreur serveur', 500)
  }
}
