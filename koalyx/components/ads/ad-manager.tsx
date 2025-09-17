"use client"

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'
import AdPopup from './ad-popup'
import AdBanner from './ad-banner'
import AdSidebar from './ad-sidebar'
import GoogleAd from './google-ad'

interface Ad {
  id: number
  title: string
  description?: string
  image_url?: string
  link_url?: string
  ad_type: string
  ad_format?: string
  google_ad_slot?: string
  google_ad_format?: string
}

export default function AdManager() {
  const { user } = useAuth()
  const pathname = usePathname()
  
  const [ads, setAds] = useState<Ad[]>([])
  const [popupAd, setPopupAd] = useState<Ad | null>(null)
  const [showPopup, setShowPopup] = useState(false)
  const [pageCount, setPageCount] = useState(0)
  const [lastPopupPage, setLastPopupPage] = useState(0)
  const [randomSeed, setRandomSeed] = useState(0)

  // Configuration selon le rôle
  const getRoleForAds = (role?: string) => {
    if (!role) return 'gratuit'
    if (role === 'membre' || role === 'visiteur') return 'gratuit'
    if (role === 'plus') return 'plus'
    if (role === 'ultra') return 'ultra'
    if (role === 'admin' || role === 'moderateur' || role === 'support') return 'ultra'
    return 'gratuit'
  }

  const userRole = getRoleForAds(user?.role)
  const showAds = userRole !== 'ultra' // Toutes les pubs sauf pour ultra
  const showPopups = userRole === 'gratuit' // Popups SEULEMENT pour gratuit
  
  // Fréquence aléatoire entre 1 et 3 pages (peut être 0 pour la première visite)
  const [currentPopupFrequency, setCurrentPopupFrequency] = useState(() => Math.floor(Math.random() * 4)) // 0, 1, 2, ou 3

  // Charger les publicités
  // Fonction pour randomiser un tableau (utilise randomSeed pour forcer la re-randomisation)
  const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array]
    // Utiliser randomSeed comme base pour la randomisation
    const seed = randomSeed + Date.now()
    Math.random() // Consommer une valeur pour utiliser le seed
    
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled
  }

  useEffect(() => {
    if (!showAds) return

    const fetchAds = async () => {
      try {
        console.log(`🔄 Chargement publicités pour rôle: ${userRole}, page: ${pathname}`)
        const response = await fetch(`/api/ads?page=${pathname}`)
        if (response.ok) {
          const data = await response.json()
          console.log(`✅ Publicités reçues:`, data.ads)
          console.log(`👤 Rôle utilisateur:`, data.userRole)
          console.log(`🔧 Debug info:`, data.debug)
          
          // S'assurer que data.ads est un tableau et le randomiser
          const adsArray = Array.isArray(data.ads) ? shuffleArray(data.ads as Ad[]) : []
          console.log(`📊 Nombre de publicités à afficher:`, adsArray.length)
          console.log(`🎲 Publicités randomisées:`, adsArray.map((ad: any) => ({ id: ad.id, type: ad.ad_type, format: ad.ad_format })))
          
          setAds(adsArray)
          
          // Vérification post-setState (pour debug)
          setTimeout(() => {
            console.log(`⚡ État ads après setState:`, adsArray.length)
          }, 100)
        } else {
          console.error('❌ Erreur response:', response.status, response.statusText)
        }
      } catch (error) {
        console.error('❌ Erreur chargement publicités:', error)
      }
    }

    fetchAds()
  }, [pathname, showAds, userRole])

  // Re-randomiser les publicités toutes les 30 secondes
  useEffect(() => {
    const interval = setInterval(() => {
      setRandomSeed(prev => prev + 1)
    }, 30000) // 30 secondes

    return () => clearInterval(interval)
  }, [])

  // Gérer l'incrémentation du compteur de pages
  useEffect(() => {
    if (!showPopups) return
    setPageCount(prev => prev + 1)
  }, [pathname, showPopups])

  // Gérer l'affichage des popups pour les utilisateurs gratuits
  useEffect(() => {
    if (!showPopups || ads.length === 0 || pageCount === 0) return

    // Afficher popup si on atteint la fréquence et qu'il y a une pub popup disponible
    const shouldShowPopup = (pageCount - lastPopupPage) >= currentPopupFrequency
    const popupAds = ads.filter(ad => ad.ad_type === 'popup')
    
    console.log(`🎯 Popup check: pageCount=${pageCount}, lastPopupPage=${lastPopupPage}, frequency=${currentPopupFrequency}, shouldShow=${shouldShowPopup}, popupAds=${popupAds.length}`)
    
    if (shouldShowPopup && popupAds.length > 0) {
      const randomPopup = popupAds[Math.floor(Math.random() * popupAds.length)]
      setPopupAd(randomPopup)
      
      // Délai avant affichage
      const timer = setTimeout(() => {
        setShowPopup(true)
        setLastPopupPage(pageCount)
        // Générer une nouvelle fréquence aléatoire pour la prochaine popup (1-3 pages)
        const newFrequency = Math.floor(Math.random() * 3) + 1
        setCurrentPopupFrequency(newFrequency)
        console.log(`🔄 Nouvelle fréquence popup: ${newFrequency}`)
      }, 2000)

      return () => clearTimeout(timer)
    }
  }, [ads, pageCount, showPopups, currentPopupFrequency, lastPopupPage])

  // Gérer les clics sur les publicités
  const handleAdClick = async (adId: number) => {
    try {
      await fetch('/api/ads/click', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adId, pageUrl: pathname })
      })
    } catch (error) {
      console.error('Erreur enregistrement clic:', error)
    }
  }

  const handlePopupClose = () => {
    setShowPopup(false)
    setPopupAd(null)
  }

  if (!showAds) return null

  // Randomiser les publicités pour chaque type à chaque rendu
  const bannerTopAds = shuffleArray(ads.filter(ad => ad.ad_type === 'banner_top'))
  const bannerBottomAds = shuffleArray(ads.filter(ad => ad.ad_type === 'banner_bottom'))
  const sidebarLeftAds = shuffleArray(ads.filter(ad => ad.ad_type === 'sidebar_left'))
  const sidebarRightAds = shuffleArray(ads.filter(ad => ad.ad_type === 'sidebar_right'))

  // Debug logs
  console.log(`🎯 Publicités par type:`, {
    total: ads.length,
    bannerBottom: bannerBottomAds.length,
    sidebarLeft: sidebarLeftAds.length,
    sidebarRight: sidebarRightAds.length,
    userRole,
    showAds,
    showPopups,
    adsDetails: ads.map(ad => ({ id: ad.id, type: ad.ad_type, title: ad.title }))
  })

  // Séparer les Google Ads des pubs custom
  const renderAd = (ad: Ad) => {
    if (ad.ad_format === 'google_ads' && ad.google_ad_slot) {
      return (
        <GoogleAd
          key={`google-${ad.id}`}
          adSlot={ad.google_ad_slot}
          adFormat={ad.google_ad_format || 'auto'}
          className="w-full"
        />
      )
    }
    return null // Les pubs custom sont gérées par les composants existants
  }

  return (
    <>
      {/* Popup pour utilisateurs gratuits */}
      {showPopups && popupAd && (
        <AdPopup
          ad={popupAd}
          isOpen={showPopup}
          onClose={handlePopupClose}
          onAdClick={handleAdClick}
        />
      )}

      {/* Les bannières du haut sont supprimées pour ne pas gêner la navigation */}

      {/* Bannières du bas */}
      {bannerBottomAds.map((ad) => (
        <div key={ad.id}>
          {ad.ad_format === 'google_ads' ? (
            renderAd(ad)
          ) : (
            <AdBanner
              ad={ad}
              position="bottom"
              onAdClick={handleAdClick}
              onClose={() => {
                setAds(prev => prev.filter(a => a.id !== ad.id))
              }}
            />
          )}
        </div>
      ))}

      {/* Sidebar gauche */}
      <div className="fixed left-4 top-1/2 transform -translate-y-1/2 z-30 hidden lg:block">
        <div className="space-y-4">
          {sidebarLeftAds.map((ad) => 
            ad.ad_format === 'google_ads' ? (
              <div key={ad.id} className="max-w-xs">
                {renderAd(ad)}
              </div>
            ) : null
          )}
          {sidebarLeftAds.filter(ad => ad.ad_format !== 'google_ads').length > 0 && (
            <AdSidebar
              ads={sidebarLeftAds.filter(ad => ad.ad_format !== 'google_ads')}
              position="left"
              onAdClick={handleAdClick}
            />
          )}
        </div>
      </div>

      {/* Sidebar droite */}
      <div className="fixed right-4 top-1/2 transform -translate-y-1/2 z-30 hidden lg:block">
        <div className="space-y-4">
          {sidebarRightAds.map((ad) => 
            ad.ad_format === 'google_ads' ? (
              <div key={ad.id} className="max-w-xs">
                {renderAd(ad)}
              </div>
            ) : null
          )}
          {sidebarRightAds.filter(ad => ad.ad_format !== 'google_ads').length > 0 && (
            <AdSidebar
              ads={sidebarRightAds.filter(ad => ad.ad_format !== 'google_ads')}
              position="right"
              onAdClick={handleAdClick}
            />
          )}
        </div>
      </div>
    </>
  )
}
