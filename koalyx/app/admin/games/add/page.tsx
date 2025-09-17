"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Navigation from '@/components/navigation'
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Input,
  Textarea,
  Select,
  SelectItem,
  Spinner,
  Switch,
  Divider,
  Progress,
  Chip,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Tooltip
} from "@heroui/react"
import { 
  PlusIcon, 
  TrashIcon,
  ArrowLeftIcon,
  CloudArrowUpIcon,
  LinkIcon,
  InformationCircleIcon,
  CheckCircleIcon,
  XMarkIcon,
  EyeIcon
} from "@heroicons/react/24/outline"
import { securePost, secureGet } from '@/lib/api-client'

interface Badge {
  id: number
  name: string
  display_name: string
  color: string
  icon: string
  description: string
}

interface DownloadLink {
  id?: number
  icon_url: string
  title: string
  description: string
  download_url: string
  is_vip: boolean
  access_level: 'free' | 'plus' | 'ultra' | 'differentiated'
  position: number
  is_differentiated?: boolean
  member_url?: string
  plus_url?: string
  ultra_url?: string
}

interface Category {
  id: number
  name: string
  type: string
  description?: string
}

interface GameFormData {
  title: string
  description: string
  banner_url: string
  zip_password: string
  is_vip: boolean
  access_level: 'free' | 'plus' | 'ultra'
  category_id: number
  platform: string
  specifications: string
  year: number
}

