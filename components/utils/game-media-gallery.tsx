// Composant adapté de Koalyx pour Croissant

import { useState, useEffect } from 'react'
import { Card, CardBody, Button, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure } from "@heroui/react"
// Icônes SVG inline pour éviter la dépendance @heroicons/react

interface GameMedia {
  id: number
  type: 'image' | 'video'
  url: string
  title?: string
  description?: string
  position: number
  is_primary: boolean
  created_at: string
}

interface GameMediaGalleryProps {
  gameId: number
  gameTitle: string
  includeBanner?: boolean
  bannerUrl?: string
  trailerUrl?: string
  primaryMediaId?: number
}

export default function GameMediaGallery({ gameId, gameTitle, includeBanner = false, bannerUrl, trailerUrl, primaryMediaId }: GameMediaGalleryProps) {
  const [media, setMedia] = useState<GameMedia[]>([])
  const [displayMedia, setDisplayMedia] = useState<(GameMedia | { id: 'banner' | 'trailer', type: 'image' | 'video', url: string, title: string, description: string, position: number, is_primary: boolean, created_at: string })[]>([])
  const [loading, setLoading] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const { isOpen: isModalOpen, onOpen: onModalOpen, onOpenChange: onModalOpenChange } = useDisclosure()

  useEffect(() => {
    fetchMedia()
  }, [gameId])

  useEffect(() => {
    // Créer une liste de médias qui inclut le trailer en priorité, puis la bannière, puis les autres médias
    const newDisplayMedia: (GameMedia | { id: 'banner' | 'trailer', type: 'image' | 'video', url: string, title: string, description: string, position: number, is_primary: boolean, created_at: string })[] = []
    
    // Ajouter le trailer en premier si il existe
    if (trailerUrl) {
      newDisplayMedia.push({
        id: 'trailer' as any,
        type: 'video',
        url: trailerUrl,
        title: 'Trailer du jeu',
        description: 'Bande-annonce officielle',
        position: 0,
        is_primary: true,
        created_at: new Date().toISOString()
      })
    }
    
    // Ajouter la bannière si demandé et si elle existe (et si pas de trailer)
    if (includeBanner && bannerUrl && !trailerUrl) {
      newDisplayMedia.push({
        id: 'banner' as any,
        type: 'image',
        url: bannerUrl,
        title: 'Bannière du jeu',
        description: 'Image principale du jeu',
        position: trailerUrl ? 1 : 0,
        is_primary: !trailerUrl,
        created_at: new Date().toISOString()
      })
    }
    
    // Ajouter tous les médias non-principaux
    const secondaryMedia = media.filter(m => !m.is_primary)
    newDisplayMedia.push(...secondaryMedia)
    
    setDisplayMedia(newDisplayMedia)
  }, [media, includeBanner, bannerUrl, trailerUrl])

  const fetchMedia = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/games/${gameId}/media`)
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setMedia(data.media)
        }
      }
    } catch (error) {
      console.error('Erreur lors du chargement des médias:', error)
    } finally {
      setLoading(false)
    }
  }

  const openModal = (index: number) => {
    setCurrentIndex(index)
    onModalOpen()
  }

  const nextMedia = () => {
    setCurrentIndex((prev) => (prev + 1) % displayMedia.length)
  }

  const prevMedia = () => {
    setCurrentIndex((prev) => (prev - 1 + displayMedia.length) % displayMedia.length)
  }

  if (loading) {
    return <div className="text-center py-8">Chargement des médias...</div>
  }

  if (displayMedia.length === 0) {
    return null
  }

  const currentMedia = displayMedia[currentIndex]
  const hasMultipleMedia = displayMedia.length > 1

  return (
    <>
      <Card className="bg-gray-800/50 backdrop-blur-lg border border-white/10">
        <CardBody className="p-6">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
            <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Galerie du jeu
          </h2>
          
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
             {displayMedia.map((mediaItem, index) => (
               <div
                 key={mediaItem.id}
                 className="relative group cursor-pointer overflow-hidden rounded-lg border border-white/20 hover:border-white/40 transition-all duration-300"
                 onClick={() => openModal(index)}
               >
                 {mediaItem.type === 'image' ? (
                   <img
                     src={mediaItem.url}
                     alt={mediaItem.title || `Image ${index + 1}`}
                     className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                   />
                 ) : (
                   <div className="w-full h-48 bg-gray-700 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                     <div className="text-center">
                       <svg className="w-16 h-16 text-white mx-auto mb-2" fill="currentColor" viewBox="0 0 24 24">
                         <path d="M8 5v14l11-7z"/>
                       </svg>
                       <p className="text-white text-sm">Vidéo</p>
                     </div>
                   </div>
                 )}
                 
                 <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                   <div className="absolute bottom-0 left-0 right-0 p-4">
                     {mediaItem.title && (
                       <h3 className="text-white font-semibold text-sm mb-1">{mediaItem.title}</h3>
                     )}
                     {mediaItem.description && (
                       <p className="text-gray-200 text-xs">{mediaItem.description}</p>
                     )}
                   </div>
                 </div>
                 
                 {/* Badge spécial pour le trailer */}
                 {mediaItem.id === 'trailer' && (
                   <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full font-semibold">
                     Trailer
                   </div>
                 )}
                 
                 {/* Badge spécial pour la bannière */}
                 {mediaItem.id === 'banner' && (
                   <div className="absolute top-2 right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full font-semibold">
                     Bannière
                   </div>
                 )}
                 
                 {/* Badge pour les autres médias */}
                 {mediaItem.id !== 'trailer' && mediaItem.id !== 'banner' && (
                   <div className="absolute top-2 right-2 bg-amber-500 text-white text-xs px-2 py-1 rounded-full font-semibold">
                     Autres images
                   </div>
                 )}
               </div>
             ))}
           </div>
        </CardBody>
      </Card>

      {/* Modal pour afficher le média en plein écran */}
      <Modal isOpen={isModalOpen} onOpenChange={onModalOpenChange} size="5xl" backdrop="blur">
        <ModalContent className="bg-black/95 border border-white/20">
          {(onClose) => (
            <>
              <ModalHeader className="flex justify-between items-center">
                <h3 className="text-white">
                  {currentMedia?.title || `Média ${currentIndex + 1}`}
                </h3>
                <div className="flex items-center gap-2">
                  {hasMultipleMedia && (
                    <>
                      <Button
                        isIconOnly
                        size="sm"
                        variant="light"
                        onPress={prevMedia}
                        className="text-white"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                      </Button>
                                           <span className="text-white text-sm">
                       {currentIndex + 1} / {displayMedia.length}
                     </span>
                      <Button
                        isIconOnly
                        size="sm"
                        variant="light"
                        onPress={nextMedia}
                        className="text-white"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </Button>
                    </>
                  )}
                </div>
              </ModalHeader>
              <ModalBody className="p-0">
                <div className="relative">
                  {currentMedia?.type === 'image' ? (
                    <img
                      src={currentMedia.url}
                      alt={currentMedia.title || `Image ${currentIndex + 1}`}
                      className="w-full h-auto max-h-[80vh] object-contain"
                    />
                  ) : (
                    <video
                      src={currentMedia?.url}
                      controls
                      className="w-full h-auto max-h-[80vh]"
                      autoPlay
                    >
                      Votre navigateur ne supporte pas la lecture de vidéos.
                    </video>
                  )}
                </div>
                
                {currentMedia?.description && (
                  <div className="p-6 bg-gray-900/50">
                    <p className="text-gray-300">{currentMedia.description}</p>
                  </div>
                )}
              </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={onClose} className="text-white">
                  Fermer
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  )
}
