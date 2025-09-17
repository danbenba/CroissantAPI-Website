"use client"

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/use-auth'
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Chip,
  Avatar,
  Divider,
  Spinner,
  ScrollShadow,
  Select,
  SelectItem,
  Pagination,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure
} from "@heroui/react"

interface Notification {
  id: number
  type: string
  title: string
  message: string
  is_read: boolean
  related_id?: number
  related_type?: string
  action_url?: string
  created_at: string
  read_at?: string
}

const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'support_ticket': return 'fas fa-headset'
    case 'system_announcement': return 'fas fa-megaphone'
    case 'account_update': return 'fas fa-user-edit'
    case 'download_ready': return 'fas fa-download'
    case 'vip_expiry': return 'fas fa-crown'
    default: return 'fas fa-bell'
  }
}

const getNotificationColor = (type: string) => {
  switch (type) {
    case 'support_ticket': return 'primary'
    case 'system_announcement': return 'warning'
    case 'account_update': return 'secondary'
    case 'download_ready': return 'success'
    case 'vip_expiry': return 'danger'
    default: return 'default'
  }
}

const getTypeLabel = (type: string) => {
  switch (type) {
    case 'support_ticket': return 'Support'
    case 'system_announcement': return 'Annonce système'
    case 'account_update': return 'Compte'
    case 'download_ready': return 'Téléchargement'
    case 'vip_expiry': return 'VIP'
    default: return type
  }
}

