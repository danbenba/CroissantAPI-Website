"use client"

import React from 'react'
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Card,
  CardBody,
  Chip
} from "@heroui/react"
import { useAuth } from "@/hooks/use-auth"

interface BanPopupProps {
  isOpen: boolean
  banInfo: {
    reason: string
    bannedUntil?: string
    banDuration?: string
  }
}

export default function BanPopup({ isOpen, banInfo }: BanPopupProps) {
  const { logout } = useAuth()
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const handleAppeal = () => {
    window.open('https://google.com', '_blank')
  }

  const handleLogout = async () => {
    await logout()
  }

  return (
    <Modal 
      isOpen={isOpen} 
      hideCloseButton
      isDismissable={false}
      backdrop="blur"
      size="lg"
      scrollBehavior="inside"
      className="flex items-center justify-center"
      classNames={{
        wrapper: "flex items-center justify-center",
        base: "mx-4"
      }}
    >
      <ModalContent className="bg-gradient-to-br from-red-900/95 via-red-800/95 to-red-900/95 backdrop-blur-xl border border-red-500/50 shadow-2xl max-h-[90vh]">
        <ModalHeader className="flex flex-col gap-1 text-center pb-2">
          <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-red-700 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg animate-pulse">
            <i className="fas fa-ban text-4xl text-white"></i>
          </div>
          <h2 className="text-2xl font-bold text-white">Compte Suspendu</h2>
          <Chip 
            color="danger" 
            variant="shadow" 
            size="lg"
            className="bg-gradient-to-r from-red-600 to-red-700"
          >
            Accès Interdit
          </Chip>
        </ModalHeader>
        
        <ModalBody className="py-6">
          <Card className="bg-black/30 border border-red-500/30">
            <CardBody className="p-4">
              <div className="space-y-4">
                {/* Raison du bannissement */}
                <div>
                  <h3 className="text-lg font-semibold text-red-300 mb-2 flex items-center">
                    <i className="fas fa-exclamation-circle mr-2"></i>
                    Raison du bannissement
                  </h3>
                  <p className="text-white bg-red-950/50 p-3 rounded-lg border border-red-600/30">
                    {banInfo.reason || 'Aucune raison spécifiée'}
                  </p>
                </div>

                {/* Durée du bannissement */}
                {banInfo.bannedUntil && (
                  <div>
                    <h3 className="text-lg font-semibold text-red-300 mb-2 flex items-center">
                      <i className="fas fa-clock mr-2"></i>
                      Durée du bannissement
                    </h3>
                    <div className="bg-red-950/50 p-3 rounded-lg border border-red-600/30">
                      <p className="text-white">
                        <span className="font-medium">Jusqu'au :</span> {formatDate(banInfo.bannedUntil)}
                      </p>
                      {banInfo.banDuration && (
                        <p className="text-red-200 text-sm mt-1">
                          <span className="font-medium">Durée :</span> {banInfo.banDuration}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Informations */}
                <div className="bg-red-950/30 border border-red-600/30 rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <i className="fas fa-info-circle text-red-400 mr-2"></i>
                    <span className="text-red-300 font-medium">Information importante</span>
                  </div>
                  <p className="text-red-100 text-sm">
                    Votre compte a été suspendu en raison de la violation de nos conditions d'utilisation. 
                    Si vous pensez que cette décision est injuste, vous pouvez faire appel.
                  </p>
                </div>
              </div>
            </CardBody>
          </Card>
        </ModalBody>

        <ModalFooter className="flex flex-col gap-3 pt-4">
          <Button
            color="warning"
            variant="shadow"
            size="lg"
            className="w-full bg-gradient-to-r from-orange-500 to-yellow-600 font-semibold"
            startContent={<i className="fas fa-gavel"></i>}
            onPress={handleAppeal}
          >
            Faire une demande de débannissement
          </Button>
          
          <div className="text-center">
            <p className="text-red-200 text-sm">
              Cette fenêtre ne peut pas être fermée. Vous devez faire appel ou attendre la fin du bannissement ou{' '}
              <button
                onClick={handleLogout}
                className="text-blue-300 hover:text-blue-200 underline font-medium transition-colors"
              >
                te déconnecter
              </button>
              .
            </p>
          </div>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
