"use client"

import { useState, useEffect, useCallback, useRef } from 'react'
import { Card, CardBody, Button, Input, Textarea, Select, SelectItem, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure, Chip, Avatar, Spinner, Divider, Switch } from "@heroui/react"
import { PlusIcon, PencilIcon, TrashIcon, PhotoIcon, VideoCameraIcon, StarIcon } from "@heroicons/react/24/outline"

interface GameMedia {
  id: number
  type: 'image' | 'video'
  url: string
  title?: string
  description?: string
  position: number
  is_primary: boolean
  is_sidebar_image: boolean
  created_at: string
}

interface GameMediaFormData {
  type: 'image' | 'video'
  url: string
  title: string
  description: string
  position: number
  is_primary: boolean
  is_sidebar_image: boolean
}

interface GameMediaManagerProps {
  gameId: number
  gameTitle: string
}

export default function GameMediaManager({ gameId, gameTitle }: GameMediaManagerProps) {
  const [media, setMedia] = useState<GameMedia[]>([])
  const [loading, setLoading] = useState(false)
  const [editingMedia, setEditingMedia] = useState<GameMedia | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState<GameMediaFormData>({
    type: 'image',
    url: '',
    title: '',
    description: '',
    position: 0,
    is_primary: false,
    is_sidebar_image: false
  })

  // Utiliser useRef pour éviter les requêtes multiples
  const fetchingRef = useRef(false)
  const mountedRef = useRef(true)

  const { isOpen: isModalOpen, onOpen: onModalOpen, onClose: onModalClose } = useDisclosure()

  // Fonction memoized pour fetchMedia
  const fetchMedia = useCallback(async () => {
    // Éviter les requêtes multiples
    if (fetchingRef.current || !mountedRef.current) return
    
    try {
      fetchingRef.current = true
      setLoading(true)
      
      console.log('🔍 Récupération des médias pour le jeu:', gameId)
      
      const response = await fetch(`/api/games/${gameId}/media`)
      if (response.ok) {
        const data = await response.json()
        if (data.success && mountedRef.current) {
          setMedia(data.media || [])
          console.log('✅ Médias récupérés:', data.media?.length || 0)
        }
      } else {
        console.error('❌ Erreur HTTP:', response.status)
      }
    } catch (error) {
      console.error('❌ Erreur lors du chargement des médias:', error)
    } finally {
      if (mountedRef.current) {
        setLoading(false)
      }
      fetchingRef.current = false
    }
  }, [gameId])

  // Effet pour le chargement initial uniquement
  useEffect(() => {
    mountedRef.current = true
    
    // Chargement initial avec délai pour éviter les conflits
    const timeoutId = setTimeout(() => {
      if (mountedRef.current) {
        fetchMedia()
      }
    }, 100)

    return () => {
      mountedRef.current = false
      clearTimeout(timeoutId)
    }
  }, [gameId, fetchMedia])

  const handleSubmit = async () => {
    if (submitting) return
    
    try {
      setSubmitting(true)
      
      const url = editingMedia 
        ? `/api/games/${gameId}/media/${editingMedia.id}`
        : `/api/games/${gameId}/media`
      
      const method = editingMedia ? 'PUT' : 'POST'
      
      console.log(`📤 ${method} média:`, formData)
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          console.log('✅ Média sauvegardé avec succès')
          
          // Fermer le modal immédiatement
          onModalClose()
          resetForm()
          
          // Attendre un peu avant de recharger pour éviter les conflits
          setTimeout(() => {
            if (mountedRef.current) {
              fetchMedia()
            }
          }, 200)
        }
      } else {
        console.error('❌ Erreur lors de la sauvegarde:', response.status)
      }
    } catch (error) {
      console.error('❌ Erreur lors de la sauvegarde:', error)
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (mediaItem: GameMedia) => {
    console.log('✏️ Édition du média:', mediaItem.id)
    
    setEditingMedia(mediaItem)
    setFormData({
      type: mediaItem.type,
      url: mediaItem.url,
      title: mediaItem.title || '',
      description: mediaItem.description || '',
      position: mediaItem.position,
      is_primary: mediaItem.is_primary,
      is_sidebar_image: mediaItem.is_sidebar_image
    })
    
    // Délai pour éviter les conflits
    setTimeout(() => {
      onModalOpen()
    }, 50)
  }

  const handleDelete = async (mediaId: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce média ?')) return

    try {
      console.log('🗑️ Suppression du média:', mediaId)
      
      const response = await fetch(`/api/games/${gameId}/media/${mediaId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          console.log('✅ Média supprimé avec succès')
          
          // Attendre un peu avant de recharger
          setTimeout(() => {
            if (mountedRef.current) {
              fetchMedia()
            }
          }, 200)
        }
      }
    } catch (error) {
      console.error('❌ Erreur lors de la suppression:', error)
    }
  }

  const resetForm = () => {
    setFormData({
      type: 'image',
      url: '',
      title: '',
      description: '',
      position: 0,
      is_primary: false,
      is_sidebar_image: false
    })
    setEditingMedia(null)
  }

  const openModal = () => {
    console.log('🚀 Ouverture du modal d\'ajout')
    resetForm()
    
    // Délai pour éviter les conflits
    setTimeout(() => {
      onModalOpen()
    }, 50)
  }

  const closeModal = () => {
    console.log('❌ Fermeture du modal')
    resetForm()
    onModalClose()
  }

  // Fonction optimisée pour le changement de média principal
  const handlePrimaryChange = async (mediaId: number, isPrimary: boolean) => {
    try {
      console.log('⭐ Changement de média principal:', mediaId, isPrimary)
      
      const mediaItem = media.find(m => m.id === mediaId)
      if (!mediaItem) return

      // Mise à jour optimiste de l'état local d'abord
      setMedia(prevMedia => 
        prevMedia.map(m => ({
          ...m,
          is_primary: m.id === mediaId ? isPrimary : (isPrimary ? false : m.is_primary)
        }))
      )

      const response = await fetch(`/api/games/${gameId}/media/${mediaId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...mediaItem,
          is_primary: isPrimary
        }),
      })

      if (response.ok) {
        console.log('✅ Média principal mis à jour')
        // Pas besoin de refetch immédiatement car on a fait une mise à jour optimiste
      } else {
        console.error('❌ Erreur lors de la mise à jour')
        // En cas d'erreur, recharger les données
        setTimeout(() => {
          if (mountedRef.current) {
            fetchMedia()
          }
        }, 500)
      }
    } catch (error) {
      console.error('❌ Erreur lors de la mise à jour:', error)
      // En cas d'erreur, recharger les données
      setTimeout(() => {
        if (mountedRef.current) {
          fetchMedia()
        }
      }, 500)
    }
  }

  // Fonction optimisée pour le changement d'image de sidebar
  const handleSidebarImageChange = async (mediaId: number, isSidebarImage: boolean) => {
    try {
      console.log('🔲 Changement d\'image de sidebar:', mediaId, isSidebarImage)
      
      const mediaItem = media.find(m => m.id === mediaId)
      if (!mediaItem) return

      // Mise à jour optimiste de l'état local d'abord
      setMedia(prevMedia => 
        prevMedia.map(m => ({
          ...m,
          is_sidebar_image: m.id === mediaId ? isSidebarImage : (isSidebarImage ? false : m.is_sidebar_image)
        }))
      )

      const response = await fetch(`/api/games/${gameId}/media/${mediaId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...mediaItem,
          is_sidebar_image: isSidebarImage
        }),
      })

      if (response.ok) {
        console.log('✅ Image de sidebar mise à jour')
        // Pas besoin de refetch immédiatement car on a fait une mise à jour optimiste
      } else {
        console.error('❌ Erreur lors de la mise à jour')
        // En cas d'erreur, recharger les données
        setTimeout(() => {
          if (mountedRef.current) {
            fetchMedia()
          }
        }, 500)
      }
    } catch (error) {
      console.error('❌ Erreur lors de la mise à jour:', error)
      // En cas d'erreur, recharger les données
      setTimeout(() => {
        if (mountedRef.current) {
          fetchMedia()
        }
      }, 500)
    }
  }

  if (loading && media.length === 0) {
    return (
      <div className="flex justify-center py-8">
        <Spinner size="lg" color="primary" />
      </div>
    )
  }

  return (
    <Card className="bg-gray-800/50 backdrop-blur-lg border border-white/10">
      <CardBody className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-white">Médias du jeu</h3>
          <Button
            color="primary"
            variant="shadow"
            startContent={<PlusIcon className="w-4 h-4" />}
            onPress={openModal}
            isDisabled={submitting}
          >
            Ajouter un média
          </Button>
        </div>
        
        {media.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <PhotoIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p>Aucun média ajouté pour ce jeu</p>
            <p className="text-sm">Ajoutez des images ou vidéos pour enrichir la présentation</p>
          </div>
        ) : (
          <div className="space-y-4">
            {media.map((mediaItem) => (
              <Card key={mediaItem.id} className="bg-gray-700/30 border border-white/10">
                <CardBody className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="flex-shrink-0">
                      {mediaItem.type === 'image' ? (
                        <Avatar
                          src={mediaItem.url}
                          className="w-16 h-16 border-2 border-white/20"
                          fallback={<PhotoIcon className="w-8 h-8" />}
                        />
                      ) : (
                        <div className="w-16 h-16 bg-gray-600 rounded-full flex items-center justify-center border-2 border-white/20">
                          <VideoCameraIcon className="w-8 h-8 text-white" />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <Chip
                          color={mediaItem.type === 'image' ? 'primary' : 'secondary'}
                          variant="flat"
                          size="sm"
                        >
                          {mediaItem.type === 'image' ? 'Image' : 'Vidéo'}
                        </Chip>
                        {mediaItem.is_primary && (
                          <Chip color="warning" variant="flat" size="sm">
                            Principal
                          </Chip>
                        )}
                        <Chip color="default" variant="bordered" size="sm">
                          Pos. {mediaItem.position}
                        </Chip>
                      </div>
                      
                      {mediaItem.title && (
                        <h4 className="font-semibold text-white mb-1">{mediaItem.title}</h4>
                      )}
                      
                      {mediaItem.description && (
                        <p className="text-gray-300 text-sm mb-2">{mediaItem.description}</p>
                      )}
                      
                      <p className="text-gray-400 text-xs break-all">{mediaItem.url}</p>
                    </div>
                    
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                          <Switch
                            isSelected={Boolean(mediaItem.is_primary)}
                            onValueChange={(value) => handlePrimaryChange(mediaItem.id, value)}
                            color="warning"
                            size="sm"
                            isDisabled={submitting}
                          />
                          <span className="text-xs text-gray-400">Principal</span>
                        </div>
                        {mediaItem.type === 'image' && (
                          <div className="flex items-center gap-2">
                            <Switch
                              isSelected={Boolean(mediaItem.is_sidebar_image)}
                              onValueChange={(value) => handleSidebarImageChange(mediaItem.id, value)}
                              color="secondary"
                              size="sm"
                              isDisabled={submitting}
                            />
                            <span className="text-xs text-gray-400">Sidebar</span>
                          </div>
                        )}
                      </div>
                      
                      <Button
                        isIconOnly
                        size="sm"
                        variant="light"
                        color="primary"
                        onPress={() => handleEdit(mediaItem)}
                        isDisabled={submitting}
                      >
                        <PencilIcon className="w-4 h-4" />
                      </Button>
                      
                      <Button
                        isIconOnly
                        size="sm"
                        variant="light"
                        color="danger"
                        onPress={() => handleDelete(mediaItem.id)}
                        isDisabled={submitting}
                      >
                        <TrashIcon className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        )}
      </CardBody>

      {/* Modal pour ajouter/éditer un média */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={closeModal}
        size="2xl" 
        backdrop="blur"
        isDismissable={!submitting}
        isKeyboardDismissDisabled={submitting}
        hideCloseButton={submitting}
      >
        <ModalContent className="modal-modern">
          <ModalHeader className="text-white">
            {editingMedia ? 'Modifier le média' : 'Ajouter un média'}
          </ModalHeader>
          <ModalBody>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Select
                  label="Type de média"
                  selectedKeys={[formData.type]}
                  onSelectionChange={(keys) => {
                    const selectedKey = Array.from(keys)[0] as 'image' | 'video'
                    if (selectedKey) {
                      setFormData({ ...formData, type: selectedKey })
                    }
                  }}
                  className="text-white"
                  isDisabled={submitting}
                >
                  <SelectItem key="image">Image</SelectItem>
                  <SelectItem key="video">Vidéo</SelectItem>
                </Select>
                
                <Input
                  label="Position"
                  type="number"
                  value={formData.position.toString()}
                  onChange={(e) => setFormData({ ...formData, position: parseInt(e.target.value) || 0 })}
                  min="0"
                  className="text-white"
                  isDisabled={submitting}
                />
              </div>
              
              <Input
                label="URL du média"
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                placeholder="https://exemple.com/image.jpg"
                required
                className="text-white"
                isDisabled={submitting}
              />
              
              <Input
                label="Titre (optionnel)"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Titre descriptif du média"
                className="text-white"
                isDisabled={submitting}
              />
              
              <Textarea
                label="Description (optionnel)"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Description détaillée du média"
                className="text-white"
                isDisabled={submitting}
              />
              
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <Switch
                    isSelected={formData.is_primary}
                    onValueChange={(value) => setFormData({ ...formData, is_primary: value })}
                    color="warning"
                    isDisabled={submitting}
                  />
                  <span className="text-white">Définir comme média principal</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Switch
                    isSelected={formData.is_sidebar_image}
                    onValueChange={(value) => setFormData({ ...formData, is_sidebar_image: value })}
                    color="secondary"
                    isDisabled={submitting || formData.type !== 'image'}
                  />
                  <span className="text-white">Utiliser dans la sidebar de la page d'accueil</span>
                </div>
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button 
              variant="light" 
              onPress={closeModal} 
              className="text-white"
              isDisabled={submitting}
            >
              Annuler
            </Button>
            <Button 
              color="primary" 
              onPress={handleSubmit} 
              className="bg-blue-600"
              isLoading={submitting}
              isDisabled={!formData.url.trim()}
            >
              {editingMedia ? 'Modifier' : 'Ajouter'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Card>
  )
}