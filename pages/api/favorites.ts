import { NextApiRequest, NextApiResponse } from 'next';

interface FavoriteData {
  gameId: string;
  isFavorite: boolean;
  favoriteCount: number;
}

// Simulation de données de favoris (temporaire)
const generateFavoriteData = (gameId: string): FavoriteData => {
  const isFavorite = Math.random() > 0.7; // 30% de chance d'être favori
  const favoriteCount = Math.floor(Math.random() * 500) + 10; // Entre 10 et 500 favoris
  
  return {
    gameId,
    isFavorite,
    favoriteCount
  };
};

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { gameId } = req.query;

  if (req.method === 'GET') {
    if (gameId) {
      // Données pour un jeu spécifique
      const data = generateFavoriteData(gameId as string);
      return res.status(200).json({
        success: true,
        data
      });
    } else {
      // Données pour plusieurs jeux
      const games = [];
      for (let i = 1; i <= 50; i++) {
        games.push(generateFavoriteData(i.toString()));
      }
      
      return res.status(200).json({
        success: true,
        data: games
      });
    }
  } else if (req.method === 'POST') {
    // Simulation de toggle favorite
    const data = generateFavoriteData(gameId as string);
    data.isFavorite = !data.isFavorite; // Toggle
    
    return res.status(200).json({
      success: true,
      message: data.isFavorite ? 'Ajouté aux favoris' : 'Retiré des favoris',
      data
    });
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
