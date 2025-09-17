import { NextApiRequest, NextApiResponse } from 'next'

// API temporaire pour générer des données aléatoires comme sur Koalyx
// pour badges, vues, plateformes en attendant la vraie implémentation

const randomBadges = [
  {
    id: 1,
    name: 'nouveaute',
    display_name: 'Nouveau',
    color: '#ef4444',
    icon: '<i class="fas fa-star"></i>',
    expires_at: '2024-12-31T23:59:59Z'
  },
  {
    id: 2,
    name: 'mise-a-jour',
    display_name: 'Mis à jour',
    color: '#f97316',
    icon: '<i class="fas fa-sync"></i>',
    expires_at: '2024-12-31T23:59:59Z'
  },
  {
    id: 3,
    name: 'exclusif',
    display_name: 'Exclusif',
    color: '#8b5cf6',
    icon: '<i class="fas fa-crown"></i>',
    expires_at: '2024-12-31T23:59:59Z'
  },
  {
    id: 4,
    name: 'populaire',
    display_name: 'Populaire',
    color: '#10b981',
    icon: '<i class="fas fa-fire"></i>',
    expires_at: '2024-12-31T23:59:59Z'
  }
]

const randomPlatforms = [
  'Windows',
  'Windows 10',
  'Windows 11',
  'Mac',
  'macOS',
  'Linux',
  'Android',
  'iOS',
  'Xbox',
  'PlayStation',
  'Nintendo Switch'
]

// Fonction pour obtenir des badges aléatoires
function getRandomBadges(count: number = 0) {
  if (count === 0) {
    // 30% de chance d'avoir des badges
    if (Math.random() > 0.7) return []
    count = Math.floor(Math.random() * 3) + 1 // 1-3 badges
  }
  
  const shuffled = [...randomBadges].sort(() => 0.5 - Math.random())
  return shuffled.slice(0, count)
}

// Fonction pour obtenir des vues aléatoires
function getRandomViews() {
  return Math.floor(Math.random() * 10000) + 50 // 50-10000 vues
}

// Fonction pour obtenir une plateforme aléatoire
function getRandomPlatform() {
  return randomPlatforms[Math.floor(Math.random() * randomPlatforms.length)]
}

// Fonction pour obtenir un prix aléatoire en crédits
function getRandomPrice() {
  const isFree = Math.random() > 0.6 // 40% de chance d'être gratuit
  if (isFree) return { price: 0 }
  
  const price = Math.floor(Math.random() * 5000) + 50 // 50 à 5000 crédits
  const hasDiscount = Math.random() > 0.8 // 20% de chance d'avoir une réduction
  
  if (hasDiscount) {
    const discountPercent = Math.floor(Math.random() * 50) + 10 // 10-60% de réduction
    const discountPrice = Math.floor(price * (100 - discountPercent) / 100)
    return { 
      price: price, 
      discount_price: discountPrice 
    }
  }
  
  return { price: price }
}

// Fonction pour obtenir un lien de téléchargement aléatoire
function getRandomDownloadLink() {
  const sites = [
    'https://google.com',
    'https://youtube.com', 
    'https://github.com'
  ]
  return sites[Math.floor(Math.random() * sites.length)]
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  const { gameId, count } = req.query
  
  try {
    if (gameId) {
      // Données pour un jeu spécifique
        const data = {
        gameId: gameId,
        badges: getRandomBadges(),
        views: getRandomViews(),
        platform: getRandomPlatform(),
        downloadLink: getRandomDownloadLink(),
        ...getRandomPrice()
      }
      
      return res.status(200).json({
        success: true,
        data
      })
    } else {
      // Données pour plusieurs jeux
      const gameCount = parseInt(count as string) || 10
      const games = []
      
      for (let i = 1; i <= gameCount; i++) {
        games.push({
          gameId: i.toString(),
          badges: getRandomBadges(),
          views: getRandomViews(),
          platform: getRandomPlatform(),
          downloadLink: getRandomDownloadLink(),
          ...getRandomPrice()
        })
      }
      
      return res.status(200).json({
        success: true,
        data: games
      })
    }
  } catch (error) {
    console.error('Erreur API games-random-data:', error)
    return res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    })
  }
}

