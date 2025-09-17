export type Locale = 'fr' | 'en'

export const locales: Locale[] = ['fr', 'en']
export const defaultLocale: Locale = 'fr'

export const localeLabels: Record<Locale, string> = {
  fr: 'Français',
  en: 'English (Beta)'
}

export const localeFlags: Record<Locale, string> = {
  fr: '/storage/icons/flags/fr.png',
  en: '/storage/icons/flags/gb.png'
}

export function getLocaleFromCookie(): Locale {
  if (typeof window !== 'undefined') {
    // Client-side
    const cookieValue = document.cookie
      .split('; ')
      .find(row => row.startsWith('locale='))
      ?.split('=')[1]
    
    return (cookieValue as Locale) || defaultLocale
  }
  
  return defaultLocale
}

export function setLocaleCookie(locale: Locale) {
  if (typeof window !== 'undefined') {
    document.cookie = `locale=${locale}; path=/; max-age=${365 * 24 * 60 * 60}; SameSite=Lax`
  }
}

// Utilitaire pour valider une locale
export function isValidLocale(locale: string): locale is Locale {
  return locales.includes(locale as Locale)
}

// Utilitaire pour obtenir la locale depuis les headers de la requête
export function getLocaleFromHeaders(acceptLanguage?: string): Locale {
  if (!acceptLanguage) return defaultLocale
  
  // Parser l'en-tête Accept-Language
  const languages = acceptLanguage
    .split(',')
    .map(lang => {
      const [code, quality = '1'] = lang.trim().split(';q=')
      return { code: code.split('-')[0], quality: parseFloat(quality) }
    })
    .sort((a, b) => b.quality - a.quality)
  
  // Trouver la première langue supportée
  for (const { code } of languages) {
    if (isValidLocale(code)) {
      return code
    }
  }
  
  return defaultLocale
}
