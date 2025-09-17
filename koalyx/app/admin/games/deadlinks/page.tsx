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
  Badge,
  Link
} from "@heroui/react"
import { secureGet, securePatch } from '@/lib/api-client'

interface DeadLinkReport {
  link_id: number
  link_title: string
  link_description: string
  download_url: string
  icon_url: string
  game_id: number
  game_title: string
  game_banner: string
  report_count: number
  first_report: string
  last_report: string
  user_names: string
  report_dates: string
  priority: 'urgent' | 'medium' | 'low'
}

export default function DeadLinksPage() {
  const { user } = useAuth()
  const [reports, setReports] = useState<DeadLinkReport[]>([])
  const [loading, setLoading] = useState(true)
  const [processingReport, setProcessingReport] = useState<number | null>(null)
  const [selectedReport, setSelectedReport] = useState<DeadLinkReport | null>(null)
  
  const { isOpen: isDetailModalOpen, onOpen: onDetailModalOpen, onOpenChange: onDetailModalOpenChange, onClose: onDetailModalClose } = useDisclosure()
  const { isOpen: isResolveModalOpen, onOpen: onResolveModalOpen, onOpenChange: onResolveModalOpenChange, onClose: onResolveModalClose } = useDisclosure()
  const { isOpen: isDismissModalOpen, onOpen: onDismissModalOpen, onOpenChange: onDismissModalOpenChange, onClose: onDismissModalClose } = useDisclosure()

  // Redirection si non admin
  useEffect(() => {
    if (user && user.role !== 'admin') {
      window.location.href = '/admin'
    }
  }, [user])

  // Charger les signalements
  useEffect(() => {
    if (user?.role === 'admin') {
      loadReports()
    }
  }, [user])

  const loadReports = async () => {
    try {
      setLoading(true)
      const response = await secureGet('/api/dead-links')
      const data = await response.json()
      
      if (data.success) {
        setReports(data.reports)
      }
    } catch (error) {
      console.error('Erreur lors du chargement des signalements:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAction = async (linkId: number, action: 'resolve' | 'dismiss') => {
    setProcessingReport(linkId)
    try {
      const response = await securePatch(`/api/admin/games/dead-links/${linkId}/resolve`, { action })

      const data = await response.json()
      
      if (data.success) {
        // Retirer le signalement de la liste
        setReports(prev => prev.filter(report => report.link_id !== linkId))
        // Fermer toutes les modales
        onResolveModalClose()
        onDismissModalClose()
        onDetailModalClose()
        setSelectedReport(null)
      } else {
        alert(data.message || 'Erreur lors du traitement')
      }
    } catch (error) {
      console.error('Erreur lors du traitement:', error)
      alert('Erreur lors du traitement du signalement')
    } finally {
      setProcessingReport(null)
    }
  }

  const openDetailModal = (report: DeadLinkReport) => {
    setSelectedReport(report)
    onDetailModalOpen()
  }

  const openResolveModal = (report: DeadLinkReport) => {
    setSelectedReport(report)
    onResolveModalOpen()
  }

  const openDismissModal = (report: DeadLinkReport) => {
    setSelectedReport(report)
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
      case 'urgent': return 'Urgent (5+ signalements)'
      case 'medium': return 'Moyen (3-4 signalements)'
      case 'low': return 'Faible (1-2 signalements)'
      default: return 'Inconnu'
    }
  }

  const parseUserData = (userNames: string, reportDates: string) => {
    const names = userNames.split('|')
    const dates = reportDates.split('|')
    
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
                base: "bg-gradient-to-r from-red-500 to-red-700 border-small border-white/20 shadow-lg",
                content: "text-white font-semibold text-sm px-2"
              }}
              startContent={<i className="fas fa-skull-crossbones"></i>}
            >
              Administration
            </Chip>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white via-purple-200 to-white bg-clip-text text-transparent">
            Signalements de Liens Morts
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Gérez les signalements de liens de téléchargement défaillants
          </p>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gray-800/50 backdrop-blur-lg border border-white/10">
            <CardBody className="p-6 text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <i className="fas fa-list text-white text-xl"></i>
              </div>
              <p className="text-3xl font-bold text-white mb-2">{reports.length}</p>
              <p className="text-gray-400">Total signalements</p>
            </CardBody>
          </Card>
          
          <Card className="bg-gray-800/50 backdrop-blur-lg border border-white/10">
            <CardBody className="p-6 text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <i className="fas fa-exclamation-triangle text-white text-xl"></i>
              </div>
              <p className="text-3xl font-bold text-white mb-2">{reports.filter(r => r.priority === 'urgent').length}</p>
              <p className="text-gray-400">Urgents</p>
            </CardBody>
          </Card>
          
          <Card className="bg-gray-800/50 backdrop-blur-lg border border-white/10">
            <CardBody className="p-6 text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <i className="fas fa-clock text-white text-xl"></i>
              </div>
              <p className="text-3xl font-bold text-white mb-2">{reports.filter(r => r.priority === 'medium').length}</p>
              <p className="text-gray-400">Moyens</p>
            </CardBody>
          </Card>
          
          <Card className="bg-gray-800/50 backdrop-blur-lg border border-white/10">
            <CardBody className="p-6 text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <i className="fas fa-check-circle text-white text-xl"></i>
              </div>
              <p className="text-3xl font-bold text-white mb-2">{reports.filter(r => r.priority === 'low').length}</p>
              <p className="text-gray-400">Faibles</p>
            </CardBody>
          </Card>
        </div>

        {/* Bouton de rechargement */}
        <div className="mb-6">
          <Button
            color="primary"
            variant="shadow"
            onPress={loadReports}
            isLoading={loading}
            startContent={<i className="fas fa-sync-alt"></i>}
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
          >
            Actualiser
          </Button>
        </div>

        {/* Table des signalements */}
        <Card className="bg-gray-800/50 backdrop-blur-lg border border-white/10">
          <CardHeader>
            <h3 className="text-xl font-semibold text-white">Signalements en attente</h3>
          </CardHeader>
          <CardBody>
            {loading ? (
              <div className="flex justify-center py-8">
                <Spinner size="lg" color="primary" />
              </div>
            ) : reports.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-gradient-to-br from-gray-700 to-gray-900 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <i className="fas fa-check-circle text-3xl text-gray-400"></i>
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Aucun signalement</h3>
                <p className="text-gray-400">Tous les signalements ont été traités</p>
              </div>
            ) : (
              <Table 
                aria-label="Signalements de liens morts"
                classNames={{
                  wrapper: "bg-transparent",
                  th: "bg-gray-700/50 text-white",
                  td: "text-gray-300"
                }}
              >
                <TableHeader>
                  <TableColumn>LIEN</TableColumn>
                  <TableColumn>JEU</TableColumn>
                  <TableColumn>PRIORITÉ</TableColumn>
                  <TableColumn>SIGNALEMENTS</TableColumn>
                  <TableColumn>PREMIER SIGNALEMENT</TableColumn>
                  <TableColumn>DERNIER SIGNALEMENT</TableColumn>
                  <TableColumn>ACTIONS</TableColumn>
                </TableHeader>
                <TableBody>
                  {reports.map((report) => (
                    <TableRow key={report.link_id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar
                            src={report.icon_url || '/placeholder-icon.png'}
                            className="w-12 h-12"
                            isBordered
                          />
                          <div className="max-w-xs">
                            <p className="font-semibold text-white truncate">{report.link_title}</p>
                            <p className="text-sm text-gray-400 truncate">{report.link_description}</p>
                            <Link 
                              href={report.download_url} 
                              target="_blank" 
                              className="text-blue-400 hover:text-blue-300 text-xs"
                            >
                              Voir le lien <i className="fas fa-external-link-alt ml-1"></i>
                            </Link>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar
                            src={report.game_banner || '/placeholder-game.png'}
                            className="w-10 h-10"
                            isBordered
                          />
                          <div>
                            <p className="font-semibold text-white">{report.game_title}</p>
                            <p className="text-sm text-gray-400">ID: {report.game_id}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          color={getPriorityColor(report.priority) as any}
                          variant="shadow"
                          size="sm"
                        >
                          {getPriorityLabel(report.priority)}
                        </Chip>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          color="primary" 
                          content={report.report_count}
                          shape="circle"
                        >
                          <Button
                            size="sm"
                            variant="flat"
                            color="primary"
                            onPress={() => openDetailModal(report)}
                          >
                            Voir détails
                          </Button>
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm">
                          {new Date(report.first_report).toLocaleDateString('fr-FR')}
                        </p>
                        <p className="text-xs text-gray-400">
                          {new Date(report.first_report).toLocaleTimeString('fr-FR')}
                        </p>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm">
                          {new Date(report.last_report).toLocaleDateString('fr-FR')}
                        </p>
                        <p className="text-xs text-gray-400">
                          {new Date(report.last_report).toLocaleTimeString('fr-FR')}
                        </p>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Tooltip content="Marquer le lien comme mort">
                            <Button
                              size="sm"
                              color="danger"
                              variant="shadow"
                              isIconOnly
                              onPress={() => openResolveModal(report)}
                              isLoading={processingReport === report.link_id}
                            >
                              <i className="fas fa-skull-crossbones"></i>
                            </Button>
                          </Tooltip>
                          <Tooltip content="Rejeter les signalements">
                            <Button
                              size="sm"
                              color="success"
                              variant="shadow"
                              isIconOnly
                              onPress={() => openDismissModal(report)}
                              isLoading={processingReport === report.link_id}
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
                <h3 className="text-2xl font-bold text-white">Détails des signalements</h3>
                {selectedReport && (
                  <div>
                    <p className="text-gray-400">{selectedReport.link_title}</p>
                    <p className="text-sm text-gray-500">Jeu: {selectedReport.game_title}</p>
                  </div>
                )}
              </ModalHeader>
              <ModalBody>
                {selectedReport && (
                  <div className="space-y-4">
                    <div className="bg-gray-800/50 rounded-lg p-4">
                      <h4 className="text-lg font-semibold text-white mb-2">Informations du lien</h4>
                      <p className="text-gray-300 mb-2"><strong>Titre:</strong> {selectedReport.link_title}</p>
                      <p className="text-gray-300 mb-2"><strong>Description:</strong> {selectedReport.link_description}</p>
                      <p className="text-gray-300">
                        <strong>URL:</strong> 
                        <Link 
                          href={selectedReport.download_url} 
                          target="_blank" 
                          className="text-blue-400 hover:text-blue-300 ml-2"
                        >
                          {selectedReport.download_url} <i className="fas fa-external-link-alt ml-1"></i>
                        </Link>
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="text-lg font-semibold text-white mb-2">
                        Utilisateurs ayant signalé ({selectedReport.report_count})
                      </h4>
                      <div className="space-y-2 max-h-60 overflow-y-auto">
                        {parseUserData(selectedReport.user_names, selectedReport.report_dates).map((user, index) => (
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

      {/* Modale de confirmation - Marquer comme mort */}
      <Modal isOpen={isResolveModalOpen} onOpenChange={onResolveModalOpenChange} backdrop="blur">
        <ModalContent className="bg-black/95 backdrop-blur-xl border border-white/20 shadow-2xl">
          {(onClose) => (
            <>
              <ModalHeader className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-red-700 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <i className="fas fa-skull-crossbones text-3xl text-white"></i>
                </div>
                <h3 className="text-2xl font-bold text-white">Confirmer lien mort</h3>
              </ModalHeader>
              <ModalBody className="text-center">
                <p className="text-gray-300 mb-4">
                  Êtes-vous sûr de vouloir marquer ce lien comme mort ?
                </p>
                {selectedReport && (
                  <div className="bg-gray-800/50 rounded-lg p-4 mb-4">
                    <p className="text-white font-semibold mb-2">"{selectedReport.link_title}"</p>
                    <p className="text-gray-400 text-sm">{selectedReport.game_title}</p>
                  </div>
                )}
                <p className="text-gray-400 text-sm">
                  Cette action désactivera le lien et marquera tous les signalements comme résolus.
                </p>
              </ModalBody>
              <ModalFooter>
                <Button color="primary" variant="light" onPress={onClose}>
                  Annuler
                </Button>
                <Button 
                  color="danger" 
                  variant="shadow"
                  onPress={() => selectedReport && handleAction(selectedReport.link_id, 'resolve')}
                  isLoading={processingReport === selectedReport?.link_id}
                >
                  Confirmer lien mort
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
                <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <i className="fas fa-check text-3xl text-white"></i>
                </div>
                <h3 className="text-2xl font-bold text-white">Rejeter les signalements</h3>
              </ModalHeader>
              <ModalBody className="text-center">
                <p className="text-gray-300 mb-4">
                  Êtes-vous sûr de vouloir rejeter tous les signalements pour ce lien ?
                </p>
                {selectedReport && (
                  <div className="bg-gray-800/50 rounded-lg p-4 mb-4">
                    <p className="text-white font-semibold mb-2">"{selectedReport.link_title}"</p>
                    <p className="text-gray-400 text-sm">{selectedReport.game_title}</p>
                  </div>
                )}
                <p className="text-gray-400 text-sm">
                  Cette action marquera tous les signalements comme rejetés sans désactiver le lien.
                </p>
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Annuler
                </Button>
                <Button 
                  color="success" 
                  variant="shadow"
                  onPress={() => selectedReport && handleAction(selectedReport.link_id, 'dismiss')}
                  isLoading={processingReport === selectedReport?.link_id}
                >
                  Rejeter les signalements
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  )
}
