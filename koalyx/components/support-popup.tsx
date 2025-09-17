"use client"

import { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { useLanguage } from '@/contexts/LanguageContext'
import { secureGet, securePost } from '@/lib/api-client'
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Card,
  CardBody,
  CardHeader,
  Select,
  SelectItem,
  Textarea,
  Input,
  Chip,
  Avatar,
  Divider,
  Spinner,
  ScrollShadow,
  useDisclosure
} from "@heroui/react"

interface SupportPopupProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}

interface SupportTicket {
  id: number
  type: string
  subject: string
  status: string
  priority: string
  created_at: string
  updated_at: string
  closed_at?: string
  assigned_to_name?: string
  assigned_to_photo?: string
  message_count: number
  last_message?: string
  last_message_date?: string
}

interface SupportMessage {
  id: number
  message: string
  message_type: 'user_message' | 'support_message' | 'system_message'
  is_system_message: boolean
  created_at: string
  user_id: number
  nom_utilisateur: string
  photo?: string
  role: string
}

const supportTypes = [
  { key: 'technical_support', label: 'Support Technique', description: 'Problèmes de téléchargement, installation, etc.' },
  { key: 'account_issue', label: 'Problème de Compte', description: 'Connexion, mot de passe, profil' },
  { key: 'payment_issue', label: 'Problème de Paiement', description: 'Facturation, abonnement VIP' },
  { key: 'bug_report', label: 'Signaler un Bug', description: 'Dysfonctionnement du site' },
  { key: 'feature_request', label: 'Demande de Fonctionnalité', description: 'Suggérer une amélioration' },
  { key: 'other', label: 'Autre', description: 'Autre type de demande' },
]

const getStatusColor = (status: string) => {
  switch (status) {
    case 'open': return 'primary'
    case 'in_progress': return 'warning'
    case 'waiting_user': return 'secondary'
    case 'resolved': return 'success'
    case 'closed': return 'default'
    default: return 'default'
  }
}

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'open': return 'Ouvert'
    case 'in_progress': return 'En cours'
    case 'waiting_user': return 'En attente utilisateur'
    case 'resolved': return 'Résolu'
    case 'closed': return 'Fermé'
    default: return status
  }
}

