"use client"

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/use-auth'
import Navigation from '@/components/navigation'
import {
  Card,
  CardHeader,
  CardBody,
  Button,
  Spinner,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  Avatar,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Tooltip,
  Badge
} from "@heroui/react"
import { secureGet, securePatch } from '@/lib/api-client'

interface UpdateRequest {
  game_id: number
  game_title: string
  banner_url: string
  request_count: number
  first_request: string
  last_request: string
  user_names: string
  request_dates: string
  priority: 'urgent' | 'medium' | 'low'
}

export default function UpdateRequestsPage() {
  const { user } = useAuth()
  const [requests, setRequests] = useState<UpdateRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [processingRequest, setProcessingRequest] = useState<number | null>(null)
  const [selectedRequest, setSelectedRequest] = useState<UpdateRequest | null>(null)
  
  const { isOpen: isDetailModalOpen, onOpen: onDetailModalOpen, onOpenChange: onDetailModalOpenChange, onClose: onDetailModalClose } = useDisclosure()
  const { isOpen: isResolveModalOpen, onOpen: onResolveModalOpen, onOpenChange: onResolveModalOpenChange, onClose: onResolveModalClose } = useDisclosure()
  const { isOpen: isDismissModalOpen, onOpen: onDismissModalOpen, onOpenChange: onDismissModalOpenChange, onClose: onDismissModalClose } = useDisclosure()

  // Redirection si non admin
  useEffect(() => {
    if (user && user.role !== 'admin') {
      window.location.href = '/admin'
    }
  }, [user])

  // Charger les demandes
  useEffect(() => {
    if (user?.role === 'admin') {
      loadRequests()
    }
  }, [user])

  const loadRequests = async () => {
    try {
      setLoading(true)
      const response = await secureGet('/api/games/update-requests')
      const data = await response.json()
      
      if (data.success) {
        setRequests(data.requests)
      }
    } catch (error) {
      console.error('Erreur lors du chargement des demandes:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAction = async (gameId: number, action: 'resolve' | 'dismiss') => {
    setProcessingRequest(gameId)
    try {
      const response = await securePatch(`/api/admin/games/update-requests/${gameId}/resolve`, { action })

      const data = await response.json()
      
      if (data.success) {
        // Retirer la demande de la liste
        setRequests(prev => prev.filter(req => req.game_id !== gameId))
        // Fermer toutes les modales
        onResolveModalClose()
        onDismissModalClose()
        onDetailModalClose()
        setSelectedRequest(null)
      } else {
        alert(data.message || 'Erreur lors du traitement')
      }
    } catch (error) {
      console.error('Erreur lors du traitement:', error)
      alert('Erreur lors du traitement de la demande')
    } finally {
      setProcessingRequest(null)
    }
  }

  const openDetailModal = (request: UpdateRequest) => {
    setSelectedRequest(request)
    onDetailModalOpen()
  }

  const openResolveModal = (request: UpdateRequest) => {
    setSelectedRequest(request)
    onResolveModalOpen()
  }

  const openDismissModal = (request: UpdateRequest) => {
    setSelectedRequest(request)
    onDismissModalOpen()
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'danger'
      case 'medium': return 'warning'
      case 'low': return 'success'
      default: return 'default'
    }
  }

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'Urgent (5+ demandes)'
      case 'medium': return 'Moyen (3-4 demandes)'
      case 'low': return 'Faible (1-2 demandes)'
      default: return 'Inconnu'
    }
  }

  const parseUserData = (userNames: string, requestDates: string) => {
    const names = userNames.split('|')
    const dates = requestDates.split('|')
    
    return names.map((name, index) => ({
      name,
      date: dates[index] || ''
    }))
  }

  if (!user || user.role !== 'admin') {
    return <div>Accès refusé</div>
  }

  return (
    <div className="min-h-screen bg-background text-foreground font-sans relative">
      {/* Background avec effet de voile violet */}
      <div className="fixed inset-0 bg-gradient-to-br from-purple-900/20 via-black/50 to-blue-900/20 pointer-events-none" />
      
      <Navigation />
      
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-block mb-4">
            <Chip
              size="lg"
              variant="shadow"
              classNames={{
                base: "bg-gradient-to-r from-yellow-500 to-orange-600 border-small border-white/20 shadow-lg",
                content: "text-white font-semibold text-sm px-2"
              }}
              startContent={<i className="fas fa-sync-alt"></i>}
            >
              Administration
            </Chip>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white via-purple-200 to-white bg-clip-text text-transparent">
            Demandes de Mise à Jour
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Gérez les demandes de mise à jour des jeux soumises par les utilisateurs
          </p>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gray-800/50 backdrop-blur-lg border border-white/10">
            <CardBody className="p-6 text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <i className="fas fa-list text-white text-xl"></i>
              </div>
              <p className="text-3xl font-bold text-white mb-2">{requests.length}</p>
              <p className="text-gray-400">Total demandes</p>
            </CardBody>
          </Card>
          
          <Card className="bg-gray-800/50 backdrop-blur-lg border border-white/10">
            <CardBody className="p-6 text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <i className="fas fa-exclamation-triangle text-white text-xl"></i>
              </div>
              <p className="text-3xl font-bold text-white mb-2">{requests.filter(r => r.priority === 'urgent').length}</p>
              <p className="text-gray-400">Urgentes</p>
            </CardBody>
          </Card>
          
          <Card className="bg-gray-800/50 backdrop-blur-lg border border-white/10">
            <CardBody className="p-6 text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <i className="fas fa-clock text-white text-xl"></i>
              </div>
              <p className="text-3xl font-bold text-white mb-2">{requests.filter(r => r.priority === 'medium').length}</p>
              <p className="text-gray-400">Moyennes</p>
            </CardBody>
          </Card>
          
          <Card className="bg-gray-800/50 backdrop-blur-lg border border-white/10">
            <CardBody className="p-6 text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <i className="fas fa-check-circle text-white text-xl"></i>
              </div>
              <p className="text-3xl font-bold text-white mb-2">{requests.filter(r => r.priority === 'low').length}</p>
              <p className="text-gray-400">Faibles</p>
            </CardBody>
          </Card>
        </div>

        {/* Bouton de rechargement */}
        <div className="mb-6">
          <Button
            color="primary"
            variant="shadow"
            onPress={loadRequests}
            isLoading={loading}
            startContent={<i className="fas fa-sync-alt"></i>}
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
          >
            Actualiser
          </Button>
        </div>

        {/* Table des demandes */}
        <Card className="bg-gray-800/50 backdrop-blur-lg border border-white/10">
          <CardHeader>
            <h3 className="text-xl font-semibold text-white">Demandes en attente</h3>
          </CardHeader>
          <CardBody>
            {loading ? (
              <div className="flex justify-center py-8">
                <Spinner size="lg" color="primary" />
              </div>
            ) : requests.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-gradient-to-br from-gray-700 to-gray-900 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <i className="fas fa-inbox text-3xl text-gray-400"></i>
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Aucune demande</h3>
                <p className="text-gray-400">Toutes les demandes ont été traitées</p>
              </div>
            ) : (
              <Table 
                aria-label="Demandes de mise à jour"
                classNames={{
                  wrapper: "bg-transparent",
                  th: "bg-gray-700/50 text-white",
                  td: "text-gray-300"
                }}
              >
                <TableHeader>
                  <TableColumn>JEU</TableColumn>
                  <TableColumn>PRIORITÉ</TableColumn>
                  <TableColumn>DEMANDES</TableColumn>
                  <TableColumn>PREMIÈRE DEMANDE</TableColumn>
                  <TableColumn>DERNIÈRE DEMANDE</TableColumn>
                  <TableColumn>ACTIONS</TableColumn>
                </TableHeader>
                <TableBody>
                  {requests.map((request) => (
                    <TableRow key={request.game_id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar
                            src={request.banner_url || '/placeholder-game.png'}
                            className="w-12 h-12"
                            isBordered
                          />
                          <div>
                            <p className="font-semibold text-white">{request.game_title}</p>
                            <p className="text-sm text-gray-400">ID: {request.game_id}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          color={getPriorityColor(request.priority) as any}
                          variant="shadow"
                          size="sm"
                        >
                          {getPriorityLabel(request.priority)}
                        </Chip>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          color="primary" 
                          content={request.request_count}
                          shape="circle"
                        >
                          <Button
                            size="sm"
                            variant="flat"
                            color="primary"
                            onPress={() => openDetailModal(request)}
                          >
                            Voir détails
                          </Button>
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm">
                          {new Date(request.first_request).toLocaleDateString('fr-FR')}
                        </p>
                        <p className="text-xs text-gray-400">
                          {new Date(request.first_request).toLocaleTimeString('fr-FR')}
                        </p>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm">
                          {new Date(request.last_request).toLocaleDateString('fr-FR')}
                        </p>
                        <p className="text-xs text-gray-400">
                          {new Date(request.last_request).toLocaleTimeString('fr-FR')}
                        </p>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Tooltip content="Marquer comme mis à jour">
                            <Button
                              size="sm"
                              color="success"
                              variant="shadow"
                              isIconOnly
                              onPress={() => openResolveModal(request)}
                              isLoading={processingRequest === request.game_id}
                            >
                              <i className="fas fa-check"></i>
                            </Button>
                          </Tooltip>
                          <Tooltip content="Rejeter les demandes">
                            <Button
                              size="sm"
                              color="danger"
                              variant="shadow"
                              isIconOnly
                              onPress={() => openDismissModal(request)}
                              isLoading={processingRequest === request.game_id}
                            >
                              <i className="fas fa-times"></i>
                            </Button>
                          </Tooltip>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardBody>
        </Card>
      </main>

      {/* Modale de détails */}
      <Modal isOpen={isDetailModalOpen} onOpenChange={onDetailModalOpenChange} size="2xl" backdrop="blur">
        <ModalContent className="bg-black/95 backdrop-blur-xl border border-white/20 shadow-2xl">
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-2">
                <h3 className="text-2xl font-bold text-white">Détails des demandes</h3>
                {selectedRequest && (
                  <p className="text-gray-400">{selectedRequest.game_title}</p>
                )}
              </ModalHeader>
              <ModalBody>
                {selectedRequest && (
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-lg font-semibold text-white mb-2">
                        Utilisateurs ayant demandé ({selectedRequest.request_count})
                      </h4>
                      <div className="space-y-2 max-h-60 overflow-y-auto">
                        {parseUserData(selectedRequest.user_names, selectedRequest.request_dates).map((user, index) => (
                          <div key={index} className="flex justify-between items-center p-3 bg-gray-800/50 rounded-lg">
                            <span className="text-white font-medium">{user.name}</span>
                            <span className="text-gray-400 text-sm">
                              {new Date(user.date).toLocaleDateString('fr-FR')} à {new Date(user.date).toLocaleTimeString('fr-FR')}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </ModalBody>
              <ModalFooter>
                <Button color="primary" onPress={onClose}>
                  Fermer
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Modale de confirmation - Résolution */}
      <Modal isOpen={isResolveModalOpen} onOpenChange={onResolveModalOpenChange} backdrop="blur">
        <ModalContent className="bg-black/95 backdrop-blur-xl border border-white/20 shadow-2xl">
          {(onClose) => (
            <>
              <ModalHeader className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <i className="fas fa-check text-3xl text-white"></i>
                </div>
                <h3 className="text-2xl font-bold text-white">Confirmer la mise à jour</h3>
              </ModalHeader>
              <ModalBody className="text-center">
                <p className="text-gray-300 mb-4">
                  Êtes-vous sûr de vouloir marquer ce jeu comme mis à jour ?
                </p>
                {selectedRequest && (
                  <p className="text-white font-semibold">"{selectedRequest.game_title}"</p>
                )}
                <p className="text-gray-400 text-sm mt-4">
                  Cette action marquera toutes les demandes pour ce jeu comme résolues.
                </p>
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Annuler
                </Button>
                <Button 
                  color="success" 
                  variant="shadow"
                  onPress={() => selectedRequest && handleAction(selectedRequest.game_id, 'resolve')}
                  isLoading={processingRequest === selectedRequest?.game_id}
                >
                  Confirmer la mise à jour
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Modale de confirmation - Rejet */}
      <Modal isOpen={isDismissModalOpen} onOpenChange={onDismissModalOpenChange} backdrop="blur">
        <ModalContent className="bg-black/95 backdrop-blur-xl border border-white/20 shadow-2xl">
          {(onClose) => (
            <>
              <ModalHeader className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <i className="fas fa-times text-3xl text-white"></i>
                </div>
                <h3 className="text-2xl font-bold text-white">Rejeter les demandes</h3>
              </ModalHeader>
              <ModalBody className="text-center">
                <p className="text-gray-300 mb-4">
                  Êtes-vous sûr de vouloir rejeter toutes les demandes pour ce jeu ?
                </p>
                {selectedRequest && (
                  <p className="text-white font-semibold">"{selectedRequest.game_title}"</p>
                )}
                <p className="text-gray-400 text-sm mt-4">
                  Cette action marquera toutes les demandes comme rejetées sans effectuer de mise à jour.
                </p>
              </ModalBody>
              <ModalFooter>
                <Button color="primary" variant="light" onPress={onClose}>
                  Annuler
                </Button>
                <Button 
                  color="danger" 
                  variant="shadow"
                  onPress={() => selectedRequest && handleAction(selectedRequest.game_id, 'dismiss')}
                  isLoading={processingRequest === selectedRequest?.game_id}
                >
                  Rejeter les demandes
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  )
}
