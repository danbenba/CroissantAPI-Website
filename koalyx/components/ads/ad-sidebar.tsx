"use client"

import { useState } from 'react'
import { Card, CardBody, CardHeader, Button, Image } from '@heroui/react'
import { X, ExternalLink } from 'lucide-react'

interface AdSidebarProps {
  ads: Array<{
    id: number
    title: string
    description?: string
    image_url?: string
    link_url?: string
  }>
  position: 'left' | 'right'
  onAdClick: (adId: number) => void
}

export default function AdSidebar({ ads, position, onAdClick }: AdSidebarProps) {
  const [hiddenAds, setHiddenAds] = useState<Set<number>>(new Set())

  const handleAdClick = (ad: any) => {
    onAdClick(ad.id)
    if (ad.link_url) {
      window.open(ad.link_url, '_blank')
    }
  }

  const handleHideAd = (adId: number) => {
    setHiddenAds(prev => new Set([...prev, adId]))
  }

  const visibleAds = ads.filter(ad => !hiddenAds.has(ad.id))

  if (visibleAds.length === 0) return null

  const sideClasses = {
    left: 'fixed left-4 top-1/2 transform -translate-y-1/2 z-20',
    right: 'fixed right-4 top-1/2 transform -translate-y-1/2 z-20'
  }

  return (
    <div className={`${sideClasses[position]} hidden lg:block`}>
      <div className="space-y-6 max-w-sm w-80">
        {visibleAds.slice(0, 2).map((ad) => (
          <Card 
            key={ad.id}
            className="bg-gradient-to-br from-gray-900/95 to-gray-800/95 border border-gray-600/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] backdrop-blur-sm"
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <h4 className="text-white font-semibold text-sm">{ad.title}</h4>
              <Button
                isIconOnly
                size="sm"
                variant="light"
                onPress={() => handleHideAd(ad.id)}
                className="text-gray-400 hover:text-white min-w-6 w-6 h-6"
              >
                <X size={12} />
              </Button>
            </CardHeader>

            <CardBody className="pt-0">
              <div 
                className="cursor-pointer group"
                onClick={() => handleAdClick(ad)}
              >
                {ad.image_url && (
                  <Image
                    src={ad.image_url}
                    alt={ad.title}
                    className="w-full h-32 object-cover rounded mb-4 group-hover:opacity-80 transition-opacity"
                    fallbackSrc="/placeholder.jpg"
                  />
                )}
                
                {ad.description && (
                  <p className="text-gray-300 text-xs mb-3 line-clamp-3">
                    {ad.description}
                  </p>
                )}

                <Button
                  size="sm"
                  color="primary"
                  variant="shadow"
                  endContent={<ExternalLink size={12} />}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-xs"
                >
                  Découvrir
                </Button>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  )
}
