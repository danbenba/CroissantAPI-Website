'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { useRouter } from 'next/navigation'
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
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
  Textarea,
  Select,
  SelectItem,
  Switch,
  DatePicker,
  CheckboxGroup,
  Checkbox
} from '@heroui/react'
import { secureGet, securePost, securePut, secureDelete } from '@/lib/api-client'
import { 
  Plus, 
  Edit, 
  Trash2, 
  MoreVertical, 
  Eye, 
  MousePointer,
  TrendingUp,
  Settings
} from 'lucide-react'
import { parseDate } from '@internationalized/date'

interface Ad {
  id: number
  title: string
  description?: string
  image_url?: string
  link_url?: string
  ad_type: string
  ad_format: string
  google_ad_slot?: string
  google_ad_format?: string
  target_roles: string[]
  position_priority: number
  is_active: boolean
  start_date?: string
  end_date?: string
  total_views: number
  total_clicks: number
  created_by_username?: string
  created_at: string
}

const adTypes = [
  { key: 'popup', label: 'Popup' },
  { key: 'banner_top', label: 'Bannière Haut' },
  { key: 'banner_bottom', label: 'Bannière Bas' },
  { key: 'sidebar_left', label: 'Sidebar Gauche' },
  { key: 'sidebar_right', label: 'Sidebar Droite' },
  { key: 'inline_content', label: 'Contenu Inline' }
]

const roles = [
  { key: 'gratuit', label: 'Gratuit' },
  { key: 'plus', label: 'Plus' },
  { key: 'ultra', label: 'Ultra' }
]

const adFormats = [
  { key: 'custom', label: 'Publicité Custom' },
  { key: 'google_ads', label: 'Google AdSense' }
]

const googleAdFormats = [
  { key: 'auto', label: 'Automatique' },
  { key: 'rectangle', label: 'Rectangle' },
  { key: 'leaderboard', label: 'Leaderboard' },
  { key: 'banner', label: 'Bannière' },
  { key: 'large-mobile-banner', label: 'Grande bannière mobile' },
  { key: 'medium-rectangle', label: 'Rectangle moyen' }
]

