"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { secureGet, securePost, securePut, secureDelete } from '@/lib/api-client'
import {
  Card,
  CardHeader,
  CardBody,
  Button,
  Input,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Select,
  SelectItem,
  Textarea,
  useDisclosure,
  Spinner
} from "@heroui/react"
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  ArrowLeftIcon,
  TagIcon 
} from '@heroicons/react/24/outline'

interface Category {
  id: number
  name: string
  type: string
  description?: string
  created_at: string
}

export default function AdminCategoriesPage() {
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  
  // Modal states
  const { isOpen: isAddOpen, onOpen: onAddOpen, onClose: onAddClose } = useDisclosure()
  const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure()
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure()
  
  // Form states
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    description: ''
  })
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [deletingCategory, setDeleteingCategory] = useState<Category | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      setLoading(true)
      const response = await secureGet('/api/categories')
      const data = await response.json()
      if (data.success && data.data) {
        setCategories(data.data.categories || [])
      }
    } catch (error) {
      console.error('Erreur lors du chargement des catégories:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = () => {
    setFormData({ name: '', type: '', description: '' })
    onAddOpen()
  }

  const handleEdit = (category: Category) => {
    setEditingCategory(category)
    setFormData({
      name: category.name,
      type: category.type,
      description: category.description || ''
    })
    onEditOpen()
  }

  const handleDelete = (category: Category) => {
    setDeleteingCategory(category)
    onDeleteOpen()
  }

  const submitAdd = async () => {
    if (!formData.name || !formData.type) return
    
    try {
      setSubmitting(true)
      const response = await securePost('/api/admin/categories', formData)
      const data = await response.json()
      
      if (data.success) {
        fetchCategories()
        onAddClose()
        setFormData({ name: '', type: '', description: '' })
      }
    } catch (error) {
      console.error('Erreur lors de l\'ajout:', error)
    } finally {
      setSubmitting(false)
    }
  }

  const submitEdit = async () => {
    if (!editingCategory || !formData.name || !formData.type) return
    
    try {
      setSubmitting(true)
      const response = await securePut(`/api/admin/categories/${editingCategory.id}`, formData)
      const data = await response.json()
      
      if (data.success) {
        fetchCategories()
        onEditClose()
        setEditingCategory(null)
      }
    } catch (error) {
      console.error('Erreur lors de la modification:', error)
    } finally {
      setSubmitting(false)
    }
  }

  const submitDelete = async () => {
    if (!deletingCategory) return
    
    try {
      setSubmitting(true)
      const response = await secureDelete(`/api/admin/categories/${deletingCategory.id}`)
      const data = await response.json()
      
      if (data.success) {
        fetchCategories()
        onDeleteClose()
        setDeleteingCategory(null)
      }
    } catch (error) {
      console.error('Erreur lors de la suppression:', error)
    } finally {
      setSubmitting(false)
    }
  }

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.type.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'jeux': return 'primary'
      case 'outils': return 'success'
      case 'systeme': return 'warning'
      case 'kit': return 'secondary'
      default: return 'default'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <Spinner size="lg" color="primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-gray-950 to-blue-900/20" />
      
      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              isIconOnly
              variant="ghost"
              onPress={() => router.push('/admin/games')}
              className="text-white hover:bg-white/10"
            >
              <ArrowLeftIcon className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
                <TagIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Gestion des Catégories</h1>
                <p className="text-gray-400">Gérer les catégories de jeux et applications</p>
              </div>
            </div>
          </div>
          
          <Button
            color="success"
            variant="shadow"
            startContent={<PlusIcon className="w-5 h-5" />}
            onPress={handleAdd}
            className="bg-gradient-to-r from-green-500 to-emerald-600"
          >
            Nouvelle Catégorie
          </Button>
        </div>

        {/* Main content */}
        <Card className="bg-gray-900/60 backdrop-blur-lg border border-white/10">
          <CardHeader className="border-b border-white/10 pb-4">
            <div className="flex justify-between items-center w-full">
              <div className="flex items-center gap-2">
                <TagIcon className="w-5 h-5 text-purple-400" />
                <span className="text-xl font-semibold text-white">
                  {filteredCategories.length} catégorie{filteredCategories.length > 1 ? 's' : ''}
                </span>
              </div>
              
              <Input
                placeholder="Rechercher une catégorie..."
                value={searchTerm}
                onValueChange={setSearchTerm}
                startContent={<i className="fas fa-search text-gray-400" />}
                className="max-w-xs"
                classNames={{
                  input: "text-white",
                  inputWrapper: "bg-gray-800 border-gray-600"
                }}
              />
            </div>
          </CardHeader>
          
          <CardBody>
            <Table
              aria-label="Table des catégories"
              className="min-h-[400px]"
              classNames={{
                wrapper: "bg-transparent",
                th: "bg-gray-800 text-white font-semibold",
                td: "text-white border-b border-gray-700"
              }}
            >
              <TableHeader>
                <TableColumn>NOM</TableColumn>
                <TableColumn>TYPE</TableColumn>
                <TableColumn>DESCRIPTION</TableColumn>
                <TableColumn>CRÉÉE LE</TableColumn>
                <TableColumn>ACTIONS</TableColumn>
              </TableHeader>
              <TableBody emptyContent="Aucune catégorie trouvée">
                {filteredCategories.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell>
                      <div className="font-semibold">{category.name}</div>
                    </TableCell>
                    <TableCell>
                      <Chip
                        color={getTypeColor(category.type)}
                        variant="flat"
                        size="sm"
                      >
                        {category.type}
                      </Chip>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-xs truncate">
                        {category.description || '-'}
                      </div>
                    </TableCell>
                    <TableCell>
                      {new Date(category.created_at).toLocaleDateString('fr-FR')}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          isIconOnly
                          size="sm"
                          variant="ghost"
                          color="warning"
                          onPress={() => handleEdit(category)}
                        >
                          <PencilIcon className="w-4 h-4" />
                        </Button>
                        <Button
                          isIconOnly
                          size="sm"
                          variant="ghost"
                          color="danger"
                          onPress={() => handleDelete(category)}
                        >
                          <TrashIcon className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardBody>
        </Card>
      </div>

      {/* Modal Ajouter */}
      <Modal 
        isOpen={isAddOpen} 
        onClose={onAddClose}
        backdrop="opaque"
        classNames={{
          backdrop: "bg-black/80",
          base: "bg-gray-900 border border-white/10",
          header: "border-b border-white/10",
          body: "py-6",
          footer: "border-t border-white/10"
        }}
      >
        <ModalContent>
          <ModalHeader>
            <h3 className="text-xl font-bold text-white">Nouvelle Catégorie</h3>
          </ModalHeader>
          <ModalBody>
            <div className="space-y-4">
              <Input
                label="Nom de la catégorie"
                placeholder="Ex: Jeux d'action"
                value={formData.name}
                onValueChange={(value) => setFormData({...formData, name: value})}
                classNames={{
                  label: "text-white",
                  input: "text-white",
                  inputWrapper: "bg-gray-800 border-gray-600"
                }}
              />
              
              <Select
                label="Type"
                placeholder="Sélectionner un type"
                selectedKeys={formData.type ? [formData.type] : []}
                onSelectionChange={(keys) => setFormData({...formData, type: Array.from(keys)[0] as string})}
                classNames={{
                  label: "text-white",
                  trigger: "bg-gray-800 border-gray-600",
                  value: "text-white"
                }}
              >
                <SelectItem key="jeux">Jeux</SelectItem>
                <SelectItem key="outils">Outils</SelectItem>
                <SelectItem key="systeme">Système</SelectItem>
                <SelectItem key="kit">Kit</SelectItem>
              </Select>
              
              <Textarea
                label="Description (optionnel)"
                placeholder="Description de la catégorie..."
                value={formData.description}
                onValueChange={(value) => setFormData({...formData, description: value})}
                classNames={{
                  label: "text-white",
                  input: "text-white",
                  inputWrapper: "bg-gray-800 border-gray-600"
                }}
              />
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" onPress={onAddClose}>
              Annuler
            </Button>
            <Button
              color="success"
              onPress={submitAdd}
              isLoading={submitting}
              isDisabled={!formData.name || !formData.type}
            >
              Ajouter
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Modal Modifier */}
      <Modal 
        isOpen={isEditOpen} 
        onClose={onEditClose}
        backdrop="opaque"
        classNames={{
          backdrop: "bg-black/80",
          base: "bg-gray-900 border border-white/10",
          header: "border-b border-white/10",
          body: "py-6",
          footer: "border-t border-white/10"
        }}
      >
        <ModalContent>
          <ModalHeader>
            <h3 className="text-xl font-bold text-white">Modifier la Catégorie</h3>
          </ModalHeader>
          <ModalBody>
            <div className="space-y-4">
              <Input
                label="Nom de la catégorie"
                value={formData.name}
                onValueChange={(value) => setFormData({...formData, name: value})}
                classNames={{
                  label: "text-white",
                  input: "text-white",
                  inputWrapper: "bg-gray-800 border-gray-600"
                }}
              />
              
              <Select
                label="Type"
                selectedKeys={formData.type ? [formData.type] : []}
                onSelectionChange={(keys) => setFormData({...formData, type: Array.from(keys)[0] as string})}
                classNames={{
                  label: "text-white",
                  trigger: "bg-gray-800 border-gray-600",
                  value: "text-white"
                }}
              >
                <SelectItem key="jeux">Jeux</SelectItem>
                <SelectItem key="outils">Outils</SelectItem>
                <SelectItem key="systeme">Système</SelectItem>
                <SelectItem key="kit">Kit</SelectItem>
              </Select>
              
              <Textarea
                label="Description (optionnel)"
                value={formData.description}
                onValueChange={(value) => setFormData({...formData, description: value})}
                classNames={{
                  label: "text-white",
                  input: "text-white",
                  inputWrapper: "bg-gray-800 border-gray-600"
                }}
              />
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" onPress={onEditClose}>
              Annuler
            </Button>
            <Button
              color="warning"
              onPress={submitEdit}
              isLoading={submitting}
              isDisabled={!formData.name || !formData.type}
            >
              Modifier
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Modal Supprimer */}
      <Modal 
        isOpen={isDeleteOpen} 
        onClose={onDeleteClose}
        backdrop="opaque"
        classNames={{
          backdrop: "bg-black/80",
          base: "bg-gray-900 border border-white/10",
          header: "border-b border-white/10",
          footer: "border-t border-white/10"
        }}
      >
        <ModalContent>
          <ModalHeader>
            <h3 className="text-xl font-bold text-white">Confirmer la suppression</h3>
          </ModalHeader>
          <ModalBody>
            <p className="text-gray-300">
              Êtes-vous sûr de vouloir supprimer la catégorie{' '}
              <span className="font-bold text-white">"{deletingCategory?.name}"</span> ?
            </p>
            <p className="text-red-400 text-sm mt-2">
              Cette action est irréversible et peut affecter les jeux associés.
            </p>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" onPress={onDeleteClose}>
              Annuler
            </Button>
            <Button
              color="danger"
              onPress={submitDelete}
              isLoading={submitting}
            >
              Supprimer
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  )
}
