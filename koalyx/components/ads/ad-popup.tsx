"use client"

import { useState, useEffect } from 'react'
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Image } from '@heroui/react'
import { X } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'

interface AdPopupProps {
  ad: {
    id: number
    title: string
    description?: string
    image_url?: string
    link_url?: string
  }
  isOpen: boolean
  onClose: () => void
  onAdClick: (adId: number) => void
}

export default function AdPopup({ ad, isOpen, onClose, onAdClick }: AdPopupProps) {
  const { t } = useLanguage()
  const [countdown, setCountdown] = useState(5)

  useEffect(() => {
    if (isOpen && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1)
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [isOpen, countdown])

  const handleAdClick = () => {
    onAdClick(ad.id)
    if (ad.link_url) {
      window.open(ad.link_url, '_blank')
    }
    onClose()
  }

  const canClose = countdown <= 0

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={canClose ? onClose : undefined}
      size="2xl"
      isDismissable={canClose}
      hideCloseButton={!canClose}
      classNames={{
        base: "bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700",
        header: "border-b border-gray-700",
        body: "py-6",
        footer: "border-t border-gray-700"
      }}
    >
      <ModalContent className="modal-modern">
        <ModalHeader className="flex flex-col gap-1">
          <div className="flex justify-between items-center w-full">
            <h3 className="text-xl font-bold text-white">{ad.title}</h3>
            {canClose && (
              <Button
                isIconOnly
                variant="light"
                onPress={onClose}
                className="text-gray-400 hover:text-white"
              >
                <X size={20} />
              </Button>
            )}
          </div>
          {!canClose && (
            <p className="text-sm text-orange-400">
{t('popups.ad.closingIn', { count: countdown })}
            </p>
          )}
        </ModalHeader>

        <ModalBody>
          <div 
            className="cursor-pointer rounded-lg overflow-hidden hover:scale-105 transition-transform duration-300"
            onClick={handleAdClick}
          >
            {ad.image_url && (
              <Image
                src={ad.image_url}
                alt={ad.title}
                className="w-full h-48 object-cover mb-4"
                fallbackSrc="/placeholder.jpg"
              />
            )}
            
            {ad.description && (
              <p className="text-gray-300 text-center text-lg leading-relaxed">
                {ad.description}
              </p>
            )}
          </div>
        </ModalBody>

        <ModalFooter className="flex justify-between">
          <Button
            color="primary"
            variant="shadow"
            onPress={handleAdClick}
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
          >
{t('popups.ad.viewOffer')}
          </Button>
          
          {canClose && (
            <Button
              variant="light"
              onPress={onClose}
              className="text-gray-400 hover:text-white"
            >
{t('popups.ad.close')}
            </Button>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
