"use client"

import type React from "react"
import { useEffect, useState, useRef } from "react"
import {
  Card,
  CardBody,
  CardHeader,
  Input,
  Button,
  Avatar,
  Chip,
  Divider,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Spinner,
  Skeleton,
  Tabs,
  Tab,
} from "@heroui/react"
import { CameraIcon, EyeIcon, EyeSlashIcon, TrashIcon, ExclamationTriangleIcon } from "@heroicons/react/24/outline"
import Navigation from "@/components/navigation"
import Footer from "@/components/footer"
import PageIndicator from "@/components/page-indicator"
import AccountNotifications from "@/components/account-notifications"
import { useAuth } from "@/hooks/use-auth"
import { useLanguage } from "@/contexts/LanguageContext"
import { getRoleLabel } from "@/lib/auth-client"
import { secureGet, secureDelete } from "@/lib/api-client"

export default function AccountPage() {
  const { user, refreshUser } = useAuth()
  const { t } = useLanguage()
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [profileData, setProfileData] = useState({
    nom_utilisateur: "",
    email: "",
    photo: "",
    created_at: "",
  })
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  })
  const [previewPhoto, setPreviewPhoto] = useState<string>("")
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // États pour la suppression de compte
  const [deleteAccountData, setDeleteAccountData] = useState({
    password: "",
    deleteWord: "",
    currentStep: 0, // 0: password, 1: "delete"
  })
  const [deleteLoading, setDeleteLoading] = useState(false)

  const { isOpen: isPasswordModalOpen, onOpen: onPasswordModalOpen, onClose: onPasswordModalClose } = useDisclosure()
  const { isOpen: isDeleteModalOpen, onOpen: onDeleteModalOpen, onClose: onDeleteModalClose } = useDisclosure()

  // Composant Skeleton pour le chargement
  const AccountPageSkeleton = () => (
    <div className="min-h-screen bg-background text-foreground font-sans relative">
      <Navigation />

      {/* voile violet en arrière-plan */}
      <div
        className="absolute h-screen w-full opacity-20 max-md:mask-b-from-10% max-md:mask-b-to-70% md:mask-radial-from-10% md:mask-radial-to-70% md:mask-radial-at-top bg-main-overlay"
        style={{ inset: 0 as unknown as number }}
      />

      <main className="relative z-10 container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-12 text-center">
            <Skeleton className="w-96 h-16 mx-auto mb-4 rounded-lg" />
            <Skeleton className="w-2/3 h-8 mx-auto rounded-lg" />
          </div>
        </div>
      </main>
    </div>
  )

  // Fonction pour afficher les messages
  const showMessage = (title: string, message: string, type: 'success' | 'error' = 'success') => {
    // Implémentez votre système de notification ici
    console.log(`${type.toUpperCase()}: ${title} - ${message}`)
  }

  // Charger les informations complètes du compte
  const loadAccountInfo = async () => {
    try {
      const response = await secureGet('/api/account/info')
      if (response.ok) {
        const data = await response.json()
        setProfileData({
          nom_utilisateur: data.nom_utilisateur || "",
          email: data.email || "",
          photo: data.photo || "",
          created_at: data.created_at || "",
        })
      }
    } catch (error) {
      console.error('Erreur lors du chargement des informations du compte:', error)
    }
  }

  // Initialiser les données du profil
  useEffect(() => {
    if (user) {
      setProfileData({
        nom_utilisateur: user.nom_utilisateur,
        email: user.email,
        photo: user.photo || "",
        created_at: "",
      })
      setPreviewPhoto(user.photo || "")
      // Charger les informations complètes
      loadAccountInfo()
    }
  }, [user])

  // Gérer les messages d'URL (succès/erreur Discord)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      const error = params.get('error')
      const success = params.get('success')
      
      if (error) {
        let errorMessage = t('account.errorOccurred')
        switch (error) {
          case 'discord_cancelled':
            errorMessage = t('account.discordCancelled')
            break
          case 'discord_already_linked':
            errorMessage = t('account.discordAlreadyLinked')
            break
          case 'not_authenticated':
            errorMessage = t('account.notAuthenticated')
            break
          case 'invalid_token':
            errorMessage = t('account.invalidToken')
            break
        }
        showMessage(t('common.error'), errorMessage, 'error')
        
        const newUrl = window.location.pathname
        window.history.replaceState({}, '', newUrl)
      }
      
      if (success) {
        let successMessage = t('account.operationSuccess')
        switch (success) {
          case 'discord_linked':
            successMessage = t('account.discordLinked')
            break
        }
        showMessage(t('common.success'), successMessage)
        
        refreshUser()
        
        const newUrl = window.location.pathname
        window.history.replaceState({}, '', newUrl)
      }
    }
  }, [refreshUser])

  // Gérer le changement de fichier photo
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      // Créer FormData pour l'upload
      const formData = new FormData()
      formData.append('photo', file)
      formData.append('userId', user?.id?.toString() || '')

      // Upload du fichier
      const response = await fetch('/api/account/upload-photo', {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        const data = await response.json()
        
        // Mettre à jour l'état local avec l'URL de la photo
        setPreviewPhoto(data.photoUrl)
        setProfileData(prev => ({ ...prev, photo: data.photoUrl }))
        
        // Rafraîchir les données utilisateur
        await refreshUser()
        
        showMessage(t('account.photoUpdated'), t('account.photoUpdatedDesc'))
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || t('account.uploadError'))
      }
    } catch (error) {
      console.error('Error uploading photo:', error)
      showMessage(t('common.error'), error instanceof Error ? error.message : t('account.uploadErrorDesc'), 'error')
    } finally {
      setUploading(false)
    }
  }

  // Mettre à jour le profil
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/account/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileData),
      })

      if (response.ok) {
        await refreshUser()
        showMessage(t('account.profileUpdated'), t('account.profileUpdatedDesc'))
      } else {
        const data = await response.json()
        throw new Error(data.error || t('account.errorOccurred'))
      }
    } catch (error) {
      console.error("[v0] Error updating profile:", error)
      showMessage(t('common.error'), error instanceof Error ? error.message : t('account.errorOccurred'), 'error')
    } finally {
      setLoading(false)
    }
  }

  // Mettre à jour le mot de passe
  const handleUpdatePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showMessage(t('common.error'), t('auth.passwordMismatch'), 'error')
      return
    }

    setLoading(true)

    try {
      const response = await fetch("/api/account/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      })

      if (response.ok) {
        setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" })
        onPasswordModalClose()
        showMessage(t('account.passwordUpdated'), t('account.passwordUpdatedDesc'))
      } else {
        const data = await response.json()
        throw new Error(data.error || t('account.errorOccurred'))
      }
    } catch (error) {
      console.error("[v0] Error updating password:", error)
      showMessage(t('common.error'), error instanceof Error ? error.message : t('account.errorOccurred'), 'error')
    } finally {
      setLoading(false)
    }
  }

  const resetPhoto = async () => {
    setUploading(true)
    try {
      // Mettre à jour la base de données pour supprimer la photo
      const response = await fetch('/api/account/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...profileData,
          photo: ""
        }),
      })

      if (response.ok) {
        // Mettre à jour l'état local
        setProfileData(prev => ({ ...prev, photo: "", created_at: prev.created_at }))
        setPreviewPhoto("")
        
        // Rafraîchir les données utilisateur
        await refreshUser()
        
        showMessage(t('account.photoUpdated'), t('account.photoUpdatedDesc'))
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || t('account.errorOccurred'))
      }
    } catch (error) {
      console.error('Error removing photo:', error)
      showMessage(t('common.error'), error instanceof Error ? error.message : t('account.errorOccurred'), 'error')
    } finally {
      setUploading(false)
    }
  }

  const handleLinkDiscord = () => {
    window.location.href = '/api/auth/discord?action=link'
  }

  const handleUnlinkDiscord = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/auth/discord/link', {
        method: 'DELETE',
      })

      if (response.ok) {
        await refreshUser()
        showMessage(t('account.unlinkDiscord'), t('account.discordLinked'))
      } else {
        const data = await response.json()
        throw new Error(data.error || t('account.errorOccurred'))
      }
    } catch (error) {
      console.error('Erreur lors de la déconnexion Discord:', error)
      showMessage(t('common.error'), error instanceof Error ? error.message : t('account.errorOccurred'), 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteAccountStep = async () => {
    if (deleteAccountData.currentStep === 0) {
      // Vérifier le mot de passe avant de passer à l'étape suivante
      if (!deleteAccountData.password) {
        showMessage("Erreur", "Le mot de passe est requis", "error")
        return
      }

      setDeleteLoading(true)
      try {
        const response = await fetch('/api/account/verify-password', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest'
          },
          credentials: 'same-origin',
          body: JSON.stringify({
            password: deleteAccountData.password
          })
        })

        const result = await response.json()

        if (response.ok) {
          // Mot de passe correct, passer à l'étape suivante
          setDeleteAccountData(prev => ({ ...prev, currentStep: 1 }))
        } else {
          showMessage("Erreur", result.message || "Mot de passe incorrect", "error")
        }
      } catch (error) {
        console.error("Erreur lors de la vérification du mot de passe:", error)
        showMessage("Erreur", "Une erreur est survenue lors de la vérification", "error")
      } finally {
        setDeleteLoading(false)
      }
    } else {
      // Étape suivante (ne devrait pas arriver avec 2 étapes)
      const nextStep = deleteAccountData.currentStep + 1
      if (nextStep <= 1) {
        setDeleteAccountData(prev => ({ ...prev, currentStep: nextStep }))
      }
    }
  }

  const handleFinalDeleteAccount = async () => {
    if (!deleteAccountData.password) {
      showMessage("Erreur", "Le mot de passe est requis", "error")
      return
    }

    if (deleteAccountData.deleteWord !== "delete") {
      showMessage("Erreur", "Vous devez taper exactement 'delete'", "error")
      return
    }

    setDeleteLoading(true)

    try {
      const response = await fetch('/api/account/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        },
        credentials: 'same-origin',
        body: JSON.stringify({
          password: deleteAccountData.password,
          deleteWord: deleteAccountData.deleteWord
        })
      })

      const result = await response.json()

      if (response.ok) {
        showMessage("Compte supprimé", "Votre compte a été supprimé définitivement. Redirection...")
        // Rediriger vers la page d'accueil après suppression
        setTimeout(() => {
          window.location.href = '/'
        }, 2000)
      } else {
        showMessage("Erreur", result.message || "Erreur lors de la suppression du compte", "error")
      }
    } catch (error) {
      console.error("Erreur lors de la suppression du compte:", error)
      showMessage("Erreur", "Une erreur est survenue lors de la suppression du compte", "error")
    } finally {
      setDeleteLoading(false)
    }
  }

  const resetDeleteModal = () => {
    setDeleteAccountData({
      password: "",
      deleteWord: "",
      currentStep: 0,
    })
    onDeleteModalClose()
  }

  // Formater la date de création
  const formatCreatedDate = (dateString: string) => {
    if (!dateString) return "Non disponible"
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch {
      return "Non disponible"
    }
  }

  if (!user) {
    return <AccountPageSkeleton />
  }

  const roleInfo = getRoleLabel(user.role as "admin" | "moderateur" | "support" | "plus" | "ultra" | "membre")

  return (
    <div className="min-h-screen bg-background text-foreground font-sans relative">
      <Navigation />

      {/* voile violet en arrière-plan */}
      <div
        className="absolute h-screen w-full opacity-20 max-md:mask-b-from-10% max-md:mask-b-to-70% md:mask-radial-from-10% md:mask-radial-to-70% md:mask-radial-at-top bg-main-overlay"
        style={{ inset: 0 as unknown as number }}
      />

      <main className="relative z-10 container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-12 text-center animate-fade-in-up">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 text-blue-400">
              Mon Compte
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 max-w-2xl mx-auto">
              Gérez vos informations personnelles et paramètres de sécurité
            </p>
          </div>

          <Tabs 
            aria-label="Options du compte" 
            color="primary" 
            variant="underlined"
            classNames={{
              tabList: "gap-6 w-full relative rounded-none p-0 border-b border-divider",
              cursor: "w-full bg-[#22d3ee]",
              tab: "max-w-fit px-0 h-12",
              tabContent: "group-data-[selected=true]:text-[#06b6d4]"
            }}
            className="w-full"
          >
            <Tab 
              key="profile" 
              title={
                <div className="flex items-center space-x-2">
                  <i className="fas fa-user"></i>
                  <span>Mon compte</span>
                </div>
              }
            >
              <div className="grid lg:grid-cols-3 gap-8 mt-8">
                <Card className="lg:col-span-1 bg-gray-800/50 backdrop-blur-lg border border-white/10 shadow-2xl animate-fade-in-up delay-100">
                  <CardBody className="text-center p-8 flex flex-col items-center">
                    <div className="relative mb-6 group flex justify-center">
                      <Avatar
                        src={previewPhoto || user.photo || "/storage/icons/default_profile.png"}
                        className="w-32 h-32 text-large group-hover:scale-105 transition-transform duration-300"
                        showFallback
                        fallback={<i className="fas fa-user text-4xl text-gray-400"></i>}
                      />
                      
                      <div className="absolute -bottom-2 -right-2 flex gap-2">
                        <Button
                          isIconOnly
                          size="sm"
                          className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg hover:scale-110 transition-transform duration-300"
                          radius="full"
                          onPress={() => fileInputRef.current?.click()}
                          isLoading={uploading}
                        >
                          <CameraIcon className="w-4 h-4" />
                        </Button>
                        
                        {previewPhoto && (
                          <Button
                            isIconOnly
                            size="sm"
                            color="danger"
                            className="shadow-lg hover:scale-110 transition-transform duration-300"
                            radius="full"
                            onPress={resetPhoto}
                          >
                            <TrashIcon className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                      
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </div>

                    <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-blue-400 transition-colors duration-300">
                      {user.nom_utilisateur}
                    </h3>
                    <p className="text-gray-400 mb-4 text-lg">{user.email}</p>

                    <div className="flex justify-center mb-6">
                      <Chip 
                        color={
                          user.role === 'admin' ? 'danger' :
                          user.role === 'plus' ? 'warning' :
                          user.role === 'ultra' ? 'warning' :
                          user.role === 'moderateur' ? 'secondary' :
                          user.role === 'support' ? 'primary' :
                          'default'
                        }
                        size="lg" 
                        variant="shadow"
                        className="text-base font-semibold"
                      >
                        {roleInfo.label}
                      </Chip>
                    </div>

                    <Divider className="bg-white/10 my-6" />

                    <div className="text-left space-y-4">
                      <div className="flex justify-between items-center p-3 bg-green-600/20 rounded-lg border border-green-500/30">
                        <span className="text-gray-300 font-medium">{t('account.status')}</span>
                        <Chip color="success" size="sm" variant="shadow">
                          {t('account.active')}
                        </Chip>
                      </div>
                      
                      <div className="flex justify-between items-center p-3 bg-blue-600/20 rounded-lg border border-blue-500/30">
                        <span className="text-gray-300 font-medium">Membre depuis</span>
                        <span className="text-blue-300 font-semibold text-sm">
                          {formatCreatedDate(profileData.created_at)}
                        </span>
                      </div>
                    </div>
                  </CardBody>
                </Card>

                <div className="lg:col-span-2 space-y-8">
                  <Card className="bg-gray-800/50 backdrop-blur-lg border border-white/10 shadow-2xl animate-fade-in-up delay-200">
                    <CardHeader className="pb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                        <h3 className="text-xl font-bold text-white">{t('account.personalInfo')}</h3>
                      </div>
                    </CardHeader>
                    <CardBody className="pt-0">
                      <form onSubmit={handleUpdateProfile} className="space-y-6">
                        <Input
                          label={t('account.username')}
                          value={profileData.nom_utilisateur}
                          onChange={(e) => setProfileData({ ...profileData, nom_utilisateur: e.target.value })}
                          variant="bordered"
                          classNames={{
                            input: "text-white bg-gray-700/50 border-white/20",
                            label: "text-gray-300 font-medium",
                          }}
                        />
                        
                        <Input
                          label={t('account.email')}
                          value={profileData.email}
                          onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                          variant="bordered"
                          classNames={{
                            input: "text-white bg-gray-700/50 border-white/20",
                            label: "text-gray-300 font-medium",
                          }}
                        />

                        <div className="flex gap-4 pt-6">
                          <Button 
                            type="submit" 
                            color="primary" 
                            size="lg"
                            isLoading={loading}
                            className="flex-1 h-12 font-semibold bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 transition-all duration-300"
                          >
                            {loading ? t('common.loading') : t('account.updateProfile')}
                          </Button>
                          <Button 
                            variant="bordered" 
                            size="lg"
                            className="flex-1 h-12 font-semibold border-white/20 text-white hover:bg-white/10 transition-all duration-300"
                            onClick={() => {
                              setProfileData({
                                nom_utilisateur: user.nom_utilisateur,
                                email: user.email,
                                photo: user.photo || "",
                                created_at: profileData.created_at,
                              })
                              setPreviewPhoto(user.photo || "")
                            }}
                          >
                            {t('common.cancel')}
                          </Button>
                        </div>
                      </form>
                    </CardBody>
                  </Card>

                  <Card className="bg-gray-800/50 backdrop-blur-lg border border-white/10 shadow-2xl animate-fade-in-up delay-300">
                    <CardHeader className="pb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-pink-600 rounded-lg flex items-center justify-center">
                          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                        </div>
                        <h3 className="text-xl font-bold text-white">Sécurité</h3>
                      </div>
                    </CardHeader>
                    <CardBody className="pt-0">
                      <div className="space-y-6">
                        <div className="flex justify-between items-center p-4 bg-red-600/20 rounded-xl border border-red-500/30 hover:bg-red-600/30 transition-colors duration-300">
                          <div>
                            <p className="font-bold text-white text-lg">Mot de passe</p>
                            <p className="text-gray-300">Modifiez votre mot de passe pour sécuriser votre compte</p>
                          </div>
                          <Button 
                            color="danger" 
                            variant="shadow"
                            onClick={onPasswordModalOpen}
                            className="hover:scale-105 transition-transform duration-300"
                          >
                            Modifier
                          </Button>
                        </div>
                      </div>
                    </CardBody>
                  </Card>

                  <Card className="bg-gray-800/50 backdrop-blur-lg border border-white/10 shadow-2xl animate-fade-in-up delay-400">
                    <CardHeader className="pb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                          <i className="fab fa-discord text-white text-lg"></i>
                        </div>
                        <h3 className="text-xl font-bold text-white">Connexions Sociales</h3>
                      </div>
                    </CardHeader>
                    <CardBody className="pt-0">
                      <div className="space-y-6">
                        <div className="flex justify-between items-center p-4 bg-indigo-600/20 rounded-xl border border-indigo-500/30 hover:bg-indigo-600/30 transition-colors duration-300">
                          <div className="flex items-center gap-3">
                            <i className="fab fa-discord text-indigo-400 text-2xl"></i>
                            <div>
                              <p className="font-bold text-white text-lg">Discord</p>
                              <p className="text-gray-300">
                                {user.discord_id 
                                  ? 'Compte Discord connecté - Vous pouvez vous connecter avec Discord'
                                  : 'Liez votre compte Discord pour une connexion rapide'
                                }
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {user.discord_id ? (
                              <>
                                <Chip color="success" size="sm" variant="shadow">
                                  <i className="fas fa-check mr-1"></i>
                                  Connecté
                                </Chip>
                                <Button 
                                  color="danger" 
                                  variant="bordered"
                                  size="sm"
                                  onClick={handleUnlinkDiscord}
                                  className="hover:scale-105 transition-transform duration-300"
                                >
                                  Délier
                                </Button>
                              </>
                            ) : (
                              <Button 
                                color="primary" 
                                variant="shadow"
                                onClick={handleLinkDiscord}
                                className="hover:scale-105 transition-transform duration-300"
                                startContent={<i className="fab fa-discord"></i>}
                              >
                                Lier Discord
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardBody>
                  </Card>

                  {/* Zone dangereuse - Suppression de compte */}
                  <Card className="bg-red-900/20 backdrop-blur-lg border border-red-500/30 shadow-2xl animate-fade-in-up delay-500">
                    <CardHeader className="pb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-red-600 to-red-800 rounded-lg flex items-center justify-center">
                          <ExclamationTriangleIcon className="w-5 h-5 text-white" />
                        </div>
                        <h3 className="text-xl font-bold text-red-400">Zone dangereuse</h3>
                      </div>
                    </CardHeader>
                    <CardBody className="pt-0">
                      <div className="space-y-4">
                        <div className="p-4 bg-red-600/20 rounded-xl border border-red-500/30">
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="font-bold text-red-400 text-lg">Supprimer définitivement le compte</p>
                              <p className="text-gray-300 text-sm">
                                Cette action est irréversible. Toutes vos données seront supprimées.
                              </p>
                            </div>
                            <Button 
                              color="danger" 
                              variant="shadow"
                              onClick={onDeleteModalOpen}
                              startContent={<TrashIcon className="w-4 h-4" />}
                              className="hover:scale-105 transition-transform duration-300"
                            >
                              Supprimer le compte
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                </div>
              </div>
            </Tab>
            
            <Tab 
              key="notifications" 
              title={
                <div className="flex items-center space-x-2">
                  <i className="fas fa-bell"></i>
                  <span>Notifications</span>
                </div>
              }
            >
              <div className="mt-8">
                <AccountNotifications />
              </div>
            </Tab>
          </Tabs>
        </div>
      </main>

      <Modal isOpen={isPasswordModalOpen} onClose={onPasswordModalClose} size="lg" backdrop="blur">
        <ModalContent className="modal-modern">
          <ModalHeader className="flex flex-col gap-1">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-pink-600 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white">Modifier le mot de passe</h3>
            </div>
          </ModalHeader>
          <ModalBody className="py-6">
            <div className="space-y-6">
              <Input
                label="Mot de passe actuel"
                type={showPasswords.current ? "text" : "password"}
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                variant="bordered"
                classNames={{
                  input: "text-white bg-gray-700/50 border-white/20",
                  label: "text-gray-300 font-medium",
                }}
                endContent={
                  <button
                    className="focus:outline-none"
                    type="button"
                    onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                  >
                    {showPasswords.current ? (
                      <EyeSlashIcon className="w-5 h-5 text-gray-400" />
                    ) : (
                      <EyeIcon className="w-5 h-5 text-gray-400" />
                    )}
                  </button>
                }
              />
              
              <Input
                label="Nouveau mot de passe"
                type={showPasswords.new ? "text" : "password"}
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                variant="bordered"
                classNames={{
                  input: "text-white bg-gray-700/50 border-white/20",
                  label: "text-gray-300 font-medium",
                }}
                endContent={
                  <button
                    className="focus:outline-none"
                    type="button"
                    onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                  >
                    {showPasswords.new ? (
                      <EyeSlashIcon className="w-5 h-5 text-gray-400" />
                    ) : (
                      <EyeIcon className="w-5 h-5 text-gray-400" />
                    )}
                  </button>
                }
              />
              
              <Input
                label="Confirmer le nouveau mot de passe"
                type={showPasswords.confirm ? "text" : "password"}
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                variant="bordered"
                classNames={{
                  input: "text-white bg-gray-700/50 border-white/20",
                  label: "text-gray-300 font-medium",
                }}
                endContent={
                  <button
                    className="focus:outline-none"
                    type="button"
                    onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                  >
                    {showPasswords.confirm ? (
                      <EyeSlashIcon className="w-5 h-5 text-gray-400" />
                    ) : (
                      <EyeIcon className="w-5 h-5 text-gray-400" />
                    )}
                  </button>
                }
              />
            </div>
          </ModalBody>
          <ModalFooter className="gap-3">
            <Button 
              variant="bordered" 
              onPress={onPasswordModalClose}
              className="font-semibold border-white/20 text-white hover:bg-white/10 transition-all duration-300"
            >
              Annuler
            </Button>
            <Button 
              color="danger" 
              onPress={handleUpdatePassword} 
              isLoading={loading}
              className="font-semibold bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 transition-all duration-300"
            >
              {loading ? "Modification..." : "Modifier le mot de passe"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Modal de suppression de compte avec 2 étapes */}
      <Modal 
        isOpen={isDeleteModalOpen} 
        onClose={resetDeleteModal} 
        size="2xl" 
        backdrop="opaque"
        isDismissable={false}
        hideCloseButton
        classNames={{
          backdrop: "bg-black/80"
        }}
      >
        <ModalContent className="modal-modern bg-gray-900 border border-red-500/30">
          <ModalHeader className="flex flex-col gap-1 bg-gray-900">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-red-600 to-red-800 rounded-lg flex items-center justify-center">
                <ExclamationTriangleIcon className="w-4 h-4 text-white" />
              </div>
              <h3 className="text-xl font-bold text-red-400">
                Suppression de compte - Étape {deleteAccountData.currentStep + 1}/2
              </h3>
            </div>
          </ModalHeader>
          <ModalBody className="py-6 bg-gray-900">
            {deleteAccountData.currentStep === 0 ? (
              // Étape 1: Mot de passe
              <div className="space-y-6">
                <div className="p-4 bg-red-600/20 rounded-lg border border-red-500/30">
                  <h4 className="text-lg font-bold text-red-400 mb-2">
                    Vérification d'identité
                  </h4>
                  <p className="text-gray-300 mb-4">
                    Pour commencer la suppression de votre compte, confirmez votre identité en entrant votre mot de passe actuel :
                  </p>
                  <Input
                    label="Mot de passe actuel"
                    type="password"
                    value={deleteAccountData.password}
                    onChange={(e) => setDeleteAccountData(prev => ({ ...prev, password: e.target.value }))}
                    variant="bordered"
                    classNames={{
                      input: "text-white bg-gray-800 border-red-500/30",
                      label: "text-red-300 font-medium",
                    }}
                    placeholder="Entrez votre mot de passe"
                  />
                </div>
                
                <div className="p-4 bg-yellow-600/20 rounded-lg border border-yellow-500/30">
                  <div className="flex items-start gap-3">
                    <ExclamationTriangleIcon className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <h5 className="font-bold text-yellow-400 mb-1">Attention !</h5>
                      <p className="text-gray-300 text-sm">
                        Vous êtes sur le point de commencer le processus de suppression définitive de votre compte. 
                        Cette action est irréversible.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              // Étape 2: Taper "delete"
              <div className="space-y-6">
                <div className="p-4 bg-red-600/20 rounded-lg border border-red-500/30">
                  <h4 className="text-lg font-bold text-red-400 mb-2">
                    Confirmation de suppression
                  </h4>
                  <p className="text-gray-300 mb-4">
                    Pour finaliser la suppression, tapez exactement le mot <strong>"delete"</strong> dans le champ ci-dessous :
                  </p>
                  <div className="p-3 bg-gray-800 rounded-lg border border-gray-600 mb-4">
                    <code className="text-yellow-300 font-mono">delete</code>
                  </div>
                  <Input
                    label="Tapez 'delete' pour supprimer"
                    value={deleteAccountData.deleteWord}
                    onChange={(e) => setDeleteAccountData(prev => ({ ...prev, deleteWord: e.target.value }))}
                    variant="bordered"
                    classNames={{
                      input: "text-white bg-gray-800 border-red-500/30",
                      label: "text-red-300 font-medium",
                    }}
                    placeholder="delete"
                  />
                </div>
                
                <div className="p-4 bg-red-800/30 rounded-lg border border-red-600/50">
                  <div className="flex items-start gap-3">
                    <ExclamationTriangleIcon className="w-6 h-6 text-red-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <h5 className="font-bold text-red-400 mb-2">SUPPRESSION DÉFINITIVE</h5>
                      <p className="text-white font-semibold">
                        Une fois supprimé, votre compte ne pourra pas être récupéré.
                      </p>
                      <p className="text-gray-300 text-sm mt-1">
                        Toutes vos données seront perdues à jamais.
                      </p>
                      <ul className="list-disc list-inside text-gray-300 text-sm mt-3 space-y-1">
                        <li>Votre profil et informations personnelles</li>
                        <li>Tous vos favoris et préférences</li>
                        <li>Votre historique de support</li>
                        <li>Tous vos rapports et contributions</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </ModalBody>
          <ModalFooter className="gap-3 bg-gray-900">
            <Button 
              variant="bordered" 
              onPress={resetDeleteModal}
              className="font-semibold border-white/20 text-white hover:bg-white/10 transition-all duration-300"
            >
              Annuler
            </Button>
            
            {deleteAccountData.currentStep === 0 ? (
              <Button 
                color="danger" 
                onPress={handleDeleteAccountStep}
                isDisabled={!deleteAccountData.password}
                isLoading={deleteLoading}
                className="font-semibold bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 transition-all duration-300"
              >
                {deleteLoading ? "Vérification..." : "Vérifier le mot de passe"}
              </Button>
            ) : (
              <Button 
                color="danger" 
                onPress={handleFinalDeleteAccount}
                isLoading={deleteLoading}
                isDisabled={deleteAccountData.deleteWord !== "delete"}
                className="font-semibold bg-gradient-to-r from-red-600 to-red-800 hover:from-red-700 hover:to-red-900 transition-all duration-300"
              >
                {deleteLoading ? "Suppression..." : "SUPPRIMER DÉFINITIVEMENT"}
              </Button>
            )}
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  )
}
