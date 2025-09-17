"use client"

import React from 'react'
import { useLanguage } from '@/contexts/LanguageContext'
import { Locale, locales, localeLabels, localeFlags } from '@/lib/i18n'
import { Select, SelectItem } from '@heroui/select'
import { Avatar } from '@heroui/avatar'

interface LanguageSelectorProps {
  variant?: 'bordered' | 'flat' | 'faded' | 'underlined'
  size?: 'sm' | 'md' | 'lg'
  className?: string
  showLabel?: boolean
}

export default function LanguageSelector({ 
  variant = 'bordered', 
  size = 'sm', 
  className = '',
  showLabel = false 
}: LanguageSelectorProps) {
  const { locale, setLocale, t } = useLanguage()

  const handleLanguageChange = (newLocale: string) => {
    setLocale(newLocale as Locale)
  }

  return (
    <div className={`flex flex-col items-center gap-2 ${className}`}>
      {showLabel && (
        <span className="text-sm text-gray-400 font-medium">
          {t('footer.changeLanguage')}
        </span>
      )}
      <Select
        selectedKeys={[locale]}
        onSelectionChange={(keys) => {
          const selectedLocale = Array.from(keys)[0] as string
          handleLanguageChange(selectedLocale)
        }}
        className="w-40"
        classNames={{
          trigger: "bg-gray-800/80 border-white/20 hover:border-blue-500/50 text-white",
          value: "text-white",
          popoverContent: "bg-gray-800/95 backdrop-blur-lg border-white/20"
        }}
        startContent={
          <Avatar
            src={localeFlags[locale]}
            className="w-5 h-5"
            radius="sm"
          />
        }
        variant={variant}
        size={size}
        aria-label="Sélectionner la langue"
      >
        {locales.map((loc) => (
          <SelectItem 
            key={loc}
            startContent={
              <Avatar
                src={localeFlags[loc]}
                className="w-5 h-5"
                radius="sm"
              />
            }
            className="text-white data-[hover=true]:bg-white/10"
          >
            {localeLabels[loc]}
          </SelectItem>
        ))}
      </Select>
    </div>
  )
}
