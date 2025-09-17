"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { Locale, defaultLocale, getLocaleFromCookie, setLocaleCookie } from '@/lib/i18n'

interface LanguageContextType {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: (key: string, params?: Record<string, string | number>) => string
  isLoading: boolean
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

interface LanguageProviderProps {
  children: ReactNode
}

export function LanguageProvider({ children }: LanguageProviderProps) {
  const [locale, setLocaleState] = useState<Locale>(defaultLocale)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Charger la locale depuis le cookie au montage du composant
    const savedLocale = getLocaleFromCookie()
    setLocaleState(savedLocale)
    setIsLoading(false)
  }, [])

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale)
    setLocaleCookie(newLocale)
  }

  const t = (key: string, params?: Record<string, string | number>): string => {
    // Import dynamique des traductions
    const translations = require('@/lib/translations').translations
    
    const keys = key.split('.')
    let value: any = translations[locale]
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k]
      } else {
        // Fallback vers la traduction française si la clé n'existe pas
        let fallbackValue: any = translations.fr
        for (const fallbackKey of keys) {
          if (fallbackValue && typeof fallbackValue === 'object' && fallbackKey in fallbackValue) {
            fallbackValue = fallbackValue[fallbackKey]
          } else {
            return key // Retourner la clé si aucune traduction n'est trouvée
          }
        }
        value = fallbackValue
        break
      }
    }
    
    if (typeof value !== 'string') {
      return key // Retourner la clé si la valeur n'est pas une string
    }
    
    // Remplacer les paramètres dans la traduction
    if (params) {
      return value.replace(/\{\{(\w+)\}\}/g, (match, paramKey) => {
        return params[paramKey]?.toString() || match
      })
    }
    
    return value
  }

  const value: LanguageContextType = {
    locale,
    setLocale,
    t,
    isLoading
  }

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage(): LanguageContextType {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}
