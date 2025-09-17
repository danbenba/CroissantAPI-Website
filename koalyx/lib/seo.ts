import { Metadata } from 'next'
import { Locale } from './i18n'

export interface SEOData {
  title: string
  description: string
  keywords?: string[]
  image?: string
  url?: string
  type?: 'website' | 'article' | 'product'
  publishedTime?: string
  modifiedTime?: string
  author?: string
  locale?: Locale
  alternateLocales?: Locale[]
}

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://koalyx.com'
const siteName = 'Koalyx'

export function generateSEOMetadata(data: SEOData): Metadata {
  const {
    title,
    description,
    keywords = [],
    image = '/storage/icon.png',
    url = baseUrl,
    type = 'website',
    publishedTime,
    modifiedTime,
    author,
    locale = 'fr',
    alternateLocales = ['fr', 'en']
  } = data

  const fullTitle = title.includes(siteName) ? title : `${title} | ${siteName}`
  const fullUrl = url.startsWith('http') ? url : `${baseUrl}${url}`
  const fullImageUrl = image.startsWith('http') ? image : `${baseUrl}${image}`

  const metadata: Metadata = {
    title: fullTitle,
    description,
    keywords: keywords.join(', '),
    
    // Open Graph
    openGraph: {
      title: fullTitle,
      description,
      url: fullUrl,
      siteName,
      images: [
        {
          url: fullImageUrl,
          width: 1200,
          height: 630,
          alt: title,
        }
      ],
      locale: locale === 'fr' ? 'fr_FR' : 'en_US',
      type: type === 'article' ? 'article' : 'website',
      ...(publishedTime && { publishedTime }),
      ...(modifiedTime && { modifiedTime }),
    },

    // Twitter Card
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: [fullImageUrl],
      site: '@koalyx',
      creator: author ? `@${author}` : '@koalyx',
    },

    // Canonical URL
    alternates: {
      canonical: fullUrl,
      languages: alternateLocales.reduce((acc, loc) => {
        acc[loc === 'fr' ? 'fr-FR' : 'en-US'] = `${baseUrl}/${loc === 'fr' ? '' : 'en/'}${url.replace(baseUrl, '').replace(/^\//, '')}`
        return acc
      }, {} as Record<string, string>)
    },

    // Robots
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },

    // Verification
    verification: {
      google: process.env.GOOGLE_SITE_VERIFICATION,
    },

    // App metadata
    applicationName: siteName,
    generator: 'Next.js',
    referrer: 'origin-when-cross-origin',
    
    // Authors
    ...(author && { authors: [{ name: author }] }),

    // Category for articles
    ...(type === 'article' && { category: 'Technology' }),
  }

  return metadata
}

// Métadonnées par défaut pour le site
export const defaultSEOData: SEOData = {
  title: 'Koalyx - Plateforme de téléchargement de logiciels',
  description: 'Découvrez et téléchargez les meilleurs logiciels, jeux et applications. Plateforme sécurisée avec système de support intégré.',
  keywords: [
    'logiciels',
    'téléchargement',
    'jeux',
    'applications',
    'gratuit',
    'windows',
    'mac',
    'linux',
    'sécurisé'
  ],
  type: 'website'
}

// Générateur de métadonnées pour les jeux
export function generateGameSEOData(game: {
  id: number
  title: string
  description: string
  banner_url?: string
  platform: string
  category?: string
  year: number
  created_at: string
  updated_at: string
}): SEOData {
  return {
    title: `${game.title} - Téléchargement gratuit`,
    description: `Téléchargez ${game.title} gratuitement. ${game.description.substring(0, 120)}...`,
    keywords: [
      game.title.toLowerCase(),
      game.platform.toLowerCase(),
      game.category?.toLowerCase() || 'jeu',
      'téléchargement',
      'gratuit',
      game.year.toString(),
      'iso',
      'crack',
      'full'
    ],
    image: game.banner_url,
    url: `/resources/${game.id}`,
    type: 'product',
    publishedTime: game.created_at,
    modifiedTime: game.updated_at,
  }
}

// Générateur de métadonnées pour les articles
export function generateArticleSEOData(article: {
  id: number
  titre: string
  resume?: string
  contenu: string
  auteur_nom: string
  date_publication: string
  date_creation: string
  image_principale?: string
  categories: string[]
  tags: string[]
}): SEOData {
  const description = article.resume || 
    article.contenu.replace(/<[^>]*>/g, '').substring(0, 160) + '...'

  return {
    title: article.titre,
    description,
    keywords: [
      ...article.categories.map(cat => cat.toLowerCase()),
      ...article.tags.map(tag => tag.toLowerCase()),
      'article',
      'guide',
      'tutoriel'
    ],
    image: article.image_principale,
    url: `/articles/${article.id}`,
    type: 'article',
    publishedTime: article.date_publication,
    modifiedTime: article.date_creation,
    author: article.auteur_nom,
  }
}

// Générateur de sitemap (pour référence)
export function generateSitemapUrls(
  games: Array<{ id: number; updated_at: string }>,
  articles: Array<{ id: number; date_publication: string }>
) {
  const staticPages = [
    { url: '', priority: 1.0, changeFreq: 'daily' },
    { url: '/explore', priority: 0.9, changeFreq: 'daily' },
    { url: '/articles', priority: 0.8, changeFreq: 'daily' },
    { url: '/shop', priority: 0.7, changeFreq: 'weekly' },
    { url: '/about', priority: 0.6, changeFreq: 'monthly' },
    { url: '/legal/mentions-legales', priority: 0.3, changeFreq: 'yearly' },
    { url: '/legal/conditions-utilisation', priority: 0.3, changeFreq: 'yearly' },
    { url: '/legal/politique-confidentialite', priority: 0.3, changeFreq: 'yearly' },
    { url: '/legal/contact', priority: 0.5, changeFreq: 'monthly' },
  ]

  const gamePages = games.map(game => ({
    url: `/resources/${game.id}`,
    priority: 0.8,
    changeFreq: 'weekly',
    lastmod: game.updated_at
  }))

  const articlePages = articles.map(article => ({
    url: `/articles/${article.id}`,
    priority: 0.7,
    changeFreq: 'monthly',
    lastmod: article.date_publication
  }))

  return [...staticPages, ...gamePages, ...articlePages]
}
