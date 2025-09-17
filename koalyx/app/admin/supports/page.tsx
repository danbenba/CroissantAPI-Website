"use client"

import { useState, useEffect, useMemo } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { useRouter } from 'next/navigation'
import { secureGet, securePost, securePut } from '@/lib/api-client'
import Navigation from '@/components/navigation'
import AdminBreadcrumbs from '@/components/admin/admin-breadcrumbs'
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  Avatar,
  Select,
  SelectItem,
  Pagination,
  Spinner,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Textarea,
  Input,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  useDisclosure,
  ScrollShadow,
  Divider
} from "@heroui/react"

interface SupportTicket {
  id: number
  type: string
  subject: string
  status: string
  priority: string
  created_at: string
  updated_at: string
  closed_at?: string
  creator_id: number
  creator_name: string
  creator_email: string
  creator_photo?: string
  assigned_to_name?: string
  assigned_to_photo?: string
  assigned_to_id?: number
  message_count: number
  last_message?: string
  last_message_date?: string
}

interface SupportUser {
  id: number
  nom_utilisateur: string
  photo?: string
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

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'urgent': return 'danger'
    case 'high': return 'warning'
    case 'medium': return 'primary'
    case 'low': return 'default'
    default: return 'default'
  }
}

const getTypeLabel = (type: string) => {
  switch (type) {
    case 'technical_support': return 'Support Technique'
    case 'account_issue': return 'Problème de Compte'
    case 'payment_issue': return 'Problème de Paiement'
    case 'bug_report': return 'Signalement de Bug'
    case 'feature_request': return 'Demande de Fonctionnalité'
    case 'other': return 'Autre'
    default: return type
  }
}

