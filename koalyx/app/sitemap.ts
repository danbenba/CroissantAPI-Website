import { MetadataRoute } from 'next'
import { generateGameUrl } from '@/lib/slug'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://koalyx.com'
  
  // Pages statiques
  const staticPages = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1.0,
    },
    {
      url: `${baseUrl}/explore`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/articles`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/shop`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    },
    {
      url: `${baseUrl}/legal/mentions-legales`,
      lastModified: new Date(),
      changeFrequency: 'yearly' as const,
      priority: 0.3,
    },
    {
      url: `${baseUrl}/legal/conditions-utilisation`,
      lastModified: new Date(),
      changeFrequency: 'yearly' as const,
      priority: 0.3,
    },
    {
      url: `${baseUrl}/legal/politique-confidentialite`,
      lastModified: new Date(),
      changeFrequency: 'yearly' as const,
      priority: 0.3,
    },
    {
      url: `${baseUrl}/legal/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    },
  ]

  try {
    // Récupérer les jeux depuis l'API
    const gamesResponse = await fetch(`${baseUrl}/api/games`)
    let gamePages: MetadataRoute.Sitemap = []
    
    if (gamesResponse.ok) {
      const gamesData = await gamesResponse.json()
      if (gamesData.success && gamesData.games) {
        gamePages = gamesData.games.map((game: any) => ({
          url: `${baseUrl}${generateGameUrl(game.id, game.title)}`,
          lastModified: new Date(game.updated_at),
          changeFrequency: 'weekly' as const,
          priority: 0.8,
        }))
      }
    }

    // Récupérer les articles depuis l'API
    const articlesResponse = await fetch(`${baseUrl}/api/articles?status=publie&limit=1000`)
    let articlePages: MetadataRoute.Sitemap = []
    
    if (articlesResponse.ok) {
      const articlesData = await articlesResponse.json()
      if (articlesData.success && articlesData.data?.articles) {
        articlePages = articlesData.data.articles.map((article: any) => ({
          url: `${baseUrl}/articles/${article.id}`,
          lastModified: new Date(article.date_publication),
          changeFrequency: 'monthly' as const,
          priority: 0.7,
        }))
      }
    }

    return [...staticPages, ...gamePages, ...articlePages]
  } catch (error) {
    console.error('Error generating sitemap:', error)
    // Retourner au moins les pages statiques en cas d'erreur
    return staticPages
  }
}
