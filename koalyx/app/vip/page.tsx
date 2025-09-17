"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Navigation from '@/components/navigation'
import Footer from '@/components/footer'
import { useLanguage } from '@/contexts/LanguageContext'

export default function VipPage() {
  const router = useRouter()
  const { t } = useLanguage()

  useEffect(() => {
    // Rediriger vers l'accueil avec un paramètre pour ouvrir la popup VIP
    router.replace('/shop')
  }, [router])

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navigation />
      
      <div className="flex-1 flex flex-col justify-center">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-yellow-100 rounded-full mb-6">
            <i className="fas fa-crown text-yellow-600 text-4xl"></i>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">{t('auth.redirecting')}</h1>
          <p className="text-gray-600">
            {t('vip.redirectingToShop')}
          </p>
        </div>
      </div>
      </div>
      
      <Footer />
    </div>
  )
}