export default function AddGamePage() {
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>([])
  const [platforms, setPlatforms] = useState<string[]>([])
  const [years, setYears] = useState<number[]>([])
  const [badges, setBadges] = useState<Badge[]>([])
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [progress, setProgress] = useState(0)

  // Form states
  const [formData, setFormData] = useState<GameFormData>({
    title: '',
    description: '',
    banner_url: '',
    zip_password: '',
    is_vip: false,
    access_level: 'free',
    category_id: 0,
    platform: '',
    specifications: '',
    year: 2024
  })

  const [downloadLinks, setDownloadLinks] = useState<DownloadLink[]>([
    {
      icon_url: 'storage/icons/Mbutton/download.png',
      title: '',
      description: '',
      download_url: '',
      is_vip: false,
      access_level: 'free',
      position: 0
    }
  ])

  // Badge assignment states
  const [badgeData, setBadgeData] = useState({
    badgeId: 0,
    expiresAt: ''
  })

  // Modal states
  const { isOpen: isPreviewModalOpen, onOpen: onPreviewModalOpen, onClose: onPreviewModalClose } = useDisclosure()

  useEffect(() => {
    loadInitialData()
  }, [])

  const loadInitialData = async () => {
    setLoading(true)
    try {
      await Promise.all([
        fetchCategories(),
        generatePlatformsAndYears()
      ])
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await secureGet('/api/categories')
      const data = await response.json()
      if (data.success && data.data) {
        setCategories(data.data.categories || [])
      }
    } catch (error) {
      console.error('Erreur lors du chargement des catégories:', error)
    }
  }

  const generatePlatformsAndYears = () => {
    // Plateformes communes
    const commonPlatforms = ['Windows', 'Mac', 'Linux', 'Steam', 'Epic Games', 'Origin', 'Uplay', 'Battle.net', 'GOG']
    setPlatforms(commonPlatforms)

    // Années de 2000 à année actuelle + 2
    const currentYear = new Date().getFullYear()
    const yearRange = Array.from({ length: currentYear - 1999 + 2 }, (_, i) => currentYear + 2 - i)
    setYears(yearRange)
  }

  const addDownloadLink = (type: 'normal' | 'differentiated' = 'normal') => {
    if (downloadLinks.length >= 10) return

    const newLink: DownloadLink = {
      icon_url: 'storage/icons/Mbutton/download.png',
      title: '',
      description: '',
      download_url: '',
      is_vip: false,
      access_level: type === 'differentiated' ? 'differentiated' : 'free',
      position: downloadLinks.length,
      is_differentiated: type === 'differentiated',
      member_url: type === 'differentiated' ? '' : undefined,
      plus_url: type === 'differentiated' ? '' : undefined,
      ultra_url: type === 'differentiated' ? '' : undefined
    }
    
    setDownloadLinks([...downloadLinks, newLink])
  }

  const removeDownloadLink = (index: number) => {
    const newLinks = downloadLinks.filter((_, i) => i !== index)
    // Réorganiser les positions
    const reorderedLinks = newLinks.map((link, i) => ({ ...link, position: i }))
    setDownloadLinks(reorderedLinks)
  }

  const updateDownloadLink = (index: number, field: keyof DownloadLink, value: any) => {
    const newLinks = [...downloadLinks]
      newLinks[index] = { ...newLinks[index], [field]: value }
    setDownloadLinks(newLinks)
  }

  const calculateFormProgress = () => {
    const fields = [
      formData.title,
      formData.description,
      formData.banner_url,
      formData.category_id > 0,
      formData.platform,
      formData.specifications,
      downloadLinks.some(link => link.title && link.download_url)
    ]
    
    const filledFields = fields.filter(Boolean).length
    return Math.round((filledFields / fields.length) * 100)
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    setProgress(0)

    try {
      // Validation
      if (!formData.title || !formData.description || !formData.banner_url || formData.category_id === 0 || !formData.platform) {
        alert('Veuillez remplir tous les champs obligatoires')
        return
      }

      setProgress(20)

      // Créer le jeu
      const gameResponse = await securePost('/api/admin/games', formData)
      const gameData = await gameResponse.json()

      if (!gameData.success) {
        throw new Error(gameData.message || 'Erreur lors de la création du jeu')
      }

      setProgress(50)

      const gameId = gameData.gameId

      // Ajouter les liens de téléchargement
      const validLinks = downloadLinks.filter(link => link.title && link.download_url)
      
      for (let i = 0; i < validLinks.length; i++) {
        const link = validLinks[i]
        await securePost(`/api/admin/games/${gameId}/download-links`, {
          ...link,
          position: i
        })
        setProgress(50 + (30 * (i + 1) / validLinks.length))
      }

      // Assigner le badge si sélectionné
      if (badgeData.badgeId > 0) {
        await securePost(`/api/admin/games/${gameId}/badges`, badgeData)
      }

      setProgress(100)

      // Redirection vers la page de modification ou la liste
      setTimeout(() => {
        router.push(`/admin/games/edit/${gameId}`)
      }, 1000)

    } catch (error) {
      console.error('Erreur lors de la création:', error)
      alert('Erreur lors de la création du jeu')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground relative">
        <Navigation />
        
        {/* Voile violet en arrière-plan */}
        <div 
          className="absolute h-screen w-full opacity-20 max-md:mask-b-from-10% max-md:mask-b-to-70% md:mask-radial-from-10% md:mask-radial-to-70% md:mask-radial-at-top bg-purple-500"
          style={{ inset: 0 }}
        />
        
        <div className="flex items-center justify-center min-h-screen">
          <Card className="bg-gray-900/60 backdrop-blur-lg border border-white/10 shadow-2xl">
            <CardBody className="text-center p-10">
              <Spinner size="lg" color="primary" label="Chargement des données..." />
            </CardBody>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground relative">
      <Navigation />

      {/* Voile violet en arrière-plan */}
      <div 
        className="absolute h-screen w-full opacity-20 max-md:mask-b-from-10% max-md:mask-b-to-70% md:mask-radial-from-10% md:mask-radial-to-70% md:mask-radial-at-top bg-purple-500"
        style={{ inset: 0 }}
      />

      <div className="relative z-10 max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
          <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-green-600/20 to-emerald-600/20 text-green-300 px-6 py-3 rounded-full text-sm font-medium mb-8 backdrop-blur-sm border border-green-500/30">
              <PlusIcon className="w-4 h-4" />
              Création de Jeu
            </div>
            
            <h1 className="text-5xl md:text-6xl font-extrabold mb-6 tracking-tight text-white" 
                style={{textShadow: '2px 2px 20px rgba(0,0,0,0.5)'}}>
            <span className="bg-gradient-to-r from-green-400 via-emerald-500 to-green-600 bg-clip-text text-transparent">
              Nouveau Jeu
              </span>
            </h1>
            
          <div className="flex items-center justify-center gap-4">
            <Button 
              variant="flat"
              color="default" 
              size="lg"
              startContent={<ArrowLeftIcon className="w-5 h-5" />}
              onPress={() => router.push('/admin/games')}
              className="border-white/20 text-white hover:bg-white/10 transition-all duration-300 backdrop-blur-sm"
            >
              Retour à la liste
            </Button>
            
            {formData.title && formData.banner_url && (
              <Button
                variant="flat"
                color="primary"
                size="lg"
                startContent={<EyeIcon className="w-5 h-5" />}
                onPress={onPreviewModalOpen}
              >
                Aperçu
              </Button>
            )}
        </div>
      </div>

        {/* Barre de progression */}
        <Card className="bg-gray-900/60 backdrop-blur-lg border border-white/10 shadow-2xl mb-8">
          <CardBody className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <CheckCircleIcon className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-semibold">Progression du formulaire</h3>
                  <p className="text-gray-400 text-sm">{calculateFormProgress()}% complété</p>
                </div>
              </div>
              
              <Chip 
                color={calculateFormProgress() === 100 ? "success" : calculateFormProgress() > 50 ? "warning" : "default"}
                variant="flat"
              >
                {calculateFormProgress() === 100 ? "Prêt à créer" : "En cours"}
              </Chip>
            </div>
            
            <Progress 
              value={calculateFormProgress()} 
              color={calculateFormProgress() === 100 ? "success" : calculateFormProgress() > 50 ? "warning" : "primary"}
              className="max-w-full"
              classNames={{
                track: "bg-gray-700",
                indicator: "bg-gradient-to-r from-blue-400 to-blue-600"
              }}
            />
          </CardBody>
        </Card>

        {/* Formulaire principal */}
          <div className="space-y-8">
            
            {/* Informations de base */}
            <Card className="bg-gray-900/60 backdrop-blur-lg border border-white/10 shadow-2xl">
              <CardHeader>
              <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                  <InformationCircleIcon className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white">Informations Générales</h2>
                  </div>
              </CardHeader>
              <CardBody className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Input
                    label="Titre du jeu"
                  placeholder="Nom du jeu"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    isRequired
                    classNames={{
                      input: "text-white",
                    inputWrapper: "bg-gray-800/50 border-gray-600 hover:border-purple-500/50 group-data-[focus=true]:border-purple-500"
                    }}
                  />
                  
                  <Input
                    label="URL de la bannière"
                  placeholder="https://exemple.com/banniere.jpg"
                    value={formData.banner_url}
                    onChange={(e) => setFormData(prev => ({ ...prev, banner_url: e.target.value }))}
                  isRequired
                  startContent={<CloudArrowUpIcon className="w-4 h-4 text-gray-400" />}
                    classNames={{
                      input: "text-white",
                    inputWrapper: "bg-gray-800/50 border-gray-600 hover:border-purple-500/50 group-data-[focus=true]:border-purple-500"
                    }}
                  />
                </div>

                <Textarea
                  label="Description"
                placeholder="Description détaillée du jeu..."
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  isRequired
                  minRows={4}
                  classNames={{
                    input: "text-white",
                  inputWrapper: "bg-gray-800/50 border-gray-600 hover:border-purple-500/50 group-data-[focus=true]:border-purple-500"
                }}
              />

              <Textarea
                label="Spécifications techniques"
                placeholder="Configuration requise, informations système..."
                value={formData.specifications}
                onChange={(e) => setFormData(prev => ({ ...prev, specifications: e.target.value }))}
                minRows={3}
                classNames={{
                  input: "text-white",
                  inputWrapper: "bg-gray-800/50 border-gray-600 hover:border-purple-500/50 group-data-[focus=true]:border-purple-500"
                  }}
                />
              </CardBody>
            </Card>

            {/* Configuration */}
            <Card className="bg-gray-900/60 backdrop-blur-lg border border-white/10 shadow-2xl">
              <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
                    <i className="fas fa-cogs text-white"></i>
                  </div>
                <h2 className="text-2xl font-bold text-white">Configuration</h2>
              </div>
              </CardHeader>
              <CardBody className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <Select
                    label="Catégorie"
                  placeholder="Choisir une catégorie"
                  selectedKeys={formData.category_id > 0 ? [formData.category_id.toString()] : []}
                  onSelectionChange={(keys) => 
                    setFormData(prev => ({ ...prev, category_id: parseInt(Array.from(keys)[0] as string) || 0 }))
                  }
                  isRequired
                    classNames={{
                      trigger: "bg-gray-800/50 border-gray-600 hover:border-purple-500/50",
                      value: "text-white",
                      popoverContent: "bg-gray-800 border-gray-600",
                      listbox: "bg-gray-800"
                    }}
                  >
                  {categories.map(category => 
                    <SelectItem key={category.id} className="text-white">
                        {category.name}
                      </SelectItem>
                  )}
                  </Select>
                  
                  <Select
                    label="Plateforme"
                  placeholder="Choisir une plateforme"
                    selectedKeys={formData.platform ? [formData.platform] : []}
                  onSelectionChange={(keys) => 
                    setFormData(prev => ({ ...prev, platform: Array.from(keys)[0] as string || '' }))
                  }
                  isRequired
                    classNames={{
                      trigger: "bg-gray-800/50 border-gray-600 hover:border-purple-500/50",
                      value: "text-white",
                      popoverContent: "bg-gray-800 border-gray-600",
                      listbox: "bg-gray-800"
                    }}
                  >
                    {platforms.map(platform => 
                      <SelectItem key={platform} className="text-white">
                        {platform}
                      </SelectItem>
                    )}
                  </Select>
                  
                  <Select
                    label="Année"
                  placeholder="Année de sortie"
                    selectedKeys={formData.year ? [formData.year.toString()] : []}
                  onSelectionChange={(keys) => 
                    setFormData(prev => ({ ...prev, year: parseInt(Array.from(keys)[0] as string) || 2024 }))
                  }
                    classNames={{
                      trigger: "bg-gray-800/50 border-gray-600 hover:border-purple-500/50",
                      value: "text-white",
                      popoverContent: "bg-gray-800 border-gray-600",
                      listbox: "bg-gray-800"
                    }}
                  >
                    {years.map(year => 
                    <SelectItem key={year} className="text-white">
                        {year}
                      </SelectItem>
                    )}
                  </Select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                  label="Mot de passe d'archive (optionnel)"
                  placeholder="Mot de passe pour les fichiers compressés"
                    value={formData.zip_password}
                    onChange={(e) => setFormData(prev => ({ ...prev, zip_password: e.target.value }))}
                    classNames={{
                      input: "text-white",
                    inputWrapper: "bg-gray-800/50 border-gray-600 hover:border-purple-500/50 group-data-[focus=true]:border-purple-500"
                    }}
                  />
                  
                  <Select
                    label="Niveau d'accès"
                    selectedKeys={[formData.access_level]}
                  onSelectionChange={(keys) => 
                    setFormData(prev => ({ ...prev, access_level: Array.from(keys)[0] as 'free' | 'plus' | 'ultra' }))
                  }
                    classNames={{
                      trigger: "bg-gray-800/50 border-gray-600 hover:border-purple-500/50",
                      value: "text-white",
                      popoverContent: "bg-gray-800 border-gray-600",
                      listbox: "bg-gray-800"
                    }}
                  >
                    <SelectItem key="free" className="text-white">
                    🎁 Gratuit
                    </SelectItem>
                    <SelectItem key="plus" className="text-white">
                    ⭐ Plus
                    </SelectItem>
                    <SelectItem key="ultra" className="text-white">
                    👑 Ultra
                    </SelectItem>
                  </Select>
                </div>

              <div className="flex items-center gap-4 p-4 bg-gray-800/30 rounded-lg">
                <Switch
                  isSelected={formData.is_vip}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, is_vip: value }))}
                  color="danger"
                >
                  <span className="text-white">Marquer comme VIP</span>
                </Switch>
                <Tooltip content="Les jeux VIP nécessitent un accès spécial">
                  <InformationCircleIcon className="w-4 h-4 text-gray-400 cursor-help" />
                </Tooltip>
                </div>
              </CardBody>
            </Card>

            {/* Liens de téléchargement */}
            <Card className="bg-gray-900/60 backdrop-blur-lg border border-white/10 shadow-2xl">
              <CardHeader>
                <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                    <LinkIcon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">Liens de Téléchargement</h2>
                    <p className="text-gray-400 text-sm">Maximum 10 liens</p>
                  </div>
                    </div>
                
                <div className="flex gap-2">
                    <Button
                    color="success"
                    variant="flat"
                      size="sm"
                      onPress={() => addDownloadLink('normal')}
                      startContent={<PlusIcon className="w-4 h-4" />}
                      isDisabled={downloadLinks.length >= 10}
                    >
                      Lien Normal
                    </Button>
                  
                    <Button
                    color="primary"
                    variant="flat"
                      size="sm"
                      onPress={() => addDownloadLink('differentiated')}
                      startContent={<i className="fas fa-users-cog w-4 h-4" />}
                      isDisabled={downloadLinks.length >= 10}
                    >
                      Lien Différencié
                    </Button>
                  </div>
                </div>
              </CardHeader>
            <CardBody>
              <div className="space-y-6">
                {downloadLinks.map((link, index) => {
                  const isDifferentiated = link.is_differentiated || link.access_level === 'differentiated'
                  
                  return (
                    <Card 
                      key={index} 
                      className={`border ${
                        isDifferentiated 
                          ? 'border-blue-500/30 bg-blue-900/10' 
                          : 'border-gray-600/30 bg-gray-800/30'
                      }`}
                    >
                      <CardHeader>
                        <div className="flex items-center justify-between w-full">
                          <div className="flex items-center gap-3">
                            <Chip 
                              color={isDifferentiated ? "primary" : "default"} 
                              variant="flat"
                              size="sm"
                            >
                              Lien #{index + 1}
                            </Chip>
                            {isDifferentiated && (
                              <Chip color="primary" variant="flat" size="sm">
                                Différencié
                              </Chip>
                            )}
                          </div>
                          
                          {downloadLinks.length > 1 && (
                            <Button
                              isIconOnly
                              color="danger"
                              variant="flat"
                              size="sm"
                              onPress={() => removeDownloadLink(index)}
                            >
                              <TrashIcon className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </CardHeader>
                      <CardBody className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input
                            label="Titre"
                            placeholder="Nom du lien"
                              value={link.title}
                              onChange={(e) => updateDownloadLink(index, 'title', e.target.value)}
                              classNames={{
                                input: "text-white",
                              inputWrapper: "bg-gray-800/50 border-gray-600 hover:border-purple-500/50"
                              }}
                            />
                            
                              <Input
                            label="URL de l'icône"
                            placeholder="storage/icons/..."
                            value={link.icon_url}
                            onChange={(e) => updateDownloadLink(index, 'icon_url', e.target.value)}
                                classNames={{
                                  input: "text-white",
                              inputWrapper: "bg-gray-800/50 border-gray-600 hover:border-purple-500/50"
                            }}
                          />
                        </div>

                        <Textarea
                          label="Description"
                          placeholder="Description du lien..."
                          value={link.description}
                          onChange={(e) => updateDownloadLink(index, 'description', e.target.value)}
                          minRows={2}
                                classNames={{
                                  input: "text-white",
                            inputWrapper: "bg-gray-800/50 border-gray-600 hover:border-purple-500/50"
                                }}
                              />
                              
                        {isDifferentiated ? (
                          <div className="space-y-3">
                            <h4 className="text-white font-medium">URLs par niveau d'accès :</h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                              <Input
                                label="🎁 Membre"
                                placeholder="URL pour membres"
                                value={link.member_url || ''}
                                onChange={(e) => updateDownloadLink(index, 'member_url', e.target.value)}
                                classNames={{
                                  input: "text-white",
                                  inputWrapper: "bg-gray-800/50 border-gray-600 hover:border-green-500/50"
                                }}
                              />
                            <Input
                                label="⭐ Plus"
                                placeholder="URL pour Plus"
                                value={link.plus_url || ''}
                                onChange={(e) => updateDownloadLink(index, 'plus_url', e.target.value)}
                              classNames={{
                                input: "text-white",
                                  inputWrapper: "bg-gray-800/50 border-gray-600 hover:border-yellow-500/50"
                              }}
                            />
                              <Input
                                label="👑 Ultra"
                                placeholder="URL pour Ultra"
                                value={link.ultra_url || ''}
                                onChange={(e) => updateDownloadLink(index, 'ultra_url', e.target.value)}
                                classNames={{
                                  input: "text-white",
                                  inputWrapper: "bg-gray-800/50 border-gray-600 hover:border-purple-500/50"
                                }}
                              />
                            </div>
                          </div>
                        ) : (
                              <Input
                                label="URL de téléchargement"
                            placeholder="https://exemple.com/download"
                                value={link.download_url}
                                onChange={(e) => updateDownloadLink(index, 'download_url', e.target.value)}
                            startContent={<LinkIcon className="w-4 h-4 text-gray-400" />}
                                classNames={{
                                  input: "text-white",
                              inputWrapper: "bg-gray-800/50 border-gray-600 hover:border-purple-500/50"
                            }}
                          />
                        )}

                        {!isDifferentiated && (
                          <div className="flex items-center gap-6">
                              <Select
                                label="Niveau d'accès"
                                selectedKeys={[link.access_level]}
                              onSelectionChange={(keys) => 
                                updateDownloadLink(index, 'access_level', Array.from(keys)[0])
                              }
                                classNames={{
                                trigger: "bg-gray-800/50 border-gray-600 hover:border-purple-500/50",
                                  value: "text-white",
                                popoverContent: "bg-gray-800 border-gray-600"
                              }}
                            >
                              <SelectItem key="free" className="text-white">🎁 Gratuit</SelectItem>
                              <SelectItem key="plus" className="text-white">⭐ Plus</SelectItem>
                              <SelectItem key="ultra" className="text-white">👑 Ultra</SelectItem>
                              </Select>

                            <Switch
                              isSelected={link.is_vip}
                              onValueChange={(value) => updateDownloadLink(index, 'is_vip', value)}
                              color="danger"
                            >
                              <span className="text-white">VIP</span>
                            </Switch>
                          </div>
                        )}
                      </CardBody>
                    </Card>
                  )
                })}
              </div>
              </CardBody>
            </Card>

            {/* Actions */}
          <Card className="bg-gray-900/60 backdrop-blur-lg border border-white/10 shadow-2xl">
            <CardBody>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                  color="default"
                  variant="flat"
                    size="lg"
                    onPress={() => router.push('/admin/games')}
                  className="border-white/20 text-white hover:bg-white/10"
                  >
                    Annuler
                  </Button>
                
                  <Button
                  color="success"
                  variant="shadow"
                    size="lg"
                    onPress={handleSubmit}
                    isLoading={isSubmitting}
                  isDisabled={calculateFormProgress() < 70}
                  startContent={!isSubmitting && <CheckCircleIcon className="w-5 h-5" />}
                  className="bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold min-w-[200px]"
                  >
                  {isSubmitting ? `Création... ${progress}%` : 'Créer le Jeu'}
                  </Button>
                </div>
              
              {isSubmitting && (
                <div className="mt-4">
                  <Progress 
                    value={progress} 
                    color="success"
                    className="max-w-full"
                    classNames={{
                      track: "bg-gray-700",
                      indicator: "bg-gradient-to-r from-green-400 to-green-600"
                    }}
                  />
                </div>
              )}
              </CardBody>
            </Card>
          </div>
        </div>

      {/* Modal d'aperçu */}
      <Modal 
        isOpen={isPreviewModalOpen} 
        onClose={onPreviewModalClose}
        size="2xl"
        backdrop="opaque"
        classNames={{
          backdrop: "bg-gradient-to-t from-zinc-900 to-zinc-900/10 backdrop-opacity-20"
        }}
      >
        <ModalContent className="bg-gray-900 border border-white/10">
          <ModalHeader className="text-white">
            <div className="flex items-center gap-3">
              <EyeIcon className="w-5 h-5" />
              Aperçu du jeu
            </div>
          </ModalHeader>
          <ModalBody className="text-white">
            {formData.banner_url && (
              <div className="mb-4">
                <img 
                  src={formData.banner_url} 
                  alt={formData.title}
                  className="w-full h-48 object-cover rounded-lg"
                  onError={(e) => {
                    e.currentTarget.src = '/api/storage/placeholder-game.jpg'
                  }}
                />
              </div>
            )}
            
            <h3 className="text-2xl font-bold mb-2">{formData.title || 'Titre du jeu'}</h3>
            
            <div className="flex gap-2 mb-4">
              <Chip color={formData.access_level === 'ultra' ? 'secondary' : formData.access_level === 'plus' ? 'warning' : 'success'}>
                {formData.access_level === 'ultra' ? '👑 Ultra' : formData.access_level === 'plus' ? '⭐ Plus' : '🎁 Gratuit'}
              </Chip>
              {formData.is_vip && <Chip color="danger">💎 VIP</Chip>}
              <Chip variant="flat">{formData.platform}</Chip>
              <Chip variant="flat">{formData.year}</Chip>
            </div>
            
            <p className="text-gray-300 mb-4">
              {formData.description || 'Description du jeu...'}
            </p>
            
            {formData.specifications && (
              <div>
                <h4 className="font-semibold mb-2">Spécifications techniques :</h4>
                <p className="text-gray-300 text-sm whitespace-pre-line">
                  {formData.specifications}
                </p>
              </div>
            )}
          </ModalBody>
          <ModalFooter>
            <Button color="default" variant="flat" onPress={onPreviewModalClose}>
              Fermer
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  )
}