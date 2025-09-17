"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Navigation from '@/components/navigation'
import AdminBreadcrumbs from '@/components/admin/admin-breadcrumbs'
import MarkdownRenderer from '@/components/markdown-renderer'
import { Card, CardBody, CardHeader } from '@heroui/card'
import { Button } from '@heroui/button'
import { Input } from '@heroui/input'
import { Textarea } from '@heroui/input'
import { Select, SelectItem } from '@heroui/select'
import { Chip } from '@heroui/chip'
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure } from '@heroui/modal'
import { Spinner } from '@heroui/spinner'
import { useAuth } from '@/hooks/use-auth'
import { secureGet, securePost } from '@/lib/api-client'

interface Category {
  id: number
  nom: string
  description?: string
  couleur: string
}

interface ArticleForm {
  titre: string
  contenu: string
  contenu_type: 'markdown' | 'html'
  resume: string
  image_principale: string
  tags: string[]
  categories: string[]
  statut: 'brouillon' | 'publie' | 'archive'
}

export default function AddArticlePage() {
  const { user } = useAuth()
  const router = useRouter()
  const { isOpen: previewOpen, onOpen: onPreviewOpen, onClose: onPreviewClose } = useDisclosure()
  
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [previewContent, setPreviewContent] = useState('')
  const [formData, setFormData] = useState<ArticleForm>({
    titre: '',
    contenu: '',
    contenu_type: 'markdown',
    resume: '',
    image_principale: '',
    tags: [],
    categories: [],
    statut: 'brouillon'
  })

  // Check if user is admin
  useEffect(() => {
    if (user && user.role !== 'admin') {
      window.location.href = '/admin'
    }
  }, [user])

  // Fetch categories
  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const response = await secureGet('/api/articles/categories')
      const data = await response.json()
      if (data.success) {
        setCategories(data.data)
      }
    } catch (error) {
      console.error('Erreur lors du chargement des catégories:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    
    try {
      const response = await fetch('/api/admin/articles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          date_publication: formData.statut === 'publie' ? new Date().toISOString() : null
        })
      })
      
      const data = await response.json()
      
      if (data.success) {
        router.push('/admin/articles')
      } else {
        alert(data.error || 'Erreur lors de la création')
      }
    } catch (error) {
      console.error('Erreur:', error)
      alert('Erreur lors de la création')
    } finally {
      setSaving(false)
    }
  }

  const handlePreview = () => {
    setPreviewContent(formData.contenu)
    onPreviewOpen()
  }

  const addTag = (tag: string) => {
    if (tag && !formData.tags.includes(tag)) {
      setFormData(prev => ({ ...prev, tags: [...prev.tags, tag] }))
    }
  }

  const removeTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }))
  }

  const toggleCategory = (categoryName: string) => {
    setFormData(prev => ({
      ...prev,
      categories: prev.categories.includes(categoryName)
        ? prev.categories.filter(c => c !== categoryName)
        : [...prev.categories, categoryName]
    }))
  }

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-background text-foreground font-sans relative flex items-center justify-center">
        <div className="absolute h-screen w-full opacity-20 max-md:mask-b-from-10% max-md:mask-b-to-70% md:mask-radial-from-10% md:mask-radial-to-70% md:mask-radial-at-top bg-purple-500" style={{ inset: 0 as unknown as number }} />
        <div className="relative z-10 text-center">
          <Spinner size="lg" color="primary" label="Vérification des permissions..." />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground font-sans relative">
      <Navigation />

      {/* voile violet en arrière-plan */}
      <div
        className="absolute h-screen w-full opacity-20 max-md:mask-b-from-10% max-md:mask-b-to-70% md:mask-radial-from-10% md:mask-radial-to-70% md:mask-radial-at-top bg-purple-500"
        style={{ inset: 0 as unknown as number }}
      />

      {/* Hero Section */}
      <div className="relative z-10 pt-32 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumbs */}
          <AdminBreadcrumbs 
            items={[
              { label: "Administration", href: "/admin", icon: "fas fa-shield-alt" },
              { label: "Articles", href: "/admin/articles", icon: "fas fa-newspaper" },
              { label: "Créer un article", icon: "fas fa-plus" }
            ]} 
          />

          {/* Badge et Titre */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-green-600/20 to-orange-600/20 text-green-300 px-6 py-3 rounded-full text-sm font-medium mb-8 backdrop-blur-sm border border-green-500/30">
              <i className="fas fa-plus"></i>
              Nouvel Article
            </div>
            
            <h1 className="text-5xl md:text-6xl font-extrabold mb-6 tracking-tight text-white" 
                style={{textShadow: '2px 2px 20px rgba(0,0,0,0.5)'}}>
              Créer un Article
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-300 mb-8">
              Rédigez et publiez un nouvel article sur Koalyx
            </p>

            {/* Boutons d'action */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                color="default" 
                variant="bordered" 
                size="lg"
                startContent={<i className="fas fa-arrow-left"></i>}
                onPress={() => router.push('/admin/articles')}
                className="border-white/20 text-white hover:bg-white/10 transition-all duration-300"
              >
                Retour aux articles
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Formulaire */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <Card className="bg-gray-800/50 backdrop-blur-lg border border-white/10 shadow-2xl">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center">
                <i className="fas fa-newspaper text-white text-lg"></i>
              </div>
              <h2 className="text-xl font-bold text-white">Nouvel article</h2>
            </div>
          </CardHeader>
          <CardBody>
            {loading ? (
              <div className="flex justify-center py-8">
                <Spinner size="lg" color="primary" />
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <Input
                  label="Titre"
                  placeholder="Titre de l'article"
                  value={formData.titre}
                  onChange={(e) => setFormData(prev => ({ ...prev, titre: e.target.value }))}
                  isRequired
                  classNames={{
                    input: "text-white bg-gray-700/50 border-white/20 placeholder:text-gray-400",
                    inputWrapper: "border-white/20 hover:border-orange-500/50 focus-within:border-orange-500 bg-gray-700/50",
                    label: "text-white"
                  }}
                />
                
                <Textarea
                  label="Résumé"
                  placeholder="Résumé de l'article"
                  value={formData.resume}
                  onChange={(e) => setFormData(prev => ({ ...prev, resume: e.target.value }))}
                  classNames={{
                    input: "text-white bg-gray-700/50 border-white/20 placeholder:text-gray-400",
                    inputWrapper: "border-white/20 hover:border-orange-500/50 focus-within:border-orange-500 bg-gray-700/50",
                    label: "text-white"
                  }}
                />
                
                <Input
                  label="Image principale (URL)"
                  placeholder="https://exemple.com/image.jpg"
                  value={formData.image_principale}
                  onChange={(e) => setFormData(prev => ({ ...prev, image_principale: e.target.value }))}
                  classNames={{
                    input: "text-white bg-gray-700/50 border-white/20 placeholder:text-gray-400",
                    inputWrapper: "border-white/20 hover:border-orange-500/50 focus-within:border-orange-500 bg-gray-700/50",
                    label: "text-white"
                  }}
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Select
                    label="Type de contenu"
                    selectedKeys={[formData.contenu_type]}
                    onSelectionChange={(keys) => {
                      const selectedKey = Array.from(keys)[0] as string
                      setFormData(prev => ({ ...prev, contenu_type: selectedKey as 'markdown' | 'html' }))
                    }}
                    classNames={{
                      trigger: "bg-gray-700/50 border-white/20 hover:border-orange-500/50 data-[focus=true]:border-orange-500",
                      label: "text-white",
                      value: "text-white"
                    }}
                  >
                    <SelectItem key="markdown">Markdown</SelectItem>
                    <SelectItem key="html">HTML</SelectItem>
                  </Select>
                  
                  <Select
                    label="Statut"
                    selectedKeys={[formData.statut]}
                    onSelectionChange={(keys) => {
                      const selectedKey = Array.from(keys)[0] as string
                      setFormData(prev => ({ ...prev, statut: selectedKey as 'brouillon' | 'publie' | 'archive' }))
                    }}
                    classNames={{
                      trigger: "bg-gray-700/50 border-white/20 hover:border-orange-500/50 data-[focus=true]:border-orange-500",
                      label: "text-white",
                      value: "text-white"
                    }}
                  >
                    <SelectItem key="brouillon">Brouillon</SelectItem>
                    <SelectItem key="publie">Publié</SelectItem>
                    <SelectItem key="archive">Archivé</SelectItem>
                  </Select>
                </div>
                
                {/* Catégories */}
                <div>
                  <label className="text-sm font-medium mb-2 block text-white">
                    <i className="fas fa-tags text-purple-400 mr-2"></i>
                    Catégories
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {categories.map(category => (
                      <Chip
                        key={category.id}
                        variant={formData.categories.includes(category.nom) ? 'shadow' : 'bordered'}
                        color={formData.categories.includes(category.nom) ? 'primary' : 'default'}
                        className="cursor-pointer transition-colors"
                        onClick={() => toggleCategory(category.nom)}
                      >
                        {category.nom}
                      </Chip>
                    ))}
                  </div>
                </div>
                
                {/* Tags */}
                <div>
                  <label className="text-sm font-medium mb-2 block text-white">
                    <i className="fas fa-hashtag text-pink-400 mr-2"></i>
                    Tags
                  </label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {formData.tags.map(tag => (
                      <Chip
                        key={tag}
                        variant="shadow"
                        color="secondary"
                        onClose={() => removeTag(tag)}
                      >
                        #{tag}
                      </Chip>
                    ))}
                  </div>
                  <Input
                    placeholder="Ajouter un tag (Entrée pour confirmer)"
                    classNames={{
                      input: "text-white bg-gray-700/50 border-white/20 placeholder:text-gray-400",
                      inputWrapper: "border-white/20 hover:border-orange-500/50 focus-within:border-orange-500 bg-gray-700/50"
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        addTag(e.currentTarget.value)
                        e.currentTarget.value = ''
                      }
                    }}
                  />
                </div>
                
                {/* Contenu */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-sm font-medium text-white">
                      <i className="fas fa-edit text-blue-400 mr-2"></i>
                      Contenu
                    </label>
                    <Button size="sm" variant="light" color="primary" onClick={handlePreview}>
                      <i className="fas fa-eye mr-2"></i>
                      Aperçu
                    </Button>
                  </div>
                  <Textarea
                    placeholder={
                      formData.contenu_type === 'markdown' 
                        ? "Écrivez votre contenu en Markdown...\n\n# Titre\n\n**Texte en gras**\n\n[Lien](https://example.com)\n\nhttps://youtube.com/watch?v=XXXXX (sera transformé en lecteur YouTube)"
                        : "Écrivez votre contenu HTML..."
                    }
                    value={formData.contenu}
                    onChange={(e) => setFormData(prev => ({ ...prev, contenu: e.target.value }))}
                    minRows={15}
                    isRequired
                    className="font-mono"
                    classNames={{
                      input: "text-white bg-gray-700/50 border-white/20 placeholder:text-gray-400 font-mono",
                      inputWrapper: "border-white/20 hover:border-orange-500/50 focus-within:border-orange-500 bg-gray-700/50"
                    }}
                  />
                </div>

                <div className="flex gap-4 pt-6">
                  <Button 
                    type="button"
                    color="default" 
                    variant="light" 
                    onPress={() => router.push('/admin/articles')}
                    className="flex-1"
                  >
                    <i className="fas fa-times mr-2"></i>
                    Annuler
                  </Button>
                  <Button 
                    type="submit"
                    color="primary" 
                    variant="shadow" 
                    isLoading={saving}
                    isDisabled={!formData.titre || !formData.contenu}
                    className="flex-1 bg-gradient-to-r from-orange-500 to-red-600"
                    startContent={!saving ? <i className="fas fa-save"></i> : undefined}
                  >
                    Créer l'article
                  </Button>
                </div>
              </form>
            )}
          </CardBody>
        </Card>
      </div>

      {/* Modal d'aperçu */}
      <Modal
        isOpen={previewOpen}
        onClose={onPreviewClose}
        size="5xl"
        scrollBehavior="inside"
        classNames={{
          base: "bg-gray-800/95 backdrop-blur-xl border border-white/10",
          header: "text-white border-b border-white/10",
          body: "text-white",
          footer: "border-t border-white/10"
        }}
      >
        <ModalContent>
          <ModalHeader className="text-white">
            <i className="fas fa-eye text-blue-400 mr-2"></i>
            Aperçu de l'article
          </ModalHeader>
          <ModalBody>
            <div className="p-4 bg-gray-700/30 rounded-lg">
              {formData.contenu_type === 'markdown' ? (
                <MarkdownRenderer content={previewContent} />
              ) : (
                <div dangerouslySetInnerHTML={{ __html: previewContent }} />
              )}
            </div>
          </ModalBody>
          <ModalFooter>
            <Button color="primary" variant="light" onClick={onPreviewClose}>
              <i className="fas fa-times mr-2"></i>
              Fermer
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Bouton scroll vers le haut */}
      <div className="fixed bottom-8 right-8 z-50">
        <Button
          isIconOnly
          color="primary"
          variant="shadow"
          size="lg"
          className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 transition-all duration-300 animate-bounce"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          <i className="fas fa-arrow-up text-white text-xl"></i>
        </Button>
      </div>
    </div>
  )
}