export default function AdminSupportsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [tickets, setTickets] = useState<SupportTicket[]>([])
  const [supports, setSupports] = useState<SupportUser[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  
  // Filtres et pagination
  const [statusFilter, setStatusFilter] = useState('all')
  const [assignedFilter, setAssignedFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)

  // Modal de détail du ticket
  const { isOpen: isDetailModalOpen, onOpen: onDetailModalOpen, onOpenChange: onDetailModalOpenChange } = useDisclosure()
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null)
  const [messages, setMessages] = useState<SupportMessage[]>([])
  const [newMessage, setNewMessage] = useState('')

  // Modal de changement de statut
  const { isOpen: isStatusModalOpen, onOpen: onStatusModalOpen, onOpenChange: onStatusModalOpenChange } = useDisclosure()
  const [newStatus, setNewStatus] = useState('')
  const [statusReason, setStatusReason] = useState('')

  // Modal pour les messages d'erreur/succès
  const { isOpen: isMessageModalOpen, onOpen: onMessageModalOpen, onOpenChange: onMessageModalOpenChange } = useDisclosure()
  const [modalMessage, setModalMessage] = useState({ title: '', content: '', type: 'info' as 'success' | 'error' | 'info' })

  // Fonction pour afficher des messages via modal
  const showModal = (title: string, content: string, type: 'success' | 'error' | 'info' = 'info') => {
    setModalMessage({ title, content, type })
    onMessageModalOpen()
  }

  // Vérifier les permissions
  useEffect(() => {
    if (user && !['admin', 'support'].includes(user.role)) {
      router.push('/admin')
    }
  }, [user, router])

  // Charger les tickets
  const loadTickets = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        status: statusFilter,
        assigned_to: assignedFilter,
        page: currentPage.toString(),
        limit: '10'
      })

      const response = await secureGet(`/api/admin/support/tickets?${params}`)
      const data = await response.json()
      
      if (data.success) {
        setTickets(data.tickets)
        setSupports(data.supports)
        setTotalPages(data.pagination.total_pages)
        setTotalItems(data.pagination.total_items)
      }
    } catch (error) {
      console.error('Erreur lors du chargement des tickets:', error)
    } finally {
      setLoading(false)
    }
  }

  // Charger les messages d'un ticket
  const loadMessages = async (ticketId: number) => {
    try {
      const response = await secureGet(`/api/support/tickets/${ticketId}/messages`)
      const data = await response.json()
      
      if (data.success) {
        setMessages(data.messages)
      }
    } catch (error) {
      console.error('Erreur lors du chargement des messages:', error)
    }
  }

  // Assigner un ticket
  const assignTicket = async (ticketId: number, assignedTo: number | null) => {
    setSubmitting(true)
    try {
      const response = await securePost(`/api/admin/support/tickets/${ticketId}/assign`, { assignedTo })

      const data = await response.json()
      
      if (data.success) {
        await loadTickets()
        if (selectedTicket && selectedTicket.id === ticketId) {
          await loadMessages(ticketId)
        }
      } else {
        showModal('Erreur', data.message || 'Erreur lors de l\'assignation', 'error')
      }
    } catch (error) {
      console.error('Erreur lors de l\'assignation:', error)
      showModal('Erreur', 'Erreur lors de l\'assignation', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  // Changer le statut d'un ticket
  const changeTicketStatus = async () => {
    if (!selectedTicket || !newStatus) return

    setSubmitting(true)
    try {
      const response = await securePut(`/api/admin/support/tickets/${selectedTicket.id}/status`, { 
        status: newStatus,
        reason: statusReason || undefined
      })

      const data = await response.json()
      
      if (data.success) {
        onStatusModalOpenChange()
        setNewStatus('')
        setStatusReason('')
        await loadTickets()
        if (selectedTicket) {
          await loadMessages(selectedTicket.id)
        }
      } else {
        showModal('Erreur', data.message || 'Erreur lors du changement de statut', 'error')
      }
    } catch (error) {
      console.error('Erreur lors du changement de statut:', error)
      showModal('Erreur', 'Erreur lors du changement de statut', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  // Envoyer un message
  const sendMessage = async () => {
    if (!selectedTicket || !newMessage.trim()) return

    setSubmitting(true)
    try {
      const response = await securePost(`/api/support/tickets/${selectedTicket.id}/messages`, { message: newMessage.trim() })

      const data = await response.json()
      
      if (data.success) {
        setNewMessage('')
        await loadMessages(selectedTicket.id)
        await loadTickets()
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

  // Ouvrir le détail d'un ticket
  const openTicketDetail = (ticket: SupportTicket) => {
    setSelectedTicket(ticket)
    loadMessages(ticket.id)
    onDetailModalOpen()
  }

  // Créer les options du select d'assignation pour éviter les erreurs TypeScript
  const assignationOptions = useMemo(() => {
    const options = [
      <SelectItem key="all" className="text-white">Tous</SelectItem>,
      <SelectItem key="unassigned" className="text-white">Non assignés</SelectItem>
    ]
    
    if (user && user.role === 'support') {
      options.push(<SelectItem key="me" className="text-white">Mes tickets</SelectItem>)
    }
    
    supports.forEach((support) => {
      options.push(
        <SelectItem key={support.id.toString()} className="text-white">
          {support.nom_utilisateur}
        </SelectItem>
      )
    })
    
    return options
  }, [user?.role, supports])

  // Effets
  useEffect(() => {
    if (user && ['admin', 'support'].includes(user.role)) {
      loadTickets()
    }
  }, [user, statusFilter, assignedFilter, currentPage])

  if (!user || !['admin', 'support'].includes(user.role)) {
    return (
      <div className="min-h-screen bg-background text-foreground font-sans relative">
        <Navigation />
        <div className="absolute h-screen w-full opacity-20 max-md:mask-b-from-10% max-md:mask-b-to-70% md:mask-radial-from-10% md:mask-radial-to-70% md:mask-radial-at-top bg-main-overlay" style={{ inset: 0 as unknown as number }} />
        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <Spinner color="primary" size="lg" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground font-sans relative">
      <Navigation />

      {/* voile violet en arrière-plan, calqué sur la page d'accueil */}
      <div
        className="absolute h-screen w-full opacity-20 max-md:mask-b-from-10% max-md:mask-b-to-70% md:mask-radial-from-10% md:mask-radial-to-70% md:mask-radial-at-top bg-main-overlay"
        style={{ inset: 0 as unknown as number }}
      />

      {/* Breadcrumbs */}
      <div className="relative z-10 pt-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <AdminBreadcrumbs 
            items={[
              { label: "Administration", href: "/admin", icon: "fas fa-shield-alt" },
              { label: "Support", icon: "fas fa-headset" }
            ]} 
          />
        </div>
      </div>

      {/* Contenu principal */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">

        {/* Statistiques principales en cartes élégantes */}
        <div className="mb-20">
          <h2 className="text-4xl font-bold mb-8 text-white text-center">
            <i className="fas fa-chart-bar text-purple-500 mr-3"></i>
            Statistiques du Support
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-gradient-to-br from-blue-500/20 to-blue-800/20 border border-blue-500/30 backdrop-blur-sm">
              <CardBody className="text-center p-6">
                <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-inbox text-2xl text-blue-400"></i>
                </div>
                <div className="text-3xl font-bold text-blue-400 mb-2">{tickets.filter(t => t.status === 'open').length}</div>
                <div className="text-blue-300">Nouveaux</div>
              </CardBody>
            </Card>

            <Card className="bg-gradient-to-br from-orange-500/20 to-orange-800/20 border border-orange-500/30 backdrop-blur-sm">
              <CardBody className="text-center p-6">
                <div className="w-12 h-12 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-clock text-2xl text-orange-400"></i>
                </div>
                <div className="text-3xl font-bold text-orange-400 mb-2">{tickets.filter(t => t.status === 'in_progress').length}</div>
                <div className="text-orange-300">En cours</div>
              </CardBody>
            </Card>

            <Card className="bg-gradient-to-br from-purple-500/20 to-purple-800/20 border border-purple-500/30 backdrop-blur-sm">
              <CardBody className="text-center p-6">
                <div className="w-12 h-12 bg-main-overlay/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-user-clock text-2xl text-purple-400"></i>
                </div>
                <div className="text-3xl font-bold text-purple-400 mb-2">{tickets.filter(t => t.status === 'waiting_user').length}</div>
                <div className="text-purple-300">En attente</div>
              </CardBody>
            </Card>

            <Card className="bg-gradient-to-br from-green-500/20 to-green-800/20 border border-green-500/30 backdrop-blur-sm">
              <CardBody className="text-center p-6">
                <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-check-circle text-2xl text-green-400"></i>
                </div>
                <div className="text-3xl font-bold text-green-400 mb-2">{tickets.filter(t => ['resolved', 'closed'].includes(t.status)).length}</div>
                <div className="text-green-300">Résolus</div>
              </CardBody>
            </Card>
          </div>
        </div>

        {/* Section Filtres et Actions */}
        <div className="mb-20">
          <h2 className="text-4xl font-bold mb-8 text-white text-center">
            <i className="fas fa-filter text-purple-500 mr-3"></i>
            Filtres et Actions
          </h2>
          <Card className="bg-gradient-to-br from-gray-800/20 to-gray-900/20 border border-gray-500/30 backdrop-blur-sm">
            <CardBody className="p-6">
              <div className="flex flex-wrap gap-4 items-end">
                <Select
                  label="Statut"
                  selectedKeys={[statusFilter]}
                  onSelectionChange={(keys) => {
                    const selectedKey = Array.from(keys)[0] as string
                    setStatusFilter(selectedKey)
                    setCurrentPage(1)
                  }}
                  className="w-48"
                  size="sm"
                  variant="bordered"
                  classNames={{
                    base: "max-w-xs",
                    trigger: "bg-gray-800/50 border-white/20 text-white",
                    label: "text-white",
                    value: "text-white",
                  }}
                >
                  <SelectItem key="all" className="text-white">Tous</SelectItem>
                  <SelectItem key="open" className="text-white">Ouvert</SelectItem>
                  <SelectItem key="in_progress" className="text-white">En cours</SelectItem>
                  <SelectItem key="waiting_user" className="text-white">En attente utilisateur</SelectItem>
                  <SelectItem key="resolved" className="text-white">Résolu</SelectItem>
                  <SelectItem key="closed" className="text-white">Fermé</SelectItem>
                </Select>

                <Select
                  label="Assignation"
                  selectedKeys={[assignedFilter]}
                  onSelectionChange={(keys) => {
                    const selectedKey = Array.from(keys)[0] as string
                    setAssignedFilter(selectedKey)
                    setCurrentPage(1)
                  }}
                  className="w-48"
                  size="sm"
                  variant="bordered"
                  classNames={{
                    base: "max-w-xs",
                    trigger: "bg-gray-800/50 border-white/20 text-white",
                    label: "text-white",
                    value: "text-white",
                  }}
                >
                  {assignationOptions}
                </Select>

                <Button
                  color="primary"
                  variant="shadow"
                  onPress={() => {
                    setStatusFilter('all')
                    setAssignedFilter('all')
                    setCurrentPage(1)
                  }}
                  startContent={<i className="fas fa-redo"></i>}
                  size="sm"
                  className="bg-gradient-to-r from-purple-500 to-pink-600"
                >
                  Réinitialiser
                </Button>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Section Table des tickets */}
        <div className="mb-20">
          <h2 className="text-4xl font-bold mb-8 text-white text-center">
            <i className="fas fa-ticket-alt text-purple-500 mr-3"></i>
            Tickets de Support ({totalItems})
          </h2>
          <Card className="bg-gradient-to-br from-gray-800/20 to-gray-900/20 border border-gray-500/30 backdrop-blur-sm">
            <CardHeader className="border-b border-white/10">
              <div className="flex justify-between items-center w-full">
                <h3 className="text-xl font-bold text-white">
                  Gestion des Tickets
                </h3>
                <Button
                  color="primary"
                  variant="shadow"
                  onPress={loadTickets}
                  isLoading={loading}
                  startContent={<i className="fas fa-sync-alt"></i>}
                  size="sm"
                  className="bg-gradient-to-r from-purple-500 to-pink-600"
                >
                  Actualiser
                </Button>
              </div>
            </CardHeader>
        <CardBody className="p-0">
          {loading ? (
            <div className="flex justify-center py-8">
              <Spinner color="primary" />
            </div>
          ) : tickets.length === 0 ? (
            <div className="text-center py-8">
              <i className="fas fa-inbox text-6xl text-gray-500 mb-4"></i>
              <p className="text-gray-400">Aucun ticket trouvé</p>
            </div>
          ) : (
            <Table aria-label="Tickets de support" className="text-white">
              <TableHeader>
                <TableColumn>TICKET</TableColumn>
                <TableColumn>UTILISATEUR</TableColumn>
                <TableColumn>STATUT</TableColumn>
                <TableColumn>ASSIGNÉ À</TableColumn>
                <TableColumn>DERNIÈRE ACTIVITÉ</TableColumn>
                <TableColumn>ACTIONS</TableColumn>
              </TableHeader>
              <TableBody>
                {tickets.map((ticket) => (
                  <TableRow key={ticket.id}>
                    <TableCell>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold">#{ticket.id}</span>
                          <Chip size="sm" color={getPriorityColor(ticket.priority)} variant="flat">
                            {ticket.priority}
                          </Chip>
                        </div>
                        <p className="font-medium text-sm truncate max-w-xs">{ticket.subject}</p>
                        <p className="text-xs text-gray-400">{getTypeLabel(ticket.type)}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar
                          src={ticket.creator_photo}
                          size="sm"
                          showFallback
                          fallback={<i className="fas fa-user"></i>}
                        />
                        <div>
                          <p className="font-medium text-sm">{ticket.creator_name}</p>
                          <p className="text-xs text-gray-400">{ticket.creator_email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Chip
                        color={getStatusColor(ticket.status)}
                        variant="shadow"
                        size="sm"
                      >
                        {getStatusLabel(ticket.status)}
                      </Chip>
                    </TableCell>
                    <TableCell>
                      {ticket.assigned_to_name ? (
                        <div className="flex items-center gap-2">
                          <Avatar
                            src={ticket.assigned_to_photo}
                            size="sm"
                            showFallback
                            fallback={<i className="fas fa-user"></i>}
                          />
                          <span className="text-sm">{ticket.assigned_to_name}</span>
                        </div>
                      ) : (
                        <span className="text-gray-400 text-sm">Non assigné</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm">
                          {new Date(ticket.updated_at).toLocaleDateString('fr-FR')}
                        </p>
                        <p className="text-xs text-gray-400">
                          {ticket.message_count} message{ticket.message_count > 1 ? 's' : ''}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          isIconOnly
                          onPress={() => openTicketDetail(ticket)}
                        >
                          <i className="fas fa-eye"></i>
                        </Button>
                        <Dropdown>
                          <DropdownTrigger>
                            <Button size="sm" variant="ghost" isIconOnly>
                              <i className="fas fa-ellipsis-v"></i>
                            </Button>
                          </DropdownTrigger>
                          <DropdownMenu
                            classNames={{
                              base: "bg-gray-800/90 border border-gray-600/50",
                              list: "bg-gray-800/90"
                            }}
                          >
                            <DropdownItem
                              key="assign-to-me"
                              startContent={<i className="fas fa-user-plus text-blue-400"></i>}
                              onPress={() => assignTicket(ticket.id, user.id)}
                              className="text-white hover:bg-blue-600/20 focus:bg-blue-600/20"
                            >
                              M'assigner
                            </DropdownItem>
                            {ticket.assigned_to_id ? (
                              <DropdownItem
                                key="unassign"
                                startContent={<i className="fas fa-user-minus text-orange-400"></i>}
                                onPress={() => assignTicket(ticket.id, null)}
                                className="text-white hover:bg-orange-600/20 focus:bg-orange-600/20"
                              >
                                Désassigner
                              </DropdownItem>
                            ) : null}
                            <DropdownItem
                              key="change-status"
                              startContent={<i className="fas fa-edit text-purple-400"></i>}
                              onPress={() => {
                                setSelectedTicket(ticket)
                                onStatusModalOpen()
                              }}
                              className="text-white hover:bg-purple-600/20 focus:bg-purple-600/20"
                            >
                              Changer statut
                            </DropdownItem>
                          </DropdownMenu>
                        </Dropdown>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardBody>
            {totalPages > 1 && (
              <div className="flex justify-center p-4">
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
        </div>
      </div>

      {/* Bouton scroll vers le haut */}
      <div className="fixed bottom-8 right-8 z-50">
        <Button
          isIconOnly
          color="primary"
          variant="shadow"
          size="lg"
          className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 transition-all duration-300 animate-bounce"
          onPress={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          <i className="fas fa-arrow-up text-white text-xl"></i>
        </Button>
      </div>

      {/* Modal de détail du ticket */}
      <Modal 
        isOpen={isDetailModalOpen} 
        onOpenChange={onDetailModalOpenChange} 
        size="4xl"
        scrollBehavior="inside"
      >
        <ModalContent className="bg-gradient-to-br from-gray-900/95 to-black/95 border border-purple-500/30 backdrop-blur-xl max-h-[90vh]">
          {(onClose) => (
            <>
              <ModalHeader className="border-b border-white/10">
                {selectedTicket && (
                  <div className="flex items-center justify-between w-full">
                    <div>
                      <h3 className="text-white text-xl font-bold">
                        #{selectedTicket.id} - {selectedTicket.subject}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Chip
                          size="sm"
                          color={getStatusColor(selectedTicket.status)}
                          variant="shadow"
                        >
                          {getStatusLabel(selectedTicket.status)}
                        </Chip>
                        <span className="text-gray-400 text-sm">
                          {getTypeLabel(selectedTicket.type)}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        color="primary"
                        variant="ghost"
                        onPress={() => {
                          onClose()
                          onStatusModalOpen()
                        }}
                        startContent={<i className="fas fa-edit"></i>}
                      >
                        Changer statut
                      </Button>
                    </div>
                  </div>
                )}
              </ModalHeader>
              <ModalBody className="p-0">
                {selectedTicket && (
                  <div className="flex flex-col h-[60vh]">
                    {/* Informations du ticket */}
                    <div className="p-4 border-b border-white/10 bg-gray-800/30">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center gap-3">
                          <Avatar
                            src={selectedTicket.creator_photo}
                            showFallback
                            fallback={<i className="fas fa-user"></i>}
                          />
                          <div>
                            <p className="text-white font-medium">{selectedTicket.creator_name}</p>
                            <p className="text-gray-400 text-sm">{selectedTicket.creator_email}</p>
                          </div>
                        </div>
                        {selectedTicket.assigned_to_name && (
                          <div className="flex items-center gap-3">
                            <Avatar
                              src={selectedTicket.assigned_to_photo}
                              showFallback
                              fallback={<i className="fas fa-user"></i>}
                            />
                            <div>
                              <p className="text-white font-medium">{selectedTicket.assigned_to_name}</p>
                              <p className="text-gray-400 text-sm">Support assigné</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Messages */}
                    <ScrollShadow className="flex-1 p-4">
                      <div className="space-y-4">
                        {messages.map((message) => {
                          const isSystem = message.message_type === 'system_message'
                          // Vérifier si c'est le créateur du ticket qui envoie le message
                          const isTicketCreator = selectedTicket && message.user_id === selectedTicket.creator_id
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
                      </div>
                    </ScrollShadow>

                    {/* Zone de réponse */}
                    {selectedTicket.status !== 'closed' && (
                      <div className="p-4 border-t border-white/10 bg-gray-800/30">
                        <div className="flex gap-3">
                          <Textarea
                            placeholder="Tapez votre réponse..."
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            minRows={2}
                            maxRows={4}
                            className="flex-1"
                            classNames={{
                              input: "text-white bg-gray-800/50",
                              inputWrapper: "bg-gray-800/50 border-white/20"
                            }}
                          />
                          <Button
                            color="primary"
                            onPress={sendMessage}
                            isLoading={submitting}
                            isDisabled={!newMessage.trim()}
                            startContent={<i className="fas fa-paper-plane"></i>}
                          >
                            Envoyer
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Modal de changement de statut */}
      <Modal isOpen={isStatusModalOpen} onOpenChange={onStatusModalOpenChange}>
        <ModalContent className="bg-gradient-to-br from-gray-900/95 to-black/95 border border-purple-500/30 backdrop-blur-xl">
          {(onClose) => (
            <>
              <ModalHeader className="text-white">
                Changer le statut du ticket
              </ModalHeader>
              <ModalBody>
                <Select
                  label="Nouveau statut"
                  selectedKeys={newStatus ? [newStatus] : []}
                  onSelectionChange={(keys) => {
                    const selectedKey = Array.from(keys)[0] as string
                    setNewStatus(selectedKey)
                  }}
                  variant="bordered"
                  classNames={{
                    trigger: "bg-gray-800/50 border-white/20 text-white",
                    label: "text-white",
                    value: "text-white",
                  }}
                >
                  <SelectItem key="open" className="text-white">Ouvert</SelectItem>
                  <SelectItem key="in_progress" className="text-white">En cours</SelectItem>
                  <SelectItem key="waiting_user" className="text-white">En attente utilisateur</SelectItem>
                  <SelectItem key="resolved" className="text-white">Résolu</SelectItem>
                  <SelectItem key="closed" className="text-white">Fermé</SelectItem>
                </Select>
                <Textarea
                  label="Raison (optionnel)"
                  placeholder="Expliquez pourquoi vous changez le statut..."
                  value={statusReason}
                  onChange={(e) => setStatusReason(e.target.value)}
                  className="text-white"
                  classNames={{
                    input: "text-white bg-gray-800/50",
                    inputWrapper: "bg-gray-800/50 border-white/20"
                  }}
                />
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Annuler
                </Button>
                <Button
                  color="primary"
                  onPress={changeTicketStatus}
                  isLoading={submitting}
                  isDisabled={!newStatus}
                >
                  Changer le statut
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Modal pour les messages d'erreur/succès */}
      <Modal isOpen={isMessageModalOpen} onOpenChange={onMessageModalOpenChange} size="md">
        <ModalContent className="bg-gradient-to-br from-gray-900/95 to-black/95 border border-purple-500/30 backdrop-blur-xl">
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
    </div>
  )
}
