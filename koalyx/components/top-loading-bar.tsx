"use client"

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'

export default function TopLoadingBar() {
  const [isLoading, setIsLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const pathname = usePathname()

  useEffect(() => {
    let progressTimer: NodeJS.Timeout
    let completeTimer: NodeJS.Timeout

    const startLoading = () => {
      setIsLoading(true)
      setProgress(10)

      // Progression simulée plus fluide
      progressTimer = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressTimer)
            return 90
          }
          // Progression plus fluide et réaliste
          const increment = prev < 20 ? Math.random() * 8 + 15 : 
                           prev < 40 ? Math.random() * 6 + 10 : 
                           prev < 60 ? Math.random() * 4 + 5 : 
                           prev < 80 ? Math.random() * 3 + 2 : 
                           Math.random() * 1 + 0.5
          return Math.min(prev + increment, 90)
        })
      }, 100)
    }

    const completeLoading = () => {
      if (progressTimer) {
        clearInterval(progressTimer)
      }
      
      setProgress(100)
      completeTimer = setTimeout(() => {
        setIsLoading(false)
        setProgress(0)
      }, 300)
    }

    // Intercepter les clics sur les liens
    const handleLinkClick = (e: Event) => {
      const target = e.target as HTMLElement
      const link = target.closest('a[href]') as HTMLAnchorElement
      
      if (link && link.href) {
        try {
          const linkUrl = new URL(link.href)
          const currentUrl = new URL(window.location.href)
          
          // Navigation interne uniquement
          if (linkUrl.origin === currentUrl.origin && !link.target) {
            const isDifferentPage = linkUrl.pathname !== currentUrl.pathname || 
                                   linkUrl.search !== currentUrl.search
            
            if (isDifferentPage) {
              startLoading()
            }
          }
        } catch (error) {
          // Ignorer les URLs invalides
        }
      }
    }

    // Navigation par historique
    const handlePopState = () => {
      startLoading()
    }

    // Ajouter les listeners
    document.addEventListener('click', handleLinkClick, true)
    window.addEventListener('popstate', handlePopState)

    // Compléter quand la route change
    completeLoading()

    return () => {
      document.removeEventListener('click', handleLinkClick, true)
      window.removeEventListener('popstate', handlePopState)
      if (progressTimer) clearInterval(progressTimer)
      if (completeTimer) clearTimeout(completeTimer)
    }
  }, [pathname])

  if (!isLoading) return null

  return (
    <>
      {/* Barre de fond subtile */}
      <div className="fixed top-16 left-0 z-[9999] w-full h-1 bg-gray-200/10" />

      {/* Barre de progression bleue */}
      <div
        className="fixed top-16 left-0 z-[10000] h-1 bg-blue-500 transition-all duration-500 ease-out shadow-lg"
        style={{
          width: `${progress}%`,
          transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
        }}
      >
        {/* Effet de brillance */}
        <div className="absolute top-0 right-0 h-full w-12 bg-gradient-to-l from-white/50 to-transparent animate-pulse" />

        {/* Effet de lueur bleue subtile */}
        <div className="absolute top-0 left-0 w-full h-full bg-blue-400/30 blur-sm" />
      </div>
    </>
  )
}