export default function AccountNotifications() {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [filter, setFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [unreadCount, setUnreadCount] = useState(0)
  
  // Modal de détail
  const { isOpen: isDetailModalOpen, onOpen: onDetailModalOpen, onOpenChange: onDetailModalOpenChange } = useDisclosure()
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null)

  const ITEMS_PER_PAGE = 10

  // Charger les notifications
  const loadNotifications = async () => {
    if (!user) return

    setLoading(true)
    try {
      const params = new URLSearchParams({
        limit: '50', // Charger plus pour la pagination côté client
        unread_only: filter === 'unread' ? 'true' : 'false'
      })

      const response = await fetch(`/api/notifications?${params}`, {
        credentials: 'include'
      })
      const data = await response.json()
      
      if (data.success) {
        let filteredNotifications = data.notifications

        // Filtrer côté client
        if (filter !== 'all' && filter !== 'unread') {
          filteredNotifications = data.notifications.filter((n: Notification) => n.type === filter)
        }

        setNotifications(filteredNotifications)
        setUnreadCount(data.unread_count)
        setTotalPages(Math.ceil(filteredNotifications.length / ITEMS_PER_PAGE))
      }
    } catch (error) {
      console.error('Erreur lors du chargement des notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  // Marquer une notification comme lue
  const markAsRead = async (notificationId: number) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}/mark-read`, {
        method: 'PUT',
        credentials: 'include'
      })
      
      if (response.ok) {
        setNotifications(prev => 
          prev.map(notif => 
            notif.id === notificationId 
              ? { ...notif, is_read: true, read_at: new Date().toISOString() }
              : notif
          )
        )
        setUnreadCount(prev => Math.max(0, prev - 1))
      }
    } catch (error) {
      console.error('Erreur lors du marquage de la notification:', error)
    }
  }

  // Supprimer une notification
  const deleteNotification = async (notificationId: number) => {
    setSubmitting(true)
    try {
      const response = await fetch(`/api/notifications/${notificationId}/mark-read`, {
        method: 'DELETE',
        credentials: 'include'
      })
      
      if (response.ok) {
        setNotifications(prev => prev.filter(notif => notif.id !== notificationId))
        if (selectedNotification?.id === notificationId) {
          onDetailModalOpenChange()
        }
      }
    } catch (error) {
      console.error('Erreur lors de la suppression de la notification:', error)
    } finally {
      setSubmitting(false)
    }
  }

  // Marquer toutes comme lues
  const markAllAsRead = async () => {
    setSubmitting(true)
    const unreadNotifications = notifications.filter(n => !n.is_read)
    
    try {
      for (const notification of unreadNotifications) {
        await markAsRead(notification.id)
      }
    } finally {
      setSubmitting(false)
    }
  }

  // Ouvrir le détail d'une notification
  const openNotificationDetail = (notification: Notification) => {
    setSelectedNotification(notification)
    onDetailModalOpen()
    
    // Marquer comme lue si pas encore lue
    if (!notification.is_read) {
      markAsRead(notification.id)
    }
  }

  // Gérer l'action d'une notification
  const handleNotificationAction = (notification: Notification) => {
    if (notification.action_url) {
      window.open(notification.action_url, '_blank')
    } else if (notification.related_type === 'support_ticket') {
      // Ouvrir la popup de support avec le ticket
      console.log('Ouvrir ticket:', notification.related_id)
      // TODO: Intégrer avec la popup de support
    }
  }

  // Notifications paginées
  const paginatedNotifications = notifications.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  // Charger au montage et lors des changements de filtre
  useEffect(() => {
    loadNotifications()
  }, [user, filter])

  // Réinitialiser la page lors du changement de filtre
  useEffect(() => {
    setCurrentPage(1)
  }, [filter])

  return (
    <div className="space-y-6">
      {/* En-tête avec statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-blue-600/20 border border-blue-500/30">
          <CardBody className="text-center p-4">
            <i className="fas fa-bell text-2xl text-blue-400 mb-2"></i>
            <p className="text-xl font-bold text-white">{notifications.length}</p>
            <p className="text-gray-400 text-sm">Total</p>
          </CardBody>
        </Card>
        <Card className="bg-orange-600/20 border border-orange-500/30">
          <CardBody className="text-center p-4">
            <i className="fas fa-bell-slash text-2xl text-orange-400 mb-2"></i>
            <p className="text-xl font-bold text-white">{unreadCount}</p>
            <p className="text-gray-400 text-sm">Non lues</p>
          </CardBody>
        </Card>
        <Card className="bg-green-600/20 border border-green-500/30">
          <CardBody className="text-center p-4">
            <i className="fas fa-check-circle text-2xl text-green-400 mb-2"></i>
            <p className="text-xl font-bold text-white">{notifications.length - unreadCount}</p>
            <p className="text-gray-400 text-sm">Lues</p>
          </CardBody>
        </Card>
      </div>

      {/* Filtres et actions */}
      <Card>
        <CardBody>
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="flex gap-4 items-center">
              <Select
                label="Filtrer par"
                selectedKeys={[filter]}
                onSelectionChange={(keys) => {
                  const selectedKey = Array.from(keys)[0] as string
                  setFilter(selectedKey)
                }}
                className="w-48"
                size="sm"
              >
                <SelectItem key="all">Toutes</SelectItem>
                <SelectItem key="unread">Non lues</SelectItem>
                <SelectItem key="support_ticket">Support</SelectItem>
                <SelectItem key="system_announcement">Annonces</SelectItem>
                <SelectItem key="account_update">Compte</SelectItem>
                <SelectItem key="download_ready">Téléchargements</SelectItem>
                <SelectItem key="vip_expiry">VIP</SelectItem>
              </Select>
            </div>
            
            <div className="flex gap-2">
              {unreadCount > 0 && (
                <Button
                  color="primary"
                  variant="ghost"
                  onPress={markAllAsRead}
                  isLoading={submitting}
                  startContent={<i className="fas fa-check-double"></i>}
                  size="sm"
                >
                  Marquer tout lu
                </Button>
              )}
              <Button
                color="default"
                variant="ghost"
                onPress={loadNotifications}
                isLoading={loading}
                startContent={<i className="fas fa-sync-alt"></i>}
                size="sm"
              >
                Actualiser
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Liste des notifications */}
      <Card>
        <CardHeader>
          <h3 className="text-white text-lg font-bold">
            Mes Notifications
          </h3>
        </CardHeader>
        <CardBody className="p-0">
          {loading ? (
            <div className="flex justify-center py-8">
              <Spinner color="primary" />
            </div>
          ) : paginatedNotifications.length === 0 ? (
            <div className="text-center py-8">
              <i className="fas fa-bell-slash text-6xl text-gray-500 mb-4"></i>
              <p className="text-gray-400">Aucune notification</p>
            </div>
          ) : (
            <div className="divide-y divide-white/10">
              {paginatedNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 cursor-pointer transition-colors hover:bg-white/5 ${
                    !notification.is_read ? 'bg-blue-600/10 border-l-4 border-l-blue-500' : ''
                  }`}
                  onClick={() => openNotificationDetail(notification)}
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                      notification.is_read ? 'bg-gray-600' : 'bg-blue-600'
                    }`}>
                      <i className={`${getNotificationIcon(notification.type)} text-white`}></i>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h4 className={`font-medium ${
                            notification.is_read ? 'text-gray-300' : 'text-white'
                          }`}>
                            {notification.title}
                          </h4>
                          <p className={`text-sm mt-1 line-clamp-2 ${
                            notification.is_read ? 'text-gray-500' : 'text-gray-400'
                          }`}>
                            {notification.message}
                          </p>
                          <div className="flex items-center gap-3 mt-2">
                            <Chip
                              size="sm"
                              color={getNotificationColor(notification.type)}
                              variant="flat"
                            >
                              {getTypeLabel(notification.type)}
                            </Chip>
                            <span className="text-xs text-gray-500">
                              {new Date(notification.created_at).toLocaleString('fr-FR')}
                            </span>
                            {notification.read_at && (
                              <span className="text-xs text-gray-600">
                                Lu le {new Date(notification.read_at).toLocaleDateString('fr-FR')}
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          {!notification.is_read && (
                            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            isIconOnly
                            onPress={() => {
                              deleteNotification(notification.id)
                            }}
                            className="text-gray-500 hover:text-red-400"
                          >
                            <i className="fas fa-trash"></i>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardBody>
        
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center p-4 border-t border-white/10">
            <Pagination
              total={totalPages}
              page={currentPage}
              onChange={setCurrentPage}
              color="primary"
              showControls
            />
          </div>
        )}
      </Card>

      {/* Modal de détail */}
      <Modal 
        isOpen={isDetailModalOpen} 
        onOpenChange={onDetailModalOpenChange}
        size="2xl"
      >
        <ModalContent className="bg-black/95 border border-white/20">
          {(onClose) => (
            <>
              <ModalHeader className="border-b border-white/10">
                {selectedNotification && (
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      selectedNotification.is_read ? 'bg-gray-600' : 'bg-blue-600'
                    }`}>
                      <i className={`${getNotificationIcon(selectedNotification.type)} text-white text-sm`}></i>
                    </div>
                    <div>
                      <h3 className="text-white font-bold">{selectedNotification.title}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Chip
                          size="sm"
                          color={getNotificationColor(selectedNotification.type)}
                          variant="shadow"
                        >
                          {getTypeLabel(selectedNotification.type)}
                        </Chip>
                        <span className="text-gray-400 text-xs">
                          {new Date(selectedNotification.created_at).toLocaleString('fr-FR')}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </ModalHeader>
              
              <ModalBody>
                {selectedNotification && (
                  <div className="space-y-4">
                    <div className="bg-gray-800/50 rounded-lg p-4">
                      <p className="text-gray-300 whitespace-pre-wrap leading-relaxed">
                        {selectedNotification.message}
                      </p>
                    </div>
                    
                    {selectedNotification.action_url && (
                      <div className="bg-blue-600/20 border border-blue-500/30 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <i className="fas fa-external-link-alt text-blue-400"></i>
                          <span className="text-blue-300 font-medium">Action disponible</span>
                        </div>
                        <p className="text-gray-400 text-sm">
                          Cette notification contient un lien d'action. Cliquez sur "Ouvrir le lien" pour y accéder.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </ModalBody>
              
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Fermer
                </Button>
                {selectedNotification?.action_url && (
                  <Button
                    color="primary"
                    onPress={() => {
                      handleNotificationAction(selectedNotification)
                      onClose()
                    }}
                    startContent={<i className="fas fa-external-link-alt"></i>}
                  >
                    Ouvrir le lien
                  </Button>
                )}
                <Button
                  color="warning"
                  variant="ghost"
                  onPress={() => {
                    if (selectedNotification) {
                      deleteNotification(selectedNotification.id)
                    }
                  }}
                  isLoading={submitting}
                  startContent={<i className="fas fa-trash"></i>}
                >
                  Supprimer
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  )
}