export default function AdminAdsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [ads, setAds] = useState<Ad[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedAd, setSelectedAd] = useState<Ad | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create')

  // États du formulaire
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image_url: '',
    link_url: '',
    ad_type: 'banner_top',
    ad_format: 'custom',
    google_ad_slot: '',
    google_ad_format: 'auto',
    target_roles: ['gratuit', 'plus'],
    position_priority: 1,
    is_active: true,
    start_date: '',
    end_date: ''
  })

  useEffect(() => {
    if (user?.role !== 'admin') {
      router.push('/')
      return
    }
    fetchAds()
  }, [user, router])

  const fetchAds = async () => {
    try {
      const response = await secureGet('/api/admin/ads')
      if (response.ok) {
        const data = await response.json()
        setAds(data.ads || [])
      }
    } catch (error) {
      console.error('Erreur chargement publicités:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateAd = () => {
    setModalMode('create')
    setFormData({
      title: '',
      description: '',
      image_url: '',
      link_url: '',
      ad_type: 'banner_top',
      ad_format: 'custom',
      google_ad_slot: '',
      google_ad_format: 'auto',
      target_roles: ['gratuit', 'plus'],
      position_priority: 1,
      is_active: true,
      start_date: '',
      end_date: ''
    })
    setShowModal(true)
  }

  const handleEditAd = (ad: Ad) => {
    setModalMode('edit')
    setSelectedAd(ad)
    setFormData({
      title: ad.title,
      description: ad.description || '',
      image_url: ad.image_url || '',
      link_url: ad.link_url || '',
      ad_type: ad.ad_type,
      ad_format: ad.ad_format || 'custom',
      google_ad_slot: ad.google_ad_slot || '',
      google_ad_format: ad.google_ad_format || 'auto',
      target_roles: ad.target_roles,
      position_priority: ad.position_priority,
      is_active: ad.is_active,
      start_date: ad.start_date || '',
      end_date: ad.end_date || ''
    })
    setShowModal(true)
  }

  const handleSubmit = async () => {
    try {
      const url = modalMode === 'create' ? '/api/admin/ads' : `/api/admin/ads/${selectedAd?.id}`
      const method = modalMode === 'create' ? 'POST' : 'PUT'
      
      // Nettoyer les données avant l'envoi
      const cleanedData = {
        ...formData,
        start_date: formData.start_date || null,
        end_date: formData.end_date || null,
        description: formData.description || null,
        image_url: formData.image_url || null,
        link_url: formData.link_url || null,
        google_ad_slot: formData.google_ad_slot || null
      }
      
      const response = method === 'POST' 
        ? await securePost(url, cleanedData)
        : await securePut(url, cleanedData)

      if (response.ok) {
        setShowModal(false)
        fetchAds()
      }
    } catch (error) {
      console.error('Erreur sauvegarde publicité:', error)
    }
  }

  const handleDeleteAd = async (id: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette publicité ?')) return

    try {
      const response = await secureDelete(`/api/admin/ads/${id}`)
      if (response.ok) {
        fetchAds()
      }
    } catch (error) {
      console.error('Erreur suppression publicité:', error)
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'popup': return 'danger'
      case 'banner_top': return 'primary'
      case 'banner_bottom': return 'secondary'
      case 'sidebar_left': return 'success'
      case 'sidebar_right': return 'warning'
      default: return 'default'
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'gratuit': return 'default'
      case 'plus': return 'primary'
      case 'ultra': return 'success'
      default: return 'default'
    }
  }

  if (!user || user.role !== 'admin') {
    return null
  }

  return (
    <div className="min-h-screen bg-background text-foreground font-sans relative">
      <Navigation />

      {/* voile violet en arrière-plan, identique à la page d'accueil */}
      <div
        className="absolute h-screen w-full opacity-20 max-md:mask-b-from-10% max-md:mask-b-to-70% md:mask-radial-from-10% md:mask-radial-to-70% md:mask-radial-at-top bg-purple-500"
        style={{ inset: 0 as unknown as number }}
      />

      {/* Hero Section */}
      <div className="relative z-10 min-h-screen flex items-center justify-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <AdminBreadcrumbs
            items={[
              { label: "Administration", href: "/admin", icon: "fas fa-shield-alt" },
              { label: "Publicités", icon: "fas fa-ad" }
            ]}
          />

          {/* Titre principal */}
          <h1 className="text-6xl md:text-8xl font-extrabold mb-8 tracking-tight text-white" 
              style={{textShadow: '2px 2px 20px rgba(0,0,0,0.5)'}}>
            Publicités
          </h1>
          
          <h2 className="text-2xl md:text-4xl font-bold text-white mb-12" 
              style={{textShadow: '1px 1px 10px rgba(0,0,0,0.5)'}}>
            Système <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">Publicitaire</span>
          </h2>
          
          <p className="text-lg md:text-xl text-gray-200 max-w-3xl mx-auto mb-8 leading-relaxed"
             style={{textShadow: '1px 1px 5px rgba(0,0,0,0.5)'}}>
            Gérez les publicités affichées selon les rôles utilisateur et analysez les performances
          </p>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="relative z-10 bg-background">
        <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">

          {/* Statistiques */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <Card className="bg-default-50/80 backdrop-blur-sm border-default-200">
              <CardBody className="flex flex-row items-center gap-4 py-4 px-6">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                  <Eye className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-default-600">Total Vues</p>
                  <p className="text-2xl font-bold">
                    {ads.reduce((acc, ad) => acc + ad.total_views, 0).toLocaleString()}
                  </p>
                </div>
              </CardBody>
            </Card>

            <Card className="bg-default-50/80 backdrop-blur-sm border-default-200">
              <CardBody className="flex flex-row items-center gap-4 py-4 px-6">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                  <MousePointer className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-default-600">Total Clics</p>
                  <p className="text-2xl font-bold">
                    {ads.reduce((acc, ad) => acc + ad.total_clicks, 0).toLocaleString()}
                  </p>
                </div>
              </CardBody>
            </Card>

            <Card className="bg-default-50/80 backdrop-blur-sm border-default-200">
              <CardBody className="flex flex-row items-center gap-4 py-4 px-6">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-default-600">Publicités Actives</p>
                  <p className="text-2xl font-bold">
                    {ads.filter(ad => ad.is_active).length}
                  </p>
                </div>
              </CardBody>
            </Card>
          </div>

          {/* Actions */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <Button
                color="primary"
                variant="shadow"
                size="lg"
                startContent={<Plus className="w-5 h-5" />}
                onPress={handleCreateAd}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
              >
                Créer une Publicité
              </Button>
            </div>
          </div>

          {/* Table des publicités */}
          <Card className="bg-default-50/80 backdrop-blur-sm border-default-200">
            <CardHeader className="pb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-rose-600 rounded-xl flex items-center justify-center">
                  <Settings className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold">Liste des Publicités</h3>
                  <p className="text-default-600">Gérez vos campagnes publicitaires</p>
                </div>
              </div>
            </CardHeader>
            <CardBody>
              <Table 
                aria-label="Table des publicités"
                classNames={{
                  wrapper: "bg-transparent",
                  th: "bg-default-100/50 text-default-700",
                  td: "border-b border-default-200"
                }}
              >
                <TableHeader>
                  <TableColumn>TITRE</TableColumn>
                  <TableColumn>TYPE</TableColumn>
                  <TableColumn>FORMAT</TableColumn>
                  <TableColumn>RÔLES CIBLES</TableColumn>
                  <TableColumn>STATUT</TableColumn>
                  <TableColumn>STATISTIQUES</TableColumn>
                  <TableColumn>ACTIONS</TableColumn>
                </TableHeader>
                <TableBody>
                  {ads.map((ad) => (
                    <TableRow key={ad.id}>
                      <TableCell>
                        <div>
                          <p className="font-semibold">{ad.title}</p>
                          <p className="text-sm text-gray-500">{ad.description?.substring(0, 50)}...</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Chip color={getTypeColor(ad.ad_type)} variant="flat" size="sm">
                          {adTypes.find(t => t.key === ad.ad_type)?.label || ad.ad_type}
                        </Chip>
                      </TableCell>
                      <TableCell>
                        <Chip color={ad.ad_format === 'google_ads' ? 'warning' : 'primary'} variant="flat" size="sm">
                          {ad.ad_format === 'google_ads' ? 'Google AdSense' : 'Custom'}
                        </Chip>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1 flex-wrap">
                          {ad.target_roles.map((role) => (
                            <Chip
                              key={role}
                              color={getRoleColor(role)}
                              variant="flat"
                              size="sm"
                            >
                              {roles.find(r => r.key === role)?.label || role}
                            </Chip>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Chip color={ad.is_active ? 'success' : 'danger'} variant="flat" size="sm">
                          {ad.is_active ? 'Actif' : 'Inactif'}
                        </Chip>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p>{ad.total_views.toLocaleString()} vues</p>
                          <p>{ad.total_clicks.toLocaleString()} clics</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Dropdown>
                          <DropdownTrigger>
                            <Button
                              isIconOnly
                              variant="light"
                              size="sm"
                            >
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownTrigger>
                          <DropdownMenu aria-label="Actions">
                            <DropdownItem
                              key="edit"
                              startContent={<Edit className="w-4 h-4" />}
                              onPress={() => handleEditAd(ad)}
                            >
                              Modifier
                            </DropdownItem>
                            <DropdownItem
                              key="delete"
                              className="text-danger"
                              color="danger"
                              startContent={<Trash2 className="w-4 h-4" />}
                              onPress={() => handleDeleteAd(ad.id)}
                            >
                              Supprimer
                            </DropdownItem>
                          </DropdownMenu>
                        </Dropdown>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardBody>
          </Card>
        </div>
      </div>

      {/* Modal Créer/Modifier */}
      <Modal 
        isOpen={showModal} 
        onClose={() => setShowModal(false)}
        size="2xl"
        scrollBehavior="inside"
        classNames={{
          base: "bg-background border border-default-200",
          header: "border-b border-default-200",
          body: "py-6",
          footer: "border-t border-default-200"
        }}
      >
        <ModalContent>
          <ModalHeader>
            <h3 className="text-xl font-bold">
              {modalMode === 'create' ? 'Créer une Publicité' : 'Modifier la Publicité'}
            </h3>
          </ModalHeader>
          <ModalBody>
            <div className="space-y-4">
              <Input
                label="Titre"
                placeholder="Titre de la publicité"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              />

              <Textarea
                label="Description"
                placeholder="Description de la publicité"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              />

              <Select
                label="Format de publicité"
                selectedKeys={[formData.ad_format]}
                onSelectionChange={(keys) => setFormData(prev => ({ 
                  ...prev, 
                  ad_format: Array.from(keys)[0] as string 
                }))}
              >
                {adFormats.map((format) => (
                  <SelectItem key={format.key}>
                    {format.label}
                  </SelectItem>
                ))}
              </Select>

              <Select
                label="Type de publicité"
                selectedKeys={[formData.ad_type]}
                onSelectionChange={(keys) => setFormData(prev => ({ 
                  ...prev, 
                  ad_type: Array.from(keys)[0] as string 
                }))}
              >
                {adTypes.map((type) => (
                  <SelectItem key={type.key}>
                    {type.label}
                  </SelectItem>
                ))}
              </Select>

              {/* Champs conditionnels selon le format */}
              {formData.ad_format === 'custom' ? (
                <>
                  <Input
                    label="URL de l'image"
                    placeholder="https://example.com/image.jpg"
                    value={formData.image_url}
                    onChange={(e) => setFormData(prev => ({ ...prev, image_url: e.target.value }))}
                  />

                  <Input
                    label="URL de destination"
                    placeholder="https://example.com"
                    value={formData.link_url}
                    onChange={(e) => setFormData(prev => ({ ...prev, link_url: e.target.value }))}
                  />
                </>
              ) : (
                <>
                  <Input
                    label="Slot ID Google AdSense"
                    placeholder="1234567890"
                    value={formData.google_ad_slot}
                    onChange={(e) => setFormData(prev => ({ ...prev, google_ad_slot: e.target.value }))}
                  />

                  <Select
                    label="Format Google AdSense"
                    selectedKeys={[formData.google_ad_format]}
                    onSelectionChange={(keys) => setFormData(prev => ({ 
                      ...prev, 
                      google_ad_format: Array.from(keys)[0] as string 
                    }))}
                  >
                    {googleAdFormats.map((format) => (
                      <SelectItem key={format.key}>
                        {format.label}
                      </SelectItem>
                    ))}
                  </Select>
                </>
              )}

              <CheckboxGroup
                label="Rôles cibles"
                value={formData.target_roles}
                onValueChange={(value) => setFormData(prev => ({ ...prev, target_roles: value }))}
              >
                {roles.map((role) => (
                  <Checkbox key={role.key} value={role.key}>
                    {role.label}
                  </Checkbox>
                ))}
              </CheckboxGroup>

              <Input
                type="number"
                label="Priorité d'affichage"
                placeholder="1"
                value={formData.position_priority.toString()}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  position_priority: parseInt(e.target.value) || 1 
                }))}
              />

              <Switch
                isSelected={formData.is_active}
                onValueChange={(value) => setFormData(prev => ({ ...prev, is_active: value }))}
              >
                Publicité active
              </Switch>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={() => setShowModal(false)}>
              Annuler
            </Button>
            <Button 
              color="primary" 
              onPress={handleSubmit}
              className="bg-gradient-to-r from-blue-500 to-purple-600"
            >
              {modalMode === 'create' ? 'Créer' : 'Sauvegarder'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  )
}
