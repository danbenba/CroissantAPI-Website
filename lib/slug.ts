// Fonction pour générer une URL de jeu basée sur l'ID et le titre
export function generateGameUrl(id: number, title: string): string {
  // Convertir le titre en slug (minuscules, espaces remplacés par des tirets, caractères spéciaux supprimés)
  const slug = title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Supprimer les caractères spéciaux
    .replace(/\s+/g, '-')      // Remplacer les espaces par des tirets
    .replace(/-+/g, '-')       // Remplacer les tirets multiples par un seul
    .trim();

  return `/game/${id}/${slug}`;
}
