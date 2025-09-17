import { redirect } from 'next/navigation'
import GameDetailPage from '../page'

/**
 * Page avec slug SEO-friendly : /games/[id]/[slug]
 * Cette page hérite de la logique de la page principale et gère les redirections
 */

interface PageProps {
  params: Promise<{ id: string; slug: string }>
}

export default async function GameDetailWithSlugPage({ params }: PageProps) {
  // Cette page utilise exactement la même logique que la page principale
  // Le slug est géré côté client pour les redirections si nécessaire
  return <GameDetailPage />
}

// Note: Les métadonnées sont gérées par la page principale
