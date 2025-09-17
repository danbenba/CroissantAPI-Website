"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Navigation from "@/components/navigation"
import AdminBreadcrumbs from "@/components/admin/admin-breadcrumbs"
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Chip,
  Spinner,
  Divider,
  Avatar,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
  Select,
  SelectItem,
  Textarea,
  useDisclosure,
  Tooltip,
  Badge,
} from "@heroui/react"
import { secureGet, securePost, securePut } from '@/lib/api-client'

interface User {
  id: number
  nom_utilisateur: string
  email: string
  role: string
  is_banned: boolean
  ban_reason?: string
  banned_until?: string
  last_login?: string
  created_at: string
  photo?: string
}

interface BanHistory {
  id: number
  user_id: number
  reason: string
  banned_by: string
  banned_at: string
  unbanned_at?: string
  duration_days: number
}

interface CreateUserData {
  nom_utilisateur: string
  email: string
  role: string
  password: string
}

export default function AdminUsersPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [banHistory, setBanHistory] = useState<BanHistory[]>([])
  const [loading, setLoading] = useState(true)
  const [usersLoading, setUsersLoading] = useState(true)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [tempPassword, setTempPassword] = useState<string>("")
  const [notifications, setNotifications] = useState<Array<{id: string, message: string, type: 'success' | 'error' | 'info'}>>([])

  // Fonction pour obtenir les dégradés selon le rôle
  const getRoleGradient = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-gradient-to-r from-red-500 to-red-600'
      case 'moderateur':
        return 'bg-gradient-to-r from-blue-500 to-blue-600'
      case 'support':
        return 'bg-gradient-to-r from-green-500 to-green-600'
      case 'plus':
        return 'bg-gradient-to-r from-yellow-400 to-orange-500'
      case 'ultra':
        return 'bg-gradient-to-r from-purple-500 to-indigo-600'
      case 'membre':
      default:
        return 'bg-gradient-to-r from-gray-500 to-gray-600'
    }
  }

  // Fonction pour obtenir les couleurs de texte selon le rôle
  const getRoleTextGradient = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-gradient-to-r from-red-400 to-red-500 bg-clip-text text-transparent'
      case 'moderateur':
        return 'bg-gradient-to-r from-blue-400 to-blue-500 bg-clip-text text-transparent'
      case 'support':
        return 'bg-gradient-to-r from-green-400 to-green-500 bg-clip-text text-transparent'
      case 'plus':
        return 'bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent'
      case 'ultra':
        return 'bg-gradient-to-r from-purple-400 to-indigo-500 bg-clip-text text-transparent'
      case 'membre':
      default:
        return 'bg-gradient-to-r from-gray-400 to-gray-500 bg-clip-text text-transparent'
    }
  }

  // Fonction pour obtenir l'icône selon le rôle
  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return 'fas fa-shield-alt'
      case 'moderateur':
        return 'fas fa-gavel'
      case 'support':
        return 'fas fa-headset'
      case 'ultra':
        return 'fas fa-crown'
      case 'plus':
        return 'fas fa-star'
      case 'membre':
      default:
        return 'fas fa-user'
    }
  }

  const addNotification = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Date.now().toString()
    setNotifications(prev => [...prev, { id, message, type }])
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id))
    }, 5000)
  }
  
  // Modales
  const { isOpen: isCreateModalOpen, onOpen: onCreateModalOpen, onOpenChange: onCreateModalOpenChange } = useDisclosure()
  const { isOpen: isEditModalOpen, onOpen: onEditModalOpen, onOpenChange: onEditModalOpenChange } = useDisclosure()
  const { isOpen: isBanModalOpen, onOpen: onBanModalOpen, onOpenChange: onBanModalOpenChange } = useDisclosure()
  const { isOpen: isBanHistoryModalOpen, onOpen: onBanHistoryModalOpen, onOpenChange: onBanHistoryModalOpenChange } = useDisclosure()
  const { isOpen: isPasswordModalOpen, onOpen: onPasswordModalOpen, onOpenChange: onPasswordModalOpenChange } = useDisclosure()
  
  // Formulaires
  const [createForm, setCreateForm] = useState<CreateUserData>({
    nom_utilisateur: "",
    email: "",
    role: "membre",
    password: ""
  })
  const [editForm, setEditForm] = useState<Partial<User>>({})
  const [banForm, setBanForm] = useState({
    reason: "",
    duration_days: 7
  })

  // Vérification de l'authentification
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/auth/me", {
          credentials: "include",
          cache: "no-cache"
        })
        
        if (response.ok) {
          const data = await response.json()
          
          if (data.user && data.success && data.user.role === "admin") {
            setUser(data.user)
            fetchUsers()
            fetchBanHistory()
          } else {
            router.push("/")
          }
        } else {
          router.push("/")
        }
      } catch (error) {
        router.push("/")
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [router])

  const fetchUsers = async () => {
    try {
      setUsersLoading(true)
      const response = await secureGet("/api/admin/users")
      const data = await response.json()
      setUsers(data.users || [])
    } catch (error) {
      console.error("Erreur lors du chargement des utilisateurs:", error)
    } finally {
      setUsersLoading(false)
    }
  }

  const fetchBanHistory = async () => {
    try {
      const response = await secureGet("/api/admin/users/ban-history")
      const data = await response.json()
      setBanHistory(data.history || [])
    } catch (error) {
      console.error("Erreur lors du chargement de l'historique des bannissements:", error)
    }
  }

  // Gestion des utilisateurs
  const handleCreateUser = async () => {
    try {
      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(createForm)
      })
      
      if (response.ok) {
        setCreateForm({ nom_utilisateur: "", email: "", role: "membre", password: "" })
        onCreateModalOpenChange()
        fetchUsers()
        addNotification("Utilisateur créé avec succès !")
      } else {
        const error = await response.json()
        addNotification(`Erreur: ${error.message}`, 'error')
      }
    } catch (error) {
      addNotification("Erreur lors de la création de l'utilisateur", 'error')
    }
  }

  const handleEditUser = async () => {
    if (!selectedUser) return
    
    try {
      const response = await fetch(`/api/admin/users/${selectedUser.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(editForm)
      })
      
      if (response.ok) {
        setEditForm({})
        setSelectedUser(null)
        onEditModalOpenChange()
        fetchUsers()
        addNotification("Utilisateur modifié avec succès !")
      } else {
        const error = await response.json()
        addNotification(`Erreur: ${error.message}`, 'error')
      }
    } catch (error) {
      addNotification("Erreur lors de la modification de l'utilisateur", 'error')
    }
  }

  const handleBanUser = async () => {
    if (!selectedUser) return
    
    try {
      const response = await fetch(`/api/admin/users/${selectedUser.id}/ban`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(banForm)
      })
      
      if (response.ok) {
        setBanForm({ reason: "", duration_days: 7 })
        setSelectedUser(null)
        onBanModalOpenChange()
        fetchUsers()
        fetchBanHistory()
        addNotification("Utilisateur banni avec succès !")
      } else {
        const error = await response.json()
        addNotification(`Erreur: ${error.message}`, 'error')
      }
    } catch (error) {
      addNotification("Erreur lors du bannissement de l'utilisateur", 'error')
    }
  }

  const handleUnbanUser = async (userId: number) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/unban`, {
        method: "POST",
        credentials: "include"
      })
      
      if (response.ok) {
        fetchUsers()
        fetchBanHistory()
        addNotification("Utilisateur débanni avec succès !")
      } else {
        const error = await response.json()
        addNotification(`Erreur: ${error.message}`, 'error')
      }
    } catch (error) {
      addNotification("Erreur lors du débannissement de l'utilisateur", 'error')
    }
  }

  const handleResetPassword = async () => {
    if (!selectedUser) return
    
    try {
      const response = await fetch(`/api/admin/users/${selectedUser.id}/reset-password`, {
        method: "POST",
        credentials: "include"
      })
      
      if (response.ok) {
        const data = await response.json()
        setTempPassword(data.tempPassword)
        onPasswordModalOpenChange()
        // Pas besoin d'alert, la modal s'affiche automatiquement
      } else {
        const error = await response.json()
        // Utiliser une notification HeroUI au lieu d'alert
        console.error('Erreur réinitialisation:', error.message)
      }
    } catch (error) {
      console.error('Erreur lors de la réinitialisation du mot de passe:', error)
    }
  }

  const handleForceLogout = async (userId: number) => {
    if (!confirm("Êtes-vous sûr de vouloir forcer la déconnexion de cet utilisateur ? Tous ses tokens seront invalidés.")) {
      return
    }
    
    try {
      const response = await fetch(`/api/admin/users/${userId}/force-logout`, {
        method: "POST",
        credentials: "include"
      })
      
      if (response.ok) {
        addNotification("Utilisateur déconnecté avec succès ! Tous ses tokens sont maintenant invalides.")
      } else {
        const error = await response.json()
        addNotification(`Erreur: ${error.message}`, 'error')
      }
    } catch (error) {
      addNotification("Erreur lors de la déconnexion forcée de l'utilisateur", 'error')
    }
  }

  const copyTempPassword = async () => {
    if (tempPassword) {
      try {
        await navigator.clipboard.writeText(tempPassword)
        // Feedback visuel au lieu d'alert
        const button = document.querySelector('[data-copy-button]') as HTMLElement
        if (button) {
          const originalText = button.innerHTML
          button.innerHTML = '<i class="fas fa-check"></i> Copié !'
          button.classList.add('bg-green-600')
          setTimeout(() => {
            button.innerHTML = originalText
            button.classList.remove('bg-green-600')
          }, 2000)
        }
      } catch (error) {
        console.error('Erreur lors de la copie:', error)
      }
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'danger'
      case 'moderateur': return 'warning'
      case 'plus': return 'secondary'
      case 'ultra': return 'secondary'
      case 'support': return 'primary'
      default: return 'default'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Spinner size="lg" color="primary" label="Vérification de l'authentification..." />
        </div>
      </div>
    )
  }

  if (!user || user.role !== "admin") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <Card className="bg-gray-800/50 backdrop-blur-sm border border-red-500/30 max-w-md mx-auto">
          <CardBody className="text-center p-10">
            <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-red-700 rounded-full flex items-center justify-center mx-auto mb-5">
              <i className="fas fa-exclamation-triangle text-3xl text-white"></i>
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">Accès refusé</h2>
            <p className="text-gray-400 mb-6">Vous devez être administrateur pour accéder à cette page</p>
            <Button color="primary" variant="shadow" onPress={() => router.push("/")}>
              Retour à l'accueil
            </Button>
          </CardBody>
        </Card>
      </div>
    )
  }

  return (
    <div
      className="min-h-screen bg-background text-foreground font-sans relative"
      style={{}}
    >
      <Navigation />

      {/* voile violet en arrière-plan, calqué sur la page HTML */}
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
              { label: "Utilisateurs", icon: "fas fa-users" }
            ]} 
          />
        </div>
      </div>

      {/* Hero Section avec titre */}
      <div className="relative z-10 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Badge Admin */}
          <div className="inline-flex items-center gap-2 bg-blue-600/20 text-blue-400 px-4 py-2 rounded-full text-sm font-medium mb-6 animate-bounce border border-blue-500/30">
            <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></span>
            Gestion Utilisateurs
          </div>
          
          {/* Titre principal */}
          <h1 className="text-5xl md:text-6xl font-extrabold mb-6 tracking-tight text-white" 
              style={{textShadow: '2px 2px 20px rgba(0,0,0,0.5)'}}>
            Utilisateurs
          </h1>
          
          {/* Sous-titre */}
          <p className="text-xl md:text-2xl text-gray-300 mb-8">
            Administration complète des comptes utilisateurs
          </p>

          {/* Boutons d'action */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              color="default" 
              variant="bordered" 
              size="lg"
              startContent={<i className="fas fa-arrow-left"></i>}
              onPress={() => router.push('/admin')}
              className="border-white/20 text-white hover:bg-white/10 transition-all duration-300"
            >
              Retour Admin
            </Button>
            <Button 
              color="primary" 
              variant="shadow" 
              size="lg"
              startContent={<i className="fas fa-plus"></i>}
              onPress={() => router.push('/admin/users/add')}
              className="bg-blue-600 hover:bg-blue-700 transition-all duration-300"
            >
              Créer un utilisateur
            </Button>
            <Button 
              color="secondary" 
              variant="bordered" 
              size="lg"
              startContent={<i className="fas fa-history"></i>}
              onPress={onBanHistoryModalOpen}
              className="border-white/20 text-white hover:bg-white/10 transition-all duration-300"
            >
              Historique des bannissements
            </Button>
            <Button 
              color="default" 
              variant="light" 
              size="lg"
              startContent={<i className="fas fa-home"></i>}
              onPress={() => router.push('/')}
              className="text-gray-300 hover:text-white transition-all duration-300"
            >
              Accueil
            </Button>
          </div>
        </div>
      </div>

      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">

        {/* Tableau des utilisateurs */}
        <Card className="bg-gray-800/50 backdrop-blur-lg border border-white/10 shadow-2xl">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <i className="fas fa-users text-white text-lg"></i>
              </div>
              <h2 className="text-xl font-bold text-white">Liste des utilisateurs</h2>
            </div>
          </CardHeader>
          <CardBody className="pt-0">
            {users.length === 0 && usersLoading ? (
              /* Skeleton Loader amélioré */
              <div className="space-y-4">
                {[...Array(5)].map((_, index) => (
                  <Card key={index} className="bg-gray-800/50 backdrop-blur-lg border border-white/10">
                    <CardBody className="p-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white/10 rounded-full animate-pulse"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-white/10 rounded w-1/4 animate-pulse"></div>
                          <div className="h-3 bg-white/10 rounded w-1/3 animate-pulse"></div>
                        </div>
                        <div className="w-16 h-6 bg-white/10 rounded animate-pulse"></div>
                        <div className="w-16 h-6 bg-white/10 rounded animate-pulse"></div>
                        <div className="w-24 h-3 bg-white/10 rounded animate-pulse"></div>
                        <div className="flex gap-2">
                          <div className="w-8 h-8 bg-white/10 rounded animate-pulse"></div>
                          <div className="w-8 h-8 bg-white/10 rounded animate-pulse"></div>
                          <div className="w-8 h-8 bg-white/10 rounded animate-pulse"></div>
                          <div className="w-8 h-8 bg-white/10 rounded animate-pulse"></div>
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                ))}
              </div>
            ) : users.length === 0 ? (
              /* Empty state */
              <div className="text-center py-12">
                <i className="fas fa-users text-6xl text-gray-600 mb-4"></i>
                <p className="text-gray-400 text-lg">Aucun utilisateur trouvé</p>
              </div>
            ) : (
              <Table aria-label="Liste des utilisateurs" className="text-white">
                <TableHeader>
                  <TableColumn className="text-white bg-gray-700/50">Utilisateur</TableColumn>
                  <TableColumn className="text-white bg-gray-700/50">Email</TableColumn>
                  <TableColumn className="text-white bg-gray-700/50">Rôle</TableColumn>
                  <TableColumn className="text-white bg-gray-700/50">Statut</TableColumn>
                  <TableColumn className="text-white bg-gray-700/50">Dernière connexion</TableColumn>
                  <TableColumn className="text-white bg-gray-700/50">Actions</TableColumn>
                </TableHeader>
                <TableBody>
                  {users.map((userItem) => (
                  <TableRow key={userItem.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <Avatar 
                            src={userItem.photo}
                            name={userItem.nom_utilisateur.charAt(0).toUpperCase()} 
                            className="bg-blue-500 text-white"
                          />
                          <div className={`absolute -bottom-1 -right-1 w-5 h-5 ${getRoleGradient(userItem.role)} rounded-full flex items-center justify-center shadow-lg`}>
                            <i className={`${getRoleIcon(userItem.role)} text-xs text-white`}></i>
                          </div>
                        </div>
                        <div>
                          <span className={`font-medium ${getRoleTextGradient(userItem.role)}`}>{userItem.nom_utilisateur}</span>
                          <p className="text-sm text-gray-400">ID: {userItem.id}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-gray-300">{userItem.email}</TableCell>
                    <TableCell>
                      <div className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${getRoleGradient(userItem.role)} shadow-lg`}>
                        <span className="text-white capitalize">
                          {userItem.role === 'membre' ? 'Membre' :
                           userItem.role === 'plus' ? 'Plus' :
                           userItem.role === 'ultra' ? 'Ultra' :
                           userItem.role === 'admin' ? 'Admin' :
                           userItem.role === 'moderateur' ? 'Modérateur' :
                           userItem.role === 'support' ? 'Support' :
                           userItem.role}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {userItem.is_banned ? (
                        <div className="flex items-center gap-2">
                          <Badge color="danger" variant="flat">Banni</Badge>
                          {userItem.banned_until && (
                            <span className="text-xs text-gray-400">
                              Jusqu'au {formatDate(userItem.banned_until)}
                            </span>
                          )}
                        </div>
                      ) : (
                        <Badge color="success" variant="flat">Actif</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-gray-300">
                      {userItem.last_login ? formatDate(userItem.last_login) : 'Jamais'}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Tooltip 
                          content="Modifier l'utilisateur" 
                          className="bg-black/90 text-white border border-white/20"
                        >
                          <Button 
                            size="sm" 
                            color="primary" 
                            variant="light"
                            isIconOnly
                            onPress={() => router.push(`/admin/users/edit/${userItem.id}`)}
                          >
                            <i className="fas fa-edit"></i>
                          </Button>
                        </Tooltip>
                        
                        <Tooltip 
                          content="Réinitialiser le mot de passe" 
                          className="bg-black/90 text-white border border-white/20"
                        >
                          <Button 
                            size="sm" 
                            color="warning" 
                            variant="light"
                            isIconOnly
                            onPress={() => {
                              setSelectedUser(userItem)
                              handleResetPassword()
                            }}
                          >
                            <i className="fas fa-key"></i>
                          </Button>
                        </Tooltip>
                        
                        <Tooltip 
                          content="Forcer la déconnexion" 
                          className="bg-black/90 text-white border border-white/20"
                        >
                          <Button 
                            size="sm" 
                            color="secondary" 
                            variant="light"
                            isIconOnly
                            onPress={() => handleForceLogout(userItem.id)}
                          >
                            <i className="fas fa-sign-out-alt"></i>
                          </Button>
                        </Tooltip>
                        
                        {userItem.is_banned ? (
                          <Tooltip 
                            content="Débannir l'utilisateur" 
                            className="bg-black/90 text-white border border-white/20"
                          >
                            <Button 
                              size="sm" 
                              color="success" 
                              variant="light"
                              isIconOnly
                              onPress={() => handleUnbanUser(userItem.id)}
                            >
                              <i className="fas fa-unlock"></i>
                            </Button>
                          </Tooltip>
                        ) : (
                          <Tooltip 
                            content="Bannir l'utilisateur" 
                            className="bg-black/90 text-white border border-white/20"
                          >
                            <Button 
                              size="sm" 
                              color="danger" 
                              variant="light"
                              isIconOnly
                              onPress={() => {
                                setSelectedUser(userItem)
                                onBanModalOpen()
                              }}
                            >
                              <i className="fas fa-ban"></i>
                            </Button>
                          </Tooltip>
                        )}
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

      {/* Modal de création d'utilisateur */}
      <Modal isOpen={isCreateModalOpen} onOpenChange={onCreateModalOpenChange} size="2xl">
        <ModalContent className="modal-modern">
          <ModalHeader>
            <h3 className="text-xl font-bold text-white">Créer un nouvel utilisateur</h3>
          </ModalHeader>
          <ModalBody>
            <div className="space-y-4">
              <Input
                label="Nom d'utilisateur"
                value={createForm.nom_utilisateur}
                onChange={(e) => setCreateForm({ ...createForm, nom_utilisateur: e.target.value })}
                className="text-white"
                classNames={{
                  label: "text-gray-300",
                  input: "text-white bg-gray-700 border-white/20",
                  inputWrapper: "bg-gray-700 border-white/20"
                }}
              />
              <Input
                label="Email"
                type="email"
                value={createForm.email}
                onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                className="text-white"
                classNames={{
                  label: "text-gray-300",
                  input: "text-white bg-gray-700 border-white/20",
                  inputWrapper: "bg-gray-700 border-white/20"
                }}
              />
              <Select
                label="Rôle"
                selectedKeys={[createForm.role]}
                onSelectionChange={(keys) => setCreateForm({ ...createForm, role: Array.from(keys)[0] as string })}
                className="text-white"
                classNames={{
                  label: "text-gray-300",
                  trigger: "bg-gray-700 border-white/20",
                  listbox: "bg-gray-700 border-white/20"
                }}
              >
                <SelectItem key="membre" className="text-white">Membre</SelectItem>
                <SelectItem key="plus" className="text-white">Plus</SelectItem>
                <SelectItem key="ultra" className="text-white">Ultra</SelectItem>
                <SelectItem key="support" className="text-white">Support</SelectItem>
                <SelectItem key="moderateur" className="text-white">Modérateur</SelectItem>
                <SelectItem key="admin" className="text-white">Administrateur</SelectItem>
              </Select>
              <Input
                label="Mot de passe"
                type="password"
                value={createForm.password}
                onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                className="text-white"
                classNames={{
                  label: "text-gray-300",
                  input: "text-white bg-gray-700 border-white/20",
                  inputWrapper: "bg-gray-700 border-white/20"
                }}
              />
            </div>
          </ModalBody>
          <ModalFooter>
            <Button color="danger" variant="light" onPress={onCreateModalOpenChange}>
              Annuler
            </Button>
            <Button color="primary" onPress={handleCreateUser}>
              Créer l'utilisateur
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Modal de modification d'utilisateur */}
      <Modal isOpen={isEditModalOpen} onOpenChange={onEditModalOpenChange} size="2xl">
        <ModalContent className="modal-modern">
          <ModalHeader>
            <h3 className="text-xl font-bold text-white">Modifier l'utilisateur</h3>
          </ModalHeader>
          <ModalBody>
            <div className="space-y-4">
              <Input
                label="Nom d'utilisateur"
                value={editForm.nom_utilisateur || ""}
                onChange={(e) => setEditForm({ ...editForm, nom_utilisateur: e.target.value })}
                className="text-white"
                classNames={{
                  label: "text-gray-300",
                  input: "text-white bg-gray-700 border-white/20",
                  inputWrapper: "bg-gray-700 border-white/20"
                }}
              />
              <Input
                label="Email"
                type="email"
                value={editForm.email || ""}
                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                className="text-white"
                classNames={{
                  label: "text-gray-300",
                  input: "text-white bg-gray-700 border-white/20",
                  inputWrapper: "bg-gray-700 border-white/20"
                }}
              />
              <Select
                label="Rôle"
                selectedKeys={editForm.role ? [editForm.role] : []}
                onSelectionChange={(keys) => setEditForm({ ...editForm, role: Array.from(keys)[0] as string })}
                className="text-white"
                classNames={{
                  label: "text-gray-300",
                  trigger: "bg-gray-700 border-white/20",
                  listbox: "bg-gray-700 border-white/20"
                }}
              >
                <SelectItem key="membre" className="text-white">Membre</SelectItem>
                <SelectItem key="plus" className="text-white">Plus</SelectItem>
                <SelectItem key="ultra" className="text-white">Ultra</SelectItem>
                <SelectItem key="support" className="text-white">Support</SelectItem>
                <SelectItem key="moderateur" className="text-white">Modérateur</SelectItem>
                <SelectItem key="admin" className="text-white">Administrateur</SelectItem>
              </Select>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button color="danger" variant="light" onPress={onEditModalOpenChange}>
              Annuler
            </Button>
            <Button color="primary" onPress={handleEditUser}>
              Sauvegarder
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Modal de bannissement */}
      <Modal isOpen={isBanModalOpen} onOpenChange={onBanModalOpenChange} size="2xl">
        <ModalContent className="modal-modern">
          <ModalHeader>
            <h3 className="text-xl font-bold text-white">Bannir l'utilisateur</h3>
          </ModalHeader>
          <ModalBody>
            <div className="space-y-4">
              <p className="text-gray-300">
                Vous êtes sur le point de bannir <strong>{selectedUser?.nom_utilisateur}</strong>
              </p>
              <Textarea
                label="Raison du bannissement"
                value={banForm.reason}
                onChange={(e) => setBanForm({ ...banForm, reason: e.target.value })}
                placeholder="Expliquez la raison du bannissement..."
                className="text-white"
                classNames={{
                  label: "text-gray-300",
                  input: "text-white bg-gray-700 border-white/20",
                  inputWrapper: "bg-gray-700 border-white/20"
                }}
              />
              <Select
                label="Durée du bannissement"
                selectedKeys={[banForm.duration_days.toString()]}
                onSelectionChange={(keys) => setBanForm({ ...banForm, duration_days: parseInt(Array.from(keys)[0] as string) })}
                className="text-white"
                classNames={{
                  label: "text-gray-300",
                  trigger: "bg-gray-700 border-white/20",
                  listbox: "bg-gray-700 border-white/20"
                }}
              >
                <SelectItem key="1" className="text-white">1 jour</SelectItem>
                <SelectItem key="3" className="text-white">3 jours</SelectItem>
                <SelectItem key="7" className="text-white">1 semaine</SelectItem>
                <SelectItem key="30" className="text-white">1 mois</SelectItem>
                <SelectItem key="365" className="text-white">1 an</SelectItem>
                <SelectItem key="9999" className="text-white">Permanent</SelectItem>
              </Select>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button color="danger" variant="light" onPress={onBanModalOpenChange}>
              Annuler
            </Button>
            <Button color="danger" onPress={handleBanUser}>
              Bannir l'utilisateur
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Modal d'historique des bannissements */}
      <Modal isOpen={isBanHistoryModalOpen} onOpenChange={onBanHistoryModalOpenChange} size="4xl">
        <ModalContent className="modal-modern">
          <ModalHeader>
            <h3 className="text-xl font-bold text-white">Historique des bannissements</h3>
          </ModalHeader>
          <ModalBody>
            <Table aria-label="Historique des bannissements" className="bg-gray-900/50 rounded-lg">
              <TableHeader>
                <TableColumn className="text-white">Utilisateur</TableColumn>
                <TableColumn className="text-white">Raison</TableColumn>
                <TableColumn className="text-white">Banni par</TableColumn>
                <TableColumn className="text-white">Date</TableColumn>
                <TableColumn className="text-white">Durée</TableColumn>
                <TableColumn className="text-white">Statut</TableColumn>
              </TableHeader>
              <TableBody>
                {banHistory.map((ban) => (
                  <TableRow key={ban.id}>
                    <TableCell className="text-white">{ban.user_id}</TableCell>
                    <TableCell className="text-gray-300">{ban.reason}</TableCell>
                    <TableCell className="text-gray-300">{ban.banned_by}</TableCell>
                    <TableCell className="text-gray-300">{formatDate(ban.banned_at)}</TableCell>
                    <TableCell className="text-gray-300">{ban.duration_days === 9999 ? 'Permanent' : `${ban.duration_days} jours`}</TableCell>
                    <TableCell>
                      {ban.unbanned_at ? (
                        <Badge color="success" variant="flat">Débanni</Badge>
                      ) : (
                        <Badge color="danger" variant="flat">Actif</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ModalBody>
          <ModalFooter>
            <Button color="primary" onPress={onBanHistoryModalOpenChange}>
              Fermer
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Modal du mot de passe temporaire */}
      <Modal isOpen={isPasswordModalOpen} onOpenChange={onPasswordModalOpenChange} size="md">
        <ModalContent className="modal-modern">
          <ModalHeader className="text-center">
            <div className="w-full text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <i className="fas fa-key text-3xl text-white"></i>
              </div>
              <h3 className="text-2xl font-bold text-white">Mot de passe temporaire généré !</h3>
            </div>
          </ModalHeader>
          <ModalBody className="text-center space-y-6">
            <div className="space-y-4">
              <p className="text-blue-100 text-lg">
                Nouveau mot de passe pour <span className="font-bold text-white">{selectedUser?.nom_utilisateur}</span>
              </p>
              
              <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-xl p-6 border border-white/20 shadow-inner">
                <div className="bg-black/30 rounded-lg p-4 border border-green-500/50">
                  <code className="text-green-400 font-mono text-xl font-bold tracking-wider select-all">
                    {tempPassword}
                  </code>
                </div>
              </div>
              
              <div className="bg-blue-500/10 border border-blue-400/30 rounded-lg p-4">
                <div className="flex items-center justify-center space-x-2 text-blue-200">
                  <i className="fas fa-info-circle text-blue-400"></i>
                  <span className="text-sm">
                    L'utilisateur devra changer ce mot de passe lors de sa prochaine connexion
                  </span>
                </div>
              </div>
            </div>
          </ModalBody>
          <ModalFooter className="flex-col sm:flex-row gap-3">
            <Button 
              color="success" 
              variant="shadow"
              size="lg"
              startContent={<i className="fas fa-copy"></i>}
              onPress={copyTempPassword}
              className="w-full sm:w-auto bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold"
              data-copy-button
            >
              Copier le mot de passe
            </Button>
            <Button 
              color="danger" 
              variant="bordered"
              size="lg"
              onPress={onPasswordModalOpenChange}
              className="w-full sm:w-auto border-red-400 text-red-400 hover:bg-red-500/10"
            >
              Fermer
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Système de notifications toast */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`px-6 py-4 rounded-lg shadow-lg border-l-4 transform transition-all duration-300 ${
              notification.type === 'success' 
                ? 'bg-green-600 border-green-400 text-white' 
                : notification.type === 'error'
                ? 'bg-red-600 border-red-400 text-white'
                : 'bg-blue-600 border-blue-400 text-white'
            }`}
          >
            <div className="flex items-center space-x-3">
              <i className={`fas ${
                notification.type === 'success' ? 'fa-check-circle' :
                notification.type === 'error' ? 'fa-exclamation-circle' :
                'fa-info-circle'
              }`}></i>
              <span className="font-medium">{notification.message}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
