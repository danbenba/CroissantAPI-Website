"use client"

import { useState } from 'react'
import { Card, CardBody, Button, Image } from '@heroui/react'
import { X } from 'lucide-react'

interface AdBannerProps {
  ad: {
    id: number
    title: string
    description?: string
    image_url?: string
    link_url?: string
  }
  position: 'top' | 'bottom'
  onAdClick: (adId: number) => void
  onClose?: () => void
}

export default function AdBanner({ ad, position, onAdClick, onClose }: AdBannerProps) {
  const [isVisible, setIsVisible] = useState(true)

  const handleAdClick = () => {
    onAdClick(ad.id)
    if (ad.link_url) {
      window.open(ad.link_url, '_blank')
    }
  }

  const handleClose = () => {
    setIsVisible(false)
    onClose?.()
  }

  if (!isVisible) return null

  const positionClasses = {
    top: 'fixed top-0 left-0 right-0 z-40 border-b border-gray-700',
    bottom: 'fixed bottom-0 left-0 right-0 z-40 border-t border-gray-700'
  }

  return (
    <div className={`${positionClasses[position]} bg-gradient-to-r from-gray-900 to-gray-800 shadow-lg`}>
      <div className="max-w-4xl mx-auto">
        <Card className="rounded-none bg-transparent shadow-none">
          <CardBody className="flex flex-row items-center justify-between py-3 px-6">
          <div 
            className="flex items-center gap-4 cursor-pointer flex-1 hover:opacity-80 transition-opacity"
            onClick={handleAdClick}
          >
            {ad.image_url && (
              <Image
                src={ad.image_url}
                alt={ad.title}
                className="w-12 h-12 object-cover rounded"
                fallbackSrc="/placeholder.jpg"
              />
            )}
            
            <div className="flex-1">
              <h4 className="text-white font-semibold text-sm">{ad.title}</h4>
              {ad.description && (
                <p className="text-gray-300 text-xs truncate max-w-md">
                  {ad.description}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              color="primary"
              variant="shadow"
              onPress={handleAdClick}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-xs px-3"
            >
              Voir
            </Button>
            
            {onClose && (
              <Button
                isIconOnly
                size="sm"
                variant="light"
                onPress={handleClose}
                className="text-gray-400 hover:text-white min-w-8 w-8 h-8"
              >
                <X size={14} />
              </Button>
            )}
          </div>
          </CardBody>
        </Card>
      </div>
    </div>
  )
}
