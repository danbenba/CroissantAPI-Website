"use client"

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/use-auth'
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Button,
  Badge,
  Card,
  CardBody,
  ScrollShadow,
  Chip,
  Divider,
  Spinner
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

export default function NotificationsDropdown() {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

  // Charger les notifications
  const loadNotifications = async () => {
    if (!user) return

    setLoading(true)
    try {
      const response = await fetch('/api/notifications?limit=10', {
        credentials: 'include'
      })
      const data = await response.json()
      
      if (data.success) {
        setNotifications(data.notifications)
        setUnreadCount(data.unread_count)
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
        // Mettre à jour l'état local
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

  // Marquer toutes les notifications comme lues
  const markAllAsRead = async () => {
    const unreadNotifications = notifications.filter(n => !n.is_read)
    
    for (const notification of unreadNotifications) {
      await markAsRead(notification.id)
    }
  }

  // Gérer le clic sur une notification
  const handleNotificationClick = (notification: Notification) => {
    // Marquer comme lue si pas encore lue
    if (!notification.is_read) {
      markAsRead(notification.id)
    }

    // Rediriger si URL d'action
    if (notification.action_url) {
      window.location.href = notification.action_url
    } else if (notification.related_type === 'support_ticket') {
      // Ouvrir la popup de support (à implémenter)
      console.log('Ouvrir ticket:', notification.related_id)
    }

    setIsOpen(false)
  }

  // Charger les notifications au montage et quand l'utilisateur change
  useEffect(() => {
    if (user) {
      loadNotifications()
      // Actualiser toutes les 30 secondes
      const interval = setInterval(loadNotifications, 30000)
      return () => clearInterval(interval)
    }
  }, [user])

  // Charger les notifications quand le dropdown s'ouvre
  useEffect(() => {
    if (isOpen && user) {
      loadNotifications()
    }
  }, [isOpen, user])

  if (!user) {
    return null
  }

  return (
    <Dropdown
      isOpen={isOpen}
      onOpenChange={setIsOpen}
      placement="bottom-end"
      classNames={{
        content: "min-w-80 max-w-96 bg-gradient-to-br from-gray-900/95 to-black/95 border border-purple-500/30 backdrop-blur-xl shadow-2xl rounded-xl animate-in fade-in-0 zoom-in-95 data-[side=bottom]:slide-in-from-top-2 duration-200"
      }}
    >
      <DropdownTrigger>
        <Button
          variant="light"
          isIconOnly
          className="text-gray-300 hover:text-white transition-all duration-300 hover:scale-110 relative group"
        >
          <Badge 
            content={unreadCount > 0 ? (unreadCount > 99 ? '99+' : unreadCount.toString()) : ''}
            color="danger"
            size="sm"
            isInvisible={unreadCount === 0}
            className="font-bold animate-pulse"
          >
            <i className={`fas fa-bell text-lg transition-all duration-500 transform group-hover:rotate-12 ${unreadCount > 0 ? 'text-yellow-400 animate-bounce' : ''}`}></i>
          </Badge>
          {unreadCount > 0 && (
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping"></div>
          )}
        </Button>
      </DropdownTrigger>
      <DropdownMenu
        aria-label="Notifications"
        className="p-0"
        itemClasses={{
          base: "p-0 data-[hover=true]:bg-transparent data-[focus=true]:bg-transparent"
        }}
      >
        <DropdownItem 
          key="notifications" 
          className="p-0 data-[hover=true]:bg-transparent data-[focus=true]:bg-transparent" 
          textValue="notifications"
        >
          <div className="w-full">
            {/* En-tête moderne */}
            <div className="flex items-center justify-between p-6 border-b border-purple-500/20 bg-gradient-to-r from-purple-600/10 to-blue-600/10 animate-in slide-in-from-top-2 fade-in-0 duration-300">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center animate-pulse">
                  <i className="fas fa-bell text-white text-sm animate-bounce"></i>
                </div>
                <h3 className="text-white font-bold text-lg">Notifications</h3>
                {unreadCount > 0 && (
                  <Chip
                    size="sm"
                    color="danger"
                    variant="shadow"
                    className="animate-pulse"
                  >
                    {unreadCount}
                  </Chip>
                )}
              </div>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <Button
                    size="sm"
                    variant="shadow"
                    color="primary"
                    onPress={markAllAsRead}
                    className="bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium"
                    startContent={<i className="fas fa-check-double"></i>}
                  >
                    Tout lire
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="light"
                  isIconOnly
                  onPress={loadNotifications}
                  isLoading={loading}
                  className="text-gray-400 hover:text-white transition-all duration-300 hover:scale-110"
                >
                  <i className="fas fa-sync-alt"></i>
                </Button>
              </div>
            </div>

            {/* Liste des notifications */}
            <div className="max-h-96">
              {loading && notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-8 animate-in fade-in-0 duration-300">
                  <Spinner color="primary" size="lg" />
                  <p className="text-gray-400 mt-3 animate-pulse">Chargement...</p>
                </div>
              ) : notifications.length === 0 ? (
                <div className="text-center p-8 animate-in fade-in-0 slide-in-from-bottom-4 duration-500">
                  <div className="w-16 h-16 bg-gradient-to-br from-gray-700 to-gray-900 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg animate-bounce">
                    <i className="fas fa-bell-slash text-2xl text-gray-400"></i>
                  </div>
                  <h4 className="text-white font-medium mb-2">Aucune notification</h4>
                  <p className="text-gray-400 text-sm">Vous êtes à jour ! 🎉</p>
                </div>
              ) : (
                <ScrollShadow className="max-h-96">
                  <div className="divide-y divide-white/10">
                    {notifications.map((notification, index) => (
                      <div
                        key={notification.id}
                        className={`p-4 cursor-pointer transition-all duration-300 hover:bg-gradient-to-r hover:from-purple-600/10 hover:to-blue-600/10 hover:scale-[1.02] animate-in slide-in-from-top-1 fade-in-0 ${
                          !notification.is_read 
                            ? 'bg-gradient-to-r from-blue-600/20 to-purple-600/20 border-l-4 border-l-blue-500 shadow-lg' 
                            : 'hover:bg-gray-800/30'
                        }`}
                        style={{
                          animationDelay: `${index * 50}ms`,
                          animationDuration: '300ms'
                        }}
                        onClick={() => handleNotificationClick(notification)}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg transition-all duration-300 ${
                            notification.is_read 
                              ? 'bg-gradient-to-br from-gray-600 to-gray-700' 
                              : 'bg-gradient-to-br from-blue-500 to-purple-600 animate-pulse'
                          }`}>
                            <i className={`${getNotificationIcon(notification.type)} text-white text-sm`}></i>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <h4 className={`font-semibold text-sm leading-tight ${
                                notification.is_read ? 'text-gray-300' : 'text-white'
                              }`}>
                                {notification.title}
                              </h4>
                              {!notification.is_read && (
                                <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex-shrink-0 mt-0.5 animate-pulse shadow-lg"></div>
                              )}
                            </div>
                            <p className={`text-xs mt-2 line-clamp-2 leading-relaxed ${
                              notification.is_read ? 'text-gray-500' : 'text-gray-300'
                            }`}>
                              {notification.message}
                            </p>
                            <div className="flex items-center gap-2 mt-3">
                              <Chip
                                size="sm"
                                color={getNotificationColor(notification.type)}
                                variant="shadow"
                                className="text-xs font-medium"
                              >
                                {notification.type.replace('_', ' ')}
                              </Chip>
                              <span className="text-xs text-gray-500 font-medium">
                                {new Date(notification.created_at).toLocaleDateString('fr-FR', {
                                  day: 'numeric',
                                  month: 'short',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollShadow>
              )}
            </div>

                        {/* Pied de page moderne */}
            {notifications.length > 0 && (
              <div className="p-4 border-t border-purple-500/20 bg-gradient-to-r from-purple-600/5 to-blue-600/5 animate-in slide-in-from-bottom-2 fade-in-0 duration-300">
                </div>
              )}
          </div>
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  )
}
