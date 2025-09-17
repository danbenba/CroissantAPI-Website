"use client"

import React from 'react'
import Navigation from '@/components/navigation'
import Footer from '@/components/footer'

interface PageLayoutProps {
  children: React.ReactNode
  className?: string
  showNavigation?: boolean
  showFooter?: boolean
}

export default function PageLayout({ 
  children, 
  className = "", 
  showNavigation = true, 
  showFooter = true 
}: PageLayoutProps) {
  return (
    <div className={`min-h-screen flex flex-col ${className}`}>
      {showNavigation && <Navigation />}
      
      {/* Contenu principal qui prend tout l'espace disponible */}
      <main className="flex-1">
        {children}
      </main>
      
      {showFooter && <Footer />}
    </div>
  )
}
