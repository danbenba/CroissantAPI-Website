import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/database'

export async function GET() {
  try {
    // Récupérer les catégories depuis la DB
    const [categories] = await db.execute('SELECT * FROM categories ORDER BY name ASC')
    
    // Récupérer les plateformes disponibles
    const [platforms] = await db.execute('SELECT DISTINCT platform FROM games WHERE platform IS NOT NULL ORDER BY platform ASC')
    
    // Récupérer les années disponibles
    const [years] = await db.execute('SELECT DISTINCT year FROM games WHERE year IS NOT NULL ORDER BY year DESC')
    
    return NextResponse.json({
      success: true,
      data: {
        categories: categories,
        platforms: (platforms as any[]).map((p: any) => p.platform),
        years: (years as any[]).map((y: any) => y.year)
      }
    })
    
  } catch (error) {
    console.error('Erreur lors de la récupération des catégories:', error)
    return NextResponse.json(
      { success: false, message: 'Erreur lors de la récupération des catégories' },
      { status: 500 }
    )
  }
}
