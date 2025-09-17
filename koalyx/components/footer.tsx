"use client"

import React from 'react'
import Link from 'next/link'
import { useLanguage } from '@/contexts/LanguageContext'
import LanguageSelector from './language-selector'

export default function Footer() {
  const { t } = useLanguage()

  return (
    <footer className="mt-auto bg-transparent backdrop-blur-lg border-t border-white/10 text-white relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
          
          {/* Logo et nom à gauche */}
          <div className="flex items-center justify-center md:justify-start">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-700 rounded-lg flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-300">
                <i className="fas fa-globe text-white text-xl"></i>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Koalyx
              </span>
            </Link>
          </div>

          {/* Sélecteur de langue au centre */}
          <div className="flex justify-center">
            <LanguageSelector showLabel={true} />
          </div>

          {/* Liens légaux à droite */}
          <div className="flex flex-col gap-2 items-center md:items-end">
            <nav className="flex flex-col sm:flex-row gap-4 text-sm">
              <Link 
                href="/legal/mentions-legales" 
                className="text-gray-300 hover:text-blue-400 transition-colors duration-200"
              >
                {t('footer.legalNotice')}
              </Link>
              <Link 
                href="/legal/conditions-utilisation" 
                className="text-gray-300 hover:text-blue-400 transition-colors duration-200"
              >
                {t('footer.termsOfService')}
              </Link>
              <Link 
                href="/legal/politique-confidentialite" 
                className="text-gray-300 hover:text-blue-400 transition-colors duration-200"
              >
                {t('footer.privacyPolicy')}
              </Link>
              <Link 
                href="/legal/contact" 
                className="text-gray-300 hover:text-blue-400 transition-colors duration-200"
              >
                {t('footer.contact')}
              </Link>
            </nav>
          </div>
        </div>

        {/* Ligne de séparation et copyright */}
        <div className="border-t border-white/10 mt-8 pt-6 text-center">
          <p className="text-sm text-gray-400">
            © {new Date().getFullYear()} Koalyx. {t('footer.rights')}.
          </p>
        </div>
      </div>
    </footer>
  )
}
