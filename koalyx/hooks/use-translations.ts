import { useLanguage } from '@/contexts/LanguageContext'

// Hook simplifié pour utiliser les traductions
export function useTranslations() {
  const { t, locale, setLocale } = useLanguage()
  
  return {
    t,
    locale,
    setLocale,
    // Fonctions utilitaires pour des cas spécifiques
    formatDate: (date: Date | string) => {
      const dateObj = typeof date === 'string' ? new Date(date) : date
      return dateObj.toLocaleDateString(locale === 'fr' ? 'fr-FR' : 'en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    },
    formatNumber: (num: number) => {
      return num.toLocaleString(locale === 'fr' ? 'fr-FR' : 'en-US')
    },
    // Fonction pour gérer le pluriel
    plural: (count: number, singular: string, plural?: string) => {
      if (count === 1) {
        return t(singular, { count })
      }
      return t(plural || `${singular}Plural`, { count })
    }
  }
}
