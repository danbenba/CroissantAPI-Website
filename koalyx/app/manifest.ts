import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Koalyx - Plateforme de téléchargement de logiciels',
    short_name: 'Koalyx',
    description: 'Découvrez et téléchargez les meilleurs logiciels, jeux et applications. Plateforme sécurisée avec système de support intégré.',
    start_url: '/',
    display: 'standalone',
    background_color: '#000000',
    theme_color: '#6366f1',
    orientation: 'portrait',
    scope: '/',
    lang: 'fr',
    categories: ['productivity', 'games', 'utilities'],
    icons: [
      {
        src: '/storage/icon.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable'
      },
      {
        src: '/storage/icon.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any'
      },
      {
        src: '/favicon.ico',
        sizes: '48x48',
        type: 'image/x-icon'
      }
    ],
    screenshots: [
      {
        src: '/storage/screenshots/homepage.png',
        sizes: '1280x720',
        type: 'image/png',
        form_factor: 'wide'
      },
      {
        src: '/storage/screenshots/games.png',
        sizes: '750x1334',
        type: 'image/png',
        form_factor: 'narrow'
      }
    ],
    shortcuts: [
      {
        name: 'Catalogue des jeux',
        short_name: 'Jeux',
        description: 'Parcourir le catalogue des jeux',
        url: '/explore',
        icons: [
          {
            src: '/storage/icons/gamepad.png',
            sizes: '96x96',
            type: 'image/png'
          }
        ]
      },
      {
        name: 'Articles',
        short_name: 'Articles',
        description: 'Lire les derniers articles',
        url: '/articles',
        icons: [
          {
            src: '/storage/icons/newspaper.png',
            sizes: '96x96',
            type: 'image/png'
          }
        ]
      },
      {
        name: 'Mon compte',
        short_name: 'Compte',
        description: 'Gérer mon compte utilisateur',
        url: '/account',
        icons: [
          {
            src: '/storage/icons/user.png',
            sizes: '96x96',
            type: 'image/png'
          }
        ]
      }
    ],
    related_applications: [],
    prefer_related_applications: false
  }
}
