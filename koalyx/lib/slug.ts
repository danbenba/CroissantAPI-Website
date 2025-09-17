/**
 * Utilitaires pour générer des slugs SEO-friendly
 */

/**
 * Génère un slug à partir d'un titre de jeu
 * @param title - Le titre du jeu
 * @returns Le slug généré
 */
export function generateGameSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    // Remplacer les caractères spéciaux et accents
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Supprimer les accents
    .replace(/[^a-z0-9\s-]/g, '') // Garder seulement lettres, chiffres, espaces et tirets
    .replace(/\s+/g, '-') // Remplacer les espaces par des tirets
    .replace(/-+/g, '-') // Éviter les tirets multiples
    .replace(/^-|-$/g, '') // Supprimer les tirets en début/fin
}

/**
 * Génère l'URL complète d'un jeu avec slug
 * @param gameId - L'ID du jeu
 * @param title - Le titre du jeu
 * @returns L'URL complète du jeu
 */
export function generateGameUrl(gameId: number, title: string): string {
  const slug = generateGameSlug(title)
  return `/resources/${gameId}/${slug}`
}

/**
 * Extrait l'ID d'une URL de jeu (avec ou sans slug)
 * @param url - L'URL ou juste l'ID
 * @returns L'ID du jeu
 */
export function extractGameId(url: string): number | null {
  // Si c'est juste un nombre
  if (/^\d+$/.test(url)) {
    return parseInt(url)
  }
  
  // Si c'est une URL complète
  const match = url.match(/\/resources\/(\d+)/)
  if (match) {
    return parseInt(match[1])
  }
  
  return null
}

/**
 * Valide qu'un slug correspond au titre d'un jeu
 * @param slug - Le slug à valider
 * @param title - Le titre du jeu
 * @returns true si le slug correspond
 */
export function validateGameSlug(slug: string, title: string): boolean {
  const expectedSlug = generateGameSlug(title)
  return slug === expectedSlug
}