export default function SupportPopup({ isOpen, onOpenChange }: SupportPopupProps) {
  const { user } = useAuth()
  const { t } = useLanguage()
  const [currentView, setCurrentView] = useState<'menu' | 'create' | 'history' | 'chat'>('menu')
  const [tickets, setTickets] = useState<SupportTicket[]>([])
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null)
  const [messages, setMessages] = useState<SupportMessage[]>([])
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Modal pour les messages d'erreur/succès
  const { isOpen: isMessageModalOpen, onOpen: onMessageModalOpen, onOpenChange: onMessageModalOpenChange } = useDisclosure()
  const [modalMessage, setModalMessage] = useState({ title: '', content: '', type: 'info' as 'success' | 'error' | 'info' })

  // Fonction pour afficher des messages via modal
  const showModal = (title: string, content: string, type: 'success' | 'error' | 'info' = 'info') => {
    setModalMessage({ title, content, type })
    onMessageModalOpen()
  }

  // État du formulaire de création
  const [formData, setFormData] = useState({
    type: '',
    subject: '',
    message: ''
  })

  // État du chat
  const [newMessage, setNewMessage] = useState('')

  // Auto-scroll vers le bas des messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Charger les tickets de l'utilisateur
  const loadTickets = async () => {
    if (!user) return

    setLoading(true)
    try {
      const response = await secureGet('/api/support/tickets')
      const data = await response.json()
      
      if (data.success) {
        setTickets(data.tickets)
      }
    } catch (error) {
      console.error('Erreur lors du chargement des tickets:', error)
    } finally {
      setLoading(false)
    }
  }

  // Charger les messages d'un ticket
  const loadMessages = async (ticketId: number) => {
    setLoading(true)
    try {
      const response = await secureGet(`/api/support/tickets/${ticketId}/messages`)
      const data = await response.json()
      
      if (data.success) {
        setMessages(data.messages)
      }
    } catch (error) {
      console.error('Erreur lors du chargement des messages:', error)
    } finally {
      setLoading(false)
    }
  }

  // Créer un nouveau ticket
  const handleCreateTicket = async () => {
    if (!formData.type || !formData.subject || !formData.message) {
      return
    }

    setSubmitting(true)
    try {
      const response = await securePost('/api/support/tickets', formData)

      const data = await response.json()
      
      if (data.success) {
        // Réinitialiser le formulaire
        setFormData({ type: '', subject: '', message: '' })
        // Retourner au menu
        setCurrentView('menu')
        // Recharger les tickets
        await loadTickets()
      } else {
        showModal('Erreur', data.message || 'Erreur lors de la création du ticket', 'error')
      }
    } catch (error) {
      console.error('Erreur lors de la création du ticket:', error)
      showModal('Erreur', 'Erreur lors de la création du ticket', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  // Envoyer un message dans le chat
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedTicket) return

    setSubmitting(true)
    try {
      const response = await securePost(`/api/support/tickets/${selectedTicket.id}/messages`, { message: newMessage.trim() })

      const data = await response.json()
      
      if (data.success) {
        setNewMessage('')
        // Recharger les messages
        await loadMessages(selectedTicket.id)
      } else {
        showModal('Erreur', data.message || 'Erreur lors de l\'envoi du message', 'error')
      }
    } catch (error) {
      console.error('Erreur lors de l\'envoi du message:', error)
      showModal('Erreur', 'Erreur lors de l\'envoi du message', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  // Ouvrir un ticket dans le chat
  const openTicketChat = (ticket: SupportTicket) => {
    setSelectedTicket(ticket)
    setCurrentView('chat')
    loadMessages(ticket.id)
  }

  // Réinitialiser lors de l'ouverture/fermeture
  useEffect(() => {
    if (isOpen) {
      setCurrentView('menu')
      if (user) {
        loadTickets()
      }
    }
  }, [isOpen, user])

  if (!user) {
    return (
      <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="md" backdrop="blur">
        <ModalContent className="modal-modern">
          <ModalHeader className="text-white text-center">
            Support Client
          </ModalHeader>
          <ModalBody className="text-center py-8 flex flex-col items-center justify-center">
            <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-red-700 rounded-full flex items-center justify-center mb-6 shadow-lg">
              <i className="fas fa-user-slash text-3xl text-white"></i>
            </div>
            <h3 className="text-white font-bold text-xl mb-3">Connexion Requise</h3>
            <p className="text-gray-300">Vous devez être connecté pour accéder au support.</p>
          </ModalBody>
          <ModalFooter>
            <Button color="primary" onPress={() => onOpenChange(false)}>
              Fermer
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    )
  }

  return (
    <>
      <Modal 
        isOpen={isOpen} 
        onOpenChange={onOpenChange} 
        size="4xl" 
        backdrop="blur"
        scrollBehavior="inside"
      >
        <ModalContent className="modal-modern max-h-[90vh]">
        {(onClose) => (
          <>
            <ModalHeader className="flex items-center gap-3 border-b border-white/10">
              {currentView !== 'menu' && (
                <Button
                  isIconOnly
                  variant="light"
                  size="sm"
                  onPress={() => {
                    if (currentView === 'chat') {
                      setCurrentView('history')
                    } else {
                      setCurrentView('menu')
                    }
                  }}
                  className="text-gray-400 hover:text-white"
                >
                  <i className="fas fa-arrow-left"></i>
                </Button>
              )}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <i className="fas fa-headset text-white"></i>
                </div>
                <div>
                  <h3 className="text-white text-xl font-bold">Support Client</h3>
                  <p className="text-gray-400 text-sm">
                    {currentView === 'menu' && 'Comment pouvons-nous vous aider ?'}
                    {currentView === 'create' && 'Créer un nouveau ticket'}
                    {currentView === 'history' && 'Historique de vos tickets'}
                    {currentView === 'chat' && selectedTicket?.subject}
                  </p>
                </div>
              </div>
            </ModalHeader>

            <ModalBody className="p-0">
              {/* Menu principal */}
              {currentView === 'menu' && (
                <div className="p-6 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card 
                      isPressable 
                      onPress={() => setCurrentView('create')}
                      className="bg-gradient-to-br from-blue-600/20 to-purple-600/20 border border-blue-500/30 hover:border-blue-400/50 transition-all"
                    >
                      <CardBody className="text-center p-8 flex flex-col items-center justify-center">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-4 shadow-lg">
                          <i className="fas fa-plus-circle text-2xl text-white"></i>
                        </div>
                        <h4 className="text-white font-bold text-lg mb-2">Nouvelle Demande</h4>
                        <p className="text-gray-400">Créer un nouveau ticket de support</p>
                      </CardBody>
                    </Card>

                    <Card 
                      isPressable 
                      onPress={() => setCurrentView('history')}
                      className="bg-gradient-to-br from-green-600/20 to-emerald-600/20 border border-green-500/30 hover:border-green-400/50 transition-all"
                    >
                      <CardBody className="text-center p-8 flex flex-col items-center justify-center">
                        <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mb-4 shadow-lg">
                          <i className="fas fa-history text-2xl text-white"></i>
                        </div>
                        <h4 className="text-white font-bold text-lg mb-2">Mon Historique</h4>
                        <p className="text-gray-400">Voir vos tickets précédents</p>
                        {tickets.length > 0 && (
                          <Chip size="sm" color="success" className="mt-2">
                            {tickets.length} ticket{tickets.length > 1 ? 's' : ''}
                          </Chip>
                        )}
                      </CardBody>
                    </Card>
                  </div>

                  <Divider className="bg-white/10 my-6" />

                  <div className="bg-gray-800/50 rounded-lg p-4">
                    <h5 className="text-white font-semibold mb-2 flex items-center gap-2">
                      <i className="fas fa-info-circle text-blue-400"></i>
                      Informations utiles
                    </h5>
                    <ul className="text-gray-300 space-y-1 text-sm">
                      <li>• Temps de réponse moyen : 2-4 heures</li>
                      <li>• Support disponible 7j/7 de 9h à 18h</li>
                      <li>• Pour les urgences, précisez-le dans le titre</li>
                    </ul>
                  </div>
                </div>
              )}

              {/* Formulaire de création */}
              {currentView === 'create' && (
                <div className="p-6 space-y-6">
                  <Select
                    label="Type de demande"
                    placeholder="Sélectionnez le type de votre demande"
                    selectedKeys={formData.type ? [formData.type] : []}
                    onSelectionChange={(keys) => {
                      const selectedKey = Array.from(keys)[0] as string
                      setFormData({ ...formData, type: selectedKey })
                    }}
                    className="text-white"
                    classNames={{
                      trigger: "bg-gray-800/50 border-white/20",
                      value: "text-white",
                      label: "text-gray-300"
                    }}
                  >
                    {supportTypes.map((type) => (
                      <SelectItem key={type.key} description={type.description}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </Select>

                  <Input
                    label="Objet"
                    placeholder="Résumez votre problème en quelques mots"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    maxLength={255}
                    classNames={{
                      input: "text-white bg-gray-800/50",
                      label: "text-gray-300",
                      inputWrapper: "bg-gray-800/50 border-white/20"
                    }}
                  />

                  <Textarea
                    label="Message"
                    placeholder="Décrivez votre problème en détail..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    minRows={4}
                    maxRows={8}
                    classNames={{
                      input: "text-white bg-gray-800/50",
                      label: "text-gray-300",
                      inputWrapper: "bg-gray-800/50 border-white/20"
                    }}
                  />

                  <div className="flex justify-end gap-3">
                    <Button
                      variant="light"
                      onPress={() => setCurrentView('menu')}
                      className="text-gray-400 hover:text-white"
                    >
                      Annuler
                    </Button>
                    <Button
                      color="primary"
                      onPress={handleCreateTicket}
                      isLoading={submitting}
                      isDisabled={!formData.type || !formData.subject || !formData.message}
                      startContent={!submitting && <i className="fas fa-paper-plane"></i>}
                    >
                      Envoyer
                    </Button>
                  </div>
                </div>
              )}

              {/* Historique des tickets */}
              {currentView === 'history' && (
                <div className="p-6">
                  {loading ? (
                    <div className="flex justify-center py-8">
                      <Spinner color="primary" />
                    </div>
                  ) : tickets.length === 0 ? (
                    <div className="text-center py-8 flex flex-col items-center justify-center">
                      <div className="w-20 h-20 bg-gradient-to-br from-gray-600 to-gray-800 rounded-full flex items-center justify-center mb-6 shadow-lg">
                        <i className="fas fa-inbox text-3xl text-gray-300"></i>
                      </div>
                      <h3 className="text-white font-bold text-xl mb-3">Aucun ticket trouvé</h3>
                      <p className="text-gray-400 mb-6">Vous n'avez pas encore créé de ticket de support</p>
                      <Button
                        color="primary"
                        variant="shadow"
                        className="bg-gradient-to-r from-blue-500 to-purple-600"
                        onPress={() => setCurrentView('create')}
                        startContent={<i className="fas fa-plus"></i>}
                      >
                        Créer votre premier ticket
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {tickets.map((ticket) => (
                        <Card
                          key={ticket.id}
                          isPressable
                          onPress={() => openTicketChat(ticket)}
                          className="bg-gray-800/50 border border-white/10 hover:border-white/20 transition-all"
                        >
                          <CardBody className="p-4">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-2">
                                  <Chip
                                    size="sm"
                                    color={getStatusColor(ticket.status)}
                                    variant="shadow"
                                  >
                                    {getStatusLabel(ticket.status)}
                                  </Chip>
                                  <span className="text-gray-400 text-xs">
                                    #{ticket.id}
                                  </span>
                                </div>
                                <h4 className="text-white font-semibold truncate mb-1">
                                  {ticket.subject}
                                </h4>
                                {ticket.last_message && (
                                  <p className="text-gray-400 text-sm line-clamp-2">
                                    {ticket.last_message}
                                  </p>
                                )}
                                <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                                  <span>
                                    <i className="fas fa-comments mr-1"></i>
                                    {ticket.message_count} message{ticket.message_count > 1 ? 's' : ''}
                                  </span>
                                  <span>
                                    <i className="fas fa-clock mr-1"></i>
                                    {new Date(ticket.updated_at).toLocaleDateString('fr-FR')}
                                  </span>
                                </div>
                              </div>
                              <div className="flex flex-col items-end">
                                {ticket.assigned_to_name && (
                                  <div className="flex items-center gap-2 mb-2">
                                    <Avatar
                                      src={ticket.assigned_to_photo}
                                      size="sm"
                                      showFallback
                                      fallback={<i className="fas fa-user"></i>}
                                    />
                                    <span className="text-xs text-gray-400">
                                      {ticket.assigned_to_name}
                                    </span>
                                  </div>
                                )}
                                <i className="fas fa-chevron-right text-gray-500"></i>
                              </div>
                            </div>
                          </CardBody>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Interface de chat */}
              {currentView === 'chat' && selectedTicket && (
                <div className="flex flex-col h-[60vh]">
                  {/* En-tête du ticket */}
                  <div className="p-4 border-b border-white/10 bg-gray-800/30">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-white font-semibold">#{selectedTicket.id} - {selectedTicket.subject}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <Chip
                            size="sm"
                            color={getStatusColor(selectedTicket.status)}
                            variant="shadow"
                          >
                            {getStatusLabel(selectedTicket.status)}
                          </Chip>
                          <span className="text-gray-400 text-xs">
                            Créé le {new Date(selectedTicket.created_at).toLocaleDateString('fr-FR')}
                          </span>
                        </div>
                      </div>
                      {selectedTicket.assigned_to_name && (
                        <div className="flex items-center gap-2">
                          <Avatar
                            src={selectedTicket.assigned_to_photo}
                            size="sm"
                            showFallback
                            fallback={<i className="fas fa-user"></i>}
                          />
                          <div className="text-right">
                            <p className="text-white text-sm font-medium">{selectedTicket.assigned_to_name}</p>
                            <p className="text-gray-400 text-xs">Support assigné</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Messages */}
                  <ScrollShadow className="flex-1 p-4">
                    {loading ? (
                      <div className="flex justify-center py-8">
                        <Spinner color="primary" />
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {messages.map((message) => {
                          const isSystem = message.message_type === 'system_message'
                          // Vérifier si c'est le créateur du ticket (utilisateur connecté) qui envoie le message
                          const isTicketCreator = selectedTicket && user && message.user_id === user.id
                          // Messages à droite : créateur du ticket, Messages à gauche : support/admin/système
                          const alignRight = isTicketCreator && !isSystem
                          
                          return (
                            <div
                              key={message.id}
                              className={`flex ${alignRight ? 'justify-end' : 'justify-start'}`}
                            >
                              <div className={`max-w-[80%] ${alignRight ? 'order-2' : 'order-1'}`}>
                                <div
                                  className={`p-3 rounded-lg ${
                                    isSystem
                                      ? 'bg-yellow-600/20 border border-yellow-500/30 text-yellow-200 text-center'
                                      : alignRight
                                      ? 'bg-blue-600/30 border border-blue-500/30 text-white'
                                      : 'bg-gray-700/50 border border-gray-600/30 text-gray-200'
                                  }`}
                                >
                                  {!isSystem && (
                                    <div className="flex items-center gap-2 mb-2">
                                      <Avatar
                                        src={message.photo}
                                        size="sm"
                                        showFallback
                                        fallback={<i className="fas fa-user"></i>}
                                      />
                                      <span className="font-medium text-sm">
                                        {message.nom_utilisateur}
                                        {message.role === 'admin' && (
                                          <Chip size="sm" color="danger" className="ml-2">Admin</Chip>
                                        )}
                                        {message.role === 'support' && (
                                          <Chip size="sm" color="primary" className="ml-2">Support</Chip>
                                        )}
                                      </span>
                                    </div>
                                  )}
                                  <p className="whitespace-pre-wrap">{message.message}</p>
                                  <p className="text-xs opacity-70 mt-2">
                                    {new Date(message.created_at).toLocaleString('fr-FR')}
                                  </p>
                                </div>
                              </div>
                            </div>
                          )
                        })}
                        <div ref={messagesEndRef} />
                      </div>
                    )}
                  </ScrollShadow>

                  {/* Zone de saisie */}
                  {selectedTicket.status !== 'closed' && (
                    <div className="p-4 border-t border-white/10 bg-gray-800/30">
                      <div className="flex gap-3">
                        <Textarea
                          placeholder="Tapez votre message..."
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          minRows={1}
                          maxRows={4}
                          className="flex-1"
                          classNames={{
                            input: "text-white bg-gray-800/50",
                            inputWrapper: "bg-gray-800/50 border-white/20"
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault()
                              handleSendMessage()
                            }
                          }}
                        />
                        <Button
                          color="primary"
                          isIconOnly
                          onPress={handleSendMessage}
                          isLoading={submitting}
                          isDisabled={!newMessage.trim()}
                        >
                          <i className="fas fa-paper-plane"></i>
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </ModalBody>

            {currentView === 'menu' && (
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Fermer
                </Button>
              </ModalFooter>
            )}
          </>
        )}
      </ModalContent>
      </Modal>

      {/* Modal pour les messages d'erreur/succès */}
      <Modal isOpen={isMessageModalOpen} onOpenChange={onMessageModalOpenChange} size="md">
        <ModalContent className="modal-modern">
          {(onClose) => (
            <>
              <ModalHeader className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  modalMessage.type === 'success' ? 'bg-green-600' :
                  modalMessage.type === 'error' ? 'bg-red-600' : 'bg-blue-600'
                }`}>
                  <i className={`fas ${
                    modalMessage.type === 'success' ? 'fa-check' :
                    modalMessage.type === 'error' ? 'fa-exclamation-triangle' : 'fa-info'
                  } text-white`}></i>
                </div>
                <h3 className="text-white font-bold">{modalMessage.title}</h3>
              </ModalHeader>
              <ModalBody>
                <p className="text-gray-300">{modalMessage.content}</p>
              </ModalBody>
              <ModalFooter>
                <Button 
                  color={modalMessage.type === 'error' ? 'danger' : 'primary'} 
                  onPress={onClose}
                >
                  OK
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  )
}
