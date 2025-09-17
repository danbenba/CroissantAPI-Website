"use client"

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import VipPopup from './vip-popup'

function VipAutoPopupContent() {
  const [isOpen, setIsOpen] = useState(false)
  const searchParams = useSearchParams()
  const router = useRouter()

  useEffect(() => {
    // Vérifier si le paramètre 'vip' est présent dans l'URL
    if (searchParams.get('vip') === 'true') {
      setIsOpen(true)
      
      // Nettoyer l'URL en supprimant le paramètre 'vip'
      const url = new URL(window.location.href)
      url.searchParams.delete('vip')
      
      // Remplacer l'URL sans recharger la page
      window.history.replaceState({}, '', url.toString())
    }
  }, [searchParams])

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open)
  }

  return (
    <VipPopup 
      isOpen={isOpen} 
      onOpenChange={handleOpenChange} 
    />
  )
}

export default function VipAutoPopup() {
  return (
    <Suspense fallback={null}>
      <VipAutoPopupContent />
    </Suspense>
  )
}
