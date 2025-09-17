"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import Navigation from "@/components/navigation"
import AdminBreadcrumbs from "@/components/admin/admin-breadcrumbs"
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Input,
  Select,
  SelectItem,
  Spinner,
  Chip,
  Avatar,
  Badge,
  Divider,
  Textarea,
} from "@heroui/react"

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

interface EditUserData {
  nom_utilisateur: string
  email: string
  role: string
}

export default function EditUserPage() {
  const router = useRouter()
  const params = useParams()
  const userId = params.id as string

  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState<EditUserData>({
    nom_utilisateur: "",
    email: "",
    role: "membre"
  })

  // États pour la gestion du bannissement
  const [banForm, setBanForm] = useState({
    reason: "",
    duration_days: 7
  })
  const [banning, setBanning] = useState(false)

  // Fonction pour obtenir les couleurs selon le rôle
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

  useEffect(() => {
    if (userId) {
      fetchUser()
    }
  }, [userId])

  const fetchUser = async () => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        credentials: "include"
      })
      const data = await response.json()
      
      if (data.success && data.user) {
        setUser(data.user)
        setFormData({
          nom_utilisateur: data.user.nom_utilisateur,
          email: data.user.email,
          role: data.user.role
        })
      } else {
        router.push('/admin/users')
      }
    } catch (error) {
      console.error("Erreur lors du chargement de l'utilisateur:", error)
      router.push('/admin/users')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(formData)
      })
      
      if (response.ok) {
        router.push('/admin/users')
      } else {
        const error = await response.json()
        alert(`Erreur: ${error.message}`)
      }
    } catch (error) {
      alert("Erreur lors de la modification de l'utilisateur")
    } finally {
      setSaving(false)
    }
  }

  const handleBanUser = async () => {
    if (!user) return
    
    setBanning(true)
    try {
      const response = await fetch(`/api/admin/users/${user.id}/ban`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(banForm)
      })
      
      if (response.ok) {
        fetchUser() // Recharger les données
        setBanForm({ reason: "", duration_days: 7 })
        alert("Utilisateur banni avec succès !")
      } else {
        const error = await response.json()
        alert(`Erreur: ${error.message}`)
      }
    } catch (error) {
      alert("Erreur lors du bannissement de l'utilisateur")
    } finally {
      setBanning(false)
    }
  }

  const handleUnbanUser = async () => {
    if (!user) return
    
    try {
      const response = await fetch(`/api/admin/users/${user.id}/unban`, {
        method: "POST",
        credentials: "include"
      })
      
      if (response.ok) {
        fetchUser() // Recharger les données
        alert("Utilisateur débanni avec succès !")
      } else {
        const error = await response.json()
        alert(`Erreur: ${error.message}`)
      }
    } catch (error) {
      alert("Erreur lors du débannissement de l'utilisateur")
    }
  }

  const handleResetPassword = async () => {
    if (!user) return
    
    if (!confirm("Êtes-vous sûr de vouloir réinitialiser le mot de passe de cet utilisateur ?")) {
      return
    }
    
    try {
      const response = await fetch(`/api/admin/users/${user.id}/reset-password`, {
        method: "POST",
        credentials: "include"
      })
      
      if (response.ok) {
        const data = await response.json()
        alert(`Nouveau mot de passe temporaire: ${data.tempPassword}\n\nL'utilisateur devra le changer lors de sa prochaine connexion.`)
      } else {
        const error = await response.json()
        alert(`Erreur: ${error.message}`)
      }
    } catch (error) {
      alert("Erreur lors de la réinitialisation du mot de passe")
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground font-sans relative flex items-center justify-center">
        <div className="absolute h-screen w-full opacity-20 max-md:mask-b-from-10% max-md:mask-b-to-70% md:mask-radial-from-10% md:mask-radial-to-70% md:mask-radial-at-top bg-purple-500" style={{ inset: 0 as unknown as number }} />
        <div className="relative z-10">
          <Spinner size="lg" color="primary" label="Chargement de l'utilisateur..." />
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background text-foreground font-sans relative flex items-center justify-center">
        <div className="absolute h-screen w-full opacity-20 max-md:mask-b-from-10% max-md:mask-b-to-70% md:mask-radial-from-10% md:mask-radial-to-70% md:mask-radial-at-top bg-purple-500" style={{ inset: 0 as unknown as number }} />
        <div className="relative z-10 text-center">
          <p className="text-white text-xl">Utilisateur non trouvé</p>
          <Button color="primary" onPress={() => router.push('/admin/users')} className="mt-4">
            Retour à la liste
          </Button>
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
              { label: "Utilisateurs", href: "/admin/users", icon: "fas fa-users" },
              { label: `Modifier "${user.nom_utilisateur}"`, icon: "fas fa-edit" }
            ]} 
          />

          {/* Badge et Titre */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600/20 to-pink-600/20 text-purple-300 px-6 py-3 rounded-full text-sm font-medium mb-8 backdrop-blur-sm border border-purple-500/30">
              <i className="fas fa-edit"></i>
              Modification Utilisateur
            </div>
            
            <h1 className="text-5xl md:text-6xl font-extrabold mb-6 tracking-tight text-white" 
                style={{textShadow: '2px 2px 20px rgba(0,0,0,0.5)'}}>
              Modifier Utilisateur
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-300 mb-8">
              Gérez les informations et permissions de {user.nom_utilisateur}
            </p>

            {/* Boutons d'action */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                color="default" 
                variant="bordered" 
                size="lg"
                startContent={<i className="fas fa-arrow-left"></i>}
                onPress={() => router.push('/admin/users')}
                className="border-white/20 text-white hover:bg-white/10 transition-all duration-300"
              >
                Retour à la liste
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 space-y-8">
        
        {/* Informations générales */}
        <Card className="bg-gray-800/50 backdrop-blur-lg border border-white/10 shadow-2xl">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-3">
                <Avatar 
                  src={user.photo}
                  name={user.nom_utilisateur.charAt(0).toUpperCase()} 
                  className="bg-blue-500 text-white"
                  size="lg"
                />
                <div>
                  <h2 className="text-xl font-bold text-white">{user.nom_utilisateur}</h2>
                  <p className="text-gray-400">{user.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Chip
                  color={getRoleColor(user.role)}
                  variant="shadow"
                  size="lg"
                >
                  {user.role}
                </Chip>
                {user.is_banned ? (
                  <Badge color="danger" variant="flat" content="Banni">
                    <i className="fas fa-ban text-red-500 text-xl"></i>
                  </Badge>
                ) : (
                  <Badge color="success" variant="flat" content="Actif">
                    <i className="fas fa-check-circle text-green-500 text-xl"></i>
                  </Badge>
                )}
              </div>
            </div>
          </CardHeader>
          <CardBody>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-gray-400">Inscrit le:</span>
                <p className="text-white font-medium">{formatDate(user.created_at)}</p>
              </div>
              <div>
                <span className="text-gray-400">Dernière connexion:</span>
                <p className="text-white font-medium">{user.last_login ? formatDate(user.last_login) : 'Jamais'}</p>
              </div>
              <div>
                <span className="text-gray-400">ID:</span>
                <p className="text-white font-medium">#{user.id}</p>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Formulaire d'édition */}
        <Card className="bg-gray-800/50 backdrop-blur-lg border border-white/10 shadow-2xl">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <i className="fas fa-edit text-white text-lg"></i>
              </div>
              <h2 className="text-xl font-bold text-white">Modifier les informations</h2>
            </div>
          </CardHeader>
          <CardBody>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Nom d'utilisateur"
                  value={formData.nom_utilisateur}
                  onChange={(e) => setFormData({ ...formData, nom_utilisateur: e.target.value })}
                  isRequired
                  className="text-white"
                  classNames={{
                    label: "text-gray-300",
                    input: "text-white bg-gray-700/50 border-white/20",
                    inputWrapper: "bg-gray-700/50 border-white/20 hover:border-blue-500/50 focus-within:border-blue-500"
                  }}
                />

                <Input
                  label="Email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  isRequired
                  className="text-white"
                  classNames={{
                    label: "text-gray-300",
                    input: "text-white bg-gray-700/50 border-white/20",
                    inputWrapper: "bg-gray-700/50 border-white/20 hover:border-blue-500/50 focus-within:border-blue-500"
                  }}
                />
              </div>

              <Select
                label="Rôle"
                selectedKeys={[formData.role]}
                onSelectionChange={(keys) => setFormData({ ...formData, role: Array.from(keys)[0] as string })}
                isRequired
                className="text-white"
                classNames={{
                  label: "text-gray-300",
                  trigger: "bg-gray-700/50 border-white/20 hover:border-blue-500/50 data-[focus=true]:border-blue-500",
                  value: "text-white",
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

              <div className="flex gap-4 pt-6">
                <Button 
                  type="button"
                  color="default" 
                  variant="light" 
                  onPress={() => router.push('/admin/users')}
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
                  className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600"
                  startContent={!saving ? <i className="fas fa-save"></i> : undefined}
                >
                  Sauvegarder
                </Button>
              </div>
            </form>
          </CardBody>
        </Card>

        {/* Gestion du bannissement */}
        <Card className="bg-gray-800/50 backdrop-blur-lg border border-white/10 shadow-2xl">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-orange-600 rounded-lg flex items-center justify-center">
                <i className="fas fa-ban text-white text-lg"></i>
              </div>
              <h2 className="text-xl font-bold text-white">Gestion du bannissement</h2>
            </div>
          </CardHeader>
          <CardBody className="space-y-6">
            {user.is_banned ? (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-red-400 font-bold mb-2">Utilisateur actuellement banni</h3>
                    <p className="text-gray-300 mb-1">
                      <strong>Raison:</strong> {user.ban_reason || 'Non spécifiée'}
                    </p>
                    {user.banned_until && (
                      <p className="text-gray-300">
                        <strong>Jusqu'au:</strong> {formatDate(user.banned_until)}
                      </p>
                    )}
                  </div>
                  <Button 
                    color="success"
                    variant="shadow"
                    onPress={handleUnbanUser}
                    startContent={<i className="fas fa-unlock"></i>}
                  >
                    Débannir
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-gray-300">Bannir temporairement cet utilisateur:</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Textarea
                    label="Raison du bannissement"
                    placeholder="Expliquez la raison du bannissement..."
                    value={banForm.reason}
                    onChange={(e) => setBanForm({ ...banForm, reason: e.target.value })}
                    className="text-white"
                    classNames={{
                      label: "text-gray-300",
                      input: "text-white bg-gray-700/50 border-white/20",
                      inputWrapper: "bg-gray-700/50 border-white/20 hover:border-red-500/50 focus-within:border-red-500"
                    }}
                  />
                  <div className="space-y-4">
                    <Select
                      label="Durée du bannissement"
                      selectedKeys={[banForm.duration_days.toString()]}
                      onSelectionChange={(keys) => setBanForm({ ...banForm, duration_days: parseInt(Array.from(keys)[0] as string) })}
                      className="text-white"
                      classNames={{
                        label: "text-gray-300",
                        trigger: "bg-gray-700/50 border-white/20 hover:border-red-500/50 data-[focus=true]:border-red-500",
                        value: "text-white",
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
                    <Button 
                      color="danger"
                      variant="shadow"
                      onPress={handleBanUser}
                      isLoading={banning}
                      isDisabled={!banForm.reason}
                      startContent={!banning ? <i className="fas fa-ban"></i> : undefined}
                      className="w-full"
                    >
                      Bannir l'utilisateur
                    </Button>
                  </div>
                </div>
              </div>
            )}

            <Divider className="bg-white/10" />

            {/* Actions supplémentaires */}
            <div>
              <h3 className="text-white font-bold mb-4">Actions supplémentaires</h3>
              <div className="flex gap-4">
                <Button 
                  color="warning"
                  variant="bordered"
                  onPress={handleResetPassword}
                  startContent={<i className="fas fa-key"></i>}
                >
                  Réinitialiser le mot de passe
                </Button>
              </div>
            </div>
          </CardBody>
        </Card>
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
    </div>
  )
}
